
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { TargetIcon, PencilIcon, MotionIcon, FilmIcon, ShotListIcon } from "./GradientIcons";

export function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-36">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Create the Perfect Prompt for Stunning AI-Generated Images and Videos!
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 my-4">
              Turn your text description or reference image into a fully optimized prompt for any AI
              image generator — including Midjourney, Flux, Kimi AI, Helio AI, and more. Then, take it
              further by generating a motion prompt for AI video generators like Runway, Kling, Hailuo,
              Veo 2, Piwere, and beyond. Let AI bring your vision to life!
            </p>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="w-full py-12 md:py-16">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Button 
              className="h-56 text-xl flex flex-col items-center justify-center bg-transparent border border-gray-300 hover:bg-[#1F1F1F] hover:border-[#FF6A00] transition-all duration-300 text-white" 
              onClick={() => setLocation("/?tab=photo")}>
              <TargetIcon className="mb-4 w-28 h-28" />
              <span className="text-2xl font-bold">Image</span>
              <span className="mt-2 text-sm">Photo analyzer & prompt generator</span>
            </Button>
            <Button 
              className="h-56 text-xl flex flex-col items-center justify-center bg-transparent border border-gray-300 hover:bg-[#1F1F1F] hover:border-[#FF6A00] transition-all duration-300 text-white" 
              onClick={() => setLocation("/?tab=better-prompt")}>
              <PencilIcon className="mb-4 w-28 h-28" />
              <span className="text-2xl font-bold">Illustration</span>
              <span className="mt-2 text-sm">Create professional illustration prompts</span>
            </Button>
            <Button 
              className="h-56 text-xl flex flex-col items-center justify-center bg-transparent border border-gray-300 hover:bg-[#1F1F1F] hover:border-[#FF6A00] transition-all duration-300 text-white" 
              onClick={() => setLocation("/?tab=motion")}>
              <MotionIcon className="mb-4 w-28 h-28" />
              <span className="text-2xl font-bold">Motion</span>
              <span className="mt-2 text-sm">Add movement to your illustrations</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Movie Section */}
      <section className="w-full py-12 md:py-24 bg-black/50">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Craft Professional Movie Frames and Bring Them to Life!</h2>
              <p className="text-lg text-gray-400">
                Make advanced prompts for truly professional movie frames that follow all the essential
                rules of cinematic composition, editing, directing, and visual storytelling. Turn your text
                description or reference image into a detailed, filmmaking-oriented prompt for stunning
                cinematic shots. Then, take it further by generating a motion prompt for AI video
                generators to add dynamic movement and storytelling depth to your frames.
              </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Button 
                className="h-56 text-xl flex flex-col items-center justify-center bg-transparent border border-gray-300 hover:bg-[#1F1F1F] hover:border-[#00E5FF] transition-all duration-300 text-white" 
                onClick={() => setLocation("/?tab=movie")}>
                <FilmIcon className="mb-4 w-28 h-28" />
                <span className="text-2xl font-bold">Movie Frames</span>
              </Button>
              <Button 
                className="h-56 text-xl flex flex-col items-center justify-center bg-transparent border border-gray-300 hover:bg-[#1F1F1F] hover:border-[#00E5FF] transition-all duration-300 text-white" 
                onClick={() => setLocation("/?tab=scene")}>
                <ShotListIcon className="mb-4 w-28 h-28" />
                <span className="text-2xl font-bold">Shot List</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
