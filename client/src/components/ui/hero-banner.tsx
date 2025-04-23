import React from 'react';
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const heroContent: HeroContent = {
  title: "Craft Your Vision like a Master",
  subtitle: "",
  ctaText: "Learn more",
  ctaLink: "/?tab=movie"
};

export function HeroBanner() {
  const [, setLocation] = useLocation();

  const handleCtaClick = (link: string) => {
    setLocation(link);
  };

  return (
    <div className="w-full relative overflow-hidden bg-black h-[400px] flex">
      {/* Full width video background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-[130%] object-cover"
          style={{pointerEvents: 'none', objectPosition: 'bottom center'}}
        >
          <source src="/background-banner.mp4" type="video/mp4" />
        </video>

        {/* Enhanced dark overlay with gradient and shadow effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/75 to-transparent z-10 animate-gradientPulse"></div>

        {/* Additional decorative gradient glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-[#0E0E0E] to-transparent z-20"></div>

        {/* Subtle accent color gradients */}
        <div className="absolute inset-0 opacity-20 z-5">
          <div className="absolute bottom-0 left-1/4 w-1/2 h-[250px] bg-gradient-to-t from-[#FF6A00]/30 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-1/2 h-[250px] bg-gradient-to-t from-[#00E5FF]/30 to-transparent blur-3xl"></div>
        </div>
      </div>

      {/* Content - Left aligned on desktop, centered on mobile */}
      <div className="relative z-30 flex items-center h-[400px] max-w-screen-2xl mx-auto w-full px-6 md:px-8 lg:px-12">
        {/* Text container with left alignment on desktop, centered on mobile */}
        <div className="text-center md:text-left max-w-lg mx-auto md:mx-0 w-full md:w-7/12 pr-0 md:pr-8">
          <h2 className="font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 font-['Sora','sans-serif'] tracking-wide text-white animate-fadeUp">
            {heroContent.title}
          </h2>
          {heroContent.subtitle && (
            <p className="font-light text-sm sm:text-base md:text-lg lg:text-xl mb-8 md:mb-10 max-w-md mx-auto md:mx-0 text-[#CCCCCC] font-['Inter','sans-serif'] animate-fadeUp [animation-delay:200ms]">
              {heroContent.subtitle}
            </p>
          )}
          <Button 
            onClick={() => handleCtaClick(heroContent.ctaLink)}
            className="btn-ghost px-7 sm:px-9 py-2.5 sm:py-3.5 text-sm sm:text-base md:text-lg tracking-wide rounded-md animate-fadeUp [animation-delay:400ms] uppercase flex items-center gap-2 hover:scale-[1.03] group"
          >
            <span className="inline-block w-5 h-5 text-[#FF6A00] group-hover:text-white transition-colors duration-300">✨</span>
            {heroContent.ctaText}
          </Button>
        </div>

        {/* Empty space on the right for visual balance */}
        <div className="hidden md:block w-5/12"></div>
      </div>
    </div>
  );
}