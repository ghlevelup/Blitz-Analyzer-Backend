# Auth Hardening Plan — Scalable & Secure (keep better-auth)

Status: **implemented and verified** (2026-09-21). All 6 sections done. Two
deliberate, documented gaps: `/register` and `/reset-password` are not yet
double-submit-CSRF-protected (both currently run through
`frontend/src/lib/serverApi.ts` / `useApiMutation`'s generic relay, which
doesn't plumb custom headers the way `auth.services.ts`'s axios calls do -
extending it touches shared infra with callers outside auth, left as a
follow-up rather than guessed at). `/reset-password` already has strong
inherent CSRF resistance via its emailed one-time token regardless.

## Follow-up round (same day): SMTP + Redis-backed rate limiting

- **SMTP was broken by two separate bugs**: `utils/mailTransporter.ts` had
  the Gmail app password *hardcoded in source* (`pass: "yhqthhvqbsknziis"`)
  instead of reading `envConfig.GMAIL_APP_PASSWORD` - so fixing `.env` alone
  wouldn't have helped. Fixed to read from env, and confirmed the old
  hardcoded password is present in git history (`git log -p`) - it should be
  treated as compromised and revoked/regenerated in Google Account settings
  regardless of the app-level fix. `.env`'s `GMAIL_APP_PASSWORD` also had an
  unclosed quote, separately broken. Both fixed; verified live via
  `transporter.verify()` logging "Server is ready to send emails".
- **Rate limiters were per-process, not shared**: `apiLimiter`, `aiLimiter`,
  `authLimiter` all used `express-rate-limit`'s default in-memory store.
  Fine for one instance; once this runs as 2+ pods behind a load balancer
  (the whole point of the stateless session-in-Postgres design), each pod
  gets its own independent counter and the effective limit multiplies by
  instance count. Added `rate-limit-redis` backed by the existing `redis`
  (ioredis) singleton, prefixed per limiter (`rl:api:`, `rl:ai:`, `rl:auth:`).
  Verified live: triggered the limiter, confirmed the hit counter is a real
  key in Redis (not just working coincidentally), confirmed 429 fires at the
  configured threshold.

Full Playwright suite re-verified green after both fixes.

## Context

The goal is to get authentication ready for a production SaaS with potentially
millions of users — not a rewrite, a hardening pass. We considered ripping
out better-auth for a hand-rolled JWT system; after auditing the code we
agreed to **keep better-auth**: it already correctly handles password
hashing, session storage in Postgres (which is what makes the API tier
stateless and horizontally scalable — see
`blitz-analyzer-production-readiness-plan.md` Part B), secure cookie signing,
and password-reset tokens. Every bug found in the auth flow this session was
in the **custom code wrapping better-auth**, not in better-auth itself, and a
hand-rolled JWT system would have to reimplement all of that (with
revocation, rotation, storage) from scratch — more attack surface, not less.

Already fixed in a prior session (context, not part of this plan):
signed-cookie extraction in `auth.service.ts::loginUser`, the doubled-`/api`
URL bug in `frontend/src/proxy.ts`, the broken React Query retry predicate in
`UserContext.tsx`, missing try/catch in `getMe()`, the `FormPassword` label
wiring, and the missing `react-is` dependency. A Playwright E2E suite exists
at `frontend/e2e/login.spec.ts`.

This plan covers what's left to make auth production-grade: one **critical
vulnerability**, a few real correctness bugs, and the hardening checklist
items `blitz-analyzer-production-readiness-plan.md` (Part A/C) never got
applied to auth specifically.

---

## 1. Critical: fix the Google OAuth account-takeover hole

**Finding:** `auth.service.ts:582,596,616` assigns every Google-signup user
the exact same hardcoded password (`"Googledsffsdafs#@dfw254235423"`). The
custom `/api/v1/auth/login` wrapper blocks password login for
`googleId`-having users (`auth.service.ts:150-151`), but that guard doesn't
exist on better-auth's own native endpoint (`app.use("/api/auth", ...)` in
`app.ts:24`). Anyone who learns this string can log into **any** Google
user's account by POSTing to `/api/auth/sign-in/email` directly.

**Finding (bonus):** there are two competing Google OAuth implementations in
the codebase. `googleLogin`/`googleLoginSuccess` (`auth.controller.ts:175-210`)
already use better-auth's *native*, correctly-configured social-provider flow
(`lib/auth.ts` already has `socialProviders.google` and
`redirectURLs.signIn` pointing at `/google/success`) — but this pair is
**never mounted as a route**. The route that's actually live,
`/google` → `googleRedirect` / `/google/callback` → `googleCallback`
(`auth.route.ts:72-73`), is the hand-rolled, vulnerable one
(`googleOAuthCallback`, `exchangeCodeForProfile`, the fake-password hack).

**Fix:**
- In `auth.route.ts`, replace the two vulnerable route bindings with the
  already-correct controllers: `GET /google` → `googleLogin`,
  `GET /google/success` → `googleLoginSuccess` (matches what `lib/auth.ts`
  already expects).
- Delete the dead/vulnerable code: `googleRedirect`, `googleCallback`,
  `handleOAuthError` controllers, `googleOAuthCallback` in `auth.service.ts`,
  and `utils/google.ts` (`getGoogleAuthUrl`, `exchangeCodeForProfile`) if
  nothing else references them.
- Update `frontend/src/components/modules/auth/SocialLogin.tsx` only if the
  response shape from the new `/google` route differs (it currently expects
  `{ url }` from a JSON response — the native flow currently returns a
  rendered redirect view (`res.render("googleRedirect", ...)`), so this needs
  a quick compatibility check/adjustment during implementation, not a
  redesign).
- This directly resolves the "add Google OAuth" follow-up — it's already
  built correctly, just needs to be wired in instead of the broken
  duplicate.

---

## 2. Fix plaintext OTP storage + add brute-force lockout

**Finding:** `sendOtp()` (`auth.service.ts:462-511`) computes `hashOTP(otp)`
via bcrypt but then stores the **raw plaintext OTP** in
`Verification.value` (`auth.service.ts:489`) — the hash is computed and
discarded. It also `console.log`s the OTP and hash (`auth.service.ts:476`),
leaking it into logs. `verifyEmail()` then does a plaintext `!==` comparison
(`auth.service.ts:339`) with no cap on failed attempts — a 6-digit OTP only
has 1M combinations, so without a lockout it's brute-forceable.

**Fix:**
- Store `tokenHash` (already computed) in place of the raw `otp` in
  `Verification.value`; compare with `bcrypt.compare` in `verifyEmail()`.
- Remove the `console.log(isMatch, otp, tokenHash)` at `auth.service.ts:476`.
- Add a failed-attempt counter (see schema change below) and lock out /
  invalidate the OTP after 5 failed verify attempts, forcing a fresh
  `resend-otp`.
- Fix the user-enumeration leak in `resendOtp()` (`auth.service.ts:517`):
  it throws a distinct `"User not found"` 404, unlike
  `requestResetPassword` which (via better-auth) returns a generic success
  regardless. Make `resendOtp` respond identically whether or not the email
  exists (still only actually send mail if the user exists).

---

## 3. Rate limiting on auth abuse vectors

**Finding:** Only `/login` has abuse protection (Redis counter, 5/60s per
email, `auth.service.ts:136-141`) plus the blanket global `apiLimiter`
(100/15min/IP, `middleware/index.ts:19-25`). `/register`,
`/request-reset-password`, and `/resend-otp` have no per-route limiter — easy
targets for registration spam, reset-email bombing, and OTP-bombing (the
resend cooldown at `auth.service.ts:525` is only a 30s per-email cooldown, no
IP-level cap).

**Fix:** add a new `authLimiter` in `middleware/index.ts` (same
`express-rate-limit` pattern as `apiLimiter`/`aiLimiter`, e.g. 10 req/15min,
keyed by IP since these routes run pre-auth), applied to `/register`,
`/request-reset-password`, `/resend-otp`, and `/login` (as defense-in-depth
alongside the existing Redis counter).

---

## 4. CSRF protection

**Finding:** No CSRF protection anywhere (Part A issue #6, never actioned),
despite cross-origin cookie auth with `sameSite: "none"` in production
(`lib/auth.ts`). This is exactly the setup CSRF protection exists for.

**Fix:** add double-submit-cookie CSRF protection using the `csrf-csrf`
package (actively maintained, Express-5-compatible; `csurf` is deprecated) on
all state-changing auth routes (`/login`, `/register`, `/change-password`,
`/reset-password`, `/update-profile`, `/change-avatar`, `/logout`). Frontend
`axios-client.ts` needs to read the CSRF token (from an initial GET or a
dedicated `/csrf-token` endpoint) and attach it as a header on mutating
requests.

---

## 5. Cookie / CORS / secrets hygiene

- `lib/auth.ts`: `useSecureCookies: isProduction` combined with
  `sameSite: isProduction ? "none" : "lax"` (Part A issue #5) — confirm this
  is actually consistent in prod (looks correct as written, but verify
  `secure` is `true` everywhere `sameSite: "none"` is used, including
  `tokenUtils.setBetterAuthSessionCookie` in `utils/token.ts`).
- `config/cors.ts`: origins are hardcoded (`http://localhost:3000`,
  `https://blitz-analyzer.vercel.app`) — move to `envConfig` (Part A issue #9)
  so staging/prod environments don't require a code change.
- `config/env.ts:11`: `JWT_SECRET` is Zod-validated but **entirely unused**
  (grepped — no `jsonwebtoken`/`jwt.sign`/`jwt.verify` calls anywhere in
  `backend/src`, leftover from the pre-Phase-2 custom JWT system). Remove it
  from `env.ts` and `.env`.
- Confirm `BETTER_AUTH_SECRET` / `GOOGLE_CLIENT_SECRET` are distinct per
  environment (dev/staging/prod) — Part C checklist item, verify only, no
  code change (secrets live outside the repo).

---

## 6. Schema change

Add a failed-attempt counter to support the OTP lockout in Section 2:

```prisma
model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String
  attempts   Int      @default(0)   // NEW — failed verify attempts, lock out at 5
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  type       VerificationType
  @@index([identifier])
  @@map("verification")
}
```

File: `backend/prisma/schema/auth.prisma`. Requires a migration
(`prisma migrate dev` locally, `prisma migrate deploy` per the existing
`migrate` script in `package.json`). No other schema changes are needed —
`Session` already captures `ipAddress`/`userAgent` per session and supports
multiple concurrent sessions per user natively; `User`/`Account` already
match better-auth's expected shape.

---

## Explicitly out of scope for this phase

- Infra-level scaling (DB pooling, Redis, stateless API tier) — already in
  place per `blitz-analyzer-production-readiness-plan.md` Part B, no auth
  changes needed there.
- New session-management UI (view/revoke individual active sessions) — the
  data model already supports it (`Session[]`), but it's a new feature, not
  a hardening fix; candidate for a later phase if wanted.
- Any change to the credit/payment system.

---

## Verification plan (once implemented)

1. **Automated**: extend `frontend/e2e/login.spec.ts` (Playwright, already
   set up and passing against the demo account) with new cases: rate-limit
   triggers a 429 after N rapid attempts on `/register` and
   `/request-reset-password`; a request without a CSRF token on a mutating
   route is rejected; Google login round-trip reaches `/dashboard` via the
   newly-wired native route.
2. **Manual backend checks**: `curl` the OTP verify endpoint with a wrong
   code 6 times, confirm lockout; confirm the old hardcoded Google password
   no longer authenticates against `/api/auth/sign-in/email` for a
   Google-created user; confirm `/verify-email`'s stored `Verification.value`
   is a bcrypt hash, not plaintext, by inspecting the DB row after a
   `resend-otp` call.
3. **Typecheck**: `npm run typecheck` in `backend/` and `frontend/` after
   each file change.
4. Re-run the full `npx playwright test --workers=1` suite in `frontend/`
   before considering this phase done.
