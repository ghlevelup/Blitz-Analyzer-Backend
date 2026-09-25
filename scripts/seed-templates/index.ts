import "../../src/config/env";
import puppeteer from "puppeteer";
import streamifier from "streamifier";
import Handlebars from "handlebars";
import { prisma } from "../../src/lib/prisma";
import { redis } from "../../src/config/redis";
import { cloudinaryInstance, configureCloudinary } from "../../src/config/cloudinary.config";
import { buildResumeHtml } from "./buildHtml";
import { templateDefs } from "./themes";
import { sampleResumeData } from "./sampleData";
import {
  headerSection, summarySection, skillsSection, experienceSection, projectsSection,
  educationSection, certificationsSection, languagesSection, achievementsSection,
  volunteeringSection, publicationsSection, licensureSection, type Section,
} from "./sections";

const sectionByKey: Record<string, Section> = {
  summary: summarySection,
  skills: skillsSection,
  experience: experienceSection,
  projects: projectsSection,
  education: educationSection,
  certifications: certificationsSection,
  languages: languagesSection,
  achievements: achievementsSection,
  volunteering: volunteeringSection,
  publications: publicationsSection,
  licensure: licensureSection,
};

function buildSections(sectionOrder: string[], withPhoto: boolean): Section[] {
  const header = { ...headerSection(withPhoto), order: 1 };
  const rest = sectionOrder.map((key, i) => ({ ...sectionByKey[key], order: i + 2 }));
  return [header, ...rest];
}

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

  const PLACEHOLDER_URL = "https://res.cloudinary.com/drngnsgwy/image/upload/blitz-analyzer/template-previews/placeholder.png";

  async function renderAndUploadPreview(id: string, slug: string, htmlLayout: string) {
    const filledHtml = Handlebars.compile(htmlLayout)(sampleResumeData);
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1273 });
    await page.setContent(filledHtml, { waitUntil: "networkidle0" });
    const screenshot = (await page.screenshot({ type: "png", fullPage: false })) as Buffer;
    await page.close();

    const previewUrl = await uploadPreview(screenshot, slug);
    await prisma.template.update({ where: { id }, data: { previewUrl } });
    await redis.del(`template-detail-${id}`);
    return previewUrl;
  }

  let created = 0;
  let healed = 0;
  let skipped = 0;

  try {
    for (const def of templateDefs) {
      const existing = await prisma.template.findUnique({ where: { slug: def.slug } });

      if (existing) {
        // Self-heal a partial row left by an earlier failed run (created,
        // but the preview screenshot step never completed).
        if (existing.previewUrl === PLACEHOLDER_URL) {
          const url = await renderAndUploadPreview(existing.id, def.slug, existing.htmlLayout);
          console.log(`🩹 Healed preview for "${def.name}" — ${url}`);
          healed++;
        } else {
          console.log(`⏭  Skipping "${def.name}" - slug "${def.slug}" already exists`);
          skipped++;
        }
        continue;
      }

      const sections = buildSections(def.sectionOrder, Boolean(def.withPhoto));
      const htmlLayout = buildResumeHtml(def.theme, ["header", ...def.sectionOrder]);

      const template = await prisma.template.create({
        data: {
          name: def.name,
          slug: def.slug,
          category: def.category,
          descriptions: { summary: def.description },
          previewUrl: PLACEHOLDER_URL,
          price: 0,
          isPremium: false,
          htmlLayout,
          sections: sections as any,
        },
      });

      const previewUrl = await renderAndUploadPreview(template.id, def.slug, htmlLayout);
      console.log(`✅ Created "${def.name}" (${def.category}) — ${previewUrl}`);
      created++;
    }
  } finally {
    await browser.close();
  }

  if (created > 0 || healed > 0) {
    await redis.del("templates-list");
  }

  console.log(`\nDone. Created: ${created}, healed: ${healed}, skipped: ${skipped}`);
  await prisma.$disconnect();
  await redis.quit();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
