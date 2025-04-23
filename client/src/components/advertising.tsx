import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Advertising() {
  const { toast } = useToast();
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const exampleBrief = {
    objective: "Promote new skincare line 'Glow Botanica' on Instagram Story",
    targetAudience: "Women aged 20-35 who care about natural beauty and sustainable products",
    coreMessage: "Your skin, redefined by nature",
    mediaFormat: "Instagram Story (1080x1920)",
    designStyle: "Clean, soft-focus photography with natural elements",
    toneAndMood: "inviting",
    callToAction: "Swipe up to discover your glow",
    essentialInfo: "Logo placement: Top center, small and elegant",
    creativeRequirements: "Brand identity focused on natural beauty and sustainability",
    lighting: "Natural sunlight from the side, warm tones, soft shadows",
    composition: "Center-aligned portrait with open space above for logo",
    props: "Glass jar with product, linen cloth, botanical leaves",
    modelInvolvement: "Smiling woman with radiant skin holding product near cheek, no makeup",
    focusPoints: "Product and model's glowing skin",
    action: "Gentle product placement near face"
  };

  const initialFormData = {
    // Strategic Info
    objective: '',
    targetAudience: '',
    coreMessage: '',
    essentialInfo: '',
    toneAndMood: '',
    callToAction: '',
    mediaFormat: '',

    // Visual Requirements
    designStyle: '',
    creativeRequirements: '',
    assetsUrl: '',

    // Advanced Options
    lighting: '',
    composition: '',
    props: '',
    postProcessing: '',
    modelInvolvement: '',
    focusPoints: '',
    action: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string, value: string }) => {
    if ('target' in e) {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      const { name, value } = e;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGeneratePrompt = async () => {
    try {
      const formattedPrompt = generateAdPromptText(formData);
      setGeneratedPrompt(formattedPrompt);
      toast({
        title: "Success",
        description: "Advertising prompt generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadExample = () => {
    setFormData(exampleBrief);
  };

  const generateAdPromptText = (brief: any) => {
    const getOrDefault = (value: string | undefined, fallback: string) => value?.trim() || fallback;

    return `
Advertising image for ${getOrDefault(brief.objective, "a new product or campaign")} — designed for ${getOrDefault(brief.mediaFormat, "Instagram Story (1080x1920)")}.

Target Audience: ${getOrDefault(brief.targetAudience, "Relevant demographic based on the product")}

Core Message: ${getOrDefault(brief.coreMessage, "A bold statement about the product's value")}

Visual Style: ${getOrDefault(brief.designStyle, "Clean, commercial, brand-aligned")}

Tone & Mood: ${getOrDefault(brief.toneAndMood, "Modern, elegant, and inviting")}

Composition & Framing: ${getOrDefault(brief.composition, "Product-centered with generous breathing room")}

Lighting Direction: ${getOrDefault(brief.lighting, "Soft natural light with subtle shadows")}

Subject / Action: ${getOrDefault(brief.action, "Product being used or displayed clearly")}

Focus Points: ${getOrDefault(brief.focusPoints, "Main product and branding elements")}

Props & Environment: ${getOrDefault(brief.props, "Minimalistic set styling with accent props")}

Brand Identity Details: ${getOrDefault(brief.creativeRequirements, "Brand identity requirements")}

Assets Provided: ${getOrDefault(brief.assetsUrl, "None provided")}

Call to Action: ${getOrDefault(brief.callToAction, `"Learn more" or "Shop now"`)}  
Essential Info: ${getOrDefault(brief.essentialInfo, "Website, social media, or contact info here")}
`.trim();
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setGeneratedPrompt('');
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Advertising Prompt Generator</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Turn your creative brief into a powerful image prompt.
          Fill out the strategic and visual information, and we'll generate a complete advertising prompt for ChatGPT – ready for brand visuals, posters, and social media campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategic Info */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">🧠 Strategic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="objective">Objective (Purpose)</Label>
                <Input
                  id="objective"
                  name="objective"
                  value={formData.objective}
                  onChange={handleChange}
                  placeholder="e.g., Promote a product"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  placeholder="e.g., Young professionals, coffee lovers"
                />
              </div>

              <div>
                <Label htmlFor="coreMessage">Core Message</Label>
                <Input
                  id="coreMessage"
                  name="coreMessage"
                  value={formData.coreMessage}
                  onChange={handleChange}
                  placeholder="e.g., Brewed with Passion. Served with Love."
                />
              </div>

              <div>
                <Label htmlFor="essentialInfo">Essential Info</Label>
                <Textarea
                  id="essentialInfo"
                  name="essentialInfo"
                  value={formData.essentialInfo}
                  onChange={handleChange}
                  placeholder="e.g., Website, café location, opening hours"
                />
              </div>

              <div>
                <Label htmlFor="toneAndMood">Tone and Mood</Label>
                <Select name="toneAndMood" onValueChange={(value) => handleChange({ name: 'toneAndMood', value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inviting">Inviting</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="luxurious">Luxurious</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="calming">Calming</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="romantic">Romantic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="callToAction">Call to Action (CTA)</Label>
                <Input
                  id="callToAction"
                  name="callToAction"
                  value={formData.callToAction}
                  onChange={handleChange}
                  placeholder="e.g., Visit our café today!"
                />
              </div>

              <div>
                <Label htmlFor="mediaFormat">Media Format and Size</Label>
                <Select name="mediaFormat" onValueChange={(value) => handleChange({ name: 'mediaFormat', value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select image dimensions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">1024×1024 (square)</SelectItem>
                    <SelectItem value="1024x1536">1024×1536 (portrait)</SelectItem>
                    <SelectItem value="1536x1024">1536×1024 (landscape)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Requirements */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">🎨 Visual Requirements</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="designStyle">Design/Image Style</Label>
                <Select name="designStyle" onValueChange={(value) => handleChange({ name: 'designStyle', value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ghibli">Ghibli</SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="flat-illustration">Flat Illustration</SelectItem>
                    <SelectItem value="3d-rendered">3D Rendered</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="editorial">Editorial</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="creativeRequirements">Creative Requirements</Label>
                <Textarea
                  id="creativeRequirements"
                  name="creativeRequirements"
                  value={formData.creativeRequirements}
                  onChange={handleChange}
                  placeholder="e.g., Logo in top left, use brand font, brand colors #FF6A00"
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="advanced"
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                />
                <Label htmlFor="advanced">Show Advanced Options</Label>
              </div>

              {showAdvanced && (
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="lighting">Lighting</Label>
                    <Input
                      id="lighting"
                      name="lighting"
                      value={formData.lighting}
                      onChange={handleChange}
                      placeholder="e.g., Soft natural lighting, dramatic shadows"
                    />
                  </div>

                  <div>
                    <Label htmlFor="composition">Composition</Label>
                    <Input
                      id="composition"
                      name="composition"
                      value={formData.composition}
                      onChange={handleChange}
                      placeholder="e.g., Rule of thirds, centered composition"
                    />
                  </div>

                  <div>
                    <Label htmlFor="props">Props</Label>
                    <Input
                      id="props"
                      name="props"
                      value={formData.props}
                      onChange={handleChange}
                      placeholder="e.g., Coffee cups, laptop, plants"
                    />
                  </div>
                  <div>
                    <Label htmlFor="action">Action or Pose</Label>
                    <Input
                      id="action"
                      name="action"
                      value={formData.action}
                      onChange={handleChange}
                      placeholder="e.g., Person holding a coffee cup"
                    />
                  </div>

                  <div>
                    <Label htmlFor="modelInvolvement">Model Involvement</Label>
                    <Input
                      id="modelInvolvement"
                      name="modelInvolvement"
                      value={formData.modelInvolvement}
                      onChange={handleChange}
                      placeholder="e.g., One person, group shot, no models"
                    />
                  </div>

                  {/* <div>
                    <Label htmlFor="focusPoints">Focus Points</Label>
                    <Input
                      id="focusPoints"
                      name="focusPoints"
                      value={formData.focusPoints}
                      onChange={handleChange}
                      placeholder="e.g., Product in foreground, blurred background"
                    />
                  </div> */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={handleGeneratePrompt} className="bg-orange-600 hover:bg-orange-700">
          Generate Prompt
        </Button>
        <Button onClick={loadExample} variant="outline">
          Load Example
        </Button>
        <Button onClick={handleClear} variant="outline">
          Clear All
        </Button>
      </div>

      {generatedPrompt && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">🎯 Generated Prompt:</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPrompt);
                        toast({
                          title: "Copied!",
                          description: "Prompt copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-yellow-400 text-black border-yellow-500"
                    sideOffset={5}
                  >
                    Insert the generated prompt directly into ChatGPT. You can also attach a logo and/or product image to the chat for better results.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              value={generatedPrompt}
              className="min-h-[200px] bg-black/50"
              readOnly
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}