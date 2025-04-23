export function generateScenePromptWithCharacter({
  sceneDescription,
  location,
  timeOfDay,
  weather,
  filmStock,
  directorStyle,
  characterName,
  characterAge,
  characterAppearance,
  characterClothing,
}: {
  sceneDescription: string[];
  location: string[];
  timeOfDay: string[];
  weather: string[];
  filmStock: string[];
  directorStyle: string[];
  characterName: string;
  characterAge: string[];
  characterAppearance: string[];
  characterClothing: string[];
}): string {
  const hasCharacter = characterName?.trim();

  const characterInfoBlock = hasCharacter
    ? `
CHARACTER INFORMATION:
Name: ${characterName}
Age: ${characterAge || "not specified"}
Appearance: ${characterAppearance || "not specified"}
Clothing: ${characterClothing || "not specified"}

SCENE RULES:
- ALWAYS mention the character by name ("${characterName}") in every shot.
- NEVER use generic words like "girl," "boy," "woman," "man," etc.
- Every shot MUST include: age, appearance, and clothing description (at least once per sentence).
- Do NOT paraphrase or summarize the appearance.
- Do NOT invent or change any visual details — always reuse these exactly:
   - Appearance: ${characterAppearance}
   - Clothing: ${characterClothing}

SHOT TEMPLATE TO REPEAT (USE FOR EACH SHOT):
[Shot type], [Angle], [Photography style], on ${characterName}, a ${characterAge}-year-old with ${characterAppearance}, wearing ${characterClothing}, [describe action/mood/environment].

EXAMPLE (REPEAT FOR EACH SHOT):
"Close-Up, Eye Level, Portrait Photography, on Anna, a 24-year-old with blond curly hair, wearing a summer dress, as she reaches for a flower in the window light."

If needed, use pronouns in second sentences only, never for first visual description.
`
    : `
NO CHARACTER:
This scene does not include a named character. Focus only on action, setting, lighting, and camera work.
`;

  return `
You are a world-class cinematic shot breakdown assistant.

Generate a 4-shot sequence for the following scene. Each shot must include:
- Camera type, angle, and visual style
- Emotional tone and environment
- Transition between shots

INCLUDE IN ALL SHOTS:
- Location: ${location}
- Time of Day: ${timeOfDay}
- Weather: ${weather}
${filmStock ? `- Film Stock: ${filmStock}` : ""}
${directorStyle ? `- Director Style: ${directorStyle}` : ""}

Scene Description:
${sceneDescription || "[User didn't write one]"}

${characterInfoBlock}
`.trim();
}
