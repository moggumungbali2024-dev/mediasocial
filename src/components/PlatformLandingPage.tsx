import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Sparkles,
  Building2,
  Layers,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Calendar,
  CreditCard,
  MessageSquare,
  Users,
  ExternalLink,
  ChevronRight,
  LogIn,
  Check,
  Lock,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Star,
  Globe,
  Award,
  Zap
} from 'lucide-react';

interface PlatformLandingPageProps {
  onEnterPlatformConsole?: () => void;
  onEnterBrandPortal?: (brandSlug: string) => void;
}

export const PlatformLandingPage: React.FC<PlatformLandingPageProps> = ({
  onEnterPlatformConsole,
  onEnterBrandPortal
}) => {
  const {
    platformBrands,
    subscriptionPlans,
    totalPlatformMRR,
    login,
    users,
    switchUser,
    jumpToBrandAsHQOwner,
    switchTenantBrand,
    activeRole,
    currentUser,
    isAuthenticated,
    isPlatformUser
  } = usePortal();

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('1');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Billing Cycle Switcher for Pricing
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleQuickLogin = (userId: string, targetSlug?: string) => {
    switchUser(userId);
    if (targetSlug) {
      jumpToBrandAsHQOwner(targetSlug);
      if (onEnterBrandPortal) onEnterBrandPortal(targetSlug);
    } else {
      if (onEnterPlatformConsole) onEnterPlatformConsole();
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const res = login(loginPhone, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
      return;
    }

    setLoginSuccess(res.message);
    setTimeout(() => {
      setShowLoginModal(false);
      const loggedUser = res.user;
      if (loggedUser && (loggedUser.role === 'platform_owner' || loggedUser.role === 'platform_finance' || loggedUser.role === 'platform_admin')) {
        if (onEnterPlatformConsole) onEnterPlatformConsole();
      } else {
        if (onEnterBrandPortal) onEnterBrandPortal('moggumung');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25 text-white font-black text-xl">
              ⚡
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                mediasocial.team
              </span>
              <span className="block text-[10px] text-orange-400 font-bold tracking-wider uppercase">
                Multi-Branch Creative OS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#brands" className="hover:text-orange-400 transition-colors">
              Brand Directory
            </a>
            <a href="#features" className="hover:text-orange-400 transition-colors">
              Fitur Multi-Cabang
            </a>
            <a href="#pricing" className="hover:text-orange-400 transition-colors">
              Paket Subscription
            </a>
            <a href="#demo" className="hover:text-orange-400 transition-colors">
              Live Demo
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Masuk Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 lg:px-8 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Platform Operasional Kreatif & Promosi Franchise F&B / Retail</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Satu Sistem Terpadu untuk <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">
              Puluhan Cabang & Tim Kreatif HQ
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Standarisasi permintaan desain, kalender promo outlet, manajemen budget Meta Ads, CRM influencer & voucher ROI, hingga auto-invoicing bulanan di bawah subdomain brand Anda sendiri.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-7 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-orange-500/30 transition-all hover:scale-105"
            >
              <span>Mulai Masuk Sebagai HQ Owner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#brands"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-bold text-sm transition-all"
            >
              Jelajahi Brand Directory
            </a>
          </div>

          {/* Social Proof */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 border-t border-slate-800/80 mt-12">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Subdomain (<code>mediasocial.team/slug</code>)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Hierarki Super-Admin: Owner, Finance, Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp & Email Reminder Otomatis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Directory Showcase Section */}
      <section id="brands" className="py-20 bg-slate-900/60 border-y border-slate-800/80 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block text-xs font-bold text-orange-400 uppercase tracking-wider">
              Tenant Network
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Brand-Brand Terkemuka di mediasocial.team
            </h2>
            <p className="text-sm text-slate-400">
              Setiap brand memiliki workspace terisolasi, tema warna kustom, dan URL portal cabang masing-masing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {platformBrands.map((brand) => (
              <div
                key={brand.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 group shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-lg"
                    style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                  >
                    {brand.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      brand.subscription_status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : brand.subscription_status === 'expiring_soon'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {brand.subscription_status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors">
                    {brand.name}
                  </h3>
                  <div className="text-xs text-orange-400 font-mono font-medium">
                    mediasocial.team/{brand.slug}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {brand.tagline}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl text-[11px] text-slate-400">
                  <div>
                    Cabang: <strong className="text-slate-200">{brand.branches_count} Outlet</strong>
                  </div>
                  <div>
                    Paket: <strong className="text-orange-400 uppercase">{brand.subscription_plan_id}</strong>
                  </div>
                  <div className="col-span-2 truncate">
                    HQ Owner: <strong className="text-slate-200">{brand.hq_owner_name}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    switchTenantBrand(brand.slug);
                    if (onEnterBrandPortal) onEnterBrandPortal(brand.slug);
                  }}
                  className="w-full py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Buka Portal {brand.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block text-xs font-bold text-orange-400 uppercase tracking-wider">
              Core Capabilities
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Segala Kebutuhan Operasional Franchise Dalam 1 Atap
            </h2>
            <p className="text-sm text-slate-400">
              Menghubungkan Branch Store Manager, Franchisee Owner, HQ Creative Team, hingga Platform Super-Admin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Quota & Anti-Beban Request Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kunci batas request per cabang bulanan dengan validasi lead-time otomatis (H+5), pencegahan brief dadakan, serta approval berjenjang HQ Creative Lead.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Influencer CRM & Voucher Sales ROI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Database food vloggers & reviewer lokal, auto-generate profil Instagram/TikTok, serta simulator kasir untuk menghitung konversi omset dari kode voucher tiap influencer.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Auto Invoicing & Retainer Billing
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate invoice retainer cabang otomatis setiap tanggal 1, penagihan photoshoot on-site, serta deposit budget Meta Ads yang terisolasi per outlet.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Real-Time Collab Chat & @Mentions
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saluran diskusi internal tim HQ dan kolaborasi cabang dengan notifikasi mention personal, kompresi otomatis foto/video menu, dan link tersemat ke request desain.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Photoshoot Scheduler & Work Log Absensi
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kalender slot konten exposure, jadwal kunjungan fotografer ke outlet, absensi WFO/WFH tim kreatif dengan auto-generate laporan WhatsApp saat clock-out.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                SaaS Master Console (3 Super-User)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform Owner (atur paket & payout wallet pool), Platform Finance (pantau expiring & WA reminder tagihan), dan Platform Admin (onboard & invite brand baru).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-900/60 border-t border-slate-800/80 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-block text-xs font-bold text-orange-400 uppercase tracking-wider">
              Subscription Pricing
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Investasi Terukur Sesuai Skala Brand Anda
            </h2>
            <p className="text-sm text-slate-400">
              Pilih paket yang sesuai dengan jumlah cabang dan intensitas produksi visual bisnis Anda.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 mt-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Tahunan</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] rounded">Hemat 2 Bln</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {subscriptionPlans.map((plan) => {
              const priceDisplay =
                billingCycle === 'monthly'
                  ? `Rp ${(plan.monthly_price / 1000000).toFixed(2)}M`
                  : `Rp ${(plan.annual_price / 1000000).toFixed(1)}M`;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all ${
                    plan.is_popular
                      ? 'bg-slate-900 border-2 border-orange-500 shadow-2xl shadow-orange-500/15 relative'
                      : 'bg-slate-900/80 border border-slate-800'
                  }`}
                >
                  <div>
                    {plan.is_popular && (
                      <span className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider mb-4">
                        Pilihan Utama
                      </span>
                    )}

                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-5">{plan.description}</p>

                    <div className="mb-6">
                      <div className="text-3xl font-black text-white">
                        {priceDisplay}
                        <span className="text-xs text-slate-400 font-normal">
                          {billingCycle === 'monthly' ? ' /bulan' : ' /tahun'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-800 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Hingga <strong>{plan.max_branches} Cabang</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span><strong>{plan.max_design_requests_per_branch} Desain</strong> /cabang /bln</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span><strong>{plan.max_promos_per_branch} Promo</strong> /cabang /bln</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        {plan.includes_influencer_crm ? (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 text-slate-600 text-center font-bold flex-shrink-0">✕</span>
                        )}
                        <span className={plan.includes_influencer_crm ? 'text-slate-300' : 'text-slate-500'}>
                          Influencer CRM & ROI Voucher
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Auto Retainer Invoicing</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        {plan.includes_dedicated_support ? (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 text-slate-600 text-center font-bold flex-shrink-0">✕</span>
                        )}
                        <span className={plan.includes_dedicated_support ? 'text-slate-300' : 'text-slate-500'}>
                          Dedicated Support & SLA Khusus
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowLoginModal(true)}
                    className={`w-full py-3 rounded-xl font-bold text-xs mt-8 transition-all ${
                      plan.is_popular
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    Pilih {plan.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Quick Demo Section */}
      <section id="demo" className="py-20 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-8 lg:p-12 space-y-8 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" /> Instant Role Masquerade
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Coba Masuk ke Role Apapun dengan 1-Klik
            </h2>
            <p className="text-xs text-slate-400">
              Pilih akun super-admin platform atau brand HQ owner untuk langsung menjelajahi tampilan portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
            {/* Super Admin 1: Owner */}
            <button
              onClick={() => handleQuickLogin('user-platform-owner')}
              className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 transition-all group"
            >
              <div className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1">
                Platform Owner
              </div>
              <div className="font-bold text-white text-sm group-hover:text-orange-400">
                Alexandre Tan
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Akses semua brand, atur paket harga & tarik saldo wallet pool.
              </p>
            </button>

            {/* Super Admin 2: Finance */}
            <button
              onClick={() => handleQuickLogin('user-platform-finance')}
              className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 transition-all group"
            >
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">
                Platform Finance
              </div>
              <div className="font-bold text-white text-sm group-hover:text-amber-400">
                Clara Wijaya
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pantau expiring subscriptions, kirim WA reminder & cek MRR.
              </p>
            </button>

            {/* Super Admin 3: Admin */}
            <button
              onClick={() => handleQuickLogin('user-platform-admin')}
              className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 transition-all group"
            >
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">
                Platform Admin
              </div>
              <div className="font-bold text-white text-sm group-hover:text-blue-400">
                Kevin Pratama
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Daftar brand directory, undang tenant baru & kelola subdomain.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">mediasocial.team</span>
            <span>• Multi-Branch Creative & Social Media OS</span>
          </div>
          <div>
            &copy; 2026 mediasocial.team. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ===================== UNIFIED LOGIN MODAL ===================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-white text-base">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Masuk ke mediasocial.team</h3>
                  <p className="text-[11px] text-slate-400">Portal SaaS & Multi-Brand HQ</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {loginError}
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                {loginSuccess}
              </div>
            )}

            {/* 1. Brand Portal Selectors */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Pilih Brand Portal:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {platformBrands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      switchTenantBrand(brand.slug);
                      if (onEnterBrandPortal) onEnterBrandPortal(brand.slug);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-orange-500/20 text-slate-200 hover:text-orange-400 border border-slate-700 font-bold text-left transition-all flex items-center gap-2"
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
                      style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                    >
                      {brand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="text-xs truncate">{brand.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">/{brand.slug}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Super Admin Masquerade */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Atau Masuk Super-Admin Platform:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    handleQuickLogin('user-platform-owner');
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-orange-500/20 text-slate-200 hover:text-orange-400 border border-slate-700 text-center font-bold transition-all text-[11px]"
                >
                  👑 Owner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    handleQuickLogin('user-platform-finance');
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-400 border border-slate-700 text-center font-bold transition-all text-[11px]"
                >
                  💰 Finance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    handleQuickLogin('user-platform-admin');
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-blue-500/20 text-slate-200 hover:text-blue-400 border border-slate-700 text-center font-bold transition-all text-[11px]"
                >
                  🛠️ Admin
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                atau login nomor HP
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nomor WhatsApp Terdaftar
                </label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                  <Phone className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    required
                    placeholder="0811-0000-0001 atau 0812-9999-0001"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kata Sandi (Default: 1)
                </label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                  <KeyRound className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all mt-2"
              >
                <LogIn className="w-4 h-4" />
                Masuk ke Akun
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
