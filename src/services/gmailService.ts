import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { HighWinSignalData } from './telegramBot';

// Scope list requested for Gmail integration
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://mail.google.com/',
];

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GmailAccountInfo {
  user: User | null;
  accessToken: string | null;
  email: string | null;
}

export class GmailService {
  /**
   * Initialize auth state listener
   */
  public static initAuth(
    onAuthSuccess?: (user: User, token: string) => void,
    onAuthFailure?: () => void
  ) {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user && cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        if (!isSigningIn) {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      }
    });
  }

  /**
   * Get cached OAuth Access Token
   */
  public static getAccessToken(): string | null {
    return cachedAccessToken;
  }

  /**
   * Check if Gmail access token is available
   */
  public static isConnected(): boolean {
    return Boolean(cachedAccessToken && auth.currentUser);
  }

  /**
   * Sign in with Google to get OAuth Access Token with Gmail Scopes
   */
  public static async signInWithGoogle(): Promise<{ user: User; accessToken: string }> {
    try {
      isSigningIn = true;
      const provider = new GoogleAuthProvider();
      // Add Gmail scopes
      GMAIL_SCOPES.forEach((scope) => provider.addScope(scope));

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken) {
        throw new Error('Google OAuth-এর এক্সেস টোকেন পাওয়া যায়নি।');
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      console.error('[GmailService] Sign-in error:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  }

  /**
   * Disconnect / Sign Out Google Gmail session
   */
  public static async disconnect(): Promise<void> {
    await signOut(auth);
    cachedAccessToken = null;
  }

  /**
   * Construct RFC 2822 MIME raw email payload encoded in Base64URL format
   */
  private static makeMimeEmail(to: string, subject: string, htmlContent: string): string {
    const messageLines = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      '',
      htmlContent,
    ];

    const mimeString = messageLines.join('\r\n');
    return btoa(unescape(encodeURIComponent(mimeString)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Send email using Google Gmail API v1 messages.send
   */
  public static async sendEmail(
    toEmail: string,
    subject: string,
    htmlBody: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const token = this.getAccessToken();

    if (!token) {
      return {
        success: false,
        error: 'Google Gmail-এ লগইন করা নেই। অনুগ্রহ করে প্রথমে Google দিয়ে সাইন ইন করুন।',
      };
    }

    try {
      const rawBase64 = this.makeMimeEmail(toEmail, subject, htmlBody);

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: rawBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Gmail API-তে বার্তা পাঠাতে ত্রুটি ঘটেছে।');
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (err: any) {
      console.error('[GmailService] Send Email Error:', err);
      return {
        success: false,
        error: err.message || 'Gmail ইমেইল পাঠানো সম্ভব হয়নি।',
      };
    }
  }

  /**
   * Format & Send Top 10 High-Win Crypto Signals via Gmail
   */
  public static async sendTopTenSignalsEmail(
    recipientEmail: string,
    signals: HighWinSignalData[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!signals || signals.length === 0) {
      return { success: false, error: 'পাঠানোর জন্য কোনো সিগন্যাল পাওয়া যায়নি।' };
    }

    const dateStr = new Date().toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeStr = new Date().toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const subject = `🎯 Bybit VIP Signal Alert: Top 10 High-Win Crypto Signals (${dateStr})`;

    let html = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 650px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px solid #38bdf8; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 22px;">🎯 TOP 10 HIGH-WIN CRYPTO SIGNALS (80% - 98% Win Rate)</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Bybit V5 Real-Time AI Auto Signal Dispatcher</p>
          <span style="background-color: #0284c7; color: #ffffff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">📅 ${dateStr} | 🕒 ${timeStr}</span>
        </div>

        <div style="margin-bottom: 20px;">
    `;

    signals.slice(0, 10).forEach((sig) => {
      const isLong = sig.positionDirection === 'LONG';
      const posBg = isLong ? '#059669' : '#dc2626';
      const posText = isLong ? '🚀 LONG (বাই)' : '📉 SHORT (সেল)';

      html += `
        <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 16px; color: #f1f5f9;">Rank #${sig.rank} | $${sig.coin.symbol}</strong>
            <span style="background-color: ${posBg}; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${posText}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
            <tr>
              <td style="padding: 4px 0;">✨ <strong>উইন রেট:</strong> <span style="color: #34d399; font-weight: bold;">${sig.winRate}%</span></td>
              <td style="padding: 4px 0;">🎯 <strong>বর্তমান প্রাইস:</strong> $${sig.coin.lastPrice}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">📍 <strong>এন্ট্রি জোন:</strong> $${sig.entryZoneMin.toFixed(4)} - $${sig.entryZoneMax.toFixed(4)}</td>
              <td style="padding: 4px 0;">⚡ <strong>লেভারেজ:</strong> ${sig.recommendedLeverage}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">🎯 <strong>TP1:</strong> $${sig.tp1.toFixed(4)} (+${sig.tp1Pcnt}%)</td>
              <td style="padding: 4px 0;">🛑 <strong>SL:</strong> $${sig.sl.toFixed(4)} (-${sig.slPcnt}%)</td>
            </tr>
          </table>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8; font-style: italic;">💡 ${sig.reasonBn}</p>
        </div>
      `;
    });

    html += `
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 14px; text-align: center; color: #64748b; font-size: 11px;">
          <p style="margin: 0;">⚡ Powered by Bybit AI Pro Google Gmail Service</p>
          <p style="margin: 4px 0 0 0;">মূলধন সুরক্ষায় সঠিক স্টপ-লস এবং প্রোপার রিস্ক ম্যানেজমেন্ট মেনে চলুন।</p>
        </div>
      </div>
    `;

    return this.sendEmail(recipientEmail, subject, html);
  }
}

export default GmailService;
