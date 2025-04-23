import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, RotateCcw, Loader2, Trash2, Video, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const cleanTimingPhrases = (text: string): string => {
    return text
      .replace(/in the first \w+ seconds?/gi, '')
      .replace(/for \w+ seconds?/gi, '')
      .replace(/\w+ seconds? of/gi, '')
      .replace(/approximately \w+ seconds?/gi, '')
      .replace(/this movement should take[^.]*/gi, '')
      .replace(/lasting \w+ seconds?/gi, '')
      .replace(/over \w+ seconds?/gi, '')
      .replace(/within \w+ seconds?/gi, '')
      .replace(/during \w+ seconds?/gi, '')
      .replace(/\(\d+-Second Scene\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

export function MotionDesign() {
  const { toast } = useToast();
  const [frameMovement, setFrameMovement] = useState("");
  const [cameraMovement, setCameraMovement] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [continuityEnabled, setContinuityEnabled] = useState(false);
  const [combinedPrompt, setCombinedPrompt] = useState("");
  const [imageContext, setImageContext] = useState<string | null>(null);

  useEffect(() => {
    if (frameMovement || cameraMovement) {
      const cleanFrameMovement = frameMovement
        .replace(/^Movement Generation \(5-Second Scene\):\s*/i, "")
        .replace(/^Subject Movement:\s*/i, "")
        .replace(/^Frame Movement:\s*/i, "")
        .trim();

      const cleanCameraMovement = cameraMovement
        .replace(/^Camera Movement:\s*/i, "")
        .trim();

      let combined = "";
      if (cleanFrameMovement && cleanCameraMovement) {
        combined = `${cleanTimingPhrases(cleanFrameMovement)} ${cleanTimingPhrases(cleanCameraMovement)}`;
      } else {
        combined = cleanTimingPhrases(cleanFrameMovement || cleanCameraMovement).trim();
      }

      if (combined.length > 490) {
        const sentences = combined.match(/[^.!?]+[.!?]+/g) || [];
        let truncated = "";
        for (const sentence of sentences) {
          if ((truncated + sentence).length <= 490) {
            truncated += sentence;
          } else {
            break;
          }
        }
        combined = truncated.trim();
      }

      setCombinedPrompt(combined);
    } else {
      setCombinedPrompt("");
    }
  }, [frameMovement, cameraMovement]);

  useEffect(() => {
    const copiedPrompt = localStorage.getItem("copiedPrompt");
    if (copiedPrompt) {
      setBasePrompt(copiedPrompt);
      localStorage.removeItem("copiedPrompt");
      toast({
        title: "Prompt copied",
        description: "The prompt has been copied from Photo Analysis",
      });
    }
  }, [toast]);

  const resetForm = () => {
    setFrameMovement("");
    setCameraMovement("");
    setBasePrompt("");
    setSelectedImage(null);
    setImagePreview(null);
    setContinuityEnabled(false);
    setImageContext(null);
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const deleteImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageContext(null);
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard",
    });
  };

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

    // Check file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateMotion = async () => {
    // If neither image nor base prompt is provided
    if (!selectedImage && !basePrompt) {
      toast({
        title: "Missing input",
        description: "Please either upload an image or describe the desired movement",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // If we have an image and no prompt, analyze the image directly
      if (selectedImage && !basePrompt) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const response = await fetch("/api/analyze-photo-motion", {
          method: "POST",
          body: formData,
        });

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to analyze image" }));
          throw new Error(errorData.message || "Failed to analyze image");
        }

        const data = await response.json();
        setFrameMovement(data.frameMovement || "");
        setCameraMovement(data.cameraMovement || "");
        setImageContext(data.imageContext || "");
      } else {
        // If we have an image and basePrompt, first get image context if needed
        if (selectedImage && !imageContext) {
          const formData = new FormData();
          formData.append("image", selectedImage);

          const response = await fetch("/api/analyze-photo-motion", {
            method: "POST",
            body: formData,
          });

          const contentType = response.headers.get('content-type');
          if (!contentType?.includes('application/json')) {
            throw new Error('Invalid response format from server');
          }
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Failed to analyze image" }));
            throw new Error(errorData.message || "Failed to analyze image");
          }

          const data = await response.json();
          setImageContext(data.imageContext || "");
        }

        // Generate motion prompts using action description and image context if available
        const response = await fetch("/api/motion/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            basePrompt,
            imageContext: selectedImage ? imageContext : null,
            frameLength: 5,
            maxCharacters: 500,
          }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to generate motion suggestions" }));
          throw new Error(errorData.message || "Failed to generate motion suggestions");
        }

        const data = await response.json();
        setFrameMovement(data.frameMovement || "");
        setCameraMovement(data.cameraMovement || "");
      }

      toast({
        title: "Analysis complete",
        description: "Motion suggestions have been generated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate motion suggestions",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Motion Prompt Generator</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Animate your illustration or image with cinematic movement.
          Describe the action, and we'll generate both in-frame and camera movement to bring your static visual to life in a 5-second shot.
        </p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Form
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Upload image or illustration</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="cursor-pointer"
              disabled={isAnalyzing}
            />
            {imagePreview && (
              <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-lg border">
                <img
                  src={imagePreview}
                  alt="Selected frame"
                  className="object-contain w-full h-full"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteImage}
                  className="absolute top-2 right-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="basePrompt">Image/ Illustration animation</Label>
            <Textarea
              id="basePrompt"
              placeholder="Describe the desired movement and action for this 5-second shot, including what happens in the frame"
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              className="h-32"
              disabled={isAnalyzing}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Movement within the frame</Label>
              {frameMovement && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyText(frameMovement)}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Textarea
              value={frameMovement}
              readOnly
              placeholder="Movement within the frame will be generated based on your description and image..."
              className="h-32 font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Camera Movement</Label>
              {cameraMovement && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyText(cameraMovement)}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Textarea
              value={cameraMovement}
              readOnly
              placeholder="Camera movement will be generated based on your description and image..."
              className="h-32 font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Combined Prompt (max 500 characters)</Label>
              {combinedPrompt && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyText(combinedPrompt)}
                        className="h-8 w-8"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-yellow-400 text-black border-yellow-500">
                      copy prompt into your AI video generator
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Textarea
              value={combinedPrompt}
              readOnly
              placeholder="The combined frame and camera movement prompt will appear here..."
              className="h-32 font-mono"
            />
          </div>

          <Button
            onClick={generateMotion}
            disabled={isAnalyzing || (!selectedImage && !basePrompt)}
            className="w-full bg-[#D95525] hover:bg-[#D95525]/90 text-white"
            variant="secondary"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Generate Motion Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}