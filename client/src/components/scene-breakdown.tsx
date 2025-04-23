import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateScenePromptWithCharacter } from "@/lib/promptBuilder";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Copy } from "lucide-react";

interface SceneTemplate {
  location: string;
  timeOfDay: string;
  mood: string;
  filmStock: string;
  lightingStyle: string;
  colorPalette: string;
  directorStyle: string;
  weather: string;
  hasCharacter: boolean;
  characterName: string;
  characterAge: string;
  characterAppearance: string;
  characterClothing: string;
}

interface Shot {
  id: number;
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
  location?: string;
  timeOfDay?: string;
  directorStyle?: string;
  movementDirection?: "left_to_right" | "right_to_left" | "none";
  enterFrame?: "left" | "right" | "none";
  exitFrame?: "left" | "right" | "none";
  weather?: string; // Added weather property
}

export function SceneBreakdown() {
  const { toast } = useToast();
  const [sceneDescription, setSceneDescription] = useState(
    () => localStorage.getItem("sceneDescription") || ""
  );
  const [shots, setShots] = useState<Shot[]>(() => {
    const saved = localStorage.getItem("shots");
    return saved ? JSON.parse(saved) : [];
  });
  const [sceneTemplate, setSceneTemplate] = useState<SceneTemplate | null>(
    () => {
      const saved = localStorage.getItem("sceneTemplate");
      return saved ? JSON.parse(saved) : null;
    }
  );

  // Extract template fields from scene description
  const extractTemplateFields = (description: string) => {
    if (!description) return;

    // Preserve existing user-entered values
    const template = {
      ...sceneTemplate,
      location: sceneTemplate?.location || extractLocation(description),
      timeOfDay: sceneTemplate?.timeOfDay || extractTimeOfDay(description),
      filmStock: sceneTemplate?.filmStock || extractFilmStock(description),
      directorStyle:
        sceneTemplate?.directorStyle || extractDirectorStyle(description),
      lightingStyle:
        sceneTemplate?.lightingStyle || extractLighting(description),
      mood: sceneTemplate?.mood || extractMood(description),
      colorPalette:
        sceneTemplate?.colorPalette || extractColorPalette(description),
      weather: sceneTemplate?.weather || extractWeather(description),
    };

    // Helper functions for extraction
    function extractLocation(text: string): string {
      const locationMap = {
        // Direct and contextual locations
        park: [
          "park",
          "playground",
          "garden",
          "grassy area",
          "lawn",
          "grass",
          "tree",
          "bench",
        ],
        beach: [
          "beach",
          "shore",
          "coast",
          "sand",
          "oceanfront",
          "wave",
          "ocean",
          "seashell",
        ],
        forest: ["forest", "woods", "woodland", "grove"],
        apartment: ["apartment", "flat", "condo", "residence"],
        street: ["street", "road", "avenue", "alley", "sidewalk"],
        restaurant: ["restaurant", "diner", "café", "cafe", "eatery"],
        office: ["office", "workplace", "cubicle", "desk"],
        house: ["house", "home", "mansion", "cottage"],
        city: ["building", "skyscraper", "downtown", "urban"],
      };

      const lowerText = text.toLowerCase();

      // Check direct mentions first
      for (const [location, keywords] of Object.entries(locationMap)) {
        if (keywords.some((keyword) => lowerText.includes(keyword))) {
          return location.charAt(0).toUpperCase() + location.slice(1);
        }
      }

      // Contextual analysis
      if (lowerText.includes("grass") || lowerText.includes("tree")) {
        return "Park";
      }

      return "";
    }

    // Helper functions for extraction (consolidated to avoid duplicates)
    function extractColorPalette(text: string): string {
      const sceneContexts: Record<
        string,
        { keywords: string[]; palette: string }
      > = {
        // Seasonal contexts
        winter: {
          keywords: [
            "winter",
            "snow",
            "icy",
            "frost",
            "december",
            "january",
            "february",
            "cold",
          ],
          palette:
            "Muted blues, frosty whites, desaturated earth tones with cold highlights",
        },
        spring: {
          keywords: ["spring", "bloom", "blossom", "april", "may", "fresh"],
          palette:
            "Soft pastels, light greens, delicate pink and yellow highlights",
        },
        summer: {
          keywords: ["summer", "hot", "june", "july", "august", "sunny"],
          palette: "Vibrant greens, warm yellows, glowing golden tones",
        },
        autumn: {
          keywords: ["autumn", "fall", "october", "november", "leaves"],
          palette: "Amber, burnt orange, deep reds, and brown earth tones",
        },
        // Environmental contexts
        nature: {
          keywords: ["park", "daytime", "garden", "meadow", "forest"],
          palette: "Natural greens, earth tones, atmospheric highlights",
        },
        urban: {
          keywords: ["city", "street", "downtown", "neon", "night", "urban"],
          palette: "Deep blues, muted grays, and vibrant neon highlights",
        },
        melancholy: {
          keywords: [
            "rain",
            "fog",
            "cloudy",
            "gloomy",
            "overcast",
            "melancholy",
          ],
          palette: "Desaturated blues, muted greens, and soft highlights",
        },
        warmLight: {
          keywords: [
            "campfire",
            "lantern",
            "fireplace",
            "candlelight",
            "sunset",
          ],
          palette: "Amber, orange, and warm brown hues",
        },
        romantic: {
          keywords: ["romantic", "intimate", "tender", "gentle", "emotional"],
          palette: "Soft pastels with warm, low-contrast hues",
        },
        thriller: {
          keywords: ["suspense", "thriller", "mystery", "tension", "dramatic"],
          palette:
            "Deep shadows, cold grays, and occasional intense color pops",
        },
        joyful: {
          keywords: ["playful", "cheerful", "happy", "energetic", "bright"],
          palette: "Bright, saturated primaries with energetic contrast",
        },
      };

      const lowerText = text.toLowerCase();

      // Check for seasonal context first (higher priority)
      // Check for seasonal context first (higher priority)
      const seasonalContexts: string[] = [
        "winter",
        "spring",
        "summer",
        "autumn",
      ];
      for (const season of seasonalContexts) {
        const context = sceneContexts[season as keyof typeof sceneContexts];
        if (
          context &&
          context.keywords.some((keyword: string) =>
            lowerText.includes(keyword)
          )
        ) {
          return context.palette;
        }
      }

      // Check other context matches
      for (const [contextType, context] of Object.entries(sceneContexts)) {
        // Skip seasonal contexts as we already checked them
        if (seasonalContexts.includes(contextType)) continue;

        if (
          context.keywords.some((keyword: string) =>
            lowerText.includes(keyword)
          )
        ) {
          return context.palette;
        }
      }

      // Environmental light source analysis
      if (lowerText.includes("neon") || lowerText.includes("fluorescent")) {
        return "Sharp neon colors with high contrast accents";
      }
      if (lowerText.includes("sunset") || lowerText.includes("golden hour")) {
        return "Rich golden oranges with purple and pink undertones";
      }
      if (lowerText.includes("moonlight") || lowerText.includes("starlight")) {
        return "Cool blues and silvers with deep shadow tones";
      }

      // Default with mood analysis
      if (lowerText.includes("dramatic") || lowerText.includes("intense")) {
        return "High contrast colors with bold accents";
      }
      if (lowerText.includes("peaceful") || lowerText.includes("calm")) {
        return "Harmonious, balanced tones with subtle variations";
      }

      return "Carefully balanced color palette suited to scene mood";
    }

    function extractLighting(text: string): string {
      const lowerText = text.toLowerCase();

      // Seasonal and Time-based Lighting
      if (
        (lowerText.includes("summer") || lowerText.includes("daytime")) &&
        lowerText.includes("park")
      ) {
        return "Golden sunlight with crisp highlights and warm bounce light";
      }

      if (
        lowerText.includes("winter") &&
        (lowerText.includes("snow") || lowerText.includes("morning"))
      ) {
        return "Cold, diffused light with blue undertones";
      }

      // Weather Conditions
      if (
        lowerText.includes("rain") ||
        lowerText.includes("storm") ||
        lowerText.includes("fog")
      ) {
        return "Soft, muted lighting with limited contrast";
      }

      // Urban and Artificial Light
      if (
        (lowerText.includes("neon") || lowerText.includes("city")) &&
        lowerText.includes("night")
      ) {
        return "Sharp neon lighting with vibrant color contrast";
      }

      // Interior Mood Lighting
      if (lowerText.includes("fireplace") || lowerText.includes("candle")) {
        return "Warm flickering light with rich shadows";
      }

      // Emotional and Genre-based Lighting
      if (lowerText.includes("suspense") || lowerText.includes("thriller")) {
        return "Low-key lighting with sharp contrast and deep blacks";
      }

      if (lowerText.includes("intimate") || lowerText.includes("emotional")) {
        return "Soft side lighting with warm shadows";
      }

      // Time of Day
      if (lowerText.includes("sunset") || lowerText.includes("golden hour")) {
        return "Warm golden hour light with long dramatic shadows";
      }

      if (lowerText.includes("dawn") || lowerText.includes("sunrise")) {
        return "Cool morning light with subtle color gradients";
      }

      // Default with context awareness
      if (lowerText.includes("bright") || lowerText.includes("daylight")) {
        return "Natural daylight with balanced contrast and soft shadows";
      }

      return "Atmospheric lighting suited to the scene mood";
    }

    function extractTimeOfDay(text: string): string {
      const times = {
        sunrise: "Dawn",
        dawn: "Dawn",
        morning: "Morning",
        noon: "Midday",
        afternoon: "Afternoon",
        sunset: "Sunset",
        dusk: "Dusk",
        evening: "Evening",
        night: "Night",
        midnight: "Night",
      };

      for (const [key, value] of Object.entries(times)) {
        if (text.toLowerCase().includes(key)) {
          return value;
        }
      }
      return "";
    }

    function extractFilmStock(text: string): string {
      const moodMap = {
        dark: "Kodak Vision3 500T",
        moody: "Kodak Vision3 500T",
        suspense: "Kodak Vision3 500T",
        bright: "Kodak Vision3 250D",
        sunny: "Kodak Vision3 250D",
        warm: "Kodak Vision3 250D",
        nostalgic: "Kodak Ektachrome",
        dreamy: "Kodak Ektachrome",
        vintage: "Kodak Ektachrome",
      };

      for (const [mood, stock] of Object.entries(moodMap)) {
        if (text.toLowerCase().includes(mood)) {
          return stock;
        }
      }
      return "";
    }

    function extractDirectorStyle(text: string): string {
      const styleMap = {
        fincher: "David Fincher",
        dark: "David Fincher",
        suspense: "David Fincher",
        tense: "David Fincher",
        emotional: "Emmanuel Lubezki",
        intimate: "Emmanuel Lubezki",
        reflective: "Emmanuel Lubezki",
        natural: "Emmanuel Lubezki",
        vivid: "Roger Deakins",
        precise: "Roger Deakins",
        dramatic: "Roger Deakins",
      };

      for (const [keyword, director] of Object.entries(styleMap)) {
        if (text.toLowerCase().includes(keyword)) {
          return director;
        }
      }
      return "";
    }

    function extractMood(text: string): string {
      if (
        text.toLowerCase().includes("tense") ||
        text.toLowerCase().includes("suspense")
      ) {
        return "Tense and suspenseful";
      } else if (
        text.toLowerCase().includes("romantic") ||
        text.toLowerCase().includes("intimate")
      ) {
        return "Romantic and intimate";
      } else if (
        text.toLowerCase().includes("joyful") ||
        text.toLowerCase().includes("happy")
      ) {
        return "Upbeat and joyful";
      }
      return "";
    }

    // Extract location if not manually set
    if (!template.location) {
      const locationMatch = description.match(
        /\b(?:in|at)\s+(?:a|the)\s+(\w+(?:\s+\w+)*)/i
      );
      if (locationMatch) {
        template.location = locationMatch[1];
      } else if (
        description.includes("street") ||
        description.includes("crowd")
      ) {
        template.location = "Busy urban street";
      }
    }

    // Extract time of day if not manually set
    if (!template.timeOfDay) {
      const timeMatch = description.match(
        /\b(?:morning|afternoon|evening|night|dawn|dusk|daylight)\b/i
      );
      if (timeMatch) {
        template.timeOfDay = timeMatch[0];
      } else if (
        description.includes("streetlight") ||
        description.includes("dark")
      ) {
        template.timeOfDay = "Night";
      }
    }

    // Extract mood if not manually set
    if (!template.mood) {
      const moodWords =
        /(?:anxiously|nervously|joyfully|sadly|happily|tensely|uneasy)/i;
      const moodMatch = description.match(moodWords);
      if (moodMatch) {
        template.mood = moodMatch[0];
      } else if (
        description.includes("rush") ||
        description.includes("looking over")
      ) {
        template.mood = "Tense anticipation";
      }
    }

    // Extract lighting style if not manually set
    if (!template.lightingStyle) {
      const lightingMatch = description.match(
        /\b(?:bright|dim|flickering|shadowy|natural)\s+(?:light|lighting)\b/i
      );
      if (lightingMatch) {
        template.lightingStyle = lightingMatch[0];
      } else if (
        description.includes("streetlight") ||
        description.includes("shadow")
      ) {
        template.lightingStyle = "Moody, high-contrast lighting";
      }
    }

    // Set director style based on scene elements if not manually set
    if (!template.directorStyle) {
      if (
        description.includes("intimate") ||
        description.includes("emotional")
      ) {
        template.directorStyle = "Roger Deakins";
      } else if (
        description.includes("shadow") ||
        description.includes("suspense")
      ) {
        template.directorStyle = "David Fincher";
      } else if (
        description.includes("action") ||
        description.includes("dynamic")
      ) {
        template.directorStyle = "Christopher Nolan";
      }
    }

    // Set film stock based on mood and lighting if not manually set
    if (!template.filmStock) {
      if (description.includes("bright") || description.includes("nostalgic")) {
        template.filmStock = "Kodak Vision3 200T";
      } else if (
        description.includes("moody") ||
        description.includes("low-light")
      ) {
        template.filmStock = "Kodak Vision3 500T";
      } else if (
        description.includes("vibrant") ||
        description.includes("colorful")
      ) {
        template.filmStock = "Fujifilm Eterna Vivid 500";
      }
    }

    // Set color palette based on mood and time if not manually set
    if (!template.colorPalette) {
      if (description.includes("golden") || description.includes("warm")) {
        template.colorPalette = "Warm golds, oranges, and browns";
      } else if (
        description.includes("suspense") ||
        description.includes("shadow")
      ) {
        template.colorPalette = "Deep blues, grays, and shadows";
      } else if (description.includes("joy") || description.includes("happy")) {
        template.colorPalette = "Pastel tones and light highlights";
      }
    }

    setSceneTemplate(template);
  };

  // Save data on changes
  useEffect(() => {
    localStorage.setItem("sceneDescription", sceneDescription);
    localStorage.setItem("shots", JSON.stringify(shots));
    localStorage.setItem("sceneTemplate", JSON.stringify(sceneTemplate));
  }, [sceneDescription, shots, sceneTemplate]);

  useEffect(() => {
    extractTemplateFields(sceneDescription);
  }, [sceneDescription]);

  const generateTemplateMutation = useMutation({
    mutationFn: async (data: { sceneDescription: string }) => {
      const response = await fetch("/api/scenes/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          currentTemplate: sceneTemplate, // Send existing template values
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate scene template");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Merge AI suggestions with existing user values
      setSceneTemplate((prev) => ({
        ...data,
        location: prev?.location || data.location,
        timeOfDay: prev?.timeOfDay || data.timeOfDay,
        mood: prev?.mood || data.mood,
        filmStock: prev?.filmStock || data.filmStock,
        lightingStyle: prev?.lightingStyle || data.lightingStyle,
        colorPalette: prev?.colorPalette || data.colorPalette,
        directorStyle: prev?.directorStyle || data.directorStyle,
      }));
      toast({
        title: "Template Updated",
        description: "Your custom settings have been preserved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateShotsMutation = useMutation({
    mutationFn: async (data: {
      sceneDescription: string;
      template: SceneTemplate;
    }) => {
      const prompt = generateScenePromptWithCharacter({
        sceneDescription: data.sceneDescription,
        location: data.template.location,
        timeOfDay: data.template.timeOfDay,
        weather: data.template.weather,
        filmStock: data.template.filmStock,
        directorStyle: data.template.directorStyle,
        characterName: data.template.characterName,
        characterAge: data.template.characterAge,
        characterAppearance: data.template.characterAppearance,
        characterClothing: data.template.characterClothing,
      });

      const response = await fetch("/api/scenes/breakdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate shots");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setShots(data.shots);
      toast({
        title: "Shots generated",
        description: "Scene breakdown has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetAll = () => {
    // Clear React state
    setSceneDescription("");
    setShots([]);
    setSceneTemplate(null);

    // Clear absolutely all data
    localStorage.clear();
    sessionStorage.clear();

    // Reset all forms
    if (document.forms) {
      Array.from(document.forms).forEach((form) => form.reset());
    }

    // Clear URL parameters
    window.history.replaceState({}, "", window.location.pathname);

    toast({
      title: "Reset complete",
      description: "All data has been completely cleared",
      duration: 3000,
    });

    // Reload the page to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const formatShotDescription = (shot: Shot): string => {
    // Extract shot type and camera angle to the start
    const technicalSetup = `${shot.shotType}, ${shot.cameraAngle}`;

    // Get character info if available
    const hasCharacter =
      sceneTemplate?.hasCharacter &&
      sceneTemplate.characterName &&
      sceneTemplate.characterAge &&
      sceneTemplate.characterAppearance &&
      sceneTemplate.characterClothing;

    // Remove any shot type references from the description
    const cleanDescription = shot.description.replace(
      /\b(wide shot|medium shot|close-up|extreme close-up|long shot|full shot|cowboy shot|over-the-shoulder|point of view)\b,?\s*/gi,
      ""
    );

    // Add character details if present
    // Build character description
    const buildCharacterDescription = (description: string): string => {
      if (!hasCharacter) return cleanDescription;

      // Get character details
      const name = sceneTemplate.characterName;
      const age = sceneTemplate.characterAge;
      const appearance = sceneTemplate.characterAppearance;
      const clothing = sceneTemplate.characterClothing;

      // Check if description starts with a body part or specific focus
      const bodyPartStarts =
        /^(?:on |at |focusing on |capturing )?(?:the |her |his )?(hands?|feet|face|eyes|hair|shoulders|back|profile|silhouette|figure|body)/i;
      const match = cleanDescription.match(bodyPartStarts);

      if (match) {
        // If description starts with body part, integrate character info after
        const bodyPart = match[1];
        const restOfDescription = cleanDescription
          .slice(match[0].length)
          .replace(/^[,\s]+/, "");
        return `${match[0]} of ${name}, a ${age}-year-old with ${appearance}, wearing ${clothing}, ${restOfDescription}`;
      }

      // Default case - put character description at start
      return `on ${name}, a ${age}-year-old with ${appearance}, wearing ${clothing}, ${cleanDescription}`;
    };

    // Determine photography genre based on scene context
    const getPhotographyGenre = (description: string): string => {
      const desc = description.toLowerCase();
      if (
        desc.includes("portrait") ||
        desc.includes("face") ||
        desc.includes("person")
      ) {
        return "Portrait Photography";
      } else if (
        desc.includes("street") ||
        desc.includes("urban") ||
        desc.includes("city")
      ) {
        return "Street Photography";
      } else if (desc.includes("nature") || desc.includes("landscape")) {
        return "Landscape Photography";
      } else if (desc.includes("document") || desc.includes("event")) {
        return "Documentary Photography";
      }
      return "Editorial Photography"; // Default genre
    };

    // Apply seasonal visual consistency across shots using the scene template
    const ensureSeasonalConsistency = (
      shotColorPalette: string,
      sceneColorPalette: string,
      sceneDescription: string
    ): string => {
      // If no color palette is provided, generate one based on seasonal context
      if (!shotColorPalette && !sceneColorPalette) {
        return ""; // No available information to determine palette
      }

      // Get source palette to work with
      const sourcePalette = shotColorPalette || sceneColorPalette;

      // Check scene description for seasonal keywords
      const lowerDesc = sceneDescription.toLowerCase();

      // Check for winter seasonal terms and ensure consistent winter visual treatment
      if (
        lowerDesc.includes("winter") ||
        lowerDesc.includes("snow") ||
        lowerDesc.includes("icy")
      ) {
        if (
          !sourcePalette.toLowerCase().includes("muted") &&
          !sourcePalette.toLowerCase().includes("cold")
        ) {
          return "Muted blues, frosty whites, desaturated earth tones with cold highlights";
        }
      }

      // Check for autumn/fall seasonal terms
      if (
        lowerDesc.includes("autumn") ||
        lowerDesc.includes("fall") ||
        lowerDesc.includes("october")
      ) {
        if (
          !sourcePalette.toLowerCase().includes("amber") &&
          !sourcePalette.toLowerCase().includes("burnt")
        ) {
          return "Amber, burnt orange, deep reds, and brown earth tones";
        }
      }

      // Check for spring seasonal terms
      if (
        lowerDesc.includes("spring") ||
        lowerDesc.includes("bloom") ||
        lowerDesc.includes("blossom")
      ) {
        if (
          !sourcePalette.toLowerCase().includes("pastel") &&
          !sourcePalette.toLowerCase().includes("delicate")
        ) {
          return "Soft pastels, light greens, delicate pink and yellow highlights";
        }
      }

      // Check for summer seasonal terms
      if (
        lowerDesc.includes("summer") ||
        lowerDesc.includes("hot") ||
        lowerDesc.includes("august")
      ) {
        if (
          !sourcePalette.toLowerCase().includes("vibrant green") &&
          !sourcePalette.toLowerCase().includes("golden")
        ) {
          return "Vibrant greens, warm yellows, glowing golden tones";
        }
      }

      // Return original palette if no seasonal override is needed
      return sourcePalette;
    };

    // Create an array of fields and filter out empty ones
    const photographyGenre = getPhotographyGenre(cleanDescription);
    const shotType = shot.shotType || "Medium Shot";
    const cameraAngle = shot.cameraAngle || "Eye Level";
    const location = sceneTemplate?.location || "";
    const timeOfDay = sceneTemplate?.timeOfDay || "";
    const weather = sceneTemplate?.weather || "";
    const directorStyle =
      shot.directorStyle || sceneTemplate?.directorStyle || "";
    const filmStock = shot.filmStock || sceneTemplate?.filmStock || "";

    // Apply seasonal visual consistency to color palette
    const colorPalette =
      ensureSeasonalConsistency(
        shot.colorPalette || "",
        sceneTemplate?.colorPalette || "",
        sceneDescription
      ) ||
      shot.colorPalette ||
      sceneTemplate?.colorPalette ||
      "";

    const mood = shot.mood || sceneTemplate?.mood || "";

    // Create arrays for required and optional fields - ensure ALL parameters are included
    const requiredFields = [
      shotType,
      cameraAngle,
      photographyGenre,
      cleanDescription,
    ];
    const optionalFields = [
      location,
      timeOfDay,
      weather,
      directorStyle,
      filmStock,
      colorPalette,
      mood,
    ].filter(
      (field) => field && typeof field === "string" && field.trim() !== ""
    ); // Filter out empty fields with null/undefined check

    // Join all non-empty fields with commas
    const baseDescription = buildCharacterDescription(cleanDescription);
    return [
      shotType,
      cameraAngle,
      photographyGenre,
      baseDescription,
      ...optionalFields,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const extractWeather = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("rain") || lowerText.includes("rainy"))
      return "Rainy";
    if (lowerText.includes("snow") || lowerText.includes("snowy"))
      return "Snowy";
    if (lowerText.includes("sunny") || lowerText.includes("sun"))
      return "Sunny";
    return "Clear";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Shot description copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const handleGenerateShots = () => {
    // Check mandatory fields
    if (
      !sceneTemplate?.location ||
      !sceneTemplate?.timeOfDay ||
      !sceneTemplate?.weather
    ) {
      toast({
        title: "Missing Required Fields",
        description:
          "Please fill in all mandatory fields (Location, Time of Day, and Weather) before generating shots.",
        variant: "destructive",
      });
      return;
    }

    // Check if character fields are filled
    const hasCharacterInfo =
      sceneTemplate.hasCharacter &&
      sceneTemplate.characterName &&
      sceneTemplate.characterAge &&
      sceneTemplate.characterAppearance &&
      sceneTemplate.characterClothing;

    generateShotsMutation.mutate({
      sceneDescription,
      template: {
        ...sceneTemplate,
        weather: sceneTemplate.weather,
        temperature: 0.4, // Lower temperature for stricter adherence
        characterInfo: hasCharacterInfo
          ? {
              characterName: sceneTemplate.characterName,
              characterAge: sceneTemplate.characterAge,
              characterAppearance: sceneTemplate.characterAppearance,
              characterClothing: sceneTemplate.characterClothing,
            }
          : undefined,
      },
    });
  };

  // const SHOT_PROMPT_STRUCTURE = `[Shot Type], [Camera Angle], [Photography Genre], [Subject Action], [Location], [Time of Day], [Weather], [In the Style of Director], [Film Stock], [Color Palette], [Mood]`;

  // const EXAMPLE_FORMAT = `"Tracking Shot, Low Angle, Street Photography, Teenage boy running through dimly lit street while rain pours down, City, Night, Heavy Rain, David Fincher, Kodak Vision3 500T, Deep blues and grays with neon highlights, Tense mood"`;

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <h1 className="text-3xl sm:text-4xl font-bold">Scene Breakdown</h1>
          <Button
            variant="destructive"
            onClick={resetAll}
            className="bg-red-600 hover:bg-red-700"
          >
            Reset All Data
          </Button>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl text-left w-full">
          Enter a description of your scene below. Each shot will be designed to
          follow professional rules of shot composition, directing, editing,
          continuity and visual storytelling.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Scene Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your scene here..."
              className="min-h-[100px]"
              value={sceneDescription}
              onChange={(e) => setSceneDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Scene Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div key="location-field" className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <input
                id="location"
                className="w-full p-2 border rounded text-black"
                value={sceneTemplate?.location || ""}
                onChange={(e) =>
                  setSceneTemplate((prev) => ({
                    ...prev!,
                    location: e.target.value,
                  }))
                }
                placeholder="Enter location"
                required
              />
            </div>
            <div key="timeOfDay-field" className="space-y-2">
              <Label htmlFor="timeOfDay">
                Time of Day <span className="text-red-500">*</span>
              </Label>
              <input
                id="timeOfDay"
                className="w-full p-2 border rounded text-black"
                value={sceneTemplate?.timeOfDay || ""}
                onChange={(e) =>
                  setSceneTemplate((prev) => ({
                    ...prev!,
                    timeOfDay: e.target.value,
                  }))
                }
                placeholder="Enter time of day"
                required
              />
            </div>
            <div key="filmStock-field" className="space-y-2">
              <Label htmlFor="filmStock">Film Stock (optional)</Label>
              <input
                id="filmStock"
                className="w-full p-2 border rounded text-black"
                value={sceneTemplate?.filmStock || ""}
                onChange={(e) =>
                  setSceneTemplate((prev) => ({
                    ...prev!,
                    filmStock: e.target.value,
                  }))
                }
                placeholder="Enter film stock"
              />
            </div>
            <div key="directorStyle-field" className="space-y-2">
              <Label htmlFor="directorStyle">Director Style (optional)</Label>
              <input
                id="directorStyle"
                className="w-full p-2 border rounded text-black"
                value={sceneTemplate?.directorStyle || ""}
                onChange={(e) =>
                  setSceneTemplate((prev) => ({
                    ...prev!,
                    directorStyle: e.target.value,
                  }))
                }
                placeholder="Enter director style"
              />
            </div>
            <div key="weather-field" className="space-y-2">
              <Label htmlFor="weather">
                Weather <span className="text-red-500">*</span>
              </Label>
              <input
                id="weather"
                className="w-full p-2 border rounded text-black"
                value={sceneTemplate?.weather || ""}
                onChange={(e) =>
                  setSceneTemplate((prev) => ({
                    ...prev!,
                    weather: e.target.value,
                  }))
                }
                placeholder="Enter weather condition"
                required
              />
            </div>

            <div key="character-toggle" className="col-span-2 mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasCharacter"
                  checked={sceneTemplate?.hasCharacter || false}
                  onChange={(e) =>
                    setSceneTemplate((prev) => ({
                      ...prev!,
                      hasCharacter: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="hasCharacter">
                  This scene includes a character
                </Label>
              </div>
            </div>

            {sceneTemplate?.hasCharacter && (
              <>
                <div key="character-name-field" className="space-y-2">
                  <Label htmlFor="characterName">Character Name</Label>
                  <input
                    id="characterName"
                    className="w-full p-2 border rounded text-black"
                    value={sceneTemplate?.characterName || ""}
                    onChange={(e) =>
                      setSceneTemplate((prev) => ({
                        ...prev!,
                        characterName: e.target.value,
                      }))
                    }
                    placeholder="Maya or Detective Lang"
                  />
                </div>

                <div key="character-age-field" className="space-y-2">
                  <Label htmlFor="characterAge">Age</Label>
                  <input
                    id="characterAge"
                    className="w-full p-2 border rounded text-black"
                    value={sceneTemplate?.characterAge || ""}
                    onChange={(e) =>
                      setSceneTemplate((prev) => ({
                        ...prev!,
                        characterAge: e.target.value,
                      }))
                    }
                    placeholder="32 or Elderly"
                  />
                </div>

                <div key="character-appearance-field" className="space-y-2">
                  <Label htmlFor="characterAppearance">Appearance</Label>
                  <textarea
                    id="characterAppearance"
                    className="w-full p-2 border rounded text-black"
                    value={sceneTemplate?.characterAppearance || ""}
                    onChange={(e) =>
                      setSceneTemplate((prev) => ({
                        ...prev!,
                        characterAppearance: e.target.value,
                      }))
                    }
                    placeholder="Tall, dark curly hair, sharp jawline"
                    rows={2}
                  />
                </div>

                <div key="character-clothing-field" className="space-y-2">
                  <Label htmlFor="characterClothing">Clothing / Style</Label>
                  <textarea
                    id="characterClothing"
                    className="w-full p-2 border rounded text-black"
                    value={sceneTemplate?.characterClothing || ""}
                    onChange={(e) =>
                      setSceneTemplate((prev) => ({
                        ...prev!,
                        characterClothing: e.target.value,
                      }))
                    }
                    placeholder="Leather jacket, vintage sunglasses"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-6">
            <Button
              className="w-full bg-yellow-600 hover:bg-yellow-700"
              onClick={handleGenerateShots}
            >
              Step 3: Generate Shots
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setSceneTemplate(null)}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {shots.length > 0 && (
        <TooltipProvider>
          <Card>
            <CardHeader>
              <CardTitle>Scene Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shots.map((shot, index) => (
                  <Card key={`shot-${shot.id}-${index}`}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                        <CardTitle>Shot {index + 1}</CardTitle>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(formatShotDescription(shot))
                              }
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to scene description in Movie Frames tab</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {formatShotDescription(shot)}
                        </p>
                        {shot.transition && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Transition:</strong> {shot.transition}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
      )}
    </div>
  );
}
