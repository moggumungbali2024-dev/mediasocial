export type UserRole = 
  | 'platform_owner'    // Platform Owner of mediasocial.team (SaaS Master / Packages / Wallet Payout)
  | 'platform_finance'  // Platform Finance of mediasocial.team (Expiring Subscriptions / Reminders / Revenue)
  | 'platform_admin'    // Platform Admin of mediasocial.team (Brand Registry / Invites / Tenants)
  | 'hq_owner'          // HQ Super Admin / Franchise Brand Owner (Full Access within Brand)
  | 'hq_leader'         // HQ Creative Director / Ops Leader (Approvals, Billing, Budget)
  | 'hq_creative'       // HQ Creative Team (Designer/Video/Editor)
  | 'branch_owner'      // Branch / Franchisee Owner (Can access billing, promos, designs)
  | 'branch_manager'    // Branch Store Manager (Cannot access billing, can request promos, shoots, influencers)
  | 'pusat_admin';      // Alias for hq_owner backwards compatibility

export type LanguageCode = 'en' | 'ko';
export type ThemeMode = 'light' | 'dark';

// Platform Super-Admin & Multi-Tenant SaaS Interfaces
export interface BrandSubscriptionPlan {
  id: string; // 'starter' | 'growth' | 'enterprise'
  name: string;
  monthly_price: number; // e.g. Rp 2,490,000 / mo
  annual_price: number; // e.g. Rp 24,900,000 / yr
  max_branches: number;
  max_design_requests_per_branch: number;
  max_promos_per_branch: number;
  includes_influencer_crm: boolean;
  includes_collaboration_chat: boolean;
  includes_auto_invoicing: boolean;
  includes_dedicated_support: boolean;
  is_popular?: boolean;
  description: string;
}

export type PlatformBrandStatus = 'active' | 'trial' | 'expiring_soon' | 'expired' | 'suspended';

export interface PlatformBrandTenant {
  id: string;
  slug: string; // e.g. 'moggumung', 'kopisenja', 'matchabae'
  name: string;
  tagline: string;
  logo_url?: string;
  primary_color: string;
  hq_owner_name: string;
  hq_owner_email: string;
  hq_owner_phone: string;
  subscription_plan_id: string; // 'starter' | 'growth' | 'enterprise'
  subscription_status: PlatformBrandStatus;
  subscription_start_date: string;
  subscription_end_date: string; // YYYY-MM-DD
  monthly_fee: number;
  branches_count: number;
  is_verified: boolean;
  created_at: string;
  last_active_at: string;
  wallet_balance: number; // Brand deposit wallet for Ads & Shoots
  notes?: string;
}

export interface PlatformWalletWithdrawal {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_by: string;
  requested_by_name: string;
  created_at: string;
  completed_at?: string;
  reference_no?: string;
  notes?: string;
}

export interface SubscriptionReminderLog {
  id: string;
  brand_id: string;
  brand_name: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  days_remaining: number;
  channel: 'whatsapp' | 'email' | 'system';
  message_preview: string;
  sent_at: string;
  sent_by: string;
  status: 'sent' | 'delivered' | 'failed';
}

export const isPlatformUser = (role: UserRole): boolean => {
  return role === 'platform_owner' || role === 'platform_finance' || role === 'platform_admin';
};

export const isPlatformOwner = (role: UserRole): boolean => {
  return role === 'platform_owner';
};

export const isPlatformFinance = (role: UserRole): boolean => {
  return role === 'platform_finance' || role === 'platform_owner';
};

export const isPlatformAdmin = (role: UserRole): boolean => {
  return role === 'platform_admin' || role === 'platform_owner';
};

export const canAccessUserManagement = (role: UserRole): boolean => {
  return role === 'hq_owner' || role === 'pusat_admin' || isPlatformUser(role);
};

export const canAccessBranchManagement = (role: UserRole): boolean => {
  return role === 'hq_owner' || role === 'hq_leader' || role === 'pusat_admin' || isPlatformUser(role);
};

export const canAccessWhitelabel = (role: UserRole): boolean => {
  return role === 'hq_owner' || role === 'pusat_admin' || isPlatformUser(role);
};

export const canAccessBilling = (role: UserRole): boolean => {
  return role === 'hq_owner' || role === 'hq_leader' || role === 'branch_owner' || role === 'pusat_admin' || isPlatformUser(role);
};

export const canAccessAttendance = (role: UserRole): boolean => {
  return role === 'hq_owner' || role === 'hq_leader' || role === 'hq_creative' || role === 'pusat_admin' || isPlatformUser(role);
};

export const canApproveDesignRequests = (role: UserRole): boolean => {
  return role === 'hq_owner' || role === 'hq_leader' || role === 'hq_creative' || role === 'pusat_admin' || isPlatformUser(role);
};

export const canApproveBudget = (role: UserRole): boolean => {
  return role === 'hq_owner' || role === 'hq_leader' || role === 'pusat_admin' || isPlatformUser(role);
};

export interface WhitelabelConfig {
  brand_name: string;
  brand_subtitle: string;
  brand_monogram: string;
  brand_logo_url?: string;
  theme_accent: 'kinetic_orange' | 'deep_black' | 'amber' | 'emerald' | 'sky' | 'indigo' | 'rose' | 'slate' | 'custom';
  custom_primary_hex?: string; // Hex color if theme_accent is custom or customized
  company_legal_name: string;
  hq_location: string;
  hq_address: string;
  office_country?: string; // e.g. 'Indonesia', 'South Korea', 'Singapore', 'Japan'
  office_city?: string; // e.g. 'Bali', 'Jakarta', 'Seoul'
  timezone_id?: string; // IANA timezone, e.g. 'Asia/Makassar', 'Asia/Jakarta', 'Asia/Seoul'
  timezone_label?: string; // e.g. 'WITA', 'WIB', 'KST', 'SGT'
  contact_email: string;
  contact_whatsapp: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_swift_code?: string;
  invoice_note_footer: string;
  currency_symbol: string;
  default_monthly_retainer: number;
  max_monthly_design_requests: number;
  max_monthly_active_promos: number;
  design_min_lead_days: number;
  promo_cutoff_day_of_month: number;
  standard_work_hours?: number; // Standard daily working hours (default: 8 hours)
}

export type AttendanceMode = 'WFO' | 'WFH' | 'On-Site Visit';
export type AttendanceStatus = 'present' | 'completed' | 'on_duty';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  date: string; // YYYY-MM-DD
  clock_in_time: string; // e.g. "08:45"
  clock_out_time?: string; // e.g. "17:30"
  mode: AttendanceMode;
  status: AttendanceStatus;
  work_log: string;
  target_branch_id?: string;
  total_hours?: number;
  overtime_hours?: number; // Lembur duration if total_hours > standard_work_hours
}

export interface Branch {
  id: string;
  name: string;
  code?: string;
  location: string;
  city: string;
  address?: string;
  contract_status: 'active' | 'suspended' | 'terminated';
  contact_person: string;
  phone: string;
  created_at: string;
  custom_retainer_fee?: number; // Custom subscription rate set by Pusat (default Rp5.000.000)
  package_tier?: 'Starter' | 'Standard' | 'Premium' | 'Custom';
  wallet_balance: number; // Deposit balance for Meta Ads & Shoots
  max_monthly_design_requests?: number;
  max_monthly_active_promos?: number;
  lead_days?: number;
  pic_name?: string;
  pic_phone?: string;
  pic_email?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  default_caption_template?: string;
  default_hashtags?: string;
}

export interface UserProfile {
  id: string;
  branch_id: string | null; // null if HQ
  role: UserRole;
  full_name: string;
  email: string;
  job_title?: string;
  status?: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  phone: string;
  password?: string; // Default '1'
  joined_date?: string;
}

export interface MonthlyQuota {
  id: string;
  branch_id: string;
  period_month: string; // YYYY-MM
  design_used: number;  // Max 3
  promo_used: number;   // Max 2
}

export type RequestStatus = 'pending' | 'in_progress' | 'review' | 'approved' | 'rejected';
export type ContentPillar = 'Food' | 'Vibes' | 'Creative' | 'Promo';

export interface DesignComment {
  id: string;
  request_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  user_avatar?: string;
  message: string;
  tag?: string; // e.g. "Revisi Desain", "Koreksi Harga", "Siap Tayang", "Urgent", "Format File"
  created_at: string;
}

export interface DesignRequest {
  id: string;
  branch_id: string;
  branch_name?: string;
  requester_id?: string;
  requester_name?: string;
  title: string;
  description: string;
  target_date: string; // YYYY-MM-DD, must be >= H+5
  status: RequestStatus;
  category: ContentPillar;
  asset_result_url?: string;
  preview_media_url?: string; // Image or video file preview URL
  preview_media_type?: 'image' | 'video';
  canva_url?: string; // Canva working link
  figma_url?: string; // Figma working link
  drive_url?: string; // Google Drive / Dropbox link
  caption?: string; // Ready-to-post caption
  brief_attachment_name?: string;
  feedback_notes?: string;
  comments?: DesignComment[];
  created_at: string;
  assigned_to_user_id?: string; // HQ Creative staff assigned
  assigned_to_id?: string;
  assigned_to_name?: string;
  creative_notes?: string;
  completed_at?: string;
  approval_mode?: 'self_approved' | 'leader_approved' | 'pending_leader';
  approved_by?: string;
}

export interface PromoRequest {
  id: string;
  branch_id: string;
  branch_name?: string;
  title: string;
  mechanic: string; // e.g. "Buy 1 Get 1 Ramen Free"
  target_month: string; // YYYY-MM
  start_date: string;
  end_date: string;
  terms: string;
  status: 'active' | 'pending_approval' | 'rejected' | 'completed';
  created_at: string;
}

export type InvoiceStatus = 'unpaid' | 'proof_uploaded' | 'paid' | 'overdue';

export interface CustomLineItem {
  id: string;
  name: string;
  amount: number;
}

export interface Invoice {
  id: string;
  branch_id: string;
  invoice_number: string; // e.g. INV/MGG/2026/10/001
  period_month: string;   // YYYY-MM-01
  retainer_fee: number;   // Can be customized per invoice / branch (Langganan)
  visit_fee: number;      // Manual charge for photoshoots/visits
  ad_budget: number;      // Deposit for Meta / Google Ads
  custom_items?: CustomLineItem[]; // Unlimited custom items (Cetak, Diskon, Extra Crew)
  additional_notes?: string;
  total_amount: number;   // retainer + visit + ad_budget + sum(custom_items)
  status: InvoiceStatus;
  due_date: string;
  proof_url?: string;
  proof_notes?: string;
  payment_date?: string;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  branch_id: string;
  branch_name: string;
  type: 'top_up' | 'budget_deduct' | 'refund';
  amount: number;
  title: string;
  description: string;
  proof_url?: string;
  reference_id?: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_by?: string;
}

export type ShootRequestType = 'photoshoot_visit' | 'menu_revamp_shoot' | 'promo_launch' | 'event_coverage' | 'store_ambience';
export type ShootRequestStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface ShootRequest {
  id: string;
  branch_id: string;
  branch_name: string;
  requester_id: string;
  requester_name: string;
  requester_role: UserRole;
  type: ShootRequestType;
  title: string;
  preferred_date: string;
  details: string;
  focus_products?: string[];
  status: ShootRequestStatus;
  assigned_creative_id?: string;
  assigned_creative_name?: string;
  notes?: string;
  created_at: string;
}

export type BudgetRequestType = 'meta_ads' | 'photoshoot_visit' | 'props_equipment' | 'influencer_fee' | 'other_ops';
export type BudgetRequestStatus = 'pending_approval' | 'approved' | 'rejected' | 'disbursed' | 'acknowledged' | 'completed';

export interface BudgetCompletionReport {
  executed_date: string;
  spent_amount: number;
  proof_screenshot_url?: string;
  report_notes: string;
  impressions?: number;
  reach?: number;
  deliverable_link?: string;
}

export interface BudgetRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_role: UserRole;
  target_branch_id: string;
  target_branch_name: string;
  type: BudgetRequestType;
  title: string;
  amount: number;
  objective: string;
  status: BudgetRequestStatus;
  approved_by?: string;
  disbursed_by?: string;
  disbursed_at?: string;
  transfer_proof_url?: string;
  transfer_reference?: string;
  transfer_note?: string;
  acknowledged_at?: string;
  completion_report?: BudgetCompletionReport;
  target_date?: string; // Execution/target date for the budget
  created_at: string;
}

export interface ExposureSlot {
  id: string;
  branch_id: string;
  date: string; // YYYY-MM-DD
  pillar: ContentPillar;
  format: 'Reels' | 'Feed Carousel' | 'Single Post' | 'Story Highlights';
  title: string;
  caption_outline: string;
  status: 'draft' | 'scheduled' | 'published';
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  location: string;
  category: 'Foodie & Review' | 'Lifestyle & Travel' | 'Student & Gen-Z' | 'Family Dining';
  tier: 'Nano (1k-10k)' | 'Micro (10k-50k)' | 'Mid-tier (50k-250k)';
  followers: string;
  engagement_rate: string;
  collaboration_type: 'barter' | 'paid';
  fee_estimate: string;
  status: 'approved' | 'in_review';
  contact: string;
  notes: string;
  voucher_code?: string;
  profile_url?: string;
  avatar_url?: string;
}

export interface InfluencerVoucherCampaign {
  id: string;
  influencer_id: string;
  influencer_name: string;
  influencer_handle: string;
  branch_id: string;
  branch_name: string;
  code: string;
  discount_percent: number;
  valid_until: string;
  redemption_count: number;
  total_sales_driven: number;
  cost_spent: number;
  status: 'active' | 'expired';
}

// HQ Operational Reimbursements & Work Expense
export type HqReimbursementCategory = 'software_license' | 'props_equipment' | 'travel_transport' | 'photoshoot_meals' | 'printing_hardware' | 'other_ops';
export type HqReimbursementStatus = 'pending_approval' | 'approved' | 'rejected' | 'reimbursed';

export interface HqReimbursementRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_role: UserRole;
  category: HqReimbursementCategory;
  title: string;
  amount: number;
  description: string;
  receipt_proof_url: string;
  status: HqReimbursementStatus;
  approved_by?: string;
  approved_at?: string;
  reimbursed_at?: string;
  reimburse_batch_id?: string;
  transfer_proof_url?: string;
  transfer_reference?: string;
  admin_notes?: string;
  created_at: string;
}

// HQ To-Do Item synced with Design Requests & Daily Work Log
export interface HqTodoItem {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  category: 'design' | 'promo' | 'shoot' | 'general';
  related_request_id?: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  included_in_work_log: boolean;
  created_at: string;
}

// Team Chat & Collaboration Hub with @Tagging, Project Link, and Media Attachment
export interface TeamChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  sender_avatar?: string;
  channel: 'hq_internal' | 'branch_collab';
  branch_id?: string;
  branch_name?: string;
  message: string;
  tagged_user_ids: string[];
  tagged_user_names: string[];
  linked_request_id?: string;
  linked_request_title?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  read_by?: string[];
  created_at: string;
}

// Meeting Agenda on Calendar
export interface MeetingAgenda {
  id: string;
  title: string;
  host_name?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  type: 'hq_sync' | 'branch_brief' | 'review' | 'creative_ideation';
  attendees: string[];
  location_or_link: string;
  notes?: string;
  created_at: string;
}

export type ActivityActionType =
  | 'request_submitted'
  | 'request_status_changed'
  | 'invoice_generated'
  | 'charge_updated'
  | 'custom_pricing_updated'
  | 'proof_uploaded'
  | 'payment_proof_uploaded'
  | 'payment_verified'
  | 'exposure_scheduled'
  | 'promo_submitted'
  | 'promo_campaign_active'
  | 'budget_requested'
  | 'budget_approved'
  | 'shoot_requested'
  | 'voucher_redeemed'
  | 'reimbursement_requested'
  | 'reimbursement_processed'
  | 'user_mentioned'
  | 'attendance_clocked_in'
  | 'attendance_clocked_out';

export interface ActivityItem {
  id: string;
  branch_id?: string;
  branch_name?: string;
  user_name: string;
  action_type: ActivityActionType;
  title: string;
  description: string;
  timestamp: string;
  read_by: string[];
  severity: 'info' | 'success' | 'warning' | 'purple';
  target_id?: string;
  link_tab?: 'dashboard' | 'requests' | 'tasks' | 'exposure' | 'billing' | 'attendance' | 'branches' | 'users' | 'whitelabel' | 'influencers' | 'activity' | 'calendar' | 'chat' | 'omnipost';
}

// Omnipost API Native Multi-Channel Social Media Types
export interface OmnipostAccountInfo {
  ok: boolean;
  api: string;
  version: string;
  userId: string;
  channelCount: number;
  plan?: string;
  creditsRemaining?: number;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'threads' | 'twitter' | 'linkedin' | 'pinterest';

export interface OmnipostChannel {
  id: string;
  name: string;
  platform: SocialPlatform | string;
  avatar_url?: string;
  handle?: string;
  is_active: boolean;
  followers_count?: number;
  created_at?: string;
}

export type OmnipostPostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'processing';

export interface OmnipostPost {
  id: string;
  title?: string;
  content: string;
  media_urls?: string[];
  channel_ids: string[];
  status: OmnipostPostStatus;
  scheduled_at?: string;
  published_at?: string;
  error_message?: string;
  created_at: string;
  request_id?: string; // Optional link to DesignRequest
  insights?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    reach?: number;
  };
}

export interface OmnipostInsightsSummary {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
  failed: number;
  channelCount: number;
  publishRate: number;
}

export interface OmnipostConfig {
  apiUrl: string;
  apiToken: string;
  autoPublishApproved: boolean;
  defaultChannels: string[];
}
