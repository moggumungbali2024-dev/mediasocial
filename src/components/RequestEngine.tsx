import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Layers, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Lock, 
  Upload, 
  Download, 
  ExternalLink,
  Info,
  ShieldCheck,
  PlusCircle,
  FileCheck,
  HelpCircle,
  XCircle,
  UserCheck,
  Sparkles,
  Edit3,
  User,
  Check,
  X,
  FileImage,
  Send,
  Camera,
  DollarSign,
  Briefcase,
  Share2,
  FileSpreadsheet,
  Kanban,
  Smartphone,
  Eye,
  MessageSquare,
  MessageCircle,
  FileVideo,
  FolderOpen,
  Palette,
  Figma,
  Flame,
  ChevronDown,
  ChevronUp,
  Wallet,
  Receipt,
  ArrowRight,
  TrendingUp,
  BarChart3,
  FileCheck2,
  ImagePlus
} from 'lucide-react';
import { 
  ContentPillar, 
  DesignRequest, 
  RequestStatus, 
  ShootRequestType, 
  BudgetRequestType 
} from '../types.ts';
import { CreativeKanbanBoard } from './CreativeKanbanBoard.tsx';
import { SocialMediaMockupModal } from './SocialMediaMockupModal.tsx';
import { DesignWhatsAppModal } from './DesignWhatsAppModal.tsx';
import { OmnipostPublishModal } from './OmnipostPublishModal.tsx';

export const RequestEngine: React.FC = () => {
  const { 
    currentUser, 
    activeRole, 
    isHQ,
    isHQOwner,
    isHQLeader,
    isHQCreative,
    isBranchOwner,
    isBranchManager,
    currentBranch, 
    branches, 
    users,
    quotas, 
    getBranchQuota, 
    simulatedDate, 
    calculateMinTargetDate,
    isTargetDateValid,
    isPromoSubmissionAllowed,
    addDesignRequest,
    addPromoRequest,
    designRequests,
    promos,
    updateDesignRequestStatus,
    assignDesignRequest,
    updateDesignRequestDeliverable,
    addDesignComment,
    shootRequests,
    addShootRequest,
    updateShootRequestStatus,
    budgetRequests,
    addBudgetRequest,
    approveBudgetRequest,
    rejectBudgetRequest,
    disburseBudgetRequest,
    acknowledgeBudgetDisbursement,
    submitBudgetCompletionReport,
    walletTransactions,
    whitelabelConfig,
    themeColors,
    t,
    language
  } = usePortal();

  // Active sub-tab: 'design' | 'promo' | 'shoot' | 'budget'
  const [activeEngineTab, setActiveEngineTab] = useState<'design' | 'promo' | 'shoot' | 'budget'>('design');

  // Branch selector (for HQ view)
  const safeBranches = Array.isArray(branches) ? branches : [];
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    currentBranch ? currentBranch.id : safeBranches[0]?.id || ''
  );

  const effectiveBranchId = currentBranch ? currentBranch.id : (selectedBranchId || safeBranches[0]?.id || '');
  const currentMonth = (simulatedDate || new Date().toISOString().split('T')[0]).slice(0, 7);
  const branchQuota = (getBranchQuota ? getBranchQuota(effectiveBranchId, currentMonth) : null) || {
    id: `quota-${effectiveBranchId}-${currentMonth}`,
    branch_id: effectiveBranchId,
    period_month: currentMonth,
    design_used: 0,
    promo_used: 0
  };
  const minTargetDate = calculateMinTargetDate ? calculateMinTargetDate() : '2026-10-05';

  // Limits from Whitelabel config
  const maxDesignLimit = whitelabelConfig?.max_monthly_design_requests || 12;
  const maxPromoLimit = whitelabelConfig?.max_monthly_active_promos || 4;
  const leadDays = whitelabelConfig?.design_min_lead_days || 5;
  const cutoffDay = whitelabelConfig?.promo_cutoff_day_of_month || 25;

  // 1. Design Form State
  const [designTitle, setDesignTitle] = useState('');
  const [designDesc, setDesignDesc] = useState('');
  const [designCategory, setDesignCategory] = useState<ContentPillar>('Food');
  const [designTargetDate, setDesignTargetDate] = useState(minTargetDate || '2026-10-05');
  const [designAttachment, setDesignAttachment] = useState<string>('');
  const [designFormAlert, setDesignFormAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 2. Promo Form State
  const [promoTitle, setPromoTitle] = useState('');
  const [promoMechanic, setPromoMechanic] = useState('');
  const [promoTargetMonth, setPromoTargetMonth] = useState('2026-10');
  const [promoStartDate, setPromoStartDate] = useState('2026-10-01');
  const [promoEndDate, setPromoEndDate] = useState('2026-10-31');
  const [promoTerms, setPromoTerms] = useState('');
  const [promoFormAlert, setPromoFormAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 3. Shoot Request Form State
  const [shootTitle, setShootTitle] = useState('');
  const [shootType, setShootType] = useState<ShootRequestType>('photoshoot_visit');
  const [shootPreferredDate, setShootPreferredDate] = useState('2026-10-05');
  const [shootDetails, setShootDetails] = useState('');
  const [shootFormAlert, setShootFormAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 4. Budget Request Form State
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgetType, setBudgetType] = useState<BudgetRequestType>('meta_ads');
  const [budgetAmount, setBudgetAmount] = useState<number>(1500000);
  const [budgetBranchId, setBudgetBranchId] = useState<string>(branches[0]?.id || '');
  const [budgetObjective, setBudgetObjective] = useState('');
  const [budgetFormAlert, setBudgetFormAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [budgetFilterStatus, setBudgetFilterStatus] = useState<string>('all');

  // Budget Modal Workflows
  const [disburseModalRequest, setDisburseModalRequest] = useState<import('../types.ts').BudgetRequest | null>(null);
  const [disburseProofUrl, setDisburseProofUrl] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
  const [disburseRef, setDisburseRef] = useState<string>('');
  const [disburseNote, setDisburseNote] = useState<string>('');

  const [reportModalRequest, setReportModalRequest] = useState<import('../types.ts').BudgetRequest | null>(null);
  const [reportSpentAmount, setReportSpentAmount] = useState<number>(1500000);
  const [reportProofUrl, setReportProofUrl] = useState<string>('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80');
  const [reportImpressions, setReportImpressions] = useState<number>(45200);
  const [reportReach, setReportReach] = useState<number>(31800);
  const [reportDeliverableLink, setReportDeliverableLink] = useState<string>('https://adsmanager.facebook.com/adsmanager/manage/campaigns');
  const [reportNotes, setReportNotes] = useState<string>('');

  const [inspectBudgetModal, setInspectBudgetModal] = useState<import('../types.ts').BudgetRequest | null>(null);

  // Filters & Management State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState<'all' | 'my'>('all');
  const [designViewMode, setDesignViewMode] = useState<'list' | 'kanban'>('list');
  const [mockupRequest, setMockupRequest] = useState<DesignRequest | null>(null);
  const [waModalRequest, setWaModalRequest] = useState<DesignRequest | null>(null);
  const [omnipostModalRequest, setOmnipostModalRequest] = useState<DesignRequest | null>(null);

  // Expanded comments accordion state
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentTags, setCommentTags] = useState<Record<string, string>>({});

  // Modal for Creative Staff Deliverables Management
  const [managingReq, setManagingReq] = useState<DesignRequest | null>(null);
  const [modalStatus, setModalStatus] = useState<RequestStatus>('in_progress');
  const [modalAssetUrl, setModalAssetUrl] = useState('');
  const [modalPreviewMediaUrl, setModalPreviewMediaUrl] = useState('');
  const [modalPreviewMediaType, setModalPreviewMediaType] = useState<'image' | 'video'>('image');
  const [modalCanvaUrl, setModalCanvaUrl] = useState('');
  const [modalFigmaUrl, setModalFigmaUrl] = useState('');
  const [modalDriveUrl, setModalDriveUrl] = useState('');
  const [modalCaption, setModalCaption] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalAssigneeId, setModalAssigneeId] = useState('');
  const [modalApprovalMode, setModalApprovalMode] = useState<'self_approved' | 'leader_approved' | 'pending_leader'>('self_approved');

  // Check target date & promo cutoff
  const dateValidation = isTargetDateValid ? isTargetDateValid(designTargetDate) : { valid: true };
  const promoLockCheck = isPromoSubmissionAllowed ? isPromoSubmissionAllowed(promoTargetMonth) : { allowed: true };

  // Submit Design Request
  const handleSubmitDesign = (e: React.FormEvent) => {
    e.preventDefault();
    setDesignFormAlert(null);

    if (!designTitle.trim() || !designDesc.trim()) {
      setDesignFormAlert({ 
        type: 'error', 
        message: language === 'ko' ? '제목과 브리프 상세 내용을 입력하세요.' : 'Title and description are required.' 
      });
      return;
    }

    const result = addDesignRequest({
      branch_id: effectiveBranchId,
      title: designTitle,
      description: designDesc,
      target_date: designTargetDate,
      category: designCategory,
      brief_attachment_name: designAttachment || 'brief_assets.zip'
    });

    if (result.success) {
      setDesignFormAlert({ type: 'success', message: result.message });
      setDesignTitle('');
      setDesignDesc('');
      setDesignAttachment('');
    } else {
      setDesignFormAlert({ type: 'error', message: result.message });
    }
  };

  // Submit Promo Request
  const handleSubmitPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoFormAlert(null);

    if (!promoTitle.trim() || !promoMechanic.trim()) {
      setPromoFormAlert({ 
        type: 'error', 
        message: language === 'ko' ? '프로모션 제목과 혜택 내용을 입력하세요.' : 'Title and mechanic are required.' 
      });
      return;
    }

    const result = addPromoRequest({
      branch_id: effectiveBranchId,
      title: promoTitle,
      mechanic: promoMechanic,
      target_month: promoTargetMonth,
      start_date: promoStartDate,
      end_date: promoEndDate,
      terms: promoTerms
    });

    if (result.success) {
      setPromoFormAlert({ type: 'success', message: result.message });
      setPromoTitle('');
      setPromoMechanic('');
      setPromoTerms('');
    } else {
      setPromoFormAlert({ type: 'error', message: result.message });
    }
  };

  // Submit Shoot Request
  const handleSubmitShoot = (e: React.FormEvent) => {
    e.preventDefault();
    setShootFormAlert(null);

    if (!shootTitle.trim() || !shootDetails.trim()) {
      setShootFormAlert({ 
        type: 'error', 
        message: language === 'ko' ? '요청 제목과 상세 샷리스트를 입력하세요.' : 'Title and shot list details are required.' 
      });
      return;
    }

    const branchObj = branches.find((b) => b.id === effectiveBranchId);
    const result = addShootRequest({
      branch_id: effectiveBranchId,
      branch_name: branchObj?.name || 'Branch',
      requester_id: currentUser?.id || 'user-unknown',
      requester_name: currentUser?.full_name || 'Member',
      requester_role: currentUser?.role || 'platform_owner',
      type: shootType,
      title: shootTitle,
      preferred_date: shootPreferredDate,
      details: shootDetails
    });

    if (result.success) {
      setShootFormAlert({ type: 'success', message: t('shootScheduledSuccess') });
      setShootTitle('');
      setShootDetails('');
    } else {
      setShootFormAlert({ type: 'error', message: result.message });
    }
  };

  // Submit Budget Request
  const handleSubmitBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetFormAlert(null);

    if (!budgetTitle.trim() || !budgetObjective.trim()) {
      setBudgetFormAlert({ 
        type: 'error', 
        message: language === 'ko' ? '예산 신청 제목과 캠페인 목적을 입력하세요.' : 'Title and objective are required.' 
      });
      return;
    }

    const targetBranchId = isHQ ? budgetBranchId : (currentBranch?.id || budgetBranchId);
    const branchObj = branches.find((b) => b.id === targetBranchId);
    const result = addBudgetRequest({
      requester_id: currentUser?.id || 'user-unknown',
      requester_name: currentUser?.full_name || 'Member',
      requester_role: currentUser?.role || 'platform_owner',
      target_branch_id: targetBranchId,
      target_branch_name: branchObj?.name || 'Target Branch',
      type: budgetType,
      title: budgetTitle,
      amount: Number(budgetAmount),
      objective: budgetObjective
    });

    if (result.success) {
      setBudgetFormAlert({ 
        type: 'success', 
        message: language === 'ko' ? '예산 집행 승인 신청이 접수되었습니다.' : 'Budget request submitted to HQ leadership!' 
      });
      setBudgetTitle('');
      setBudgetObjective('');
    } else {
      setBudgetFormAlert({ type: 'error', message: result.message });
    }
  };

  // Open Deliverables Management modal for creative staff / leader
  const handleOpenTaskManagement = (req: DesignRequest) => {
    setManagingReq(req);
    setModalStatus(req.status);
    setModalAssetUrl(req.asset_result_url || '');
    setModalPreviewMediaUrl(req.preview_media_url || '');
    setModalPreviewMediaType(req.preview_media_type || 'image');
    setModalCanvaUrl(req.canva_url || '');
    setModalFigmaUrl(req.figma_url || '');
    setModalDriveUrl(req.drive_url || '');
    setModalCaption(req.caption || '');
    setModalNotes(req.creative_notes || '');
    setModalAssigneeId(req.assigned_to_user_id || currentUser?.id || '');
    setModalApprovalMode(req.approval_mode || 'self_approved');
  };

  const handleSaveTaskManagement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingReq) return;

    if (modalAssigneeId && modalAssigneeId !== managingReq.assigned_to_user_id) {
      assignDesignRequest(managingReq.id, modalAssigneeId);
    }

    updateDesignRequestDeliverable(
      managingReq.id,
      {
        asset_result_url: modalAssetUrl,
        preview_media_url: modalPreviewMediaUrl,
        preview_media_type: modalPreviewMediaType,
        canva_url: modalCanvaUrl,
        figma_url: modalFigmaUrl,
        drive_url: modalDriveUrl,
        caption: modalCaption,
        creative_notes: modalNotes,
        status: modalStatus,
        approval_mode: modalApprovalMode
      }
    );

    setManagingReq(null);
  };

  const toggleComments = (reqId: string) => {
    setExpandedComments((prev) => ({ ...prev, [reqId]: !prev[reqId] }));
  };

  const handleSendComment = (reqId: string) => {
    const text = commentInputs[reqId] || '';
    const tag = commentTags[reqId] || '';
    if (!text.trim()) return;

    addDesignComment(reqId, text, tag);
    setCommentInputs((prev) => ({ ...prev, [reqId]: '' }));
    setCommentTags((prev) => ({ ...prev, [reqId]: '' }));
  };

  // Filtered requests
  const safeDesignRequests = Array.isArray(designRequests) ? designRequests : [];
  const safePromos = Array.isArray(promos) ? promos : [];
  const safeShoots = Array.isArray(shootRequests) ? shootRequests : [];
  const safeBudgetRequests = Array.isArray(budgetRequests) ? budgetRequests : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredDesignRequests = safeDesignRequests.filter((r) => {
    if (!r) return false;
    const matchBranch = isHQ
      ? selectedBranchId === 'all' || r.branch_id === selectedBranchId
      : r.branch_id === (currentBranch?.id || selectedBranchId);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const currentUid = currentUser?.id;
    const matchAssignee =
      taskAssigneeFilter === 'all' || (currentUid && r.assigned_to_user_id === currentUid);
    return matchBranch && matchStatus && matchAssignee;
  });

  const filteredPromos = safePromos.filter((p) => {
    if (!p) return false;
    if (isHQ) {
      return selectedBranchId === 'all' || p.branch_id === selectedBranchId;
    }
    return p.branch_id === (currentBranch?.id || selectedBranchId);
  });

  const filteredShoots = safeShoots.filter((s) => {
    if (!s) return false;
    if (isHQ) {
      return selectedBranchId === 'all' || s.branch_id === selectedBranchId;
    }
    return s.branch_id === (currentBranch?.id || selectedBranchId);
  });

  const filteredBudgetRequests = safeBudgetRequests.filter((b) => {
    if (!b) return false;
    const matchBranch = isHQ
      ? selectedBranchId === 'all' || b.target_branch_id === selectedBranchId
      : b.target_branch_id === (currentBranch?.id || selectedBranchId);
    const matchStatus = budgetFilterStatus === 'all' || b.status === budgetFilterStatus;
    return matchBranch && matchStatus;
  });

  const creativeUsers = safeUsers.filter(
    (u) => u && (u.role === 'hq_creative' || u.role === 'hq_leader' || u.role === 'hq_owner')
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{whitelabelConfig.brand_name} Request Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Space_Grotesk']">
              {language === 'ko' ? '외주 제작 및 운영 요청 엔진' : 'Creative & Operations Requests Engine'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {language === 'ko'
                ? `디자인 제작 요청(최소 H-${leadDays} 전), 프로모션 제안(매월 ${cutoffDay}일 마감), 지점 현장 촬영 및 본사 광고 예산 집행 승인을 통합 처리합니다.`
                : `Manage design briefs (H-${leadDays} lead time), monthly promos (Day ${cutoffDay} cutoff), branch photoshoot sessions, and ad budget requests.`}
            </p>
          </div>

          {/* Branch filter if HQ */}
          {isHQ && (
            <div className="flex items-center gap-2 bg-slate-800/90 p-2 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold">{t('branch')}:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-amber-400 font-medium cursor-pointer"
              >
                <option value="all">{language === 'ko' ? '전체 지점 보기' : 'All Branches'}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4 Engine Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-800/80 scrollbar-none no-scrollbar text-xs">
          <button
            onClick={() => setActiveEngineTab('design')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeEngineTab === 'design'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>{t('tabDesignRequests')}</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-full font-bold">
              {designRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveEngineTab('promo')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeEngineTab === 'promo'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span>{t('tabPromoProposals')}</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-full font-bold">
              {promos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveEngineTab('shoot')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeEngineTab === 'shoot'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>{t('tabShootRequests')}</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-full font-bold">
              {shootRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveEngineTab('budget')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeEngineTab === 'budget'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>{t('tabBudgetRequests')}</span>
            {budgetRequests.filter((b) => b.status === 'pending_approval').length > 0 && (
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
                {budgetRequests.filter((b) => b.status === 'pending_approval').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: DESIGN REQUESTS */}
      {/* ========================================================== */}
      {activeEngineTab === 'design' && (
        <div className="space-y-4">
          {/* View Toggle Bar (List vs Kanban) */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'ko' ? '디자인 뷰 모드:' : 'View Mode:'}
              </span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDesignViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    designViewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{language === 'ko' ? '목록 & 신청 폼' : 'List & Brief Form'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesignViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    designViewMode === 'kanban'
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>{language === 'ko' ? 'HQ 칸반 보드' : 'HQ Creative Kanban'}</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{filteredDesignRequests.length} Total Requests</span>
            </div>
          </div>

          {designViewMode === 'kanban' ? (
            <CreativeKanbanBoard
              onOpenMockup={(req) => setMockupRequest(req)}
              onSelectRequest={(req) => handleOpenTaskManagement(req)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
              {/* Form */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t('submitNewDesign')}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      {branchQuota.design_used}/{maxDesignLimit} {language === 'ko' ? '사용됨' : 'Used'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'ko' ? `최소 H-${leadDays} 사전 접수 규칙이 엄격히 적용됩니다.` : `Strict H-${leadDays} lead time enforced.`}
                  </p>
                </div>

                {/* Quota Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span>{language === 'ko' ? '월간 디자인 요청 한도' : 'Monthly Quota Usage'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {branchQuota.design_used} / {maxDesignLimit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        branchQuota.design_used >= maxDesignLimit
                          ? 'bg-red-500'
                          : branchQuota.design_used >= maxDesignLimit - 1
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (branchQuota.design_used / maxDesignLimit) * 100)}%` }}
                    />
                  </div>
                </div>

                {designFormAlert && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      designFormAlert.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {designFormAlert.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{designFormAlert.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitDesign} className="space-y-3 sm:space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '요청 제목 / 메뉴명' : 'Design Title / Menu'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ko' ? '예: 가을 신메뉴 트러플 라멘 포스터' : 'e.g. Special Autumn Truffle Poster'}
                      value={designTitle}
                      onChange={(e) => setDesignTitle(e.target.value)}
                      disabled={branchQuota.design_used >= maxDesignLimit}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-400 outline-none disabled:bg-slate-100 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '콘텐츠 카테고리' : 'Content Pillar'}
                    </label>
                    <select
                      value={designCategory}
                      onChange={(e) => setDesignCategory(e.target.value as ContentPillar)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-400 outline-none font-medium"
                    >
                      <option value="Food">Food (Menu, Dishes, Hero bowl)</option>
                      <option value="Vibes">Vibes (Ambiance, Interior, Guests)</option>
                      <option value="Creative">Creative (Print, Standee, Hiring, Tablemat)</option>
                      <option value="Promo">Promo (Discounts, Happy hour, Vouchers)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ko' ? `사용 희망일 (최소 H-${leadDays})` : `Target Date (Min H-${leadDays})`} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        {language === 'ko' ? `최소: ${minTargetDate}` : `Earliest: ${minTargetDate}`}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={designTargetDate}
                      min={minTargetDate}
                      onChange={(e) => setDesignTargetDate(e.target.value)}
                      disabled={branchQuota.design_used >= maxDesignLimit}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400 outline-none font-mono text-xs ${
                        !dateValidation.valid ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'ko' ? '상세 브리프 및 요청 설명' : 'Creative Brief & Details'} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={language === 'ko' ? '규격(Story/Feed/인쇄용), 강조할 텍스트 문구, 무드톤 등을 기재하세요...' : 'Specify format (Story/Feed/Print), required headline copy, color mood...'}
                      value={designDesc}
                      onChange={(e) => setDesignDesc(e.target.value)}
                      disabled={branchQuota.design_used >= maxDesignLimit}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-400 outline-none disabled:bg-slate-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={branchQuota.design_used >= maxDesignLimit || !dateValidation.valid}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {branchQuota.design_used >= maxDesignLimit ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{language === 'ko' ? `월간 한도 초과 (${maxDesignLimit}/${maxDesignLimit})` : `Quota Full (${maxDesignLimit}/${maxDesignLimit})`}</span>
                      </>
                    ) : !dateValidation.valid ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>{language === 'ko' ? `날짜 잠금 (< H-${leadDays})` : `Date Locked (< H-${leadDays})`}</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>{t('submitNewDesign')}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* List & Creative Management */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-amber-500" />
                        <span>{t('recentRequestsTitle')}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'ko' ? '제작 진행 상황 및 디자이너 배정 관리' : 'Track design status, claims, and approvals'}
                      </p>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isHQ && (
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                          <button
                            onClick={() => setTaskAssigneeFilter('all')}
                            className={`px-2 py-1 rounded-md font-bold transition ${
                              taskAssigneeFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {t('filterAllTasks')}
                          </button>
                          <button
                            onClick={() => setTaskAssigneeFilter('my')}
                            className={`px-2 py-1 rounded-md font-bold transition ${
                              taskAssigneeFilter === 'my' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {t('filterMyTasks')}
                          </button>
                        </div>
                      )}

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-2.5 py-1 outline-none font-medium cursor-pointer"
                      >
                        <option value="all">{language === 'ko' ? '모든 상태' : 'All Status'}</option>
                        <option value="pending">{t('status_pending')}</option>
                        <option value="in_progress">{t('status_in_progress')}</option>
                        <option value="review">{t('status_review')}</option>
                        <option value="approved">{t('status_approved')}</option>
                        <option value="rejected">{t('status_rejected')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Request Cards List */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDesignRequests.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        {language === 'ko' ? '해당 필터에 부합하는 디자인 요청이 없습니다.' : 'No design requests found for this filter.'}
                      </div>
                    ) : (
                      filteredDesignRequests.map((req) => {
                        const branchObj = branches.find((b) => b.id === req.branch_id);
                        const commentsList = req.comments || [];
                        const isCommentsOpen = !!expandedComments[req.id];

                        return (
                          <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                                  {branchObj?.name}
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
                                  {req.category}
                                </span>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{req.title}</h4>
                              </div>

                              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                {/* Approval Mode Badge */}
                                {req.approval_mode === 'self_approved' && (
                                  <span className="text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.2 rounded">
                                    {t('selfApprovedBadge')}
                                  </span>
                                )}
                                {req.approval_mode === 'pending_leader' && (
                                  <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded animate-pulse">
                                    {t('pendingLeaderBadge')}
                                  </span>
                                )}

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    req.status === 'approved'
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                      : req.status === 'in_progress'
                                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                                      : req.status === 'review'
                                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                      : req.status === 'rejected'
                                      ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {req.description}
                            </p>

                            {/* Working Files & Deliverable Links (Canva, Figma, Drive, Deliverable) */}
                            {(req.canva_url || req.figma_url || req.drive_url || req.asset_result_url || req.preview_media_url) && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {req.canva_url && (
                                  <a
                                    href={req.canva_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition"
                                    title="Open Canva Template"
                                  >
                                    <Palette className="w-3 h-3 text-sky-500" />
                                    <span>Canva</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}

                                {req.figma_url && (
                                  <a
                                    href={req.figma_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition"
                                    title="Open Figma File"
                                  >
                                    <Figma className="w-3 h-3 text-purple-500" />
                                    <span>Figma</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}

                                {req.drive_url && (
                                  <a
                                    href={req.drive_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition"
                                    title="Download from Google Drive"
                                  >
                                    <FolderOpen className="w-3 h-3 text-emerald-500" />
                                    <span>Google Drive</span>
                                    <Download className="w-2.5 h-2.5" />
                                  </a>
                                )}

                                {req.asset_result_url && (
                                  <a
                                    href={req.asset_result_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                                    title="Download Deliverable"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Deliverable</span>
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Assignee & Target Date Box */}
                            <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-500 dark:text-slate-400">{t('assignedTo')}:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {req.assigned_to_name || t('unassigned')}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>{t('targetDateLabel')}: <strong className="text-slate-800 dark:text-slate-200">{req.target_date}</strong></span>
                              </div>
                            </div>

                            {/* Actions & Comment Button */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>ID: <strong className="font-mono">{req.id}</strong></span>

                                {/* Feedback / Comments trigger */}
                                <button
                                  type="button"
                                  onClick={() => toggleComments(req.id)}
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 transition"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Feedback ({commentsList.length})</span>
                                  {isCommentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {/* WhatsApp Trigger Button (HQ Only) */}
                                {isHQ && (
                                  <button
                                    type="button"
                                    onClick={() => setWaModalRequest(req)}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 transition flex items-center gap-1 shadow-2xs"
                                    title="Kirim Pesan WhatsApp sesuai Status"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                  </button>
                                )}

                                {/* Live Mockup Preview Button */}
                                <button
                                  type="button"
                                  onClick={() => setMockupRequest(req)}
                                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 font-bold text-xs rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
                                  title="Live Instagram Feed & Reels Mockup"
                                >
                                  <Smartphone className="w-3.5 h-3.5 text-pink-500" />
                                  <span>Mockup Preview</span>
                                </button>

                                {/* 1-Click Auto-Publish Button */}
                                {(req.status === 'approved' || req.status === 'in_progress' || req.asset_result_url) && (
                                  <button
                                    type="button"
                                    onClick={() => setOmnipostModalRequest(req)}
                                    className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                                    title={language === 'ko' ? '인스타그램, 틱톡, 페이스북으로 자동 발행' : 'Auto-Post to Instagram, TikTok, & Facebook'}
                                  >
                                    <Send className="w-3.5 h-3.5 text-white" />
                                    <span>{language === 'ko' ? 'SNS 자동 발행' : 'Auto-Post'}</span>
                                  </button>
                                )}

                                {/* HQ Staff Claim & Manage Button */}
                                {isHQ && (
                                  <div className="flex items-center gap-1.5">
                                    {!req.assigned_to_user_id && isHQCreative && (
                                      <button
                                        onClick={() => assignDesignRequest(req.id, currentUser?.id || '')}
                                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition"
                                      >
                                        {t('assignToMe')}
                                      </button>
                                    )}

                                    {/* HQ Leader / Owner Direct Approve button if in review */}
                                    {(isHQOwner || isHQLeader) && req.status === 'review' && (
                                      <button
                                        onClick={() => updateDesignRequestStatus(req.id, 'approved', req.asset_result_url, 'Approved by HQ Leader', 'leader_approved')}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                                      >
                                        {language === 'ko' ? '팀장 즉시 승인' : 'Leader Approve'}
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleOpenTaskManagement(req)}
                                      className="px-2.5 py-1 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                      <span>{language === 'ko' ? '작업 관리' : 'Manage'}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Interactive Comments & Feedback Thread (Accordion) */}
                            {isCommentsOpen && (
                              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-2xl animate-in fade-in duration-150">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                                  <span className="flex items-center gap-1.5">
                                    <MessageCircle className="w-4 h-4 text-orange-500" />
                                    <span>{t('feedbackDiscussion')} ({commentsList.length})</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {language === 'ko' ? '본사 & 지점 실시간 소통' : 'HQ & Branch Collaboration'}
                                  </span>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                  {commentsList.length === 0 ? (
                                    <div className="p-3.5 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                      {language === 'ko'
                                        ? '등록된 피드백이 없습니다. 아래 입력창에 첫 번째 의견을 작성해 보세요!'
                                        : 'No feedback comments yet. Write the first message below!'}
                                    </div>
                                  ) : (
                                    commentsList.map((comm) => (
                                      <div
                                        key={comm.id}
                                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs shadow-xs"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-[9px] flex items-center justify-center border border-orange-500/20">
                                              {comm.user_name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                                              {comm.user_name}
                                            </span>
                                            {comm.tag && (
                                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                {comm.tag}
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            {comm.created_at}
                                          </span>
                                        </div>

                                        <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed pl-6.5">
                                          {comm.message}
                                        </p>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* Add Comment Form */}
                                <div className="space-y-2 pt-1">
                                  {/* Quick Tag Pills */}
                                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('selectLabel')}:</span>
                                    {(language === 'ko'
                                      ? ['디자인 수정', '가격 수정', '게시 가능', '파일 규격', '긴급']
                                      : ['Design Revision', 'Price Correction', 'Ready to Post', 'File Format', 'Urgent']
                                    ).map((tag) => (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setCommentTags((prev) => ({ ...prev, [req.id]: tag === prev[req.id] ? '' : tag }))}
                                        className={`px-2.5 py-0.5 rounded-lg border font-semibold transition text-[10px] ${
                                          commentTags[req.id] === tag
                                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder={t('commentPlaceholder')}
                                      value={commentInputs[req.id] || ''}
                                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [req.id]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSendComment(req.id);
                                      }}
                                      className="flex-1 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none placeholder-slate-400 font-medium"
                                    />

                                    <button
                                      type="button"
                                      onClick={() => handleSendComment(req.id)}
                                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      <span>{t('send')}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{whitelabelConfig.brand_name} Creative Studio Engine</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Total: {filteredDesignRequests.length} requests</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: PROMO CAMPAIGNS */}
      {/* ========================================================== */}
      {activeEngineTab === 'promo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('submitNewPromo')}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {branchQuota.promo_used}/{maxPromoLimit} {language === 'ko' ? '사용' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ko' ? `지점 대표 및 매장 매니저 모두 직접 프로모션을 제안할 수 있습니다.` : `Branch Owners and Store Managers can submit promo proposals.`}
              </p>
            </div>

            {/* Cut-off Info */}
            <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              !promoLockCheck.allowed
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>{language === 'ko' ? `마감일 (${cutoffDay}일) 규정:` : `Cut-off Policy (Day ${cutoffDay}):`}</span>
                <span>{new Date(simulatedDate).getDate() > cutoffDay ? 'LOCKED (> 25)' : 'OPEN'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {!promoLockCheck.allowed
                  ? promoLockCheck.reason
                  : `Simulated date is day ${new Date(simulatedDate).getDate()}. Next month promo proposals lock on day ${cutoffDay} at 23:59 WITA.`}
              </p>
            </div>

            {promoFormAlert && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  promoFormAlert.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {promoFormAlert.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{promoFormAlert.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPromo} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '프로모션 명칭' : 'Promo Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunset Happy Hour 2+1 Gyoza"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  disabled={!promoLockCheck.allowed || branchQuota.promo_used >= maxPromoLimit}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-400 outline-none disabled:bg-slate-100 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '대상 월' : 'Target Month'}
                </label>
                <select
                  value={promoTargetMonth}
                  onChange={(e) => setPromoTargetMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-400 outline-none bg-white font-medium"
                >
                  <option value="2026-10">October 2026 (Next Month)</option>
                  <option value="2026-09">September 2026 (Current Month)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '할인 및 혜택 메커니즘' : 'Discount Mechanic'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Buy 2 Ramen get 1 Free Matcha Dessert"
                  value={promoMechanic}
                  onChange={(e) => setPromoMechanic(e.target.value)}
                  disabled={!promoLockCheck.allowed || branchQuota.promo_used >= maxPromoLimit}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-400 outline-none disabled:bg-slate-100 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{language === 'ko' ? '시작일' : 'Start Date'}</label>
                  <input
                    type="date"
                    value={promoStartDate}
                    onChange={(e) => setPromoStartDate(e.target.value)}
                    disabled={!promoLockCheck.allowed || branchQuota.promo_used >= maxPromoLimit}
                    className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-xs disabled:bg-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{language === 'ko' ? '종료일' : 'End Date'}</label>
                  <input
                    type="date"
                    value={promoEndDate}
                    onChange={(e) => setPromoEndDate(e.target.value)}
                    disabled={!promoLockCheck.allowed || branchQuota.promo_used >= maxPromoLimit}
                    className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-xs disabled:bg-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '이용 조건 및 유의사항' : 'Terms & Conditions'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Dine-in only, follow IG required..."
                  value={promoTerms}
                  onChange={(e) => setPromoTerms(e.target.value)}
                  disabled={!promoLockCheck.allowed || branchQuota.promo_used >= maxPromoLimit}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-400 outline-none disabled:bg-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={!promoLockCheck.allowed || branchQuota.promo_used >= maxPromoLimit}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {!promoLockCheck.allowed ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{language === 'ko' ? `마감일 초과 (${cutoffDay}일 이후 잠금)` : `Locked (Past Day ${cutoffDay})`}</span>
                  </>
                ) : branchQuota.promo_used >= maxPromoLimit ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{language === 'ko' ? `최대 ${maxPromoLimit}건 한도 도달` : `Max ${maxPromoLimit} Active Reached`}</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('submitNewPromo')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Promo List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {language === 'ko' ? '지점 활성 프로모션 목록' : 'Active Branch Promos'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ko' ? '공식 채널 노출 스케줄과 연동되는 프로모션' : 'Active promotional campaigns linked with exposure rotator'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPromos.map((promo) => {
                const branch = branches.find((b) => b.id === promo.branch_id);
                return (
                  <div
                    key={promo.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">
                        {branch?.name}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded uppercase">
                        {promo.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{promo.title}</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{promo.mechanic}</p>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                      <span>{t('date')}:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">
                        {promo.start_date} ~ {promo.end_date}
                      </span>
                    </div>
                    {promo.terms && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Terms: {promo.terms}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: SHOOT & ADDITIONAL WORK */}
      {/* ========================================================== */}
      {activeEngineTab === 'shoot' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('shootRequestTitle')}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                  {language === 'ko' ? '매니저 / 대표 신청' : 'Manager / Owner'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('shootRequestSubtitle')}
              </p>
            </div>

            {shootFormAlert && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  shootFormAlert.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {shootFormAlert.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{shootFormAlert.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitShoot} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('shootTypeLabel')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={shootType}
                  onChange={(e) => setShootType(e.target.value as ShootRequestType)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none bg-white font-medium"
                >
                  <option value="photoshoot_visit">{t('typePhotoshootVisit')}</option>
                  <option value="video_reels_visit">{t('typeVideoReelsVisit')}</option>
                  <option value="menu_revamp_shoot">{t('typeMenuRevampShoot')}</option>
                  <option value="additional_work">{t('typeAdditionalWork')}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '요청 제목' : 'Request Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signature Truffle Ramen & Barista Reels Session"
                  value={shootTitle}
                  onChange={(e) => setShootTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('preferredDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={shootPreferredDate}
                  onChange={(e) => setShootPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('shootDetails')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder={t('shootDetailsPlaceholder')}
                  value={shootDetails}
                  onChange={(e) => setShootDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t('requestShootBtn')}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {language === 'ko' ? '지점 촬영 및 추가 업무 요청 현황' : 'Branch Shoot & Additional Work Sessions'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ko' ? '본사 크리에이티브팀 출장 촬영 및 추가 인쇄물 제작 일정' : 'Schedule of on-site visits and custom production tasks'}
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredShoots.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {language === 'ko' ? '등록된 촬영 요청이 없습니다.' : 'No shoot requests logged yet.'}
                </div>
              ) : (
                filteredShoots.map((shoot) => {
                  return (
                    <div key={shoot.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 uppercase">
                            {shoot.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {shoot.branch_name}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{shoot.title}</h4>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase self-start sm:self-auto ${
                          shoot.status === 'scheduled'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : shoot.status === 'completed'
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}>
                          {shoot.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{shoot.details}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>{language === 'ko' ? '신청자' : 'Requester'}: <strong className="text-slate-700 dark:text-slate-200">{shoot.requester_name}</strong></span>
                          <span>•</span>
                          <span>{t('preferredDate')}: <strong className="font-mono text-slate-700 dark:text-slate-200">{shoot.preferred_date}</strong></span>
                        </div>

                        {isHQ && shoot.status === 'pending' && (
                          <button
                            onClick={() => updateShootRequestStatus(shoot.id, 'scheduled', currentUser?.id || '')}
                            className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                          >
                            {language === 'ko' ? '일정 승인 및 담당자 배정' : 'Confirm & Schedule'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: BUDGET ALLOCATION */}
      {/* ========================================================== */}
      {activeEngineTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('budgetRequestTitle')}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {language === 'ko' ? '본사 팀 신청' : 'HQ Team'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('budgetRequestSubtitle')}
              </p>
            </div>

            {budgetFormAlert && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  budgetFormAlert.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {budgetFormAlert.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{budgetFormAlert.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBudget} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('budgetType')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value as BudgetRequestType)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none bg-white font-medium"
                >
                  <option value="meta_ads">{t('metaAds')}</option>
                  <option value="google_ads">{t('googleAds')}</option>
                  <option value="photoshoot_visit">{t('photoshootProps')}</option>
                  <option value="production_props">{t('productionProps')}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '대상 지점' : 'Target Branch'} <span className="text-red-500">*</span>
                </label>
                {isHQ ? (
                  <select
                    value={budgetBranchId}
                    onChange={(e) => setBudgetBranchId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none bg-white font-medium"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-lg font-bold text-xs flex items-center justify-between">
                    <span>{currentBranch?.name || branches[0]?.name}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      {currentBranch?.code || 'MY-BRANCH'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('budgetAmount')} ({whitelabelConfig.currency_symbol}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="50000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '예산 요청 제목' : 'Campaign Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. October Instagram Reels Boost & Discovery Ads"
                  value={budgetTitle}
                  onChange={(e) => setBudgetTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('budgetObjective')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'ko' ? '타깃 오디언스, 예상 도달수, 촬영 장비 대여 내역 등을 구체적으로 기재하세요...' : 'Expected impressions, target audience radius, prop rental specs...'}
                  value={budgetObjective}
                  onChange={(e) => setBudgetObjective(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>{t('requestBudget')}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-[#15171e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'ko' ? '예산 집행 및 지점 정산 내역' : 'Branch Ad & Shoot Budget Allocations'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'ko' 
                    ? '승인 ➔ HQ 자금 이체 (영수증 첨부) ➔ 크리에이티브팀 수령 확인 ➔ 광고 집행 완료 보고서(LPJ)' 
                    : 'Approval ➔ HQ Fund Transfer (Proof Attached) ➔ Creative Receipt ➔ Ad Execution Report (LPJ)'}
                </p>
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'pending_approval', 'disbursed', 'acknowledged', 'completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setBudgetFilterStatus(st)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition capitalize cursor-pointer ${
                      budgetFilterStatus === st
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all'
                      ? (language === 'ko' ? '전체' : 'All')
                      : st === 'pending_approval'
                      ? (language === 'ko' ? '승인 대기' : 'Pending')
                      : st === 'disbursed'
                      ? (language === 'ko' ? '이체 완료' : 'Disbursed')
                      : st === 'acknowledged'
                      ? (language === 'ko' ? '수령 확인' : 'Acknowledged')
                      : (language === 'ko' ? '보고서 완료' : 'Completed')}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBudgetRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  {language === 'ko' ? '해당 상태의 예산 신청 내역이 없습니다.' : 'No budget requests found for this filter.'}
                </div>
              ) : (
                filteredBudgetRequests.map((b) => {
                  return (
                    <div key={b.id} className="py-4.5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase">
                            {b.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            📍 {b.target_branch_name}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{b.title}</h4>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="text-base font-black text-slate-900 dark:text-slate-100">
                            {whitelabelConfig.currency_symbol} {b.amount.toLocaleString()}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            b.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : b.status === 'disbursed'
                              ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                              : b.status === 'acknowledged'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : b.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {b.status === 'disbursed' 
                              ? (language === 'ko' ? '자금 이체 완료' : 'FUNDS DISBURSED') 
                              : b.status === 'acknowledged' 
                              ? (language === 'ko' ? '제작팀 수령 확인' : 'ACKNOWLEDGED') 
                              : b.status === 'completed' 
                              ? (language === 'ko' ? '보고서 제출 완료 (LPJ)' : 'REPORT COMPLETED') 
                              : b.status === 'rejected'
                              ? (language === 'ko' ? '반려됨' : 'REJECTED')
                              : (language === 'ko' ? '승인 대기' : 'PENDING APPROVAL')}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        {b.objective}
                      </p>

                      {/* Visual Workflow Steps / Indicators */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        {/* Step 1: Transfer Proof Info */}
                        <div className={`p-2 rounded-xl border ${
                          b.transfer_proof_url 
                            ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/50 text-sky-900 dark:text-sky-300' 
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}>
                          <div className="font-bold flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5" />
                            <span>1. {language === 'ko' ? 'HQ 자금 이체' : 'HQ Transfer'}</span>
                          </div>
                          <div className="text-[10px] mt-0.5 truncate">
                            {b.transfer_proof_url ? `Ref: ${b.transfer_reference || 'Tf OK'}` : (language === 'ko' ? 'HQ 이체 대기' : 'Pending HQ Transfer')}
                          </div>
                        </div>

                        {/* Step 2: Creative Receipt */}
                        <div className={`p-2 rounded-xl border ${
                          b.acknowledged_at || b.status === 'completed'
                            ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-300' 
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}>
                          <div className="font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>2. {language === 'ko' ? '크리에이티브팀 수령' : 'Creative Received'}</span>
                          </div>
                          <div className="text-[10px] mt-0.5 truncate">
                            {b.acknowledged_at ? `${language === 'ko' ? '수령' : 'Ack'}: ${b.acknowledged_at.slice(0, 10)}` : (language === 'ko' ? '수령 확인 대기' : 'Pending Acknowledgment')}
                          </div>
                        </div>

                        {/* Step 3: Execution LPJ Report */}
                        <div className={`p-2 rounded-xl border ${
                          b.completion_report 
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300' 
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}>
                          <div className="font-bold flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>3. {language === 'ko' ? '실행 보고서 (LPJ)' : 'LPJ Report & Proof'}</span>
                          </div>
                          <div className="text-[10px] mt-0.5 truncate">
                            {b.completion_report ? `Reach: ${b.completion_report.reach?.toLocaleString() || (language === 'ko' ? '완료' : 'Done')}` : (language === 'ko' ? '보고서 미작성' : 'Report Pending')}
                          </div>
                        </div>
                      </div>

                      {/* Footer details & Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{language === 'ko' ? '신청자' : 'Requester'}: <strong className="text-slate-700 dark:text-slate-300">{b.requester_name}</strong></span>
                          <span>•</span>
                          <span>{b.created_at}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* HQ Owner/Leader Disburse Action */}
                          {(isHQOwner || isHQLeader) && b.status === 'pending_approval' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => rejectBudgetRequest(b.id)}
                                className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 font-bold rounded-xl text-xs transition cursor-pointer"
                              >
                                {t('rejectBudget')}
                              </button>
                              <button
                                onClick={() => {
                                  setDisburseModalRequest(b);
                                  setDisburseRef(`BCA-TF-${Math.floor(100000 + Math.random() * 900000)}`);
                                  setDisburseNote(`Disbursement ${b.type} for ${b.target_branch_name}`);
                                }}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>{language === 'ko' ? '승인 및 자금 이체' : 'Approve & Disburse Funds'}</span>
                              </button>
                            </div>
                          )}

                          {/* Creative Team Acknowledge & LPJ Actions */}
                          {isHQ && b.status === 'disbursed' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => acknowledgeBudgetDisbursement(b.id)}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{language === 'ko' ? '수령 확인' : 'Acknowledge Funds'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setReportModalRequest(b);
                                  setReportSpentAmount(b.amount);
                                  setReportNotes(language === 'ko' ? `${b.title} 광고 집행이 완료되었으며 목표 도달수를 달성했습니다.` : `Campaign ${b.title} successfully executed and reached target audience.`);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{language === 'ko' ? 'LPJ 업로드' : 'Upload LPJ Report'}</span>
                              </button>
                            </div>
                          )}

                          {isHQ && b.status === 'acknowledged' && (
                            <button
                              onClick={() => {
                                setReportModalRequest(b);
                                setReportSpentAmount(b.amount);
                                setReportNotes(language === 'ko' ? `${b.title} 광고 집행이 완료되었으며 목표 도달수를 달성했습니다.` : `Campaign ${b.title} successfully executed and reached target audience.`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{language === 'ko' ? 'LPJ 업로드' : 'Upload Execution Report (LPJ)'}</span>
                            </button>
                          )}

                          {/* Inspection button (Available to Branch & HQ) */}
                          {(b.status === 'disbursed' || b.status === 'acknowledged' || b.status === 'completed') && (
                            <button
                              onClick={() => setInspectBudgetModal(b)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{language === 'ko' ? '이체 영수증 및 보고서 보기' : 'View Transfer Proof & LPJ'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 1: Manage Deliverables (Canva, Figma, Drive, Video/Image) */}
      {/* ========================================================== */}
      {managingReq && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Upload &amp; Manage Creative Deliverables</span>
              </h3>
              <button onClick={() => setManagingReq(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{managingReq.title}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{managingReq.description}</div>
            </div>

            <form onSubmit={handleSaveTaskManagement} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('assignedTo')}
                  </label>
                  <select
                    value={modalAssigneeId}
                    onChange={(e) => setModalAssigneeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs focus:ring-2 focus:ring-amber-500 font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    {creativeUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.job_title || u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('updateTaskStatus')}
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as RequestStatus)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs focus:ring-2 focus:ring-amber-500 font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="pending">{t('status_pending')}</option>
                    <option value="in_progress">{t('status_in_progress')}</option>
                    <option value="review">{t('status_review')}</option>
                    <option value="approved">{t('status_approved')}</option>
                    <option value="rejected">{t('status_rejected')}</option>
                  </select>
                </div>
              </div>

              {/* Approval Mode Choice */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-3 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 space-y-1.5">
                <label className="font-bold text-indigo-950 dark:text-indigo-200 block text-[11px]">
                  {language === 'ko' ? '승인 워크플로우 선택' : 'Approval Workflow Mode'}
                </label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="approval_mode"
                      value="self_approved"
                      checked={modalApprovalMode === 'self_approved'}
                      onChange={() => setModalApprovalMode('self_approved')}
                      className="text-amber-500"
                    />
                    <span>{t('selfApproveDirect')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="approval_mode"
                      value="pending_leader"
                      checked={modalApprovalMode === 'pending_leader'}
                      onChange={() => setModalApprovalMode('pending_leader')}
                      className="text-amber-500"
                    />
                    <span>{t('requestApprovalFromLeader')}</span>
                  </label>
                </div>
              </div>

              {/* File Preview (Image / Video) Upload & URL */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <FileImage className="w-4 h-4 text-orange-500" />
                    <span>{t('uploadPreviewFile')}</span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <label className="flex items-center gap-1 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="preview_media_type"
                        checked={modalPreviewMediaType === 'image'}
                        onChange={() => setModalPreviewMediaType('image')}
                        className="text-orange-600"
                      />
                      <span>Image</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="preview_media_type"
                        checked={modalPreviewMediaType === 'video'}
                        onChange={() => setModalPreviewMediaType('video')}
                        className="text-orange-600"
                      />
                      <span>Video</span>
                    </label>
                  </div>
                </div>

                {/* Drag and Drop / Choose File Button */}
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-orange-500 dark:hover:border-orange-400 rounded-xl p-3 text-center transition bg-white dark:bg-slate-900 group">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const isVideo = file.type.startsWith('video/');
                        setModalPreviewMediaType(isVideo ? 'video' : 'image');
                        const reader = new FileReader();
                        reader.onload = (loadEvt) => {
                          if (loadEvt.target?.result) {
                            setModalPreviewMediaUrl(String(loadEvt.target.result));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                    <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('browseFile')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t('dragDropFile')}
                    </span>
                  </div>
                </div>

                {/* Direct URL input */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Or paste direct asset / image / video URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or https://.../video.mp4"
                    value={modalPreviewMediaUrl}
                    onChange={(e) => setModalPreviewMediaUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Live Preview Thumbnail */}
                {modalPreviewMediaUrl && (
                  <div className="mt-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      {modalPreviewMediaType === 'video' ? (
                        <FileVideo className="w-7 h-7 text-orange-400" />
                      ) : (
                        <img
                          src={modalPreviewMediaUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Preview Loaded
                      </span>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                        {modalPreviewMediaUrl.slice(0, 45)}...
                      </p>
                      <button
                        type="button"
                        onClick={() => setModalPreviewMediaUrl('')}
                        className="text-[10px] text-red-500 hover:underline mt-1 cursor-pointer"
                      >
                        Remove Asset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Canva, Figma, Drive Download Links for Branches */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  {t('workingFilesAndLinks')}
                </span>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-[11px] font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1 shrink-0">
                      <Palette className="w-3.5 h-3.5 text-sky-500" />
                      <span>{t('canvaTemplate')}</span>
                    </span>
                    <input
                      type="url"
                      placeholder="https://www.canva.com/design/..."
                      value={modalCanvaUrl}
                      onChange={(e) => setModalCanvaUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-24 text-[11px] font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1 shrink-0">
                      <Figma className="w-3.5 h-3.5 text-purple-500" />
                      <span>{t('figmaFile')}</span>
                    </span>
                    <input
                      type="url"
                      placeholder="https://www.figma.com/file/..."
                      value={modalFigmaUrl}
                      onChange={(e) => setModalFigmaUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-24 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                      <FolderOpen className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t('googleDrive')}</span>
                    </span>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={modalDriveUrl}
                      onChange={(e) => setModalDriveUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ready to Post Caption */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                  {language === 'ko' ? '게시용 캡션 (지점 목업에서 즉시 수정 가능)' : 'Ready-to-Post Caption (Editable by branch in Mockup)'}
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'ko' ? '인스타그램 게시 캡션 및 공식 해시태그...' : 'Write Instagram caption, body copy, and hashtags...'}
                  value={modalCaption}
                  onChange={(e) => setModalCaption(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('creativeNotes')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('creativeNotesPlaceholder')}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setManagingReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {language === 'ko' ? '변경사항 저장' : 'Save Deliverables'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* MODAL 2: HQ Approve & Disburse Transfer Proof Modal */}
      {/* ========================================================== */}
      {disburseModalRequest && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'ko' ? '예산 승인 및 이체 증빙 등록' : 'Approve & Upload Transfer Proof'}</span>
              </h3>
              <button onClick={() => setDisburseModalRequest(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
              <div className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
                <span>{disburseModalRequest.title}</span>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                  {whitelabelConfig.currency_symbol} {disburseModalRequest.amount.toLocaleString()}
                </span>
              </div>
              <div className="text-emerald-800 dark:text-emerald-400 text-[11px]">
                {language === 'ko' ? '대상 지점:' : 'Target Branch:'} <strong>{disburseModalRequest.target_branch_name}</strong> • {language === 'ko' ? '카테고리:' : 'Category:'} <strong>{disburseModalRequest.type}</strong>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80 pt-1">
                {language === 'ko'
                  ? 'ℹ️ 승인 시 해당 지점의 광고 예치금 지갑에서 금액이 자동 차감되며, 지점에서도 이체 영수증을 확인할 수 있습니다.'
                  : 'ℹ️ Funds will be automatically deducted from the branch deposit wallet, and the branch can view the transfer proof.'}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!disburseProofUrl) {
                  alert(language === 'ko' ? '이체 영수증 이미지를 업로드하거나 링크를 입력하세요.' : 'Please upload or provide a transfer proof receipt.');
                  return;
                }
                disburseBudgetRequest(disburseModalRequest.id, disburseProofUrl, disburseRef, disburseNote);
                setDisburseModalRequest(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '은행 이체 번호 / 거래 ID' : 'Bank Reference Number / Transaction ID'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BCA-MB-948201 / TRF-20260926"
                  value={disburseRef}
                  onChange={(e) => setDisburseRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              {/* Upload Proof / Paste URL */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  {language === 'ko' ? '이체 영수증 사진 (모바일 뱅킹 캡처 / 영수증)' : 'Transfer Proof Image (M-Banking Screenshot / Receipt)'} <span className="text-red-500">*</span>
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
                            setDisburseProofUrl(String(loadEvt.target.result));
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
                      {language === 'ko' ? '컴퓨터에서 이체 영수증 사진 선택' : 'Choose Transfer Receipt from Computer'}
                    </span>
                  </div>
                </div>

                <input
                  type="url"
                  placeholder={language === 'ko' ? '또는 이체 영수증 이미지 URL 입력...' : 'Or paste image URL...'}
                  value={disburseProofUrl}
                  onChange={(e) => setDisburseProofUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                />

                {disburseProofUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img src={disburseProofUrl} alt="Transfer proof preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'ko' ? '영수증 첨부 완료' : 'Transfer Receipt Attached'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '이체 메모 및 안내 사항' : 'Transfer Notes / Target Bank'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ko' ? '제작팀을 위한 추가 안내 사항...' : 'Additional notes for creative execution team...'}
                  value={disburseNote}
                  onChange={(e) => setDisburseNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDisburseModalRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {language === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{language === 'ko' ? '이체 확인 및 지점 잔액 차감' : 'Disburse & Deduct Wallet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* MODAL 3: Creative Team Submit Completion Report (LPJ) */}
      {/* ========================================================== */}
      {reportModalRequest && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'ko' ? '광고/제작 실행 완료 보고서 (LPJ)' : 'Ad & Production Execution Report (LPJ)'}</span>
              </h3>
              <button onClick={() => setReportModalRequest(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{reportModalRequest.title}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Target: {reportModalRequest.target_branch_name} • {language === 'ko' ? '배정 예산:' : 'Allocated Budget:'} {whitelabelConfig.currency_symbol} {reportModalRequest.amount.toLocaleString()}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reportProofUrl) {
                  alert(language === 'ko' ? '메타 광고 대시보드 캡처 또는 영수증을 첨부하세요.' : 'Please attach Meta Ads dashboard screenshot or receipt.');
                  return;
                }
                submitBudgetCompletionReport(reportModalRequest.id, {
                  executed_date: simulatedDate,
                  spent_amount: reportSpentAmount,
                  proof_screenshot_url: reportProofUrl,
                  impressions: reportImpressions,
                  reach: reportReach,
                  deliverable_link: reportDeliverableLink,
                  report_notes: reportNotes
                });
                setReportModalRequest(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '실제 집행 금액 (Rp)' : 'Actual Spent Amount (Rp)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={reportSpentAmount}
                    onChange={(e) => setReportSpentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '광고 관리자 링크 / 결과물 URL' : 'Ads Manager Link / Deliverable URL'}
                  </label>
                  <input
                    type="url"
                    value={reportDeliverableLink}
                    onChange={(e) => setReportDeliverableLink(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '도달수 (Reach)' : 'Est. Reach (Accounts)'}
                  </label>
                  <input
                    type="number"
                    value={reportReach}
                    onChange={(e) => setReportReach(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '노출수 (Impressions)' : 'Impressions (Ad Views)'}
                  </label>
                  <input
                    type="number"
                    value={reportImpressions}
                    onChange={(e) => setReportImpressions(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              {/* Screenshot proof */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  {language === 'ko' ? '광고 대시보드 캡처 / 영수증' : 'Ads Dashboard Screenshot / Spending Proof'} <span className="text-red-500">*</span>
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
                            setReportProofUrl(String(loadEvt.target.result));
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
                      {language === 'ko' ? '대시보드 캡처 사진 선택' : 'Select Screenshot / Receipt'}
                    </span>
                  </div>
                </div>

                <input
                  type="url"
                  placeholder={language === 'ko' ? '또는 스크린샷 이미지 URL 입력...' : 'Or enter screenshot URL...'}
                  value={reportProofUrl}
                  onChange={(e) => setReportProofUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                />

                {reportProofUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img src={reportProofUrl} alt="Report proof preview" className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'ko' ? '증빙 자료 첨부됨' : 'Report Proof Ready'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '캠페인 성과 요약 및 분석' : 'Campaign Summary & Evaluation'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ko' ? '성과 평가, 타깃 반응, 향후 권장 사항 등을 작성하세요...' : 'Write performance evaluation, audience engagement, or recommendations...'}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportModalRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {language === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'ko' ? '지점에 LPJ 보고서 전송' : 'Send LPJ Report to Branch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* MODAL 4: Full Transparency Inspector (HQ Transfer Proof & Creative LPJ) */}
      {/* ========================================================== */}
      {inspectBudgetModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'ko' ? '예산 집행 증빙 및 완료 보고서' : 'Audit Trail: Transfer Proof & LPJ Report'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'ko' ? '가맹점 예치금 차감 및 집행 투명성 감사 기록' : 'Transparency record for franchise ad deposit deduction and execution'}
                </p>
              </div>
              <button onClick={() => setInspectBudgetModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage 1: Request info */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {inspectBudgetModal.title}
                </div>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {whitelabelConfig.currency_symbol} {inspectBudgetModal.amount.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div>{language === 'ko' ? '대상 지점:' : 'Branch:'} <strong>{inspectBudgetModal.target_branch_name}</strong></div>
                <div>{language === 'ko' ? '카테고리:' : 'Category:'} <strong>{inspectBudgetModal.type}</strong></div>
                <div>{language === 'ko' ? '신청자:' : 'Requester:'} <strong>{inspectBudgetModal.requester_name}</strong></div>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                {language === 'ko' ? '목적:' : 'Objective:'} {inspectBudgetModal.objective}
              </div>
            </div>

            {/* Stage 2: HQ Transfer Proof */}
            <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/20 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-sky-600" />
                  <span>{language === 'ko' ? '본사(HQ) 자금 이체 증빙' : 'HQ Fund Transfer Proof'}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 font-mono">
                  Ref: {inspectBudgetModal.transfer_reference || 'Tf Verified'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <div className="text-slate-500 dark:text-slate-400">{language === 'ko' ? '이체 처리자:' : 'Transferred by:'}</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{inspectBudgetModal.disbursed_by || 'HQ Finance'}</div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">{language === 'ko' ? '이체 일시:' : 'Transfer Time:'}</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{inspectBudgetModal.disbursed_at || inspectBudgetModal.created_at}</div>
                </div>
              </div>

              {inspectBudgetModal.transfer_proof_url ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{language === 'ko' ? '이체 영수증 사진:' : 'Transfer Receipt Photo:'}</div>
                  <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-56 bg-slate-900 flex items-center justify-center">
                    <img src={inspectBudgetModal.transfer_proof_url} alt="Receipt Proof" className="max-h-56 object-contain" />
                  </div>
                  <a
                    href={inspectBudgetModal.transfer_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-bold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{language === 'ko' ? '고화질 원본 영수증 열기' : 'Open Full HD Receipt Image'}</span>
                  </a>
                </div>
              ) : (
                <div className="text-slate-400 italic text-[11px]">{language === 'ko' ? '이체 영수증이 첨부되지 않았습니다.' : 'No transfer receipt attached.'}</div>
              )}
            </div>

            {/* Stage 3: Creative Team Completion Report (LPJ) */}
            {inspectBudgetModal.completion_report ? (
              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ko' ? '크리에이티브팀 집행 완료 보고서 (LPJ)' : 'Creative Execution Report (LPJ)'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                    {language === 'ko' ? '집행 완료' : 'Executed'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">{language === 'ko' ? '실제 집행 비용' : 'Actual Spent'}</div>
                    <div className="font-black text-xs text-slate-900 dark:text-slate-100">
                      {whitelabelConfig.currency_symbol} {inspectBudgetModal.completion_report.spent_amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">{language === 'ko' ? '도달수 (Reach)' : 'Reach'}</div>
                    <div className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                      {inspectBudgetModal.completion_report.reach?.toLocaleString() || '-'}
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">{language === 'ko' ? '노출수 (Impressions)' : 'Impressions'}</div>
                    <div className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                      {inspectBudgetModal.completion_report.impressions?.toLocaleString() || '-'}
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">{language === 'ko' ? '보고 일자' : 'Report Date'}</div>
                    <div className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {inspectBudgetModal.completion_report.executed_date}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{language === 'ko' ? '광고 대시보드 캡처 / 증빙 영수증:' : 'Ads Dashboard Screenshot / Spending Proof:'}</div>
                  <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-56 bg-slate-900 flex items-center justify-center">
                    <img src={inspectBudgetModal.completion_report.proof_screenshot_url} alt="Ads proof" className="max-h-56 object-contain" />
                  </div>
                </div>

                {inspectBudgetModal.completion_report.report_notes && (
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <strong>{language === 'ko' ? '성과 평가 노트:' : 'Evaluation Notes:'}</strong> {inspectBudgetModal.completion_report.report_notes}
                  </div>
                )}

                {inspectBudgetModal.completion_report.deliverable_link && (
                  <a
                    href={inspectBudgetModal.completion_report.deliverable_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{language === 'ko' ? '캠페인 결과물 / 대시보드 링크 열기' : 'Open Deliverables / Campaign Folder Link'}</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                ⏳ {language === 'ko' ? '크리에이티브팀이 캠페인을 진행 중입니다. 완료 후 LPJ 보고서가 여기에 표시됩니다.' : 'Creative Team is processing the campaign/production. Execution report (LPJ) will appear here once submitted.'}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectBudgetModal(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
              >
                {language === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Live Social Media Mockup Modal */}
      <SocialMediaMockupModal
        isOpen={!!mockupRequest}
        request={mockupRequest}
        onClose={() => setMockupRequest(null)}
      />

      {/* WhatsApp Action Dispatcher Modal for Design Request */}
      <DesignWhatsAppModal
        isOpen={!!waModalRequest}
        request={waModalRequest}
        onClose={() => setWaModalRequest(null)}
      />

      {/* Omnipost 1-Click Publishing Modal */}
      <OmnipostPublishModal
        isOpen={!!omnipostModalRequest}
        designRequest={omnipostModalRequest || undefined}
        onClose={() => setOmnipostModalRequest(null)}
      />
    </div>
  );
};
