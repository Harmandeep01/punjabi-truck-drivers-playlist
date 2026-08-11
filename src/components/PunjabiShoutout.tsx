import React, { useState } from 'react';
import { Volume2, Sparkles, Truck, Music, Radio, ChevronDown } from 'lucide-react';
import { ShoutoutItem } from '../types';

interface PunjabiShoutoutProps {
  shoutouts: ShoutoutItem[];
  activeShoutout: ShoutoutItem;
  isPlaying: boolean;
  onTrigger: (item?: ShoutoutItem) => void;
  onSelectRandom: () => void;
}

export const PunjabiShoutout: React.FC<PunjabiShoutoutProps> = ({
  shoutouts,
  activeShoutout,
  isPlaying,
  onTrigger,
  onSelectRandom,
}) => {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div aria-label="Punjabi Truck Shoutout Widget" className="relative z-20 flex flex-col items-center">
      {/* Truck Signpost Plate */}
      <div className="relative group bg-[#F2B705] text-[#1A1A1B] border-3 border-[#1A1A1B] p-2.5 sm:p-3 shadow-block-red transition-all duration-200">
        {/* Brass corner rivet accents */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#1A1A1B]" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#1A1A1B]" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-[#1A1A1B]" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#1A1A1B]" />

        {/* Header label */}
        <div className="flex items-center justify-between gap-2 border-b-2 border-[#1A1A1B] pb-1 mb-2">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#900314] animate-bounce" />
            <span className="font-archivo text-xs uppercase tracking-widest font-extrabold text-[#900314]">
              Punjabi Truck Shoutout
            </span>
          </div>

          <button
            onClick={() => setShowSelector(!showSelector)}
            className="font-archivo text-[10px] uppercase font-bold bg-[#900314] text-[#fff9ed] px-2 py-0.5 border border-[#1A1A1B] hover:bg-[#b32428] flex items-center gap-1 cursor-pointer"
            title="Choose shoutout sound"
          >
            <span>Sounds</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Current Phrase Banner & Big Trigger Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Phrase Display */}
          <div className="bg-[#fff9ed] text-[#1A1A1B] border-2 border-[#1A1A1B] px-3 py-1.5 flex-1 min-w-[160px] sm:min-w-[210px] text-center">
            <div className="font-anybody font-extrabold text-sm sm:text-base text-[#900314] truncate">
              {activeShoutout.phrase}
            </div>
            <div className="font-archivo text-[10px] font-semibold text-[#5a403e] truncate">
              {activeShoutout.description}
            </div>
          </div>

          {/* Big Play Sound Button */}
          <button
            onClick={() => onTrigger(activeShoutout)}
            disabled={isPlaying}
            aria-label={`Play ${activeShoutout.title} sound effect`}
            className={`px-3.5 py-2 font-archivo font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-[#1A1A1B] flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#2d4b47] text-[#fff9ed] scale-95'
                : 'bg-[#900314] text-[#fff9ed] hover:bg-[#b32428] active:translate-y-0.5 shadow-block-black'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>{isPlaying ? 'Horn!' : 'Play 🔊'}</span>
          </button>

          {/* Random Roll Button */}
          <button
            onClick={onSelectRandom}
            aria-label="Play random Punjabi shoutout sound"
            className="p-2 bg-[#D95D26] text-[#fff9ed] border-2 border-[#1A1A1B] hover:bg-[#b32428] active:translate-y-0.5 transition-all shadow-block-black cursor-pointer"
            title="Random Shoutout"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown Options Drawer */}
        {showSelector && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1B] text-[#fff9ed] border-2 border-[#F2B705] p-2 shadow-2xl z-50 grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto">
            <div className="font-archivo text-[10px] uppercase text-[#F2B705] font-bold px-1 pb-1 border-b border-[#3D3D42]">
              Select Roadside Shoutout Sound:
            </div>
            {shoutouts.map((item) => {
              const isSelected = item.id === activeShoutout.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTrigger(item);
                    setShowSelector(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-archivo font-bold flex items-center justify-between border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#900314] text-[#fff9ed] border-[#F2B705]'
                      : 'bg-[#292518] text-[#ebe2c8] border-[#3D3D42] hover:bg-[#3d3824] hover:border-[#F2B705]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{item.icon}</span>
                    <span className="truncate">{item.phrase}</span>
                  </div>
                  <span className="text-[10px] opacity-80 uppercase tracking-tight ml-2">
                    {item.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
