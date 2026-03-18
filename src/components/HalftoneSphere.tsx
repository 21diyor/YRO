import React from 'react';

export const HalftoneSphere = ({ size = "w-64 h-64", opacity = "opacity-10" }: { size?: string, opacity?: string }) => {
  return (
    <div className={`${size} ${opacity} relative pointer-events-none`}>
      <div className="absolute inset-0 rounded-full halftone-bg border border-black/20"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black/10"></div>
    </div>
  );
};
