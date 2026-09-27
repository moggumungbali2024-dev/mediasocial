import React from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Store, 
  Layers, 
  Tag, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Download, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Activity,
  Camera,
  Users2,
  Lock,
  Plus
} from 'lucide-react';
import { DashboardTimelineCards } from './DashboardTimelineCards.tsx';

interface DashboardCabangProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardCabang: React.FC<DashboardCabangProps> = ({ onNavigateTab }) => {
  const { 
    currentBranch, 
    currentUser, 
    activeRole,
    isBranchOwner,
    isBranchManager,
    canAccessBilling,
    getBranchQuota, 
    simulatedDate, 
    designRequests, 
    promos, 
    invoices, 
    exposureSlots,
    calculateMinTargetDate,
    whitelabelConfig,
    t,
    language
  } = usePortal();

  if (!currentBranch) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto shadow-sm">
        <Store className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-700 font-semibold text-sm">
          {language === 'ko' ? '상단 프로필 메뉴에서 지점 계정을 선택해 주세요.' : 'Please select a branch account from the top menu.'}
        </p>
      </div>
    );
  }

  const maxDesign = whitelabelConfig.max_monthly_design_requests || 3;
  const maxPromo = whitelabelConfig.max_monthly_active_promos || 2;
  const leadDays = whitelabelConfig.design_min_lead_days || 5;
  const cutoffDay = whitelabelConfig.promo_cutoff_day_of_month || 25;

  const currentMonth = simulatedDate.slice(0, 7); // '2026-09'
  const quota = getBranchQuota(currentBranch.id, currentMonth);

  // Filter items for this branch
  const branchRequests = designRequests.filter((r) => r.branch_id === currentBranch.id);
  const branchPromos = promos.filter((p) => p.branch_id === currentBranch.id);
  const branchInvoices = invoices.filter((i) => i.branch_id === currentBranch.id);
  const branchExposure = exposureSlots.filter((e) => e.branch_id === currentBranch.id);

  // Latest invoice (only accessed if canAccessBilling)
  const currentInvoice = branchInvoices.find((i) => i.period_month.startsWith(currentMonth)) || branchInvoices[0];

  const minTargetDate = calculateMinTargetDate();
  const dayOfMonth = new Date(simulatedDate).getDate();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Branch Header Banner - The Canvas Style */}
      <div className="bg-[#121316] border border-white/10 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
              <Store className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-emerald-400 border border-white/10 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{t('activeFranchiseBranch')} • {currentBranch.city}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-['Space_Grotesk']">
                {currentBranch.name}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {t('contactPersonLabel')}: <strong className="text-white">{currentBranch.contact_person}</strong> ({currentBranch.phone}) • {currentBranch.location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('activity')}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition border border-white/10 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>{t('activityFeedBtn')}</span>
            </button>

            <button
              onClick={() => onNavigateTab('requests')}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/30 text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{t('submitDesignBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quota & Status Grid (4 Key Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Design Quota Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('designQuotaCard')} ({currentMonth})
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{quota.design_used}</span>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm">/ {maxDesign} {language === 'ko' ? '건' : 'requests'}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quota.design_used >= maxDesign ? 'bg-red-500' : quota.design_used >= maxDesign - 1 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (quota.design_used / maxDesign) * 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {t('remainingQuota')}: <strong className="text-slate-700 dark:text-slate-200">{Math.max(0, maxDesign - quota.design_used)} {language === 'ko' ? '건' : 'left'}</strong>
            </span>
            {quota.design_used >= maxDesign ? (
              <span className="text-red-600 dark:text-red-400 font-bold text-[10px] bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                {t('quotaExhausted')}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                {t('available')}
              </span>
            )}
          </div>
        </div>

        {/* 2. Promo Quota Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('promoQuotaCard')}
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Tag className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{quota.promo_used}</span>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm">/ {maxPromo} {language === 'ko' ? '건' : 'active'}</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quota.promo_used >= maxPromo ? 'bg-red-500' : 'bg-purple-500'
              }`}
              style={{ width: `${Math.min(100, (quota.promo_used / maxPromo) * 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {dayOfMonth > cutoffDay ? (
                <span className="text-red-500 dark:text-red-400 font-bold">{language === 'ko' ? '마감됨' : 'Locked'}</span>
              ) : (
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {cutoffDay - dayOfMonth} {language === 'ko' ? '일 남음' : 'days left'}
                </span>
              )}
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-bold text-[10px] bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
              {Math.max(0, maxPromo - quota.promo_used)} {t('slotsRemaining')}
            </span>
          </div>
        </div>

        {/* 3. Monthly Invoice Status (BRANCH OWNER ONLY) OR Operational Request Card (STORE MANAGER) */}
        {canAccessBilling ? (
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('retainerInvoiceCard')}
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-2">
              {currentInvoice ? (
                <>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {whitelabelConfig.currency_symbol} {currentInvoice.total_amount.toLocaleString()}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentInvoice.status === 'paid'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : currentInvoice.status === 'proof_uploaded'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          : currentInvoice.status === 'overdue'
                          ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {currentInvoice.status === 'paid' && t('statusPaid')}
                      {currentInvoice.status === 'proof_uploaded' && t('statusProofUploaded')}
                      {currentInvoice.status === 'unpaid' && t('statusUnpaid')}
                      {currentInvoice.status === 'overdue' && t('statusOverdue')}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 mt-2">
                  {language === 'ko' ? '청구서가 없습니다.' : 'No invoices generated yet.'}
                </p>
              )}
            </div>

            <div className="mt-3">
              <button
                onClick={() => onNavigateTab('billing')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('viewPayInvoice')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          /* Card 3 Alternative for Branch Store Manager (No billing access) */
          <div className="bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/40 p-4 sm:p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                  {t('managerQuickCardTitle')}
                </span>
                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  <Camera className="w-4 h-4" />
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {t('managerQuickCardDesc')}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('requests')}
                className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('requestShootBtn')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* 4. Upcoming Scheduled Post / Exposure */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('feedScheduleCard')}
            </span>
            <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Calendar className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {branchExposure.length} {language === 'ko' ? '건' : 'Slots'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {branchExposure.filter((s) => s.status === 'scheduled').length} {t('slotsThisMonth')}
            </p>
          </div>

          <div className="mt-3">
            <button
              onClick={() => onNavigateTab('exposure')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('checkCalendar')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Content Schedule & Countdown Hub (Image 2 style) */}
      <DashboardTimelineCards onNavigateTab={onNavigateTab} />

      {/* Rules Notice Card: H-5 & Tanggal 25 Cutoff */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-950 dark:text-amber-100">
            {t('outsourcePolicyTitle')}:
          </h4>
          <p>
            • <strong>H-{leadDays} Rule:</strong> {t('h5RuleDetail')} ({language === 'ko' ? '최단 신청 가능일' : 'Earliest date for today'}: <strong>{minTargetDate}</strong>).
          </p>
          <p>
            • <strong>Day {cutoffDay} Cutoff:</strong> {t('cutoffRuleDetail')}.
          </p>
        </div>
      </div>

      {/* Main Content: Recent Requests & Exposure Schedule for Branch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left 2 Cols: Request History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('recentRequestsTitle')} ({currentBranch.name})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('trackDownloadSubtitle')}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('requests')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl self-start sm:self-auto transition shadow-xs cursor-pointer"
            >
              + {t('newRequestBtn')}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {branchRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {language === 'ko' ? '접수된 디자인 요청 내역이 없습니다.' : 'No design requests logged yet for this branch.'}
              </div>
            ) : (
              branchRequests.map((req) => (
                <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {req.category}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{req.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
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

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{req.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>{t('submittedOn')}: <strong className="text-slate-700 dark:text-slate-200">{req.created_at}</strong></span>
                      <span>•</span>
                      <span>{t('targetDateLabel')}: <strong className="text-slate-700 dark:text-slate-200">{req.target_date}</strong></span>
                    </div>

                    {req.asset_result_url && (
                      <a
                        href={req.asset_result_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('downloadAssetBtn')}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Branch Exposure Posts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {t('branchExposureTitle')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('officialPostingRotation')}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('exposure')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer"
            >
              {t('viewAllBtn')}
            </button>
          </div>

          <div className="space-y-3">
            {branchExposure.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                {language === 'ko' ? '예정된 노출 스케줄이 없습니다.' : 'No posts scheduled this month.'}
              </p>
            ) : (
              branchExposure.slice(0, 4).map((slot) => (
                <div key={slot.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-sky-700 dark:text-sky-300 uppercase bg-sky-100 dark:bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-200 dark:border-sky-800">
                      {slot.format} • {slot.pillar}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{slot.date}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{slot.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{slot.caption_outline}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
