import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import hpp from "hpp";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { corsConfig } from "../config/cors";
import { httpLogger } from "../utils/logger";
import { metrics } from "../utils/metrics";
import { redis } from "../config/redis";

// Feeds the /metrics endpoint's aggregate request latency.
const requestTiming = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();
  res.on("finish", () => metrics.recordHttpRequest(Date.now() - startedAt));
  next();
};

// Shared across all limiters below: without this, each rate limiter keeps
// its hit counts in that process's own memory. The moment this runs as more
// than one instance behind a load balancer - the whole point of the
// stateless, session-in-Postgres architecture - each instance gets its own
// independent counter and the effective limit silently multiplies by
// instance count. Redis makes the limit actually mean what it says at scale.
const redisStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) =>
      (redis.call as (...args: string[]) => Promise<any>)(...args),
    prefix,
  });

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  store: redisStore("rl:api:"),
});

// Stricter limiter for AI-consuming routes, keyed by authenticated user
// instead of IP so one user can't exhaust the Groq quota for everyone.
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // ipKeyGenerator collapses IPv6 addresses to their /56 subnet; using req.ip
  // raw lets a single IPv6 user rotate addresses and bypass the limit.
  keyGenerator: (req: Request, res: Response) =>
    res.locals?.auth?.userId ?? ipKeyGenerator(req.ip ?? ""),
  store: redisStore("rl:ai:"),
});

// Pre-auth abuse limiter (register/login/reset-request/resend-otp) - these
// run before any userId exists, so keyed by IP. Defense-in-depth alongside
// the per-email Redis counters already in auth.service.ts (registration
// spam and reset/OTP bombing aren't scoped to a single email the way login
// brute-forcing is).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:auth:"),
});

export const applyMiddleware = (app: Express): void => {
  app.use(cors(corsConfig));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    })
  );
  app.use(hpp());
  app.use(apiLimiter);
  app.use(httpLogger);
  app.use(requestTiming);
  app.use(compression());
  app.use(cookieParser());

  app.use(express.json({
  verify: (req:any, res, buf) => {
   if (req.originalUrl.includes('/stripe/webhook')) {
      req.rawBody = buf;
    }
  }
}));
};
