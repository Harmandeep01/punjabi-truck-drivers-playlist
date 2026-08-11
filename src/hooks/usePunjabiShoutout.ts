import { useState, useCallback, useRef } from 'react';
import { ShoutoutItem } from '../types';

export const PUNJABI_SHOUTOUTS: ShoutoutItem[] = [
  {
    id: 'shout-1',
    title: 'Balle Balle!',
    phrase: 'Balle Balle! 💃',
    type: 'balle',
    icon: '🎉',
    description: 'High-energy celebration chant & dhol beat',
  },
  {
    id: 'shout-2',
    title: 'Truck Air Horn',
    phrase: 'Poo-Poo-Poo-Poo! 🚛',
    type: 'airhorn',
    icon: '🎺',
    description: 'Loud GT Road highway freight horn',
  },
  {
    id: 'shout-3',
    title: 'Oye Hoye!',
    phrase: 'Oye Hoye Swaad Aa Gaya! 🔥',
    type: 'oyehoye',
    icon: '🔥',
    description: 'Punjabi joy & flavor exclamation',
  },
  {
    id: 'shout-4',
    title: 'Musical Truck Horn',
    phrase: 'Horn OK Please 🎶',
    type: 'horn',
    icon: '🚚',
    description: 'Classic double-tone Punjabi musical horn',
  },
  {
    id: 'shout-5',
    title: 'Chak De!',
    phrase: 'Chak De Phatte Nap De Killi! 💪',
    type: 'chakde',
    icon: '⚡',
    description: 'Highway motivation shoutout',
  },
  {
    id: 'shout-6',
    title: 'Ki Haal Aa?',
    phrase: 'Ki Haal Aa Veera? ☕',
    type: 'kihaal',
    icon: '👋',
    description: 'Friendly Punjabi driver greeting',
  },
  {
    id: 'shout-7',
    title: 'Dhaba Tea Ambience',
    phrase: 'Karak Chai & Highway Breeze ☕',
    type: 'dhaba',
    icon: '🫖',
    description: 'Roadside dhaba tea stall kettle sound',
  },
];

export function usePunjabiShoutout() {
  const [activeShoutout, setActiveShoutout] = useState<ShoutoutItem>(PUNJABI_SHOUTOUTS[0]);
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

  // 1. Classic Punjabi Musical Horn ("Horn OK Please")
  const playMusicalTruckHorn = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    
    // Frequencies for iconic Indian truck horn rhythm: G4 -> C5 -> E5 -> G5
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
      gain.gain.linearRampToValueAtTime(0.25, now + note.start + 0.02);
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

  // 2. Highway Air Horn Blast
  const playAirHorn = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    // Blaring brassy train/truck air horn frequencies
    osc1.frequency.setValueAtTime(220, now); // A3
    osc2.frequency.setValueAtTime(277.18, now); // C#4

    // Short pitch drop bend
    osc1.frequency.exponentialRampToValueAtTime(200, now + 0.6);
    osc2.frequency.exponentialRampToValueAtTime(255, now + 0.6);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
  };

  // 3. Dhaba Kettle & Cup Clinking
  const playDhabaSound = (ctx: AudioContext) => {
    const now = ctx.currentTime;

    // High metal clink 1
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

    // High metal clink 2
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

  // 4. Voice Callout using Web Speech API or vocal synth accent
  const speakPhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase.replace(/[^\w\s!]/gi, ''));
      utterance.pitch = 1.1;
      utterance.rate = 1.05;
      utterance.volume = 1.0;

      // Try finding Hindi / Indian English voices
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

  // Trigger sound effect
  const triggerShoutout = useCallback((shoutoutItem?: ShoutoutItem) => {
    const target = shoutoutItem || activeShoutout;
    setActiveShoutout(target);
    setIsPlaying(true);

    try {
      const ctx = getAudioContext();

      switch (target.type) {
        case 'horn':
          playMusicalTruckHorn(ctx);
          speakPhrase(target.phrase);
          break;
        case 'airhorn':
          playAirHorn(ctx);
          speakPhrase(target.phrase);
          break;
        case 'dhaba':
          playDhabaSound(ctx);
          speakPhrase(target.phrase);
          break;
        case 'balle':
        case 'oyehoye':
        case 'chakde':
        case 'kihaal':
        default:
          playMusicalTruckHorn(ctx);
          speakPhrase(target.phrase);
          break;
      }
    } catch (e) {
      console.warn('Audio synth failed:', e);
      speakPhrase(target.phrase);
    }

    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  }, [activeShoutout]);

  const selectRandomShoutout = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * PUNJABI_SHOUTOUTS.length);
    const chosen = PUNJABI_SHOUTOUTS[randomIndex];
    triggerShoutout(chosen);
  }, [triggerShoutout]);

  return {
    shoutouts: PUNJABI_SHOUTOUTS,
    activeShoutout,
    setActiveShoutout,
    isPlaying,
    triggerShoutout,
    selectRandomShoutout,
  };
}
