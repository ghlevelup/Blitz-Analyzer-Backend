// One-off: upgrade the 10 new templates' `descriptions` from the seed
// script's simple { summary } shape to the rich shape TemplateDetails.tsx
// actually renders (core_details/whyBest/benefits/targetUser/...), matching
// how admin-authored templates already look.
import "../../src/config/env";
import { prisma } from "../../src/lib/prisma";
import { redis } from "../../src/config/redis";

type Rich = {
  core_details: string;
  coverTopic: string;
  whyBest: string;
  whichNeedToUseIt: string;
  targetUser: string;
  benefits: string[];
};

const enrichments: Record<string, Rich> = {
  "clarity-minimalist-ats-safe": {
    core_details: "The safest choice for ATS parsing: single-column, reverse-chronological, no graphics or tables. Built for finance, law, healthcare, and academic hiring where tradition and clean parsing matter most.",
    coverTopic: "ATS-safe minimalist formatting",
    whyBest: "Applicant Tracking Systems scan resumes top-to-bottom, left-to-right. Multi-column layouts, tables, and graphics regularly get garbled or skipped entirely by parsers. This template strips all of that away, so every word you write actually reaches a human reviewer.",
    whichNeedToUseIt: "Best for finance, law, healthcare, government, and academic roles.",
    targetUser: "Candidates applying through corporate ATS portals where formatting risk outweighs visual flair - especially in traditional, conservative industries.",
    benefits: [
      "Maximum ATS parse reliability",
      "Reverse-chronological order recruiters expect",
      "Zero graphics or tables to break on export",
      "Clean serif typography that reads as professional",
    ],
  },
  "meridian-modern-two-column": {
    core_details: "A contemporary two-column layout with a coral accent and a dedicated sidebar for skills and contact info. Broad appeal for professionals who want a design that stands out while staying ATS-parseable.",
    coverTopic: "Modern two-column professional layout",
    whyBest: "The sidebar keeps skills and contact info scannable at a glance, while the main column gives your experience room to breathe. It's visually distinct without sacrificing the linear reading order ATS software needs.",
    whichNeedToUseIt: "Great for marketing, operations, product, and general corporate roles.",
    targetUser: "Professionals who want a polished, modern look for mid-to-senior corporate applications.",
    benefits: [
      "Two-column layout maximizes space without clutter",
      "Distinct accent color for visual memorability",
      "Icon-based contact section for quick scanning",
      "Balances design with ATS compatibility",
    ],
  },
  "sterling-executive-classic": {
    core_details: "Understated and refined, for senior and leadership candidates. Serif typography, a single thin accent rule, and generous white space that reads as authority without shouting for attention.",
    coverTopic: "Executive and leadership resume format",
    whyBest: "At the executive level, restraint signals confidence. This template uses spacing and typography - not color or graphics - to create hierarchy, the way a well-designed annual report does.",
    whichNeedToUseIt: "Ideal for director, VP, and C-suite applications.",
    targetUser: "Senior leaders and executives applying to board-level or C-suite positions.",
    benefits: [
      "Generous white space signals seniority",
      "Serif typography reads as established and credible",
      "Understated accent line, not loud color blocks",
      "Built for a track record, not entry-level bullet points",
    ],
  },
  "aperture-creative-portfolio": {
    core_details: "Visual personality for design, media, and advertising roles where a bit of flair helps you stand out. Includes an optional profile photo. Best when the hiring process is human-first, not ATS-first.",
    coverTopic: "Creative and portfolio-driven resume design",
    whyBest: "Design, media, and advertising hiring managers often review resumes by hand, not through an ATS - so a memorable, personality-forward layout is an asset instead of a risk.",
    whichNeedToUseIt: "Best for design, media, advertising, and other portfolio-first creative roles.",
    targetUser: "Creative professionals applying directly to hiring managers or small studios/agencies.",
    benefits: [
      "Optional profile photo for a personal touch",
      "Bold accent color and skill badges",
      "Poppins display type for visual personality",
      "Stands out in a stack of conventional resumes",
    ],
  },
  "northbeam-tech-startup": {
    core_details: "Clean, skills-forward, and built for tech and startup hiring. Skill badges make your stack scannable in seconds, with a confident indigo accent that still parses cleanly.",
    coverTopic: "Tech and startup resume format",
    whyBest: "Engineering managers scan for stack keywords first. Skill badges surface your tech stack immediately, while the rest of the layout stays clean enough to still parse correctly through an ATS.",
    whichNeedToUseIt: "Ideal for software engineers, data roles, and startup generalists.",
    targetUser: "Engineers and technical candidates applying to startups and tech companies.",
    benefits: [
      "Skill badges make your stack instantly scannable",
      "Confident, modern indigo accent",
      "Inter typeface reads as clean and technical",
      "Structured for fast-moving hiring pipelines",
    ],
  },
  "pivot-hybrid-skills-first": {
    core_details: "Leads with a skills summary before chronological history - built for career changers or candidates whose strongest signal isn't their most recent job title.",
    coverTopic: "Skills-first hybrid resume format",
    whyBest: "When your most relevant qualification isn't your last job title, leading with skills reframes the narrative before a recruiter can make a snap judgment based on your most recent role alone.",
    whichNeedToUseIt: "Best for career changers, returners to the workforce, and non-linear career paths.",
    targetUser: "Candidates pivoting industries or roles, where transferable skills matter more than job title continuity.",
    benefits: [
      "Skills lead the page, not buried after experience",
      "Reframes non-linear career paths as an asset",
      "Still includes full chronological history",
      "Teal accent keeps it approachable, not clinical",
    ],
  },
  "lyceum-academic-cv": {
    core_details: "A longer-form CV style for academic and research roles, with a dedicated Publications section. Serif typography and a muted maroon accent suit research and teaching applications.",
    coverTopic: "Academic CV with publications",
    whyBest: "Academic hiring committees expect a CV, not a one-page resume - publications, research focus, and teaching history need their own space, formatted the way departmental committees are used to reading them.",
    whichNeedToUseIt: "Best for faculty positions, postdocs, research fellowships, and grant applications.",
    targetUser: "Academics, researchers, and PhD candidates applying to university or research institution roles.",
    benefits: [
      "Dedicated Publications section with DOI/link support",
      "Longer-form CV structure, not squeezed to one page",
      "Serif academic typography (Playfair Display)",
      "Muted, scholarly color palette",
    ],
  },
  "haven-healthcare-clinical": {
    core_details: "Certifications- and licensure-forward layout for healthcare and clinical roles. Calm teal accent, clean sans-serif, and a dedicated Licensure section up front where credentialing matters most.",
    coverTopic: "Healthcare and clinical resume format",
    whyBest: "In clinical hiring, license verification often happens before anything else. Putting Licensure right after your summary means credentialing staff can confirm eligibility in seconds.",
    whichNeedToUseIt: "Ideal for nurses, clinicians, and other licensed healthcare professionals.",
    targetUser: "Licensed healthcare professionals applying to hospitals, clinics, and care facilities.",
    benefits: [
      "Dedicated Licensure section with state and expiry fields",
      "Calm, clinical teal accent color",
      "Clean sans-serif for easy credential scanning",
      "Structured for fast credentialing review",
    ],
  },
  "statute-finance-legal": {
    core_details: "The most traditional formatting available - pure black-and-white, Times New Roman, zero color accents. For the most conservative hiring contexts in finance and law.",
    coverTopic: "Ultra-conservative finance and legal resume format",
    whyBest: "Some firms - particularly in law and traditional finance - read any color or modern styling as a lack of seriousness. This template removes every stylistic risk, leaving only your credentials.",
    whichNeedToUseIt: "Best for law firms, investment banking, and other highly traditional finance/legal employers.",
    targetUser: "Candidates applying to the most formal, tradition-bound corners of finance and law.",
    benefits: [
      "Zero color - pure black and white",
      "Times New Roman, the most conventional resume font",
      "Compact density fits more credentials on one page",
      "No stylistic risk in the most conservative hiring contexts",
    ],
  },
  "fold-compact-one-page": {
    core_details: "Dense but readable - tuned to fit more content on a single page for early-career candidates or anyone with limited experience who still wants a complete, professional resume.",
    coverTopic: "Compact one-page resume format",
    whyBest: "Recruiters spend seconds per resume. A tightly-spaced, complete one-pager respects that time budget better than a sparse resume with awkward whitespace or a two-page resume that dilutes your strongest points.",
    whichNeedToUseIt: "Great for students, recent graduates, and early-career professionals.",
    targetUser: "Early-career candidates who want a complete, professional resume that still fits on one page.",
    benefits: [
      "Compact density fits more on a single page",
      "Two-column layout uses space efficiently",
      "Still includes all standard resume sections",
      "Professional slate color palette",
    ],
  },
};

async function main() {
  let updated = 0;
  for (const [slug, descriptions] of Object.entries(enrichments)) {
    const existing = await prisma.template.findUnique({ where: { slug }, select: { id: true } });
    const result = await prisma.template.updateMany({
      where: { slug },
      data: { descriptions: descriptions as any },
    });
    if (result.count > 0) {
      if (existing) await redis.del(`template-detail-${existing.id}`);
      console.log(`✅ Enriched descriptions for "${slug}"`);
      updated++;
    } else {
      console.log(`⚠️  No template found for slug "${slug}"`);
    }
  }
  if (updated > 0) await redis.del("templates-list");
  console.log(`\nDone. Updated: ${updated}/${Object.keys(enrichments).length}`);
  await prisma.$disconnect();
  await redis.quit();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
