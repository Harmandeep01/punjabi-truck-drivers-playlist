import { useState, useEffect, useCallback } from 'react';
import { Track } from '../types';

const STORAGE_KEY = 'punjabi_truckers_recently_played_v2';
const MAX_RECENT_TRACKS = 10;

export function useRecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load recently played tracks from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyPlayed));
    } catch (e) {
      console.warn('Failed to save recently played tracks to localStorage:', e);
    }
  }, [recentlyPlayed]);

  const addTrackToRecentlyPlayed = useCallback((track: Track) => {
    if (!track || !track.id) return;

    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      const updated = [track, ...filtered];
      return updated.slice(0, MAX_RECENT_TRACKS);
    });
  }, []);

  const clearRecentlyPlayed = useCallback(() => {
    setRecentlyPlayed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear recently played:', e);
    }
  }, []);

  return {
    recentlyPlayed,
    addTrackToRecentlyPlayed,
    clearRecentlyPlayed,
  };
}
