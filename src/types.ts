export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  artUrl?: string; // alias for artwork
  url: string;
  audioUrl?: string; // alias for url
  duration?: number;
}

export interface PlaylistManifestItem {
  id: string;
  name: string;
  description?: string;
  file?: string;
  trackCount?: number;
  updatedAt?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  error: string | null;
}

