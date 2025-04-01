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
  
  const httpServer = createServer(app);
  return httpServer;
}
