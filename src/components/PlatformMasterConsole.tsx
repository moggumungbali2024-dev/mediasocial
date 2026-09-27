import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  ShieldCheck,
  Building2,
  CreditCard,
  Wallet,
  Send,
  PlusCircle,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Users,
  Smartphone,
  MessageSquare,
  Edit3,
  Trash2,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Building,
  Check,
  X,
  Calendar,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { PlatformBrandTenant, BrandSubscriptionPlan } from '../types.ts';

export const PlatformMasterConsole: React.FC = () => {
  const {
    currentUser,
    activeRole,
    isPlatformOwner,
    isPlatformFinance,
    isPlatformAdmin,
    platformBrands,
    subscriptionPlans,
    platformWithdrawals,
    subscriptionReminders,
    platformWalletBalance,
    totalPlatformMRR,
    totalPlatformARR,
    addPlatformBrand,
    updatePlatformBrand,
    deletePlatformBrand,
    updateSubscriptionPlan,
    requestPlatformWithdrawal,
    updateWithdrawalStatus,
    sendSubscriptionReminder,
    jumpToBrandAsHQOwner,
    switchTenantBrand,
    platformUsers,
    addPlatformUser,
    updatePlatformUser,
    changePassword,
    themeMode
  } = usePortal();

  // Active Tab
  type PlatformTab = 'overview' | 'brands' | 'plans' | 'wallet' | 'reminders' | 'users';
  const [activeTab, setActiveTab] = useState<PlatformTab>(() => {
    if (isPlatformFinance && !isPlatformOwner) return 'reminders';
    if (isPlatformAdmin && !isPlatformOwner) return 'brands';
    return 'overview';
  });

  // Filters & Search
  const [searchBrand, setSearchBrand] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'expired'>('all');

  // Modal States
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState<BrandSubscriptionPlan | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New Platform User State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Media');
  const [newUserRole, setNewUserRole] = useState<'platform_admin' | 'platform_finance'>('platform_admin');
  const [newUserJobTitle, setNewUserJobTitle] = useState('');
  const [userFormMsg, setUserFormMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Superadmin Password Change State
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // New Brand Form State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandSlug, setNewBrandSlug] = useState('');
  const [newBrandTagline, setNewBrandTagline] = useState('');
  const [newBrandColor, setNewBrandColor] = useState('#FF5B14');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newPlanId, setNewPlanId] = useState('growth');
  const [newBranchesCount, setNewBranchesCount] = useState(3);
  const [newMonthlyFee, setNewMonthlyFee] = useState(4890000);
  const [newInitialDeposit, setNewInitialDeposit] = useState(5000000);
  const [formError, setFormError] = useState('');

  // Withdrawal Form State
  const [wdAmount, setWdAmount] = useState('');
  const [wdBank, setWdBank] = useState('Bank Central Asia (BCA)');
  const [wdAccNo, setWdAccNo] = useState('8830-1928-11');
  const [wdAccHolder, setWdAccHolder] = useState('Alexandre Tan');
  const [wdNotes, setWdNotes] = useState('');
  const [wdError, setWdError] = useState('');

  // Plan Edit State
  const [editMonthlyPrice, setEditMonthlyPrice] = useState(0);
  const [editMaxBranches, setEditMaxBranches] = useState(10);
  const [editMaxDesigns, setEditMaxDesigns] = useState(18);
  const [editMaxPromos, setEditMaxPromos] = useState(6);

  // Filtered Brands
  const filteredBrands = platformBrands.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(searchBrand.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchBrand.toLowerCase()) ||
      b.hq_owner_name.toLowerCase().includes(searchBrand.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.subscription_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const expiringBrands = platformBrands.filter(
    (b) => b.subscription_status === 'expiring_soon' || b.subscription_status === 'expired'
  );

  const handleOpenEditPlan = (plan: BrandSubscriptionPlan) => {
    setShowEditPlanModal(plan);
    setEditMonthlyPrice(plan.monthly_price);
    setEditMaxBranches(plan.max_branches);
    setEditMaxDesigns(plan.max_design_requests_per_branch);
    setEditMaxPromos(plan.max_promos_per_branch);
  };

  const handleSavePlan = () => {
    if (!showEditPlanModal) return;
    updateSubscriptionPlan(showEditPlanModal.id, {
      monthly_price: editMonthlyPrice,
      annual_price: editMonthlyPrice * 10,
      max_branches: editMaxBranches,
      max_design_requests_per_branch: editMaxDesigns,
      max_promos_per_branch: editMaxPromos
    });
    setShowEditPlanModal(null);
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName || !newOwnerName || !newOwnerPhone) {
      setFormError('Nama Brand, Nama HQ Owner, dan Nomor WhatsApp wajib diisi.');
      return;
    }

    const calculatedFee =
      newPlanId === 'starter' ? 2490000 : newPlanId === 'growth' ? 4890000 : 8990000;

    const res = addPlatformBrand({
      name: newBrandName,
      slug: newBrandSlug || newBrandName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      tagline: newBrandTagline || 'Authentic Food & Lifestyle Chain',
      primary_color: newBrandColor,
      hq_owner_name: newOwnerName,
      hq_owner_email: newOwnerEmail || `${newBrandSlug || 'brand'}@mediasocial.team`,
      hq_owner_phone: newOwnerPhone,
      subscription_plan_id: newPlanId,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString().split('T')[0],
      subscription_end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      monthly_fee: newMonthlyFee || calculatedFee,
      branches_count: Number(newBranchesCount) || 1,
      is_verified: true,
      wallet_balance: Number(newInitialDeposit) || 0
    });

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setShowAddBrandModal(false);
    setNewBrandName('');
    setNewBrandSlug('');
    setNewBrandTagline('');
    setNewOwnerName('');
    setNewOwnerEmail('');
    setNewOwnerPhone('');
    setFormError('');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(wdAmount);
    if (!amountNum || amountNum <= 0) {
      setWdError('Masukkan nominal penarikan yang valid.');
      return;
    }
    const res = requestPlatformWithdrawal(amountNum, wdBank, wdAccNo, wdAccHolder, wdNotes);
    if (!res.success) {
      setWdError(res.message);
      return;
    }
    setShowWithdrawModal(false);
    setWdAmount('');
    setWdNotes('');
    setWdError('');
  };

  const handleTriggerReminder = (brand: PlatformBrandTenant) => {
    const res = sendSubscriptionReminder(brand.id, 'whatsapp');
    if (res.waUrl) {
      window.open(res.waUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-canvas-mesh text-slate-900 dark:text-slate-100 pb-20 font-['Space_Grotesk',sans-serif]">
      {/* Top Floating / Glassmorphism Platform Header */}
      <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#121316]/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  mediasocial.team
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                  Platform Console
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <strong className="text-slate-800 dark:text-slate-200">{currentUser.full_name}</strong> (
                <span className="text-orange-600 dark:text-orange-400 capitalize">{activeRole.replace('_', ' ')}</span>)
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
              <Building2 className="w-4 h-4 text-orange-500" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Brands</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">{platformBrands.length} Tenants</div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Platform MRR</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">Rp {(totalPlatformMRR / 1000000).toFixed(1)}M/bln</div>
              </div>
            </div>

            {isPlatformOwner && (
              <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
                <Wallet className="w-4 h-4 text-amber-500" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tarik Saldo Pool</div>
                  <div className="text-sm font-black text-amber-600 dark:text-amber-400">Rp {(platformWalletBalance / 1000000).toFixed(1)}M</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/70 dark:bg-[#0e1015]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Ringkasan Platform & MRR
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'brands'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Daftar Brand & Tenant ({platformBrands.length})
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'reminders'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Reminder Jatuh Tempo
            {expiringBrands.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                {expiringBrands.length}
              </span>
            )}
          </button>

          {isPlatformOwner && (
            <>
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'plans'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Paket Subscription ({subscriptionPlans.length})
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Wallet & Tarik Dana
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Tim Platform & Akun ({platformUsers?.length || 1})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top SaaS Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-[#121316] text-white p-6 lg:p-8 shadow-xl border border-white/10">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-orange-400 text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> mediasocial.team Multi-Tenant Platform
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
                    Master Console Operasional & Subscription
                  </h1>
                  <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                    Kelola ekosistem multi-brand, alokasi kuota per cabang, pemantauan masa aktif langganan,
                    serta disbursement saldo pool platform secara terpusat.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {(isPlatformOwner || isPlatformAdmin) && (
                    <button
                      onClick={() => setShowAddBrandModal(true)}
                      className="px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Onboard Brand Baru
                    </button>
                  )}
                  {isPlatformOwner && (
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-amber-300 border border-white/15 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Tarik Saldo Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Financial & Performance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total MRR */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Monthly Recurring (MRR)</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Rp {totalPlatformMRR.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2 font-medium">
                  <span>+{platformBrands.filter((b) => b.subscription_status === 'active').length} Brand Aktif</span>
                  <span className="text-slate-400">• ARR: Rp {(totalPlatformARR / 1000000).toFixed(0)}M</span>
                </div>
              </div>

              {/* Card 2: Wallet Pool Available */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Saldo Wallet Pool</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  Rp {platformWalletBalance.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Siap ditarik / payout via Bank Transfer
                </div>
              </div>

              {/* Card 3: Total Branches Managed */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Jaringan Cabang Brand</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {platformBrands.reduce((sum, b) => sum + b.branches_count, 0)} Cabang
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Tersebar di {platformBrands.length} Brand F&B & Retail
                </div>
              </div>

              {/* Card 4: Action Required / Expiring */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Status Renewal</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                  {expiringBrands.length} Butuh Follow-up
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {expiringBrands.filter((b) => b.subscription_status === 'expiring_soon').length} expiring soon,{' '}
                  {expiringBrands.filter((b) => b.subscription_status === 'expired').length} expired
                </div>
              </div>
            </div>

            {/* Quick Actions & Brand Live Directory Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Brand Directory Quick Access */}
              <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      Brand Tenants Aktif & Akses Langsung (Masquerade)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Klik salah satu brand untuk langsung masuk ke portal brand tersebut sebagai HQ Owner.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('brands')}
                    className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platformBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181a24] hover:bg-slate-100/80 dark:hover:bg-[#1e212d] border border-slate-200/70 dark:border-white/5 transition-all flex flex-col justify-between group shadow-2xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md"
                              style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                            >
                              {brand.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                {brand.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                mediasocial.team/{brand.slug}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                              brand.subscription_status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : brand.subscription_status === 'expiring_soon'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {brand.subscription_status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mb-3">
                          {brand.tagline}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-[#121316] p-2.5 rounded-xl mb-3 border border-slate-200/60 dark:border-slate-800">
                          <div>
                            HQ Owner: <strong className="text-slate-900 dark:text-slate-200">{brand.hq_owner_name}</strong>
                          </div>
                          <div>
                            Paket: <strong className="text-orange-600 dark:text-orange-400 uppercase">{brand.subscription_plan_id}</strong>
                          </div>
                          <div>
                            Cabang: <strong className="text-slate-900 dark:text-slate-200">{brand.branches_count} Outlet</strong>
                          </div>
                          <div>
                            Biaya: <strong className="text-emerald-600 dark:text-emerald-400">Rp {(brand.monthly_fee / 1000000).toFixed(1)}M/bln</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <button
                          onClick={() => jumpToBrandAsHQOwner(brand.slug)}
                          className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Buka Portal Brand
                        </button>
                        {(brand.subscription_status === 'expiring_soon' || brand.subscription_status === 'expired') && (
                          <button
                            onClick={() => handleTriggerReminder(brand)}
                            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                            title="Kirim WhatsApp Reminder"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {platformBrands.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
                      Belum ada brand terdaftar. Klik tombol "Onboard Brand Baru" untuk menambahkan brand tenant pertama.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Recent Activity & Reminders Pulse */}
              <div className="rounded-3xl bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Log Reminder & Keuangan
                  </h3>
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                  >
                    Selengkapnya
                  </button>
                </div>

                <div className="space-y-3">
                  {subscriptionReminders.slice(0, 4).map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181a24] border border-slate-200/60 dark:border-slate-800 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-200">{rem.brand_name}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {rem.channel}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{rem.message_preview}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Kepada: {rem.recipient_name}</span>
                        <span>{rem.sent_at}</span>
                      </div>
                    </div>
                  ))}

                  {subscriptionReminders.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada log reminder.
                    </div>
                  )}
                </div>

                {isPlatformOwner && (
                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-300">Siap Tarik Payout</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          Rp {platformWalletBalance.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs cursor-pointer shadow-xs"
                      >
                        Tarik Saldo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: BRANDS DIRECTORY ===================== */}
        {activeTab === 'brands' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  Daftar Brand & Tenant Multi-Subdomain
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Semua brand franchise yang terdaftar dengan link kustom <code>mediasocial.team/slug</code>
                </p>
              </div>

              {(isPlatformOwner || isPlatformAdmin) && (
                <button
                  onClick={() => setShowAddBrandModal(true)}
                  className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Undang & Tambah Brand Baru
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#14161f] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 ml-1" />
                <input
                  type="text"
                  placeholder="Cari nama brand, domain slug, atau owner..."
                  value={searchBrand}
                  onChange={(e) => setSearchBrand(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                {(['all', 'active', 'expiring_soon', 'expired'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands Table View */}
            <div className="rounded-3xl bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-[#181a24] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="py-4 px-5">Brand & Subdomain</th>
                      <th className="py-4 px-5">HQ Owner & Kontak</th>
                      <th className="py-4 px-5">Paket & Cabang</th>
                      <th className="py-4 px-5">Status & Masa Aktif</th>
                      <th className="py-4 px-5">Tagihan Bulanan</th>
                      <th className="py-4 px-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBrands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md"
                              style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                            >
                              {brand.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-sm">{brand.name}</div>
                              <a
                                href={`/${brand.slug}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  jumpToBrandAsHQOwner(brand.slug);
                                }}
                                className="text-orange-600 dark:text-orange-400 hover:underline font-mono text-[11px] flex items-center gap-1"
                              >
                                mediasocial.team/{brand.slug}
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 dark:text-white">{brand.hq_owner_name}</div>
                          <div className="text-slate-500 text-[11px] font-mono">{brand.hq_owner_phone}</div>
                          <div className="text-slate-400 text-[11px]">{brand.hq_owner_email}</div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase">
                            {brand.subscription_plan_id}
                          </span>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                            {brand.branches_count} Outlet Aktif
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              brand.subscription_status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : brand.subscription_status === 'expiring_soon'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {brand.subscription_status.replace('_', ' ')}
                          </span>
                          <div className="text-slate-500 text-[11px] mt-1">
                            Hingga {brand.subscription_end_date}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-black text-slate-900 dark:text-white text-sm">
                            Rp {brand.monthly_fee.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[11px] text-slate-400">per bulan</div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => jumpToBrandAsHQOwner(brand.slug)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Masuk Portal
                            </button>
                            {(brand.subscription_status === 'expiring_soon' || brand.subscription_status === 'expired') && (
                              <button
                                onClick={() => handleTriggerReminder(brand)}
                                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                                title="Kirim Reminder WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredBrands.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                          Tidak ada data brand yang sesuai pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: REMINDERS ===================== */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Reminder Jatuh Tempo & Penagihan Langganan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pantau brand yang mendekati akhir masa aktif paket dan kirim pengingat langsung via WhatsApp / Email.
                </p>
              </div>
            </div>

            {/* Expiring Brands Alert List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Brand Membutuhkan Follow-Up ({expiringBrands.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expiringBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md"
                            style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                          >
                            {brand.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white text-sm">{brand.name}</div>
                            <div className="text-slate-500 text-xs">{brand.hq_owner_name} ({brand.hq_owner_phone})</div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            brand.subscription_status === 'expiring_soon'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {brand.subscription_status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#181a24] p-3 rounded-2xl text-xs space-y-1 text-slate-600 dark:text-slate-300 mb-4 border border-slate-200/60 dark:border-slate-800">
                        <div>Jatuh Tempo: <strong>{brand.subscription_end_date}</strong></div>
                        <div>Tagihan Bulanan: <strong>Rp {brand.monthly_fee.toLocaleString('id-ID')}</strong></div>
                        <div>Paket: <strong className="uppercase">{brand.subscription_plan_id}</strong></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTriggerReminder(brand)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Kirim Reminder WhatsApp
                      </button>
                    </div>
                  </div>
                ))}

                {expiringBrands.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-white dark:bg-[#14161f] rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
                    🎉 Tidak ada brand yang jatuh tempo atau membutuhkan follow up saat ini!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: PLANS ===================== */}
        {activeTab === 'plans' && isPlatformOwner && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-500" />
                  Paket Subscription Platform (SaaS Pricing)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Konfigurasi harga langganan per bulan/tahun dan kuota layanan yang didapatkan setiap tenant brand.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 bg-white dark:bg-[#14161f] border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                    plan.is_popular
                      ? 'border-orange-500/60 ring-2 ring-orange-500/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                      Paling Populer
                    </span>
                  )}

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[36px]">{plan.description}</p>

                    <div className="mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Rp {(plan.monthly_price / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">/ bulan (atau Rp {(plan.annual_price / 1000000).toFixed(1)}M/tahun)</div>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                      <div className="flex items-center gap-2 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Max <strong>{plan.max_branches} Cabang</strong></span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span><strong>{plan.max_design_requests_per_branch} Desain / Cabang</strong> / bln</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span><strong>{plan.max_promos_per_branch} Promo / Cabang</strong> / bln</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Omnipost Auto-Publish Sosmed</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Auto-Invoice & Retainer Billing</span>
                      </div>
                      {plan.includes_influencer_crm && (
                        <div className="flex items-center gap-2 font-medium text-orange-600 dark:text-orange-400">
                          <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>Modul KOL Influencer CRM</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditPlan(plan)}
                    className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Harga & Kuota Paket
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 5: WALLET ===================== */}
        {activeTab === 'wallet' && isPlatformOwner && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-500" />
                  Saldo Pool & Penarikan Dana Platform
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Disbursement pendapatan langganan platform ke rekening operasional owner.
                </p>
              </div>

              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                Ajukan Penarikan Saldo
              </button>
            </div>

            {/* Balance Overview Card */}
            <div className="p-6 rounded-3xl bg-[#121316] text-white border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Total Saldo Pool Siap Ditarik</div>
                <div className="text-3xl lg:text-4xl font-black tracking-tight">
                  Rp {platformWalletBalance.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-400 mt-1">Akumulasi penerimaan invoice subscription dari seluruh brand aktif</p>
              </div>
            </div>

            {/* Withdrawals Log Table */}
            <div className="bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Riwayat Penarikan Dana (Disbursement)</h3>
                <span className="text-xs text-slate-400">{platformWithdrawals.length} Transaksi</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#181a24] text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Tanggal & Ref</th>
                      <th className="py-3.5 px-4">Nominal</th>
                      <th className="py-3.5 px-4">Rekening Tujuan</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {platformWithdrawals.map((wd) => (
                      <tr key={wd.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">{wd.reference_no}</div>
                          <div className="text-[11px] text-slate-400">{wd.created_at}</div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-sm text-emerald-600 dark:text-emerald-400">
                          Rp {wd.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{wd.bank_name}</div>
                          <div className="text-slate-500 text-[11px]">{wd.account_number} a/n {wd.account_holder}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              wd.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {wd.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {wd.status === 'pending' && (
                            <button
                              onClick={() => updateWithdrawalStatus(wd.id, 'completed')}
                              className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                            >
                              Selesaikan
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {platformWithdrawals.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                          Belum ada riwayat penarikan saldo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: TIM PLATFORM & AKUN ===================== */}
        {activeTab === 'users' && isPlatformOwner && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Platform Superadmin & Team RBAC</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Kelola Pengguna Platform & Akun Superadmin</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Atur kredensial Superadmin dan tambahkan anggota tim internal Platform Finance & Platform Admin.
                </p>
              </div>

              <button
                onClick={() => {
                  setNewUserName('');
                  setNewUserPhone('');
                  setNewUserEmail('');
                  setNewUserPassword('Media');
                  setNewUserRole('platform_admin');
                  setNewUserJobTitle('');
                  setUserFormMsg(null);
                  setShowAddUserModal(true);
                }}
                className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Pengguna Platform</span>
              </button>
            </div>

            {/* Change Superadmin Password Card */}
            <div className="bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold">
                  🔒
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Ubah Password Superadmin / Platform Owner</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Akun Superadmin Login: <span className="text-orange-600 dark:text-orange-400 font-mono font-bold">{currentUser.phone || '08159998757'}</span>
                  </p>
                </div>
              </div>

              {passMsg && (
                <div
                  className={`p-3.5 rounded-2xl mb-4 text-xs flex items-center gap-2 ${
                    passMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{passMsg.text}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPassMsg(null);
                  if (!adminNewPass.trim()) {
                    setPassMsg({ type: 'error', text: 'Password baru tidak boleh kosong.' });
                    return;
                  }
                  if (adminNewPass !== adminConfirmPass) {
                    setPassMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
                    return;
                  }
                  const res = changePassword(currentUser.id, adminNewPass);
                  if (res.success) {
                    setPassMsg({ type: 'success', text: 'Password Superadmin berhasil diperbarui dan tersimpan ke database!' });
                    setAdminNewPass('');
                    setAdminConfirmPass('');
                  } else {
                    setPassMsg({ type: 'error', text: res.message });
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password baru"
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ulangi Password Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Konfirmasi password baru"
                    value={adminConfirmPass}
                    onChange={(e) => setAdminConfirmPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Simpan Password Baru
                </button>
              </form>
            </div>

            {/* Platform Users Table */}
            <div className="bg-white dark:bg-[#14161f] border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Daftar Pengguna Platform</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pengguna dengan akses ke Platform Master Console mediasocial.team</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {platformUsers.length} Users
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#181a24] text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Nama Lengkap</th>
                      <th className="py-3.5 px-4">Role Akses</th>
                      <th className="py-3.5 px-4">Nomor HP (Login)</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Jabatan</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {platformUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-xs">
                            {u.full_name.charAt(0)}
                          </div>
                          <span>{u.full_name}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'platform_owner'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : u.role === 'platform_finance'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {u.role.replace('platform_', 'Platform ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-orange-600 dark:text-orange-400 font-bold">{u.phone}</td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{u.job_title || '-'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== MODAL: TAMBAH USER PLATFORM ===================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#14161f] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Tambah Pengguna Platform Baru
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Buat akun untuk Platform Finance atau Platform Admin</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {userFormMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  userFormMsg.type === 'error'
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userFormMsg.text}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUserFormMsg(null);
                if (!newUserName.trim() || !newUserPhone.trim()) {
                  setUserFormMsg({ type: 'error', text: 'Nama dan Nomor HP wajib diisi.' });
                  return;
                }
                const res = addPlatformUser({
                  full_name: newUserName.trim(),
                  phone: newUserPhone.trim(),
                  email: newUserEmail.trim() || `${newUserName.toLowerCase().replace(/\s+/g, '')}@mediasocial.team`,
                  role: newUserRole,
                  password: newUserPassword.trim() || 'Media',
                  job_title: newUserJobTitle.trim() || (newUserRole === 'platform_finance' ? 'Platform Finance Officer' : 'Platform Operations Admin'),
                  branch_id: null,
                  status: 'active'
                });
                if (!res.success) {
                  setUserFormMsg({ type: 'error', text: res.message });
                } else {
                  setUserFormMsg({ type: 'success', text: res.message });
                  setTimeout(() => {
                    setShowAddUserModal(false);
                  }, 800);
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Peran Platform *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                >
                  <option value="platform_admin" className="text-black">Platform Admin (Onboarding & Brand Management)</option>
                  <option value="platform_finance" className="text-black">Platform Finance (Subscription & Invoicing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap User"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Handphone (WhatsApp Login) *</label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Platform</label>
                <input
                  type="email"
                  placeholder="nama@mediasocial.team"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan / Job Title</label>
                  <input
                    type="text"
                    placeholder="SaaS Ops Lead"
                    value={newUserJobTitle}
                    onChange={(e) => setNewUserJobTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password Awal</label>
                  <input
                    type="text"
                    placeholder="Media"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Simpan User Platform
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ONBOARD BRAND BARU ===================== */}
      {showAddBrandModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#14161f] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  Onboard & Undang Brand Baru
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftarkan brand baru dan buat subdomain di <code>mediasocial.team/slug</code>
                </p>
              </div>
              <button
                onClick={() => setShowAddBrandModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi Kulo, Moggumung"
                    value={newBrandName}
                    onChange={(e) => {
                      setNewBrandName(e.target.value);
                      if (!newBrandSlug) {
                        setNewBrandSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subdomain Slug *</label>
                  <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-500">
                    <span>mediasocial.team/</span>
                    <input
                      type="text"
                      required
                      placeholder="kopikulo"
                      value={newBrandSlug}
                      onChange={(e) => setNewBrandSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      className="bg-transparent border-none text-slate-900 dark:text-white focus:outline-none flex-1 ml-0.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline Brand</label>
                <input
                  type="text"
                  placeholder="Contoh: Artisan Coffee & Pastry Specialist"
                  value={newBrandTagline}
                  onChange={(e) => setNewBrandTagline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama HQ Owner *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hendra Wijaya"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp Owner *</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Owner</label>
                  <input
                    type="email"
                    placeholder="owner@brand.com"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilihan Paket *</label>
                  <select
                    value={newPlanId}
                    onChange={(e) => setNewPlanId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="starter" className="text-black">Starter Franchise (Rp 2.49M/bln)</option>
                    <option value="growth" className="text-black">Growth Network (Rp 4.89M/bln)</option>
                    <option value="enterprise" className="text-black">Enterprise Fleet (Rp 8.99M/bln)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Cabang Awal</label>
                  <input
                    type="number"
                    min="1"
                    value={newBranchesCount}
                    onChange={(e) => setNewBranchesCount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Warna Brand (HEX)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBrandColor}
                      onChange={(e) => setNewBrandColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newBrandColor}
                      onChange={(e) => setNewBrandColor(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBrandModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Daftarkan Brand Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: TARIK SALDO (WITHDRAW) ===================== */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14161f] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-500" />
                  Tarik Saldo Subscription Platform
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tersedia: <strong className="text-amber-600 dark:text-amber-400">Rp {platformWalletBalance.toLocaleString('id-ID')}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {wdError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{wdError}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nominal Penarikan (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 10000000"
                  value={wdAmount}
                  onChange={(e) => setWdAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-black text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Tujuan *</label>
                <select
                  value={wdBank}
                  onChange={(e) => setWdBank(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Bank Central Asia (BCA)" className="text-black">Bank Central Asia (BCA)</option>
                  <option value="Bank Mandiri" className="text-black">Bank Mandiri</option>
                  <option value="Bank Rakyat Indonesia (BRI)" className="text-black">Bank Rakyat Indonesia (BRI)</option>
                  <option value="Bank Negara Indonesia (BNI)" className="text-black">Bank Negara Indonesia (BNI)</option>
                  <option value="Bank Syariah Indonesia (BSI)" className="text-black">Bank Syariah Indonesia (BSI)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening *</label>
                  <input
                    type="text"
                    required
                    placeholder="8830-1928-11"
                    value={wdAccNo}
                    onChange={(e) => setWdAccNo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Atas Nama Rekening *</label>
                  <input
                    type="text"
                    required
                    placeholder="Alexandre Tan"
                    value={wdAccHolder}
                    onChange={(e) => setWdAccHolder(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Keterangan penarikan (opsional)"
                  value={wdNotes}
                  onChange={(e) => setWdNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Ajukan Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT PLAN (OWNER) ===================== */}
      {showEditPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14161f] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-orange-500" />
                  Edit {showEditPlanModal.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Atur parameter kuota & harga langganan (tersimpan otomatis ke database)</p>
              </div>
              <button
                onClick={() => setShowEditPlanModal(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Bulanan (Rp)</label>
                <input
                  type="number"
                  value={editMonthlyPrice}
                  onChange={(e) => setEditMonthlyPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Cabang</label>
                  <input
                    type="number"
                    value={editMaxBranches}
                    onChange={(e) => setEditMaxBranches(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Desain</label>
                  <input
                    type="number"
                    value={editMaxDesigns}
                    onChange={(e) => setEditMaxDesigns(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Promo</label>
                  <input
                    type="number"
                    value={editMaxPromos}
                    onChange={(e) => setEditMaxPromos(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditPlanModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs cursor-pointer shadow-md shadow-orange-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
