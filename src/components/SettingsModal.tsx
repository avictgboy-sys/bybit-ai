import React from 'react';
import { X, Settings, Shield, Moon, Sun, Volume2, Globe, RefreshCw, Trash2, Send, Zap, Key } from 'lucide-react';
import { AppSettings } from '../types';
import { TelegramService } from '../services/telegramService';
import { BybitTradingService } from '../services/bybitTradingService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearCache: () => void;
  onOpenTelegramWebhook?: () => void;
  onOpenBybitConfig?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearCache,
  onOpenTelegramWebhook,
  onOpenBybitConfig,
}) => {
  if (!isOpen) return null;

  const isTelegramConfigured = TelegramService.isConfigured();
  const isBybitConfigured = BybitTradingService.isConfigured();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              System Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Telegram Webhook Quick Access */}
          {onOpenTelegramWebhook && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="font-bold text-slate-100 block">Telegram Webhook System</span>
                  <span className="text-[10px] text-slate-400">
                    {isTelegramConfigured
                      ? '🟢 Connected to Telegram Channel'
                      : '⚪ Webhook Not Configured'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTelegramWebhook();
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs transition-all"
              >
                {isTelegramConfigured ? 'কনফিগার' : 'সেটআপ করুন'}
              </button>
            </div>
          )}

          {/* Bybit API Bot Setup */}
          {onOpenBybitConfig && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold text-slate-100 block">Bybit V5 Trade Bot</span>
                  <span className="text-[10px] text-slate-400">
                    {isBybitConfigured
                      ? '🟢 API Key সংযুক্ত ও প্রস্তুত'
                      : '⚪ API Key যুক্ত করা হয়নি'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBybitConfig();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all"
              >
                {isBybitConfigured ? 'ম্যানেজ করুন' : 'সেটআপ করুন'}
              </button>
            </div>
          )}

          {/* Theme Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              {settings.theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span className="font-semibold text-slate-200">Theme Atmosphere</span>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  settings.theme === 'light'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          {/* Auto Refresh Interval */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Auto Refresh Rate</span>
            </div>
            <select
              value={settings.refreshIntervalMs}
              onChange={(e) =>
                onUpdateSettings({ refreshIntervalMs: Number(e.target.value) })
              }
              className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
            >
              <option value={5000}>5 Seconds</option>
              <option value={15000}>15 Seconds</option>
              <option value={30000}>30 Seconds</option>
              <option value={0}>Manual Only</option>
            </select>
          </div>

          {/* Capital Protection Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-slate-200 block">
                  Capital Protection Priority
                </span>
                <span className="text-[10px] text-slate-500">
                  Filters high risk liquidations
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.capitalProtectionMode}
              onChange={(e) =>
                onUpdateSettings({ capitalProtectionMode: e.target.checked })
              }
              className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Audio Alerts</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundAlerts}
              onChange={(e) => onUpdateSettings({ soundAlerts: e.target.checked })}
              className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Language</span>
            </div>
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ language: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs focus:outline-none"
            >
              <option value="en">English (US)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="es">Español</option>
              <option value="zh">中文 (Mandarin)</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {/* Clear Offline Cache */}
          <button
            onClick={onClearCache}
            className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Offline Data Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
};
