import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  Bell,
  PlusCircle,
  X,
  Briefcase,
  Sliders,
  Activity,
  Key,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Zap,
  Settings,
  ShieldAlert,
  Send,
  Radio,
  FileText,
  Clock,
  Flame,
  Coins,
  DollarSign,
  Crown,
  ExternalLink,
  Megaphone,
  Sparkles,
  Award,
  Copy,
  MessageCircle,
} from 'lucide-react';
import {
  AuthService,
  UserAccount,
  PlatformAnnouncement,
  AdminSystemConfig,
  AdminAuditLog,
  VipRequestItem,
} from '../services/authService';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [systemConfig, setSystemConfig] = useState<AdminSystemConfig>(AuthService.getSystemConfig());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [vipRequests, setVipRequests] = useState<VipRequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<'USERS' | 'VIP_REQUESTS' | 'CONFIG' | 'MONETIZATION' | 'ANNOUNCEMENTS' | 'PORTFOLIOS' | 'AUDIT_LOGS'>('USERS');

  // Search & Filter
  const [searchUserQuery, setSearchUserQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'admin' | 'user'>('ALL');

  // New User Form State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');

  // Password Reset State
  const [resetTargetUser, setResetTargetUser] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // Announcement Form State
  const [ancTitle, setAncTitle] = useState<string>('');
  const [ancContent, setAncContent] = useState<string>('');
  const [ancType, setAncType] = useState<PlatformAnnouncement['type']>('signal_alert');

  // Flash Feedback message
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setUsers([...AuthService.getAllUsers()]);
    setAnnouncements([...AuthService.getAnnouncements()]);
    setSystemConfig({ ...AuthService.getSystemConfig() });
    setAuditLogs([...AuthService.getAuditLogs()]);
    setVipRequests([...AuthService.getVipRequests()]);
  };

  const handleApproveVip = (requestId: string) => {
    const res = AuthService.approveVipRequest(requestId, currentUser?.name || 'Admin');
    if (res.success) {
      showFeedback('success', res.message);
      loadData();
    } else {
      showFeedback('error', res.message);
    }
  };

  const handleRejectVip = (requestId: string) => {
    const res = AuthService.rejectVipRequest(requestId, currentUser?.name || 'Admin');
    if (res.success) {
      showFeedback('success', res.message);
      loadData();
    } else {
      showFeedback('error', res.message);
    }
  };

  const handleToggleMonetizationQuick = (newVal: boolean) => {
    const updated = AuthService.updateSystemConfig(
      { monetizationEnabled: newVal },
      currentUser?.name || 'Chief Administrator'
    );
    setSystemConfig({ ...updated });
    if (newVal) {
      showFeedback('success', '✅ ইনকাম ও মনিটাইজেশন সিস্টেম চালু করা হয়েছে (পয়েন্ট, রিওয়ার্ডেড অ্যাড ও ভিআইপি সক্রিয়)!');
    } else {
      showFeedback('success', '🟡 সাইট রেডি না হওয়া পর্যন্ত ইনকাম সিস্টেম বন্ধ করা হয়েছে — সবার জন্য সব ১০টি সিগন্যাল সম্পূর্ণ ফ্রি!');
    }
  };

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  if (!isOpen) return null;

  // Verify Admin authorization
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'avictgboy@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'admin@bybitai.com';

  const handleToggleStatus = (userId: string, currentStatus: string, userEmail: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    AuthService.updateUserStatus(userId, nextStatus);
    AuthService.logAdminAction(
      `ইউজারের স্ট্যাটাস পরিবর্তন: ${userEmail} (${nextStatus})`,
      currentUser?.name || 'Admin'
    );
    showFeedback('success', `ইউজার একাউন্ট ${nextStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।`);
    loadData();
  };

  const handleToggleRole = (userId: string, currentRole: string, userEmail: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    AuthService.updateUserRole(userId, nextRole);
    AuthService.logAdminAction(
      `ইউজার রোল পরিবর্তন: ${userEmail} -> ${nextRole.toUpperCase()}`,
      currentUser?.name || 'Admin'
    );
    showFeedback('success', `রোল সফলভাবে ${nextRole.toUpperCase()}-এ পরিবর্তন করা হয়েছে।`);
    loadData();
  };

  const handleDeleteUser = (userId: string, userEmail: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে (${userEmail}) ইউজার অ্যাকাউন্টটি সম্পূর্ণ ডিলিট করতে চান?`)) {
      AuthService.deleteUser(userId, currentUser?.name || 'Admin');
      showFeedback('success', 'ইউজার সফলভাবে মুছে ফেলা হয়েছে।');
      loadData();
    }
  };

  const handleAdminCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName || !newUserPassword) {
      showFeedback('error', 'সকল ফিল্ড পূরণ করা আবশ্যক।');
      return;
    }
    const res = AuthService.adminCreateUser(
      newUserName,
      newUserEmail,
      newUserPassword,
      newUserRole,
      currentUser?.name || 'Admin'
    );
    if (res.success) {
      showFeedback('success', `নতুন অ্যাকাউন্ট (${newUserEmail}) সফলভাবে তৈরি হয়েছে!`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setShowAddUserModal(false);
      loadData();
    } else {
      showFeedback('error', res.error || 'ইউজার তৈরি ব্যর্থ হয়েছে।');
    }
  };

  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPasswordInput) return;
    const res = AuthService.adminResetUserPassword(
      resetTargetUser.id,
      newPasswordInput,
      currentUser?.name || 'Admin'
    );
    if (res.success) {
      showFeedback('success', res.message);
      setResetTargetUser(null);
      setNewPasswordInput('');
      loadData();
    } else {
      showFeedback('error', res.message);
    }
  };

  const handleSaveSystemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    AuthService.updateSystemConfig(systemConfig, currentUser?.name || 'Admin');
    showFeedback('success', 'সিস্টেম ও ট্রেডিং সিগন্যাল কনফিগারেশন সফলভাবে সেভ করা হয়েছে!');
    loadData();
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle || !ancContent) return;

    AuthService.addAnnouncement(ancTitle, ancContent, ancType, currentUser?.name || 'Administrator');
    AuthService.logAdminAction(`নতুন নোটিশ/সিগন্যাল প্রকাশ: ${ancTitle}`, currentUser?.name || 'Admin');
    setAncTitle('');
    setAncContent('');
    showFeedback('success', 'নতুন সিগন্যাল/নোটিশ সফলভাবে পাবলিশ করা হয়েছে!');
    loadData();
  };

  const handleDeleteAnnouncement = (id: string, title: string) => {
    AuthService.deleteAnnouncement(id);
    AuthService.logAdminAction(`নোটিশ ডিলিট করা হয়েছে: ${title}`, currentUser?.name || 'Admin');
    showFeedback('success', 'পোস্টটি মুছে ফেলা হয়েছে।');
    loadData();
  };

  const handleExportUsersJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bybit_ai_users_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    AuthService.logAdminAction('ইউজার ডাটাবেস JSON ব্যাকআপ ডাউনলোড করা হয়েছে', currentUser?.name || 'Admin');
  };

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-100 flex items-center gap-2">
                  👑 এডমিন ম্যানেজমেন্ট ও কমান্ড কন্ট্রোল
                </h2>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SYSTEM ADMIN
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                ইউজার অ্যাকাউন্ট, সিস্টেম কনফিগারেশন, ভিআইপি সিগন্যাল ব্রডকাস্ট ও সিকিউরিটি পরিচালনা করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0 animate-fadeIn ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950 border-b border-emerald-500/40 text-emerald-300'
                : 'bg-red-950 border-b border-red-500/40 text-red-300'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Access Warning if not admin */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <Lock className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200">
              শুধুমাত্র এডমিন এক্সেস অনুমতিপ্রাপ্ত
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              এডমিন ড্যাশবোর্ড ব্যবহারের জন্য অনুগ্রহ করে এডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।
            </p>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950 px-3 sm:px-4 py-2 border-b border-slate-800 shrink-0 overflow-x-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('USERS')}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'USERS'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ইউজার ব্যবস্থাপনা ({users.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('VIP_REQUESTS')}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'VIP_REQUESTS'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>
                  👑 ভিআইপি রিকোয়েস্ট ({vipRequests.filter((r) => r.status === 'pending').length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CONFIG')}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'CONFIG'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>সিগন্যাল ও সিস্টেম কন্ট্রোল</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('MONETIZATION')}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'MONETIZATION'
                    ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>💰 অ্যাড নেটওয়ার্ক ও মনিটাইজেশন</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ANNOUNCEMENTS')}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'ANNOUNCEMENTS'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>সিগন্যাল ও নোটিশ পোস্ট ({announcements.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PORTFOLIOS')}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'PORTFOLIOS'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>ট্রেডার পোর্টফোলিও</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('AUDIT_LOGS')}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'AUDIT_LOGS'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>অডিট লগ ({auditLogs.length})</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Quick Master Income / Monetization Control Banner */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 shadow-xl ${
                  systemConfig.monetizationEnabled
                    ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/40 text-emerald-300'
                    : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      systemConfig.monetizationEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                        {systemConfig.monetizationEnabled ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                            <span>🟢 ইনকাম ও মনিটাইজেশন মোড: চালু (Active)</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                            <span>🟡 ইনকাম মোড বন্ধ / সম্পূর্ণ ফ্রি টেস্ট মোড (Free Open Mode)</span>
                          </>
                        )}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-black ${
                          systemConfig.monetizationEnabled
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {systemConfig.monetizationEnabled ? 'REWARDED ADS & VIP ON' : '100% FREE SIGNALS'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {systemConfig.monetizationEnabled
                        ? 'বিজ্ঞাপন ও পয়েন্ট সিস্টেম সক্রিয় আছে: ফ্রি ইউজারদের সিগন্যাল দেখতে পয়েন্ট খরচ বা ৩০ সেকেন্ড অ্যাড দেখতে হবে এবং ভিআইপি সাবস্ক্রিপশন চালু রয়েছে।'
                        : '💡 সাইট পুরোপুরি রেডি না হওয়া পর্যন্ত সকল ১০টি প্রিমিয়াম সিগন্যাল ও এনালাইসিস সবার জন্য সম্পূর্ণ ফ্রিতে আনলকড থাকবে (কোনো পয়েন্ট কাটা বা বিজ্ঞাপন দেখানো হবে না)।'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleMonetizationQuick(!systemConfig.monetizationEnabled)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
                      systemConfig.monetizationEnabled
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-400'
                        : 'bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 shadow-emerald-500/30 font-black'
                    }`}
                  >
                    {systemConfig.monetizationEnabled ? (
                      <>
                        <Zap className="w-3.5 h-3.5 text-rose-400" />
                        <span>ইনকাম অফ করুন (সবার জন্য ফ্রি মোড)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>ইনকাম মোড অন করুন (Turn ON)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* TAB 1: User Management Panel */}
              {activeTab === 'USERS' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="নাম বা ইমেইল দিয়ে ইউজার খুঁজুন..."
                          value={searchUserQuery}
                          onChange={(e) => setSearchUserQuery(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>

                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="ALL">সকল রোল</option>
                        <option value="admin">👑 এডমিন</option>
                        <option value="user">👤 সাধারণ ইউজার</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(!showAddUserModal)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>নতুন ইউজার তৈরি করুন</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportUsersJson}
                        className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                        title="ইউজার ডাটাবেজ ব্যাকআপ ডাউনলোড করুন"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">ব্যাকআপ</span>
                      </button>
                    </div>
                  </div>

                  {/* Create New User Inline Card */}
                  {showAddUserModal && (
                    <form
                      onSubmit={handleAdminCreateUser}
                      className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                          <UserPlus className="w-4 h-4" />
                          <span>নতুন ইউজার অ্যাকাউন্ট তৈরি করুন (Manual Account Creation):</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">পুরো নাম (Full Name):</label>
                          <input
                            type="text"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="যেমন: সাকিব আল হাসান"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">ইমেইল (Email):</label>
                          <input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="trader@domain.com"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">পাসওয়ার্ড (Password):</label>
                          <input
                            type="password"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">রোল (Role):</label>
                          <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                          >
                            <option value="user">👤 সাধারণ ট্রেডার (User)</option>
                            <option value="admin">👑 সিস্টেম এডমিন (Admin)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-bold"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md"
                        >
                          অ্যাকাউন্ট সেভ করুন
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Password Reset Modal/Prompt */}
                  {resetTargetUser && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Key className="w-4 h-4" />
                          <span>পাসওয়ার্ড রিসেট: {resetTargetUser.name} ({resetTargetUser.email})</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setResetTargetUser(null)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleExecutePasswordReset} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">নতুন সিকিউরিটি পাসওয়ার্ড লিখুন:</label>
                          <input
                            type="text"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="যেমন: securePass123*"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shrink-0"
                          >
                            পাসওয়ার্ড আপডেট করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setResetTargetUser(null)}
                            className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold"
                          >
                            বাতিল
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Registered Users Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">ইউজার নাম & ইমেইল</th>
                          <th className="p-3.5">রোল (Role)</th>
                          <th className="p-3.5">অবস্থা (Status)</th>
                          <th className="p-3.5">পদ্ধতি</th>
                          <th className="p-3.5">পোর্টফোলিও</th>
                          <th className="p-3.5 text-right">এডমিন অ্যাকশনসমূহ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-slate-100 font-sans flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.role === 'admin' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </td>

                            <td className="p-3.5">
                              <button
                                type="button"
                                onClick={() => handleToggleRole(u.id, u.role, u.email)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                                  u.role === 'admin'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                                title="রোল পরিবর্তন করতে ক্লিক করুন"
                              >
                                {u.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
                              </button>
                            </td>

                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.status === 'active'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {u.status === 'active' ? '🟢 Active' : '🔴 Suspended'}
                              </span>
                            </td>

                            <td className="p-3.5 text-slate-400 text-[11px] uppercase">
                              {u.loginProvider || 'email'}
                            </td>

                            <td className="p-3.5 font-bold text-amber-400">
                              {u.portfolio?.length || 0} টি
                            </td>

                            <td className="p-3.5 text-right space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setResetTargetUser(u);
                                  setNewPasswordInput('');
                                }}
                                className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold transition-all"
                                title="পাসওয়ার্ড রিসেট করুন"
                              >
                                🔑 পাসওয়ার্ড
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u.id, u.status, u.email)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                  u.status === 'active'
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                                }`}
                              >
                                {u.status === 'active' ? 'স্থগিত' : 'সক্রিয়'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all inline-flex items-center justify-center align-middle"
                                title="ইউজার ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: VIP Subscription Requests Approval & Management */}
              {activeTab === 'VIP_REQUESTS' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-amber-500/30">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        <span>ভিআইপি সাবস্ক্রিপশন ও পেমেন্ট অ্যাক্টিভেশন রিকোয়েস্ট (VIP Requests)</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        যেসব ইউজার রেজিস্টার করে ভিআইপি পেমেন্ট সাবমিট করেছেন, তাদের TxID যাচাই করে ১-ক্লিকে ভিআইপি অনুমোদন করুন।
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black">
                        অপেক্ষমান: {vipRequests.filter((r) => r.status === 'pending').length} টি
                      </span>
                    </div>
                  </div>

                  {vipRequests.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <Crown className="w-10 h-10 text-amber-400/40 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-300">কোনো ভিআইপি রিকোয়েস্ট নেই</h4>
                      <p className="text-xs text-slate-500">
                        ইউজাররা ভিআইপি পেজ থেকে পেমেন্ট হ্যাশ সাবমিট করলে এখানে তালিকা দেখাবে।
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
                        <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-3 py-2.5">ইউজার তথ্য</th>
                            <th className="px-3 py-2.5">পেমেন্ট (USDT)</th>
                            <th className="px-3 py-2.5">TxID / Transaction Hash</th>
                            <th className="px-3 py-2.5">তারিখ</th>
                            <th className="px-3 py-2.5">স্ট্যাটাস</th>
                            <th className="px-3 py-2.5 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {vipRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="px-3 py-3">
                                <div className="font-bold text-slate-100">{req.userName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{req.userEmail}</div>
                                {req.whatsapp && (
                                  <div className="text-[10px] text-emerald-400 font-mono">WA: {req.whatsapp}</div>
                                )}
                              </td>
                              <td className="px-3 py-3 font-mono font-bold text-emerald-400">
                                ${req.amountUsdt} USDT ({req.planDurationDays || 30} Days)
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 max-w-[220px]">
                                  <span className="truncate">{req.txHash}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(req.txHash);
                                      showFeedback('success', 'TxID কপি করা হয়েছে!');
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-white"
                                    title="কপি করুন"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-[11px] text-slate-400">
                                {new Date(req.createdAt).toLocaleDateString('bn-BD', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    req.status === 'approved'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : req.status === 'rejected'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  }`}
                                >
                                  {req.status === 'approved'
                                    ? 'অনুমোদিত (VIP)'
                                    : req.status === 'rejected'
                                    ? 'বাতিল'
                                    : 'অপেক্ষমান'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right">
                                {req.status === 'pending' ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleApproveVip(req.id)}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all"
                                    >
                                      অনুমোদন করুন
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectVip(req.id)}
                                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-300 text-[11px] font-bold transition-all"
                                    >
                                      বাতিল
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {req.reviewedBy ? `বাই ${req.reviewedBy}` : 'সম্পন্ন'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: System & Signal Controls */}
              {activeTab === 'CONFIG' && (
                <form onSubmit={handleSaveSystemConfig} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase flex items-center gap-2">
                          <Sliders className="w-4 h-4" />
                          <span>ট্রেডিং সিগন্যাল ইঞ্জিন ও সিস্টেম সেটিংস (Signal Engine & Platform Settings)</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          এডমিন হিসেবে এখান থেকে প্ল্যাটফর্মের লাইভ সিগন্যাল কোয়ালিটি ও জরুরি ফিচারসমূহ পরিচালনা করতে পারবেন।
                        </p>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-98"
                      >
                        কনফিগারেশন সেভ করুন
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Win Rate Threshold Slider */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-amber-400" />
                            মিনিমাম উইন-রেট কনফিডেন্স থ্রেশহোল্ড:
                          </label>
                          <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {systemConfig.minWinRateThreshold}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={90}
                          step={5}
                          value={systemConfig.minWinRateThreshold}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, minWinRateThreshold: Number(e.target.value) })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">
                          এই স্কোরের নিচের কোনো সিগন্যাল হাই-উইন রেট পিক্সে প্রদর্শিত হবে না।
                        </p>
                      </div>

                      {/* Max Leverage Cap */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          ম্যাক্সিমাম লেভারেজ লিমিট (Leverage Cap):
                        </label>
                        <select
                          value={systemConfig.maxLeverageLimit}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, maxLeverageLimit: Number(e.target.value) })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                        >
                          <option value={5}>5x (Ultra Safe Mode)</option>
                          <option value={10}>10x (Balanced Conservative)</option>
                          <option value={20}>20x (Standard Recommended)</option>
                          <option value={50}>50x (Aggressive Pro)</option>
                          <option value={100}>100x (High Risk Unlimited)</option>
                        </select>
                        <p className="text-[10px] text-slate-400">
                          ইউজারদের জন্য সর্বোচ্চ কত লেভারেজ রিকমেন্ড করা হবে।
                        </p>
                      </div>

                      {/* Emergency Alert Headline Banner */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          জরুরি গ্লোবাল নোটিশ ব্যানার (Emergency Global Flash Alert):
                        </label>
                        <input
                          type="text"
                          value={systemConfig.emergencyAlert}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, emergencyAlert: e.target.value })
                          }
                          placeholder="খালি রাখলে কোনো জরুরি ব্যানার দেখাবে না। যেমন: বাইবিট মার্কেট হাই ভলাটিলিটি সতর্কবার্তা..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                        />
                        <p className="text-[10px] text-slate-400">
                          এখানে বার্তা লিখলে প্ল্যাটফর্মের সবার স্ক্রিনে লাল ফ্ল্যাশ ব্যানার প্রদর্শিত হবে।
                        </p>
                      </div>

                      {/* Toggles */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-200">🚀 এআই অটো-অ্যানালাইসিস ইঞ্জিন</div>
                          <div className="text-[10px] text-slate-400">রিয়েল-টাইম বাইবিট ট্রেন্ড ক্যালকুলেশন</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={systemConfig.autoAiAnalysis}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, autoAiAnalysis: e.target.checked })
                          }
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-200">📡 টেলিগ্রাম অটো-সিগন্যাল সিঙ্ক</div>
                          <div className="text-[10px] text-slate-400">ভিআইপি সিগন্যাল অ্যালার্ট ব্রডকাস্ট</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={systemConfig.telegramBroadcast}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, telegramBroadcast: e.target.checked })
                          }
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-200">💎 শুধুমাত্র ভিআইপি সিগন্যাল মোড</div>
                          <div className="text-[10px] text-slate-400">সাধারণ ইউজারদের জন্য প্রিমিয়াম ফিল্টার</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={systemConfig.vipSignalsOnly}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, vipSignalsOnly: e.target.checked })
                          }
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-red-400">⚠️ রক্ষণাবেক্ষণ মোড (Maintenance Mode)</div>
                          <div className="text-[10px] text-slate-400">সাইটে রক্ষণাবেক্ষণ নোটিশ অন/অফ করুন</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={systemConfig.maintenanceMode}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, maintenanceMode: e.target.checked })
                          }
                          className="w-4 h-4 accent-red-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB: Monetization, Points & Ad Networks Setup */}
              {activeTab === 'MONETIZATION' && (
                <form onSubmit={handleSaveSystemConfig} className="space-y-4">
                  {/* Master Switch & Header */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase flex items-center gap-2">
                          <Coins className="w-4 h-4" />
                          <span>মনিটাইজেশন, পয়েন্ট সিস্টেম ও অ্যাড নেটওয়ার্ক কন্ট্রোল</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          ফ্রি ইউজারদের জন্য পয়েন্ট/বিজ্ঞাপন ও পেইড ভিআইপি সাবস্ক্রিপশন পরিচালনা করুন।
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>সেভ করুন</span>
                        </button>
                      </div>
                    </div>

                    {/* Master Monetization Toggle */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span>পয়েন্ট ও অ্যাড মনিটাইজেশন সিস্টেম সক্রিয় রাখুন</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          অন থাকলে ফ্রি ইউজারদের টপ সিগন্যাল দেখতে পয়েন্ট খরচ করতে হবে বা অ্যাড দেখতে হবে।
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemConfig.monetizationEnabled}
                        onChange={(e) =>
                          setSystemConfig({ ...systemConfig, monetizationEnabled: e.target.checked })
                        }
                        className="w-5 h-5 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Top Ad Networks Direct Registration Links Hub */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Megaphone className="w-4 h-4 text-amber-400" />
                        <span>সেরা ক্রিপ্টো অ্যাড নেটওয়ার্কের ডিরেক্ট জয়েনিং লিঙ্ক (Ad Networks Directory):</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {/* Network 1: Coinzilla */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">Coinzilla</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">#১ ক্রিপ্টো অ্যাড</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Bybit, Binance-এর হাই-সিপিএম ব্যানার অ্যাড ও USDT/BTC পে-আউট।</p>
                        <a
                          href="https://coinzilla.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Coinzilla সাইন-আপ</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Network 2: A-ADS */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400">A-ADS</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">ইনস্ট্যান্ট এপ্রুভ</span>
                        </div>
                        <p className="text-[10px] text-slate-400">কোনো ডকুমেন্টস ছাড়াই ১ মিনিটে ব্যানার কোড নিয়ে লাইভ আয় শুরু করুন।</p>
                        <a
                          href="https://a-ads.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          <span>A-ADS কোড নিন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Network 3: Monetag / PropellerAds */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-400">PropellerAds / Monetag</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">#১ Rewarded Zone</span>
                        </div>
                        <p className="text-[10px] text-slate-400">৩০ সেকেন্ড রিওয়ার্ডেড ও স্মার্ট ইন্টারস্টিশিয়াল অ্যাডের জন্য ১ম চয়েস।</p>
                        <div className="flex gap-1.5">
                          <a
                            href="https://monetag.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-500 hover:text-slate-950 text-slate-200 font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                          >
                            <span>Monetag</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <a
                            href="https://propellerads.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                          >
                            <span>PropellerAds</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      {/* Network 4: Bitmedia.io */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-400">Bitmedia.io</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Crypto Display</span>
                        </div>
                        <p className="text-[10px] text-slate-400">ক্রিপ্টো ট্রেডার ও এক্সচেঞ্জ টার্গেটেড ব্যানার অ্যাড নেটওয়ার্ক।</p>
                        <a
                          href="https://bitmedia.io"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-purple-500 hover:text-slate-950 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Bitmedia জয়েন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Points & Rewards Policy Config */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>পয়েন্ট পলিসি ও ফ্রি সিগন্যাল আনলক সেটিংস (Points Configuration):</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">১টি সিগন্যাল আনলক করতে পয়েন্ট:</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={systemConfig.pointsCostPerSignal}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, pointsCostPerSignal: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-slate-500">ডিফল্ট: ১০ পয়েন্ট</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">রিওয়ার্ডেড অ্যাড দেখলে পাবে:</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={systemConfig.pointsRewardPerAd}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, pointsRewardPerAd: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-slate-500">ডিফল্ট: ১০ পয়েন্ট</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">অ্যাড টাইমার ডিউরেশন (সেকেন্ড):</label>
                        <input
                          type="number"
                          min={5}
                          max={60}
                          value={systemConfig.adWatchDurationSeconds || 30}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, adWatchDurationSeconds: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                        />
                        <span className="text-[10px] text-slate-500">ডিফল্ট: ৩০ সেকেন্ড (৩টি অ্যাড)</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">দৈনিক ফ্রি লগইন বোনাস:</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={systemConfig.dailyLoginPointsReward}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, dailyLoginPointsReward: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-slate-500">ডিফল্ট: ৫ পয়েন্ট</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">নতুন সাইন-আপ বোনাস:</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={systemConfig.signupBonusPoints}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, signupBonusPoints: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-slate-500">ডিফল্ট: ২০ পয়েন্ট</span>
                      </div>
                    </div>
                  </div>

                  {/* VIP Subscription & Payment Wallet Settings */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>ভিআইপি সাবস্ক্রিপশন ও পেমেন্ট ওয়ালেট সেটিংস (VIP Subscription):</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">মাসিক VIP ফি ($ USDT):</label>
                        <input
                          type="number"
                          min={1}
                          value={systemConfig.vipMonthlyFeeUsdt}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, vipMonthlyFeeUsdt: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-300">এডমিন USDT (TRC20) পেমেন্ট ওয়ালেট এড্রেস:</label>
                        <input
                          type="text"
                          value={systemConfig.adminUsdtAddress}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, adminUsdtAddress: e.target.value })
                          }
                          placeholder="TX7nBybitAiOfficialUSDTtrc20SecureWallet"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">এডমিন টেলিগ্রাম আইডি (Support ID):</label>
                        <input
                          type="text"
                          value={systemConfig.adminContactTelegram}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, adminContactTelegram: e.target.value })
                          }
                          placeholder="@BybitAiAdmin"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">এডমিন হোয়াটসঅ্যাপ নাম্বার:</label>
                        <input
                          type="text"
                          value={systemConfig.adminContactWhatsapp}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, adminContactWhatsapp: e.target.value })
                          }
                          placeholder="+8801700000000"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Partner Banner / Affiliate Ads Setup */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Megaphone className="w-4 h-4 text-emerald-400" />
                        <span>কাস্টম স্পন্সর / Bybit অ্যাফিলিয়েট ব্যানার সেটআপ (Sponsor Banner):</span>
                      </h4>
                      <input
                        type="checkbox"
                        checked={systemConfig.customBannerEnabled}
                        onChange={(e) =>
                          setSystemConfig({ ...systemConfig, customBannerEnabled: e.target.checked })
                        }
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">ব্যানার টেক্সট / অফার হেডলাইন:</label>
                        <input
                          type="text"
                          value={systemConfig.customBannerText}
                          onChange={(e) =>
                            setSystemConfig({ ...systemConfig, customBannerText: e.target.value })
                          }
                          placeholder="যেমন: 🔥 Bybit VIP ট্রেডিং সাইন-আপ বোনাস $30,000 পর্যন্ত জিতে নিন!"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">অ্যাফিলিয়েট / ডেস্টিনেশন লিঙ্ক (Link):</label>
                          <input
                            type="text"
                            value={systemConfig.customBannerLink}
                            onChange={(e) =>
                              setSystemConfig({ ...systemConfig, customBannerLink: e.target.value })
                            }
                            placeholder="https://partner.bybit.com/b/myref"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">ব্যানার ইমেজ লিঙ্ক (Image URL):</label>
                          <input
                            type="text"
                            value={systemConfig.customBannerImgUrl}
                            onChange={(e) =>
                              setSystemConfig({ ...systemConfig, customBannerImgUrl: e.target.value })
                            }
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Configuration Footer Bar */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
                    <div className="text-xs text-slate-300">
                      সব পরিবর্তন কনফার্ম করতে সেভ বাটনে ক্লিক করুন।
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>মনিটাইজেশন কনফিগারেশন সেভ করুন</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: Announcements & Signal Broadcast */}
              {activeTab === 'ANNOUNCEMENTS' && (
                <div className="space-y-4">
                  {/* Create New Announcement Form */}
                  <form
                    onSubmit={handleCreateAnnouncement}
                    className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3"
                  >
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-amber-400" />
                      নতুন নোটিশ বা সিগন্যাল অ্যালার্ট পোস্ট করুন (Post Announcement):
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">টাইটেল (Title):</label>
                        <input
                          type="text"
                          value={ancTitle}
                          onChange={(e) => setAncTitle(e.target.value)}
                          placeholder="যেমন: আজকের ১০টি Losers সিগন্যাল পাবলিশড হয়েছে!"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">ক্যাটাগরি (Type):</label>
                        <select
                          value={ancType}
                          onChange={(e) => setAncType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        >
                          <option value="signal_alert">🚨 ট্রেডিং সিগন্যাল অ্যালার্ট</option>
                          <option value="update">🚀 সিস্টেম আপডেট</option>
                          <option value="info">ℹ️ সাধারণ নোটিশ</option>
                          <option value="warning">⚠️ রিস্ক অ্যালার্ট</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">মেসেজ কনটেন্ট (Content):</label>
                      <textarea
                        value={ancContent}
                        onChange={(e) => setAncContent(e.target.value)}
                        placeholder="বিস্তারিত বার্তা বা সিগন্যালের নির্দেশনা লিখুন..."
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>সবার জন্য পাবলিশ করুন</span>
                    </button>
                  </form>

                  {/* Active Announcements List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      পাবলিশড নোটিশ তালিকা ({announcements.length}):
                    </h3>

                    <div className="space-y-2">
                      {announcements.map((anc) => (
                        <div
                          key={anc.id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-100">{anc.title}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold uppercase border border-amber-500/20">
                                {anc.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{anc.content}</p>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              পোস্টকারী: {anc.author} • {new Date(anc.createdAt).toLocaleTimeString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(anc.id, anc.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all shrink-0"
                            title="পোস্ট মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: User Portfolios Hub */}
              {activeTab === 'PORTFOLIOS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      সকল রেজিস্টার্ড ইউজারের ক্রিপ্টো পোর্টফোলিও পর্যবেক্ষণ:
                    </h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                      মোট সক্রিয় পোর্টফোলিও: {users.reduce((acc, u) => acc + (u.portfolio?.length || 0), 0)} টি কয়েন
                    </span>
                  </div>

                  <div className="space-y-3">
                    {users.map((u) => (
                      <div key={u.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <div>
                            <span className="font-bold text-xs text-slate-100">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">({u.email})</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            পোর্টফোলিও: {u.portfolio?.length || 0} টি কয়েন
                          </span>
                        </div>

                        {u.portfolio && u.portfolio.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            {u.portfolio.map((item) => (
                              <div
                                key={item.id}
                                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-0.5"
                              >
                                <div className="font-bold text-slate-200 flex justify-between">
                                  <span>{item.coinName} ({item.symbol})</span>
                                  <span className="text-emerald-400">{item.amount}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  ক্রয় মূল্য: ${item.buyPrice} | তারিখ: {item.buyDate}
                                </div>
                                {item.notes && (
                                  <div className="text-[9px] text-amber-300/80 italic pt-0.5">
                                    নোট: {item.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">এই ইউজার এখনও কোনো পোর্টফোলিও কয়েন যুক্ত করেনি।</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Audit Logs */}
              {activeTab === 'AUDIT_LOGS' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>এডমিন অ্যাকশন অডিট ট্রেইল (Audit Logs):</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      মোট লগ রেকর্ড: {auditLogs.length} টি
                    </span>
                  </div>

                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-200 flex items-center gap-2">
                            <span>🛡️ {log.action}</span>
                          </div>
                          {log.details && (
                            <p className="text-[11px] text-slate-400 font-mono">{log.details}</p>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono block">
                            অ্যাক্টর: <strong className="text-amber-400">{log.adminName}</strong> • {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
