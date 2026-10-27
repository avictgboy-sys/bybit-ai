import React, { useState, useEffect } from 'react';
import {
  Send,
  Download,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Copy,
  Trash2,
  Check,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  Eye,
  Settings,
  BellRing,
  HelpCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  TradeJournalService,
  JournalRecord,
  JournalStats,
  JournalStatus,
} from '../../services/aiCouncilPro/tradeJournalService';
import {
  TelegramAlertService,
  CouncilTelegramConfig,
} from '../../services/aiCouncilPro/telegramAlertService';
import { formatPrice } from '../../utils/formatters';

interface TelegramAndJournalHubProps {
  onSelectCoinForCouncil?: (symbol: string) => void;
}

export const TelegramAndJournalHub: React.FC<TelegramAndJournalHubProps> = ({
  onSelectCoinForCouncil,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'JOURNAL' | 'TELEGRAM'>('JOURNAL');

  // Journal State
  const [records, setRecords] = useState<JournalRecord[]>(() => TradeJournalService.getRecords());
  const [stats, setStats] = useState<JournalStats>(() => TradeJournalService.getStats());
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'WON' | 'LOST'>('ALL');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Close Trade Modal State
  const [closingRecord, setClosingRecord] = useState<JournalRecord | null>(null);
  const [closeOutcome, setCloseOutcome] = useState<JournalStatus>('TP1_HIT');
  const [closeExitPrice, setCloseExitPrice] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState<string>('');

  // Telegram State
  const [tgConfig, setTgConfig] = useState<CouncilTelegramConfig>(() =>
    TelegramAlertService.getConfig()
  );
  const [tgTesting, setTgTesting] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [tgSavedSuccess, setTgSavedSuccess] = useState(false);

  const refreshJournal = () => {
    const updated = TradeJournalService.getRecords();
    setRecords(updated);
    setStats(TradeJournalService.getStats());
  };

  const handleSaveTelegram = () => {
    TelegramAlertService.saveConfig(tgConfig);
    setTgSavedSuccess(true);
    setTimeout(() => setTgSavedSuccess(false), 3000);
  };

  const handleTestTelegram = async () => {
    setTgTesting(true);
    setTgTestResult(null);
    const res = await TelegramAlertService.sendTestMessage(tgConfig.botToken, tgConfig.chatId);
    setTgTesting(false);
    if (res.success) {
      setTgTestResult({
        success: true,
        message: res.simulated
          ? 'টেস্ট মেসেজ সিমুলেটেড সফল (Demo mode active)'
          : 'টেলিগ্রাম চ্যানেলে টেস্ট পিং সফলভাবে পাঠানো হয়েছে!',
      });
    } else {
      setTgTestResult({
        success: false,
        message: res.error || 'টেস্ট মেসেজ পাঠাতে ব্যর্থ হয়েছে।',
      });
    }
  };

  const handleExecuteClose = () => {
    if (!closingRecord) return;
    const exitP = parseFloat(closeExitPrice) || closingRecord.entryPrice;
    TradeJournalService.closeTrade(closingRecord.id, closeOutcome, exitP, closeNotes);
    setClosingRecord(null);
    refreshJournal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি এই ট্রেড রেকর্ডটি মুছে ফেলতে চান?')) {
      TradeJournalService.deleteRecord(id);
      refreshJournal();
    }
  };

  const handleCopySummary = () => {
    const text = TradeJournalService.generateTextSummary();
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return r.status === 'ACTIVE';
    if (statusFilter === 'WON') return (r.realizedPnlUsd || 0) > 0 || r.status.includes('TP');
    if (statusFilter === 'LOST') return (r.realizedPnlUsd || 0) < 0 || r.status === 'SL_HIT';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Sub-Tab Switcher */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                ট্রেড জার্নাল ও টেলিগ্রাম অ্যালার্ট হাব
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                PRO AUTOMATION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              কাউন্সিল-অনুমোদিত ট্রেড হিস্ট্রি, পারফরম্যান্স মেট্রিক্স, CSV/JSON এক্সপোর্ট ও অটো টেলিগ্রাম অ্যালার্ট
            </p>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('JOURNAL')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeSubTab === 'JOURNAL'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ট্রেড জার্নাল ({records.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('TELEGRAM')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeSubTab === 'TELEGRAM'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>টেলিগ্রাম বট অ্যালার্ট</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: TRADE JOURNAL */}
      {activeSubTab === 'JOURNAL' && (
        <div className="space-y-6">
          {/* Performance Overview KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ট্রেড রেকর্ড</span>
              <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
                {stats.totalTrades}
              </div>
              <div className="text-[10px] text-indigo-400 font-mono">
                {stats.activeTrades} সক্রিয় ট্রেড
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>উইন রেট (Win Rate)</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                {stats.winRatePcnt}%
              </div>
              <div className="text-[10px] text-emerald-400/80 font-mono">
                {stats.wonTrades} জয় • {stats.lostTrades} পরাজয়
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">মোট রিয়েলাইজড PnL</span>
              <div
                className={`text-xl sm:text-2xl font-black font-mono ${
                  stats.totalPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {stats.totalPnlUsd >= 0 ? '+' : ''}${stats.totalPnlUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                গড় R:R: {stats.avgRiskReward}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">সর্বোচ্চ উইনিং ট্রেড</span>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                +${stats.bestTradeUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                ড্র-ডাউন শিল্ড সক্রিয়
              </div>
            </div>
          </div>

          {/* Action Row: Export CSV, Export JSON, Copy Summary, Filter Pills */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'ACTIVE', 'WON', 'LOST'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    statusFilter === filter
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'ALL'
                    ? 'সব ট্রেড'
                    : filter === 'ACTIVE'
                    ? 'সক্রিয় (Active)'
                    : filter === 'WON'
                    ? 'প্রফিট (Won)'
                    : 'স্টপ লস (Lost)'}
                </button>
              ))}
            </div>

            {/* Export & Tools */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => TradeJournalService.exportToCsv()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600/30 transition shadow"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => TradeJournalService.exportToJson()}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-600/30 transition shadow"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-700 transition"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? 'কপি হয়েছে!' : 'Copy Summary'}</span>
              </button>
            </div>
          </div>

          {/* Journal Entries List / Table */}
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-base font-bold text-slate-300">কোনো ট্রেড পাওয়া যায়নি</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ১২ সিনিয়র কাউন্সিল রুম থেকে যেকোনো সিগন্যালে "জার্নালে সংরক্ষণ" বোতাম চেপে সরাসরি এখানে রেকর্ড করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((trade) => {
                const isLong = trade.direction === 'LONG';
                const isWon = (trade.realizedPnlUsd || 0) > 0 || trade.status.includes('TP');
                const isLost = (trade.realizedPnlUsd || 0) < 0 || trade.status === 'SL_HIT';
                const isActive = trade.status === 'ACTIVE';

                return (
                  <div
                    key={trade.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-lg"
                  >
                    {/* Top Row: Symbol, Style, Consensus, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-black font-mono ${
                            isLong
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {trade.direction}
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-100 font-mono">
                          {trade.symbol}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400">
                          {trade.tradeStyle.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300">
                          {trade.consensusScorePcnt}% Consensus
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              : isWon
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {trade.status.replace('_', ' ')}
                        </span>

                        {trade.realizedPnlUsd !== undefined && (
                          <span
                            className={`text-sm font-black font-mono ${
                              trade.realizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {trade.realizedPnlUsd >= 0 ? '+' : ''}${trade.realizedPnlUsd.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Execution Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/60 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">এন্ট্রি প্রাইস</span>
                        <div className="font-mono font-bold text-slate-200">
                          ${formatPrice(trade.entryPrice)}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-rose-400 uppercase font-bold">স্টপ লস (SL)</span>
                        <div className="font-mono font-bold text-rose-300">
                          ${formatPrice(trade.stopLoss)}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">টার্গেট ১ (TP1)</span>
                        <div className="font-mono font-bold text-emerald-300">
                          ${formatPrice(trade.takeProfit1)}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">পজিশন সাইজ / মার্জিন</span>
                        <div className="font-mono font-bold text-indigo-300">
                          ${trade.positionSizeUsd.toFixed(0)} (${trade.marginUsd.toFixed(0)})
                        </div>
                      </div>
                    </div>

                    {/* Notes & Actions Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/40">
                      <p className="text-[11px] text-slate-400 italic">
                        "{trade.reviewNotesBn || 'কাউন্সিল সিগন্যাল অনুসরণ করে গৃহীত ট্রেড।'}"
                      </p>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setClosingRecord(trade);
                              setCloseExitPrice(trade.takeProfit1.toString());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold transition border border-indigo-500/30"
                          >
                            ট্রেড ক্লোজ করুন
                          </button>
                        )}

                        {onSelectCoinForCouncil && (
                          <button
                            type="button"
                            onClick={() => onSelectCoinForCouncil(trade.symbol)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition"
                            title="কাউন্সিল রুমে দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Council</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(trade.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Close Trade Modal */}
          {closingRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-100">
                    ট্রেড ক্লোজ করুন: {closingRecord.symbol}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setClosingRecord(null)}
                    className="text-slate-400 hover:text-slate-200 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">ফলাফল (Outcome)</label>
                    <select
                      value={closeOutcome}
                      onChange={(e) => setCloseOutcome(e.target.value as JournalStatus)}
                      className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-bold"
                    >
                      <option value="TP1_HIT">TP1 HIT (টার্গেট ১ স্পর্শ)</option>
                      <option value="TP2_HIT">TP2 HIT (টার্গেট ২ স্পর্শ)</option>
                      <option value="TP3_HIT">TP3 HIT (টার্গেট ৩ স্পর্শ)</option>
                      <option value="SL_HIT">SL HIT (স্টপ লস ট্রিগার)</option>
                      <option value="CLOSED_MANUAL">CLOSED MANUAL (ম্যানুয়াল এক্সিট)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">এক্সিট প্রাইস (Exit Price)</label>
                    <input
                      type="number"
                      value={closeExitPrice}
                      onChange={(e) => setCloseExitPrice(e.target.value)}
                      placeholder="Exit price"
                      className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">রিভিউ নোট (Learnings / Notes)</label>
                    <textarea
                      value={closeNotes}
                      onChange={(e) => setCloseNotes(e.target.value)}
                      placeholder="ট্রেড কেমন চলল? কোনো ভুল বা ভালো ডিসিশন?"
                      rows={2}
                      className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setClosingRecord(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteClose}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB CONTENT: TELEGRAM BOT CONFIGURATION & DISPATCHER */}
      {activeSubTab === 'TELEGRAM' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-100">
                  টেলিগ্রাম বট ও ইনস্ট্যান্ট অ্যালার্ট ইন্টিগ্রেশন
                </h3>
                <p className="text-[11px] text-slate-400">
                  ১২ সিনিয়র কাউন্সিলের স্ট্রং বাই ও প্রাতিষ্ঠানিক রায় সরাসরি আপনার টেলিগ্রাম চ্যানেল বা গ্রুপে অটো-ফরওয়ার্ড করুন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">টেলিগ্রাম অটো অ্যালার্ট:</span>
              <button
                type="button"
                onClick={() => setTgConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  tgConfig.enabled ? 'bg-sky-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                    tgConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>টেলিগ্রাম বট টোকেন (Telegram Bot Token)</span>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>@BotFather এ যান</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                value={tgConfig.botToken}
                onChange={(e) => setTgConfig((prev) => ({ ...prev, botToken: e.target.value }))}
                placeholder="उदा: 7829104812:AAEVk9_ExampleToken..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:border-sky-500 focus:outline-none transition"
              />
              <p className="text-[10px] text-slate-500">
                টেলিগ্রাম @BotFather থেকে <code>/newbot</code> কমান্ড দিয়ে আপনার নিজস্ব বট তৈরি করুন।
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>চ্যাট আইডি বা চ্যানেল ইউজারনেম (Chat ID / Channel)</span>
                <span className="text-[10px] text-slate-500">@ChannelName or 12345678</span>
              </label>
              <input
                type="text"
                value={tgConfig.chatId}
                onChange={(e) => setTgConfig((prev) => ({ ...prev, chatId: e.target.value }))}
                placeholder="उदा: @MyTradingChannel বা -10012345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:border-sky-500 focus:outline-none transition"
              />
              <p className="text-[10px] text-slate-500">
                বটটিকে চ্যানেলে অ্যাডমিন হিসেবে অ্যাড করুন যাতে এটি মেসেজ পাঠাতে পারে।
              </p>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">অটো-সেন্ড স্ট্রং বাই (Strong Buy)</label>
              <p className="text-[10px] text-slate-500">কাউন্সিল স্ট্রং বাই রায় দিলে তাৎক্ষণিক অ্যালার্ট</p>
              <input
                type="checkbox"
                checked={tgConfig.autoSendStrongBuy}
                onChange={(e) => setTgConfig((prev) => ({ ...prev, autoSendStrongBuy: e.target.checked }))}
                className="w-4 h-4 rounded text-sky-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">অটো-সেন্ড স্ট্রং সেল (Strong Sell)</label>
              <p className="text-[10px] text-slate-500">বিপদজনক ডাউনট্রেন্ড বা শর্ট কল স্বয়ংক্রিয়ভাবে জানানো</p>
              <input
                type="checkbox"
                checked={tgConfig.autoSendStrongSell}
                onChange={(e) => setTgConfig((prev) => ({ ...prev, autoSendStrongSell: e.target.checked }))}
                className="w-4 h-4 rounded text-sky-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">ন্যূনতম কনসেনসাস স্কোর (% Threshold)</label>
              <div className="flex items-center gap-2 pt-1">
                {[75, 80, 85, 90].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setTgConfig((prev) => ({ ...prev, minConsensusPcnt: score }))}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      tgConfig.minConsensusPcnt === score
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {score}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons: Save & Test */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveTelegram}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black transition shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>কনফিগারেশন সেভ করুন</span>
              </button>

              <button
                type="button"
                disabled={tgTesting}
                onClick={handleTestTelegram}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${tgTesting ? 'animate-spin' : ''}`} />
                <span>{tgTesting ? 'টেস্ট চলছে...' : 'টেস্ট পিং পাঠান (Test Ping)'}</span>
              </button>
            </div>

            {tgSavedSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>টেলিগ্রাম সেটিংস সংরক্ষিত হয়েছে!</span>
              </span>
            )}

            {tgTestResult && (
              <span
                className={`text-xs font-bold flex items-center gap-1 ${
                  tgTestResult.success ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {tgTestResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{tgTestResult.message}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
