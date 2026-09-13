// Must be imported first, before any other module, so Sentry's
// auto-instrumentation can patch http/express/pg before they load.
// No-op until SENTRY_DSN is set, no account needed for local dev.
import * as Sentry from "@sentry/node";
import { envConfig } from "./config/env";

if (envConfig.SENTRY_DSN) {
  Sentry.init({
    dsn: envConfig.SENTRY_DSN,
    environment: envConfig.NODE_ENV,
    tracesSampleRate: envConfig.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}
