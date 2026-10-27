import { RiskGuardWarning, SignalType } from '../types';

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  autoSendSignals: boolean;
  minConfidence: number; // e.g. 70, 80
  autoSendRiskWarnings: boolean;
  autoSendPriceAlerts: boolean;
  channelName?: string;
  lastSentTimestamp?: number;
}

const TELEGRAM_CONFIG_KEY = 'bybit_ai_telegram_webhook_config';

const DEFAULT_CONFIG: TelegramConfig = {
  enabled: false,
  botToken: '',
  chatId: '',
  autoSendSignals: false,
  minConfidence: 75,
  autoSendRiskWarnings: false,
  autoSendPriceAlerts: false,
  channelName: '',
};

export class TelegramService {
  public static getConfig(): TelegramConfig {
    try {
      const saved = localStorage.getItem(TELEGRAM_CONFIG_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load Telegram config:', e);
    }
    return DEFAULT_CONFIG;
  }

  public static saveConfig(config: TelegramConfig): void {
    try {
      localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save Telegram config:', e);
    }
  }

  public static isConfigured(): boolean {
    const config = this.getConfig();
    const token = (config.botToken || '').trim();
    const chat = (config.chatId || '').trim();
    return Boolean(
      config.enabled &&
        token &&
        chat &&
        !token.includes('Demo') &&
        token !== 'SUPER_ADMIN_DEFAULT'
    );
  }

  public static async sendRawMessage(
    message: string,
    overrideConfig?: Partial<TelegramConfig>
  ): Promise<{ success: boolean; error?: string }> {
    const config = { ...this.getConfig(), ...overrideConfig };
    const token = (config.botToken || '').trim();
    const chat = (config.chatId || '').trim();

    if (!token || !chat) {
      return {
        success: false,
        error: 'টেলিগ্রাম Bot Token এবং Chat ID সেটআপ করা নেই।',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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
      if (!res.ok || !data || !data.success) {
        return {
          success: false,
          error: data?.error || 'টেলিগ্রাম সার্ভারে বার্তা পাঠাতে ব্যর্থ হয়েছে। বটের পারমিশন চেক করুন।',
        };
      }

      // Update last sent timestamp
      this.saveConfig({ ...config, lastSentTimestamp: Date.now() });
      return { success: true };
    } catch (err: any) {
      const errorMsg =
        err.name === 'AbortError'
          ? 'টেলিগ্রাম রিকোয়েস্ট টাইমআউট হয়েছে।'
          : 'টেলিগ্রাম সার্ভিস বা নেটওয়ার্ক সংযোগ পাওয়া যায়নি।';
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  // Send High-Priority AI Signal to Telegram
  public static async sendSignalAlert(data: {
    symbol: string;
    signal: SignalType;
    confidence: number;
    lastPrice: number;
    expectedReturnMin?: number;
    expectedReturnMax?: number;
    riskScore?: number;
    tpPrice?: number;
    slPrice?: number;
    summary?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const isLong = data.signal === 'LONG';
    const isShort = data.signal === 'SHORT';
    const signalEmoji = isLong ? '🚀 LONG (বাই)' : isShort ? '📉 SHORT (সেল)' : '⏸️ ' + data.signal;

    const formattedMessage = `<b>🔥 BYBIT AI HIGH-PRIORITY TRADING SIGNAL</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>🪙 কোয়েন:</b> <code>$${data.symbol}</code>
<b>📊 সিগন্যাল:</b> ${signalEmoji}
<b>🎯 বর্তমান প্রাইস:</b> <code>$${data.lastPrice.toLocaleString()}</code>
<b>✨ কনফিডেন্স স্কোর:</b> <code>${data.confidence}%</code>
<b>⚖️ রিস্ক স্কোর:</b> <code>${data.riskScore || 'Moderate'}/10</code>
${
  data.expectedReturnMin && data.expectedReturnMax
    ? `<b>📈 প্রত্যাশিত লাভ:</b> <code>+${data.expectedReturnMin}% থেকে +${data.expectedReturnMax}%</code>\n`
    : ''
}${data.tpPrice ? `<b>🎯 টেক প্রফিট (TP):</b> <code>$${data.tpPrice}</code>\n` : ''}${
      data.slPrice ? `<b>🛑 স্টপ লস (SL):</b> <code>$${data.slPrice}</code>\n` : ''
    }━━━━━━━━━━━━━━━━━━━━━━
<b>💡 AI ইনসাইট:</b>
<i>${data.summary || 'প্রযুক্তিগত সূচক ও ভলিউম ব্রেকআউট বিশ্লেষণ করে সিগন্যাল তৈরি করা হয়েছে।'}</i>

⚡ <i>Bybit V5 AI Trader Pro Webhook Alert</i>
🕒 ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    return this.sendRawMessage(formattedMessage);
  }

  // Send Risk Guard Warning to Telegram
  public static async sendRiskWarningAlert(
    warning: RiskGuardWarning
  ): Promise<{ success: boolean; error?: string }> {
    const severityEmoji =
      warning.severity === 'critical'
        ? '🚨 CRITICAL WARNING'
        : warning.severity === 'high'
        ? '⚠️ HIGH RISK ALERT'
        : 'ℹ️ MARKET NOTICE';

    const formattedMessage = `<b>${severityEmoji} - RISK GUARD BROADCAST</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>🪙 মার্কেট/কোয়েন:</b> <code>$${warning.symbol}</code>
<b>🏷️ অ্যালার্টের ধরণ:</b> <b>${warning.type}</b>
<b>📌 শিরোনাম:</b> ${warning.title}

<b>📝 বিবরণ:</b>
${warning.message}

━━━━━━━━━━━━━━━━━━━━━━
🛡️ <i>মূলধন সুরক্ষায় অবিলম্বে স্টপ লস চেক করুন বা পজিশন সাইজ কমান।</i>
🕒 ${new Date(warning.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    return this.sendRawMessage(formattedMessage);
  }

  // Send Complete Top 10 High Win Signals Digest to Telegram
  public static async sendTopTenHighWinSignals(
    signals: any[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'টেলিগ্রাম বটের টোকেন বা চ্যানেল আইডি কনফিগার করা নেই।',
      };
    }

    if (!signals || signals.length === 0) {
      return {
        success: false,
        error: 'পাঠানোর মতো কোনো সিগন্যাল পাওয়া যায়নি।',
      };
    }

    const topList = signals.slice(0, 10);
    const timeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

    let message = `<b>🎯 TOP 10 HIGH-WIN CRYPTO SIGNALS (৮০ - ১০০% উইন রেট)</b>\n`;
    message += `<b>🔥 Bybit V5 Real-Time AI Auto-Broadcast Engine</b>\n`;
    message += `📅 ${dateStr} | 🕒 ${timeStr}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    topList.forEach((sig) => {
      const isLong = sig.positionDirection === 'LONG';
      const posEmoji = isLong ? '🚀 LONG (বাই)' : '📉 SHORT (সেল)';
      const rankBadge =
        sig.rank === 1
          ? '🥇 RANK #1 (TOP PICK)'
          : sig.rank === 2
          ? '🥈 RANK #2'
          : sig.rank === 3
          ? '🥉 RANK #3'
          : `RANK #${sig.rank}`;

      message += `<b>${rankBadge} | 🪙 $${sig.coin.symbol}</b>\n`;
      message += `• <b>পজিশন:</b> ${posEmoji}\n`;
      if (sig.tradingStyleLabelBn) {
        message += `• <b>ট্রেডিং স্টাইল:</b> ${sig.tradingStyleLabelBn}\n`;
      }
      if (sig.estimatedDurationBn) {
        message += `• <b>⏱️ সম্ভাব্য মেয়াদ:</b> ${sig.estimatedDurationBn}\n`;
      }
      message += `• <b>উইন প্রোব্যাবিলিটি:</b> <code>${sig.winRate}% WIN RATE</code>\n`;
      message += `• <b>এন্ট্রি জোন:</b> <code>$${sig.entryZoneMin.toFixed(4)} - $${sig.entryZoneMax.toFixed(4)}</code>\n`;
      message += `• <b>টার্গেট:</b> TP1 $${sig.tp1.toFixed(4)} (+${sig.tp1Pcnt}%) | TP2 $${sig.tp2.toFixed(4)} (+${sig.tp2Pcnt}%)\n`;
      message += `• <b>স্টপ লস (SL):</b> $${sig.sl.toFixed(4)} (-${sig.slPcnt}%)\n`;
      message += `• <b>R:R & লেভারেজ:</b> ${sig.riskRewardRatio} | ${sig.recommendedLeverage}\n`;
      message += `<i>💡 ${sig.reasonBn}</i>\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⚡ <i>Bybit AI Pro Automatic Telegram Dispatch</i>\n`;
    message += `🛡️ <i>মূলধন সুরক্ষায় সঠিক স্টপ-লস এবং প্রোপার রিস্ক ম্যানেজমেন্ট মেনে চলুন।</i>`;

    return this.sendRawMessage(message);
  }

  // Send Single High Win Signal
  public static async sendSingleHighWinSignal(
    sig: any
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'টেলিগ্রাম বটের টোকেন বা চ্যানেল আইডি কনফিগার করা নেই।',
      };
    }

    const isLong = sig.positionDirection === 'LONG';
    const posEmoji = isLong ? '🚀 LONG (বাই)' : '📉 SHORT (সেল)';
    const rankBadge =
      sig.rank === 1
        ? '🥇 RANK #1 (TOP PICK)'
        : sig.rank === 2
        ? '🥈 RANK #2'
        : sig.rank === 3
        ? '🥉 RANK #3'
        : `RANK #${sig.rank}`;

    const formattedMessage = `<b>🎯 HIGH WIN CRYPTO SIGNAL [${rankBadge}]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>🪙 কোয়েন:</b> <code>$${sig.coin.symbol}</code>
<b>📊 পজিশন ডাইরেকশন:</b> ${posEmoji}
${sig.tradingStyleLabelBn ? `<b>⚡ ট্রেডিং স্টাইল:</b> ${sig.tradingStyleLabelBn}\n` : ''}${sig.estimatedDurationBn ? `<b>⏱️ সম্ভাব্য সময়কাল:</b> ${sig.estimatedDurationBn} (${sig.validityBn || 'টার্গেট পূরণ পর্যন্ত'})\n` : ''}<b>✨ উইন প্রোব্যাবিলিটি:</b> <code>${sig.winRate}% WIN RATE</code>
<b>🎯 বর্তমান প্রাইস:</b> <code>$${sig.coin.lastPrice}</code>

<b>📍 নিরাপদ এন্ট্রি জোন:</b> <code>$${sig.entryZoneMin.toFixed(4)} - $${sig.entryZoneMax.toFixed(4)}</code>
<b>🎯 টার্গেট ১ (TP1):</b> <code>$${sig.tp1.toFixed(4)} (+${sig.tp1Pcnt}%)${sig.tp1DurationBn ? ` [আনুমানিক ${sig.tp1DurationBn}]` : ''}</code>
<b>🎯 টার্গেট ২ (TP2):</b> <code>$${sig.tp2.toFixed(4)} (+${sig.tp2Pcnt}%)${sig.tp2DurationBn ? ` [আনুমানিক ${sig.tp2DurationBn}]` : ''}</code>
<b>🛑 স্টপ লস (SL):</b> <code>$${sig.sl.toFixed(4)} (-${sig.slPcnt}%)</code>
<b>⚖️ রিস্ক/রিওয়ার্ড:</b> <code>${sig.riskRewardRatio}</code>
<b>⚡ প্রস্তাবিত লেভারেজ:</b> <code>${sig.recommendedLeverage}</code>

━━━━━━━━━━━━━━━━━━━━━━
<b>💡 বাংলা এআই ট্রেডিং ইনসাইট:</b>
<i>${sig.reasonBn}</i>

⚡ <i>Bybit AI Pro Auto Dispatch</i>
🕒 ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    return this.sendRawMessage(formattedMessage);
  }

  // Send Test Message
  public static async sendTestNotification(
    token?: string,
    chat?: string
  ): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    const botToken = token || config.botToken;
    const chatId = chat || config.chatId;

    const testMsg = `<b>✅ TELEGRAM WEBHOOK TEST SUCCESSFUL!</b>
━━━━━━━━━━━━━━━━━━━━━━
🎉 <b>অভিনন্দন!</b> আপনার Bybit V5 AI Trader Pro টেলিগ্রাম বট সংকেত ওয়েবহুক সফলভাবে সংযুক্ত হয়েছে।

<b>⚙️ সিস্টেম স্ট্যাটাস:</b>
• <b>Bot Token:</b> Verified 🟢
• <b>Target Chat/Channel:</b> <code>${chatId}</code>
• <b>Auto Signal Alerts:</b> ACTIVE
• <b>Risk Warning Alerts:</b> ACTIVE

এখন থেকে সকল হাই-প্রাইওরিটি ট্রেডিং সিগন্যাল ও রিস্ক অ্যালার্ট এই টেলিগ্রাম চ্যানেলে স্বয়ংক্রিয়ভাবে প্রেরিত হবে।
🕒 ${new Date().toLocaleTimeString('bn-BD')}`;

    return this.sendRawMessage(testMsg, { botToken, chatId });
  }
}
