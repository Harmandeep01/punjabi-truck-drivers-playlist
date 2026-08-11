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

export interface ShoutoutItem {
  id: string;
  title: string;
  phrase: string;
  type: 'horn' | 'airhorn' | 'balle' | 'oyehoye' | 'chakde' | 'kihaal' | 'dhaba';
  icon: string;
  description: string;
}

export interface DesiHornItem {
  id: string;
  name: string;
  phrase: string;
  type: 'horn' | 'airhorn' | 'balle' | 'oyehoye' | 'chakde' | 'dhaba';
  icon: string;
  description: string;
}

