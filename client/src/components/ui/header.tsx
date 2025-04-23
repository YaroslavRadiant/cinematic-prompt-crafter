import React from "react";
import { useLocation } from "wouter";
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MainNavigationMenu } from "@/components/navigation-menu";
import { useAuth } from "@/auth/AuthProvider";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavigation = (tab: string) => {
    onTabChange(tab);
    setLocation(`/?tab=${tab}`);
    setMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    onTabChange("home");
    setLocation("/");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Clear all scene-related data from localStorage
      const sceneKeys = [
        "sceneDescription",
        "shots",
        "sceneTemplate",
        "savedSceneData",
        "savedTemplate",
        "sceneHistory",
        "currentScene",
        "lastEditedScene",
        "sceneMetadata",
        "scenePreferences",
        "generatedShots",
        "shotHistory",
      ];
      sceneKeys.forEach((key) => localStorage.removeItem(key));

      await apiRequest("POST", "/api/logout");
      setLocation("/auth");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { logout } = useAuth();

  return (
    <header className="w-full bg-[#0D0D0D] h-16 px-4 sm:px-6 lg:px-8 flex items-center border-b border-gray-800/40 backdrop-blur-sm">
      <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Logo section */}
        <div className="flex items-center">
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-6 w-6 text-[#FF6A00]" />
            <span className="text-xl md:text-2xl font-medium tracking-tight font-['Sora','sans-serif']">
              Masterprompt
            </span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Desktop Navigation with Dropdown Menus */}
        <div className="hidden md:block flex-grow max-w-3xl">
          <MainNavigationMenu activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* Logout button */}
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2 text-white hover:bg-white/10 rounded-md px-4 py-2 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 md:hidden bg-[#0D0D0D]/95 backdrop-blur-sm z-50 border-b border-gray-800/40 animate-fadeUp">
          <div className="flex flex-col space-y-1 px-4 py-4 max-w-screen-2xl mx-auto">
            <MobileNavItem
              label="Home"
              isActive={activeTab === "home"}
              onClick={() => handleNavigation("home")}
            />

            <MobileNavItem
              label="Image"
              isActive={activeTab === "photo"}
              onClick={() => handleNavigation("photo")}
            />
            <MobileNavItem
              label="Illustration"
              isActive={activeTab === "better-prompt"}
              onClick={() => handleNavigation("better-prompt")}
            />
            <MobileNavItem
              label="Motion"
              isActive={activeTab === "motion"}
              onClick={() => handleNavigation("motion")}
            />
            <MobileNavItem
              label="Movie"
              isActive={activeTab === "movie"}
              onClick={() => handleNavigation("movie")}
            />
            <MobileNavItem
              label="Shot list"
              isActive={activeTab === "scene"}
              onClick={() => handleNavigation("scene")}
            />
            <MobileNavItem
              label="Advertising"
              isActive={activeTab === "advertising"}
              onClick={() => handleNavigation("advertising")}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:bg-white/10 w-full justify-start px-4 py-2.5 mt-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileNavItem({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-md font-medium text-left transition-all duration-300 ${
        isActive
          ? "text-white bg-white/10 border-l-2 border-[#FF6A00]"
          : "text-[#CCCCCC] hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}
