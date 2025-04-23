import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ShotContinuation() {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sceneDescription, setSceneDescription] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [movementDescription, setMovementDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const generateSecondPrompt = async () => {
    if (!uploadedImage || !sceneDescription) {
      toast({
        title: "Error",
        description: "Please upload an image and provide a scene description",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/generate-photo-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: sceneDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prompt");
      }

      const data = await response.json();
      setGeneratedPrompt(data.generatedPrompt);
      toast({
        title: "Success",
        description: "Second shot prompt generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMovement = async () => {
    if (!uploadedImage || !generatedPrompt) {
      toast({
        title: "Error",
        description: "Please generate a prompt first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("image", uploadedImage);
      formData.append("prompt", generatedPrompt);

      const response = await fetch("/api/analyze-photo-motion", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate movement");
      }

      const data = await response.json();
      setMovementDescription(data.frameMovement + "\n\nCamera Movement: " + data.cameraMovement);
      toast({
        title: "Success",
        description: "Movement description generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate movement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Shot Continuation</h2>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Upload Reference Image</h3>
            <div className="space-y-2">
              <Label>Upload first shot image (for style reference)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-2"
              />
            </div>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Reference"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Scene Description</h3>
            <div className="space-y-2">
              <Label>Describe the first frame of the second shot</Label>
              <Textarea
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                placeholder="Describe your scene..."
                className="h-32"
              />
            </div>

            <Button
              onClick={generateSecondPrompt}
              disabled={isLoading || !uploadedImage || !sceneDescription}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Second Shot Prompt"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedPrompt && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: Generated Prompt</h3>
              <Textarea
                value={generatedPrompt}
                readOnly
                className="h-32"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPrompt);
                  toast({
                    title: "Copied",
                    description: "Prompt copied to clipboard",
                  });
                }}
                variant="outline"
              >
                Copy to Clipboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedPrompt && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 4: Movement Generation</h3>
              <Button
                onClick={generateMovement}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Movement Description"
                )}
              </Button>

              {movementDescription && (
                <div className="space-y-2">
                  <Label>Generated Movement Description</Label>
                  <Textarea
                    value={movementDescription}
                    readOnly
                    className="h-32"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(movementDescription);
                      toast({
                        title: "Copied",
                        description: "Movement description copied to clipboard",
                      });
                    }}
                    variant="outline"
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}