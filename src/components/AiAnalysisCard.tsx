import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Send,
} from 'lucide-react';
import { AiAnalysisResult, TickerData } from '../types';
import { TelegramService } from '../services/telegramService';

interface AiAnalysisCardProps {
  aiResult: AiAnalysisResult;
  ticker: TickerData;
  onOpenBotSetup?: () => void;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  aiResult,
  ticker,
  onOpenBotSetup,
}) => {
  const [telegramStatus, setTelegramStatus] = useState<{ loading: boolean; success?: boolean; msg?: string } | null>(null);
  const [validitySeconds, setValiditySeconds] = useState<number>(45 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setValiditySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendToTelegram = async () => {
    setTelegramStatus({ loading: true });
    const res = await TelegramService.sendSignalAlert({
      symbol: ticker.symbol,
      signal: aiResult.signal,
      confidence: aiResult.confidence,
      lastPrice: ticker.lastPrice,
      expectedReturnMin: aiResult.expectedReturnMin,
      expectedReturnMax: aiResult.expectedReturnMax,
      riskScore: aiResult.riskScore,
      tpPrice: ticker.lastPrice * (aiResult.signal === 'LONG' ? 1.04 : 0.96),
      slPrice: ticker.lastPrice * (aiResult.signal === 'LONG' ? 0.98 : 1.02),
      summary: aiResult.summary,
    });

    if (res.success) {
      setTelegramStatus({ loading: false, success: true, msg: 'টেলিগ্রাম চ্যানেলে সংকেত পাঠানো হয়েছে! ✓' });
    } else {
      setTelegramStatus({ loading: false, success: false, msg: res.error || 'টেলিগ্রাম বটের টোকেন বা ইউজারনেম সেটিংসে সেটআপ করুন।' });
    }

    setTimeout(() => {
      setTelegramStatus(null);
    }, 4000);
  };
  const getSignalMeta = (finalSignal: string) => {
    switch (finalSignal) {
      case 'LONG':
        return {
          label: '🟢 LONG',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
          desc: 'Strong Bullish Confluence Confirmed',
        };
      case 'SHORT':
        return {
          label: '🔴 SHORT',
          bg: 'bg-red-500/15',
          border: 'border-red-500/40',
          text: 'text-red-400',
          icon: <TrendingDown className="w-6 h-6 text-red-400" />,
          desc: 'Strong Bearish Confluence Confirmed',
        };
      default:
        return {
          label: '⚪ NEUTRAL',
          bg: 'bg-slate-800/80',
          border: 'border-slate-700',
          text: 'text-slate-200',
          icon: <Clock className="w-6 h-6 text-amber-400" />,
          desc: 'Market State: RANGE / MIXED (Directional bias withheld to avoid conflict)',
        };
    }
  };

  const central = aiResult.centralDecision;
  const currentFinalSignal = aiResult.finalSignal || (aiResult.signal === 'LONG' ? 'LONG' : aiResult.signal === 'SHORT' ? 'SHORT' : 'NEUTRAL');
  const meta = getSignalMeta(currentFinalSignal);

  return (
    <div className="space-y-4">
      {/* Primary Recommendation Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border ${meta.bg} ${meta.border} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            {meta.icon}
          </div>
          <div>
            <div className={`text-sm font-extrabold tracking-wide uppercase ${meta.text}`}>
              {meta.label}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
              {aiResult.summary}
            </p>
          </div>
        </div>

        {/* Confidence, Expected Return & Expected Duration */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 justify-between sm:justify-start flex-wrap">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                AI Confidence
              </span>
              <span className="font-mono text-base font-black text-amber-400">
                {aiResult.confidence}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Expected Return
              </span>
              <span className="font-mono text-base font-black text-emerald-400">
                +{aiResult.expectedReturnMin}% ~ +{aiResult.expectedReturnMax}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-sky-400" />
                Duration ({aiResult.tradingStyle || 'SWING'})
              </span>
              <span className="font-mono text-xs sm:text-sm font-black text-sky-300">
                {aiResult.estimatedDuration || (aiResult.tradingStyle === 'SCALPING' ? 'Expected duration: 2-4 hours' : aiResult.tradingStyle === 'POSITION' ? 'Expected duration: 1+ weeks' : 'Expected duration: 1-3 days')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendToTelegram}
            disabled={telegramStatus?.loading}
            title="Send Signal directly to Telegram Channel"
            className="px-3 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>{telegramStatus?.loading ? 'পাঠানো হচ্ছে...' : 'Telegram-এ ব্রডকাস্ট'}</span>
          </button>
        </div>
      </div>

      {telegramStatus?.msg && (
        <div
          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
            telegramStatus.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {telegramStatus.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{telegramStatus.msg}</span>
        </div>
      )}

      {/* Scores Grid: Long vs Short Score & Risk Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Long vs Short Probability Bar */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs font-bold text-slate-300 flex items-center justify-between mb-3">
            <span>Long vs Short Probability Score</span>
            <span className="text-[10px] text-slate-400">Bybit AI Matrix</span>
          </span>

          <div className="space-y-3">
            {/* Long Score */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span className="text-emerald-400 flex items-center gap-1">
                  🟢 LONG SCORE
                </span>
                <span className="text-emerald-400">{aiResult.longScore} / 100</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${aiResult.longScore}%` }}
                />
              </div>
            </div>

            {/* Short Score */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span className="text-red-400 flex items-center gap-1">
                  🔴 SHORT SCORE
                </span>
                <span className="text-red-400">{aiResult.shortScore} / 100</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-red-400 transition-all duration-500"
                  style={{ width: `${aiResult.shortScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Gauge (1-10) */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              Capital Risk Score (1-10)
            </span>
            <span
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                aiResult.riskScore >= 7
                  ? 'bg-red-500/20 text-red-400'
                  : aiResult.riskScore >= 4
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              Risk: {aiResult.riskScore} / 10
            </span>
          </div>

          <div className="my-3">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span>1 Low Risk</span>
              <span>5 Moderate</span>
              <span className="text-red-400">10 Extreme Danger</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 p-0.5 relative">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  aiResult.riskScore >= 7
                    ? 'bg-red-500'
                    : aiResult.riskScore >= 4
                    ? 'bg-amber-500'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${(aiResult.riskScore / 10) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            {aiResult.riskScore >= 7
              ? 'High volatility or funding overhang. Priority 1 Capital Protection limits allocation.'
              : aiResult.riskScore >= 4
              ? 'Moderate volatility. Standard risk-managed position sizing recommended.'
              : 'Low risk score. Favorable market conditions for structured grid strategy.'}
          </p>
        </div>
      </div>

      {/* Gemini AI Synthesis (if available) */}
      {aiResult.geminiInsight && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Gemini AI Senior Analyst Insight</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            "{aiResult.geminiInsight}"
          </p>
        </div>
      )}

      {/* Centralized Confluence Confirmation Grid */}
      {central && central.confirmations && central.confirmations.length > 0 && (
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 Signal Confirmation Factors (Confluence Engine)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Market State: <strong className="text-amber-400">{central.marketState}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {central.confirmations.map((conf, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  conf.status === 'CONFIRMED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : conf.status === 'RISK'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">{conf.factor}</span>
                  <span>{conf.status === 'CONFIRMED' ? '✅' : conf.status === 'RISK' ? '⚠️' : '⚪'}</span>
                </div>
                <div className="text-xs font-black mb-1">{conf.label}</div>
                <p className="text-[11px] text-slate-400 leading-tight">{conf.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade Plan if Active Signal (LONG or SHORT) */}
      {central?.tradePlan && currentFinalSignal !== 'NEUTRAL' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-amber-400">📋 Structured Trade Plan</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                currentFinalSignal === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {currentFinalSignal} POSITION
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              R:R <strong className="text-emerald-400">{central.tradePlan.riskRewardRatio}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Entry Zone</span>
              <span className="text-slate-200 font-bold">
                ${central.tradePlan.entryZone.min} - ${central.tradePlan.entryZone.max}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Stop Loss (-{central.tradePlan.stopLossPcnt}%)</span>
              <span className="text-red-400 font-bold">${central.tradePlan.stopLoss}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Take Profit 1 (+{central.tradePlan.tp1GainPcnt}%)</span>
              <span className="text-emerald-400 font-bold">${central.tradePlan.tp1}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Take Profit 2 (+{central.tradePlan.tp2GainPcnt}%)</span>
              <span className="text-emerald-400 font-bold">${central.tradePlan.tp2}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Take Profit 3 (+{central.tradePlan.tp3GainPcnt}%)</span>
              <span className="text-teal-300 font-bold">${central.tradePlan.tp3}</span>
            </div>
          </div>
        </div>
      )}

      {/* Signal Time Management & Timing Card */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Signal Status:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                validitySeconds > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {validitySeconds > 0 ? '🟢 ACTIVE' : '⚪ EXPIRED'}
              </span>
              {aiResult.tradingStyleLabelBn && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono">
                  {aiResult.tradingStyleLabelBn}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Validity: <strong className="text-amber-400 font-mono">{formatCountdown(validitySeconds)}</strong> (Entry Cycle) | <strong className="text-sky-300 font-mono">{aiResult.estimatedDuration || 'Expected duration: 1-3 days'}</strong> {aiResult.estimatedDurationBn ? `(${aiResult.estimatedDurationBn})` : ''}
            </p>
          </div>
        </div>

        {onOpenBotSetup && (
          <button
            type="button"
            onClick={onOpenBotSetup}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
          >
            <span>🤖</span>
            <span>CREATE / OPEN BOT SETUP</span>
          </button>
        )}
      </div>

      {/* Signal History Timeline */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>📜 Signal History Timeline</span>
          <span className="text-[10px] text-slate-500 font-mono">Live Session Snapshots</span>
        </h4>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Recent Analysis</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                currentFinalSignal === 'LONG'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : currentFinalSignal === 'SHORT'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {currentFinalSignal} ({aiResult.confidence}%)
              </span>
            </div>
            <span className="text-emerald-400 text-[11px]">ACTIVE</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">-45m Session</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                ⚪ NEUTRAL (60%)
              </span>
            </div>
            <span className="text-slate-500 text-[11px]">Confluence Pending</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/30 border border-slate-800/40 flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-[11px]">-90m Session</span>
              <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 text-[10px]">
                ⚪ RANGE CONSOLIDATION
              </span>
            </div>
            <span className="text-slate-600 text-[11px]">COMPLETED</span>
          </div>
        </div>
      </div>

      {/* Key Factors List */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Key Decision Factors Breakdown
        </h4>

        <div className="space-y-2.5">
          {aiResult.keyFactors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-start gap-3"
            >
              {factor.impact === 'positive' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              ) : factor.impact === 'negative' ? (
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              ) : (
                <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-200">{factor.title}</div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {factor.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
