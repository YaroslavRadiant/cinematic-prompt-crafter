import { prompts, type Prompt, type InsertPrompt } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

interface User {
  id: number;
  email: string;
  password: string;
}

export interface IStorage {
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  getRecentPrompts(): Promise<Prompt[]>;

  // Authentication methods
  createUser(user: { email: string; password: string }): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private prompts: Map<number, Prompt>;
  private users: Map<number, User>;
  private currentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.prompts = new Map();
    this.users = new Map();
    this.currentId = 1;

    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.currentId++;
    const prompt: Prompt = { ...insertPrompt, id };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async getRecentPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values())
      .sort((a, b) => b.id - a.id)
      .slice(0, 10);
  }

  // Auth implementation
  async createUser(userData: { email: string; password: string }): Promise<User> {
    const id = this.currentId++;
    const user: User = { id, ...userData };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
}

export const storage = new MemStorage();