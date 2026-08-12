import React from 'react';

interface BackgroundProps {
  pureViewMode?: boolean;
  onTogglePureView?: () => void;
  bgImage?: string;
}

export const Background: React.FC<BackgroundProps> = ({
  pureViewMode = false,
  bgImage = '/truck-bg.png',
}) => {
  return (
    <div aria-label="Punjabi Dhaba Truckers Scene" className="fixed inset-0 w-full h-full z-0 overflow-hidden select-none bg-amber-950">
      <style>{`
        @media (max-width: 767px) {
          @keyframes mobileEndToEndPan {
            0% {
              background-position: 0% center;
            }
            48% {
              background-position: 100% center;
            }
            52% {
              background-position: 100% center;
            }
            98% {
              background-position: 0% center;
            }
            100% {
              background-position: 0% center;
            }
          }
          .mobile-pan-bg {
            background-size: auto 100vh !important;
            animation: mobileEndToEndPan 36s ease-in-out infinite;
            will-change: background-position;
          }
        }

        @media (min-width: 768px) {
          .mobile-pan-bg {
            background-size: cover !important;
            background-position: center center !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* Primary Visual Background Image with smooth mobile-only end-to-end panning */}
      <div
        key={bgImage}
        className="absolute inset-0 w-full h-full mobile-pan-bg bg-no-repeat transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url('${bgImage}')`,
        }}
      />

      {/* Clear view subtle overlay */}
      {!pureViewMode && (
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      )}
    </div>
  );
};


