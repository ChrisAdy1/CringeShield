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
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(20, { message: 'Password must not exceed 20 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one symbol' }),
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
  cameraOn: boolean("camera_on").default(true),
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
  confirmPassword: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(20, { message: 'Password must not exceed 20 characters' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
