import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptSchema } from "@shared/schema";
import { analyzeVideo } from "./ai";
import { z } from "zod";
import multer from "multer";

// Configure multer for file uploads (stored in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Save practice session
  app.post("/api/sessions", async (req, res) => {
    try {
      const session = req.body;
      
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
      
      const savedSession = await storage.createSession(validatedSession);
      res.status(201).json(savedSession);
    } catch (error) {
      console.error("Error saving session:", error);
      res.status(500).json({ message: "Failed to save session" });
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
