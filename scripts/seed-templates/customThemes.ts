/**
 * Two bespoke, pixel-faithful templates matching the reference designs in
 * frontend/new-resume-template/ (modern-resume-1.avif, modern-resume-2.avif).
 * Unlike the generic buildResumeHtml() theme system (themes.ts), these
 * designs need custom markup (ribbon-shaped section banners, a split
 * gold/navy two-tone name) that the shared renderer can't produce, so the
 * HTML is written directly here. They still use the exact same field names
 * as every other template (sections.ts) so the builder wizard, JSON-paste,
 * and AI auto-fill all work unchanged.
 */
import {
  headerSection, summarySection, skillsSection, experienceSection, projectsSection,
  educationSection, certificationsSection, languagesSection, achievementsSection,
  volunteeringSection, type Section,
} from "./sections";

export type CustomTemplateDef = {
  name: string;
  slug: string;
  category: string;
  description: string;
  sections: Section[];
  htmlLayout: string;
};

const GOOGLE_FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">';
const FA_CDN =
  '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">';

// Shared bullet-list partial: turns a textarea value into real <li> bullets
// via the splitLines helper (registered in src/utils/handlebarsHelpers.ts).
const bullets = (field: string) => `
  <ul class="bullets">
    {{#each (splitLines ${field})}}
    <li>{{this}}</li>
    {{/each}}
  </ul>`;

// ---------------------------------------------------------------------------
// Template 1 — "Periwinkle Ribbon": light periwinkle sidebar, navy ribbon
// section banners, stacked two-line name, timeline-style experience dates.
// ---------------------------------------------------------------------------
const periwinkleRibbonSections: Section[] = [
  headerSection(true),
  summarySection,
  skillsSection,
  experienceSection,
  projectsSection,
  educationSection,
  certificationsSection,
  languagesSection,
  achievementsSection,
  volunteeringSection,
];

const periwinkleRibbonHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${FA_CDN}
${GOOGLE_FONTS}
<style>
  :root {
    --primary: #1d3e78;
    --sidebar-bg: #b9c6e6;
    --sidebar-line: #c9d5ec;
    --text: #262626;
    --muted: #6b6b6b;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--text);
    background: #f4f5f7;
    padding: 1.5rem 1rem;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .resume { max-width: 1000px; margin: 0 auto; background: #fff; }
  .grid { display: grid; grid-template-columns: 31% 69%; min-height: 100%; }
  .sidebar { background: var(--sidebar-bg); padding: 2.2rem 1.7rem; }
  .main { padding: 2.4rem 2.4rem; position: relative; overflow: hidden; }
  .main::before, .main::after {
    content: ""; position: absolute; background: var(--sidebar-line);
    z-index: 0; pointer-events: none;
  }
  .main::before { width: 60px; height: 60px; top: 0; right: 0; }
  .main::after { width: 34px; height: 90px; top: 90px; right: 0; }
  .main > * { position: relative; z-index: 1; }

  .photo-wrap { display: flex; justify-content: center; margin-bottom: 1.6rem; }
  .photo { width: 128px; height: 128px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
  .photo-fallback {
    width: 128px; height: 128px; border-radius: 50%; border: 4px solid #fff;
    background: var(--primary); color: #fff; display: flex; align-items: center;
    justify-content: center; font-size: 42px; box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  }

  .ribbon {
    background: var(--primary); color: #fff; font-family: 'Poppins', sans-serif;
    font-weight: 700; font-size: 14.5px; padding: 9px 18px 9px 14px; margin: 0 -0.2rem 1rem 0;
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%);
  }
  .side-block { margin-bottom: 1.7rem; }
  .side-row { margin-bottom: 0.85rem; }
  .side-label { font-weight: 700; color: var(--text); font-size: 12px; display: block; margin-bottom: 2px; }
  .side-value { color: #33415e; font-size: 11.5px; word-break: break-word; }
  .side-item { margin-bottom: 0.75rem; }
  .side-item-title { font-weight: 700; font-size: 12px; }
  .side-item-sub { color: #33415e; font-size: 11.5px; }
  .side-item-date { color: #33415e; font-size: 11px; }
  .side-list { list-style: none; }
  .side-list li { font-size: 11.5px; color: #33415e; margin-bottom: 5px; padding-left: 12px; position: relative; }
  .side-list li::before { content: "•"; position: absolute; left: 0; color: var(--primary); }

  .name-line { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 30px; line-height: 1.12; color: var(--primary); letter-spacing: 0.3px; text-transform: uppercase; }
  .job-title { font-size: 15px; color: var(--muted); margin: 0.5rem 0 1.8rem; }

  .block { margin-bottom: 1.5rem; }
  .block-title { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 17px; color: var(--primary); margin-bottom: 0.9rem; }
  .summary-text { white-space: pre-line; color: var(--text); }

  .timeline-item { display: flex; gap: 1rem; margin-bottom: 1.1rem; }
  .timeline-date { flex: 0 0 62px; text-align: right; font-size: 11px; color: var(--muted); border-right: 2px solid var(--sidebar-bg); padding-right: 12px; white-space: pre-line; }
  .timeline-body { flex: 1; }
  .timeline-title { font-weight: 700; font-size: 13.5px; color: var(--text); }
  .timeline-sub { font-size: 11.5px; color: var(--muted); margin: 2px 0 6px; }
  .bullets { list-style: none; }
  .bullets li { font-size: 12px; color: var(--text); margin-bottom: 4px; padding-left: 14px; position: relative; }
  .bullets li::before { content: "•"; position: absolute; left: 0; color: var(--primary); }

  .item { margin-bottom: 1rem; }
  .item-header { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .item-title { font-weight: 700; font-size: 13.5px; }
  .item-date { font-size: 11px; color: var(--muted); white-space: nowrap; }
  .item-sub { font-size: 11.5px; color: var(--muted); margin: 2px 0 6px; }
  .item-compact { margin-bottom: 0.4rem; font-size: 12px; }

  @media print { body { background: #fff; padding: 0; } }
  @media (max-width: 750px) { .grid { grid-template-columns: 1fr; } }
</style>
</head><body>
<div class="resume">
  <div class="grid">
    <aside class="sidebar">
      <div class="photo-wrap">
        {{#if header.photo}}
        <img class="photo" src="{{header.photo}}" alt="{{header.name}}" />
        {{else}}
        <div class="photo-fallback"><i class="fa-solid fa-user"></i></div>
        {{/if}}
      </div>

      <div class="side-block">
        <div class="ribbon">Contact</div>
        {{#if header.phone}}<div class="side-row"><span class="side-label">Phone</span><span class="side-value">{{header.phone}}</span></div>{{/if}}
        {{#if header.email}}<div class="side-row"><span class="side-label">Email</span><span class="side-value">{{header.email}}</span></div>{{/if}}
        {{#if header.location}}<div class="side-row"><span class="side-label">Address</span><span class="side-value">{{header.location}}</span></div>{{/if}}
        {{#if header.linkedin}}<div class="side-row"><span class="side-label">LinkedIn</span><span class="side-value">{{header.linkedin}}</span></div>{{/if}}
        {{#if header.portfolio}}<div class="side-row"><span class="side-label">Portfolio</span><span class="side-value">{{header.portfolio}}</span></div>{{/if}}
      </div>

      {{#if education}}
      <div class="side-block">
        <div class="ribbon">Education</div>
        {{#each education}}
        <div class="side-item">
          <div class="side-item-title">{{degree}}</div>
          <div class="side-item-sub">{{institution}}</div>
          <div class="side-item-date">{{startYear}}{{#if endYear}} - {{endYear}}{{/if}}</div>
        </div>
        {{/each}}
      </div>
      {{/if}}

      {{#if skills}}
      <div class="side-block">
        <div class="ribbon">Skills</div>
        <ul class="side-list">
          {{#each skills}}
          <li>{{category}}: {{items}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}

      {{#if languages}}
      <div class="side-block">
        <div class="ribbon">Languages</div>
        <ul class="side-list">
          {{#each languages}}
          <li>{{language}} - {{proficiency}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}

      {{#if certifications}}
      <div class="side-block">
        <div class="ribbon">Certifications</div>
        <ul class="side-list">
          {{#each certifications}}
          <li>{{name}} - {{issuer}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}
    </aside>

    <main class="main">
      <div class="name-line">{{nameFirst header.name}}</div>
      <div class="name-line">{{nameRest header.name}}</div>
      <div class="job-title">{{header.jobTitle}}</div>

      {{#if summary.bio}}
      <section class="block">
        <h2 class="block-title">Summary</h2>
        <p class="summary-text">{{summary.bio}}</p>
      </section>
      {{/if}}

      {{#if experience}}
      <section class="block">
        <h2 class="block-title">Professional Experience</h2>
        {{#each experience}}
        <div class="timeline-item">
          <div class="timeline-date">{{startDate}}{{#if endDate}} - {{endDate}}{{else}} - Present{{/if}}</div>
          <div class="timeline-body">
            <div class="timeline-title">{{role}}</div>
            <div class="timeline-sub">{{company}}{{#if location}} | {{location}}{{/if}}</div>
            ${bullets("description")}
          </div>
        </div>
        {{/each}}
      </section>
      {{/if}}

      {{#if projects}}
      <section class="block">
        <h2 class="block-title">Projects</h2>
        {{#each projects}}
        <div class="item">
          <div class="item-header">
            <span class="item-title">{{name}}</span>
            {{#if link}}<a href="{{link}}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); font-size:11px;">View</a>{{/if}}
          </div>
          {{#if techStack}}<div class="item-sub">{{techStack}}</div>{{/if}}
          ${bullets("description")}
        </div>
        {{/each}}
      </section>
      {{/if}}

      {{#if achievements}}
      <section class="block">
        <h2 class="block-title">Achievements</h2>
        {{#each achievements}}
        <div class="item-compact"><strong>{{title}}</strong>{{#if date}} ({{date}}){{/if}}{{#if description}} — {{description}}{{/if}}</div>
        {{/each}}
      </section>
      {{/if}}

      {{#if volunteering}}
      <section class="block">
        <h2 class="block-title">Volunteer Experience</h2>
        {{#each volunteering}}
        <div class="item">
          <div class="item-header">
            <span class="item-title">{{role}} — {{organization}}</span>
            <span class="item-date">{{startDate}}{{#if endDate}} - {{endDate}}{{else}} - Present{{/if}}</span>
          </div>
          ${bullets("description")}
        </div>
        {{/each}}
      </section>
      {{/if}}
    </main>
  </div>
</div>
</body></html>`;

// ---------------------------------------------------------------------------
// Template 2 — "Regal Navy & Gold": dark navy sidebar, gold accents,
// split-tone gold/navy name, gold section labels.
// ---------------------------------------------------------------------------
const regalNavyGoldSections: Section[] = [
  headerSection(true),
  summarySection,
  skillsSection,
  experienceSection,
  projectsSection,
  educationSection,
  certificationsSection,
  languagesSection,
  achievementsSection,
  volunteeringSection,
];

const regalNavyGoldHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${FA_CDN}
${GOOGLE_FONTS}
<style>
  :root {
    --navy: #1b2a41;
    --gold: #c9a063;
    --text: #1f1f1f;
    --muted: #666666;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--text);
    background: #f4f5f7;
    padding: 1.5rem 1rem;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .resume { max-width: 1000px; margin: 0 auto; background: #fff; }
  .grid { display: grid; grid-template-columns: 33% 67%; min-height: 100%; }
  .sidebar { background: var(--navy); color: #fff; padding: 2.2rem 1.7rem; }
  .main { padding: 2.4rem 2.4rem; }

  .photo-wrap { display: flex; justify-content: center; margin-bottom: 1.6rem; }
  .photo { width: 118px; height: 118px; border-radius: 50%; object-fit: cover; border: 3px solid var(--gold); }
  .photo-fallback {
    width: 118px; height: 118px; border-radius: 50%; border: 3px solid var(--gold);
    background: rgba(255,255,255,0.08); color: var(--gold); display: flex; align-items: center;
    justify-content: center; font-size: 40px;
  }

  .side-block { margin-bottom: 1.7rem; }
  .side-heading {
    font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px;
    text-transform: uppercase; color: var(--gold); border-bottom: 1.5px solid rgba(201,160,99,0.5);
    padding-bottom: 6px; margin-bottom: 0.7rem;
  }
  .side-row { display: flex; align-items: center; gap: 8px; margin-bottom: 0.65rem; font-size: 11.5px; color: #e7e9ee; }
  .side-row i { color: var(--gold); width: 12px; }
  .side-item { margin-bottom: 0.85rem; }
  .side-item-title { font-weight: 700; font-size: 12px; color: #fff; }
  .side-item-sub { color: #c7cbd6; font-size: 11.5px; }
  .side-item-date { color: var(--gold); font-size: 11px; }
  .side-list { list-style: none; }
  .side-list li { font-size: 11.5px; color: #e7e9ee; margin-bottom: 5px; padding-left: 12px; position: relative; }
  .side-list li::before { content: "•"; position: absolute; left: 0; color: var(--gold); }

  .name-block { margin-bottom: 0.6rem; }
  .name-gold { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 32px; line-height: 1.05; color: var(--gold); text-transform: uppercase; }
  .name-dark { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 32px; line-height: 1.05; color: var(--navy); text-transform: uppercase; }
  .job-title { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin: 6px 0 12px; }
  .divider { height: 2px; width: 54px; background: var(--gold); margin-bottom: 1.6rem; }

  .block { margin-bottom: 1.4rem; }
  .block-title {
    font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 13.5px; letter-spacing: 0.8px;
    text-transform: uppercase; color: var(--gold); margin-bottom: 0.7rem;
  }
  .summary-text { white-space: pre-line; color: var(--text); }

  .item { margin-bottom: 1rem; }
  .item-header { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .item-title { font-weight: 700; font-size: 13px; color: #111; }
  .item-date { font-size: 11px; color: var(--muted); font-weight: 600; white-space: nowrap; }
  .item-sub { font-size: 11.5px; color: var(--muted); margin: 2px 0 6px; }
  .item-compact { margin-bottom: 0.4rem; font-size: 12px; }
  .bullets { list-style: none; }
  .bullets li { font-size: 12px; color: var(--text); margin-bottom: 4px; padding-left: 14px; position: relative; }
  .bullets li::before { content: "•"; position: absolute; left: 0; color: var(--gold); }

  @media print { body { background: #fff; padding: 0; } }
  @media (max-width: 750px) { .grid { grid-template-columns: 1fr; } }
</style>
</head><body>
<div class="resume">
  <div class="grid">
    <aside class="sidebar">
      <div class="photo-wrap">
        {{#if header.photo}}
        <img class="photo" src="{{header.photo}}" alt="{{header.name}}" />
        {{else}}
        <div class="photo-fallback"><i class="fa-solid fa-user"></i></div>
        {{/if}}
      </div>

      <div class="side-block">
        <div class="side-heading">Contact</div>
        {{#if header.email}}<div class="side-row"><i class="fa-solid fa-envelope"></i>{{header.email}}</div>{{/if}}
        {{#if header.phone}}<div class="side-row"><i class="fa-solid fa-phone"></i>{{header.phone}}</div>{{/if}}
        {{#if header.location}}<div class="side-row"><i class="fa-solid fa-location-dot"></i>{{header.location}}</div>{{/if}}
        {{#if header.linkedin}}<div class="side-row"><i class="fa-brands fa-linkedin"></i>{{header.linkedin}}</div>{{/if}}
        {{#if header.portfolio}}<div class="side-row"><i class="fa-solid fa-globe"></i>{{header.portfolio}}</div>{{/if}}
      </div>

      {{#if education}}
      <div class="side-block">
        <div class="side-heading">Education</div>
        {{#each education}}
        <div class="side-item">
          <div class="side-item-title">{{degree}}</div>
          <div class="side-item-sub">{{institution}}</div>
          <div class="side-item-date">{{startYear}}{{#if endYear}} - {{endYear}}{{/if}}</div>
        </div>
        {{/each}}
      </div>
      {{/if}}

      {{#if skills}}
      <div class="side-block">
        <div class="side-heading">Skills</div>
        <ul class="side-list">
          {{#each skills}}
          <li>{{category}}: {{items}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}

      {{#if languages}}
      <div class="side-block">
        <div class="side-heading">Languages</div>
        <ul class="side-list">
          {{#each languages}}
          <li>{{language}} - {{proficiency}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}

      {{#if certifications}}
      <div class="side-block">
        <div class="side-heading">Certifications</div>
        <ul class="side-list">
          {{#each certifications}}
          <li>{{name}} - {{issuer}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}
    </aside>

    <main class="main">
      <div class="name-block">
        <div class="name-gold">{{nameFirst header.name}}</div>
        <div class="name-dark">{{nameRest header.name}}</div>
      </div>
      <div class="job-title">{{header.jobTitle}}</div>
      <div class="divider"></div>

      {{#if summary.bio}}
      <section class="block">
        <h2 class="block-title">Professional Profile</h2>
        <p class="summary-text">{{summary.bio}}</p>
      </section>
      {{/if}}

      {{#if experience}}
      <section class="block">
        <h2 class="block-title">Work Experience</h2>
        {{#each experience}}
        <div class="item">
          <div class="item-header">
            <span class="item-title">{{role}}</span>
            <span class="item-date">{{startDate}}{{#if endDate}} - {{endDate}}{{else}} - Present{{/if}}</span>
          </div>
          <div class="item-sub">{{company}}{{#if location}}, {{location}}{{/if}}</div>
          ${bullets("description")}
        </div>
        {{/each}}
      </section>
      {{/if}}

      {{#if projects}}
      <section class="block">
        <h2 class="block-title">Projects</h2>
        {{#each projects}}
        <div class="item">
          <div class="item-header">
            <span class="item-title">{{name}}</span>
            {{#if link}}<a href="{{link}}" target="_blank" rel="noopener noreferrer" style="color:var(--gold); font-size:11px;">View</a>{{/if}}
          </div>
          {{#if techStack}}<div class="item-sub">{{techStack}}</div>{{/if}}
          ${bullets("description")}
        </div>
        {{/each}}
      </section>
      {{/if}}

      {{#if achievements}}
      <section class="block">
        <h2 class="block-title">Achievements</h2>
        {{#each achievements}}
        <div class="item-compact"><strong>{{title}}</strong>{{#if date}} ({{date}}){{/if}}{{#if description}} — {{description}}{{/if}}</div>
        {{/each}}
      </section>
      {{/if}}

      {{#if volunteering}}
      <section class="block">
        <h2 class="block-title">Volunteer Experience</h2>
        {{#each volunteering}}
        <div class="item">
          <div class="item-header">
            <span class="item-title">{{role}} — {{organization}}</span>
            <span class="item-date">{{startDate}}{{#if endDate}} - {{endDate}}{{else}} - Present{{/if}}</span>
          </div>
          ${bullets("description")}
        </div>
        {{/each}}
      </section>
      {{/if}}
    </main>
  </div>
</div>
</body></html>`;

export const customTemplateDefs: CustomTemplateDef[] = [
  {
    name: "Periwinkle Ribbon",
    slug: "periwinkle-ribbon-modern",
    category: "modern",
    description: "A modern two-column resume with a soft periwinkle sidebar and bold navy ribbon-style section banners, plus a timeline-style experience layout.",
    sections: periwinkleRibbonSections,
    htmlLayout: periwinkleRibbonHtml,
  },
  {
    name: "Regal Navy & Gold",
    slug: "regal-navy-gold-executive",
    category: "executive",
    description: "A refined two-column resume with a deep navy sidebar, gold accents, and a striking split-tone gold/navy name treatment for a polished, executive feel.",
    sections: regalNavyGoldSections,
    htmlLayout: regalNavyGoldHtml,
  },
];
