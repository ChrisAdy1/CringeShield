import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema } from "@shared/schema";
import { analyzeVideo } from "./ai";
import { z } from "zod";
import multer from "multer";
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import pgSession from 'connect-pg-simple';
// ESM import for pg
import pg from 'pg';
// Use named import from the default export
const Pool = pg.Pool;
import { db } from './db';
// Import WeeklyPrompt type for route handlers
import { WeeklyChallengeTier } from '@shared/schema';
interface WeeklyPrompt {
  id: string;
  week: number;
  title?: string;
  text: string;
  tier: WeeklyChallengeTier;
  order: number;
}

// Define extended Request interface with file property for TypeScript
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      passwordHash: string;
      createdAt: Date;
    }
  }
}

// Configure multer for file uploads (stored in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Configure session store and passport
const setupAuth = (app: Express) => {
  // Create PostgreSQL session store
  const PgStore = pgSession(session);
  const sessionPool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  // Configure express-session
  app.use(session({
    store: new PgStore({
      pool: sessionPool,
      tableName: 'session', // Will be auto-created
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'cringeShieldSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Initialize passport and session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.validatePassword(email, password);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication
  setupAuth(app);

  // Analyze video recording for feedback
  app.post("/api/feedback/analyze", upload.single('recording'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No recording file uploaded" });
      }
      
      const promptText = req.body.prompt || "";
      
      // Get the file buffer from multer
      const fileBuffer = req.file.buffer;
      
      // Analyze the video
      const feedback = await analyzeVideo(fileBuffer, promptText);
      
      res.json(feedback);
    } catch (error) {
      console.error("Error analyzing video:", error);
      res.status(500).json({ message: "Failed to analyze recording" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Remove confirmPassword before creating user
      const { confirmPassword, ...userData } = validatedData;
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { passwordHash, ...userResponse } = user;
      
      // Log in the user
      req.login(user, (loginErr: Error) => {
        if (loginErr) {
          return res.status(500).json({ message: "Failed to log in" });
        }
        return res.status(201).json(userResponse);
      });
    } catch (error: any) {
      console.error("Error registering user:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      // First validate the request body
      const loginData = loginSchema.parse(req.body);
      
      // Check if the user exists first
      const userExists = await storage.getUserByEmail(loginData.email);
      if (!userExists) {
        return res.status(401).json({ message: "Account not found" });
      }
      
      // Now try to authenticate the user
      passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string }) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        req.login(user, (loginErr: Error) => {
          if (loginErr) {
            return next(loginErr);
          }
          
          // Remove password from response
          const { passwordHash, ...userResponse } = user;
          return res.json(userResponse);
        });
      })(req, res, next);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request data" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/current-user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Remove password from response
    const { passwordHash, ...user } = req.user as Express.User;
    res.json(user);
  });
  
  // Delete account route
  app.delete("/api/auth/account", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      
      // Delete user account
      await storage.deleteUser(userId);
      
      // Logout
      req.logout(() => {
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });
  
  // Save practice session - requires authentication
  app.post("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const session = req.body;
      const userId = (req.user as Express.User).id;
      
      // Validate the session data
      const validatedSession = z.object({
        date: z.string(),
        duration: z.number(),
        cameraOn: z.boolean(),
        userRating: z.string().optional(),
        aiNotes: z.any().optional()
      }).parse(session);
      
      // Convert string date to Date object
      const parsedSession = {
        ...validatedSession,
        date: new Date(validatedSession.date)
      };
      
      const savedSession = await storage.createSession(parsedSession, userId);
      res.status(201).json(savedSession);
    } catch (error: any) {
      console.error("Error saving session:", error);
      res.status(500).json({ message: "Failed to save session" });
    }
  });
  
  // Get user sessions
  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const sessions = await storage.getSessionsByUser(userId);
      res.json(sessions);
    } catch (error: any) {
      console.error("Error getting sessions:", error);
      res.status(500).json({ message: "Failed to get sessions" });
    }
  });
  
  // Challenge progress routes
  
  // Get user's challenge progress
  app.get("/api/challenge-progress", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const progress = await storage.getChallengeProgress(userId);
      res.json(progress);
    } catch (error: any) {
      console.error("Error getting challenge progress:", error);
      res.status(500).json({ message: "Failed to get challenge progress" });
    }
  });
  
  // Complete a challenge day
  app.post("/api/challenge-progress", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { dayNumber } = req.body;
      
      // Validate the day number
      const validDayNumber = z.number()
        .int()
        .min(1)
        .max(30)
        .parse(dayNumber);
      
      const progress = await storage.completeChallengeDay(userId, validDayNumber);
      res.status(201).json(progress);
    } catch (error: any) {
      console.error("Error completing challenge day:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid day number. Must be between 1 and 30.",
          details: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to complete challenge day" });
    }
  });
  
  // Check if a specific day is completed
  app.get("/api/challenge-progress/:dayNumber", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const dayNumber = parseInt(req.params.dayNumber, 10);
      
      // Validate the day number
      if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
        return res.status(400).json({ message: "Invalid day number. Must be between 1 and 30." });
      }
      
      const isCompleted = await storage.isDayChallengeCompleted(userId, dayNumber);
      res.json({ isCompleted });
    } catch (error: any) {
      console.error("Error checking challenge day completion:", error);
      res.status(500).json({ message: "Failed to check challenge day completion" });
    }
  });
  
  // Weekly Challenge routes
  
  // Get user's weekly challenge progress
  app.get("/api/weekly-challenge", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const progress = await storage.getWeeklyProgress(userId);
      
      if (!progress) {
        return res.json({ status: 'not_started' });
      }
      
      res.json({
        status: 'in_progress',
        progress
      });
    } catch (error: any) {
      console.error("Error getting weekly challenge progress:", error);
      res.status(500).json({ message: "Failed to get weekly challenge progress" });
    }
  });
  
  // Start a weekly challenge
  app.post("/api/weekly-challenge", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { tier } = req.body;
      
      // Validate the tier
      const validTier = z.enum(['shy_starter', 'growing_speaker', 'confident_creator'])
        .parse(tier);
      
      const progress = await storage.createWeeklyProgress(userId, validTier);
      res.status(201).json(progress);
    } catch (error: any) {
      console.error("Error starting weekly challenge:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid tier. Must be one of: shy_starter, growing_speaker, confident_creator",
          details: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to start weekly challenge" });
    }
  });
  
  // Mark a weekly challenge prompt as completed
  app.post("/api/weekly-challenge/complete", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { promptId } = req.body;
      
      // Validate promptId
      const validPromptId = z.string().parse(promptId);
      
      const progress = await storage.markWeeklyPromptComplete(userId, validPromptId);
      res.json(progress);
    } catch (error: any) {
      console.error("Error completing weekly challenge prompt:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid prompt ID",
          details: error.errors 
        });
      }
      if (error.message === "User has not started a weekly challenge") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to complete weekly challenge prompt" });
    }
  });

  // Weekly Badge routes
  
  // Get all weekly badges for the user
  app.get("/api/weekly-badges", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const badges = await storage.getWeeklyBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error('Error fetching weekly badges:', error);
      res.status(500).json({ message: "Failed to fetch weekly badges" });
    }
  });
  
  // Check if user has earned a specific weekly badge
  app.get("/api/weekly-badges/check/:tier/:week", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { tier, week } = req.params;
      const weekNumber = parseInt(week, 10);
      
      if (isNaN(weekNumber)) {
        return res.status(400).json({ message: "Invalid week number" });
      }
      
      const hasBadge = await storage.hasWeeklyBadge(userId, tier, weekNumber);
      res.json({ hasBadge });
    } catch (error) {
      console.error('Error checking weekly badge:', error);
      res.status(500).json({ message: "Failed to check weekly badge" });
    }
  });
  
  // Award a new weekly badge to the user
  app.post("/api/weekly-badges/award", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { tier, weekNumber } = req.body;
      
      // Validate input
      const schema = z.object({
        tier: z.string(),
        weekNumber: z.number().int().positive()
      });
      
      const parsed = schema.safeParse({ tier, weekNumber });
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid data format", 
          details: parsed.error.errors 
        });
      }
      
      // Award the badge
      const badge = await storage.awardWeeklyBadge(userId, tier, weekNumber);
      res.status(201).json(badge);
    } catch (error) {
      console.error('Error awarding weekly badge:', error);
      res.status(500).json({ message: "Failed to award weekly badge" });
    }
  });
  
  // Direct endpoint for weekly badges (used by useWeeklyBadges hook)
  app.post("/api/weekly-badges", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { tier, weekNumber } = req.body;
      
      // Validate input
      const schema = z.object({
        tier: z.string(),
        weekNumber: z.number().int().positive()
      });
      
      const parsed = schema.safeParse({ tier, weekNumber });
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid data format", 
          details: parsed.error.errors 
        });
      }
      
      // Check if badge already exists
      const hasBadge = await storage.hasWeeklyBadge(userId, tier, weekNumber);
      if (hasBadge) {
        return res.status(409).json({ message: "Badge already awarded" });
      }
      
      // Award the badge
      const badge = await storage.awardWeeklyBadge(userId, tier, weekNumber);
      res.status(201).json(badge);
    } catch (error) {
      console.error('Error awarding weekly badge:', error);
      res.status(500).json({ message: "Failed to award weekly badge" });
    }
  });
  
  // Combined endpoint to check if all prompts are complete and award badge if eligible
  app.post("/api/weekly-badges/check-and-award", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { tier, weekNumber } = req.body;
      
      // Validate input
      const schema = z.object({
        tier: z.string(),
        weekNumber: z.number().int().positive()
      });
      
      const parsed = schema.safeParse({ tier, weekNumber });
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid data format", 
          details: parsed.error.errors 
        });
      }
      
      // First check if badge already exists
      const hasBadge = await storage.hasWeeklyBadge(userId, tier, weekNumber);
      if (hasBadge) {
        const badge = await storage.getWeeklyBadge(userId, tier, weekNumber);
        return res.status(200).json(badge);
      }
      
      // Get weekly progress to check completed prompts
      const weeklyProgress = await storage.getWeeklyProgress(userId);
      if (!weeklyProgress) {
        return res.status(400).json({ message: "No weekly progress found" });
      }
      
      // Get prompts for this week and tier
      // Directly import the logic for getting weekly prompts
      const { getWeeklyPrompts } = require('../client/src/lib/weeklyPrompts');
      
      const weekPrompts = getWeeklyPrompts(weekNumber, tier);
      
      // Check if all prompts in this week are completed
      const completedPrompts = weeklyProgress.completedPrompts || [];
      const allCompleted = weekPrompts.every((prompt: WeeklyPrompt) => 
        completedPrompts.includes(prompt.id)
      );
      
      if (!allCompleted) {
        return res.status(400).json({ message: "Not all prompts completed for this week" });
      }
      
      // All prompts are completed, award the badge
      const badge = await storage.awardWeeklyBadge(userId, tier, weekNumber);
      res.status(201).json(badge);
    } catch (error) {
      console.error('Error checking and awarding weekly badge:', error);
      res.status(500).json({ message: "Failed to check and award badge" });
    }
  });
  
  // Check if a specific prompt is completed
  app.get("/api/weekly-challenge/prompt/:promptId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const promptId = req.params.promptId;
      
      const isCompleted = await storage.isWeeklyPromptCompleted(userId, promptId);
      res.json({ isCompleted });
    } catch (error: any) {
      console.error("Error checking weekly prompt completion:", error);
      res.status(500).json({ message: "Failed to check weekly prompt completion" });
    }
  });
  
  // Challenge Badges routes
  
  // Get all challenge badges for the user
  app.get("/api/challenge-badges", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const badges = await storage.getChallengeBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error('Error fetching challenge badges:', error);
      res.status(500).json({ message: "Failed to fetch challenge badges" });
    }
  });
  
  // Check if user has earned a specific challenge badge
  app.get("/api/challenge-badges/check/:milestone", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const milestone = parseInt(req.params.milestone, 10);
      
      if (isNaN(milestone) || ![7, 15, 30].includes(milestone)) {
        return res.status(400).json({ message: "Invalid milestone. Must be 7, 15, or 30." });
      }
      
      const hasBadge = await storage.hasChallengeBadge(userId, milestone);
      res.json({ hasBadge });
    } catch (error) {
      console.error('Error checking challenge badge:', error);
      res.status(500).json({ message: "Failed to check challenge badge" });
    }
  });
  
  // Award a challenge badge for completing a milestone
  app.post("/api/challenge-badges/award", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { milestone } = req.body;
      
      // Validate milestone
      const schema = z.object({
        milestone: z.number().int().refine(val => [7, 15, 30].includes(val), {
          message: "Milestone must be 7, 15, or 30"
        })
      });
      
      const parsed = schema.safeParse({ milestone });
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid milestone format", 
          details: parsed.error.errors 
        });
      }
      
      // Check if badge already exists
      const hasBadge = await storage.hasChallengeBadge(userId, milestone);
      if (hasBadge) {
        return res.status(409).json({ message: "Badge already awarded" });
      }
      
      // Award the badge
      const badge = await storage.awardChallengeBadge(userId, milestone);
      res.status(201).json(badge);
    } catch (error) {
      console.error('Error awarding challenge badge:', error);
      res.status(500).json({ message: "Failed to award challenge badge" });
    }
  });
  
  // Combined endpoint to check progress and award badge if milestone reached
  app.post("/api/challenge-badges/check-and-award", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { milestone } = req.body;
      
      // Validate milestone
      const schema = z.object({
        milestone: z.number().int().refine(val => [7, 15, 30].includes(val), {
          message: "Milestone must be 7, 15, or 30"
        })
      });
      
      const parsed = schema.safeParse({ milestone });
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid milestone format", 
          details: parsed.error.errors 
        });
      }
      
      // First check if badge already exists
      const hasBadge = await storage.hasChallengeBadge(userId, milestone);
      if (hasBadge) {
        const badge = await storage.getChallengeBadge(userId, milestone);
        return res.status(200).json(badge);
      }
      
      // Get all completed challenge days
      const progress = await storage.getChallengeProgress(userId);
      const completedDays = progress.length;
      
      // Check if milestone is reached
      if (completedDays < milestone) {
        return res.status(400).json({ 
          message: `Not enough days completed. Need ${milestone} days, but only have ${completedDays}.`,
          completed: completedDays,
          required: milestone
        });
      }
      
      // Milestone reached, award the badge
      const badge = await storage.awardChallengeBadge(userId, milestone);
      res.status(201).json(badge);
    } catch (error) {
      console.error('Error checking and awarding challenge badge:', error);
      res.status(500).json({ message: "Failed to check and award badge" });
    }
  });
  
  // Theme API endpoint - Update theme.json file
  app.post("/api/theme", async (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Validate the theme data
      const themeSchema = z.object({
        variant: z.enum(['professional', 'tint', 'vibrant']),
        primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        appearance: z.enum(['light', 'dark', 'system']),
        radius: z.number().min(0).max(1),
      });
      
      const themeData = themeSchema.parse(req.body);
      
      // Path to theme.json in the project root
      const themePath = path.resolve(process.cwd(), 'theme.json');
      
      // Write the new theme data to the file
      fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2));
      
      res.status(200).json({ message: "Theme updated successfully" });
    } catch (error: any) {
      console.error("Error updating theme:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Invalid theme data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update theme" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
