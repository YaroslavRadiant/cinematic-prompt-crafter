interface IllustrationPromptOptions {
  promptStructure?: string;
}

import OpenAI from "openai";

// Create and export the OpenAI instance and class
export { OpenAI };
import "dotenv/config";
import { prompt_for_image_request } from "./prompts";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateMidjourneyPrompt(
  description: string,
  parameters: {
    photographyGenre?: string;
    shotType?: string;
    cameraAngle?: string;
    style?: string;
    camera?: string;
    lens?: string;
    filmStock?: string;
    lighting?: string;
    colorPalette?: string;
    mood?: string;
    aesthetic?: string;
    customGeneration?: boolean;
    promptStructure?: string;
  } = {},
  originalContext?: string
): Promise<{ generatedPrompt: string; parameters: typeof parameters }> {
  try {
    console.log("Received parameters:", parameters);
    console.log("Original context:", originalContext);
    console.log("Description:", description);

    const isIllustration = parameters.promptStructure?.includes(
      "[Illustration/Animation Type]"
    );

    const systemPrompt = isIllustration
      ? `You are a prompt engineer specializing in illustration and animation prompts. Your task is to generate a highly detailed prompt following this EXACT structure:
      ${parameters.promptStructure}

      CRITICAL RULES:
      1. NEVER use brackets [] in the output
      2. ALWAYS start with an Illustration/Animation Type
      3. ALWAYS make the Subject description detailed and specific
      4. NEVER use photography-related terms
      5. ALWAYS use the exact Camera Angle and Shot Type terms
      6. ALWAYS include all components in the exact order specified`
      : `You are a prompt engineer specializing in Midjourney prompts. Your task is to generate a highly detailed, atmospheric prompt following this EXACT example format:
"Cinematic, Historical Photography, Marie Antoinette, standing on the balcony with her back to the camera, looking down at an angry revolutionary crowd, Full Shot, High Angle, Palace of Versailles, 18th-century French aristocratic fashion, distressed and chaotic revolutionary background with rioting civilians and armed soldiers, inspired by Vittorio Storaro, ARRIFLEX 435, 50mm Standard Prime, Kodak Vision3 250D, natural sunlight with dramatic shadows, warm golden tones contrasting with dark, muted colors of the crowd, Baroque Painting Aesthetic, tense and dramatic mood --ar 16:9 --style raw"

CRITICAL RULES:
1. NEVER use brackets [] in the output
2. ALWAYS use "inspired by" before the director/cinematographer name
3. ALWAYS append "Aesthetic" to the aesthetic style at the end
4. Use EXACTLY these camera angle terms:
- Eye-Level Angle
- High Angle
- Low Angle
- Overhead Angle / Bird's Eye View
- Worm's Eye View
- Dutch Angle / Tilted Angle
- Over-the-Shoulder Angle
- Point of View (POV) Angle
- Extreme High Angle
- Extreme Low Angle
- Shoulder-Level Angle
- Hip-Level Angle
- Knee-Level Angle
- Ground-Level Angle
- Crane Angle
- Tracking Angle
- Handheld Angle
- Reverse Angle
- Close Combat Angle
- Extreme Perspective Angle

EXACT ORDER OF ELEMENTS:
Cinematic, [genre], [subject], [detailed action/pose], [shot type], [camera angle], [location], [set details/fashion], [background], inspired by [style], [camera], [lens], [film stock], [lighting], [color palette], [aesthetic name] Aesthetic, [mood] --ar 16:9 --style raw

The prompt should feel natural and flowing, without any brackets or parameter labels.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Generate a ${
            isIllustration ? "detailed illustration/animation" : "cinematic"
          } prompt that captures this description: ${description}${
            originalContext ? `\nReference: ${originalContext}` : ""
          }`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    console.log("OpenAI Response:", content);

    const responseData = JSON.parse(content);
    if (
      !responseData.generatedPrompt ||
      typeof responseData.generatedPrompt !== "string"
    ) {
      throw new Error("Invalid prompt structure in OpenAI response");
    }

    return {
      generatedPrompt: responseData.generatedPrompt,
      parameters: parameters,
    };
  } catch (error) {
    console.error("Prompt Generation Error:", error);
    throw new Error(
      "Failed to generate prompt: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

async function analyzePhoto(base64Image: string): Promise<{
  generatedPrompt: string;
  photographyStyle: string;
  parameters: any;
}> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: prompt_for_image_request,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this reference image and create a Midjourney prompt that would EXACTLY recreate it. Mirror every visual detail, technical aspect, and artistic quality precisely as they appear in the image. Pay special attention to identifying the correct shot type from the provided list and creating rich, descriptive details about the scene, subjects, and atmosphere.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7,
    });


    const content = visionResponse.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsedContent = JSON.parse(content);
    let generatedPrompt = parsedContent.generatedPrompt.replace(
      /\s*,\s*/g,
      " , "
    );
    return {
      photographyStyle:
        parsedContent.photographyStyle || "Portrait Photography",
      generatedPrompt: generatedPrompt || content,
      parameters: parsedContent.parameters || {
        photographyGenre: "Portrait Photography",
        shotType: "Medium Shot (MS)",
        cameraAngle: "Eye-Level Angle",
        style: "Roger Deakins",
        camera: "ARRI ALEXA",
        lens: "Standard 50mm",
        filmStock: "Kodak Vision3 500T",
        lighting: "natural ambient lighting",
        colorPalette: "natural balanced colors",
        mood: "natural contemplative mood",
        aesthetic: "Cinematic Realism Aesthetic",
      },
    };
  } catch (error) {
    console.error("OpenAI Vision API Error:", error);
    throw new Error(
      "Failed to analyze image: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

async function analyzePhotoForMotion(
  base64Image: string,
  mimeType: string,
  additionalNotes?: string
): Promise<MotionAnalysis> {
  try {
    console.log("Starting motion analysis for photo");
    const systemPrompt = `You are a cinematic motion designer and director. Your task is to analyze this image and create a sophisticated scene that smoothly integrates visual elements with any provided movement instructions.

${
  additionalNotes
    ? `PRIORITY INSTRUCTION: Naturally incorporate this specific movement into the scene: "${additionalNotes}"

Movement Integration Rules:
1. Treat these notes as a primary action that MUST be included
2. Blend this action naturally with the existing scene elements
3. Adjust camera movements to capture this action effectively
4. Maintain believable timing`
    : ""
}

Scene Analysis Process:
1. First identify the core subject(s) and their current state/action
2. Note any secondary elements that could interact
3. Consider the spatial relationship between elements
4. Plan camera movement to best capture the action flow

Your response should be in JSON format with two detailed sections that describe the scene:

1. frameMovement: A natural, flowing description that includes:
   - Primary subject action
   - Any specified movement notes
   - Environmental motion
   - Logical action sequence
   Maximum 250 characters.

2. cameraMovement: Camera direction that:
   - Focuses on the main action
   - Captures any secondary movements
   - Creates visual flow
   - Maintains scene continuity
   Maximum 250 characters.

CRITICAL MOVEMENT RULES:
- All described actions must be natural and realistic
- Limit to 1-2 main movements
- Keep camera movements simple and achievable
- Ensure smooth integration of provided notes

Return a JSON object with this exact structure:
{
  "frameMovement": "Movement Generation:\\n[Your movement description]",
  "cameraMovement": "[Your camera movement description]"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and create a detailed scene that naturally incorporates any provided movement instructions.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    console.log("Motion analysis completed:", content);

    const parsedContent = JSON.parse(content);

    if (!parsedContent.frameMovement || !parsedContent.cameraMovement) {
      throw new Error("Invalid response format from motion analysis");
    }

    // Remove prefixes from the responses
    // Clean and ensure complete sentences
    const cleanAndComplete = (text: string, maxLength: number): string => {
      // Remove prefixes and clean text
      let cleaned = text
        .replace(/^Movement Generation \(\d+-Second Scene\):\s*/i, "")
        .replace(/^Subject Movement:?\s*/i, "")
        .replace(/Subject Movement:?\s*/i, "")
        .replace(/\bSubject Movement:?\s*/gi, "")
        .replace(/Camera Movement:\s*/i, "")
        .trim();

      // If text exceeds max length, find last complete sentence
      if (cleaned.length > maxLength) {
        const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
        let result = "";
        for (const sentence of sentences) {
          if ((result + sentence).length <= maxLength) {
            result += sentence;
          } else {
            break;
          }
        }
        cleaned = result.trim();
      }

      return cleaned;
    };

    const cleanFrameMovement = cleanAndComplete(
      parsedContent.frameMovement,
      250
    );
    const cleanCameraMovement = cleanAndComplete(
      parsedContent.cameraMovement,
      250
    );

    return {
      frameMovement: cleanFrameMovement,
      cameraMovement: cleanCameraMovement,
    };
  } catch (error) {
    console.error("Motion Analysis Error:", error);
    if (error instanceof Error) {
      if (error.message.includes("maximum context length")) {
        throw new Error(
          "Image too complex. Please try a smaller or simpler image."
        );
      }
      if (error.message.includes("exceeded your current quota")) {
        throw new Error("API quota exceeded. Please try again later.");
      }
      if (error.message.includes("model not found")) {
        throw new Error(
          "Service temporarily unavailable. Please try again later."
        );
      }
      if (error.message.includes("Request too large")) {
        throw new Error(
          "Image size exceeds API limits. Please use a smaller image or reduce quality."
        );
      }
    }
    throw new Error(
      "Failed to analyze image for motion: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

interface MotionAnalysis {
  frameMovement: string;
  cameraMovement: string;
}

interface MotionGenerationParams {
  basePrompt: string;
  maxCharacters?: number;
  cameraMovement?: string;
  currentTemplate?: any;
}

async function generateMotionSuggestions({
  basePrompt,
  maxCharacters = 500,
  cameraMovement,
  currentTemplate,
}: MotionGenerationParams): Promise<MotionAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a cinematic motion designer and director. Analyze the scene and create precise shot descriptions, respecting these provided template values:
${
  currentTemplate
    ? `LOCKED VALUES (DO NOT CHANGE):
Location: ${currentTemplate.location || "AI SUGGEST"}
Time of Day: ${currentTemplate.timeOfDay || "AI SUGGEST"}
Lighting: ${currentTemplate.lightingStyle || "AI SUGGEST"}
Director Style: ${currentTemplate.directorStyle || "AI SUGGEST"}
Film Stock: ${currentTemplate.filmStock || "AI SUGGEST"}
Color Palette: ${currentTemplate.colorPalette || "AI SUGGEST"}
Mood: ${currentTemplate.mood || "AI SUGGEST"}\n`
    : ""
}

Analyze the scene and create precise shot descriptions following this exact data source hierarchy:

SHOT STRUCTURE RULES:
1. Each shot must follow this EXACT structure:
[Shot Type], [Camera Angle], [Action], [Location], [Time of Day], [Lighting], [Director Style], [Film Stock], [Color Palette], [Mood]

2. DATA SOURCE HIERARCHY:
- Shot Type: Use shot details provided in the prompt
- Camera Angle: Use camera angle details provided in the prompt
- Action: Extract from user's scene description
- Location: Use template value; if blank, suggest based on scene context
- Time of Day: Use template value; if blank, suggest based on scene context
- Lighting: Use template value; if blank, suggest based on mood/setting
- Director Style: Use template value; if blank, suggest filmmaker matching tone
- Film Stock: Use template value; if blank, suggest based on environment/style
- Color Palette: Use template value; if blank, suggest based on mood/lighting
- Mood: Use template value; if blank, suggest based on emotional context

Your response should be in JSON format with these details:

1. frameMovement: "Movement Within the Frame:" followed by a concise paragraph describing 1-2 main actions or movements. Focus on the primary motion and essential environmental elements only.

2. cameraMovement: "Camera Movement:" followed by a concise paragraph describing the camera movement${
            cameraMovement
              ? `, primarily using the specified "${cameraMovement}" technique`
              : "s"
          }. Keep the movements simple and achievable.

CRITICAL MOVEMENT RULES:
- Limit frame movement to 1-2 main actions
- For camera movement, ${
            cameraMovement
              ? `focus on executing the "${cameraMovement}" technique effectively`
              : "choose 1-2 primary movements maximum"
          }
- Ensure all described actions and movements are realistically achievable
- Avoid complex sequences

Return a JSON object with this exact structure:
{
  "frameMovement": "Movement Within the Frame:\\n[Your movement description]",
  "cameraMovement": "Camera Movement:\\n[Your camera movement description]"
}`,
        },
        {
          role: "user",
          content: basePrompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsedContent = JSON.parse(content);

    // Helper function to truncate text at sentence boundary
    const truncateAtSentence = (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text;

      // Find the last complete sentence that fits
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      let truncated = "";

      for (const sentence of sentences) {
        if ((truncated + sentence).length <= maxLength) {
          truncated += sentence;
        } else {
          // If no complete sentence fits, truncate at last word
          if (truncated === "") {
            const words = text.slice(0, maxLength).split(" ");
            words.pop(); // Remove potentially partial word
            truncated = words.join(" ") + ".";
          }
          break;
        }
      }

      return truncated.trim();
    };

    return {
      frameMovement: truncateAtSentence(
        parsedContent.frameMovement.trim(),
        490
      ),
      cameraMovement: truncateAtSentence(
        parsedContent.cameraMovement.trim(),
        490
      ),
    };
  } catch (error: unknown) {
    console.error("Motion Generation Error:", error);
    throw error;
  }
}

function analyzeMovementDirection(description: string): {
  movementDirection: "left_to_right" | "right_to_left" | "none";
  enterFrame: "left" | "right" | "none";
  exitFrame: "left" | "right" | "none";
} {
  const desc = description.toLowerCase();

  // Analyze movement direction
  const leftToRight =
    desc.includes("moves right") ||
    desc.includes("towards right") ||
    desc.includes("to the right");
  const rightToLeft =
    desc.includes("moves left") ||
    desc.includes("towards left") ||
    desc.includes("to the left");

  // Analyze frame entry/exit
  const enterLeft =
    desc.includes("enters from left") || desc.includes("from left side");
  const enterRight =
    desc.includes("enters from right") || desc.includes("from right side");
  const exitLeft =
    desc.includes("exits left") || desc.includes("leaves to left");
  const exitRight =
    desc.includes("exits right") || desc.includes("leaves to right");

  return {
    movementDirection: leftToRight
      ? "left_to_right"
      : rightToLeft
      ? "right_to_left"
      : "none",
    enterFrame: enterLeft ? "left" : enterRight ? "right" : "none",
    exitFrame: exitLeft ? "left" : exitRight ? "right" : "none",
  };
}

function setColorConsistency(
  sceneTemplate: any,
  shotDetails: any,
  shotIndex: number = 0,
  totalShots: number = 1
): any {
  // Extract colors and lighting from scene description if template is empty
  const description = shotDetails?.description?.toLowerCase() || "";

  // Determine base values from template or context
  const baseColorPalette =
    sceneTemplate?.colorPalette || extractColorFromContext(description);
  const baseLighting =
    sceneTemplate?.lightingStyle || extractLightingFromContext(description);
  const timeOfDay =
    sceneTemplate?.timeOfDay || extractTimeFromContext(description);

  // Helper function to extract context-appropriate colors
  function extractColorFromContext(desc: string): string {
    if (desc.includes("summer") || desc.includes("garden"))
      return "vibrant natural greens with warm highlights";
    if (desc.includes("winter")) return "cool blues and crisp whites";
    if (desc.includes("sunset")) return "warm golden tones with purple accents";
    if (desc.includes("night")) return "deep blues with selective highlights";
    if (desc.includes("rain")) return "muted grays with reflective highlights";
    return "natural balanced colors";
  }

  // Helper function to extract context-appropriate lighting
  function extractLightingFromContext(desc: string): string {
    if (desc.includes("sunset")) return "warm directional golden hour lighting";
    if (desc.includes("night"))
      return "selective artificial lighting with deep shadows";
    if (desc.includes("overcast") || desc.includes("cloudy"))
      return "soft diffused lighting";
    if (desc.includes("morning")) return "crisp directional morning light";
    return "natural ambient lighting";
  }

  // Helper function to extract time of day from context
  function extractTimeFromContext(desc: string): string {
    if (desc.includes("morning")) return "morning";
    if (desc.includes("sunset") || desc.includes("dusk")) return "sunset";
    if (desc.includes("night")) return "night";
    if (desc.includes("afternoon")) return "afternoon";
    return "day";
  }

  // Detect time progression
  const isTransitionShot =
    description.toLowerCase().includes("transition") ||
    description.toLowerCase().includes("time passing");

  // Color progression based on scene position
  let progressiveColorPalette = baseColorPalette;
  let progressiveLighting = baseLighting;

  if (
    isTransitionShot ||
    timeOfDay.includes("sunset") ||
    timeOfDay.includes("dusk")
  ) {
    const progress = shotIndex / totalShots;
    if (progress < 0.3) {
      progressiveLighting = "warm natural lighting";
      progressiveColorPalette = "warm golden tones";
    } else if (progress < 0.7) {
      progressiveLighting = "diffused sunset lighting";
      progressiveColorPalette = "rich amber and purple hues";
    } else {
      progressiveLighting = "soft evening lighting";
      progressiveColorPalette = "deep blue and violet tones";
    }
  }

  // Emotional tone adjustments
  const emotionalKeywords = {
    tense: {
      lighting: "harsh directional lighting with deep shadows",
      colors: "high contrast monochromatic with rich blacks",
    },
    romantic: {
      lighting: "soft diffused lighting with gentle rim highlights",
      colors: "warm pastels with golden undertones",
    },
    melancholic: {
      lighting: "muted overcast lighting with soft gradients",
      colors: "desaturated cool tones with subtle blue cast",
    },
    joyful: {
      lighting: "bright natural lighting with crisp highlights",
      colors: "vibrant warm tones with airy highlights",
    },
    nostalgic: {
      lighting: "golden hour lighting with long shadows",
      colors: "vintage warm tones with amber glow",
    },
    mysterious: {
      lighting: "low-key lighting with selective highlights",
      colors: "dark rich tones with deep contrast",
    },
    intimate: {
      lighting: "soft practical lighting with gentle falloff",
      colors: "warm intimate tones with subtle shadows",
    },
    dramatic: {
      lighting: "bold directional lighting with strong contrast",
      colors: "bold saturated colors with deep shadows",
    },
  };

  const timeOfDayLighting = {
    dawn: {
      lighting: "cool ambient light with soft directional rays",
      colors: "cool blues transitioning to warm highlights",
    },
    morning: {
      lighting: "bright directional sunlight with crisp shadows",
      colors: "clean daylight with cool undertones",
    },
    noon: {
      lighting: "harsh overhead sunlight with minimal shadows",
      colors: "bright neutral tones with strong highlights",
    },
    afternoon: {
      lighting: "warm directional light with medium shadows",
      colors: "warm natural tones with golden accents",
    },
    sunset: {
      lighting: "golden hour backlighting with long shadows",
      colors: "rich warm tones with orange cast",
    },
    dusk: {
      lighting: "soft ambient blue hour light",
      colors: "deep blues with purple undertones",
    },
    night: {
      lighting: "selective artificial lighting with deep shadows",
      colors: "rich dark tones with selective highlights",
    },
  };

  const weatherLighting = {
    sunny: {
      lighting: "bright direct sunlight with sharp shadows",
      colors: "vibrant natural colors with strong contrast",
    },
    cloudy: {
      lighting: "soft diffused lighting with minimal shadows",
      colors: "muted tones with even distribution",
    },
    rainy: {
      lighting: "filtered gray light with wet reflections",
      colors: "desaturated tones with specular highlights",
    },
    foggy: {
      lighting: "diffused atmospheric lighting",
      colors: "muted tones with reduced contrast",
    },
    snowy: {
      lighting: "bright diffused lighting with blue cast",
      colors: "cool tones with bright highlights",
    },
  };

  // Check for emotional keywords in description
  for (const [mood, style] of Object.entries(emotionalKeywords)) {
    if (shotDetails.description?.toLowerCase().includes(mood)) {
      progressiveLighting = style.lighting;
      progressiveColorPalette = style.colors;
      break;
    }
  }

  // Analyze description for time of day
  let timeBasedLighting = baseLighting;
  let timeBasedColors = progressiveColorPalette;

  for (const [timeKey, style] of Object.entries(timeOfDayLighting)) {
    if (shotDetails.description?.toLowerCase().includes(timeKey)) {
      timeBasedLighting = style.lighting;
      timeBasedColors = style.colors;
      break;
    }
  }

  // Check weather conditions
  for (const [weather, style] of Object.entries(weatherLighting)) {
    if (shotDetails.description?.toLowerCase().includes(weather)) {
      timeBasedLighting = `${timeBasedLighting} with ${style.lighting}`;
      timeBasedColors = `${timeBasedColors}, ${style.colors}`;
      break;
    }
  }

  // Blend emotional tone
  let finalLighting = timeBasedLighting;
  let finalColors = timeBasedColors;

  for (const [emotion, style] of Object.entries(emotionalKeywords)) {
    if (shotDetails.description?.toLowerCase().includes(emotion)) {
      finalLighting = `${timeBasedLighting} enhanced with ${style.lighting}`;
      finalColors = `${timeBasedColors} balanced with ${style.colors}`;
      break;
    }
  }

  return {
    ...shotDetails,
    colorPalette: finalColors,
    lighting: finalLighting,
  };
}

function maintainVisualContinuity(shots: any[]): any[] {
  return shots.map((shot, index) => {
    const prevShot = index > 0 ? shots[index - 1] : null;
    const movement = analyzeMovementDirection(shot.description);

    if (prevShot) {
      const prevMovement = analyzeMovementDirection(prevShot.description);

      // Apply 180-degree rule
      if (prevMovement.movementDirection !== "none") {
        movement.movementDirection = prevMovement.movementDirection;
      }

      // Maintain entry/exit continuity
      if (prevMovement.exitFrame === "right") {
        movement.enterFrame = "left";
      } else if (prevMovement.exitFrame === "left") {
        movement.enterFrame = "right";
      }
    }

    return {
      ...shot,
      ...movement,
    };
  });
}

function extractCharacterReference(sceneDescription: string): string {
  // Look for character introductions with articles
  const patterns = [
    /\b(A|An|The)\s+([^,.!?]+(?:girl|boy|man|woman|person|figure|character))/i,
    /\b(A|An|The)\s+([^,.!?]+(?:teenager|student|professional|officer|detective))/i,
  ];

  for (const pattern of patterns) {
    const match = sceneDescription.match(pattern);
    if (match) {
      // Convert "A/An" to "The" for subsequent references
      return match[0].replace(/^(A|An)\s+/i, "The ");
    }
  }
  return "";
}

async function breakdownScene(
  sceneDescription: string,
  currentTemplate?: any
): Promise<{
  shots: Array<{
    description: string;
    shotType: string;
    cameraAngle: string;
    transition: string;
    generatedPrompt: string;
    style: string;
    camera: string;
    lens: string;
    filmStock: string;
    lighting: string;
    colorPalette: string;
    mood: string;
  }>;
}> {
  try {
    // Extract template values that must be enforced
    const templateValues = {
      location: currentTemplate?.location || "",
      timeOfDay: currentTemplate?.timeOfDay || "",
      weather: currentTemplate?.weather || "",
      directorStyle: currentTemplate?.directorStyle || "",
      filmStock: currentTemplate?.filmStock || "",
      colorPalette: currentTemplate?.colorPalette || "",
      mood: currentTemplate?.mood || "",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a master film editor and cinematographer. You must follow these EXACT template values in your shot descriptions:

MANDATORY VALUES TO USE (DO NOT MODIFY OR REPLACE THESE):
Location: ${templateValues.location}
Time of Day: ${templateValues.timeOfDay}
Weather: ${templateValues.weather}
${
  templateValues.directorStyle
    ? `Director Style: ${templateValues.directorStyle}`
    : ""
}
${templateValues.filmStock ? `Film Stock: ${templateValues.filmStock}` : ""}
${
  templateValues.colorPalette
    ? `Color Palette: ${templateValues.colorPalette}`
    : ""
}
${templateValues.mood ? `Mood: ${templateValues.mood}` : ""}

${
  currentTemplate?.hasCharacter
    ? `CHARACTER INFORMATION (MANDATORY CONSISTENCY):
Name: ${currentTemplate.characterName || "Unnamed character"}
Age: ${currentTemplate.characterAge || "Unspecified age"}
Appearance: ${currentTemplate.characterAppearance || "Default appearance"}
Clothing/Style: ${currentTemplate.characterClothing || "Default clothing"}

CRITICAL CHARACTER RULES:
1. FIRST SHOT MUST introduce character with FULL description including name, appearance, and clothing
2. NEVER use "the woman/man" - ALWAYS use character name or pronouns
3. SUBSEQUENT SHOTS must reference the character consistently without inventing new traits
4. MAINTAIN exact character appearance and clothing across all shots
5. Focus each shot on different aspects while keeping character visually consistent
6. Character movement and positioning must flow logically between shots`
    : ""
}

${
  currentTemplate?.hasCharacter
    ? `EXAMPLE CHARACTER SHOT STRUCTURE:
Shot 1: "[Name], [full appearance], wearing [clothing]..."
Shot 2: "[Name]'s [specific detail/action]..."
Shot 3: "[Name/pronoun] [action/position]..."`
    : ""
}

CRITICAL RULES:
1. NEVER create new times of day - use ONLY "${templateValues.timeOfDay}"
2. NEVER create new weather conditions - use ONLY "${templateValues.weather}"
3. NEVER create new locations - use ONLY "${templateValues.location}"
4. NEVER override or duplicate these values with different ones
5. Integrate these values naturally into shot descriptions
6. Focus on describing action, composition, and camera work

MAIN CHARACTER REFERENCE: "${extractCharacterReference(sceneDescription)}"
USE THIS EXACT CHARACTER REFERENCE IN EVERY SHOT.

SHOT PROMPT STRUCTURE:
Each shot MUST follow this EXACT format in order:
[Shot Type], [Camera Angle], [Photography Genre], [Action], [Location], [Time of Day], [Weather], [In the Style of Director], [Film Stock], [Mood]

LOCATION COLOR RULES:
1. NEVER use generic terms like "neutral earth tones"
2. Colors MUST be derived from the actual location:
   - Garden: "verdant greens with blooming flower accents"
   - Beach: "sun-bleached sand tones with azure water reflections"
   - Forest: "deep forest greens with dappled sunlight"
   - Urban: "concrete grays with neon reflections"
   - Desert: "rich terracotta and golden sand hues"
   - Mountains: "rugged stone grays with snow-capped whites"

EXAMPLE FORMAT:
"Tracking Shot, Low Angle, Street Photography, Teenage boy running through a vibrant garden path, Summer Garden with blooming flowers, Morning, Sunny and warm, In the Style of Wong Kar-Wai, Kodak Vision3 500T, Joyful mood"

WEATHER GUIDELINES:
- Summer: "Sunny and warm", "Clear summer day", "Bright and humid"
- Winter: "Snowy", "Crisp and cold", "Frosty"
- Garden/Park: ALWAYS specify "sunny", "partly cloudy", or appropriate weather

PHOTOGRAPHY GENRE RULES:
Use ONLY these recognized photography genres:
- Documentary Photography
- Portrait Photography
- Fashion Photography
- Street Photography
- Still Life Photography
- Architecture Photography
- Landscape Photography
- Sports Photography
- Environmental Photography
- Wildlife Photography
- Travel Photography
- Nature Photography
- Macro Photography
- Fine Art Photography
- Editorial Photography


CRITICAL RULES:
1. NEVER deviate from the exact shot structure order
2. NEVER use custom or hybrid photography genres
3. NEVER abbreviate or combine elements
4. Each shot MUST include ALL elements in the exact order
5. Use the EXACT character reference from Scene Description in every shot
6. NEVER use pronouns (he/she/they) to refer to characters

Advanced Editing Principles:
- Classical Hollywood continuity editing
- Soviet montage theory
- French New Wave jump cuts
- Modern dynamic editing techniques
- Rhythm and pacing analysis

SHOT PROMPT STRUCTURE:
Each shot MUST follow this EXACT format:
[Shot Type], [Camera Angle], [Photography Genre], [Action], [Location], [Timeof Day], [Lighting], [In the Style of Director], [Film Stock], [Color Palette], [Mood]

PHOTOGRAPHY GENRE RULES:
1. Use ONLY these recognized photography genres:
- Documentary Photography
- Portrait Photography
- Fashion Photography
- Street Photography
- Still Life Photography
- Architecture Photography
- Landscape Photography
- Sports Photography
- Environmental Photography
- Wildlife Photography
- Travel Photography
- Nature Photography
- Macro Photography
- Fine Art Photography
- Editorial Photography

2. NEVER use:
- Custom or hybrid genres
- Combined genre terms
- Modified genre names (e.g. "Cinematic Portrait")

Technical Considerations:
- Each shot MUST be designed for a concise duration
- Camera movement must be precisely timed within this constraint
- Action and blocking must be realistically achievable
- Transitions must maintain visual continuity
- Technical specifications must be practically achievable

Break down scenes into precisely timed shots following these principles. For each shot, include:
1.<previous_generation>Detailed shot description with specific timing considerations
2. Technical shot specifications (type, angle, movement)
3. Advanced transition planning
4. A complete Midjourney prompt following this exact structure:
"Cinematic, [Photography Type], [Subject], [Action], [Shot Type, camera angle], [Location], [time of a day, year], [Fashion/film set design], [name of cinematographer or film director], [movie camera type], [lenses], [film stock], [type and source of Lighting], [Color Palette], [Mood/Emotion] --ar 16:9--style raw"

CRITICAL RULES:
1. Use ONLY professional photography types in the [Photography Type] section:
   - landscape photography
   - portrait photography
   - sport photography
   - editorial photography
   - street photography
   - fashion photography
   - product photography
   - abstract photography
   - fine art photography
   - documentary photography
   - architectural photography
   - wildlife photography

2. Use ALL provided parameters in their designated positions EXACTLY as provided:
   - [Shot Type, cameraangle] must be combined with comma
   - [movie camera type] must be specific model
   - [lenses] must include focal length
   - [film stock] must be specific brand and type
   - [type and source of Lighting] must be full description
   - [Color Palette] must use full descriptive name
   - [Mood/Emotion] must use full descriptive name

3. Default parameters if not specified:
   - Camera: "ARRI ALEXA"
   - Lens: "Standard 50mm"
   - Film Stock: "KodakVision3 500T"
   - Lighting: "natural ambient lighting"
   - Color Palette: "natural balanced colors"
   - Mood: "natural contemplative mood"

4. FORMAT RULES:
   - Return ONLY valid JSON without any markdown formatting
   - NEVER use markdown code blocks or backticks
   - NEVER include \`\`\`json or similar markers
   - ALWAYS use double quotes for strings
   - ENSURE all JSON is properly escaped

Return JSON with this exact structure:
{
  "shots": [
    {
      "description": "Precise shot description",
      "shotType": "Shot type specification",
      "cameraAngle": "Camera angle and movement",
      "transition": "Transition to next shot",
      "generatedPrompt": "Complete Midjourney prompt",
      "style": "Cinematographer reference",
      "camera": "Camera specification",
      "lens": "Lens choice",
      "filmStock": "Film stock selection",
      "lighting": "Lighting setup",
      "colorPalette": "Color scheme",
      "mood": "Emotional tone"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Break down this scene into a sequence of precise shots that demonstrate mastery of cinematographic principles. For each shot, include a complete Midjourney prompt that captures the exact visual qualities needed:

${sceneDescription}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    try {
      const result = JSON.parse(content);

      result.shots = result.shots.map((shot: any) => ({
        description: shot.description || "",
        shotType: shot.shotType || "Medium Shot",
        cameraAngle: shot.cameraAngle || "Eye Level",
        transition: shot.transition || "Cut",
        generatedPrompt: shot.generatedPrompt || "",
        camera: shot.camera || "ARRI ALEXA",
        lens: shot.lens || "Standard 50mm",
        lighting: shot.lighting || "natural ambient lighting",
        colorPalette: shot.colorPalette || "natural balanced colors",
        mood: shot.mood || "natural contemplative mood",
      }));

      // Apply movement and color continuity logic
      result.shots = maintainVisualContinuity(result.shots);
      result.shots = result.shots.map((shot: any, index: number) =>
        setColorConsistency(currentTemplate, shot, index, result.shots.length)
      );
      return result;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Content:", content);
      throw new Error("Invalid JSON response format. Please try again.");
    }
  } catch (error: unknown) {
    console.error("Scene Breakdown Error:", error);
    if (error instanceof Error) {
      if (error.message.includes("maximum context length")) {
        throw new Error(
          "Scene description too long. Please try a shorter description."
        );
      }
      if (error.message.includes("parsing JSON")) {
        throw new Error("Invalid response format. Please try again.");
      }
    }
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error("Failed to break down scene: " + errorMessage);
  }
}

async function generateStyleSuggestions(
  genre: string,
  movieType: string,
  target: string,
  subject: string
): Promise<StyleSuggestions> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a master film style consultant with deep expertise in cinematography, directing, and visual storytelling. Your knowledge encompasses:

Classical Film Theory and Techniques:
- Mise-en-scène composition and deep staging
- Eisenstein's montage theory
- Bazin's realist theory
- Method acting and performance direction
- Advanced lighting techniques (Rembrandt, Paramount, etc.)

Modern Cinematography:
- Digital cinematography innovations
- Virtual production techniques
- Advanced camera movement systems
- Contemporary color gradingapproaches
- High-end lens characteristics and applications

Genre-Specific Visual Language:
- Unique visual grammars for each film genre
- Historical evolution of genre aesthetics
- Cross-genre innovation opportunities
- Cultural and regional influences
- Contemporary genre subversions

Award-Winning Techniques:
- Academy Award-winning cinematography analysis
- Festival circuit artistic approaches
- Innovative technical achievements
- Breakthrough visual styles
- Notable director-cinematographer collaborations

Format your response as a JSON object with this structure:
{
  "visualStyle": {
    "directors": ["List 3 visionary directors known for innovative work in this genre"],
    "cinematographers": ["List 3 master cinematographers with distinctive approaches"],
    "movieReferences": ["List 3-5 critically acclaimed films that revolutionized the genre"],
    "colorPalette": "Detailed description of sophisticated color theory and grading approach",
    "visualMood": "In-depth analysis of atmospheric and tonal qualities",
    "camerawork": "Technical breakdown of advanced camera techniques, movements, and lens choices"
  },
  "narrativeStyle": {
    "pacing": "Analysis of rhythm, timing, and emotional flow",
    "storytellingApproach": "Advanced narrative techniques specific to genre and format",
    "thematicElements": ["3-5 sophisticated thematic concepts that elevate the material"]
  }
}`,
        },
        {
          role: "user",
          content: `Generate sophisticated style suggestions for:
Genre: ${genre}
Movie Type: ${movieType}
Target Audience: ${target}
Subject/Theme: ${subject}

Provide innovative, award-worthy cinematographic approaches that push creative boundaries while remaining true to genre conventions. Focus on unique visual solutions that elevate the material beyond standard approaches.`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
  } catch (error: unknown) {
    console.error("Style Suggestions Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error("Failed to generate style suggestions: " + errorMessage);
  }
}

async function generateScreenplay(
  subject: string,
  genre: string,
  target: string,
  movieType: string,
  additionalNotes: string = "",
  styleSuggestions?: StyleSuggestions
): Promise<{
  title: string;
  logline: string;
  synopsis: string;
  themes: string[];
  keyScenes: Array<{ name: string; description: string; visualNotes: string }>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional screenwriter with expertise in ${genre} and ${movieType}. 
Create a complete story suitable for a ${target} audience. Format your response as a JSON object with this structure:

{
  "title": "Creative and fitting title",
  "logline": "One sentence story summary",
  "synopsis": "Detailed story synopsis (2-3 paragraphs)",
  "themes": ["Theme 1", "Theme 2"],
  "keyScenes": [
    {
      "name": "Scene name",
      "description": "Scene description",
      "visualNotes": "Visual direction notes"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Create a ${genre} story about: ${subject}
Additional requirements: ${additionalNotes}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response received");
    }

    return JSON.parse(content);
  } catch (error: unknown) {
    console.error("Screenplay Generation Error:", error);
    throw new Error(
      "Failed to generate screenplay: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

interface StyleSuggestions {
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

interface Story {
  title: string;
  logline: string;
  synopsis: string;
  themes: string[];
  keyScenes: Array<{
    name: string;
    description: string;
    visualNotes: string;
  }>;
}

async function analyzeIllustration(
  base64Image: string
): Promise<{ generatedPrompt: string }> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert animation and illustration analyst. Your task is to analyze this image and create a detailed prompt that follows this EXACT structure:

[Illustration/Animation Type], [Subject (character species, gender, age, appearance)], [Action], [Shot Type], [Camera Angle], [Location], [Time of Day, Year], [Fashion/Film Set Design, Background], inspired by [Style of Illustrator/Animation Studio], created in [3D Rendering/Animation Engine], [Type and Source of Lighting], [Color Palette], [Illustration/Animation Aesthetic], [Mood/Emotion], --ar 16:9 --style raw

Example prompt:
"Cartoon-Style Illustration, adorable young girl with curly white hair resembling sheep's wool, wearing a chunky knitted sweater dress, brown leather boots, and woolen socks, standing with arms crossed and eyes closed, Medium Full Shot, Eye Level, serene autumn forest setting with golden leaves and soft sunlight, warm color palette with earthy tones and cozy textures, inspired by John Burningham, created in Blender, natural soft lighting with diffused highlights, Classic Disney Animation Aesthetic, whimsical and heartwarming mood, --ar 16:9 --style raw"

CRITICAL RULES:
1. NEVER start the prompt with "3D". If the style is 3D, use proper format like "Pixar-Style 3D Animation" or "Digital 3D Illustration"
2. ALWAYS use the exact phrase "inspired by" before the style reference, e.g., "inspired by Hayao Miyazaki Style"
3. ALWAYS use "created in" before the rendering engine
4. ALWAYS include Camera Angle from the approved list
5. ALWAYS include an [Illustration/Animation Aesthetic] parameter
6. Be specific and detailed in describing the subject's characteristics
7. Include all required parameters in the exact order specified above
8. Ensure natural flow between parameters while maintaining technical accuracy

When analyzing, focus on:
1. Choose a proper starting Illustration/Animation Type (never start with "3D")
2. Describe the main subject's characteristics in detail
3. Capture any actions or movements
4. Specify both Shot Type and Camera Angle clearly
5. Note environmental and temporal details
6. Format the style reference as "inspired by [Style]"
7. Include "created in [Engine]"
8. Describe lighting and color schemes
9. Include a specific aesthetic and mood

Return JSON with this structure:
{
  "generatedPrompt": "complete prompt following format above"
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this illustration and generate a precise, structured prompt that would recreate its style and content.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = visionResponse.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsedContent = JSON.parse(content);
    return {
      generatedPrompt: parsedContent.generatedPrompt,
    };
  } catch (error) {
    console.error("Illustration Analysis Error:", error);
    throw new Error(
      "Failed to analyze illustration: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

export {
  generateMidjourneyPrompt,
  analyzePhoto,
  analyzeIllustration,
  breakdownScene,
  analyzePhotoForMotion,
  generateMotionSuggestions,
  generateStyleSuggestions,
  generateScreenplay,
};
