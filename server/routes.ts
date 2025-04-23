import type { Express } from "express";
import { createServer } from "http";
import multer from "multer";
import { storage } from "./storage";
import {
  generateMidjourneyPrompt,
  analyzePhoto,
  analyzeIllustration,
  breakdownScene,
  generateMotionSuggestions,
  generateStyleSuggestions,
  generateScreenplay,
  analyzePhotoForMotion,
} from "./openai";
import { insertPromptSchema } from "@shared/schema";
import passport from "passport";
import sharp from "sharp";
import OpenAI from "openai";
// import { WebSocketServer, WebSocket } from "ws";
import { Router } from "express";
import { prompt_for_text_request } from "./prompts";

// Update the OpenAI initialization with better error handling
let openai: OpenAI;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("OpenAI client initialized successfully");
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
  throw error; // Re-throw to prevent server from starting with invalid configuration
}

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const ANIMATION_TYPES = [
  "Traditional (Hand-Drawn) Animation",
  "2D Animation",
  "3D Animation (CGI)",
  "Stop Motion Animation",
  "Motion Graphics",
  "Whiteboard Animation",
  "Cutout Animation",
  "Claymation (Clay Animation)",
  "Puppet Animation",
  "Rotoscoping",
  "Kinetic Typography",
  "Experimental Animation",
  "Augmented Reality (AR) Animation",
  "Virtual Reality (VR) Animation",
  "Pixel Art Animation",
  "Flipbook Animation",
  "Anime",
  "Morphing Animation",
  "Sand Animation",
];

const ILLUSTRATION_TYPES = [
  "Realistic Illustration",
  "Cartoon Illustration",
  "Minimalist Illustration",
  "Flat Illustration",
  "Line Art",
  "Watercolor Illustration",
  "Digital Painting",
  "Vector Illustration",
  "Isometric Illustration",
  "Fantasy Illustration",
  "Retro Illustration",
  "Vintage Illustration",
  "Concept Art",
  "Infographic Illustration",
  "Character Design",
  "Children's Book Illustration",
  "Traditional (Hand-Drawn) Illustration",
  "Digital Illustration",
  "Pencil Illustration",
  "Ink Illustration",
  "Caricature Illustration",
  "Comic Book Illustration",
  "Surreal Illustration",
  "Fashion Illustration",
  "Pattern Illustration",
  "Architectural Illustration",
  "Botanical Illustration",
];

const PROMPT_STRUCTURE = `[Illustration/Animation Type], [Subject (character species, gender, age, appearance)], [Action], [Shot Type], [Camera Angle], [Location], [Time of Day, Year], [Fashion/Film Set Design, Background], inspired by [Style of Illustrator/Animation Studio], created in [3D Rendering/Animation Engine], [Type and Source of Lighting], [Color Palette], [Illustration/Animation Aesthetic], [Mood/Emotion], --ar 16:9 --style raw`;

const PROMPT_EXAMPLE = `Cartoon-Style Illustration, adorable young girl with curly white hair resembling sheep's wool, wearing a chunky knitted sweater dress, brown leather boots, and woolen socks, standing with arms crossed and eyes closed, Medium Full Shot, Eye Level, serene autumn forest setting with golden leaves and soft sunlight, warm color palette with earthy tones and cozy textures, inspired by John Burningham, created in Blender, natural soft lighting with diffused highlights, Classic Disney Animation Aesthetic, whimsical and heartwarming mood, --ar 16:9 --style raw`;

const PHOTO_PROMPT_STRUCTURE = `Cinematic, [Photography Genre], [Subject (gender, age, appearance)], [Action], [Shot/Frame Type], [Camera Angle], [Location], [Fashion/Film Set Design, Background], [Name of Cinematographer or Film Director], [Movie Camera Type], [Lenses], [Film Stock], [Type and Source of Lighting], [Color Palette], [Photography Aesthetic], [Mood/Emotion] --ar 16:9 --style raw`;

const PHOTO_PROMPT_EXAMPLE = `Cinematic, Historical Photography, Marie Antoinette, standing on the balcony with her back to the camera, looking down at an angry revolutionary crowd, Full Shot, High Angle, Palace of Versailles, 18th-century French aristocratic fashion, distressed and chaotic revolutionary background with rioting civilians and armed soldiers, inspired by Vittorio Storaro, ARRIFLEX 435, 50mm Standard Prime, Kodak Vision3 250D, natural sunlight with dramatic shadows, warm golden tones contrasting with dark, muted colors of the crowd, Baroque Painting Aesthetic, tense and dramatic mood --ar 16:9 --style raw`;

// Add the example prompt to show the expected level of detail
const EXAMPLE_PROMPT = `Cinematic, Drama Photography, A teenage boy, around 14 years old, with tousled brown hair, dressed in a slightly oversized grey hoodie and faded jeans, His eyes stare downward, a distant look of sadness on his face, Sitting still on a weathered wooden park bench, slouched forward with his elbows on his knees, Full Shot, Eye Level, Positioned on the left third of the frame with ample leading space on the right, His gaze drifts downward, Set in a quiet park with fallen leaves scattered across the path and distant trees bathed in warm afternoon light, Old iron lampposts line the background, with empty benches along the path, A crumpled paper cup sits in the foreground near his feet, Inspired by Roger Deakins, Shot on ARRI Alexa Mini, Zeiss Master Prime 35mm lens, Kodak Vision3 500T, Soft, natural light filtering through the trees, casting warm golden highlights with subtle shadows, Earthy tones dominate with warm oranges and browns adding autumnal richness, Photorealistic with a slightly grainy aesthetic for realism, A mood of introspection and solitude, Sharp focus on the boy's face, with blurred trees and distant park visitors fading into the background, The texture of worn wooden bench slats, fallen leaves, and the boy's wrinkled hoodie add depth and tactile realism, --ar 16:9 --style raw`;

// Define emotion-to-body-language mappings at the top
const EMOTION_MAPPINGS = {
  anxiety:
    "fingers tapping rhythmically on table, shifting weight nervously, darting gaze",
  curiosity: "eyes wide, slightly parted lips, head tilting forward slightly",
  fear: "shoulders drawn up, arms tightly crossed, trembling fingers",
  sadness: "downcast eyes, slow blinking, lips pressed tightly",
  confidence: "chin raised, shoulders back, steady gaze",
};

const LIGHTING_MOODS = {
  intimate: "Soft ambient lighting with warm tones, candles, or sunset hues",
  mysterious: "Low-key lighting with sharp contrasts and deep shadows",
  melancholy: "Natural backlighting, silhouettes, and minimal fill light",
  joyful: "Bright natural daylight, clean highlights",
};

// Update the enhance prompt functions
const detectAndReplaceVagueTerms = (prompt: string): string => {
  const vagueTerms = {
    "casual clothes":
      "well-worn denim jacket with rolled sleeves, faded band t-shirt, and distressed jeans",
    "thoughtful attire":
      "carefully selected vintage pieces that speak to character history",
    "looks sad":
      "shoulders slumped forward, eyes cast downward, fingers fidgeting with sleeve cuffs",
    "emotional presence":
      "micro-expressions revealing inner turmoil - a slight tremor in the hands, tightened jaw muscles",
    "nice lighting":
      "diffused natural light filtering through muslin curtains, creating soft shadows and gentle highlights",
    "good atmosphere":
      "dust motes dancing in shafts of golden hour light, steam rising from rain-dampened streets",
    worried:
      "brow furrowed slightly, fingers unconsciously smoothing fabric, shoulders tensed",
    hopeful:
      "chin lifted slightly, eyes bright with anticipation, posture opening up",
    nervous:
      "shifting weight between feet, hands clasped tightly, quick darting glances",
    nostalgic:
      "gentle smile playing at corners of mouth, distant gaze, fingers trailing thoughtfully over surfaces",
  };

  let enhancedPrompt = prompt;
  Object.entries(vagueTerms).forEach(([vague, specific]) => {
    enhancedPrompt = enhancedPrompt.replace(new RegExp(vague, "gi"), specific);
  });

  // Add emotional depth if missing
  Object.entries(EMOTION_MAPPINGS).forEach(([emotion, bodyLanguage]) => {
    if (
      prompt.toLowerCase().includes(emotion) &&
      !prompt.includes(bodyLanguage)
    ) {
      enhancedPrompt = enhancedPrompt.replace(
        new RegExp(`(${emotion})`, "gi"),
        `$1 - ${bodyLanguage}`
      );
    }
  });

  return enhancedPrompt;
};

const ensureLeadingSpace = (prompt: string): string => {
  if (!prompt.includes("Position in Frame")) {
    return prompt;
  }

  const positionSegments = {
    walking: "with ample leading space in the direction of movement",
    running: "with significant leading space to suggest motion and destination",
    looking: "with extended space in the direction of their gaze",
    reaching: "with deliberate negative space emphasizing the reach",
    turning: "with balanced space allowing for the turning motion",
  };

  let enhancedPrompt = prompt;
  Object.entries(positionSegments).forEach(([action, space]) => {
    if (prompt.toLowerCase().includes(action)) {
      enhancedPrompt = enhancedPrompt.replace(
        /Position in Frame[^,]+/,
        `Position in Frame: ${space}`
      );
    }
  });
  return enhancedPrompt;
};

const improveVisualConsistency = (prompt: string): string => {
  // Add texture and atmospheric details if missing
  if (!prompt.includes("Texture and Atmospheric Details")) {
    prompt +=
      "\nTexture and Atmospheric Details: Fine detail in environmental textures - surface wear patterns, material grain, atmospheric particles catching light";
  }

  // Enhance lighting based on mood
  Object.entries(LIGHTING_MOODS).forEach(([mood, lighting]) => {
    if (prompt.toLowerCase().includes(mood) && !prompt.includes(lighting)) {
      prompt = prompt.replace(
        /(Lighting Conditions:[^,]+)/,
        `$1, enhanced with ${lighting}`
      );
    }
  });

  // Ensure professional lighting terminology
  prompt = prompt.replace(
    /lighting/gi,
    "illumination using industry-standard techniques"
  );

  return prompt;
};

// Update the OpenAI system prompt
const CINEMATIC_SYSTEM_PROMPT = `You are a master cinematographer with deep expertise in visual storytelling. Generate a detailed cinematic prompt from any description, no matter how brief. Always expand simple descriptions into rich, professional prompts that follow this exact structure:

USE THIS STRUCTURE:
Cinematic, [Photography Genre], [Subject (gender, age, appearance)], [Action], [Shot/Frame Type], [Camera Angle], [Location], [Fashion/Film Set Design, Background], [Name of Cinematographer or Film Director], [Movie Camera Type], [Lenses], [Film Stock], [Type and Source of Lighting], [Color Palette], [Photography Aesthetic], [Mood/Emotion] --ar 16:9 --style raw

CRITICAL RULES:
1. ALWAYS generate a full prompt regardless of input length
2. Format as ONE CONTINUOUS LINE - no line breaks except before --ar 16:9
3. ALWAYS end at "--style raw" with no additional text
4. Move all clothing/attire descriptions to [Fashion/Film Set Design]
5. Place [Action/Emotional Cue] immediately after subject description
6. Ensure clear [Gaze/Focus Direction]
7. Specify leading space in [Position in Frame]
8. DO NOT add explanatory text or apologies
9. NEVER create custom or hybrid photography types
10. NEVER modify these photography types (e.g., NO "Macabre Portrait Photography")
11. ALWAYS use the exact photography type from the list above
12. ALWAYS highlight the photography type in brackets in the prompt
13. NO custom or hybrid genres


EXAMPLE OUTPUT:
Cinematic, Historical Photography, Marie Antoinette, standing on the balcony with her back to the camera, looking down at an angry revolutionary crowd, Full Shot, High Angle, Palace of Versailles, 18th-century French aristocratic fashion, distressed and chaotic revolutionary background with rioting civilians and armed soldiers, inspired by Vittorio Storaro, ARRIFLEX 435, 50mm Standard Prime, Kodak Vision3 250D, natural sunlight with dramatic shadows, warm golden tones contrasting with dark, muted colors of the crowd, Baroque Painting Aesthetic, tense and dramatic mood --ar 16:9 --style raw

Remember:
- Generate complete prompts even for simple inputs
- Keep as one continuous line
- End exactly at "--style raw"
- Include all technical details
- Never add explanatory text`;

// Define the system content for illustration prompts
const systemContent = `You are an expert illustrator and animation artist specializing in creating detailed prompts. Convert natural language descriptions into highly structured prompts following this EXACT format:

${PROMPT_STRUCTURE}

Example prompt:
${PROMPT_EXAMPLE}

CRITICAL RULES:
1. ALWAYS start with a specific Illustration or Animation Type from these lists:

Illustration Types:
${ILLUSTRATION_TYPES.map((type) => `   - ${type}`).join("\n")}

Animation Types:
${ANIMATION_TYPES.map((type) => `   - ${type}`).join("\n")}

2. Be extremely specific about the subject's appearance and actions
3. Keep Fashion/Clothes and Background as separate parameters
4. Include rich descriptive details about environment and atmosphere
5. Maintain professional illustration/animation terminology
6. Keep all parameters in the exact order specified
7. End with "--ar 16:9 --style raw"
8. DO NOT use quotation marks in your response
9. ALWAYS use "inspired by" before the artist/studio name
10. ALWAYS use "created in" before the rendering engine

Example artists/studios to reference:
- Famous Illustrators: Milt Kahl, John Burningham, Maurice Sendak, Beatrix Potter
- Animation Studios: Disney, Pixar, DreamWorks, Studio Ghibli, Illumination
- Contemporary Artists: Glen Keane, Rebecca Sugar, Craig McCracken`;

// Update the analyzePhotoForMotion function

interface MotionAnalysisResult {
  role: string;
  content:
    | string
    | { type: string; text?: string; image_url?: { url: string } }[];
}

const analyzePhotoForMotion = async (
  base64Image: string,
  mimeType: string,
  movementNotes?: string
): Promise<{
  frameMovement: string;
  cameraMovement: string;
}> => {
  try {
    console.log("Starting motion analysis for photo");
    const messages: MotionAnalysisResult[] = [
      {
        role: "system",
        content: `You are a master cinematographer specializing in movement direction. Analyze the image and generate two concise descriptions:
1. Subject Movement (max 250 chars): Focus on primary subjects' actions and interactions, using dynamic verbs for active scenes and subtle cues for introspective moments.
2. Camera Movement (max 250 chars): Describe camera tracking that logically follows the action, focusing on main subjects and maintaining visual continuity.

Follow these rules:
- Start with the most important action
- Use precise, active verbs
- Keep total output under 500 characters
- Focus on primary subjects first
- Connect camera movement to subject action`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this image and provide movement descriptions that prioritize the main subjects and their actions. Focus on dynamic movement for active scenes or subtle cues for still moments. ${
              movementNotes ? `Movement Notes: ${movementNotes}` : ""
            }`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ];
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    console.log("Motion analysis completed:", content);

    // Split the content by movement types
    const parts = content.split(/Camera Movement:/i);
    if (parts.length !== 2) {
      throw new Error("Invalid response format from motion analysis");
    }

    const frameMovement = parts[0].replace(/Subject Movement:/i, "").trim();
    const cameraMovement = parts[1].trim();

    // Helper function to clean and truncate at sentence boundary
    const cleanAndComplete = (text: string, maxLength: number): string => {
      let cleaned = text
        .replace(/^Movement Generation \(\d+-Second Scene\):\s*/i, "")
        .replace(/^Subject Movement:?\s*/i, "")
        .replace(/^Subject Movement:?\s*/i, "")
        .replace(/\bSubject Movement:?\s*/gi, "")
        .replace(/Camera Movement:\s*/i, "")
        .trim();

      if (cleaned.length > maxLength) {
        const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
        let result = "";
        for (const sentence of sentences) {
          if ((result + sentence).length <= maxLength) {
            result += sentence;
          } else {
            // If first sentence is too long, truncate at last word boundary
            if (result === "") {
              const words = cleaned.slice(0, maxLength).split(" ");
              words.pop(); // Remove last potentially partial word
              result = words.join(" ") + ".";
            }
            break;
          }
        }
        cleaned = result.trim();
      }

      return cleaned;
    };

    // Allow longer texts for both movement descriptions
    const cleanFrameMovement = cleanAndComplete(frameMovement, 499);
    const cleanCameraMovement = cleanAndComplete(cameraMovement, 499);

    return {
      frameMovement: cleanFrameMovement,
      cameraMovement: cleanCameraMovement,
    };
  } catch (error: any) {
    console.error("Error analyzing photo for motion:", error);
    // Check for specific OpenAI API errors
    if (error.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    } else if (error.response?.status === 400) {
      throw new Error(
        "Invalid image format or content. Please try a different image."
      );
    } else if (error.response?.status === 413) {
      throw new Error(
        "Image size exceeds API limits. Please use a smaller image or reduce quality."
      );
    }
    throw error;
  }
};

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Auth routes should be registered first
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for email:", req.body.email); // Add logging
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Login failed:", info?.message);
        return res
          .status(401)
          .json({ message: info?.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return next(err);
        }
        console.log("Login successful for user:", user.email);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.post("/api/prompts/generate", async (req, res) => {
    try {
      const { description, genre, parameters } = req.body;

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const generatedPrompt = await generateMidjourneyPrompt(
        description,
        genre,
        parameters
      );

      // Store the prompt in database
      const prompt = await storage.createPrompt({
        description,
        genre,
        parameters,
        generatedPrompt,
      });

      res.json({
        generatedPrompt: generatedPrompt,
      });
    } catch (error: unknown) {
      console.error("Prompt Generation Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/analyze-photo", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "Invalid file type. Please upload an image." });
      }

      console.log(
        `Processing image: ${req.file.size} bytes, type: ${req.file.mimetype}`
      );

      const base64Image = req.file.buffer.toString("base64");

      try {
        const { generatedPrompt, photographyStyle } = await analyzePhoto(
          base64Image
        );

        res.json({
          generatedPrompt,
          photographyStyle,
        });
      } catch (analysisError) {
        console.error("Analysis failed:", analysisError);
        if (analysisError instanceof Error) {
          if (
            analysisError.message.includes("Request too large") ||
            analysisError.message.includes("maximum context length")
          ) {
            return res.status(413).json({
              message:
                "Image size exceeds API limits. Please try a smaller image or reduce quality.",
            });
          }
        }
        throw analysisError;
      }
    } catch (error) {
      console.error("Photo Analysis Error:", error);
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Failed to analyze photo",
      });
    }
  });

  app.post("/api/generate-photo-prompt", async (req, res) => {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res
          .status(500)
          .json({ message: "OpenAI API key is not configured" });
      }

      console.log("Generating photo prompt for description:", description);

      // Validate OpenAI API key

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            // content: CINEMATIC_SYSTEM_PROMPT,
            content: prompt_for_text_request,
          },
          {
            role: "user",
            content: description,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      if (!response.choices[0]?.message?.content) {
        console.error("Empty response from OpenAI");
        throw new Error("Failed to generate prompt - empty response received");
      }

      console.log("Raw response:", response.choices[0].message.content);

      // Remove any quotation marks and ensure proper format
      let generatedPrompt = response.choices[0].message.content
        .replace(/^"|"$/g, "")
        .trim();

      if (!generatedPrompt) {
        throw new Error("Generated prompt is empty after processing");
      }

      // Ensure prompt starts with "Cinematic,"
      if (!generatedPrompt.startsWith("Cinematic,")) {
        generatedPrompt = "Cinematic, " + generatedPrompt;
      }

      // Ensure prompt ends with proper suffix
      if (!generatedPrompt.endsWith("--style raw")) {
        generatedPrompt =
          generatedPrompt.replace(/--ar 16:9.*$/, "").trim() +
          " --ar 16:9 --style raw";
      }

      console.log("Generated prompt:", generatedPrompt);

      // Remove any appended emotion mappings before sending
      const cleanedPrompt = generatedPrompt.replace(
        /\s*-\s*(?:fingers tapping rhythmically on table|shifting weight nervously|darting gaze|shoulders drawn up|arms tightly crossed|trembling fingers|downcast eyes|slow blinking|lips pressed tightly|chin raised|shoulders back|steady gaze)(?:,\s*)?/g,
        ""
      );

      res.json({
        generatedPrompt: cleanedPrompt,
      });
    } catch (error) {
      console.error("Generate Photo Prompt Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate prompt";
      console.error("Error details:", errorMessage);
      res.status(500).json({
        message: errorMessage,
      });
    }
  });

  app.post("/api/generate-illustration-prompt", async (req, res) => {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemContent,
          },
          {
            role: "user",
            content: description,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      // Remove any quotation marks from the response
      const generatedPrompt = response.choices[0].message.content?.replace(
        /^"|"$/g,
        ""
      );

      res.json({
        generatedPrompt,
      });
    } catch (error) {
      console.error("Generate Illustration Prompt Error:", error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate illustration prompt",
      });
    }
  });

  app.post(
    "/api/analyze-illustration",
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }

        if (!req.file.mimetype.startsWith("image/")) {
          return res
            .status(400)
            .json({ message: "Invalid file type. Please upload an image." });
        }

        console.log(
          `Processing image: ${req.file.size} bytes, type: ${req.file.mimetype}`
        );

        const base64Image = req.file.buffer.toString("base64");

        try {
          const { generatedPrompt } = await analyzeIllustration(base64Image);
          console.log("Illustration analysis completed:", { generatedPrompt });

          // Ensure the response follows the illustration prompt structure
          const structuredPrompt = `${
            generatedPrompt.includes("--ar 16:9 --style raw")
              ? generatedPrompt
              : `${generatedPrompt}, --ar 16:9 --style raw`
          }`;

          res.json({
            generatedPrompt: structuredPrompt,
          });
        } catch (analysisError) {
          console.error("Analysis failed:", analysisError);
          if (analysisError instanceof Error) {
            if (
              analysisError.message.includes("Request too large") ||
              analysisError.message.includes("maximum context length")
            ) {
              return res.status(413).json({
                message:
                  "Image size exceeds API limits. Please try a smaller image or reduce quality.",
              });
            }
          }
          throw analysisError;
        }
      } catch (error) {
        console.error("Illustration Analysis Error:", error);
        res.status(500).json({
          message:
            error instanceof Error
              ? error.message
              : "Failed to analyze illustration",
        });
      }
    }
  );

  app.post("/api/scenes/template", async (req, res) => {
    try {
      const { sceneDescription } = req.body;
      if (!sceneDescription) {
        throw new Error("No scene description provided");
      }

      const template = {
        location: "Modern urban setting",
        timeOfDay: "Golden hour",
        mood: "Contemplative",
        filmStock: "Kodak Vision3 500T",
        lightingStyle: "Natural with artificial highlights",
        colorPalette: "Rich earth tones",
        directorStyle: "Roger Deakins",
      };

      res.json(template);
    } catch (error) {
      console.error("Scene Template Error:", error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate template",
      });
    }
  });

  app.post("/api/scenes/breakdown", async (req, res) => {
    try {
      const { sceneDescription } = req.body;
      if (!sceneDescription) {
        throw new Error("No scene description provided");
      }

      const breakdown = await breakdownScene(
        sceneDescription,
        req.body?.currentTemplate
      );
      res.json(breakdown);
    } catch (error: unknown) {
      console.error("Scene Breakdown Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/prompts/recent", async (_req, res) => {
    try {
      const prompts = await storage.getRecentPrompts();
      res.json(prompts);
    } catch (error: unknown) {
      console.error("Recent Prompts Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/motion/generate", async (req, res) => {
    try {
      const { basePrompt, frameLength, maxCharacters, currentTemplate } =
        req.body;
      if (!basePrompt) {
        throw new Error("No base prompt provided");
      }

      const motionSuggestions = await generateMotionSuggestions({
        basePrompt,
        frameLength: frameLength || 5,
        maxCharacters: maxCharacters || 500,
        currentTemplate: currentTemplate || null,
      });

      res.json(motionSuggestions);
    } catch (error: unknown) {
      console.error("Motion Generation Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post(
    "/api/analyze-photo-motion",
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }

        if (!req.file.mimetype.startsWith("image/")) {
          return res
            .status(400)
            .json({ message: "Invalid file type. Please upload an image." });
        }

        // Validate file size (10MB limit)
        if (req.file.size > 10 * 1024 * 1024) {
          return res.status(413).json({
            message:
              "Image size exceeds 10MB limit. Please upload a smaller image.",
          });
        }

        console.log(
          `Processing image: ${req.file.size} bytes, type: ${req.file.mimetype}`
        );

        // Extract and validate movement notes
        const movementNotes = req.body.movementNotes?.trim();
        if (movementNotes) {
          console.log("Movement notes provided:", movementNotes);
        }

        const base64Image = req.file.buffer.toString("base64");

        try {
          // Pass movement notes to the analyzePhotoForMotion function
          const motionAnalysis = await analyzePhotoForMotion(
            base64Image,
            req.file.mimetype,
            movementNotes // Pass the movement notes as the third parameter
          );

          console.log("Motion analysis completed:", motionAnalysis);

          res.json({
            frameMovement: motionAnalysis.frameMovement,
            cameraMovement: motionAnalysis.cameraMovement,
          });
        } catch (analysisError) {
          console.error("Analysis failed:", analysisError);
          if (analysisError instanceof Error) {
            if (
              analysisError.message.includes("Request too large") ||
              analysisError.message.includes("maximum context length")
            ) {
              return res.status(413).json({
                message:
                  "Image size exceeds API limits. Please try a smaller image or reduce quality.",
              });
            }
          }
          throw analysisError;
        }
      } catch (error) {
        console.error("Photo Motion Analysis Error:", error);
        res.status(500).json({
          message:
            error instanceof Error
              ? error.message
              : "Failed to analyze photo for motion",
        });
      }
    }
  );

  app.post("/api/screenplay/style", async (req, res) => {
    try {
      const { subject, genre, target, movieType } = req.body;

      if (!subject || !genre || !target || !movieType) {
        throw new Error("Missing required parameters");
      }

      const styleSuggestions = await generateStyleSuggestions(
        genre,
        movieType,
        target,
        subject
      );

      res.json(styleSuggestions);
    } catch (error: unknown) {
      console.error("Style Suggestions Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/screenplay/generate", async (req, res) => {
    try {
      const {
        subject,
        genre,
        target,
        movieType,
        additionalNotes,
        styleSuggestions,
      } = req.body;

      if (!subject || !genre || !target || !movieType) {
        throw new Error("Missing required parameters");
      }

      const story = await generateScreenplay(
        subject,
        genre,
        target,
        movieType,
        additionalNotes || "",
        styleSuggestions
      );

      res.json(story);
    } catch (error: unknown) {
      console.error("Screenplay Generation Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/generate-prompt", async (req, res) => {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: CINEMATIC_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: description,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Get the initial prompt and ensure it ends at --style raw
      let generatedPrompt =
        response.choices[0].message.content?.split("--style raw")[0];
      if (generatedPrompt) {
        generatedPrompt = generatedPrompt + "--style raw";

        // Apply post-processing enhancements
        generatedPrompt = detectAndReplaceVagueTerms(generatedPrompt);
        generatedPrompt = ensureLeadingSpace(generatedPrompt);
        generatedPrompt = improveVisualConsistency(generatedPrompt);

        // Ensure no additional content after --style raw
        generatedPrompt =
          generatedPrompt.split("--style raw")[0] + "--style raw";
      }

      res.json({
        prompt: generatedPrompt,
      });
    } catch (error) {
      console.error("Generate Prompt Error:", error);
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Failed to generate prompt",
      });
    }
  });

  // Advertising prompt route
  app.post("/api/generate-advertising-prompt", async (req, res) => {
    try {
      const { brief } = req.body;

      if (!brief || typeof brief !== "object") {
        return res.status(400).json({ message: "Invalid brief format" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert advertising art director and creative strategist.

You create visually detailed and emotionally persuasive advertising image prompts based on marketing briefs.

Your prompts must be suitable for AI image generation tools and formatted like commercial campaign directions — NOT cinematic movie scenes.

Never mention camera models, lenses, aspect ratios, or cinematic terms.

Focus on brand identity, subject placement, lighting, tone, mood, color palette, props, CTA, and emotional appeal.`,
          },
          {
            role: "user",
            content: `Generate a detailed advertising image prompt using the following structured creative brief.

If any field is missing, infer it based on the context.

Return a well-written prompt that describes a high-end, visually persuasive commercial advertisement.

Brief:
${JSON.stringify(brief, null, 2)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const adPrompt = response.choices[0]?.message?.content;

      if (!adPrompt) {
        return res
          .status(500)
          .json({ message: "No prompt returned from GPT." });
      }

      res.json({ prompt: adPrompt });
    } catch (error) {
      console.error("❌ Advertising prompt error:", error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate advertising prompt",
      });
    }
  });

  return httpServer;
}

const router = Router();

router.post("/api/generate-prompt", async (req, res) => {
  try {
    const { brief } = req.body;

    if (!brief) {
      return res.status(400).json({ message: "Missing brief data" });
    }

    if (!brief || typeof brief !== "object") {
      return res.status(400).json({ message: "Invalid brief format" });
    }

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a creative assistant that generates detailed advertising image prompts based on structured marketing and visual briefs.`,
        },
        {
          role: "user",
          content: `Create a detailed AI image generation prompt based on this brief:\n${JSON.stringify(
            brief,
            null,
            2
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const prompt = gptResponse.choices?.[0]?.message?.content;

    if (!prompt) {
      return res
        .status(500)
        .json({ message: "OpenAI did not return a prompt." });
    }

    res.json({ prompt });
  } catch (error) {
    console.error("Prompt Generation Error:", error);
    res.status(500).json({ message: "Server error generating prompt" });
  }
});

export default router;
