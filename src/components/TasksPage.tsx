import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Kanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  Eye,
  ChevronRight,
  MessageSquare,
  Paperclip,
  Building2,
  User,
  Plus,
  ArrowRight,
  Share2,
  ExternalLink,
  Layers,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { DesignRequest, RequestStatus, ContentPillar } from '../types.ts';
import { SocialMediaMockupModal } from './SocialMediaMockupModal.tsx';
import { DesignWhatsAppModal } from './DesignWhatsAppModal.tsx';

interface TasksPageProps {
  onSelectRequest?: (req: DesignRequest) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onSelectRequest }) => {
  const {
    designRequests,
    updateDesignRequestStatus,
    branches,
    themeColors,
    isHQ,
    currentUser,
    language,
    t
  } = usePortal();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mockupRequest, setMockupRequest] = useState<DesignRequest | null>(null);
  const [whatsappRequest, setWhatsappRequest] = useState<DesignRequest | null>(null);
  const [draggedRequestId, setDraggedRequestId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<RequestStatus | null>(null);

  const columns: { id: RequestStatus; title: string; countBadge: string; borderAccent: string; desc: string }[] = [
    {
      id: 'pending',
      title: language === 'ko' ? '대기 중 (Brief / To-Do)' : 'Pending Briefs',
      countBadge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      borderAccent: 'border-t-amber-500',
      desc: language === 'ko' ? '기획안 접수 및 제작 대기' : 'Requests awaiting production queue'
    },
    {
      id: 'in_progress',
      title: language === 'ko' ? '제작 진행 중 (In Progress)' : 'In Production',
      countBadge: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
      borderAccent: 'border-t-sky-500',
      desc: language === 'ko' ? '디자인 및 비디오 편집 진행' : 'Active design, motion & video editing'
    },
    {
      id: 'review',
      title: language === 'ko' ? '검토 / 피드백 (In Review)' : 'Under Review',
      countBadge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      borderAccent: 'border-t-purple-500',
      desc: language === 'ko' ? '팀장 승인 및 클라이언트 검토' : 'Awaiting leader or branch validation'
    },
    {
      id: 'approved',
      title: language === 'ko' ? '승인 및 납품 완료 (Approved)' : 'Approved & Ready',
      countBadge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      borderAccent: 'border-t-emerald-500',
      desc: language === 'ko' ? '최종 완료 및 배포 준비 완료' : 'Finalized assets delivered to branch'
    }
  ];

  const filteredRequests = designRequests.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (branchFilter !== 'all' && r.branch_id !== branchFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchDesigner = r.assigned_to_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDesigner) return false;
    }
    return true;
  });

  const getBranchName = (branchId: string) => {
    const b = branches.find((branch) => branch.id === branchId);
    return b ? b.name : 'All Branches';
  };

  const handleAdvanceStatus = (req: DesignRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    if (req.status === 'pending') {
      updateDesignRequestStatus(req.id, 'in_progress');
    } else if (req.status === 'in_progress') {
      updateDesignRequestStatus(req.id, 'review');
    } else if (req.status === 'review') {
      updateDesignRequestStatus(
        req.id, 
        'approved', 
        req.asset_result_url || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', 
        'Approved by HQ Creative',
        'self_approved'
      );
    }
  };

  const getPillarBadge = (pillar: ContentPillar) => {
    switch (pillar) {
      case 'Food':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'Vibes':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'Creative':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      case 'Promo':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
              <Kanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('tasksTitle')}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t('tasksSubtitle')}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{designRequests.length}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-center">
              <span className="block text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">In Progress</span>
              <span className="text-lg font-black text-sky-700 dark:text-sky-300">
                {designRequests.filter((r) => r.status === 'in_progress').length}
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-center">
              <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Approved</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                {designRequests.filter((r) => r.status === 'approved').length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brief title, designer, keywords..."
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Franchise Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pillar Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 mr-1">Pillar:</span>
            {['all', 'Food', 'Vibes', 'Creative', 'Promo'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  categoryFilter === cat
                    ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Content' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {columns.map((col) => {
          const colRequests = filteredRequests.filter((r) => 
            col.id === 'review' ? (r.status === 'review' || r.status === 'rejected') : r.status === col.id
          );
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverCol !== col.id) setDragOverCol(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverCol(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCol(null);
                const reqId = e.dataTransfer.getData('text/plain') || draggedRequestId;
                if (reqId) {
                  updateDesignRequestStatus(reqId, col.id);
                }
                setDraggedRequestId(null);
              }}
              className={`border rounded-3xl p-4 flex flex-col min-h-[460px] shadow-xs border-t-4 transition-all duration-150 ${col.borderAccent} ${
                isOver
                  ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/50 scale-[1.01]'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{col.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{col.desc}</p>
                </div>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${col.countBadge}`}>
                  {colRequests.length}
                </span>
              </div>

              {/* Card List */}
              <div className="space-y-3.5 flex-1 mt-1">
                {colRequests.length === 0 ? (
                  <div className={`py-12 px-4 text-center rounded-2xl border border-dashed transition-colors text-xs ${
                    isOver
                      ? 'border-orange-400 text-orange-600 bg-orange-50/50 dark:bg-orange-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 text-slate-400'
                  }`}>
                    {isOver ? (language === 'ko' ? '여기에 드롭하여 상태 변경' : 'Drop here to change status') : 'No requests in this stage'}
                  </div>
                ) : (
                  colRequests.map((req) => {
                    const branchName = getBranchName(req.branch_id);
                    const hasComments = req.comments && req.comments.length > 0;
                    const hasWorkingLinks = req.canva_url || req.figma_url || req.drive_url;
                    const isDragging = draggedRequestId === req.id;

                    return (
                      <div
                        key={req.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', req.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedRequestId(req.id);
                        }}
                        onDragEnd={() => {
                          setDraggedRequestId(null);
                          setDragOverCol(null);
                        }}
                        onClick={() => onSelectRequest && onSelectRequest(req)}
                        className={`group bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3 ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-orange-500' : ''
                        }`}
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[130px] flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {branchName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPillarBadge(req.category)} uppercase`}>
                            {req.category}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                            {req.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {req.description}
                          </p>
                        </div>

                        {/* Media Preview Thumbnail if available */}
                        {req.preview_media_url && (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/60 aspect-video bg-slate-900">
                            {req.preview_media_type === 'video' ? (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                <Film className="w-6 h-6 text-orange-400" />
                              </div>
                            ) : (
                              <img
                                src={req.preview_media_url}
                                alt="Preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Preview Ready
                            </div>
                          </div>
                        )}

                        {/* Deliverable Tags (Canva, Figma, Drive) */}
                        {hasWorkingLinks && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {req.canva_url && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 rounded">
                                Canva
                              </span>
                            )}
                            {req.figma_url && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded">
                                Figma
                              </span>
                            )}
                            {req.drive_url && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded">
                                Drive
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer Info & Actions */}
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {req.target_date}
                            </span>
                            {hasComments && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded">
                                <MessageSquare className="w-3 h-3" />
                                {req.comments?.length}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {/* WhatsApp Notification trigger for HQ */}
                            {isHQ && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWhatsappRequest(req);
                                }}
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition"
                                title="Send WhatsApp Update to Branch"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Live Mockup Preview */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMockupRequest(req);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                              title="Smartphone Mockup"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Advance Stage button */}
                            {req.status !== 'approved' && isHQ && (
                              <button
                                type="button"
                                onClick={(e) => handleAdvanceStatus(req, e)}
                                className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-orange-600 hover:bg-orange-500 text-white transition flex items-center gap-0.5 shadow-xs"
                                title="Advance to next workflow stage"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {mockupRequest && (
        <SocialMediaMockupModal
          isOpen={true}
          onClose={() => setMockupRequest(null)}
          title={mockupRequest.title}
          branchName={getBranchName(mockupRequest.branch_id)}
          caption={mockupRequest.caption || mockupRequest.description}
          previewUrl={mockupRequest.preview_media_url || mockupRequest.asset_result_url}
          format="feed"
        />
      )}

      {whatsappRequest && (
        <DesignWhatsAppModal
          isOpen={true}
          onClose={() => setWhatsappRequest(null)}
          request={whatsappRequest}
        />
      )}
    </div>
  );
};
