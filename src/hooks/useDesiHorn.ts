import { useState, useCallback, useRef } from 'react';
import { DesiHornItem } from '../types';

export const DESI_HORNS: DesiHornItem[] = [
  {
    id: 'horn-1',
    name: 'Classic Musical Pressure Horn',
    phrase: 'Horn OK Please 🎺',
    type: 'horn',
    icon: '🎺',
    description: 'Iconic 4-tone Indian highway pressure horn',
  },
  {
    id: 'horn-2',
    name: 'Heavy Freight Air Horn',
    phrase: 'Poo-Poo-Poo-Poo! 🚛',
    type: 'airhorn',
    icon: '🚚',
    description: 'GT Road heavy freight blaring air horn',
  },
  {
    id: 'horn-3',
    name: 'Triple-Tone Express Horn',
    phrase: 'Pee-Pee-Poo-Poo-Pee! 🎶',
    type: 'horn',
    icon: '🎺',
    description: 'Fast 6-note Punjabi truck overtake horn',
  },
  {
    id: 'shout-1',
    name: 'Balle Balle!',
    phrase: 'Balle Balle! 💃',
    type: 'balle',
    icon: '🎉',
    description: 'Celebration cheer & dhol rhythm',
  },
  {
    id: 'shout-2',
    name: 'Oye Hoye!',
    phrase: 'Oye Hoye Swaad Aa Gaya! 🔥',
    type: 'oyehoye',
    icon: '🔥',
    description: 'Punjabi roadside flavor exclamation',
  },
  {
    id: 'shout-3',
    name: 'Chak De!',
    phrase: 'Chak De Phatte! 💪',
    type: 'chakde',
    icon: '⚡',
    description: 'Highway motivation cheer',
  },
  {
    id: 'shout-4',
    name: 'Dhaba Tea Stall Ambience',
    phrase: 'Karak Chai Clink ☕',
    type: 'dhaba',
    icon: '🫖',
    description: 'Roadside dhaba kettle & chai glass clink',
  },
];

export function useDesiHorn() {
  const [activeHorn, setActiveHorn] = useState<DesiHornItem>(DESI_HORNS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playClassicMusicalHorn = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const notes = [
      { f1: 392, f2: 493.88, start: 0, duration: 0.15 },
      { f1: 440, f2: 554.37, start: 0.18, duration: 0.15 },
      { f1: 523.25, f2: 659.25, start: 0.36, duration: 0.22 },
      { f1: 587.33, f2: 739.99, start: 0.62, duration: 0.45 },
    ];

    notes.forEach((note) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(note.f1, now + note.start);
      osc2.frequency.setValueAtTime(note.f2, now + note.start);

      gain.gain.setValueAtTime(0, now + note.start);
      gain.gain.linearRampToValueAtTime(0.28, now + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + note.start);
      osc2.start(now + note.start);
      osc1.stop(now + note.start + note.duration);
      osc2.stop(now + note.start + note.duration);
    });
  };

  const playAirHorn = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(220, now);
    osc2.frequency.setValueAtTime(277.18, now);

    osc1.frequency.exponentialRampToValueAtTime(205, now + 0.6);
    osc2.frequency.exponentialRampToValueAtTime(258, now + 0.6);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.65);
  };

  const playTripleTonePressureHorn = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const notes = [
      { f1: 523.25, f2: 659.25, start: 0, duration: 0.12 },
      { f1: 587.33, f2: 739.99, start: 0.14, duration: 0.12 },
      { f1: 659.25, f2: 830.61, start: 0.28, duration: 0.12 },
      { f1: 523.25, f2: 659.25, start: 0.42, duration: 0.12 },
      { f1: 659.25, f2: 830.61, start: 0.56, duration: 0.18 },
      { f1: 783.99, f2: 987.77, start: 0.76, duration: 0.4 },
    ];

    notes.forEach((note) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(note.f1, now + note.start);
      osc2.frequency.setValueAtTime(note.f2, now + note.start);

      gain.gain.setValueAtTime(0, now + note.start);
      gain.gain.linearRampToValueAtTime(0.3, now + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + note.start);
      osc2.start(now + note.start);
      osc1.stop(now + note.start + note.duration);
      osc2.stop(now + note.start + note.duration);
    });
  };

  const playDhabaSound = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1800, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2400, now + 0.15);
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  };

  const speakPhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = phrase.replace(/[^\w\s!]/gi, '');
      if (cleanText.trim().length === 0) return;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = 1.1;
      utterance.rate = 1.05;
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang.includes('hi') || v.lang.includes('en-IN') || v.name.includes('India')
      );
      if (indianVoice) {
        utterance.voice = indianVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const playHornSound = useCallback((target: DesiHornItem) => {
    setActiveHorn(target);
    setIsPlaying(true);

    try {
      const ctx = getAudioContext();
      if (target.id === 'horn-1') {
        playClassicMusicalHorn(ctx);
      } else if (target.id === 'horn-2') {
        playAirHorn(ctx);
      } else if (target.id === 'horn-3') {
        playTripleTonePressureHorn(ctx);
      } else if (target.type === 'dhaba') {
        playDhabaSound(ctx);
      } else {
        const randChoice = Math.floor(Math.random() * 3);
        if (randChoice === 0) playClassicMusicalHorn(ctx);
        else if (randChoice === 1) playAirHorn(ctx);
        else playTripleTonePressureHorn(ctx);

        speakPhrase(target.phrase);
      }
    } catch (e) {
      console.warn('Horn audio play error:', e);
      speakPhrase(target.phrase);
    }

    setTimeout(() => {
      setIsPlaying(false);
    }, 1200);
  }, []);

  const playRandomHorn = useCallback(() => {
    const hornVariants = DESI_HORNS.filter((h) => h.type === 'horn' || h.type === 'airhorn');
    const randomIndex = Math.floor(Math.random() * hornVariants.length);
    const chosen = hornVariants[randomIndex];
    playHornSound(chosen);
  }, [playHornSound]);

  return {
    horns: DESI_HORNS,
    activeHorn,
    isPlaying,
    playHornSound,
    playRandomHorn,
  };
}
