import { pgTable, text, serial, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
}).extend({
  password: z.string().min(8),
});

// Prompt completions table
export const promptCompletions = pgTable("prompt_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  promptId: integer("prompt_id"),
  cameraOn: boolean("camera_on").default(true),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertPromptCompletionSchema = createInsertSchema(promptCompletions).omit({
  id: true,
  completedAt: true,
});

// Session model for storing practice sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  duration: integer("duration").notNull(), // in seconds
  promptCategory: text("prompt_category").notNull(),
  prompt: text("prompt").notNull(),
  filter: text("filter").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  userRating: text("user_rating"),
  aiNotes: json("ai_notes")
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

// Prompts model for storing prompt templates
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  text: text("text").notNull(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPromptCompletion = z.infer<typeof insertPromptCompletionSchema>;
export type PromptCompletion = typeof promptCompletions.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
