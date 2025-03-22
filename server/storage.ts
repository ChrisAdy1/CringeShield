import { 
  users, 
  sessions, 
  prompts, 
  type User, 
  type InsertUser, 
  type Session,
  type InsertSession,
  type Prompt,
  type InsertPrompt
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session methods
  getSessions(): Promise<Session[]>;
  getSessionsByUser(userId: number): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: Omit<InsertSession, "userId">): Promise<Session>;
  
  // Prompt methods
  getPrompts(): Promise<Prompt[]>;
  getPromptsByCategory(category: string): Promise<Prompt[]>;
  getRandomPrompt(category: string): Promise<Prompt | undefined>;
  getPromptsCount(): Promise<number>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private prompts: Map<number, Prompt>;
  private userId: number;
  private sessionId: number;
  private promptId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.prompts = new Map();
    this.userId = 1;
    this.sessionId = 1;
    this.promptId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
  
  async createSession(sessionData: Omit<InsertSession, "userId">): Promise<Session> {
    const id = this.sessionId++;
    const session: Session = {
      ...sessionData,
      id,
      userId: null, // No user authentication for now
      date: sessionData.date || new Date(),
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
    const prompt: Prompt = { ...promptData, id };
    this.prompts.set(id, prompt);
    return prompt;
  }
}

export const storage = new MemStorage();
