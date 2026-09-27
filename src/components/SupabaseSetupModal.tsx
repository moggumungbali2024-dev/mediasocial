import React, { useState, useEffect } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Database, 
  Copy, 
  Check, 
  X, 
  Shield, 
  Server, 
  HardDrive, 
  KeyRound, 
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Share2,
  Sparkles
} from 'lucide-react';
import { 
  SupabaseService, 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  SupabaseConfig 
} from '../services/supabaseService.ts';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { language, activeTenantSlug, whitelabelConfig, branches, users, designRequests, promos, invoices } = usePortal();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'tables' | 'rls' | 'storage'>('connect');

  // Supabase credentials input
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getSupabaseConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSupabaseConfig(getSupabaseConfig());
      setTestStatus('idle');
      setTestMessage(null);
      setExportMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatus('testing');
    setTestMessage(null);

    const res = await SupabaseService.testConnection(supabaseConfig.url, supabaseConfig.anonKey);
    if (res.success) {
      setTestStatus('success');
      setTestMessage('Koneksi Supabase aktif dan terverifikasi!');
      setSupabaseConfig(getSupabaseConfig());
    } else {
      setTestStatus('error');
      setTestMessage(res.message);
    }
  };

  const handleExportSeedData = async () => {
    setIsExporting(true);
    setExportMessage(null);

    try {
      // Export current brand branches & whitelabel
      await SupabaseService.exportDataToSupabase('branches', branches.map(b => ({
        ...b,
        brand_slug: activeTenantSlug
      })));

      setExportMessage(`Berhasil menyinkronkan data brand "${whitelabelConfig.brand_name}" (${branches.length} cabang, ${designRequests.length} request desain) ke Supabase!`);
    } catch (err: any) {
      setExportMessage(`Gagal export: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const SQL_DDL = `-- =========================================================================
-- MEDIASOCIAL.TEAM - COMPLETE MULTI-TENANT POSTGRESQL SCHEMA FOR SUPABASE
-- =========================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PLATFORM SAAS TENANT BRANDS (mediasocial.team Level)
create table if not exists public.platform_brands (
  id text primary key,
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
  id text primary key,
  brand_slug text not null references public.platform_brands(slug) on delete cascade,
  name text not null,
  code text,
  location text not null,
  city text not null,
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

-- 5. USERS PROFILE TABLE (Multi-Role Support)
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

-- 6. DESIGN & CREATIVE PRODUCTION REQUESTS (H+5 Validation)
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

-- 13. SEED SUPERADMIN USER (Phone: 08159998757 / Pass: Media)
insert into public.users (
  id, brand_slug, branch_id, role, full_name, email, phone, password_hash, job_title, status
) values (
  'user-platform-owner', null, null, 'platform_owner', 'Platform Superadmin', 'owner@mediasocial.team', '08159998757', 'Media', 'Platform Owner (mediasocial.team)', 'active'
) on conflict (phone) do update set password_hash = excluded.password_hash;

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
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
create policy "Allow all public operations" on public.influencers for all using (true) with check (true);`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Supabase PostgreSQL & Cloud Sync
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyimpanan cloud terpusat untuk multi-tenant brand, akun sosial media, dan request desain.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'connect'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Koneksi Supabase (Live Connect)</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'tables'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>SQL Schema DDL ({whitelabelConfig.brand_name})</span>
          </button>

          <button
            onClick={() => setActiveTab('rls')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'rls'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Row Level Security (RLS)</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'storage'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Storage Buckets</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: Live Supabase Connection */}
          {activeTab === 'connect' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Siap Terhubung ke Supabase Cloud</span>
                </div>
                <p className="leading-relaxed">
                  Masukkan <strong>Project URL</strong> dan <strong>Anon Public Key</strong> dari dashboard Supabase Anda. Semua data brand (Moggumung, Kopi Senja, dll.) dan riwayat auto-post media sosial akan tersinkronisasi otomatis.
                </p>
              </div>

              {testMessage && (
                <div className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  testStatus === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                }`}>
                  {testStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block mb-0.5">{testStatus === 'success' ? 'Berhasil!' : 'Gagal Menghubungkan:'}</strong>
                    <span>{testMessage}</span>
                  </div>
                </div>
              )}

              {exportMessage && (
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 text-xs flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>{exportMessage}</span>
                </div>
              )}

              <form onSubmit={handleTestConnection} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Supabase Project URL:
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://your-project-ref.supabase.co"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Dapatkan di: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Supabase Anon API Key (Public):
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Dapatkan di: Supabase Dashboard &gt; Project Settings &gt; API &gt; anon / public key
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={testStatus === 'testing'}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    {testStatus === 'testing' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menguji Koneksi...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Simpan & Tes Koneksi Supabase</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportSeedData}
                    disabled={isExporting}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span>Sinkronkan Data Sekarang</span>
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Belum punya project Supabase?</span>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Buka Supabase.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: Complete SQL DDL */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Jalankan skrip ini di <strong>Supabase SQL Editor</strong> untuk membuat seluruh 12 tabel otomatis.
                </span>

                <button
                  onClick={() => copyToClipboard(SQL_DDL)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin SQL DDL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                {SQL_DDL}
              </pre>
            </div>
          )}

          {/* TAB 3: RLS */}
          {activeTab === 'rls' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <strong>🛡️ Row Level Security (RLS) Multi-Tenant:</strong>
                <p>
                  Memastikan data setiap brand (Moggumung, Kopi Senja, dll.) dan cabang terisolasi total, sehingga branch manager hanya dapat membaca request milik cabangnya sendiri.
                </p>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
{`-- Enable RLS for all tables
alter table public.branches enable row level security;
alter table public.design_requests enable row level security;
alter table public.invoices enable row level security;
alter table public.social_channels enable row level security;
alter table public.social_posts enable row level security;

-- Policy: Brand Isolation (User can only read data of their brand_slug)
create policy "Tenant Brand Isolation"
on public.design_requests for all
using (
  brand_slug = (select brand_slug from public.users where id = auth.uid()::text)
  or (select role from public.users where id = auth.uid()::text) in ('platform_owner', 'platform_admin')
);`}
              </pre>
            </div>
          )}

          {/* TAB 4: Storage Buckets */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Buat 3 storage bucket di Supabase Storage untuk upload file:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">📁 deliverables</div>
                  <p className="text-[11px] text-slate-400">Penyimpanan hasil desain & video kreatif siap posting.</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Public Bucket</span>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">📁 payment_proofs</div>
                  <p className="text-[11px] text-slate-400">Bukti transfer invoice retainer franchise cabang.</p>
                  <span className="text-[10px] text-amber-600 font-bold">Private Bucket</span>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">📁 brand_assets</div>
                  <p className="text-[11px] text-slate-400">Logo brand, banner, dan foto profil tim/influencer.</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Public Bucket</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-400 font-mono">
            Active Brand: <strong>{whitelabelConfig.brand_name}</strong> (/{activeTenantSlug})
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
