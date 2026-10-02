import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Kanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  User,
  ExternalLink,
  ChevronRight,
  Eye,
  Plus,
  Filter,
  Layers
} from 'lucide-react';
import { DesignRequest, RequestStatus } from '../types.ts';
import { calculateDesignSla } from '../utils/slaCalculator.ts';

interface CreativeKanbanBoardProps {
  onOpenMockup: (req: DesignRequest) => void;
  onSelectRequest?: (req: DesignRequest) => void;
  onOpenVisualReview?: (req: DesignRequest) => void;
}

export const CreativeKanbanBoard: React.FC<CreativeKanbanBoardProps> = ({
  onOpenMockup,
  onSelectRequest,
  onOpenVisualReview
}) => {
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
  const [draggedRequestId, setDraggedRequestId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<RequestStatus | null>(null);

  const columns: { id: RequestStatus; title: string; countColor: string; desc: string }[] = [
    {
      id: 'pending',
      title: language === 'ko' ? '대기 중 (To-Do)' : 'Pending Briefs',
      countColor: 'bg-amber-100 text-amber-900 border-amber-300',
      desc: language === 'ko' ? '기획안 접수 및 대기' : 'Requests waiting for review'
    },
    {
      id: 'in_progress',
      title: language === 'ko' ? '제작 중 (In Progress)' : 'In Design Production',
      countColor: 'bg-sky-100 text-sky-900 border-sky-300',
      desc: language === 'ko' ? '디자인 및 비디오 편집' : 'Active design & video editing'
    },
    {
      id: 'review',
      title: language === 'ko' ? '검토 / 피드백 (In Review)' : 'Review & Revision',
      countColor: 'bg-purple-100 text-purple-900 border-purple-300',
      desc: language === 'ko' ? '팀장 승인 및 피드백 수정' : 'Feedback & changes needed'
    },
    {
      id: 'approved',
      title: language === 'ko' ? '승인 완료 (Ready/Live)' : 'Approved & Published',
      countColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: language === 'ko' ? '최종 승인 및 배포 준비' : 'Ready for release'
    }
  ];

  const safeDesignRequests = Array.isArray(designRequests) ? designRequests : [];
  const safeBranches = Array.isArray(branches) ? branches : [];

  const filteredRequests = safeDesignRequests.filter((r) => {
    if (!r) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const getBranchName = (branchId: string) => {
    const b = safeBranches.find((branch) => branch.id === branchId);
    return b ? b.name : 'Branch';
  };

  const handleAdvanceStatus = (req: DesignRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    if (req.status === 'pending') {
      updateDesignRequestStatus(req.id, 'in_progress');
    } else if (req.status === 'in_progress') {
      updateDesignRequestStatus(req.id, 'review');
    } else if (req.status === 'review' || req.status === 'rejected') {
      updateDesignRequestStatus(req.id, 'approved', req.asset_result_url || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', 'Creative Lead Quality Approval');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Kanban className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            {language === 'ko' ? '크리에이티브 제작 워크플로우 칸반' : 'Creative Production Workflow Kanban'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold">
            {language === 'ko' ? '카테고리:' : 'Pillar:'}
          </span>
          {['all', 'Food', 'Vibes', 'Creative', 'Promo'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-xl font-bold transition text-[11px] cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat === 'all' ? (language === 'ko' ? '전체 카테고리' : 'All Pillars') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
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
              className={`border rounded-3xl p-3.5 flex flex-col min-h-[380px] shadow-2xs transition-all duration-150 ${
                isOver 
                  ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/50 scale-[1.01]' 
                  : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">{col.title}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{col.desc}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${col.countColor}`}>
                  {colRequests.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1">
                {colRequests.length === 0 ? (
                  <div className={`p-6 text-center text-[11px] rounded-2xl border border-dashed transition-colors ${
                    isOver 
                      ? 'border-orange-400 text-orange-600 bg-orange-50/50 dark:bg-orange-950/20' 
                      : 'border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500'
                  }`}>
                    {isOver ? (language === 'ko' ? '여기에 드롭하여 상태 변경' : 'Drop here to change status') : 'No requests in this stage'}
                  </div>
                ) : (
                  colRequests.map((req) => {
                    const slaInfo = calculateDesignSla(req, language);
                    const openPinsCount = req.pin_annotations?.filter(p => !p.resolved).length || 0;
                    const isDragging = draggedRequestId === req.id;
                    const branchName = getBranchName(req.branch_id);

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
                        className={`bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 hover:border-orange-500/50 dark:hover:border-orange-500/50 shadow-xs hover:shadow-md transition cursor-grab active:cursor-grabbing space-y-2.5 group ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-orange-500' : ''
                        }`}
                      >
                        {/* Branch badge & SLA countdown timer */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md truncate max-w-[110px]">
                            {branchName}
                          </span>

                          {/* SLA Timer Badge */}
                          <div
                            className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-1 ${slaInfo.colorClass.bg} ${slaInfo.colorClass.border} ${slaInfo.colorClass.text}`}
                            title={slaInfo.badgeSubtext}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${slaInfo.colorClass.dot}`} />
                            <span>{slaInfo.badgeText}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2 leading-snug transition-colors">
                          {req.title}
                        </h4>

                        {/* Description snippet */}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>

                        {/* Meta & Actions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                          <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 rounded-md uppercase">
                            {req.category}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Visual Review / Pin Button */}
                            {onOpenVisualReview && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenVisualReview(req);
                                }}
                                className="px-1.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer flex items-center gap-0.5"
                                title="Visual Review & Pins"
                              >
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                {openPinsCount > 0 && (
                                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                                    {openPinsCount}
                                  </span>
                                )}
                              </button>
                            )}

                            {/* Preview Mockup Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenMockup(req);
                              }}
                              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                              title="Live Instagram Mockup"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Advance button */}
                            {req.status !== 'approved' && isHQ && (
                              <button
                                type="button"
                                onClick={(e) => handleAdvanceStatus(req, e)}
                                style={{ backgroundColor: themeColors.primaryLight, color: themeColors.primary }}
                                className="px-2 py-1 rounded-lg font-bold text-[10px] border border-current transition flex items-center gap-0.5 cursor-pointer"
                                title="Advance Stage"
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
    </div>
  );
};
