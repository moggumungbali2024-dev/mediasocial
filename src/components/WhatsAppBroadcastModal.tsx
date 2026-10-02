import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import {
  MessageSquare,
  X,
  Send,
  Phone,
  CheckCircle2,
  Copy,
  ExternalLink,
  Store,
  Sparkles,
  FileText,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Branch } from '../types.ts';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBranch?: Branch | null;
  defaultTemplateType?: 'design_ready' | 'cutoff_warning' | 'invoice_issued' | 'influencer_visit';
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  defaultBranch,
  defaultTemplateType = 'design_ready'
}) => {
  const {
    branches,
    currentBranch,
    whitelabelConfig,
    themeColors,
    simulatedDate,
    users,
    language
  } = usePortal();

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    defaultBranch?.id || currentBranch?.id || branches[0]?.id || ''
  );
  const [templateType, setTemplateType] = useState(defaultTemplateType);
  const [customPhone, setCustomPhone] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Find store manager / owner contact for this branch
  const branchUser = users.find(
    (u) => u.branch_id === targetBranch.id && (u.role === 'branch_manager' || u.role === 'branch_owner')
  );

  const phoneRaw = customPhone || branchUser?.phone || targetBranch.phone || '+6281234567890';
  // Clean phone number for wa.me: remove non-numeric except leading +
  const phoneClean = phoneRaw.replace(/[^0-9]/g, '');

  const isKo = language === 'ko';

  const generateMessageText = (): string => {
    const brandName = whitelabelConfig.brand_name;
    const branchName = targetBranch.name;
    const bankInfo = `${whitelabelConfig.bank_name} (${whitelabelConfig.bank_account_number} a/n ${whitelabelConfig.bank_account_name})`;

    if (isKo) {
      switch (templateType) {
        case 'design_ready':
          return `안녕하세요 ${branchUser?.full_name || '매장 매니저'}님 - ${branchName} 🍜\n\n좋은 소식입니다! 요청하신 소셜 미디어 디자인 및 비디오 콘텐츠 제작이 ${brandName} HQ 크리에이티브 팀에서 완료되어 발행 준비가 완료되었습니다.\n\n포털에서 최종 제작물을 확인하고 다운로드하세요:\n${window.location.origin}\n\n메모: ${customNote || '매장 최적 피크타임에 맞추어 업로드 일정을 등록해 주세요.'}\n\n감사합니다.\n${brandName} HQ 크리에이티브 팀`;

        case 'cutoff_warning':
          return `[중요] 월간 프로모션 제출 마감 안내 (${brandName} HQ) ⚠️\n\n안녕하세요 ${branchName} 매장 담당자님,\n익월 프로모션 접수 마감(Cut-off)이 매월 25일 23:59까지입니다.\n\n마감 전 소셜 미디어 포털을 통해 다음 달 프로모션 기획안을 제출해 주시기 바랍니다.\n\n프로모션 등록 바로가기: ${window.location.origin}\n\n감사합니다.\n${brandName} 본사 운영팀`;

        case 'invoice_issued':
          return `[월간 리테이너 청구서 발행 알림] - ${branchName} 🧾\n\n안녕하세요 ${branchUser?.full_name || '점주'}님 (${branchName}),\n이번 기간 브랜드 마케팅 및 소셜 콘텐츠 아웃소싱 리테이너 청구서가 발행되었습니다.\n\n청구 금액: Rp ${whitelabelConfig.default_monthly_retainer.toLocaleString()}\n입금 계좌: ${bankInfo}\n납부 기한: 발행일로부터 7일 이내\n\n이체 완료 후 포털에 입금 확인증을 업로드해 주세요:\n${window.location.origin}\n\n감사합니다.`;

        case 'influencer_visit':
          return `[인플루언서 / 체험단 매장 방문 일정 안내] - ${branchName} 📸\n\n안녕하세요 ${branchName} 매장팀,\n본사에서 주관하는 인플루언서/KOL 방문 일정이 확정되었습니다:\n\n인플루언서: @madediningbali\n방문 일정: 이번 주말 (18:00)\n할인 바우처 코드: MANDABALI15 (15% 할인)\n\n대표 시그니처 메뉴 2종을 준비해 주시고 친절하게 환대해 주시기 바랍니다.\n\n감사합니다.\n${brandName} HQ 마케팅팀`;

        default:
          return `안녕하세요 ${branchName}, ${brandName} HQ 본사 공식 알림 메시지입니다.`;
      }
    }

    switch (templateType) {
      case 'design_ready':
        return `Hello ${branchUser?.full_name || 'Store Manager'} - ${branchName} 🍜\n\nGreat news! Your creative design & social media content request has been finalized by ${brandName} HQ team and is ready for release.\n\nPlease inspect the portal and download the final assets here:\n${window.location.origin}\n\nNotes: ${customNote || 'Please schedule posts according to peak customer engagement hours.'}\n\nWarm regards,\n${brandName} HQ Creative Team`;

      case 'cutoff_warning':
        return `IMPORTANT: Monthly Promo Submission Cut-off Reminder (${brandName} HQ) ⚠️\n\nHello ${branchName},\nThis is a reminder that the submission cut-off date for next month's promotional assets is the 25th at 23:59.\n\nPlease ensure your outlet promos are submitted via the portal so our production team can schedule rotation in advance.\n\nSubmit promo now: ${window.location.origin}\n\nBest regards,\n${brandName} Operations`;

      case 'invoice_issued':
        return `Monthly Retainer Invoice Issued - ${branchName} 🧾\n\nHello ${branchUser?.full_name || 'Owner'} (${branchName}),\nYour monthly retainer invoice for creative services and content outsourcing has been issued.\n\nAmount: Rp ${whitelabelConfig.default_monthly_retainer.toLocaleString()}\nBank Details: ${bankInfo}\nDue Date: 7 calendar days from issue date.\n\nAfter completing the transfer, please upload payment proof in the portal:\n${window.location.origin}\n\nThank you for your cooperation!`;

      case 'influencer_visit':
        return `Food Influencer Visit Confirmation - ${branchName} 📸\n\nHello ${branchName} team,\nWe have confirmed a food influencer visit to your outlet:\n\nInfluencer: @madediningbali\nSchedule: This weekend (18:00)\nVoucher Code: MANDABALI15 (15% Off)\n\nPlease prepare 2 signature dishes and warmly welcome their arrival.\n\nBest regards,\n${brandName} HQ Marketing`;

      default:
        return `Hello ${branchName}, official notification from ${brandName} HQ.`;
    }
  };

  const messageText = generateMessageText();
  const encodedText = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${phoneClean}?text=${encodedText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                WhatsApp Dispatcher &amp; Reminder
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKo ? '지점 점주 및 매니저에게 1-클릭 WhatsApp 실시간 알림 전송' : 'Send instant 1-click WhatsApp alerts to Branch Manager / Owner'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Branch & Phone Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isKo ? '대상 지점 선택' : 'Target Branch'}
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isKo ? '수신자 WhatsApp 번호' : 'Recipient WhatsApp Phone'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={phoneRaw}
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 pl-8"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {/* Template Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              {isKo ? '메시지 템플릿 선택' : 'Message Template'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTemplateType('design_ready')}
                className={`p-2.5 rounded-2xl border text-left transition font-semibold cursor-pointer ${
                  templateType === 'design_ready'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🎨 {isKo ? '디자인 완료' : 'Design Ready'}
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('cutoff_warning')}
                className={`p-2.5 rounded-2xl border text-left transition font-semibold cursor-pointer ${
                  templateType === 'cutoff_warning'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/60 text-red-950 dark:text-red-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                ⚠️ {isKo ? '프로모션 마감' : 'Promo Cut-off'}
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('invoice_issued')}
                className={`p-2.5 rounded-2xl border text-left transition font-semibold cursor-pointer ${
                  templateType === 'invoice_issued'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🧾 {isKo ? '청구서 발행' : 'Invoice Issued'}
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('influencer_visit')}
                className={`p-2.5 rounded-2xl border text-left transition font-semibold cursor-pointer ${
                  templateType === 'influencer_visit'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-950 dark:text-purple-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                📸 {isKo ? '인플루언서 방문' : 'Influencer Visit'}
              </button>
            </div>
          </div>

          {/* Generated Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isKo ? 'WhatsApp 메시지 미리보기:' : 'WhatsApp Message Preview:'}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isKo ? '복사됨!' : 'Copied!') : (isKo ? '메시지 복사' : 'Copy Message')}</span>
              </button>
            </div>

            <textarea
              rows={8}
              readOnly
              value={messageText}
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono leading-relaxed text-slate-800 dark:text-slate-200 outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {isKo ? '수신 번호:' : 'Recipient:'} <strong>+{phoneClean}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {isKo ? '닫기' : 'Close'}
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>{isKo ? 'WhatsApp 열기' : 'Open WhatsApp'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
