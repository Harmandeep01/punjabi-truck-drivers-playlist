import React, { useState, useEffect } from 'react';
import { Disc3 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Track } from '../types';

interface TrackInfoProps {
  track: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
}

export const TrackInfo: React.FC<TrackInfoProps> = ({
  track,
  isPlaying,
  isLoading,
}) => {
  const [imgError, setImgError] = useState(false);

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
    <div className="flex items-center gap-4 sm:gap-5 select-none min-w-0">
      {/* Album Artwork Frame with Glass Glow */}
      <div className="relative group shrink-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border border-white/20 overflow-hidden relative flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
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

          {/* Playing Equalizer Overlay */}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-1 z-10 pointer-events-none">
              <span className="w-1 bg-amber-400 animate-eq-1 rounded-full" />
              <span className="w-1 bg-red-400 animate-eq-2 rounded-full" />
              <span className="w-1 bg-orange-400 animate-eq-3 rounded-full" />
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

      {/* Track Title, Artist & Album Metadata with Cross-fade Transition */}
      <div className="relative flex-1 min-w-0 overflow-hidden text-left h-16 sm:h-20 flex flex-col justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={trackKey}
            initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="w-full flex flex-col justify-center"
          >
            {/* Album Tag */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-poppins text-[10px] font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 truncate max-w-[180px]">
                {track.album || 'Punjabi Highway Tracks'}
              </span>
            </div>

            {/* Track Title */}
            <h2 className="font-poppins font-bold text-base sm:text-lg text-white leading-tight truncate">
              {track.title}
            </h2>

            {/* Artist */}
            <p className="font-poppins text-xs sm:text-sm text-white/70 truncate mt-0.5">
              {track.artist}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};


