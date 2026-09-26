import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  CreditCard, 
  Sparkles, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Plus, 
  Eye, 
  Printer, 
  Check, 
  X, 
  ArrowUpRight,
  ArrowDownRight,
  Building,
  ShieldCheck,
  Sliders,
  Trash2,
  Tag,
  Settings2,
  Package,
  ShieldAlert,
  ArrowLeft,
  MessageSquare,
  Image as ImageIcon,
  Wallet,
  Receipt,
  History,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Layers,
  Send,
  Coffee,
  Laptop,
  Car,
  ShoppingBag
} from 'lucide-react';
import { Invoice, Branch, CustomLineItem, WalletTransaction, BudgetRequest, HqReimbursementRequest, HqReimbursementCategory } from '../types.ts';
import { PrintableInvoiceModal } from './PrintableInvoiceModal.tsx';
import { WhatsAppBroadcastModal } from './WhatsAppBroadcastModal.tsx';
import { PaymentProofModal } from './PaymentProofModal.tsx';

export const BillingManager: React.FC = () => {
  const { 
    currentUser, 
    activeRole, 
    isHQ,
    isHQOwner,
    isHQLeader,
    isBranchOwner,
    canAccessBilling,
    currentBranch, 
    branches, 
    invoices, 
    generateMonthlyInvoices, 
    updateBranchCustomPricing,
    updateInvoiceCharges, 
    uploadPaymentProof, 
    verifyPayment,
    walletTransactions,
    topUpBranchWallet,
    verifyWalletTransaction,
    budgetRequests,
    hqReimbursements,
    addHqReimbursement,
    approveHqReimbursement,
    rejectHqReimbursement,
    disburseHqReimbursementBatch,
    simulatedDate,
    whitelabelConfig,
    t,
    language
  } = usePortal();

  // Guard: ONLY HQ Owner, HQ Leader, and Branch Owner
  if (!canAccessBilling) {
    return (
      <div className="bg-white dark:bg-[#15171e] rounded-2xl p-6 sm:p-10 border border-red-200 dark:border-red-900/50 text-center max-w-xl mx-auto my-6 sm:my-12 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t('billingRestrictedTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          {t('billingRestrictedDesc')}
        </p>
      </div>
    );
  }

  // Active Billing Sub-Tab: 'invoices' | 'wallet' | 'reimbursements'
  const [activeBillingTab, setActiveBillingTab] = useState<'invoices' | 'wallet' | 'reimbursements'>('invoices');

  // Branch filter (if admin/leader)
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    currentBranch ? currentBranch.id : 'all'
  );

  // Status filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [walletFilterType, setWalletFilterType] = useState<string>('all');
  const [reimbursementFilter, setReimbursementFilter] = useState<string>('all');

  // Modal states
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);
  const [selectedInvoiceForCharge, setSelectedInvoiceForCharge] = useState<Invoice | null>(null);
  const [selectedInvoiceForProof, setSelectedInvoiceForProof] = useState<Invoice | null>(null);
  const [selectedInvoiceForProofInspect, setSelectedInvoiceForProofInspect] = useState<Invoice | null>(null);
  const [printableInvoice, setPrintableInvoice] = useState<Invoice | null>(null);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppTargetBranch, setWhatsAppTargetBranch] = useState<Branch | null>(null);

  // Wallet Top-Up Modal State
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpBranchId, setTopUpBranchId] = useState<string>(currentBranch ? currentBranch.id : branches[0]?.id || '');
  const [topUpAmount, setTopUpAmount] = useState<number>(5000000);
  const [topUpProofUrl, setTopUpProofUrl] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
  const [topUpNotes, setTopUpNotes] = useState<string>('');

  // Inspect Budget Audit from Wallet
  const [inspectBudgetAudit, setInspectBudgetAudit] = useState<BudgetRequest | null>(null);

  // HQ Reimbursement Modal States
  const [isNewReimbursementModalOpen, setIsNewReimbursementModalOpen] = useState(false);
  const [reimbCategory, setReimbCategory] = useState<HqReimbursementCategory>('props_equipment');
  const [reimbTitle, setReimbTitle] = useState('');
  const [reimbAmount, setReimbAmount] = useState<number>(350000);
  const [reimbDescription, setReimbDescription] = useState('');
  const [reimbProofUrl, setReimbProofUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');

  // Batch Reimbursement Modal State (Owner payout)
  const [selectedReimbursementIds, setSelectedReimbursementIds] = useState<string[]>([]);
  const [isBatchDisburseModalOpen, setIsBatchDisburseModalOpen] = useState(false);
  const [batchProofUrl, setBatchProofUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
  const [batchReference, setBatchReference] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const [inspectReimbursement, setInspectReimbursement] = useState<HqReimbursementRequest | null>(null);

  // Additional charges inputs (Pusat)
  const [retainerInput, setRetainerInput] = useState<number>(whitelabelConfig.default_monthly_retainer || 5000000);
  const [visitFeeInput, setVisitFeeInput] = useState<number>(0);
  const [adBudgetInput, setAdBudgetInput] = useState<number>(0);
  const [customItemsInput, setCustomItemsInput] = useState<CustomLineItem[]>([]);
  const [notesInput, setNotesInput] = useState<string>('');

  // Proof upload inputs (Branch Owner)
  const [proofUrlInput, setProofUrlInput] = useState<string>('');
  const [proofNotesInput, setProofNotesInput] = useState<string>('');

  const [notification, setNotification] = useState<string | null>(null);

  // Filter branches visible to current user (Branch isolation: branch owners ONLY see their own branch)
  const visibleBranches = useMemo(() => {
    if (isHQ) return branches;
    if (currentUser.branch_id) {
      return branches.filter((b) => b.id === currentUser.branch_id);
    }
    return branches;
  }, [branches, isHQ, currentUser.branch_id]);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchBranch = isHQ
      ? selectedBranchId === 'all' || inv.branch_id === selectedBranchId
      : inv.branch_id === currentBranch?.id;
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchBranch && matchStatus;
  });

  // Filter wallet transactions (Branch isolation: branch owners ONLY see transactions for their own branch)
  const filteredWalletTransactions = walletTransactions.filter((tx) => {
    const matchBranch = isHQ ? true : tx.branch_id === currentUser.branch_id;
    const matchType = walletFilterType === 'all' || tx.type === walletFilterType;
    return matchBranch && matchType;
  });

  // Filter HQ Reimbursements
  const filteredReimbursements = hqReimbursements.filter((r) => {
    const matchStatus = reimbursementFilter === 'all' || r.status === reimbursementFilter;
    const matchUser = isHQOwner || isHQLeader ? true : r.requester_id === currentUser.id;
    return matchStatus && matchUser;
  });

  const handleRunAutoInvoice = (month: string) => {
    const res = generateMonthlyInvoices(month);
    setNotification(res.message);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenAddCharges = (inv: Invoice) => {
    setSelectedInvoiceForCharge(inv);
    setRetainerInput(inv.retainer_fee || whitelabelConfig.default_monthly_retainer || 5000000);
    setVisitFeeInput(inv.visit_fee || 0);
    setAdBudgetInput(inv.ad_budget || 0);
    setCustomItemsInput(inv.custom_items ? [...inv.custom_items] : []);
    setNotesInput(inv.additional_notes || '');
  };

  const handleSaveCharges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForCharge) return;

    updateInvoiceCharges(
      selectedInvoiceForCharge.id,
      Number(visitFeeInput),
      Number(adBudgetInput),
      customItemsInput,
      Number(retainerInput),
      notesInput
    );

    setSelectedInvoiceForCharge(null);
  };

  const handleOpenProofModal = (inv: Invoice) => {
    setSelectedInvoiceForProof(inv);
    setProofUrlInput(inv.proof_url || '');
    setProofNotesInput(inv.proof_notes || '');
  };

  const handleSaveProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForProof) return;

    uploadPaymentProof(
      selectedInvoiceForProof.id,
      proofUrlInput || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      proofNotesInput
    );

    setSelectedInvoiceForProof(null);
  };

  const handleAddCustomItem = () => {
    setCustomItemsInput([
      ...customItemsInput,
      {
        id: `item-${Date.now()}`,
        name: language === 'ko' ? '추가 인쇄물 제작' : 'Custom Print Production',
        amount: 350000
      }
    ]);
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItemsInput(customItemsInput.filter((item) => item.id !== id));
  };

  const handleUpdateCustomItem = (id: string, field: 'name' | 'amount', val: any) => {
    setCustomItemsInput(
      customItemsInput.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const calculateModalTotal = () => {
    const customSum = customItemsInput.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return Number(retainerInput || 0) + Number(visitFeeInput || 0) + Number(adBudgetInput || 0) + customSum;
  };

  const handleCreateReimbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reimbTitle.trim()) {
      alert(language === 'ko' ? '경비 항목명을 입력해주세요.' : 'Please enter expense item title.');
      return;
    }
    const res = addHqReimbursement({
      category: reimbCategory,
      title: reimbTitle.trim(),
      amount: reimbAmount,
      description: reimbDescription,
      receipt_proof_url: reimbProofUrl
    });
    setNotification(res.message);
    setIsNewReimbursementModalOpen(false);
    setReimbTitle('');
    setReimbDescription('');
  };

  const handleBatchDisburseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReimbursementIds.length === 0) return;
    const res = disburseHqReimbursementBatch(
      selectedReimbursementIds,
      batchProofUrl,
      batchReference || `BCA-REIMB-${Date.now().toString().slice(-6)}`,
      batchNotes
    );
    setNotification(res.message);
    setIsBatchDisburseModalOpen(false);
    setSelectedReimbursementIds([]);
    setBatchReference('');
    setBatchNotes('');
  };

  const toggleSelectReimbursement = (id: string) => {
    setSelectedReimbursementIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedTotalAmount = useMemo(() => {
    return hqReimbursements
      .filter((r) => selectedReimbursementIds.includes(r.id))
      .reduce((sum, r) => sum + r.amount, 0);
  }, [hqReimbursements, selectedReimbursementIds]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              <span>{whitelabelConfig.brand_name} Finance, Retainer &amp; Ad Wallet Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Space_Grotesk']">
              {t('invoicingTitle')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {language === 'ko'
                ? `월 고정비(${whitelabelConfig.currency_symbol} ${whitelabelConfig.default_monthly_retainer.toLocaleString()}), 지점 광고/촬영 예치금 지갑(Wallet), 본사 팀 경비 정산(Reimbursement) 시스템`
                : `Manage branch retainers (${whitelabelConfig.currency_symbol} ${whitelabelConfig.default_monthly_retainer.toLocaleString()}), ad deposit wallets, top-up receipts, and HQ team reimbursements.`}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTopUpBranchId(currentBranch ? currentBranch.id : visibleBranches[0]?.id || '');
                setIsTopUpModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{language === 'ko' ? '예치금 지갑 충전' : 'Top-Up Ad Wallet'}</span>
            </button>

            {isHQ && (
              <button
                onClick={() => handleRunAutoInvoice('2026-10')}
                className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ko' ? '10월 청구서 자동 발행' : 'Auto-Generate Oct Invoices'}</span>
              </button>
            )}

            {isHQ && (
              <button
                onClick={() => {
                  setActiveBillingTab('reimbursements');
                  setIsNewReimbursementModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>{language === 'ko' ? '본사 경비 청구' : 'Claim HQ Expense'}</span>
              </button>
            )}
          </div>
        </div>

        {notification && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveBillingTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeBillingTab === 'invoices'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-[#15171e] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'ko' ? '월간 리테이너 청구서' : 'Monthly Retainer Invoices'}</span>
          <span className="px-1.5 py-0.2 bg-slate-700 text-white rounded-md text-[10px] font-bold">
            {filteredInvoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveBillingTab('wallet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeBillingTab === 'wallet'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#15171e] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{language === 'ko' ? '광고/제작 예치금 지갑' : 'Ad & Production Wallet'}</span>
          <span className="px-1.5 py-0.2 bg-emerald-700 text-white rounded-md text-[10px] font-bold">
            {filteredWalletTransactions.length}
          </span>
        </button>

        {isHQ && (
          <button
            onClick={() => setActiveBillingTab('reimbursements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeBillingTab === 'reimbursements'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#15171e] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{language === 'ko' ? '본사 팀 경비 청구 및 정산' : 'HQ Team Expenses & Reimbursements'}</span>
            <span className="px-1.5 py-0.2 bg-indigo-700 text-white rounded-md text-[10px] font-bold">
              {hqReimbursements.length}
            </span>
          </button>
        )}
      </div>

      {/* ========================================================== */}
      {/* VIEW 1: MONTHLY INVOICES                                    */}
      {/* ========================================================== */}
      {activeBillingTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-[#15171e] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Branch filter if HQ */}
              {isHQ && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('branch')}:</span>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="all">{language === 'ko' ? '전체 지점' : 'All Branches'}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('status')}:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="all">{language === 'ko' ? '전체 상태' : 'All Status'}</option>
                  <option value="unpaid">{t('statusUnpaid')}</option>
                  <option value="proof_uploaded">{t('statusProofUploaded')}</option>
                  <option value="paid">{t('statusPaid')}</option>
                  <option value="overdue">{t('statusOverdue')}</option>
                </select>
              </div>
            </div>

            <span className="text-slate-400 font-semibold ml-auto md:ml-0">
              {filteredInvoices.length} {language === 'ko' ? '건 청구서' : 'invoices'}
            </span>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-[#15171e] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">{t('branch')}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '정산 회기' : 'Period'}</th>
                    <th className="py-3 px-4">{t('retainerFee')}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '촬영/광고/기타' : 'Extras & Ads'}</th>
                    <th className="py-3 px-4">{t('totalInvoice')}</th>
                    <th className="py-3 px-4">{t('paymentStatus')}</th>
                    <th className="py-3 px-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        {language === 'ko' ? '등록된 청구서가 없습니다.' : 'No invoices found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const branchObj = branches.find((b) => b.id === inv.branch_id);
                      const extraAmount = (inv.visit_fee || 0) + (inv.ad_budget || 0) + (inv.custom_items?.reduce((a, c) => a + c.amount, 0) || 0);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {inv.invoice_number}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                            {branchObj?.name}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                            {inv.period_month.slice(0, 7)}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-semibold">
                            {whitelabelConfig.currency_symbol} {inv.retainer_fee.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                            {extraAmount > 0 ? (
                              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                                +{whitelabelConfig.currency_symbol} {extraAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-black text-slate-900 dark:text-slate-100 text-sm">
                            {whitelabelConfig.currency_symbol} {inv.total_amount.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : inv.status === 'proof_uploaded'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                                  : inv.status === 'overdue'
                                  ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              }`}
                            >
                              {inv.status === 'paid' && t('statusPaid')}
                              {inv.status === 'proof_uploaded' && t('statusProofUploaded')}
                              {inv.status === 'unpaid' && t('statusUnpaid')}
                              {inv.status === 'overdue' && t('statusOverdue')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                            {/* Official Watermarked PDF Invoice Preview */}
                            <button
                              onClick={() => setPrintableInvoice(inv)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                              title={language === 'ko' ? '공식 영수증 인쇄 / PDF' : 'Official Watermarked PDF / Print'}
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            </button>

                            {/* WhatsApp Invoice Reminder (HQ) */}
                            {isHQ && (
                              <button
                                onClick={() => {
                                  setWhatsAppTargetBranch(branchObj || null);
                                  setWhatsAppModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
                                title={language === 'ko' ? 'WhatsApp 청구서 알림 발송' : 'Send WhatsApp Invoice Reminder'}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Check / Inspect Payment Proof (HQ & Branch) */}
                            {inv.proof_url && (
                              <button
                                onClick={() => setSelectedInvoiceForProofInspect(inv)}
                                className="p-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 transition font-bold text-[11px] cursor-pointer"
                                title={language === 'ko' ? '입금 확인증 보기' : 'Inspect Payment Slip'}
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedInvoiceForDetail(inv)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                              title={language === 'ko' ? '상세보기' : 'View Details'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Branch Owner: Upload Proof */}
                            {!isHQ && inv.status !== 'paid' && (
                              <button
                                onClick={() => handleOpenProofModal(inv)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] shadow-xs inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Upload className="w-3 h-3" />
                                <span>{t('uploadProof')}</span>
                              </button>
                            )}

                            {/* HQ: Add Extra Charges & Verify */}
                            {isHQ && (
                              <>
                                <button
                                  onClick={() => handleOpenAddCharges(inv)}
                                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{language === 'ko' ? '청구 항목 조정' : 'Edit Items'}</span>
                                </button>

                                {inv.status === 'proof_uploaded' && (
                                  <button
                                    onClick={() => setSelectedInvoiceForProofInspect(inv)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{language === 'ko' ? '입금 확인 및 승인' : 'Verify Receipt'}</span>
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW 2: BRANCH AD WALLET & PRODUCTION DEPOSIT LEDGER       */}
      {/* ========================================================== */}
      {activeBillingTab === 'wallet' && (
        <div className="space-y-5">
          {/* Branch Wallet Balances Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === 'ko'
                    ? (isHQ ? '가맹점 광고/제작 예치금 잔액 현황' : '지점 광고/제작 예치금 잔액')
                    : (isHQ ? 'Branch Ad & Production Wallet Balances' : 'Branch Ad & Production Wallet Balance')}
                </span>
              </h3>
              <button
                onClick={() => {
                  setTopUpBranchId(currentBranch ? currentBranch.id : visibleBranches[0]?.id || '');
                  setIsTopUpModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ko' ? '예치금 충전 신청' : 'Top-Up Saldo'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {visibleBranches.map((b) => {
                const isSelected = selectedBranchId === b.id;
                return (
                  <div
                    key={b.id}
                    className={`bg-white dark:bg-[#15171e] p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {b.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {b.code || b.city}
                      </span>
                    </div>

                    <div className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      {whitelabelConfig.currency_symbol} {(b.wallet_balance || 0).toLocaleString()}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        {language === 'ko' ? '잔액 상태:' : 'Status Saldo:'}
                      </span>
                      <span className={`font-bold ${(b.wallet_balance || 0) > 2000000 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {(b.wallet_balance || 0) > 2000000 
                          ? (language === 'ko' ? '✅ 안정적' : '✅ Aman') 
                          : (language === 'ko' ? '⚠️ 충전 필요' : '⚠️ Perlu Top Up')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Top-Up Verifications for HQ Owner & Leader */}
          {isHQ && walletTransactions.filter((tx) => tx.status === 'pending').length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 dark:text-amber-200 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>
                    {language === 'ko'
                      ? `예치금 충전 승인 대기 (${walletTransactions.filter((tx) => tx.status === 'pending').length})`
                      : `Incoming Top-Up Verification Requests (${walletTransactions.filter((tx) => tx.status === 'pending').length})`}
                  </span>
                </span>
                <span className="text-[11px] text-amber-800 dark:text-amber-300">
                  {language === 'ko' ? '이체 확인증을 검토한 후 승인해주세요.' : 'Verify transfer receipt before crediting branch wallet balance'}
                </span>
              </div>

              <div className="divide-y divide-amber-200/60 dark:divide-amber-900/40">
                {walletTransactions
                  .filter((tx) => tx.status === 'pending')
                  .map((tx) => (
                    <div key={tx.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {tx.branch_name} • {whitelabelConfig.currency_symbol} {tx.amount.toLocaleString()}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {tx.description} • {tx.created_at}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tx.proof_url && (
                          <a
                            href={tx.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{language === 'ko' ? '영수증 보기' : 'View Slip'}</span>
                          </a>
                        )}

                        <button
                          onClick={() => verifyWalletTransaction(tx.id, false)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs cursor-pointer"
                        >
                          {language === 'ko' ? '거절' : 'Reject'}
                        </button>
                        <button
                          onClick={() => verifyWalletTransaction(tx.id, true)}
                          className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                        >
                          {language === 'ko' ? '승인 및 충전' : 'Approve & Credit'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Wallet Transaction Ledger Table */}
          <div className="bg-white dark:bg-[#15171e] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>{language === 'ko' ? '지갑 거래 내역 및 광고비 차감 기록 (Audit Ledger)' : 'Histori Mutasi Saldo & Realisasi Pengeluaran Iklan'}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'ko' 
                    ? '모든 지출 내역은 본사 이체 증빙 및 크리에이티브팀 집행 보고서(LPJ)와 연결됩니다.' 
                    : 'Every deduction contains HQ transfer proof and creative team LPJ report.'}
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5">
                {(['all', 'top_up', 'budget_deduct'] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setWalletFilterType(ft)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition capitalize cursor-pointer ${
                      walletFilterType === ft
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {ft === 'all' 
                      ? (language === 'ko' ? '전체 내역' : 'Semua Mutasi') 
                      : ft === 'top_up' 
                      ? (language === 'ko' ? '충전 입금' : 'Top-Up Masuk') 
                      : (language === 'ko' ? '광고/촬영 차감' : 'Potongan Iklan/Shoot')}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{language === 'ko' ? '일자' : 'Tanggal'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '지점' : 'Cabang'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '거래 구분' : 'Jenis Transaksi'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '내용 및 참조' : 'Keterangan / Ref'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '금액' : 'Nominal'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '상태' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{language === 'ko' ? '증빙 및 LPJ' : 'Audit & LPJ'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredWalletTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        {language === 'ko' ? '거래 내역이 없습니다.' : 'Belum ada transaksi pada saldo dompet deposit.'}
                      </td>
                    </tr>
                  ) : (
                    filteredWalletTransactions.map((tx) => {
                      const relatedBudget = tx.reference_id ? budgetRequests.find((b) => b.id === tx.reference_id) : null;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {tx.created_at}
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {tx.branch_name}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'top_up'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            }`}>
                              {tx.type === 'top_up' ? (
                                <>
                                  <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                                  <span>{language === 'ko' ? '예치금 충전' : 'TOP-UP SALDO'}</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="w-3 h-3 text-rose-600" />
                                  <span>{language === 'ko' ? '광고/제작비 차감' : 'POTONGAN IKLAN / PRODUKSI'}</span>
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{tx.title}</div>
                            <div className="text-[10px] text-slate-400 truncate">{tx.description}</div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap font-black font-mono text-sm">
                            <span className={tx.type === 'top_up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}>
                              {tx.type === 'top_up' ? '+' : '-'}{whitelabelConfig.currency_symbol} {tx.amount.toLocaleString()}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              tx.status === 'verified'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : tx.status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.status === 'verified' 
                                ? (language === 'ko' ? '승인완료' : 'TERVERIFIKASI') 
                                : tx.status.toUpperCase()}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {relatedBudget ? (
                              <button
                                onClick={() => setInspectBudgetAudit(relatedBudget)}
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-xs transition inline-flex items-center gap-1 cursor-pointer"
                                title={language === 'ko' ? '본사 이체증빙 및 크리에이티브팀 LPJ 보기' : 'Lihat Bukti Transfer HQ & Laporan LPJ Tim Creative'}
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>{language === 'ko' ? 'LPJ 및 영수증' : 'Lihat LPJ & Resi'}</span>
                              </button>
                            ) : tx.proof_url ? (
                              <a
                                href={tx.proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition inline-flex items-center gap-1"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>{language === 'ko' ? '입금 영수증' : 'Resi Top-Up'}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW 3: HQ OPERATIONAL REIMBURSEMENTS & EXPENSES          */}
      {/* ========================================================== */}
      {activeBillingTab === 'reimbursements' && isHQ && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="bg-white dark:bg-[#15171e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsNewReimbursementModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ko' ? '새 경비 청구서 제출' : 'Submit New Expense Claim'}</span>
              </button>

              {/* Owner Batch Payout Action */}
              {isHQOwner && selectedReimbursementIds.length > 0 && (
                <button
                  onClick={() => setIsBatchDisburseModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer animate-pulse"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ko'
                      ? `일괄 정산 송금 (${selectedReimbursementIds.length}건: ${whitelabelConfig.currency_symbol} ${selectedTotalAmount.toLocaleString()})`
                      : `Batch Disburse (${selectedReimbursementIds.length} items: ${whitelabelConfig.currency_symbol} ${selectedTotalAmount.toLocaleString()})`}
                  </span>
                </button>
              )}

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('status')}:</span>
                <select
                  value={reimbursementFilter}
                  onChange={(e) => setReimbursementFilter(e.target.value)}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="all">{language === 'ko' ? '전체 상태' : 'All Status'}</option>
                  <option value="pending_approval">{language === 'ko' ? '승인 대기' : 'Pending Approval'}</option>
                  <option value="approved">{language === 'ko' ? '승인됨 (송금 대기)' : 'Approved (Pending Payout)'}</option>
                  <option value="reimbursed">{language === 'ko' ? '송금 완료' : 'Reimbursed'}</option>
                  <option value="rejected">{language === 'ko' ? '반려됨' : 'Rejected'}</option>
                </select>
              </div>
            </div>

            <span className="text-slate-400 font-semibold">
              {filteredReimbursements.length} {language === 'ko' ? '건 내역' : 'claims'}
            </span>
          </div>

          {/* Reimbursements Table */}
          <div className="bg-white dark:bg-[#15171e] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    {isHQOwner && <th className="py-3 px-3 w-8"></th>}
                    <th className="py-3 px-4">{language === 'ko' ? '일자' : 'Date'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '청구자' : 'Requester'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '구분' : 'Category'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '항목명 및 사유' : 'Title & Description'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '금액' : 'Amount'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '상태' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredReimbursements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        {language === 'ko' ? '등록된 본사 경비 청구 내역이 없습니다.' : 'No expense claims found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredReimbursements.map((r) => {
                      const isApproved = r.status === 'approved';
                      const isSelected = selectedReimbursementIds.includes(r.id);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          {isHQOwner && (
                            <td className="py-3 px-3 text-center">
                              {isApproved ? (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectReimbursement(r.id)}
                                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                                />
                              ) : null}
                            </td>
                          )}

                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {r.created_at}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{r.requester_name}</div>
                            <div className="text-[10px] text-slate-400">{r.requester_role}</div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {r.category === 'props_equipment' && <ShoppingBag className="w-3 h-3 text-amber-500" />}
                              {r.category === 'software_license' && <Laptop className="w-3 h-3 text-blue-500" />}
                              {(r.category === 'travel_transport' || r.category === 'photoshoot_meals') && <Coffee className="w-3 h-3 text-rose-500" />}
                              <span>{r.category.replace(/_/g, ' ')}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{r.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{r.description}</div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap font-black font-mono text-sm text-slate-900 dark:text-slate-100">
                            {whitelabelConfig.currency_symbol} {r.amount.toLocaleString()}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'reimbursed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : r.status === 'approved'
                                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                                : r.status === 'rejected'
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}>
                              {r.status === 'reimbursed' && (language === 'ko' ? '송금 완료' : 'REIMBURSED')}
                              {r.status === 'approved' && (language === 'ko' ? '승인됨 (송금 대기)' : 'APPROVED')}
                              {r.status === 'pending_approval' && (language === 'ko' ? '승인 대기' : 'PENDING')}
                              {r.status === 'rejected' && (language === 'ko' ? '반려됨' : 'REJECTED')}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                            {/* Inspect Slip / Proof */}
                            <button
                              onClick={() => setInspectReimbursement(r)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer"
                              title="Inspect receipt & details"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>{language === 'ko' ? '영수증 확인' : 'Receipt Slip'}</span>
                            </button>

                            {/* Owner Approval actions */}
                            {isHQOwner && r.status === 'pending_approval' && (
                              <>
                                <button
                                  onClick={() => approveHqReimbursement(r.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                                >
                                  {language === 'ko' ? '승인' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => rejectHqReimbursement(r.id)}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs cursor-pointer"
                                >
                                  {language === 'ko' ? '반려' : 'Reject'}
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: TOP-UP DEPOSIT WALLET                               */}
      {/* ========================================================== */}
      {isTopUpModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'ko' ? '광고 및 제작 예치금 지갑 충전' : 'Top-Up Ad & Production Deposit Wallet'}</span>
              </h3>
              <button onClick={() => setIsTopUpModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bank details instruction */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
              <h4 className="font-bold">{language === 'ko' ? '입금 계좌 안내' : 'Target Bank Account'}:</h4>
              <div>{whitelabelConfig.bank_name}: <strong>{whitelabelConfig.bank_account_number}</strong> (a.n {whitelabelConfig.bank_account_name})</div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 pt-0.5">
                {language === 'ko' 
                  ? '이 예치금은 지점에서 Meta 광고 부스트 또는 추가 방문 촬영을 요청할 때 자동 차감됩니다.'
                  : 'This deposit wallet balance will be used automatically when your branch requests Meta Ads or extra photoshoot sessions.'}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!topUpProofUrl) {
                  alert(language === 'ko' ? '이체 영수증 사진을 첨부해주세요.' : 'Please attach transfer proof slip photo');
                  return;
                }
                const targetId = isHQ ? topUpBranchId : (currentUser.branch_id || visibleBranches[0]?.id);
                const res = topUpBranchWallet(targetId, topUpAmount, topUpProofUrl, topUpNotes);
                setNotification(res.message);
                setIsTopUpModalOpen(false);
              }}
              className="space-y-3.5 text-xs"
            >
              {/* Branch Selector (HQ only; Branch Owner locked to own branch) */}
              {isHQ ? (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '충전 대상 지점 선택' : 'Select Target Branch'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={topUpBranchId}
                    onChange={(e) => setTopUpBranchId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city}) - Current Balance: {whitelabelConfig.currency_symbol}{b.wallet_balance?.toLocaleString() || 0}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{language === 'ko' ? '지점' : 'Branch'}:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {visibleBranches[0]?.name || currentBranch?.name}
                  </span>
                </div>
              )}

              {/* Preset amounts */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {language === 'ko' ? '충전 금액' : 'Top-Up Amount'} ({whitelabelConfig.currency_symbol}) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[2500000, 5000000, 10000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        topUpAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {whitelabelConfig.currency_symbol} {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="500000"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm"
                />
              </div>

              {/* Upload Proof */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  {language === 'ko' ? '은행 이체 확인증 사진 (스크린샷 / 영수증)' : 'Bank Transfer Slip Photo (Screenshot / Receipt)'} <span className="text-red-500">*</span>
                </label>

                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center transition bg-white dark:bg-slate-900">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (loadEvt) => {
                          if (loadEvt.target?.result) {
                            setTopUpProofUrl(String(loadEvt.target.result));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 py-1">
                    <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'ko' ? '갤러리에서 영수증 사진 선택' : 'Select Receipt Photo from Device'}
                    </span>
                  </div>
                </div>

                <input
                  type="url"
                  placeholder="https://..."
                  value={topUpProofUrl}
                  onChange={(e) => setTopUpProofUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                />

                {topUpProofUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img src={topUpProofUrl} alt="Receipt proof" className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'ko' ? '증빙 준비 완료' : 'Receipt Ready for Submission'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '송금자명 / 메모' : 'Sender Account Name / Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. BCA a.n PT Moggumung Ubud Top Up Deposit Iklan Oktober..."
                  value={topUpNotes}
                  onChange={(e) => setTopUpNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{language === 'ko' ? '충전 요청 제출' : 'Submit Top-Up Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* MODAL: NEW HQ REIMBURSEMENT CLAIM                           */}
      {/* ========================================================== */}
      {isNewReimbursementModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'ko' ? '본사 업무 경비 청구 (Reimbursement)' : 'HQ Operational Expense Reimbursement'}</span>
              </h3>
              <button onClick={() => setIsNewReimbursementModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReimbursement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '경비 항목 구분' : 'Expense Category'} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'props_equipment', label: language === 'ko' ? '소품/장비' : 'Props & Gear' },
                    { key: 'tools_software', label: language === 'ko' ? '소프트웨어' : 'Software/Tools' },
                    { key: 'travel_meals', label: language === 'ko' ? '출장/식대' : 'Travel & Meals' },
                    { key: 'studio_supplies', label: language === 'ko' ? '스튜디오용품' : 'Studio Supplies' }
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setReimbCategory(cat.key as HqReimbursementCategory)}
                      className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        reimbCategory === cat.key
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '지출 항목명' : 'Claim Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ko' ? '예: 가을 신메뉴 촬영용 소품 구매' : 'e.g. Autumn photoshoot props & tableware'}
                  value={reimbTitle}
                  onChange={(e) => setReimbTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '실제 지출 금액' : 'Spent Amount'} ({whitelabelConfig.currency_symbol}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={reimbAmount}
                  onChange={(e) => setReimbAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '지출 상세 사유 및 설명' : 'Detailed Justification & Objective'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ko' ? '구매처, 목적 및 사용 내역...' : 'Store name, usage context, and deliverables...'}
                  value={reimbDescription}
                  onChange={(e) => setReimbDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  {language === 'ko' ? '영수증 첨부 사진' : 'Receipt Slip Photo'} <span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center transition bg-white dark:bg-slate-900">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (loadEvt) => {
                          if (loadEvt.target?.result) {
                            setReimbProofUrl(String(loadEvt.target.result));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 py-1">
                    <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'ko' ? '영수증 사진 업로드' : 'Upload Receipt Photo'}
                    </span>
                  </div>
                </div>

                <input
                  type="url"
                  placeholder="https://..."
                  value={reimbProofUrl}
                  onChange={(e) => setReimbProofUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                />

                {reimbProofUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img src={reimbProofUrl} alt="Receipt proof" className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'ko' ? '영수증 첨부 완료' : 'Receipt Attached'}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewReimbursementModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ko' ? '대표님께 청구서 제출' : 'Submit Claim to Owner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* MODAL: BATCH COLLECTIVE REIMBURSEMENT DISBURSEMENT (OWNER)  */}
      {/* ========================================================== */}
      {isBatchDisburseModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'ko' ? '선택된 경비 일괄 정산 및 송금 증빙 첨부' : 'Batch Collective Reimbursement Payout'}</span>
              </h3>
              <button onClick={() => setIsBatchDisburseModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'ko' ? '정산 대상 항목:' : 'Selected Claims:'}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedReimbursementIds.length} items</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-emerald-200/60 pt-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ko' ? '총 송금 금액:' : 'Total Payout Amount:'}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                  {whitelabelConfig.currency_symbol} {selectedTotalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleBatchDisburseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '은행 이체 번호 / 참조 코드' : 'Transfer Reference Code'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. BCA-MB-982144"
                  value={batchReference}
                  onChange={(e) => setBatchReference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              {/* Upload Proof */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  {language === 'ko' ? '송금 확인증 사진 첨부 (Struk / Screenshot)' : 'Bank Transfer Proof Slip (Photo)'} <span className="text-red-500">*</span>
                </label>

                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center transition bg-white dark:bg-slate-900">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (loadEvt) => {
                          if (loadEvt.target?.result) {
                            setBatchProofUrl(String(loadEvt.target.result));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 py-1">
                    <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'ko' ? '이체 영수증 사진 업로드' : 'Upload Transfer Receipt'}
                    </span>
                  </div>
                </div>

                <input
                  type="url"
                  placeholder="https://..."
                  value={batchProofUrl}
                  onChange={(e) => setBatchProofUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                />

                {batchProofUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img src={batchProofUrl} alt="Transfer proof" className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'ko' ? '이체 증빙 첨부 완료' : 'Transfer Slip Ready'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '정산 메모' : 'Disbursement Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ko' ? '정산 완료 메모...' : 'Disbursement confirmation notes...'}
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBatchDisburseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'ko' ? '송금 확인 및 일괄 정산 완료' : 'Confirm Payout & Disburse'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* MODAL: INSPECT REIMBURSEMENT DETAIL & PROOF                 */}
      {/* ========================================================== */}
      {inspectReimbursement && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'ko' ? '경비 영수증 및 정산 증빙 상세' : 'Expense Slip & Disbursement Details'}</span>
              </h3>
              <button onClick={() => setInspectReimbursement(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{inspectReimbursement.title}</div>
                <div className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                  {whitelabelConfig.currency_symbol} {inspectReimbursement.amount.toLocaleString()}
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                {language === 'ko' ? '청구자' : 'Requester'}: <strong>{inspectReimbursement.requester_name}</strong> ({inspectReimbursement.requester_role}) • {inspectReimbursement.created_at}
              </div>
              <div className="text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800">
                {inspectReimbursement.description}
              </div>
            </div>

            {/* Original Claim Receipt */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {language === 'ko' ? '1. 청구 영수증 (구매 증빙)' : '1. Purchase Receipt Slip'}:
              </span>
              <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-56 bg-slate-900 flex items-center justify-center">
                <img src={inspectReimbursement.receipt_proof_url} alt="Receipt" className="max-h-56 object-contain" />
              </div>
            </div>

            {/* Transfer Payout Slip if Reimbursed */}
            {inspectReimbursement.transfer_proof_url && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ko' ? '2. 대표님 송금 증빙 (정산 완료)' : '2. Owner Transfer Payout Slip'}</span>
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200">
                    {inspectReimbursement.transfer_reference}
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-700 max-h-56 bg-slate-900 flex items-center justify-center">
                  <img src={inspectReimbursement.transfer_proof_url} alt="Disbursement proof" className="max-h-56 object-contain" />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectReimbursement(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* MODAL: INSPECT BUDGET AUDIT (HQ PROOF & CREATIVE LPJ)      */}
      {/* ========================================================== */}
      {inspectBudgetAudit && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'ko' ? '지출 증빙 및 실행 보고서 (LPJ Audit)' : 'Budget Execution & LPJ Audit'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'ko' ? '지점 예치금 차감 투명성 및 광고/촬영 성과 보고서' : 'Transparency of branch deposit deductions and campaign ROI'}
                </p>
              </div>
              <button onClick={() => setInspectBudgetAudit(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Request info */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{inspectBudgetAudit.title}</div>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                  -{whitelabelConfig.currency_symbol} {inspectBudgetAudit.amount.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div>{language === 'ko' ? '지점' : 'Branch'}: <strong>{inspectBudgetAudit.target_branch_name}</strong></div>
                <div>{language === 'ko' ? '카테고리' : 'Category'}: <strong>{inspectBudgetAudit.type}</strong></div>
                <div>{language === 'ko' ? '신청자' : 'Requester'}: <strong>{inspectBudgetAudit.requester_name}</strong></div>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                {language === 'ko' ? '목적' : 'Objective'}: {inspectBudgetAudit.objective}
              </div>
            </div>

            {/* Stage 1: HQ Transfer Proof */}
            <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/20 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-sky-600" />
                  <span>1. {language === 'ko' ? '본사 송금 증빙' : 'HQ Transfer Proof Slip'}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 font-mono">
                  Ref: {inspectBudgetAudit.transfer_reference || 'Tf OK'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <div className="text-slate-500 dark:text-slate-400">{language === 'ko' ? '송금자' : 'Disbursed By'}:</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{inspectBudgetAudit.disbursed_by || 'HQ Finance'}</div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">{language === 'ko' ? '송금 일시' : 'Transfer Time'}:</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{inspectBudgetAudit.disbursed_at || inspectBudgetAudit.created_at}</div>
                </div>
              </div>

              {inspectBudgetAudit.transfer_proof_url ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{language === 'ko' ? '이체 확인증 사진' : 'Transfer Slip Photo'}:</div>
                  <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-56 bg-slate-900 flex items-center justify-center">
                    <img src={inspectBudgetAudit.transfer_proof_url} alt="Receipt Proof" className="max-h-56 object-contain" />
                  </div>
                  <a
                    href={inspectBudgetAudit.transfer_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-bold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{language === 'ko' ? '고화질 원본 열기' : 'Open Full HD Slip'}</span>
                  </a>
                </div>
              ) : (
                <div className="text-slate-400 italic text-[11px]">{language === 'ko' ? '이체 증빙 미첨부' : 'No slip attached.'}</div>
              )}
            </div>

            {/* Stage 2: Creative Completion LPJ */}
            {inspectBudgetAudit.completion_report ? (
              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>2. {language === 'ko' ? '크리에이티브팀 집행 보고서 (LPJ)' : 'Creative Team Execution Report (LPJ)'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                    {language === 'ko' ? '완료됨' : 'Delivered'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">{language === 'ko' ? '실집행 비용' : 'Actual Spent'}</div>
                    <div className="font-black text-xs text-slate-900 dark:text-slate-100">
                      {whitelabelConfig.currency_symbol} {inspectBudgetAudit.completion_report.spent_amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">{language === 'ko' ? '도달 (Reach)' : 'Est. Reach'}</div>
                    <div className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                      {inspectBudgetAudit.completion_report.reach?.toLocaleString() || '-'}
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">{language === 'ko' ? '노출 (Impressions)' : 'Impressions'}</div>
                    <div className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                      {inspectBudgetAudit.completion_report.impressions?.toLocaleString() || '-'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {language === 'ko' ? '광고 대시보드 / 결과물 스크린샷' : 'Dashboard / Result Screenshot'}:
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-56 bg-slate-900 flex items-center justify-center">
                    <img src={inspectBudgetAudit.completion_report.proof_screenshot_url} alt="Ads proof" className="max-h-56 object-contain" />
                  </div>
                </div>

                {inspectBudgetAudit.completion_report.report_notes && (
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <strong>{language === 'ko' ? '성과 요약 및 평가' : 'Evaluation Summary'}:</strong> {inspectBudgetAudit.completion_report.report_notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                {language === 'ko' 
                  ? '⏳ 크리에이티브팀이 캠페인을 진행 중입니다. 완료 시 LPJ 보고서가 자동 첨부됩니다.' 
                  : '⏳ Creative team is executing this campaign. LPJ report will be linked upon completion.'}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectBudgetAudit(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* INVOICE MODALS (Charges, Proof, Details, WhatsApp)          */}
      {/* ========================================================== */}

      {/* Modal 1: Edit Invoice Charges (HQ Owner & Leader) */}
      {selectedInvoiceForCharge && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {language === 'ko' ? '청구 항목 및 추가 비용 조정' : 'Edit Charges & Invoiced Items'}
              </h3>
              <button onClick={() => setSelectedInvoiceForCharge(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCharges} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('retainerFee')} ({whitelabelConfig.currency_symbol})
                </label>
                <input
                  type="number"
                  step="100000"
                  value={retainerInput}
                  onChange={(e) => setRetainerInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('visitFee')} ({whitelabelConfig.currency_symbol})
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={visitFeeInput}
                    onChange={(e) => setVisitFeeInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('adsBudget')} ({whitelabelConfig.currency_symbol})
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={adBudgetInput}
                    onChange={(e) => setAdBudgetInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Custom Line Items */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t('customItems')}</span>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'ko' ? '항목 추가' : 'Add Item'}</span>
                  </button>
                </div>

                {customItemsInput.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateCustomItem(item.id, 'name', e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      placeholder="Item name"
                    />
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleUpdateCustomItem(item.id, 'amount', Number(e.target.value))}
                      className="w-32 rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      placeholder="Amount"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total preview */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">{t('totalInvoice')}</span>
                <span className="text-base font-black text-slate-900 dark:text-slate-100">
                  {whitelabelConfig.currency_symbol} {calculateModalTotal().toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForCharge(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold shadow-md cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 2: Upload Payment Proof (Branch Owner) */}
      {selectedInvoiceForProof && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>{t('uploadProof')}</span>
              </h3>
              <button onClick={() => setSelectedInvoiceForProof(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">{selectedInvoiceForProof.invoice_number}</div>
              <div className="text-slate-600 dark:text-slate-400">
                {t('totalInvoice')}: <strong className="text-slate-900 dark:text-slate-100">{whitelabelConfig.currency_symbol} {selectedInvoiceForProof.total_amount.toLocaleString()}</strong>
              </div>
            </div>

            {/* Bank details instruction */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <h4 className="font-bold">{language === 'ko' ? '입금 계좌 안내' : 'Bank Transfer Details'}:</h4>
              <div>{whitelabelConfig.bank_name}: <strong>{whitelabelConfig.bank_account_number}</strong> (a.n {whitelabelConfig.bank_account_name})</div>
            </div>

            <form onSubmit={handleSaveProof} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '입금 확인증 이미지 URL' : 'Receipt / Transfer Slip Image URL'}
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... 또는 이미지 링크"
                  value={proofUrlInput}
                  onChange={(e) => setProofUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '입금 메모 (송금자명, 은행)' : 'Payment Notes (Sender Name / Bank)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. BCA Transfer a.n Sarah Wijaya Ref #98231"
                  value={proofNotesInput}
                  onChange={(e) => setProofNotesInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForProof(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {language === 'ko' ? '확인증 제출' : 'Submit Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 3: View & Print Invoice */}
      {selectedInvoiceForDetail && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  {whitelabelConfig.brand_monogram}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{whitelabelConfig.brand_name} Official Invoice</h3>
                  <div className="text-[10px] font-mono text-slate-400">{selectedInvoiceForDetail.invoice_number}</div>
                </div>
              </div>
              <button onClick={() => setSelectedInvoiceForDetail(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Layout */}
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-slate-400 text-[10px]">{language === 'ko' ? '발행처' : 'Billed By'}</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{whitelabelConfig.company_legal_name}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{whitelabelConfig.hq_address}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">{language === 'ko' ? '청구 대상 지점' : 'Billed To'}</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {branches.find((b) => b.id === selectedInvoiceForDetail.branch_id)?.name}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Due: {selectedInvoiceForDetail.due_date}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[10px]">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2">{t('retainerFee')} ({selectedInvoiceForDetail.period_month.slice(0, 7)})</td>
                    <td className="py-2 text-right font-mono">
                      {whitelabelConfig.currency_symbol} {selectedInvoiceForDetail.retainer_fee.toLocaleString()}
                    </td>
                  </tr>
                  {selectedInvoiceForDetail.visit_fee > 0 && (
                    <tr>
                      <td className="py-2">{t('visitFee')}</td>
                      <td className="py-2 text-right font-mono">
                        {whitelabelConfig.currency_symbol} {selectedInvoiceForDetail.visit_fee.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {selectedInvoiceForDetail.ad_budget > 0 && (
                    <tr>
                      <td className="py-2">{t('adsBudget')}</td>
                      <td className="py-2 text-right font-mono">
                        {whitelabelConfig.currency_symbol} {selectedInvoiceForDetail.ad_budget.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {selectedInvoiceForDetail.custom_items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-right font-mono">
                        {whitelabelConfig.currency_symbol} {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-black text-slate-900 dark:text-slate-100 border-t-2 border-slate-900 dark:border-slate-100">
                    <td className="py-3 text-sm">{t('totalInvoice')}</td>
                    <td className="py-3 text-right text-sm">
                      {whitelabelConfig.currency_symbol} {selectedInvoiceForDetail.total_amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Bank Transfer Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">{language === 'ko' ? '입금 계좌 안내' : 'Payment Beneficiary'}:</div>
                <div>{whitelabelConfig.bank_name} • {whitelabelConfig.bank_account_number} ({whitelabelConfig.bank_account_name})</div>
                <div className="text-[10px] text-slate-400 mt-1">{whitelabelConfig.invoice_note_footer}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ko' ? '인쇄하기' : 'Print Invoice'}</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceForDetail(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 4: Payment Proof Lightbox & Verification Modal */}
      <PaymentProofModal
        isOpen={!!selectedInvoiceForProofInspect}
        invoice={selectedInvoiceForProofInspect}
        onClose={() => setSelectedInvoiceForProofInspect(null)}
      />

      {/* Official Watermarked Printable Invoice & PDF Modal */}
      <PrintableInvoiceModal
        isOpen={!!printableInvoice}
        invoice={printableInvoice}
        onClose={() => setPrintableInvoice(null)}
      />

      {/* WhatsApp Dispatcher Modal */}
      <WhatsAppBroadcastModal
        isOpen={whatsAppModalOpen}
        defaultBranch={whatsAppTargetBranch}
        defaultTemplateType="invoice_issued"
        onClose={() => setWhatsAppModalOpen(false)}
      />
    </div>
  );
};
