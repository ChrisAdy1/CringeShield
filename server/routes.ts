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
import pg from 'pg';
const { Pool } = pg;
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
      
      // Create new user
      const user = await storage.createUser(validatedData);
      
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
    { category: "casual", text: "Tell me about your favorite hobby and why you enjoy it." },
    { category: "casual", text: "Describe your ideal weekend. What activities would you include?" },
    { category: "casual", text: "If you could travel anywhere in the world, where would you go and why?" },
    
    { category: "interview", text: "Tell me about yourself and your background." },
    { category: "interview", text: "What are your greatest strengths and how do they help you in your work?" },
    { category: "interview", text: "Describe a challenging situation you faced and how you overcame it." },
    
    { category: "storytelling", text: "Share a memorable experience from your childhood." },
    { category: "storytelling", text: "Tell a story about a time when you learned an important lesson." },
    { category: "storytelling", text: "Describe an adventure or journey that changed your perspective." },
    
    { category: "presentation", text: "Introduce a product or service you're passionate about and explain why others should try it." },
    { category: "presentation", text: "Give a short presentation about a topic you're knowledgeable about." },
    { category: "presentation", text: "Explain a complex concept in simple terms as if teaching someone new to the subject." },
    
    { category: "introduction", text: "Introduce yourself to a new team at work, highlighting your skills and interests." },
    { category: "introduction", text: "Imagine you're meeting new neighbors. How would you introduce yourself?" },
    { category: "introduction", text: "Practice a 30-second elevator pitch about your professional background." },
    
    { category: "social_media", text: "Create a 30-second TikTok-style intro about something you're passionate about." },
    { category: "social_media", text: "Record a YouTube-style welcome to your channel and explain what content viewers can expect." },
    { category: "social_media", text: "Do a quick review of your favorite app or product as if for an Instagram story." },
    { category: "social_media", text: "Create a short tutorial on how to do something you're good at, perfect for a social media reel." },
    { category: "social_media", text: "Practice a trending challenge or dance explanation as if teaching your followers." },
    { category: "social_media", text: "Share a day-in-the-life TikTok style video starting with 'POV: You're watching me...'" },
    { category: "social_media", text: "Create an unboxing video introduction for a YouTube channel." },
    { category: "social_media", text: "Record an Instagram-style product recommendation with your honest review." },
    { category: "social_media", text: "Film a reaction video to an imaginary viral trend that's taking over social media." },
    { category: "social_media", text: "Practice speaking directly to camera for a YouTube vlog introduction." },
    
    { category: "random", text: "If you could have any superpower, what would it be and how would you use it?" },
    { category: "random", text: "Describe your dream home in detail." },
    { category: "random", text: "What's something you believe that most people disagree with?" }
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
