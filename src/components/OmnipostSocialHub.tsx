import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Instagram, 
  Layers, 
  Calendar, 
  TrendingUp, 
  Share2, 
  Settings, 
  ExternalLink, 
  Check, 
  Plus, 
  Clock, 
  BarChart3, 
  Globe, 
  Smartphone, 
  Eye, 
  ShieldCheck, 
  Filter,
  Image as ImageIcon,
  Video,
  ChevronRight,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  OmnipostService, 
  getOmnipostConfig, 
  saveOmnipostConfig, 
  DEFAULT_OMNIPOST_CONFIG 
} from '../services/omnipostService.ts';
import { 
  OmnipostAccountInfo, 
  OmnipostChannel, 
  OmnipostPost, 
  OmnipostInsightsSummary,
  OmnipostConfig
} from '../types.ts';
import { OmnipostPublishModal } from './OmnipostPublishModal.tsx';
import { ConnectSocialAccountModal } from './ConnectSocialAccountModal.tsx';

export const OmnipostSocialHub: React.FC = () => {
  const { 
    themeColors, 
    whitelabelConfig, 
    simulatedDate, 
    activeTenantSlug, 
    designRequests, 
    addActivity,
    language,
    isHQ,
    currentUser
  } = usePortal();

  const isKo = language === 'ko';

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'compose' | 'history' | 'insights' | 'settings'>('overview');
  
  // Omnipost API Data
  const [accountInfo, setAccountInfo] = useState<OmnipostAccountInfo | null>(null);
  const [channels, setChannels] = useState<OmnipostChannel[]>([]);
  const [posts, setPosts] = useState<OmnipostPost[]>([]);
  const [insights, setInsights] = useState<OmnipostInsightsSummary | null>(null);
  const [postsByDay, setPostsByDay] = useState<Array<{ date: string; count: number }>>([]);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'checking' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Settings Form State
  const [configForm, setConfigForm] = useState<OmnipostConfig>(() => getOmnipostConfig(activeTenantSlug));
  
  // Compose Quick Post
  const [composeContent, setComposeContent] = useState('');
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMediaUrl, setComposeMediaUrl] = useState('');
  const [composeSelectedChannels, setComposeSelectedChannels] = useState<string[]>([]);
  const [composePublishNow, setComposePublishNow] = useState(true);
  const [composeScheduleTime, setComposeScheduleTime] = useState(`${simulatedDate}T12:00`);
  const [isPublishingCompose, setIsPublishingCompose] = useState(false);

  // History Filter
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'published' | 'scheduled' | 'draft' | 'failed'>('all');

  // Modal State for Quick Publishing from Approved Design
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedDesignForPublish, setSelectedDesignForPublish] = useState<any>(null);

  useEffect(() => {
    fetchOmnipostData();
  }, [activeTenantSlug]);

  const fetchOmnipostData = async () => {
    setIsLoading(true);
    setApiStatus('checking');
    setErrorMessage(null);

    const config = getOmnipostConfig(activeTenantSlug);
    setConfigForm(config);

    try {
      // 1. Fetch Account Info from backend
      const accRes = await OmnipostService.getAccountInfo(config.apiUrl, config.apiToken);
      if (accRes.success && accRes.data) {
        setAccountInfo(accRes.data);
        setApiStatus('connected');
      } else {
        setApiStatus('error');
        setErrorMessage(accRes.error || (isKo ? '자동 발행 엔진 연결 실패' : 'Failed to connect to auto-post engine.'));
      }

      // 2. Fetch Channels (Check per-brand stored channels + live API channels)
      const chanRes = await OmnipostService.getChannels(config.apiUrl, config.apiToken);
      let loadedChannels: OmnipostChannel[] = [];

      if (chanRes.success && chanRes.data && chanRes.data.length > 0) {
        loadedChannels = chanRes.data;
      }

      // Load brand-specific stored channels from localStorage
      const brandChannelKey = `smp_b_${activeTenantSlug}_channels`;
      const savedBrandChannelsRaw = localStorage.getItem(brandChannelKey);
      if (savedBrandChannelsRaw) {
        try {
          const parsed: OmnipostChannel[] = JSON.parse(savedBrandChannelsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge with API channels avoiding duplicates
            const map = new Map<string, OmnipostChannel>();
            parsed.forEach(c => map.set(c.id, c));
            loadedChannels.forEach(c => map.set(c.id, c));
            loadedChannels = Array.from(map.values());
          }
        } catch (e) {
          console.error('Error parsing brand channels', e);
        }
      }

      // If no channels connected yet for this brand, provide starter default official channels
      if (loadedChannels.length === 0) {
        const defaultBrandChannels: OmnipostChannel[] = [
          {
            id: `chan-ig-${activeTenantSlug}`,
            name: `${whitelabelConfig.brand_name} Instagram`,
            platform: 'instagram',
            handle: `@${activeTenantSlug}.official`,
            is_active: true,
            followers_count: 0
          },
          {
            id: `chan-tt-${activeTenantSlug}`,
            name: `${whitelabelConfig.brand_name} TikTok`,
            platform: 'tiktok',
            handle: `@${activeTenantSlug}.tiktok`,
            is_active: true,
            followers_count: 0
          },
          {
            id: `chan-fb-${activeTenantSlug}`,
            name: `${whitelabelConfig.brand_name} Facebook`,
            platform: 'facebook',
            handle: `${whitelabelConfig.brand_name} Official`,
            is_active: true,
            followers_count: 0
          }
        ];
        loadedChannels = defaultBrandChannels;
        localStorage.setItem(brandChannelKey, JSON.stringify(defaultBrandChannels));
      }

      setChannels(loadedChannels);
      if (composeSelectedChannels.length === 0 && loadedChannels.length > 0) {
        setComposeSelectedChannels([loadedChannels[0].id]);
      }

      // 3. Fetch Posts
      const postRes = await OmnipostService.getPosts(undefined, config.apiUrl, config.apiToken);
      if (postRes.success && postRes.data) {
        const items = postRes.data.items || [];
        if (items.length > 0) {
          setPosts(items);
        } else {
          // Pre-populate sample posts
          setPosts([
            {
              id: 'post-op-01',
              title: isKo ? '신메뉴 출시 기념 스페셜 프로모션' : 'Grand Special Menu Launch Campaign',
              content: `🔥 SPESIAL HARI INI DI ${whitelabelConfig.brand_name.toUpperCase()}! Nikmati menu signature hemat 20% serentak di seluruh outlet cabang! #Kuliner #${activeTenantSlug}`,
              media_urls: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'],
              channel_ids: [loadedChannels[0]?.id || 'chan-ig'],
              status: 'published',
              published_at: `${simulatedDate} 10:30`,
              created_at: `${simulatedDate} 09:00`,
              insights: { likes: 1420, comments: 88, shares: 195, views: 18500 }
            },
            {
              id: 'post-op-02',
              title: isKo ? '매일 아침 공수되는 신선한 재료 비하인드' : 'Behind The Scenes: Fresh Ingredients Every Morning',
              content: `Rahasia kenikmatan di setiap sajian ${whitelabelConfig.brand_name} adalah bahan baku segar pilihan terbaik! 🥗✨ #KitchenStories #${activeTenantSlug}`,
              media_urls: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
              channel_ids: [loadedChannels[0]?.id || 'chan-ig'],
              status: 'scheduled',
              scheduled_at: `${simulatedDate} 18:00`,
              created_at: `${simulatedDate} 11:00`
            }
          ]);
        }
      }

      // 4. Fetch Insights Summary
      const insRes = await OmnipostService.getInsightsSummary(config.apiUrl, config.apiToken);
      if (insRes.success && insRes.data) {
        setInsights(insRes.data);
      } else {
        setInsights({
          total: 18,
          published: 14,
          scheduled: 3,
          draft: 1,
          failed: 0,
          channelCount: loadedChannels.length,
          publishRate: 94.5
        });
      }

      // 5. Fetch Posts By Day Trend
      const dayRes = await OmnipostService.getInsightsPostsByDay(7, config.apiUrl, config.apiToken);
      if (dayRes.success && dayRes.data) {
        setPostsByDay(dayRes.data);
      } else {
        setPostsByDay([
          { date: '2026-09-20', count: 2 },
          { date: '2026-09-21', count: 3 },
          { date: '2026-09-22', count: 4 },
          { date: '2026-09-23', count: 2 },
          { date: '2026-09-24', count: 5 },
          { date: '2026-09-25', count: 3 },
          { date: '2026-09-26', count: 4 }
        ]);
      }

    } catch (err: any) {
      setApiStatus('error');
      setErrorMessage(err.message || (isKo ? '소셜 미디어 데이터를 불러오는 중 오류가 발생했습니다.' : 'Error loading social media data.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectChannel = (channelId: string, channelHandle: string) => {
    if (!confirm(isKo ? `[${channelHandle}] 소셜 미디어 계정 연결을 해제하시겠습니까?` : `Disconnect social media account [${channelHandle}]?`)) {
      return;
    }

    const updated = channels.filter(c => c.id !== channelId);
    setChannels(updated);

    const brandChannelKey = `smp_b_${activeTenantSlug}_channels`;
    localStorage.setItem(brandChannelKey, JSON.stringify(updated));

    setSuccessToast(isKo ? `계정 [${channelHandle}] 연결이 해제되었습니다.` : `Account [${channelHandle}] disconnected.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveOmnipostConfig(configForm, activeTenantSlug);
    setSuccessToast(isKo ? 'API 설정이 성공적으로 저장되었습니다!' : 'API configuration saved successfully!');
    setTimeout(() => setSuccessToast(null), 3000);
    fetchOmnipostData();
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeContent.trim()) return;
    if (composeSelectedChannels.length === 0) {
      alert(isKo ? '최소 1개 이상의 대상 소셜 미디어 채널을 선택해주세요!' : 'Please select at least 1 target social media channel!');
      return;
    }

    setIsPublishingCompose(true);
    const config = getOmnipostConfig(activeTenantSlug);

    const payload = {
      content: composeContent.trim(),
      mediaUrls: composeMediaUrl.trim() ? [composeMediaUrl.trim()] : undefined,
      channelIds: composeSelectedChannels,
      publishNow: composePublishNow,
      scheduledAt: !composePublishNow ? composeScheduleTime : undefined,
      title: composeTitle.trim() || undefined
    };

    try {
      const res = await OmnipostService.createPost(payload, config.apiUrl, config.apiToken);
      
      const newPost: OmnipostPost = {
        id: res.data?.id || `post-soc-${Date.now()}`,
        title: composeTitle.trim() || (isKo ? '신규 게시물' : 'Quick Post'),
        content: composeContent.trim(),
        media_urls: composeMediaUrl.trim() ? [composeMediaUrl.trim()] : [],
        channel_ids: composeSelectedChannels,
        status: composePublishNow ? 'published' : 'scheduled',
        published_at: composePublishNow ? `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : undefined,
        scheduled_at: !composePublishNow ? composeScheduleTime : undefined,
        created_at: `${simulatedDate} 12:00`
      };

      setPosts([newPost, ...posts]);
      setComposeContent('');
      setComposeTitle('');
      setComposeMediaUrl('');
      setSuccessToast(composePublishNow 
        ? (isKo ? '게시물이 소셜 미디어로 성공적으로 발행되었습니다!' : 'Post published to social media successfully!') 
        : (isKo ? '게시물 발행 일정이 저장되었습니다!' : 'Post scheduled successfully!'));
      setTimeout(() => setSuccessToast(null), 3500);

      addActivity({
        user_name: currentUser.full_name,
        action_type: 'promo_campaign_active',
        title: isKo 
          ? `🚀 SNS 자동 발행: ${composeTitle || '새 게시물'}` 
          : `🚀 Auto-Post: ${composeTitle || 'Quick Post'}`,
        description: isKo 
          ? `${composeSelectedChannels.length}개 채널로 전달되었습니다 (${composePublishNow ? '즉시 발행' : '예약'}).`
          : `Dispatched to ${composeSelectedChannels.length} channels (${composePublishNow ? 'Instant' : 'Scheduled'}).`,
        severity: 'success',
        link_tab: 'omnipost'
      });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsPublishingCompose(false);
    }
  };

  // Approved design requests ready for Auto-Publishing
  const approvedDesigns = designRequests.filter(
    (req) => req.status === 'approved' || req.status === 'in_progress' || (req.asset_result_url && req.caption)
  );

  const filteredPosts = posts.filter((p) => {
    if (historyStatusFilter === 'all') return true;
    return p.status === historyStatusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Banner & Auto-Post Engine Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isKo ? '멀티채널 자동 발행' : 'Multi-Channel Auto-Post'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isKo ? '소셜 미디어 자동 발행 허브' : 'Social Media Auto-Publishing Hub'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isKo 
                ? `${whitelabelConfig.brand_name}의 승인된 디자인 및 영상 콘텐츠를 인스타그램, 틱톡, 페이스북 등 여러 채널로 원클릭 자동 발행합니다.` 
                : `Automatically publish approved creative designs and video content from ${whitelabelConfig.brand_name} directly to Instagram, TikTok, Facebook, and multi-channels centrally.`}
            </p>
          </div>

          {/* Engine Status Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 w-full lg:w-auto min-w-[280px] space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-medium">{isKo ? '엔진 상태:' : 'Engine Status:'}</span>
              <div className="flex items-center gap-1.5">
                {apiStatus === 'connected' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {isKo ? '발행 준비 완료 (Active)' : 'Ready to Publish (Active)'}
                  </span>
                ) : apiStatus === 'checking' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px]">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {isKo ? '확인 중...' : 'Checking...'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold text-[11px]">
                    <AlertCircle className="w-3 h-3" />
                    {isKo ? '오프라인' : 'Offline'}
                  </span>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>{isKo ? '서비스:' : 'Service:'}</span>
                <span className="text-slate-200 font-bold">mediasocial.team Auto-Post</span>
              </div>
              <div className="flex justify-between">
                <span>{isKo ? '연결된 채널:' : 'Active Channels:'}</span>
                <span className="text-orange-400 font-bold">
                  {channels.length} {isKo ? '개 채널' : 'Channels'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={fetchOmnipostData}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isKo ? '소셜 계정 동기화' : 'Sync Social Accounts'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isKo ? '개요 & 자동 발행' : 'Overview & Auto-Post'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('compose')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'compose'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isKo ? '게시물 작성' : 'Post Composer'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isKo ? `발행 내역 (${posts.length})` : `Post History (${posts.length})`}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('insights')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'insights'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isKo ? '성과 & 분석' : 'Insights & Analytics'}</span>
        </button>
      </div>

      {/* 3. SUB-TAB 1: Overview & 1-Click Publishing from Approved Creative */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {isKo ? '총 발행 완료' : 'Total Published'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {insights?.published || posts.filter(p => p.status === 'published').length}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isKo ? 'SNS 라이브' : 'Live on Social'}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {isKo ? '예약된 게시물' : 'Scheduled Posts'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
                {insights?.scheduled || posts.filter(p => p.status === 'scheduled').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{isKo ? '발행 대기 중' : 'Awaiting Schedule'}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {isKo ? '연결된 채널' : 'Connected Channels'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-orange-500 font-mono">
                {channels.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Instagram, TikTok, FB
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {isKo ? '발행 성공률' : 'Success Rate'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-500 font-mono">
                {insights?.publishRate ? `${insights.publishRate}%` : '100%'}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">
                {isKo ? '0건 실패' : '0 Failed'}
              </div>
            </div>
          </div>

          {/* Connected Social Channels Row */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-orange-500" />
                  <span>
                    {isKo ? `활성 소셜 미디어 계정 (${channels.length})` : `Active Social Media Accounts (${channels.length})`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKo 
                    ? '자동 발행 시스템에 연결된 공식 계정으로 즉시 콘텐츠가 전송됩니다.' 
                    : 'Accounts connected to the auto-post system ready to receive instant content publishing.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <a
                  href="https://my.omnipost.id/channels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isKo ? 'Omnipost 계정 연동 열기' : 'Link via Omnipost'}</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isKo ? '+ 계정 등록' : '+ Link Handle'}</span>
                </button>
              </div>
            </div>

            {/* Live API Notice if Omnipost channels are 0 */}
            {accountInfo?.channelCount === 0 && (
              <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {isKo ? '실시간 인스타그램/틱톡 API 배포 안내:' : 'Live Social API Dispatch Notice:'}
                    </span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                      {isKo 
                        ? '게시물이 워크스페이스에 정상 등록 및 스케줄링됩니다. 실제 인스타그램/틱톡 라이브 송출을 위해 my.omnipost.id/channels 에서 인스타그램 계정을 1회 연동해주세요.' 
                        : 'Posts are queued & scheduled in your workspace. For direct live API broadcast to Instagram/TikTok, connect your official accounts once in my.omnipost.id/channels.'}
                    </p>
                  </div>
                </div>

                <a
                  href="https://my.omnipost.id/channels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition"
                >
                  <span>{isKo ? '계정 연동하기' : 'Connect Account'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
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
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {ch.handle || ch.platform} {ch.followers_count ? `• ${(ch.followers_count / 1000).toFixed(1)}k followers` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Connected" />
                    <button
                      type="button"
                      onClick={() => handleDisconnectChannel(ch.id, ch.handle || ch.name)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title={isKo ? '연결 해제' : 'Disconnect'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready-to-Publish Creative Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>
                    {isKo ? '발행 준비 완료 콘텐츠 (승인된 디자인)' : 'Ready-to-Publish Content (Approved Creative)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKo 
                    ? '본사에서 승인된 디자인 및 영상 콘텐츠를 1-클릭으로 소셜 미디어에 발행합니다.' 
                    : 'Designs and videos approved by HQ team ready to publish to social media in 1-click.'}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {isKo ? `${approvedDesigns.length}건 준비 완료` : `${approvedDesigns.length} Ready`}
              </span>
            </div>

            {approvedDesigns.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {isKo ? '승인된 디자인이 없습니다. Requests Engine에서 새 디자인을 요청하세요.' : 'No approved designs yet. Request new designs in Requests Engine.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {approvedDesigns.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {req.asset_result_url || req.preview_media_url ? (
                        <img
                          src={req.asset_result_url || req.preview_media_url}
                          alt={req.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">
                          {req.category}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                            {req.category}
                          </span>
                          <span>• {isKo ? '목표일:' : 'Target:'} {req.target_date}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {req.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {req.caption || req.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400 font-mono">
                        {isKo ? '담당자:' : 'PIC:'} {req.assigned_to_name || 'Creative Staff'}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDesignForPublish(req);
                          setIsPublishModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isKo ? 'SNS로 발행' : 'Publish to Social'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: Post Composer */}
      {activeSubTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Composer Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-500" />
              <span>{isKo ? '소셜 미디어 새 게시물 작성' : 'Create New Social Media Post'}</span>
            </h3>

            <form onSubmit={handleComposeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {isKo ? '대상 계정 선택:' : 'Select Target Accounts:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {channels.map((ch) => {
                    const isSelected = composeSelectedChannels.includes(ch.id);
                    return (
                      <div
                        key={ch.id}
                        onClick={() => {
                          if (isSelected) {
                            setComposeSelectedChannels(composeSelectedChannels.filter(id => id !== ch.id));
                          } else {
                            setComposeSelectedChannels([...composeSelectedChannels, ch.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-900 dark:text-orange-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold">{ch.platform.toUpperCase()}:</span>
                          <span className="truncate">{ch.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {isKo ? '게시물 제목 (내부 메모):' : 'Post Title (Internal Memo):'}
                </label>
                <input
                  type="text"
                  placeholder={isKo ? '예: 주말 페이데이 20% 프로모션' : 'e.g. Weekend Payday Special 20% Off'}
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {isKo ? '캡션 및 소셜 미디어 본문:' : 'Caption & Social Media Content:'}
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={isKo ? '캡션, 해시태그, 프로모션 상세 정보 등을 작성하세요...' : 'Write copywriting, emojis, hashtags, call-to-action...'}
                  value={composeContent}
                  onChange={(e) => setComposeContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {isKo ? '미디어 URL (이미지 / 영상):' : 'Media Asset URL (Image / Video):'}
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or media file URL"
                  value={composeMediaUrl}
                  onChange={(e) => setComposeMediaUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-200">
                  {isKo ? '발행 시점:' : 'Publishing Time:'}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="compose_mode"
                      checked={composePublishNow}
                      onChange={() => setComposePublishNow(true)}
                    />
                    <span className="font-bold text-slate-800 dark:text-white">{isKo ? '지금 즉시 발행' : 'Publish Now'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="compose_mode"
                      checked={!composePublishNow}
                      onChange={() => setComposePublishNow(false)}
                    />
                    <span className="font-bold text-slate-800 dark:text-white">{isKo ? '예약 발행' : 'Schedule Post'}</span>
                  </label>
                </div>

                {!composePublishNow && (
                  <input
                    type="datetime-local"
                    value={composeScheduleTime}
                    onChange={(e) => setComposeScheduleTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isPublishingCompose}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer"
              >
                {isPublishingCompose ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isKo ? '발행 처리 중...' : 'Publishing...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{composePublishNow ? (isKo ? 'SNS로 즉시 발행하기' : 'Publish to Social Media Now') : (isKo ? '예약 일정 저장하기' : 'Save Social Schedule')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Live Social Media Preview */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs flex flex-col items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white w-full flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-500" />
              <span>{isKo ? '실시간 소셜 미디어 미리보기' : 'Live Social Media Mockup Preview'}</span>
            </h3>

            {/* Instagram / TikTok Phone Mockup Card */}
            <div className="w-full max-w-[320px] bg-slate-950 text-white rounded-3xl border border-slate-800 p-4 shadow-2xl space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center font-bold text-[10px]">
                    {whitelabelConfig.brand_monogram}
                  </div>
                  <span className="font-bold text-xs">@{activeTenantSlug}.official</span>
                </div>
                <span className="text-[10px] text-orange-400 font-bold">Auto-Post</span>
              </div>

              {/* Media Preview Box */}
              <div className="w-full h-52 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                {composeMediaUrl ? (
                  <img src={composeMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4 text-slate-600 text-xs">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span>{isKo ? '선택된 이미지/영상이 없습니다' : 'No media asset selected yet'}</span>
                  </div>
                )}
              </div>

              {/* Caption Preview Box */}
              <div className="text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-white">
                  @{activeTenantSlug}.official <span className="font-normal text-slate-300">{composeContent || (isKo ? '왼쪽 양식에 캡션을 입력하면 여기에 실시간으로 표시됩니다...' : 'Type caption on the left form to see live preview here...')}</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  {simulatedDate} • via Auto-Post Publisher
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 5. SUB-TAB 3: History */}
      {activeSubTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{isKo ? '소셜 미디어 발행 기록 로그' : 'Social Media Publishing History'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKo ? '임시저장, 예약 발행 및 라이브 게시물 상태' : 'Status of draft, scheduled, and published live posts.'}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
              {(['all', 'published', 'scheduled', 'failed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setHistoryStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl capitalize transition cursor-pointer ${
                    historyStatusFilter === st
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="py-3 px-3">{isKo ? '콘텐츠 & 미디어' : 'Content & Media'}</th>
                  <th className="py-3 px-3">{isKo ? '채널' : 'Channels'}</th>
                  <th className="py-3 px-3">{isKo ? '일시' : 'Date & Time'}</th>
                  <th className="py-3 px-3">{isKo ? '상태' : 'Status'}</th>
                  <th className="py-3 px-3 text-right">{isKo ? '반응 지표' : 'Engagement'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        {post.media_urls && post.media_urls[0] && (
                          <img
                            src={post.media_urls[0]}
                            alt="Media"
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        )}
                        <div className="min-w-0">
                          {post.title && <div className="font-bold text-slate-900 dark:text-white truncate">{post.title}</div>}
                          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-[11px]">
                            {post.content}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {post.channel_ids.map((cid, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                            {cid.includes('ig') ? 'Instagram' : cid.includes('tt') ? 'TikTok' : 'Channel'}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {post.published_at || post.scheduled_at || post.created_at}
                    </td>

                    <td className="py-3 px-3">
                      {post.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      ) : post.status === 'scheduled' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                          <Clock className="w-3 h-3" />
                          Scheduled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-[10px]">
                          <AlertCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {post.insights ? (
                        <div>
                          <strong>{post.insights.likes?.toLocaleString()}</strong> likes • <strong>{post.insights.views?.toLocaleString()}</strong> views
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 4: Insights & Performance */}
      {activeSubTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span>{isKo ? '일별 발행 활동 (최근 7일)' : 'Daily Publishing Activity (Last 7 Days)'}</span>
            </h3>

            <div className="space-y-3 pt-2">
              {postsByDay.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono text-slate-500 dark:text-slate-400">
                    <span>{item.date}</span>
                    <strong className="text-slate-900 dark:text-white">{item.count} {isKo ? '건' : 'Posts'}</strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, item.count * 20)}%` }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span>{isKo ? '소셜 미디어 채널 분포' : 'Social Media Channel Distribution'}</span>
            </h3>

            <div className="space-y-3 pt-2">
              {channels.map((ch, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center">
                      {ch.platform.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{ch.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ch.handle}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-bold text-emerald-600">Active</div>
                    <div className="text-[10px] text-slate-400">{ch.followers_count?.toLocaleString()} Followers</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Publishing Modal */}
      <OmnipostPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setSelectedDesignForPublish(null);
        }}
        designRequest={selectedDesignForPublish}
        onPublishedSuccess={() => {
          fetchOmnipostData();
        }}
      />

      {/* In-App Direct Social Media Connect Wizard */}
      <ConnectSocialAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onAccountConnected={(newChan) => {
          setChannels(prev => [...prev.filter(c => c.handle !== newChan.handle), newChan]);
          setIsConnectModalOpen(false);
          setSuccessToast(isKo 
            ? `[${newChan.handle}] (${newChan.platform.toUpperCase()}) 계정이 ${whitelabelConfig.brand_name}에 연결되었습니다!` 
            : `Account ${newChan.handle} (${newChan.platform.toUpperCase()}) successfully connected for ${whitelabelConfig.brand_name}!`);
          setTimeout(() => setSuccessToast(null), 3500);
        }}
      />

    </div>
  );
};
