/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { DashboardPusat } from './components/DashboardPusat.tsx';
import { DashboardCabang } from './components/DashboardCabang.tsx';
import { RequestEngine } from './components/RequestEngine.tsx';
import { TasksPage } from './components/TasksPage.tsx';
import { ExposureRotator } from './components/ExposureRotator.tsx';
import { BillingManager } from './components/BillingManager.tsx';
import { InfluencerDirectory } from './components/InfluencerDirectory.tsx';
import { ActivityLog } from './components/ActivityLog.tsx';
import { AttendanceManager } from './components/AttendanceManager.tsx';
import { UserManager } from './components/UserManager.tsx';
import { WhitelabelSettings } from './components/WhitelabelSettings.tsx';
import { BranchManager } from './components/BranchManager.tsx';
import { CalendarScheduleView } from './components/CalendarScheduleView.tsx';
import { CollaborationHub } from './components/CollaborationHub.tsx';
import { SupabaseSetupModal } from './components/SupabaseSetupModal.tsx';
import { AiAssistantDrawer } from './components/AiAssistantDrawer.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { PlatformMasterConsole } from './components/PlatformMasterConsole.tsx';
import { PlatformLandingPage } from './components/PlatformLandingPage.tsx';
import { OmnipostSocialHub } from './components/OmnipostSocialHub.tsx';
import { Database, ShieldAlert, Lock, ArrowLeft, Bot, Store, ShieldCheck, Globe, ExternalLink, ArrowRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    isAuthenticated,
    activeRole, 
    isHQ,
    isHQOwner,
    isPlatformUser,
    isPlatformOwner,
    isPlatformFinance,
    isPlatformAdmin,
    activeTenantSlug,
    switchTenantBrand,
    canAccessBilling,
    canAccessBranchManagement,
    canAccessUserManagement,
    currentUser, 
    currentBranch, 
    whitelabelConfig,
    themeColors,
    language,
    t
  } = usePortal();

  // Platform Multi-Tenancy View Modes:
  // - 'landing': Public mediasocial.team landing page with brand showcase & pricing
  // - 'platform_console': Super-Admin Console (Platform Owner, Finance, Admin)
  // - 'brand_portal': Specific Brand Workspace (e.g. mediasocial.team/moggumung)
  const [viewMode, setViewMode] = useState<'landing' | 'platform_console' | 'brand_portal'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '').split('/')[0];
      if (path === 'platform' || path === 'admin') return 'platform_console';
      if (path && path !== '' && path !== 'home') {
        return 'brand_portal';
      }
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smp_sidebar_expanded');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('smp_sidebar_expanded', String(isSidebarExpanded));
  }, [isSidebarExpanded]);

  // Handle URL history and popstate navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\//, '').split('/')[0];
      if (path === 'platform' || path === 'admin') {
        setViewMode('platform_console');
      } else if (path === '' || path === 'home') {
        setViewMode('landing');
      } else {
        setViewMode('brand_portal');
        if (path) {
          switchTenantBrand(path);
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [switchTenantBrand]);

  // If user is a platform super-admin and freshly logged in or switched, ensure appropriate view
  useEffect(() => {
    if (isPlatformUser && viewMode !== 'brand_portal' && viewMode !== 'landing') {
      setViewMode('platform_console');
    }
  }, [isPlatformUser]);

  // 1. Landing Page View (Public Root /)
  if (viewMode === 'landing') {
    return (
      <PlatformLandingPage
        onEnterPlatformConsole={() => {
          setViewMode('platform_console');
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState({}, '', '/platform');
          }
        }}
        onEnterBrandPortal={(slug) => {
          switchTenantBrand(slug);
          setViewMode('brand_portal');
        }}
      />
    );
  }

  // 2. Platform Super-Admin Console View
  if (viewMode === 'platform_console' && (isPlatformUser || isHQOwner)) {
    return (
      <div className="relative">
        {/* Switch to Brand Workspace floating pill */}
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900/90 border border-slate-700 backdrop-blur-md rounded-2xl p-1.5 shadow-2xl">
          <button
            onClick={() => setViewMode('brand_portal')}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
          >
            <span>Buka Workspace Brand (/{activeTenantSlug})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('landing')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs"
            title="Ke Halaman Utama"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
        </div>

        <PlatformMasterConsole />
      </div>
    );
  }

  // If not logged in, render LoginPage!
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-canvas-mesh text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased font-['Geist',sans-serif] transition-colors duration-200">
      {/* 1. Desktop & Tablet Expandable / Icon-Only Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* 2. Main Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar Navigation */}
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSqlModal={() => setIsSqlModalOpen(true)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 pb-28 md:pb-12">
          {activeTab === 'dashboard' && (
            isHQ ? (
              <DashboardPusat onNavigateTab={setActiveTab} />
            ) : (
              <DashboardCabang onNavigateTab={setActiveTab} />
            )
          )}

          {activeTab === 'requests' && <RequestEngine />}

          {activeTab === 'tasks' && (
            isHQ ? (
              <TasksPage onSelectRequest={() => setActiveTab('requests')} />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 text-center max-w-lg mx-auto shadow-sm">
                <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {language === 'ko' ? '본사 크리에이티브팀 전용' : 'HQ Creative Team Only'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {language === 'ko'
                    ? 'HQ 작업 칸반 보드는 본사 크리에이티브 직원 및 관리자 전용입니다.'
                    : 'HQ Creative production Kanban is dedicated to HQ staff members.'}
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="px-4 py-2 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('dashboard')}</span>
                </button>
              </div>
            )
          )}

          {activeTab === 'attendance' && (
            isHQ ? (
              <AttendanceManager />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 text-center max-w-lg mx-auto shadow-sm">
                <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {language === 'ko' ? '본사 크리에이티브팀 전용' : 'HQ Team Only'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {language === 'ko' 
                    ? '출퇴근 및 근태 기록은 본사 크리에이티브 직원 전용 기능입니다.' 
                    : 'Attendance check-in is dedicated to HQ Creative team members.'}
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="px-4 py-2 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('dashboard')}</span>
                </button>
              </div>
            )
          )}

          {activeTab === 'exposure' && <ExposureRotator />}

          {activeTab === 'calendar' && <CalendarScheduleView />}

          {activeTab === 'chat' && <CollaborationHub />}

          {/* Billing & Invoicing Guard: ONLY HQ Owner, HQ Leader, Branch Owner */}
          {activeTab === 'billing' && (
            canAccessBilling ? (
              <BillingManager />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-red-200 dark:border-red-900/40 text-center max-w-xl mx-auto my-6 sm:my-12 shadow-sm">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('billingRestrictedTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                  {t('billingRestrictedDesc')}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 mb-5 text-left space-y-1">
                  <div className="font-bold text-slate-800 dark:text-white">{t('hierarchyHq')}</div>
                  <div className="font-bold text-slate-800 dark:text-white">{t('hierarchyBranch')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {language === 'ko' 
                      ? '• 본사 대표, 팀장, 가맹점 대표만 청구서 및 정산 내역을 확인할 수 있습니다.' 
                      : '• Invoicing is restricted to HQ Owner, HQ Leader, and Branch Owner only.'}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="px-5 py-2.5 font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'ko' ? '대시보드로 돌아가기' : 'Back to Dashboard'}</span>
                </button>
              </div>
            )
          )}

          {/* Branch Management Guard: ONLY HQ Owner, HQ Leader & Pusat Admin */}
          {activeTab === 'branches' && (
            canAccessBranchManagement ? (
              <BranchManager />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-red-200 dark:border-red-900/50 text-center max-w-xl mx-auto my-6 sm:my-12 shadow-sm">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {language === 'ko' ? '지점 관리 접근 제한' : 'Branch Management Access Restricted'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                  {language === 'ko'
                    ? '가맹점 추가, 계약 및 가격 설정, 점주 및 PIC 초대는 본사 관리자(HQ Owner & HQ Leader) 전용 기능입니다.'
                    : 'Franchise branch management, onboarding invitations, and retainer pricing are restricted to HQ Owner & HQ Leader only.'}
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="px-5 py-2.5 font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'ko' ? '대시보드로 돌아가기' : 'Back to Dashboard'}</span>
                </button>
              </div>
            )
          )}

          {/* User Management Guard: ONLY Super Admin (HQ Owner) */}
          {activeTab === 'users' && (
            canAccessUserManagement ? (
              <UserManager />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-red-200 dark:border-red-900/40 text-center max-w-xl mx-auto my-6 sm:my-12 shadow-sm">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('userManagementRestrictedTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                  {t('userManagementRestrictedDesc')}
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="px-5 py-2.5 font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'ko' ? '대시보드로 돌아가기' : 'Back to Dashboard'}</span>
                </button>
              </div>
            )
          )}

          {/* Whitelabel Settings Guard: ONLY HQ Owner */}
          {activeTab === 'whitelabel' && (
            isHQOwner ? (
              <WhitelabelSettings />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-red-200 dark:border-red-900/40 text-center max-w-xl mx-auto my-6 sm:my-12 shadow-sm">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('whitelabelRestrictedTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                  {t('whitelabelRestrictedDesc')}
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="px-5 py-2.5 font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'ko' ? '대시보드로 돌아가기' : 'Back to Dashboard'}</span>
                </button>
              </div>
            )
          )}

          {activeTab === 'omnipost' && <OmnipostSocialHub />}

          {activeTab === 'influencers' && <InfluencerDirectory />}

          {activeTab === 'activity' && <ActivityLog onNavigateTab={setActiveTab} />}
        </main>

        {/* Desktop / Tablet Modern Footer with Whitelabel Dynamic Branding */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#12141a] py-5 text-xs text-slate-500 dark:text-slate-400 hidden md:block transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <div
                style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px]"
              >
                {whitelabelConfig.brand_monogram || 'MG'}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">{whitelabelConfig.brand_name} {whitelabelConfig.brand_subtitle}</span>
              <span>•</span>
              <span className="text-slate-400 dark:text-slate-500">{whitelabelConfig.company_legal_name}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] flex-wrap justify-center sm:justify-end">
              <button
                onClick={() => setIsSqlModalOpen(true)}
                className="text-sky-600 dark:text-sky-400 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{t('supabaseSchema')}</span>
              </button>
              <span>•</span>
              <span className="text-slate-400 dark:text-slate-400">
                Role: <strong className="text-slate-700 dark:text-slate-200">{isHQ ? `${whitelabelConfig.brand_name} HQ (${currentUser.job_title || 'Staff'})` : `${currentBranch?.name || 'Branch'} (${currentUser.role === 'branch_manager' ? 'Store Manager' : 'Branch Owner'})`}</strong>
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* 4. AI Assistant Copilot Drawer (Image 2 style) */}
      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onNavigateTab={setActiveTab}
      />

      {/* 5. Supabase Schema Modal */}
      <SupabaseSetupModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <PortalProvider>
      <MainContent />
    </PortalProvider>
  );
}
