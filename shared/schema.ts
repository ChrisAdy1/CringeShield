import { pgTable, text, serial, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isAdmin: boolean("is_admin").notNull().default(false),
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
  confidenceScore: integer("confidence_score"),
  filter: text("filter"),
  userRating: text("user_rating"),
  promptCategory: text("prompt_category"),
  prompt: text("prompt"),
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

// Challenge progress model
export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dayNumber: integer("day_number").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertChallengeProgressSchema = createInsertSchema(challengeProgress).omit({
  id: true,
  completedAt: true,
});

export type InsertChallengeProgress = z.infer<typeof insertChallengeProgressSchema>;
export type ChallengeProgress = typeof challengeProgress.$inferSelect;

// Weekly Challenge System
export const weeklyChallengeTiers = ['shy_starter', 'growing_speaker', 'confident_creator'] as const;
export type WeeklyChallengeTier = typeof weeklyChallengeTiers[number];

export const weeklyProgress = pgTable("weekly_challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  selectedTier: text("selected_tier").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  completedPrompts: text("completed_prompts").array().default([]),
});

export const insertWeeklyProgressSchema = createInsertSchema(weeklyProgress).omit({
  id: true,
});

export type InsertWeeklyProgress = z.infer<typeof insertWeeklyProgressSchema>;
export type WeeklyProgress = typeof weeklyProgress.$inferSelect;

// Weekly badges for tracking completion rewards
export const weeklyBadges = pgTable("weekly_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tier: text("tier").notNull(),
  weekNumber: integer("week_number").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const insertWeeklyBadgeSchema = createInsertSchema(weeklyBadges).omit({
  id: true,
  earnedAt: true,
});

export type InsertWeeklyBadge = z.infer<typeof insertWeeklyBadgeSchema>;
export type WeeklyBadge = typeof weeklyBadges.$inferSelect;

// Challenge milestone badges
export const challengeBadges = pgTable("challenge_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  milestone: integer("milestone").notNull(), // 7, 15, or 30 days
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const insertChallengeBadgeSchema = createInsertSchema(challengeBadges).omit({
  id: true,
  earnedAt: true,
});

export type InsertChallengeBadge = z.infer<typeof insertChallengeBadgeSchema>;
export type ChallengeBadge = typeof challengeBadges.$inferSelect;

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
