-- =========================================================================
-- MEDIASOCIAL.TEAM - PRODUCTION MULTI-TENANT POSTGRESQL SCHEMA FOR SUPABASE
-- Endpoint: https://db.mediasocial.team
-- Complete & Self-Contained SQL Migration File
-- =========================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PLATFORM SAAS TENANT BRANDS (mediasocial.team Level)
create table if not exists public.platform_brands (
  id text primary key default ('brand-' || substr(md5(random()::text), 1, 8)),
  slug text unique not null,
  name text not null,
  tagline text,
  logo_url text,
  primary_color text default '#FF5B14',
  hq_owner_name text not null,
  hq_owner_email text not null,
  hq_owner_phone text not null,
  subscription_plan_id text default 'growth',
  subscription_status text check (subscription_status in ('active', 'trial', 'expiring_soon', 'expired', 'suspended')) default 'active',
  subscription_start_date date not null default current_date,
  subscription_end_date date not null default (current_date + interval '30 days'),
  monthly_fee numeric default 4990000,
  branches_count integer default 1,
  wallet_balance numeric default 0,
  is_verified boolean default true,
  notes text,
  last_active_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. BRAND WHITELABEL CONFIGURATIONS (With Office Region & Timezone)
create table if not exists public.whitelabel_configs (
  brand_slug text primary key references public.platform_brands(slug) on delete cascade,
  brand_name text not null,
  brand_subtitle text,
  brand_monogram text,
  brand_logo_url text,
  theme_accent text default 'kinetic_orange',
  custom_primary_hex text default '#FF5B14',
  company_legal_name text,
  hq_location text,
  hq_address text,
  office_country text default 'Indonesia',
  office_city text default 'Bali',
  timezone_id text default 'Asia/Makassar',
  timezone_label text default 'WITA',
  contact_email text,
  contact_whatsapp text,
  bank_name text,
  bank_account_number text,
  bank_account_name text,
  bank_swift_code text,
  invoice_note_footer text,
  currency_symbol text default 'Rp',
  default_monthly_retainer numeric default 5000000,
  max_monthly_design_requests integer default 12,
  max_monthly_active_promos integer default 4,
  design_min_lead_days integer default 5,
  promo_cutoff_day_of_month integer default 25,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safe Alter Table in case whitelabel_configs exists
alter table public.whitelabel_configs add column if not exists office_country text default 'Indonesia';
alter table public.whitelabel_configs add column if not exists office_city text default 'Bali';
alter table public.whitelabel_configs add column if not exists timezone_id text default 'Asia/Makassar';
alter table public.whitelabel_configs add column if not exists timezone_label text default 'WITA';
alter table public.whitelabel_configs add column if not exists custom_primary_hex text default '#FF5B14';
alter table public.whitelabel_configs add column if not exists brand_logo_url text;

-- 4. FRANCHISE BRANCHES TABLE
create table if not exists public.branches (
  id text primary key default ('branch-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  name text not null,
  code text,
  location text not null,
  city text not null,
  address text,
  contract_status text check (contract_status in ('active', 'suspended', 'terminated')) default 'active',
  contact_person text,
  phone text,
  custom_retainer_fee numeric default 5000000,
  package_tier text default 'Standard',
  wallet_balance numeric default 0,
  max_monthly_design_requests integer default 15,
  max_monthly_active_promos integer default 5,
  lead_days integer default 5,
  pic_name text,
  pic_phone text,
  pic_email text,
  owner_name text,
  owner_phone text,
  owner_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. USERS PROFILE TABLE (Multi-Role Support & Custom Password)
create table if not exists public.users (
  id text primary key default ('user-' || substr(md5(random()::text), 1, 8)),
  brand_slug text references public.platform_brands(slug) on delete set null,
  branch_id text references public.branches(id) on delete set null,
  role text check (role in (
    'platform_owner', 'platform_finance', 'platform_admin',
    'hq_owner', 'hq_leader', 'hq_creative',
    'branch_owner', 'branch_manager', 'pusat_admin'
  )) not null,
  full_name text not null,
  email text not null,
  phone text unique not null,
  password_hash text default 'Media',
  avatar_url text,
  job_title text,
  status text check (status in ('active', 'inactive', 'suspended')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. DESIGN REQUESTS TABLE
create table if not exists public.design_requests (
  id text primary key default ('req-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text not null references public.branches(id) on delete cascade,
  title text not null,
  category text check (category in ('Food', 'Vibes', 'Creative', 'Promo')) not null,
  target_date date not null,
  status text check (status in ('pending', 'in_progress', 'review', 'approved', 'rejected')) default 'pending',
  description text not null,
  brief_attachment_name text,
  brief_attachment_url text,
  assigned_to_user_id text references public.users(id) on delete set null,
  assigned_to_name text,
  asset_result_url text,
  preview_media_url text,
  preview_media_type text default 'image',
  canva_url text,
  figma_url text,
  drive_url text,
  caption text,
  creative_notes text,
  approval_mode text default 'self_approved',
  scheduled_publish_time text,
  is_published_to_omnipost boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. DESIGN COMMENTS TABLE
create table if not exists public.design_comments (
  id text primary key default ('comm-' || substr(md5(random()::text), 1, 8)),
  request_id text not null references public.design_requests(id) on delete cascade,
  user_id text references public.users(id) on delete set null,
  user_name text not null,
  user_role text not null,
  comment_text text not null,
  tag text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. PROMOS TABLE
create table if not exists public.promos (
  id text primary key default ('promo-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text not null references public.branches(id) on delete cascade,
  title text not null,
  mechanic text not null,
  target_month text not null,
  start_date date not null,
  end_date date not null,
  status text check (status in ('submitted', 'approved', 'live', 'ended', 'rejected')) default 'submitted',
  terms text,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. INVOICES TABLE (With Payment Proof & Verification)
create table if not exists public.invoices (
  id text primary key default ('inv-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text not null references public.branches(id) on delete cascade,
  invoice_number text not null,
  period_month text not null,
  retainer_fee numeric not null default 0,
  additional_charges numeric not null default 0,
  additional_notes text,
  total_amount numeric not null default 0,
  status text check (status in ('unpaid', 'paid', 'overdue', 'cancelled', 'payment_pending')) default 'unpaid',
  issue_date date not null default current_date,
  due_date date not null default (current_date + interval '7 days'),
  payment_date date,
  payment_method text,
  payment_proof_url text,
  payment_notes text,
  verified_by_user_id text references public.users(id) on delete set null,
  verified_at timestamp with time zone,
  recipient_email text,
  recipient_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safe Alter Table for invoices
alter table public.invoices add column if not exists payment_proof_url text;
alter table public.invoices add column if not exists payment_notes text;
alter table public.invoices add column if not exists verified_by_user_id text;
alter table public.invoices add column if not exists verified_at timestamp with time zone;
alter table public.invoices add column if not exists payment_method text;

-- 10. SOCIAL CHANNELS TABLE
create table if not exists public.social_channels (
  id text primary key default ('chan-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  platform text check (platform in ('instagram', 'tiktok', 'facebook', 'youtube', 'threads')) not null,
  account_handle text not null,
  account_name text not null,
  account_avatar_url text,
  is_connected boolean default true,
  access_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. SOCIAL POSTS TABLE
create table if not exists public.social_posts (
  id text primary key default ('post-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  request_id text references public.design_requests(id) on delete set null,
  title text not null,
  caption text not null,
  media_url text not null,
  media_type text check (media_type in ('image', 'video', 'carousel')) default 'image',
  platforms jsonb not null default '[]'::jsonb,
  status text check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed')) default 'draft',
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  published_urls jsonb default '{}'::jsonb,
  metrics jsonb default '{"likes": 0, "comments": 0, "shares": 0, "reach": 0, "impressions": 0}'::jsonb,
  created_by_user_id text references public.users(id) on delete set null,
  created_by_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. INFLUENCERS (KOL) CRM TABLE
create table if not exists public.influencers (
  id text primary key default ('kol-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  name text not null,
  instagram_handle text,
  tiktok_handle text,
  category text check (category in ('Foodies', 'Lifestyle', 'Family', 'Beauty', 'Students', 'Luxury')) not null,
  followers_count integer default 0,
  engagement_rate numeric default 0,
  rate_per_post numeric default 0,
  rate_per_reel numeric default 0,
  rate_per_story numeric default 0,
  contact_whatsapp text,
  address text,
  status text check (status in ('prospect', 'contacted', 'negotiating', 'deal', 'posted', 'rejected')) default 'prospect',
  notes text,
  target_branch_id text references public.branches(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. PLATFORM SUBSCRIPTION PLANS TABLE
create table if not exists public.platform_plans (
  id text primary key,
  name text not null,
  monthly_price numeric not null,
  annual_price numeric not null,
  max_branches integer not null,
  max_design_requests_per_branch integer not null,
  max_promos_per_branch integer not null,
  includes_influencer_crm boolean default true,
  includes_collaboration_chat boolean default true,
  includes_auto_invoicing boolean default true,
  includes_dedicated_support boolean default true,
  is_popular boolean default false,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. PLATFORM WITHDRAWALS TABLE
create table if not exists public.platform_withdrawals (
  id text primary key default ('wd-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  amount numeric not null,
  bank_name text not null,
  bank_account_number text not null,
  bank_account_name text not null,
  status text check (status in ('pending', 'processing', 'completed', 'rejected')) default 'pending',
  requested_by_user_id text references public.users(id) on delete set null,
  requested_by_name text,
  processed_at timestamp with time zone,
  receipt_proof_url text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. SUBSCRIPTION REMINDERS LOG TABLE
create table if not exists public.subscription_reminders (
  id text primary key default ('rem-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  brand_name text not null,
  recipient_email text not null,
  recipient_phone text not null,
  recipient_name text not null,
  type text check (type in ('30_days_before', '7_days_before', '3_days_before', '1_day_before', 'expired_day', 'grace_period')) not null,
  days_remaining integer not null,
  message text not null,
  sent_via jsonb default '["email", "whatsapp"]'::jsonb,
  is_sent boolean default true,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. TEAM CHAT MESSAGES TABLE
create table if not exists public.team_chat_messages (
  id text primary key default ('msg-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text references public.branches(id) on delete cascade,
  sender_id text references public.users(id) on delete set null,
  sender_name text not null,
  sender_role text not null,
  sender_avatar text,
  text text not null,
  attachment_url text,
  attachment_name text,
  reply_to_id text references public.team_chat_messages(id) on delete set null,
  is_broadcast boolean default false,
  reactions jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. ATTENDANCES TABLE
create table if not exists public.attendances (
  id text primary key default ('att-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  user_name text not null,
  date date not null default current_date,
  clock_in_time text not null,
  clock_out_time text,
  mode text check (mode in ('WFO', 'WFH', 'On-Site Visit')) default 'WFO',
  status text check (status in ('present', 'late', 'completed')) default 'present',
  work_log text,
  target_branch_id text references public.branches(id) on delete set null,
  total_hours numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 18. HQ CREATIVE TODOS TABLE
create table if not exists public.hq_todos (
  id text primary key default ('todo-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  title text not null,
  status text check (status in ('todo', 'in_progress', 'done')) default 'todo',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  due_date date,
  estimated_minutes integer default 60,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 19. SHOOT REQUESTS TABLE
create table if not exists public.shoot_requests (
  id text primary key default ('shoot-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text not null references public.branches(id) on delete cascade,
  branch_name text not null,
  requester_id text references public.users(id) on delete set null,
  requester_name text not null,
  requester_role text not null,
  type text check (type in ('photoshoot_visit', 'video_reels_visit', 'menu_launch_coverage', 'influencer_event_visit')) not null,
  title text not null,
  preferred_date date not null,
  details text not null,
  status text check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled',
  assigned_crew_name text,
  deliverables_drive_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 20. BUDGET REQUESTS TABLE (With LPJ Report & Fund Proof)
create table if not exists public.budget_requests (
  id text primary key default ('bgreq-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  requester_id text references public.users(id) on delete set null,
  requester_name text not null,
  requester_role text not null,
  target_branch_id text not null references public.branches(id) on delete cascade,
  target_branch_name text not null,
  type text check (type in ('meta_ads', 'tiktok_ads', 'influencer_fee', 'photo_prop', 'printing_collateral', 'other')) not null,
  title text not null,
  amount numeric not null,
  objective text not null,
  status text check (status in ('pending_approval', 'approved', 'rejected', 'disbursed', 'acknowledged', 'completed')) default 'pending_approval',
  approved_by text,
  approved_at timestamp with time zone,
  disbursed_by text,
  disbursed_at timestamp with time zone,
  transfer_proof_url text,
  transfer_reference text,
  transfer_notes text,
  acknowledged_by text,
  acknowledged_at timestamp with time zone,
  completion_report jsonb,
  target_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 21. MEETING AGENDAS TABLE
create table if not exists public.meeting_agendas (
  id text primary key default ('meet-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  title text not null,
  date text not null default current_date::text,
  start_time text default '10:00',
  end_time text default '11:00',
  time text default '10:00',
  type text default 'hq_sync',
  host_name text,
  location_or_link text,
  meeting_url text,
  agenda text default '',
  notes text default '',
  attendees jsonb default '[]'::jsonb,
  participants jsonb default '[]'::jsonb,
  duration_minutes integer default 60,
  status text check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')) default 'scheduled',
  mom_notes text,
  action_items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 22. ACTIVITIES LOG TABLE
create table if not exists public.activities (
  id text primary key default ('act-' || substr(md5(random()::text), 1, 8)),
  brand_slug text references public.platform_brands(slug) on delete cascade,
  branch_id text references public.branches(id) on delete set null,
  user_name text not null,
  action_type text not null,
  title text not null,
  description text not null,
  severity text default 'info',
  is_read boolean default false,
  link_tab text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 23. WALLET TRANSACTIONS TABLE
create table if not exists public.wallet_transactions (
  id text primary key default ('tx-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text references public.branches(id) on delete set null,
  type text check (type in ('credit', 'debit')) not null,
  amount numeric not null,
  description text not null,
  reference_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- SEED INITIAL DATA FOR MASTER TENANT & DEFAULT ROLES
-- =========================================================================

-- Seed Platform Brands
insert into public.platform_brands (
  id, slug, name, tagline, logo_url, primary_color,
  hq_owner_name, hq_owner_email, hq_owner_phone,
  subscription_plan_id, subscription_status, monthly_fee, branches_count, wallet_balance, is_verified
) values
  ('brand-mediasocial', 'mediasocial', 'mediasocial', 'Social Media Management & Quota Portal', '', '#FF5B14', 'Platform Superadmin', 'owner@mediasocial.team', '08159998757', 'enterprise', 'active', 8990000, 1, 5000000, true),
  ('brand-chub', 'chub', 'Chub', 'Chub Creative Network', '', '#6366F1', 'Chub Owner', 'owner@chub.id', '081299991122', 'growth', 'active', 4890000, 1, 0, true),
  ('brand-moggumung', 'moggumung', 'Moggumung Bali', 'Authentic Korean BBQ Portal', '', '#FF5B26', 'HQ Owner Moggumung', 'owner@moggumung.com', '081234567890', 'enterprise', 'active', 8990000, 2, 10000000, true)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  primary_color = excluded.primary_color,
  hq_owner_name = excluded.hq_owner_name,
  hq_owner_email = excluded.hq_owner_email,
  hq_owner_phone = excluded.hq_owner_phone;

-- Seed Whitelabel Configs
insert into public.whitelabel_configs (
  brand_slug, brand_name, brand_subtitle, brand_monogram, brand_logo_url,
  theme_accent, custom_primary_hex, company_legal_name, hq_location, hq_address,
  office_country, office_city, timezone_id, timezone_label,
  contact_email, contact_whatsapp, bank_name, bank_account_number, bank_account_name, bank_swift_code,
  invoice_note_footer, currency_symbol, default_monthly_retainer, max_monthly_design_requests, max_monthly_active_promos, design_min_lead_days, promo_cutoff_day_of_month
) values
  ('mediasocial', 'mediasocial', 'Social Media Management & Quota Portal', 'MS', '', 'kinetic_orange', '#FF5B14', 'PT Media Social Multi Nusantara', 'Jakarta HQ', 'Jakarta, Indonesia', 'Indonesia', 'Bali', 'Asia/Makassar', 'WITA', 'hello@mediasocial.team', '08159998757', 'Bank Central Asia (BCA)', '772-098-1123', 'PT Media Social Multi Nusantara', 'CENAIDJA', 'Pembayaran wajib diselesaikan dalam 7 hari kalender. Harap cantumkan Nomor Invoice pada berita transfer.', 'Rp', 5000000, 12, 4, 5, 25),
  ('chub', 'Chub', 'Chub Creative Portal', 'CB', '', 'indigo', '#6366F1', 'PT Chub Creative Nusantara', 'Jakarta HQ', 'Jakarta, Indonesia', 'Indonesia', 'Jakarta', 'Asia/Jakarta', 'WIB', 'hello@chub.id', '081299991122', 'Bank Mandiri', '123-000-9876', 'PT Chub Creative Nusantara', 'BMRIIDJA', 'Pembayaran invoice transfer ke rekening Mandiri.', 'Rp', 5000000, 12, 4, 5, 25),
  ('moggumung', 'Moggumung Bali', 'Authentic Korean BBQ Management Portal', 'MG', '', 'kinetic_orange', '#FF5B26', 'PT Moggumung Kuliner Bali', 'Canggu HQ', 'Jl. Pantai Batu Bolong No. 88, Canggu, Bali', 'Indonesia', 'Bali', 'Asia/Makassar', 'WITA', 'management@moggumung.com', '081234567890', 'Bank Central Asia (BCA)', '772-098-1123', 'PT Moggumung Kuliner Bali', 'CENAIDJA', 'Pembayaran wajib diselesaikan dalam 7 hari kalender setelah tanggal terbit invoice.', 'Rp', 5000000, 15, 5, 5, 25)
on conflict (brand_slug) do update set
  brand_name = excluded.brand_name,
  brand_subtitle = excluded.brand_subtitle,
  custom_primary_hex = excluded.custom_primary_hex,
  office_country = excluded.office_country,
  office_city = excluded.office_city,
  timezone_id = excluded.timezone_id,
  timezone_label = excluded.timezone_label;

-- Seed Platform Superadmin User
insert into public.users (
  id,
  brand_slug,
  branch_id,
  role,
  full_name,
  email,
  phone,
  password_hash,
  job_title,
  status
) values (
  'user-platform-owner',
  null,
  null,
  'platform_owner',
  'Platform Superadmin',
  'owner@mediasocial.team',
  '08159998757',
  'Media',
  'Platform Owner & Superadmin (mediasocial.team)',
  'active'
) on conflict (phone) do update set
  password_hash = excluded.password_hash,
  role = excluded.role,
  full_name = excluded.full_name;

-- Seed Platform Plans
insert into public.platform_plans (
  id, name, monthly_price, annual_price, max_branches, 
  max_design_requests_per_branch, max_promos_per_branch, 
  includes_influencer_crm, includes_collaboration_chat, 
  includes_auto_invoicing, includes_dedicated_support, is_popular, description
) values
  ('starter', 'Starter Franchise', 2490000, 24900000, 3, 6, 2, false, true, true, false, false, 'Ideal untuk franchise berkembang dengan 1–3 cabang yang butuh kepastian kuota desain & invoice bulanan.'),
  ('growth', 'Growth Network', 4890000, 48900000, 10, 18, 6, true, true, true, false, true, 'Paling populer untuk franchise 4–10 cabang aktif dengan matrix exposure multi-outlet & modul KOL influencer.'),
  ('enterprise', 'Enterprise Fleet', 8990000, 89900000, 30, 999, 999, true, true, true, true, false, 'Solusi tanpa batas untuk jaringan ritel/F&B nasional, custom SLA, prioritas render studio & dedicated account manager.')
on conflict (id) do update set
  name = excluded.name,
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  max_branches = excluded.max_branches,
  max_design_requests_per_branch = excluded.max_design_requests_per_branch,
  max_promos_per_branch = excluded.max_promos_per_branch;

-- Enable Row Level Security (RLS) & Universal Anonymous Client Policies
alter table public.platform_brands enable row level security;
alter table public.whitelabel_configs enable row level security;
alter table public.branches enable row level security;
alter table public.users enable row level security;
alter table public.design_requests enable row level security;
alter table public.design_comments enable row level security;
alter table public.promos enable row level security;
alter table public.invoices enable row level security;
alter table public.social_channels enable row level security;
alter table public.social_posts enable row level security;
alter table public.influencers enable row level security;
alter table public.platform_plans enable row level security;
alter table public.platform_withdrawals enable row level security;
alter table public.subscription_reminders enable row level security;
alter table public.team_chat_messages enable row level security;
alter table public.attendances enable row level security;
alter table public.hq_todos enable row level security;
alter table public.shoot_requests enable row level security;
alter table public.budget_requests enable row level security;
alter table public.meeting_agendas enable row level security;
alter table public.activities enable row level security;
alter table public.wallet_transactions enable row level security;

-- Anonymous public policy for application client
drop policy if exists "Allow all public operations" on public.platform_brands;
drop policy if exists "Allow all public operations" on public.whitelabel_configs;
drop policy if exists "Allow all public operations" on public.branches;
drop policy if exists "Allow all public operations" on public.users;
drop policy if exists "Allow all public operations" on public.design_requests;
drop policy if exists "Allow all public operations" on public.design_comments;
drop policy if exists "Allow all public operations" on public.promos;
drop policy if exists "Allow all public operations" on public.invoices;
drop policy if exists "Allow all public operations" on public.social_channels;
drop policy if exists "Allow all public operations" on public.social_posts;
drop policy if exists "Allow all public operations" on public.influencers;
drop policy if exists "Allow all public operations" on public.platform_plans;
drop policy if exists "Allow all public operations" on public.platform_withdrawals;
drop policy if exists "Allow all public operations" on public.subscription_reminders;
drop policy if exists "Allow all public operations" on public.team_chat_messages;
drop policy if exists "Allow all public operations" on public.attendances;
drop policy if exists "Allow all public operations" on public.hq_todos;
drop policy if exists "Allow all public operations" on public.shoot_requests;
drop policy if exists "Allow all public operations" on public.budget_requests;
drop policy if exists "Allow all public operations" on public.meeting_agendas;
drop policy if exists "Allow all public operations" on public.activities;
drop policy if exists "Allow all public operations" on public.wallet_transactions;

create policy "Allow all public operations" on public.platform_brands for all using (true) with check (true);
create policy "Allow all public operations" on public.whitelabel_configs for all using (true) with check (true);
create policy "Allow all public operations" on public.branches for all using (true) with check (true);
create policy "Allow all public operations" on public.users for all using (true) with check (true);
create policy "Allow all public operations" on public.design_requests for all using (true) with check (true);
create policy "Allow all public operations" on public.design_comments for all using (true) with check (true);
create policy "Allow all public operations" on public.promos for all using (true) with check (true);
create policy "Allow all public operations" on public.invoices for all using (true) with check (true);
create policy "Allow all public operations" on public.social_channels for all using (true) with check (true);
create policy "Allow all public operations" on public.social_posts for all using (true) with check (true);
create policy "Allow all public operations" on public.influencers for all using (true) with check (true);
create policy "Allow all public operations" on public.platform_plans for all using (true) with check (true);
create policy "Allow all public operations" on public.platform_withdrawals for all using (true) with check (true);
create policy "Allow all public operations" on public.subscription_reminders for all using (true) with check (true);
create policy "Allow all public operations" on public.team_chat_messages for all using (true) with check (true);
create policy "Allow all public operations" on public.attendances for all using (true) with check (true);
create policy "Allow all public operations" on public.hq_todos for all using (true) with check (true);
create policy "Allow all public operations" on public.shoot_requests for all using (true) with check (true);
create policy "Allow all public operations" on public.budget_requests for all using (true) with check (true);
create policy "Allow all public operations" on public.meeting_agendas for all using (true) with check (true);
create policy "Allow all public operations" on public.activities for all using (true) with check (true);
create policy "Allow all public operations" on public.wallet_transactions for all using (true) with check (true);
