import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Store,
  Plus,
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Edit2,
  Trash2,
  Share2,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  X,
  Send,
  ExternalLink,
  Copy,
  Sparkles,
  Layers,
  Percent,
  Check,
  AlertCircle,
  Hash,
  FileText
} from 'lucide-react';
import { Branch, UserRole } from '../types.ts';

export const BranchManager: React.FC = () => {
  const {
    currentUser,
    activeRole,
    isHQ,
    currentBranch,
    branches,
    addBranch,
    updateBranch,
    deleteBranch,
    walletTransactions,
    topUpBranchWallet,
    verifyWalletTransaction,
    whitelabelConfig,
    themeColors,
    simulatedDate,
    users,
    language,
    t
  } = usePortal();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteBranch, setInviteBranch] = useState<Branch | null>(null);
  const [inviteRole, setInviteRole] = useState<'branch_owner' | 'branch_manager'>('branch_owner');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletBranch, setWalletBranch] = useState<Branch | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(5000000);
  const [topUpNotes, setTopUpNotes] = useState('');
  const [topUpProofUrl, setTopUpProofUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    location: string;
    city: string;
    address: string;
    phone: string;
    package_tier: 'Starter' | 'Standard' | 'Premium' | 'Custom';
    custom_retainer_fee: number;
    initial_wallet_balance: number;
    max_monthly_design_requests: number;
    max_monthly_active_promos: number;
    lead_days: number;
    pic_name: string;
    pic_phone: string;
    pic_email: string;
    owner_name: string;
    owner_phone: string;
    owner_email: string;
    default_caption_template: string;
    default_hashtags: string;
  }>({
    name: '',
    code: '',
    location: '',
    city: 'Badung, Bali',
    address: '',
    phone: '+62 812-3456-7890',
    package_tier: 'Standard',
    custom_retainer_fee: 5000000,
    initial_wallet_balance: 5000000,
    max_monthly_design_requests: 12,
    max_monthly_active_promos: 4,
    lead_days: 5,
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    default_caption_template: '🔥 {title}!\n\nDelicious authentic flavors and signature broth crafted fresh daily at {brand_name} {branch_name}.\n\n📍 {location}, {city}\n⏰ Open Daily: 10:00 - 22:00 WITA\n\nTag your foodie friends who need to visit this weekend! 👇',
    default_hashtags: '#moggumung #japaneseramen #kulinerbali #balifoodies #foodgasm'
  });

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      code: '',
      location: '',
      city: 'Badung, Bali',
      address: '',
      phone: '+62 812-3456-7890',
      package_tier: 'Standard',
      custom_retainer_fee: whitelabelConfig.default_monthly_retainer,
      initial_wallet_balance: 5000000,
      max_monthly_design_requests: 12,
      max_monthly_active_promos: 4,
      lead_days: 5,
      pic_name: '',
      pic_phone: '',
      pic_email: '',
      owner_name: '',
      owner_phone: '',
      owner_email: '',
      default_caption_template: `🔥 {title}!\n\nDelicious authentic flavors and signature broth crafted fresh daily at ${whitelabelConfig.brand_name} {branch_name}.\n\n📍 {location}, {city}\n⏰ Open Daily: 10:00 - 22:00 WITA\n\nTag your foodie friends who need to visit this weekend! 👇`,
      default_hashtags: `#${whitelabelConfig.brand_name.toLowerCase().replace(/\s/g, '')} #kulinerbali #balifoodies #foodgasm`
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code || branch.name.substring(0, 3).toUpperCase(),
      location: branch.location,
      city: branch.city,
      address: branch.address || branch.location,
      phone: branch.phone,
      package_tier: branch.package_tier || 'Standard',
      custom_retainer_fee: branch.custom_retainer_fee || whitelabelConfig.default_monthly_retainer,
      initial_wallet_balance: branch.wallet_balance || 0,
      max_monthly_design_requests: branch.max_monthly_design_requests || 12,
      max_monthly_active_promos: branch.max_monthly_active_promos || 4,
      lead_days: branch.lead_days || 5,
      pic_name: branch.pic_name || branch.contact_person || '',
      pic_phone: branch.pic_phone || branch.phone || '',
      pic_email: branch.pic_email || '',
      owner_name: branch.owner_name || '',
      owner_phone: branch.owner_phone || '',
      owner_email: branch.owner_email || '',
      default_caption_template: branch.default_caption_template || `🔥 {title}!\n\nDelicious authentic flavors and signature broth crafted fresh daily at ${whitelabelConfig.brand_name} {branch_name}.\n\n📍 {location}, {city}\n⏰ Open Daily: 10:00 - 22:00 WITA\n\nTag your foodie friends who need to visit this weekend! 👇`,
      default_hashtags: branch.default_hashtags || `#${whitelabelConfig.brand_name.toLowerCase().replace(/\s/g, '')} #${branch.name.toLowerCase().replace(/\s/g, '')} #kulinerbali #balifoodies`
    });
    setIsAddEditOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateBranch(editingBranch.id, {
        name: formData.name,
        code: formData.code.toUpperCase(),
        location: formData.location,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        contact_person: formData.pic_name || formData.owner_name || 'Store Manager',
        package_tier: formData.package_tier,
        custom_retainer_fee: formData.custom_retainer_fee,
        max_monthly_design_requests: formData.max_monthly_design_requests,
        max_monthly_active_promos: formData.max_monthly_active_promos,
        lead_days: formData.lead_days,
        pic_name: formData.pic_name,
        pic_phone: formData.pic_phone,
        pic_email: formData.pic_email,
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone,
        owner_email: formData.owner_email,
        default_caption_template: formData.default_caption_template,
        default_hashtags: formData.default_hashtags
      });
    } else {
      addBranch({
        name: formData.name,
        code: formData.code.toUpperCase(),
        location: formData.location,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        contact_person: formData.pic_name || formData.owner_name || 'Store Manager',
        package_tier: formData.package_tier,
        custom_retainer_fee: formData.custom_retainer_fee,
        initial_wallet_balance: formData.initial_wallet_balance,
        contract_status: 'active',
        max_monthly_design_requests: formData.max_monthly_design_requests,
        max_monthly_active_promos: formData.max_monthly_active_promos,
        lead_days: formData.lead_days,
        pic_name: formData.pic_name,
        pic_phone: formData.pic_phone,
        pic_email: formData.pic_email,
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone,
        owner_email: formData.owner_email,
        default_caption_template: formData.default_caption_template,
        default_hashtags: formData.default_hashtags
      });
    }
    setIsAddEditOpen(false);
  };

  const handleDelete = (branch: Branch) => {
    if (confirm(language === 'ko' ? `정말 [${branch.name}] 지점을 삭제하시겠습니까?` : `Are you sure you want to delete/archive branch "${branch.name}"?`)) {
      deleteBranch(branch.id);
    }
  };

  const handleOpenInvite = (branch: Branch, defaultRole: 'branch_owner' | 'branch_manager' = 'branch_owner') => {
    setInviteBranch(branch);
    setInviteRole(defaultRole);
    setInviteName(defaultRole === 'branch_owner' ? branch.owner_name || 'Branch Owner' : branch.pic_name || 'Store Manager');
    setInvitePhone(defaultRole === 'branch_owner' ? branch.owner_phone || branch.phone : branch.pic_phone || branch.phone);
    setIsInviteOpen(true);
  };

  const handleOpenWallet = (branch: Branch) => {
    setWalletBranch(branch);
    setTopUpAmount(5000000);
    setTopUpNotes('');
    setIsWalletModalOpen(true);
  };

  const handleExecuteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletBranch) return;
    topUpBranchWallet(
      walletBranch.id,
      topUpAmount,
      topUpProofUrl,
      topUpNotes || (language === 'ko' ? '메타 광고 및 촬영용 지갑 충전' : 'Ad wallet top-up for Meta Ads & photoshoot.')
    );
    setIsWalletModalOpen(false);
  };

  // Filtered branches - if branch user, only show their own branch
  const visibleBranches = isHQ
    ? branches
    : branches.filter((b) => b.id === currentBranch?.id);

  const filteredBranches = visibleBranches.filter((b) => {
    if (statusFilter !== 'all' && b.contract_status !== statusFilter) return false;
    if (packageFilter !== 'all' && b.package_tier !== packageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchCode = (b.code || '').toLowerCase().includes(q);
      const matchCity = b.city.toLowerCase().includes(q);
      const matchPic = (b.pic_name || b.contact_person || '').toLowerCase().includes(q);
      const matchOwner = (b.owner_name || '').toLowerCase().includes(q);
      return matchName || matchCode || matchCity || matchPic || matchOwner;
    }
    return true;
  });

  // Aggregate Metrics
  const totalBranches = visibleBranches.length;
  const activeBranches = visibleBranches.filter((b) => b.contract_status === 'active').length;
  const totalNetworkWallet = visibleBranches.reduce((sum, b) => sum + (b.wallet_balance || 0), 0);
  const avgMonthlyRetainer = Math.round(
    visibleBranches.reduce((sum, b) => sum + (b.custom_retainer_fee || whitelabelConfig.default_monthly_retainer), 0) / (totalBranches || 1)
  );

  // Invite link generation
  const generatedInviteToken = inviteBranch ? `inv_${inviteBranch.id.replace('branch-', '')}_${inviteRole}_${Date.now().toString().slice(-4)}` : '';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?invite=${inviteRole}&branch=${inviteBranch?.id}&token=${generatedInviteToken}`
    : `https://moggumung.portal/join`;

  const inviteMessage = language === 'ko'
    ? `[${whitelabelConfig.brand_name} 가맹점 포털 초대장]\n\n안녕하세요 ${inviteName} 님 (${inviteBranch?.name})!\n${whitelabelConfig.brand_name} 마케팅 & 외주 관리 포털에 *${inviteRole === 'branch_owner' ? '가맹점 대표(Branch Owner)' : '매장 매니저(Store PIC)'}* 권한으로 초대되었습니다.\n\n아래 공식 링크를 통해 비밀번호를 설정하고 지점 포털에 접속하세요:\n${inviteUrl}\n\n로그인 번호: ${invitePhone}\n\n감사합니다.\n${whitelabelConfig.brand_name} 본사 운영팀`
    : `Hello ${inviteName} (${inviteBranch?.name}) 🍜\n\nYou have been invited to join the ${whitelabelConfig.brand_name} Creative & Marketing Portal as *${inviteRole === 'branch_owner' ? 'Branch Owner' : 'Store Manager (PIC)'}*.\n\nPlease click the official link below to set your password and access your branch portal:\n${inviteUrl}\n\nLogin Phone: ${invitePhone}\n\nWarm regards,\n${whitelabelConfig.brand_name} HQ Operations Team`;

  const phoneClean = invitePhone.replace(/[^0-9]/g, '');
  const inviteWaUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(inviteMessage)}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-1 border border-orange-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isHQ ? 'HQ Control Center' : 'Branch Settings'}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
                {language === 'ko' ? '가맹 지점 및 계약 패키지 설정' : 'Franchise Branch & Package Management'}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {language === 'ko'
                  ? '지점 정보, 캡션 템플릿, 광고 예치금 지갑(Wallet), PIC 및 대표 온보딩 관리'
                  : 'Manage franchise branches, caption templates, ad deposit wallets, and PIC/Owner onboarding.'}
              </p>
            </div>
          </div>

          {/* Action Button (Only HQ can add new branch) */}
          {isHQ && (
            <button
              onClick={handleOpenAdd}
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="px-5 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-orange-500/20 hover:brightness-110 transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ko' ? '+ 신규 지점 등록' : '+ Add New Branch'}</span>
            </button>
          )}
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'ko' ? '총 가맹점' : 'Total Outlets'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalBranches}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {activeBranches} {language === 'ko' ? '운영중' : 'Active'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {language === 'ko' ? '총 광고 지갑 잔액' : 'Total Ad Wallet'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {whitelabelConfig.currency_symbol} {(totalNetworkWallet / 1000000).toFixed(1)}M
              </span>
              <span className="text-[11px] text-emerald-600/80">{language === 'ko' ? '예치금' : 'Deposits'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50">
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
              {language === 'ko' ? '월간 리테이너' : 'Monthly Retainer'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-sky-700 dark:text-sky-300 font-mono">
                {whitelabelConfig.currency_symbol} {(avgMonthlyRetainer / 1000000).toFixed(1)}M
              </span>
              <span className="text-[11px] text-sky-600/80">/ {language === 'ko' ? '월' : 'mo'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              {language === 'ko' ? '온보딩 상태' : 'Onboarding Status'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300">100%</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{language === 'ko' ? 'PIC 연결됨' : 'PICs Linked'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      {isHQ && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ko' ? '지점명, 코드(SMY/UBD), 도시, 대표, PIC 검색...' : 'Search branch name, code (SMY/UBD), city, owner, PIC...'}
                className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Package Filter */}
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">{language === 'ko' ? '모든 패키지' : 'All Packages'}</option>
              <option value="Starter">Starter (Rp 4.5M)</option>
              <option value="Standard">Standard (Rp 5.0M)</option>
              <option value="Premium">Premium (Rp 6.5M)</option>
              <option value="Custom">Custom Package</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">{language === 'ko' ? '모든 상태' : 'All Status'}</option>
              <option value="active">{language === 'ko' ? '운영중 (Active)' : 'Active'}</option>
              <option value="suspended">{language === 'ko' ? '일시중단 (Suspended)' : 'Suspended'}</option>
              <option value="terminated">{language === 'ko' ? '계약종료 (Terminated)' : 'Terminated'}</option>
            </select>
          </div>
        </div>
      )}

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredBranches.map((b) => {
          const packageBadge = () => {
            switch (b.package_tier) {
              case 'Premium':
                return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
              case 'Starter':
                return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
              case 'Custom':
                return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
              default:
                return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            }
          };

          return (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:border-orange-500/40 dark:hover:border-orange-500/40 transition flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Name, Code, Package */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        {b.code || b.name.substring(0, 3).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight font-['Space_Grotesk']">
                          {b.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">{b.city}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${packageBadge()}`}>
                    {b.package_tier || 'Standard'}
                  </span>
                </div>

                {/* Location / Address */}
                <div className="mt-3.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed text-[11px]">
                    {b.address || b.location}
                  </span>
                </div>

                {/* Pricing & Wallet Matrix */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40">
                    <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase block">
                      {language === 'ko' ? '월 리테이너 요금' : 'Monthly Retainer'}
                    </span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-xs mt-0.5 block">
                      {whitelabelConfig.currency_symbol} {(b.custom_retainer_fee || whitelabelConfig.default_monthly_retainer).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                        {language === 'ko' ? '광고 지갑' : 'Wallet Balance'}
                      </span>
                      {isHQ && (
                        <button
                          onClick={() => handleOpenWallet(b)}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                        >
                          + Top-Up
                        </button>
                      )}
                    </div>
                    <span className="font-mono font-black text-emerald-800 dark:text-emerald-300 text-xs mt-0.5">
                      {whitelabelConfig.currency_symbol} {(b.wallet_balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Caption / Hashtag Preset Preview */}
                <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{language === 'ko' ? '모의 시뮬레이터 캡션 기본값' : 'Mockup Caption Preset'}</span>
                    </span>
                    <span className="text-slate-400 font-normal truncate max-w-[120px] font-mono">
                      {b.default_hashtags ? b.default_hashtags.slice(0, 20) + '...' : '#moggumung'}
                    </span>
                  </div>
                </div>

                {/* Key Contacts (Owner & PIC) */}
                <div className="mt-3.5 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'ko' ? '지점 대표:' : 'Owner:'}</span>
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {b.owner_name || 'Budi Santoso'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'ko' ? '매장 매니저(PIC):' : 'Store PIC:'}</span>
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {b.pic_name || b.contact_person}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* Invite Link Button (HQ Only) */}
                  {isHQ && (
                    <button
                      onClick={() => handleOpenInvite(b, 'branch_owner')}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title={language === 'ko' ? 'WhatsApp 초대 링크 발급' : 'Invite Owner / PIC via WhatsApp'}
                    >
                      <Share2 className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-[11px]">{language === 'ko' ? '초대' : 'Invite'}</span>
                    </button>
                  )}

                  {/* Wallet Button */}
                  <button
                    onClick={() => handleOpenWallet(b)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title={language === 'ko' ? '지갑 잔액 및 충전' : 'Manage Ad Wallet'}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Wallet</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title={language === 'ko' ? '지점 설정 & 캡션 수정' : 'Edit Branch & Caption Settings'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {isHQ && (
                    <button
                      onClick={() => handleDelete(b)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      title={language === 'ko' ? '지점 삭제' : 'Delete Branch'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. Add / Edit Branch & Caption Settings Modal              */}
      {/* ======================================================== */}
      {isAddEditOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-orange-500 text-white shadow-sm">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                      {editingBranch
                        ? (language === 'ko' ? '가맹 지점 및 캡션 설정 수정' : 'Edit Franchise Branch & Caption Settings')
                        : (language === 'ko' ? '신규 가맹 지점 등록' : 'Register New Franchise Branch')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'ko'
                        ? '지점 정보, 패키지 요금, 인스타그램 모의 캡션 템플릿 및 해시태그를 설정합니다.'
                        : 'Configure branch details, retainer package rates, and default Instagram mockup caption templates.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddEditOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveBranch} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '지점명' : 'Branch Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Moggumung Jimbaran"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '지점 코드 (3자리)' : 'Outlet Code (3 Letters)'} *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="JBR"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '도시 / 지역' : 'City / Region'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Badung, Bali"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '지점 대표 전화번호' : 'Branch Phone / Hotline'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+62 812-3456-7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '상세 주소' : 'Full Store Address'} *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Street address, building number, landmarks..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value, location: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Section: Mockup Simulator Caption & Hashtag Settings */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{language === 'ko' ? '소셜 미디어 시뮬레이터 캡션 기본 템플릿' : 'Mockup Simulator Default Caption & Hashtags'}</span>
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                      {language === 'ko' ? '지점 맞춤 자동 적용' : 'Auto-filled for Branch'}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '기본 캡션 템플릿 ({title}, {branch_name}, {location}, {city} 치환 가능)' : 'Default Caption Template (Supports {title}, {branch_name}, {location}, {city})'}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.default_caption_template}
                      onChange={(e) => setFormData({ ...formData, default_caption_template: e.target.value })}
                      placeholder="🔥 {title}!\n\nDelicious authentic flavors at {brand_name} {branch_name}..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono leading-relaxed focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '기본 해시태그 목록' : 'Default Brand & Branch Hashtags'}
                    </label>
                    <input
                      type="text"
                      value={formData.default_hashtags}
                      onChange={(e) => setFormData({ ...formData, default_hashtags: e.target.value })}
                      placeholder="#moggumung #balifoodies #kulinerbali"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Package & Pricing Tier (HQ Only editable) */}
                {isHQ && (
                  <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 space-y-3">
                    <span className="text-xs font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-orange-600" />
                      <span>{language === 'ko' ? '패키지 요금 및 리테이너 요율' : 'Retainer Package & Pricing'}</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'ko' ? '패키지 등급' : 'Package Tier'}
                        </label>
                        <select
                          value={formData.package_tier}
                          onChange={(e) => {
                            const tier = e.target.value as Branch['package_tier'];
                            let fee = formData.custom_retainer_fee;
                            if (tier === 'Starter') fee = 4500000;
                            if (tier === 'Standard') fee = 5000000;
                            if (tier === 'Premium') fee = 6500000;
                            setFormData({ ...formData, package_tier: tier || 'Standard', custom_retainer_fee: fee });
                          }}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Starter">Starter (Rp 4.500.000 / mo)</option>
                          <option value="Standard">Standard (Rp 5.000.000 / mo)</option>
                          <option value="Premium">Premium Pro (Rp 6.500.000 / mo)</option>
                          <option value="Custom">Custom Rate</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'ko' ? '월간 리테이너 비용 (Rp)' : 'Monthly Retainer Fee (Rp)'}
                        </label>
                        <input
                          type="number"
                          step="100000"
                          value={formData.custom_retainer_fee}
                          onChange={(e) => setFormData({ ...formData, custom_retainer_fee: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {!editingBranch && (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'ko' ? '초기 광고 지갑 예치금 (Rp)' : 'Initial Ad Deposit Wallet (Rp)'}
                        </label>
                        <input
                          type="number"
                          step="500000"
                          value={formData.initial_wallet_balance}
                          onChange={(e) => setFormData({ ...formData, initial_wallet_balance: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* PIC & Owner Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Branch Owner Contact */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === 'ko' ? '지점 대표 정보' : 'Branch Owner Details'}</span>
                    </span>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                        {language === 'ko' ? '대표자 성명' : 'Owner Name'}
                      </label>
                      <input
                        type="text"
                        placeholder="Owner Full Name"
                        value={formData.owner_name}
                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                        {language === 'ko' ? '대표자 휴대폰 (로그인 ID)' : 'Owner WhatsApp / Mobile (Login)'}
                      </label>
                      <input
                        type="text"
                        placeholder="+62 812-xxxx-xxxx"
                        value={formData.owner_phone}
                        onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Store PIC Contact */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-sky-500" />
                      <span>{language === 'ko' ? '매장 매니저(PIC) 정보' : 'Store PIC / Manager Details'}</span>
                    </span>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                        {language === 'ko' ? '매니저 성명' : 'PIC Name'}
                      </label>
                      <input
                        type="text"
                        placeholder="Store Manager Name"
                        value={formData.pic_name}
                        onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                        {language === 'ko' ? '매니저 휴대폰 (로그인 ID)' : 'PIC WhatsApp / Mobile (Login)'}
                      </label>
                      <input
                        type="text"
                        placeholder="+62 812-xxxx-xxxx"
                        value={formData.pic_phone}
                        onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEditOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {language === 'ko' ? '취소' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                    className="px-6 py-2.5 rounded-xl text-xs font-black shadow-md hover:brightness-110 transition cursor-pointer"
                  >
                    {editingBranch
                      ? (language === 'ko' ? '설정 저장' : 'Save Changes')
                      : (language === 'ko' ? '지점 등록' : 'Register Branch')}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 2. Onboarding & Invite Link Modal (WhatsApp & Copy)       */}
      {/* ======================================================== */}
      {isInviteOpen &&
        inviteBranch &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-sm">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                      {language === 'ko' ? '가맹점 대표 / PIC 온보딩 초대' : 'Invite PIC / Owner to Setup Portal Access'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'ko'
                        ? 'WhatsApp 또는 전용 링크로 온보딩 안내 메시지를 발송합니다.'
                        : 'Send official onboarding link to WhatsApp for password setup and portal login.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsInviteOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                {/* Target Branch Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">{inviteBranch.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{inviteBranch.city}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase font-mono">
                    {inviteBranch.code}
                  </span>
                </div>

                {/* Role Switcher (Owner vs Store Manager) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {language === 'ko' ? '초대할 권한 선택' : 'Select Target Role'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setInviteRole('branch_owner');
                        setInviteName(inviteBranch.owner_name || 'Branch Owner');
                        setInvitePhone(inviteBranch.owner_phone || inviteBranch.phone);
                      }}
                      className={`p-3 rounded-2xl border text-left transition font-bold cursor-pointer ${
                        inviteRole === 'branch_owner'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      👑 {language === 'ko' ? '가맹점 대표 (Owner)' : 'Branch Owner'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInviteRole('branch_manager');
                        setInviteName(inviteBranch.pic_name || inviteBranch.contact_person);
                        setInvitePhone(inviteBranch.pic_phone || inviteBranch.phone);
                      }}
                      className={`p-3 rounded-2xl border text-left transition font-bold cursor-pointer ${
                        inviteRole === 'branch_manager'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      🏪 {language === 'ko' ? '매장 매니저 (PIC)' : 'Store Manager (PIC)'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '수신자 성명' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? 'WhatsApp 번호' : 'WhatsApp Number'}
                    </label>
                    <input
                      type="text"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Unique Token Link Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ko' ? '온보딩 초대 링크:' : 'Onboarding Invite Link:'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? (language === 'ko' ? '복사됨!' : 'Copied!') : (language === 'ko' ? '링크 복사' : 'Copy Link')}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 break-all select-all">
                    {inviteUrl}
                  </div>
                </div>

                {/* Preview Message */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? 'WhatsApp 발송 메시지 미리보기:' : 'WhatsApp Message Preview:'}
                  </label>
                  <textarea
                    rows={6}
                    readOnly
                    value={inviteMessage}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {language === 'ko' ? '닫기' : 'Close'}
                </button>

                <a
                  href={inviteWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'ko' ? 'WhatsApp으로 초대장 전송' : 'Send Invite to WhatsApp'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 3. Wallet Top-Up Modal                                    */}
      {/* ======================================================== */}
      {isWalletModalOpen &&
        walletBranch &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-sm">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                      {language === 'ko' ? '광고 및 제작 예치금 지갑 충전' : 'Top-Up Ad & Production Wallet'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {walletBranch.name} • {language === 'ko' ? '현재 잔액:' : 'Current Balance:'}{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {whitelabelConfig.currency_symbol} {(walletBranch.wallet_balance || 0).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWalletModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleExecuteTopUp} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '충전 금액 (Rp)' : 'Top-Up Deposit Amount (Rp)'} *
                  </label>
                  <input
                    type="number"
                    required
                    step="500000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    {[2500000, 5000000, 10000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        +Rp{(amt / 1000000).toFixed(1)}M
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '사용 메모 및 캠페인 목적' : 'Notes / Usage Purpose'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ko' ? 'e.g. 10월 메타 인스타그램 릴스 부스트 광고비 충전' : 'e.g. October Meta Ads reels boost campaign deposit'}
                    value={topUpNotes}
                    onChange={(e) => setTopUpNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '이체 영수증 사진 URL' : 'Bank Transfer Proof URL'}
                  </label>
                  <input
                    type="text"
                    value={topUpProofUrl}
                    onChange={(e) => setTopUpProofUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWalletModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {language === 'ko' ? '취소' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition cursor-pointer"
                  >
                    {language === 'ko' ? '충전 확인 및 반영' : 'Submit & Process Top-Up'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
