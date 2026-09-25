import { redis } from "../../config/redis";
import { prisma } from "../../lib/prisma";
import { ITemplateDataPayload } from "./template.interface";

//  Create a new template
// Simple insert + clear list cache so fresh data shows next time
const createTemplate = async (templateData: ITemplateDataPayload) => {
  const newTemplate = await prisma.template.create({
    data: templateData,
  });

  // cache clean (important after write)
  await redis.del("templates-list");

  return newTemplate;
};

//  Get all templates
// First try Redis → if not found → DB → then cache it
const allTemplatesList = async () => {
  const redisKey = "templates-list";

  // check cache first (fast 🚀)
  const cached = await redis.get(redisKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // fallback to DB
  const allTemplates = await prisma.template.findMany({
    orderBy: { createdAt: "desc" },
  });

  // store in cache (10 min)
  await redis.set(redisKey, JSON.stringify(allTemplates), "EX", 600);

  return allTemplates;
};

//  Get single template details
// includes resume relation
const getTemplateById = async (id: string) => {
  const redisKey = `template-detail-${id}`;

  // try cache first
  const cached = await redis.get(redisKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // fetch from DB
  const templateDetails = await prisma.template.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!templateDetails) {
    throw new Error("Template not found");
  }

  // cache it for next time
  await redis.set(redisKey, JSON.stringify(templateDetails), "EX", 600);

  return templateDetails;
};

// Track real usage: called when a resume is actually created from this
// template (resume.service.ts initResume), not on a bare page view/click.
// The durable count lives on the row for the admin panel; the Redis sorted
// set is the fast path the "Most Popular" home section reads from, so a
// popularity spike never has to invalidate/rebuild the full templates-list
// cache.
const POPULARITY_ZSET = "template-popularity";
const POPULAR_CACHE_KEY = "popular-templates";

const incrementUsage = async (templateId: string) => {
  await Promise.all([
    prisma.template.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    }),
    redis.zincrby(POPULARITY_ZSET, 1, templateId),
  ]);
  await redis.del(`template-detail-${templateId}`);
  await redis.del(POPULAR_CACHE_KEY);
};

// Get top-N templates by usage. Reads the Redis sorted set first (fast,
// no full-table sort); falls back to a DB usageCount sort if the set is
// empty (fresh deploy / cache flush) so the section still shows something
// meaningful instead of an empty state.
const getPopularTemplates = async (limit = 6) => {
  const cached = await redis.get(POPULAR_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const ranked = await redis.zrevrange(POPULARITY_ZSET, 0, limit - 1);

  let templates;
  if (ranked.length > 0) {
    const rows = await prisma.template.findMany({ where: { id: { in: ranked } } });
    const byId = new Map(rows.map((t) => [t.id, t]));
    templates = ranked.map((id) => byId.get(id)).filter(Boolean);
  }

  if (!templates || templates.length === 0) {
    templates = await prisma.template.findMany({
      orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  }

  await redis.set(POPULAR_CACHE_KEY, JSON.stringify(templates), "EX", 300);
  return templates;
};

//  Update template
// only update what is passed
const updateTemplate = async (
  id: string,
  payload: Partial<ITemplateDataPayload>
) => {
  // check exists first (avoid silent fail)
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Template not found");
  }

  const updatedTemplate = await prisma.template.update({
    where: { id },
    data: payload,
  });

  // clean related cache (very important ⚠️)
  await redis.del("templates-list");
  await redis.del(`template-detail-${id}`);
  await redis.del(POPULAR_CACHE_KEY);

  return updatedTemplate;
};

//  Delete template
// remove from DB + clean cache
const deleteTemplate = async (id: string) => {
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Template not found");
  }

  await prisma.template.delete({
    where: { id },
  });

  // clear caches
  await redis.del("templates-list");
  await redis.del(`template-detail-${id}`);
  await redis.del(POPULAR_CACHE_KEY);
  await redis.zrem(POPULARITY_ZSET, id);

  return { message: "Template deleted successfully" };
};

export const templateServices = {
  createTemplate,
  allTemplatesList,
  getTemplateById,
  incrementUsage,
  getPopularTemplates,
  updateTemplate,
  deleteTemplate,
};