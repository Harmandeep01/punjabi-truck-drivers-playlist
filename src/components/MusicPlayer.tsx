import React from 'react';
import { TrackInfo } from './TrackInfo';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';
import { Track, PlayerState } from '../types';

interface MusicPlayerProps {
  track: Track | null;
  state: PlayerState;
  visualizerData?: {
    beatEnergy: number;
    frequencies: number[];
  };
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleQueue?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  track,
  state,
  visualizerData,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleQueue,
}) => {
  return (
    <div aria-label="Main Music Stream Player" className="w-full max-w-xl mx-auto z-20 transition-all duration-300">
      {/* Floating Glassmorphism Container */}
      <div className="bg-black/40 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden text-white select-none">
        {/* Glass Glow Highlights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Error Alert Message if stream fails */}
        {state.error && (
          <div className="mb-3 bg-red-500/20 text-red-200 text-xs font-poppins font-medium p-2.5 rounded-xl border border-red-500/30 text-center animate-pulse">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:gap-5 relative z-10">
          {/* Top Row: Track Info + Volume Control */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <TrackInfo
                track={track}
                isPlaying={state.isPlaying}
                isLoading={state.isLoading}
                visualizerData={visualizerData}
              />
            </div>

            {/* Volume Control */}
            <div className="shrink-0">
              <VolumeControl
                volume={state.volume}
                isMuted={state.isMuted}
                onVolumeChange={onVolumeChange}
                onToggleMute={onToggleMute}
              />
            </div>
          </div>

          {/* Middle Row: Progress Bar */}
          <ProgressBar
            currentTime={state.currentTime}
            duration={state.duration}
            onSeek={onSeek}
          />

          {/* Bottom Row: Main Player Controls */}
          <PlayerControls
            isPlaying={state.isPlaying}
            isLoading={state.isLoading}
            isShuffle={state.isShuffle}
            repeatMode={state.repeatMode}
            onTogglePlay={onTogglePlay}
            onNext={onNext}
            onPrevious={onPrevious}
            onToggleShuffle={onToggleShuffle}
            onToggleRepeat={onToggleRepeat}
            onToggleQueue={onToggleQueue}
          />
        </div>
      </div>
    </div>
  );
};

