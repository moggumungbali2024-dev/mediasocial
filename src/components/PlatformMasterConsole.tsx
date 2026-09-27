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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top SaaS Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  mediasocial.team
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                  Platform Console
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{currentUser.full_name}</strong> (
                <span className="text-orange-400 capitalize">{activeRole.replace('_', ' ')}</span>)
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Brands</div>
                <div className="text-sm font-bold text-white">{platformBrands.length} Tenants</div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Platform MRR</div>
                <div className="text-sm font-bold text-emerald-400">Rp {(totalPlatformMRR / 1000000).toFixed(1)}M/bln</div>
              </div>
            </div>

            {isPlatformOwner && (
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tarik Saldo Pool</div>
                  <div className="text-sm font-bold text-amber-400">Rp {(platformWalletBalance / 1000000).toFixed(1)}M</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Ringkasan Platform & MRR
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'brands'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Daftar Brand & Tenant ({platformBrands.length})
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'reminders'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            Reminder Jatuh Tempo
            {expiringBrands.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                {expiringBrands.length}
              </span>
            )}
          </button>

          {isPlatformOwner && (
            <>
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'plans'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                Paket Subscription ({subscriptionPlans.length})
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'wallet'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Wallet & Tarik Dana
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'users'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 lg:p-8">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> mediasocial.team Multi-Tenant Platform
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
                    Master Console Operasional & Subscription
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    Kelola ekosistem multi-brand, alokasi kuota per cabang, pemantauan masa aktif langganan,
                    serta disbursement saldo pool platform secara terpusat.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {(isPlatformOwner || isPlatformAdmin) && (
                    <button
                      onClick={() => setShowAddBrandModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Onboard Brand Baru
                    </button>
                  )}
                  {isPlatformOwner && (
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-2 transition-all"
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
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Monthly Recurring (MRR)</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  Rp {totalPlatformMRR.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <span>+{platformBrands.filter((b) => b.subscription_status === 'active').length} Brand Aktif</span>
                  <span className="text-slate-500">• ARR: Rp {(totalPlatformARR / 1000000).toFixed(0)}M</span>
                </div>
              </div>

              {/* Card 2: Wallet Pool Available */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Saldo Wallet Pool</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-400 tracking-tight">
                  Rp {platformWalletBalance.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Siap ditarik / payout via Bank Transfer
                </div>
              </div>

              {/* Card 3: Total Branches Managed */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Jaringan Cabang Brand</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {platformBrands.reduce((sum, b) => sum + b.branches_count, 0)} Cabang
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Tersebar di {platformBrands.length} Brand F&B & Retail
                </div>
              </div>

              {/* Card 4: Action Required / Expiring */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Status Renewal</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-400 tracking-tight">
                  {expiringBrands.length} Butuh Follow-up
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {expiringBrands.filter((b) => b.subscription_status === 'expiring_soon').length} expiring soon,{' '}
                  {expiringBrands.filter((b) => b.subscription_status === 'expired').length} expired
                </div>
              </div>
            </div>

            {/* Quick Actions & Brand Live Directory Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Brand Directory Quick Access */}
              <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-400" />
                      Brand Tenants Aktif & Akses Langsung (Masquerade)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Klik salah satu brand untuk langsung masuk ke portal brand tersebut sebagai HQ Owner.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('brands')}
                    className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
                  >
                    Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {platformBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="p-4 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-750 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md"
                              style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                            >
                              {brand.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">
                                {brand.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                mediasocial.team/{brand.slug}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
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

                        <div className="text-xs text-slate-300 line-clamp-1 mb-2">
                          {brand.tagline}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-900/70 p-2 rounded-lg mb-3">
                          <div>
                            HQ Owner: <strong className="text-slate-200">{brand.hq_owner_name}</strong>
                          </div>
                          <div>
                            Paket: <strong className="text-orange-400 uppercase">{brand.subscription_plan_id}</strong>
                          </div>
                          <div>
                            Cabang: <strong className="text-slate-200">{brand.branches_count} Outlet</strong>
                          </div>
                          <div>
                            Biaya: <strong className="text-emerald-400">Rp {(brand.monthly_fee / 1000000).toFixed(1)}M/bln</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                        <button
                          onClick={() => jumpToBrandAsHQOwner(brand.slug)}
                          className="flex-1 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Buka Portal Brand
                        </button>
                        {(brand.subscription_status === 'expiring_soon' || brand.subscription_status === 'expired') && (
                          <button
                            onClick={() => handleTriggerReminder(brand)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                            title="Kirim WhatsApp Reminder"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Recent Activity & Reminders Pulse */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Log Reminder & Keuangan
                  </h3>
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className="text-xs text-orange-400 font-bold hover:text-orange-300"
                  >
                    Selengkapnya
                  </button>
                </div>

                <div className="space-y-3">
                  {subscriptionReminders.slice(0, 4).map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{rem.brand_name}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {rem.channel}
                        </span>
                      </div>
                      <p className="text-slate-400 line-clamp-2">{rem.message_preview}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>Kepada: {rem.recipient_name}</span>
                        <span>{rem.sent_at}</span>
                      </div>
                    </div>
                  ))}

                  {subscriptionReminders.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500">
                      Belum ada reminder yang dikirim.
                    </div>
                  )}
                </div>

                {isPlatformOwner && (
                  <div className="pt-3 border-t border-slate-800">
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-300">Siap Tarik Payout</div>
                        <div className="text-sm font-black text-white">
                          Rp {platformWalletBalance.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
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
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-400" />
                  Daftar Brand & Tenant Multi-Subdomain
                </h2>
                <p className="text-xs text-slate-400">
                  Semua brand franchise yang terdaftar dengan link kustom <code>mediasocial.team/slug</code>
                </p>
              </div>

              {(isPlatformOwner || isPlatformAdmin) && (
                <button
                  onClick={() => setShowAddBrandModal(true)}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  Undang & Tambah Brand Baru
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 ml-1" />
                <input
                  type="text"
                  placeholder="Cari nama brand, domain slug, atau owner..."
                  value={searchBrand}
                  onChange={(e) => setSearchBrand(e.target.value)}
                  className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                {(['all', 'active', 'expiring_soon', 'expired'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      statusFilter === st
                        ? 'bg-slate-800 text-orange-400 border border-orange-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands Table View */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-850 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Brand & Subdomain</th>
                      <th className="py-3.5 px-4">HQ Owner & Kontak</th>
                      <th className="py-3.5 px-4">Paket & Cabang</th>
                      <th className="py-3.5 px-4">Status & Masa Aktif</th>
                      <th className="py-3.5 px-4">Tagihan Bulanan</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredBrands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md"
                              style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                            >
                              {brand.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{brand.name}</div>
                              <a
                                href={`/${brand.slug}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  jumpToBrandAsHQOwner(brand.slug);
                                }}
                                className="text-orange-400 hover:text-orange-300 font-mono text-[11px] flex items-center gap-1"
                              >
                                mediasocial.team/{brand.slug}
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{brand.hq_owner_name}</div>
                          <div className="text-[11px] text-slate-400">{brand.hq_owner_phone}</div>
                          <div className="text-[11px] text-slate-500">{brand.hq_owner_email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="inline-block px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-orange-400 font-bold uppercase text-[10px] mb-1">
                            {brand.subscription_plan_id}
                          </div>
                          <div className="text-slate-300 font-medium">
                            {brand.branches_count} Outlet Aktif
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase mb-1 ${
                              brand.subscription_status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : brand.subscription_status === 'expiring_soon'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {brand.subscription_status.replace('_', ' ')}
                          </span>
                          <div className="text-[11px] text-slate-400">
                            Hingga {brand.subscription_end_date}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">
                            Rp {brand.monthly_fee.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[11px] text-slate-400">per bulan</div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => jumpToBrandAsHQOwner(brand.slug)}
                              className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Masuk Portal
                            </button>

                            {(brand.subscription_status === 'expiring_soon' || brand.subscription_status === 'expired') && (
                              <button
                                onClick={() => handleTriggerReminder(brand)}
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30"
                                title="Kirim WA Reminder"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            )}

                            {isPlatformOwner && (
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus brand ${brand.name}?`)) {
                                    deletePlatformBrand(brand.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400"
                                title="Hapus Brand"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: REMINDERS (FINANCE) ===================== */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Pusat Reminder & Tagihan Perpanjangan Brand
                </h2>
                <p className="text-xs text-slate-400">
                  Pantau brand yang masa aktifnya segera habis (&lt; 7 hari) dan kirim pesan WhatsApp otomatis ke HQ Owner.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {expiringBrands.length} Brand Butuh Perpanjangan
              </div>
            </div>

            {/* Expiring Brands Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiringBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md"
                        style={{ backgroundColor: brand.primary_color || '#FF5B14' }}
                      >
                        {brand.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">{brand.name}</div>
                        <div className="text-xs text-slate-400">
                          HQ Owner: <strong className="text-slate-200">{brand.hq_owner_name}</strong> ({brand.hq_owner_phone})
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                        brand.subscription_status === 'expiring_soon'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {brand.subscription_status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-850 p-3.5 rounded-xl text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Jatuh Tempo</div>
                      <div className="font-bold text-white">{brand.subscription_end_date}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Biaya Tagihan</div>
                      <div className="font-bold text-emerald-400">
                        Rp {brand.monthly_fee.toLocaleString('id-ID')}/bln
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Paket Aktif</div>
                      <div className="font-bold text-orange-400 uppercase">{brand.subscription_plan_id}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Total Cabang</div>
                      <div className="font-bold text-slate-200">{brand.branches_count} Cabang</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleTriggerReminder(brand)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      Kirim WhatsApp Reminder
                    </button>
                    <button
                      onClick={() => {
                        const newDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
                        updatePlatformBrand(brand.id, {
                          subscription_status: 'active',
                          subscription_end_date: newDate
                        });
                        alert(`Berhasil memperpanjang subscription ${brand.name} hingga ${newDate}`);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Tandai Lunas (+30 Hari)
                    </button>
                  </div>
                </div>
              ))}

              {expiringBrands.length === 0 && (
                <div className="col-span-2 text-center py-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="font-bold text-white text-base">Semua Brand Dalam Status Aktif</div>
                  <div className="text-xs text-slate-500">Tidak ada subscription yang jatuh tempo dalam 7 hari ke depan.</div>
                </div>
              )}
            </div>

            {/* Reminder Log Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-orange-400" />
                Riwayat Pengiriman Pesan Reminder
              </h3>

              <div className="space-y-3">
                {subscriptionReminders.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{log.brand_name}</strong>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                          {log.channel}
                        </span>
                        <span className="text-slate-500 text-[11px]">• {log.sent_at}</span>
                      </div>
                      <p className="text-slate-300 font-mono text-[11px]">{log.message_preview}</p>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                      <div>Kepada: <strong className="text-slate-200">{log.recipient_name}</strong></div>
                      <div>Kontak: {log.recipient_phone}</div>
                      <div className="text-emerald-400 font-semibold mt-1">Status: Terkirim</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: PLANS & PACKAGES (OWNER) ===================== */}
        {activeTab === 'plans' && isPlatformOwner && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-400" />
                  Konfigurasi Paket Subscription SaaS
                </h2>
                <p className="text-xs text-slate-400">
                  Platform Owner dapat mengatur harga bulanan/tahunan, kuota desain per cabang, dan fitur tiap tier.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl bg-slate-900 border flex flex-col justify-between transition-all ${
                    plan.is_popular
                      ? 'border-orange-500 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/50'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    {plan.is_popular && (
                      <span className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white font-bold text-[10px] uppercase tracking-wider mb-3">
                        Paling Populer
                      </span>
                    )}

                    <h3 className="text-lg font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">{plan.description}</p>

                    <div className="my-4">
                      <div className="text-3xl font-black text-white">
                        Rp {(plan.monthly_price / 1000000).toFixed(2)}M
                        <span className="text-xs text-slate-400 font-normal"> /bulan</span>
                      </div>
                      <div className="text-xs text-emerald-400 mt-1">
                        Tahunan: Rp {(plan.annual_price / 1000000).toFixed(1)}M /tahun (Hemat 2 Bulan)
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Maksimal <strong>{plan.max_branches} Cabang</strong></span>
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
                          <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                        )}
                        <span className={plan.includes_influencer_crm ? 'text-slate-300' : 'text-slate-500'}>
                          Influencer CRM & ROI Voucher
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Auto-Invoicing & Multi-Branch Retainer</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        {plan.includes_dedicated_support ? (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                        )}
                        <span className={plan.includes_dedicated_support ? 'text-slate-300' : 'text-slate-500'}>
                          Dedicated Account Manager
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="w-full py-2.5 rounded-xl bg-slate-850 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-orange-400" />
                      Ubah Harga & Kuota Paket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 5: WALLET & WITHDRAWAL (OWNER) ===================== */}
        {activeTab === 'wallet' && isPlatformOwner && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  SaaS Revenue Pool & Payout Withdrawal
                </h2>
                <p className="text-xs text-slate-400">
                  Tarik saldo hasil akumulasi subscription dari seluruh tenant brand ke rekening bank Owner.
                </p>
              </div>

              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <ArrowUpRight className="w-4 h-4" />
                Ajukan Pencairan Dana Baru
              </button>
            </div>

            {/* Wallet Balance Hero Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Saldo Tersedia (Ready to Payout)</div>
                <div className="text-3xl font-black text-white">
                  Rp {platformWalletBalance.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-400">
                  Dihitung dari total penerimaan langganan brand dikurangi pencairan yang telah selesai.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total MRR Terkunci</div>
                <div className="text-3xl font-black text-emerald-400">
                  Rp {totalPlatformMRR.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-400">
                  Pemasukan berulang bulanan dari {platformBrands.filter((b) => b.subscription_status === 'active').length} brand aktif.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Total Telah Dicairkan</div>
                <div className="text-3xl font-black text-blue-400">
                  Rp{' '}
                  {platformWithdrawals
                    .filter((w) => w.status === 'completed')
                    .reduce((sum, w) => sum + w.amount, 0)
                    .toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-400">
                  {platformWithdrawals.filter((w) => w.status === 'completed').length} transaksi pencairan sukses.
                </p>
              </div>
            </div>

            {/* Withdrawal History Ledger */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                Ledger Riwayat Pencairan Dana
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-850 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ref No & Tanggal</th>
                      <th className="py-3 px-4">Rekening Tujuan</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Catatan</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {platformWithdrawals.map((wd) => (
                      <tr key={wd.id} className="hover:bg-slate-850/60">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-white">{wd.reference_no || wd.id}</div>
                          <div className="text-[11px] text-slate-400">{wd.created_at}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{wd.bank_name}</div>
                          <div className="text-[11px] text-slate-400">{wd.account_number} a/n {wd.account_holder}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-black text-amber-400 text-sm">
                            Rp {wd.amount.toLocaleString('id-ID')}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                              wd.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : wd.status === 'processing'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : wd.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {wd.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {wd.notes || '-'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {wd.status === 'pending' && (
                            <button
                              onClick={() => updateWithdrawalStatus(wd.id, 'completed')}
                              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              Selesaikan
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Platform Superadmin & Team RBAC</span>
                </div>
                <h2 className="text-xl font-black text-white">Kelola Pengguna Platform & Akun Superadmin</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Atur kredensial Superadmin (08159998757) dan tambahkan anggota tim internal Platform Finance & Platform Admin.
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
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Pengguna Platform</span>
              </button>
            </div>

            {/* Change Superadmin Password Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                  🔒
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Ubah Password Superadmin / Platform Owner</h3>
                  <p className="text-xs text-slate-400">
                    Akun Superadmin Login: <span className="text-orange-400 font-mono font-bold">08159998757</span> (Default Password: <span className="text-orange-400 font-mono">Media</span>)
                  </p>
                </div>
              </div>

              {passMsg && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                    passMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
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
                    setPassMsg({ type: 'success', text: 'Password Superadmin berhasil diperbarui!' });
                    setAdminNewPass('');
                    setAdminConfirmPass('');
                  } else {
                    setPassMsg({ type: 'error', text: res.message });
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password baru"
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ulangi Password Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Konfirmasi password baru"
                    value={adminConfirmPass}
                    onChange={(e) => setAdminConfirmPass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition"
                >
                  Simpan Password Baru
                </button>
              </form>
            </div>

            {/* Platform Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Daftar Pengguna Platform</h3>
                  <p className="text-xs text-slate-400">Pengguna dengan akses ke Platform Master Console mediasocial.team</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                  {platformUsers.length} Users
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Role Akses</th>
                      <th className="py-3 px-4">Nomor HP (Login)</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Jabatan</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {platformUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs">
                            {u.full_name.charAt(0)}
                          </div>
                          <span>{u.full_name}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'platform_owner'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : u.role === 'platform_finance'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {u.role.replace('platform_', 'Platform ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-orange-300">{u.phone}</td>
                        <td className="py-3.5 px-4 text-slate-400">{u.email}</td>
                        <td className="py-3.5 px-4 text-slate-400">{u.job_title || '-'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  Tambah Pengguna Platform Baru
                </h3>
                <p className="text-xs text-slate-400">Buat akun untuk Platform Finance atau Platform Admin</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {userFormMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  userFormMsg.type === 'error'
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
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
                <label className="block text-xs font-bold text-slate-300 mb-1">Role / Peran Platform *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-bold"
                >
                  <option value="platform_admin">Platform Admin (Onboarding & Brand Management)</option>
                  <option value="platform_finance">Platform Finance (Subscription & Invoicing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap User"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Handphone (WhatsApp Login) *</label>
                <input
                  type="tel"
                  required
                  placeholder="0812-xxxx-xxxx"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Platform</label>
                <input
                  type="email"
                  placeholder="nama@mediasocial.team"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Jabatan / Job Title</label>
                  <input
                    type="text"
                    placeholder="SaaS Ops Lead"
                    value={newUserJobTitle}
                    onChange={(e) => setNewUserJobTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password Awal</label>
                  <input
                    type="text"
                    placeholder="Media"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-400" />
                  Onboard & Undang Brand Baru
                </h3>
                <p className="text-xs text-slate-400">
                  Daftarkan brand baru dan buat subdomain di <code>mediasocial.team/slug</code>
                </p>
              </div>
              <button
                onClick={() => setShowAddBrandModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nama Brand *</label>
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subdomain Slug *</label>
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400">
                    <span>mediasocial.team/</span>
                    <input
                      type="text"
                      required
                      placeholder="kopikulo"
                      value={newBrandSlug}
                      onChange={(e) => setNewBrandSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      className="bg-transparent border-none text-white focus:outline-none flex-1 ml-0.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tagline Brand</label>
                <input
                  type="text"
                  placeholder="Contoh: Artisan Coffee & Pastry Specialist"
                  value={newBrandTagline}
                  onChange={(e) => setNewBrandTagline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nama HQ Owner *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hendra Wijaya"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">No. WhatsApp Owner *</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Owner</label>
                  <input
                    type="email"
                    placeholder="owner@brand.com"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Paket Subscription</label>
                  <select
                    value={newPlanId}
                    onChange={(e) => {
                      setNewPlanId(e.target.value);
                      const fee = e.target.value === 'starter' ? 2490000 : e.target.value === 'growth' ? 4890000 : 8990000;
                      setNewMonthlyFee(fee);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="starter">Starter (Rp 2.49M/bln)</option>
                    <option value="growth">Growth (Rp 4.89M/bln)</option>
                    <option value="enterprise">Enterprise (Rp 8.99M/bln)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Jumlah Cabang Awal</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newBranchesCount}
                    onChange={(e) => setNewBranchesCount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Warna Brand Utama</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBrandColor}
                      onChange={(e) => setNewBrandColor(e.target.value)}
                      className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={newBrandColor}
                      onChange={(e) => setNewBrandColor(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBrandModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25"
                >
                  <PlusCircle className="w-4 h-4" />
                  Terbitkan Akun & Tenant Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: TARIK SALDO (OWNER) ===================== */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  Pencairan Saldo Subscription
                </h3>
                <p className="text-xs text-slate-400">
                  Transfer saldo platform pool ke rekening bank Owner
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {wdError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {wdError}
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-center justify-between">
              <span>Saldo Tersedia Saat Ini:</span>
              <strong className="text-sm font-black text-white">
                Rp {platformWalletBalance.toLocaleString('id-ID')}
              </strong>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nominal Penarikan (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 10000000"
                  value={wdAmount}
                  onChange={(e) => setWdAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Bank Tujuan</label>
                  <select
                    value={wdBank}
                    onChange={(e) => setWdBank(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank Rakyat Indonesia (BRI)">Bank BRI</option>
                    <option value="Bank Negara Indonesia (BNI)">Bank BNI</option>
                    <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    value={wdAccNo}
                    onChange={(e) => setWdAccNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={wdAccHolder}
                  onChange={(e) => setWdAccHolder(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Catatan Pengeluaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Pencairan dividen Q3 2026"
                  value={wdNotes}
                  onChange={(e) => setWdNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Konfirmasi Pencairan Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT PLAN (OWNER) ===================== */}
      {showEditPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-orange-400" />
                  Edit {showEditPlanModal.name}
                </h3>
                <p className="text-xs text-slate-400">Atur parameter kuota & harga langganan</p>
              </div>
              <button
                onClick={() => setShowEditPlanModal(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Harga Bulanan (Rp)</label>
                <input
                  type="number"
                  value={editMonthlyPrice}
                  onChange={(e) => setEditMonthlyPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Cabang</label>
                  <input
                    type="number"
                    value={editMaxBranches}
                    onChange={(e) => setEditMaxBranches(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Desain</label>
                  <input
                    type="number"
                    value={editMaxDesigns}
                    onChange={(e) => setEditMaxDesigns(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Promo</label>
                  <input
                    type="number"
                    value={editMaxPromos}
                    onChange={(e) => setEditMaxPromos(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditPlanModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
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
