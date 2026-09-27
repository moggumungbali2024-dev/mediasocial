import { 
  Branch, 
  UserProfile, 
  MonthlyQuota, 
  DesignRequest, 
  PromoRequest, 
  Invoice, 
  ExposureSlot, 
  Influencer,
  ActivityItem,
  CustomLineItem,
  WhitelabelConfig,
  AttendanceRecord,
  BudgetRequest,
  ShootRequest,
  WalletTransaction,
  InfluencerVoucherCampaign,
  HqReimbursementRequest,
  HqTodoItem,
  TeamChatMessage,
  MeetingAgenda,
  BrandSubscriptionPlan,
  PlatformBrandTenant,
  PlatformWalletWithdrawal,
  SubscriptionReminderLog
} from '../types.ts';

export const DEFAULT_WHITELABEL_CONFIG: WhitelabelConfig = {
  brand_name: 'mediasocial',
  brand_subtitle: 'Social Media Management & Quota Portal',
  brand_monogram: 'MS',
  brand_logo_url: '',
  theme_accent: 'kinetic_orange',
  custom_primary_hex: '#FF5B14',
  company_legal_name: 'PT Media Social Multi Nusantara',
  hq_location: 'Jakarta HQ',
  hq_address: 'Jakarta, Indonesia',
  office_country: 'Indonesia',
  office_city: 'Bali',
  timezone_id: 'Asia/Makassar',
  timezone_label: 'WITA',
  contact_email: 'hello@mediasocial.team',
  contact_whatsapp: '08159998757',
  bank_name: 'Bank Central Asia (BCA)',
  bank_account_number: '772-098-1123',
  bank_account_name: 'PT Media Social Multi Nusantara',
  bank_swift_code: 'CENAIDJA',
  invoice_note_footer: 'Pembayaran wajib diselesaikan dalam 7 hari kalender setelah tanggal terbit invoice. Harap cantumkan Nomor Invoice pada berita transfer.',
  currency_symbol: 'Rp',
  default_monthly_retainer: 5000000,
  max_monthly_design_requests: 12,
  max_monthly_active_promos: 4,
  design_min_lead_days: 5,
  promo_cutoff_day_of_month: 25,
  standard_work_hours: 8
};

export const INITIAL_BRANCHES: Branch[] = [];

export const INITIAL_USERS: UserProfile[] = [
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
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_QUOTAS: MonthlyQuota[] = [];

export const INITIAL_DESIGN_REQUESTS: DesignRequest[] = [];

export const INITIAL_PROMOS: PromoRequest[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_EXPOSURE_SLOTS: ExposureSlot[] = [];

export const INITIAL_INFLUENCERS: Influencer[] = [];

export const INITIAL_ACTIVITIES: ActivityItem[] = [];

export const INITIAL_BUDGET_REQUESTS: BudgetRequest[] = [];

export const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [];

export const INITIAL_SHOOT_REQUESTS: ShootRequest[] = [];

export const INITIAL_VOUCHER_CAMPAIGNS: InfluencerVoucherCampaign[] = [];

export const INITIAL_HQ_REIMBURSEMENTS: HqReimbursementRequest[] = [];

export const INITIAL_HQ_TODOS: HqTodoItem[] = [];

export const INITIAL_TEAM_CHAT_MESSAGES: TeamChatMessage[] = [];

export const INITIAL_MEETING_AGENDAS: MeetingAgenda[] = [];

export const INITIAL_PLATFORM_PLANS: BrandSubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Tier',
    monthly_price: 2490000,
    annual_price: 24900000,
    max_branches: 3,
    max_design_requests_per_branch: 8,
    max_promos_per_branch: 3,
    includes_influencer_crm: false,
    includes_collaboration_chat: true,
    includes_auto_invoicing: true,
    includes_dedicated_support: false,
    description: 'Cocok untuk brand berkembang 1-3 cabang yang baru memulai standarisasi promosi & operasional visual.'
  },
  {
    id: 'growth',
    name: 'Growth Multi-Branch',
    monthly_price: 4890000,
    annual_price: 48900000,
    max_branches: 10,
    max_design_requests_per_branch: 18,
    max_promos_per_branch: 6,
    includes_influencer_crm: true,
    includes_collaboration_chat: true,
    includes_auto_invoicing: true,
    includes_dedicated_support: true,
    is_popular: true,
    description: 'Pilihan paling ideal untuk brand franchise 4-10 cabang dengan CRM influencer terpadu dan auto-invoicing.'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    monthly_price: 8990000,
    annual_price: 89900000,
    max_branches: 50,
    max_design_requests_per_branch: 999,
    max_promos_per_branch: 20,
    includes_influencer_crm: true,
    includes_collaboration_chat: true,
    includes_auto_invoicing: true,
    includes_dedicated_support: true,
    description: 'Solusi tanpa batas untuk jaringan ritel/F&B nasional, custom SLA, prioritas render studio & dedicated account manager.'
  }
];

export const INITIAL_PLATFORM_BRANDS: PlatformBrandTenant[] = [];

export const INITIAL_PLATFORM_WITHDRAWALS: PlatformWalletWithdrawal[] = [];

export const INITIAL_REMINDER_LOGS: SubscriptionReminderLog[] = [];

// ==========================================
// BRAND DATA REGISTRY (DATA ISOLATION ENGINE)
// ==========================================

export interface BrandDataset {
  whitelabel: WhitelabelConfig;
  branches: Branch[];
  users: UserProfile[];
  designRequests: DesignRequest[];
  promos: PromoRequest[];
  invoices: Invoice[];
  influencers: Influencer[];
  quotas?: MonthlyQuota[];
  activities?: ActivityItem[];
  attendances?: AttendanceRecord[];
  budgetRequests?: BudgetRequest[];
  shootRequests?: ShootRequest[];
  walletTransactions?: WalletTransaction[];
  hqReimbursements?: HqReimbursementRequest[];
  hqTodos?: HqTodoItem[];
  teamChatMessages?: TeamChatMessage[];
  meetingAgendas?: MeetingAgenda[];
  voucherCampaigns?: InfluencerVoucherCampaign[];
  exposureSlots?: ExposureSlot[];
}

export const BRAND_DATA_REGISTRY: Record<string, BrandDataset> = {};

export function getInitialBrandDataset(slug: string): BrandDataset {
  const normalized = (slug || 'brand').toLowerCase().trim();
  if (BRAND_DATA_REGISTRY[normalized]) {
    return BRAND_DATA_REGISTRY[normalized];
  }

  let savedBrands: PlatformBrandTenant[] = INITIAL_PLATFORM_BRANDS;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('smp_platform_brands');
      if (stored) {
        savedBrands = JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }
  }

  const brandTenant = savedBrands.find((b) => b.slug.toLowerCase() === normalized);
  const brandName = brandTenant?.name || (normalized.charAt(0).toUpperCase() + normalized.slice(1));
  const ownerName = brandTenant?.hq_owner_name || 'Owner';
  const ownerPhone = brandTenant?.hq_owner_phone || '0812-3456-7890';
  const ownerEmail = brandTenant?.hq_owner_email || `owner@${normalized}.com`;
  const primaryColor = brandTenant?.primary_color || '#FF5B14';
  const tagline = brandTenant?.tagline || 'Social Media Management & Quota Portal';

  return {
    whitelabel: {
      ...DEFAULT_WHITELABEL_CONFIG,
      brand_name: brandName,
      brand_subtitle: tagline,
      brand_monogram: brandName.substring(0, 2).toUpperCase(),
      company_legal_name: `PT ${brandName} Multi Nusantara`,
      hq_location: 'Jakarta HQ',
      contact_email: ownerEmail,
      contact_whatsapp: ownerPhone,
      custom_primary_hex: primaryColor
    },
    branches: [
      {
        id: `branch-${normalized}-central`,
        name: `${brandName} Central`,
        code: `${brandName.substring(0, 3).toUpperCase()}-01`,
        location: 'Pusat',
        city: 'Jakarta',
        contract_status: 'active',
        contact_person: ownerName,
        phone: ownerPhone,
        custom_retainer_fee: 5000000,
        package_tier: 'Standard',
        wallet_balance: 0,
        max_monthly_design_requests: 12,
        max_monthly_active_promos: 4,
        lead_days: 5,
        pic_name: `${ownerName} (HQ Owner)`,
        pic_phone: ownerPhone,
        pic_email: ownerEmail,
        owner_name: ownerName,
        owner_phone: ownerPhone,
        owner_email: ownerEmail,
        created_at: '2026-01-01'
      }
    ],
    users: [
      {
        id: `user-${normalized}-owner`,
        branch_id: null,
        role: 'hq_owner',
        full_name: ownerName,
        email: ownerEmail,
        phone: ownerPhone,
        job_title: `Brand Owner & Founder (${brandName})`,
        status: 'active',
        password: 'Media',
        joined_date: '2026-01-01'
      }
    ],
    designRequests: [],
    promos: [],
    invoices: [],
    influencers: [],
    quotas: [],
    activities: [],
    attendances: [],
    budgetRequests: [],
    shootRequests: [],
    walletTransactions: [],
    hqReimbursements: [],
    hqTodos: [],
    teamChatMessages: [],
    meetingAgendas: [],
    voucherCampaigns: [],
    exposureSlots: []
  };
}
