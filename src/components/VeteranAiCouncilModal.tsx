import React, { useState, useEffect } from 'react';
import {
  TWELVE_VETERAN_TRADERS,
  VeteranAiCouncilService,
  CouncilConsensusResult,
  VeteranAiTraderPersona
} from '../services/veteranAiCouncilService';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Sparkles,
  Bot,
  Play,
  RotateCcw,
  X,
  Target,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';

interface VeteranAiCouncilModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: {
    id: string;
    symbol: string;
    name?: string;
    entryPrice: number;
    tp1: number;
    tp2: number;
    tp3?: number;
    sl: number;
    direction?: 'LONG' | 'SHORT' | 'BUY' | 'SELL';
    category?: string;
    currentPrice?: number;
  } | null;
  onStartCouncilTrade?: (consensus: CouncilConsensusResult) => void;
}

export const VeteranAiCouncilModal: React.FC<VeteranAiCouncilModalProps> = ({
  isOpen,
  onClose,
  signal,
  onStartCouncilTrade
}) => {
  const [activeTab, setActiveTab] = useState<'VOTES' | 'DISCUSSION' | 'EXECUTION'>('VOTES');
  const [simulatedIndex, setSimulatedIndex] = useState<number>(12); // Show all by default or animate
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(false);
  const [selectedTrader, setSelectedTrader] = useState<VeteranAiTraderPersona | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSimulatedIndex(12);
      setIsPlayingSimulation(false);
      setSelectedTrader(null);
    }
  }, [isOpen, signal?.id]);

  if (!isOpen || !signal) return null;

  const consensus: CouncilConsensusResult = VeteranAiCouncilService.evaluateSignalWithTwelveVeterans(signal);
  const isLong = signal.direction === 'LONG' || signal.direction === 'BUY' || !signal.direction;

  const startLiveDebateAnimation = () => {
    setActiveTab('DISCUSSION');
    setSimulatedIndex(1);
    setIsPlayingSimulation(true);
  };

  useEffect(() => {
    let timer: any;
    if (isPlayingSimulation && simulatedIndex < consensus.discussionTranscript.length) {
      timer = setTimeout(() => {
        setSimulatedIndex((prev) => prev + 1);
      }, 1400);
    } else if (isPlayingSimulation && simulatedIndex >= consensus.discussionTranscript.length) {
      setIsPlayingSimulation(false);
    }
    return () => clearTimeout(timer);
  }, [isPlayingSimulation, simulatedIndex, consensus.discussionTranscript.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                  ১২ জন সিনিয়র এআই ট্রেডার কাউন্সিল
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {consensus.approvedCount}/১২ সর্বসম্মত ভোট
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1 flex items-center gap-2">
                {signal.symbol} • ১২ জন সিনিয়র ট্রেডারের যৌথ বিতর্ক ও সিদ্ধান্ত
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isLong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isLong ? 'BUY / LONG' : 'SELL / SHORT'}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Score Banner */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/90 border border-indigo-500/20 rounded-xl p-2.5">
            <div className="text-[11px] text-slate-400 flex items-center">
              <Award className="w-3.5 h-3.5 mr-1 text-amber-400" />
              কাউন্সিল কনসেনসাস
            </div>
            <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center">
              ১২/১২ অনুমোদিত
              <span className="ml-1 text-xs text-slate-400">({consensus.consensusScorePcnt}%)</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-indigo-500/20 rounded-xl p-2.5">
            <div className="text-[11px] text-slate-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              প্রফিট মাল্টিপ্লায়ার
            </div>
            <div className="text-base font-bold text-indigo-300 mt-0.5">
              ২.৬৫x গুণ বেশি প্রফিট
            </div>
          </div>

          <div className="bg-slate-900/90 border border-indigo-500/20 rounded-xl p-2.5">
            <div className="text-[11px] text-slate-400 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              ক্যাপিটাল প্রটেকশন
            </div>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              জিরো-রিস্ক ব্রেক-ইভেন
            </div>
          </div>

          <div className="bg-slate-900/90 border border-indigo-500/20 rounded-xl p-2.5">
            <div className="text-[11px] text-slate-400 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-purple-400" />
              অভিজ্ঞতার সমষ্টি
            </div>
            <div className="text-base font-bold text-purple-300 mt-0.5">
              ২১১+ বছর সমন্বিত
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 pt-2">
          <button
            onClick={() => setActiveTab('VOTES')}
            className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'VOTES'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>১২ জন সিনিয়র ট্রেডারের ভোট ও ভেরিফিকেশন</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300">১২</span>
          </button>

          <button
            onClick={() => setActiveTab('DISCUSSION')}
            className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'DISCUSSION'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>লাইভ বোর্ডরুম বিতর্ক ও আলোচনা</span>
            {isPlayingSimulation && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('EXECUTION')}
            className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'EXECUTION'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>অনুমোদিত প্রাতিষ্ঠানিক এক্সিকিউশন প্ল্যান</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: VOTES GRID */}
          {activeTab === 'VOTES' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-start space-x-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {consensus.councilSummaryBn}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {TWELVE_VETERAN_TRADERS.map((trader) => {
                  const voteRec = consensus.votes.find((v) => v.traderId === trader.id);
                  return (
                    <div
                      key={trader.id}
                      onClick={() => setSelectedTrader(trader)}
                      className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3.5 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-950/30 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${trader.avatarBg}`}
                          >
                            {trader.nameBn.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {trader.nameBn}
                              </h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                {trader.experienceYears} বছর অভিজ্ঞতা
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {trader.roleBn}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            APPROVED
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            {voteRec?.confidencePcnt || 96}% কনফিডেন্স
                          </span>
                        </div>
                      </div>

                      {/* Institutional Edge Rationale */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <div className="text-[11px] font-semibold text-indigo-300 mb-1 flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-1 text-indigo-400" />
                          {voteRec?.keyVerificationBn}
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{voteRec?.statementBn}"
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>🏛️ {trader.firmExperienceBn}</span>
                        {voteRec?.riskWarningBn && (
                          <span className="text-amber-400 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            সতর্কতা নোট
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE DISCUSSION BOARDROOM */}
          {activeTab === 'DISCUSSION' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">
                    কাউন্সিল বোর্ডরুম অডিট লগ — {consensus.discussionTranscript.length}টি আলোচনার রাউন্ড
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={startLiveDebateAnimation}
                    disabled={isPlayingSimulation}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isPlayingSimulation ? 'আলোচনা চলছে...' : 'লাইভ বিতর্ক প্লে করুন'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSimulatedIndex(consensus.discussionTranscript.length);
                      setIsPlayingSimulation(false);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    title="সব আলোচনা একবারে দেখুন"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Discussion Transcript Bubbles */}
              <div className="space-y-3">
                {consensus.discussionTranscript.slice(0, simulatedIndex).map((round, i) => {
                  const trader = TWELVE_VETERAN_TRADERS.find((t) => t.id === round.speakerId);
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3.5 animate-fadeIn"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md ${
                          trader?.avatarBg || 'bg-indigo-600'
                        }`}
                      >
                        {round.speakerName.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">
                              {round.speakerName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium">
                              {round.speakerRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {round.timestamp}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                          {round.messageBn}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {isPlayingSimulation && (
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-dashed border-indigo-500/30 flex items-center justify-center space-x-2 text-xs text-indigo-300">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-200"></span>
                    <span>পরবর্তী সিনিয়র ট্রেডার তার বিশ্লেষণ উপস্থাপন করছেন...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APPROVED EXECUTION PLAN */}
          {activeTab === 'EXECUTION' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 border border-indigo-500/30 rounded-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  ১২ জন সিনিয়র ট্রেডারের চূড়ান্ত অনুমোদিত এক্সিকিউশন চার্ট
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  কাউন্সিল শুধুমাত্র সাধারণ এন্ট্রি এবং টিপিই অনুমোদন করেনি, বরং প্রফিট রানার এবং ড্র-ডাউন শূন্য করার জন্য সুনির্দিষ্ট গাণিতিক লেভেল নির্ধারণ করেছে।
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[11px] text-slate-400">এন্ট্রি জোন</div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      ${consensus.rawEntry}
                    </div>
                    <div className="text-[10px] text-indigo-400 mt-0.5">ইনস্টিটিউশনাল এন্ট্রি</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                    <div className="text-[11px] text-slate-400">অনুমোদিত TP ১</div>
                    <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                      ${consensus.approvedTp1}
                    </div>
                    <div className="text-[10px] text-emerald-300 mt-0.5">৪০% প্রফিট লক + SL এন্ট্রি</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30">
                    <div className="text-[11px] text-slate-400">এক্সপেন্ডেড TP ২ (রানার)</div>
                    <div className="text-sm sm:text-base font-bold text-indigo-300 mt-0.5">
                      ${consensus.extendedTp2}
                    </div>
                    <div className="text-[10px] text-indigo-400 mt-0.5">+১৫৫% বেশি দূরত্ব</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30">
                    <div className="text-[11px] text-slate-400">শিল্ডেড নিরাপদ SL</div>
                    <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5">
                      ${consensus.shieldedSl}
                    </div>
                    <div className="text-[10px] text-rose-300 mt-0.5">লিকুইডিটি হান্ট বাফার সহ</div>
                  </div>
                </div>
              </div>

              {/* Step by step instructions */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  জিরো-রিস্ক ট্রেড ম্যানেজমেন্ট গাইডলাইন (১২ জন ট্রেডারের যৌথ নিয়ম):
                </h4>
                {consensus.zeroRiskExecutionPlanBn.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2.5 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>কাউন্সিল চিফ রিস্ক অফিসার নোট:</strong> এই ট্রেডটি ১২ জন সিনিয়র এআই দ্বারা যৌথভাবে স্ক্রুটিনি করা হয়েছে। অনুশাসিত লট সাইজ মেনে চলুন এবং TP১ হিট করার সাথে সাথে স্টপ লস এন্ট্রি প্রাইজে সরিয়ে ফেলুন।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center">
            <Bot className="w-4 h-4 mr-1.5 text-indigo-400" />
            কাউন্সিল এক্যুরেসি স্ট্যাম্প: <span className="text-emerald-400 font-bold ml-1">{consensus.accuracyRatingBn}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              বন্ধ করুন
            </button>
            {onStartCouncilTrade && (
              <button
                onClick={() => {
                  onStartCouncilTrade(consensus);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>কাউন্সিল অনুমোদিত ট্রেড শুরু করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
