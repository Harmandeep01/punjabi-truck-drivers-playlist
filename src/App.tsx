import React, { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { MusicPlayer } from './components/MusicPlayer';
import { PlaylistQueue } from './components/PlaylistQueue';
import { IstClock } from './components/IstClock';
import { ListenersBadge } from './components/ListenersBadge';
import { AdminDashboard } from './components/AdminDashboard';
import { usePlaylist } from './hooks/usePlaylist';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useHeartbeat } from './hooks/useHeartbeat';
import { Eye, ListMusic } from 'lucide-react';

export default function App() {
  const {
    masterTracks,
    activeTracks,
    currentTrack,
    currentTrackIndex,
    playlists,
    playlistsLoading,
    playlistsError,
    activePlaylistId,
    activePlaylistName,
    selectTrack,
    playPlaylistAndTrack,
    playNextPlaylist,
    refetchPlaylist,
  } = usePlaylist();

  const {
    state,
    visualizerData,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  } = useAudioPlayer(activeTracks, currentTrackIndex, selectTrack, playNextPlaylist);

  const { stats, isConnected } = useHeartbeat();

  const [pureViewMode, setPureViewMode] = useState<boolean>(false);
  const [showQueue, setShowQueue] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      return path === '/admin' || params.get('admin') === 'true';
    }
    return false;
  });

  // Requirement 0: Keep currently playing track's background image even when paused
  const isKuldeepManakTrack =
    activePlaylistId === 'kuldeep-manak' ||
    currentTrack?.artist?.toLowerCase().includes('kuldeep manak') ||
    currentTrack?.artist?.toLowerCase().includes('kuldip manak');

  const bgImage = isKuldeepManakTrack ? '/kuldeep_manak.jpg' : '/truck-bg.png';

  // Keyboard shortcut Ctrl+Shift+A for Admin Telemetry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowAdminDashboard((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 h-full h-[100dvh] w-full flex flex-col justify-between overflow-hidden font-poppins select-none">
      {/* Protected Admin Telemetry Dashboard */}
      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {/* 1. Dynamic Hero Background Image Component */}
      <Background
        pureViewMode={pureViewMode}
        onTogglePureView={() => setPureViewMode(false)}
        bgImage={bgImage}
      />

      {/* Main UI Overlay - Header stays visible in Pure View Mode */}
      <div className="relative z-10 h-full w-full flex flex-col justify-between p-2.5 sm:p-5 overflow-hidden">
        {/* Top Header with IST Clock & Live Listeners on Left & Actions on Right (Always Visible) */}
        <header className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3 z-20 pt-1 sm:pt-2 shrink-0">
          {/* Top Left: IST Clock & Live Listener Badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <IstClock />
            <ListenersBadge
              stats={stats}
              isConnected={isConnected}
            />
          </div>

          {/* Top Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {pureViewMode ? (
              <button
                onClick={() => setPureViewMode(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 hover:bg-black/80 text-xs font-poppins font-medium transition-all cursor-pointer shadow-xl"
                title="Exit Pure View (Show Player)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show Player Controls</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setPureViewMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white text-xs font-poppins transition-all cursor-pointer shadow-md"
                  title="Pure View (Hide Player)"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pure View</span>
                </button>

                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-poppins font-medium transition-all cursor-pointer shadow-md"
                  title="Open Playlist Queue"
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>Playlist ({activeTracks.length})</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Lowered Floating Music Player Control Panel - Hidden in Pure View Mode */}
        {!pureViewMode && (
          <>
            <main className="flex-1 w-full max-w-xl mx-auto flex flex-col justify-end items-center py-2 sm:pb-4 relative z-20 min-h-0 overflow-hidden">
              {/* Queue Modal Overlay */}
              {showQueue && (
                <PlaylistQueue
                  masterTracks={masterTracks}
                  activeTracks={activeTracks}
                  currentTrackId={currentTrack?.id || null}
                  isPlaying={state.isPlaying}
                  isShuffle={state.isShuffle}
                  repeatMode={state.repeatMode}
                  onTogglePlay={togglePlay}
                  onToggleShuffle={toggleShuffle}
                  onToggleRepeat={toggleRepeat}
                  onClose={() => setShowQueue(false)}
                  onRefetch={refetchPlaylist}
                  playlists={playlists}
                  activePlaylistId={activePlaylistId}
                  activePlaylistName={activePlaylistName}
                  onPlayTrackFromPlaylist={(pId, tId, pTracks, pName) =>
                    playPlaylistAndTrack(pId, tId, pTracks, pName)
                  }
                  playlistsError={playlistsError}
                  playlistsLoading={playlistsLoading}
                />
              )}

              <MusicPlayer
                track={currentTrack}
                state={state}
                visualizerData={visualizerData}
                onTogglePlay={togglePlay}
                onNext={nextTrack}
                onPrevious={previousTrack}
                onSeek={seekTo}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
                onToggleShuffle={toggleShuffle}
                onToggleRepeat={toggleRepeat}
                onToggleQueue={() => setShowQueue(true)}
              />
            </main>

            {/* Footer Track info */}
            <footer className="w-full text-center text-white/40 text-[11px] font-poppins py-0.5 shrink-0">
              Punjabi Truckers Highway Radio
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
