import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Bell,
  Calendar,
  Clock,
  Sparkles,
  Store,
  ChevronDown,
  Building2,
  CheckCircle2,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Layers,
  FileText,
  Bot,
  Search,
  Plus,
  ChevronRight,
  UserPlus,
  Sun,
  Moon,
  MessageSquare,
  Lock,
  LogOut,
  User
} from 'lucide-react';
import { WhatsAppBroadcastModal } from './WhatsAppBroadcastModal.tsx';
import { ChangePasswordModal } from './ChangePasswordModal.tsx';
import { UserRole } from '../types.ts';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSqlModal: () => void;
  onOpenMobileMenu?: () => void;
  onOpenAiAssistant?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSqlModal,
  onOpenAiAssistant
}) => {
  const {
    currentUser,
    activeRole,
    isHQ,
    isHQOwner,
    isHQLeader,
    isHQCreative,
    currentBranch,
    branches,
    selectedBranchFilter,
    setSelectedBranchFilter,
    simulatedDate,
    setSimulatedDate,
    activities,
    unreadNotificationsCount,
    unreadChatCount,
    isActivityVisibleForUser,
    markActivityAsRead,
    markAllActivitiesAsRead,
    whitelabelConfig,
    themeColors,
    themeMode,
    toggleThemeMode,
    logout,
    language,
    t,
    isPlatformUser,
    isPlatformOwner,
    isPlatformFinance,
    isPlatformAdmin,
    platformBrands,
    activeTenantSlug,
    switchTenantBrand
  } = usePortal();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showSimulateDatePicker, setShowSimulateDatePicker] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Relevant notifications (strictly personalized)
  const relevantNotifications = activities.filter((act) => isActivityVisibleForUser(act)).slice(0, 8);

  const handleNotificationClick = (actId: string, linkTab?: string) => {
    markActivityAsRead(actId);
    setIsNotificationOpen(false);
    if (linkTab) {
      setActiveTab(linkTab);
    }
  };

  const getPageTitle = (tab: string): string => {
    switch (tab) {
      case 'dashboard':
        return t('dashboard');
      case 'requests':
        return t('requests');
      case 'tasks':
        return t('tasks');
      case 'exposure':
        return t('exposure');
      case 'calendar':
        return language === 'ko' ? '통합 일정 & 캘린더' : 'Production Calendar';
      case 'chat':
        return language === 'ko' ? '팀 협업 & 지점 메신저' : 'Collaboration Hub';
      case 'billing':
        return t('billing');
      case 'influencers':
        return t('influencers');
      case 'attendance':
        return t('attendance');
      case 'users':
        return t('users');
      case 'branches':
        return language === 'ko' ? '지점 및 계약 관리' : 'Franchise Branches';
      case 'whitelabel':
        return t('whitelabel');
      case 'omnipost':
        return language === 'ko' ? 'SNS 자동 발행' : 'Social Media Auto-Post';
      case 'activity':
        return t('activity');
      default:
        return t('dashboard');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'platform_owner':
        return { label: 'PLATFORM OWNER', color: 'bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-700' };
      case 'platform_finance':
        return { label: 'PLATFORM FINANCE', color: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700' };
      case 'platform_admin':
        return { label: 'PLATFORM ADMIN', color: 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700' };
      case 'hq_owner':
      case 'pusat_admin':
        return { label: 'HQ OWNER', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'hq_leader':
        return { label: 'HQ LEADER', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'hq_creative':
        return { label: 'HQ CREATIVE', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'branch_owner':
        return { label: 'BRANCH OWNER', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'branch_manager':
        return { label: 'STORE MANAGER', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      default:
        return { label: role, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const roleBadge = getRoleBadge(activeRole);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#11131a]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 shadow-xs transition-colors duration-200">
      {/* 1. Desktop Top Bar */}
      <div className="hidden md:flex items-center justify-between px-6 py-2.5">
        {/* Left: Breadcrumbs & Current Location */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm"
            >
              {whitelabelConfig.brand_monogram || 'MG'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-white">{whitelabelConfig.brand_name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
              <span className="font-semibold text-slate-600 dark:text-slate-300">{isHQ ? 'HQ Studio' : currentBranch?.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
              <span className="font-bold text-slate-900 dark:text-white">{getPageTitle(activeTab)}</span>
            </div>
          </div>
        </div>

        {/* Right: Controls, Branch Filter (HQ only), Date Simulator, WhatsApp (HQ only), Profile & Logout */}
        <div className="flex items-center gap-2.5">
          {/* Branch filter (HQ only) */}
          {isHQ && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-3 py-1.5 text-xs shadow-2xs">
              <Store className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-700 dark:text-slate-200 outline-hidden text-xs cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t('allBranches')}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Simulator Pill */}
          <div className="relative">
            <button
              onClick={() => setShowSimulateDatePicker(!showSimulateDatePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="font-mono">{simulatedDate}</span>
              {parseInt(simulatedDate.split('-')[2], 10) > 25 && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-800">
                  Cut-off
                </span>
              )}
            </button>

            {showSimulateDatePicker && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                  <span>{t('simulatedDate')}</span>
                  <button
                    onClick={() => setShowSimulateDatePicker(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                  >
                    {t('closeDate')}
                  </button>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSimulatedDate('2026-09-21');
                      setShowSimulateDatePicker(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      simulatedDate === '2026-09-21'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold">2026-09-21 (Normal Date &lt; 25)</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('cutoffBefore')}</div>
                  </button>

                  <button
                    onClick={() => {
                      setSimulatedDate('2026-09-26');
                      setShowSimulateDatePicker(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      simulatedDate === '2026-09-26'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-red-700 dark:text-red-400">2026-09-26 (Cut-off Day &gt; 25)</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('cutoffAfter')}</div>
                  </button>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <input
                      type="date"
                      value={simulatedDate}
                      onChange={(e) => {
                        if (e.target.value) setSimulatedDate(e.target.value);
                      }}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Direct Dispatcher Button - ONLY FOR HQ */}
          {isHQ && (
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition shadow-2xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Kirim WhatsApp ke Store Manager Cabang"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">WhatsApp Dispatcher</span>
            </button>
          )}

          {/* Theme Mode Toggle Button (Light vs Obsidian Dark) */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 transition shadow-2xs flex items-center justify-center cursor-pointer"
            title={themeMode === 'dark' ? 'Switch to Clean White Mode' : 'Switch to Obsidian Dark Mode'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* AI Assistant Quick Trigger Button */}
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              style={{ backgroundColor: themeColors.primaryLight, color: themeColors.primary }}
              className="px-3 py-1.5 rounded-2xl text-xs font-bold border border-current transition flex items-center gap-1.5 shadow-2xs hover:opacity-90 cursor-pointer"
              title="AI Assistant Copilot"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 transition relative shadow-2xs cursor-pointer"
              title={t('notifications')}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs"
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{t('notifications')}</span>
                    {unreadNotificationsCount > 0 && (
                      <span
                        style={{ backgroundColor: themeColors.primaryLight, color: themeColors.primary }}
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      >
                        {unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllActivitiesAsRead}
                      className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('markAllAsRead')}</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {relevantNotifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      <p>{t('noNotifications')}</p>
                    </div>
                  ) : (
                    relevantNotifications.map((act) => {
                      const isUnread = !act.read_by.includes(currentUser.id);
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleNotificationClick(act.id, act.link_tab)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                            isUnread ? 'bg-amber-50/40 dark:bg-amber-950/20 border-l-4 border-amber-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                              <Bell className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                                <span>{act.branch_name || 'System'}</span>
                                <span className="font-mono">{act.timestamp.split(' ')[1] || act.timestamp}</span>
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {act.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                {act.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-800/60 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      setActiveTab('activity');
                    }}
                    style={{ color: themeColors.primary }}
                    className="text-xs font-bold hover:underline cursor-pointer"
                  >
                    {t('viewAllActivity')} →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown (No switchers, has Change Password & Logout) */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700/80 transition cursor-pointer"
            >
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700"
                />
              ) : (
                <div
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                >
                  {currentUser.full_name.charAt(0)}
                </div>
              )}
              <div className="text-left hidden lg:block">
                <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {currentUser.full_name.split('(')[0].trim()}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-tight">
                  {currentUser.phone}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.full_name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{currentUser.phone}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{currentUser.job_title || 'Staff'}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>{t('changePassword')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>{language === 'ko' ? '로그아웃 (Log Out)' : 'Log Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mobile Compact Top Bar */}
      <div className="flex md:hidden items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          {whitelabelConfig.brand_logo_url ? (
            <img
              src={whitelabelConfig.brand_logo_url}
              alt="Logo"
              className="w-8 h-8 object-contain rounded-xl bg-white dark:bg-slate-800 p-0.5 shadow-sm"
            />
          ) : (
            <div
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm"
            >
              {whitelabelConfig.brand_monogram || 'MG'}
            </div>
          )}
          <div>
            <div className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight font-['Space_Grotesk']">
              {whitelabelConfig.brand_name}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {isHQ ? 'HQ Studio' : currentBranch?.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme mode toggle on mobile */}
          <button
            onClick={toggleThemeMode}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            title={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications bell on mobile */}
          <button
            onClick={() => setActiveTab('activity')}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span
                style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center"
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Logout button on mobile */}
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WhatsApp Dispatcher Modal (HQ only) */}
      {isHQ && (
        <WhatsAppBroadcastModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
};
