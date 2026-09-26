import React, { useState, useEffect } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  X,
  Smartphone,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music,
  Share2,
  Copy,
  Check,
  Download,
  Eye,
  Sliders,
  Sparkles,
  Play,
  Save,
  MapPin,
  Hash,
  Flame,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { DesignRequest } from '../types.ts';

interface SocialMediaMockupModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: DesignRequest | null;
  title?: string;
  branchName?: string;
  caption?: string;
  previewUrl?: string;
  format?: 'feed' | 'carousel' | 'reels';
}

export const SocialMediaMockupModal: React.FC<SocialMediaMockupModalProps> = ({
  isOpen,
  onClose,
  request,
  title: propTitle,
  branchName: propBranchName,
  caption: propCaption,
  previewUrl: propPreviewUrl,
  format: propFormat
}) => {
  const { 
    whitelabelConfig, 
    themeColors, 
    currentBranch, 
    branches, 
    updateDesignCaption,
    language,
    t
  } = usePortal();

  const [format, setFormat] = useState<'feed' | 'carousel' | 'reels'>(propFormat || 'reels');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const branchObj = branches.find((b) => b.id === request?.branch_id) || (propBranchName ? { name: propBranchName, location: propBranchName, city: 'Bali' } : null) || currentBranch || branches[0];
  const title = propTitle || request?.title || 'Signature Spicy Korean BBQ Ramen Special';
  const category = request?.category || 'Food';

  // Initial caption
  const defaultCaption = propCaption || request?.caption || `🔥 ${title}!\n\nDelicious authentic flavors and signature broth crafted fresh daily at ${whitelabelConfig.brand_name} ${branchObj.name}.\n\n📍 ${branchObj.location}, ${branchObj.city}\n⏰ Open Daily: 10:00 - 22:00 WITA\n\nTag your foodie friends who need to visit this weekend! 👇\n\n#${whitelabelConfig.brand_name.toLowerCase().replace(/\s/g, '')} #${branchObj.name.toLowerCase().replace(/\s/g, '')} #kulinerbali #foodiesofinstagram #reelsfood`;

  const [caption, setCaption] = useState(defaultCaption);

  useEffect(() => {
    if (propCaption) {
      setCaption(propCaption);
    } else if (request) {
      setCaption(request.caption || defaultCaption);
    }
  }, [request, propCaption]);

  useEffect(() => {
    if (propFormat) setFormat(propFormat);
  }, [propFormat]);

  if (!isOpen) return null;

  // Media preview (Image or Video)
  const sampleImages = {
    Food: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    Vibes: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    Creative: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    Promo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
  };

  const mediaUrl = propPreviewUrl || request?.preview_media_url || request?.asset_result_url || sampleImages[category] || sampleImages.Food;
  const isVideo = request?.preview_media_type === 'video' || mediaUrl.endsWith('.mp4') || mediaUrl.includes('video');

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleSaveCaption = () => {
    if (request) {
      updateDesignCaption(request.id, caption);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  // Caption template snippet inserters
  const insertSnippet = (snippet: string) => {
    setCaption((prev) => prev.trim() + '\n\n' + snippet);
  };

  const templateAddress = `📍 ${branchObj.location}, ${branchObj.city}\n⏰ Buka Setiap Hari: 10:00 - 22:00 WITA`;
  const templateHashtags = `#${whitelabelConfig.brand_name.toLowerCase().replace(/\s/g, '')} #${branchObj.name.toLowerCase().replace(/\s/g, '')} #kulinerbali #balifoodies #japaneseramen #foodgasm #ramenlover`;
  const templatePromoCTA = `🔥 Promo Terbatas! Tag 3 teman kulinermu di kolom komentar & tunjukkan postingan ini ke kasir untuk klaim promo!`;
  const templateTerms = `*Syarat & Ketentuan: Berlaku dine-in, follow akun Instagram resmi, selama persediaan masih ada.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row max-h-[94vh]">
        {/* Left: Interactive Phone Screen Mockup Frame */}
        <div className="md:w-1/2 bg-[#090a0f] p-5 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          {/* Format Selector Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl mb-3 text-xs z-10">
            <button
              type="button"
              onClick={() => setFormat('reels')}
              style={format === 'reels' ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary } : undefined}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                format === 'reels' ? 'shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reels (9:16)
            </button>
            <button
              type="button"
              onClick={() => setFormat('feed')}
              style={format === 'feed' ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary } : undefined}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                format === 'feed' ? 'shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Feed (1:1)
            </button>
            <button
              type="button"
              onClick={() => setFormat('carousel')}
              style={format === 'carousel' ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary } : undefined}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                format === 'carousel' ? 'shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Carousel (4:5)
            </button>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[270px] sm:w-[300px] bg-black rounded-[42px] p-2.5 shadow-2xl border-[5px] border-slate-800 ring-1 ring-slate-700 relative overflow-hidden flex flex-col justify-between select-none">
            {/* Speaker & Dynamic Island */}
            <div className="absolute top-3.5 inset-x-0 flex justify-center z-30 pointer-events-none">
              <div className="w-22 h-4 bg-slate-900 rounded-full" />
            </div>

            {/* Inner Phone Screen Content */}
            <div className="bg-black rounded-[32px] overflow-hidden flex flex-col relative aspect-[9/16] text-white">
              {/* Top Instagram Header */}
              <div className="pt-6 px-3.5 pb-2 flex items-center justify-between z-20 bg-gradient-to-b from-black/85 to-transparent">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                  >
                    {whitelabelConfig.brand_monogram || 'MG'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-bold text-[11px]">
                      <span>{whitelabelConfig.brand_name.toLowerCase().replace(/\s/g, '')}.{branchObj.name.split(' ')[1]?.toLowerCase() || 'bali'}</span>
                      <span className="w-3 h-3 bg-sky-500 rounded-full text-[8px] flex items-center justify-center font-bold">✓</span>
                    </div>
                    <div className="text-[9px] text-slate-300 truncate max-w-[130px]">{branchObj.location}</div>
                  </div>
                </div>

                <button className="text-[10px] px-2 py-0.5 rounded-full border border-white/40 font-bold bg-white/10">
                  Follow
                </button>
              </div>

              {/* Media Visual Area */}
              <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
                {isVideo ? (
                  <video
                    src={mediaUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={title}
                    className={`w-full object-cover transition-all duration-300 ${
                      format === 'feed'
                        ? 'aspect-square my-auto'
                        : format === 'carousel'
                        ? 'aspect-[4/5] my-auto'
                        : 'h-full'
                    }`}
                  />
                )}

                {/* Reels Overlay Icons (Right Side) */}
                {format === 'reels' && (
                  <div className="absolute right-2 bottom-12 flex flex-col items-center gap-3.5 z-20">
                    <button
                      type="button"
                      onClick={() => setLiked(!liked)}
                      className="flex flex-col items-center gap-0.5 text-white cursor-pointer"
                    >
                      <Heart className={`w-5 h-5 transition ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-[9px] font-bold">2.4k</span>
                    </button>
                    <button type="button" className="flex flex-col items-center gap-0.5 text-white cursor-pointer">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-[9px] font-bold">184</span>
                    </button>
                    <button type="button" className="flex flex-col items-center gap-0.5 text-white cursor-pointer">
                      <Send className="w-5 h-5" />
                      <span className="text-[9px] font-bold">412</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaved(!saved)}
                      className="flex flex-col items-center gap-0.5 text-white cursor-pointer"
                    >
                      <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Caption & Audio Bar */}
              <div className="p-3 bg-gradient-to-t from-black via-black/85 to-transparent z-20 space-y-1">
                <p className="text-[11px] font-semibold line-clamp-2 leading-tight">
                  <span className="font-bold mr-1">{whitelabelConfig.brand_name.toLowerCase().replace(/\s/g, '')}</span>
                  {caption.split('\n')[0] || title}
                </p>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-300 pt-0.5 font-mono">
                  <Music className="w-3 h-3 animate-spin" />
                  <span className="truncate">Original Audio - {whitelabelConfig.brand_name} Bali Vibes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mockup Details, Editable Caption & Template Buttons */}
        <div className="md:w-1/2 p-5 sm:p-6 flex flex-col justify-between space-y-4 overflow-y-auto bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                  {language === 'ko' ? '인스타그램 목업 시뮬레이터 & 캡션 에디터' : 'Mockup Simulator & Caption Editor'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('branch')}</span>
                <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {branchObj.name}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Content Pillar</span>
                <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>{category}</span>
                </div>
              </div>
            </div>

            {/* Template Snippet Chips */}
            <div className="mt-4 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                {t('quickSnippetInsert')}
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => insertSnippet(templateAddress)}
                  className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-semibold flex items-center gap-1 text-[11px] transition cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{t('snippetAddress')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet(templateHashtags)}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 font-semibold flex items-center gap-1 text-[11px] transition cursor-pointer"
                >
                  <Hash className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>{t('snippetHashtags')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet(templatePromoCTA)}
                  className="px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800 font-semibold flex items-center gap-1 text-[11px] transition cursor-pointer"
                >
                  <Flame className="w-3 h-3 text-red-600 dark:text-red-400" />
                  <span>{t('snippetPromoCTA')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet(templateTerms)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold flex items-center gap-1 text-[11px] transition cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span>{t('snippetTerms')}</span>
                </button>
              </div>
            </div>

            {/* Editable Caption Textarea */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ko' ? '게시용 캡션 (자유롭게 편집 & 저장 가능)' : 'Ready-to-Post Caption (Editable & Savable)'}
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? (language === 'ko' ? '복사됨!' : 'Copied!') : (language === 'ko' ? '캡션 복사' : 'Copy Caption')}</span>
                </button>
              </div>

              <textarea
                rows={7}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={language === 'ko' ? '매력적인 인스타그램 게시 캡션을 작성하세요...' : 'Write your engaging Instagram caption here...'}
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 font-sans leading-relaxed outline-none"
              />
            </div>

            {saveSuccess && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'ko' ? '캡션이 성공적으로 저장되었습니다!' : 'Caption saved to design request record!'}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {t('close')}
            </button>

            <div className="flex items-center gap-2">
              {request && (
                <button
                  type="button"
                  onClick={handleSaveCaption}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('saveCaption')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                className="px-4 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{t('copyAndPost')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
