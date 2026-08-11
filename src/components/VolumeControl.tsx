import React, { useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const effectiveVol = isMuted ? 0 : volume;

  const calculateVolFromX = useCallback((clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return offsetX / rect.width;
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const newVol = calculateVolFromX(e.clientX);
    onVolumeChange(newVol);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      const newVol = calculateVolFromX(e.clientX);
      onVolumeChange(newVol);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore capture release errors
      }
    }
  };

  return (
    <div className="flex items-center gap-2 select-none group">
      {/* Mute Toggle Button */}
      <button
        onClick={onToggleMute}
        className="p-2 text-white/70 hover:text-amber-300 transition-colors cursor-pointer rounded-full hover:bg-white/10"
        title={isMuted ? 'Unmute' : 'Mute'}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted || effectiveVol === 0 ? (
          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
        ) : effectiveVol < 0.5 ? (
          <Volume1 className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </button>

      {/* Interactive Volume Bar Slider */}
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-20 sm:w-24 h-5 flex items-center cursor-pointer group/bar"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(effectiveVol * 100)}
        aria-label="Volume slider"
      >
        <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
            style={{ width: `${effectiveVol * 100}%` }}
          />
        </div>
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-transform ${
            isDragging ? 'scale-125 bg-amber-300' : 'opacity-0 group-hover/bar:opacity-100'
          }`}
          style={{ left: `${effectiveVol * 100}%` }}
        />
      </div>
    </div>
  );
};

