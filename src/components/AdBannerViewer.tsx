import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles, Megaphone, Shield } from 'lucide-react';
import { AuthService, AdminSystemConfig, UserAccount } from '../services/authService';

interface AdBannerViewerProps {
  currentUser?: UserAccount | null;
  position?: 'top' | 'middle' | 'bottom' | 'card';
  onWatchAdClick?: () => void;
}

export const AdBannerViewer: React.FC<AdBannerViewerProps> = ({
  currentUser,
  position = 'middle',
  onWatchAdClick,
}) => {
  const config = AuthService.getSystemConfig();
  const aadsRef = useRef<HTMLDivElement>(null);

  // If monetization disabled, or user is admin or VIP -> hide ads
  if (!config.monetizationEnabled || currentUser?.role === 'admin' || currentUser?.isVip) {
    return null;
  }

  // Render Custom Banner or Network Code
  return (
    <div className="w-full my-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-2.5 sm:p-3 shadow-lg relative overflow-hidden group">
      {/* Decorative top-right badge */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-slate-400">
          <Megaphone className="w-3 h-3 text-amber-400" />
          <span>ক্রিপ্টো স্পন্সর ও অ্যাড জোন</span>
        </div>

        {onWatchAdClick && (
          <button
            type="button"
            onClick={onWatchAdClick}
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-3 h-3" />
            <span>অ্যাড দেখে পয়েন্ট নিন (+{config.pointsRewardPerAd || 10} pts)</span>
          </button>
        )}
      </div>

      {/* Main Banner Visual */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <img
            src={config.customBannerImgUrl || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&auto=format&fit=crop&q=80'}
            alt="Crypto Partner Banner"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              {config.activeAdNetwork === 'aads' ? 'A-ADS Network' : config.activeAdNetwork === 'coinzilla' ? 'Coinzilla Crypto Ad' : 'Bybit Certified Partner'}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 line-clamp-2">
              {config.customBannerText || '🔥 Bybit VIP ট্রেডিং সাইন-আপ বোনাস $30,000 পর্যন্ত জিতে নিন!'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <a
            href={config.customBannerLink || 'https://partner.bybit.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
          >
            <span>এখনই ক্লেইম করুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
