import React from 'react';
import { Image, PaintBrush, PlayCircle, FilmSlate, FilmScript, FilmStrip } from 'phosphor-react';

// Create gradient definitions that we'll apply to the icons
const OrangeGradient = () => (
  <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
    <stop stopColor="#FF6A00" />
    <stop offset="1" stopColor="#FF3D00" />
  </linearGradient>
);

const CyanGradient = () => (
  <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
    <stop stopColor="#00E5FF" />
    <stop offset="1" stopColor="#00BFFF" />
  </linearGradient>
);

export function TargetIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <OrangeGradient />
        </defs>
      </svg>
      <Image 
        size={150}
        weight="thin"
        color="url(#orange-gradient)"
        style={{ width: '98px', height: '98px' }}
      />
    </div>
  );
}

export function PencilIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <OrangeGradient />
        </defs>
      </svg>
      <PaintBrush 
        size={150}
        weight="thin"
        color="url(#orange-gradient)"
        style={{ width: '98px', height: '98px' }}
      />
    </div>
  );
}

export function MotionIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <OrangeGradient />
        </defs>
      </svg>
      <PlayCircle 
        size={150}
        weight="thin"
        color="url(#orange-gradient)"
        style={{ width: '98px', height: '98px' }}
      />
    </div>
  );
}

export function FilmIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <CyanGradient />
        </defs>
      </svg>
      <FilmStrip 
        size={150}
        weight="thin"
        color="url(#cyan-gradient)"
        style={{ width: '98px', height: '98px' }}
      />
    </div>
  );
}

export function ShotListIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <CyanGradient />
        </defs>
      </svg>
      <FilmSlate 
        size={150}
        weight="thin"
        color="url(#cyan-gradient)"
        style={{ width: '98px', height: '98px' }}
      />
    </div>
  );
}