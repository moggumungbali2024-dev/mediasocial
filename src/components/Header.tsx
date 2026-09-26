import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Database, 
  RotateCcw, 
  Sparkles, 
  ChevronDown, 
  Store, 
  Layers, 
  FileText, 
  Users2, 
  CalendarCheck2,
  Bell,
  Activity,
  CheckCircle2,
  CheckCheck,
  ArrowRight,
  ExternalLink,
  DollarSign,
  UserCheck,
  Palette,
  Globe2,
  Timer,
  UserPlus,
  Shield,
  Briefcase,
  Camera,
  Check
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSqlModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenSqlModal }) => {
  const { 
    currentUser, 
    activeRole, 
    isHQOwner,
    isHQLeader,
    isHQCreative,
    isHQ,
    isBranchOwner,
    isBranchManager,
    canAccessBilling,
    canAccessUserManagement,
    currentBranch, 
    users,
    switchUser, 
    simulatedDate, 
    setSimulatedDate,
    resetToDefaultData,
    designRequests,
    invoices,
    activities,
    unreadNotificationsCount,
    markActivityAsRead,
    markAllActivitiesAsRead,
    whitelabelConfig,
    language,
    setLanguage,
    t
  } = usePortal();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showSimulateDatePicker, setShowSimulateDatePicker] = useState(false);

  // Count pending approvals for badge
  const pendingRequestsCount = designRequests.filter((r) => r.status === 'pending').length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === 'proof_uploaded').length;

  // Filter notifications for current user's role/branch
  const relevantNotifications = activities.filter((act) => {
    if (isHQ) return true;
    return act.branch_id === currentBranch?.id || !act.branch_id;
  }).slice(0, 8);

  const handleNotificationClick = (actId: string, linkTab?: string) => {
    markActivityAsRead(actId);
    setIsNotificationOpen(false);
    if (linkTab) {
      if (linkTab === 'billing' && !canAccessBilling) return;
      if (linkTab === 'users' && !canAccessUserManagement) return;
      setActiveTab(linkTab);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'hq_owner':
      case 'pusat_admin':
        return { 
          label: language === 'ko' ? '본사 대표' : 'HQ OWNER', 
          desc: language === 'ko' ? '총괄 관리자' : 'Super Admin',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
        };
      case 'hq_leader':
        return { 
          label: language === 'ko' ? '본사 팀장' : 'HQ LEADER', 
          desc: language === 'ko' ? '디렉터 & 리드' : 'Creative Director',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
        };
      case 'hq_creative':
        return { 
          label: language === 'ko' ? '크리에이티브' : 'HQ CREATIVE', 
          desc: language === 'ko' ? '디자이너 / 에디터' : 'Designer / Video',
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
        };
      case 'branch_owner':
        return { 
          label: language === 'ko' ? '지점 대표' : 'BRANCH OWNER', 
          desc: language === 'ko' ? '가맹점주' : 'Franchisee',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
        };
      case 'branch_manager':
        return { 
          label: language === 'ko' ? '매장 매니저' : 'STORE MANAGER', 
          desc: language === 'ko' ? '현장 관리자' : 'Operations',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
        };
      default:
        return { label: role, desc: '', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const roleBadge = getRoleBadge(activeRole);

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner: Date Simulator, Language Toggle, Quick DB Controls */}
      <div className="bg-slate-950 px-3 sm:px-6 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-800/50 text-[11px]">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{t('simulatedDate')}: <strong>{simulatedDate}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px]">
            <button
              onClick={() => setSimulatedDate('2026-09-21')}
              className={`px-2 py-0.5 rounded transition ${
                simulatedDate === '2026-09-21'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Pre-cutoff date"
            >
              21 Sep (H &lt; 25)
            </button>
            <button
              onClick={() => setSimulatedDate('2026-09-26')}
              className={`px-2 py-0.5 rounded transition ${
                simulatedDate === '2026-09-26'
                  ? 'bg-red-500 text-white font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Post-cutoff simulation date (> 25)"
            >
              26 Sep (Cutoff &gt; 25)
            </button>
            <button
              onClick={() => setShowSimulateDatePicker(!showSimulateDatePicker)}
              className="text-slate-400 hover:text-white underline ml-1 hidden xs:inline"
            >
              {showSimulateDatePicker ? t('closeDate') : t('toggleDate')}
            </button>
          </div>

          {showSimulateDatePicker && (
            <input
              type="date"
              value={simulatedDate}
              onChange={(e) => setSimulatedDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-amber-400 font-mono"
            />
          )}
        </div>

        {/* Right Tools: Bilingual EN/KO Toggle & System Tools */}
        <div className="flex items-center gap-2">
          {/* Clean Bilingual Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇺🇸</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => setLanguage('ko')}
              className={`px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 ${
                language === 'ko'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇰🇷</span>
              <span>한국어</span>
            </button>
          </div>

          <button
            onClick={onOpenSqlModal}
            className="hidden md:flex items-center gap-1 text-sky-400 hover:text-sky-300 transition bg-sky-950/50 hover:bg-sky-900/50 px-2 py-0.5 rounded border border-sky-800/60 text-[11px]"
          >
            <Database className="w-3 h-3" />
            <span>{t('supabaseSchema')}</span>
          </button>

          <button
            onClick={resetToDefaultData}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition text-[11px] px-1.5 py-0.5"
            title={t('resetDemo')}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden lg:inline">{t('resetDemo')}</span>
          </button>
        </div>
      </div>

      {/* Main Bar: Logo, Brand & Profile */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Dynamic Whitelabel Brand Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {whitelabelConfig.brand_logo_url ? (
            <img 
              src={whitelabelConfig.brand_logo_url} 
              alt={whitelabelConfig.brand_name} 
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl bg-white p-1 shadow-lg shrink-0"
            />
          ) : (
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl tracking-tighter text-slate-950 shadow-lg shrink-0 ${
              whitelabelConfig.theme_accent === 'amber' ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 shadow-orange-500/20' :
              whitelabelConfig.theme_accent === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/20' :
              whitelabelConfig.theme_accent === 'sky' ? 'bg-gradient-to-br from-sky-400 to-blue-600 shadow-blue-500/20' :
              whitelabelConfig.theme_accent === 'indigo' ? 'bg-gradient-to-br from-indigo-400 to-purple-600 shadow-indigo-500/20' :
              whitelabelConfig.theme_accent === 'rose' ? 'bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-500/20' :
              'bg-slate-800 text-white border border-slate-700'
            }`}>
              {whitelabelConfig.brand_monogram || 'MG'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white uppercase font-['Space_Grotesk'] truncate">
                {whitelabelConfig.brand_name || 'MOGGUMUNG'}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30 shrink-0">
                {whitelabelConfig.hq_location ? whitelabelConfig.hq_location.split(' ')[0] : 'PORTAL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden xs:block">
              {whitelabelConfig.brand_subtitle || t('hqSubtitle')}
            </p>
          </div>
        </div>

        {/* Right Actions: Notification Bell + User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition flex items-center justify-center"
              title={t('notifications')}
              aria-label={t('notifications')}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-red-500 text-white font-black text-[9px] sm:text-[10px] items-center justify-center">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 text-xs overflow-hidden">
                <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {t('notifications')}
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => markAllActivitiesAsRead()}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    {t('markAllAsRead')}
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                  {relevantNotifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      {t('noNotifications')}
                    </div>
                  ) : (
                    relevantNotifications.map((act) => {
                      const isUnread = !act.read_by.includes(currentUser.id);
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleNotificationClick(act.id, act.link_tab)}
                          className={`p-3 transition cursor-pointer hover:bg-slate-800/60 ${
                            isUnread ? 'bg-slate-800/30' : 'opacity-80'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-1 shrink-0">
                              {isUnread ? (
                                <span className="w-2 h-2 rounded-full bg-amber-400 block ring-2 ring-amber-400/20" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-600 block" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                    act.severity === 'success'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : act.severity === 'warning'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : act.severity === 'purple'
                                      ? 'bg-purple-500/20 text-purple-300'
                                      : 'bg-sky-500/20 text-sky-300'
                                  }`}
                                >
                                  {act.action_type.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {act.timestamp.split(' ')[1] || act.timestamp}
                                </span>
                              </div>

                              <p className="font-bold text-slate-100 text-xs leading-snug">
                                {act.title}
                              </p>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {act.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2.5 bg-slate-950 text-center border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      setActiveTab('activity');
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
                  >
                    <span>{t('viewAllActivity')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Role & Session Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-2.5 sm:px-3 py-1.5 rounded-xl text-left transition"
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                {isHQOwner ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : isHQLeader ? (
                  <Briefcase className="w-4 h-4 text-purple-400" />
                ) : isHQCreative ? (
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Store className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="truncate max-w-[120px] md:max-w-[150px]">{currentUser.full_name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px] md:max-w-[180px]">
                  {currentUser.job_title || (currentBranch ? currentBranch.name : whitelabelConfig.hq_location)}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 sm:ml-1" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-84 max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                {/* User hierarchy indicator */}
                <div className="px-3.5 py-2 border-b border-slate-700 bg-slate-900/60">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-1">
                    {t('switchQuickUser')}
                  </div>
                  <div className="text-[10px] text-amber-300 font-medium leading-tight">
                    {t('hierarchyHq')}<br />
                    {t('hierarchyBranch')}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                  {users.map((user) => {
                    const badge = getRoleBadge(user.role);
                    const isCurrent = currentUser.id === user.id;

                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition ${
                          isCurrent
                            ? 'bg-amber-500/20 text-amber-300 border-l-4 border-amber-400'
                            : 'hover:bg-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold text-amber-400">
                          {user.full_name.charAt(0)}
                        </div>
                        <div className="truncate flex-1">
                          <div className="font-semibold text-slate-100 flex items-center justify-between gap-1">
                            <span className="truncate">{user.full_name}</span>
                            <span className={`text-[8px] font-bold uppercase px-1 rounded ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {user.job_title || user.email}
                          </div>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Strict RBAC & Mobile Horizontal Scroll */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 border-t border-slate-800">
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-none text-xs sm:text-sm no-scrollbar">
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>{t('dashboard')}</span>
            {isHQ && (pendingRequestsCount > 0 || pendingInvoicesCount > 0) && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingRequestsCount + pendingInvoicesCount}
              </span>
            )}
          </button>

          {/* Requests Engine */}
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'requests'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>{t('requests')}</span>
          </button>

          {/* Creative Attendance Tab (HQ Team) */}
          {isHQ && (
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
                activeTab === 'attendance'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Timer className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('attendance')}</span>
            </button>
          )}

          {/* Exposure Matrix */}
          <button
            onClick={() => setActiveTab('exposure')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'exposure'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4 shrink-0" />
            <span>{t('exposure')}</span>
          </button>

          {/* Influencer Directory (Accessible to all including Branch Store Manager) */}
          <button
            onClick={() => setActiveTab('influencers')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'influencers'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users2 className="w-4 h-4 shrink-0" />
            <span>{t('influencers')}</span>
          </button>

          {/* Billing & Invoicing: ONLY HQ Owner, HQ Leader, Branch Owner */}
          {canAccessBilling && (
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
                activeTab === 'billing'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t('billing')}</span>
              {isHQ && pendingInvoicesCount > 0 && (
                <span className="bg-emerald-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingInvoicesCount}
                </span>
              )}
            </button>
          )}

          {/* User Management: ONLY Superadmin (HQ Owner) */}
          {canAccessUserManagement && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>{t('users')}</span>
            </button>
          )}

          {/* Whitelabel Settings (HQ Owner Only) */}
          {isHQOwner && (
            <button
              onClick={() => setActiveTab('whitelabel')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
                activeTab === 'whitelabel'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('whitelabel')}</span>
            </button>
          )}

          {/* Activity Log */}
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
              activeTab === 'activity'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>{t('activity')}</span>
            {unreadNotificationsCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
