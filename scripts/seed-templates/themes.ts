import type { Theme } from "./buildHtml";

export type TemplateDef = {
  name: string;
  slug: string;
  category: string;
  description: string;
  theme: Theme;
  sectionOrder: string[]; // which shared sections, in what order
  withPhoto?: boolean;
};

const INTER = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
const GEORGIA = undefined; // system serif, no webfont needed
const PLAYFAIR = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500&display=swap";
const POPPINS = "https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500&display=swap";

const commonOrder = ["summary", "skills", "experience", "projects", "education", "certifications", "languages", "achievements", "volunteering"];

export const templateDefs: TemplateDef[] = [
  {
    name: "Clarity Minimalist",
    slug: "clarity-minimalist-ats-safe",
    category: "minimalist",
    description:
      "The safest choice for ATS parsing: single-column, reverse-chronological, no graphics or tables. Built for finance, law, healthcare, and academic hiring where tradition and clean parsing matter most.",
    theme: {
      key: "minimalist", layout: "1col", primaryColor: "#1a1a1a", accentSoft: "#e5e5e5",
      textColor: "#1f1f1f", mutedColor: "#5a5a5a", headingFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "Georgia, 'Times New Roman', serif", googleFontsHref: GEORGIA,
      useIcons: false, density: "normal", skillsAsBadges: false, accentLine: false,
    },
    sectionOrder: commonOrder,
  },
  {
    name: "Meridian Modern",
    slug: "meridian-modern-two-column",
    category: "modern",
    description:
      "A contemporary two-column layout with a coral accent and a dedicated sidebar for skills and contact info. Broad appeal for professionals who want a design that stands out while staying ATS-parseable.",
    theme: {
      key: "modern", layout: "2col", primaryColor: "#d9480f", accentSoft: "#fff1e6",
      textColor: "#22252a", mutedColor: "#6b7280", headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif", googleFontsHref: INTER,
      useIcons: true, density: "normal", skillsAsBadges: false, accentLine: true,
    },
    sectionOrder: commonOrder,
  },
  {
    name: "Sterling Executive",
    slug: "sterling-executive-classic",
    category: "executive",
    description:
      "Understated and refined, for senior and leadership candidates. Serif typography, a single thin accent rule, and generous white space that reads as authority without shouting for attention.",
    theme: {
      key: "executive", layout: "1col", primaryColor: "#0b2545", accentSoft: "#dde5ef",
      textColor: "#1c2b3a", mutedColor: "#5c6b7a", headingFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "Georgia, 'Times New Roman', serif", googleFontsHref: GEORGIA,
      useIcons: false, density: "spacious", skillsAsBadges: false, accentLine: true,
    },
    sectionOrder: commonOrder,
  },
  {
    name: "Aperture Creative",
    slug: "aperture-creative-portfolio",
    category: "creative",
    description:
      "Visual personality for design, media, and advertising roles where a bit of flair helps you stand out. Includes an optional profile photo. Best when the hiring process is human-first, not ATS-first.",
    theme: {
      key: "creative", layout: "1col", primaryColor: "#9333ea", accentSoft: "#f3e8ff",
      textColor: "#231b2e", mutedColor: "#6d6478", headingFont: "'Poppins', sans-serif",
      bodyFont: "'Inter', sans-serif", googleFontsHref: POPPINS,
      useIcons: true, density: "normal", skillsAsBadges: true, accentLine: true, withPhoto: true,
    },
    sectionOrder: commonOrder,
    withPhoto: true,
  },
  {
    name: "Northbeam Tech",
    slug: "northbeam-tech-startup",
    category: "tech",
    description:
      "Clean, skills-forward, and built for tech and startup hiring. Skill badges make your stack scannable in seconds, with a confident indigo accent that still parses cleanly.",
    theme: {
      key: "tech", layout: "1col", primaryColor: "#4338ca", accentSoft: "#e0e7ff",
      textColor: "#1e2230", mutedColor: "#5b6178", headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif", googleFontsHref: INTER,
      useIcons: true, density: "normal", skillsAsBadges: true, accentLine: true,
    },
    sectionOrder: commonOrder,
  },
  {
    name: "Pivot Hybrid",
    slug: "pivot-hybrid-skills-first",
    category: "hybrid",
    description:
      "Leads with a skills summary before chronological history — built for career changers or candidates whose strongest signal isn't their most recent job title.",
    theme: {
      key: "hybrid", layout: "1col", primaryColor: "#0f766e", accentSoft: "#ccfbf1",
      textColor: "#1a2422", mutedColor: "#5a6a67", headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif", googleFontsHref: INTER,
      useIcons: false, density: "normal", skillsAsBadges: true, accentLine: true,
    },
    sectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications", "languages", "achievements", "volunteering"],
  },
  {
    name: "Lyceum Academic",
    slug: "lyceum-academic-cv",
    category: "academic",
    description:
      "A longer-form CV style for academic and research roles, with a dedicated Publications section. Serif typography and a muted maroon accent suit research and teaching applications.",
    theme: {
      key: "academic", layout: "1col", primaryColor: "#7f1d1d", accentSoft: "#fee2e2",
      textColor: "#241c1c", mutedColor: "#6b5c5c", headingFont: "'Playfair Display', Georgia, serif",
      bodyFont: "Georgia, serif", googleFontsHref: PLAYFAIR,
      useIcons: false, density: "spacious", skillsAsBadges: false, accentLine: false,
    },
    sectionOrder: ["summary", "publications", "experience", "education", "certifications", "achievements", "languages"],
  },
  {
    name: "Haven Clinical",
    slug: "haven-healthcare-clinical",
    category: "healthcare",
    description:
      "Certifications- and licensure-forward layout for healthcare and clinical roles. Calm teal accent, clean sans-serif, and a dedicated Licensure section up front where credentialing matters most.",
    theme: {
      key: "healthcare", layout: "1col", primaryColor: "#0e7490", accentSoft: "#cffafe",
      textColor: "#1c2a2e", mutedColor: "#5a6c70", headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif", googleFontsHref: INTER,
      useIcons: false, density: "normal", skillsAsBadges: false, accentLine: true,
    },
    sectionOrder: ["summary", "licensure", "experience", "education", "certifications", "skills", "languages", "achievements", "volunteering"],
  },
  {
    name: "Statute Conservative",
    slug: "statute-finance-legal",
    category: "finance-legal",
    description:
      "The most traditional formatting available — pure black-and-white, Times New Roman, zero color accents. For the most conservative hiring contexts in finance and law.",
    theme: {
      key: "finance-legal", layout: "1col", primaryColor: "#000000", accentSoft: "#e5e5e5",
      textColor: "#000000", mutedColor: "#333333", headingFont: "'Times New Roman', Times, serif",
      bodyFont: "'Times New Roman', Times, serif", googleFontsHref: GEORGIA,
      useIcons: false, density: "compact", skillsAsBadges: false, accentLine: false,
    },
    sectionOrder: commonOrder,
  },
  {
    name: "Fold Compact",
    slug: "fold-compact-one-page",
    category: "compact",
    description:
      "Dense but readable — tuned to fit more content on a single page for early-career candidates or anyone with limited experience who still wants a complete, professional resume.",
    theme: {
      key: "compact", layout: "2col", primaryColor: "#334155", accentSoft: "#e2e8f0",
      textColor: "#1e293b", mutedColor: "#64748b", headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif", googleFontsHref: INTER,
      useIcons: true, density: "compact", skillsAsBadges: true, accentLine: false,
    },
    sectionOrder: commonOrder,
  },
];
