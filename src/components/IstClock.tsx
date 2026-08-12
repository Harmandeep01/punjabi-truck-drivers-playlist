import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const IstClock: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const formatted = timeFormatter.format(now).toUpperCase();
      setTimeString(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-xs font-poppins font-medium shadow-lg select-none">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Clock className="w-3.5 h-3.5 text-amber-400" />
      <span className="font-semibold tracking-wide text-amber-200">{timeString || 'Loading...'}</span>
      <span className="text-[10px] text-white/50 border-l border-white/20 pl-1.5 font-semibold tracking-widest uppercase">IST</span>
    </div>
  );
};
