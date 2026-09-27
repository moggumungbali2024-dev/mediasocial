import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Building2,
  Layers,
  CalendarCheck2,
  Users2,
  FileText,
  Timer,
  UserCheck,
  Palette,
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  Globe2,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Store,
  ChevronDown,
  Check,
  Bot,
  LogOut,
  Lock,
  Kanban,
  CalendarDays,
  MessageSquare,
  Share2
} from 'lucide-react';
import { UserRole } from '../types.ts';
import { ChangePasswordModal } from './ChangePasswordModal.tsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onOpenSqlModal: () => void;
  onOpenAiAssistant?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isExpanded,
  setIsExpanded,
  onOpenSqlModal,
  onOpenAiAssistant
}) => {
  const {
    currentUser,
    activeRole,
    isHQOwner,
    isHQLeader,
    isHQCreative,
    isHQ,
    canAccessBilling,
    canAccessUserManagement,
    canAccessBranchManagement,
    currentBranch,
    designRequests,
    invoices,
    unreadNotificationsCount,
    unreadChatCount,
    whitelabelConfig,
    themeColors,
    logout,
    language,
    setLanguage,
    isPlatformUser,
    t
  } = usePortal();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Count pending items for badges
  const pendingRequestsCount = designRequests.filter((r) => r.status === 'pending').length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === 'proof_uploaded').length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'platform_owner':
        return {
          label: 'PLATFORM OWNER',
          desc: 'SaaS Master',
          color: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
        };
      case 'platform_finance':
        return {
          label: 'PLATFORM FINANCE',
          desc: 'Billing & Reminders',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'platform_admin':
        return {
          label: 'PLATFORM ADMIN',
          desc: 'Onboarding & Brands',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        };
      case 'hq_owner':
      case 'pusat_admin':
        return {
          label: 'HQ OWNER',
          desc: 'Super Admin',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'hq_leader':
        return {
          label: 'HQ LEADER',
          desc: 'Creative Lead',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      case 'hq_creative':
        return {
          label: 'HQ CREATIVE',
          desc: 'Designer / Editor',
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
        };
      case 'branch_owner':
        return {
          label: 'BRANCH OWNER',
          desc: 'Franchisee',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'branch_manager':
        return {
          label: 'STORE MANAGER',
          desc: 'Operations',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
        };
      default:
        return { label: role, desc: '', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const roleBadge = getRoleBadge(activeRole);

  const navItems = [
    // 1. Core Workflow
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: Building2,
      group: 'menu',
      badge: isHQ && (pendingRequestsCount > 0 || pendingInvoicesCount > 0) ? pendingRequestsCount + pendingInvoicesCount : null,
      badgeColor: 'bg-red-500 text-white',
      visible: true
    },
    {
      id: 'requests',
      label: t('requests'),
      icon: Layers,
      group: 'menu',
      badge: isHQ && pendingRequestsCount > 0 ? pendingRequestsCount : null,
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
      visible: true
    },
    {
      id: 'tasks',
      label: t('tasks'),
      icon: Kanban,
      group: 'menu',
      badge: isHQ ? (designRequests.filter((r) => r.status === 'in_progress').length || null) : null,
      badgeColor: 'bg-sky-400 text-slate-950 font-bold',
      visible: isHQ
    },
    {
      id: 'exposure',
      label: t('exposure'),
      icon: CalendarCheck2,
      group: 'menu',
      badge: null,
      visible: true
    },
    {
      id: 'calendar',
      label: language === 'ko' ? '통합 캘린더' : 'Production Calendar',
      icon: CalendarDays,
      group: 'menu',
      badge: null,
      visible: true
    },
    {
      id: 'chat',
      label: language === 'ko' ? '팀 & 지점 협업' : 'Collaboration Hub',
      icon: MessageSquare,
      group: 'menu',
      badge: unreadChatCount > 0 ? unreadChatCount : null,
      badgeColor: 'bg-purple-500 text-white font-black animate-pulse',
      visible: true
    },
    {
      id: 'omnipost',
      label: language === 'ko' ? 'SNS 자동 발행' : 'Social Auto-Post',
      icon: Share2,
      group: 'menu',
      badge: null,
      visible: true
    },
    {
      id: 'influencers',
      label: t('influencers'),
      icon: Users2,
      group: 'menu',
      badge: null,
      visible: true
    },
    // 2. Management
    {
      id: 'billing',
      label: t('billing'),
      icon: FileText,
      group: 'management',
      badge: isHQ && pendingInvoicesCount > 0 ? pendingInvoicesCount : null,
      badgeColor: 'bg-emerald-400 text-slate-950 font-bold',
      visible: canAccessBilling
    },
    {
      id: 'attendance',
      label: t('attendance'),
      icon: Timer,
      group: 'management',
      badge: null,
      visible: isHQ
    },
    {
      id: 'branches',
      label: language === 'ko' ? '지점 및 계약 관리' : 'Franchise Branches',
      icon: Store,
      group: 'management',
      badge: null,
      visible: canAccessBranchManagement
    },
    {
      id: 'users',
      label: t('users'),
      icon: UserCheck,
      group: 'management',
      badge: null,
      visible: canAccessUserManagement
    },
    // 3. Settings & Activity
    {
      id: 'whitelabel',
      label: t('whitelabel'),
      icon: Palette,
      group: 'settings',
      badge: null,
      visible: isHQOwner
    },
    {
      id: 'activity',
      label: t('activity'),
      icon: Activity,
      group: 'settings',
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
      visible: true
    }
  ];

  const visibleItems = navItems.filter((i) => i.visible);
  const menuItems = visibleItems.filter((i) => i.group === 'menu');
  const mgmtItems = visibleItems.filter((i) => i.group === 'management');
  const settingsItems = visibleItems.filter((i) => i.group === 'settings');

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#121214] border-r border-slate-800 text-white shrink-0 sticky top-0 h-screen select-none transition-all duration-300 ease-in-out z-40 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* 1. Brand Header & Expand/Collapse Toggle */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {whitelabelConfig.brand_logo_url ? (
            <img
              src={whitelabelConfig.brand_logo_url}
              alt="Logo"
              className="w-10 h-10 object-contain rounded-2xl bg-white p-1 shrink-0 shadow-md"
            />
          ) : (
            <div
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base tracking-tighter shrink-0 shadow-lg shadow-black/40 transition-colors duration-300"
            >
              {whitelabelConfig.brand_monogram || 'MG'}
            </div>
          )}

          {isExpanded && (
            <div className="overflow-hidden leading-tight animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white truncate font-['Space_Grotesk']">
                  {whitelabelConfig.brand_name}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0 uppercase tracking-wider">
                  HQ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {whitelabelConfig.brand_subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Expand / Collapse Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? t('collapseSidebar') : t('expandSidebar')}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition shrink-0"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Navigation List with Section Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 no-scrollbar">
        {/* Section: Menu / Core Workflow */}
        <div>
          {isExpanded && (
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {language === 'ko' ? '메뉴' : 'Menu'}
            </div>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    onMouseEnter={() => setHoveredTab(item.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    style={
                      isActive
                        ? {
                            backgroundColor: themeColors.primary,
                            color: themeColors.textOnPrimary,
                            boxShadow: `0 4px 14px ${themeColors.primaryLight}`
                          }
                        : undefined
                    }
                    className={`w-full flex items-center rounded-2xl transition-all duration-200 font-medium ${
                      isExpanded ? 'px-3.5 py-2.5 gap-3' : 'justify-center p-3'
                    } ${
                      isActive
                        ? 'font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />

                    {isExpanded && (
                      <span className="text-xs truncate flex-1 text-left">
                        {item.label}
                      </span>
                    )}

                    {item.badge !== null && item.badge > 0 && (
                      <span
                        className={`${
                          item.badgeColor || 'bg-amber-500 text-slate-950'
                        } text-[10px] font-black rounded-full px-1.5 py-0.2 shrink-0 ${
                          !isExpanded ? 'absolute top-1.5 right-1.5 shadow-sm' : ''
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Icon-only Tooltip */}
                  {!isExpanded && hoveredTab === item.id && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700 whitespace-nowrap pointer-events-none flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-150">
                      <span>{item.label}</span>
                      {item.badge !== null && item.badge > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500 text-white font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Section: Management (if any visible) */}
        {mgmtItems.length > 0 && (
          <div>
            {isExpanded && (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'ko' ? '관리 및 정산' : 'Management'}
              </div>
            )}
            <nav className="space-y-1">
              {mgmtItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => setActiveTab(item.id)}
                      onMouseEnter={() => setHoveredTab(item.id)}
                      onMouseLeave={() => setHoveredTab(null)}
                      style={
                        isActive
                          ? {
                              backgroundColor: themeColors.primary,
                              color: themeColors.textOnPrimary,
                              boxShadow: `0 4px 14px ${themeColors.primaryLight}`
                            }
                          : undefined
                      }
                      className={`w-full flex items-center rounded-2xl transition-all duration-200 font-medium ${
                        isExpanded ? 'px-3.5 py-2.5 gap-3' : 'justify-center p-3'
                      } ${
                        isActive
                          ? 'font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />

                      {isExpanded && (
                        <span className="text-xs truncate flex-1 text-left">
                          {item.label}
                        </span>
                      )}

                      {item.badge !== null && item.badge > 0 && (
                        <span
                          className={`${
                            item.badgeColor || 'bg-amber-500 text-slate-950'
                          } text-[10px] font-black rounded-full px-1.5 py-0.2 shrink-0 ${
                            !isExpanded ? 'absolute top-1.5 right-1.5 shadow-sm' : ''
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Icon-only Tooltip */}
                    {!isExpanded && hoveredTab === item.id && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700 whitespace-nowrap pointer-events-none flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-150">
                        <span>{item.label}</span>
                        {item.badge !== null && item.badge > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}

        {/* Section: Settings */}
        <div>
          {isExpanded && (
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {language === 'ko' ? '설정 및 활동' : 'Settings'}
            </div>
          )}
          <nav className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    onMouseEnter={() => setHoveredTab(item.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    style={
                      isActive
                        ? {
                            backgroundColor: themeColors.primary,
                            color: themeColors.textOnPrimary,
                            boxShadow: `0 4px 14px ${themeColors.primaryLight}`
                          }
                        : undefined
                    }
                    className={`w-full flex items-center rounded-2xl transition-all duration-200 font-medium ${
                      isExpanded ? 'px-3.5 py-2.5 gap-3' : 'justify-center p-3'
                    } ${
                      isActive
                        ? 'font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />

                    {isExpanded && (
                      <span className="text-xs truncate flex-1 text-left">
                        {item.label}
                      </span>
                    )}

                    {item.badge !== null && item.badge > 0 && (
                      <span
                        className={`${
                          item.badgeColor || 'bg-amber-500 text-slate-950'
                        } text-[10px] font-black rounded-full px-1.5 py-0.2 shrink-0 ${
                          !isExpanded ? 'absolute top-1.5 right-1.5 shadow-sm' : ''
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Icon-only Tooltip */}
                  {!isExpanded && hoveredTab === item.id && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700 whitespace-nowrap pointer-events-none flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-150">
                      <span>{item.label}</span>
                      {item.badge !== null && item.badge > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. Account / Profile Footer (With Logout & Change Password) */}
      <div className="p-3 border-t border-slate-800/80 bg-[#121214] space-y-2 shrink-0">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full flex items-center rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition ${
              isExpanded ? 'px-3 py-2.5 justify-between' : 'justify-center p-2.5'
            }`}
            title={!isExpanded ? `${currentUser.full_name} (${roleBadge.label})` : undefined}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-xl object-cover shrink-0 border border-slate-700 shadow-xs"
                />
              ) : (
                <div
                  style={{ backgroundColor: themeColors.primaryLight, color: themeColors.primary }}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border border-current"
                >
                  {currentUser.full_name.charAt(0)}
                </div>
              )}
              {isExpanded && (
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {currentUser.full_name.split('(')[0].trim()}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono truncate">
                    {currentUser.phone}
                  </div>
                </div>
              )}
            </div>

            {isExpanded && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </button>

          {/* User profile popup menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/80">
                <div className="font-bold text-white text-xs">{currentUser.full_name}</div>
                <div className="text-[10px] text-amber-400 font-mono mt-0.5">{currentUser.phone}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border uppercase ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">{currentUser.job_title || 'Staff'}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsChangePasswordOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 font-medium"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('changePassword')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>{language === 'ko' ? '로그아웃 (Log Out)' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language switch & Supabase Schema modal button */}
        <div className={`flex items-center gap-1.5 ${isExpanded ? 'justify-between' : 'flex-col'}`}>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setLanguage('en')}
              style={language === 'en' ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary } : undefined}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                language === 'en' ? 'shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ko')}
              style={language === 'ko' ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary } : undefined}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                language === 'ko' ? 'shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              한국어
            </button>
          </div>

          {isPlatformUser && (
            <button
              onClick={onOpenSqlModal}
              title={t('supabaseSchema')}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 transition cursor-pointer"
            >
              <Database className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Powered by mediasocial.team */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
            <span>Powered by</span>
            <span className="font-bold text-orange-400">⚡ mediasocial.team</span>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </aside>
  );
};
