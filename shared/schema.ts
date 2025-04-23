import { pgTable, text, serial, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Prompt table for storing generated prompts
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  genre: text("genre").notNull(),
  parameters: json("parameters").$type<{
    shotType: string;
    cameraAngle: string;
    camera: string;
    lens: string;
    filmStock: string;
    lighting: string;
    colorPalette: string;
    mood: string;
    style: string;
  }>().notNull(),
  generatedPrompt: text("generated_prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Motion analysis types
export interface MotionAnalysis {
  frameMovement: string;
  cameraMovement: string;
}

// Style suggestions interface
export interface StyleSuggestions {
  visualStyle: {
    directors: string[];
    cinematographers: string[];
    movieReferences: string[];
    colorPalette: string;
    visualMood: string;
    camerawork: string;
  };
  narrativeStyle: {
    pacing: string;
    storytellingApproach: string;
    thematicElements: string[];
  };
}

export const insertPromptSchema = createInsertSchema(prompts).pick({
  description: true,
  genre: true,
  parameters: true,
  generatedPrompt: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

// Motion generation parameters
export interface MotionGenerationParams {
  basePrompt: string;
  frameLength?: number;
  maxCharacters?: number;
}