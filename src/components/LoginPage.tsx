import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Phone, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Building2, 
  Sun, 
  Moon,
  Info,
  UserPlus,
  LogIn,
  MapPin,
  Mail,
  User
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { 
    whitelabelConfig, 
    themeColors, 
    themeMode, 
    toggleThemeMode, 
    login, 
    registerBrand,
    users,
    language,
    setLanguage,
    t
  } = usePortal();

  // Mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Sign In Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Register HQ Brand Form State
  const [regBrandName, setRegBrandName] = useState('');
  const [regMonogram, setRegMonogram] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPrimaryColor, setRegPrimaryColor] = useState('#FF5B14');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(phone, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
      }
    }, 200);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!regBrandName.trim() || !regOwnerName.trim() || !regPhone.trim()) {
      setErrorMsg('Nama Brand, Nama Owner, dan Nomor WhatsApp wajib diisi.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const res = registerBrand({
        name: regBrandName.trim(),
        slug: regBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        hq_owner_name: regOwnerName.trim(),
        hq_owner_phone: regPhone.trim(),
        hq_owner_email: regEmail.trim() || `${regBrandName.toLowerCase().replace(/[^a-z0-9]/g, '')}@mediasocial.team`,
        password: regPassword.trim() || 'Media',
        city: regCity.trim() || 'Jakarta',
        primary_color: regPrimaryColor
      });

      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d0e12] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-['Geist',sans-serif] relative overflow-hidden selection:bg-orange-500 selection:text-white transition-colors duration-200">
      {/* Background Glows */}
      <div 
        style={{ background: `radial-gradient(circle at 50% 15%, ${themeColors.primary}18 0%, transparent 60%)` }}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          {whitelabelConfig.brand_logo_url ? (
            <img
              src={whitelabelConfig.brand_logo_url}
              alt="Logo"
              className="w-10 h-10 object-contain rounded-2xl bg-white p-1 shadow-lg"
            />
          ) : (
            <div
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-lg shadow-orange-500/20"
            >
              {whitelabelConfig.brand_monogram || 'MS'}
            </div>
          )}
          <div>
            <div className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk'] leading-tight">
              {whitelabelConfig.brand_name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
              {whitelabelConfig.brand_subtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Back to platform main page link */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history) {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition px-3 py-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            ← mediasocial.team
          </button>

          {/* Language Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                language === 'en' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ko')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                language === 'ko' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              KO
            </button>
          </div>

          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition shadow-2xs"
            title="Toggle Theme"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Centered Login / Register Card */}
      <main className="max-w-md w-full mx-auto px-4 py-8 sm:py-12 z-10">
        <div className="bg-white dark:bg-[#14151a]/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Header Tab Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                authMode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar HQ Baru</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{authMode === 'signin' ? 'Portal Single Sign-On' : 'HQ Brand Onboarding'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
              {authMode === 'signin' ? 'Masuk ke Portal' : 'Daftar Brand HQ Baru'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {authMode === 'signin' 
                ? 'Gunakan nomor handphone terdaftar untuk masuk ke dashboard brand atau platform.' 
                : 'Buat workspace brand baru untuk mengelola request desain dan cabang franchise.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Sign In Form */}
          {authMode === 'signin' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nomor Handphone (WhatsApp)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-3 text-sm text-slate-900 dark:text-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-3 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10 pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                className="w-full py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 transition hover:brightness-110 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span>Masuk ke Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* 2. Register HQ Brand Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Brand HQ *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Contoh: Kopi Kenangan"
                    value={regBrandName}
                    onChange={(e) => {
                      setRegBrandName(e.target.value);
                      if (!regMonogram) {
                        setRegMonogram(e.target.value.substring(0, 2).toUpperCase());
                      }
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Monogram / Inisial
                  </label>
                  <input
                    type="text"
                    placeholder="KK"
                    maxLength={4}
                    value={regMonogram}
                    onChange={(e) => setRegMonogram(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kota Pusat HQ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Jakarta / Bali"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 pl-8"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Lengkap HQ Owner *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nama Lengkap Pemilik Brand"
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nomor WhatsApp Owner (Login HP) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Brand HQ
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="hq@brandanda.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Buat Kata Sandi (Password) *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Minimal 4 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10 pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/20 transition flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Mendaftarkan Brand...</span>
                ) : (
                  <>
                    <span>Daftarkan Brand HQ & Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {authMode === 'signin'
                ? 'Cabang baru diundang langsung oleh HQ Owner dari dashboard pusat.'
                : 'Setelah pendaftaran, Anda langsung memiliki akses penuh sebagai HQ Owner.'}
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-slate-400 dark:text-slate-500 max-w-5xl mx-auto w-full z-10">
        © 2026 mediasocial.team • Cloud Multi-Tenant Social & Creative Management Platform
      </footer>
    </div>
  );
};
