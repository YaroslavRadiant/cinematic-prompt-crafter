import { FILM_GENRES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilmGenreSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function FilmGenreSelect({ value, onValueChange }: FilmGenreSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a movie style" />
      </SelectTrigger>
      <SelectContent>
        {FILM_GENRES.map((genre) => (
          <SelectItem key={genre} value={genre}>
            {genre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}