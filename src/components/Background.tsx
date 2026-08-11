import React from 'react';

interface BackgroundProps {
  pureViewMode?: boolean;
  onTogglePureView?: () => void;
}

export const Background: React.FC<BackgroundProps> = ({
  pureViewMode = false,
  onTogglePureView,
}) => {
  return (
    <div aria-label="Punjabi Dhaba Truckers Scene" className="fixed inset-0 w-full h-full z-0 overflow-hidden select-none bg-amber-950">
      {/* Primary Visual Background Image with Slow Ambient Motion */}
      <div
        className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url('/truck-bg.png')`,
          backgroundPosition: 'center center',
        }}
      >
        <style>{`
          @media (max-width: 639px) {
            .bg-responsive-position {
              background-position: 70% center !important;
            }
          }
          @media (min-width: 640px) and (max-width: 1023px) {
            .bg-responsive-position {
              background-position: 60% center !important;
            }
          }
          @media (min-width: 1024px) {
            .bg-responsive-position {
              background-position: center center !important;
            }
          }
        `}</style>
        <div
          className="w-full h-full bg-responsive-position bg-cover bg-no-repeat"
          style={{ backgroundImage: `url('/truck-bg.png')` }}
        />
      </div>

      {/* Warm Highway Headlight & Neon Glow Particles */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

      {/* Clear view subtle overlay */}
      {!pureViewMode && (
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      )}

      {/* Pure View Return Button */}
      {pureViewMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={onTogglePureView}
            className="px-5 py-2.5 bg-black/60 backdrop-blur-xl text-amber-300 font-poppins font-medium text-xs tracking-wider rounded-full border border-white/20 shadow-xl hover:bg-black/80 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Show Player Controls</span>
          </button>
        </div>
      )}
    </div>
  );
};


