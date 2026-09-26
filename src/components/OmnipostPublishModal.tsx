import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Instagram, 
  Globe, 
  Clock, 
  Layers, 
  ExternalLink,
  RefreshCw,
  Eye,
  Check,
  Share2
} from 'lucide-react';
import { usePortal } from '../context/PortalContext.tsx';
import { OmnipostService, getOmnipostConfig } from '../services/omnipostService.ts';
import { OmnipostChannel, DesignRequest } from '../types.ts';

interface OmnipostPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  initialMediaUrls?: string[];
  initialTitle?: string;
  designRequest?: DesignRequest;
  onPublishedSuccess?: (postId: string) => void;
}

export const OmnipostPublishModal: React.FC<OmnipostPublishModalProps> = ({
  isOpen,
  onClose,
  initialContent = '',
  initialMediaUrls = [],
  initialTitle = '',
  designRequest,
  onPublishedSuccess
}) => {
  const { 
    themeColors, 
    whitelabelConfig, 
    simulatedDate, 
    activeTenantSlug, 
    addActivity, 
    currentUser,
    language 
  } = usePortal();

  const isKo = language === 'ko';

  const [content, setContent] = useState(initialContent);
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialMediaUrls);
  const [mediaInput, setMediaInput] = useState('');
  const [title, setTitle] = useState(initialTitle);
  const [channels, setChannels] = useState<OmnipostChannel[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState(`${simulatedDate}T10:00`);
  
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ id?: string; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent || designRequest?.caption || designRequest?.description || '');
      const initialMedia = initialMediaUrls.length > 0 
        ? initialMediaUrls 
        : (designRequest?.asset_result_url ? [designRequest.asset_result_url] : (designRequest?.preview_media_url ? [designRequest.preview_media_url] : []));
      setMediaUrls(initialMedia);
      setTitle(initialTitle || designRequest?.title || '');
      setErrorMsg(null);
      setSuccessResult(null);
      loadChannels();
    }
  }, [isOpen, initialContent, initialMediaUrls, initialTitle, designRequest]);

  const loadChannels = async () => {
    setIsLoadingChannels(true);
    setErrorMsg(null);
    try {
      const config = getOmnipostConfig(activeTenantSlug);
      const res = await OmnipostService.getChannels(config.apiUrl, config.apiToken);
      let loaded: OmnipostChannel[] = [];
      if (res.success && res.data && res.data.length > 0) {
        loaded = res.data;
      }

      // Check per-brand storage
      const brandKey = `smp_b_${activeTenantSlug}_channels`;
      const savedRaw = localStorage.getItem(brandKey);
      if (savedRaw) {
        try {
          const parsed = JSON.parse(savedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map<string, OmnipostChannel>();
            parsed.forEach((c: OmnipostChannel) => map.set(c.id, c));
            loaded.forEach(c => map.set(c.id, c));
            loaded = Array.from(map.values());
          }
        } catch (e) {
          console.error('Error reading brand channels', e);
        }
      }

      if (loaded.length === 0) {
        loaded = [
          {
            id: `chan-ig-${activeTenantSlug}`,
            name: `${whitelabelConfig.brand_name} Official Instagram`,
            platform: 'instagram',
            handle: `@${activeTenantSlug}.official`,
            is_active: true,
            followers_count: 0
          },
          {
            id: `chan-tt-${activeTenantSlug}`,
            name: `${whitelabelConfig.brand_name} TikTok`,
            platform: 'tiktok',
            handle: `@${activeTenantSlug}.official`,
            is_active: true,
            followers_count: 0
          }
        ];
      }

      setChannels(loaded);
      if (loaded.length > 0) {
        setSelectedChannelIds(loaded.map(c => c.id));
      }
    } catch (err: any) {
      console.error('Failed to load social channels', err);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const handleToggleChannel = (chId: string) => {
    if (selectedChannelIds.includes(chId)) {
      setSelectedChannelIds(selectedChannelIds.filter(id => id !== chId));
    } else {
      setSelectedChannelIds([...selectedChannelIds, chId]);
    }
  };

  const handleAddMedia = () => {
    if (mediaInput.trim()) {
      setMediaUrls([...mediaUrls, mediaInput.trim()]);
      setMediaInput('');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg(isKo ? '캡션 내용을 입력해주세요.' : 'Caption content cannot be empty.');
      return;
    }
    if (selectedChannelIds.length === 0) {
      setErrorMsg(isKo ? '최소 1개 이상의 대상 채널을 선택해주세요.' : 'Please select at least 1 target social channel.');
      return;
    }

    setIsPublishing(true);
    setErrorMsg(null);
    setSuccessResult(null);

    const config = getOmnipostConfig(activeTenantSlug);
    const payload = {
      content: content.trim(),
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      channelIds: selectedChannelIds,
      publishNow: publishMode === 'now',
      scheduledAt: publishMode === 'schedule' ? scheduledDateTime : undefined,
      title: title.trim() || undefined
    };

    try {
      const res = await OmnipostService.createPost(payload, config.apiUrl, config.apiToken);
      
      const postId = res.data?.id || `post-soc-${Date.now()}`;
      setSuccessResult({
        id: postId,
        message: publishMode === 'now' 
          ? (isKo ? `${selectedChannelIds.length}개 소셜 미디어 채널로 즉시 발행되었습니다!` : `Successfully published to ${selectedChannelIds.length} social channels!`)
          : (isKo ? `${scheduledDateTime}에 자동 발행되도록 예약되었습니다!` : `Post scheduled to publish at ${scheduledDateTime}!`)
      });

      addActivity({
        branch_id: designRequest?.branch_id,
        branch_name: designRequest?.branch_name,
        user_name: currentUser.full_name,
        action_type: 'promo_campaign_active',
        title: isKo 
          ? `🚀 SNS 자동 발행: ${title || '프로모션 콘텐츠'}` 
          : `🚀 Auto-Post: ${title || 'Promotional Content'}`,
        description: isKo 
          ? `${selectedChannelIds.length}개 채널 (${publishMode === 'now' ? '즉시 발행' : `예약 ${scheduledDateTime}`})` 
          : `Published to ${selectedChannelIds.length} channels (${publishMode === 'now' ? 'Instant Live' : `Scheduled ${scheduledDateTime}`}).`,
        severity: 'success',
        link_tab: 'omnipost'
      });

      if (onPublishedSuccess) onPublishedSuccess(postId);
    } catch (err: any) {
      setErrorMsg(`Error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div 
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-md"
            >
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isKo ? '소셜 미디어로 발행' : 'Publish to Social Media'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  {isKo ? '멀티채널 자동 발행' : 'Auto-Post Multi-Channel'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKo 
                  ? '인스타그램, 틱톡, 페이스북으로 프로모션 콘텐츠를 원클릭 전송합니다.' 
                  : 'Publish promotional content directly to Instagram, TikTok, and Facebook.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <p className="font-bold text-sm mb-0.5">{isKo ? '성공!' : 'Success!'}</p>
                <p>{successResult.message}</p>
              </div>
            </div>
          )}

          {/* 1. Target Channel Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-orange-500" />
                <span>
                  {isKo 
                    ? `대상 소셜 미디어 채널 선택 (${selectedChannelIds.length}개 선택됨)` 
                    : `Select Target Channels (${selectedChannelIds.length} selected)`}
                </span>
              </label>
              <button
                type="button"
                onClick={loadChannels}
                disabled={isLoadingChannels}
                className="text-[11px] font-semibold text-slate-500 hover:text-orange-500 flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingChannels ? 'animate-spin' : ''}`} />
                <span>{isKo ? '채널 새로고침' : 'Refresh Channels'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {channels.map((ch) => {
                const isSelected = selectedChannelIds.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    onClick={() => handleToggleChannel(ch.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-500/80 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        ch.platform === 'instagram' 
                          ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white' 
                          : ch.platform === 'tiktok'
                          ? 'bg-black text-white dark:bg-slate-950'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {ch.platform === 'instagram' ? 'IG' : (ch.platform === 'tiktok' ? 'TT' : 'FB')}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {ch.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          {ch.handle || ch.platform} {ch.followers_count ? `• ${(ch.followers_count / 1000).toFixed(1)}k` : ''}
                        </div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                      isSelected 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Content / Caption */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isKo ? '캡션 및 카피라이팅' : 'Caption & Copywriting Content'}
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {content.length} {isKo ? '자' : 'chars'}
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isKo ? '인스타그램 / 틱톡에 게시할 캡션, 해시태그, 프로모션 안내를 작성하세요...' : 'Write copywriting, promotion details, hashtags, CTA...'}
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition leading-relaxed"
            />
          </div>

          {/* 3. Media Assets Preview & Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isKo ? '미디어 에셋 (이미지 / 영상 URL)' : 'Media Asset (Image / Video URL)'}
            </label>
            
            {mediaUrls.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative group shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img src={url} alt={`Asset ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-slate-900/80 text-white hover:bg-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={mediaInput}
                onChange={(e) => setMediaInput(e.target.value)}
                placeholder="https://images.unsplash.com/... or asset URL"
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddMedia}
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                {isKo ? '+ 미디어 추가' : '+ Add Media'}
              </button>
            </div>
          </div>

          {/* 4. Publishing Schedule Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isKo ? '발행 시간' : 'Publishing Timing'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPublishMode('now')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  publishMode === 'now'
                    ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-900 dark:text-orange-200 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold mb-0.5">
                  <Send className="w-3.5 h-3.5 text-orange-500" />
                  <span>{isKo ? '지금 즉시 발행' : 'Publish Now'}</span>
                </div>
                <div className="text-[10px] opacity-80">
                  {isKo ? '버튼 클릭 즉시 소셜 미디어로 발행되어 실시간 반영됩니다.' : 'Dispatched and published immediately when clicked.'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPublishMode('schedule')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  publishMode === 'schedule'
                    ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-900 dark:text-orange-200 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>{isKo ? '예약 발행' : 'Schedule Post'}</span>
                </div>
                <div className="text-[10px] opacity-80">
                  {isKo ? '지정된 일시 및 시간에 자동으로 발행됩니다.' : 'Automatically goes live at the specified date and time.'}
                </div>
              </button>
            </div>

            {publishMode === 'schedule' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-in fade-in duration-150">
                <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                <input
                  type="datetime-local"
                  required
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition cursor-pointer"
          >
            {isKo ? '닫기' : 'Cancel'}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing || selectedChannelIds.length === 0}
            style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
            className="px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isKo ? 'SNS 발행 처리 중...' : 'Publishing to Social...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{publishMode === 'now' ? (isKo ? 'SNS로 즉시 발행하기' : 'Publish to Social Media Now') : (isKo ? '예약 일정 저장하기' : 'Save Social Schedule')}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
