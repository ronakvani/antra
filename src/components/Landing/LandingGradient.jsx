import React from 'react';

export const LandingGradient = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <video
        src="/antra-gradient.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover pointer-events-none select-none"
      />
    </div>
  );
};
