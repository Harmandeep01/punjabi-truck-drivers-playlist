import React, { useState } from 'react';
import { Volume2, Sparkles, Truck, ChevronDown } from 'lucide-react';
import { DesiHornItem } from '../types';

interface DesiHornWidgetProps {
  horns: DesiHornItem[];
  activeHorn: DesiHornItem;
  isPlaying: boolean;
  onPlaySound: (horn: DesiHornItem) => void;
  onPlayRandom: () => void;
}

export const DesiHornWidget: React.FC<DesiHornWidgetProps> = ({
  horns,
  activeHorn,
  isPlaying,
  onPlaySound,
  onPlayRandom,
}) => {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div aria-label="Desi Truck Horn Widget" className="relative z-30 flex flex-col items-center select-none">
      <div className="relative group bg-gradient-to-r from-[#282116] via-[#1f1910] to-[#282116] text-[#fff8ea] border border-[#ffb300]/40 p-3 sm:p-4 rounded-2xl shadow-retro-glow transition-all duration-300 backdrop-blur-md">
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#ffb300]/70" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#ffb300]/70" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#ffb300]/70" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#ffb300]/70" />

        <div className="flex items-center justify-between gap-3 border-b border-[#ffb300]/20 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#ffb300] animate-pulse" />
            <span className="font-poppins text-xs font-bold uppercase tracking-widest text-[#ffb300]">
              Desi Highway Pressure Horns
            </span>
          </div>

          <button
            onClick={() => setShowSelector(!showSelector)}
            className="font-poppins text-[10px] uppercase font-bold bg-[#3a2d1a] text-[#ffb300] px-2.5 py-1 rounded-lg border border-[#ffb300]/30 hover:border-[#ffb300] transition-all flex items-center gap-1 cursor-pointer"
            title="Select Horn Variant"
          >
            <span>Horns & Sounds</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-[#141009] text-[#fff8ea] border border-[#ffb300]/30 px-3.5 py-2 rounded-xl flex-1 min-w-[170px] sm:min-w-[220px] text-center">
            <div className="font-poppins font-extrabold text-sm sm:text-base text-[#ffd54f] truncate">
              {activeHorn.phrase}
            </div>
            <div className="font-serif-body italic text-[11px] text-[#d1c2a5] truncate mt-0.5">
              {activeHorn.description}
            </div>
          </div>

          <button
            onClick={onPlayRandom}
            disabled={isPlaying}
            aria-label="Honk Desi Truck Horn"
            className={`px-4 py-2.5 font-poppins font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl border border-[#ffb300] flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isPlaying
                ? 'bg-[#388e3c] text-white scale-95'
                : 'bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] text-white hover:from-[#e53935] hover:to-[#c62828] active:scale-95'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>{isPlaying ? 'Honking!' : 'Honk Horn 🔊'}</span>
          </button>

          <button
            onClick={onPlayRandom}
            aria-label="Play random desi horn"
            className="p-2.5 bg-[#d95d26] text-white rounded-xl border border-[#ffb300]/40 hover:bg-[#e66a32] active:scale-95 transition-all shadow-md cursor-pointer"
            title="Play Random Pressure Horn"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {showSelector && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#18130b] text-[#fff8ea] border border-[#ffb300]/40 p-2.5 rounded-2xl shadow-2xl z-50 grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto">
            <div className="font-poppins text-[10px] uppercase text-[#ffb300] font-bold px-1.5 pb-1 border-b border-[#3a2e1d]">
              Select Authentic Desi Pressure Horn / Sound:
            </div>
            {horns.map((item) => {
              const isSelected = item.id === activeHorn.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPlaySound(item);
                    setShowSelector(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-poppins font-bold rounded-xl flex items-center justify-between border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#d32f2f] text-white border-[#ffb300]'
                      : 'bg-[#241d13] text-[#e0d3ba] border-[#3a2e1d] hover:bg-[#332a1b] hover:border-[#ffb300]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{item.icon}</span>
                    <span className="truncate">{item.name} ({item.phrase})</span>
                  </div>
                  <span className="text-[10px] opacity-80 uppercase tracking-tight ml-2 font-mono">
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
