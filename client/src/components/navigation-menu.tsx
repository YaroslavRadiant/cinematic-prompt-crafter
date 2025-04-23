import * as React from "react";
import { useLocation } from "wouter";
import {
  NavigationMenu as RadixNavigationMenu,
  NavigationMenuContent as RadixNavigationMenuContent,
  NavigationMenuItem as RadixNavigationMenuItem,
  NavigationMenuList as RadixNavigationMenuList,
  NavigationMenuTrigger as RadixNavigationMenuTrigger,
  NavigationMenuLink as RadixNavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

interface MenuItem {
  title: string;
  href: string;
}

const imageIllustrationItems: MenuItem[] = [
  { title: "Image", href: "/?tab=photo" },
  { title: "Illustration", href: "/?tab=better-prompt" },
  { title: "Motion", href: "/?tab=motion" }
];

const movieShotItems: MenuItem[] = [
  { title: "Movie frames", href: "/?tab=movie" },
  { title: "Shot list", href: "/?tab=scene" }
];

interface MainNavigationMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MainNavigationMenu({ activeTab, onTabChange }: MainNavigationMenuProps) {
  const [, setLocation] = useLocation();

  const handleNavigation = (href: string) => {
    const params = new URLSearchParams(href.split('?')[1]);
    const tab = params.get('tab') || 'home';
    onTabChange(tab);
    setLocation(href);
  };

  return (
    <RadixNavigationMenu className="max-w-full w-full justify-start">
      <RadixNavigationMenuList className="flex items-center gap-1">
        <RadixNavigationMenuItem>
          <RadixNavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <button
              onClick={() => {
                onTabChange('home');
                setLocation("/?tab=home");
              }}
              className={`text-left px-4 py-2 font-medium ${activeTab === 'home' ? 'text-white border-b-2 border-[#FF6A00]' : 'text-[#CCCCCC]'}`}
            >
              Home
            </button>
          </RadixNavigationMenuLink>
        </RadixNavigationMenuItem>

        <RadixNavigationMenuItem>
          <RadixNavigationMenuTrigger 
            className={`px-4 py-2 font-medium ${['photo', 'better-prompt', 'motion'].includes(activeTab) ? 'text-white border-b-2 border-[#FF6A00]' : 'text-[#CCCCCC]'}`}
          >
            Image/Illustration Tools
          </RadixNavigationMenuTrigger>
          <RadixNavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 bg-[#0D0D0D]/95 backdrop-blur-sm border border-gray-800/40">
              {imageIllustrationItems.map((item) => (
                <li key={item.href}>
                  <RadixNavigationMenuLink asChild>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full text-left px-4 py-2 rounded-md font-medium hover:bg-white/5 transition-all duration-300
                        ${activeTab === item.href.split('=')[1] ? 'text-white bg-white/10' : 'text-[#CCCCCC]'}`}
                    >
                      {item.title}
                    </button>
                  </RadixNavigationMenuLink>
                </li>
              ))}
            </ul>
          </RadixNavigationMenuContent>
        </RadixNavigationMenuItem>

        <RadixNavigationMenuItem>
          <RadixNavigationMenuTrigger 
            className={`px-4 py-2 font-medium ${['movie', 'scene'].includes(activeTab) ? 'text-white border-b-2 border-[#FF6A00]' : 'text-[#CCCCCC]'}`}
          >
            Movie shot tools
          </RadixNavigationMenuTrigger>
          <RadixNavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 bg-[#0D0D0D]/95 backdrop-blur-sm border border-gray-800/40">
              {movieShotItems.map((item) => (
                <li key={item.href}>
                  <RadixNavigationMenuLink asChild>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full text-left px-4 py-2 rounded-md font-medium hover:bg-white/5 transition-all duration-300
                        ${activeTab === item.href.split('=')[1] ? 'text-white bg-white/10' : 'text-[#CCCCCC]'}`}
                    >
                      {item.title}
                    </button>
                  </RadixNavigationMenuLink>
                </li>
              ))}
            </ul>
          </RadixNavigationMenuContent>
        </RadixNavigationMenuItem>

        <RadixNavigationMenuItem>
          <RadixNavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <button
              onClick={() => handleNavigation("/?tab=advertising")}
              className={`text-left px-4 py-2 font-medium ${activeTab === 'advertising' ? 'text-white border-b-2 border-[#FF6A00]' : 'text-[#CCCCCC]'}`}
            >
              Advertising
            </button>
          </RadixNavigationMenuLink>
        </RadixNavigationMenuItem>
      </RadixNavigationMenuList>
    </RadixNavigationMenu>
  );
}