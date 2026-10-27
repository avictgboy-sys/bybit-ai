import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, enabled }) => {
  if (!enabled) return <>{children}</>;

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-950 py-4 sm:py-8 px-2 flex items-center justify-center font-sans antialiased">
      {/* Phone Outer Shell */}
      <div className="w-full max-w-[420px] h-[880px] bg-slate-900 rounded-[48px] p-3 border-4 border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden ring-1 ring-slate-700/50">
        {/* Camera Punchhole / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-40 flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-slate-900 rounded-full border border-slate-800" />
          <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Android Top Status Bar */}
        <div className="h-7 px-6 pt-1 text-[11px] font-semibold text-slate-300 flex items-center justify-between z-30 shrink-0 bg-slate-900 select-none">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* Smartphone Screen Viewport */}
        <div className="flex-1 overflow-y-auto bg-slate-950 rounded-[36px] custom-scrollbar flex flex-col relative">
          {children}
        </div>

        {/* Android Home Pill Indicator */}
        <div className="h-5 pt-2 flex items-center justify-center shrink-0 bg-slate-900 select-none">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
