import "../../src/config/env";
import puppeteer from "puppeteer";
import streamifier from "streamifier";
import Handlebars from "handlebars";
import { prisma } from "../../src/lib/prisma";
import { redis } from "../../src/config/redis";
import { cloudinaryInstance, configureCloudinary } from "../../src/config/cloudinary.config";
import { registerResumeHelpers } from "../../src/utils/handlebarsHelpers";
import { customTemplateDefs } from "./customThemes";
import { sampleResumeData } from "./sampleData";

registerResumeHelpers();

async function uploadPreview(pngBuffer: Buffer, slug: string): Promise<string> {
  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinaryInstance.uploader.upload_stream(
      { resource_type: "image", folder: "blitz-analyzer/template-previews", public_id: slug, overwrite: true },
      (error, res) => (error ? reject(error) : resolve(res))
    );
    streamifier.createReadStream(pngBuffer).pipe(stream);
  });
  return result.secure_url as string;
}

async function main() {
  await configureCloudinary();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let created = 0;
  let skipped = 0;

  try {
    for (const def of customTemplateDefs) {
      const existing = await prisma.template.findUnique({ where: { slug: def.slug } });
      if (existing) {
        console.log(`⏭  Skipping "${def.name}" - slug "${def.slug}" already exists`);
        skipped++;
        continue;
      }

      const template = await prisma.template.create({
        data: {
          name: def.name,
          slug: def.slug,
          category: def.category,
          descriptions: { summary: def.description },
          previewUrl: "",
          price: 0,
          isPremium: false,
          htmlLayout: def.htmlLayout,
          sections: def.sections as any,
        },
      });

      const filledHtml = Handlebars.compile(def.htmlLayout)(sampleResumeData);
      const page = await browser.newPage();
      await page.setViewport({ width: 900, height: 1273 });
      await page.setContent(filledHtml, { waitUntil: "networkidle0" });
      const screenshot = (await page.screenshot({ type: "png", fullPage: false })) as Buffer;
      await page.close();

      const previewUrl = await uploadPreview(screenshot, def.slug);
      await prisma.template.update({ where: { id: template.id }, data: { previewUrl } });

      console.log(`✅ Created "${def.name}" (${def.category}) — ${previewUrl}`);
      created++;
    }
  } finally {
    await browser.close();
  }

  if (created > 0) {
    await redis.del("templates-list");
  }

  console.log(`\nDone. Created: ${created}, skipped: ${skipped}`);
  await prisma.$disconnect();
  await redis.quit();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
