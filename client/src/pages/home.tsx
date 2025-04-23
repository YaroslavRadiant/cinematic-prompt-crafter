import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTab } from "@/context/TabContext";
import { PhotoAnalyzer } from "@/components/photo-analyzer";
import { SceneBreakdown } from "@/components/scene-breakdown";
import { MotionDesign } from "@/components/motion-design";
import { BetterPrompt } from "@/components/better-prompt";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Movie } from "@/components/movie";
import { Header } from "@/components/ui/header";
import { HeroBanner } from "@/components/ui/hero-banner";
import {
  TargetIcon,
  PencilIcon,
  MotionIcon,
  FilmIcon,
  ShotListIcon,
} from "@/components/GradientIcons";
import { Advertising } from "@/components/advertising";

const HomeContent = () => {
  const navigate = useNavigate();
  const { setActiveTab } = useTab();

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    navigate(`/?tab=${tab}`);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center">
      {/* Main headline under the banner with animation */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-12">
        Generate professional-grade prompts with precise technical parameters
        for photography, illustration, movie scenes and advertising
      </h1>

      {/* All 5 icons in a single horizontal row, grouped into two sections */}
      <div className="w-full flex flex-col md:flex-row justify-center gap-10 mb-20">
        {/* Group 1: Image, Illustration, Motion */}
        <div className="card-glow-primary p-10 flex flex-col items-center md:w-1/2 animate-fadeUp [animation-delay:200ms]">
          <h3 className="text-white text-xl font-medium mb-8 font-['Sora','sans-serif']">
            Image/Illustration Tools
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-8">
            {/* Image Button */}
            <Button
              variant="ghost"
              className="h-36 w-36 bg-[#FF6A00]/10 hover:bg-transparent text-[#FF6A00] hover:text-white border border-[#FF6A00]/40 hover:border-white/40 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 p-0 group hover:scale-105 sm:mb-0 mb-4"
              onClick={() => handleNavigation("photo")}
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#FF6A00]/30 to-[#FF3D00]/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <TargetIcon className="relative z-10" />
              </div>
              <span className="text-sm font-normal group-hover:text-white transition-colors duration-300">
                Image
              </span>
            </Button>

            {/* Illustration Button */}
            <Button
              variant="ghost"
              className="h-36 w-36 bg-[#FF6A00]/10 hover:bg-transparent text-[#FF6A00] hover:text-white border border-[#FF6A00]/40 hover:border-white/40 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 p-0 group hover:scale-105 sm:mb-0 mb-4"
              onClick={() => handleNavigation("better-prompt")}
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#FF6A00]/30 to-[#FF3D00]/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <PencilIcon className="relative z-10" />
              </div>
              <span className="text-sm font-normal group-hover:text-white transition-colors duration-300">
                Illustration
              </span>
            </Button>

            {/* Motion Button */}
            <Button
              variant="ghost"
              className="h-36 w-36 bg-[#FF6A00]/10 hover:bg-transparent text-[#FF6A00] hover:text-white border border-[#FF6A00]/40 hover:border-white/40 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 p-0 group hover:scale-105 sm:mb-0 mb-4"
              onClick={() => handleNavigation("motion")}
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#FF6A00]/30 to-[#FF3D00]/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <MotionIcon className="relative z-10" />
              </div>
              <span className="text-sm font-normal group-hover:text-white transition-colors duration-300">
                Motion
              </span>
            </Button>
          </div>

          <p className="text-sm md:text-base text-[#CCCCCC] leading-relaxed text-center">
            Turn your text description or reference image into a fully optimized
            prompt for any AI image generator — including MidJourney, Flux,
            Kling AI, Hailuo AI, and more. Then, take it further by generating a
            motion prompt for AI video generators like Runway, Kling, Hailuo,
            Veo 2, Pixverse, and beyond. Let AI bring your vision to life!
          </p>
        </div>

        {/* Group 2: Movie Frames, Shot List */}
        <div className="card-glow-secondary p-10 flex flex-col items-center md:w-1/2 animate-fadeUp [animation-delay:400ms]">
          <h3 className="text-white text-xl font-medium mb-8 font-['Sora','sans-serif']">
            Movie Shot Tools
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-8">
            {/* Movie Frames Button */}
            <Button
              variant="ghost"
              className="h-36 w-36 bg-[#00E5FF]/10 hover:bg-transparent text-[#00E5FF] hover:text-white border border-[#00E5FF]/40 hover:border-white/40 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 p-0 group hover:scale-105 sm:mb-0 mb-4"
              onClick={() => handleNavigation("movie")}
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#00E5FF]/30 to-[#00BFFF]/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FilmIcon className="relative z-10 w-[98px] h-[98px] border-solid border-red" />
              </div>
              <span className="text-sm font-normal group-hover:text-white text-center transition-colors duration-300">
                Movie Frames
              </span>
            </Button>

            {/* Shot List Button */}
            <Button
              variant="ghost"
              className="h-36 w-36 bg-[#00E5FF]/10 hover:bg-transparent text-[#00E5FF] hover:text-white border border-[#00E5FF]/40 hover:border-white/40 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 p-0 group hover:scale-105 sm:mb-0 mb-4"
              onClick={() => handleNavigation("scene")}
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#00E5FF]/30 to-[#00BFFF]/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ShotListIcon className="relative z-10" />
              </div>
              <span className="text-sm font-normal group-hover:text-white text-center transition-colors duration-300">
                Shot List
              </span>
            </Button>
          </div>

          <p className="text-sm md:text-base text-[#CCCCCC] leading-relaxed text-center">
            Make advanced prompts for truly professional movie frames. Follow
            all the essential rules of cinematic composition, editing,
            directing, and visual storytelling. Turn your text description or
            reference image into a detailed, filmmaking-oriented prompt for
            stunning cinematic shots.
          </p>
        </div>
      </div>

      {/* Additional descriptive content with animation */}
      <div className="text-center mt-8 animate-fadeUp [animation-delay:600ms]">
        <p className="text-base md:text-lg text-[#AAAAAA] max-w-3xl mx-auto">
          All tools are optimized for professional results with AI generators
          like MidJourney, Flux, Kling AI, Hailuo AI, Runway, Veo 2, Pixverse,
          and more.
        </p>
      </div>
    </div>
  );
};

export function HomePage() {
  const location = useLocation();
  const { activeTab, setActiveTab } = useTab();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
          const response = await fetch("/api/check-auth", {
            signal: controller.signal,
          });

          if (!response.ok) {
            console.log("Auth check: User not authenticated");
          }
        } catch (fetchError) {
          console.log("Auth check: Network error, continuing in dev mode");
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.log("Auth check skipped");
      }
    };

    checkAuth();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeContent />;
      case "photo":
        return <PhotoAnalyzer />;
      case "better-prompt":
        return <BetterPrompt />;
      case "motion":
        return <MotionDesign />;
      case "movie":
        return <Movie />;
      case "scene":
        return <SceneBreakdown />;
      case "advertising":
        return <Advertising />;
      default:
        return <HomeContent />;
    }
  };

  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      <div className="sticky top-0 z-50">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "home" && (
        <>
          <div
            className="w-full absolute z-40"
            style={{
              transform: `translateY(${Math.max(-scrollPosition, -400)}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <HeroBanner />
          </div>
          <div className="pt-[400px]"></div>
        </>
      )}

      <div className="w-full relative z-45">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
