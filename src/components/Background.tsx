import React from 'react';

interface BackgroundProps {
  pureViewMode?: boolean;
  onTogglePureView?: () => void;
  bgImage?: string;
}

export const Background: React.FC<BackgroundProps> = ({
  pureViewMode = false,
  onTogglePureView,
  bgImage = '/truck-bg.png',
}) => {
  return (
    <div aria-label="Punjabi Dhaba Truckers Scene" className="fixed inset-0 w-full h-full z-0 overflow-hidden select-none bg-amber-950">
      {/* Primary Visual Background Image with smooth transition */}
      <div
        className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url('${bgImage}')`,
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
          className="w-full h-full bg-responsive-position bg-cover bg-no-repeat transition-all duration-700 ease-out"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      </div>

      {/* Clear view subtle overlay */}
      {!pureViewMode && (
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      )}
    </div>
  );
};
