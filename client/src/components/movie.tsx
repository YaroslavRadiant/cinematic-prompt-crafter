import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Upload, RotateCcw, Trash2, Copy, Video, Loader2 } from "lucide-react";
import { MovieWorkflow } from "./movie-workflow";
import { ShotContinuation } from "./shot-continuation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const movieFormSchema = z.object({
  description: z.string().min(1, "Please provide a scene description"),
  movementDescription: z.string().optional(),
});

type MovieFormValues = z.infer<typeof movieFormSchema>;

export function Movie() {
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedMovement, setGeneratedMovement] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      description: "",
      movementDescription: "",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MovieFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: data.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prompt");
      }

      const result = await response.json();
      setGeneratedPrompt(result.prompt);
      toast({
        title: "Prompt Generated",
        description: "Your cinematic prompt has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMovement = async () => {
    if (!uploadedImage) {
      toast({
        title: "Image Required",
        description: "Please upload an image before generating movement",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", uploadedImage);

    // Add movement notes if provided
    const movementNotes = form.getValues("movementDescription");
    if (movementNotes?.trim()) {
      formData.append("movementNotes", movementNotes.trim());
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/analyze-photo-motion", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to analyze image");
      }

      const { frameMovement, cameraMovement } = await response.json();

      // Combine movement descriptions with character limit
      const movementDescription =
        `${frameMovement}\n\nCamera Movement: ${cameraMovement}`.slice(0, 500);

      setGeneratedMovement(movementDescription);
      toast({
        title: "Movement Generated",
        description: "Movement description has been created successfully.",
      });
    } catch (error) {
      console.error("Movement generation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate movement description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [frameMovement, setFrameMovement] = useState("");
  const [cameraMovement, setCameraMovement] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [continuityEnabled, setContinuityEnabled] = useState(false);
  const [combinedPrompt, setCombinedPrompt] = useState("");
  const [imageContext, setImageContext] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const deleteImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageContext(null);
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const resetForm = () => {
    setFrameMovement("");
    setCameraMovement("");
    setBasePrompt("");
    setSelectedImage(null);
    // setImagePreview(null);
    setContinuityEnabled(false);
    setImageContext(null);
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
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

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard",
    });
  };

  const generateMotion = async () => {
    // If neither image nor base prompt is provided
    if (!selectedImage && !basePrompt) {
      toast({
        title: "Missing input",
        description:
          "Please either upload an image or describe the desired movement",
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

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid response format from server");
        }

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to analyze image" }));
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

          const contentType = response.headers.get("content-type");
          if (!contentType?.includes("application/json")) {
            throw new Error("Invalid response format from server");
          }
          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: "Failed to analyze image" }));
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

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid response format from server");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: "Failed to generate motion suggestions",
          }));
          throw new Error(
            errorData.message || "Failed to generate motion suggestions"
          );
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
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate motion suggestions",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Movie frames Prompt Generator
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl text-left w-full">
              Generate prompts for professional movie frames and prompts to
              bring the frame to life and guide the camera movement.
            </p>
            <MovieWorkflow />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scene Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your scene (e.g., 'A playful dog and alert cat interact with a rolling ball')..."
                          className="h-32"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#15BFBF] hover:bg-[#15BFBF]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Prompt"}
                </Button>
              </form>
            </Form>
            {generatedPrompt && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Generated Prompt:
                </h3>
                <Textarea value={generatedPrompt} readOnly className="h-64" />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                    toast({
                      title: "Copied",
                      description: "Prompt copied to clipboard",
                    });
                  }}
                  variant="outline"
                  className="mt-2"
                >
                  Copy to your AI image generator app
                </Button>
              </div>
            )}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Movement Generation
              </h3>
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
              <div className="space-y-2 mt-6">
                <Label htmlFor="basePrompt">
                  Image/ Illustration animation
                </Label>
                <Textarea
                  id="basePrompt"
                  placeholder="Describe the desired movement and action for this 5-second shot, including what happens in the frame"
                  value={basePrompt}
                  onChange={(e) => setBasePrompt(e.target.value)}
                  className="h-32"
                  disabled={isAnalyzing}
                />
              </div>
              <div className="space-y-2 mt-6">
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
              <div className="space-y-2 mt-6">
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
              <div className="space-y-2 mt-6">
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
                className="w-full bg-[#15BFBF] hover:bg-[#15BFBF]/90 text-white mt-6"
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12">
        <ShotContinuation />
      </div>
    </div>
  );
}
