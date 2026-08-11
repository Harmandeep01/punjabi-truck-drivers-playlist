import { useState, useEffect, useCallback } from 'react';
import { Track } from '../types';

// R2 Bucket URL from environment variable or default fallback
const GET_R2_TRACKS_URL = () => {
  const metaEnv = (import.meta as any).env || {};
  const procEnv = typeof process !== 'undefined' ? process.env || {} : {};
  const envUrl = metaEnv.VITE_R2_PUBLIC_URL || metaEnv.VITE_R2_BASE_URL || procEnv.VITE_R2_PUBLIC_URL || procEnv.VITE_R2_BASE_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const cleanBase = envUrl.trim().replace(/\/+$/, '');
    if (cleanBase.endsWith('.json')) {
      return cleanBase;
    }
    if (cleanBase.endsWith('/data')) {
      return `${cleanBase}/tracks.json`;
    }
    return `${cleanBase}/data/tracks.json`;
  }
  return '/data/tracks.json';
};

const DEFAULT_FALLBACK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'G.T. Road (Highway Anthem)',
    artist: 'Surinder Shinda',
    album: 'Truck Driver Classics',
    artwork: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    duration: 215,
  },
  {
    id: '2',
    title: 'Truck Driver Flow',
    artist: 'Kuldip Manak',
    album: 'Roadside Dhaba Beats',
    artwork: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-10781.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-10781.mp3',
    duration: 184,
  },
  {
    id: '3',
    title: 'Majhail Highway Drive',
    artist: 'AP Dhillon & Gurinder Gill',
    album: 'Overnight Freight',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=hip-hop-rock-beat-118000.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=hip-hop-rock-beat-118000.mp3',
    duration: 208,
  },
  {
    id: '4',
    title: 'Horn OK Please (Dhaba Sunset)',
    artist: 'Karan Aujla',
    album: 'Brampton To Punjab',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f72532.mp3?filename=chill-abstract-intention-12099.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f72532.mp3?filename=chill-abstract-intention-12099.mp3',
    duration: 192,
  },
  {
    id: '5',
    title: 'Chak De Phatte',
    artist: 'Diljit Dosanjh',
    album: 'Highway Express',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c2a11b6500.mp3?filename=electronic-future-beats-117997.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c2a11b6500.mp3?filename=electronic-future-beats-117997.mp3',
    duration: 178,
  },
  {
    id: '6',
    title: 'Punjab Roadways Night Bus',
    artist: 'Sidhu Moose Wala',
    album: 'Legendary Routes',
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    duration: 240,
  },
];

export function usePlaylist() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [source, setSource] = useState<'r2' | 'fallback'>('r2');

  const normalizeTrack = (raw: any, index: number): Track => {
    const art = raw.artUrl || raw.artwork || raw.art || raw.cover || raw.image || DEFAULT_FALLBACK_TRACKS[index % DEFAULT_FALLBACK_TRACKS.length].artwork;
    const audio = raw.audioUrl || raw.url || raw.src || DEFAULT_FALLBACK_TRACKS[index % DEFAULT_FALLBACK_TRACKS.length].url;

    return {
      id: raw.id ? String(raw.id) : `track-${index + 1}`,
      title: raw.title || raw.name || `Track ${index + 1}`,
      artist: raw.artist || raw.singer || 'Punjabi Artist',
      album: raw.album || raw.playlist || 'Punjabi Highway Playlist',
      artwork: art,
      artUrl: art,
      url: audio,
      audioUrl: audio,
      duration: raw.duration ? Number(raw.duration) : 200,
    };
  };

  const fetchPlaylist = useCallback(async () => {
    setLoading(true);
    setError(null);

    const targetUrl = GET_R2_TRACKS_URL();
    const metaEnv = (import.meta as any).env || {};
    const procEnv = typeof process !== 'undefined' ? process.env || {} : {};
    const rawEnvUrl = (metaEnv.VITE_R2_PUBLIC_URL || metaEnv.VITE_R2_BASE_URL || procEnv.VITE_R2_PUBLIC_URL || procEnv.VITE_R2_BASE_URL || '').trim().replace(/\/+$/, '');

    const urlsToTry = [targetUrl];
    if (rawEnvUrl && !rawEnvUrl.endsWith('.json')) {
      const altUrl1 = `${rawEnvUrl}/tracks.json`;
      const altUrl2 = rawEnvUrl;
      if (!urlsToTry.includes(altUrl1)) urlsToTry.push(altUrl1);
      if (!urlsToTry.includes(altUrl2)) urlsToTry.push(altUrl2);
    }
    if (!urlsToTry.includes('/data/tracks.json')) {
      urlsToTry.push('/data/tracks.json');
    }

    for (const url of urlsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) continue;

        const data = await res.json();
        let rawList: any[] = [];

        if (Array.isArray(data)) {
          rawList = data;
        } else if (data && Array.isArray(data.tracks)) {
          rawList = data.tracks;
        } else if (data && typeof data === 'object') {
          const possibleArray = Object.values(data).find((val) => Array.isArray(val));
          if (possibleArray) rawList = possibleArray as any[];
        }

        if (rawList.length > 0) {
          const parsed = rawList.map((item, idx) => normalizeTrack(item, idx));
          setTracks(parsed);
          setSource(url === '/data/tracks.json' ? 'fallback' : 'r2');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn(`Tracks fetch attempt failed from ${url}:`, err);
      }
    }

    // Default fallback if all network attempts fail
    setTracks(DEFAULT_FALLBACK_TRACKS);
    setSource('fallback');
    setError('Unable to load tracks.json. Using fallback demo playlist.');
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const currentTrack = tracks[currentTrackIndex] || null;

  const selectTrack = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrackIndex(index);
    }
  };

  const selectTrackById = (id: string) => {
    const idx = tracks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    }
  };

  const filteredTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    tracks,
    filteredTracks,
    currentTrack,
    currentTrackIndex,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    source,
    selectTrack,
    selectTrackById,
    refetchPlaylist: fetchPlaylist,
  };
}

