import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import { AttendanceMode, HqReimbursementCategory, HqReimbursementRequest } from '../types.ts';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Home, 
  Camera, 
  Calendar, 
  UserCheck, 
  FileText, 
  Briefcase, 
  Sparkles,
  History,
  Timer,
  ChevronRight,
  Send,
  ListTodo,
  Plus,
  Trash2,
  MessageSquare,
  X,
  Receipt,
  DollarSign,
  CreditCard,
  Tag,
  CheckCheck,
  FileCheck,
  Eye,
  Upload,
  Check,
  ExternalLink,
  Download
} from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const { 
    currentUser, 
    isHQ, 
    isHQOwner, 
    isHQLeader,
    isHQCreative, 
    todayAttendance, 
    clockIn, 
    clockOut, 
    updateWorkLog, 
    attendances, 
    branches, 
    hqTodos,
    addHqTodo,
    toggleHqTodo,
    deleteHqTodo,
    generateClockOutWhatsappReport,
    hqReimbursements,
    addHqReimbursement,
    approveHqReimbursement,
    rejectHqReimbursement,
    disburseHqReimbursementBatch,
    simulatedDate,
    whitelabelConfig,
    themeColors,
    t,
    language
  } = usePortal();

  // Top sub-tab: 'attendance' | 'reimbursements'
  const [activeMainTab, setActiveMainTab] = useState<'attendance' | 'reimbursements'>('attendance');

  const [selectedMode, setSelectedMode] = useState<AttendanceMode>('WFO');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [workLogInput, setWorkLogInput] = useState<string>(todayAttendance?.work_log || '');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [filterUser, setFilterUser] = useState<string>('all');

  // New todo form
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState<'design' | 'promo' | 'shoot' | 'general'>('general');

  // WhatsApp Clock-Out Report Modal
  const [isWhatsappReportModalOpen, setIsWhatsappReportModalOpen] = useState(false);
  const [reportPreview, setReportPreview] = useState<{ reportText: string; waUrl: string } | null>(null);

  // Reimbursement Claim Form State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimCategory, setClaimCategory] = useState<HqReimbursementCategory>('photoshoot_meals');
  const [claimTitle, setClaimTitle] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimReceiptUrl, setClaimReceiptUrl] = useState('');
  const [isCompressingReceipt, setIsCompressingReceipt] = useState(false);
  const [reimburseFilterStatus, setReimburseFilterStatus] = useState<string>('all');
  const [reimburseFilterCat, setReimburseFilterCat] = useState<string>('all');
  const [selectedProofModal, setSelectedProofModal] = useState<{ title: string; url: string; notes?: string } | null>(null);

  const receiptFileRef = useRef<HTMLInputElement>(null);

  // Handle Receipt Upload with Canvas Compression
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingReceipt(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setClaimReceiptUrl(compressed);
        }
        setIsCompressingReceipt(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(claimAmount.replace(/[^0-9]/g, ''), 10);
    if (!claimTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage({
        text: language === 'ko' ? '청구 제목과 올바른 금액을 입력해주세요.' : 'Please provide a valid claim title and amount.',
        type: 'error'
      });
      return;
    }

    const res = addHqReimbursement({
      category: claimCategory,
      title: claimTitle.trim(),
      amount: parsedAmount,
      description: claimDescription.trim(),
      receipt_proof_url: claimReceiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
    });

    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setIsClaimModalOpen(false);
      setClaimTitle('');
      setClaimAmount('');
      setClaimDescription('');
      setClaimReceiptUrl('');
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  // Pending count for reimbursement badge
  const pendingReimbursementsCount = hqReimbursements.filter((r) => r.status === 'pending_approval').length;

  const getCategoryLabel = (cat: HqReimbursementCategory) => {
    switch (cat) {
      case 'software_license':
        return { label: language === 'ko' ? '소프트웨어 라이선스' : 'Software License', color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300' };
      case 'props_equipment':
        return { label: language === 'ko' ? '소품 & 장비 구입' : 'Props & Equipment', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300' };
      case 'travel_transport':
        return { label: language === 'ko' ? '출장 교통비 (Grab/Taxi)' : 'Travel & Transport', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' };
      case 'photoshoot_meals':
        return { label: language === 'ko' ? '촬영 식대 및 음료' : 'Photoshoot Meals & F&B', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' };
      case 'printing_hardware':
        return { label: language === 'ko' ? '인쇄 & 하드웨어' : 'Printing & Hardware', color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' };
      default:
        return { label: language === 'ko' ? '기타 운영비' : 'Other Ops', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
    }
  };

  // Handle clock in
  const handleClockIn = () => {
    const res = clockIn(selectedMode, selectedMode === 'On-Site Visit' ? selectedBranchId : undefined);
    if (res.success) {
      setMessage({ text: t('clockInSuccess'), type: 'success' });
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  // Handle clock out
  const handleClockOut = () => {
    const report = generateClockOutWhatsappReport();
    setReportPreview(report);
    setIsWhatsappReportModalOpen(true);
    const res = clockOut(workLogInput);
    if (res.success) {
      setMessage({ text: t('clockOutSuccess'), type: 'success' });
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  // Handle work log save
  const handleSaveWorkLog = () => {
    updateWorkLog(workLogInput);
    setMessage({ text: language === 'ko' ? '업무 일지가 저장되었습니다.' : 'Work log saved successfully!', type: 'success' });
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    addHqTodo(newTodoTitle.trim(), newTodoCategory);
    setNewTodoTitle('');
  };

  const filteredRecords = attendances.filter((a) => {
    if (filterUser === 'all') return true;
    return a.user_id === filterUser;
  });

  const handleDownloadAttendanceCSV = () => {
    const standardHours = whitelabelConfig.standard_work_hours || 8;
    const headers = ['Tanggal', 'Nama Karyawan', 'Mode Kerja', 'Jam Masuk', 'Jam Keluar', 'Total Jam', 'Standar Jam/Hari', 'Lembur (Overtime)', 'Status', 'Catatan Kerja / Work Log'];
    const rows = filteredRecords.map((r) => {
      const totalH = r.total_hours || 0;
      const overtime = r.overtime_hours !== undefined ? r.overtime_hours : Math.max(0, Math.round((totalH - standardHours) * 10) / 10);
      return [
        `"${r.date}"`,
        `"${r.user_name.replace(/"/g, '""')}"`,
        `"${r.mode}"`,
        `"${r.clock_in_time}"`,
        `"${r.clock_out_time || '-'}"`,
        `"${totalH} jam"`,
        `"${standardHours} jam"`,
        `"${overtime > 0 ? `+${overtime} jam` : '0 jam'}"`,
        `"${r.status}"`,
        `"${(r.work_log || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Attendance_Report_${whitelabelConfig.brand_name.replace(/\s+/g, '_')}_${simulatedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered reimbursements
  const userScopedReimbursements = hqReimbursements.filter((r) => {
    // HQ Owner & Leader see all; HQ Creative sees their own
    if (isHQOwner || isHQLeader) return true;
    return r.requester_id === currentUser.id;
  });

  const filteredReimbursements = userScopedReimbursements.filter((r) => {
    const matchStatus = reimburseFilterStatus === 'all' || r.status === reimburseFilterStatus;
    const matchCat = reimburseFilterCat === 'all' || r.category === reimburseFilterCat;
    return matchStatus && matchCat;
  });

  // KPI calculations for reimbursements
  const totalDisbursedSum = userScopedReimbursements
    .filter((r) => r.status === 'reimbursed')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPendingSum = userScopedReimbursements
    .filter((r) => r.status === 'pending_approval')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner with Sub-Tabs */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{whitelabelConfig.brand_name} HQ Operations & Staff Portal</span>
            </div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
              {activeMainTab === 'attendance'
                ? t('attendanceTitle')
                : (language === 'ko' ? 'HQ 팀 경비 청구 & 영수증 정산' : 'HQ Team Expense Reimbursements')}
            </h1>
            <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
              {activeMainTab === 'attendance'
                ? t('attendanceSubtitle')
                : (language === 'ko'
                    ? 'HQ 팀원들이 업무에 사용한 경비(소프트웨어, 소품, 교통비, 촬영 식대)를 직접 청구하고 대표님이 승인/이체 증빙을 첨부하여 일괄 정산합니다.'
                    : 'Claim work expenses (licenses, props, travel, photoshoot meals) with receipt proof for HQ approval and disbursement.')}
            </p>
          </div>

          {/* Current status pill */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">
                {t('myAttendanceStatus')} ({currentUser.full_name})
              </span>
              <span className="text-sm font-bold flex items-center justify-end gap-1.5 mt-0.5">
                {todayAttendance ? (
                  todayAttendance.clock_out_time ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {t('clockedOut')} ({todayAttendance.clock_out_time})
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span> {t('clockedIn')} ({todayAttendance.clock_in_time})
                    </span>
                  )
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-slate-500" /> {t('notClockedInYet')}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Tab Switcher: Attendance vs Reimbursements */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMainTab('attendance')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeMainTab === 'attendance'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{language === 'ko' ? '출퇴근 & 일일 작업 관리' : 'Daily Attendance & Work Log'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('reimbursements')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeMainTab === 'reimbursements'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{language === 'ko' ? 'HQ 팀 경비 정산 (Reimburse)' : 'HQ Team Reimbursements'}</span>
            {pendingReimbursementsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingReimbursementsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-bold underline ml-3 cursor-pointer">
            {t('close')}
          </button>
        </div>
      )}

      {/* VIEW 1: ATTENDANCE & DAILY TASKS */}
      {activeMainTab === 'attendance' && (
        <>
          {/* Action Card: Clock In / Clock Out Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-500" />
                <span>{language === 'ko' ? '출퇴근 체크' : 'Daily Punch Card'}</span>
              </h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {simulatedDate}
              </span>
            </div>

            {/* Mode Selection */}
            {!todayAttendance && (
              <div className="space-y-4 mb-6">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                  {t('workMode')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('WFO')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      selectedMode === 'WFO'
                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-[11px] leading-tight">Office HQ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('WFH')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      selectedMode === 'WFH'
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] leading-tight">WFH</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('On-Site Visit')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      selectedMode === 'On-Site Visit'
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-[11px] leading-tight">Photoshoot</span>
                  </button>
                </div>

                {selectedMode === 'On-Site Visit' && (
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('targetBranchOptional')}
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white border p-2 focus:ring-amber-500"
                    >
                      <option value="">{language === 'ko' ? '방문 지점 선택...' : 'Select visiting branch...'}</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Current punch status display */}
            {todayAttendance && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{t('workMode')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {todayAttendance.mode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{t('clockedInAt')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {todayAttendance.clock_in_time} {whitelabelConfig?.timezone_label || (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Jakarta' ? 'WIB' : 'WITA')}
                  </span>
                </div>
                {todayAttendance.clock_out_time && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{t('clockedOutAt')}:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {todayAttendance.clock_out_time} {whitelabelConfig?.timezone_label || (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Jakarta' ? 'WIB' : 'WITA')}
                    </span>
                  </div>
                )}
                {todayAttendance.total_hours && (
                  <div className="space-y-1 border-t border-slate-200 dark:border-slate-700 pt-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('totalWorkHours')}:</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                        {todayAttendance.total_hours} hrs
                      </span>
                    </div>
                    {todayAttendance.total_hours > (whitelabelConfig.standard_work_hours || 8) && (
                      <div className="flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                        <span>Lembur (Overtime):</span>
                        <span>+{Math.max(0, Math.round((todayAttendance.total_hours - (whitelabelConfig.standard_work_hours || 8)) * 10) / 10)} hrs</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-4">
            {!todayAttendance ? (
              <button
                type="button"
                onClick={handleClockIn}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('clockIn')}</span>
              </button>
            ) : !todayAttendance.clock_out_time ? (
              <button
                type="button"
                onClick={handleClockOut}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'ko' ? '퇴근 & 대표 보고서 생성' : 'Clock Out & Send WhatsApp Report'}</span>
              </button>
            ) : (
              <div className="p-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {language === 'ko' ? '오늘의 출퇴근이 모두 완료되었습니다.' : 'All attendance completed for today!'}
              </div>
            )}
          </div>
        </div>

        {/* Work Log & To-Do List Sync */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'ko' ? 'HQ 업무 체크리스트 & 산출물 로그' : 'HQ Deliverables Checklist & Daily Work Log'}</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {hqTodos.filter((t) => t.user_id === currentUser.id && t.completed).length}/{hqTodos.filter((t) => t.user_id === currentUser.id).length} {language === 'ko' ? '완료' : 'completed'}
              </span>
            </div>

            {/* Add Task input */}
            <form onSubmit={handleAddTodo} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                placeholder={language === 'ko' ? '새 할 일 또는 디자인 산출물 입력...' : 'Add task or deliverable...'}
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
              <select
                value={newTodoCategory}
                onChange={(e) => setNewTodoCategory(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="general">General</option>
                <option value="design">Design</option>
                <option value="promo">Promo</option>
                <option value="shoot">Shoot</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ko' ? '추가' : 'Add'}</span>
              </button>
            </form>

            {/* Todo List */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 mb-4">
              {hqTodos.filter((t) => t.user_id === currentUser.id).length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  {language === 'ko' ? '등록된 할 일이 없습니다.' : 'No tasks added yet.'}
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

            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t('workLogLabel')} (Figma URL / Drive Links / Deliverable Notes):
            </label>
            <textarea
              rows={3}
              value={workLogInput}
              onChange={(e) => setWorkLogInput(e.target.value)}
              placeholder={t('workLogPlaceholder')}
              className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white border p-2.5 text-xs focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              {language === 'ko' ? '퇴근 시 본사 대표 WhatsApp으로 일일 업무 보고서가 자동 구성됩니다.' : 'Daily summary automatically prepared for WhatsApp dispatch to HQ Owner.'}
            </span>
            <button
              type="button"
              onClick={handleSaveWorkLog}
              disabled={!todayAttendance}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 dark:text-slate-950 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('saveWorkLog')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              <span>{t('teamAttendanceLog')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ko' ? 'HQ 크리에이티브팀 전원의 출퇴근 시간, 근무 시간, 초과 근무(연장) 및 작업 일지' : 'HQ creative team working logs, attendance audit trail & overtime calculation'}
            </p>
          </div>

          {/* User filter & Download CSV button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAttendanceCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ko' ? '근무 기록 CSV 다운로드' : 'Download Work History (CSV)'}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Filter:</span>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="text-xs bg-transparent dark:text-white outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-800">{language === 'ko' ? '전체 팀원 보기' : 'All Creative Members'}</option>
                {Array.from(new Set(attendances.map((a) => a.user_id))).map((uid) => {
                  const rec = attendances.find((a) => a.user_id === uid);
                  return <option key={uid} value={uid} className="dark:bg-slate-800">{rec?.user_name}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('date')}</th>
                <th className="py-3 px-4">{language === 'ko' ? '직원명' : 'Employee'}</th>
                <th className="py-3 px-4">{t('workMode')}</th>
                <th className="py-3 px-4">{language === 'ko' ? '출근' : 'In'}</th>
                <th className="py-3 px-4">{language === 'ko' ? '퇴근' : 'Out'}</th>
                <th className="py-3 px-4">{t('totalWorkHours')}</th>
                <th className="py-3 px-4">{language === 'ko' ? '초과 근무 (Lembur)' : 'Overtime'}</th>
                <th className="py-3 px-4">{language === 'ko' ? '근무 일지' : 'Work Log Summary'}</th>
                <th className="py-3 px-4 text-center">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    {t('noAttendanceRecords')}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const standardHours = whitelabelConfig.standard_work_hours || 8;
                  const totalH = record.total_hours || 0;
                  const overtime = record.overtime_hours !== undefined ? record.overtime_hours : Math.max(0, Math.round((totalH - standardHours) * 10) / 10);

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {record.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">{record.user_name}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          record.mode === 'WFO' 
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : record.mode === 'WFH'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        }`}>
                          {record.mode === 'WFO' && <Building2 className="w-3 h-3" />}
                          {record.mode === 'WFH' && <Home className="w-3 h-3" />}
                          {record.mode === 'On-Site Visit' && <Camera className="w-3 h-3" />}
                          <span>{record.mode}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {record.clock_in_time}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {record.clock_out_time || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {record.total_hours ? `${record.total_hours} jam` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {overtime > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            +{overtime} jam
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300 font-normal">
                        {record.work_log || <span className="text-slate-400 dark:text-slate-500 italic">No notes</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          record.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {record.status === 'completed' ? (language === 'ko' ? '완료' : 'Completed') : (language === 'ko' ? '근무 중' : 'On Duty')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* VIEW 2: HQ EXPENSE REIMBURSEMENTS & CLAIMS */}
      {activeMainTab === 'reimbursements' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 3 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {language === 'ko' ? '총 정산 완료된 금액' : 'Total Reimbursed'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {whitelabelConfig.currency_symbol} {totalDisbursedSum.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {language === 'ko' ? '승인 대기 중인 경비' : 'Pending Approval'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {whitelabelConfig.currency_symbol} {totalPendingSum.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {language === 'ko' ? '청구 내역 건수' : 'Total Claim Items'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                  {userScopedReimbursements.length} {language === 'ko' ? '건' : 'items'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Action and Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <span className="text-slate-400 font-semibold">{language === 'ko' ? '상태:' : 'Status:'}</span>
              <select
                value={reimburseFilterStatus}
                onChange={(e) => setReimburseFilterStatus(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-2.5 py-1.5 bg-slate-50 outline-none"
              >
                <option value="all">{language === 'ko' ? '전체 상태' : 'All Status'}</option>
                <option value="pending_approval">{language === 'ko' ? '승인 대기' : 'Pending'}</option>
                <option value="approved">{language === 'ko' ? '승인됨 (지급대기)' : 'Approved'}</option>
                <option value="reimbursed">{language === 'ko' ? '송금 완료' : 'Reimbursed'}</option>
                <option value="rejected">{language === 'ko' ? '반려됨' : 'Rejected'}</option>
              </select>

              <span className="text-slate-400 font-semibold ml-2">{language === 'ko' ? '항목:' : 'Category:'}</span>
              <select
                value={reimburseFilterCat}
                onChange={(e) => setReimburseFilterCat(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-2.5 py-1.5 bg-slate-50 outline-none"
              >
                <option value="all">{language === 'ko' ? '전체 항목' : 'All Categories'}</option>
                <option value="photoshoot_meals">{language === 'ko' ? '촬영 식대 & 음료' : 'Photoshoot Meals & F&B'}</option>
                <option value="props_equipment">{language === 'ko' ? '소품 & 장비' : 'Props & Equipment'}</option>
                <option value="travel_transport">{language === 'ko' ? '교통비 (Grab/Taxi)' : 'Travel & Transport'}</option>
                <option value="software_license">{language === 'ko' ? '소프트웨어 라이선스' : 'Software License'}</option>
                <option value="printing_hardware">{language === 'ko' ? '인쇄 & 하드웨어' : 'Printing & Hardware'}</option>
                <option value="other_ops">{language === 'ko' ? '기타 운영비' : 'Other Ops'}</option>
              </select>
            </div>

            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ko' ? '새 경비 청구 (영수증 첨부)' : 'Claim New Expense'}</span>
            </button>
          </div>

          {/* Reimbursements List Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{language === 'ko' ? '청구 일자' : 'Date'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '청구자' : 'Requester'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '카테고리' : 'Category'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '항목 및 설명' : 'Expense Details'}</th>
                    <th className="py-3 px-4">{language === 'ko' ? '청구 금액' : 'Amount'}</th>
                    <th className="py-3 px-4 text-center">{language === 'ko' ? '영수증 증빙' : 'Receipt'}</th>
                    <th className="py-3 px-4 text-center">{t('status')}</th>
                    {(isHQOwner || isHQLeader) && (
                      <th className="py-3 px-4 text-right">{language === 'ko' ? '관리자 액션' : 'Admin Actions'}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredReimbursements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>{language === 'ko' ? '등록된 경비 청구 내역이 없습니다.' : 'No expense reimbursements found.'}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReimbursements.map((item) => {
                      const catInfo = getCategoryLabel(item.category);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white whitespace-nowrap">
                            {item.created_at}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-white">{item.requester_name}</div>
                            <div className="text-[10px] text-slate-400">{item.requester_role}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${catInfo.color}`}>
                              {catInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 dark:text-white truncate">{item.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.description}</div>
                          </td>
                          <td className="py-3 px-4 font-black font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap">
                            {whitelabelConfig.currency_symbol} {item.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {item.receipt_proof_url ? (
                              <button
                                onClick={() => setSelectedProofModal({
                                  title: `${item.title} - ${language === 'ko' ? '영수증 증빙' : 'Receipt Proof'}`,
                                  url: item.receipt_proof_url,
                                  notes: item.description
                                })}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-purple-600" />
                                <span>{language === 'ko' ? '영수증 보기' : 'View Receipt'}</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No proof</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {item.status === 'reimbursed' ? (
                              <div className="space-y-1">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  {language === 'ko' ? '송금 완료' : 'REIMBURSED'}
                                </span>
                                {item.transfer_proof_url && (
                                  <div>
                                    <button
                                      onClick={() => setSelectedProofModal({
                                        title: `${language === 'ko' ? '대표님 송금 이체 확인증' : 'HQ Owner Payout Transfer Proof'} (${item.title})`,
                                        url: item.transfer_proof_url!,
                                        notes: item.admin_notes || `Ref: ${item.transfer_reference || 'MANUAL-DISBURSE'}`
                                      })}
                                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold underline hover:opacity-80 block cursor-pointer"
                                    >
                                      {language === 'ko' ? '이체확인증' : 'Proof Slip'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : item.status === 'approved' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                                {language === 'ko' ? '승인됨 (정산대기)' : 'APPROVED'}
                              </span>
                            ) : item.status === 'rejected' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                                {language === 'ko' ? '반려됨' : 'REJECTED'}
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                                {language === 'ko' ? '승인 대기' : 'PENDING'}
                              </span>
                            )}
                          </td>
                          {(isHQOwner || isHQLeader) && (
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              {item.status === 'pending_approval' && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => approveHqReimbursement(item.id, 'Approved via Attendance')}
                                    className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition cursor-pointer"
                                    title="Approve Claim"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => rejectHqReimbursement(item.id, 'Rejected by Admin')}
                                    className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold transition cursor-pointer"
                                    title="Reject Claim"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                              {item.status === 'approved' && isHQOwner && (
                                <button
                                  onClick={() => disburseHqReimbursementBatch([item.id], 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', `TRF-HQ-${Date.now().toString().slice(-4)}`)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs cursor-pointer"
                                >
                                  {language === 'ko' ? '송금 확인' : 'Disburse'}
                                </button>
                              )}
                            </td>
                          )}
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

      {/* Modal 1: Claim New Reimbursement */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {language === 'ko' ? '새로운 HQ 팀 경비 청구' : 'Claim Work Expense Reimbursement'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentUser.full_name} ({currentUser.role})
                  </p>
                </div>
              </div>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '경비 카테고리 (Category)' : 'Expense Category'}:
                </label>
                <select
                  value={claimCategory}
                  onChange={(e) => setClaimCategory(e.target.value as HqReimbursementCategory)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-400 outline-none font-medium"
                >
                  <option value="photoshoot_meals">🍱 {language === 'ko' ? '촬영 식대 및 음료 (Photoshoot Meals & F&B)' : 'Photoshoot Meals & F&B'}</option>
                  <option value="props_equipment">💡 {language === 'ko' ? '소품 & 장비 구입 (Props & Equipment)' : 'Props & Equipment'}</option>
                  <option value="travel_transport">🚕 {language === 'ko' ? '출장 교통비 (Grab/Taxi Transport)' : 'Travel & Transport'}</option>
                  <option value="software_license">💻 {language === 'ko' ? '소프트웨어 라이선스 (Figma, Adobe, Canva)' : 'Software License'}</option>
                  <option value="printing_hardware">🖨️ {language === 'ko' ? '인쇄 및 하드웨어 (Printing & Supplies)' : 'Printing & Supplies'}</option>
                  <option value="other_ops">📦 {language === 'ko' ? '기타 업무 운영비 (Other Operations)' : 'Other Operations'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '청구 제목 (Expense Title)' : 'Expense Title'}:
                </label>
                <input
                  type="text"
                  placeholder={language === 'ko' ? '예: 우붓 지점 출장 Grab 왕복 교통비' : 'e.g., Taxi Grab to Ubud branch photoshoot'}
                  value={claimTitle}
                  onChange={(e) => setClaimTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '청구 금액 (Amount in Rp)' : 'Claim Amount (Rp)'}:
                </label>
                <input
                  type="text"
                  placeholder="150000"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-400 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '상세 설명 & 목적 (Description)' : 'Description & Objective'}:
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'ko' ? '경비 사용 목적 및 상세 내역을 적어주세요...' : 'Describe purpose of expense...'}
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-400 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '영수증 사진 첨부 (자동 압축)' : 'Receipt Proof Photo (Auto-compressed)'}:
                </label>
                <input
                  ref={receiptFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => receiptFileRef.current?.click()}
                    disabled={isCompressingReceipt}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCompressingReceipt ? (language === 'ko' ? '압축 중...' : 'Compressing...') : (language === 'ko' ? '영수증 파일 선택' : 'Upload Receipt')}</span>
                  </button>

                  <input
                    type="text"
                    placeholder="or paste image URL..."
                    value={claimReceiptUrl}
                    onChange={(e) => setClaimReceiptUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none"
                  />
                </div>

                {claimReceiptUrl && (
                  <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <img src={claimReceiptUrl} alt="Receipt Preview" className="w-12 h-12 rounded-lg object-cover border" />
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex-1 truncate">
                      ✓ {language === 'ko' ? '영수증 준비 완료' : 'Receipt attached & compressed'}
                    </div>
                    <button type="button" onClick={() => setClaimReceiptUrl('')} className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'ko' ? '경비 청구 제출' : 'Submit Claim'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Receipt or Proof Modal */}
      {selectedProofModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-sm">
                {selectedProofModal.title}
              </h3>
              <button onClick={() => setSelectedProofModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[65vh]">
              <img
                src={selectedProofModal.url}
                alt="Proof"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            {selectedProofModal.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {selectedProofModal.notes}
              </p>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedProofModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
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
    </div>
  );
};

