import { 
  users, 
  sessions, 
  prompts,
  promptCompletions,
  type User, 
  type InsertUser, 
  type Session,
  type InsertSession,
  type Prompt,
  type InsertPrompt,
  type PromptCompletion,
  type InsertPromptCompletion
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private prompts: Map<number, Prompt>;
  private promptCompletions: Map<number, PromptCompletion>;
  private userId: number;
  private sessionId: number;
  private promptId: number;
  private promptCompletionId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.prompts = new Map();
    this.promptCompletions = new Map();
    this.userId = 1;
    this.sessionId = 1;
    this.promptId = 1;
    this.promptCompletionId = 1;
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
    const session: Session = {
      ...sessionData,
      id,
      userId: userId || null,
      date: sessionData.date || new Date(),
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
    const [session] = await db
      .insert(sessions)
      .values({
        ...sessionData,
        userId: userId || null
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
}

// Switch to database storage instead of memory storage
export const storage = new DatabaseStorage();
