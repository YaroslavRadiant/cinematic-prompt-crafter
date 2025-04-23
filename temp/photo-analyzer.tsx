import React from "react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Loader2, RotateCcw, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PHOTOGRAPHY_STYLES } from "@/lib/constants";

const PHOTOGRAPHY_AESTHETICS = [
  "Minimalist Photography",
  "Film Noir",
  "Documentary",
  "Fine Art Photography",
  "Street Photography",
  "Vintage Photography",
  "Modern Photography",
  "Black and White",
  "High Key",
  "Low Key",
  "Cinematic",
  "Photojournalistic",
  "Commercial",
  "Fashion Photography",
  "Urban Photography",
  "Nature Photography",
  "Abstract Photography",
  "Candid Photography",
  "Dramatic Photography",
  "Contemporary Photography",
];

const CINEMATOGRAPHERS = [
  "Vittorio Storaro",
  "Roger Deakins",
  "Emmanuel Lubezki",
  "Bradford Young",
  "Rachel Morrison",
  "Hoyte van Hoytema",
  "Robert Richardson",
  "Janusz Kamiński",
  "Christopher Doyle",
  "Darius Khondji",
  "Sven Nykvist",
  "Gordon Willis",
  "Greig Fraser",
  "Matthew Libatique",
  "Rodrigo Prieto",
];

const DIRECTORS = [
  "Stanley Kubrick",
  "Christopher Nolan",
  "Wes Anderson",
  "Martin Scorsese",
  "Quentin Tarantino",
  "David Fincher",
  "Steven Spielberg",
  "Wong Kar-wai",
  "Terrence Malick",
  "Paul Thomas Anderson",
  "Denis Villeneuve",
  "Alfonso Cuarón",
  "Alejandro González Iñárritu",
  "Ridley Scott",
  "Ang Lee",
];

const PHOTOGRAPHY_GENRES = [
  "Portrait",
  "Landscape",
  "Street",
  "Wildlife",
  "Macro",
  "Architectural",
  "Fashion",
  "Sports",
  "Fine Art",
  "Abstract",
  "Nature",
  "Still Life",
  "Travel",
  "Food",
  "Event",
];
const SHOT_TYPES = [
  "Close-up",
  "Medium Shot",
  "Long Shot",
  "Full Shot",
  "Extreme Close-up",
  "Extreme Long Shot",
  "Wide Shot",
  "Over-the-shoulder Shot",
  "Point-of-view Shot",
  "Dutch Angle",
  "High Angle",
  "Low Angle",
  "Bird's-eye View",
  "Ground-Level Shot",
  "Establishing Shot",
  "Two Shot",
  "Medium Close-up",
  "Medium Long Shot",
  "Aerial Shot",
  "Tracking Shot",
  "Dolly Shot",
  "Master Shot",
];
const CAMERA_ANGLES = [
  "High Angle",
  "Low Angle",
  "Eye Level",
  "Dutch Angle",
  "Bird's-eye View",
  "Worm's-eye View",
  "Over-the-shoulder Shot",
  "Overhead Angle",
  "Ground-Level Angle",
  "Eye-Level Angle",
  "Front Angle",
  "Side Angle",
  "Tilted Angle",
  "Oblique Angle",
  "Canted Angle",
];
const FILM_STOCK = [
  "Kodak Portra 400",
  "Kodak Ektachrome 100",
  "Fuji Velvia 50",
  "Ilford HP5 Plus",
  "Ilford Delta 100",
  "Kodak Tri-X 400",
  "Fuji Superia X-TRA 400",
];
const COLOR_PALETTES = [
  "Warm Tones",
  "Cool Tones",
  "Muted Colors",
  "Vibrant Colors",
  "Pastel Colors",
  "Monochromatic",
  "Complementary Colors",
  "Analogous Colors",
  "Triadic Colors",
];

interface EditableParameter {
  type: string;
  value: string;
  options: readonly string[];
}

const normalizeText = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]/g, "");

const isPhotographyGenre = (segment: string): boolean => {
  if (segment.includes("[Photography Genre]")) return true;

  const normalizedSegment = segment.toLowerCase();
  return (
    (normalizedSegment.includes("photography") &&
      !normalizedSegment.includes("aesthetic") &&
      !normalizedSegment.includes("inspired") &&
      !normalizedSegment.includes("style")) ||
    PHOTOGRAPHY_GENRES.some(
      (genre) => normalizedSegment === `${genre.toLowerCase()} photography`
    )
  );
};

const isPhotographyAesthetic = (segment: string): boolean => {
  return (
    segment.toLowerCase().includes("aesthetic") ||
    segment.includes("[Photography Aesthetic]") ||
    PHOTOGRAPHY_AESTHETICS.some(
      (aesthetic) =>
        segment.toLowerCase() === aesthetic.toLowerCase() ||
        segment.toLowerCase().includes(aesthetic.toLowerCase() + " aesthetic")
    )
  );
};

const isInspiredBy = (segment: string): boolean => {
  return (
    segment.toLowerCase().includes("inspired by") ||
    segment.includes("[Name of Cinematographer or Film Director]")
  );
};

const isMatchingShotType = (segment: string, shotType: string): boolean => {
  const normalizedSegment = normalizeText(segment);
  const normalizedShotType = normalizeText(shotType);
  return (
    segment.includes("[Shot/Frame Type]") ||
    segment.toLowerCase().includes("shot") ||
    normalizedSegment === normalizedShotType ||
    normalizedSegment.includes(normalizedShotType) ||
    // Additional shot type variations
    segment.toLowerCase().includes("close up") ||
    segment.toLowerCase().includes("closeup") ||
    segment.toLowerCase().includes("wide") ||
    segment.toLowerCase().includes("establishing")
  );
};

const isCameraAngle = (segment: string): boolean => {
  const normalizedSegment = segment.toLowerCase();
  return (
    segment.includes("[Camera Angle]") ||
    normalizedSegment.includes("angle") ||
    CAMERA_ANGLES.some(
      (angle) =>
        normalizedSegment === angle.toLowerCase() ||
        normalizedSegment.includes(angle.toLowerCase())
    ) ||
    // Additional angle variations
    normalizedSegment.includes("eye level") ||
    normalizedSegment.includes("ground level") ||
    normalizedSegment.includes("birds eye") ||
    normalizedSegment.includes("worms eye")
  );
};

const isFilmStock = (segment: string): boolean => {
  return (
    segment.includes("[Film Stock]") ||
    FILM_STOCK.some((stock) =>
      segment.toLowerCase().includes(stock.toLowerCase())
    ) ||
    /\b(fuji(film)?|kodak|ilford)\b/i.test(segment)
  );
};

// Function to check if a segment is a lens description
const isLensDescription = (segment: string): boolean => {
  const lowerSegment = segment.toLowerCase();

  // Common lens focal lengths
  const focalLengths = [
    "8mm",
    "14mm",
    "16mm",
    "24mm",
    "28mm",
    "35mm",
    "50mm",
    "85mm",
    "105mm",
    "135mm",
    "200mm",
    "300mm",
    "400mm",
    "600mm",
  ];
  if (focalLengths.some((length) => lowerSegment.includes(length))) {
    return true;
  }

  // Common lens types
  const lensTypes = [
    "wide angle",
    "wide-angle",
    "telephoto",
    "prime",
    "zoom",
    "macro",
    "fisheye",
    "tilt-shift",
    "portrait",
    "standard lens",
    "anamorphic",
    "ultra-wide",
    "ultra wide",
  ];
  if (lensTypes.some((type) => lowerSegment.includes(type))) {
    return true;
  }

  // Check for lens-specific terms
  const lensTerms = ["mm lens", "mm prime", "mm f/", "lens", " f/", "aperture"];
  if (lensTerms.some((term) => lowerSegment.includes(term))) {
    return true;
  }

  return false;
};

const REQUIRED_PARAMETERS = [
  "Photography Genre",
  "Shot/Frame Type",
  "Camera Angle",
  "Name of Cinematographer or Film Director",
  "Film Stock",
  "Photography Aesthetic",
] as const;

// const PHOTOGRAPHY_PROMPT_STRUCTURE =
//   "Cinematic, [Photography Genre], [Shot/Frame Type], [Camera Angle], [Name of Cinematographer or Film Director], [Film Stock], [Photography Aesthetic], --ar 16:9 --style raw";

const parsePrompt = (promptText: string) => {
  const parameters: EditableParameter[] = [];
  if (!promptText) return parameters;

  const addParameter = (
    type: string,
    value: string,
    options: readonly string[]
  ) => {
    // Skip adding any parameter with [lenses] in the value or lens descriptions
    if (value.toLowerCase().includes("[lenses]") || isLensDescription(value)) {
      return;
    }

    // Only add if this parameter type doesn't already exist
    if (!parameters.some((p) => p.type === type)) {
      parameters.push({ type, value, options });
    }
  };

  const segments = promptText.split(",").map((s) => s.trim());

  // Always add Photography Genre for the first segment if it contains "photography"
  // const firstSegment = segments[0] || "[Photography Genre]";
  // if (isPhotographyGenre(firstSegment)) {
  //   addParameter(
  //     "Photography Genre",
  //     firstSegment,
  //     PHOTOGRAPHY_GENRES.map((g) => `${g} Photography`)
  //   );
  // }

  segments.forEach((segment, index) => {
    if (index === 0) return; // Skip first segment as it's already handled

    // Skip "Cinematic" from being highlighted
    if (segment.toLowerCase() === "cinematic") return;

    // Skip empty segments
    if (!segment.trim()) return;

    // Photography Genre
    if (isPhotographyGenre(segment)) {
      addParameter(
        "Photography Genre",
        segment,
        PHOTOGRAPHY_GENRES.map((g) => `${g} Photography`)
      );
      return;
    }

    // Shot Type
    if (SHOT_TYPES.some((shot) => isMatchingShotType(segment, shot))) {
      const matchingShot = SHOT_TYPES.find((shot) =>
        isMatchingShotType(segment, shot)
      );
      addParameter(
        "Shot/Frame Type",
        matchingShot || "[Shot/Frame Type]",
        SHOT_TYPES
      );
    }

    // Camera Angle
    if (isCameraAngle(segment)) {
      const matchingAngle = CAMERA_ANGLES.find((angle) =>
        segment.toLowerCase().includes(angle.toLowerCase())
      );
      addParameter(
        "Camera Angle",
        matchingAngle || "[Camera Angle]",
        CAMERA_ANGLES
      );
    }

    // Inspired By
    if (isInspiredBy(segment)) {
      const matchingName = [...CINEMATOGRAPHERS, ...DIRECTORS].find((name) =>
        segment.toLowerCase().includes(`inspired by ${name.toLowerCase()}`)
      );
      addParameter(
        "Name of Cinematographer or Film Director",
        matchingName
          ? `inspired by ${matchingName}`
          : "[Name of Cinematographer or Film Director]",
        [...CINEMATOGRAPHERS, ...DIRECTORS].map((name) => `inspired by ${name}`)
      );
    }

    // Film Stock
    if (isFilmStock(segment)) {
      const matchingStock = FILM_STOCK.find((stock) =>
        segment.toLowerCase().includes(stock.toLowerCase())
      );
      addParameter("Film Stock", matchingStock || "[Film Stock]", FILM_STOCK);
    }

    // Photography Aesthetic
    if (isPhotographyAesthetic(segment)) {
      const matchingAesthetic = PHOTOGRAPHY_AESTHETICS.find((aesthetic) =>
        segment.toLowerCase().includes(aesthetic.toLowerCase())
      );
      addParameter(
        "Photography Aesthetic",
        matchingAesthetic || "[Photography Aesthetic]",
        PHOTOGRAPHY_AESTHETICS
      );
    }
  });

  // Add missing required segments
  REQUIRED_PARAMETERS.forEach((type) => {
    if (!parameters.some((p) => p.type === type)) {
      const options =
        type === "Photography Genre"
          ? PHOTOGRAPHY_GENRES.map((g) => `${g} Photography`)
          : type === "Photography Aesthetic"
          ? PHOTOGRAPHY_AESTHETICS
          : type === "Film Stock"
          ? FILM_STOCK
          : type === "Name of Cinematographer or Film Director"
          ? [...CINEMATOGRAPHERS, ...DIRECTORS].map(
              (name) => `inspired by ${name}`
            )
          : type === "Shot/Frame Type"
          ? SHOT_TYPES
          : type === "Camera Angle"
          ? CAMERA_ANGLES
          : [];
      parameters.push({ type, value: `[${type}]`, options });
    }
  });

  return parameters;
};

const renderHighlightedPrompt = (
  generatedPrompt: string | null,
  editableParameters: EditableParameter[],
  openPopovers: Record<string, boolean>,
  setOpenPopovers: (value: Record<string, boolean>) => void,
  handleParameterUpdate: (oldValue: string, newValue: string) => void,
  toast: Function
) => {
  if (!generatedPrompt) return null;

  const [mainContent] = generatedPrompt.split("--ar");
  const segments = mainContent.split(",").map((s) => s.trim());
  let result: React.ReactNode[] = [];

  segments.forEach((segment, index) => {
    // Skip "Cinematic" from being highlighted
    if (segment.toLowerCase() === "cinematic") {
      result.push(
        <React.Fragment key={`text-${index}`}>
          <span>{segment}</span>
          {index < segments.length - 1 && <span>, </span>}
        </React.Fragment>
      );
      return;
    }

    // Check if segment contains any lens-related terms - these should never be highlighted
    const containsLenses =
      segment.toLowerCase().includes("[lenses]") || isLensDescription(segment);

    // Check if this is a Photography Type segment
    const isPhotographyType =
      segment.toLowerCase().includes("photography") &&
      !segment.toLowerCase().includes("aesthetic") &&
      !segment.toLowerCase().includes("genre") &&
      index > 0 &&
      index < 3; // Typically the second segment is the photography type

    // Checks for other segment types
    const isGenre = index === 0 || isPhotographyGenre(segment);
    const isAesthetic = isPhotographyAesthetic(segment);
    const isShotType = SHOT_TYPES.some((shot) =>
      isMatchingShotType(segment, shot)
    );
    const isAngle = isCameraAngle(segment);
    const isStock = isFilmStock(segment);
    const isDirector = isInspiredBy(segment);

    // Make sure Photography Type is highlighted along with other required segments
    // But never highlight segments containing [lenses]
    const shouldHighlight =
      !containsLenses &&
      (isPhotographyType ||
        isGenre ||
        isAesthetic ||
        isShotType ||
        isAngle ||
        isStock ||
        isDirector);

    if (shouldHighlight) {
      result.push(
        <React.Fragment key={`segment-${index}`}>
          <Popover
            open={openPopovers[segment]}
            onOpenChange={(open) => {
              setOpenPopovers({ ...openPopovers, [segment]: open });
            }}
          >
            <PopoverTrigger asChild>
              <span className="bg-white text-black px-2 py-0.5 rounded cursor-pointer hover:bg-gray-50 border border-gray-200 ring-2 ring-primary">
                {segment}
              </span>
            </PopoverTrigger>
            <PopoverContent
              className="w-[240px] z-[100]"
              align="start"
              side="top"
              sideOffset={5}
            >
              <div className="space-y-2">
                <h4 className="font-medium">
                  {isGenre
                    ? "Photography Genre"
                    : isAesthetic
                    ? "Photography Aesthetic"
                    : isShotType
                    ? "Shot/Frame Type"
                    : isAngle
                    ? "Camera Angle"
                    : isStock
                    ? "Film Stock"
                    : isDirector
                    ? "Name of Cinematographer or Film Director"
                    : isPhotographyType
                    ? "Photography Type"
                    : "Parameter"}
                </h4>
                <Select
                  value={segment}
                  onValueChange={(value) =>
                    handleParameterUpdate(segment, value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={`Choose ${
                        isGenre
                          ? "photography genre"
                          : isAesthetic
                          ? "photography aesthetic"
                          : isShotType
                          ? "shot type"
                          : isAngle
                          ? "camera angle"
                          : isStock
                          ? "film stock"
                          : isDirector
                          ? "cinematographer or director"
                          : isPhotographyType
                          ? "photography type"
                          : "parameter"
                      }`}
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="max-h-[300px] overflow-y-auto z-[100]"
                  >
                    {isGenre
                      ? PHOTOGRAPHY_GENRES.map((option) => (
                          <SelectItem
                            key={option}
                            value={`${option} Photography`}
                          >
                            {option} Photography
                          </SelectItem>
                        ))
                      : isAesthetic
                      ? PHOTOGRAPHY_AESTHETICS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))
                      : isShotType
                      ? SHOT_TYPES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))
                      : isAngle
                      ? CAMERA_ANGLES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))
                      : isStock
                      ? FILM_STOCK.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))
                      : isDirector
                      ? [...CINEMATOGRAPHERS, ...DIRECTORS].map((name) => (
                          <SelectItem key={name} value={`inspired by ${name}`}>
                            inspired by {name}
                          </SelectItem>
                        ))
                      : isPhotographyType
                      ? PHOTOGRAPHY_STYLES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))
                      : (
                          editableParameters.find((p) => p.value === segment)
                            ?.options || []
                        ).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
          {index < segments.length - 1 && <span>, </span>}
        </React.Fragment>
      );
    } else {
      result.push(
        <React.Fragment key={`text-${index}`}>
          <span>{segment}</span>
          {index < segments.length - 1 && <span>, </span>}
        </React.Fragment>
      );
    }
  });

  // Add the aspect ratio part without highlighting
  if (generatedPrompt.includes("--ar")) {
    result.push(<span key="aspect-ratio">, --ar 16:9 --style raw</span>);
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="min-h-[100px] p-4 border rounded-md font-mono text-sm leading-relaxed">
          {result}
        </div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(generatedPrompt);
              toast({
                title: "Copied!",
                description: "Complete prompt copied to clipboard",
              });
            }}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Prompt
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Ensures prompt follows the correct format: starts with "Cinematic" and ends with "--style raw"
const ensureProperPromptFormat = (text: string): string => {
  if (!text) return text;

  let processedText = text.trim();

  // Ensure the prompt starts with "Cinematic,"
  if (!processedText.startsWith("Cinematic")) {
    processedText = "Cinematic, " + processedText;
  } else if (
    processedText.startsWith("Cinematic") &&
    !processedText.startsWith("Cinematic,")
  ) {
    processedText =
      "Cinematic, " + processedText.substring("Cinematic".length).trim();
  }

  // Ensure the prompt ends with "--style raw"
  if (!processedText.includes("--style raw")) {
    // If already has aspect ratio but no style raw
    if (processedText.includes("--ar")) {
      if (processedText.includes("--ar 16:9")) {
        processedText = processedText.replace(
          "--ar 16:9",
          "--ar 16:9 --style raw"
        );
      } else {
        const arIndex = processedText.indexOf("--ar");
        const beforeAr = processedText.substring(0, arIndex).trim();
        const arPart = processedText.substring(arIndex);
        processedText = beforeAr + " " + arPart + " --style raw";
      }
    } else {
      // No aspect ratio, add both
      processedText = processedText + ", --ar 16:9 --style raw";
    }
  }

  // Ensure commas are properly placed
  return ensureCommaBeforeAr(processedText);
};

// Original function to ensure proper comma placement
const ensureCommaBeforeAr = (text: string): string => {
  if (!text) return text;

  // Split into segments
  const segments = text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Separate required segments from descriptive text
  const requiredSegments: string[] = [];
  const descriptiveSegments: string[] = [];

  segments.forEach((segment) => {
    if (
      isPhotographyGenre(segment) ||
      isPhotographyAesthetic(segment) ||
      isMatchingShotType(segment, "") ||
      isCameraAngle(segment) ||
      isFilmStock(segment) ||
      isInspiredBy(segment) ||
      segment.includes("[")
    ) {
      requiredSegments.push(segment);
    } else {
      descriptiveSegments.push(segment);
    }
  });

  // Combine segments with proper spacing
  let processedText = "";

  // Add required segments first
  if (requiredSegments.length > 0) {
    processedText = requiredSegments.join(", ");
  }

  // Add descriptive segments
  if (descriptiveSegments.length > 0) {
    if (processedText) {
      processedText += ", ";
    }
    processedText += descriptiveSegments.join(", ");
  }

  // Handle aspect ratio
  const arIndex = text.indexOf("--");
  if (arIndex !== -1) {
    const afterAr = text.substring(arIndex);
    processedText =
      processedText + (processedText.endsWith(",") ? " " : ", ") + afterAr;
  }

  return processedText;
};

export function PhotoAnalyzer() {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [description, setDescription] = useState("");
  const [editableParameters, setEditableParameters] = useState<
    EditableParameter[]
  >([]);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const generatedPromptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Clear previous prompts when new image is selected
    setGeneratedPrompt(null);
    setEditablePrompt("");
    setEditableParameters([]);
    setOpenPopovers({});

    setSelectedImage(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleDeleteImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleParameterUpdate = (oldValue: string, newValue: string) => {
    if (!generatedPrompt) return;

    // Create new prompt with the updated value
    const newPrompt = generatedPrompt.replace(oldValue, newValue);
    setGeneratedPrompt(newPrompt);
    setEditablePrompt(newPrompt);

    // Update parameters list to maintain highlighting state
    const updatedParameters = parsePrompt(newPrompt);

    // Ensure Photography Genre and Aesthetic segments stay highlighted
    const segments = newPrompt.split(",").map((s) => s.trim());
    segments.forEach((segment, index) => {
      if (index === 0 || isPhotographyGenre(segment)) {
        if (
          !updatedParameters.some(
            (p) => p.type === "Photography Genre" && p.value === segment
          )
        ) {
          updatedParameters.push({
            type: "Photography Genre",
            value: segment,
            options: PHOTOGRAPHY_GENRES,
          });
        }
      }
      if (isPhotographyAesthetic(segment)) {
        if (
          !updatedParameters.some(
            (p) => p.type === "Photography Aesthetic" && p.value === segment
          )
        ) {
          updatedParameters.push({
            type: "Photography Aesthetic",
            value: segment,
            options: PHOTOGRAPHY_AESTHETICS,
          });
        }
      }
    });

    setEditableParameters(updatedParameters);

    // Close the popover for both old and new values
    setOpenPopovers((prev) => ({
      ...prev,
      [oldValue]: false,
      [newValue]: false,
    }));
  };

  const togglePopover = (paramValue: string, isOpen: boolean) => {
    setOpenPopovers((prev) => ({
      ...prev,
      [paramValue]: isOpen,
    }));
  };

  const resetForm = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const resetTextPrompt = () => {
    setGeneratedPrompt(null);
    setEditablePrompt("");
    setDescription("");
    setEditableParameters([]);
    toast({
      title: "Prompt reset",
      description: "Text prompt has been cleared",
    });
  };

  const analyzePhoto = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log("Uploading image:", selectedImage.name, selectedImage.type);

      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch("/api/analyze-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to analyze photo");
      }

      const data = await response.json();
      let formattedPrompt = data.generatedPrompt || "";

      // Ensure proper format
      formattedPrompt = ensureProperPromptFormat(formattedPrompt);

      setGeneratedPrompt(formattedPrompt);
      setEditablePrompt(formattedPrompt);
      setEditableParameters(parsePrompt(formattedPrompt));

      toast({
        title: "Analysis complete",
        description: "Your image has been successfully analyzed",
      });
    } catch (error) {
      console.error("Photo Analysis Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to analyze the photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newText = e.target.value;
    setDescription(newText);

    // Clear all generated prompts and related states when description changes
    if (generatedPrompt) {
      setGeneratedPrompt(null);
      setEditablePrompt("");
      setEditableParameters([]);
      setOpenPopovers({});
    }
  };

  const generatePromptFromDescription = async () => {
    if (!description.trim()) {
      toast({
        title: "No description provided",
        description: "Please enter a description to generate a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/generate-photo-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate photo prompt");
      }

      const data = await response.json();
      let formattedPrompt = data.generatedPrompt || "";

      // Ensure proper format
      formattedPrompt = ensureProperPromptFormat(formattedPrompt);

      setGeneratedPrompt(formattedPrompt);
      setEditablePrompt(formattedPrompt);
      setEditableParameters(parsePrompt(formattedPrompt));

      toast({
        title: "Prompt generated",
        description:
          "Your description has been converted into a structured photography prompt.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate prompt",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (generatedPrompt && generatedPromptRef.current) {
      generatedPromptRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [generatedPrompt]);

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      if (textarea && editablePrompt) {
        adjustTextareaHeight(textarea as HTMLTextAreaElement);
      }
    });
  }, [editablePrompt]);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Card className="w-full">
        <CardContent className="p-6 space-y-4">
          {/* TEXT TO PROMPT Section */}
          <div className="w-full space-y-2">
            <h2 className="text-2xl font-bold mb-4">TEXT TO PROMPT</h2>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a description of the photo you want to create..."
              value={description}
              onChange={handleDescriptionChange}
              className="min-h-[100px] w-full"
              disabled={isAnalyzing}
            />
            <div className="flex gap-2">
              <Button
                onClick={generatePromptFromDescription}
                disabled={!description.trim() || isAnalyzing}
                className="flex-1 bg-[#D95525] hover:bg-[#D95525]/90 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Photo Prompt"
                )}
              </Button>
              {generatedPrompt && !selectedImage && (
                <Button
                  variant="outline"
                  onClick={resetTextPrompt}
                  className="shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {generatedPrompt && !selectedImage && (
              <div ref={generatedPromptRef} className="space-y-4 mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="w-full text-left">
                      <Label>Editable Prompt</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Ready-to-use prompt where you can also change each
                        parameter according to your needs
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Textarea
                  value={editablePrompt}
                  onChange={(e) => {
                    const formattedValue = ensureProperPromptFormat(
                      e.target.value
                    );
                    setEditablePrompt(formattedValue);
                    setGeneratedPrompt(formattedValue);
                    setEditableParameters(parsePrompt(formattedValue));
                    adjustTextareaHeight(e.target);
                  }}
                  className="w-full font-mono text-sm resize-none min-h-[60px]"
                  placeholder="Your prompt will appear here..."
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="w-full text-left">
                      <Label>Highlighted Parameters</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Illuminated segments with a drop-down list for quick
                        changes to image aesthetics
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {renderHighlightedPrompt(
                  generatedPrompt,
                  editableParameters,
                  openPopovers,
                  setOpenPopovers,
                  handleParameterUpdate,
                  toast
                )}
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* IMAGE TO PROMPT Section */}
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">IMAGE TO PROMPT</h2>
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-grow">
                <Label htmlFor="photo">Upload Photo for Analysis</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="cursor-pointer w-full"
                  disabled={isAnalyzing}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="h-8 w-8 ml-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {imagePreview && (
              <div className="mt-4 space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-contain w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleDeleteImage}
                    disabled={isAnalyzing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={analyzePhoto}
                  disabled={isAnalyzing}
                  className="w-full bg-[#D95525] hover:bg-[#D95525]/90 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Analyze Photo
                    </>
                  )}
                </Button>

                {generatedPrompt && selectedImage && (
                  <div ref={generatedPromptRef} className="space-y-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full text-left flex items-center gap-2">
                          <Label>Editable Prompt</Label>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            className="w-4 h-4 text-muted-foreground"
                          >
                            <path
                              fill="currentColor"
                              d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                            />
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Ready-to-use prompt where you can also change each
                            parameter according to your needs
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Textarea
                      value={editablePrompt}
                      onChange={(e) => {
                        const formattedValue = ensureProperPromptFormat(
                          e.target.value
                        );
                        setEditablePrompt(formattedValue);
                        setGeneratedPrompt(formattedValue);
                        setEditableParameters(parsePrompt(formattedValue));
                        adjustTextareaHeight(e.target);
                      }}
                      className="w-full font-mono text-sm resize-none min-h-[60px]"
                      placeholder="Your prompt will appear here..."
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full text-left flex items-center gap-2">
                          <Label>Highlighted Parameters</Label>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            className="w-4 h-4 text-muted-foreground"
                          >
                            <path
                              fill="currentColor"
                              d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                            />
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Illuminated segments with a drop-down list for quick
                            changes to image aesthetics
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {renderHighlightedPrompt(
                      generatedPrompt,
                      editableParameters,
                      openPopovers,
                      setOpenPopovers,
                      handleParameterUpdate,
                      toast
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
