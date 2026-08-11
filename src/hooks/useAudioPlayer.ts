import { useState, useEffect, useRef, useCallback } from 'react';
import { Track, PlayerState, RepeatMode } from '../types';

const STORAGE_POS_KEY = 'punjabi_player_last_pos';

function fisherYatesShuffle(array: number[]): number[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useAudioPlayer(
  tracks: Track[],
  currentTrackIndex: number,
  selectTrack: (index: number) => void,
  onTrackPlayed?: (track: Track) => void
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialRestoreDoneRef = useRef<boolean>(false);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 0.85,
    isMuted: false,
    isShuffle: false,
    repeatMode: 'off',
    error: null,
  });

  // Fisher-Yates Shuffle Queue State
  const [shuffledQueue, setShuffledQueue] = useState<number[]>([]);
  const [shuffleQueuePointer, setShuffleQueuePointer] = useState<number>(0);

  const currentTrack = tracks[currentTrackIndex] || null;

  // Initialize HTML5 Audio instance
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      const time = audio.currentTime || 0;
      const dur = audio.duration && !isNaN(audio.duration) ? audio.duration : 0;

      setState((prev) => ({
        ...prev,
        currentTime: time,
        duration: dur || prev.duration,
      }));

      // Lightly save current playback position to localStorage every ~3 seconds
      if (currentTrack && Math.floor(time) % 3 === 0 && time > 1) {
        try {
          localStorage.setItem(
            STORAGE_POS_KEY,
            JSON.stringify({ trackId: currentTrack.id, time })
          );
        } catch (e) {
          // ignore
        }
      }
    };

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        duration: audio.duration && !isNaN(audio.duration) ? audio.duration : 0,
        error: null,
      }));
    };

    const handleWaiting = () => {
      setState((prev) => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState((prev) => ({ ...prev, isLoading: false }));
    };

    const handleError = (e: Event) => {
      console.warn('Audio playback error:', e);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        error: 'Unable to stream audio track. Click Next to continue.',
      }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack]);

  // Update audio source when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const streamUrl = currentTrack.audioUrl || currentTrack.url;
    if (!streamUrl) return;

    const wasPlaying = state.isPlaying;

    audio.src = streamUrl;
    audio.currentTime = 0;

    // Position Restoration Check on initial boot
    if (!initialRestoreDoneRef.current) {
      initialRestoreDoneRef.current = true;
      try {
        const savedPosStr = localStorage.getItem(STORAGE_POS_KEY);
        if (savedPosStr) {
          const saved = JSON.parse(savedPosStr);
          if (saved && saved.trackId === currentTrack.id && saved.time > 0) {
            audio.currentTime = saved.time;
            setState((prev) => ({ ...prev, currentTime: saved.time }));
          }
        }
      } catch (e) {
        // ignore storage error
      }
    }

    setState((prev) => ({
      ...prev,
      currentTime: audio.currentTime,
      duration: currentTrack.duration || 0,
      isLoading: true,
      error: null,
    }));

    if (wasPlaying) {
      audio
        .play()
        .then(() => {
          setState((prev) => ({ ...prev, isPlaying: true, isLoading: false }));
          if (onTrackPlayed && currentTrack) {
            onTrackPlayed(currentTrack);
          }
        })
        .catch((err) => {
          console.warn('Autoplay prevented or network delay:', err);
          setState((prev) => ({ ...prev, isPlaying: false, isLoading: false }));
        });
    } else if (onTrackPlayed && currentTrack) {
      onTrackPlayed(currentTrack);
    }
  }, [currentTrackIndex, currentTrack?.id, onTrackPlayed]);

  // Toggle Shuffle with Unbiased Fisher-Yates Algorithm
  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      const nextShuffle = !prev.isShuffle;

      if (nextShuffle && tracks.length > 0) {
        const remainingIndices = tracks
          .map((_, i) => i)
          .filter((i) => i !== currentTrackIndex);

        const shuffled = [currentTrackIndex, ...fisherYatesShuffle(remainingIndices)];
        setShuffledQueue(shuffled);
        setShuffleQueuePointer(0);
      }

      return { ...prev, isShuffle: nextShuffle };
    });
  }, [tracks, currentTrackIndex]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (state.isPlaying) {
      audio.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      setState((prev) => ({ ...prev, isLoading: true }));
      audio
        .play()
        .then(() => {
          setState((prev) => ({ ...prev, isPlaying: true, isLoading: false }));
        })
        .catch((err) => {
          console.warn('Playback error on play:', err);
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            isLoading: false,
            error: 'Failed to play track. Click play again or select another track.',
          }));
        });
    }
  }, [state.isPlaying, currentTrack]);

  // Handle Next Track with Shuffle Queue & Repeat Mode support
  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;

    if (state.isShuffle && shuffledQueue.length > 0) {
      const nextPointer = shuffleQueuePointer + 1;
      if (nextPointer < shuffledQueue.length) {
        setShuffleQueuePointer(nextPointer);
        selectTrack(shuffledQueue[nextPointer]);
      } else {
        // Reached end of shuffled queue
        if (state.repeatMode === 'all') {
          const freshShuffled = fisherYatesShuffle(tracks.map((_, i) => i));
          setShuffledQueue(freshShuffled);
          setShuffleQueuePointer(0);
          selectTrack(freshShuffled[0]);
        } else {
          // repeat OFF -> stop playback
          setState((prev) => ({ ...prev, isPlaying: false }));
        }
      }
    } else {
      // Normal sequential playback
      const nextIdx = currentTrackIndex + 1;
      if (nextIdx < tracks.length) {
        selectTrack(nextIdx);
      } else {
        // Reached end of sequential tracks
        if (state.repeatMode === 'all') {
          selectTrack(0);
        } else {
          setState((prev) => ({ ...prev, isPlaying: false }));
        }
      }
    }
  }, [tracks, currentTrackIndex, state.isShuffle, shuffledQueue, shuffleQueuePointer, state.repeatMode, selectTrack]);

  // Handle Previous Track with Spotify-like 3-second restart behavior
  const previousTrack = useCallback(() => {
    if (tracks.length === 0) return;

    const audio = audioRef.current;

    // Spotify behavior: If played for > 3s, restart current track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setState((prev) => ({ ...prev, currentTime: 0 }));
      return;
    }

    if (state.isShuffle && shuffledQueue.length > 0) {
      const prevPointer = shuffleQueuePointer - 1;
      if (prevPointer >= 0) {
        setShuffleQueuePointer(prevPointer);
        selectTrack(shuffledQueue[prevPointer]);
      } else {
        const lastIdx = shuffledQueue.length - 1;
        setShuffleQueuePointer(lastIdx);
        selectTrack(shuffledQueue[lastIdx]);
      }
    } else {
      const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      selectTrack(prevIdx);
    }
  }, [tracks, currentTrackIndex, state.isShuffle, shuffledQueue, shuffleQueuePointer, selectTrack]);

  // Handle Automatic Track End Transition
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (state.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [state.repeatMode, nextTrack]);

  // Seek to specific time in seconds
  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetTime = Math.max(0, Math.min(seconds, state.duration || 0));
    audio.currentTime = targetTime;
    setState((prev) => ({ ...prev, currentTime: targetTime }));
  }, [state.duration]);

  // Volume control
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    const audio = audioRef.current;
    if (audio) {
      audio.volume = clamped;
      audio.muted = clamped === 0;
    }
    setState((prev) => ({
      ...prev,
      volume: clamped,
      isMuted: clamped === 0,
    }));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isMuted) {
      audio.muted = false;
      const targetVol = state.volume > 0 ? state.volume : 0.8;
      audio.volume = targetVol;
      setState((prev) => ({ ...prev, isMuted: false, volume: targetVol }));
    } else {
      audio.muted = true;
      setState((prev) => ({ ...prev, isMuted: true }));
    }
  }, [state.isMuted, state.volume]);

  // Toggle Repeat Mode (OFF -> ALL -> ONE -> OFF)
  const toggleRepeat = useCallback(() => {
    setState((prev) => {
      let nextMode: RepeatMode = 'off';
      if (prev.repeatMode === 'off') nextMode = 'all';
      else if (prev.repeatMode === 'all') nextMode = 'one';
      else nextMode = 'off';
      return { ...prev, repeatMode: nextMode };
    });
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(state.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(state.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(state.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(state.volume - 0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyN':
          e.preventDefault();
          nextTrack();
          break;
        case 'KeyP':
          e.preventDefault();
          previousTrack();
          break;
        case 'KeyS':
          e.preventDefault();
          toggleShuffle();
          break;
        case 'KeyR':
          e.preventDefault();
          toggleRepeat();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekTo, state.currentTime, setVolume, state.volume, toggleMute, nextTrack, previousTrack, toggleShuffle, toggleRepeat]);

  return {
    state,
    currentTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  };
}

