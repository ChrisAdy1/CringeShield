import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptSchema, loginSchema, registerSchema } from "@shared/schema";
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
  
  // Initialize with some prompts
  await initializePrompts();

  // Get all prompts
  app.get("/api/prompts", async (req, res) => {
    try {
      const prompts = await storage.getPrompts();
      res.json(prompts);
    } catch (error) {
      console.error("Error getting prompts:", error);
      res.status(500).json({ message: "Failed to get prompts" });
    }
  });

  // Get a prompt by category
  app.get("/api/prompts/generate", async (req, res) => {
    try {
      const category = req.query.category as string || 'random';
      const prompt = await storage.getRandomPrompt(category);
      
      if (!prompt) {
        return res.status(404).json({ message: "No prompts found for this category" });
      }
      
      res.json(prompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
      res.status(500).json({ message: "Failed to generate prompt" });
    }
  });

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
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid login" });
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
        promptCategory: z.string(),
        prompt: z.string(),
        filter: z.string(),
        confidenceScore: z.number(),
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
  
  // Get user prompt completions
  app.get("/api/prompt-completions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const completions = await storage.getPromptCompletions(userId);
      res.json(completions);
    } catch (error: any) {
      console.error("Error getting prompt completions:", error);
      res.status(500).json({ message: "Failed to get prompt completions" });
    }
  });
  
  // Save prompt completion
  app.post("/api/prompt-completions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const completion = {
        ...req.body,
        userId
      };
      
      const savedCompletion = await storage.createPromptCompletion(completion);
      res.status(201).json(savedCompletion);
    } catch (error: any) {
      console.error("Error saving prompt completion:", error);
      res.status(500).json({ message: "Failed to save prompt completion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize the database with some sample prompts
async function initializePrompts() {
  const samplePrompts = [
    { category: "practice", text: "Say Hello - Introduce yourself with your name, where you're from, and one fun fact." },
    { category: "practice", text: "What's Around You? - Describe three things in the room you're in, and why they catch your eye." },
    { category: "practice", text: "Today Was… - Talk about how your day has been so far—nothing is too small." },
    { category: "practice", text: "Something You Love - Share something you really enjoy—could be a show, a hobby, or a snack." },
    { category: "practice", text: "Explain It Like a Friend - Pick something you know well and explain it like you're talking to a friend." },
    { category: "practice", text: "Camera Shy Confession - Talk honestly about how you feel being on camera. No filter." },
    { category: "practice", text: "Teach Me a Trick - Share a tip, shortcut, or life hack that makes your life easier." },
    { category: "practice", text: "Tell a Tiny Story - Recall a short, funny, or awkward moment from your life." },
    { category: "practice", text: "What I'd Tell My Younger Self - Reflect on one lesson you'd give to yourself a few years ago." },
    { category: "practice", text: "Describe a Place You Love - Talk about a place that makes you feel safe, inspired, or at peace." },
    { category: "practice", text: "Talk Like a YouTuber - Pretend you're starting a channel. Give an energetic intro and tell us what it's about." },
    { category: "practice", text: "React to This Moment - Look around or think about how you feel right now—and just talk about it." },
    { category: "practice", text: "Pet, Plant, or Playlist - Tell us about something that keeps you grounded." },
    { category: "practice", text: "What's on Your Mind? - Free talk for 60 seconds. No script. No pressure." },
    { category: "practice", text: "Your Daily Routine - Walk through a part of your day as if explaining it to a curious stranger." },
    { category: "practice", text: "A Quick Rant - Get something off your chest. Be real, be expressive." },
    { category: "practice", text: "Pretend You're on a Call - Speak like you're talking to a friend, not a camera." },
    { category: "practice", text: "One Bold Opinion - Share a 'hot take' or personal opinion on something light (e.g., cereal before milk)." },
    { category: "practice", text: "Behind the Scenes - Talk about something in your life most people don't see or know about." },
    { category: "practice", text: "Encourage Someone Like You - Imagine someone else afraid to speak on camera. What would you tell them?" }
  ];
  
  // Check if we already have prompts
  const existingCount = await storage.getPromptsCount();
  
  if (existingCount === 0) {
    for (const prompt of samplePrompts) {
      const validatedPrompt = insertPromptSchema.parse(prompt);
      await storage.createPrompt(validatedPrompt);
    }
    console.log("Initialized database with sample prompts");
  }
}
