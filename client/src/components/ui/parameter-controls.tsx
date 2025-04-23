import {
  CAMERA_TYPES,
  LIGHTING_SETUPS,
  STYLE_REFERENCES,
  SHOT_TYPES,
  CAMERA_ANGLES,
  FILM_STOCK,
  COLOR_PALETTES,
  PHOTOGRAPHY_GENRES,
  AESTHETICS
} from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Parameters {
  photographyGenre: string;
  shotType: string;
  cameraAngle: string;
  camera: string;
  lens: string;
  filmStock: string;
  lighting: string;
  colorPalette: string;
  mood: string;
  style: string;
  aesthetic: string;
}

interface ParameterControlsProps {
  parameters: Parameters;
  onParameterChange: (key: string, value: string) => void;
}

function ParameterDropdown({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Choose ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ParameterControls({
  parameters,
  onParameterChange,
}: ParameterControlsProps) {
  return (
    <div className="grid gap-4">
      <ParameterDropdown
        label="Photography Genre"
        value={parameters.photographyGenre}
        options={PHOTOGRAPHY_GENRES}
        onChange={(value) => onParameterChange("photographyGenre", value)}
      />

      <ParameterDropdown
        label="Shot Type"
        value={parameters.shotType}
        options={SHOT_TYPES}
        onChange={(value) => onParameterChange("shotType", value)}
      />

      <ParameterDropdown
        label="Camera Angle"
        value={parameters.cameraAngle}
        options={CAMERA_ANGLES}
        onChange={(value) => onParameterChange("cameraAngle", value)}
      />

      <ParameterDropdown
        label="Director Style"
        value={parameters.style}
        options={STYLE_REFERENCES}
        onChange={(value) => onParameterChange("style", value)}
      />

      <ParameterDropdown
        label="Camera"
        value={parameters.camera}
        options={CAMERA_TYPES}
        onChange={(value) => onParameterChange("camera", value)}
      />

      <ParameterDropdown
        label="Film Stock"
        value={parameters.filmStock}
        options={FILM_STOCK}
        onChange={(value) => onParameterChange("filmStock", value)}
      />

      <ParameterDropdown
        label="Lighting"
        value={parameters.lighting}
        options={LIGHTING_SETUPS}
        onChange={(value) => onParameterChange("lighting", value)}
      />

      <ParameterDropdown
        label="Color Palette"
        value={parameters.colorPalette}
        options={COLOR_PALETTES}
        onChange={(value) => onParameterChange("colorPalette", value)}
      />

      <ParameterDropdown
        label="Aesthetic"
        value={parameters.aesthetic}
        options={AESTHETICS}
        onChange={(value) => onParameterChange("aesthetic", value)}
      />
    </div>
  );
}