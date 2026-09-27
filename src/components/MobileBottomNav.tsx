import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Building2,
  Layers,
  Users2,
  FileText,
  CalendarCheck2,
  Menu,
  X,
  Timer,
  UserCheck,
  Palette,
  Activity,
  Database,
  Globe2,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Store,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Check,
  Bot,
  CalendarDays,
  MessageSquare
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSqlModal: () => void;
  onOpenAiAssistant?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
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
    canAccessBilling,
    canAccessUserManagement,
    currentBranch,
    users,
    switchUser,
    simulatedDate,
    setSimulatedDate,
    designRequests,
    invoices,
    unreadNotificationsCount,
    unreadChatCount,
    whitelabelConfig,
    themeColors,
    language,
    setLanguage,
    isPlatformUser,
    t
  } = usePortal();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Count pending items for badge
  const pendingRequestsCount = designRequests.filter((r) => r.status === 'pending').length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === 'proof_uploaded').length;

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'hq_owner':
      case 'pusat_admin':
        return { label: language === 'ko' ? '본사 대표' : 'HQ OWNER', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'hq_leader':
        return { label: language === 'ko' ? '본사 팀장' : 'HQ LEADER', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'hq_creative':
        return { label: language === 'ko' ? '크리에이티브' : 'HQ CREATIVE', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'branch_owner':
        return { label: language === 'ko' ? '지점 대표' : 'BRANCH OWNER', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'branch_manager':
        return { label: language === 'ko' ? '매장 매니저' : 'STORE MANAGER', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      default:
        return { label: role, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const roleBadge = getRoleBadge(activeRole);

  return (
    <>
      {/* 1. Fixed Bottom Menu Bar for Mobile (Dashboard, Request, Chat, Influencer, Menu) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#121214]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-2xl safe-area-bottom pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* 1. Dashboard */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full transition relative ${
              activeTab === 'dashboard' ? 'font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            style={activeTab === 'dashboard' ? { color: themeColors.primary } : undefined}
          >
            <div className="relative">
              <Building2 className="w-5 h-5 shrink-0" />
              {isHQ && (pendingRequestsCount > 0 || pendingInvoicesCount > 0) && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full px-1 py-0.2 shadow-sm">
                  {pendingRequestsCount + pendingInvoicesCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
              {t('dashboard')}
            </span>
            {activeTab === 'dashboard' && (
              <span
                style={{ backgroundColor: themeColors.primary }}
                className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 shadow-sm"
              />
            )}
          </button>

          {/* 2. Requests */}
          <button
            onClick={() => handleSelectTab('requests')}
            className={`flex flex-col items-center justify-center h-full transition relative ${
              activeTab === 'requests' ? 'font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            style={activeTab === 'requests' ? { color: themeColors.primary } : undefined}
          >
            <div className="relative">
              <Layers className="w-5 h-5 shrink-0" />
              {isHQ && pendingRequestsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full px-1 py-0.2 shadow-sm">
                  {pendingRequestsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
              {t('requests')}
            </span>
            {activeTab === 'requests' && (
              <span
                style={{ backgroundColor: themeColors.primary }}
                className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 shadow-sm"
              />
            )}
          </button>

          {/* 3. Chat / Collaboration Hub with Unread Badge */}
          <button
            onClick={() => handleSelectTab('chat')}
            className={`flex flex-col items-center justify-center h-full transition relative ${
              activeTab === 'chat' ? 'font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            style={activeTab === 'chat' ? { color: themeColors.primary } : undefined}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 shrink-0" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-purple-600 text-white text-[9px] font-black rounded-full px-1.5 py-0.2 shadow-sm animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
              {language === 'ko' ? '협업챗' : 'Chat'}
            </span>
            {activeTab === 'chat' && (
              <span
                style={{ backgroundColor: themeColors.primary }}
                className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 shadow-sm"
              />
            )}
          </button>

          {/* 4. Influencer Directory */}
          <button
            onClick={() => handleSelectTab('influencers')}
            className={`flex flex-col items-center justify-center h-full transition relative ${
              activeTab === 'influencers' ? 'font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            style={activeTab === 'influencers' ? { color: themeColors.primary } : undefined}
          >
            <Users2 className="w-5 h-5 shrink-0" />
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
              {t('influencers')}
            </span>
            {activeTab === 'influencers' && (
              <span
                style={{ backgroundColor: themeColors.primary }}
                className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 shadow-sm"
              />
            )}
          </button>

          {/* 5. More / Menu Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex flex-col items-center justify-center h-full transition relative ${
              isDrawerOpen ? 'text-slate-900 dark:text-white font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5 shrink-0" />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="absolute -top-1.5 -right-2 text-[8px] font-black rounded-full px-1 py-0.2 shadow-sm"
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
              {t('moreMenu')}
            </span>
          </button>
        </div>
      </nav>

      {/* 2. Slide-Up Mobile Sheet Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Backdrop click to dismiss */}
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />

          {/* Drawer Content */}
          <div className="bg-white dark:bg-[#121214] border-t border-slate-200 dark:border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-white shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-md"
                >
                  {whitelabelConfig.brand_monogram || 'MG'}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 font-['Space_Grotesk']">
                    {whitelabelConfig.brand_name}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('quickNavigation')}</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Info Bar */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: themeColors.primaryLight, color: themeColors.primary }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border border-current"
                  >
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser.full_name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {currentUser.job_title || (currentBranch ? currentBranch.name : whitelabelConfig.hq_location)}
                    </div>
                  </div>
                </div>

                <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>

              {/* Date Simulator Quick Indicator */}
              <div className="flex items-center justify-between text-[10px] bg-white dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{t('simulatedDate')}: <strong className="text-slate-800 dark:text-slate-200">{simulatedDate}</strong></span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSimulatedDate('2026-09-21')}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      simulatedDate === '2026-09-21' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    21 Sep (H &lt; 25)
                  </button>
                  <button
                    onClick={() => setSimulatedDate('2026-09-26')}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      simulatedDate === '2026-09-26' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    26 Sep (Cutoff)
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {t('coreWorkflow')} &amp; {t('managementAndAdmin')}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Exposure Matrix */}
                  <button
                    onClick={() => handleSelectTab('exposure')}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition ${
                      activeTab === 'exposure'
                        ? 'border-transparent font-bold text-white'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    style={
                      activeTab === 'exposure'
                        ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                        : undefined
                    }
                  >
                    <CalendarCheck2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{t('exposure')}</span>
                  </button>

                  {/* Production Calendar */}
                  <button
                    onClick={() => handleSelectTab('calendar')}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition ${
                      activeTab === 'calendar'
                        ? 'border-transparent font-bold text-white'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    style={
                      activeTab === 'calendar'
                        ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                        : undefined
                    }
                  >
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{language === 'ko' ? '통합 캘린더' : 'Calendar'}</span>
                  </button>

                  {/* Team Chat & Collaboration */}
                  <button
                    onClick={() => handleSelectTab('chat')}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition ${
                      activeTab === 'chat'
                        ? 'border-transparent font-bold text-white'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    style={
                      activeTab === 'chat'
                        ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                        : undefined
                    }
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{language === 'ko' ? '협업 메신저' : 'Team Chat'}</span>
                  </button>

                  {/* Attendance (HQ Team only) */}
                  {isHQ && (
                    <button
                      onClick={() => handleSelectTab('attendance')}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition ${
                        activeTab === 'attendance'
                          ? 'border-transparent font-bold text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      style={
                        activeTab === 'attendance'
                          ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                          : undefined
                      }
                    >
                      <Timer className="w-4 h-4 shrink-0" />
                      <span className="text-xs truncate">{t('attendance')}</span>
                    </button>
                  )}

                  {/* Billing (if allowed) */}
                  {canAccessBilling && (
                    <button
                      onClick={() => handleSelectTab('billing')}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition ${
                        activeTab === 'billing'
                          ? 'border-transparent font-bold text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      style={
                        activeTab === 'billing'
                          ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                          : undefined
                      }
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="text-xs truncate">{t('billing')}</span>
                    </button>
                  )}

                  {/* Users (HQ Owner only) */}
                  {canAccessUserManagement && (
                    <button
                      onClick={() => handleSelectTab('users')}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition ${
                        activeTab === 'users'
                          ? 'border-transparent font-bold text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      style={
                        activeTab === 'users'
                          ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                          : undefined
                      }
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span className="text-xs truncate">{t('users')}</span>
                    </button>
                  )}

                  {/* Whitelabel Settings (HQ Owner only) */}
                  {isHQOwner && (
                    <button
                      onClick={() => handleSelectTab('whitelabel')}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition ${
                        activeTab === 'whitelabel'
                          ? 'border-transparent font-bold text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      style={
                        activeTab === 'whitelabel'
                          ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                          : undefined
                      }
                    >
                      <Palette className="w-4 h-4 shrink-0" />
                      <span className="text-xs truncate">{t('whitelabel')}</span>
                    </button>
                  )}

                  {/* Activity Log */}
                  <button
                    onClick={() => handleSelectTab('activity')}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-left transition ${
                      activeTab === 'activity'
                        ? 'border-transparent font-bold text-white'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    style={
                      activeTab === 'activity'
                        ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Activity className="w-4 h-4 shrink-0" />
                      <span className="text-xs truncate">{t('activity')}</span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Role Testing Switcher */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {t('switchQuickUser')}
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {users.map((u) => {
                    const b = getRoleBadge(u.role);
                    const isCur = currentUser.id === u.id;

                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsDrawerOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition ${
                          isCur
                            ? 'bg-amber-500/20 border-amber-400 text-amber-900 dark:text-white font-semibold'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-xs truncate font-bold">{u.full_name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.job_title || u.role}</div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase shrink-0 ${b.color}`}>
                          {b.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Switcher & Schema Button */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setLanguage('en')}
                    style={language === 'en' ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary } : undefined}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      language === 'en' ? 'shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => setLanguage('ko')}
                    style={language === 'ko' ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary } : undefined}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      language === 'ko' ? 'shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🇰🇷 한국어
                  </button>
                </div>

                {isPlatformUser && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenSqlModal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>DB Schema</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
