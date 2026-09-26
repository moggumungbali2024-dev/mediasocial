import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { ExposureSlot, ContentPillar } from '../types.ts';
import { 
  X, 
  Calendar, 
  Film, 
  Layers, 
  Image as ImageIcon, 
  Sparkles, 
  Smartphone, 
  Plus, 
  Clock, 
  Building2, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SocialMediaMockupModal } from './SocialMediaMockupModal.tsx';

interface ScheduledContentModalProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onAddNewSlot?: (date: string) => void;
}

export const ScheduledContentModal: React.FC<ScheduledContentModalProps> = ({
  date,
  isOpen,
  onClose,
  onAddNewSlot
}) => {
  const { exposureSlots, branches, currentBranch, isHQ, t } = usePortal();
  const [mockupSlot, setMockupSlot] = useState<ExposureSlot | null>(null);

  if (!isOpen) return null;

  // Filter slots for this date
  const daySlots = exposureSlots.filter((s) => {
    if (s.date !== date) return false;
    if (isHQ) return true;
    return s.branch_id === currentBranch?.id;
  });

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name || 'All Branches';
  };

  const getPillarColor = (pillar: ContentPillar) => {
    switch (pillar) {
      case 'Food':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Vibes':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Creative':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Promo':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Reels':
        return <Film className="w-4 h-4 text-purple-500" />;
      case 'Feed Carousel':
        return <Layers className="w-4 h-4 text-blue-500" />;
      case 'Single Post':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {t('scheduledContentTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {formattedDate} • <span className="text-orange-600 dark:text-orange-400 font-semibold">{daySlots.length} Post(s) Scheduled</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {daySlots.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                {t('noPostsScheduled')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                No Instagram posts or reels are scheduled on {formattedDate}. You can add a new exposure slot to fill this slot.
              </p>
              {onAddNewSlot && (
                <button
                  onClick={() => {
                    onClose();
                    onAddNewSlot(date);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t('addExposureSlotBtn')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {daySlots.map((slot) => {
                const branchName = getBranchName(slot.branch_id);
                return (
                  <div
                    key={slot.id}
                    className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-orange-500/40 dark:hover:border-orange-500/40 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getPillarColor(slot.pillar)}`}>
                            {slot.pillar}
                          </span>
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                            {getFormatIcon(slot.format)}
                            {slot.format}
                          </span>
                          {isHQ && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {branchName}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                          {slot.title}
                        </h4>
                      </div>

                      <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {slot.status.toUpperCase()}
                      </span>
                    </div>

                    {slot.caption_outline && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                        {slot.caption_outline}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Scheduled for official IG post
                      </span>

                      <button
                        onClick={() => setMockupSlot(slot)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg border border-orange-200 dark:border-orange-800/40 transition-colors"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Preview in Smartphone Mockup
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('exposureSubtitle').slice(0, 75)}...
          </p>
          <div className="flex items-center gap-2">
            {onAddNewSlot && (
              <button
                onClick={() => {
                  onClose();
                  onAddNewSlot(date);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                + {t('addExposureSlotBtn')}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Mockup Preview */}
      {mockupSlot && (
        <SocialMediaMockupModal
          isOpen={true}
          onClose={() => setMockupSlot(null)}
          title={mockupSlot.title}
          branchName={getBranchName(mockupSlot.branch_id)}
          caption={mockupSlot.caption_outline}
          format={
            mockupSlot.format === 'Reels'
              ? 'reels'
              : mockupSlot.format === 'Feed Carousel'
              ? 'carousel'
              : 'feed'
          }
        />
      )}
    </div>
  );
};
