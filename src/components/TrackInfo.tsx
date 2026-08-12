import React, { useState, useEffect, useRef } from 'react';
import { Disc3, Music } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Track } from '../types';

interface ScrollingTextProps {
  text: string;
  className?: string;
}

const ScrollingText: React.FC<ScrollingTextProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [overflowDistance, setOverflowDistance] = useState<number>(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth) {
          setOverflowDistance(textWidth - containerWidth + 16);
        } else {
          setOverflowDistance(0);
        }
      }
    };

    checkOverflow();
    const timeout = setTimeout(checkOverflow, 200);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [text]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden whitespace-nowrap relative">
      {overflowDistance > 0 ? (
        <motion.div
          key={text}
          ref={textRef}
          className={`inline-block ${className}`}
          animate={{ x: [0, -overflowDistance, 0] }}
          transition={{
            duration: Math.max(6, overflowDistance * 0.1),
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            repeatDelay: 2,
          }}
        >
          {text}
        </motion.div>
      ) : (
        <div ref={textRef} className={`truncate ${className}`}>
          {text}
        </div>
      )}
    </div>
  );
};

interface TrackInfoProps {
  track: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  visualizerData?: {
    beatEnergy: number;
    frequencies: number[];
  };
}

export const TrackInfo: React.FC<TrackInfoProps> = ({
  track,
  isPlaying,
  isLoading,
  visualizerData,
}) => {
  const [imgError, setImgError] = useState(false);
  const [localBeatEnergy, setLocalBeatEnergy] = useState(0);
  const [localFrequencies, setLocalFrequencies] = useState<number[]>([0.2, 0.4, 0.7, 0.3, 0.5]);

  const beatEnergy = visualizerData ? visualizerData.beatEnergy : localBeatEnergy;
  const frequencies = visualizerData ? visualizerData.frequencies : localFrequencies;

  // Fallback animation loop when visualizerData is not provided directly
  useEffect(() => {
    if (visualizerData) return;

    if (!isPlaying) {
      setLocalBeatEnergy(0);
      setLocalFrequencies([0.15, 0.15, 0.15, 0.15, 0.15]);
      return;
    }

    let animationFrameId: number;
    const bpm = 126; // Average Punjabi Highway track rhythm
    const beatPeriod = (60 / bpm) * 1000; // ~476ms per beat

    const animate = () => {
      const now = performance.now();
      const phase = (now % beatPeriod) / beatPeriod; // 0 to 1

      // Beat kick curve: sharp attack on beat, smooth exponential decay
      const kick = Math.pow(1 - phase, 2.5);
      const snarePhase = ((now + beatPeriod * 0.5) % beatPeriod) / beatPeriod;
      const snare = Math.pow(1 - snarePhase, 3) * 0.5;

      const currentBeat = Math.min(1, kick + snare);
      setLocalBeatEnergy(currentBeat);

      // Sensitive frequency bands: drop to 0.01 in off-beats/quiet parts, jump to 1.0 on peak beats
      const band1 = Math.min(1, Math.max(0.01, Math.pow(currentBeat, 1.8) * 1.2));
      const band2 = Math.min(1, Math.max(0.01, Math.pow(currentBeat, 2.2) * 1.3));
      const band3 = Math.min(1, Math.max(0.01, (0.3 * Math.sin(now * 0.012) + 0.7) * currentBeat));
      const band4 = Math.min(1, Math.max(0.01, (0.4 * Math.cos(now * 0.015) + 0.6) * currentBeat));
      const band5 = Math.min(1, Math.max(0.01, Math.pow(currentBeat, 2.0) * 1.1));

      setLocalFrequencies([band1, band2, band3, band4, band5]);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, visualizerData]);

  // Reset imgError whenever track changes
  useEffect(() => {
    setImgError(false);
  }, [track?.id, track?.artUrl, track?.artwork]);

  const displayArt = track?.artUrl || track?.artwork;
  const trackKey = track ? `${track.id}-${track.title}` : 'empty';

  if (!track) {
    return (
      <div className="flex items-center gap-4 text-white/70">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
          <Disc3 className="w-7 h-7 animate-spin opacity-50 text-amber-400" />
        </div>
        <div>
          <div className="font-poppins font-medium text-sm text-white/90">Loading Playlist...</div>
          <div className="font-poppins text-xs text-white/50">Punjabi Highway Radio</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 sm:gap-5 select-none min-w-0 w-full">
      {/* Album Artwork Frame with Minimal Glow */}
      <div className="relative group shrink-0">
        {/* Subtle Ambient Glow */}
        <div
          className={`absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-orange-500/30 blur-md pointer-events-none transition-opacity duration-300 ${
            isPlaying ? 'opacity-50' : 'opacity-20'
          }`}
        />

        {/* Artwork Box */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border border-white/20 overflow-hidden relative flex items-center justify-center shadow-lg">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={trackKey}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              {displayArt && !imgError ? (
                <img
                  src={displayArt}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-600/40 to-amber-900/40 flex flex-col items-center justify-center p-2 text-center">
                  <Disc3 className={`w-8 h-8 text-amber-300 ${isPlaying ? 'animate-spin' : ''}`} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Minimal Aesthetic Glass Capsule Soundbars */}
          {isPlaying && (
            <div className="absolute inset-x-1.5 bottom-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg py-1 px-1.5 flex items-end justify-between gap-1 z-10 pointer-events-none transition-all duration-150">
              {frequencies.map((freq, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-300 transition-all duration-75"
                  style={{
                    height: `${Math.max(2, freq * 18)}px`,
                    opacity: 0.3 + freq * 0.7,
                  }}
                />
              ))}
            </div>
          )}

          {/* Loading Indicator Spinner */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10 pointer-events-none">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Track Title & Artist Info with Left-Right Marquee for full text visibility */}
      <div className="relative flex-1 min-w-0 overflow-hidden text-left flex flex-col justify-center">
        {/* Album Tag (Static breadcrumb - no animation) */}
        <div className="flex items-center gap-1.5 mb-1 shrink-0">
          <span className="font-poppins text-[10px] font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 truncate max-w-[180px] flex items-center gap-1">
            <Music className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            {track.album || 'Punjabi Highway Tracks'}
          </span>
        </div>

        {/* Main Track Title with Horizontal Scroll */}
        <ScrollingText
          text={track.title}
          className="font-poppins font-bold text-base sm:text-lg text-white leading-tight"
        />

        {/* Sub Artist Name with Horizontal Scroll */}
        <ScrollingText
          text={track.artist}
          className="font-poppins text-xs sm:text-sm text-white/70 mt-0.5"
        />
      </div>
    </div>
  );
};


