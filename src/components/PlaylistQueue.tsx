import React from 'react';
import { Search, Disc3, X, RefreshCw, Radio } from 'lucide-react';
import { Track } from '../types';

interface PlaylistQueueProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectTrack: (id: string) => void;
  onClose?: () => void;
  onRefetch?: () => void;
  source?: 'r2' | 'fallback';
}

function formatDuration(secs?: number): string {
  if (!secs) return '3:30';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
}

export const PlaylistQueue: React.FC<PlaylistQueueProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  searchQuery,
  onSearchChange,
  onSelectTrack,
  onClose,
  onRefetch,
  source = 'r2',
}) => {
  return (
    <div
      aria-label="Playlist Tracks Queue"
      className="bg-black/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] text-white select-none animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-poppins font-bold text-lg text-amber-300">
              Punjabi Truckers Playlist
            </h3>
          </div>
          <p className="font-poppins text-xs text-white/60 mt-0.5">
            {tracks.length} Highway Tracks • Source: {source === 'r2' ? 'Cloudflare R2' : 'Local Fallback'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefetch && (
            <button
              onClick={onRefetch}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-amber-300 transition-colors cursor-pointer"
              title="Refresh playlist"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-red-500/30 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Close Queue"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by song, artist, album..."
          className="w-full bg-white/10 border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs font-poppins text-white placeholder-white/40 focus:outline-none focus:border-amber-400/80 transition-colors"
        />
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {tracks.length === 0 ? (
          <div className="p-8 text-center text-white/60 font-poppins text-sm">
            No tracks found matching "{searchQuery}"
          </div>
        ) : (
          tracks.map((track, idx) => {
            const isCurrent = track.id === currentTrackId;
            const art = track.artUrl || track.artwork;

            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400/50 shadow-lg text-amber-200'
                    : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/20 text-white'
                }`}
              >
                {/* Track Number / Play Status Icon */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-poppins text-xs font-bold text-amber-400 w-5 text-center shrink-0">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-3">
                        <span className="w-1 bg-amber-400 animate-eq-1 rounded-full" />
                        <span className="w-1 bg-white animate-eq-2 rounded-full" />
                        <span className="w-1 bg-amber-300 animate-eq-3 rounded-full" />
                      </div>
                    ) : (
                      idx + 1
                    )}
                  </span>

                  {/* Artwork Thumbnail */}
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {art ? (
                      <img
                        src={art}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Disc3 className="w-5 h-5 text-amber-400" />
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0">
                    <div className="font-poppins font-semibold text-xs text-white truncate">
                      {track.title}
                    </div>
                    <div className="font-poppins text-[11px] text-white/60 truncate mt-0.5">
                      {track.artist}
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="font-poppins text-xs text-white/50 shrink-0 font-medium">
                  {formatDuration(track.duration)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

