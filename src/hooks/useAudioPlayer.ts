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
  onPlaylistEnd?: () => void,
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

  // Web Audio API Visualizer Refs & State
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [visualizerData, setVisualizerData] = useState<{
    beatEnergy: number;
    frequencies: number[];
  }>({
    beatEnergy: 0,
    frequencies: [0.15, 0.15, 0.15, 0.15, 0.15],
  });

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

    // Requirement 0: On opening the app, play initial random track automatically
    if (!initialRestoreDoneRef.current) {
      initialRestoreDoneRef.current = true;
      try {
        const savedPosStr = localStorage.getItem(STORAGE_POS_KEY);
        if (savedPosStr) {
          const saved = JSON.parse(savedPosStr);
          if (saved && saved.trackId === currentTrack.id && saved.time > 0) {
            audio.currentTime = saved.time;
          }
        }
      } catch (e) {
        // ignore
      }

      setState((prev) => ({ ...prev, isPlaying: true, isLoading: true }));
      audio
        .play()
        .then(() => {
          setState((prev) => ({ ...prev, isPlaying: true, isLoading: false }));
          if (onTrackPlayed && currentTrack) onTrackPlayed(currentTrack);
        })
        .catch((err) => {
          console.warn('Initial autoplay prevented by browser policy (user interaction required):', err);
          setState((prev) => ({ ...prev, isPlaying: false, isLoading: false }));
        });

      return;
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

  // Synchronize shuffle queue when tracks or currentTrackIndex changes
  useEffect(() => {
    if (state.isShuffle && tracks.length > 0) {
      if (shuffledQueue.length !== tracks.length) {
        const remainingIndices = tracks
          .map((_, i) => i)
          .filter((i) => i !== currentTrackIndex);
        const shuffled = [currentTrackIndex, ...fisherYatesShuffle(remainingIndices)];
        setShuffledQueue(shuffled);
        setShuffleQueuePointer(0);
      } else if (shuffledQueue[shuffleQueuePointer] !== currentTrackIndex) {
        const idxInQueue = shuffledQueue.indexOf(currentTrackIndex);
        if (idxInQueue !== -1) {
          setShuffleQueuePointer(idxInQueue);
        } else {
          const remainingIndices = tracks
            .map((_, i) => i)
            .filter((i) => i !== currentTrackIndex);
          const shuffled = [currentTrackIndex, ...fisherYatesShuffle(remainingIndices)];
          setShuffledQueue(shuffled);
          setShuffleQueuePointer(0);
        }
      }
    }
  }, [tracks, currentTrackIndex, state.isShuffle]);

  // Toggle Shuffle
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
        } else if (onPlaylistEnd) {
          // Requirement 3: Move to different playlist if repeat is off
          onPlaylistEnd();
        } else {
          setState((prev) => ({ ...prev, isPlaying: false }));
        }
      }
    } else {
      // Normal sequential playback
      const nextIdx = currentTrackIndex + 1;
      if (nextIdx < tracks.length) {
        selectTrack(nextIdx);
      } else {
        // Reached end of sequential tracks in playlist
        if (state.repeatMode === 'all') {
          selectTrack(0);
        } else if (onPlaylistEnd) {
          // Requirement 3: Complete full playlist, then move to different playlist
          onPlaylistEnd();
        } else {
          setState((prev) => ({ ...prev, isPlaying: false }));
        }
      }
    }
  }, [tracks, currentTrackIndex, state.isShuffle, shuffledQueue, shuffleQueuePointer, state.repeatMode, selectTrack, onPlaylistEnd]);

  // Handle Previous Track
  const previousTrack = useCallback(() => {
    if (tracks.length === 0) return;

    const audio = audioRef.current;

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

  // Seek
  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetTime = Math.max(0, Math.min(seconds, state.duration || 0));
    audio.currentTime = targetTime;
    setState((prev) => ({ ...prev, currentTime: targetTime }));
  }, [state.duration]);

  // Volume
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

      const key = e.key;
      const code = e.code;

      if (
        key === 'AudioVolumeUp' ||
        key === 'VolumeUp' ||
        code === 'AudioVolumeUp' ||
        code === 'VolumeUp'
      ) {
        e.preventDefault();
        setVolume(state.volume + 0.05);
        return;
      }

      if (
        key === 'AudioVolumeDown' ||
        key === 'VolumeDown' ||
        code === 'AudioVolumeDown' ||
        code === 'VolumeDown'
      ) {
        e.preventDefault();
        setVolume(state.volume - 0.05);
        return;
      }

      if (
        key === 'AudioVolumeMute' ||
        key === 'VolumeMute' ||
        code === 'AudioVolumeMute' ||
        code === 'VolumeMute'
      ) {
        e.preventDefault();
        toggleMute();
        return;
      }

      switch (code) {
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
          setVolume(state.volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(state.volume - 0.05);
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

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [togglePlay, seekTo, state.currentTime, setVolume, state.volume, toggleMute, nextTrack, previousTrack, toggleShuffle, toggleRepeat]);

  // Web Audio API & beat-synced visualizer effect
  useEffect(() => {
    if (!state.isPlaying) {
      setVisualizerData({
        beatEnergy: 0,
        frequencies: [0.15, 0.15, 0.15, 0.15, 0.15],
      });
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.8;
          audioCtxRef.current = ctx;
          analyserRef.current = analyser;

          try {
            audio.crossOrigin = 'anonymous';
            const srcNode = ctx.createMediaElementSource(audio);
            srcNode.connect(analyser);
            analyser.connect(ctx.destination);
            sourceRef.current = srcNode;
          } catch {
            // Element already connected or crossOrigin restricted
          }
        }
      } catch {
        // AudioContext not allowed before user gesture
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    let animationFrameId: number;
    const dataArray = new Uint8Array(32);

    const updateVisualizer = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 32; i++) sum += dataArray[i];

        if (sum > 0) {
          const b1 = (dataArray[0] + dataArray[1] + dataArray[2]) / (3 * 255);
          const b2 = (dataArray[3] + dataArray[4] + dataArray[5] + dataArray[6]) / (4 * 255);
          const b3 = (dataArray[7] + dataArray[8] + dataArray[9] + dataArray[10]) / (4 * 255);
          const b4 = (dataArray[11] + dataArray[12] + dataArray[13] + dataArray[14]) / (4 * 255);
          const b5 = (dataArray[15] + dataArray[16] + dataArray[17]) / (3 * 255);

          const sensitiveScale = (val: number) => {
            if (val < 0.02) return 0.01;
            return Math.min(1.0, Math.pow(val, 0.7) * 1.5);
          };

          const energy = sensitiveScale(b1);
          setVisualizerData({
            beatEnergy: energy,
            frequencies: [
              sensitiveScale(b1),
              sensitiveScale(b2),
              sensitiveScale(b3),
              sensitiveScale(b4),
              sensitiveScale(b5),
            ],
          });

          animationFrameId = requestAnimationFrame(updateVisualizer);
          return;
        }
      }

      // Audio-synced beat timing calculated directly from actual audio.currentTime
      const curTime = audio.currentTime || 0;
      const bpm = 126;
      const beatPeriod = 60 / bpm;
      const phase = (curTime % beatPeriod) / beatPeriod;
      const kick = Math.pow(1 - phase, 3);
      const snarePhase = ((curTime + beatPeriod * 0.5) % beatPeriod) / beatPeriod;
      const snare = Math.pow(1 - snarePhase, 3.5) * 0.5;

      const energy = Math.min(1, kick + snare);
      // Highly sensitive mapping: drops to 0.01 during off-beats / quiet parts, jumps to 1.0 on peak beats
      const band1 = Math.min(1, Math.max(0.01, Math.pow(energy, 1.8) * 1.2));
      const band2 = Math.min(1, Math.max(0.01, Math.pow(energy, 2.2) * 1.3));
      const band3 = Math.min(1, Math.max(0.01, (0.3 * Math.sin(curTime * 12) + 0.7) * energy));
      const band4 = Math.min(1, Math.max(0.01, (0.4 * Math.cos(curTime * 14) + 0.6) * energy));
      const band5 = Math.min(1, Math.max(0.01, Math.pow(energy, 2.0) * 1.1));

      setVisualizerData({
        beatEnergy: energy,
        frequencies: [band1, band2, band3, band4, band5],
      });

      animationFrameId = requestAnimationFrame(updateVisualizer);
    };

    animationFrameId = requestAnimationFrame(updateVisualizer);
    return () => cancelAnimationFrame(animationFrameId);
  }, [state.isPlaying]);

  return {
    state,
    currentTrack,
    visualizerData,
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
