import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Disc3,
  X,
  RefreshCw,
  Radio,
  Music2,
  AlertCircle,
  Shuffle,
  Repeat,
  Repeat1,
  Play,
  Pause,
  Target,
} from 'lucide-react';
import { Track, PlaylistManifestItem, RepeatMode } from '../types';
import { GET_BASE_URL } from '../utils/config';

interface PlaylistQueueProps {
  masterTracks: Track[];
  activeTracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onTogglePlay: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onClose?: () => void;
  onRefetch?: () => void;
  playlists?: PlaylistManifestItem[];
  activePlaylistId?: string;
  activePlaylistName?: string;
  onPlayTrackFromPlaylist: (
    playlistId: string,
    trackId: string,
    tracksList?: Track[],
    playlistName?: string
  ) => void;
  playlistsError?: string | null;
  playlistsLoading?: boolean;
}

function formatDuration(secs?: number): string {
  if (!secs) return '3:30';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
}

export const PlaylistQueue: React.FC<PlaylistQueueProps> = ({
  masterTracks,
  activeTracks,
  currentTrackId,
  isPlaying,
  isShuffle,
  repeatMode,
  onTogglePlay,
  onToggleShuffle,
  onToggleRepeat,
  onClose,
  onRefetch,
  playlists = [],
  activePlaylistId = 'master',
  activePlaylistName = 'Master Library',
  onPlayTrackFromPlaylist,
  playlistsError = null,
  playlistsLoading = false,
}) => {
  const [viewingPlaylistId, setViewingPlaylistId] = useState<string>(activePlaylistId || 'master');
  const [viewingPlaylistName, setViewingPlaylistName] = useState<string>(activePlaylistName || 'Master Library');
  const [viewingTracks, setViewingTracks] = useState<Track[]>(activeTracks);
  const [loadingViewing, setLoadingViewing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeTrackRef = useRef<HTMLDivElement | null>(null);
  const trackListRef = useRef<HTMLDivElement | null>(null);

  // Requirement: Scroll to active playing/paused track if active playlist, or top of unplayed playlist
  const scrollToActiveTrack = () => {
    if (viewingPlaylistId === activePlaylistId) {
      if (activeTrackRef.current) {
        activeTrackRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      if (trackListRef.current) {
        trackListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleJumpToNowPlaying = () => {
    if (viewingPlaylistId !== activePlaylistId) {
      setViewingPlaylistId(activePlaylistId);
    } else {
      scrollToActiveTrack();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToActiveTrack();
    }, 150);
    return () => clearTimeout(timer);
  }, [viewingPlaylistId, currentTrackId, activePlaylistId]);

  // Requirement 4: ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch or resolve viewing playlist tracks
  useEffect(() => {
    let isMounted = true;

    if (viewingPlaylistId === activePlaylistId && activeTracks.length > 0) {
      setViewingTracks(activeTracks);
      setViewingPlaylistName(activePlaylistName);
      return;
    }

    if (viewingPlaylistId === 'master' || viewingPlaylistId === 'default') {
      setViewingTracks(masterTracks);
      setViewingPlaylistName('Master Library');
      return;
    }

    const loadViewingPlaylist = async () => {
      setLoadingViewing(true);
      try {
        const baseUrl = GET_BASE_URL();
        const targetManifest = playlists.find((p) => p.id === viewingPlaylistId);
        let path = `${baseUrl}/data/playlists/${viewingPlaylistId}.json`;
        if (targetManifest?.file) {
          path = targetManifest.file.startsWith('http')
            ? targetManifest.file
            : `${baseUrl}/${targetManifest.file.replace(/^\/+/, '')}`;
        }

        const res = await fetch(path);
        if (res.ok && isMounted) {
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('text/html')) {
            const data = await res.json();
            const rawName = data.name || targetManifest?.name || viewingPlaylistId;
            const pName =
              rawName.toLowerCase().includes('kuldeep') || rawName.toLowerCase().includes('manak')
                ? 'Kuldeep Manak'
                : rawName;
            setViewingPlaylistName(pName);

            const refs = Array.isArray(data) ? data : data.tracks || [];
            const cleanId = (s: string | number) => String(s).trim().replace(/^0+/, '');
            const resList: Track[] = [];

            refs.forEach((item: any, idx: number) => {
              if (item && typeof item === 'object' && (item.audioUrl || item.url || item.title)) {
                const art = item.artUrl || item.artwork || item.cover || '';
                const audio = item.audioUrl || item.url || item.src || '';
                const artistDisplay = Array.isArray(item.artist)
                  ? item.artist.join(', ')
                  : item.artist || 'Kuldeep Manak';

                resList.push({
                  id: item.id ? String(item.id) : `view-track-${idx + 1}`,
                  title: item.title || item.name || `Track ${idx + 1}`,
                  artist: artistDisplay,
                  album: item.album || item.playlist || 'Kuldeep Manak Playlist',
                  artwork: art,
                  artUrl: art,
                  url: audio,
                  audioUrl: audio,
                  duration: item.duration ? Number(item.duration) : 200,
                });
                return;
              }
              const tid = typeof item === 'string' ? item : item?.id ? String(item.id) : null;
              if (tid) {
                const match = masterTracks.find((m) => cleanId(m.id) === cleanId(tid));
                if (match) {
                  resList.push(match);
                  return;
                }
              }
            });

            if (resList.length > 0) {
              setViewingTracks(resList);
            } else {
              setViewingTracks(masterTracks);
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching viewing playlist:', err);
      } finally {
        if (isMounted) setLoadingViewing(false);
      }
    };

    loadViewingPlaylist();

    return () => {
      isMounted = false;
    };
  }, [viewingPlaylistId, activePlaylistId, activeTracks, activePlaylistName, masterTracks, playlists]);

  const filteredViewingTracks = viewingTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefreshPlaylist = async () => {
    if (onRefetch) onRefetch();
    if (viewingPlaylistId !== 'master') {
      setLoadingViewing(true);
      try {
        const baseUrl = GET_BASE_URL();
        const targetManifest = playlists.find((p) => p.id === viewingPlaylistId);
        let path = `${baseUrl}/data/playlists/${viewingPlaylistId}.json`;
        if (targetManifest?.file) {
          path = targetManifest.file.startsWith('http')
            ? targetManifest.file
            : `${baseUrl}/${targetManifest.file.replace(/^\/+/, '')}`;
        }
        const res = await fetch(`${path}?t=${Date.now()}`);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('text/html')) {
            const data = await res.json();
            const rawName = data.name || targetManifest?.name || viewingPlaylistId;
            const pName =
              rawName.toLowerCase().includes('kuldeep') || rawName.toLowerCase().includes('manak')
                ? 'Kuldeep Manak'
                : rawName;
            setViewingPlaylistName(pName);

            const refs = Array.isArray(data) ? data : data.tracks || [];
            const cleanId = (s: string | number) => String(s).trim().replace(/^0+/, '');
            const resList: Track[] = [];

            refs.forEach((item: any, idx: number) => {
              if (item && typeof item === 'object' && (item.audioUrl || item.url || item.title)) {
                const art = item.artUrl || item.artwork || item.cover || '';
                const audio = item.audioUrl || item.url || item.src || '';
                const artistDisplay = Array.isArray(item.artist)
                  ? item.artist.join(', ')
                  : item.artist || 'Kuldeep Manak';

                resList.push({
                  id: item.id ? String(item.id) : `view-track-${idx + 1}`,
                  title: item.title || item.name || `Track ${idx + 1}`,
                  artist: artistDisplay,
                  album: item.album || item.playlist || 'Kuldeep Manak Playlist',
                  artwork: art,
                  artUrl: art,
                  url: audio,
                  audioUrl: audio,
                  duration: item.duration ? Number(item.duration) : 200,
                });
                return;
              }
              const tid = typeof item === 'string' ? item : item?.id ? String(item.id) : null;
              if (tid) {
                const match = masterTracks.find((m) => cleanId(m.id) === cleanId(tid));
                if (match) {
                  resList.push(match);
                  return;
                }
              }
            });

            if (resList.length > 0) {
              setViewingTracks(resList);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to refresh playlist:', e);
      } finally {
        setLoadingViewing(false);
      }
    }
  };

  return (
    /* Requirement 4: Backdrop overlay closes modal if clicked outside */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        aria-label="Playlist Tracks Queue"
        className="bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] sm:max-h-[80vh] text-white select-none relative animate-in zoom-in-95 duration-200"
      >
        {/* Top Handle Bar */}
        <div className="w-10 h-1 bg-zinc-700/60 rounded-full mx-auto mb-3 shrink-0" />

        {/* Minimal Modern Header */}
        <div className="flex flex-col gap-2.5 border-b border-zinc-800/80 pb-3 mb-3">
          {/* Header Row 1: Title, Active Badge, Track Count, Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-poppins font-semibold text-base sm:text-lg text-white truncate max-w-[180px] sm:max-w-xs">
                    {viewingPlaylistName}
                  </h3>
                  {viewingPlaylistId === activePlaylistId && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-medium shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <p className="font-poppins text-xs text-zinc-400">
                  {viewingTracks.length} Tracks
                </p>
              </div>
            </div>

            {/* Requirement 2: Clean close button fixed inside header */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Close Playlist"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Header Row 2: Action Controls Bar (Shuffle, Repeat, Refresh, Jump-to-current) */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Shuffle Toggle */}
              <button
                onClick={onToggleShuffle}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-poppins flex items-center gap-1.5 transition-all cursor-pointer ${
                  isShuffle
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                }`}
                title={`Shuffle: ${isShuffle ? 'ON' : 'OFF'}`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>

              {/* Repeat Toggle */}
              <button
                onClick={onToggleRepeat}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-poppins flex items-center gap-1.5 transition-all cursor-pointer ${
                  repeatMode !== 'off'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                }`}
                title={`Repeat: ${repeatMode.toUpperCase()}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline capitalize">{repeatMode}</span>
              </button>

              {/* Refresh Playlist */}
              <button
                onClick={handleRefreshPlaylist}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-poppins bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
                title="Refresh Playlist"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingViewing ? 'animate-spin text-amber-400' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>

            {/* Requirement 6: Small down/jump button to focus active playing/paused track */}
            <button
              onClick={handleJumpToNowPlaying}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-poppins bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="Jump to current track"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Now Playing</span>
            </button>
          </div>
        </div>

        {/* Playlists Tabs */}
        <div className="mb-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {/* Master Library Tab */}
            <button
              onClick={() => setViewingPlaylistId('master')}
              className={`px-3 py-1.5 rounded-xl text-xs font-poppins font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                viewingPlaylistId === 'master'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Master Library</span>
            </button>

            {/* Custom Playlists Tabs */}
            {playlists.map((pl) => {
              const isViewing = viewingPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setViewingPlaylistId(pl.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-poppins font-medium transition-all shrink-0 cursor-pointer ${
                    isViewing
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                  title={pl.name}
                >
                  {pl.name}
                </button>
              );
            })}
          </div>

          {playlistsError && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span className="truncate">{playlistsError}</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${viewingPlaylistName}...`}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs font-poppins text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>

        {/* Minimal Modern Track List */}
        <div ref={trackListRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
          {filteredViewingTracks.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-poppins text-xs">
              No tracks found
            </div>
          ) : (
            filteredViewingTracks.map((track, idx) => {
              const isCurrentPlayingTrack =
                String(track.id) === String(currentTrackId) && viewingPlaylistId === activePlaylistId;
              const art = track.artUrl || track.artwork;

              return (
                <div
                  key={track.id}
                  ref={isCurrentPlayingTrack ? activeTrackRef : null}
                  // Requirement 1: Clicking track toggles play/pause if current track, or plays track if different
                  onClick={() => {
                    if (isCurrentPlayingTrack) {
                      onTogglePlay();
                    } else {
                      onPlayTrackFromPlaylist(viewingPlaylistId, track.id, viewingTracks, viewingPlaylistName);
                    }
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isCurrentPlayingTrack
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  {/* Left Column: Number / Status / Artwork / Meta */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-poppins text-xs font-medium text-zinc-500 w-5 text-center shrink-0">
                      {isCurrentPlayingTrack && isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3">
                          <span className="w-0.5 bg-amber-400 animate-eq-1 rounded-full" />
                          <span className="w-0.5 bg-amber-300 animate-eq-2 rounded-full" />
                          <span className="w-0.5 bg-white animate-eq-3 rounded-full" />
                        </div>
                      ) : (
                        idx + 1
                      )}
                    </span>

                    {/* Artwork Thumbnail */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {art ? (
                        <img
                          src={art}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Disc3 className="w-4 h-4 text-amber-400" />
                      )}

                      {/* Requirement 1: Play/Pause overlay icon on artwork */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        {isCurrentPlayingTrack && isPlaying ? (
                          <Pause className="w-4 h-4 text-amber-300 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 text-amber-300 fill-current" />
                        )}
                      </div>
                    </div>

                    {/* Track Info */}
                    <div className="min-w-0">
                      <div className={`font-poppins font-medium text-xs truncate ${isCurrentPlayingTrack ? 'text-amber-300 font-semibold' : 'text-zinc-100'}`}>
                        {track.title}
                      </div>
                      <div className="font-poppins text-[11px] text-zinc-400 truncate mt-0.5">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Play/Pause Button + Duration */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Requirement 1: Explicit Play/Pause action button inside opened playlist */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrentPlayingTrack) {
                          onTogglePlay();
                        } else {
                          onPlayTrackFromPlaylist(viewingPlaylistId, track.id, viewingTracks, viewingPlaylistName);
                        }
                      }}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        isCurrentPlayingTrack
                          ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-sm'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                      }`}
                      title={isCurrentPlayingTrack && isPlaying ? 'Pause' : 'Play'}
                    >
                      {isCurrentPlayingTrack && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <span className="font-poppins text-xs text-zinc-500 font-mono w-9 text-right hidden sm:inline">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
