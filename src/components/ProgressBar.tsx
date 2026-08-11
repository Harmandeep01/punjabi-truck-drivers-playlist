import React, { useRef, useState, useCallback } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);

  const calculateSeekTime = useCallback(
    (clientX: number) => {
      if (!barRef.current || duration <= 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = offsetX / rect.width;
      return percentage * duration;
    },
    [duration]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const targetTime = calculateSeekTime(e.clientX);
    onSeek(targetTime);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = offsetX / rect.width;
    setHoverTime(percentage * duration);
    setHoverPos(offsetX);

    if (isDragging) {
      const targetTime = calculateSeekTime(e.clientX);
      onSeek(targetTime);
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

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverTime(null);
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div aria-label="Track Progress Seek Bar" className="w-full flex flex-col gap-1 select-none">
      {/* Progress Track Container */}
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="relative w-full h-6 sm:h-7 flex items-center cursor-pointer group py-2"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-label="Audio seeker"
      >
        {/* Background Track Rail */}
        <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden relative backdrop-blur-sm">
          {/* Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hover Time Tooltip Bubble */}
        {hoverTime !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 bg-black/80 text-amber-300 font-poppins font-medium text-[10px] px-2 py-0.5 rounded-md border border-white/20 shadow-lg pointer-events-none z-30"
            style={{ left: `${hoverPos}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Draggable Scrubber Thumb Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg border border-amber-500/50 transition-transform ${
            isDragging ? 'scale-125 bg-amber-400' : 'group-hover:scale-110 opacity-90 group-hover:opacity-100'
          }`}
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      {/* Time Labels */}
      <div className="flex justify-between items-center text-[11px] font-poppins font-medium tracking-wide text-white/60">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

