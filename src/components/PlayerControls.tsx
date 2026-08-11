import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ListMusic } from 'lucide-react';
import { RepeatMode } from '../types';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleQueue?: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoading,
  isShuffle,
  repeatMode,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  onToggleQueue,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5 select-none py-1">
      {/* Shuffle Button */}
      <button
        onClick={onToggleShuffle}
        aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
        className={`p-2.5 rounded-full transition-all cursor-pointer ${
          isShuffle
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md scale-105'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title={`Shuffle: ${isShuffle ? 'ON' : 'OFF'}`}
      >
        <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Previous Track Button */}
      <button
        onClick={onPrevious}
        aria-label="Previous track"
        className="p-2.5 sm:p-3 rounded-full text-white/90 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
        title="Previous Track"
      >
        <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
      </button>

      {/* Hero Play / Pause Main Button */}
      <button
        onClick={onTogglePlay}
        disabled={isLoading}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={`p-4 sm:p-4.5 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20 cursor-pointer ${
          isLoading ? 'opacity-80' : ''
        }`}
        title="Play / Pause"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Next Track Button */}
      <button
        onClick={onNext}
        aria-label="Next track"
        className="p-2.5 sm:p-3 rounded-full text-white/90 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
        title="Next Track"
      >
        <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
      </button>

      {/* Repeat Button */}
      <button
        onClick={onToggleRepeat}
        aria-label={`Repeat mode: ${repeatMode}`}
        className={`p-2.5 rounded-full transition-all cursor-pointer relative ${
          repeatMode !== 'off'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md scale-105'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title={`Repeat: ${repeatMode.toUpperCase()}`}
      >
        {repeatMode === 'one' ? (
          <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </button>

      {/* Optional Queue List Toggle */}
      {onToggleQueue && (
        <button
          onClick={onToggleQueue}
          aria-label="Toggle playlist queue"
          className="p-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer ml-1"
          title="Open Playlist Queue"
        >
          <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
};

