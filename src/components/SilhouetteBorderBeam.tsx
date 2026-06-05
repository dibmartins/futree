"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface SilhouetteBorderBeamProps {
  src: string;
  alt: string;
  primaryColor: string;
  primaryRgb: string;
}

export default function SilhouetteBorderBeam({
  src,
  alt,
  primaryColor,
  primaryRgb,
}: SilhouetteBorderBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Silhouette edge tracing (Moore-Neighbor algorithm)
  useEffect(() => {
    if (!imageLoaded || dimensions.width === 0 || dimensions.height === 0 || hasError) return;

    const traceImage = async () => {
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        
        // Wait for image load in JavaScript
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });

        // Use a fixed resolution for tracing to make it extremely fast and independent of window size
        const traceWidth = 300;
        const traceHeight = Math.round(traceWidth * (dimensions.height / dimensions.width));

        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = traceWidth;
        offscreenCanvas.height = traceHeight;
        const oCtx = offscreenCanvas.getContext("2d");
        if (!oCtx) throw new Error("Could not get offscreen context");

        // Calculate aspect-ratio covering math (object-fit: cover)
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = traceWidth / traceHeight;
        let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;

        if (imgRatio > canvasRatio) {
          sWidth = img.naturalHeight * canvasRatio;
          sx = (img.naturalWidth - sWidth) / 2;
        } else {
          sHeight = img.naturalWidth / canvasRatio;
          sy = (img.naturalHeight - sHeight) / 2;
        }

        // Draw image inside the offscreen canvas using cover scale
        oCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, traceWidth, traceHeight);

        // Scan pixels
        const imgData = oCtx.getImageData(0, 0, traceWidth, traceHeight);
        const { data, width, height } = imgData;

        // Helper to check if pixel is opaque
        const isOpaque = (x: number, y: number) => {
          if (x < 0 || x >= width || y < 0 || y >= height) return false;
          const idx = (y * width + x) * 4;
          return data[idx + 3] > 35; // Alpha threshold
        };

        // Find starting pixel (first opaque pixel from top-left)
        let startX = -1;
        let startY = -1;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (isOpaque(x, y)) {
              startX = x;
              startY = y;
              break;
            }
          }
          if (startX !== -1) break;
        }

        if (startX === -1) {
          throw new Error("No opaque pixels found in image");
        }

        // Moore-Neighbor Tracing
        const dirs = [
          { dx: 0, dy: -1 },  // N
          { dx: 1, dy: -1 },  // NE
          { dx: 1, dy: 0 },   // E
          { dx: 1, dy: 1 },   // SE
          { dx: 0, dy: 1 },   // S
          { dx: -1, dy: 1 },  // SW
          { dx: -1, dy: 0 },  // W
          { dx: -1, dy: -1 }, // NW
        ];

        const rawPath: { x: number; y: number }[] = [];
        let currX = startX;
        let currY = startY;
        let dirIndex = 7; // Start checking from NW
        let count = 0;
        const maxIterations = width * height * 2;

        do {
          let found = false;
          for (let i = 0; i < 8; i++) {
            const idx = (dirIndex + i) % 8;
            const testX = currX + dirs[idx].dx;
            const testY = currY + dirs[idx].dy;

            if (isOpaque(testX, testY)) {
              currX = testX;
              currY = testY;
              dirIndex = (idx + 5) % 8; // Backtrack and start searching clockwise
              found = true;
              break;
            }
          }

          if (!found) break;

          rawPath.push({ x: currX, y: currY });
          count++;
        } while ((currX !== startX || currY !== startY) && count < maxIterations);

        if (rawPath.length < 10) {
          throw new Error("Path too short");
        }

        // Path smoothing (5-point moving average)
        const smoothedPath: { x: number; y: number }[] = [];
        const traceLen = rawPath.length;
        const smoothingRange = 2;

        for (let i = 0; i < traceLen; i++) {
          let sumX = 0;
          let sumY = 0;
          let samples = 0;
          
          for (let j = -smoothingRange; j <= smoothingRange; j++) {
            const idx = (i + j + traceLen) % traceLen;
            sumX += rawPath[idx].x;
            sumY += rawPath[idx].y;
            samples++;
          }

          // Scale coordinates back to screen dimensions
          smoothedPath.push({
            x: (sumX / samples) * (dimensions.width / traceWidth),
            y: (sumY / samples) * (dimensions.height / traceHeight),
          });
        }

        setPath(smoothedPath);
      } catch (err) {
        console.warn("SilhouetteBorderBeam tracing failed (likely CORS or invalid image). Falling back to CSS glow.", err);
        setHasError(true);
      }
    };

    traceImage();
  }, [src, dimensions, imageLoaded, hasError]);

  // Sweep Animation Loop
  useEffect(() => {
    if (path.length === 0 || !canvasRef.current || hasError) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let progress = 0;
    const speed = 2.5; // Path index steps per frame
    const beamLength = Math.max(15, Math.round(path.length * 0.12)); // Beam is 12% of total outline

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (path.length > 0) {
        progress = (progress + speed) % path.length;
        const startIdx = Math.floor(progress);

        // --- Pass 1: Neon outer soft glow ---
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.55;

        for (let i = 0; i <= beamLength; i++) {
          const idx = (startIdx + i) % path.length;
          const pt = path[idx];
          if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();

        // --- Pass 2: White/bright sharp core ---
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#FFFFFF";
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 5;
        ctx.globalAlpha = 0.95;

        for (let i = 0; i <= beamLength; i++) {
          const idx = (startIdx + i) % path.length;
          const pt = path[idx];
          if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [path, primaryColor, hasError]);

  // CSS Fallback glow style
  const fallbackStyle = hasError
    ? {
        filter: `drop-shadow(0 0 25px rgba(${primaryRgb}, 0.5)) brightness(1.1) contrast(1.2)`,
        transition: "filter 0.5s ease-in-out",
      }
    : {};

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Background neon glows in page.tsx */}
      <div className="absolute top-1/2 left-10 w-32 h-32 bg-primary/20 angled-accent blur-xl animate-pulse z-0"></div>
      <div className="absolute top-1/3 right-10 w-24 h-48 bg-primary/10 angled-accent blur-2xl z-0"></div>

      {/* The Player Cutout Image */}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center brightness-110 contrast-125 select-none pointer-events-none z-10"
        style={fallbackStyle}
        priority
        unoptimized
        crossOrigin="anonymous"
        onLoad={() => setImageLoaded(true)}
      />

      {/* Canvas for Sweep Animation */}
      {!hasError && path.length > 0 && (
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0 pointer-events-none z-20"
        />
      )}
    </div>
  );
}
