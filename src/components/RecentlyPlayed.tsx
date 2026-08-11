import React from 'react';
import { History, Play, Trash2, Music2 } from 'lucide-react';
import { Track } from '../types';

interface RecentlyPlayedProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onSelectTrack: (id: string) => void;
  onClear: () => void;
}

export const RecentlyPlayed: React.FC<RecentlyPlayedProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onClear,
}) => {
  if (tracks.length === 0) return null;

  return (
    <div aria-label="Recently Played Tracks" className="w-full max-w-4xl mx-auto my-3 select-none">
      <div className="glass-card rounded-2xl border border-[#ffb300]/25 p-3.5 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#ffb300]/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#ffb300]" />
            <h3 className="font-poppins font-bold text-xs sm:text-sm uppercase tracking-wider text-[#ffb300]">
              Recently Played Tracks
            </h3>
            <span className="bg-[#3a2d1a] text-[#ffb300] text-[10px] font-poppins font-bold px-2 py-0.5 rounded-full border border-[#ffb300]/30">
              {tracks.length}
            </span>
          </div>

          <button
            onClick={onClear}
            className="text-[11px] font-poppins font-semibold text-[#e2bebb] hover:text-[#d32f2f] transition-colors flex items-center gap-1 cursor-pointer"
            title="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {tracks.map((track) => {
            const isCurrent = track.id === currentTrackId;
            return (
              <button
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 max-w-[200px] transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#d32f2f] border-[#ffb300] text-white shadow-md'
                    : 'bg-[#1e1910] border-[#ffb300]/20 hover:border-[#ffb300] text-[#fff8ea] hover:bg-[#2c2417]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#120f09] shrink-0 border border-[#ffb300]/30 flex items-center justify-center">
                  {track.artwork ? (
                    <img
                      src={track.artwork}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music2 className="w-4 h-4 text-[#ffb300]" />
                  )}
                </div>

                <div className="text-left min-w-0 flex-1">
                  <div className="font-poppins font-semibold text-xs truncate leading-snug">
                    {track.title}
                  </div>
                  <div className="font-serif-body italic text-[11px] text-[#d1c2a5] truncate">
                    {track.artist}
                  </div>
                </div>

                <Play className={`w-3.5 h-3.5 shrink-0 transition-transform ${isCurrent && isPlaying ? 'text-[#ffb300] scale-110' : 'opacity-60 group-hover:opacity-100'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
