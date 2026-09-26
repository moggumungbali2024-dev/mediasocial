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
  Store, 
  Building2, 
  Layers, 
  Sun, 
  Moon,
  Info
} from 'lucide-react';
import { UserRole } from '../types.ts';

export const LoginPage: React.FC = () => {
  const { 
    whitelabelConfig, 
    themeColors, 
    themeMode, 
    toggleThemeMode, 
    login, 
    users,
    activeTenantSlug,
    language,
    setLanguage,
    t
  } = usePortal();

  const [phone, setPhone] = useState(() => users[0]?.phone || '0812-9999-0001');
  const [password, setPassword] = useState('1');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (users.length > 0 && !users.some((u) => u.phone === phone)) {
      setPhone(users[0].phone);
    }
  }, [users]);

  const handleLogin = (e?: React.FormEvent, customPhone?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const targetPhone = customPhone || phone;
    const targetPass = customPass || password;

    setTimeout(() => {
      const res = login(targetPhone, targetPass);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
      }
    }, 250);
  };

  const handleQuickLogin = (uPhone: string, uPass: string = '1') => {
    setPhone(uPhone);
    setPassword(uPass);
    handleLogin(undefined, uPhone, uPass);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'platform_owner':
        return { label: 'PLATFORM OWNER', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'platform_finance':
        return { label: 'PLATFORM FINANCE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'platform_admin':
        return { label: 'PLATFORM ADMIN', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'hq_owner':
      case 'pusat_admin':
        return { label: t('role_hq_owner') || 'HQ OWNER', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'hq_leader':
        return { label: t('role_hq_leader') || 'HQ LEADER', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'hq_creative':
        return { label: t('role_hq_creative') || 'HQ CREATIVE', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'branch_owner':
        return { label: t('role_branch_owner') || 'BRANCH OWNER', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'branch_manager':
        return { label: t('role_branch_manager') || 'STORE MANAGER', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      default:
        return { label: role, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d0e12] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-['Geist',sans-serif] relative overflow-hidden selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Background Glows */}
      <div 
        style={{ background: `radial-gradient(circle at 50% 20%, ${themeColors.primary}18 0%, transparent 60%)` }}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
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
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-lg shadow-emerald-500/10"
            >
              {whitelabelConfig.brand_monogram || 'MG'}
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
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition px-2.5 py-1 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            ← mediasocial.team
          </button>

          {/* Language Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                language === 'en' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ko')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                language === 'ko' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              KO
            </button>
          </div>

          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition shadow-2xs"
            title="Toggle Mode"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Login Card & Quick Demo Selectors */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 sm:py-10 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Login Form */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="bg-white dark:bg-[#14151a]/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal Single Sign-On</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
                {t('loginTitle') || 'Sign In to Portal'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('loginSubtitle') || 'Gunakan nomor HP terdaftar. Password default adalah "1".'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('phoneNumberLabel') || 'Nomor Handphone (HP)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0812-9999-0001"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-3 text-sm text-slate-900 dark:text-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-10"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('passwordLabel') || 'Kata Sandi (Password)'}
                  </label>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Default: "1"</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-3.5 py-3 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-10 pr-10"
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
                className="w-full py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 transition hover:brightness-110 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>...</span>
                ) : (
                  <>
                    <span>{t('loginTitle') || 'Masuk ke Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{language === 'ko' ? '역할 및 지점을 변경하려면 해당 계정의 휴대폰 번호로 로그인하세요.' : 'To switch role or branch, sign in with the corresponding account phone number.'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick 1-Click Persona Test Chips (01 to 10) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#14151a]/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl dark:shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t('demoAccountsTitle') || 'Akun Mockup Pengujian (1-Click Test Login)'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ko' ? '아래 페르소나 카드를 클릭하면 휴대폰 번호가 자동 입력되고 즉시 로그인됩니다.' : 'Click any persona below to auto-fill phone number and instantly log in.'}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {users.length} Accounts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
              {users.map((u, idx) => {
                const b = getRoleBadge(u.role);
                const isSelected = phone === u.phone;
                const formattedNum = String(idx + 1).padStart(2, '0');

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u.phone, u.password || '1')}
                    className={`text-left p-3 rounded-2xl border transition flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      {formattedNum}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {u.full_name.split('(')[0].trim()}
                        </span>
                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border uppercase ${b.color}`}>
                          {b.label}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {u.job_title || u.role}
                      </div>

                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
                        {u.phone}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 z-10 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <p>{whitelabelConfig.company_legal_name} • {whitelabelConfig.brand_name} Outsource Management Portal</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-orange-500">
          <span>⚡ Powered by</span>
          <span className="text-slate-800 dark:text-white font-black">mediasocial.team</span>
        </div>
      </footer>
    </div>
  );
};
