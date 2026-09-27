-- =========================================================================
-- MEDIASOCIAL.TEAM - PRODUCTION MULTI-TENANT POSTGRESQL SCHEMA FOR SUPABASE
-- Endpoint: https://db.mediasocial.team
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

-- 3. BRAND WHITELABEL CONFIGURATIONS
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

-- 5. USERS PROFILE TABLE (Multi-Role Support & Superadmin)
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
  password_hash text not null default 'Media',
  job_title text,
  avatar_url text,
  status text default 'active',
  joined_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. DESIGN & CREATIVE PRODUCTION REQUESTS
create table if not exists public.design_requests (
  id text primary key default ('req-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text not null references public.branches(id) on delete cascade,
  title text not null,
  description text not null,
  category text check (category in ('Food', 'Vibes', 'Creative', 'Promo')) default 'Food',
  target_date date not null,
  status text check (status in ('pending', 'in_progress', 'review', 'approved', 'rejected')) default 'pending',
  asset_result_url text,
  preview_media_url text,
  canva_url text,
  figma_url text,
  drive_url text,
  caption text,
  brief_attachment_name text,
  assigned_to_user_id text references public.users(id),
  assigned_to_name text,
  approval_mode text default 'self_approved',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. DESIGN COMMENTS & FEEDBACK THREAD
create table if not exists public.design_comments (
  id text primary key default ('comment-' || substr(md5(random()::text), 1, 8)),
  request_id text not null references public.design_requests(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  user_name text not null,
  user_role text not null,
  message text not null,
  tag text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. PROMOS & CAMPAIGNS TABLE
create table if not exists public.promos (
  id text primary key default ('promo-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text not null references public.branches(id) on delete cascade,
  title text not null,
  mechanic text not null,
  target_month text not null,
  start_date date not null,
  end_date date not null,
  terms text,
  status text check (status in ('active', 'pending_approval', 'rejected', 'completed')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. MONTHLY INVOICES TABLE
create table if not exists public.invoices (
  id text primary key default ('inv-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text not null references public.branches(id) on delete cascade,
  invoice_number text unique not null,
  period_month date not null,
  retainer_fee numeric not null default 5000000,
  visit_fee numeric not null default 0,
  ad_budget numeric not null default 0,
  total_amount numeric not null,
  status text check (status in ('unpaid', 'proof_uploaded', 'paid', 'overdue')) default 'unpaid',
  proof_url text,
  proof_notes text,
  due_date date not null,
  payment_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. SOCIAL MEDIA CHANNELS TABLE (Instagram & TikTok Multi-Tenant)
create table if not exists public.social_channels (
  id text primary key default ('channel-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  platform text check (platform in ('instagram', 'tiktok', 'facebook', 'youtube', 'threads', 'twitter', 'linkedin')) not null,
  name text not null,
  handle text not null,
  channel_id text,
  avatar_url text,
  followers_count integer default 0,
  is_active boolean default true,
  access_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. SOCIAL MEDIA POSTS TABLE (Omnipost Auto-Publish Engine)
create table if not exists public.social_posts (
  id text primary key default ('post-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  title text,
  content text not null,
  media_urls text[],
  channel_ids text[],
  status text check (status in ('draft', 'scheduled', 'published', 'failed', 'processing')) default 'draft',
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  error_message text,
  request_id text references public.design_requests(id) on delete set null,
  insights jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. INFLUENCER DIRECTORY CRM
create table if not exists public.influencers (
  id text primary key default ('inf-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  name text not null,
  handle text not null,
  location text not null,
  category text not null,
  tier text not null,
  followers text not null,
  engagement_rate text not null,
  collaboration_type text check (collaboration_type in ('barter', 'paid', 'hybrid')) not null,
  fee_estimate text not null,
  status text check (status in ('shortlisted', 'contacted', 'approved', 'rejected', 'completed')) default 'shortlisted',
  contact text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. PLATFORM SUBSCRIPTION PLANS TABLE
create table if not exists public.platform_plans (
  id text primary key, -- 'starter', 'growth', 'enterprise'
  name text not null,
  monthly_price numeric not null,
  annual_price numeric not null,
  max_branches integer not null default 3,
  max_design_requests_per_branch integer not null default 6,
  max_promos_per_branch integer not null default 2,
  includes_influencer_crm boolean default false,
  includes_collaboration_chat boolean default true,
  includes_auto_invoicing boolean default true,
  includes_dedicated_support boolean default false,
  is_popular boolean default false,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. PLATFORM WALLET WITHDRAWALS TABLE
create table if not exists public.platform_withdrawals (
  id text primary key default ('wd-' || substr(md5(random()::text), 1, 8)),
  amount numeric not null,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  status text check (status in ('pending', 'processing', 'completed', 'rejected')) default 'pending',
  requested_by text references public.users(id),
  requested_by_name text,
  reference_no text,
  notes text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. SUBSCRIPTION REMINDERS LOG TABLE
create table if not exists public.subscription_reminders (
  id text primary key default ('rem-' || substr(md5(random()::text), 1, 8)),
  brand_id text references public.platform_brands(id) on delete cascade,
  brand_name text not null,
  recipient_name text not null,
  recipient_phone text not null,
  recipient_email text,
  days_remaining integer not null default 0,
  channel text check (channel in ('whatsapp', 'email', 'system')) default 'whatsapp',
  message_preview text not null,
  sent_by text,
  status text check (status in ('sent', 'delivered', 'failed')) default 'sent',
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. TEAM CHAT & COLLABORATION MESSAGES TABLE
create table if not exists public.team_chat_messages (
  id text primary key default ('chat-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  sender_id text not null,
  sender_name text not null,
  sender_role text not null,
  sender_avatar text,
  channel text check (channel in ('hq_internal', 'branch_collab')) not null default 'hq_internal',
  branch_id text references public.branches(id) on delete set null,
  branch_name text,
  message text not null,
  tagged_user_ids text[],
  tagged_user_names text[],
  linked_request_id text references public.design_requests(id) on delete set null,
  linked_request_title text,
  media_url text,
  media_type text,
  read_by text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. ATTENDANCES TABLE (Quick Punch & Log)
create table if not exists public.attendances (
  id text primary key default ('att-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  user_id text not null,
  user_name text not null,
  date date not null,
  clock_in_time text not null,
  clock_out_time text,
  mode text check (mode in ('WFO', 'WFH', 'On-Site Visit', 'Shoot', 'Off')) not null default 'WFO',
  status text check (status in ('present', 'completed', 'late', 'absent')) default 'present',
  target_branch_id text references public.branches(id) on delete set null,
  work_log text,
  total_hours numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 18. HQ TO-DO ITEMS TABLE (Dashboard Work Log)
create table if not exists public.hq_todos (
  id text primary key default ('todo-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  user_id text,
  user_name text,
  title text not null,
  category text default 'general',
  related_request_id text,
  target_date text,
  completed boolean default false,
  completed_at text,
  included_in_work_log boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 19. SHOOT REQUESTS TABLE
create table if not exists public.shoot_requests (
  id text primary key default ('shoot-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  branch_id text not null references public.branches(id) on delete cascade,
  branch_name text not null,
  requester_id text,
  requester_name text,
  requester_role text,
  type text default 'photoshoot_visit',
  title text not null,
  preferred_date text not null,
  details text not null,
  focus_products text[],
  status text check (status in ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')) default 'pending',
  assigned_creative_id text,
  assigned_creative_name text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 20. BUDGET REQUESTS TABLE
create table if not exists public.budget_requests (
  id text primary key default ('bud-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  target_branch_id text,
  target_branch_name text,
  requester_id text,
  requester_name text,
  requester_role text,
  type text default 'meta_ads',
  title text not null,
  amount numeric not null,
  objective text,
  status text check (status in ('pending_approval', 'approved', 'rejected', 'disbursed', 'acknowledged', 'completed')) default 'pending_approval',
  approved_by text,
  disbursed_by text,
  disbursed_at text,
  transfer_proof_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 21. MEETING AGENDAS TABLE
create table if not exists public.meeting_agendas (
  id text primary key default ('meet-' || substr(md5(random()::text), 1, 8)),
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  title text not null,
  host_name text,
  date text not null,
  start_time text not null,
  end_time text not null,
  type text default 'hq_sync',
  location_or_link text not null,
  attendees text[],
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 22. SEED INITIAL PLATFORM SUPERADMIN USER
-- Login: Phone: 08159998757, Password: Media
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

-- 23. SEED INITIAL SUBSCRIPTION PLANS
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

-- 24. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
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

-- Anonymous public policy for application client
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

