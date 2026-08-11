import React from 'react';
import { Radio } from 'lucide-react';
import { ListenerStats } from '../hooks/useHeartbeat';

interface ListenersBadgeProps {
  stats: ListenerStats;
  isConnected: boolean;
}

export const ListenersBadge: React.FC<ListenersBadgeProps> = ({ stats, isConnected }) => {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-xs font-poppins shadow-lg select-none"
      title="Live Listeners Tuning In"
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-amber-400' : 'bg-red-500'
          }`}
        ></span>
      </span>
      <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span className="font-bold text-amber-200">{stats.displayCount}</span>
      <span className="text-[10px] text-white/60 font-medium">Listeners</span>
    </div>
  );
};
