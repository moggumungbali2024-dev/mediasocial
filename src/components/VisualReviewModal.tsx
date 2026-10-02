import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import { DesignRequest, VisualPinAnnotation, DeliverableVersion } from '../types.ts';
import { calculateDesignSla } from '../utils/slaCalculator.ts';
import {
  X,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Tag,
  Trash2,
  Send,
  Eye,
  EyeOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Columns,
  Maximize2,
  Download,
  Upload,
  AlertTriangle,
  Flame,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface VisualReviewModalProps {
  request: DesignRequest;
  onClose: () => void;
}

export const VisualReviewModal: React.FC<VisualReviewModalProps> = ({ request, onClose }) => {
  const {
    currentUser,
    language,
    themeColors,
    addPinAnnotation,
    togglePinResolution,
    deletePinAnnotation,
    addDeliverableVersion,
    updateDesignRequestStatus,
    updateDesignRequestDeliverable
  } = usePortal();

  const isKo = language === 'ko';

  // Active view tab: 'annotation' | 'slider' | 'side_by_side'
  const [activeTab, setActiveTab] = useState<'annotation' | 'slider' | 'side_by_side'>('annotation');

  // Annotation Mode State
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [pinFilter, setPinFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // Pending Pin click position
  const [pendingPinCoords, setPendingPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [pendingComment, setPendingComment] = useState('');
  const [pendingTag, setPendingTag] = useState<string>('General');

  // Before/After Slider State
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 - 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // New Version Upload Drawer/Modal
  const [isUploadVersionOpen, setIsUploadVersionOpen] = useState(false);
  const [newVersionUrl, setNewVersionUrl] = useState('');
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('');

  // Selected Version for comparison
  const versions: DeliverableVersion[] = request.deliverable_versions || [];
  const defaultBeforeUrl = versions.length > 1
    ? versions[0].media_url
    : (request.asset_result_url || request.preview_media_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80');
  
  const defaultAfterUrl = request.preview_media_url || request.asset_result_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80';

  const [compareBeforeUrl, setCompareBeforeUrl] = useState<string>(defaultBeforeUrl);
  const [compareAfterUrl, setCompareAfterUrl] = useState<string>(defaultAfterUrl);

  const activeArtworkUrl = request.preview_media_url || request.asset_result_url || defaultAfterUrl;

  const pins = request.pin_annotations || [];
  const openPins = pins.filter((p) => !p.resolved);
  const resolvedPins = pins.filter((p) => p.resolved);

  const filteredPins = pins.filter((p) => {
    if (pinFilter === 'open') return !p.resolved;
    if (pinFilter === 'resolved') return p.resolved;
    return true;
  });

  const slaInfo = calculateDesignSla(request, language);

  const TAG_OPTIONS = [
    { label: isKo ? '가격 수정' : 'Price', value: 'Price', color: 'bg-amber-500 text-white' },
    { label: isKo ? '로고 위치' : 'Logo', value: 'Logo', color: 'bg-indigo-500 text-white' },
    { label: isKo ? '텍스트/오타' : 'Typo', value: 'Typo', color: 'bg-sky-500 text-white' },
    { label: isKo ? '색상 조정' : 'Color', value: 'Color', color: 'bg-rose-500 text-white' },
    { label: isKo ? '이미지 교체' : 'Asset', value: 'Asset', color: 'bg-emerald-500 text-white' },
    { label: isKo ? '일반 의견' : 'General', value: 'General', color: 'bg-slate-700 text-white' }
  ];

  // Image Click Handler for dropping pins
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinModeActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setPendingPinCoords({ x, y });
    setPendingComment('');
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPinCoords || !pendingComment.trim()) return;

    addPinAnnotation(request.id, {
      x_percent: pendingPinCoords.x,
      y_percent: pendingPinCoords.y,
      comment: pendingComment.trim(),
      tag: pendingTag
    });

    setPendingPinCoords(null);
    setPendingComment('');
  };

  // Slider Mouse Move / Touch Move Handlers
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDraggingSlider(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };

    if (isDraggingSlider) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDraggingSlider]);

  const handleUploadNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionUrl.trim()) return;

    addDeliverableVersion(request.id, {
      media_url: newVersionUrl.trim(),
      title: newVersionTitle.trim() || undefined,
      change_notes: newVersionNotes.trim() || undefined
    });

    setCompareAfterUrl(newVersionUrl.trim());
    setIsUploadVersionOpen(false);
    setNewVersionUrl('');
    setNewVersionTitle('');
    setNewVersionNotes('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#11131a] rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[94vh]">
        {/* ===================== MODAL HEADER ===================== */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                  {request.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {request.branch_name || 'Branch'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {request.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isKo ? 'Canva / Figma 표준 비주얼 핀 코멘트 & 버전 비교 워크플로우' : 'Canva / Figma standard visual pin annotations & before-after version diff'}
              </p>
            </div>
          </div>

          {/* Right Header: SLA Badge & Close */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* SLA Badge */}
            <div
              className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-2xs ${slaInfo.colorClass.bg} ${slaInfo.colorClass.border} ${slaInfo.colorClass.text}`}
              title={slaInfo.badgeSubtext}
            >
              <div className={`w-2 h-2 rounded-full ${slaInfo.colorClass.dot}`} />
              <Clock className="w-3.5 h-3.5" />
              <span>{slaInfo.badgeText}</span>
            </div>

            {/* Quick Status Action (Approve / Revision) */}
            {request.status !== 'approved' && (
              <button
                type="button"
                onClick={() => {
                  updateDesignRequestStatus(request.id, 'approved', request.asset_result_url, 'Approved via Visual Review', 'self_approved');
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isKo ? '결과물 승인' : 'Approve'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================== VIEW SWITCHER TABS ===================== */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131a] flex items-center justify-between gap-3 text-xs shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('annotation')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'annotation'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isKo ? '핀 코멘트 & 리뷰' : 'Pin Annotations'}</span>
              {openPins.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {openPins.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slider')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'slider'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isKo ? '비포 / 애프터 슬라이더' : 'Before / After Slider'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('side_by_side')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'side_by_side'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isKo ? '양방향 분할 비교' : 'Side-by-Side'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload New Version Button */}
            <button
              type="button"
              onClick={() => setIsUploadVersionOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-bold transition flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 cursor-pointer text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isKo ? '+ 새 수정 버전 업로드' : '+ Upload Revision (V2)'}</span>
            </button>

            {/* Direct Open Asset Link */}
            {activeArtworkUrl && (
              <a
                href={activeArtworkUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                title="Download / Open Full Artwork"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* ===================== TAB 1: PIN ANNOTATION MODE ===================== */}
        {activeTab === 'annotation' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Visual Canvas Area */}
            <div className="flex-1 bg-slate-900/95 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
              {/* Toolbar floating above image */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2 pointer-events-auto">
                <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-white text-xs shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPinModeActive(!isPinModeActive);
                      setPendingPinCoords(null);
                    }}
                    className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isPinModeActive
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isPinModeActive ? (isKo ? '📌 핀 추가 모드 (ON)' : '📌 Pin Mode Active') : (isKo ? '📌 핀 추가 모드 켜기' : '📌 Add Pin Annotation')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title={showPins ? 'Hide Pins' : 'Show Pins'}
                  >
                    {showPins ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[11px] text-slate-400 border-l border-white/10 pl-2">
                    {pins.length} {isKo ? '개 코멘트' : 'Pins'} ({openPins.length} {isKo ? '미해결' : 'Open'})
                  </span>
                </div>

                {isPinModeActive && (
                  <div className="bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce flex items-center gap-1">
                    <span>{isKo ? '👇 이미지 원하는 위치를 클릭하세요' : '👇 Click anywhere on the visual to drop a pin'}</span>
                  </div>
                )}
              </div>

              {/* Artwork Container */}
              <div
                onClick={handleImageClick}
                className={`relative max-w-full max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${
                  isPinModeActive ? 'cursor-crosshair ring-2 ring-amber-500/50' : 'cursor-default'
                }`}
              >
                <img
                  src={activeArtworkUrl}
                  alt={request.title}
                  className="max-h-[75vh] w-auto object-contain block pointer-events-none"
                />

                {/* Render Existing Pins */}
                {showPins &&
                  pins.map((pin) => {
                    const isSelected = selectedPinId === pin.id;
                    return (
                      <div
                        key={pin.id}
                        style={{ left: `${pin.x_percent}%`, top: `${pin.y_percent}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPinId(isSelected ? null : pin.id);
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-200 cursor-pointer ${
                          isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                        }`}
                      >
                        {/* Pin Dot */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-xl border-2 ${
                            pin.resolved
                              ? 'bg-slate-600 text-slate-200 border-white/60'
                              : 'bg-rose-600 text-white border-white animate-pulse'
                          }`}
                        >
                          {pin.resolved ? <Check className="w-3.5 h-3.5" /> : pin.pin_number}
                        </div>

                        {/* Hover/Selected Tooltip Bubble */}
                        {isSelected && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-8 top-0 w-64 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-white/20 text-xs z-40 space-y-2 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-400 flex items-center gap-1">
                                <span>Pin #{pin.pin_number}</span>
                                {pin.tag && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-300">
                                    {pin.tag}
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400">{pin.created_at}</span>
                            </div>

                            <p className="text-slate-200 leading-relaxed font-medium">{pin.comment}</p>

                            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">{pin.author_name}</span>
                              <button
                                type="button"
                                onClick={() => togglePinResolution(request.id, pin.id)}
                                className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                                  pin.resolved
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-white/10 hover:bg-emerald-600 hover:text-white'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>{pin.resolved ? (isKo ? '해결됨' : 'Resolved') : (isKo ? '해결 완료로 표시' : 'Mark Resolved')}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Pending Pin Dropper Form */}
                {pendingPinCoords && (
                  <div
                    style={{ left: `${pendingPinCoords.x}%`, top: `${pendingPinCoords.y}%` }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-40 w-72 bg-white dark:bg-[#1a1c26] text-slate-900 dark:text-white p-4 rounded-3xl shadow-2xl border-2 border-amber-500 animate-in zoom-in-95 duration-150 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isKo ? '핀 수정 요청 추가' : 'New Revision Pin'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPendingPinCoords(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Tag Selector */}
                    <div className="flex flex-wrap gap-1">
                      {TAG_OPTIONS.map((tag) => (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => setPendingTag(tag.value)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            pendingTag === tag.value
                              ? tag.color
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSavePin} className="space-y-3">
                      <textarea
                        required
                        autoFocus
                        rows={3}
                        value={pendingComment}
                        onChange={(e) => setPendingComment(e.target.value)}
                        placeholder={isKo ? '예: 가격을 25,000원에서 28,000원으로 수정해주세요...' : 'e.g. Change price from 25k to 28k and make logo 15% bigger...'}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPendingPinCoords(null)}
                          className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                        >
                          {isKo ? '취소' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md cursor-pointer"
                        >
                          {isKo ? '핀 저장' : 'Save Pin'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Annotations Sidebar Panel */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15171e] flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider font-['Space_Grotesk']">
                    {isKo ? '수정 요청 핀 목록' : 'Revision Notes & Pins'}
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    {resolvedPins.length}/{pins.length} {isKo ? '완료' : 'Resolved'}
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  {(['all', 'open', 'resolved'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setPinFilter(filter)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                        pinFilter === filter
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'all' ? (isKo ? '전체' : 'All') : filter === 'open' ? (isKo ? '미해결' : 'Open') : (isKo ? '해결됨' : 'Resolved')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pin Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredPins.length === 0 ? (
                  <div className="text-center py-12 px-4 text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {isKo ? '등록된 핀 코멘트가 없습니다.' : 'No revision pins found.'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isKo
                        ? '상단의 "📌 핀 추가 모드"를 켜고 이미지 위를 클릭하여 수정 요청을 남기세요.'
                        : 'Turn on "📌 Add Pin Annotation" above and click on the visual to drop revision notes.'}
                    </p>
                  </div>
                ) : (
                  filteredPins.map((pin) => {
                    const isSelected = selectedPinId === pin.id;
                    return (
                      <div
                        key={pin.id}
                        onClick={() => setSelectedPinId(pin.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400'
                            : pin.resolved
                            ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-70'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] ${
                                pin.resolved ? 'bg-slate-400 text-white' : 'bg-rose-600 text-white'
                              }`}
                            >
                              {pin.pin_number}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {pin.author_name}
                            </span>
                            {pin.tag && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {pin.tag}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinResolution(request.id, pin.id);
                              }}
                              className={`p-1 rounded-lg transition ${
                                pin.resolved
                                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={pin.resolved ? 'Mark as Unresolved' : 'Mark as Resolved'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePinAnnotation(request.id, pin.id);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Delete Pin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p
                          className={`text-xs leading-relaxed text-slate-700 dark:text-slate-300 ${
                            pin.resolved ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {pin.comment}
                        </p>

                        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                          <span>{pin.created_at}</span>
                          {pin.resolved && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓ {isKo ? '해결 완료' : 'Resolved'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: BEFORE / AFTER INTERACTIVE SLIDER ===================== */}
        {activeTab === 'slider' && (
          <div className="flex-1 bg-slate-900/95 p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
            {/* Version Pickers */}
            <div className="mb-4 flex items-center justify-center gap-4 text-xs font-bold text-white bg-slate-900/80 px-4 py-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>{isKo ? '초기안 (V1 / Before)' : 'Before (V1 Initial)'}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>{isKo ? '수정안 (V2 / After)' : 'After (V2 Revised)'}</span>
              </div>
            </div>

            {/* Split Slider Container */}
            <div
              ref={sliderContainerRef}
              onMouseDown={() => setIsDraggingSlider(true)}
              onTouchStart={() => setIsDraggingSlider(true)}
              className="relative max-w-full max-h-[72vh] rounded-3xl overflow-hidden shadow-2xl border border-white/20 select-none cursor-ew-resize"
              style={{ aspectRatio: '1/1' }}
            >
              {/* After Image (Background / Full) */}
              <img
                src={compareAfterUrl}
                alt="After Revision"
                className="w-full h-full object-cover block pointer-events-none"
              />
              <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-lg border border-white/20">
                {isKo ? '수정본 (AFTER)' : 'AFTER (V2)'}
              </div>

              {/* Before Image (Clipped / Foreground) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={compareBeforeUrl}
                  alt="Before Revision"
                  className="w-full h-full object-cover block"
                />
                <div className="absolute top-4 left-4 bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-lg border border-white/20">
                  {isKo ? '초기안 (BEFORE)' : 'BEFORE (V1)'}
                </div>
              </div>

              {/* Draggable Divider Line & Knob */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl border-2 border-slate-900 cursor-ew-resize">
                  <div className="flex items-center text-[10px] font-black">
                    <ChevronLeft className="w-3 h-3 -mr-1" />
                    <ChevronRight className="w-3 h-3 -ml-1" />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isKo ? '중앙 바를 좌우로 드래그하여 전/후 변경 사항을 비교하세요' : 'Drag the center bar left and right to inspect visual changes'}</span>
            </p>
          </div>
        )}

        {/* ===================== TAB 3: SIDE-BY-SIDE DUAL VIEW ===================== */}
        {activeTab === 'side_by_side' && (
          <div className="flex-1 bg-slate-900/95 p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto items-start">
              {/* Left: Before */}
              <div className="space-y-3 bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{isKo ? '초기본 (Version 1)' : 'Initial Draft (V1)'}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Before Feedback</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg aspect-square bg-slate-950 flex items-center justify-center">
                  <img
                    src={compareBeforeUrl}
                    alt="V1 Draft"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Right: After */}
              <div className="space-y-3 bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{isKo ? '최신 수정본 (Version 2)' : 'Latest Revision (V2)'}</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold">Feedback Applied</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg aspect-square bg-slate-950 flex items-center justify-center">
                  <img
                    src={compareAfterUrl}
                    alt="V2 Revision"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== MODAL: UPLOAD REVISION VERSION ===================== */}
        {isUploadVersionOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>{isKo ? '새 수정 버전 업로드 (V2 / V3)' : 'Upload Revised Deliverable'}</span>
                </h3>
                <button onClick={() => setIsUploadVersionOpen(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadNewVersion} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isKo ? '새 결과물 이미지 URL *' : 'New Deliverable Image URL *'}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newVersionUrl}
                    onChange={(e) => setNewVersionUrl(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isKo ? '버전 제목 (선택)' : 'Version Title (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="V2: Updated Price & Logo Placement"
                    value={newVersionTitle}
                    onChange={(e) => setNewVersionTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isKo ? '수정 반영 내역 (체인지로그)' : 'Changelog / Revision Notes'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isKo ? '지점에서 요청한 핀 코멘트 #1, #2 가격과 로고 크기를 반영했습니다.' : 'Addressed pin comments #1 and #2: changed price and enlarged brand mark.'}
                    value={newVersionNotes}
                    onChange={(e) => setNewVersionNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsUploadVersionOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                  >
                    {isKo ? '취소' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md cursor-pointer"
                  >
                    {isKo ? '버전 저장 및 검토 요청' : 'Save Version & Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
