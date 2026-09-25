import { z } from "zod";

// Create Template Schema
export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"), 
  slug: z.string().min(1, "Slug is required"), 

  descriptions: z.any().optional(), // flexible JSON, e.g., multiple description blocks
  previewUrl: z.string().url("Preview URL must be a valid URL"),

  price: z.number().int().nonnegative("Price cannot be negative"),
  isPremium: z.boolean().optional(),
  category: z.string().optional(),

  htmlLayout: z.string().min(1, "HTML layout is required"),
  sections: z.any().optional(), // flexible JSON, sections config
});

// Update Template Schema
// Partial version: all fields optional
export const updateTemplateSchema = createTemplateSchema.partial();

// Template ID Schema
// Used for params validation
export const templateIdSchema = z.object({
  id: z.string().uuid({ message: "Template ID must be a valid UUID" }),
});