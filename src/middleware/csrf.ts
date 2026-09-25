import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { doubleCsrf } from "csrf-csrf";
import { envConfig } from "../config/env";

const isProduction = envConfig.NODE_ENV === "production";

// csrf-csrf's double-submit tokens are bound to a "session identifier" so a
// leaked token can't be replayed against a different session. We're a
// stateless API with routes that run both authenticated (logout,
// change-password) and pre-authentication (login, register) - there's no
// better-auth session cookie yet on the pre-auth routes, so we issue a
// lightweight anonymous id cookie as the identifier there instead.
const CSRF_SESSION_COOKIE = "csrf_session_id";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  path: "/",
};

// Runs before both the token-issuing route and the protected routes so the
// same identifier is present (and readable by getSessionIdentifier below)
// on the request that generates a token and the later one that validates
// it. Mutates req.cookies in place since res.cookie() only affects the
// outgoing response, not the cookies already parsed for this request.
export const ensureCsrfSessionId = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies?.[CSRF_SESSION_COOKIE]) {
    const id = randomUUID();
    res.cookie(CSRF_SESSION_COOKIE, id, cookieOptions);
    req.cookies[CSRF_SESSION_COOKIE] = id;
  }
  next();
};

const getSessionIdentifier = (req: Request): string =>
  req.cookies?.["better-auth.session_token"] || req.cookies?.[CSRF_SESSION_COOKIE] || "";

export const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => envConfig.CSRF_SECRET,
  getSessionIdentifier,
  cookieName: isProduction ? "__Host-csrf" : "csrf",
  cookieOptions,
  getCsrfTokenFromRequest: (req: Request) => req.headers["x-csrf-token"] as string,
});
