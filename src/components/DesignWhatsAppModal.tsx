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
  Layers,
  FileCheck,
  Download
} from 'lucide-react';
import { DesignRequest } from '../types.ts';

interface DesignWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DesignRequest | null;
}

export const DesignWhatsAppModal: React.FC<DesignWhatsAppModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  const {
    branches,
    whitelabelConfig,
    themeColors,
    users,
    currentUser,
    language,
    t
  } = usePortal();

  const [copied, setCopied] = useState(false);
  const [customPhone, setCustomPhone] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');

  if (!isOpen || !request) return null;

  const targetBranch = branches.find((b) => b.id === request.branch_id) || branches[0];
  const branchUser = users.find(
    (u) => u.branch_id === targetBranch.id && (u.role === 'branch_manager' || u.role === 'branch_owner')
  );

  const phoneRaw = customPhone || branchUser?.phone || targetBranch.phone || '+6281234567890';
  const phoneClean = phoneRaw.replace(/[^0-9]/g, '');

  // Dynamic message based on step / status and active language
  const generateMessageText = (): string => {
    const brandName = whitelabelConfig.brand_name;
    const branchName = targetBranch.name;
    const recipientName = branchUser?.full_name || (language === 'ko' ? '지점 매장 매니저' : 'Branch Store Manager');

    if (language === 'ko') {
      switch (request.status) {
        case 'pending':
          return `안녕하세요, ${recipientName}님 (${branchName}) 🍜\n\n${brandName} 본사 시스템에 디자인 제작 요청이 접수되었습니다:\n📌 *${request.title}* (${request.category})\n📅 희망 게시일: ${request.target_date}\n\n현재 상태: *접수 대기 (Pending)*.\n크리에이티브 팀에서 담당 디자이너를 배정할 예정입니다.\n\n${additionalNote ? `메모: ${additionalNote}\n\n` : ''}포털에서 진행상황 확인:\n${window.location.origin}\n\n감사합니다,\n${brandName} HQ 크리에이티브팀`;

        case 'in_progress':
          return `안녕하세요, ${recipientName}님 (${branchName}) 🎨\n\n디자인 제작 진행 알림:\n📌 *${request.title}*\n👨‍🎨 담당 디자이너: *${request.assigned_to_name || currentUser.full_name}*\n\n현재 비주얼 시안 및 카피라이팅 작업이 진행 중입니다.\n${request.creative_notes ? `디자이너 전달사항: "${request.creative_notes}"\n` : ''}${additionalNote ? `추가 메모: ${additionalNote}\n` : ''}\n시안 완료 시 미리보기를 안내해 드리겠습니다!\n\n${brandName} HQ Creative Studio`;

        case 'review':
          return `안녕하세요, ${recipientName}님 (${branchName}) ✨\n\n*${request.title}* 디자인 초안이 완료되어 검토 대기 중입니다!\n\n포털에서 스마트폰 라이브 목업을 확인해 보세요:\n${window.location.origin}\n\n${request.preview_media_url ? `미리보기 링크: ${request.preview_media_url}\n` : ''}${request.canva_url ? `캔바 링크: ${request.canva_url}\n` : ''}${additionalNote ? `메모: ${additionalNote}\n` : ''}\n수정사항이나 피드백이 있으시면 포털 코멘트를 남겨주세요.\n\n감사합니다,\n${brandName} HQ`;

        case 'approved':
          return `안녕하세요, ${recipientName}님 (${branchName}) 🎉\n\n*${request.title}* 디자인이 최종 승인(Approved)되어 납품 완료되었습니다!\n\n📦 *최종 결과물 다운로드:*\n${request.drive_url ? `• 구글 드라이브: ${request.drive_url}\n` : ''}${request.canva_url ? `• 캔바 템플릿: ${request.canva_url}\n` : ''}${request.figma_url ? `• 피그마 원본: ${request.figma_url}\n` : ''}${request.asset_result_url ? `• 완료 파일 링크: ${request.asset_result_url}\n` : ''}\n📝 *추천 캡션 & 해시태그:*\n${request.caption || '포털 목업 시뮬레이터에서 캡션을 복사하세요.'}\n\n${additionalNote ? `추가 메모: ${additionalNote}\n\n` : ''}포털 바로가기:\n${window.location.origin}\n\n번창을 기원합니다,\n${brandName} HQ 크리에이티브팀`;

        case 'rejected':
          return `안녕하세요, ${recipientName}님 (${branchName}) ⚠️\n\n제출해주신 *${request.title}* 디자인 요청서의 기획안 보완이 필요합니다.\n\n본사 검토 의견:\n"${request.feedback_notes || '첨부 사진의 해상도가 낮거나 기획 브리프 세부사항 보완이 필요합니다.'}"\n\n${additionalNote ? `추가 메모: ${additionalNote}\n` : ''}포털에서 수정 후 재접수해 주세요:\n${window.location.origin}\n\n감사합니다,\n${brandName} HQ`;

        default:
          return `안녕하세요, ${recipientName}님 (${branchName}), ${brandName} HQ에서 *${request.title}* 디자인 요청 상태를 안내드립니다.`;
      }
    }

    // Default English
    switch (request.status) {
      case 'pending':
        return `Hello ${recipientName} - ${branchName} 🍜\n\nYour design request has been received in the ${brandName} HQ Portal:\n📌 *${request.title}* (${request.category})\n📅 Target Date: ${request.target_date}\n\nCurrent Status: *Pending Brief Review*.\nOur Creative Lead will assign a designer shortly.\n\n${additionalNote ? `Note: ${additionalNote}\n\n` : ''}Track progress on the portal:\n${window.location.origin}\n\nBest regards,\n${brandName} HQ Creative Team`;

      case 'in_progress':
        return `Hello ${recipientName} - ${branchName} 🎨\n\nDesign production is now active:\n📌 *${request.title}*\n👨‍🎨 Assigned Designer: *${request.assigned_to_name || currentUser.full_name}*\n\nVisual composition, motion graphics & copywriting are currently being crafted.\n${request.creative_notes ? `Designer Notes: "${request.creative_notes}"\n` : ''}${additionalNote ? `Additional Note: ${additionalNote}\n` : ''}\nWe will notify you once preview is ready!\n\n${brandName} HQ Creative Studio`;

      case 'review':
        return `Hello ${recipientName} - ${branchName} ✨\n\nPreview drafts for *${request.title}* are ready for your review!\n\nCheck the live smartphone mockup in the portal:\n${window.location.origin}\n\n${request.preview_media_url ? `Visual Preview: ${request.preview_media_url}\n` : ''}${request.canva_url ? `Canva Link: ${request.canva_url}\n` : ''}${additionalNote ? `Note: ${additionalNote}\n` : ''}\nPlease add your feedback or approval directly on the portal.\n\nThank you,\n${brandName} HQ Team`;

      case 'approved':
        return `Hello ${recipientName} - ${branchName} 🎉\n\nYour design request *${request.title}* has been APPROVED & delivered!\n\n📦 *Deliverable Asset Links:*\n${request.drive_url ? `• Google Drive: ${request.drive_url}\n` : ''}${request.canva_url ? `• Canva Template: ${request.canva_url}\n` : ''}${request.figma_url ? `• Figma Assets: ${request.figma_url}\n` : ''}${request.asset_result_url ? `• Deliverable Link: ${request.asset_result_url}\n` : ''}\n📝 *Ready-to-Post Caption & Hashtags:*\n${request.caption || 'Copy caption directly from the mockup simulator on the portal.'}\n\n${additionalNote ? `Additional Note: ${additionalNote}\n\n` : ''}Access portal:\n${window.location.origin}\n\nBest of success,\n${brandName} HQ Creative Team`;

      case 'rejected':
        return `Hello ${recipientName} - ${branchName} ⚠️\n\nYour design request *${request.title}* requires brief revision.\n\nHQ Review Notes:\n"${request.feedback_notes || 'Raw asset format is incomplete or photos need higher resolution.'}"\n\n${additionalNote ? `Additional Note: ${additionalNote}\n\n` : ''}Please submit revisions via the portal:\n${window.location.origin}\n\nThank you,\n${brandName} HQ`;

      default:
        return `Hello ${recipientName} - ${branchName}, update on design request *${request.title}* from ${brandName} HQ.`;
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
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                {language === 'ko' ? '지점에 왓츠앱 업데이트 전송' : 'Send WhatsApp Status Update to Branch'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ko' ? '진행 단계별 자동 맞춤 메시지:' : 'Automated message customized for step:'} <strong className="uppercase text-emerald-700 dark:text-emerald-400 font-bold">{request.status}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Request Header Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{request.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
                {request.status}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-[11px]">
              <span>{t('branch')}: <strong>{targetBranch.name}</strong></span>
              <span>•</span>
              <span>Pillar: <strong>{request.category}</strong></span>
              <span>•</span>
              <span>Target: <strong>{request.target_date}</strong></span>
            </div>
          </div>

          {/* Contact phone selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ko' ? '수신인 (지점 담당자)' : 'Recipient (Branch PIC)'}
              </label>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                {branchUser?.full_name || 'Store Manager'} ({branchUser?.job_title || 'Branch'})
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ko' ? '발송 대상 왓츠앱 번호' : 'Destination WhatsApp Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={phoneRaw}
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 pl-8"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Optional custom note */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
              {language === 'ko' ? '추가 메모 (선택)' : 'Additional Note (Optional)'}
            </label>
            <input
              type="text"
              placeholder={language === 'ko' ? '예: 스토리 9:16 및 피드 1:1 포맷 포함' : 'e.g. Includes Story 9:16 and Feed 1:1 formats'}
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Preview textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('whatsappMessagePreview')}:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'ko' ? '복사됨!' : 'Copied!') : (language === 'ko' ? '텍스트 복사' : 'Copy Text')}</span>
              </button>
            </div>

            <textarea
              rows={9}
              readOnly
              value={messageText}
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono leading-relaxed text-slate-800 dark:text-slate-200 outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {language === 'ko' ? '수신 번호:' : 'Send to:'} <strong>+{phoneClean}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              {t('close')}
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('openInWhatsapp')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
