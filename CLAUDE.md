# CLAUDE.md — Blitz Analyzer

## What this is
AI-powered resume/ATS analyzer SaaS. Two repos: `Blitz-Analyzer` (frontend) and
`Blitz-Analyzer-Backend` (backend). Currently converting from working prototype
to production-grade SaaS — see `PRODUCTION_PLAN.md` for the full hardening plan.

## Stack
- **Frontend:** Next.js 16, React 19, Tailwind, shadcn/ui, TanStack Query/Form,
  Zod, better-auth client
- **Backend:** Express 5, Prisma 7 (Postgres), Redis, BullMQ, better-auth,
  Groq SDK (`llama-3.3-70b-versatile`), Stripe, Cloudinary
- **Package managers:** bun (frontend dev), npm (backend)

## Conventions
- Backend modules follow `module/module.controller.ts` → `.service.ts` →
  `.route.ts` → `.validation.ts` pattern under `src/modules/`
- All responses go through `sendSuccess`/`sendError` (`utils/apiResponse.ts`)
- Async route handlers wrapped in `asyncHandler`
- Env vars are Zod-validated in `config/env.ts` — never bypass this
- Auth: better-auth session cookie is the source of truth (frontend custom
  JWT refresh system is being deprecated — see PRODUCTION_PLAN.md Phase 2)
- Credits: `CreditWallet` / `CreditTransaction` models exist; deduction logic
  is being wired in per PRODUCTION_PLAN.md Phase 1 — don't assume it's already
  enforced on AI endpoints unless that phase is marked done below

## Current status
- [x] Phase 1 — Critical fixes (credit deduction, IDOR, security middleware)
- [x] Phase 2 — Auth consolidation (drop custom JWT, better-auth only)
- [x] Phase 3 — Async AI processing via BullMQ
- [ ] Phase 4 — Observability & CI (in progress)
- [ ] Phase 5 — New features (post-hardening, separate plan)

## Tracked follow-ups (not blocking, but don't lose these)
- **puppeteer 24->25, cloudinary v1->v2, nodemailer v7->v10**: all have
  real high/critical CVEs with fixes only available as major version bumps.
  Currently allowlisted in `scripts/audit-check.mjs` as temporary. Each
  needs a dedicated upgrade + live test pass (PDF report generation, file
  uploads, transactional email respectively) before un-allowlisting.
- **pdf-ts / pdfjs-dist**: "arbitrary JS execution on a malicious PDF",
  no fixed version exists anywhere. Parses every uploaded resume. Needs
  the compensating control from Part A issue #7 (magic-byte validation,
  not just mimetype) since it can't be fixed by upgrading.
- **`nodemon` in `dependencies`**: appears unused by any script (`dev`
  uses `tsx watch`, `start` uses `node dist/server.js`). Worth confirming
  nothing else needs it, then removing, both as dead weight and because
  it's one of the paths pulling in a vulnerable `chokidar`.
- **Frontend (`Blitz-Analyzer` repo) also had real findings**: Next.js
  16.1.6 had two unauthenticated RCE CVEs plus an SSRF/DoS/middleware-bypass,
  fixed by bumping to 16.3.4 (already applied, needs a manual click-through
  before deploying, same as the backend's better-auth bump). axios,
  handlebars, postcss, form-data were also bumped, all safe in-range patches.
  See `scripts/audit-check.sh` in that repo for the remaining allowlisted
  (build-tool-only) findings.

*(Update the checkboxes above as phases complete — this is the fastest way
for a new session to know where things stand without re-reading everything.)*

## Working rules for this project
- This is a real production SaaS handling payments and user PII (resumes) —
  not a prototype. Treat security/data-handling issues as non-negotiable,
  not "nice to have."
- Always propose a plan before writing code for anything touching auth,
  payments, or credit logic. Wait for explicit go-ahead.
- Don't touch files outside the current phase's stated scope.
- Full architecture/security rationale lives in `PRODUCTION_PLAN.md` —
  read the relevant phase section from it when starting that phase, not
  the whole file every time.
