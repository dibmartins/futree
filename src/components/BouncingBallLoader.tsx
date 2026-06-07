"use client";

export default function BouncingBallLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-28 flex items-center justify-center">
        {/* Ball Container with bounce animation */}
        <div className="animate-bounce-physics z-10 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-6xl text-primary-fixed select-none"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
          >
            sports_soccer
          </span>
        </div>
        
        {/* Shadow with sizing/opacity scaling anim */}
        <div className="absolute bottom-2 w-12 h-2 bg-black/60 rounded-full blur-[3px] animate-shadow-physics z-0"></div>
      </div>
      
      {/* Pulsing loading text */}
      <span className="text-xs font-stat uppercase tracking-[0.2em] text-white/50 animate-pulse">
        Carregando...
      </span>
    </div>
  );
}
