import React, { useState } from 'react';
import { Truck, ListMusic, Eye, EyeOff, Keyboard, HelpCircle, X, ShieldAlert } from 'lucide-react';

interface SignpostHeaderProps {
  currentTrackTitle?: string;
  totalTracks: number;
  pureViewMode: boolean;
  onTogglePureView: () => void;
  onToggleQueue: () => void;
  showQueue: boolean;
}

export const SignpostHeader: React.FC<SignpostHeaderProps> = ({
  currentTrackTitle,
  totalTracks,
  pureViewMode,
  onTogglePureView,
  onToggleQueue,
  showQueue,
}) => {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  return (
    <header className="relative z-30 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 select-none">
      {/* Top Truck Rail Container */}
      <div className="bg-[#900314] text-[#fff9ed] border-3 border-[#1A1A1B] p-2 sm:p-3 shadow-block-black flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 bg-[#F2B705] text-[#1A1A1B] border-2 border-[#1A1A1B] shadow-sm shrink-0">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <h1 className="font-anybody font-black text-sm sm:text-xl text-[#fff9ed] tracking-tight uppercase truncate flex items-center gap-2">
              <span>PUNJABI TRUCKERS</span>
              <span className="hidden md:inline bg-[#D95D26] text-[#fff9ed] text-[10px] font-archivo font-extrabold px-2 py-0.5 border border-[#1A1A1B]">
                GT ROAD PLAYER
              </span>
            </h1>
            <p className="font-archivo text-[10px] sm:text-xs text-[#ffcac6] truncate tracking-wider">
              HORN OK PLEASE • {totalTracks} HIGHWAY CLASSICS
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Queue Drawer Toggle */}
          <button
            onClick={onToggleQueue}
            className={`px-2.5 sm:px-3 py-1.5 font-archivo font-bold text-xs uppercase border-2 border-[#1A1A1B] flex items-center gap-1.5 transition-all cursor-pointer ${
              showQueue
                ? 'bg-[#F2B705] text-[#1A1A1B] shadow-block-black'
                : 'bg-[#1A1A1B] text-[#fff9ed] hover:bg-[#2d2918] hover:border-[#F2B705]'
            }`}
            title="Toggle Track Queue"
          >
            <ListMusic className="w-4 h-4" />
            <span className="hidden sm:inline">Queue</span>
          </button>

          {/* Pure Artwork View Toggle */}
          <button
            onClick={onTogglePureView}
            className="px-2.5 sm:px-3 py-1.5 bg-[#D95D26] text-[#fff9ed] font-archivo font-bold text-xs uppercase border-2 border-[#1A1A1B] hover:bg-[#b32428] active:translate-y-0.5 transition-all shadow-block-black flex items-center gap-1.5 cursor-pointer"
            title="Toggle Pure View Artwork Mode"
          >
            {pureViewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden md:inline">Pure View</span>
          </button>

          {/* Keyboard Shortcuts Info Button */}
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-1.5 bg-[#1A1A1B] text-[#F2B705] border-2 border-[#1A1A1B] hover:border-[#F2B705] cursor-pointer"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-3 border-[#F2B705] p-5 sm:p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="absolute top-3 right-3 p-1 bg-[#900314] text-white border border-[#1A1A1B] hover:bg-[#b32428] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-anybody font-extrabold text-lg text-[#F2B705] mb-1 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Driver Controls
            </h3>
            <p className="font-archivo text-xs text-[#e2dabf] mb-4">
              Control your Punjabi road-trip music stream with these hotkeys:
            </p>

            <div className="grid grid-cols-2 gap-2 font-archivo text-xs">
              <div className="bg-[#1A1A1B] p-2 border border-[#5a403e] flex items-center justify-between">
                <span>Space</span>
                <span className="font-bold text-[#F2B705]">Play / Pause</span>
              </div>
              <div className="bg-[#1A1A1B] p-2 border border-[#5a403e] flex items-center justify-between">
                <span>Left / Right</span>
                <span className="font-bold text-[#F2B705]">Seek ±5s</span>
              </div>
              <div className="bg-[#1A1A1B] p-2 border border-[#5a403e] flex items-center justify-between">
                <span>Up / Down</span>
                <span className="font-bold text-[#F2B705]">Volume ±10%</span>
              </div>
              <div className="bg-[#1A1A1B] p-2 border border-[#5a403e] flex items-center justify-between">
                <span>M</span>
                <span className="font-bold text-[#F2B705]">Mute / Unmute</span>
              </div>
              <div className="bg-[#1A1A1B] p-2 border border-[#5a403e] flex items-center justify-between">
                <span>N / P</span>
                <span className="font-bold text-[#F2B705]">Next / Prev</span>
              </div>
              <div className="bg-[#1A1A1B] p-2 border border-[#5a403e] flex items-center justify-between">
                <span>S / R</span>
                <span className="font-bold text-[#F2B705]">Shuffle / Repeat</span>
              </div>
            </div>

            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="mt-5 w-full py-2 bg-[#900314] text-[#fff9ed] font-archivo font-bold uppercase border-2 border-[#1A1A1B] shadow-block-mustard hover:bg-[#b32428] cursor-pointer"
            >
              Got It, Drive On!
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
