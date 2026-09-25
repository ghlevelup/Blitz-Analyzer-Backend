import type { Section } from "./sections";

export type Theme = {
  key: string;
  layout: "1col" | "2col";
  primaryColor: string;
  accentSoft: string; // light tint of primaryColor for backgrounds/badges
  textColor: string;
  mutedColor: string;
  headingFont: string;
  bodyFont: string;
  googleFontsHref?: string;
  useIcons: boolean;
  density: "compact" | "normal" | "spacious";
  skillsAsBadges: boolean;
  accentLine: boolean; // thin rule under the name/header
  withPhoto?: boolean;
};

const DENSITY = {
  compact: { pad: "1.4rem", gap: "0.9rem", font: "12px", lineHeight: "1.35" },
  normal: { pad: "2rem", gap: "1.5rem", font: "13px", lineHeight: "1.5" },
  spacious: { pad: "2.6rem", gap: "2rem", font: "13.5px", lineHeight: "1.6" },
};

const icon = (theme: Theme, cls: string) =>
  theme.useIcons ? `<i class="fa-solid ${cls} contact-icon"></i>` : "";

// One render function per shared section key. Each returns a self-contained
// Handlebars block - same field bindings regardless of which theme wraps
// them, only the surrounding CSS classes vary per theme's density/layout.
const sectionRenderers: Record<string, (theme: Theme) => string> = {
  header: (theme) => `
    ${theme.withPhoto ? `{{#if header.photo}}<img class="header-photo" src="{{header.photo}}" alt="{{header.name}}" />{{/if}}` : ""}
    <div class="header-name">{{header.name}}</div>
    <div class="header-title">{{header.jobTitle}}</div>
    ${theme.accentLine ? '<div class="accent-line"></div>' : ""}
    <div class="contact-row">
      {{#if header.email}}<span class="contact-item">${icon(theme, "fa-envelope")}<a href="mailto:{{header.email}}">{{header.email}}</a></span>{{/if}}
      {{#if header.phone}}<span class="contact-item">${icon(theme, "fa-phone")}<a href="tel:{{header.phone}}">{{header.phone}}</a></span>{{/if}}
      {{#if header.location}}<span class="contact-item">${icon(theme, "fa-location-dot")}{{header.location}}</span>{{/if}}
      {{#if header.linkedin}}<span class="contact-item">${icon(theme, "fa-brands fa-linkedin")}<a href="{{header.linkedin}}" target="_blank" rel="noopener noreferrer">LinkedIn</a></span>{{/if}}
      {{#if header.github}}<span class="contact-item">${icon(theme, "fa-brands fa-github")}<a href="{{header.github}}" target="_blank" rel="noopener noreferrer">GitHub</a></span>{{/if}}
      {{#if header.portfolio}}<span class="contact-item">${icon(theme, "fa-globe")}<a href="{{header.portfolio}}" target="_blank" rel="noopener noreferrer">Portfolio</a></span>{{/if}}
    </div>`,

  summary: () => `
    {{#if summary.bio}}
    <section class="block">
      <h2 class="block-title">Profile</h2>
      <p class="summary-text">{{summary.bio}}</p>
    </section>
    {{/if}}`,

  skills: (theme) => `
    {{#if skills}}
    <section class="block">
      <h2 class="block-title">Skills</h2>
      {{#each skills}}
      <div class="skill-group">
        <span class="skill-category">{{category}}</span>
        ${theme.skillsAsBadges
          ? `<span class="skill-badges">{{items}}</span>`
          : `<span class="skill-items">{{items}}</span>`}
      </div>
      {{/each}}
    </section>
    {{/if}}`,

  experience: () => `
    {{#if experience}}
    <section class="block">
      <h2 class="block-title">Experience</h2>
      {{#each experience}}
      <div class="item">
        <div class="item-header">
          <span class="item-title">{{role}} — {{company}}</span>
          <span class="item-date">{{startDate}} {{#if endDate}}– {{endDate}}{{else}}– Present{{/if}}</span>
        </div>
        {{#if location}}<div class="item-location">{{location}}</div>{{/if}}
        <div class="item-desc">{{description}}</div>
      </div>
      {{/each}}
    </section>
    {{/if}}`,

  projects: () => `
    {{#if projects}}
    <section class="block">
      <h2 class="block-title">Projects</h2>
      {{#each projects}}
      <div class="item">
        <div class="item-header">
          <span class="item-title">{{name}}</span>
          {{#if link}}<a class="item-link" href="{{link}}" target="_blank" rel="noopener noreferrer">View</a>{{/if}}
        </div>
        {{#if techStack}}<div class="item-sub">{{techStack}}</div>{{/if}}
        <div class="item-desc">{{description}}</div>
      </div>
      {{/each}}
    </section>
    {{/if}}`,

  education: () => `
    {{#if education}}
    <section class="block">
      <h2 class="block-title">Education</h2>
      {{#each education}}
      <div class="item">
        <div class="item-header">
          <span class="item-title">{{degree}} — {{institution}}</span>
          <span class="item-date">{{startYear}}{{#if endYear}} – {{endYear}}{{/if}}</span>
        </div>
        {{#if details}}<div class="item-desc">{{details}}</div>{{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}`,

  certifications: () => `
    {{#if certifications}}
    <section class="block">
      <h2 class="block-title">Certifications</h2>
      {{#each certifications}}
      <div class="item item-compact">
        <span class="item-title">{{name}}</span> — <span class="item-sub-inline">{{issuer}}</span>
        {{#if date}}<span class="item-date-inline">({{date}})</span>{{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}`,

  languages: () => `
    {{#if languages}}
    <section class="block">
      <h2 class="block-title">Languages</h2>
      {{#each languages}}
      <div class="item item-compact"><span class="item-title">{{language}}</span> — {{proficiency}}</div>
      {{/each}}
    </section>
    {{/if}}`,

  achievements: () => `
    {{#if achievements}}
    <section class="block">
      <h2 class="block-title">Achievements</h2>
      {{#each achievements}}
      <div class="item item-compact">
        <span class="item-title">{{title}}</span> {{#if date}}<span class="item-date-inline">({{date}})</span>{{/if}}
        {{#if description}}<div class="item-desc">{{description}}</div>{{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}`,

  volunteering: () => `
    {{#if volunteering}}
    <section class="block">
      <h2 class="block-title">Volunteer Experience</h2>
      {{#each volunteering}}
      <div class="item">
        <div class="item-header">
          <span class="item-title">{{role}} — {{organization}}</span>
          <span class="item-date">{{startDate}} {{#if endDate}}– {{endDate}}{{else}}– Present{{/if}}</span>
        </div>
        <div class="item-desc">{{description}}</div>
      </div>
      {{/each}}
    </section>
    {{/if}}`,

  publications: () => `
    {{#if publications}}
    <section class="block">
      <h2 class="block-title">Publications</h2>
      {{#each publications}}
      <div class="item item-compact">
        <span class="item-title">{{title}}</span> — {{venue}} {{#if date}}({{date}}){{/if}}
        {{#if link}}<a class="item-link" href="{{link}}" target="_blank" rel="noopener noreferrer">Link</a>{{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}`,

  licensure: () => `
    {{#if licensure}}
    <section class="block">
      <h2 class="block-title">Licensure</h2>
      {{#each licensure}}
      <div class="item item-compact">
        <span class="item-title">{{licenseName}}</span> — {{state}}
        {{#if licenseNumber}}<span class="item-sub-inline">#{{licenseNumber}}</span>{{/if}}
        {{#if expiryDate}}<span class="item-date-inline">exp. {{expiryDate}}</span>{{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}`,
};

function baseCss(theme: Theme): string {
  const d = DENSITY[theme.density];
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${theme.bodyFont};
      font-size: ${d.font};
      line-height: ${d.lineHeight};
      color: ${theme.textColor};
      background: #f4f5f7;
      padding: 1.5rem 1rem;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .resume { max-width: 1000px; margin: 0 auto; background: #fff; }
    .header-photo { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; margin-bottom: 0.6rem; }
    .header-name { font-family: ${theme.headingFont}; font-size: 26px; font-weight: 700; color: ${theme.primaryColor}; }
    .header-title { font-size: 14px; color: ${theme.mutedColor}; margin-top: 2px; margin-bottom: 0.6rem; }
    .accent-line { height: 3px; width: 56px; background: ${theme.primaryColor}; margin: 0.5rem 0 0.8rem; }
    .contact-row { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11.5px; color: ${theme.mutedColor}; margin-top: 0.4rem; }
    .contact-item { display: inline-flex; align-items: center; gap: 6px; }
    .contact-icon { color: ${theme.primaryColor}; font-size: 12px; }
    a { color: ${theme.primaryColor}; text-decoration: none; }
    .block { margin-bottom: ${d.gap}; }
    .block-title {
      font-family: ${theme.headingFont}; font-size: 14px; font-weight: 700; letter-spacing: 0.4px;
      text-transform: uppercase; color: ${theme.primaryColor};
      border-bottom: 1.5px solid ${theme.accentSoft}; padding-bottom: 4px; margin-bottom: 0.6rem;
    }
    .summary-text { white-space: pre-line; }
    .skill-group { margin-bottom: 0.5rem; }
    .skill-category { font-weight: 700; display: block; margin-bottom: 3px; }
    .skill-items { color: ${theme.mutedColor}; white-space: pre-line; }
    .skill-badges { display: inline; }
    .item { margin-bottom: 0.9rem; }
    .item-compact { margin-bottom: 0.35rem; }
    .item-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .item-title { font-weight: 700; }
    .item-date, .item-date-inline { color: ${theme.mutedColor}; font-size: 11px; white-space: nowrap; }
    .item-location, .item-sub, .item-sub-inline { color: ${theme.primaryColor}; font-size: 11.5px; }
    .item-desc { white-space: pre-line; margin-top: 4px; color: ${theme.textColor}; }
    .item-link { font-size: 11px; }
    @media print { body { background: #fff; padding: 0; } }
  `;
}

function oneColumnCss(theme: Theme): string {
  const d = DENSITY[theme.density];
  return `
    .resume { padding: ${d.pad}; }
    .header { margin-bottom: 1.2rem; }
  `;
}

function twoColumnCss(theme: Theme): string {
  const d = DENSITY[theme.density];
  return `
    .resume-grid { display: grid; grid-template-columns: 32% 68%; min-height: 100%; }
    .sidebar { background: ${theme.accentSoft}; padding: ${d.pad}; }
    .main-content { padding: ${d.pad}; }
    @media (max-width: 750px) { .resume-grid { grid-template-columns: 1fr; } }
  `;
}

export function buildResumeHtml(theme: Theme, orderedSectionKeys: string[]): string {
  const render = (key: string) => sectionRenderers[key]?.(theme) ?? "";

  if (theme.layout === "1col") {
    const body = orderedSectionKeys
      .filter((k) => k !== "header")
      .map(render)
      .join("\n");
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${theme.useIcons ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">' : ""}
${theme.googleFontsHref ? `<link rel="stylesheet" href="${theme.googleFontsHref}">` : ""}
<style>${baseCss(theme)}${oneColumnCss(theme)}</style>
</head><body>
<div class="resume">
  <header class="header">${render("header")}</header>
  <main>${body}</main>
</div>
</body></html>`;
  }

  // 2col: header + skills go in the sidebar, everything else in main
  const sidebarKeys = ["skills", "languages", "certifications", "licensure"];
  const sidebarBody = orderedSectionKeys.filter((k) => sidebarKeys.includes(k)).map(render).join("\n");
  const mainBody = orderedSectionKeys
    .filter((k) => k !== "header" && !sidebarKeys.includes(k))
    .map(render)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${theme.useIcons ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">' : ""}
${theme.googleFontsHref ? `<link rel="stylesheet" href="${theme.googleFontsHref}">` : ""}
<style>${baseCss(theme)}${twoColumnCss(theme)}</style>
</head><body>
<div class="resume">
  <div class="resume-grid">
    <aside class="sidebar">${render("header")}${sidebarBody}</aside>
    <main class="main-content">${mainBody}</main>
  </div>
</div>
</body></html>`;
}

export type { Section };
