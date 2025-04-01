import { 
  users, 
  sessions, 
  prompts,
  promptCompletions,
  challengeProgress,
  weeklyProgress,
  type User, 
  type InsertUser, 
  type Session,
  type InsertSession,
  type Prompt,
  type InsertPrompt,
  type PromptCompletion,
  type InsertPromptCompletion,
  type ChallengeProgress,
  type InsertChallengeProgress,
  type WeeklyProgress,
  type InsertWeeklyProgress,
  type WeeklyChallengeTier
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Session methods
  getSessions(): Promise<Session[]>;
  getSessionsByUser(userId: number): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: Omit<InsertSession, "userId">, userId?: number): Promise<Session>;
  
  // Prompt methods
  getPrompts(): Promise<Prompt[]>;
  getPromptsByCategory(category: string): Promise<Prompt[]>;
  getRandomPrompt(category: string): Promise<Prompt | undefined>;
  getPromptsCount(): Promise<number>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  
  // Authentication methods
  validatePassword(email: string, password: string): Promise<User | null>;
  
  // Prompt completion methods
  getPromptCompletions(userId: number): Promise<PromptCompletion[]>;
  createPromptCompletion(completion: InsertPromptCompletion): Promise<PromptCompletion>;
  getPromptCompletionCount(userId: number): Promise<number>;
  
  // Challenge progress methods
  getChallengeProgress(userId: number): Promise<ChallengeProgress[]>;
  completeChallengeDay(userId: number, dayNumber: number): Promise<ChallengeProgress>;
  isDayChallengeCompleted(userId: number, dayNumber: number): Promise<boolean>;
  
  // Weekly Challenge methods
  getWeeklyProgress(userId: number): Promise<WeeklyProgress | undefined>;
  createWeeklyProgress(userId: number, tier: WeeklyChallengeTier): Promise<WeeklyProgress>;
  markWeeklyPromptComplete(userId: number, promptId: string): Promise<WeeklyProgress>;
  isWeeklyPromptCompleted(userId: number, promptId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private prompts: Map<number, Prompt>;
  private promptCompletions: Map<number, PromptCompletion>;
  private challengeProgress: Map<number, ChallengeProgress>;
  private weeklyProgressMap: Map<number, WeeklyProgress>;
  private userId: number;
  private sessionId: number;
  private promptId: number;
  private promptCompletionId: number;
  private challengeProgressId: number;
  private weeklyProgressId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.prompts = new Map();
    this.promptCompletions = new Map();
    this.challengeProgress = new Map();
    this.weeklyProgressMap = new Map();
    this.userId = 1;
    this.sessionId = 1;
    this.promptId = 1;
    this.promptCompletionId = 1;
    this.challengeProgressId = 1;
    this.weeklyProgressId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.split('@')[0] === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Create a fake hash for password in memory storage
    const passwordHash = `hash_${insertUser.password}`;
    const user: User = { 
      id, 
      email: insertUser.email,
      passwordHash,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    
    // Delete related data
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === id);
    
    for (const session of userSessions) {
      this.sessions.delete(session.id);
    }
    
    const userCompletions = Array.from(this.promptCompletions.values())
      .filter(completion => completion.userId === id);
    
    for (const completion of userCompletions) {
      this.promptCompletions.delete(completion.id);
    }
    
    // Delete challenge progress
    const userChallengeProgress = Array.from(this.challengeProgress.values())
      .filter(progress => progress.userId === id);
    
    for (const progress of userChallengeProgress) {
      this.challengeProgress.delete(progress.id);
    }
  }
  
  // Authentication
  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    // In memory storage, we just check if the hash matches our fake pattern
    if (user.passwordHash === `hash_${password}`) {
      return user;
    }
    return null;
  }
  
  // Session methods
  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }
  
  async getSessionsByUser(userId: number): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId);
  }
  
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async createSession(sessionData: Omit<InsertSession, "userId">, userId?: number): Promise<Session> {
    const id = this.sessionId++;
    
    // Set default values for required fields that might be missing in schema
    const defaults = {
      // For backward compatibility with old schema
      promptCategory: 'free',
      prompt: 'Free talk',
      filter: 'none',
      confidenceScore: 0
    };
    
    const session: Session = {
      ...defaults,
      ...sessionData,
      id,
      userId: userId || null,
      date: sessionData.date || new Date(),
      cameraOn: sessionData.cameraOn ?? true,
      userRating: sessionData.userRating || null,
      aiNotes: sessionData.aiNotes || null
    };
    
    this.sessions.set(id, session);
    return session;
  }
  
  // Prompt methods
  async getPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }
  
  async getPromptsByCategory(category: string): Promise<Prompt[]> {
    return Array.from(this.prompts.values())
      .filter(prompt => prompt.category === category || category === 'random');
  }
  
  async getRandomPrompt(category: string): Promise<Prompt | undefined> {
    const prompts = await this.getPromptsByCategory(category);
    if (prompts.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }
  
  async getPromptsCount(): Promise<number> {
    return this.prompts.size;
  }
  
  async createPrompt(promptData: InsertPrompt): Promise<Prompt> {
    const id = this.promptId++;
    const prompt: Prompt = { 
      id, 
      category: promptData.category,
      text: promptData.text
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  // Prompt Completion methods
  async getPromptCompletions(userId: number): Promise<PromptCompletion[]> {
    return Array.from(this.promptCompletions.values())
      .filter(completion => completion.userId === userId);
  }

  async createPromptCompletion(completion: InsertPromptCompletion): Promise<PromptCompletion> {
    const id = this.promptCompletionId++;
    const promptCompletion: PromptCompletion = {
      id,
      userId: completion.userId ?? null,
      promptId: completion.promptId ?? null,
      cameraOn: completion.cameraOn ?? true,
      completedAt: new Date()
    };
    this.promptCompletions.set(id, promptCompletion);
    return promptCompletion;
  }

  async getPromptCompletionCount(userId: number): Promise<number> {
    return (await this.getPromptCompletions(userId)).length;
  }

  // Challenge progress methods
  async getChallengeProgress(userId: number): Promise<ChallengeProgress[]> {
    return Array.from(this.challengeProgress.values())
      .filter(progress => progress.userId === userId)
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }

  async completeChallengeDay(userId: number, dayNumber: number): Promise<ChallengeProgress> {
    // Check if already completed
    const existing = Array.from(this.challengeProgress.values())
      .find(progress => progress.userId === userId && progress.dayNumber === dayNumber);
      
    if (existing) {
      return existing;
    }

    // Create new progress
    const id = this.challengeProgressId++;
    const progress: ChallengeProgress = {
      id,
      userId,
      dayNumber,
      completedAt: new Date()
    };
    
    this.challengeProgress.set(id, progress);
    return progress;
  }

  async isDayChallengeCompleted(userId: number, dayNumber: number): Promise<boolean> {
    return Array.from(this.challengeProgress.values())
      .some(progress => progress.userId === userId && progress.dayNumber === dayNumber);
  }
  
  // Weekly Challenge methods
  async getWeeklyProgress(userId: number): Promise<WeeklyProgress | undefined> {
    return Array.from(this.weeklyProgressMap.values())
      .find(progress => progress.userId === userId);
  }
  
  async createWeeklyProgress(userId: number, tier: WeeklyChallengeTier): Promise<WeeklyProgress> {
    // Check if user already has a progress entry
    const existing = await this.getWeeklyProgress(userId);
    if (existing) {
      return existing;
    }
    
    const id = this.weeklyProgressId++;
    const progress: WeeklyProgress = {
      id,
      userId,
      selectedTier: tier,
      startDate: new Date(),
      completedPrompts: []
    };
    
    this.weeklyProgressMap.set(id, progress);
    return progress;
  }
  
  async markWeeklyPromptComplete(userId: number, promptId: string): Promise<WeeklyProgress> {
    const progress = await this.getWeeklyProgress(userId);
    if (!progress) {
      throw new Error("User has not started a weekly challenge");
    }
    
    const completedPrompts = progress.completedPrompts || [];
    
    // Skip if already completed
    if (completedPrompts.includes(promptId)) {
      return progress;
    }
    
    // Add to completed prompts
    const updatedProgress: WeeklyProgress = {
      ...progress,
      completedPrompts: [...completedPrompts, promptId]
    };
    
    this.weeklyProgressMap.set(progress.id, updatedProgress);
    return updatedProgress;
  }
  
  async isWeeklyPromptCompleted(userId: number, promptId: string): Promise<boolean> {
    const progress = await this.getWeeklyProgress(userId);
    if (!progress) {
      return false;
    }
    
    const completedPrompts = progress.completedPrompts || [];
    return completedPrompts.includes(promptId);
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // In our system, we're using email as the username identifier
    // This method is required by the IStorage interface but we'll implement it to match our schema
    return this.getUserByEmail(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        email: insertUser.email,
        passwordHash
      })
      .returning();
    
    return user;
  }
  
  async deleteUser(id: number): Promise<void> {
    // Delete user's sessions
    await db
      .delete(sessions)
      .where(eq(sessions.userId, id));
    
    // Delete user's prompt completions
    await db
      .delete(promptCompletions)
      .where(eq(promptCompletions.userId, id));
    
    // Delete user's challenge progress
    await db
      .delete(challengeProgress)
      .where(eq(challengeProgress.userId, id));
    
    // Delete the user
    await db
      .delete(users)
      .where(eq(users.id, id));
  }

  // Authentication methods
  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  // Session methods
  async getSessions(): Promise<Session[]> {
    return db.select().from(sessions);
  }

  async getSessionsByUser(userId: number): Promise<Session[]> {
    return db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.date));
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
    return session;
  }

  async createSession(sessionData: Omit<InsertSession, "userId">, userId?: number): Promise<Session> {
    // Set default values for required fields that might be missing in schema
    const defaults = {
      // For backward compatibility with old schema
      promptCategory: 'free',
      prompt: 'Free talk',
      filter: 'none',
      confidenceScore: 0
    };
    
    const [session] = await db
      .insert(sessions)
      .values({
        ...defaults,
        ...sessionData,
        userId: userId || null,
        cameraOn: sessionData.cameraOn ?? true
      })
      .returning();
    return session;
  }

  // Prompt methods
  async getPrompts(): Promise<Prompt[]> {
    return db.select().from(prompts);
  }

  async getPromptsByCategory(category: string): Promise<Prompt[]> {
    if (category === 'random') {
      return db.select().from(prompts);
    }
    
    return db
      .select()
      .from(prompts)
      .where(eq(prompts.category, category));
  }

  async getRandomPrompt(category: string): Promise<Prompt | undefined> {
    const prompts = await this.getPromptsByCategory(category);
    if (prompts.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }

  async getPromptsCount(): Promise<number> {
    const result = await db
      .select()
      .from(prompts)
      .then(rows => rows.length);
    return result;
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db
      .insert(prompts)
      .values(prompt)
      .returning();
    return newPrompt;
  }

  // Prompt completion methods
  async getPromptCompletions(userId: number): Promise<PromptCompletion[]> {
    return db
      .select()
      .from(promptCompletions)
      .where(eq(promptCompletions.userId, userId))
      .orderBy(desc(promptCompletions.completedAt));
  }

  async createPromptCompletion(completion: InsertPromptCompletion): Promise<PromptCompletion> {
    const [newCompletion] = await db
      .insert(promptCompletions)
      .values(completion)
      .returning();
    return newCompletion;
  }

  async getPromptCompletionCount(userId: number): Promise<number> {
    const results = await db
      .select()
      .from(promptCompletions)
      .where(eq(promptCompletions.userId, userId));
    return results.length;
  }

  // Challenge progress methods
  async getChallengeProgress(userId: number): Promise<ChallengeProgress[]> {
    return db
      .select()
      .from(challengeProgress)
      .where(eq(challengeProgress.userId, userId))
      .orderBy(challengeProgress.dayNumber);
  }

  async completeChallengeDay(userId: number, dayNumber: number): Promise<ChallengeProgress> {
    // Check if already completed
    const existing = await db
      .select()
      .from(challengeProgress)
      .where(and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.dayNumber, dayNumber)
      ));
      
    if (existing.length > 0) {
      return existing[0];
    }

    // Create new progress
    const [progress] = await db
      .insert(challengeProgress)
      .values({
        userId,
        dayNumber
      })
      .returning();
      
    return progress;
  }

  async isDayChallengeCompleted(userId: number, dayNumber: number): Promise<boolean> {
    const result = await db
      .select()
      .from(challengeProgress)
      .where(and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.dayNumber, dayNumber)
      ));
      
    return result.length > 0;
  }
  
  // Weekly Challenge methods
  async getWeeklyProgress(userId: number): Promise<WeeklyProgress | undefined> {
    const [progress] = await db
      .select()
      .from(weeklyProgress)
      .where(eq(weeklyProgress.userId, userId));
      
    return progress;
  }
  
  async createWeeklyProgress(userId: number, tier: WeeklyChallengeTier): Promise<WeeklyProgress> {
    // Check if user already has a progress entry
    const existing = await this.getWeeklyProgress(userId);
    if (existing) {
      return existing;
    }
    
    // Create new progress
    const [progress] = await db
      .insert(weeklyProgress)
      .values({
        userId,
        selectedTier: tier,
        completedPrompts: []
      })
      .returning();
      
    return progress;
  }
  
  async markWeeklyPromptComplete(userId: number, promptId: string): Promise<WeeklyProgress> {
    const progress = await this.getWeeklyProgress(userId);
    if (!progress) {
      throw new Error("User has not started a weekly challenge");
    }
    
    const completedPrompts = progress.completedPrompts || [];
    
    // Skip if already completed
    if (completedPrompts.includes(promptId)) {
      return progress;
    }
    
    // Add to completed prompts
    const updatedCompletedPrompts = [...completedPrompts, promptId];
    
    // Update in database
    const [updatedProgress] = await db
      .update(weeklyProgress)
      .set({
        completedPrompts: updatedCompletedPrompts
      })
      .where(eq(weeklyProgress.id, progress.id))
      .returning();
      
    return updatedProgress;
  }
  
  async isWeeklyPromptCompleted(userId: number, promptId: string): Promise<boolean> {
    const progress = await this.getWeeklyProgress(userId);
    if (!progress) {
      return false;
    }
    
    const completedPrompts = progress.completedPrompts || [];
    return completedPrompts.includes(promptId);
  }
}

// Switch to database storage instead of memory storage
export const storage = new DatabaseStorage();
