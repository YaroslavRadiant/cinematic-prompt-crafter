import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, CameraIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const highlightPrompt = (text: string) => {
  // Key segments to highlight
  const highlightSegments = [
    "Illustration/Animation Type",
    "Shot Type", 
    "Camera Angle",
    "Style of Illustrator/Animation Studio",
    "3D Rendering/Animation Engine",
    "Illustration/Animation Aesthetic"
  ];

  // Split the text into segments
  const segments = text.split(',').map(s => s.trim());
  let result: React.ReactNode[] = [];

  segments.forEach((segment, index) => {
    // Check if this segment should be highlighted
    const isHighlightable = (s: string): boolean => {
      return (
        // Illustration/Animation Type
        /\b([\w\s]+ Illustration|[\w\s]+ Animation)\b/i.test(s) ||
        // Shot Type
        /\b((?:Full Body|[\w\s-]+) Shot|Close-?up|Wide|Medium|Long Shot|Establishing Shot|POV|Over-the-Shoulder)\b/i.test(s) ||
        // Camera Angle
        /\b([\w\s-]+ Angle|[\w\s-]+ View|Top Down|Bottom Up|[A-Za-z]+ Level)\b/i.test(s) ||
        // Style of Illustrator/Animation Studio
        /\b(?:inspired by )?(?:Yoshitaka Amano|Moebius)\b/i.test(s) ||
        // 3D Rendering/Animation Engine
        /\b(?:Unreal|Unity|Blender|[\w\s-]+) Engine(?: \d+)?\b/i.test(s) ||
        // Illustration/Animation Aesthetic
        /\b([\w\s]+ Aesthetic)\b/i.test(s)
      );
    };

    if (isHighlightable(segment)) {
      result.push(
        <span key={index} className="bg-white text-black px-2 py-0.5 rounded">
          {segment}
        </span>
      );
    } else {
      result.push(<span key={index}>{segment}</span>);
    }

    // Add comma and space after each segment except the last one
    if (index < segments.length - 1) {
      result.push(<span key={`comma-${index}`}>, </span>);
    }
  });

  return <>{result}</>;
};

export function PromptPreview({ prompt }: { prompt: string }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const promptText = React.useMemo(() => {
    const text = typeof prompt === 'string' ? prompt : prompt.generatedPrompt;
    return text;
  }, [prompt]);

  const copyToClipboard = React.useCallback(async () => {
    await navigator.clipboard.writeText(promptText);
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard",
    });
  }, [promptText, toast]);

  const copyToMotionDesign = React.useCallback(() => {
    localStorage.setItem('copiedPrompt', promptText);
    setLocation('/?tab=motion');
    toast({
      title: "Prompt copied to Motion Design",
      description: "Switch to the Motion Design tab to add movement",
    });
  }, [promptText, setLocation, toast]);

  return (
    <Card className="bg-muted">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="text-sm font-mono whitespace-pre-wrap flex-1">
            {highlightPrompt(promptText.trim())}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToMotionDesign}
                    className="shrink-0"
                  >
                    <CameraIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-yellow-500 text-black border-yellow-600"
                  sideOffset={5}
                >
                  Copy to Motion Design
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}