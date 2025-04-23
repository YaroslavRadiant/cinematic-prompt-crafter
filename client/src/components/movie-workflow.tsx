import React from 'react';
import { NotePencil, Image, PersonSimpleRun, MonitorPlay } from 'phosphor-react';

export function MovieWorkflow() {
  return (
    <div className="mb-8 w-full">
      <div className="relative w-full">
        <div className="flex flex-col md:flex-row items-center justify-center mx-auto gap-0 md:gap-1">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center w-[22%] md:w-auto">
            <div className="text-[#FF6A00]">
              <NotePencil size={72} />
            </div>
            <div className="text-white font-bold text-sm leading-tight">
              <span className="text-xl">1.</span> Write scene description
            </div>
            <div className="text-xs text-gray-300">and generate prompt for perfect frame composition</div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center mx-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="white" />
            </svg>
          </div>
          <div className="flex md:hidden items-center w-full h-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12L18.59 10.59L13 16.17V4H11V16.17L5.41 10.59L4 12L12 20L20 12Z" fill="white" />
            </svg>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center w-[22%] md:w-auto">
            <div className="text-[#00E5FF]">
              <Image size={72} />
            </div>
            <div className="text-white font-bold text-sm leading-tight">
              <span className="text-xl">2.</span> Copy/Paste generated prompt
            </div>
            <div className="text-xs text-gray-300">into your AI image generator app</div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center mx-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="white" />
            </svg>
          </div>
          <div className="flex md:hidden items-center w-full h-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12L18.59 10.59L13 16.17V4H11V16.17L5.41 10.59L4 12L12 20L20 12Z" fill="white" />
            </svg>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center w-[22%] md:w-auto">
            <div className="text-[#FF6A00]">
              <PersonSimpleRun size={72} />
            </div>
            <div className="text-white font-bold text-sm leading-tight">
              <span className="text-xl">3.</span> Upload generated image
            </div>
            <div className="text-xs text-gray-300">and generate prompt for movement and camera control</div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center mx-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="white" />
            </svg>
          </div>
          <div className="flex md:hidden items-center w-full h-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12L18.59 10.59L13 16.17V4H11V16.17L5.41 10.59L4 12L12 20L20 12Z" fill="white" />
            </svg>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center w-[22%] md:w-auto">
            <div className="text-[#00E5FF]">
              <MonitorPlay size={72} />
            </div>
            <div className="text-white font-bold text-sm leading-tight">
              <span className="text-xl">4.</span> Copy/Paste prompt
            </div>
            <div className="text-xs text-gray-300">into your AI video generator</div>
          </div>
        </div>
      </div>
    </div>
  );
}