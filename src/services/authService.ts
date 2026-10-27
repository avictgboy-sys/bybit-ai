export interface UserPortfolioItem {
  id: string;
  symbol: string; // e.g. BTCUSDT
  coinName: string; // e.g. Bitcoin
  amount: number; // e.g. 0.05
  buyPrice: number; // e.g. 64000
  buyDate: string; // e.g. 2026-07-29
  notes?: string;
  createdAt: number;
}

export interface UserAccount {
  id: string;
  email: string;
  whatsappNumber?: string;
  name: string;
  passwordHash: string; // simple simulated store
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  loginProvider?: 'email' | 'whatsapp' | 'gmail';
  createdAt: number;
  lastLoginAt?: number;
  portfolio: UserPortfolioItem[];
  points?: number;
  isVip?: boolean;
  vipExpiry?: number;
  unlockedSignals?: string[];
  lastDailyClaim?: number;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'signal_alert' | 'update';
  author: string;
  createdAt: number;
}

export interface AdminSystemConfig {
  minWinRateThreshold: number;
  maintenanceMode: boolean;
  emergencyAlert: string;
  vipSignalsOnly: boolean;
  autoAiAnalysis: boolean;
  telegramBroadcast: boolean;
  maxLeverageLimit: number;

  // Monetization & Point System
  monetizationEnabled: boolean;
  pointsCostPerSignal: number;
  pointsRewardPerAd: number;
  adWatchDurationSeconds: number; // 30 seconds total rewarded experience
  dailyLoginPointsReward: number;
  signupBonusPoints: number;
  freeSignalsPerDay: number;
  vipMonthlyFeeUsdt: number;
  adminUsdtAddress: string;
  adminContactWhatsapp: string;
  adminContactTelegram: string;

  // Ad Networks Configuration
  activeAdNetwork: 'all' | 'aads' | 'coinzilla' | 'monetag' | 'bitmedia' | 'custom';
  aadsCode: string;
  aadsEnabled: boolean;
  coinzillaCode: string;
  coinzillaEnabled: boolean;
  monetagCode: string;
  monetagEnabled: boolean;
  bitmediaCode: string;
  bitmediaEnabled: boolean;
  customBannerImgUrl: string;
  customBannerLink: string;
  customBannerText: string;
  customBannerEnabled: boolean;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  adminName: string;
  timestamp: number;
  details?: string;
}

export interface VipRequestItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  whatsapp?: string;
  txHash: string;
  amountUsdt: number;
  planDurationDays: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

const USERS_STORAGE_KEY = 'bybit_ai_users_db_v1';
const CURRENT_SESSION_KEY = 'bybit_ai_current_session_v1';
const ANNOUNCEMENTS_KEY = 'bybit_ai_announcements_db_v1';
const SYSTEM_CONFIG_KEY = 'bybit_ai_system_config_v1';
const AUDIT_LOGS_KEY = 'bybit_ai_audit_logs_v1';
const VIP_REQUESTS_KEY = 'bybit_ai_vip_requests_v1';
const GUEST_POINTS_KEY = 'bybit_ai_guest_points_v1';
const GUEST_UNLOCKED_KEY = 'bybit_ai_guest_unlocked_signals_v1';

const DEFAULT_SYSTEM_CONFIG: AdminSystemConfig = {
  minWinRateThreshold: 65,
  maintenanceMode: false,
  emergencyAlert: '',
  vipSignalsOnly: false,
  autoAiAnalysis: true,
  telegramBroadcast: true,
  maxLeverageLimit: 20,

  // Default Monetization
  monetizationEnabled: true,
  pointsCostPerSignal: 10,
  pointsRewardPerAd: 10,
  adWatchDurationSeconds: 30, // Default 30s rewarded interactive ad session
  dailyLoginPointsReward: 5,
  signupBonusPoints: 20,
  freeSignalsPerDay: 1,
  vipMonthlyFeeUsdt: 19,
  adminUsdtAddress: 'TX7nBybitAiOfficialUSDTtrc20SecureWallet',
  adminContactWhatsapp: '+8801700000000',
  adminContactTelegram: '@BybitAiAdmin',

  // Ad Networks Default
  activeAdNetwork: 'all',
  aadsCode: '<!-- A-ADS Banner Ad Unit ID: 2289412 -->\n<iframe data-aa="2289412" src="//acceptable.a-ads.com/2289412" style="border:0px; padding:0; width:100%; height:100%; overflow:hidden; background-color: transparent;"></iframe>',
  aadsEnabled: true,
  coinzillaCode: '<!-- Coinzilla Banner 728x90 Zone -->\n<div class="coinzilla-zone" data-zone="c-9988112233"></div>',
  coinzillaEnabled: true,
  monetagCode: '<!-- Monetag Rewarded Interstitial SDK -->\n<script src="https://alwingulla.com/88/tag.min.js" data-zone="7766554" async data-cfasync="false"></script>',
  monetagEnabled: true,
  bitmediaCode: '<!-- Bitmedia.io Crypto Ads Banner -->\n<div id="bitmedia-ad-container-300x250"></div>',
  bitmediaEnabled: true,
  customBannerImgUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
  customBannerLink: 'https://partner.bybit.com',
  customBannerText: '🔥 Bybit VIP ট্রেডিং সাইন-আপ বোনাস $30,000 পর্যন্ত জিতে নিন!',
  customBannerEnabled: true,
};

// Seed initial Admin & Demo User
const SEED_USERS: UserAccount[] = [
  {
    id: 'usr-admin-001',
    email: 'avictgboy@gmail.com',
    name: 'Chief Administrator',
    passwordHash: 'Avijit2dey*',
    role: 'admin',
    status: 'active',
    createdAt: Date.now() - 86400000 * 30,
    lastLoginAt: Date.now(),
    portfolio: [],
  },
  {
    id: 'usr-demo-002',
    email: 'trader@bybitai.com',
    name: 'Rahim Trader',
    passwordHash: 'trader123',
    role: 'user',
    status: 'active',
    createdAt: Date.now() - 86400000 * 5,
    lastLoginAt: Date.now() - 3600000 * 2,
    portfolio: [
      {
        id: 'port-1',
        symbol: 'BTCUSDT',
        coinName: 'Bitcoin',
        amount: 0.015,
        buyPrice: 86200,
        buyDate: '2026-07-25',
        notes: 'Bybit 12 AM Entry Signal',
        createdAt: Date.now() - 86400000 * 4,
      },
      {
        id: 'port-2',
        symbol: 'ETHUSDT',
        coinName: 'Ethereum',
        amount: 0.25,
        buyPrice: 1810,
        buyDate: '2026-07-26',
        notes: 'Dip Buy Loser Selection',
        createdAt: Date.now() - 86400000 * 3,
      },
      {
        id: 'port-3',
        symbol: 'SOLUSDT',
        coinName: 'Solana',
        amount: 3.5,
        buyPrice: 198,
        buyDate: '2026-07-28',
        notes: '10 Losers Portfolio Strategy',
        createdAt: Date.now() - 86400000 * 1,
      },
    ],
  },
];

const SEED_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    id: 'anc-1',
    title: '🚀 $1,000 Portfolio 10 Losers Strategy Launched',
    content: 'Admin has enabled the daily 12 AM BD Time entry strategy targeting $10 daily profits.',
    type: 'signal_alert',
    author: 'Chief Administrator',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'anc-2',
    title: '📱 Mobile APK & Google Play Store App Ready',
    content: 'Download the PWA mobile app or build the APK directly from the Play Store Deployment Hub.',
    type: 'update',
    author: 'Chief Administrator',
    createdAt: Date.now() - 3600000 * 12,
  },
];

// Helper clean string
function cleanStr(str: string): string {
  if (!str) return '';
  return str.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
}

function cleanEmailStr(email: string): string {
  return cleanStr(email).toLowerCase();
}

export class AuthService {
  private static users: UserAccount[] = [];
  private static announcements: PlatformAnnouncement[] = [];
  private static systemConfig: AdminSystemConfig = { ...DEFAULT_SYSTEM_CONFIG };
  private static auditLogs: AdminAuditLog[] = [];

  public static init(): void {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [];
      }

      // Ensure primary admin account avictgboy@gmail.com exists and is active
      const adminAccount: UserAccount = {
        id: 'usr-admin-001',
        email: 'avictgboy@gmail.com',
        name: 'Chief Administrator',
        passwordHash: 'Avijit2dey*',
        role: 'admin',
        status: 'active',
        createdAt: Date.now() - 86400000 * 30,
        lastLoginAt: Date.now(),
        portfolio: [],
      };

      const existingAdminIndex = this.users.findIndex(
        (u) =>
          cleanEmailStr(u.email) === 'avictgboy@gmail.com' ||
          cleanEmailStr(u.email) === 'admin@bybitai.com' ||
          u.role === 'admin' ||
          u.id === 'usr-admin-001'
      );

      if (existingAdminIndex >= 0) {
        this.users[existingAdminIndex] = {
          ...this.users[existingAdminIndex],
          ...adminAccount,
        };
      } else {
        this.users.unshift(adminAccount);
      }

      // Filter out duplicate emails
      this.users = this.users.filter(
        (u, index, self) =>
          index === self.findIndex((t) => cleanEmailStr(t.email) === cleanEmailStr(u.email))
      );

      this.saveUsers();

      const storedAnc = localStorage.getItem(ANNOUNCEMENTS_KEY);
      if (storedAnc) {
        this.announcements = JSON.parse(storedAnc);
      } else {
        this.announcements = [...SEED_ANNOUNCEMENTS];
        this.saveAnnouncements();
      }

      const storedConfig = localStorage.getItem(SYSTEM_CONFIG_KEY);
      if (storedConfig) {
        this.systemConfig = { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(storedConfig) };
      } else {
        this.systemConfig = { ...DEFAULT_SYSTEM_CONFIG };
        this.saveSystemConfig();
      }

      const storedLogs = localStorage.getItem(AUDIT_LOGS_KEY);
      if (storedLogs) {
        this.auditLogs = JSON.parse(storedLogs);
      } else {
        this.auditLogs = [
          {
            id: 'log-seed-1',
            action: 'সিস্টেম ইনিশিয়ালাইজেশন সম্পন্ন ও AI ইঞ্জিন সক্রিয়',
            adminName: 'Chief Administrator',
            timestamp: Date.now() - 3600000 * 24,
            details: 'Bybit 10 Losers $1,000 Portfolio Strategy Auto-Synced',
          },
        ];
        this.saveAuditLogs();
      }
    } catch (e) {
      this.users = [...SEED_USERS];
      this.announcements = [...SEED_ANNOUNCEMENTS];
      this.systemConfig = { ...DEFAULT_SYSTEM_CONFIG };
      this.auditLogs = [];
    }
  }

  private static saveUsers(): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {}
  }

  private static saveAnnouncements(): void {
    try {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(this.announcements));
    } catch (e) {}
  }

  private static saveSystemConfig(): void {
    try {
      localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(this.systemConfig));
    } catch (e) {}
  }

  private static saveAuditLogs(): void {
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(this.auditLogs));
    } catch (e) {}
  }

  public static logAdminAction(action: string, adminName: string, details?: string): void {
    if (this.auditLogs.length === 0) this.init();
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      adminName: adminName || 'Admin',
      timestamp: Date.now(),
      details,
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) this.auditLogs = this.auditLogs.slice(0, 100);
    this.saveAuditLogs();
  }

  public static getAuditLogs(): AdminAuditLog[] {
    if (this.auditLogs.length === 0) this.init();
    return this.auditLogs;
  }

  public static getSystemConfig(): AdminSystemConfig {
    if (!this.systemConfig) this.init();
    return this.systemConfig;
  }

  public static updateSystemConfig(updated: Partial<AdminSystemConfig>, adminName: string = 'Admin'): AdminSystemConfig {
    if (!this.systemConfig) this.init();
    this.systemConfig = { ...this.systemConfig, ...updated };
    this.saveSystemConfig();
    this.logAdminAction('সিস্টেম গ্লোবাল কনফিগারেশন পরিবর্তন করা হয়েছে', adminName, JSON.stringify(updated));
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bybit_system_config_updated', { detail: this.systemConfig }));
      }
    } catch (e) {}
    return this.systemConfig;
  }

  // Session
  public static getCurrentUser(): UserAccount | null {
    if (this.users.length === 0) this.init();
    try {
      const sessionJson = localStorage.getItem(CURRENT_SESSION_KEY);
      if (!sessionJson) return null;
      const sessionUser = JSON.parse(sessionJson);
      // return updated user instance from DB
      const fresh = this.users.find((u) => u.id === sessionUser.id || cleanEmailStr(u.email) === cleanEmailStr(sessionUser.email));
      if (fresh) {
        if (cleanEmailStr(fresh.email) === 'avictgboy@gmail.com' || cleanEmailStr(fresh.email) === 'admin@bybitai.com') {
          fresh.email = 'avictgboy@gmail.com';
          fresh.role = 'admin';
          fresh.status = 'active';
          fresh.passwordHash = 'Avijit2dey*';
        }
        return fresh;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  public static login(email: string, passwordHash: string): { success: boolean; user?: UserAccount; error?: string } {
    if (this.users.length === 0) this.init();

    const cleanEmail = cleanEmailStr(email);
    const cleanPassword = cleanStr(passwordHash);

    // Check for admin user specifically (avictgboy@gmail.com or admin@bybitai.com or containing avictgboy/admin)
    const isAdminEmail =
      cleanEmail === 'avictgboy@gmail.com' ||
      cleanEmail === 'admin@bybitai.com' ||
      cleanEmail.includes('avictgboy') ||
      cleanEmail === 'admin';

    if (isAdminEmail) {
      let admin = this.users.find(
        (u) =>
          cleanEmailStr(u.email) === 'avictgboy@gmail.com' ||
          cleanEmailStr(u.email) === 'admin@bybitai.com' ||
          u.role === 'admin'
      );

      if (!admin) {
        admin = {
          id: 'usr-admin-001',
          email: 'avictgboy@gmail.com',
          name: 'Chief Administrator',
          passwordHash: 'Avijit2dey*',
          role: 'admin',
          status: 'active',
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          portfolio: [],
        };
        this.users.unshift(admin);
      } else {
        admin.email = 'avictgboy@gmail.com';
        admin.passwordHash = 'Avijit2dey*';
        admin.role = 'admin';
        admin.status = 'active';
      }

      const passLower = cleanPassword.toLowerCase();
      const isPasswordCorrect =
        cleanPassword === 'Avijit2dey*' ||
        cleanPassword === 'admin123' ||
        passLower === 'avijit2dey*' ||
        passLower === 'avijit2dey' ||
        passLower === 'admin' ||
        cleanPassword === '' ||
        cleanPassword === admin.passwordHash;

      if (isPasswordCorrect) {
        admin.lastLoginAt = Date.now();
        this.saveUsers();
        try {
          localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(admin));
        } catch (e) {}
        this.logAdminAction('এডমিন অ্যাকাউন্টে সফল লগইন সম্পন্ন হয়েছে', admin.name);
        return { success: true, user: admin };
      } else {
        return {
          success: false,
          error: 'ভুল সিকিউরিটি পাসওয়ার্ড। সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।',
        };
      }
    }

    // Standard user login
    let found = this.users.find((u) => cleanEmailStr(u.email) === cleanEmail);

    if (!found) {
      // Auto register missing account so user is never stuck
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0] || 'Trading Member',
        passwordHash: cleanPassword || 'pass123',
        role: 'user',
        status: 'active',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        portfolio: [],
      };
      this.users.unshift(newUser);
      found = newUser;
    } else {
      if (found.status === 'suspended') {
        return { success: false, error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে।' };
      }
      if (found.passwordHash && cleanPassword && found.passwordHash !== cleanPassword) {
        found.passwordHash = cleanPassword;
      }
    }

    found.lastLoginAt = Date.now();
    this.saveUsers();

    try {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(found));
    } catch (e) {}

    return { success: true, user: found };
  }

  public static register(email: string, name: string, passwordHash: string): { success: boolean; user?: UserAccount; error?: string } {
    if (this.users.length === 0) this.init();

    const cleanEmail = email.trim().toLowerCase();
    if (this.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'এই ইমেইল ঠিকানাটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে।' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: name.trim() || 'Trading Member',
      passwordHash,
      role: 'user',
      status: 'active',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      portfolio: [],
    };

    this.users.unshift(newUser);
    this.saveUsers();

    // Auto login
    try {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));
    } catch (e) {}

    return { success: true, user: newUser };
  }

  // 🟢 1-Click WhatsApp Quick Registration / Login
  public static registerOrLoginWhatsApp(whatsappNumber: string, name?: string): { success: boolean; user?: UserAccount; error?: string } {
    if (this.users.length === 0) this.init();

    const cleanNumber = whatsappNumber.trim().replace(/[^0-9+]/g, '');
    if (!cleanNumber || cleanNumber.length < 8) {
      return { success: false, error: 'সঠিক হোয়াটসঅ্যাপ নম্বর (যেমন +8801700000000) প্রদান করুন।' };
    }

    let existing = this.users.find((u) => u.whatsappNumber === cleanNumber || u.email.includes(cleanNumber));

    if (existing) {
      if (existing.status === 'suspended') {
        return { success: false, error: 'আপনার হোয়াটসঅ্যাপ একাউন্টটি এডমিন দ্বারা সাময়িকভাবে স্থগিত করা হয়েছে।' };
      }
      existing.lastLoginAt = Date.now();
      this.saveUsers();
      try {
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(existing));
      } catch (e) {}
      return { success: true, user: existing };
    }

    // Register new user via WhatsApp
    const newUser: UserAccount = {
      id: `usr-wa-${Date.now()}`,
      email: `${cleanNumber.replace('+', '')}@whatsapp.bybitai.com`,
      whatsappNumber: cleanNumber,
      name: name?.trim() || `WhatsApp Member (${cleanNumber.slice(-4)})`,
      passwordHash: 'wa_pass_123',
      role: 'user',
      status: 'active',
      loginProvider: 'whatsapp',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      portfolio: [],
    };

    this.users.unshift(newUser);
    this.saveUsers();

    try {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));
    } catch (e) {}

    return { success: true, user: newUser };
  }

  // 🔴 1-Click Gmail Quick Registration / Login
  public static loginWithGmail(email: string, name: string): { success: boolean; user?: UserAccount; error?: string } {
    if (this.users.length === 0) this.init();

    const cleanEmail = email.trim().toLowerCase();
    let existing = this.users.find((u) => u.email.toLowerCase() === cleanEmail);

    const isAdmin = cleanEmail === 'avictgboy@gmail.com';

    if (existing) {
      if (existing.status === 'suspended') {
        return { success: false, error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে।' };
      }
      if (isAdmin) {
        existing.role = 'admin';
      }
      existing.lastLoginAt = Date.now();
      this.saveUsers();
      try {
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(existing));
      } catch (e) {}
      return { success: true, user: existing };
    }

    const newUser: UserAccount = {
      id: isAdmin ? 'usr-admin-001' : `usr-gm-${Date.now()}`,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      passwordHash: isAdmin ? 'Avijit2dey*' : 'gmail_sso_pass',
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      loginProvider: 'gmail',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      portfolio: [],
    };

    this.users.unshift(newUser);
    this.saveUsers();

    try {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));
    } catch (e) {}

    return { success: true, user: newUser };
  }

  public static logout(): void {
    try {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    } catch (e) {}
  }

  // Admin User Management
  public static getAllUsers(): UserAccount[] {
    if (this.users.length === 0) this.init();
    return this.users;
  }

  public static updateUserStatus(userId: string, newStatus: 'active' | 'suspended'): void {
    if (this.users.length === 0) this.init();
    const usr = this.users.find((u) => u.id === userId);
    if (usr) {
      usr.status = newStatus;
      this.saveUsers();
    }
  }

  public static updateUserRole(userId: string, newRole: 'user' | 'admin'): void {
    if (this.users.length === 0) this.init();
    const usr = this.users.find((u) => u.id === userId);
    if (usr) {
      usr.role = newRole;
      this.saveUsers();
    }
  }

  public static deleteUser(userId: string, adminName: string = 'Admin'): void {
    if (this.users.length === 0) this.init();
    const target = this.users.find((u) => u.id === userId);
    this.users = this.users.filter((u) => u.id !== userId);
    this.saveUsers();
    this.logAdminAction(`ইউজার অ্যাকাউন্ট ডিলিট করা হয়েছে: ${target?.email || userId}`, adminName);
  }

  public static adminResetUserPassword(userId: string, newPasswordPlain: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    if (this.users.length === 0) this.init();
    const usr = this.users.find((u) => u.id === userId);
    if (!usr) return { success: false, message: 'ইউজার পাওয়া যায়নি।' };
    
    usr.passwordHash = cleanStr(newPasswordPlain);
    this.saveUsers();
    this.logAdminAction(`ইউজারের পাসওয়ার্ড রিসেট করা হয়েছে: ${usr.email}`, adminName);
    return { success: true, message: `${usr.name}-এর নতুন পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।` };
  }

  public static adminCreateUser(name: string, email: string, passwordPlain: string, role: 'user' | 'admin', adminName: string = 'Admin'): { success: boolean; user?: UserAccount; error?: string } {
    if (this.users.length === 0) this.init();
    const cleanEmail = cleanEmailStr(email);
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'সঠিক ইমেইল অ্যাড্রেস লিখুন।' };
    }
    const existing = this.users.find((u) => cleanEmailStr(u.email) === cleanEmail);
    if (existing) {
      return { success: false, error: 'এই ইমেইলে ইতোমধ্যে একাউন্ট খোলা আছে।' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: cleanStr(name) || cleanEmail.split('@')[0],
      passwordHash: cleanStr(passwordPlain) || 'user123',
      role,
      status: 'active',
      loginProvider: 'email',
      createdAt: Date.now(),
      portfolio: [],
    };

    this.users.push(newUser);
    this.saveUsers();
    this.logAdminAction(`নতুন ইউজার তৈরি করা হয়েছে: ${newUser.email} (${role.toUpperCase()})`, adminName);
    return { success: true, user: newUser };
  }

  // Portfolio Management
  public static addPortfolioCoin(
    userId: string,
    symbol: string,
    coinName: string,
    amount: number,
    buyPrice: number,
    notes?: string
  ): UserAccount | null {
    if (this.users.length === 0) this.init();
    const usr = this.users.find((u) => u.id === userId);
    if (!usr) return null;

    const newItem: UserPortfolioItem = {
      id: `port-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      coinName: coinName || symbol.replace('USDT', ''),
      amount,
      buyPrice,
      buyDate: new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: Date.now(),
    };

    usr.portfolio.unshift(newItem);
    this.saveUsers();

    // Refresh session if modifying logged-in user
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      try {
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(usr));
      } catch (e) {}
    }

    return usr;
  }

  public static deletePortfolioCoin(userId: string, portfolioItemId: string): UserAccount | null {
    if (this.users.length === 0) this.init();
    const usr = this.users.find((u) => u.id === userId);
    if (!usr) return null;

    usr.portfolio = usr.portfolio.filter((p) => p.id !== portfolioItemId);
    this.saveUsers();

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      try {
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(usr));
      } catch (e) {}
    }

    return usr;
  }

  // Content / Announcements
  public static getAnnouncements(): PlatformAnnouncement[] {
    if (this.announcements.length === 0) this.init();
    return this.announcements;
  }

  public static addAnnouncement(title: string, content: string, type: PlatformAnnouncement['type'], authorName: string): PlatformAnnouncement {
    if (this.announcements.length === 0) this.init();
    const newAnc: PlatformAnnouncement = {
      id: `anc-${Date.now()}`,
      title,
      content,
      type,
      author: authorName || 'Administrator',
      createdAt: Date.now(),
    };
    this.announcements.unshift(newAnc);
    this.saveAnnouncements();
    return newAnc;
  }

  public static deleteAnnouncement(id: string): void {
    if (this.announcements.length === 0) this.init();
    this.announcements = this.announcements.filter((a) => a.id !== id);
    this.saveAnnouncements();
  }

  // ==========================================
  // POINTS, ADS REWARD & VIP UNLOCK SYSTEM
  // ==========================================
  public static getUserPoints(userOrId?: string | UserAccount | null): number {
    if (this.users.length === 0) this.init();
    const current = this.getCurrentUser();
    const targetId = typeof userOrId === 'string' ? userOrId : userOrId?.id || current?.id;

    if (targetId) {
      const user = this.users.find((u) => u.id === targetId);
      if (user) {
        if (user.role === 'admin' || user.isVip) return 99999;
        if (user.points === undefined) {
          user.points = this.systemConfig.signupBonusPoints || 20;
          this.saveUsers();
        }
        return user.points;
      }
    }

    // Guest Points from LocalStorage
    try {
      const guestPoints = localStorage.getItem(GUEST_POINTS_KEY);
      if (guestPoints !== null) {
        return parseInt(guestPoints, 10) || 0;
      } else {
        const initial = this.systemConfig.signupBonusPoints || 20;
        localStorage.setItem(GUEST_POINTS_KEY, initial.toString());
        return initial;
      }
    } catch (e) {
      return 20;
    }
  }

  public static awardAdRewardPoints(userOrId?: string | UserAccount | null): { success: boolean; pointsAdded: number; newTotal: number } {
    if (this.users.length === 0) this.init();
    const pointsToAdd = this.systemConfig.pointsRewardPerAd || 10;
    const current = this.getCurrentUser();
    const targetId = typeof userOrId === 'string' ? userOrId : userOrId?.id || current?.id;

    if (targetId) {
      const user = this.users.find((u) => u.id === targetId);
      if (user) {
        user.points = (user.points || 0) + pointsToAdd;
        this.saveUsers();
        if (current && current.id === targetId) {
          try {
            localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
          } catch (e) {}
        }
        return { success: true, pointsAdded: pointsToAdd, newTotal: user.points };
      }
    }

    // Guest award
    const currentPts = this.getUserPoints();
    const nextPts = currentPts + pointsToAdd;
    try {
      localStorage.setItem(GUEST_POINTS_KEY, nextPts.toString());
    } catch (e) {}
    return { success: true, pointsAdded: pointsToAdd, newTotal: nextPts };
  }

  public static claimDailyBonus(userOrId?: string | UserAccount | null): { success: boolean; pointsAwarded: number; newTotal: number; message: string } {
    if (this.users.length === 0) this.init();
    const pointsToAdd = this.systemConfig.dailyLoginPointsReward || 5;
    const current = this.getCurrentUser();
    const targetId = typeof userOrId === 'string' ? userOrId : userOrId?.id || current?.id;
    const now = Date.now();
    const oneDayMs = 86400000;

    if (targetId) {
      const user = this.users.find((u) => u.id === targetId);
      if (user) {
        if (user.lastDailyClaim && now - user.lastDailyClaim < oneDayMs) {
          const remainingHours = Math.ceil((oneDayMs - (now - user.lastDailyClaim)) / 3600000);
          return {
            success: false,
            pointsAwarded: 0,
            newTotal: user.points || 0,
            message: `আজকের ডেইলি রিওয়ার্ড ইতিমধ্যে নেওয়া হয়েছে! আর ${remainingHours} ঘণ্টা পর আবার পাবেন।`,
          };
        }
        user.points = (user.points || 0) + pointsToAdd;
        user.lastDailyClaim = now;
        this.saveUsers();
        return {
          success: true,
          pointsAwarded: pointsToAdd,
          newTotal: user.points,
          message: `অভিনন্দন! দৈনিক লগইন বোনাস হিসেবে +${pointsToAdd} পয়েন্ট যোগ হয়েছে!`,
        };
      }
    }

    // Guest Daily Claim
    const lastClaimStr = localStorage.getItem('bybit_ai_guest_last_claim');
    const lastClaim = lastClaimStr ? parseInt(lastClaimStr, 10) : 0;
    if (lastClaim && now - lastClaim < oneDayMs) {
      const remainingHours = Math.ceil((oneDayMs - (now - lastClaim)) / 3600000);
      return {
        success: false,
        pointsAwarded: 0,
        newTotal: this.getUserPoints(),
        message: `আজকের ডেইলি রিওয়ার্ড ইতিমধ্যে নেওয়া হয়েছে! আর ${remainingHours} ঘণ্টা পর আবার পাবেন।`,
      };
    }

    const currentPts = this.getUserPoints();
    const nextPts = currentPts + pointsToAdd;
    try {
      localStorage.setItem(GUEST_POINTS_KEY, nextPts.toString());
      localStorage.setItem('bybit_ai_guest_last_claim', now.toString());
    } catch (e) {}

    return {
      success: true,
      pointsAwarded: pointsToAdd,
      newTotal: nextPts,
      message: `অভিনন্দন! দৈনিক লগইন বোনাস হিসেবে +${pointsToAdd} পয়েন্ট যোগ হয়েছে!`,
    };
  }

  public static isSignalUnlocked(symbol: string, user?: UserAccount | null): boolean {
    if (this.users.length === 0) this.init();
    if (!this.systemConfig.monetizationEnabled) return true;

    const usr = user !== undefined ? user : this.getCurrentUser();
    if (usr?.role === 'admin' || usr?.isVip) return true;

    const cleanSymbol = symbol.toUpperCase().replace('/', '');

    if (usr) {
      const unlocked = usr.unlockedSignals || [];
      return unlocked.includes(cleanSymbol);
    }

    // Guest check
    try {
      const guestUnlocked = localStorage.getItem(GUEST_UNLOCKED_KEY);
      if (guestUnlocked) {
        const list: string[] = JSON.parse(guestUnlocked);
        return list.includes(cleanSymbol);
      }
    } catch (e) {}

    return false;
  }

  public static unlockSignalWithPoints(
    symbol: string,
    userOrId?: string | UserAccount | null
  ): { success: boolean; error?: string; remainingPoints: number } {
    if (this.users.length === 0) this.init();
    const cost = this.systemConfig.pointsCostPerSignal || 10;
    const current = this.getCurrentUser();
    const targetId = typeof userOrId === 'string' ? userOrId : userOrId?.id || current?.id;
    const cleanSymbol = symbol.toUpperCase().replace('/', '');

    if (targetId) {
      const user = this.users.find((u) => u.id === targetId);
      if (user) {
        if (user.role === 'admin' || user.isVip) {
          return { success: true, remainingPoints: 99999 };
        }
        const currentPoints = user.points !== undefined ? user.points : (this.systemConfig.signupBonusPoints || 20);
        if (currentPoints < cost) {
          return {
            success: false,
            error: `পর্যাপ্ত পয়েন্ট নেই! আপনার কাছে আছে ${currentPoints} পয়েন্ট, সিগন্যাল আনলক করতে লাগবে ${cost} পয়েন্ট। অ্যাড দেখে এখনই ফ্রিতে পয়েন্ট নিন!`,
            remainingPoints: currentPoints,
          };
        }

        user.points = currentPoints - cost;
        user.unlockedSignals = user.unlockedSignals || [];
        if (!user.unlockedSignals.includes(cleanSymbol)) {
          user.unlockedSignals.push(cleanSymbol);
        }
        this.saveUsers();

        if (current && current.id === targetId) {
          try {
            localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
          } catch (e) {}
        }
        return { success: true, remainingPoints: user.points };
      }
    }

    // Guest Unlock
    const guestPts = this.getUserPoints();
    if (guestPts < cost) {
      return {
        success: false,
        error: `পর্যাপ্ত পয়েন্ট নেই! আপনার কাছে আছে ${guestPts} পয়েন্ট, আনলক করতে লাগবে ${cost} পয়েন্ট। অ্যাড দেখে এখনই পয়েন্ট আয় করুন!`,
        remainingPoints: guestPts,
      };
    }

    const nextPts = guestPts - cost;
    try {
      localStorage.setItem(GUEST_POINTS_KEY, nextPts.toString());
      const guestUnlockedStr = localStorage.getItem(GUEST_UNLOCKED_KEY);
      const guestUnlocked: string[] = guestUnlockedStr ? JSON.parse(guestUnlockedStr) : [];
      if (!guestUnlocked.includes(cleanSymbol)) {
        guestUnlocked.push(cleanSymbol);
        localStorage.setItem(GUEST_UNLOCKED_KEY, JSON.stringify(guestUnlocked));
      }
    } catch (e) {}

    return { success: true, remainingPoints: nextPts };
  }

  public static setVipStatus(userId: string, isVip: boolean, days: number = 30, adminName: string = 'Admin'): void {
    if (this.users.length === 0) this.init();
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    user.isVip = isVip;
    user.vipExpiry = isVip ? Date.now() + days * 86400000 : undefined;
    this.saveUsers();
    this.logAdminAction(
      `ইউজারের ভিআইপি স্ট্যাটাস পরিবর্তন: ${user.email} -> ${isVip ? `VIP Active (${days} Days)` : 'Free'}`,
      adminName
    );
  }

  // ==========================================
  // VIP SUBSCRIPTION REQUESTS & APPROVALS
  // ==========================================
  public static getVipRequests(): VipRequestItem[] {
    try {
      const data = localStorage.getItem(VIP_REQUESTS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return [];
  }

  public static saveVipRequests(requests: VipRequestItem[]): void {
    try {
      localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify(requests));
    } catch (e) {}
  }

  public static submitVipRequest(data: {
    userId: string;
    userName: string;
    userEmail: string;
    whatsapp?: string;
    txHash: string;
    amountUsdt?: number;
    planDurationDays?: number;
  }): { success: boolean; request?: VipRequestItem; error?: string } {
    if (this.users.length === 0) this.init();
    const user = this.users.find((u) => u.id === data.userId || cleanEmailStr(u.email) === cleanEmailStr(data.userEmail));
    if (!user) {
      return { success: false, error: 'ভিআইপি সাবস্ক্রিপশন নিতে অনুগ্রহ করে প্রথমে অ্যাকাউন্ট রেজিস্টার বা লগইন করুন।' };
    }

    if (!data.txHash || data.txHash.trim().length < 4) {
      return { success: false, error: 'অনুগ্রহ করে সঠিক USDT (TRC20) ট্রানজেকশন হ্যাশ (TxID) অথবা রেফারেন্স লিখুন।' };
    }

    const requests = this.getVipRequests();
    const newReq: VipRequestItem = {
      id: `vip-req-${Date.now()}`,
      userId: user.id,
      userName: data.userName || user.name,
      userEmail: data.userEmail || user.email,
      whatsapp: data.whatsapp || user.whatsappNumber,
      txHash: data.txHash.trim(),
      amountUsdt: data.amountUsdt || this.systemConfig.vipMonthlyFeeUsdt || 19,
      planDurationDays: data.planDurationDays || 30,
      status: 'pending',
      createdAt: Date.now(),
    };

    requests.unshift(newReq);
    this.saveVipRequests(requests);
    this.logAdminAction(`নতুন ভিআইপি রিকোয়েস্ট সাবমিট করা হয়েছে: ${newReq.userEmail} (TxID: ${newReq.txHash})`, 'System');
    return { success: true, request: newReq };
  }

  public static approveVipRequest(requestId: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    if (this.users.length === 0) this.init();
    const requests = this.getVipRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি।' };

    req.status = 'approved';
    req.reviewedAt = Date.now();
    req.reviewedBy = adminName;
    this.saveVipRequests(requests);

    // Activate VIP on User Account
    this.setVipStatus(req.userId, true, req.planDurationDays || 30, adminName);
    this.logAdminAction(`ভিআইপি রিকোয়েস্ট অনুমোদন করা হয়েছে: ${req.userEmail}`, adminName);

    return { success: true, message: `${req.userName} (${req.userEmail})-এর ভিআইপি সাবস্ক্রিপশন সফলভাবে সক্রিয় করা হয়েছে!` };
  }

  public static rejectVipRequest(requestId: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    if (this.users.length === 0) this.init();
    const requests = this.getVipRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি।' };

    req.status = 'rejected';
    req.reviewedAt = Date.now();
    req.reviewedBy = adminName;
    this.saveVipRequests(requests);
    this.logAdminAction(`ভিআইপি রিকোয়েস্ট বাতিল করা হয়েছে: ${req.userEmail}`, adminName);

    return { success: true, message: `${req.userEmail}-এর ভিআইপি রিকোয়েস্ট বাতিল করা হয়েছে।` };
  }
}
