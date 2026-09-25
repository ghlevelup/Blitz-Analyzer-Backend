import { envConfig } from "./env";

export const corsConfig = {
  origin: envConfig.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-csrf-token'],
  credentials: true,
};
