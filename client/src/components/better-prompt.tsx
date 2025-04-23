import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Loader2, RotateCcw, Copy } from "lucide-react";
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
import clsx from 'clsx';

interface EditableParameter {
  type: string;
  value: string;
  options: readonly string[];
}

const ILLUSTRATION_PROMPT_STRUCTURE = "[Illustration/Animation Type], [Subject (character species, gender, age, appearance)], [Action], [Shot Type], [Camera Angle], [Location], [Time of Day, Year], [Fashion/Film Set Design, Background], inspired by [Style of Illustrator/Animation Studio], created in [3D Rendering/Animation Engine], [Type and Source of Lighting], [Color Palette], [Illustration/Animation Aesthetic], [Mood/Emotion], --ar 16:9 --style raw";

const ILLUSTRATION_PROMPT_EXAMPLE = "Cartoon-Style Illustration, adorable young girl with curly white hair resembling sheep's wool, wearing a chunky knitted sweater dress, brown leather boots, and woolen socks, standing with arms crossed and eyes closed, Medium Full Shot, Eye Level, serene autumn forest setting with soft sunlight, warm color palette with earthy tones and cozy textures, inspired by John Burningham, created in Blender, natural soft lighting with diffused highlights, Classic Disney Animation Aesthetic, whimsical and heartwarming mood, --ar 16:9 --style raw";

// Helper function to ensure consistent structure
const ensurePromptStructure = (prompt: string): string => {
  if (!prompt) return prompt;
  if (!prompt.includes('--ar 16:9 --style raw')) {
    prompt = `${prompt.trim()}, --ar 16:9 --style raw`;
  }
  return prompt;
};

// Constants
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
  "Botanical Illustration"
];

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
  "Sand Animation"
];

const SHOT_TYPES = ["Extreme Close Up", "Close Up", "Medium Close Up", "Medium Shot", "Medium Full Shot", "Full Shot", "Long Shot", "Extreme Long Shot", "Wide Shot"];
const CAMERA_ANGLES = [
  "Eye Level",
  "High Angle",
  "Low Angle",
  "Dutch Angle",
  "Bird's Eye View",
  "Worm's Eye View",
  "Side View"
];
const STYLE_REFERENCES = [
  "inspired by Disney",
  "inspired by Pixar",
  "inspired by Studio Ghibli",
  "inspired by Hayao Miyazaki",
  "inspired by Isao Takahata",
  "inspired by John Burningham",
  "inspired by Beatrix Potter",
  "inspired by Winsor McCay",
  "inspired by Walt Disney"
];
const RENDERING_ENGINES = ["Blender", "Maya", "Unreal Engine", "Unity", "Toon Boom Harmony", "Procreate", "Adobe Animate", "Cinema 4D"];
const AESTHETICS = [
  "Classic Disney Animation Aesthetic",
  "Modern Anime Aesthetic",
  "Pixar 3D Animation Aesthetic",
  "Studio Ghibli Aesthetic",
  "Vintage Hand-Drawn Aesthetic",
  "Minimalist Animation Aesthetic",
  "Watercolor Illustration Aesthetic",
  "Digital Art Aesthetic",
  "Comic Book Aesthetic",
  "Children's Book Illustration Aesthetic",
  "Vector Art Aesthetic",
  "Concept Art Aesthetic",
  "Traditional Animation Aesthetic",
  "Stop Motion Aesthetic",
  "Experimental Animation Aesthetic",
  "Fantasy Art Aesthetic",
  "Surreal Art Aesthetic",
  "Retro Animation Aesthetic",
  "Claymation Aesthetic",
  "Cartoon Network Aesthetic"
];

const REQUIRED_SEGMENTS = [
  'Illustration/Animation Type',
  'Shot Type',
  'Camera Angle',
  'Style of Illustrator/Animation Studio',
  '3D Rendering/Animation Engine',
  'Illustration/Animation Aesthetic'
] as const;

const normalizeText = (text: string): string => {
  return text.toLowerCase()
    .replace(/[-\s]/g, '')
    .replace(/closeup/g, 'close-up')
    .replace(/overtheshoulder/g, 'over-the-shoulder')
    .replace(/pointofview/g, 'point-of-view')
    .replace(/birdseyeview/g, 'birds-eye-view')
    .replace(/wormseyeview/g, 'worms-eye-view')
    .replace(/dutchangle/g, 'dutch-angle')
    .replace(/mediumshot/g, 'medium-shot')
    .replace(/longshot/g, 'long-shot')
    .replace(/wideshot/g, 'wide-shot')
    .replace(/extremecloseup/g, 'extreme-close-up')
    .replace(/extremelongshot/g, 'extreme-long-shot');
};

const isMatchingShotType = (segment: string, shotType: string): boolean => {
  const normalizedSegment = normalizeText(segment);
  const normalizedShotType = normalizeText(shotType);

  // Special handling for shot types with multiple possible formats
  const variants = [
    normalizedShotType,
    normalizedShotType.replace(/-/g, ''),
    normalizedShotType.replace(/-/g, ' ')
  ];

  return variants.some(variant => normalizedSegment.includes(variant));
};

const findMatchingShotType = (segment: string): string | undefined => {
  return SHOT_TYPES.find(shotType => isMatchingShotType(segment, shotType));
};

const parsePrompt = (promptText: string) => {
  const parameters: EditableParameter[] = [];
  if (!promptText) return parameters;

  const addParameter = (type: string, value: string, options: readonly string[]) => {
    if (!parameters.some(p => p.type === type)) {
      parameters.push({ type, value, options });
    }
  };

  const segments = promptText.split(',').map(s => s.trim());

  segments.forEach(segment => {
    const normalizedSegment = normalizeText(segment);

    // Shot Type - enhanced matching
    if (segment.includes('[Shot Type]')) {
      addParameter('Shot Type', '[Shot Type]', SHOT_TYPES);
    } else {
      const matchingShotType = findMatchingShotType(segment);
      if (matchingShotType) {
        addParameter('Shot Type', matchingShotType, SHOT_TYPES);
      }
    }

    // Illustration/Animation Type
    if (segment.includes('[Illustration/Animation Type]') ||
      ILLUSTRATION_TYPES.some(type => normalizedSegment.includes(normalizeText(type))) ||
      ANIMATION_TYPES.some(type => normalizedSegment.includes(normalizeText(type)))) {
      const matchingType = [...ILLUSTRATION_TYPES, ...ANIMATION_TYPES].find(type =>
        normalizedSegment.includes(normalizeText(type))
      );
      addParameter('Illustration/Animation Type', matchingType || '[Illustration/Animation Type]',
        [...ILLUSTRATION_TYPES, ...ANIMATION_TYPES]);
    }

    // Camera Angle
    if (segment.includes('[Camera Angle]') ||
      CAMERA_ANGLES.some(angle => normalizedSegment.includes(normalizeText(angle)))) {
      const matchingAngle = CAMERA_ANGLES.find(angle =>
        normalizedSegment.includes(normalizeText(angle))
      );
      addParameter('Camera Angle', matchingAngle || '[Camera Angle]', CAMERA_ANGLES);
    }

    // Style Reference
    if (segment.includes('[Style of Illustrator/Animation Studio]') ||
      normalizedSegment.includes('inspiredby')) {
      const matchingStyle = STYLE_REFERENCES.find(style =>
        normalizedSegment.includes(normalizeText(style))
      );
      addParameter('Style of Illustrator/Animation Studio',
        matchingStyle || '[Style of Illustrator/Animation Studio]',
        STYLE_REFERENCES);
    }

    // Rendering Engine
    if (segment.includes('[3D Rendering/Animation Engine]') ||
      normalizedSegment.includes('createdin')) {
      const matchingEngine = RENDERING_ENGINES.find(engine =>
        normalizedSegment.includes(normalizeText(engine))
      );
      const engineValue = matchingEngine ? `created in ${matchingEngine}` : '[3D Rendering/Animation Engine]';
      addParameter('3D Rendering/Animation Engine', engineValue,
        RENDERING_ENGINES.map(e => `created in ${e}`));
    }

    // Aesthetic - Always ensure it has the right dropdown
    if (segment.includes('[Illustration/Animation Aesthetic]') ||
      normalizedSegment.includes('aesthetic')) {
      const matchingAesthetic = AESTHETICS.find(aesthetic =>
        normalizedSegment.includes(normalizeText(aesthetic.replace(' Aesthetic', '')))
      );
      addParameter('Illustration/Animation Aesthetic',
        matchingAesthetic || '[Illustration/Animation Aesthetic]',
        AESTHETICS);
    }
  });

  // Add missing required segments
  REQUIRED_SEGMENTS.forEach(type => {
    if (!parameters.some(p => p.type === type)) {
      let defaultValue = `[${type}]`;
      const options = type === 'Illustration/Animation Aesthetic' ? AESTHETICS : getOptionsForType(type);
      parameters.push({ type, value: defaultValue, options });
    }
  });

  // Ensure parameters are in the correct order and have correct options
  return REQUIRED_SEGMENTS.map(type => {
    const param = parameters.find(p => p.type === type);
    // Always ensure Aesthetic has the correct options
    if (type === 'Illustration/Animation Aesthetic') {
      return {
        type,
        value: param?.value || `[${type}]`,
        options: AESTHETICS
      };
    }
    return param || {
      type,
      value: `[${type}]`,
      options: getOptionsForType(type)
    };
  });
};

const getOptionsForType = (type: string): readonly string[] => {
  switch (type) {
    case 'Illustration/Animation Type':
      return [...ILLUSTRATION_TYPES, ...ANIMATION_TYPES];
    case 'Shot Type':
      return SHOT_TYPES;
    case 'Camera Angle':
      return CAMERA_ANGLES;
    case 'Style of Illustrator/Animation Studio':
      return STYLE_REFERENCES;
    case '3D Rendering/Animation Engine':
      return RENDERING_ENGINES.map(e => `created in ${e}`);
    case 'Illustration/Animation Aesthetic':
      return AESTHETICS;
    default:
      return [];
  }
};

const renderParameter = (
  param: EditableParameter,
  openPopovers: { [key: string]: boolean },
  togglePopover: (value: string, open: boolean) => void,
  handleParameterUpdate: (oldValue: string, newValue: string) => void,
  isPlaceholder: boolean = false
) => {
  const isHighlighted = param.value.startsWith('[') || true;

  return (
    <Popover
      open={openPopovers[param.value]}
      onOpenChange={(open) => togglePopover(param.value, open)}
    >
      <PopoverTrigger asChild>
        <span className={clsx(
          "px-2 py-0.5 rounded cursor-pointer",
          "bg-white text-black hover:bg-gray-50 border border-gray-200",
          isHighlighted && "ring-2 ring-primary"
        )}>
          {param.value}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] z-[100]"
        align="start"
        side="top"
        sideOffset={5}
      >
        <div className="space-y-2">
          <h4 className="font-medium">{param.type}</h4>
          <Select
            value={param.value}
            onValueChange={(value) => handleParameterUpdate(param.value, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Choose ${param.type.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="max-h-[300px] overflow-y-auto z-[100]"
            >
              {param.options.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const handleParameterUpdate = (oldValue: string, newValue: string, generatedPrompt: string | null, setGeneratedPrompt: (value: string | null) => void, setEditablePrompt: (value: string) => void, setEditableParameters: (params: EditableParameter[]) => void, setOpenPopovers: (popovers: { [key: string]: boolean }) => void) => {
  if (!generatedPrompt) return;


  let newPrompt = generatedPrompt;
  const segments = generatedPrompt.split(',').map(s => s.trim());
  const segmentIndex = segments.findIndex(segment =>
    segment.includes(oldValue) ||
    (oldValue.startsWith('[') && oldValue.endsWith(']'))
  );

  if (segmentIndex !== -1) {
    segments[segmentIndex] = newValue;
    newPrompt = segments.join(', ');
  } else {
    newPrompt = `${newPrompt}, ${newValue}`;
  }

  newPrompt = ensurePromptStructure(newPrompt);
  setGeneratedPrompt(newPrompt);
  setEditablePrompt(newPrompt);
  setEditableParameters(parsePrompt(newPrompt));
  setOpenPopovers({});
};

const renderHighlightedPrompt = (
  generatedPrompt: string | null,
  editableParameters: EditableParameter[],
  openPopovers: { [key: string]: boolean },
  setOpenPopovers: (popovers: { [key: string]: boolean }) => void,
  handleParameterUpdate: (oldValue: string, newValue: string) => void,
  toastFn?: Function // Add optional toast parameter
) => {
  if (!generatedPrompt) return null;

  let result: React.ReactNode[] = [];
  const segments = generatedPrompt.split(',').map(s => s.trim());

  segments.forEach((segment, index) => {
    // Check if this is a required segment or first segment (always treat as Illustration/Animation Type)
    const isRequiredSegment = index === 0 || REQUIRED_SEGMENTS.some(type => {
      if (type === 'Illustration/Animation Type') {
        const normalizedSegment = normalizeText(segment);
        return segment.includes(`[${type}]`) ||
          ILLUSTRATION_TYPES.some(illType => normalizedSegment.includes(normalizeText(illType))) ||
          ANIMATION_TYPES.some(animType => normalizedSegment.includes(normalizeText(animType)));
      }
      return segment.includes(`[${type}]`);
    });

    // Find matching parameter
    let matchingParam = editableParameters.find(param => {
      if (segment.includes(`[${param.type}]`)) {
        return true;
      }

      const normalizedSegment = normalizeText(segment);

      // If it's the first segment, always match as Illustration/Animation Type
      if (index === 0) {
        return param.type === 'Illustration/Animation Type';
      }

      // Special handling for Aesthetic to ensure it always matches correctly
      if (param.type === 'Illustration/Animation Aesthetic' && 
          (normalizedSegment.includes('aesthetic') || segment.includes('[Illustration/Animation Aesthetic]'))) {
        return true;
      }

      switch (param.type) {
        case 'Illustration/Animation Type':
          return ILLUSTRATION_TYPES.some(type => normalizedSegment.includes(normalizeText(type))) ||
            ANIMATION_TYPES.some(type => normalizedSegment.includes(normalizeText(type)));
        case 'Shot Type':
          return SHOT_TYPES.some(shot => isMatchingShotType(segment, shot));
        case 'Camera Angle':
          return CAMERA_ANGLES.some(angle => normalizedSegment.includes(normalizeText(angle)));
        case 'Style of Illustrator/Animation Studio':
          return normalizedSegment.includes('inspiredby');
        case '3D Rendering/Animation Engine':
          return normalizedSegment.includes('createdin');
        default:
          return false;
      }
    });

    // For first segment, always provide Illustration/Animation Type options if no match found
    if (index === 0 && !matchingParam) {
      matchingParam = {
        type: 'Illustration/Animation Type',
        value: segment,
        options: [...ILLUSTRATION_TYPES, ...ANIMATION_TYPES]
      };
    }

    // For Aesthetic segments, always ensure they use AESTHETICS options
    if (matchingParam?.type === 'Illustration/Animation Aesthetic' || 
        segment.toLowerCase().includes('aesthetic') ||
        segment.includes('[Illustration/Animation Aesthetic]')) {
      matchingParam = {
        type: 'Illustration/Animation Aesthetic',
        value: segment,
        options: AESTHETICS
      };
    }

    // Highlight if it's a required segment, first segment, or matches a parameter
    if (isRequiredSegment || matchingParam || index === 0) {
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
                  {matchingParam?.type === 'Illustration/Animation Aesthetic' ? 
                    'Illustration/Animation Aesthetic' :
                    (index === 0 ? 'Illustration/Animation Type' : (matchingParam?.type || 'Parameter'))}
                </h4>
                <Select
                  value={segment}
                  onValueChange={(value) => handleParameterUpdate(segment, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Choose ${
                      matchingParam?.type === 'Illustration/Animation Aesthetic' ? 
                        'aesthetic' :
                        (index === 0 ? 'illustration/animation type' : (matchingParam?.type || 'parameter').toLowerCase())
                    }`} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="max-h-[300px] overflow-y-auto z-[100]"
                  >
                    {matchingParam?.type === 'Illustration/Animation Aesthetic' ?
                      AESTHETICS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      )) :
                      (index === 0 ?
                        [...ILLUSTRATION_TYPES, ...ANIMATION_TYPES] :
                        matchingParam?.options || []
                      ).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
          {index < segments.length - 1 && <span>, </span>}
        </React.Fragment>
      );
    } else {
      // Non-parameter text
      result.push(
        <React.Fragment key={`text-${index}`}>
          <span>{segment}</span>
          {index < segments.length - 1 && <span>, </span>}
        </React.Fragment>
      );
    }
  });

  return (
    <div className="space-y-4">
      <div className="min-h-[100px] p-4 border rounded-md font-mono text-sm leading-relaxed">
        {result}
      </div>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (generatedPrompt) {
              navigator.clipboard.writeText(generatedPrompt);
              if (toastFn) {
                toastFn({
                  title: "Copied!",
                  description: "Complete prompt copied to clipboard",
                });
              }
            } else {
              if (toastFn) {
                toastFn({
                  title: "Nothing to copy",
                  description: "Please generate a prompt first",
                  variant: "destructive",
                });
              }
            }
          }}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Prompt
        </Button>
      </div>
    </div>
  );
};

const BetterPrompt = () => {
  const { toast } = useToast();
  
  // Helper function to adjust textarea height
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [description, setDescription] = useState("");
  const [editableParameters, setEditableParameters] = useState<EditableParameter[]>([]);
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>({});
  const generatedPromptRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
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
    // Clear image states
    setSelectedImage(null);
    setImagePreview(null);

    // Clear all prompt-related states
    setGeneratedPrompt(null);
    setEditablePrompt("");
    setEditableParameters([]);
    setOpenPopovers({});

    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    toast({
      title: "Image deleted",
      description: "Image and associated prompts have been cleared",
    });
  };

  const togglePopover = (paramValue: string, isOpen: boolean) => {
    setOpenPopovers(prev => ({
      ...prev,
      [paramValue]: isOpen
    }));
  };

  const analyzeIllustration = async () => {
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
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/analyze-illustration', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze illustration');
      }

      const data = await response.json();
      const structuredPrompt = ensurePromptStructure(data.generatedPrompt);
      setGeneratedPrompt(structuredPrompt);
      setEditablePrompt(structuredPrompt);
      setEditableParameters(parsePrompt(structuredPrompt));

      toast({
        title: "Analysis complete",
        description: "Your illustration has been successfully analyzed",
      });
    } catch (error) {
      console.error('Illustration Analysis Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze the illustration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    // Clear all generated prompts and related states when description changes
    if (generatedPrompt) {
      setGeneratedPrompt(null);
      setEditablePrompt("");
      setEditableParameters([]);
      setOpenPopovers({});
    }
  };

  const handleGenerateIllustrationPrompt = async () => {
    if (!description.trim()) {
      toast({
        title: "No description provided",
        description: "Please enter a description.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const response = await fetch('/api/generate-illustration-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate illustration prompt");
      }

      const data = await response.json();
      const structuredPrompt = ensurePromptStructure(data.generatedPrompt);
      setGeneratedPrompt(structuredPrompt);
      setEditablePrompt(structuredPrompt);
      setEditableParameters(parsePrompt(structuredPrompt));

      toast({
        title: "Prompt generated",
        description: "Your description has been converted into a structured illustration prompt."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate prompt",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const resetTextPrompt = () => {
    setGeneratedPrompt(null);
    setEditablePrompt("");
    setDescription("");
    setEditableParameters([]);
    setOpenPopovers({});
    toast({
      title: "Prompt reset",
      description: "Text prompt has been cleared",
    });
  };

  const resetForm = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setGeneratedPrompt(null);
    setEditablePrompt("");
    setDescription("");
    setEditableParameters([]);
    setOpenPopovers({});
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    toast({
      title: "Form reset",
      description: "All fields and generated prompt have been cleared",
    });
  };

  const localHandleParameterUpdate = (oldValue: string, newValue: string) => {
    handleParameterUpdate(
      oldValue,
      newValue,
      generatedPrompt,
      setGeneratedPrompt,
      setEditablePrompt,
      setEditableParameters,
      setOpenPopovers
    );
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (generatedPrompt && generatedPromptRef.current) {
      generatedPromptRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedPrompt]);

  useEffect(() => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      if (textarea && editablePrompt) {
        adjustTextareaHeight(textarea as HTMLTextAreaElement);
      }
    });
  }, [editablePrompt]);

  useEffect(() => {
    if (generatedPrompt) {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        const resizeObserver = new ResizeObserver(() => {
          adjustTextareaHeight(textarea as HTMLTextAreaElement);
        });
        resizeObserver.observe(textarea);
        return () => resizeObserver.disconnect();
      });
    }
  }, [generatedPrompt]);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Illustration Prompt Generator</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Create rich, stylized prompts from your text or illustrations.
          Turn your idea or artwork into a detailed prompt ready for AI-generated illustrations in your favorite artistic style.
        </p>
      </div>
      <Card className="w-full">
        <CardContent className="p-6 space-y-4">
          {/* TEXT TO PROMPT Section */}
          <div className="w-full space-y-2">
            <h2 className="text-2xl font-bold mb-4">TEXT TO PROMPT</h2>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a description of the illustration you want to create..."
              value={description}
              onChange={handleDescriptionChange}
              className="min-h-[100px] w-full"
              disabled={isGeneratingPrompt}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateIllustrationPrompt}
                disabled={!description.trim() || isGeneratingPrompt}
                className="flex-1"
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Illustration Prompt"
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
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Label>Editable Prompt</Label>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 text-muted-foreground">
                            <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                          </svg>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ready-to-use prompt where you can also change each parameter according to your needs</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  value={editablePrompt}
                  onChange={(e) => {
                    const newPrompt = ensurePromptStructure(e.target.value);
                    setEditablePrompt(newPrompt);
                    setGeneratedPrompt(newPrompt);
                    setEditableParameters(parsePrompt(newPrompt));
                    adjustTextareaHeight(e.target as HTMLTextAreaElement);
                  }}
                  className="w-full font-mono text-sm resize-none min-h-[60px]"
                  placeholder="Your prompt will appear here..."
                />
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Label>Highlighted Parameters</Label>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 text-muted-foreground">
                                <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                              </svg>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Illuminated segments with a drop-down list for quick changes to image aesthetics</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {renderHighlightedPrompt(
                      generatedPrompt,
                      editableParameters,
                      openPopovers,
                      setOpenPopovers,
                      localHandleParameterUpdate,
                      toast // Pass toast function
                    )}
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* IMAGE TO PROMPT Section */}
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">ILLUSTRATION TO PROMPT</h2>
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-grow">
                <Label htmlFor="photo">Upload Illustration for Analysis</Label>
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
                  onClick={analyzeIllustration}
                  disabled={isAnalyzing}
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Analyze Illustration
                    </>
                  )}
                </Button>

                {generatedPrompt && selectedImage && (
                  <div ref={generatedPromptRef} className="space-y4">
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Label>Editable Prompt</Label>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 text-muted-foreground">
                                <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                              </svg>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ready-to-use prompt where you can also change each parameter according to your needs</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      value={editablePrompt}
                      onChange={(e) => {
                        const newPrompt = ensurePromptStructure(e.target.value);
                        setEditablePrompt(newPrompt);
                        setGeneratedPrompt(newPrompt);
                        setEditableParameters(parsePrompt(newPrompt));
                        adjustTextareaHeight(e.target);
                      }}
                      className="w-full font-mono text-sm resize-none min-h-[60px]"
                      placeholder="Your prompt will appear here..."
                    />
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Label>Highlighted Parameters</Label>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 text-muted-foreground">
                                <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                              </svg>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Illuminated segments with a drop-down list for quick changes to image aesthetics</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {renderHighlightedPrompt(
                      generatedPrompt,
                      editableParameters,
                      openPopovers,
                      setOpenPopovers,
                      localHandleParameterUpdate,
                      toast // Pass toast function
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
};

export { BetterPrompt };