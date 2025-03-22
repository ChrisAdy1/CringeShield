import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
