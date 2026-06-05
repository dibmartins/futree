"use client";

import React, { useEffect, useState } from "react";

interface DynamicBackgroundEffectsProps {
  primaryColor: string;
  secondaryColor: string;
  primaryRgb: string;
  secondaryRgb: string;
}

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  colorType: "primary" | "secondary";
}

export default function DynamicBackgroundEffects({
  primaryColor,
  secondaryColor,
}: DynamicBackgroundEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on client side to avoid SSR mismatch
    const generated: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      top: Math.random() * 100, // percentage
      size: Math.random() * 4 + 2, // 2px to 6px
      delay: Math.random() * -30, // negative delay so they start immediately
      duration: Math.random() * 25 + 15, // 15s to 40s
      opacity: Math.random() * 0.25 + 0.1, // 0.1 to 0.35
      colorType: Math.random() > 0.4 ? "primary" : "secondary",
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic Ambient Background Blobs */}
      <div 
        className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-[0.07] animate-float-slow"
        style={{
          backgroundColor: primaryColor,
        }}
      />
      <div 
        className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[140px] opacity-[0.05] animate-float-medium"
        style={{
          backgroundColor: secondaryColor,
        }}
      />
      <div 
        className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full blur-[130px] opacity-[0.06] animate-float-fast"
        style={{
          backgroundColor: primaryColor,
        }}
      />

      {/* Floating Drift Particles */}
      <div className="absolute inset-0 z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              backgroundColor: p.colorType === "primary" ? primaryColor : secondaryColor,
              boxShadow: `0 0 10px ${p.colorType === "primary" ? primaryColor : secondaryColor}`,
              animation: `floatDrift ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatDrift {
          0% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.35;
          }
          85% {
            opacity: 0.35;
          }
          100% {
            transform: translate(40px, -100px) scale(1.2);
            opacity: 0;
          }
        }
      `}} />
    </div>
  );
}
