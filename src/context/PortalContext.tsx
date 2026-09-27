import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Branch,
  UserProfile,
  MonthlyQuota,
  DesignRequest,
  PromoRequest,
  Invoice,
  ExposureSlot,
  Influencer,
  RequestStatus,
  ContentPillar,
  UserRole,
  ActivityItem,
  CustomLineItem,
  WhitelabelConfig,
  AttendanceRecord,
  AttendanceMode,
  LanguageCode,
  ThemeMode,
  BudgetRequest,
  BudgetCompletionReport,
  ShootRequest,
  InfluencerVoucherCampaign,
  WalletTransaction,
  HqReimbursementRequest,
  HqReimbursementCategory,
  HqTodoItem,
  TeamChatMessage,
  MeetingAgenda,
  BrandSubscriptionPlan,
  PlatformBrandTenant,
  PlatformWalletWithdrawal,
  SubscriptionReminderLog
} from '../types.ts';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_QUOTAS,
  INITIAL_DESIGN_REQUESTS,
  INITIAL_PROMOS,
  INITIAL_INVOICES,
  INITIAL_EXPOSURE_SLOTS,
  INITIAL_INFLUENCERS,
  INITIAL_ACTIVITIES,
  DEFAULT_WHITELABEL_CONFIG,
  INITIAL_ATTENDANCE,
  INITIAL_BUDGET_REQUESTS,
  INITIAL_SHOOT_REQUESTS,
  INITIAL_VOUCHER_CAMPAIGNS,
  INITIAL_WALLET_TRANSACTIONS,
  INITIAL_HQ_REIMBURSEMENTS,
  INITIAL_HQ_TODOS,
  INITIAL_TEAM_CHAT_MESSAGES,
  INITIAL_MEETING_AGENDAS,
  INITIAL_PLATFORM_PLANS,
  INITIAL_PLATFORM_BRANDS,
  INITIAL_PLATFORM_WITHDRAWALS,
  INITIAL_REMINDER_LOGS,
  getInitialBrandDataset
} from '../data/initialData.ts';
import { TRANSLATIONS } from '../data/translations.ts';
import { ThemeColors, getThemeColors, applyThemeVariables } from '../utils/theme.ts';
import { SupabaseService } from '../services/supabaseService.ts';

interface PortalContextType {
  currentUser: UserProfile;
  activeRole: UserRole;
  isHQOwner: boolean;
  isHQLeader: boolean;
  isHQCreative: boolean;
  isHQ: boolean;
  isBranchOwner: boolean;
  isBranchManager: boolean;
  isBranchUser: boolean;
  canAccessBilling: boolean;
  canAccessUserManagement: boolean;
  canAccessBranchManagement: boolean;
  canAccessWhitelabel: boolean;
  canAccessAttendance: boolean;

  // SaaS Super-Admin Platform Level (mediasocial.team)
  isPlatformOwner: boolean;
  isPlatformFinance: boolean;
  isPlatformAdmin: boolean;
  isPlatformUser: boolean;
  platformBrands: PlatformBrandTenant[];
  activeTenantSlug: string;
  currentPlatformBrand: PlatformBrandTenant | null;
  subscriptionPlans: BrandSubscriptionPlan[];
  platformWithdrawals: PlatformWalletWithdrawal[];
  subscriptionReminders: SubscriptionReminderLog[];
  platformWalletBalance: number;
  totalPlatformMRR: number;
  totalPlatformARR: number;
  switchTenantBrand: (slug: string) => void;
  addPlatformBrand: (brandData: Omit<PlatformBrandTenant, 'id' | 'created_at' | 'last_active_at'>) => { success: boolean; message: string; brand?: PlatformBrandTenant };
  updatePlatformBrand: (id: string, updates: Partial<PlatformBrandTenant>) => void;
  deletePlatformBrand: (id: string) => { success: boolean; message: string };
  updateSubscriptionPlan: (id: string, updates: Partial<BrandSubscriptionPlan>) => void;
  requestPlatformWithdrawal: (amount: number, bankName: string, accountNumber: string, accountHolder: string, notes?: string) => { success: boolean; message: string };
  updateWithdrawalStatus: (id: string, status: PlatformWalletWithdrawal['status'], referenceNo?: string) => void;
  sendSubscriptionReminder: (brandId: string, channel?: 'whatsapp' | 'email') => { success: boolean; message: string; waUrl?: string };
  jumpToBrandAsHQOwner: (brandSlug: string) => void;

  // Platform Team Users & Self Password
  platformUsers: UserProfile[];
  addPlatformUser: (data: Omit<UserProfile, 'id' | 'joined_date'>) => { success: boolean; message: string };
  updatePlatformUser: (id: string, updates: Partial<UserProfile>) => { success: boolean; message: string };
  registerBrand: (data: {
    name: string;
    slug?: string;
    hq_owner_name: string;
    hq_owner_phone: string;
    hq_owner_email: string;
    password?: string;
    city?: string;
    location?: string;
    primary_color?: string;
    plan_id?: string;
  }) => { success: boolean; message: string; brandSlug?: string; user?: UserProfile };
  inviteBranch: (data: {
    name: string;
    code?: string;
    city: string;
    location: string;
    address?: string;
    pic_name: string;
    pic_phone: string;
    pic_email?: string;
    pic_password?: string;
    owner_name: string;
    owner_phone: string;
    owner_email?: string;
    package_tier?: 'Starter' | 'Standard' | 'Premium';
    retainer_fee?: number;
    max_designs?: number;
    max_promos?: number;
  }) => { success: boolean; message: string; branchId?: string; inviteLink?: string; waText?: string };

  currentBranch: Branch | null;
  selectedBranchFilter: string; // 'all' or branch.id
  simulatedDate: string; // YYYY-MM-DD
  branches: Branch[];
  quotas: MonthlyQuota[];
  designRequests: DesignRequest[];
  promos: PromoRequest[];
  invoices: Invoice[];
  exposureSlots: ExposureSlot[];
  influencers: Influencer[];
  activities: ActivityItem[];
  unreadNotificationsCount: number;
  unreadChatCount: number;
  markChatAsRead: (channel?: 'hq_internal' | 'branch_collab') => void;
  isActivityVisibleForUser: (activity: ActivityItem) => boolean;

  // Authentication
  isAuthenticated: boolean;
  login: (phone: string, password: string) => { success: boolean; message: string; user?: UserProfile };
  logout: () => void;
  changePassword: (userId: string, newPassword: string) => { success: boolean; message: string };

  // Language & i18n
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;

  // Whitelabel Portal Settings & Theme Mode
  whitelabelConfig: WhitelabelConfig;
  themeColors: ThemeColors;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  updateWhitelabelConfig: (newConfig: Partial<WhitelabelConfig>) => void;
  resetWhitelabelConfig: () => void;

  // Voucher Campaigns & Influencer ROI
  voucherCampaigns: InfluencerVoucherCampaign[];
  redeemVoucherCode: (code: string, salesAmount: number) => { success: boolean; message: string };
  addVoucherCampaign: (data: Omit<InfluencerVoucherCampaign, 'id' | 'redemption_count' | 'total_sales_driven'>) => void;

  // User Management
  users: UserProfile[];
  addUser: (data: Omit<UserProfile, 'id' | 'joined_date'>) => { success: boolean; message: string };
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  switchUser: (userId: string) => void;

  // Attendance Module (HQ Creative team)
  attendances: AttendanceRecord[];
  todayAttendance: AttendanceRecord | null;
  clockIn: (mode: AttendanceMode, targetBranchId?: string) => { success: boolean; message: string };
  clockOut: (workLog?: string) => { success: boolean; message: string };
  updateWorkLog: (workLog: string) => void;

  // Branch Management (HQ Owner & Leader)
  addBranch: (data: Omit<Branch, 'id' | 'created_at' | 'wallet_balance'> & { initial_wallet_balance?: number }) => { success: boolean; message: string; branchId: string };
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => { success: boolean; message: string };

  // Branch Wallet & Deposit System
  walletTransactions: WalletTransaction[];
  topUpBranchWallet: (branchId: string, amount: number, proofUrl: string, notes?: string) => { success: boolean; message: string };
  verifyWalletTransaction: (transactionId: string, approve: boolean) => void;

  // Budget Requests (HQ Creative, Leader & Owner)
  budgetRequests: BudgetRequest[];
  addBudgetRequest: (data: Omit<BudgetRequest, 'id' | 'created_at' | 'status' | 'approved_by'>) => { success: boolean; message: string };
  approveBudgetRequest: (id: string) => void;
  rejectBudgetRequest: (id: string) => void;
  disburseBudgetRequest: (id: string, transferProofUrl: string, transferReference?: string, transferNote?: string) => { success: boolean; message: string };
  acknowledgeBudgetDisbursement: (id: string) => void;
  submitBudgetCompletionReport: (id: string, report: BudgetCompletionReport) => { success: boolean; message: string };

  // HQ Operational Reimbursements & Expenses
  hqReimbursements: HqReimbursementRequest[];
  addHqReimbursement: (data: { category: HqReimbursementCategory; title: string; amount: number; description: string; receipt_proof_url: string }) => { success: boolean; message: string };
  approveHqReimbursement: (id: string, adminNotes?: string) => void;
  rejectHqReimbursement: (id: string, adminNotes?: string) => void;
  disburseHqReimbursementBatch: (reimbursementIds: string[], transferProofUrl: string, transferReference?: string, adminNotes?: string) => { success: boolean; message: string };

  // HQ To-Do List & Auto Work Log
  hqTodos: HqTodoItem[];
  addHqTodo: (title: string, category?: 'design' | 'promo' | 'shoot' | 'general', related_request_id?: string, target_date?: string) => void;
  toggleHqTodo: (id: string) => void;
  deleteHqTodo: (id: string) => void;
  generateClockOutWhatsappReport: () => { reportText: string; waUrl: string };

  // Team Chat & Collaboration Hub
  teamChatMessages: TeamChatMessage[];
  sendTeamChatMessage: (
    channel: 'hq_internal' | 'branch_collab',
    message: string,
    taggedUserIds?: string[],
    linkedRequestId?: string,
    linkedRequestTitle?: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ) => void;

  // Calendar Meeting Agendas
  meetingAgendas: MeetingAgenda[];
  addMeetingAgenda: (data: Omit<MeetingAgenda, 'id' | 'created_at'>) => { success: boolean; message: string };
  deleteMeetingAgenda: (id: string) => void;

  // Branch Caption Settings
  updateBranchCaptionSettings: (branchId: string, settings: { default_caption_template?: string; default_hashtags?: string }) => void;

  // Shoot Requests (Branch Store Managers & Owners)
  shootRequests: ShootRequest[];
  addShootRequest: (data: Omit<ShootRequest, 'id' | 'created_at' | 'status'>) => { success: boolean; message: string };
  updateShootRequestStatus: (id: string, status: ShootRequest['status'], assignedCreativeId?: string) => void;

  // Navigation & Control Actions
  setSelectedBranchFilter: (branchId: string) => void;
  setSimulatedDate: (date: string) => void;

  // Activity & Notifications
  markActivityAsRead: (activityId: string) => void;
  markAllActivitiesAsRead: () => void;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp' | 'read_by'>) => void;

  // Quota & Request Engine
  getBranchQuota: (branchId: string, periodMonth?: string) => MonthlyQuota;
  calculateMinTargetDate: () => string; // H+N string
  isTargetDateValid: (targetDate: string) => { valid: boolean; reason?: string };
  isPromoSubmissionAllowed: (targetMonth: string) => { allowed: boolean; reason?: string };
  addDesignRequest: (data: {
    branch_id: string;
    title: string;
    description: string;
    target_date: string;
    category: ContentPillar;
    brief_attachment_name?: string;
  }) => { success: boolean; message: string };
  updateDesignRequestStatus: (
    requestId: string,
    status: RequestStatus,
    asset_result_url?: string,
    feedback_notes?: string,
    approval_mode?: 'self_approved' | 'leader_approved' | 'pending_leader'
  ) => void;
  assignDesignRequest: (requestId: string, userId: string) => void;
  updateDesignRequestDeliverable: (
    requestId: string,
    urlOrPayload: string | {
      asset_result_url?: string;
      preview_media_url?: string;
      preview_media_type?: 'image' | 'video';
      canva_url?: string;
      figma_url?: string;
      drive_url?: string;
      caption?: string;
      creative_notes?: string;
      status?: RequestStatus;
      approval_mode?: 'self_approved' | 'leader_approved' | 'pending_leader';
    },
    notes?: string,
    status?: RequestStatus,
    approval_mode?: 'self_approved' | 'leader_approved' | 'pending_leader'
  ) => void;
  addDesignComment: (requestId: string, message: string, tag?: string) => void;
  updateDesignCaption: (requestId: string, caption: string) => void;

  // Promo Engine
  addPromoRequest: (data: {
    branch_id: string;
    title: string;
    mechanic: string;
    target_month: string;
    start_date: string;
    end_date: string;
    terms: string;
  }) => { success: boolean; message: string };
  updatePromoStatus: (promoId: string, status: PromoRequest['status']) => void;

  // Invoicing & Custom Pricing
  generateMonthlyInvoices: (periodMonth?: string) => { generatedCount: number; message: string };
  updateBranchCustomPricing: (
    branchId: string,
    customRetainerFee: number,
    packageTier: Branch['package_tier']
  ) => void;
  updateInvoiceCharges: (
    invoiceId: string,
    visit_fee: number,
    ad_budget: number,
    custom_items?: CustomLineItem[],
    retainer_fee?: number,
    additional_notes?: string
  ) => void;
  uploadPaymentProof: (invoiceId: string, proofUrl: string, proofNotes?: string) => void;
  verifyPayment: (invoiceId: string, isPaid: boolean) => void;

  // Exposure Rotator
  addExposureSlot: (slot: Omit<ExposureSlot, 'id'>) => void;
  updateExposureSlot: (id: string, updates: Partial<ExposureSlot>) => void;
  deleteExposureSlot: (id: string) => void;

  // Influencer Directory
  addInfluencer: (inf: Omit<Influencer, 'id'>) => void;
  updateInfluencer: (id: string, updates: Partial<Influencer>) => void;
  deleteInfluencer: (id: string) => void;

  // Reset
  resetToDefaultData: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'smp_v3_';

const MOCK_INFLUENCER_HANDLES = new Set([
  'gitasaras_eats',
  'alexwanderlust',
  'kulinerbandungjuara',
  'kadek_vibe',
  'dateideas.jkt',
  'nongkrong.bdg'
]);

const MOCK_EXPOSURE_TITLES = [
  'Slow Cooking',
  'Golden Hour Ramen',
  'Chashu Melt',
  'Payday Treats',
  'Slurp Etiquette',
  'Side Dishes That Steal',
  'After Office Decompression',
  'Handmade Fresh Noodles',
  'Behind the Design',
  'Sunset Happy Hour',
  'Spicy Tori Paitan',
  'Post-Surf Meal'
];

const MOCK_USER_EMAILS = new Set([
  'joonho.lead@moggumung.com',
  'jiwon.creative@moggumung.com',
  'dewa.motion@moggumung.com',
  'ubud@moggumung.com',
  'putu.mgr@moggumung.com',
  'seminyak@moggumung.com',
  'kevin.mgr@moggumung.com',
  'canggu@moggumung.com',
  'bandung@moggumung.com'
]);

function cleanMockInfluencers(list: Influencer[]): Influencer[] {
  if (!Array.isArray(list)) return [];
  return list.filter((inf) => {
    const handle = (inf.instagram_handle || '').replace('@', '').toLowerCase().trim();
    return !MOCK_INFLUENCER_HANDLES.has(handle) && !['Gita Saraswati', 'Alexander Lee', 'Dinda Kirana', 'Kadek Mahesa', 'Valerie & Kevin', 'Rian Firdaus'].includes(inf.name);
  });
}

function cleanMockExposureSlots(list: ExposureSlot[]): ExposureSlot[] {
  if (!Array.isArray(list)) return [];
  return list.filter((slot) => {
    return !MOCK_EXPOSURE_TITLES.some((title) => (slot.title || '').includes(title));
  });
}

function cleanMockUsers(list: UserProfile[]): UserProfile[] {
  if (!Array.isArray(list)) return [];
  return list.filter((u) => {
    const email = (u.email || '').toLowerCase().trim();
    return !MOCK_USER_EMAILS.has(email) && !['Joon-ho Lee', 'Ji-won Park', 'Dewa Aditya', 'Budi Santoso', 'Putu Pratama', 'Sarah Wijaya', 'Kevin Pratama', 'Wayan Ardi', 'Reza Pratama'].includes(u.full_name);
  });
}

function cleanMockWithdrawals(list: PlatformWalletWithdrawal[]): PlatformWalletWithdrawal[] {
  if (!Array.isArray(list)) return [];
  return list.filter((w) => {
    return !['TRX-WD-20260915-001', 'TRX-WD-20260922-004'].includes(w.id) && w.account_holder !== 'Alexandre Tan';
  });
}

// Global storage sanitizer on module load
(function runSanitizer() {
  if (typeof window === 'undefined') return;
  try {
    const staleKeys = [
      'smp_influencers',
      'smp_exposure_slots',
      'smp_users',
      'smp_platform_withdrawals',
      'smp_v3_influencers',
      'smp_v3_exposure_slots',
      'smp_v3_platform_withdrawals',
      'smp_b_moggumung_influencers',
      'smp_b_moggumung_exposure_slots',
      'smp_b_moggumung_platform_withdrawals'
    ];
    staleKeys.forEach((k) => localStorage.removeItem(k));

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.includes('influencers')) {
        const raw = localStorage.getItem(key);
        if (raw && (raw.includes('gitasaras') || raw.includes('alexwanderlust'))) {
          localStorage.removeItem(key);
        }
      }
      if (key.includes('exposure_slots')) {
        const raw = localStorage.getItem(key);
        if (raw && (raw.includes('Slow Cooking') || raw.includes('Torched to Perfection'))) {
          localStorage.removeItem(key);
        }
      }
      if (key.includes('platform_withdrawals')) {
        const raw = localStorage.getItem(key);
        if (raw && (raw.includes('Alexandre Tan') || raw.includes('TRX-WD-20260915'))) {
          localStorage.removeItem(key);
        }
      }
      if (key.includes('users') && !key.includes('platform_users')) {
        const raw = localStorage.getItem(key);
        if (raw && (raw.includes('joonho.lead') || raw.includes('jiwon.creative') || raw.includes('dewa.motion'))) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (e) {
    // ignore
  }
})();

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

function loadBrandStorage<T>(brandSlug: string, key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`smp_b_${brandSlug}_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveBrandStorage<T>(brandSlug: string, key: string, data: T) {
  try {
    localStorage.setItem(`smp_b_${brandSlug}_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save brand storage', err);
  }
}

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language & i18n
  const [language, setLanguageState] = useState<LanguageCode>(() =>
    loadStorage<LanguageCode>('language', 'en')
  );

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    saveStorage('language', lang);
  };

  const t = (key: keyof typeof TRANSLATIONS.en): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return (dict as Record<string, string>)[key] || (TRANSLATIONS.en as Record<string, string>)[key] || String(key);
  };

  // Active Tenant Slug (Multi-Tenancy)
  const [activeTenantSlug, setActiveTenantSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '').split('/')[0];
      if (path && path !== '' && path !== 'login' && path !== 'platform' && path !== 'admin' && path !== 'home') {
        return path;
      }
    }
    return loadStorage('active_tenant_slug', 'moggumung');
  });

  const initialDataset = useMemo(() => getInitialBrandDataset(activeTenantSlug), [activeTenantSlug]);

  // Whitelabel Configuration (Brand-specific)
  const [whitelabelConfig, setWhitelabelConfig] = useState<WhitelabelConfig>(() =>
    loadBrandStorage(activeTenantSlug, 'whitelabel', initialDataset.whitelabel)
  );

  // Theme Mode (Light / Obsidian Dark)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() =>
    loadStorage<ThemeMode>('theme_mode', 'light')
  );

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveStorage('theme_mode', mode);
  };

  const toggleThemeMode = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [themeMode]);

  const themeColors = useMemo(() => getThemeColors(whitelabelConfig), [whitelabelConfig]);

  useEffect(() => {
    applyThemeVariables(whitelabelConfig);
  }, [whitelabelConfig]);

  const updateWhitelabelConfig = (newConfig: Partial<WhitelabelConfig>) => {
    setWhitelabelConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      saveBrandStorage(activeTenantSlug, 'whitelabel', updated);
      SupabaseService.exportDataToSupabase('whitelabel_configs', [{
        brand_slug: activeTenantSlug,
        brand_name: updated.brand_name,
        brand_subtitle: updated.brand_subtitle,
        brand_monogram: updated.brand_monogram,
        brand_logo_url: updated.brand_logo_url || null,
        theme_accent: updated.theme_accent || 'kinetic_orange',
        custom_primary_hex: updated.custom_primary_hex || '#FF5B14',
        company_legal_name: updated.company_legal_name,
        hq_location: updated.hq_location,
        hq_address: updated.hq_address,
        contact_email: updated.contact_email,
        contact_whatsapp: updated.contact_whatsapp,
        bank_name: updated.bank_name,
        bank_account_number: updated.bank_account_number,
        bank_account_name: updated.bank_account_name,
        default_monthly_retainer: updated.default_monthly_retainer,
        max_monthly_design_requests: updated.max_monthly_design_requests,
        max_monthly_active_promos: updated.max_monthly_active_promos,
        design_min_lead_days: updated.design_min_lead_days,
        promo_cutoff_day_of_month: updated.promo_cutoff_day_of_month
      }]).catch(err => console.warn('Sync whitelabel to Supabase:', err));
      return updated;
    });
  };

  const resetWhitelabelConfig = () => {
    setWhitelabelConfig(initialDataset.whitelabel);
    saveBrandStorage(activeTenantSlug, 'whitelabel', initialDataset.whitelabel);
  };

  // Platform Team Users (Superadmin: 08159998757 / Media)
  const [platformUsers, setPlatformUsers] = useState<UserProfile[]>(() =>
    loadStorage<UserProfile[]>('platform_users', [
      {
        id: 'user-platform-owner',
        branch_id: null,
        role: 'platform_owner',
        full_name: 'Platform Superadmin',
        email: 'owner@mediasocial.team',
        job_title: 'Founder & Platform Superadmin (mediasocial.team)',
        status: 'active',
        phone: '08159998757',
        password: 'Media',
        joined_date: '2024-01-01'
      }
    ])
  );

  useEffect(() => {
    saveStorage('platform_users', platformUsers);
  }, [platformUsers]);

  // User Management (Brand-specific)
  const [users, setUsers] = useState<UserProfile[]>(() =>
    cleanMockUsers(loadBrandStorage(activeTenantSlug, 'users', initialDataset.users))
  );

  // Authentication State (Brand-specific)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadBrandStorage<boolean>(activeTenantSlug, 'is_authenticated', true)
  );

  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadBrandStorage<string>(activeTenantSlug, 'user_id', initialDataset.users[0]?.id || '')
  );

  const login = (phone: string, password: string): { success: boolean; message: string; user?: UserProfile } => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      return {
        success: false,
        message: 'Silakan masukkan nomor handphone Anda.'
      };
    }

    // 1. Check Platform Users (Superadmin & Platform Team)
    const platformUser = platformUsers.find(
      (u) => (u.phone || '').replace(/[^0-9]/g, '') === cleanPhone
    );
    if (platformUser) {
      const userPass = platformUser.password || 'Media';
      if (password !== userPass) {
        return {
          success: false,
          message: 'Nomor HP atau kata sandi platform salah.'
        };
      }
      // Add to active users so currentUser resolves properly
      setUsers((prev) => {
        if (!prev.some((u) => u.id === platformUser.id)) {
          return [platformUser, ...prev];
        }
        return prev;
      });
      setCurrentUserId(platformUser.id);
      setIsAuthenticated(true);
      return {
        success: true,
        message: `Selamat datang, ${platformUser.full_name}!`,
        user: platformUser
      };
    }

    // 2. Check current brand users
    let targetUser = users.find(
      (u) => (u.phone || '').replace(/[^0-9]/g, '') === cleanPhone
    );

    // 3. Cross-brand lookup
    if (!targetUser) {
      const allTenants = loadStorage<PlatformBrandTenant[]>('platform_brands', INITIAL_PLATFORM_BRANDS);
      for (const brand of allTenants) {
        const brandUsers = loadBrandStorage<UserProfile[]>(brand.slug, 'users', []);
        const found = brandUsers.find(
          (u) => (u.phone || '').replace(/[^0-9]/g, '') === cleanPhone
        );
        if (found) {
          switchTenantBrand(brand.slug);
          targetUser = found;
          break;
        }
      }
    }

    if (!targetUser) {
      return {
        success: false,
        message: 'Nomor HP belum terdaftar di sistem.'
      };
    }

    const userPassword = targetUser.password || 'Media';
    if (password !== userPassword) {
      return {
        success: false,
        message: 'Nomor HP atau kata sandi tidak sesuai.'
      };
    }

    setCurrentUserId(targetUser.id);
    setIsAuthenticated(true);
    saveBrandStorage(activeTenantSlug, 'is_authenticated', true);
    saveBrandStorage(activeTenantSlug, 'user_id', targetUser.id);
    if (targetUser.branch_id) {
      setSelectedBranchFilter(targetUser.branch_id);
    } else {
      setSelectedBranchFilter('all');
    }

    return {
      success: true,
      message: `Selamat datang, ${targetUser.full_name}!`,
      user: targetUser
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    saveBrandStorage(activeTenantSlug, 'is_authenticated', false);
  };

  const changePassword = (userId: string, newPassword: string): { success: boolean; message: string } => {
    if (!newPassword.trim()) {
      return {
        success: false,
        message: 'Kata sandi baru tidak boleh kosong.'
      };
    }
    const cleanPass = newPassword.trim();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: cleanPass } : u))
    );
    // Also update in platformUsers if it is a platform user
    setPlatformUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, password: cleanPass } : u));
      saveStorage('platform_users', updated);
      const targetUser = updated.find(u => u.id === userId);
      if (targetUser) {
        SupabaseService.exportDataToSupabase('users', [{
          id: targetUser.id,
          phone: targetUser.phone,
          password_hash: cleanPass,
          full_name: targetUser.full_name,
          email: targetUser.email,
          role: targetUser.role
        }]).catch(err => console.warn('Sync password to Supabase:', err));
      }
      return updated;
    });
    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui!'
    };
  };

  const addPlatformUser = (data: Omit<UserProfile, 'id' | 'joined_date'>): { success: boolean; message: string } => {
    if (!data.full_name || !data.phone) {
      return { success: false, message: 'Nama lengkap dan nomor HP wajib diisi.' };
    }
    const cleanPhone = data.phone.replace(/[^0-9]/g, '');
    if (platformUsers.some((u) => (u.phone || '').replace(/[^0-9]/g, '') === cleanPhone)) {
      return { success: false, message: 'Nomor HP ini sudah terdaftar sebagai pengguna platform.' };
    }

    const newUser: UserProfile = {
      ...data,
      id: `user-platform-${Date.now().toString().slice(-6)}`,
      joined_date: new Date().toISOString().split('T')[0],
      password: data.password || 'Media',
      status: 'active'
    };

    setPlatformUsers((prev) => {
      const updated = [...prev, newUser];
      saveStorage('platform_users', updated);
      return updated;
    });

    // Immediately push to Supabase REST
    SupabaseService.exportDataToSupabase('users', [{
      id: newUser.id,
      brand_slug: null,
      branch_id: null,
      role: newUser.role,
      full_name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      password_hash: newUser.password || 'Media',
      job_title: newUser.job_title || 'Platform Team',
      status: 'active'
    }]).catch(err => console.warn('Sync user to Supabase:', err));

    return { success: true, message: `Pengguna platform ${data.full_name} (${data.role}) berhasil ditambahkan!` };
  };

  const updatePlatformUser = (id: string, updates: Partial<UserProfile>): { success: boolean; message: string } => {
    setPlatformUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      saveStorage('platform_users', updated);
      const targetUser = updated.find(u => u.id === id);
      if (targetUser) {
        SupabaseService.exportDataToSupabase('users', [{
          id: targetUser.id,
          phone: targetUser.phone,
          full_name: targetUser.full_name,
          email: targetUser.email,
          role: targetUser.role,
          job_title: targetUser.job_title,
          password_hash: targetUser.password || 'Media'
        }]).catch(err => console.warn('Update user to Supabase:', err));
      }
      return updated;
    });
    return { success: true, message: 'Data pengguna platform berhasil diperbarui!' };
  };

  // Register New Brand HQ
  const registerBrand = (data: {
    name: string;
    slug?: string;
    hq_owner_name: string;
    hq_owner_phone: string;
    hq_owner_email: string;
    password?: string;
    city?: string;
    location?: string;
    primary_color?: string;
    plan_id?: string;
  }): { success: boolean; message: string; brandSlug?: string; user?: UserProfile } => {
    if (!data.name || !data.hq_owner_name || !data.hq_owner_phone) {
      return { success: false, message: 'Nama Brand, Nama HQ Owner, dan Nomor WhatsApp wajib diisi.' };
    }

    const cleanSlug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'brand').trim();

    if (platformBrands.some((b) => b.slug === cleanSlug)) {
      return { success: false, message: `Brand dengan slug "${cleanSlug}" sudah terdaftar. Silakan gunakan nama lain.` };
    }

    const newBrandTenant: PlatformBrandTenant = {
      id: `brand-${cleanSlug}`,
      slug: cleanSlug,
      name: data.name,
      tagline: 'Brand F&B & Quota Portal',
      logo_url: '',
      primary_color: data.primary_color || '#FF5B14',
      hq_owner_name: data.hq_owner_name,
      hq_owner_email: data.hq_owner_email || `${cleanSlug}@mediasocial.team`,
      hq_owner_phone: data.hq_owner_phone,
      subscription_plan_id: data.plan_id || 'growth',
      subscription_status: 'active',
      subscription_start_date: '2026-09-27',
      subscription_end_date: '2026-12-31',
      monthly_fee: 4890000,
      branches_count: 1,
      is_verified: true,
      created_at: '2026-09-27',
      last_active_at: '2026-09-27 12:00',
      wallet_balance: 0,
      notes: 'Brand baru terdaftar via Register Portal.'
    };

    const newHqOwnerUser: UserProfile = {
      id: `user-${cleanSlug}-owner`,
      branch_id: null,
      role: 'hq_owner',
      full_name: data.hq_owner_name,
      email: data.hq_owner_email || `${cleanSlug}@mediasocial.team`,
      phone: data.hq_owner_phone,
      password: data.password || 'Media',
      job_title: `Brand Owner & Founder (${data.name})`,
      status: 'active',
      joined_date: '2026-09-27'
    };

    const newInitialBranch: Branch = {
      id: `branch-${cleanSlug}-central`,
      name: `${data.name} Pusat / Central`,
      code: `${cleanSlug.substring(0, 3).toUpperCase()}-01`,
      location: data.location || data.city || 'Pusat',
      city: data.city || 'Jakarta',
      contract_status: 'active',
      contact_person: data.hq_owner_name,
      phone: data.hq_owner_phone,
      custom_retainer_fee: 5000000,
      package_tier: 'Standard',
      wallet_balance: 0,
      max_monthly_design_requests: 12,
      max_monthly_active_promos: 4,
      lead_days: 5,
      pic_name: `${data.hq_owner_name} (HQ Owner)`,
      pic_phone: data.hq_owner_phone,
      pic_email: data.hq_owner_email,
      owner_name: data.hq_owner_name,
      owner_phone: data.hq_owner_phone,
      owner_email: data.hq_owner_email,
      created_at: '2026-09-27'
    };

    const newWhitelabel: WhitelabelConfig = {
      ...DEFAULT_WHITELABEL_CONFIG,
      brand_name: data.name,
      brand_subtitle: 'Social Media Management & Quota Portal',
      brand_monogram: data.name.substring(0, 2).toUpperCase(),
      company_legal_name: `PT ${data.name} Multi Nusantara`,
      hq_location: data.city || 'Indonesia',
      contact_email: data.hq_owner_email,
      contact_whatsapp: data.hq_owner_phone,
      custom_primary_hex: data.primary_color || '#FF5B14'
    };

    // Save brand datasets to storage
    saveBrandStorage(cleanSlug, 'whitelabel', newWhitelabel);
    saveBrandStorage(cleanSlug, 'users', [newHqOwnerUser]);
    saveBrandStorage(cleanSlug, 'branches', [newInitialBranch]);
    saveBrandStorage(cleanSlug, 'design_requests', []);
    saveBrandStorage(cleanSlug, 'promos', []);
    saveBrandStorage(cleanSlug, 'invoices', []);
    saveBrandStorage(cleanSlug, 'influencers', []);
    saveBrandStorage(cleanSlug, 'activities', []);
    saveBrandStorage(cleanSlug, 'attendances', []);
    saveBrandStorage(cleanSlug, 'budget_requests', []);
    saveBrandStorage(cleanSlug, 'shoot_requests', []);
    saveBrandStorage(cleanSlug, 'wallet_transactions', []);
    saveBrandStorage(cleanSlug, 'hq_reimbursements', []);
    saveBrandStorage(cleanSlug, 'hq_todos', []);
    saveBrandStorage(cleanSlug, 'team_chat_messages', []);
    saveBrandStorage(cleanSlug, 'meeting_agendas', []);
    saveBrandStorage(cleanSlug, 'voucher_campaigns', []);
    saveBrandStorage(cleanSlug, 'exposure_slots', []);
    saveBrandStorage(cleanSlug, 'is_authenticated', true);
    saveBrandStorage(cleanSlug, 'user_id', newHqOwnerUser.id);

    // Add to platform brands
    setPlatformBrands((prev) => {
      const updated = [newBrandTenant, ...prev.filter(b => b.slug !== cleanSlug)];
      saveStorage('platform_brands', updated);
      return updated;
    });

    // Export newly registered brand & owner to Supabase
    SupabaseService.exportDataToSupabase('platform_brands', [{
      id: newBrandTenant.id,
      slug: newBrandTenant.slug,
      name: newBrandTenant.name,
      tagline: newBrandTenant.tagline,
      primary_color: newBrandTenant.primary_color,
      hq_owner_name: newBrandTenant.hq_owner_name,
      hq_owner_email: newBrandTenant.hq_owner_email,
      hq_owner_phone: newBrandTenant.hq_owner_phone,
      subscription_plan_id: newBrandTenant.subscription_plan_id,
      subscription_status: newBrandTenant.subscription_status,
      monthly_fee: newBrandTenant.monthly_fee,
      branches_count: 1,
      wallet_balance: 0
    }]).catch(err => console.warn('Sync brand to Supabase:', err));

    SupabaseService.exportDataToSupabase('users', [{
      id: newHqOwnerUser.id,
      brand_slug: cleanSlug,
      branch_id: null,
      role: 'hq_owner',
      full_name: newHqOwnerUser.full_name,
      email: newHqOwnerUser.email,
      phone: newHqOwnerUser.phone,
      password_hash: newHqOwnerUser.password || 'Media',
      job_title: newHqOwnerUser.job_title,
      status: 'active'
    }]).catch(err => console.warn('Sync HQ owner to Supabase:', err));

    SupabaseService.exportDataToSupabase('branches', [{
      id: newInitialBranch.id,
      brand_slug: cleanSlug,
      name: newInitialBranch.name,
      code: newInitialBranch.code,
      location: newInitialBranch.location,
      city: newInitialBranch.city,
      contract_status: 'active',
      contact_person: newInitialBranch.contact_person,
      phone: newInitialBranch.phone,
      custom_retainer_fee: newInitialBranch.custom_retainer_fee,
      package_tier: 'Standard',
      wallet_balance: 0,
      pic_name: newInitialBranch.pic_name,
      pic_phone: newInitialBranch.pic_phone,
      pic_email: newInitialBranch.pic_email,
      owner_name: newInitialBranch.owner_name,
      owner_phone: newInitialBranch.owner_phone,
      owner_email: newInitialBranch.owner_email
    }]).catch(err => console.warn('Sync branch to Supabase:', err));

    SupabaseService.exportDataToSupabase('whitelabel_configs', [{
      brand_slug: cleanSlug,
      brand_name: newWhitelabel.brand_name,
      brand_subtitle: newWhitelabel.brand_subtitle,
      brand_monogram: newWhitelabel.brand_monogram,
      company_legal_name: newWhitelabel.company_legal_name,
      hq_location: newWhitelabel.hq_location,
      contact_email: newWhitelabel.contact_email,
      contact_whatsapp: newWhitelabel.contact_whatsapp,
      custom_primary_hex: newWhitelabel.custom_primary_hex
    }]).catch(err => console.warn('Sync whitelabel to Supabase:', err));

    // Switch tenant
    switchTenantBrand(cleanSlug, true);
    setCurrentUserId(newHqOwnerUser.id);
    setIsAuthenticated(true);

    return {
      success: true,
      message: `Brand "${data.name}" berhasil didaftarkan! Selamat datang di portal.`,
      brandSlug: cleanSlug,
      user: newHqOwnerUser
    };
  };

  // Invite Branch by HQ Owner
  const inviteBranch = (data: {
    name: string;
    code?: string;
    city: string;
    location: string;
    address?: string;
    pic_name: string;
    pic_phone: string;
    pic_email?: string;
    pic_password?: string;
    owner_name: string;
    owner_phone: string;
    owner_email?: string;
    package_tier?: 'Starter' | 'Standard' | 'Premium';
    retainer_fee?: number;
    max_designs?: number;
    max_promos?: number;
  }): { success: boolean; message: string; branchId?: string; inviteLink?: string; waText?: string } => {
    if (!data.name || !data.city || !data.pic_name || !data.pic_phone) {
      return { success: false, message: 'Nama Cabang, Kota, Nama Store Manager (PIC), dan Nomor WhatsApp wajib diisi.' };
    }

    const branchSlug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'branch';
    const branchId = `branch-${activeTenantSlug}-${branchSlug}-${Date.now().toString().slice(-4)}`;
    const branchCode = data.code || branchSlug.substring(0, 3).toUpperCase();
    const managerPassword = data.pic_password || 'Media';

    const newBranch: Branch = {
      id: branchId,
      name: data.name,
      code: branchCode,
      location: data.location || data.city,
      city: data.city,
      address: data.address || `${data.location || data.city}, ${data.city}`,
      contract_status: 'active',
      contact_person: data.pic_name,
      phone: data.pic_phone,
      custom_retainer_fee: data.retainer_fee || 5000000,
      package_tier: data.package_tier || 'Standard',
      wallet_balance: 0,
      max_monthly_design_requests: data.max_designs || 12,
      max_monthly_active_promos: data.max_promos || 4,
      lead_days: 5,
      pic_name: `${data.pic_name} (Store Manager)`,
      pic_phone: data.pic_phone,
      pic_email: data.pic_email || `store.${branchSlug}@mediasocial.team`,
      owner_name: data.owner_name ? `${data.owner_name} (Owner)` : `${data.pic_name} (Owner)`,
      owner_phone: data.owner_phone || data.pic_phone,
      owner_email: data.owner_email || data.pic_email || `owner.${branchSlug}@mediasocial.team`,
      created_at: '2026-09-27'
    };

    const managerUserId = `user-${branchId}-mgr`;
    const newManagerUser: UserProfile = {
      id: managerUserId,
      branch_id: branchId,
      role: 'branch_manager',
      full_name: `${data.pic_name} (Store Manager ${data.name})`,
      email: data.pic_email || `mgr.${branchSlug}@mediasocial.team`,
      phone: data.pic_phone,
      password: managerPassword,
      job_title: `Store Operations Manager - ${data.name}`,
      status: 'active',
      joined_date: '2026-09-27'
    };

    setBranches((prev) => [...prev, newBranch]);
    setUsers((prev) => [...prev, newManagerUser]);

    // Sync new branch and user to Supabase
    SupabaseService.exportDataToSupabase('branches', [{
      id: newBranch.id,
      brand_slug: activeTenantSlug,
      name: newBranch.name,
      code: newBranch.code,
      location: newBranch.location,
      city: newBranch.city,
      address: newBranch.address,
      contract_status: 'active',
      contact_person: newBranch.contact_person,
      phone: newBranch.phone,
      custom_retainer_fee: newBranch.custom_retainer_fee,
      package_tier: newBranch.package_tier,
      wallet_balance: 0,
      pic_name: newBranch.pic_name,
      pic_phone: newBranch.pic_phone,
      pic_email: newBranch.pic_email,
      owner_name: newBranch.owner_name,
      owner_phone: newBranch.owner_phone,
      owner_email: newBranch.owner_email
    }]).catch(err => console.warn('Sync branch to Supabase:', err));

    SupabaseService.exportDataToSupabase('users', [{
      id: newManagerUser.id,
      brand_slug: activeTenantSlug,
      branch_id: newBranch.id,
      role: newManagerUser.role,
      full_name: newManagerUser.full_name,
      email: newManagerUser.email,
      phone: newManagerUser.phone,
      password_hash: newManagerUser.password || 'Media',
      job_title: newManagerUser.job_title,
      status: 'active'
    }]).catch(err => console.warn('Sync branch user to Supabase:', err));

    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/${activeTenantSlug}` : `https://mediasocial.team/${activeTenantSlug}`;
    const waText = `Halo ${data.pic_name}! 👋%0A%0AAnda telah diundang untuk mengelola cabang *${data.name}* di Portal Brand *${whitelabelConfig.brand_name}*.%0A%0A🔗 *Link Portal:* ${portalUrl}%0A📱 *Nomor HP Login:* ${data.pic_phone}%0A🔑 *Password:* ${managerPassword}%0A%0ASilakan masuk untuk request desain, upload promo, dan pantau status jadwal cabang Anda.`;

    return {
      success: true,
      message: `Cabang ${data.name} berhasil ditambahkan dan undangan siap dikirim!`,
      branchId,
      inviteLink: portalUrl,
      waText
    };
  };

  // Simulated date: default to today (2026-09-21)
  const [simulatedDate, setSimulatedDateState] = useState<string>(() =>
    loadStorage<string>('simulated_date', '2026-09-21')
  );

  // Selected branch filter for Pusat Admin view
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Main collections (Brand-specific)
  const [branches, setBranches] = useState<Branch[]>(() =>
    loadBrandStorage(activeTenantSlug, 'branches', initialDataset.branches)
  );
  const [quotas, setQuotas] = useState<MonthlyQuota[]>(() =>
    loadBrandStorage(activeTenantSlug, 'quotas', INITIAL_QUOTAS)
  );
  const [designRequests, setDesignRequests] = useState<DesignRequest[]>(() =>
    loadBrandStorage(activeTenantSlug, 'design_requests', initialDataset.designRequests)
  );
  const [promos, setPromos] = useState<PromoRequest[]>(() =>
    loadBrandStorage(activeTenantSlug, 'promos', initialDataset.promos)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadBrandStorage(activeTenantSlug, 'invoices', initialDataset.invoices)
  );
  const [exposureSlots, setExposureSlots] = useState<ExposureSlot[]>(() =>
    cleanMockExposureSlots(loadBrandStorage(activeTenantSlug, 'exposure_slots', INITIAL_EXPOSURE_SLOTS))
  );
  const [influencers, setInfluencers] = useState<Influencer[]>(() =>
    cleanMockInfluencers(loadBrandStorage(activeTenantSlug, 'influencers', initialDataset.influencers))
  );
  const [voucherCampaigns, setVoucherCampaigns] = useState<InfluencerVoucherCampaign[]>(() =>
    loadBrandStorage(activeTenantSlug, 'voucher_campaigns', INITIAL_VOUCHER_CAMPAIGNS)
  );
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    loadBrandStorage(activeTenantSlug, 'activities', INITIAL_ACTIVITIES)
  );
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() =>
    loadBrandStorage(activeTenantSlug, 'attendances', INITIAL_ATTENDANCE)
  );
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>(() =>
    loadBrandStorage(activeTenantSlug, 'budget_requests', INITIAL_BUDGET_REQUESTS)
  );
  const [shootRequests, setShootRequests] = useState<ShootRequest[]>(() =>
    loadBrandStorage(activeTenantSlug, 'shoot_requests', INITIAL_SHOOT_REQUESTS)
  );
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() =>
    loadBrandStorage(activeTenantSlug, 'wallet_transactions', INITIAL_WALLET_TRANSACTIONS)
  );
  const [hqReimbursements, setHqReimbursements] = useState<HqReimbursementRequest[]>(() =>
    loadBrandStorage(activeTenantSlug, 'hq_reimbursements', INITIAL_HQ_REIMBURSEMENTS)
  );
  const [hqTodos, setHqTodos] = useState<HqTodoItem[]>(() =>
    loadBrandStorage(activeTenantSlug, 'hq_todos', INITIAL_HQ_TODOS)
  );
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>(() =>
    loadBrandStorage(activeTenantSlug, 'team_chat_messages', INITIAL_TEAM_CHAT_MESSAGES)
  );
  const [meetingAgendas, setMeetingAgendas] = useState<MeetingAgenda[]>(() =>
    loadBrandStorage(activeTenantSlug, 'meeting_agendas', INITIAL_MEETING_AGENDAS)
  );

  // Platform Multi-Tenant & Super-Admin States
  const [platformBrands, setPlatformBrands] = useState<PlatformBrandTenant[]>(() => {
    const loaded = loadStorage('platform_brands', INITIAL_PLATFORM_BRANDS);
    return (loaded || []).filter(
      (b) => !['brand-kopisenja', 'brand-matchabae', 'brand-satenusantara', 'kopisenja', 'matchabae', 'satenusantara'].includes(b.id) &&
        !['kopisenja', 'matchabae', 'satenusantara'].includes(b.slug)
    );
  });
  const [subscriptionPlans, setSubscriptionPlans] = useState<BrandSubscriptionPlan[]>(() =>
    loadStorage('platform_plans', INITIAL_PLATFORM_PLANS)
  );
  const [platformWithdrawals, setPlatformWithdrawals] = useState<PlatformWalletWithdrawal[]>(() =>
    cleanMockWithdrawals(loadStorage('platform_withdrawals', INITIAL_PLATFORM_WITHDRAWALS))
  );
  const [subscriptionReminders, setSubscriptionReminders] = useState<SubscriptionReminderLog[]>(() =>
    loadStorage('subscription_reminders', INITIAL_REMINDER_LOGS)
  );

  // Live Supabase Sync Engine
  const syncFromSupabase = async () => {
    try {
      // 0. Fetch Whitelabel Config for active brand
      const wlRes = await SupabaseService.fetchFromSupabase<any>('whitelabel_configs', `brand_slug=eq.${activeTenantSlug}`);
      if (wlRes.success && wlRes.data && wlRes.data.length > 0) {
        const w = wlRes.data[0];
        const remoteWhitelabel: WhitelabelConfig = {
          ...DEFAULT_WHITELABEL_CONFIG,
          brand_name: w.brand_name || activeTenantSlug,
          brand_subtitle: w.brand_subtitle || 'Media Social Team Portal',
          brand_monogram: w.brand_monogram || (w.brand_name ? w.brand_name.substring(0, 2).toUpperCase() : 'MS'),
          brand_logo_url: w.brand_logo_url || '',
          theme_accent: w.theme_accent || 'kinetic_orange',
          custom_primary_hex: w.custom_primary_hex || '#FF5B14',
          company_legal_name: w.company_legal_name || `PT ${w.brand_name} `,
          hq_location: w.hq_location || '',
          hq_address: w.hq_address || '',
          contact_email: w.contact_email || '',
          contact_whatsapp: w.contact_whatsapp || '',
          bank_name: w.bank_name || '',
          bank_account_number: w.bank_account_number || '',
          bank_account_name: w.bank_account_name || '',
          default_monthly_retainer: Number(w.default_monthly_retainer) || 5000000,
          max_monthly_design_requests: Number(w.max_monthly_design_requests) || 12,
          max_monthly_active_promos: Number(w.max_monthly_active_promos) || 4,
          design_min_lead_days: Number(w.design_min_lead_days) || 5,
          promo_cutoff_day_of_month: Number(w.promo_cutoff_day_of_month) || 25
        };
        setWhitelabelConfig(remoteWhitelabel);
        saveBrandStorage(activeTenantSlug, 'whitelabel', remoteWhitelabel);
      }

      // 1. Fetch Users
      const usersRes = await SupabaseService.fetchFromSupabase<any>('users');
      if (usersRes.success && usersRes.data && usersRes.data.length > 0) {
        const remoteUsers: UserProfile[] = usersRes.data.map((u: any) => ({
          id: u.id,
          branch_id: u.branch_id,
          role: u.role as UserRole,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          password: u.password_hash || 'Media',
          job_title: u.job_title || '',
          avatar_url: u.avatar_url || '',
          status: u.status || 'active',
          joined_date: u.joined_date || (u.created_at ? u.created_at.split('T')[0] : '2026-01-01')
        }));

        const pUsers = remoteUsers.filter((u) => ['platform_owner', 'platform_finance', 'platform_admin'].includes(u.role));
        if (pUsers.length > 0) {
          setPlatformUsers((prev) => {
            const map = new Map(prev.map(p => [p.id, p]));
            pUsers.forEach(p => map.set(p.id, p));
            return Array.from(map.values());
          });
        }

        const bUsers = remoteUsers.filter((u: any) => {
          const raw = usersRes.data?.find((r: any) => r.id === u.id);
          return raw?.brand_slug === activeTenantSlug || (!raw?.brand_slug && !['platform_owner', 'platform_finance', 'platform_admin'].includes(u.role));
        });
        if (bUsers.length > 0) {
          setUsers(bUsers);
          saveBrandStorage(activeTenantSlug, 'users', bUsers);
        }
      }

      // 2. Fetch Subscription Plans
      const plansRes = await SupabaseService.fetchFromSupabase<any>('platform_plans');
      if (plansRes.success && plansRes.data && plansRes.data.length > 0) {
        const remotePlans: BrandSubscriptionPlan[] = plansRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          monthly_price: Number(p.monthly_price),
          annual_price: Number(p.annual_price),
          max_branches: Number(p.max_branches),
          max_design_requests_per_branch: Number(p.max_design_requests_per_branch),
          max_promos_per_branch: Number(p.max_promos_per_branch),
          includes_influencer_crm: Boolean(p.includes_influencer_crm),
          includes_collaboration_chat: Boolean(p.includes_collaboration_chat),
          includes_auto_invoicing: Boolean(p.includes_auto_invoicing),
          includes_dedicated_support: Boolean(p.includes_dedicated_support),
          is_popular: Boolean(p.is_popular),
          description: p.description || ''
        }));
        setSubscriptionPlans(remotePlans);
        saveStorage('platform_plans', remotePlans);
      }

      // 3. Fetch Platform Brands
      const brandsRes = await SupabaseService.fetchFromSupabase<any>('platform_brands');
      if (brandsRes.success && brandsRes.data) {
        const remoteBrands: PlatformBrandTenant[] = brandsRes.data
          .filter((b: any) => !['kopisenja', 'matchabae', 'satenusantara'].includes(b.slug))
          .map((b: any) => ({
            id: b.id,
            slug: b.slug,
            name: b.name,
            tagline: b.tagline || '',
            logo_url: b.logo_url || '',
            primary_color: b.primary_color || '#FF5B14',
            hq_owner_name: b.hq_owner_name,
            hq_owner_email: b.hq_owner_email,
            hq_owner_phone: b.hq_owner_phone,
            subscription_plan_id: b.subscription_plan_id || 'growth',
            subscription_status: b.subscription_status || 'active',
            subscription_start_date: b.subscription_start_date || '2026-01-01',
            subscription_end_date: b.subscription_end_date || '2026-12-31',
            monthly_fee: Number(b.monthly_fee) || 4890000,
            branches_count: Number(b.branches_count) || 1,
            is_verified: Boolean(b.is_verified),
            created_at: b.created_at || '2026-01-01',
            last_active_at: b.last_active_at || '2026-09-27',
            wallet_balance: Number(b.wallet_balance) || 0,
            notes: b.notes || ''
          }));
        if (remoteBrands.length > 0) {
          setPlatformBrands(remoteBrands);
          saveStorage('platform_brands', remoteBrands);
        }
      }

      // 4. Fetch Branches for active brand
      const branchesRes = await SupabaseService.fetchFromSupabase<any>('branches', `brand_slug=eq.${activeTenantSlug}`);
      if (branchesRes.success && branchesRes.data) {
        const remoteBranches: Branch[] = branchesRes.data.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code || '',
          location: b.location || '',
          city: b.city || '',
          address: b.address || '',
          contract_status: b.contract_status || 'active',
          contact_person: b.contact_person || '',
          phone: b.phone || '',
          custom_retainer_fee: Number(b.custom_retainer_fee) || 5000000,
          package_tier: b.package_tier || 'Standard',
          wallet_balance: Number(b.wallet_balance) || 0,
          max_monthly_design_requests: Number(b.max_monthly_design_requests) || 12,
          max_monthly_active_promos: Number(b.max_monthly_active_promos) || 4,
          lead_days: Number(b.lead_days) || 5,
          pic_name: b.pic_name || '',
          pic_phone: b.pic_phone || '',
          pic_email: b.pic_email || '',
          owner_name: b.owner_name || '',
          owner_phone: b.owner_phone || '',
          owner_email: b.owner_email || '',
          created_at: b.created_at || '2026-01-01'
        }));
        setBranches(remoteBranches);
        saveBrandStorage(activeTenantSlug, 'branches', remoteBranches);
      }

      // 5. Fetch Team Chat Messages
      const chatRes = await SupabaseService.fetchFromSupabase<any>('team_chat_messages', `brand_slug=eq.${activeTenantSlug}&order=created_at.asc`);
      if (chatRes.success && chatRes.data) {
        const remoteChats: TeamChatMessage[] = chatRes.data.map((c: any) => ({
          id: c.id,
          sender_id: c.sender_id,
          sender_name: c.sender_name,
          sender_role: c.sender_role as UserRole,
          sender_avatar: c.sender_avatar || '',
          channel: c.channel as 'hq_internal' | 'branch_collab',
          branch_id: c.branch_id || undefined,
          branch_name: c.branch_name || undefined,
          message: c.message,
          tagged_user_ids: c.tagged_user_ids || [],
          tagged_user_names: c.tagged_user_names || [],
          linked_request_id: c.linked_request_id || undefined,
          linked_request_title: c.linked_request_title || undefined,
          media_url: c.media_url || undefined,
          media_type: c.media_type as 'image' | 'video' | undefined,
          read_by: c.read_by || [],
          created_at: c.created_at ? (c.created_at.includes('T') ? c.created_at.replace('T', ' ').slice(0, 16) : c.created_at) : '2026-09-27 12:00'
        }));
        setTeamChatMessages((prev) => {
          const map = new Map<string, TeamChatMessage>();
          prev.forEach((item) => {
            if (item && item.id) map.set(item.id, item);
          });
          remoteChats.forEach((item) => {
            if (item && item.id) map.set(item.id, item);
          });
          const merged = Array.from(map.values()).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
          saveBrandStorage(activeTenantSlug, 'team_chat_messages', merged);
          return merged;
        });
      }

      // 6. Fetch Design Requests
      const reqsRes = await SupabaseService.fetchFromSupabase<any>('design_requests', `brand_slug=eq.${activeTenantSlug}&order=created_at.desc`);
      if (reqsRes.success && reqsRes.data) {
        const remoteReqs: DesignRequest[] = reqsRes.data.map((r: any) => ({
          id: r.id,
          branch_id: r.branch_id,
          title: r.title,
          description: r.description,
          target_date: r.target_date,
          status: r.status as RequestStatus,
          category: r.category as ContentPillar,
          asset_result_url: r.asset_result_url || undefined,
          preview_media_url: r.preview_media_url || undefined,
          preview_media_type: r.preview_media_type || undefined,
          canva_url: r.canva_url || undefined,
          figma_url: r.figma_url || undefined,
          drive_url: r.drive_url || undefined,
          caption: r.caption || undefined,
          brief_attachment_name: r.brief_attachment_name || undefined,
          feedback_notes: r.feedback_notes || undefined,
          assigned_to_user_id: r.assigned_to_user_id || undefined,
          assigned_to_name: r.assigned_to_name || undefined,
          approval_mode: r.approval_mode || 'self_approved',
          created_at: r.created_at ? r.created_at.split('T')[0] : '2026-09-27'
        }));
        setDesignRequests(remoteReqs);
        saveBrandStorage(activeTenantSlug, 'design_requests', remoteReqs);
      }

      // 7. Fetch Promos
      const promosRes = await SupabaseService.fetchFromSupabase<any>('promos', `brand_slug=eq.${activeTenantSlug}&order=created_at.desc`);
      if (promosRes.success && promosRes.data) {
        const remotePromos: PromoRequest[] = promosRes.data.map((p: any) => ({
          id: p.id,
          branch_id: p.branch_id,
          title: p.title,
          mechanic: p.mechanic,
          target_month: p.target_month,
          start_date: p.start_date,
          end_date: p.end_date,
          terms: p.terms || '',
          status: p.status as PromoRequest['status'],
          created_at: p.created_at ? p.created_at.split('T')[0] : '2026-09-27'
        }));
        setPromos(remotePromos);
        saveBrandStorage(activeTenantSlug, 'promos', remotePromos);
      }

      // 8. Fetch Invoices
      const invsRes = await SupabaseService.fetchFromSupabase<any>('invoices', `brand_slug=eq.${activeTenantSlug}&order=created_at.desc`);
      if (invsRes.success && invsRes.data) {
        const remoteInvs: Invoice[] = invsRes.data.map((i: any) => ({
          id: i.id,
          branch_id: i.branch_id,
          invoice_number: i.invoice_number,
          period_month: i.period_month,
          retainer_fee: Number(i.retainer_fee),
          visit_fee: Number(i.visit_fee) || 0,
          ad_budget: Number(i.ad_budget) || 0,
          total_amount: Number(i.total_amount),
          status: i.status as Invoice['status'],
          proof_url: i.proof_url || undefined,
          proof_notes: i.proof_notes || undefined,
          due_date: i.due_date,
          payment_date: i.payment_date || undefined,
          created_at: i.created_at ? i.created_at.split('T')[0] : '2026-09-27'
        }));
        setInvoices(remoteInvs);
        saveBrandStorage(activeTenantSlug, 'invoices', remoteInvs);
      }

      // 9. Fetch Attendances
      const attRes = await SupabaseService.fetchFromSupabase<any>('attendances', `brand_slug=eq.${activeTenantSlug}&order=date.desc`);
      if (attRes.success && attRes.data) {
        const remoteAtt: AttendanceRecord[] = attRes.data.map((a: any) => ({
          id: a.id,
          user_id: a.user_id,
          user_name: a.user_name,
          date: a.date,
          clock_in_time: a.clock_in_time,
          clock_out_time: a.clock_out_time || undefined,
          mode: a.mode as AttendanceMode,
          status: a.status as AttendanceRecord['status'],
          work_log: a.work_log || '',
          target_branch_id: a.target_branch_id || undefined,
          total_hours: a.total_hours ? Number(a.total_hours) : undefined
        }));
        setAttendances(remoteAtt);
        saveBrandStorage(activeTenantSlug, 'attendances', remoteAtt);
      }

      // 10. Fetch HQ Todos
      const todosRes = await SupabaseService.fetchFromSupabase<any>('hq_todos', `brand_slug=eq.${activeTenantSlug}&order=created_at.desc`);
      if (todosRes.success && todosRes.data) {
        const remoteTodos: HqTodoItem[] = todosRes.data.map((t: any) => ({
          id: t.id,
          user_id: t.user_id || '',
          user_name: t.user_name || '',
          title: t.title,
          category: t.category || 'general',
          related_request_id: t.related_request_id || undefined,
          target_date: t.target_date || undefined,
          completed: Boolean(t.completed),
          completed_at: t.completed_at || undefined,
          included_in_work_log: Boolean(t.included_in_work_log),
          created_at: t.created_at ? (t.created_at.includes('T') ? t.created_at.split('T')[0] : t.created_at) : '2026-09-27'
        }));
        setHqTodos(remoteTodos);
        saveBrandStorage(activeTenantSlug, 'hq_todos', remoteTodos);
      }

      // 11. Fetch Shoot Requests
      const shootsRes = await SupabaseService.fetchFromSupabase<any>('shoot_requests', `brand_slug=eq.${activeTenantSlug}&order=created_at.desc`);
      if (shootsRes.success && shootsRes.data) {
        const remoteShoots: ShootRequest[] = shootsRes.data.map((s: any) => ({
          id: s.id,
          branch_id: s.branch_id,
          branch_name: s.branch_name,
          requester_id: s.requester_id || '',
          requester_name: s.requester_name || '',
          requester_role: s.requester_role as UserRole,
          type: s.type || 'photoshoot_visit',
          title: s.title,
          preferred_date: s.preferred_date,
          details: s.details || '',
          focus_products: s.focus_products || [],
          status: s.status as ShootRequest['status'],
          assigned_creative_id: s.assigned_creative_id || undefined,
          assigned_creative_name: s.assigned_creative_name || undefined,
          notes: s.notes || undefined,
          created_at: s.created_at ? s.created_at.split('T')[0] : '2026-09-27'
        }));
        setShootRequests(remoteShoots);
        saveBrandStorage(activeTenantSlug, 'shoot_requests', remoteShoots);
      }
    } catch (e) {
      console.warn('Sync from Supabase:', e);
    }
  };

  useEffect(() => {
    syncFromSupabase();
    const handleFocus = () => syncFromSupabase();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(syncFromSupabase, 4000);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [activeTenantSlug]);

  // Auto-sync to localStorage
  useEffect(() => saveStorage('platform_brands', platformBrands), [platformBrands]);
  useEffect(() => saveStorage('platform_plans', subscriptionPlans), [subscriptionPlans]);
  useEffect(() => saveStorage('platform_withdrawals', platformWithdrawals), [platformWithdrawals]);
  useEffect(() => saveStorage('subscription_reminders', subscriptionReminders), [subscriptionReminders]);
  useEffect(() => saveStorage('active_tenant_slug', activeTenantSlug), [activeTenantSlug]);
  useEffect(() => saveStorage('simulated_date', simulatedDate), [simulatedDate]);

  // Brand-level Auto-sync
  useEffect(() => saveBrandStorage(activeTenantSlug, 'whitelabel', whitelabelConfig), [activeTenantSlug, whitelabelConfig]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'branches', branches), [activeTenantSlug, branches]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'users', users), [activeTenantSlug, users]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'design_requests', designRequests), [activeTenantSlug, designRequests]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'promos', promos), [activeTenantSlug, promos]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'invoices', invoices), [activeTenantSlug, invoices]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'exposure_slots', exposureSlots), [activeTenantSlug, exposureSlots]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'influencers', influencers), [activeTenantSlug, influencers]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'voucher_campaigns', voucherCampaigns), [activeTenantSlug, voucherCampaigns]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'activities', activities), [activeTenantSlug, activities]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'attendances', attendances), [activeTenantSlug, attendances]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'budget_requests', budgetRequests), [activeTenantSlug, budgetRequests]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'shoot_requests', shootRequests), [activeTenantSlug, shootRequests]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'wallet_transactions', walletTransactions), [activeTenantSlug, walletTransactions]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'hq_reimbursements', hqReimbursements), [activeTenantSlug, hqReimbursements]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'hq_todos', hqTodos), [activeTenantSlug, hqTodos]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'team_chat_messages', teamChatMessages), [activeTenantSlug, teamChatMessages]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'meeting_agendas', meetingAgendas), [activeTenantSlug, meetingAgendas]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'quotas', quotas), [activeTenantSlug, quotas]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'is_authenticated', isAuthenticated), [activeTenantSlug, isAuthenticated]);
  useEffect(() => saveBrandStorage(activeTenantSlug, 'user_id', currentUserId), [activeTenantSlug, currentUserId]);

  const fallbackUser: UserProfile = useMemo(() => ({
    id: 'user-platform-owner',
    branch_id: null,
    role: 'platform_owner',
    full_name: 'Platform Superadmin',
    email: 'owner@mediasocial.team',
    phone: '08159998757',
    password: 'Media',
    job_title: 'Platform Owner',
    avatar_url: '',
    status: 'active',
    joined_date: '2026-01-01'
  }), []);

  // Derived current user & role
  const currentUser: UserProfile = useMemo(() => {
    if (!users || users.length === 0) {
      return fallbackUser;
    }
    return users.find((u) => u.id === currentUserId) || users[0] || fallbackUser;
  }, [users, currentUserId, fallbackUser]);

  const activeRole: UserRole = currentUser?.role || 'platform_owner';

  // Platform Level Roles (mediasocial.team)
  const isPlatformOwner = activeRole === 'platform_owner';
  const isPlatformFinance = activeRole === 'platform_finance' || activeRole === 'platform_owner';
  const isPlatformAdmin = activeRole === 'platform_admin' || activeRole === 'platform_owner';
  const isPlatformUser = isPlatformOwner || isPlatformFinance || isPlatformAdmin;

  // Strict User Hierarchy & RBAC:
  // HQ: HQ Owner > HQ Leader > HQ Creative Team
  // Branch: Branch Owner > Branch Store Manager
  const isHQOwner = activeRole === 'hq_owner' || activeRole === 'pusat_admin' || isPlatformOwner;
  const isHQLeader = activeRole === 'hq_leader';
  const isHQCreative = activeRole === 'hq_creative';
  const isHQ = isHQOwner || isHQLeader || isHQCreative || isPlatformUser;
  const isBranchOwner = activeRole === 'branch_owner';
  const isBranchManager = activeRole === 'branch_manager';
  const isBranchUser = isBranchOwner || isBranchManager;

  // Permissions according to brief:
  // - User management: ONLY Superadmin (HQ Owner) / Platform
  // - Whitelabel settings: ONLY HQ Owner / Platform
  // - Invoice & billing: ONLY HQ Owner, HQ Leader, Branch Owner (Branch Store Manager CANNOT access!) / Platform
  // - Attendance: HQ team / Platform
  const canAccessUserManagement = isHQOwner || isPlatformUser;
  const canAccessWhitelabel = isHQOwner || isPlatformUser;
  const canAccessBilling = isHQOwner || isHQLeader || isBranchOwner || isPlatformUser;
  const canAccessBranchManagement = isHQOwner || isHQLeader || isPlatformUser;
  const canAccessAttendance = isHQ || isPlatformUser;

  // Active branch if user is branch user
  const currentBranch = useMemo(() => {
    if (!currentUser?.branch_id) return null;
    return branches.find((b) => b.id === currentUser.branch_id) || null;
  }, [currentUser, branches]);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const user = users.find((u) => u.id === userId);
    if (user?.branch_id) {
      setSelectedBranchFilter(user.branch_id);
    } else {
      setSelectedBranchFilter('all');
    }
  };

  const addUser = (data: Omit<UserProfile, 'id' | 'joined_date'>): { success: boolean; message: string } => {
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'User with this email already exists!' };
    }
    const newUser: UserProfile = {
      ...data,
      id: `user-${Date.now()}`,
      status: data.status || 'active',
      password: data.password || 'Media',
      joined_date: simulatedDate
    };
    setUsers((prev) => [newUser, ...prev]);

    // Export new user to Supabase
    SupabaseService.exportDataToSupabase('users', [{
      id: newUser.id,
      brand_slug: activeTenantSlug,
      branch_id: newUser.branch_id || null,
      role: newUser.role,
      full_name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      password_hash: newUser.password || 'Media',
      job_title: newUser.job_title || '',
      status: newUser.status || 'active'
    }]).catch(err => console.warn('Sync new user to Supabase:', err));

    addActivity({
      branch_id: data.branch_id || undefined,
      user_name: currentUser.full_name,
      action_type: 'request_status_changed',
      title: `User Registered: ${newUser.full_name}`,
      description: `New ${newUser.role} user created for ${data.branch_id ? 'Branch' : 'HQ'}. Phone: ${newUser.phone}`,
      severity: 'info',
      link_tab: 'dashboard'
    });

    return { success: true, message: 'User registered successfully!' };
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      const target = updated.find((u) => u.id === id);
      if (target) {
        SupabaseService.exportDataToSupabase('users', [{
          id: target.id,
          brand_slug: activeTenantSlug,
          branch_id: target.branch_id || null,
          role: target.role,
          full_name: target.full_name,
          email: target.email,
          phone: target.phone,
          password_hash: target.password || 'Media',
          job_title: target.job_title || '',
          status: target.status || 'active'
        }]).catch(err => console.warn('Update user to Supabase:', err));
      }
      return updated;
    });
  };

  const setSimulatedDate = (date: string) => {
    setSimulatedDateState(date);
  };

  // Helper to add activity log entry
  const addActivity = (item: Omit<ActivityItem, 'id' | 'timestamp' | 'read_by'>) => {
    const newActivity: ActivityItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`,
      read_by: []
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Helper to determine if an activity notification is visible to current user
  const isActivityVisibleForUser = (act: ActivityItem): boolean => {
    const isHQAdmin = activeRole === 'hq_owner' || activeRole === 'hq_leader' || activeRole === 'pusat_admin';
    // 1. HQ Owner & HQ Leader can see all platform notifications
    if (isHQAdmin) return true;

    const isAttendance =
      act.action_type === 'attendance_clocked_in' ||
      act.action_type === 'attendance_clocked_out' ||
      act.title.toLowerCase().includes('clock-in') ||
      act.title.toLowerCase().includes('clock-out') ||
      act.title.toLowerCase().includes('출근') ||
      act.title.toLowerCase().includes('퇴근');

    // 2. Attendance notifications: strictly visible only to HQ Admin or the user themselves!
    // Never show HQ attendance to branch owner / branch manager
    if (isAttendance) {
      return act.user_name === currentUser.full_name;
    }

    // 3. User mentioned
    if (act.action_type === 'user_mentioned') {
      return true;
    }

    // 4. HQ Creative (Designer/Editor)
    if (activeRole === 'hq_creative') {
      if (act.action_type === 'reimbursement_requested' || act.action_type === 'reimbursement_processed') {
        return act.user_name === currentUser.full_name;
      }
      return true;
    }

    // 5. Branch Users (Branch Owner & Branch Manager)
    // Only see notifications specifically for their branch
    if (act.branch_id) {
      return act.branch_id === (currentBranch?.id || currentUser.branch_id);
    }

    return false;
  };

  // Mark single activity as read
  const markActivityAsRead = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId && !act.read_by.includes(currentUser.id)) {
          return { ...act, read_by: [...act.read_by, currentUser.id] };
        }
        return act;
      })
    );
  };

  // Mark all user-visible activities as read
  const markAllActivitiesAsRead = () => {
    setActivities((prev) =>
      prev.map((act) => {
        const isVisible = isActivityVisibleForUser(act);
        if (isVisible && !act.read_by.includes(currentUser.id)) {
          return { ...act, read_by: [...act.read_by, currentUser.id] };
        }
        return act;
      })
    );
  };

  // Unread badge count (scoped personally)
  const unreadNotificationsCount = useMemo(() => {
    return activities.filter((act) => {
      const isVisible = isActivityVisibleForUser(act);
      return isVisible && !act.read_by.includes(currentUser.id);
    }).length;
  }, [activities, activeRole, currentBranch, currentUser.id, currentUser.full_name, currentUser.branch_id]);

  // Attendance system
  const todayAttendance = useMemo(() => {
    return attendances.find((a) => a.user_id === currentUser.id && a.date === simulatedDate) || null;
  }, [attendances, currentUser.id, simulatedDate]);

  const clockIn = (mode: AttendanceMode, targetBranchId?: string): { success: boolean; message: string } => {
    if (todayAttendance) {
      return { success: false, message: 'Already clocked in for today!' };
    }
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const isLate = nowTime > '09:00';
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      date: simulatedDate,
      clock_in_time: nowTime,
      mode,
      status: isLate ? 'late' : 'present',
      work_log: '',
      target_branch_id: targetBranchId
    };

    setAttendances((prev) => [newRecord, ...prev]);

    // Push to Supabase
    SupabaseService.exportDataToSupabase('attendances', [{
      id: newRecord.id,
      brand_slug: activeTenantSlug,
      user_id: newRecord.user_id,
      user_name: newRecord.user_name,
      date: newRecord.date,
      clock_in_time: newRecord.clock_in_time,
      mode: newRecord.mode,
      status: newRecord.status,
      work_log: '',
      target_branch_id: targetBranchId || null
    }]).catch(err => console.warn('Sync clockIn to Supabase:', err));

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'attendance_clocked_in',
      title: `Daily Clock-In: ${currentUser.full_name}`,
      description: `Clocked in at ${nowTime} (${mode}${targetBranchId ? ` - Visit: ${targetBranchId}` : ''})`,
      severity: 'info',
      link_tab: 'attendance'
    });

    return { success: true, message: 'Clock in successful!' };
  };

  const clockOut = (workLog?: string): { success: boolean; message: string } => {
    if (!todayAttendance) {
      return { success: false, message: 'You have not clocked in today yet.' };
    }
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const [inH, inM] = todayAttendance.clock_in_time.split(':').map(Number);
    const [outH, outM] = nowTime.split(':').map(Number);
    let diff = (outH + outM / 60) - (inH + inM / 60);
    if (diff < 0) diff += 24;
    const totalHours = Math.max(1, Math.round(diff * 10) / 10);

    const updatedAtt: AttendanceRecord = {
      ...todayAttendance,
      clock_out_time: nowTime,
      status: 'completed',
      total_hours: totalHours,
      work_log: workLog !== undefined ? workLog : todayAttendance.work_log
    };

    setAttendances((prev) =>
      prev.map((a) => (a.id === todayAttendance.id ? updatedAtt : a))
    );

    // Push to Supabase
    SupabaseService.exportDataToSupabase('attendances', [{
      id: updatedAtt.id,
      brand_slug: activeTenantSlug,
      user_id: updatedAtt.user_id,
      user_name: updatedAtt.user_name,
      date: updatedAtt.date,
      clock_in_time: updatedAtt.clock_in_time,
      clock_out_time: updatedAtt.clock_out_time,
      mode: updatedAtt.mode,
      status: updatedAtt.status,
      work_log: updatedAtt.work_log,
      total_hours: updatedAtt.total_hours
    }]).catch(err => console.warn('Sync clockOut to Supabase:', err));

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'attendance_clocked_out',
      title: `Daily Clock-Out: ${currentUser.full_name}`,
      description: `Clocked out at ${nowTime}. Total hours: ${totalHours}h. Work summary logged.`,
      severity: 'success',
      link_tab: 'attendance'
    });

    return { success: true, message: 'Clock out successful!' };
  };

  const updateWorkLog = (workLog: string) => {
    if (!todayAttendance) return;
    setAttendances((prev) =>
      prev.map((a) => {
        if (a.id === todayAttendance.id) {
          const updated = { ...a, work_log: workLog };
          SupabaseService.exportDataToSupabase('attendances', [{
            id: updated.id,
            brand_slug: activeTenantSlug,
            user_id: updated.user_id,
            user_name: updated.user_name,
            date: updated.date,
            clock_in_time: updated.clock_in_time,
            work_log: updated.work_log
          }]).catch(err => console.warn('Sync workLog to Supabase:', err));
          return updated;
        }
        return a;
      })
    );
  };

  // Branch Management (HQ Owner & Leader)
  const addBranch = (
    data: Omit<Branch, 'id' | 'created_at' | 'wallet_balance'> & { initial_wallet_balance?: number }
  ): { success: boolean; message: string; branchId: string } => {
    const rawCode = (data.code || data.name.replace(/[^A-Za-z]/g, '').substring(0, 3)).toUpperCase();
    const newId = `branch-${rawCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const newBranch: Branch = {
      ...data,
      id: newId,
      code: rawCode,
      created_at: simulatedDate,
      wallet_balance: data.initial_wallet_balance !== undefined ? data.initial_wallet_balance : 5000000,
      custom_retainer_fee: data.custom_retainer_fee || whitelabelConfig.default_monthly_retainer,
      package_tier: data.package_tier || 'Standard',
      contract_status: data.contract_status || 'active',
      max_monthly_design_requests: data.max_monthly_design_requests || whitelabelConfig.max_monthly_design_requests,
      max_monthly_active_promos: data.max_monthly_active_promos || whitelabelConfig.max_monthly_active_promos,
      lead_days: data.lead_days || whitelabelConfig.design_min_lead_days
    };

    setBranches((prev) => [...prev, newBranch]);

    // Initialize quota for this branch
    const period = simulatedDate.substring(0, 7);
    const newQuota: MonthlyQuota = {
      id: `quota-${period}-${newId}`,
      branch_id: newId,
      period_month: period,
      design_used: 0,
      promo_used: 0
    };
    setQuotas((prev) => [...prev, newQuota]);

    addActivity({
      branch_id: newId,
      branch_name: newBranch.name,
      user_name: currentUser.full_name,
      action_type: 'invoice_generated',
      title: `Cabang Baru Terdaftar: ${newBranch.name}`,
      description: `HQ mendaftarkan cabang baru (${newBranch.city}) dengan paket ${newBranch.package_tier} & saldo wallet Rp${newBranch.wallet_balance.toLocaleString('id-ID')}.`,
      severity: 'success',
      link_tab: 'branches'
    });

    return { success: true, message: 'Cabang franchise berhasil ditambahkan!', branchId: newId };
  };

  const updateBranch = (id: string, updates: Partial<Branch>) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    addActivity({
      branch_id: id,
      branch_name: updates.name || branches.find((b) => b.id === id)?.name,
      user_name: currentUser.full_name,
      action_type: 'custom_pricing_updated',
      title: `Profil Cabang Diperbarui: ${updates.name || id}`,
      description: `Detail cabang dan konfigurasi paket telah diperbarui oleh ${currentUser.full_name}.`,
      severity: 'info',
      link_tab: 'branches'
    });
  };

  const deleteBranch = (id: string): { success: boolean; message: string } => {
    const target = branches.find((b) => b.id === id);
    if (!target) return { success: false, message: 'Branch not found.' };

    setBranches((prev) => prev.filter((b) => b.id !== id));
    addActivity({
      user_name: currentUser.full_name,
      action_type: 'custom_pricing_updated',
      title: `Cabang Dihapus / Nonaktif: ${target.name}`,
      description: `Cabang ${target.name} telah dihapus dari jaringan franchise oleh ${currentUser.full_name}.`,
      severity: 'warning',
      link_tab: 'branches'
    });

    return { success: true, message: 'Cabang berhasil dihapus.' };
  };

  // Branch Wallet & Deposit System
  const topUpBranchWallet = (
    branchId: string,
    amount: number,
    proofUrl: string,
    notes?: string
  ): { success: boolean; message: string } => {
    const branch = branches.find((b) => b.id === branchId);
    const newTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      branch_id: branchId,
      branch_name: branch?.name || 'Branch',
      type: 'top_up',
      amount,
      title: `Top-Up Saldo Iklan & Produksi (${branch?.name})`,
      description: notes || 'Top-up deposit saldo iklan Meta Ads dan photoshoot.',
      proof_url: proofUrl,
      status: 'pending',
      created_at: simulatedDate
    };

    setWalletTransactions((prev) => [newTx, ...prev]);

    addActivity({
      branch_id: branchId,
      branch_name: branch?.name,
      user_name: currentUser.full_name,
      action_type: 'payment_proof_uploaded',
      title: `Pengajuan Top-Up Wallet: ${whitelabelConfig.currency_symbol}${amount.toLocaleString('id-ID')}`,
      description: `${branch?.name} mengunggah bukti bayar top-up saldo wallet. Menunggu verifikasi HQ.`,
      severity: 'warning',
      link_tab: 'billing'
    });

    return { success: true, message: 'Pengajuan top-up terkirim! HQ akan memverifikasi dan menambahkan ke saldo wallet.' };
  };

  const verifyWalletTransaction = (transactionId: string, approve: boolean) => {
    let targetTx: WalletTransaction | undefined;

    setWalletTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          targetTx = {
            ...tx,
            status: approve ? 'verified' : 'rejected',
            verified_by: `${currentUser.full_name} (${isHQOwner ? 'Owner' : 'Leader'})`
          };
          return targetTx;
        }
        return tx;
      })
    );

    if (targetTx && approve && targetTx.type === 'top_up') {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === targetTx?.branch_id
            ? { ...b, wallet_balance: (b.wallet_balance || 0) + (targetTx?.amount || 0) }
            : b
        )
      );

      addActivity({
        branch_id: targetTx.branch_id,
        branch_name: targetTx.branch_name,
        user_name: currentUser.full_name,
        action_type: 'payment_verified',
        title: `Top-Up Terverifikasi: +${whitelabelConfig.currency_symbol}${targetTx.amount.toLocaleString('id-ID')}`,
        description: `Saldo deposit sebesar ${whitelabelConfig.currency_symbol}${targetTx.amount.toLocaleString('id-ID')} telah dikreditkan ke ${targetTx.branch_name}.`,
        severity: 'success',
        link_tab: 'billing'
      });
    }
  };

  // Budget Requests (HQ Creative & Leader)
  const addBudgetRequest = (data: Omit<BudgetRequest, 'id' | 'created_at' | 'status' | 'approved_by'>): { success: boolean; message: string } => {
    const newBudget: BudgetRequest = {
      ...data,
      id: `bgt-${Date.now()}`,
      status: 'pending_approval',
      created_at: simulatedDate
    };

    setBudgetRequests((prev) => [newBudget, ...prev]);

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'budget_requested',
      title: `Budget Requested: ${data.title}`,
      description: `${currentUser.full_name} (${currentUser.job_title || 'HQ'}) requested ${whitelabelConfig.currency_symbol}${data.amount.toLocaleString('id-ID')} for ${data.type}.`,
      severity: 'warning',
      link_tab: 'dashboard'
    });

    return { success: true, message: 'Budget request submitted for HQ review!' };
  };

  const approveBudgetRequest = (id: string) => {
    let targetBudget: BudgetRequest | undefined;
    setBudgetRequests((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          targetBudget = {
            ...b,
            status: 'approved',
            approved_by: `${currentUser.full_name} (${isHQOwner ? 'Owner' : 'Leader'})`
          };
          return targetBudget;
        }
        return b;
      })
    );

    if (targetBudget) {
      addActivity({
        user_name: currentUser.full_name,
        action_type: 'budget_approved',
        title: `Budget Approved: ${targetBudget.title}`,
        description: `${whitelabelConfig.currency_symbol}${targetBudget.amount.toLocaleString('id-ID')} allocated for ${targetBudget.type}. Approved by ${currentUser.full_name}.`,
        severity: 'success',
        link_tab: 'dashboard'
      });
    }
  };

  const rejectBudgetRequest = (id: string) => {
    setBudgetRequests((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'rejected' } : b))
    );
  };

  const disburseBudgetRequest = (
    id: string,
    transferProofUrl: string,
    transferReference?: string,
    transferNote?: string
  ): { success: boolean; message: string } => {
    let targetBgt: BudgetRequest | undefined;

    setBudgetRequests((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          targetBgt = {
            ...b,
            status: 'disbursed',
            approved_by: b.approved_by || `${currentUser.full_name} (${isHQOwner ? 'Owner' : 'Leader'})`,
            disbursed_by: `${currentUser.full_name} (${isHQOwner ? 'Owner' : 'Leader'})`,
            disbursed_at: `${simulatedDate} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`,
            transfer_proof_url: transferProofUrl,
            transfer_reference: transferReference || `BCA-MB-${Date.now().toString().slice(-6)}`,
            transfer_note: transferNote || `Dana ${b.type} ditransfer ke pelaksana kreatif.`
          };
          return targetBgt;
        }
        return b;
      })
    );

    if (targetBgt && targetBgt.target_branch_id) {
      const branchId = targetBgt.target_branch_id;
      // Deduct from branch wallet balance
      setBranches((prev) =>
        prev.map((b) =>
          b.id === branchId
            ? { ...b, wallet_balance: Math.max(0, (b.wallet_balance || 0) - targetBgt!.amount) }
            : b
        )
      );

      // Record wallet transaction deduction
      const deductTx: WalletTransaction = {
        id: `wtx-${Date.now()}`,
        branch_id: branchId,
        branch_name: targetBgt.target_branch_name,
        type: 'budget_deduct',
        amount: targetBgt.amount,
        title: `Pemotongan Saldo: ${targetBgt.title}`,
        description: `Disbursement untuk ${targetBgt.type}. Ref: ${targetBgt.transfer_reference || 'N/A'}`,
        reference_id: targetBgt.id,
        proof_url: transferProofUrl,
        status: 'verified',
        created_at: simulatedDate,
        verified_by: currentUser.full_name
      };
      setWalletTransactions((prev) => [deductTx, ...prev]);

      addActivity({
        branch_id: branchId,
        branch_name: targetBgt.target_branch_name,
        user_name: currentUser.full_name,
        action_type: 'budget_approved',
        title: `Dana Ditransfer: ${targetBgt.title}`,
        description: `HQ mentransfer ${whitelabelConfig.currency_symbol}${targetBgt.amount.toLocaleString('id-ID')} ke tim kreatif. Bukti transfer telah dilampirkan.`,
        severity: 'success',
        link_tab: 'requests'
      });
    }

    return { success: true, message: 'Dana berhasil ditransfer dan bukti pembayaran telah diunggah!' };
  };

  const acknowledgeBudgetDisbursement = (id: string) => {
    let targetBgt: BudgetRequest | undefined;
    setBudgetRequests((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          targetBgt = {
            ...b,
            status: 'acknowledged',
            acknowledged_at: `${simulatedDate} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`
          };
          return targetBgt;
        }
        return b;
      })
    );

    if (targetBgt) {
      addActivity({
        branch_id: targetBgt.target_branch_id,
        branch_name: targetBgt.target_branch_name,
        user_name: currentUser.full_name,
        action_type: 'request_status_changed',
        title: `Konfirmasi Penerimaan Dana: ${targetBgt.title}`,
        description: `${currentUser.full_name} mengonfirmasi bahwa dana operasional ${whitelabelConfig.currency_symbol}${targetBgt.amount.toLocaleString('id-ID')} telah diterima.`,
        severity: 'info',
        link_tab: 'requests'
      });
    }
  };

  const submitBudgetCompletionReport = (id: string, report: BudgetCompletionReport): { success: boolean; message: string } => {
    let targetBgt: BudgetRequest | undefined;

    setBudgetRequests((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          targetBgt = {
            ...b,
            status: 'completed',
            completion_report: report
          };
          return targetBgt;
        }
        return b;
      })
    );

    if (targetBgt) {
      addActivity({
        branch_id: targetBgt.target_branch_id,
        branch_name: targetBgt.target_branch_name,
        user_name: currentUser.full_name,
        action_type: 'request_status_changed',
        title: `Laporan Pelaksanaan Selesai: ${targetBgt.title}`,
        description: `Tim kreatif mengunggah laporan pertanggungjawaban (LPJ) biaya ${whitelabelConfig.currency_symbol}${report.spent_amount.toLocaleString('id-ID')} & screenshot hasil untuk ${targetBgt.target_branch_name}.`,
        severity: 'success',
        link_tab: 'billing'
      });
    }

    return { success: true, message: language === 'ko' ? '집행 보고서(LPJ)가 지점에 성공적으로 제출되었습니다.' : 'LPJ completion report successfully delivered to branch!' };
  };

  // HQ Operational Reimbursements & Work Expense
  const addHqReimbursement = (data: {
    category: HqReimbursementCategory;
    title: string;
    amount: number;
    description: string;
    receipt_proof_url: string;
  }): { success: boolean; message: string } => {
    const newReimb: HqReimbursementRequest = {
      id: `reimb-${Date.now()}`,
      requester_id: currentUser.id,
      requester_name: currentUser.full_name,
      requester_role: currentUser.role,
      category: data.category,
      title: data.title,
      amount: data.amount,
      description: data.description,
      receipt_proof_url: data.receipt_proof_url,
      status: 'pending_approval',
      created_at: simulatedDate
    };

    setHqReimbursements((prev) => [newReimb, ...prev]);

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'reimbursement_requested',
      title: `${language === 'ko' ? '본사 경비 청구' : 'Expense Claim Submitted'}: ${data.title}`,
      description: `${currentUser.full_name} (${currentUser.job_title || 'HQ Team'}) submitted claim for ${whitelabelConfig.currency_symbol}${data.amount.toLocaleString('id-ID')} (${data.category}).`,
      severity: 'warning',
      link_tab: 'billing'
    });

    return {
      success: true,
      message: language === 'ko' ? '본사 대표 승인을 위한 경비 청구서가 접수되었습니다.' : 'Expense claim submitted to HQ Owner for review!'
    };
  };

  const approveHqReimbursement = (id: string, adminNotes?: string) => {
    let target: HqReimbursementRequest | undefined;
    setHqReimbursements((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          target = {
            ...r,
            status: 'approved',
            approved_by: `${currentUser.full_name} (HQ Owner)`,
            approved_at: simulatedDate,
            admin_notes: adminNotes || r.admin_notes
          };
          return target;
        }
        return r;
      })
    );

    if (target) {
      addActivity({
        user_name: currentUser.full_name,
        action_type: 'reimbursement_processed',
        title: `${language === 'ko' ? '경비 청구 승인' : 'Expense Claim Approved'}: ${target.title}`,
        description: `HQ Owner approved reimbursement of ${whitelabelConfig.currency_symbol}${target.amount.toLocaleString('id-ID')} for ${target.requester_name}. Payout is ready for batch disbursement.`,
        severity: 'success',
        link_tab: 'billing'
      });
    }
  };

  const rejectHqReimbursement = (id: string, adminNotes?: string) => {
    setHqReimbursements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected', admin_notes: adminNotes || 'Rejected by Owner' } : r))
    );
  };

  const disburseHqReimbursementBatch = (
    reimbursementIds: string[],
    transferProofUrl: string,
    transferReference?: string,
    adminNotes?: string
  ): { success: boolean; message: string } => {
    const batchId = `batch-${Date.now()}`;
    let totalAmount = 0;
    const recipientNames = new Set<string>();

    setHqReimbursements((prev) =>
      prev.map((r) => {
        if (reimbursementIds.includes(r.id)) {
          totalAmount += r.amount;
          recipientNames.add(r.requester_name);
          return {
            ...r,
            status: 'reimbursed',
            reimbursed_at: simulatedDate,
            reimburse_batch_id: batchId,
            transfer_proof_url: transferProofUrl,
            transfer_reference: transferReference || `BCA-REIMB-${Date.now().toString().slice(-6)}`,
            admin_notes: adminNotes || r.admin_notes
          };
        }
        return r;
      })
    );

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'reimbursement_processed',
      title: `${language === 'ko' ? '경비 일괄 정산 송금 완료' : 'Collective Reimbursement Disbursed'}: ${reimbursementIds.length} Items`,
      description: `HQ Owner completed payout of ${whitelabelConfig.currency_symbol}${totalAmount.toLocaleString('id-ID')} for ${Array.from(recipientNames).join(', ')}. Proof slip attached.`,
      severity: 'success',
      link_tab: 'billing'
    });

    return {
      success: true,
      message: language === 'ko'
        ? `총 ${reimbursementIds.length}건 (${whitelabelConfig.currency_symbol}${totalAmount.toLocaleString('id-ID')}) 경비 정산 및 이체 증빙 첨부가 완료되었습니다.`
        : `Successfully disbursed ${reimbursementIds.length} expense items (${whitelabelConfig.currency_symbol}${totalAmount.toLocaleString('id-ID')}) with proof slip attached!`
    };
  };

  // HQ To-Do List & Auto Work Log
  const addHqTodo = (
    title: string,
    category: 'design' | 'promo' | 'shoot' | 'general' = 'general',
    related_request_id?: string,
    target_date?: string
  ) => {
    if (!title.trim()) return;
    const newTodo: HqTodoItem = {
      id: `todo-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      title: title.trim(),
      category,
      related_request_id,
      target_date: target_date || simulatedDate,
      completed: false,
      included_in_work_log: false,
      created_at: simulatedDate
    };

    setHqTodos((prev) => [newTodo, ...prev]);

    SupabaseService.exportDataToSupabase('hq_todos', [{
      id: newTodo.id,
      brand_slug: activeTenantSlug,
      user_id: newTodo.user_id,
      user_name: newTodo.user_name,
      title: newTodo.title,
      category: newTodo.category,
      related_request_id: newTodo.related_request_id || null,
      target_date: newTodo.target_date || null,
      completed: false,
      included_in_work_log: false
    }]).catch(err => console.warn('Sync addHqTodo to Supabase:', err));
  };

  const toggleHqTodo = (id: string) => {
    setHqTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          const updated = {
            ...t,
            completed: nextCompleted,
            completed_at: nextCompleted ? `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : undefined,
            included_in_work_log: nextCompleted
          };
          SupabaseService.exportDataToSupabase('hq_todos', [{
            id: updated.id,
            brand_slug: activeTenantSlug,
            user_id: updated.user_id,
            user_name: updated.user_name,
            title: updated.title,
            category: updated.category,
            completed: updated.completed,
            completed_at: updated.completed_at || null,
            included_in_work_log: updated.included_in_work_log
          }]).catch(err => console.warn('Sync toggleHqTodo to Supabase:', err));
          return updated;
        }
        return t;
      })
    );
  };

  const deleteHqTodo = (id: string) => {
    setHqTodos((prev) => prev.filter((t) => t.id !== id));
    SupabaseService.deleteFromSupabase('hq_todos', `id=eq.${id}&brand_slug=eq.${activeTenantSlug}`).catch(err => console.warn('Sync deleteHqTodo to Supabase:', err));
  };

  const generateClockOutWhatsappReport = (): { reportText: string; waUrl: string } => {
    const todayTodos = hqTodos.filter((t) => t.user_id === currentUser.id && t.completed);
    const pendingTodos = hqTodos.filter((t) => t.user_id === currentUser.id && !t.completed);
    const ownerPhone = whitelabelConfig.contact_whatsapp.replace(/[^0-9]/g, '');

    let text = '';
    if (language === 'ko') {
      text = `📊 *[일일 업무 보고서 - ${whitelabelConfig.brand_name} 크리에이티브팀]*\n` +
        `👤 담당자: ${currentUser.full_name} (${currentUser.job_title || 'HQ Studio'})\n` +
        `📅 일자: ${simulatedDate}\n` +
        `⏰ 근무 형태: ${todayAttendance?.mode || 'Office HQ (WFO)'}\n\n` +
        `✅ *오늘 완료된 작업 내역:*\n` +
        (todayTodos.length > 0
          ? todayTodos.map((t, idx) => `${idx + 1}. [${t.category.toUpperCase()}] ${t.title}`).join('\n')
          : `• ${todayAttendance?.work_log || '디자인 시안 검토 및 지점 요청 처리'}`) +
        `\n\n📌 *익일 진행 예정 및 메모:*\n` +
        (pendingTodos.length > 0
          ? pendingTodos.map((t, idx) => `• ${t.title}`).join('\n')
          : '• 모든 배정 작업 정상 마감 완료') +
        `\n\n수고하셨습니다!\n_${whitelabelConfig.brand_name} HQ Operations_`;
    } else {
      text = `📊 *[Daily Work Report - ${whitelabelConfig.brand_name} HQ Creative]*\n` +
        `👤 Staff: ${currentUser.full_name} (${currentUser.job_title || 'HQ Studio'})\n` +
        `📅 Date: ${simulatedDate}\n` +
        `⏰ Work Mode: ${todayAttendance?.mode || 'Office HQ (WFO)'}\n\n` +
        `✅ *Completed Tasks & Deliverables Today:*\n` +
        (todayTodos.length > 0
          ? todayTodos.map((t, idx) => `${idx + 1}. [${t.category.toUpperCase()}] ${t.title}`).join('\n')
          : `• ${todayAttendance?.work_log || 'Design briefs review & asset deliveries'}`) +
        `\n\n📌 *Pending / Next Day Priorities:*\n` +
        (pendingTodos.length > 0
          ? pendingTodos.map((t, idx) => `• ${t.title}`).join('\n')
          : '• All scheduled deliverables completed') +
        `\n\nHave a great evening!\n_${whitelabelConfig.brand_name} Operations_`;
    }

    const waUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(text)}`;
    return { reportText: text, waUrl };
  };

  // Team Chat & Collaboration Hub
  const unreadChatCount = useMemo(() => {
    return teamChatMessages.filter((msg) => {
      // Don't count own messages
      if (msg.sender_id === currentUser.id) return false;
      // HQ internal channel is only accessible to HQ roles
      if (msg.channel === 'hq_internal' && !isHQ) return false;
      // Branch check for branch users
      if (!isHQ && msg.branch_id && msg.branch_id !== currentBranch?.id) return false;

      const isRead = msg.read_by && msg.read_by.includes(currentUser.id);
      return !isRead;
    }).length;
  }, [teamChatMessages, currentUser.id, isHQ, currentBranch]);

  const markChatAsRead = (channel?: 'hq_internal' | 'branch_collab') => {
    setTeamChatMessages((prev) =>
      prev.map((msg) => {
        if (channel && msg.channel !== channel) return msg;
        const currentReads = msg.read_by || [];
        if (!currentReads.includes(currentUser.id)) {
          const updated = { ...msg, read_by: [...currentReads, currentUser.id] };
          SupabaseService.exportDataToSupabase('team_chat_messages', [{
            id: updated.id,
            brand_slug: activeTenantSlug,
            read_by: updated.read_by
          }]).catch(err => console.warn('Sync read_by to Supabase:', err));
          return updated;
        }
        return msg;
      })
    );
  };

  const sendTeamChatMessage = (
    channel: 'hq_internal' | 'branch_collab',
    message: string,
    taggedUserIds: string[] = [],
    linkedRequestId?: string,
    linkedRequestTitle?: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ) => {
    if (!message.trim() && !mediaUrl) return;

    const taggedNames: string[] = [];
    taggedUserIds.forEach((uid) => {
      const u = users.find((x) => x.id === uid);
      if (u) taggedNames.push(u.full_name);
    });

    const newMsg: TeamChatMessage = {
      id: `chat-${Date.now()}`,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.role,
      sender_avatar: currentUser.avatar_url,
      channel,
      branch_id: currentBranch?.id,
      branch_name: currentBranch?.name,
      message: message.trim(),
      tagged_user_ids: taggedUserIds,
      tagged_user_names: taggedNames,
      linked_request_id: linkedRequestId,
      linked_request_title: linkedRequestTitle,
      media_url: mediaUrl,
      media_type: mediaType,
      read_by: [currentUser.id],
      created_at: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    setTeamChatMessages((prev) => [...prev, newMsg]);

    // Push to Supabase immediately so other devices get it
    SupabaseService.exportDataToSupabase('team_chat_messages', [{
      id: newMsg.id,
      brand_slug: activeTenantSlug,
      sender_id: newMsg.sender_id,
      sender_name: newMsg.sender_name,
      sender_role: newMsg.sender_role,
      sender_avatar: newMsg.sender_avatar || '',
      channel: newMsg.channel,
      branch_id: newMsg.branch_id || null,
      branch_name: newMsg.branch_name || null,
      message: newMsg.message,
      tagged_user_ids: newMsg.tagged_user_ids || [],
      tagged_user_names: newMsg.tagged_user_names || [],
      linked_request_id: newMsg.linked_request_id || null,
      linked_request_title: newMsg.linked_request_title || null,
      media_url: newMsg.media_url || null,
      media_type: newMsg.media_type || null,
      read_by: newMsg.read_by || []
    }]).catch(err => console.warn('Sync sendTeamChatMessage to Supabase:', err));

    // Send notifications to tagged users
    if (taggedUserIds.length > 0) {
      addActivity({
        branch_id: currentBranch?.id,
        user_name: currentUser.full_name,
        action_type: 'user_mentioned',
        title: `${language === 'ko' ? '새로운 멘션 태그' : 'You were mentioned by'} ${currentUser.full_name}`,
        description: `"${(message || 'Attached media').slice(0, 80)}..." in ${channel === 'hq_internal' ? 'HQ Internal' : 'Branch Collab'}`,
        severity: 'purple',
        link_tab: 'chat'
      });
    }
  };

  // Calendar Meeting Agendas
  const addMeetingAgenda = (data: Omit<MeetingAgenda, 'id' | 'created_at'>): { success: boolean; message: string } => {
    const newMeet: MeetingAgenda = {
      ...data,
      id: `meet-${Date.now()}`,
      created_at: simulatedDate
    };

    setMeetingAgendas((prev) => [newMeet, ...prev]);

    SupabaseService.exportDataToSupabase('meeting_agendas', [{
      id: newMeet.id,
      brand_slug: activeTenantSlug,
      title: newMeet.title,
      host_name: newMeet.host_name || currentUser.full_name,
      date: newMeet.date,
      start_time: newMeet.start_time,
      end_time: newMeet.end_time,
      type: newMeet.type || 'hq_sync',
      location_or_link: newMeet.location_or_link,
      attendees: newMeet.attendees || [],
      notes: newMeet.notes || ''
    }]).catch(err => console.warn('Sync meeting to Supabase:', err));

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'exposure_scheduled',
      title: `${language === 'ko' ? '새 회의 일정 등록' : 'Meeting Scheduled'}: ${data.title}`,
      description: `${data.date} (${data.start_time} - ${data.end_time}) | Location: ${data.location_or_link}`,
      severity: 'info',
      link_tab: 'calendar'
    });

    return {
      success: true,
      message: language === 'ko' ? '회의 일정이 캘린더에 성공적으로 등록되었습니다.' : 'Meeting agenda scheduled on calendar!'
    };
  };

  const deleteMeetingAgenda = (id: string) => {
    setMeetingAgendas((prev) => prev.filter((m) => m.id !== id));
    SupabaseService.deleteFromSupabase('meeting_agendas', `id=eq.${id}&brand_slug=eq.${activeTenantSlug}`).catch(err => console.warn('Sync deleteMeeting to Supabase:', err));
  };

  // Branch Caption & Mockup Settings
  const updateBranchCaptionSettings = (branchId: string, settings: { default_caption_template?: string; default_hashtags?: string }) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === branchId ? { ...b, ...settings } : b))
    );
  };

  // Shoot Requests (Branch Store Managers & Owners)
  const addShootRequest = (data: Omit<ShootRequest, 'id' | 'created_at' | 'status'>): { success: boolean; message: string } => {
    const branch = branches.find((b) => b.id === data.branch_id);
    const newShoot: ShootRequest = {
      ...data,
      id: `sht-${Date.now()}`,
      branch_name: branch?.name || 'Branch',
      status: 'pending',
      created_at: simulatedDate
    };

    setShootRequests((prev) => [newShoot, ...prev]);

    SupabaseService.exportDataToSupabase('shoot_requests', [{
      id: newShoot.id,
      brand_slug: activeTenantSlug,
      branch_id: newShoot.branch_id,
      branch_name: newShoot.branch_name,
      requester_id: newShoot.requester_id,
      requester_name: newShoot.requester_name,
      requester_role: newShoot.requester_role,
      type: newShoot.type || 'photoshoot_visit',
      title: newShoot.title,
      preferred_date: newShoot.preferred_date,
      details: newShoot.details || '',
      focus_products: newShoot.focus_products || [],
      status: 'pending'
    }]).catch(err => console.warn('Sync addShootRequest to Supabase:', err));

    addActivity({
      branch_id: data.branch_id,
      branch_name: branch?.name,
      user_name: currentUser.full_name,
      action_type: 'shoot_requested',
      title: `Photoshoot Visit Requested: ${data.title}`,
      description: `${branch?.name} requested photoshoot/additional work on ${data.preferred_date}. Requester: ${currentUser.full_name}`,
      severity: 'purple',
      link_tab: 'exposure'
    });

    return { success: true, message: 'Photoshoot request submitted to HQ team!' };
  };

  const updateShootRequestStatus = (id: string, status: ShootRequest['status'], assignedCreativeId?: string) => {
    const assignedUser = users.find((u) => u.id === assignedCreativeId);
    let updatedShoot: ShootRequest | undefined;

    setShootRequests((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedShoot = {
            ...s,
            status,
            assigned_creative_id: assignedCreativeId || s.assigned_creative_id,
            assigned_creative_name: assignedUser ? assignedUser.full_name : s.assigned_creative_name
          };
          return updatedShoot;
        }
        return s;
      })
    );

    if (updatedShoot) {
      SupabaseService.exportDataToSupabase('shoot_requests', [{
        id: updatedShoot.id,
        brand_slug: activeTenantSlug,
        branch_id: updatedShoot.branch_id,
        branch_name: updatedShoot.branch_name,
        status: updatedShoot.status,
        assigned_creative_id: updatedShoot.assigned_creative_id || null,
        assigned_creative_name: updatedShoot.assigned_creative_name || null
      }]).catch(err => console.warn('Sync updateShootRequest to Supabase:', err));

      addActivity({
        branch_id: updatedShoot.branch_id,
        branch_name: updatedShoot.branch_name,
        user_name: currentUser.full_name,
        action_type: 'shoot_requested',
        title: `Photoshoot Request Updated: ${updatedShoot.title}`,
        description: `Shoot status is now ${status}. Assigned to: ${updatedShoot.assigned_creative_name || 'Creative Team'}`,
        severity: status === 'scheduled' ? 'success' : 'info',
        link_tab: 'exposure'
      });
    }
  };

  // Helper to get quota for branch & period
  const getBranchQuota = (branchId: string, periodMonth?: string): MonthlyQuota => {
    const month = periodMonth || simulatedDate.slice(0, 7);
    const found = quotas.find((q) => q.branch_id === branchId && q.period_month === month);
    if (found) return found;
    return {
      id: `quota-${branchId}-${month}`,
      branch_id: branchId,
      period_month: month,
      design_used: 0,
      promo_used: 0
    };
  };

  // Date calculation: H+N minimal date based on whitelabel config
  const calculateMinTargetDate = (): string => {
    const base = new Date(simulatedDate);
    const leadDays = whitelabelConfig.design_min_lead_days || 5;
    base.setDate(base.getDate() + leadDays);
    return base.toISOString().split('T')[0];
  };

  const isTargetDateValid = (targetDate: string): { valid: boolean; reason?: string } => {
    if (!targetDate) return { valid: false, reason: 'Target publication date is required.' };
    const minDate = calculateMinTargetDate();
    const leadDays = whitelabelConfig.design_min_lead_days || 5;
    if (targetDate < minDate) {
      return {
        valid: false,
        reason: language === 'ko'
          ? `최소 H-${leadDays} 사전 마감 규정이 적용됩니다. 가장 빠른 가능일은 ${minDate}입니다.`
          : `Target date must be at least H-${leadDays}! Earliest allowed publication date is ${minDate}.`
      };
    }
    return { valid: true };
  };

  // Promo locking rule based on whitelabel cutoff day
  const isPromoSubmissionAllowed = (targetMonth: string): { allowed: boolean; reason?: string } => {
    const currentDate = new Date(simulatedDate);
    const dayOfMonth = currentDate.getDate();
    const currentYearMonth = simulatedDate.slice(0, 7);
    const cutoffDay = whitelabelConfig.promo_cutoff_day_of_month || 25;

    if (targetMonth > currentYearMonth) {
      if (dayOfMonth > cutoffDay) {
        return {
          allowed: false,
          reason: language === 'ko'
            ? `익월(${targetMonth}) 프로모션 접수는 매월 ${cutoffDay}일에 마감됩니다. (현재: ${simulatedDate})`
            : `Promo submission for ${targetMonth} is locked after day ${cutoffDay} of current month (${simulatedDate}). Contact HQ for emergency approval.`
        };
      }
    }
    return { allowed: true };
  };

  // Design Request submission with Quota check & Lead time check
  const addDesignRequest = (data: {
    branch_id: string;
    title: string;
    description: string;
    target_date: string;
    category: ContentPillar;
    brief_attachment_name?: string;
  }): { success: boolean; message: string } => {
    const periodMonth = simulatedDate.slice(0, 7);
    const quota = getBranchQuota(data.branch_id, periodMonth);
    const branch = branches.find((b) => b.id === data.branch_id);
    const maxDesignQuota = whitelabelConfig.max_monthly_design_requests || 3;

    if (quota.design_used >= maxDesignQuota) {
      return {
        success: false,
        message: language === 'ko'
          ? `월간 디자인 요청 한도(${maxDesignQuota}/${maxDesignQuota})를 모두 사용하였습니다.`
          : `Monthly design quota reached maximum (${maxDesignQuota}/${maxDesignQuota}). Quota will refresh next month.`
      };
    }

    const dateCheck = isTargetDateValid(data.target_date);
    if (!dateCheck.valid) {
      return {
        success: false,
        message: dateCheck.reason || 'Invalid publication date.'
      };
    }

    const newRequest: DesignRequest = {
      id: `req-${Date.now()}`,
      branch_id: data.branch_id,
      title: data.title,
      description: data.description,
      target_date: data.target_date,
      status: 'pending',
      category: data.category,
      brief_attachment_name: data.brief_attachment_name || 'brief_assets.zip',
      created_at: simulatedDate
    };

    setDesignRequests((prev) => [newRequest, ...prev]);

    // Push new design request to Supabase
    SupabaseService.exportDataToSupabase('design_requests', [{
      id: newRequest.id,
      brand_slug: activeTenantSlug,
      branch_id: newRequest.branch_id,
      title: newRequest.title,
      description: newRequest.description,
      target_date: newRequest.target_date,
      status: 'pending',
      category: newRequest.category,
      brief_attachment_name: newRequest.brief_attachment_name || null
    }]).catch(err => console.warn('Sync addDesignRequest to Supabase:', err));

    // Update quota
    setQuotas((prev) => {
      const idx = prev.findIndex(
        (q) => q.branch_id === data.branch_id && q.period_month === periodMonth
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], design_used: updated[idx].design_used + 1 };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `quota-${data.branch_id}-${periodMonth}`,
            branch_id: data.branch_id,
            period_month: periodMonth,
            design_used: 1,
            promo_used: 0
          }
        ];
      }
    });

    addActivity({
      branch_id: data.branch_id,
      branch_name: branch?.name,
      user_name: currentUser.full_name,
      action_type: 'request_submitted',
      title: language === 'ko' ? `신규 디자인 요청: ${data.title}` : `New Design Request: ${data.title}`,
      description: language === 'ko'
        ? `${branch?.name}에서 ${data.category} 부문 디자인을 요청했습니다. (희망일: ${data.target_date})`
        : `${branch?.name || 'Branch'} submitted request for ${data.category}. Target: ${data.target_date}.`,
      severity: 'info',
      target_id: newRequest.id,
      link_tab: 'requests'
    });

    return {
      success: true,
      message: language === 'ko' ? '디자인 요청이 접수되었습니다! 상태: 대기중.' : 'Design request submitted! Status: Pending Review.'
    };
  };

  const updateDesignRequestStatus = (
    requestId: string,
    status: RequestStatus,
    asset_result_url?: string,
    feedback_notes?: string,
    approval_mode?: 'self_approved' | 'leader_approved' | 'pending_leader'
  ) => {
    let targetReq: DesignRequest | undefined;

    setDesignRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetReq = {
            ...req,
            status,
            asset_result_url: asset_result_url !== undefined ? asset_result_url : req.asset_result_url,
            feedback_notes: feedback_notes !== undefined ? feedback_notes : req.feedback_notes,
            completed_at: status === 'approved' ? simulatedDate : req.completed_at,
            approval_mode: approval_mode || req.approval_mode,
            approved_by: status === 'approved' ? currentUser.full_name : req.approved_by
          };
          return targetReq;
        }
        return req;
      })
    );

    if (targetReq) {
      SupabaseService.exportDataToSupabase('design_requests', [{
        id: targetReq.id,
        brand_slug: activeTenantSlug,
        branch_id: targetReq.branch_id,
        title: targetReq.title,
        description: targetReq.description,
        target_date: targetReq.target_date,
        category: targetReq.category,
        status: targetReq.status,
        asset_result_url: targetReq.asset_result_url || null,
        preview_media_url: targetReq.preview_media_url || null,
        feedback_notes: targetReq.feedback_notes || null,
        approval_mode: targetReq.approval_mode || 'self_approved'
      }]).catch(err => console.warn('Sync updateDesignRequestStatus to Supabase:', err));

      const branch = branches.find((b) => b.id === targetReq?.branch_id);

      // Crucial: Send notification targeted to branch so branch users receive instant alerts!
      addActivity({
        branch_id: targetReq.branch_id,
        branch_name: branch?.name,
        user_name: currentUser.full_name,
        action_type: 'request_status_changed',
        title: language === 'ko' ? `디자인 상태 변경: ${targetReq.title}` : `Design Status: ${targetReq.title}`,
        description: language === 'ko'
          ? `요청 "${targetReq.title}" 상태가 [${status.toUpperCase()}]로 업데이트되었습니다. ${asset_result_url ? '결과물 다운로드 가능.' : ''}`
          : `Request "${targetReq.title}" status changed to [${status.toUpperCase()}]. ${asset_result_url ? 'Final deliverable ready.' : ''}`,
        severity: status === 'approved' ? 'success' : status === 'rejected' ? 'warning' : 'info',
        target_id: targetReq.id,
        link_tab: 'requests'
      });
    }
  };

  const assignDesignRequest = (requestId: string, userId: string) => {
    const assignedUser = users.find((u) => u.id === userId);
    let targetReq: DesignRequest | undefined;

    setDesignRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetReq = {
            ...req,
            assigned_to_user_id: userId,
            assigned_to_name: assignedUser?.full_name || 'Creative Staff',
            status: req.status === 'pending' ? 'in_progress' : req.status
          };
          return targetReq;
        }
        return req;
      })
    );

    if (targetReq) {
      SupabaseService.exportDataToSupabase('design_requests', [{
        id: targetReq.id,
        brand_slug: activeTenantSlug,
        branch_id: targetReq.branch_id,
        title: targetReq.title,
        description: targetReq.description,
        target_date: targetReq.target_date,
        category: targetReq.category,
        status: targetReq.status,
        assigned_to_user_id: targetReq.assigned_to_user_id || null,
        assigned_to_name: targetReq.assigned_to_name || null
      }]).catch(err => console.warn('Sync assignDesignRequest to Supabase:', err));
    }

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'request_status_changed',
      title: `Task Assigned: ${assignedUser?.full_name || 'Staff'}`,
      description: `Creative staff ${assignedUser?.full_name} claimed request ${requestId}`,
      severity: 'info',
      target_id: requestId,
      link_tab: 'requests'
    });
  };

  const updateDesignRequestDeliverable = (
    requestId: string,
    urlOrPayload: string | {
      asset_result_url?: string;
      preview_media_url?: string;
      preview_media_type?: 'image' | 'video';
      canva_url?: string;
      figma_url?: string;
      drive_url?: string;
      caption?: string;
      creative_notes?: string;
      status?: RequestStatus;
      approval_mode?: 'self_approved' | 'leader_approved' | 'pending_leader';
    },
    notes?: string,
    status?: RequestStatus,
    approval_mode?: 'self_approved' | 'leader_approved' | 'pending_leader'
  ) => {
    let targetReq: DesignRequest | undefined;

    setDesignRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if (typeof urlOrPayload === 'string') {
            targetReq = {
              ...req,
              asset_result_url: urlOrPayload,
              creative_notes: notes !== undefined ? notes : req.creative_notes,
              status: status || 'review',
              approval_mode: approval_mode || (status === 'approved' ? 'self_approved' : 'pending_leader'),
              completed_at: status === 'approved' ? simulatedDate : req.completed_at,
              approved_by: status === 'approved' ? currentUser.full_name : req.approved_by
            };
          } else {
            const nextStatus = urlOrPayload.status || req.status || 'review';
            targetReq = {
              ...req,
              asset_result_url: urlOrPayload.asset_result_url !== undefined ? urlOrPayload.asset_result_url : req.asset_result_url,
              preview_media_url: urlOrPayload.preview_media_url !== undefined ? urlOrPayload.preview_media_url : req.preview_media_url,
              preview_media_type: urlOrPayload.preview_media_type !== undefined ? urlOrPayload.preview_media_type : req.preview_media_type,
              canva_url: urlOrPayload.canva_url !== undefined ? urlOrPayload.canva_url : req.canva_url,
              figma_url: urlOrPayload.figma_url !== undefined ? urlOrPayload.figma_url : req.figma_url,
              drive_url: urlOrPayload.drive_url !== undefined ? urlOrPayload.drive_url : req.drive_url,
              caption: urlOrPayload.caption !== undefined ? urlOrPayload.caption : req.caption,
              creative_notes: urlOrPayload.creative_notes !== undefined ? urlOrPayload.creative_notes : req.creative_notes,
              status: nextStatus,
              approval_mode: urlOrPayload.approval_mode || (nextStatus === 'approved' ? 'self_approved' : 'pending_leader'),
              completed_at: nextStatus === 'approved' ? simulatedDate : req.completed_at,
              approved_by: nextStatus === 'approved' ? currentUser.full_name : req.approved_by
            };
          }
          return targetReq;
        }
        return req;
      })
    );

    if (targetReq) {
      SupabaseService.exportDataToSupabase('design_requests', [{
        id: targetReq.id,
        brand_slug: activeTenantSlug,
        branch_id: targetReq.branch_id,
        title: targetReq.title,
        description: targetReq.description,
        target_date: targetReq.target_date,
        category: targetReq.category,
        status: targetReq.status,
        asset_result_url: targetReq.asset_result_url || null,
        preview_media_url: targetReq.preview_media_url || null,
        preview_media_type: targetReq.preview_media_type || null,
        canva_url: targetReq.canva_url || null,
        figma_url: targetReq.figma_url || null,
        drive_url: targetReq.drive_url || null,
        caption: targetReq.caption || null,
        approval_mode: targetReq.approval_mode || 'self_approved'
      }]).catch(err => console.warn('Sync updateDesignRequestDeliverable to Supabase:', err));

      const branch = branches.find((b) => b.id === targetReq?.branch_id);
      addActivity({
        branch_id: targetReq.branch_id,
        branch_name: branch?.name,
        user_name: currentUser.full_name,
        action_type: 'request_status_changed',
        title: language === 'ko' ? `디자인 결과물 업데이트: ${targetReq.title}` : `Deliverable Ready: ${targetReq.title}`,
        description: language === 'ko'
          ? `결과물 다운로드 링크가 업로드되었습니다. 상태: ${targetReq.status.toUpperCase()}`
          : `Deliverable link & preview uploaded. Request status: ${targetReq.status.toUpperCase()}`,
        severity: targetReq.status === 'approved' ? 'success' : 'info',
        target_id: requestId,
        link_tab: 'requests'
      });
    }
  };

  const addDesignComment = (requestId: string, message: string, tag?: string) => {
    if (!message.trim()) return;
    const newComment = {
      id: `comm-${Date.now()}`,
      request_id: requestId,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      user_avatar: currentUser.avatar_url,
      message: message.trim(),
      tag: tag || undefined,
      created_at: `${simulatedDate} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    };

    setDesignRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const existing = req.comments || [];
          return {
            ...req,
            comments: [...existing, newComment]
          };
        }
        return req;
      })
    );

    const targetReq = designRequests.find((r) => r.id === requestId);
    const branch = branches.find((b) => b.id === targetReq?.branch_id);

    addActivity({
      branch_id: targetReq?.branch_id,
      branch_name: branch?.name,
      user_name: currentUser.full_name,
      action_type: 'request_status_changed',
      title: `Feedback Baru: ${targetReq?.title || 'Design Request'}`,
      description: `${currentUser.full_name} (${currentUser.role}): "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
      severity: 'purple',
      target_id: requestId,
      link_tab: 'requests'
    });
  };

  const updateDesignCaption = (requestId: string, caption: string) => {
    setDesignRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, caption } : req))
    );
  };

  // Promo Request submission with Quota check & Cutoff
  const addPromoRequest = (data: {
    branch_id: string;
    title: string;
    mechanic: string;
    target_month: string;
    start_date: string;
    end_date: string;
    terms: string;
  }): { success: boolean; message: string } => {
    const periodMonth = data.target_month || simulatedDate.slice(0, 7);
    const quota = getBranchQuota(data.branch_id, periodMonth);
    const branch = branches.find((b) => b.id === data.branch_id);
    const maxPromoQuota = whitelabelConfig.max_monthly_active_promos || 2;

    if (quota.promo_used >= maxPromoQuota) {
      return {
        success: false,
        message: language === 'ko'
          ? `최대 활성 프로모션 한도(${maxPromoQuota}/${maxPromoQuota})를 초과했습니다.`
          : `Maximum active promos reached (${maxPromoQuota}/${maxPromoQuota}). Wait for current promo to finish.`
      };
    }

    const promoCheck = isPromoSubmissionAllowed(data.target_month);
    if (!promoCheck.allowed) {
      return {
        success: false,
        message: promoCheck.reason || 'Promo submission locked.'
      };
    }

    const newPromo: PromoRequest = {
      id: `prm-${Date.now()}`,
      branch_id: data.branch_id,
      title: data.title,
      mechanic: data.mechanic,
      target_month: data.target_month,
      start_date: data.start_date,
      end_date: data.end_date,
      terms: data.terms,
      status: 'active',
      created_at: simulatedDate
    };

    setPromos((prev) => [newPromo, ...prev]);

    SupabaseService.exportDataToSupabase('promos', [{
      id: newPromo.id,
      brand_slug: activeTenantSlug,
      branch_id: newPromo.branch_id,
      title: newPromo.title,
      mechanic: newPromo.mechanic,
      target_month: newPromo.target_month,
      start_date: newPromo.start_date,
      end_date: newPromo.end_date,
      terms: newPromo.terms,
      status: 'active'
    }]).catch(err => console.warn('Sync addPromoRequest to Supabase:', err));

    setQuotas((prev) => {
      const idx = prev.findIndex(
        (q) => q.branch_id === data.branch_id && q.period_month === periodMonth
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], promo_used: updated[idx].promo_used + 1 };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `quota-${data.branch_id}-${periodMonth}`,
            branch_id: data.branch_id,
            period_month: periodMonth,
            design_used: 0,
            promo_used: 1
          }
        ];
      }
    });

    // Alert for branch users that a new promo campaign is active!
    addActivity({
      branch_id: data.branch_id,
      branch_name: branch?.name,
      user_name: currentUser.full_name,
      action_type: 'promo_campaign_active',
      title: language === 'ko' ? `신규 프로모션 캠페인 활성화: ${data.title}` : `New Promo Campaign Active: ${data.title}`,
      description: language === 'ko'
        ? `${branch?.name}의 신규 프로모션 "${data.mechanic}"이 등록되어 노출 스케줄에 반영되었습니다.`
        : `${branch?.name} activated promo campaign "${data.mechanic}". Scheduled on content calendar.`,
      severity: 'purple',
      target_id: newPromo.id,
      link_tab: 'requests'
    });

    return {
      success: true,
      message: language === 'ko' ? '프로모션이 등록되었습니다!' : 'Promo proposal submitted and scheduled in active agenda!'
    };
  };

  const updatePromoStatus = (promoId: string, status: PromoRequest['status']) => {
    setPromos((prev) =>
      prev.map((p) => {
        if (p.id === promoId) {
          const updated = { ...p, status };
          SupabaseService.exportDataToSupabase('promos', [{
            id: updated.id,
            brand_slug: activeTenantSlug,
            status: updated.status
          }]).catch(err => console.warn('Sync updatePromoStatus to Supabase:', err));
          return updated;
        }
        return p;
      })
    );
  };

  // Custom Pricing per Branch
  const updateBranchCustomPricing = (
    branchId: string,
    customRetainerFee: number,
    packageTier: Branch['package_tier'] = 'Custom'
  ) => {
    let branchName = '';
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === branchId) {
          branchName = b.name;
          const updated = {
            ...b,
            custom_retainer_fee: customRetainerFee,
            package_tier: packageTier
          };
          SupabaseService.exportDataToSupabase('branches', [{
            id: updated.id,
            brand_slug: activeTenantSlug,
            custom_retainer_fee: updated.custom_retainer_fee,
            package_tier: updated.package_tier
          }]).catch(err => console.warn('Sync branch pricing to Supabase:', err));
          return updated;
        }
        return b;
      })
    );

    addActivity({
      branch_id: branchId,
      branch_name: branchName,
      user_name: currentUser.full_name,
      action_type: 'custom_pricing_updated',
      title: `Subscription Pricing Updated: ${branchName}`,
      description: `Retainer fee set to ${whitelabelConfig.currency_symbol}${customRetainerFee.toLocaleString()} / month for ${branchName}.`,
      severity: 'warning',
      target_id: branchId,
      link_tab: 'billing'
    });
  };

  // Invoicing
  const generateMonthlyInvoices = (periodMonth?: string): { generatedCount: number; message: string } => {
    const targetPeriod = periodMonth || '2026-10';
    const activeBranches = branches.filter((b) => b.contract_status === 'active');
    let count = 0;
    const newInvoices: Invoice[] = [];
    const prefix = whitelabelConfig.brand_monogram || 'MG';

    activeBranches.forEach((branch, idx) => {
      const existing = invoices.find(
        (inv) => inv.branch_id === branch.id && inv.period_month.startsWith(targetPeriod)
      );

      if (!existing) {
        const invNum = `INV/${prefix}/${targetPeriod.replace('-', '/')}/${String(idx + 1).padStart(3, '0')}`;
        const baseRetainer = branch.custom_retainer_fee ?? (whitelabelConfig.default_monthly_retainer || 5000000);
        const newInv: Invoice = {
          id: `inv-${targetPeriod}-${branch.id}`,
          branch_id: branch.id,
          invoice_number: invNum,
          period_month: `${targetPeriod}-01`,
          retainer_fee: baseRetainer,
          visit_fee: 0,
          ad_budget: 0,
          custom_items: [],
          total_amount: baseRetainer,
          status: 'unpaid',
          due_date: `${targetPeriod}-10`,
          created_at: `${targetPeriod}-01`
        };
        newInvoices.push(newInv);
        count++;

        addActivity({
          branch_id: branch.id,
          branch_name: branch.name,
          user_name: 'HQ Billing Engine',
          action_type: 'invoice_generated',
          title: `Invoice Generated: ${invNum}`,
          description: `Retainer invoice for period ${targetPeriod} (${whitelabelConfig.currency_symbol}${baseRetainer.toLocaleString()}) issued to ${branch.name}.`,
          severity: 'info',
          target_id: newInv.id,
          link_tab: 'billing'
        });
      }
    });

    if (count > 0) {
      setInvoices((prev) => [...newInvoices, ...prev]);

      // Push newly generated invoices to Supabase
      SupabaseService.exportDataToSupabase('invoices', newInvoices.map((inv) => ({
        id: inv.id,
        brand_slug: activeTenantSlug,
        branch_id: inv.branch_id,
        invoice_number: inv.invoice_number,
        period_month: inv.period_month,
        retainer_fee: inv.retainer_fee,
        visit_fee: inv.visit_fee,
        ad_budget: inv.ad_budget,
        total_amount: inv.total_amount,
        status: inv.status,
        due_date: inv.due_date
      }))).catch(err => console.warn('Sync generateInvoices to Supabase:', err));

      return {
        generatedCount: count,
        message: `Successfully generated ${count} monthly invoices for ${targetPeriod}!`
      };
    } else {
      return {
        generatedCount: 0,
        message: `Invoices for ${targetPeriod} have already been generated for all active branches.`
      };
    }
  };

  const updateInvoiceCharges = (
    invoiceId: string,
    visit_fee: number,
    ad_budget: number,
    custom_items: CustomLineItem[] = [],
    retainer_fee?: number,
    additional_notes?: string
  ) => {
    let targetInv: Invoice | undefined;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const effectiveRetainer = retainer_fee !== undefined ? retainer_fee : inv.retainer_fee;
          const customTotal = custom_items.reduce((sum, item) => sum + (item.amount || 0), 0);
          const total_amount = effectiveRetainer + visit_fee + ad_budget + customTotal;

          targetInv = {
            ...inv,
            retainer_fee: effectiveRetainer,
            visit_fee,
            ad_budget,
            custom_items,
            additional_notes: additional_notes ?? inv.additional_notes,
            total_amount
          };
          return targetInv;
        }
        return inv;
      })
    );

    if (targetInv) {
      SupabaseService.exportDataToSupabase('invoices', [{
        id: targetInv.id,
        brand_slug: activeTenantSlug,
        retainer_fee: targetInv.retainer_fee,
        visit_fee: targetInv.visit_fee,
        ad_budget: targetInv.ad_budget,
        total_amount: targetInv.total_amount,
        status: targetInv.status
      }]).catch(err => console.warn('Sync updateInvoiceCharges to Supabase:', err));

      const branch = branches.find((b) => b.id === targetInv?.branch_id);
      addActivity({
        branch_id: targetInv.branch_id,
        branch_name: branch?.name,
        user_name: currentUser.full_name,
        action_type: 'charge_updated',
        title: `Charges Updated: ${targetInv.invoice_number}`,
        description: `Total amount updated to ${whitelabelConfig.currency_symbol}${targetInv.total_amount.toLocaleString()}.`,
        severity: 'info',
        target_id: targetInv.id,
        link_tab: 'billing'
      });
    }
  };

  const uploadPaymentProof = (invoiceId: string, proofUrl: string, proofNotes?: string) => {
    let targetInv: Invoice | undefined;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          targetInv = {
            ...inv,
            status: 'proof_uploaded',
            proof_url: proofUrl,
            proof_notes: proofNotes
          };
          return targetInv;
        }
        return inv;
      })
    );

    if (targetInv) {
      SupabaseService.exportDataToSupabase('invoices', [{
        id: targetInv.id,
        brand_slug: activeTenantSlug,
        status: 'proof_uploaded',
        proof_url: targetInv.proof_url || null,
        proof_notes: targetInv.proof_notes || null
      }]).catch(err => console.warn('Sync uploadPaymentProof to Supabase:', err));

      const branch = branches.find((b) => b.id === targetInv?.branch_id);
      addActivity({
        branch_id: targetInv.branch_id,
        branch_name: branch?.name,
        user_name: currentUser.full_name,
        action_type: 'proof_uploaded',
        title: `Payment Receipt Uploaded: ${targetInv.invoice_number}`,
        description: `${branch?.name} uploaded payment receipt for ${whitelabelConfig.currency_symbol}${targetInv.total_amount.toLocaleString()}. Pending verification.`,
        severity: 'warning',
        target_id: targetInv.id,
        link_tab: 'billing'
      });
    }
  };

  const verifyPayment = (invoiceId: string, isPaid: boolean) => {
    let targetInv: Invoice | undefined;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          targetInv = {
            ...inv,
            status: isPaid ? 'paid' : 'unpaid',
            payment_date: isPaid ? simulatedDate : undefined
          };
          return targetInv;
        }
        return inv;
      })
    );

    if (targetInv) {
      SupabaseService.exportDataToSupabase('invoices', [{
        id: targetInv.id,
        brand_slug: activeTenantSlug,
        status: targetInv.status,
        payment_date: targetInv.payment_date || null
      }]).catch(err => console.warn('Sync verifyPayment to Supabase:', err));

      const branch = branches.find((b) => b.id === targetInv?.branch_id);
      addActivity({
        branch_id: targetInv.branch_id,
        branch_name: branch?.name,
        user_name: currentUser.full_name,
        action_type: 'payment_verified',
        title: isPaid ? `Payment Verified: ${targetInv.invoice_number}` : `Payment Proof Rejected: ${targetInv.invoice_number}`,
        description: isPaid
          ? `Invoice ${targetInv.invoice_number} verified and marked as PAID.`
          : `Payment proof for ${targetInv.invoice_number} rejected.`,
        severity: isPaid ? 'success' : 'warning',
        target_id: targetInv.id,
        link_tab: 'billing'
      });
    }
  };

  // Exposure Slots
  const addExposureSlot = (slot: Omit<ExposureSlot, 'id'>) => {
    const newSlot: ExposureSlot = {
      ...slot,
      id: `slot-${Date.now()}`
    };
    setExposureSlots((prev) => [...prev, newSlot]);

    const branch = branches.find((b) => b.id === slot.branch_id);
    addActivity({
      branch_id: slot.branch_id,
      branch_name: branch?.name,
      user_name: currentUser.full_name,
      action_type: 'exposure_scheduled',
      title: `Exposure Slot Scheduled: ${slot.title}`,
      description: `${branch?.name} scheduled for ${slot.format} on ${slot.date} (${slot.pillar}).`,
      severity: 'purple',
      target_id: newSlot.id,
      link_tab: 'exposure'
    });
  };

  const updateExposureSlot = (id: string, updates: Partial<ExposureSlot>) => {
    setExposureSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteExposureSlot = (id: string) => {
    setExposureSlots((prev) => prev.filter((s) => s.id !== id));
  };

  // Influencers
  const addInfluencer = (inf: Omit<Influencer, 'id'>) => {
    const newInf: Influencer = {
      ...inf,
      id: `inf-${Date.now()}`
    };
    setInfluencers((prev) => [newInf, ...prev]);

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'request_status_changed',
      title: `Influencer Added: @${inf.handle}`,
      description: `${inf.name} (${inf.tier}) added to directory by ${currentUser.full_name}.`,
      severity: 'info',
      link_tab: 'influencers'
    });
  };

  const updateInfluencer = (id: string, updates: Partial<Influencer>) => {
    setInfluencers((prev) =>
      prev.map((inf) => (inf.id === id ? { ...inf, ...updates } : inf))
    );
    addActivity({
      user_name: currentUser.full_name,
      action_type: 'request_status_changed',
      title: `Influencer Updated: ${updates.name || updates.handle || id}`,
      description: `Influencer profile updated by ${currentUser.full_name}.`,
      severity: 'info',
      link_tab: 'influencers'
    });
  };

  const deleteInfluencer = (id: string) => {
    const target = influencers.find((inf) => inf.id === id);
    setInfluencers((prev) => prev.filter((inf) => inf.id !== id));
    if (target) {
      addActivity({
        user_name: currentUser.full_name,
        action_type: 'request_status_changed',
        title: `Influencer Deleted: @${target.handle}`,
        description: `${target.name} removed from directory by ${currentUser.full_name}.`,
        severity: 'info',
        link_tab: 'influencers'
      });
    }
  };

  // Voucher Campaign & ROI
  const redeemVoucherCode = (code: string, salesAmount: number): { success: boolean; message: string } => {
    const campaign = voucherCampaigns.find((v) => v.code.toUpperCase() === code.trim().toUpperCase());
    if (!campaign) {
      return { success: false, message: language === 'ko' ? '유효하지 않은 바우처 코드입니다.' : 'Invalid or expired voucher code.' };
    }
    if (campaign.status === 'expired') {
      return { success: false, message: language === 'ko' ? '만료된 바우처 코드입니다.' : 'Voucher campaign has ended.' };
    }

    setVoucherCampaigns((prev) =>
      prev.map((v) =>
        v.id === campaign.id
          ? {
            ...v,
            redemption_count: v.redemption_count + 1,
            total_sales_driven: v.total_sales_driven + salesAmount
          }
          : v
      )
    );

    addActivity({
      branch_id: campaign.branch_id,
      branch_name: campaign.branch_name,
      user_name: currentUser.full_name,
      action_type: 'voucher_redeemed',
      title: `Voucher Redeemed: ${campaign.code}`,
      description: `Discount ${campaign.discount_percent}% applied at ${campaign.branch_name}. Order value: Rp${salesAmount.toLocaleString()}.`,
      severity: 'success',
      link_tab: 'influencers'
    });

    return {
      success: true,
      message: language === 'ko'
        ? `바우처 ${campaign.code} 적용 완료! ${campaign.discount_percent}% 할인이 반영되었습니다.`
        : `Voucher ${campaign.code} applied successfully! ${campaign.discount_percent}% discount registered.`
    };
  };

  const addVoucherCampaign = (data: Omit<InfluencerVoucherCampaign, 'id' | 'redemption_count' | 'total_sales_driven'>) => {
    const newCamp: InfluencerVoucherCampaign = {
      ...data,
      id: `vch-${Date.now()}`,
      redemption_count: 0,
      total_sales_driven: 0
    };
    setVoucherCampaigns((prev) => [newCamp, ...prev]);

    addActivity({
      branch_id: data.branch_id,
      branch_name: data.branch_name,
      user_name: currentUser.full_name,
      action_type: 'promo_campaign_active',
      title: `Voucher Code Created: ${data.code}`,
      description: `Influencer ${data.influencer_name} allocated voucher ${data.code} (${data.discount_percent}% off) for ${data.branch_name}.`,
      severity: 'purple',
      link_tab: 'influencers'
    });
  };

  // Computed Platform Multi-Tenant Metrics
  const currentPlatformBrand = useMemo(() => {
    return platformBrands.find((b) => b.slug.toLowerCase() === activeTenantSlug.toLowerCase()) || platformBrands[0] || null;
  }, [platformBrands, activeTenantSlug]);

  const totalPlatformMRR = useMemo(() => {
    return platformBrands
      .filter((b) => b.subscription_status === 'active' || b.subscription_status === 'expiring_soon')
      .reduce((sum, b) => sum + (b.monthly_fee || 0), 0);
  }, [platformBrands]);

  const totalPlatformARR = useMemo(() => totalPlatformMRR * 12, [totalPlatformMRR]);

  const platformWalletBalance = useMemo(() => {
    const grossPool = totalPlatformMRR;
    const completedWithdrawals = platformWithdrawals
      .filter((w) => w.status === 'completed' || w.status === 'processing')
      .reduce((sum, w) => sum + w.amount, 0);
    return Math.max(0, grossPool - completedWithdrawals);
  }, [totalPlatformMRR, platformWithdrawals]);

  const switchTenantBrand = (slug: string, autoLogin: boolean = false) => {
    const normalizedSlug = (slug || 'brand').toLowerCase().trim();
    setActiveTenantSlug(normalizedSlug);
    saveStorage('active_tenant_slug', normalizedSlug);

    const dataset = getInitialBrandDataset(normalizedSlug);

    const loadedWhitelabel = loadBrandStorage(normalizedSlug, 'whitelabel', dataset.whitelabel);
    setWhitelabelConfig(loadedWhitelabel);

    const loadedBranches = loadBrandStorage(normalizedSlug, 'branches', dataset.branches);
    setBranches(loadedBranches);

    const loadedUsers = cleanMockUsers(loadBrandStorage(normalizedSlug, 'users', dataset.users));
    setUsers(loadedUsers);

    const loadedDesign = loadBrandStorage(normalizedSlug, 'design_requests', dataset.designRequests || []);
    setDesignRequests(loadedDesign);

    const loadedPromos = loadBrandStorage(normalizedSlug, 'promos', dataset.promos || []);
    setPromos(loadedPromos);

    const loadedInvoices = loadBrandStorage(normalizedSlug, 'invoices', dataset.invoices || []);
    setInvoices(loadedInvoices);

    const loadedInfluencers = cleanMockInfluencers(loadBrandStorage(normalizedSlug, 'influencers', dataset.influencers || []));
    setInfluencers(loadedInfluencers);

    const loadedQuotas = loadBrandStorage(normalizedSlug, 'quotas', dataset.quotas || []);
    setQuotas(loadedQuotas);

    const loadedActivities = loadBrandStorage(normalizedSlug, 'activities', dataset.activities || []);
    setActivities(loadedActivities);

    const loadedAttendances = loadBrandStorage(normalizedSlug, 'attendances', dataset.attendances || []);
    setAttendances(loadedAttendances);

    const loadedBudget = loadBrandStorage(normalizedSlug, 'budget_requests', dataset.budgetRequests || []);
    setBudgetRequests(loadedBudget);

    const loadedShoots = loadBrandStorage(normalizedSlug, 'shoot_requests', dataset.shootRequests || []);
    setShootRequests(loadedShoots);

    const loadedWallet = loadBrandStorage(normalizedSlug, 'wallet_transactions', dataset.walletTransactions || []);
    setWalletTransactions(loadedWallet);

    const loadedReimburse = loadBrandStorage(normalizedSlug, 'hq_reimbursements', dataset.hqReimbursements || []);
    setHqReimbursements(loadedReimburse);

    const loadedTodos = loadBrandStorage(normalizedSlug, 'hq_todos', dataset.hqTodos || []);
    setHqTodos(loadedTodos);

    const loadedChat = loadBrandStorage(normalizedSlug, 'team_chat_messages', dataset.teamChatMessages || []);
    setTeamChatMessages(loadedChat);

    const loadedAgendas = loadBrandStorage(normalizedSlug, 'meeting_agendas', dataset.meetingAgendas || []);
    setMeetingAgendas(loadedAgendas);

    const loadedVouchers = loadBrandStorage(normalizedSlug, 'voucher_campaigns', dataset.voucherCampaigns || []);
    setVoucherCampaigns(loadedVouchers);

    const loadedExposure = cleanMockExposureSlots(loadBrandStorage(normalizedSlug, 'exposure_slots', dataset.exposureSlots || []));
    setExposureSlots(loadedExposure);

    const authVal = autoLogin ? true : loadBrandStorage(normalizedSlug, 'is_authenticated', true);
    const userVal = autoLogin ? (loadedUsers[0]?.id || '') : loadBrandStorage(normalizedSlug, 'user_id', loadedUsers[0]?.id || '');

    setIsAuthenticated(authVal);
    setCurrentUserId(userVal);
    setSelectedBranchFilter('all');

    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', `/${normalizedSlug}`);
    }
  };

  const addPlatformBrand = (brandData: Omit<PlatformBrandTenant, 'id' | 'created_at' | 'last_active_at'>): { success: boolean; message: string; brand?: PlatformBrandTenant } => {
    const slugClean = (brandData.slug || brandData.name.toLowerCase().replace(/[^a-z0-9]/g, '')).trim();
    if (platformBrands.some((b) => b.slug.toLowerCase() === slugClean.toLowerCase())) {
      return { success: false, message: `Domain slug "${slugClean}" sudah terdaftar!` };
    }
    const newBrand: PlatformBrandTenant = {
      ...brandData,
      id: `brand-${slugClean}`,
      slug: slugClean,
      created_at: simulatedDate,
      last_active_at: `${simulatedDate} 09:00`,
      wallet_balance: brandData.wallet_balance || 0
    };

    const newOwnerUser: UserProfile = {
      id: `user-${slugClean}-owner`,
      branch_id: null,
      role: 'hq_owner',
      full_name: `${newBrand.hq_owner_name} (HQ Owner)`,
      email: newBrand.hq_owner_email,
      phone: newBrand.hq_owner_phone,
      job_title: `Brand Owner & Founder (${newBrand.name})`,
      status: 'active',
      password: 'Media',
      joined_date: simulatedDate
    };

    const newCentralBranch: Branch = {
      id: `branch-${slugClean}-central`,
      name: `${newBrand.name} Central`,
      code: `${slugClean.substring(0, 3).toUpperCase()}-01`,
      location: 'Pusat',
      city: 'Jakarta',
      contract_status: 'active',
      contact_person: newBrand.hq_owner_name,
      phone: newBrand.hq_owner_phone,
      custom_retainer_fee: newBrand.monthly_fee || 5000000,
      package_tier: 'Standard',
      wallet_balance: 0,
      max_monthly_design_requests: 12,
      max_monthly_active_promos: 4,
      lead_days: 5,
      pic_name: `${newBrand.hq_owner_name} (HQ Owner)`,
      pic_phone: newBrand.hq_owner_phone,
      pic_email: newBrand.hq_owner_email,
      owner_name: newBrand.hq_owner_name,
      owner_phone: newBrand.hq_owner_phone,
      owner_email: newBrand.hq_owner_email,
      created_at: simulatedDate
    };

    const newWhitelabel: WhitelabelConfig = {
      ...DEFAULT_WHITELABEL_CONFIG,
      brand_name: newBrand.name,
      brand_subtitle: newBrand.tagline || 'Social Media Management & Quota Portal',
      brand_monogram: newBrand.name.substring(0, 2).toUpperCase(),
      company_legal_name: `PT ${newBrand.name} Multi Nusantara`,
      hq_location: 'Jakarta HQ',
      contact_email: newBrand.hq_owner_email,
      contact_whatsapp: newBrand.hq_owner_phone,
      custom_primary_hex: newBrand.primary_color || '#FF5B14'
    };

    // Save brand isolated datasets to localStorage
    saveBrandStorage(slugClean, 'whitelabel', newWhitelabel);
    saveBrandStorage(slugClean, 'users', [newOwnerUser]);
    saveBrandStorage(slugClean, 'branches', [newCentralBranch]);
    saveBrandStorage(slugClean, 'design_requests', []);
    saveBrandStorage(slugClean, 'promos', []);
    saveBrandStorage(slugClean, 'invoices', []);
    saveBrandStorage(slugClean, 'influencers', []);
    saveBrandStorage(slugClean, 'activities', []);
    saveBrandStorage(slugClean, 'attendances', []);
    saveBrandStorage(slugClean, 'budget_requests', []);
    saveBrandStorage(slugClean, 'shoot_requests', []);
    saveBrandStorage(slugClean, 'wallet_transactions', []);
    saveBrandStorage(slugClean, 'hq_reimbursements', []);
    saveBrandStorage(slugClean, 'hq_todos', []);
    saveBrandStorage(slugClean, 'team_chat_messages', []);
    saveBrandStorage(slugClean, 'meeting_agendas', []);
    saveBrandStorage(slugClean, 'voucher_campaigns', []);
    saveBrandStorage(slugClean, 'exposure_slots', []);
    saveBrandStorage(slugClean, 'is_authenticated', true);
    saveBrandStorage(slugClean, 'user_id', newOwnerUser.id);

    // Update React state & localStorage for platformBrands
    setPlatformBrands((prev) => {
      const updated = [newBrand, ...prev.filter(b => b.slug !== slugClean)];
      saveStorage('platform_brands', updated);
      return updated;
    });

    // Export to Supabase REST
    SupabaseService.exportDataToSupabase('platform_brands', [{
      id: newBrand.id,
      slug: newBrand.slug,
      name: newBrand.name,
      tagline: newBrand.tagline,
      logo_url: newBrand.logo_url || null,
      primary_color: newBrand.primary_color,
      hq_owner_name: newBrand.hq_owner_name,
      hq_owner_email: newBrand.hq_owner_email,
      hq_owner_phone: newBrand.hq_owner_phone,
      subscription_plan_id: newBrand.subscription_plan_id,
      subscription_status: newBrand.subscription_status,
      monthly_fee: newBrand.monthly_fee,
      branches_count: newBrand.branches_count,
      wallet_balance: newBrand.wallet_balance,
      is_verified: newBrand.is_verified,
      notes: newBrand.notes
    }]).catch(err => console.warn('Sync brand to Supabase:', err));

    SupabaseService.exportDataToSupabase('whitelabel_configs', [{
      brand_slug: slugClean,
      brand_name: newWhitelabel.brand_name,
      brand_subtitle: newWhitelabel.brand_subtitle,
      brand_monogram: newWhitelabel.brand_monogram,
      company_legal_name: newWhitelabel.company_legal_name,
      hq_location: newWhitelabel.hq_location,
      contact_email: newWhitelabel.contact_email,
      contact_whatsapp: newWhitelabel.contact_whatsapp,
      custom_primary_hex: newWhitelabel.custom_primary_hex
    }]).catch(err => console.warn('Sync whitelabel to Supabase:', err));

    SupabaseService.exportDataToSupabase('branches', [{
      id: newCentralBranch.id,
      brand_slug: slugClean,
      name: newCentralBranch.name,
      code: newCentralBranch.code,
      location: newCentralBranch.location,
      city: newCentralBranch.city,
      contract_status: 'active',
      contact_person: newCentralBranch.contact_person,
      phone: newCentralBranch.phone,
      custom_retainer_fee: newCentralBranch.custom_retainer_fee,
      package_tier: 'Standard',
      wallet_balance: 0,
      pic_name: newCentralBranch.pic_name,
      pic_phone: newCentralBranch.pic_phone,
      pic_email: newCentralBranch.pic_email,
      owner_name: newCentralBranch.owner_name,
      owner_phone: newCentralBranch.owner_phone,
      owner_email: newCentralBranch.owner_email
    }]).catch(err => console.warn('Sync branch to Supabase:', err));

    SupabaseService.exportDataToSupabase('users', [{
      id: newOwnerUser.id,
      brand_slug: slugClean,
      branch_id: null,
      role: 'hq_owner',
      full_name: newOwnerUser.full_name,
      email: newOwnerUser.email,
      phone: newOwnerUser.phone,
      password_hash: newOwnerUser.password || 'Media',
      job_title: newOwnerUser.job_title,
      status: 'active'
    }]).catch(err => console.warn('Sync HQ owner to Supabase:', err));

    return {
      success: true,
      message: `Brand ${newBrand.name} berhasil didaftarkan! Subdomain: mediasocial.team/${newBrand.slug}`,
      brand: newBrand
    };
  };

  const updatePlatformBrand = (id: string, updates: Partial<PlatformBrandTenant>) => {
    setPlatformBrands((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveStorage('platform_brands', updated);
      const target = updated.find((b) => b.id === id);
      if (target) {
        SupabaseService.exportDataToSupabase('platform_brands', [{
          id: target.id,
          slug: target.slug,
          name: target.name,
          tagline: target.tagline,
          logo_url: target.logo_url || null,
          primary_color: target.primary_color,
          hq_owner_name: target.hq_owner_name,
          hq_owner_email: target.hq_owner_email,
          hq_owner_phone: target.hq_owner_phone,
          subscription_plan_id: target.subscription_plan_id,
          subscription_status: target.subscription_status,
          monthly_fee: target.monthly_fee,
          branches_count: target.branches_count,
          wallet_balance: target.wallet_balance,
          is_verified: target.is_verified,
          notes: target.notes
        }]).catch(err => console.warn('Sync update brand to Supabase:', err));

        // If primary_color or name changed, also update whitelabel
        if (updates.primary_color || updates.name || updates.tagline || updates.hq_owner_name || updates.hq_owner_phone || updates.hq_owner_email) {
          const currentWl = loadBrandStorage<WhitelabelConfig>(target.slug, 'whitelabel', DEFAULT_WHITELABEL_CONFIG);
          const newWl: WhitelabelConfig = {
            ...currentWl,
            brand_name: updates.name || currentWl.brand_name,
            brand_subtitle: updates.tagline || currentWl.brand_subtitle,
            custom_primary_hex: updates.primary_color || currentWl.custom_primary_hex,
            contact_email: updates.hq_owner_email || currentWl.contact_email,
            contact_whatsapp: updates.hq_owner_phone || currentWl.contact_whatsapp
          };
          saveBrandStorage(target.slug, 'whitelabel', newWl);
          if (activeTenantSlug === target.slug) {
            setWhitelabelConfig(newWl);
          }
          SupabaseService.exportDataToSupabase('whitelabel_configs', [{
            brand_slug: target.slug,
            brand_name: newWl.brand_name,
            brand_subtitle: newWl.brand_subtitle,
            brand_monogram: newWl.brand_monogram,
            company_legal_name: newWl.company_legal_name,
            hq_location: newWl.hq_location,
            contact_email: newWl.contact_email,
            contact_whatsapp: newWl.contact_whatsapp,
            custom_primary_hex: newWl.custom_primary_hex
          }]).catch(err => console.warn('Sync whitelabel update to Supabase:', err));
        }
      }
      return updated;
    });
  };

  const deletePlatformBrand = (id: string): { success: boolean; message: string } => {
    const brand = platformBrands.find((b) => b.id === id);
    setPlatformBrands((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveStorage('platform_brands', updated);
      return updated;
    });
    if (brand) {
      SupabaseService.deleteFromSupabase('platform_brands', `id=eq.${id}`).catch(err => console.warn('Delete brand from Supabase:', err));
    }
    return { success: true, message: 'Brand berhasil dihapus dari platform.' };
  };

  const updateSubscriptionPlan = (id: string, updates: Partial<BrandSubscriptionPlan>) => {
    setSubscriptionPlans((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveStorage('platform_plans', updated);
      const targetPlan = updated.find(p => p.id === id);
      if (targetPlan) {
        SupabaseService.exportDataToSupabase('platform_plans', [{
          id: targetPlan.id,
          name: targetPlan.name,
          monthly_price: targetPlan.monthly_price,
          annual_price: targetPlan.annual_price,
          max_branches: targetPlan.max_branches,
          max_design_requests_per_branch: targetPlan.max_design_requests_per_branch,
          max_promos_per_branch: targetPlan.max_promos_per_branch,
          includes_influencer_crm: targetPlan.includes_influencer_crm,
          includes_collaboration_chat: targetPlan.includes_collaboration_chat,
          includes_auto_invoicing: targetPlan.includes_auto_invoicing,
          includes_dedicated_support: targetPlan.includes_dedicated_support,
          is_popular: targetPlan.is_popular,
          description: targetPlan.description
        }]).catch(err => console.warn('Sync plan to Supabase:', err));
      }
      return updated;
    });
  };

  const requestPlatformWithdrawal = (
    amount: number,
    bankName: string,
    accountNumber: string,
    accountHolder: string,
    notes?: string
  ): { success: boolean; message: string } => {
    if (amount <= 0) {
      return { success: false, message: 'Jumlah penarikan harus lebih besar dari Rp 0!' };
    }
    if (amount > platformWalletBalance) {
      return {
        success: false,
        message: `Saldo wallet platform tidak mencukupi. (Tersedia: Rp ${platformWalletBalance.toLocaleString('id-ID')})`
      };
    }
    const refNo = `TRX-WD-${Date.now().toString().slice(-6)}`;
    const newWd: PlatformWalletWithdrawal = {
      id: `wd-${Date.now()}`,
      amount,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
      status: 'pending',
      requested_by: currentUser.id,
      requested_by_name: currentUser.full_name,
      created_at: `${simulatedDate} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      reference_no: refNo,
      notes: notes || 'Pencairan manual saldo subscription (siap integrasi payment gateway API)'
    };
    setPlatformWithdrawals((prev) => [newWd, ...prev]);

    addActivity({
      user_name: currentUser.full_name,
      action_type: 'invoice_generated',
      title: `Penarikan Dana Diajukan: Rp ${amount.toLocaleString('id-ID')}`,
      description: `Owner mengajukan pencairan subscription ke ${bankName} (${accountNumber} a/n ${accountHolder}). Ref: ${refNo}`,
      severity: 'warning',
      link_tab: 'dashboard'
    });

    return { success: true, message: `Permintaan penarikan Rp ${amount.toLocaleString('id-ID')} berhasil diajukan!` };
  };

  const updateWithdrawalStatus = (id: string, status: PlatformWalletWithdrawal['status'], referenceNo?: string) => {
    setPlatformWithdrawals((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return {
            ...w,
            status,
            reference_no: referenceNo || w.reference_no,
            completed_at: status === 'completed' ? `${simulatedDate} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : w.completed_at
          };
        }
        return w;
      })
    );
  };

  const sendSubscriptionReminder = (brandId: string, channel: 'whatsapp' | 'email' = 'whatsapp'): { success: boolean; message: string; waUrl?: string } => {
    const brand = platformBrands.find((b) => b.id === brandId);
    if (!brand) return { success: false, message: 'Brand tidak ditemukan' };

    const plan = subscriptionPlans.find((p) => p.id === brand.subscription_plan_id);
    const planName = plan?.name || 'Paket Langganan';
    const cleanPhone = brand.hq_owner_phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    const messageText = `Halo Kak ${brand.hq_owner_name} (${brand.name})!\n\nKami dari tim mediasocial.team ingin menginformasikan bahwa paket langganan ${planName} untuk brand Anda akan jatuh tempo pada ${brand.subscription_end_date}.\n\nTotal tagihan perpanjangan: Rp ${brand.monthly_fee.toLocaleString('id-ID')}/bulan.\n\nMohon lakukan pembayaran perpanjangan agar seluruh operasional ${brand.branches_count} cabang & tim kreatif tetap berjalan lancar.\n\nTerima kasih,\nFinance mediasocial.team`;

    const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(messageText)}`;

    const newLog: SubscriptionReminderLog = {
      id: `rem-${Date.now()}`,
      brand_id: brand.id,
      brand_name: brand.name,
      recipient_name: brand.hq_owner_name,
      recipient_phone: brand.hq_owner_phone,
      recipient_email: brand.hq_owner_email,
      days_remaining: Math.ceil((new Date(brand.subscription_end_date).getTime() - new Date(simulatedDate).getTime()) / (1000 * 3600 * 24)),
      channel,
      message_preview: messageText.slice(0, 120) + '...',
      sent_at: `${simulatedDate} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      sent_by: currentUser.full_name,
      status: 'delivered'
    };

    setSubscriptionReminders((prev) => [newLog, ...prev]);

    return {
      success: true,
      message: `Reminder WhatsApp disiapkan untuk Kak ${brand.hq_owner_name} (${brand.name})!`,
      waUrl
    };
  };

  const jumpToBrandAsHQOwner = (brandSlug: string) => {
    switchTenantBrand(brandSlug, true);
  };

  // Reset to default
  const resetToDefaultData = () => {
    const dataset = getInitialBrandDataset(activeTenantSlug);
    setWhitelabelConfig(dataset.whitelabel);
    setBranches(dataset.branches);
    setUsers(dataset.users);
    setDesignRequests(dataset.designRequests);
    setPromos(dataset.promos);
    setInvoices(dataset.invoices);
    setInfluencers(dataset.influencers);
    setQuotas(INITIAL_QUOTAS);
    setActivities(INITIAL_ACTIVITIES);
    setAttendances(INITIAL_ATTENDANCE);
    setBudgetRequests(INITIAL_BUDGET_REQUESTS);
    setShootRequests(INITIAL_SHOOT_REQUESTS);
    setWalletTransactions(INITIAL_WALLET_TRANSACTIONS);
    setHqReimbursements(INITIAL_HQ_REIMBURSEMENTS);
    setHqTodos(INITIAL_HQ_TODOS);
    setTeamChatMessages(INITIAL_TEAM_CHAT_MESSAGES);
    setMeetingAgendas(INITIAL_MEETING_AGENDAS);
    setVoucherCampaigns(INITIAL_VOUCHER_CAMPAIGNS);
    setExposureSlots(INITIAL_EXPOSURE_SLOTS);
    setSelectedBranchFilter('all');
    if (dataset.users.length > 0) {
      setCurrentUserId(dataset.users[0].id);
    }
  };

  return (
    <PortalContext.Provider
      value={{
        currentUser,
        activeRole,
        isHQOwner,
        isHQLeader,
        isHQCreative,
        isHQ,
        isBranchOwner,
        isBranchManager,
        isBranchUser,
        canAccessBilling,
        canAccessUserManagement,
        canAccessBranchManagement,
        canAccessWhitelabel,
        canAccessAttendance,

        // SaaS Super-Admin Platform Level (mediasocial.team)
        isPlatformOwner,
        isPlatformFinance,
        isPlatformAdmin,
        isPlatformUser,
        platformBrands,
        activeTenantSlug,
        currentPlatformBrand,
        subscriptionPlans,
        platformWithdrawals,
        subscriptionReminders,
        platformWalletBalance,
        totalPlatformMRR,
        totalPlatformARR,
        switchTenantBrand,
        addPlatformBrand,
        updatePlatformBrand,
        deletePlatformBrand,
        updateSubscriptionPlan,
        requestPlatformWithdrawal,
        updateWithdrawalStatus,
        sendSubscriptionReminder,
        jumpToBrandAsHQOwner,

        // Platform Team Users & Self Password
        platformUsers,
        addPlatformUser,
        updatePlatformUser,
        registerBrand,
        inviteBranch,

        currentBranch,
        selectedBranchFilter,
        simulatedDate,
        branches,
        quotas,
        designRequests,
        promos,
        invoices,
        exposureSlots,
        influencers,
        voucherCampaigns,
        redeemVoucherCode,
        addVoucherCampaign,
        activities,
        unreadNotificationsCount,
        unreadChatCount,
        markChatAsRead,
        isActivityVisibleForUser,

        // Authentication
        isAuthenticated,
        login,
        logout,
        changePassword,

        // Language
        language,
        setLanguage,
        t,

        // Whitelabel & Theme Mode
        whitelabelConfig,
        themeColors,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        updateWhitelabelConfig,
        resetWhitelabelConfig,

        // Branch Management & Wallet System
        addBranch,
        updateBranch,
        deleteBranch,
        walletTransactions,
        topUpBranchWallet,
        verifyWalletTransaction,

        // User Management
        users,
        addUser,
        updateUser,
        switchUser,

        // Attendance
        attendances,
        todayAttendance,
        clockIn,
        clockOut,
        updateWorkLog,

        // Budget & Shoot requests
        budgetRequests,
        addBudgetRequest,
        approveBudgetRequest,
        rejectBudgetRequest,
        disburseBudgetRequest,
        acknowledgeBudgetDisbursement,
        submitBudgetCompletionReport,
        shootRequests,
        addShootRequest,
        updateShootRequestStatus,

        // HQ Operational Reimbursements & Expenses
        hqReimbursements,
        addHqReimbursement,
        approveHqReimbursement,
        rejectHqReimbursement,
        disburseHqReimbursementBatch,

        // HQ To-Do List & Auto Work Log
        hqTodos,
        addHqTodo,
        toggleHqTodo,
        deleteHqTodo,
        generateClockOutWhatsappReport,

        // Team Chat & Collaboration Hub
        teamChatMessages,
        sendTeamChatMessage,

        // Calendar Meeting Agendas
        meetingAgendas,
        addMeetingAgenda,
        deleteMeetingAgenda,

        // Branch Caption Settings
        updateBranchCaptionSettings,

        // Nav & Date
        setSelectedBranchFilter,
        setSimulatedDate,

        // Activity
        markActivityAsRead,
        markAllActivitiesAsRead,
        addActivity,

        // Quotas & Requests
        getBranchQuota,
        calculateMinTargetDate,
        isTargetDateValid,
        isPromoSubmissionAllowed,
        addDesignRequest,
        updateDesignRequestStatus,
        assignDesignRequest,
        updateDesignRequestDeliverable,
        addDesignComment,
        updateDesignCaption,

        // Promos
        addPromoRequest,
        updatePromoStatus,

        // Invoicing
        generateMonthlyInvoices,
        updateBranchCustomPricing,
        updateInvoiceCharges,
        uploadPaymentProof,
        verifyPayment,

        // Exposure & Influencer
        addExposureSlot,
        updateExposureSlot,
        deleteExposureSlot,
        addInfluencer,
        updateInfluencer,
        deleteInfluencer,

        // Reset
        resetToDefaultData
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
