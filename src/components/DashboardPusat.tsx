import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  FileText, 
  Check, 
  X, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  DollarSign,
  Activity,
  Timer,
  Users,
  Palette,
  Camera,
  Briefcase,
  ShieldCheck,
  Tag,
  MessageSquare,
  ListTodo,
  Plus,
  Send,
  Trash2,
  Building2,
  Home,
  Receipt
} from 'lucide-react';
import { DesignRequest, RequestStatus, AttendanceMode } from '../types.ts';
import { DashboardTimelineCards } from './DashboardTimelineCards.tsx';
import { WhatsAppBroadcastModal } from './WhatsAppBroadcastModal.tsx';

interface DashboardPusatProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardPusat: React.FC<DashboardPusatProps> = ({ onNavigateTab }) => {
  const { 
    branches, 
    quotas, 
    designRequests, 
    promos, 
    invoices, 
    updateDesignRequestStatus,
    generateMonthlyInvoices,
    simulatedDate,
    whitelabelConfig,
    attendances,
    todayAttendance,
    clockIn,
    clockOut,
    currentUser,
    users,
    isHQOwner,
    isHQLeader,
    isHQCreative,
    isHQ,
    budgetRequests,
    shootRequests,
    hqReimbursements,
    hqTodos,
    addHqTodo,
    toggleHqTodo,
    deleteHqTodo,
    generateClockOutWhatsappReport,
    t,
    language
  } = usePortal();

  // Approval modal state
  const [selectedRequest, setSelectedRequest] = useState<DesignRequest | null>(null);
  const [assetUrlInput, setAssetUrlInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [invoiceGenFeedback, setInvoiceGenFeedback] = useState<string | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Quick Attendance mode
  const [quickAttendanceMode, setQuickAttendanceMode] = useState<AttendanceMode>('WFO');
  const [quickAttendanceMsg, setQuickAttendanceMsg] = useState<string | null>(null);

  // Quick To-Do input
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState<'design' | 'promo' | 'shoot' | 'general'>('general');

  // WhatsApp Daily Work Report Modal State
  const [isWhatsappReportModalOpen, setIsWhatsappReportModalOpen] = useState(false);
  const [reportPreview, setReportPreview] = useState<{ reportText: string; waUrl: string } | null>(null);

  // Metrics
  const activeBranches = branches.filter((b) => b.contract_status === 'active');
  const pendingDesignRequests = designRequests.filter((r) => r.status === 'pending');
  const inProgressRequests = designRequests.filter((r) => r.status === 'in_progress');
  const pendingInvoices = invoices.filter((i) => i.status === 'proof_uploaded');
  const pendingBudgetRequests = budgetRequests.filter((b) => b.status === 'pending_approval');
  const pendingShootRequests = shootRequests.filter((s) => s.status === 'pending');
  const pendingHqReimbursements = hqReimbursements.filter((r) => r.status === 'pending_approval');

  const currentMonth = simulatedDate.slice(0, 7); // '2026-09'

  // Today attendance for creative team
  const todayAttendances = attendances.filter((a) => a.date === simulatedDate);

  // Total billed for current month
  const currentMonthInvoices = invoices.filter((i) => i.period_month.startsWith(currentMonth));
  const totalBilled = currentMonthInvoices.reduce((acc, curr) => acc + curr.total_amount, 0);
  const totalPaid = currentMonthInvoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  // Quick punch handlers
  const handleQuickClockIn = () => {
    const res = clockIn(quickAttendanceMode);
    setQuickAttendanceMsg(res.message);
    setTimeout(() => setQuickAttendanceMsg(null), 3000);
  };

  const handleQuickClockOut = () => {
    const report = generateClockOutWhatsappReport();
    setReportPreview(report);
    setIsWhatsappReportModalOpen(true);
    clockOut();
  };

  const handleAddTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    addHqTodo(newTodoTitle.trim(), newTodoCategory);
    setNewTodoTitle('');
  };

  // Handle Quick Auto-Invoice
  const handleAutoInvoice = () => {
    const result = generateMonthlyInvoices('2026-10');
    setInvoiceGenFeedback(result.message);
    setTimeout(() => setInvoiceGenFeedback(null), 5000);
  };

  const handleApprove = (req: DesignRequest) => {
    updateDesignRequestStatus(req.id, 'approved', assetUrlInput || undefined, feedbackInput || undefined, 'leader_approved');
    setSelectedRequest(null);
    setAssetUrlInput('');
    setFeedbackInput('');
  };

  const handleReject = (req: DesignRequest) => {
    if (!feedbackInput) {
      alert(language === 'ko' ? '반려 사유를 입력해 주세요.' : 'Please enter feedback or reason for revision.');
      return;
    }
    updateDesignRequestStatus(req.id, 'rejected', undefined, feedbackInput);
    setSelectedRequest(null);
    setAssetUrlInput('');
    setFeedbackInput('');
  };

  const handleSetInProgress = (req: DesignRequest) => {
    updateDesignRequestStatus(req.id, 'in_progress');
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner: Pusat Welcome & Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{whitelabelConfig.brand_name} HQ • {whitelabelConfig.hq_location}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Space_Grotesk']">
              {t('pusatHeaderTitle')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {t('pusatHeaderSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(isHQOwner || isHQLeader) && (
              <button
                onClick={handleAutoInvoice}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('autoInvoiceBtn')}</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Timer className="w-4 h-4 text-amber-400" />
              <span>{t('attendance')} ({todayAttendances.length})</span>
            </button>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{language === 'ko' ? '캘린더' : 'Calendar'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('chat')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>{language === 'ko' ? '협업 채팅' : 'Collab Chat'}</span>
            </button>
          </div>
        </div>

        {invoiceGenFeedback && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{invoiceGenFeedback}</span>
          </div>
        )}
      </div>

      {/* QUICK ATTENDANCE & TO-DO SYNC WIDGET FOR HQ TEAM */}
      {isHQ && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Widget 1: Quick Dashboard Attendance Punch Card */}
          <div className="bg-white dark:bg-[#15171e] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-500" />
                  <span>{language === 'ko' ? '빠른 출퇴근 체크 (Dashboard Attendance)' : 'Quick Punch & Attendance'}</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {simulatedDate}
                </span>
              </div>

              {/* Status display */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 mb-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">{currentUser.full_name}:</span>
                  <span className="font-bold">
                    {todayAttendance ? (
                      todayAttendance.clock_out_time ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'ko' ? '퇴근 완료' : 'Clocked Out'} ({todayAttendance.clock_out_time})
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span> {language === 'ko' ? '근무 중' : 'Clocked In'} ({todayAttendance.clock_in_time})
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400">{language === 'ko' ? '미출근 상태' : 'Not Clocked In'}</span>
                    )}
                  </span>
                </div>

                {!todayAttendance && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {(['WFO', 'WFH', 'On-Site Visit'] as AttendanceMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setQuickAttendanceMode(mode)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                          quickAttendanceMode === mode
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {mode === 'WFO' ? 'Office' : mode === 'WFH' ? 'WFH' : 'Shoot'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {quickAttendanceMsg && (
              <div className="mb-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                {quickAttendanceMsg}
              </div>
            )}

            <div>
              {!todayAttendance ? (
                <button
                  type="button"
                  onClick={handleQuickClockIn}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('clockIn')}</span>
                </button>
              ) : !todayAttendance.clock_out_time ? (
                <button
                  type="button"
                  onClick={handleQuickClockOut}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ko' ? '퇴근 & 대표 보고서 생성' : 'Clock Out & Send WhatsApp Report'}</span>
                </button>
              ) : (
                <div className="text-center py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ✅ {language === 'ko' ? '오늘 근무 완료' : 'Completed for Today'}
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: HQ To-Do List Synced with Requests */}
          <div className="lg:col-span-2 bg-white dark:bg-[#15171e] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                    {language === 'ko' ? 'HQ 업무 할 일 (Daily To-Do List & Work Log)' : 'HQ Daily To-Do List & Auto Work Log'}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {hqTodos.filter((t) => t.user_id === currentUser.id && t.completed).length}/{hqTodos.filter((t) => t.user_id === currentUser.id).length} {language === 'ko' ? '완료' : 'done'}
                </span>
              </div>

              {/* Add Todo Form */}
              <form onSubmit={handleAddTodoSubmit} className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  placeholder={language === 'ko' ? '새 할 일 또는 디자인 산출물 입력...' : 'Add task or deliverable item...'}
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
                <select
                  value={newTodoCategory}
                  onChange={(e) => setNewTodoCategory(e.target.value as any)}
                  className="px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="general">General</option>
                  <option value="design">Design</option>
                  <option value="promo">Promo</option>
                  <option value="shoot">Shoot</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ko' ? '추가' : 'Add'}</span>
                </button>
              </form>

              {/* Todo Items List */}
              <div className="space-y-1.5 mt-3 max-h-36 overflow-y-auto pr-1">
                {hqTodos.filter((t) => t.user_id === currentUser.id).length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    {language === 'ko' ? '등록된 할 일이 없습니다.' : 'No active tasks yet. Add one above!'}
                  </div>
                ) : (
                  hqTodos
                    .filter((t) => t.user_id === currentUser.id)
                    .map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition border ${
                          todo.completed
                            ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 text-slate-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleHqTodo(todo.id)}
                            className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                          />
                          <span className={`truncate ${todo.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                            {todo.title}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                            {todo.category}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteHqTodo(todo.id)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Bottom info */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span>
                {language === 'ko' ? '✅ 완료된 항목은 퇴근 시 업무 일지에 자동 요약됩니다.' : 'Completed items auto-sync to Daily Work Log & Deliverables.'}
              </span>
              <button
                onClick={() => {
                  const rep = generateClockOutWhatsappReport();
                  setReportPreview(rep);
                  setIsWhatsappReportModalOpen(true);
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                {language === 'ko' ? '보고서 미리보기' : 'Preview WhatsApp Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Branches */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('activeBranchesCard')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {activeBranches.length} {language === 'ko' ? '개 지점' : 'Branches'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('activeBranchesSubtitle')}
          </p>
        </div>

        {/* Pending Requests & Approvals */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('pendingApprovalCard')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {pendingDesignRequests.length} {language === 'ko' ? '건 요청' : 'Requests'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
            <span>{t('inProgressSubtitle').replace('{count}', String(inProgressRequests.length))}</span>
          </div>
        </div>

        {/* Card 3: For Creative: In-Production Tasks; For Leader/Owner: Payment Verification */}
        {isHQOwner || isHQLeader ? (
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('verifyPaymentCard')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {pendingInvoices.length} {language === 'ko' ? '건 영수증' : 'Proofs'}
            </div>
            <button
              onClick={() => onNavigateTab('billing')}
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('checkNowBtn')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'ko' ? '제작 진행 중인 요청' : 'In-Production Tasks'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {inProgressRequests.length} {language === 'ko' ? '건 제작 중' : 'In Progress'}
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'ko' ? 'HQ 칸반 열기' : 'View HQ Kanban'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Card 4: For Creative: Completed Deliverables; For Leader/Owner: Monthly Retainer Billing */}
        {isHQOwner || isHQLeader ? (
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('billingPeriodCard')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
              {whitelabelConfig.currency_symbol} {(totalBilled).toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              {t('collectedSubtitle')
                .replace('{amount}', `${whitelabelConfig.currency_symbol} ${(totalPaid).toLocaleString()}`)
                .replace('{percent}', String(Math.round((totalPaid / (totalBilled || 1)) * 100)))}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'ko' ? '완료 및 납품된 시안' : 'Completed Deliverables'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {designRequests.filter((r) => r.status === 'approved').length} {language === 'ko' ? '건 납품' : 'Delivered'}
            </div>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'ko' ? '전체 요청 보기' : 'View All Requests'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Operational Highlights for HQ: Budget Requests & HQ Reimbursements */}
      {(pendingBudgetRequests.length > 0 || pendingShootRequests.length > 0 || pendingHqReimbursements.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingBudgetRequests.length > 0 && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 dark:text-amber-200">
                    {language === 'ko' ? '광고/촬영 예산 승인 대기' : 'Ad / Shoot Budget Approval'} ({pendingBudgetRequests.length})
                  </h4>
                  <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                    {language === 'ko' ? '크리에이티브팀이 신청한 예산 집행 승인 건' : 'Budget requests by HQ Creative Team'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('requests')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shrink-0 shadow-xs cursor-pointer"
              >
                {language === 'ko' ? '검토하기' : 'Review'}
              </button>
            </div>
          )}

          {pendingHqReimbursements.length > 0 && isHQOwner && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-950 dark:text-indigo-200">
                    {language === 'ko' ? '본사 팀 경비 청구 대기' : 'HQ Expense Claims Pending'} ({pendingHqReimbursements.length})
                  </h4>
                  <p className="text-indigo-800 dark:text-indigo-300 text-[11px]">
                    {language === 'ko' ? '팀원 소품 및 출장비 승인 대기' : 'Reimbursements pending owner review'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('billing')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shrink-0 shadow-xs cursor-pointer"
              >
                {language === 'ko' ? '정산하기' : 'Disburse'}
              </button>
            </div>
          )}

          {pendingShootRequests.length > 0 && (
            <div className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500 text-white font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sky-950 dark:text-sky-200">
                    {language === 'ko' ? '지점 현장 촬영 요청 대기' : 'Branch Shoot Requests'} ({pendingShootRequests.length})
                  </h4>
                  <p className="text-sky-800 dark:text-sky-300 text-[11px]">
                    {language === 'ko' ? '지점 매니저/대표가 신청한 매장 방문 촬영' : 'Photoshoots requested by Branches'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('requests')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shrink-0 shadow-xs cursor-pointer"
              >
                {language === 'ko' ? '일정 확인' : 'View Schedule'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Content Schedule & Countdown Hub */}
      <DashboardTimelineCards onNavigateTab={onNavigateTab} />

      {/* Multi-Branch Quota Tracker & Approval Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left 2 Cols: Multi-Branch Quota & Status Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('quotaBillingTableTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('quotaBillingTableSubtitle')
                  .replace('{month}', currentMonth)
                  .replace('{maxDesign}', String(whitelabelConfig.max_monthly_design_requests || 3))
                  .replace('{maxPromo}', String(whitelabelConfig.max_monthly_active_promos || 2))}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>{t('viewEngineBtn')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t('branch')}</th>
                  <th className="py-3 px-3">{t('designQuotaCard')}</th>
                  <th className="py-3 px-3">{t('promoQuotaCard')}</th>
                  <th className="py-3 px-3">{t('paymentStatus')}</th>
                  <th className="py-3 px-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {branches.map((branch) => {
                  const bQuota = quotas.find(
                    (q) => q.branch_id === branch.id && q.period_month === currentMonth
                  ) || { design_used: 0, promo_used: 0 };
                  const bInvoice = invoices.find(
                    (i) => i.branch_id === branch.id && i.period_month.startsWith(currentMonth)
                  );

                  return (
                    <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{branch.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{bQuota.design_used} / 3</span>
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                bQuota.design_used >= 3 ? 'bg-red-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, (bQuota.design_used / 3) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{bQuota.promo_used} / 2</span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {bInvoice ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              bInvoice.status === 'paid'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : bInvoice.status === 'proof_uploaded'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {bInvoice.status === 'paid' && t('statusPaid')}
                            {bInvoice.status === 'proof_uploaded' && t('statusProofUploaded')}
                            {bInvoice.status === 'unpaid' && t('statusUnpaid')}
                            {bInvoice.status === 'overdue' && t('statusOverdue')}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onNavigateTab('requests')}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-bold cursor-pointer"
                        >
                          {language === 'ko' ? '상세보기' : 'Manage'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Quick Pending Review Drawer */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{language === 'ko' ? '최근 접수 요청' : 'Recent Submissions'}</span>
            </h3>
            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
              {pendingDesignRequests.length} {language === 'ko' ? '건 대기' : 'pending'}
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {pendingDesignRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                {language === 'ko' ? '현재 대기중인 디자인 요청이 없습니다.' : 'All pending requests processed.'}
              </p>
            ) : (
              pendingDesignRequests.map((req) => {
                const branchObj = branches.find((b) => b.id === req.branch_id);
                return (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{branchObj?.name}</span>
                      <span className="text-slate-400 font-mono">{req.target_date}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{req.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{req.description}</p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">{req.category}</span>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-2.5 py-1 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        {language === 'ko' ? '검토 / 승인' : 'Review'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Review & Approval Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {language === 'ko' ? '디자인 요청 검토 및 결과물 등록' : 'Review Design Request & Deliverable'}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{selectedRequest.title}</div>
              <div className="text-slate-600 dark:text-slate-300">{selectedRequest.description}</div>
              <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
                <span>{t('targetDateLabel')}: <strong className="text-slate-700 dark:text-slate-200">{selectedRequest.target_date}</strong></span>
                <span>{language === 'ko' ? '카테고리' : 'Category'}: <strong className="text-slate-700 dark:text-slate-200">{selectedRequest.category}</strong></span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('deliverableUrl')}
                </label>
                <input
                  type="url"
                  placeholder={t('deliverableUrlPlaceholder')}
                  value={assetUrlInput}
                  onChange={(e) => setAssetUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '검토 의견 및 피드백' : 'Review Notes & Feedback'}
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'ko' ? '승인 시 전달사항이나 반려 시 보완 사유를 입력하세요...' : 'Notes for approval or reasons for revision...'}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleReject(selectedRequest)}
                className="px-3.5 py-2 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                {t('status_rejected')}
              </button>
              <button
                onClick={() => handleSetInProgress(selectedRequest)}
                className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                {t('status_in_progress')}
              </button>
              <button
                onClick={() => handleApprove(selectedRequest)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                {language === 'ko' ? '최종 승인 & 납품' : 'Approve & Deliver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Daily Summary Modal */}
      {isWhatsappReportModalOpen && reportPreview && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>{language === 'ko' ? '일일 업무 보고서 WhatsApp 전송' : 'Send Daily Work Report via WhatsApp'}</span>
              </h3>
              <button onClick={() => setIsWhatsappReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300">
              <div><strong>{language === 'ko' ? '수신인 (HQ 대표):' : 'Recipient (HQ Owner):'}</strong> {whitelabelConfig.company_legal_name} ({whitelabelConfig.contact_whatsapp})</div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {language === 'ko' ? '생성된 일일 업무 보고서 내용:' : 'Formatted Report Content:'}
              </label>
              <textarea
                rows={10}
                readOnly
                value={reportPreview.reportText}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsWhatsappReportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer"
              >
                {t('close')}
              </button>
              <a
                href={reportPreview.waUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'ko' ? 'WhatsApp으로 전송하기' : 'Send to Owner WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* WhatsApp Broadcast Modal */}
      <WhatsAppBroadcastModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />
    </div>
  );
};
