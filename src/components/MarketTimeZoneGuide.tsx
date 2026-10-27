import React, { useState, useEffect } from 'react';
import {
  Clock,
  Globe,
  Sun,
  Moon,
  Zap,
  TrendingUp,
  Activity,
  Flame,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';

export const MarketTimeZoneGuide: React.FC = () => {
  const [bdTime, setBdTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [nyTime, setNyTime] = useState<string>('');
  const [londonTime, setLondonTime] = useState<string>('');
  const [tokyoTime, setTokyoTime] = useState<string>('');
  
  const [bdHour, setBdHour] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      
      // UTC
      const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      setUtcTime(utcDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // BD Time (UTC+6)
      const bdDate = new Date(utcDate.getTime() + 6 * 3600000);
      setBdHour(bdDate.getHours());
      setBdTime(bdDate.toLocaleTimeString('bn-BD', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // New York (EST / UTC-4 approx)
      const nyDate = new Date(utcDate.getTime() - 4 * 3600000);
      setNyTime(nyDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }));

      // London (BST / UTC+1 approx)
      const londonDate = new Date(utcDate.getTime() + 1 * 3600000);
      setLondonTime(londonDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }));

      // Tokyo (JST / UTC+9)
      const tokyoDate = new Date(utcDate.getTime() + 9 * 3600000);
      setTokyoTime(tokyoDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }));
    };

    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current active market session based on BD Hour
  const isAsianOpen = bdHour >= 6 && bdHour < 14; // 6 AM - 2 PM BD
  const isLondonOpen = bdHour >= 14 && bdHour < 21; // 2 PM - 9 PM BD
  const isNYOpen = (bdHour >= 19 && bdHour <= 23) || bdHour < 3; // 7:30 PM - 3 AM BD
  const isOverlap = bdHour >= 19 && bdHour < 21; // 7:30 PM - 9 PM BD

  // Dynamic status text for current time
  const getCurrentMarketCondition = () => {
    if (isOverlap) {
      return {
        tag: '🔥 পীক ভলিউম ওভারল্যাপ (London + NY)',
        color: 'from-amber-500 to-red-500',
        desc: 'এখন দিনের সবচেয়ে হাই ভলিউম সময়! লন্ডণ ও নিউ ইয়র্ক দুটি মার্কেটই একসাথে খোলা। দ্রুত পাম্প ও বড় ভোলাটিলিটি চলছে।',
      };
    }
    if (isNYOpen) {
      return {
        tag: '🇺🇸 নিউ ইয়র্ক ইউএস সেশন (হাই ভোলাটিলিটি)',
        color: 'from-purple-500 to-indigo-500',
        desc: 'ইউএস মার্কেট ট্রেডাররা অ্যাক্টিভ। আমেরিকান নিউজ, ফেড ডাটা ও নিউ ইয়র্ক স্টকের সবচেয়ে বড় মুভমেন্টের সময়।',
      };
    }
    if (isLondonOpen) {
      return {
        tag: '🇬🇧 ইউরোপিয়ান / লন্ডন সেশন (ট্রেন্ড মোমেন্টাম)',
        color: 'from-sky-500 to-blue-600',
        desc: 'ইউরোপের ট্রেডাররা অ্যাক্টিভ। ভলিউম বাড়ে এবং দিনের প্রথম ব্রেকআউট বা ডাইরেকশনাল ট্রেন্ড তৈরি হয়।',
      };
    }
    if (isAsianOpen) {
      return {
        tag: '🌏 এশিয়ান সেশন (রেঞ্জবাউন্ড ও গ্রিড বট সময়)',
        color: 'from-emerald-500 to-teal-600',
        desc: 'এশিয়ার মার্কেট খোলা। সাধারণত স্লো ও কনসোলিডেশন মুভমেন্ট থাকে। সাইডওয়ে গ্রিড বটের জন্য উপযুক্ত।',
      };
    }
    return {
      tag: '🌙 ওভারনাইট লেট নাইট জোন (ডেইলি ক্লোজিং)',
      color: 'from-slate-600 to-slate-800',
      desc: 'রাত ১২:০০ AM ডেইলি ক্যান্ডেল ক্লোজিং ও ফান্ডিং ফি রিফ্রেশ টাইম। ডিপ বাউন্স ট্রেড এন্ট্রির বেস্ট টাইম।',
    };
  };

  const currentCond = getCurrentMarketCondition();

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold shrink-0 border border-amber-500/30">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                🌐 গ্লোবাল মার্কেট সেশন ও বাংলাদেশ টাইমজোন গাইড
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                BD TIME (GMT+6)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              কোন সময়ে মার্কেট কেমন থাকে এবং কখন পাম্প, ডাম্প ও গ্রিড বট সবচেয়ে ভাল কাজ করে
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 self-start sm:self-auto"
        >
          {isExpanded ? (
            <>
              <span>সংক্ষিপ্ত করুন</span>
              <ChevronUp className="w-4 h-4 text-amber-400" />
            </>
          ) : (
            <>
              <span>বিস্তারিত দেখুন</span>
              <ChevronDown className="w-4 h-4 text-amber-400" />
            </>
          )}
        </button>
      </div>

      {/* Live Clocks Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
        {/* BD Time */}
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 space-y-1">
          <div className="flex items-center justify-between text-amber-400 text-[11px] font-bold">
            <span className="flex items-center gap-1">🇧🇩 বিডি টাইম</span>
            <span className="text-[9px] bg-amber-500/20 px-1 rounded">GMT+6</span>
          </div>
          <div className="text-sm sm:text-base font-black text-amber-300">
            {bdTime || '12:00:00 AM'}
          </div>
        </div>

        {/* London Time */}
        <div className={`p-3 rounded-xl border space-y-1 ${isLondonOpen ? 'bg-sky-500/15 border-sky-500/40' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between text-sky-400 text-[11px] font-bold">
            <span className="flex items-center gap-1">🇬🇧 লন্ডন</span>
            <span className={`text-[9px] px-1 rounded ${isLondonOpen ? 'bg-emerald-500/20 text-emerald-400 font-extrabold' : 'bg-slate-800 text-slate-400'}`}>
              {isLondonOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-100">
            {londonTime || '08:00 AM'}
          </div>
        </div>

        {/* New York Time */}
        <div className={`p-3 rounded-xl border space-y-1 ${isNYOpen ? 'bg-purple-500/15 border-purple-500/40' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between text-purple-400 text-[11px] font-bold">
            <span className="flex items-center gap-1">🇺🇸 নিউ ইয়র্ক</span>
            <span className={`text-[9px] px-1 rounded ${isNYOpen ? 'bg-emerald-500/20 text-emerald-400 font-extrabold' : 'bg-slate-800 text-slate-400'}`}>
              {isNYOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-100">
            {nyTime || '03:00 AM'}
          </div>
        </div>

        {/* Tokyo Time */}
        <div className={`p-3 rounded-xl border space-y-1 ${isAsianOpen ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between text-emerald-400 text-[11px] font-bold">
            <span className="flex items-center gap-1">🇯🇵 টোকিও/এশিয়া</span>
            <span className={`text-[9px] px-1 rounded ${isAsianOpen ? 'bg-emerald-500/20 text-emerald-400 font-extrabold' : 'bg-slate-800 text-slate-400'}`}>
              {isAsianOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-100">
            {tokyoTime || '04:00 PM'}
          </div>
        </div>
      </div>

      {/* Current Live Market Condition Banner */}
      <div className={`p-3.5 rounded-xl bg-gradient-to-r ${currentCond.color} text-white space-y-1 shadow-lg`}>
        <div className="flex items-center justify-between font-extrabold text-xs sm:text-sm">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
            <span>এখনকার বর্তমান মার্কেট অবস্থা: {currentCond.tag}</span>
          </span>
          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded backdrop-blur">
            LIVE BD
          </span>
        </div>
        <p className="text-xs text-slate-100 leading-relaxed font-sans opacity-95">
          {currentCond.desc}
        </p>
      </div>

      {/* Detailed BD Time Market Behaviour Breakdown */}
      {isExpanded && (
        <div className="space-y-3 pt-2 animate-fadeIn">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>বাংলাদেশ সময় (BD Time) অনুযায়ী কোন সময়ে মার্কেট কেমন থাকে:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Slot 1 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-amber-400 font-extrabold">
                <span className="flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>রাত ১২:০০ AM - রাত ২:০০ AM</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Daily Close
                </span>
              </div>
              <strong className="text-slate-100 block text-[11px]">
                🎯 ডেইলি ক্যান্ডেল ক্লোজ ও ফান্ডিং রিফ্রেশ:
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                বাইন্যান্স ও বাইবিটে নতুন ডেইলি ক্যান্ডেল শুরু হয়। ১০টি Losers ডিক্লাইন বাউন্স ট্রেড নেওয়ার আসল উইন্ডো।
              </p>
            </div>

            {/* Slot 2 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-emerald-400 font-extrabold">
                <span className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>সকাল ৬:০০ AM - সকাল ১০:০০ AM</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Asian Open
                </span>
              </div>
              <strong className="text-slate-100 block text-[11px]">
                🌅 এশিয়ান ওপেন ও পাম্প উইন্ডো:
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                জাপান, কোরিয়া ও চীনের ট্রেডাররা সচল হয়। রাতের বাই করা ডিপের ট্রেডগুলোতে ভালো প্রফিট বুকিং হয়।
              </p>
            </div>

            {/* Slot 3 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-sky-400 font-extrabold">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>দুপুর ২:০০ PM - বিকাল ৫:০০ PM</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  London Open
                </span>
              </div>
              <strong className="text-slate-100 block text-[11px]">
                🇬🇧 লন্ডন সেশন ও ব্রেকআউট:
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                ইউরোপীয় মার্কেট খোলায় ভলিউম দ্রুত লাফিয়ে ওঠে। ব্রেকআউট ও ভলিউম স্পাইক স্ট্র্যাটেজির সেরা সময়।
              </p>
            </div>

            {/* Slot 4 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-1.5 bg-amber-500/5">
              <div className="flex items-center justify-between text-amber-400 font-extrabold">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>রাত ৭:৩০ PM - রাত ৯:০০ PM</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  GOLDEN OVERLAP
                </span>
              </div>
              <strong className="text-amber-300 block text-[11px]">
                🔥 লন্ডন + ইউএস ডাবল ওভারল্যাপ:
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                সারাদিনের সর্বোচ্চ ভলিউম ও দ্রুত পাম্প ঘটে! বড় বড় ট্রেডার ও হুইলদের ভারী লিকুইডেশন ড্রাইভ চলে।
              </p>
            </div>

            {/* Slot 5 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-purple-400 font-extrabold">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>রাত ৯:০০ PM - রাত ১২:০০ AM</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  NY Volatility
                </span>
              </div>
              <strong className="text-slate-100 block text-[11px]">
                🇺🇸 ইউএস নিউজ ও স্টকের প্রভাব:
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                ইউএস ইনফ্লেশন, সিপিআই ও ওয়াল স্ট্রিট ওপেনিং নিউজ থাকে। হাই লেভারেজ এড়িয়ে টাইট স্টপ লস ব্যবহার করুন।
              </p>
            </div>

            {/* Slot 6 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 font-extrabold">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-teal-400" />
                  <span>দুপুর ১২:০০ PM - দুপুর ২:০০ PM</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  Grid Bot Zone
                </span>
              </div>
              <strong className="text-slate-100 block text-[11px]">
                🤖 স্লো সাইডওয়ে জোন (গ্রিড বট সময়):
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                মার্কেট শান্ত ও সাইডওয়ে থাকে। ফিউচার গ্রিড বট এবং নিউট্রাল গ্রিড বট সবচেয়ে নিরাপদ প্রফিট দেয়।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
