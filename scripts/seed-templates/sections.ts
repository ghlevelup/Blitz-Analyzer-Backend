/**
 * Shared BuilderSection schema for the 10 new resume templates.
 * Matches the shape already used by the existing "Modern Professional
 * Resume" template row (frontend/src/interfaces/builder.ts field types),
 * so the same wizard/JSON-paste/AI-autofill builder UI works unchanged.
 */

export type SectionField = {
  name: string;
  type:
    | "text" | "email" | "url" | "tel" | "number" | "textarea" | "date"
    | "checkbox" | "select" | "file";
  label: string;
  required?: boolean;
  placeholder?: string;
  validation?: { minLength?: number; maxLength?: number; message?: string };
  options?: Array<string | { label: string; value: string }>;
  ui?: Record<string, unknown>;
};

export type Section = {
  key: string;
  type: "object" | "array";
  label: string;
  order: number;
  required?: boolean;
  fields: SectionField[];
  ui?: { columns?: number; description?: string };
};

export const headerSection = (withPhoto = false): Section => ({
  key: "header",
  type: "object",
  label: "Header",
  order: 1,
  ui: { columns: 2, description: "Keep contact details clean, simple, and machine-readable." },
  fields: [
    ...(withPhoto
      ? [{ name: "photo", type: "file" as const, label: "Photo", ui: { grid: "col-span-2", accept: "image/*" } }]
      : []),
    { name: "name", type: "text", label: "Full Name", required: true, placeholder: "Habib Rahman", ui: { grid: "col-span-2" } },
    { name: "jobTitle", type: "text", label: "Professional Title", required: true, placeholder: "Frontend Developer", ui: { grid: "col-span-2" } },
    { name: "email", type: "email", label: "Email", required: true, placeholder: "habib@email.com" },
    { name: "phone", type: "tel", label: "Phone", required: true, placeholder: "+880 1XXXXXXXXX" },
    { name: "location", type: "text", label: "Location", required: true, placeholder: "Dhaka, Bangladesh" },
    { name: "linkedin", type: "url", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
    { name: "github", type: "url", label: "GitHub", placeholder: "https://github.com/username" },
    { name: "portfolio", type: "url", label: "Portfolio", placeholder: "https://yourportfolio.com" },
  ],
});

export const summarySection: Section = {
  key: "summary",
  type: "object",
  label: "Professional Summary",
  order: 2,
  ui: { columns: 1, description: "2-4 lines: role, years of experience, core skills, value." },
  fields: [
    {
      name: "bio", type: "textarea", label: "Summary", required: true,
      validation: { minLength: 120, maxLength: 700, message: "Write a focused summary between 120 and 700 characters." },
      placeholder: "Results-driven frontend developer with experience building responsive web applications using React, TypeScript, and modern UI systems.",
      ui: { rows: 5, showCount: true, grid: "col-span-2" },
    },
  ],
};

export const skillsSection: Section = {
  key: "skills",
  type: "array",
  label: "Core Skills",
  order: 3,
  required: true,
  ui: { columns: 2, description: "Group skills by category so ATS can parse keywords cleanly." },
  fields: [
    { name: "category", type: "text", label: "Skill Category", required: true, placeholder: "Frontend, Tools, Testing" },
    { name: "items", type: "textarea", label: "Skills", required: true, validation: { minLength: 10, maxLength: 300 }, placeholder: "React, TypeScript, Next.js, TailwindCSS, Redux, Jest", ui: { rows: 2, showCount: true } },
  ],
};

export const experienceSection: Section = {
  key: "experience",
  type: "array",
  label: "Work Experience",
  order: 4,
  required: true,
  ui: { columns: 2, description: "Reverse chronological order; quantify impact whenever possible." },
  fields: [
    { name: "company", type: "text", label: "Company", required: true, placeholder: "Company Name" },
    { name: "role", type: "text", label: "Role", required: true, placeholder: "Frontend Developer" },
    { name: "location", type: "text", label: "Location", placeholder: "Dhaka, Bangladesh" },
    { name: "startDate", type: "date", label: "Start Date", required: true },
    { name: "endDate", type: "date", label: "End Date", placeholder: "Present" },
    { name: "description", type: "textarea", label: "Description", required: true, validation: { minLength: 80, maxLength: 1200, message: "Add clear achievements and responsibilities." }, placeholder: "Describe responsibilities and measurable impact using bullet points or short lines.", ui: { rows: 5, showCount: true } },
  ],
};

export const projectsSection: Section = {
  key: "projects",
  type: "array",
  label: "Projects",
  order: 5,
  required: false,
  ui: { columns: 2, description: "Highlight only relevant projects with clear impact and technologies." },
  fields: [
    { name: "name", type: "text", label: "Project Name", required: true, placeholder: "Resume Builder App" },
    { name: "link", type: "url", label: "Project Link", placeholder: "https://github.com/username/project" },
    { name: "techStack", type: "text", label: "Tech Stack", required: true, placeholder: "React, TypeScript, TailwindCSS, Node.js" },
    { name: "description", type: "textarea", label: "Description", required: true, validation: { minLength: 60, maxLength: 900 }, placeholder: "Explain what the project does, your role, and the outcome.", ui: { rows: 4, showCount: true } },
  ],
};

export const educationSection: Section = {
  key: "education",
  type: "array",
  label: "Education",
  order: 6,
  required: true,
  ui: { columns: 2, description: "Keep this section concise. Include only strong academic information." },
  fields: [
    { name: "institution", type: "text", label: "Institution", required: true, placeholder: "University / College Name" },
    { name: "degree", type: "text", label: "Degree", required: true, placeholder: "B.Sc. in Computer Science" },
    { name: "field", type: "text", label: "Field of Study", placeholder: "Computer Science and Engineering" },
    { name: "startYear", type: "number", label: "Start Year", required: true, placeholder: "2020" },
    { name: "endYear", type: "number", label: "End Year", placeholder: "2024" },
    { name: "details", type: "textarea", label: "Details", placeholder: "CGPA, honors, coursework, or achievements.", ui: { rows: 3, showCount: true } },
  ],
};

export const certificationsSection: Section = {
  key: "certifications",
  type: "array",
  label: "Certifications",
  order: 7,
  required: false,
  ui: { columns: 2, description: "Optional but valuable when directly relevant to the job target." },
  fields: [
    { name: "name", type: "text", label: "Certification Name", required: true, placeholder: "AWS Certified Developer" },
    { name: "issuer", type: "text", label: "Issuer", required: true, placeholder: "Amazon Web Services" },
    { name: "date", type: "date", label: "Date" },
    { name: "link", type: "url", label: "Credential Link", placeholder: "https://credential-url.com" },
  ],
};

export const languagesSection: Section = {
  key: "languages",
  type: "array",
  label: "Languages",
  order: 8,
  required: false,
  ui: { columns: 2, description: "List languages you speak with proficiency levels." },
  fields: [
    { name: "language", type: "text", label: "Language", required: true, placeholder: "English, Bengali, Spanish" },
    { name: "proficiency", type: "text", label: "Proficiency", required: true, placeholder: "Native / Fluent / Professional / Conversational" },
  ],
};

export const achievementsSection: Section = {
  key: "achievements",
  type: "array",
  label: "Achievements",
  order: 9,
  required: false,
  ui: { columns: 2, description: "Awards, recognitions, or notable achievements." },
  fields: [
    { name: "title", type: "text", label: "Title", required: true, placeholder: "Best Developer Award 2024" },
    { name: "date", type: "date", label: "Date", placeholder: "2024" },
    { name: "description", type: "textarea", label: "Description", placeholder: "Brief description of the achievement and its impact.", ui: { rows: 2, showCount: true } },
  ],
};

export const volunteeringSection: Section = {
  key: "volunteering",
  type: "array",
  label: "Volunteer Experience",
  order: 10,
  required: false,
  ui: { columns: 2, description: "Volunteer work, open source contributions, or community involvement." },
  fields: [
    { name: "organization", type: "text", label: "Organization", required: true, placeholder: "Non-profit / Community Group" },
    { name: "role", type: "text", label: "Role", required: true, placeholder: "Volunteer Developer, Mentor" },
    { name: "startDate", type: "date", label: "Start Date", placeholder: "2022" },
    { name: "endDate", type: "date", label: "End Date", placeholder: "Present" },
    { name: "description", type: "textarea", label: "Description", required: true, placeholder: "Describe your contributions and impact.", ui: { rows: 3, showCount: true } },
  ],
};

// Category-specific extra sections
export const publicationsSection: Section = {
  key: "publications",
  type: "array",
  label: "Publications",
  order: 11,
  required: false,
  ui: { columns: 1, description: "Papers, journal articles, or conference proceedings." },
  fields: [
    { name: "title", type: "text", label: "Title", required: true, placeholder: "Paper title" },
    { name: "venue", type: "text", label: "Journal / Conference", required: true, placeholder: "IEEE Transactions on..." },
    { name: "date", type: "date", label: "Date" },
    { name: "link", type: "url", label: "Link (DOI/URL)", placeholder: "https://doi.org/..." },
  ],
};

export const licensureSection: Section = {
  key: "licensure",
  type: "array",
  label: "Licensure",
  order: 11,
  required: false,
  ui: { columns: 2, description: "Professional licenses required to practice." },
  fields: [
    { name: "licenseName", type: "text", label: "License", required: true, placeholder: "Registered Nurse (RN)" },
    { name: "state", type: "text", label: "State / Region", required: true, placeholder: "California" },
    { name: "licenseNumber", type: "text", label: "License Number" },
    { name: "expiryDate", type: "date", label: "Expiry Date" },
  ],
};

export const baseSections = (opts: { withPhoto?: boolean } = {}): Section[] => [
  headerSection(opts.withPhoto),
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
