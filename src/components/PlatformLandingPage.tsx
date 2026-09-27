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
  Zap,
  Search,
  ChevronDown,
  Play,
  Share2,
  PlusCircle,
  UserPlus,
  User,
  Store,
  Plus
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
    registerBrand,
    users,
    switchTenantBrand,
    activeTenantSlug
  } = usePortal();

  // Search & Filter State in Hero Card
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedBudget, setSelectedBudget] = useState('All Plans');

  // Login & Register Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Sign In Form State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register Brand Form State
  const [regBrandName, setRegBrandName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('Jakarta');

  // Pricing toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setLoading(true);

    setTimeout(() => {
      const res = login(loginPhone, loginPassword);
      setLoading(false);
      if (!res.success) {
        setLoginError(res.message);
        return;
      }

      setLoginSuccess(res.message);
      setTimeout(() => {
        setShowAuthModal(false);
        const loggedUser = res.user;
        if (loggedUser && (loggedUser.role === 'platform_owner' || loggedUser.role === 'platform_finance' || loggedUser.role === 'platform_admin')) {
          if (onEnterPlatformConsole) onEnterPlatformConsole();
        } else {
          if (onEnterBrandPortal) onEnterBrandPortal(activeTenantSlug || 'moggumung');
        }
      }, 400);
    }, 250);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setLoading(true);

    if (!regBrandName.trim() || !regOwnerName.trim() || !regPhone.trim()) {
      setLoginError('Nama Brand, Nama Owner, dan Nomor WhatsApp wajib diisi.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const cleanSlug = regBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const res = registerBrand({
        name: regBrandName.trim(),
        slug: cleanSlug,
        hq_owner_name: regOwnerName.trim(),
        hq_owner_phone: regPhone.trim(),
        hq_owner_email: regEmail.trim() || `${cleanSlug}@mediasocial.team`,
        password: regPassword.trim() || 'Media',
        city: regCity.trim() || 'Jakarta'
      });

      setLoading(false);
      if (!res.success) {
        setLoginError(res.message);
      } else {
        setLoginSuccess(res.message);
        setTimeout(() => {
          setShowAuthModal(false);
          if (onEnterBrandPortal) onEnterBrandPortal(cleanSlug);
        }, 500);
      }
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (platformBrands.length > 0) {
      const match = platformBrands.find(
        (b) =>
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (match && onEnterBrandPortal) {
        onEnterBrandPortal(match.slug);
        return;
      }
    }
    // Fallback to opening login
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 selection:bg-orange-500 selection:text-white font-['Geist',sans-serif] antialiased overflow-x-hidden relative">
      
      {/* Mesh grid dotted background */}
      <div className="absolute inset-0 bg-canvas-mesh pointer-events-none opacity-80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial from-blue-100/60 via-indigo-50/30 to-transparent pointer-events-none blur-3xl" />

      {/* Floating Dark Pill Capsule Navigation (The Canvas Style) */}
      <div className="sticky top-4 z-40 px-4 sm:px-6 w-full max-w-5xl mx-auto">
        <nav className="bg-[#0B0C10]/90 backdrop-blur-xl border border-white/10 rounded-full px-5 sm:px-7 py-3 shadow-2xl shadow-slate-950/20 flex items-center justify-between transition-all">
          
          {/* Brand Monogram & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/30">
              ⚡
            </div>
            <span className="font-extrabold text-base text-white tracking-tight font-['Space_Grotesk']">
              mediasocial.team
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#explore" className="hover:text-white transition-colors">Explore</a>
            <a href="#portal" className="hover:text-white transition-colors">Brand Portal</a>
            <a href="#features" className="hover:text-white transition-colors">Inspiration</a>
            <a href="#features" className="hover:text-white transition-colors">Awards 2026</a>
            <a href="#pricing" className="hover:text-white transition-colors">Paket HQ</a>
          </div>

          {/* Right Action: White Pill Login Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setAuthMode('signin');
                setShowAuthModal(true);
              }}
              className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-5 py-2 rounded-full shadow-md transition active:scale-95 cursor-pointer"
            >
              Login
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section (The Canvas Reference Style) */}
      <section className="relative pt-12 pb-10 sm:pt-20 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center z-10">
        
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 mb-6 backdrop-blur-xs">
          <span>Welcome to mediasocial.team!</span>
          <span className="text-amber-500">👋</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[1.08] font-['Space_Grotesk'] max-w-4xl mx-auto">
          Discover the world's <br />
          <span className="inline-flex items-center gap-2 align-middle">
            Top-Rated
            {/* 3 Overlapping Avatar Badges */}
            <span className="inline-flex items-center -space-x-2 bg-slate-100 border border-slate-300 rounded-full px-2 py-1 mx-1 shadow-xs align-middle">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Designer 1"
                className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-slate-200"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Designer 2"
                className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-slate-200"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Designer 3"
                className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-slate-200"
              />
            </span>
            designers here!
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          Discover exceptional work from top-tier designers, eager to bring their expertise to your next franchise project. Platform manajemen kuota desain & auto-posting multi-cabang.
        </p>

        {/* Hero CTA Button */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setAuthMode('register');
              setShowAuthModal(true);
            }}
            className="bg-black hover:bg-slate-800 text-white font-black text-sm px-8 py-3.5 rounded-full shadow-xl shadow-slate-950/15 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Get started for Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Floating Search & Filter Card (The Canvas Reference Bottom Card) */}
      <section id="explore" className="relative px-4 sm:px-6 max-w-4xl mx-auto z-20 pb-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-300/40 border border-slate-200/80 p-5 sm:p-7 backdrop-blur-md">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 mb-3 tracking-tight">
            What you are looking for?
          </h2>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search Talent, Brand or Request here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 font-medium pl-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Country / City Dropdown Pill */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-xs font-semibold text-slate-700 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
              >
                <option value="All Cities">Country / City</option>
                <option value="Bali">Bali (Seminyak & Ubud)</option>
                <option value="Jakarta">Jakarta Selatan & Barat</option>
                <option value="Bandung">Bandung (Riau)</option>
                <option value="Surabaya">Surabaya</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
            </div>

            {/* Budget / Plan Dropdown Pill */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-xs font-semibold text-slate-700 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
              >
                <option value="All Plans">Budget / Plan</option>
                <option value="Starter">Starter (1-3 Cabang)</option>
                <option value="Growth">Growth (4-10 Cabang)</option>
                <option value="Enterprise">Enterprise (10+ Cabang)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
            </div>

            {/* Action Search Pill Button */}
            <button
              type="submit"
              className="w-full sm:w-auto bg-black hover:bg-slate-800 text-white font-black text-xs px-6 py-3 rounded-full transition active:scale-95 shrink-0 cursor-pointer shadow-md"
            >
              Find Talent
            </button>
          </form>

          {/* Trending Searches Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">Trending searches:</span>
            {['Landing pages', 'F&B Promos', 'Reels & TikTok', 'Menu Design', 'Brand Identity'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchTerm(tag)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stacker-Style Feature Banner (Stacker Reference Style) */}
      <section id="features" className="px-4 sm:px-6 max-w-5xl mx-auto py-8">
        <div className="rounded-3xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          
          {/* Subtle glow accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 border border-white/30 tracking-wide uppercase">
                Custom Franchise OS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight font-['Space_Grotesk']">
                Go-to platform for effortlessly creating custom business apps
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
                MediaSocial makes it easy to build customer portals, CRMs, social auto-posting, and marketing operations for your franchise team. In minutes, not months.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-white text-blue-900 hover:bg-blue-50 font-black text-xs shadow-lg transition active:scale-95"
                >
                  Try MediaSocial for free
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs backdrop-blur-xs transition"
                >
                  Book a demo
                </button>
              </div>
            </div>

            {/* Mockup Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/40 text-slate-900 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                      MS
                    </div>
                    <span className="font-extrabold text-xs">Customer Onboarding</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">Active Brand Tenancy</span>
                    <span className="font-bold text-emerald-600">Live 100%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">Instagram & TikTok Auto-Post</span>
                    <span className="font-bold text-blue-600">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">Quota Lead Time</span>
                    <span className="font-bold text-slate-900">H+5 Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Portal Showcase Section */}
      <section id="portal" className="px-4 sm:px-6 max-w-5xl mx-auto py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Multi-Tenant Brand Portals ({platformBrands.length} Brand Aktif)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-['Space_Grotesk']">
              Brand Portals & Dedicated Workspaces
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium max-w-xl">
              Pilih brand di bawah untuk langsung membuka workspace portal manajemen kuota & konten sosial media.
            </p>
          </div>

          <button
            onClick={() => {
              setAuthMode('register');
              setShowAuthModal(true);
            }}
            className="px-5 py-2.5 rounded-full bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Daftar Brand Baru</span>
          </button>
        </div>

        {platformBrands.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center font-bold text-lg mb-3">
              🏢
            </div>
            <h3 className="font-bold text-sm text-slate-900">Belum ada Brand yang terdaftar</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Jadilah brand pertama yang bergabung di platform mediasocial.team.
            </p>
            <button
              onClick={() => {
                setAuthMode('register');
                setShowAuthModal(true);
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-black text-white font-bold text-xs transition active:scale-95 cursor-pointer"
            >
              Daftarkan Brand Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformBrands.map((brand) => (
              <div
                key={brand.id || brand.slug}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Brand color strip accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                />

                <div className="space-y-4 pt-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-xs"
                        />
                      ) : (
                        <div
                          style={{
                            backgroundColor: brand.primary_color || '#FF5B14',
                            color: '#FFFFFF'
                          }}
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-md shadow-orange-500/10"
                        >
                          {brand.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-black transition-colors font-['Space_Grotesk'] leading-tight">
                          {brand.name}
                        </h3>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          /{brand.slug}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {brand.subscription_plan_id || 'GROWTH'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {brand.tagline || 'Social Media & Creative Quota Portal'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{brand.hq_owner_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span>{brand.branches_count || 1} Cabang</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (onEnterBrandPortal) {
                        onEnterBrandPortal(brand.slug);
                      }
                    }}
                    style={{
                      backgroundColor: brand.primary_color || '#000000',
                      color: '#FFFFFF'
                    }}
                    className="w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Masuk Portal Brand</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Subscription Pricing Plans */}
      <section id="pricing" className="px-4 sm:px-6 max-w-5xl mx-auto py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-['Space_Grotesk']">
            Paket Langganan Brand HQ
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Pilih paket yang sesuai dengan jumlah cabang dan kebutuhan kuota tim kreatif Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between ${
                plan.is_popular
                  ? 'bg-white border-orange-500 shadow-xl shadow-orange-500/10 ring-2 ring-orange-500/20 relative'
                  : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Paling Populer
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-950 font-['Space_Grotesk']">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-950">
                      Rp {(plan.monthly_price / 1000000).toFixed(1)} jt
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/ bulan</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Maksimal <strong>{plan.max_branches} Cabang</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>{plan.max_design_requests_per_branch} Desain</strong> / Cabang / Bln</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>{plan.max_promos_per_branch} Promo Aktif</strong> / Cabang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Auto-Posting Instagram & TikTok</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className={`w-full py-3 rounded-full font-black text-xs transition active:scale-95 cursor-pointer ${
                    plan.is_popular
                      ? 'bg-black hover:bg-slate-800 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  Pilih Paket {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-8 px-4 sm:px-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-slate-900">
            <span>⚡ mediasocial.team</span>
          </div>
          <p>© 2026 mediasocial.team • All Rights Reserved. Multi-Tenant Social & Creative Management Platform.</p>
        </div>
      </footer>

      {/* ===================== MODAL: SIGN IN & REGISTER BRAND ===================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 my-8 animate-in zoom-in-95 duration-150">
            
            {/* Header Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setLoginError('');
                  setLoginSuccess('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setLoginError('');
                  setLoginSuccess('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar HQ Baru</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-xl font-black text-slate-950 font-['Space_Grotesk']">
                  {authMode === 'signin' ? 'Masuk ke Portal' : 'Daftar Brand HQ Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  {authMode === 'signin'
                    ? 'Gunakan nomor handphone yang terdaftar.'
                    : 'Buat workspace brand baru untuk franchise Anda.'}
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="font-bold">⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>{loginSuccess}</span>
              </div>
            )}

            {authMode === 'signin' ? (
              <form onSubmit={handleManualLogin} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Handphone (HP / WhatsApp)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-black pl-10"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-black pl-10 pr-10"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-black hover:bg-slate-800 text-white shadow-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <span>Memproses...</span> : <><span>Masuk ke Portal</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Brand HQ *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi Kenangan"
                    value={regBrandName}
                    onChange={(e) => setRegBrandName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap HQ Owner *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Pemilik Brand"
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Owner (Login HP) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Brand HQ</label>
                  <input
                    type="email"
                    placeholder="hq@brandanda.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kota HQ</label>
                    <input
                      type="text"
                      placeholder="Jakarta / Bali"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Media"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-black text-xs bg-black hover:bg-slate-800 text-white shadow-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <span>Mendaftarkan...</span> : <><span>Daftarkan Brand HQ & Masuk</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
