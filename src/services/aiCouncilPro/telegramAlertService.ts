// Telegram Alert Service for AI Council Pro
// Formats and sends 12-Senior Council verdicts and risk parameters directly to Telegram channels/groups.

import { TwelveCouncilFullVerdict } from './twelveCouncilEngine';
import { PositionCalculationResult } from './riskManagerGuard';
import { formatPrice } from '../../utils/formatters';

export interface CouncilTelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  autoSendStrongBuy: boolean;
  autoSendStrongSell: boolean;
  minConsensusPcnt: number; // e.g. 80, 85, 90
  includeDebateHighlights: boolean;
  lastSentTimestamp?: number;
}

const STORAGE_KEY = 'ai_council_pro_telegram_config_v1';

const DEFAULT_CONFIG: CouncilTelegramConfig = {
  enabled: false,
  botToken: '',
  chatId: '',
  autoSendStrongBuy: true,
  autoSendStrongSell: true,
  minConsensusPcnt: 80,
  includeDebateHighlights: true,
};

export class TelegramAlertService {
  public static getConfig(): CouncilTelegramConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_CONFIG;
  }

  public static saveConfig(config: CouncilTelegramConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {}
  }

  public static isConfigured(): boolean {
    const cfg = this.getConfig();
    return Boolean(cfg.botToken && cfg.chatId && cfg.botToken.trim() && cfg.chatId.trim());
  }

  /**
   * Format Twelve Council Verdict into clean HTML for Telegram
   */
  public static formatCouncilMessage(
    verdict: TwelveCouncilFullVerdict,
    riskCalc?: PositionCalculationResult,
    customNote?: string
  ): string {
    const isBuy = verdict.overallVerdict === 'STRONG_BUY' || verdict.overallVerdict === 'BUY';
    const isWait = verdict.overallVerdict === 'WAIT_NO_TRADE';
    const verdictEmoji = isBuy ? '🟢' : isWait ? '🟡' : '🔴';

    const macroTrader = verdict.members.find((m) => m.traderId === 'trader-1');
    const smcTrader = verdict.members.find((m) => m.traderId === 'trader-4');
    const riskTrader = verdict.members.find((m) => m.traderId === 'trader-9');

    let msg = `🏛️ <b>১২ সিনিয়র এআই কাউন্সিল - প্রাতিষ্ঠানিক সিগন্যাল</b>\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🪙 <b>অ্যাসেট:</b> <code>#${verdict.symbol}</code> (${verdict.assetClass})\n`;
    msg += `💲 <b>ভেরিফায়েড প্রাইস:</b> $${formatPrice(verdict.canonicalPrice)}\n`;
    msg += `📡 <b>ফিড সোর্স:</b> ${verdict.priceSource === 'WEBSOCKET_LIVE' ? 'LIVE WS (Priority 1)' : verdict.priceSource === 'EXNESS_FEED' ? 'EXNESS VIP FEED' : 'REST CANDLE (P2)'}\n`;
    msg += `⏱️ <b>ট্রেড স্টাইল:</b> ${verdict.tradeStyle} (${verdict.timeframe})\n\n`;

    msg += `⚖️ <b>কাউন্সিল রায়:</b> ${verdictEmoji} <b>${verdict.verdictLabelBn}</b>\n`;
    msg += `📊 <b>কনসেনসাস স্কোর:</b> ${verdict.consensusScorePcnt}% (${verdict.buyVotes} বাই • ${verdict.waitVotes} ওয়েট • ${verdict.sellVotes} সেল)\n\n`;

    msg += `🎯 <b>এক্সিকিউশন আর্কিটেকচার:</b>\n`;
    msg += `• <b>এন্ট্রি জোন:</b> $${formatPrice(verdict.entryZone[0])} - $${formatPrice(verdict.entryZone[1])}\n`;
    msg += `• <b>শিল্ডেড স্টপ লস (SL):</b> $${formatPrice(verdict.stopLoss)}\n`;
    msg += `• <b>টার্গেট ১ (TP1):</b> $${formatPrice(verdict.takeProfit1)}\n`;
    msg += `• <b>টার্গেট ২ (TP2):</b> $${formatPrice(verdict.takeProfit2)}\n`;
    msg += `• <b>টার্গেট ৩ (TP3):</b> $${formatPrice(verdict.takeProfit3)}\n`;
    msg += `• <b>রিস্ক-রিওয়ার্ড (R:R):</b> ${verdict.riskRewardRatio}\n`;
    msg += `• <b>লেভারেজ গাইড:</b> ${verdict.recommendedLeverage}\n\n`;

    if (riskCalc) {
      msg += `🛡️ <b>রিস্ক ম্যানেজার অডিট (CRO Gatekeeper):</b>\n`;
      msg += `• প্রস্তাবিত মার্জিন: $${riskCalc.requiredMarginUsd.toFixed(2)}\n`;
      msg += `• সর্বোচ্চ ডলার ঝুঁকি: -$${riskCalc.dollarRisk.toFixed(2)} (${riskCalc.accountBalanceUsd}$ মূলধনের)\n`;
      msg += `• আনুমানিক লিকুইডেশন: $${formatPrice(riskCalc.estimatedLiquidationPrice)} (SL সুরক্ষিত)\n\n`;
    }

    msg += `🧠 <b>শীর্ষ সিনিয়র ট্রেডারদের যুক্তি:</b>\n`;
    if (macroTrader) {
      msg += `• <b>${macroTrader.nameBn}:</b> ${macroTrader.technicalReasoningBn}\n`;
    }
    if (smcTrader) {
      msg += `• <b>${smcTrader.nameBn}:</b> ${smcTrader.technicalReasoningBn}\n`;
    }
    if (riskTrader) {
      msg += `• <b>${riskTrader.nameBn}:</b> ${riskTrader.technicalReasoningBn}\n\n`;
    }

    if (customNote) {
      msg += `📝 <b>অতিরিক্ত নোট:</b> ${customNote}\n\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `⚠️ <i>রিস্ক রুল: কোনো সিঙ্গেল ট্রেডে মোট ক্যাপিটালের ১.৫% এর বেশি ঝুঁকি নেওয়া নিষেধ। কঠোরভাবে স্টপ লস বজায় রাখুন।</i>\n`;
    msg += `🤖 <i>Bybit AI Council Pro • ${verdict.analyzedAt}</i>`;

    return msg;
  }

  /**
   * Send formatted Council Verdict to Telegram
   */
  public static async sendCouncilVerdictAlert(
    verdict: TwelveCouncilFullVerdict,
    riskCalc?: PositionCalculationResult,
    customNote?: string,
    overrideConfig?: Partial<CouncilTelegramConfig>
  ): Promise<{ success: boolean; error?: string; messageId?: number; simulated?: boolean }> {
    const config = { ...this.getConfig(), ...overrideConfig };
    const token = (config.botToken || '').trim();
    const chat = (config.chatId || '').trim();

    if (!token || !chat) {
      return {
        success: false,
        error: 'টেলিগ্রাম Bot Token এবং Chat ID সেটআপ করা নেই। সেটিংস ট্যাবে গিয়ে কনফিগার করুন।',
      };
    }

    const message = this.formatCouncilMessage(verdict, riskCalc, customNote);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          botToken: token,
          chatId: chat,
          message,
          parseMode: 'HTML',
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || (!data.success && !data.simulated)) {
        return {
          success: false,
          error: data?.error || 'টেলিগ্রাম সার্ভারে বার্তা পাঠাতে ব্যর্থ হয়েছে। বটের পারমিশন চেক করুন।',
        };
      }

      this.saveConfig({ ...config, lastSentTimestamp: Date.now() });

      return {
        success: true,
        messageId: data.messageId,
        simulated: data.simulated,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.name === 'AbortError' ? 'রিকোয়েস্ট টাইমআউট হয়েছে।' : 'টেলিগ্রাম সার্ভারের সাথে যোগাযোগ করা যায়নি।',
      };
    }
  }

  /**
   * Send test ping to verify Telegram Bot configuration
   */
  public static async sendTestMessage(
    botToken?: string,
    chatId?: string
  ): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
    const config = this.getConfig();
    const token = (botToken || config.botToken || '').trim();
    const chat = (chatId || config.chatId || '').trim();

    if (!token || !chat) {
      return {
        success: false,
        error: 'অনুগ্রহ করে Bot Token এবং Chat ID উভয়ই পূরণ করুন।',
      };
    }

    const testMsg = `🔔 <b>AI Council Pro - টেলিগ্রাম কানেকশন টেস্ট</b>\n━━━━━━━━━━━━━━━━━━━━━━\n✅ আপনার টেলিগ্রাম বট সফলভাবে কানেক্ট হয়েছে!\n🏛️ ১২ সিনিয়র কাউন্সিলের লাইভ ট্রেড অ্যালার্ট এখন এই চ্যানেলে পাঠানো হবে।\n\n⏰ <i>টাইমস্ট্যাম্প: ${new Date().toLocaleTimeString('bn-BD')}</i>`;

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: token,
          chatId: chat,
          message: testMsg,
          parseMode: 'HTML',
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || (!data.success && !data.simulated)) {
        return {
          success: false,
          error: data?.error || 'টেস্ট মেসেজ পাঠাতে ব্যর্থ হয়েছে। টোকেন ও চ্যাট আইডি যাচাই করুন।',
        };
      }

      return { success: true, simulated: data.simulated };
    } catch (err: any) {
      return { success: false, error: err.message || 'নেটওয়ার্ক এরর।' };
    }
  }
}
