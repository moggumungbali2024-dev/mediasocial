import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Mic,
  Paperclip,
  Compass,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Building2,
  Users2
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionTab?: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const {
    currentUser,
    isHQ,
    currentBranch,
    branches,
    designRequests,
    quotas,
    invoices,
    simulatedDate,
    whitelabelConfig,
    themeColors,
    language,
    t
  } = usePortal();

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: language === 'ko'
        ? `안녕하세요 ${currentUser.full_name}님! 저는 Moggumung 소셜 미디어 AI 어시스턴트입니다. 디자인 쿼터, 인플루언서 협찬, 프로모션 마감일(25일 컷오프) 또는 콘텐츠 기획에 대해 무엇이든 질문해 주세요.`
        : `Hello ${currentUser.full_name}! I'm your Moggumung Social Media & Franchise AI Assistant. How can I assist you today with design quotas, exposure rotators, invoices, or viral promo concepts?`,
      timestamp: 'Just now',
      suggestions: [
        language === 'ko' ? '이번 달 잔여 디자인 쿼터 확인' : 'Check Monthly Design Quotas',
        language === 'ko' ? '25일 프로모션 컷오프 규정 안내' : 'Explain Cutoff Rule (> 25th)',
        language === 'ko' ? '인스타그램 릴스 캡션 3가지 추천' : 'Generate 3 Viral Instagram Captions'
      ]
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPromptChips = [
    { label: language === 'ko' ? '디자인 쿼터' : 'Design Quota', prompt: 'Berapa sisa kuota desain bulan ini dan apa syarat submit?' },
    { label: language === 'ko' ? '프로모 컷오프' : 'Promo Cutoff', prompt: 'Jelaskan aturan cut-off tanggal 25 untuk promo bulan depan.' },
    { label: language === 'ko' ? '인플루언서' : 'Influencers', prompt: 'Rekomendasikan strategi influencer foodies untuk branch Seminyak & Ubud.' },
    { label: language === 'ko' ? '정산 및 인보이스' : 'Billing & Invoice', prompt: 'Bagaimana status pembayaran invoice cabang bulan ini?' },
    { label: language === 'ko' ? '캡션 생성기' : 'Viral Captions', prompt: 'Buatkan 3 ide caption Instagram reels menarik untuk menu signature Moggumung.' }
  ];

  const suggestedCards = [
    {
      title: language === 'ko' ? '인스타그램 릴스 기획 5가지' : 'Generate 5 Instagram Reel Ideas',
      desc: language === 'ko' ? '시그니처 메뉴와 매장 분위기를 살린 숏폼 영상' : 'Short-form hooks for signature dishes & branch vibes',
      prompt: 'Buatkan 5 hook konten video reels Instagram untuk promosi outlet F&B kami.'
    },
    {
      title: language === 'ko' ? '월간 쿼터 상태 감사' : 'Audit Quotas & Approvals',
      desc: language === 'ko' ? '지점별 3건 디자인 및 2건 프로모션 현황' : '3 design requests & 2 promo requests compliance',
      prompt: 'Analisis kepatuhan kuota cabang dan request yang sedang pending.'
    },
    {
      title: language === 'ko' ? '25일 컷오프 규정 시뮬레이션' : 'Simulate 25th Cutoff Policy',
      desc: language === 'ko' ? '마감일 전후 승인 프로세스' : 'Review automated lock for next month promo requests',
      prompt: 'Bagaimana sistem menangani request promo yang disubmit setelah tanggal 25?'
    }
  ];

  const handleSend = (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    // AI Response generation logic
    setTimeout(() => {
      let reply = '';
      let actionTab: string | undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes('kuota') || lower.includes('quota') || lower.includes('desain')) {
        const pendingCount = designRequests.filter((r) => r.status === 'pending').length;
        reply = language === 'ko'
          ? `현재 활성 지점당 매월 기본 ${whitelabelConfig.max_monthly_design_requests || 3}건의 디자인 요청 쿼터가 주어집니다. 최소 리드타임은 영업일 기준 ${whitelabelConfig.design_min_lead_days || 5}일입니다. 현재 대기 중인 요청은 ${pendingCount}건입니다.`
          : `Each branch receives ${whitelabelConfig.max_monthly_design_requests || 3} free design requests per month with a minimum lead time of ${whitelabelConfig.design_min_lead_days || 5} days (H+${whitelabelConfig.design_min_lead_days || 5}). Currently there are ${pendingCount} pending design requests.`;
        actionTab = 'requests';
      } else if (lower.includes('cutoff') || lower.includes('cut-off') || lower.includes('25') || lower.includes('promo')) {
        reply = language === 'ko'
          ? `25일 컷오프 규정: 다음 달 프로모션 배포를 위한 요청은 매월 ${whitelabelConfig.promo_cutoff_day_of_month || 25}일 23:59까지 승인 완료되어야 합니다. 25일 이후 접수된 건은 다다음 달 일정으로 자동 배정됩니다. 현재 시뮬레이션 날짜는 ${simulatedDate}입니다.`
          : `Promo Cut-off Policy: Promo requests intended for the upcoming month must be submitted and approved by the ${whitelabelConfig.promo_cutoff_day_of_month || 25}th of the current month. Submissions after the 25th are automatically scheduled for the month after next. Currently simulated date is ${simulatedDate}.`;
        actionTab = 'requests';
      } else if (lower.includes('influencer') || lower.includes('foodies') || lower.includes('kol')) {
        reply = language === 'ko'
          ? `발리 및 자카르타 지역의 F&B 전문 인플루언서 12명이 등록되어 있습니다. 매월 15일 이전에 섭외를 확정하고, 바우처 제공 내역을 인플루언서 디렉토리에 기록해 주세요.`
          : `We have active verified food & lifestyle influencers in Bali, Jakarta, and Bandung. Influencer visits require minimum 7 days notice and are tracked in the Influencer Directory.`;
        actionTab = 'influencers';
      } else if (lower.includes('invoice') || lower.includes('billing') || lower.includes('bayar')) {
        reply = language === 'ko'
          ? `월간 리테이너 청구서는 매월 28일 자동 생성되며, 7일 이내에 ${whitelabelConfig.bank_name} (${whitelabelConfig.bank_account_number}) 계좌로 납부해야 합니다.`
          : `Monthly retainer invoices are automatically generated on the 28th. Franchisees receive payment instructions for ${whitelabelConfig.bank_name} (Acc: ${whitelabelConfig.bank_account_number}).`;
        actionTab = 'billing';
      } else {
        reply = language === 'ko'
          ? `💡 [Moggumung AI 추천]\n1. "치즈 폭탄 시그니처, 한 입에 끝내는 불맛 🔥" - 릴스 오프닝 훅\n2. "지점 방문 고객 대상 주말 1+1 타임세일 배너"\n3. "스토리 투표: 오늘의 추천 메뉴는?"\n\n요청 탭에서 바로 디자인 의뢰서를 생성할 수 있습니다!`
          : `💡 [Moggumung AI Social Strategy]\n1. "Cheesy sizzle pull test - Can you handle the heat?" (Reels Hook)\n2. "Weekend Brunch Flash Deal: 20% off for 2+ diners"\n3. "Story Poll: Which sauce flavor wins today?"\n\nWould you like to draft a new Design Request now?`;
        actionTab = 'requests';
      }

      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTab
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex-1" onClick={onClose} />

      <div className="w-full max-w-md bg-white dark:bg-[#0f1117] h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-250">
        {/* Header (Image 2 style) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-md"
            >
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">You AI Assistance</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Moggumung Copilot Pro</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 border dark:border-emerald-500/30 text-[10px] font-bold">
              ✦ Pro Account
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Greeting Hero (matching Image 2) */}
          <div className="text-center py-2 space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
              How can I Help you, {currentUser.full_name.split(' ')[0]}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {language === 'ko'
                ? '소셜 미디어 쿼터, 디자인 의뢰, 프로모션 컷오프 또는 마케팅 기획에 대해 무엇이든 물어보세요.'
                : 'You can ask anything about your social media quota, design requests, promo schedules, or franchise rules.'}
            </p>
          </div>

          {/* Prompt Chips (Image 2 style) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {quickPromptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition active:scale-95 flex items-center gap-1"
              >
                <span className="text-emerald-500">✦</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Suggestion Cards */}
          <div className="space-y-2">
            {suggestedCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(card.prompt)}
                className="w-full text-left p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800/80 transition shadow-2xs group"
              >
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-between">
                  <span>{card.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{card.desc}</p>
              </button>
            ))}
          </div>

          {/* Conversation History */}
          <div className="space-y-3 pt-2">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white rounded-br-xs shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 px-1">{m.timestamp}</span>

                  {/* Action Link button */}
                  {!isUser && m.actionTab && (
                    <button
                      onClick={() => {
                        onNavigateTab(m.actionTab!);
                        onClose();
                      }}
                      style={{ color: themeColors.primary }}
                      className="mt-1 text-[11px] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>{t('viewAllActivity')} / {t(m.actionTab as any) || m.actionTab}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 w-24">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        </div>

        {/* Input Footer (Image 2 style with Mic, Link, Send) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-500"
          >
            <input
              type="text"
              placeholder={language === 'ko' ? '어시스턴트에게 질문하기...' : 'How can I help you today?'}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden"
            />

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title="Attachment"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="submit"
                style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-1"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
