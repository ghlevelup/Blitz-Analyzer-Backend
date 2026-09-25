import Handlebars from "handlebars";

let registered = false;

// Shared helpers for resume templates whose design needs more than plain
// field interpolation (split first/last name for two-tone name treatments,
// turn a multi-line textarea into real <li> bullets). Registered once on
// the shared Handlebars singleton so both the live PDF pipeline
// (resume.utils.ts) and the offline seed scripts can compile the same
// template strings identically.
export function registerResumeHelpers() {
  if (registered) return;
  registered = true;

  Handlebars.registerHelper("nameFirst", (fullName: unknown) => {
    const name = typeof fullName === "string" ? fullName.trim() : "";
    return name ? name.split(/\s+/)[0] : "";
  });

  Handlebars.registerHelper("nameRest", (fullName: unknown) => {
    const name = typeof fullName === "string" ? fullName.trim() : "";
    const parts = name.split(/\s+/);
    return parts.length > 1 ? parts.slice(1).join(" ") : "";
  });

  Handlebars.registerHelper("splitLines", (text: unknown) => {
    const str = typeof text === "string" ? text : "";
    return str
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  });
}
