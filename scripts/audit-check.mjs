// Blocking CI security gate: fails on any high/critical vulnerability in
// production dependencies, except advisories explicitly allowlisted below.
// npm audit itself has no allowlist option, this fills that one gap.
//
// Each allowlist entry must have a reason and stay attached to something
// that will eventually resolve it (an issue, a compensating control) so it
// doesn't quietly become permanent.
import { execSync } from "node:child_process";

// Grouped by why they're allowed, not by package, most of these share a reason.
const ALLOWLIST_GROUPS = [
  {
    reason:
      "pdfjs-dist (via pdf-ts): arbitrary JS execution on a malicious PDF, " +
      "no fixed version exists anywhere. Parses every uploaded resume. Needs a " +
      "compensating control (magic-byte validation / sandboxed parsing, Part A " +
      "issue #7), not a version bump. Revisit if pdf-ts ever cuts a new release.",
    ids: ["GHSA-wgrm-67xf-hhpq"],
  },
  {
    reason:
      "TEMPORARY, tracked follow-up (see CLAUDE.md): puppeteer 24->25 is a real " +
      "production dependency (PDF report generation) but the fix is a major " +
      "version bump that needs a live test pass before it ships. Un-allowlist " +
      "once that upgrade lands.",
    ids: [
      "GHSA-jmr9-qjv8-65gv", "GHSA-7pqw-9j4j-h8q3", "GHSA-6v7q-wjvx-w8wg",
      "GHSA-chqc-8p9q-pq6q", "GHSA-rp42-5vxx-qpwr", "GHSA-rpmf-866q-6p89",
      "GHSA-58qx-3vcg-4xpx", "GHSA-96hv-2xvq-fx4p",
    ],
  },
  {
    reason:
      "TEMPORARY, tracked follow-up (see CLAUDE.md): cloudinary v1->v2 is a real " +
      "production dependency (resume/avatar/invoice storage) with breaking API " +
      "changes across the whole app. Needs a dedicated, tested migration. " +
      "Un-allowlist once that upgrade lands.",
    ids: ["GHSA-g4mf-96x5-5m2c"],
  },
  {
    reason:
      "TEMPORARY, tracked follow-up (see CLAUDE.md): nodemailer v7->v10 is a real " +
      "production dependency (all transactional email) with a major version jump. " +
      "Needs a live send-test before it ships. Un-allowlist once that upgrade lands.",
    ids: [
      "GHSA-c7w3-x93f-qmm8", "GHSA-vvjj-xcjg-gr5g", "GHSA-268h-hp4c-crq3",
      "GHSA-wqvq-jvpq-h66f", "GHSA-r7g4-qg5f-qqm2", "GHSA-p6gq-j5cr-w38f",
      "GHSA-8m3c-c648-2xjj", "GHSA-wmmp-3585-3rmp", "GHSA-2x7j-588g-ccc2",
      "GHSA-cc9r-2j5m-2m83",
    ],
  },
  {
    reason:
      "prisma (devDependency) bundles a local-dev-database feature (@prisma/dev) " +
      "built on hono/effect/deepmerge-ts/lodash. Only runs under `prisma dev` on " +
      "a developer machine, never in the deployed server. mysql2 specifically is " +
      "bundled by Prisma's multi-engine client but unreachable here, this app " +
      "only ever connects via a postgres:// DATABASE_URL.",
    ids: [
      "GHSA-wc8c-qw6v-h7f6", "GHSA-92pp-h63x-v22m", "GHSA-frvp-7c67-39w9",
      "GHSA-ggr8-5vv4-36mx", "GHSA-38f7-945m-qr2g", "GHSA-r5fr-rjxr-66jc",
      "GHSA-f23m-r3pf-42rh", "GHSA-xxjr-mmjv-4gpg", "GHSA-9r54-q6cx-xmh5",
      "GHSA-6wqw-2p9w-4vw4", "GHSA-r354-f388-2fhh", "GHSA-w332-q679-j88p",
      "GHSA-gq3j-xvxp-8hrf", "GHSA-5pq2-9x2x-5p6w", "GHSA-p6xx-57qc-3wxr",
      "GHSA-q5qw-h33p-qvwr", "GHSA-v8w9-8mx6-g223", "GHSA-26pp-8wgv-hjvm",
      "GHSA-r5rp-j6wh-rvv4", "GHSA-xf4j-xp2r-rqqx", "GHSA-wmmm-f939-6g9c",
      "GHSA-xpcf-pg52-r92g", "GHSA-qp7p-654g-cw7p", "GHSA-hm8q-7f3q-5f36",
      "GHSA-p77w-8qqv-26rm", "GHSA-9vqf-7f2p-gf9v", "GHSA-69xw-7hcm-h432",
      "GHSA-xrhx-7g5j-rcj5", "GHSA-3hrh-pfw6-9m5x", "GHSA-f577-qrjj-4474",
      "GHSA-2gcr-mfcq-wcc3", "GHSA-458j-xx4x-4375", "GHSA-rv63-4mwf-qqc2",
      "GHSA-wgpf-jwqj-8h8p", "GHSA-88fw-hqm2-52qc", "GHSA-wwfh-h76j-fc44",
      "GHSA-j6c9-x7qj-28xf", "GHSA-xgm2-5f3f-mvvc", "GHSA-w62v-xxxg-mg59",
      "GHSA-8j4g-w8fx-2239", "GHSA-f23p-vx2j-j53r", "GHSA-79qm-7rj5-m7r9",
      "GHSA-gqvv-2mrq-wpjv", "GHSA-g6gw-c38x-mqfc", "GHSA-crvj-82cr-hjcx",
      "GHSA-5qjj-4xww-7phc", "GHSA-3f6p-5ww8-9rcr", "GHSA-rgwj-5xj2-c3m3",
    ],
  },
  {
    reason:
      "tsup/vitest (devDependencies) bundler toolchain (webpack/vite/postcss and " +
      "their own transitives). Only runs during `npm run build` or the local " +
      "test watcher, never shipped in dist/ or executed by the running server.",
    ids: [
      "GHSA-f886-m6hf-6m8v", "GHSA-jxxr-4gwj-5jf2", "GHSA-3jxr-9vmj-r5cp",
      "GHSA-mh99-v99m-4gvg", "GHSA-rgw5-rvv9-x895", "GHSA-grv7-fg5c-xmjg",
      "GHSA-952p-6rrq-rcjv", "GHSA-h67p-54hq-rp68", "GHSA-52cp-r559-cp3m",
      "GHSA-5p4m-2wfm-xmqj", "GHSA-2883-xcg3-v3hh", "GHSA-j3q9-mxjg-w52f",
      "GHSA-27v5-c462-wpq7", "GHSA-3v7f-55p6-f55p", "GHSA-c2c7-rcm5-vvqj",
      "GHSA-qx2v-qp2m-jg93", "GHSA-6g55-p6wh-862q", "GHSA-fxqj-rqcc-2cmp",
      "GHSA-r28c-9q8g-f849", "GHSA-5c6j-r48x-rmvq", "GHSA-848j-6mx2-7j84",
      "GHSA-4w7w-66w2-5vf9", "GHSA-v2wj-q39q-566r", "GHSA-p9ff-h696-f583",
      "GHSA-v6wh-96g9-6wx3", "GHSA-fx2h-pf6j-xcff",
    ],
  },
  {
    reason:
      "nanoid: reachable via @scalar/express-api-reference (API docs UI, only " +
      "generates internal doc-page ids, not security tokens) and tsup. The fix " +
      "is a major version with known ESM/CJS interop issues in this project's " +
      "setup, not safe to force via an override without testing @scalar's UI.",
    ids: ["GHSA-28wg-ghj8-5hjv", "GHSA-2v37-7h3g-55p8", "GHSA-xwg4-73v4-xw9w"],
  },
];

const ALLOWLIST = Object.fromEntries(
  ALLOWLIST_GROUPS.flatMap((g) => g.ids.map((id) => [id, g.reason]))
);

function runAudit() {
  try {
    const out = execSync("npm audit --omit=dev --json", { encoding: "utf8" });
    return JSON.parse(out);
  } catch (err) {
    // npm audit exits 1 when vulnerabilities are found, stdout still has the report
    return JSON.parse(err.stdout);
  }
}

// Resolves every advisory GHSA id reachable from a vulnerability entry,
// following string references (transitive deps) recursively.
function collectAdvisories(vulns, name, seen = new Set()) {
  if (seen.has(name)) return [];
  seen.add(name);

  const entry = vulns[name];
  if (!entry) return [];

  const ids = [];
  for (const via of entry.via) {
    if (typeof via === "string") {
      ids.push(...collectAdvisories(vulns, via, seen));
    } else if (via.url) {
      const match = via.url.match(/advisories\/(GHSA-[\w-]+)/);
      ids.push(match ? match[1] : via.url);
    }
  }
  return ids;
}

const data = runAudit();
const vulns = data.vulnerabilities ?? {};

const failures = [];

for (const [name, entry] of Object.entries(vulns)) {
  if (entry.severity !== "high" && entry.severity !== "critical") continue;

  const advisories = collectAdvisories(vulns, name);
  const unresolved = advisories.filter((id) => !ALLOWLIST[id]);

  if (unresolved.length > 0) {
    failures.push({ name, severity: entry.severity, advisories: unresolved });
  }
}

if (failures.length > 0) {
  console.error(`\nBlocked: ${failures.length} unallowlisted high/critical vulnerabilities\n`);
  for (const f of failures) {
    console.error(`  ${f.severity.toUpperCase().padEnd(9)} ${f.name}`);
    for (const id of f.advisories) console.error(`    https://github.com/advisories/${id}`);
  }
  console.error("\nRun `npm audit --omit=dev` for the full report.\n");
  process.exit(1);
}

const allowlisted = Object.keys(ALLOWLIST).filter((id) =>
  Object.values(vulns).some((v) => collectAdvisories(vulns, v.name).includes(id))
);

console.log("Audit passed: no unallowlisted high/critical vulnerabilities.");
if (allowlisted.length > 0) {
  console.log(`Allowlisted (still present, documented): ${allowlisted.join(", ")}`);
}
