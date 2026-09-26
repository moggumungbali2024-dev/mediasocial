import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  ArrowRight,
  Share2,
  Lock,
  Globe,
  KeyRound,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { usePortal } from '../context/PortalContext.tsx';
import { OmnipostChannel, SocialPlatform } from '../types.ts';

interface ConnectSocialAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (channel: OmnipostChannel) => void;
}

export const ConnectSocialAccountModal: React.FC<ConnectSocialAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountConnected
}) => {
  const { 
    whitelabelConfig, 
    activeTenantSlug, 
    themeColors, 
    simulatedDate, 
    addActivity, 
    currentUser,
    language 
  } = usePortal();

  const isKo = language === 'ko';

  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [connectionMethod, setConnectionMethod] = useState<'direct' | 'omnipost' | 'custom_oauth'>('direct');
  const [handle, setHandle] = useState(`@${activeTenantSlug}.official`);
  const [accountName, setAccountName] = useState(`${whitelabelConfig.brand_name} Official`);
  const [customMetaAppId, setCustomMetaAppId] = useState('');
  const [followersCount, setFollowersCount] = useState<number | ''>('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'form' | 'authorizing' | 'success'>('form');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Direct Handle Connection (Recommended & Instant)
  const handleDirectConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) {
      setErrorMessage(isKo ? '계정 핸들/아이디를 입력해주세요.' : 'Please enter the account handle/username.');
      return;
    }

    setErrorMessage(null);
    setIsAuthenticating(true);
    setAuthStep('authorizing');

    setTimeout(() => {
      const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
      const actualFollowers = typeof followersCount === 'number' && followersCount >= 0 
        ? followersCount 
        : 0;

      const newChannel: OmnipostChannel = {
        id: `chan-${platform}-${activeTenantSlug}-${Date.now().toString().slice(-4)}`,
        name: accountName.trim() || `${whitelabelConfig.brand_name} ${platform.toUpperCase()}`,
        platform,
        handle: cleanHandle,
        is_active: true,
        followers_count: actualFollowers,
        created_at: simulatedDate
      };

      // Save to per-brand storage
      const storageKey = `smp_b_${activeTenantSlug}_channels`;
      try {
        const existingRaw = localStorage.getItem(storageKey);
        const existing: OmnipostChannel[] = existingRaw ? JSON.parse(existingRaw) : [];
        const updated = [...existing.filter(c => c.handle !== cleanHandle), newChannel];
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving channel to local storage', err);
      }

      addActivity({
        user_name: currentUser.full_name,
        action_type: 'promo_campaign_active',
        title: isKo 
          ? `🔗 ${platform.toUpperCase()} 계정 연결 완료: ${cleanHandle}` 
          : `🔗 ${platform.toUpperCase()} Account Connected: ${cleanHandle}`,
        description: isKo
          ? `${whitelabelConfig.brand_name} 브랜드 전용으로 ${cleanHandle} 계정이 등록되었습니다.`
          : `Social account ${cleanHandle} linked exclusively for ${whitelabelConfig.brand_name}.`,
        severity: 'success',
        link_tab: 'omnipost'
      });

      setIsAuthenticating(false);
      setAuthStep('success');
      onAccountConnected(newChannel);
    }, 600);
  };

  // 2. Official Portal Connection
  const handleOpenOmnipostPortal = () => {
    window.open('https://my.omnipost.id/channels', '_blank');
    setAuthStep('form');
  };

  // 3. Custom Meta App OAuth
  const handleCustomMetaOAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMetaAppId.trim()) {
      setErrorMessage(isKo ? 'Meta App ID를 입력해주세요.' : 'Please enter your Meta App ID.');
      return;
    }

    const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(customMetaAppId.trim())}&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish&response_type=code`;
    window.open(oauthUrl, 'SocialAuthPopup', 'width=600,height=750,menubar=no,toolbar=no');
  };

  const handleClose = () => {
    setAuthStep('form');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div 
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-md"
            >
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isKo 
                  ? `소셜 미디어 계정 연결 (${whitelabelConfig.brand_name})` 
                  : `Connect Social Media Account (${whitelabelConfig.brand_name})`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKo 
                  ? '인스타그램, 틱톡, 페이스북 계정을 브랜드 워크스페이스에 등록합니다.' 
                  : 'Link Instagram, TikTok, and Facebook accounts to your brand workspace.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {errorMsgContent(errorMessage)}

          {authStep === 'form' && (
            <div className="space-y-4 text-xs">
              
              {/* Platform Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  {isKo ? '소셜 미디어 플랫폼 선택:' : 'Select Social Media Platform:'}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => {
                      setPlatform('instagram');
                      setHandle(`@${activeTenantSlug}.official`);
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      platform === 'instagram'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-200 font-bold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      IG
                    </div>
                    <div>
                      <div className="font-bold text-xs">{isKo ? '인스타그램 비즈니스' : 'Instagram Business'}</div>
                      <div className="text-[10px] opacity-70">Feed, Reels, Story</div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setPlatform('tiktok');
                      setHandle(`@${activeTenantSlug}.official`);
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      platform === 'tiktok'
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-slate-400 text-slate-900 dark:text-white font-bold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                      TT
                    </div>
                    <div>
                      <div className="font-bold text-xs">{isKo ? '틱톡 브랜드 계정' : 'TikTok Brand'}</div>
                      <div className="text-[10px] opacity-70">Short Video & Viral</div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setPlatform('facebook');
                      setHandle(`${whitelabelConfig.brand_name} Official`);
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      platform === 'facebook'
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      FB
                    </div>
                    <div>
                      <div className="font-bold text-xs">{isKo ? '페이스북 페이지' : 'Facebook Page'}</div>
                      <div className="text-[10px] opacity-70">Fanpage & Post</div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setPlatform('youtube');
                      setHandle(`${whitelabelConfig.brand_name} Official`);
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      platform === 'youtube'
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-900 dark:text-red-200 font-bold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      YT
                    </div>
                    <div>
                      <div className="font-bold text-xs">{isKo ? '유튜브 쇼츠' : 'YouTube Shorts'}</div>
                      <div className="text-[10px] opacity-70">Channel & Shorts</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Mode Toggle */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setConnectionMethod('direct')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    connectionMethod === 'direct'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isKo ? '🚀 직접 계정 연결 (추천)' : '🚀 Direct Account Link (Instant)'}
                </button>
                <button
                  type="button"
                  onClick={() => setConnectionMethod('custom_oauth')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    connectionMethod === 'custom_oauth'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isKo ? 'Meta App ID 설정' : 'Custom Meta App ID'}
                </button>
              </div>

              {/* MODE 1: DIRECT ACCOUNT LINK */}
              {connectionMethod === 'direct' && (
                <form onSubmit={handleDirectConnect} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {isKo ? '계정 핸들 / 아이디 (Username):' : 'Account Handle / Username:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@moggumung.official"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {isKo ? '채널 표시 이름:' : 'Channel Display Label:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isKo ? '예: 모구멍 공식 인스타그램' : 'e.g. Moggumung Official Instagram'}
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {isKo ? '실제 팔로워 수 (선택):' : 'Actual Followers Count (Optional):'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 54200"
                      value={followersCount}
                      onChange={(e) => setFollowersCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  {/* Isolation Security Badge */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isKo ? '브랜드 독립 보안 보장' : 'Guaranteed Brand Workspace Isolation'}</span>
                    </div>
                    <p>
                      {isKo 
                        ? `이 소셜 계정은 /${activeTenantSlug} 워크스페이스 전용으로 안전하게 격리 저장됩니다.`
                        : `This account is securely isolated for /${activeTenantSlug} workspace.`}
                    </p>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                    className="w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-90 active:scale-95 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isKo ? '소셜 미디어 계정 즉시 등록' : 'Save & Link Social Account'}</span>
                  </button>
                </form>
              )}

              {/* MODE 2: CUSTOM META APP ID */}
              {connectionMethod === 'custom_oauth' && (
                <form onSubmit={handleCustomMetaOAuth} className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isKo ? 'Meta Developers App ID 안내' : 'About Meta Developers App ID'}</span>
                    </div>
                    <p>
                      {isKo 
                        ? 'Facebook OAuth 대화상자를 직접 열려면 developers.facebook.com 에 등록된 실제 Meta App ID가 필요합니다.' 
                        : 'Direct Facebook OAuth dialogs require a valid registered App ID from developers.facebook.com.'}
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Meta App ID (Facebook App ID):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 192837465928172"
                      value={customMetaAppId}
                      onChange={(e) => setCustomMetaAppId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                    className="w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-90 active:scale-95 transition cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isKo ? 'Meta OAuth 로그인 실행' : 'Launch Custom Meta OAuth'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          )}

          {authStep === 'authorizing' && (
            <div className="py-10 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin flex items-center justify-center bg-white dark:bg-slate-800">
                  <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isKo 
                    ? `${platform.toUpperCase()} 계정 연결 및 검증 중...` 
                    : `Linking and Verifying ${platform.toUpperCase()} Account...`}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isKo 
                    ? `[${handle}] 계정의 자동 발행 채널 등록을 처리하고 있습니다.` 
                    : `Registering auto-publish channel for ${handle}.`}
                </p>
              </div>
            </div>
          )}

          {authStep === 'success' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isKo 
                    ? `${platform.toUpperCase()} 계정 등록 완료!` 
                    : `${platform.toUpperCase()} Account Successfully Connected!`}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isKo 
                    ? `[${handle}] 계정이 ${whitelabelConfig.brand_name} 소셜 허브에 정상 등록되었습니다. 이제 승인된 콘텐츠를 1-클릭으로 자동 발행할 수 있습니다.` 
                    : `Account [${handle}] is now active for ${whitelabelConfig.brand_name}. You can now auto-publish approved creative content with 1-click.`}
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer hover:opacity-90 transition"
                >
                  {isKo ? '완료 및 허브로 돌아가기' : 'Done & Return to Social Hub'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

function errorMsgContent(errorMessage: string | null) {
  if (!errorMessage) return null;
  return (
    <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
      <div>{errorMessage}</div>
    </div>
  );
}
