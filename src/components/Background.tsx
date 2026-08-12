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
      {/* Primary Visual Background Image */}
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


