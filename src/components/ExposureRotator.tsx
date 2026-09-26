import React, { useState, useMemo } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  CalendarCheck2, 
  PieChart, 
  Filter, 
  Plus, 
  Sparkles, 
  Film, 
  Image, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Check, 
  X,
  AlertTriangle,
  Info,
  Calendar,
  Building2,
  Trash2
} from 'lucide-react';
import { ContentPillar, ExposureSlot } from '../types.ts';
import { ScheduledContentModal } from './ScheduledContentModal.tsx';

export const ExposureRotator: React.FC = () => {
  const { 
    branches, 
    exposureSlots, 
    addExposureSlot, 
    deleteExposureSlot, 
    activeRole, 
    isHQ,
    currentBranch,
    simulatedDate,
    t,
    language
  } = usePortal();

  // Filter branch
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    currentBranch ? currentBranch.id : 'all'
  );

  // Month selector
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  // Inspect modal state
  const [selectedInspectDate, setSelectedInspectDate] = useState<string | null>(null);

  // New slot modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlotBranchId, setNewSlotBranchId] = useState(branches[0]?.id || '');
  const [newSlotDate, setNewSlotDate] = useState('2026-09-25');
  const [newSlotPillar, setNewSlotPillar] = useState<ContentPillar>('Food');
  const [newSlotFormat, setNewSlotFormat] = useState<ExposureSlot['format']>('Reels');
  const [newSlotTitle, setNewSlotTitle] = useState('');
  const [newSlotCaption, setNewSlotCaption] = useState('');

  // Filter slots by month and optionally branch
  const monthSlots = useMemo(() => {
    return exposureSlots.filter((slot) => {
      const matchMonth = slot.date.startsWith(selectedMonth);
      const matchBranch = selectedBranchId === 'all' || slot.branch_id === selectedBranchId;
      return matchMonth && matchBranch;
    });
  }, [exposureSlots, selectedMonth, selectedBranchId]);

  // Composition calculation for 40/25/20/15 rule across ALL or filtered slots
  const totalSlotsCount = monthSlots.length;
  const pillarCounts = useMemo(() => {
    const counts: Record<ContentPillar, number> = {
      Food: 0,
      Vibes: 0,
      Creative: 0,
      Promo: 0
    };
    monthSlots.forEach((slot) => {
      if (counts[slot.pillar] !== undefined) {
        counts[slot.pillar]++;
      }
    });
    return counts;
  }, [monthSlots]);

  const compositionStats = useMemo(() => {
    if (totalSlotsCount === 0) {
      return {
        Food: { count: 0, percentage: 0, target: 40, color: '#f97316' },
        Vibes: { count: 0, percentage: 0, target: 25, color: '#3b82f6' },
        Creative: { count: 0, percentage: 0, target: 20, color: '#8b5cf6' },
        Promo: { count: 0, percentage: 0, target: 15, color: '#ec4899' }
      };
    }
    return {
      Food: {
        count: pillarCounts.Food,
        percentage: Math.round((pillarCounts.Food / totalSlotsCount) * 100),
        target: 40,
        color: '#f97316' // Orange
      },
      Vibes: {
        count: pillarCounts.Vibes,
        percentage: Math.round((pillarCounts.Vibes / totalSlotsCount) * 100),
        target: 25,
        color: '#3b82f6' // Blue
      },
      Creative: {
        count: pillarCounts.Creative,
        percentage: Math.round((pillarCounts.Creative / totalSlotsCount) * 100),
        target: 20,
        color: '#8b5cf6' // Purple
      },
      Promo: {
        count: pillarCounts.Promo,
        percentage: Math.round((pillarCounts.Promo / totalSlotsCount) * 100),
        target: 15,
        color: '#ec4899' // Pink
      }
    };
  }, [totalSlotsCount, pillarCounts]);

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTitle.trim()) return;

    addExposureSlot({
      branch_id: newSlotBranchId,
      date: newSlotDate,
      pillar: newSlotPillar,
      format: newSlotFormat,
      title: newSlotTitle,
      caption_outline: newSlotCaption,
      status: 'scheduled'
    });

    setIsAddModalOpen(false);
    setNewSlotTitle('');
    setNewSlotCaption('');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Exposure Matrix Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Space_Grotesk']">
              {t('exposureTitle')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {t('exposureSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="2026-09">{language === 'ko' ? '2026년 9월 (진행중)' : 'September 2026 (Active)'}</option>
              <option value="2026-10">{language === 'ko' ? '2026년 10월 (익월)' : 'October 2026 (Next Month)'}</option>
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addExposureSlotBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPOSITION INDICATOR (40% Food / 25% Vibes / 20% Creative / 15% Promo) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('compositionIndicator')} ({selectedMonth})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('compositionDesc')}
            </p>
          </div>

          <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            {t('totalScheduledContent').replace('{count}', String(totalSlotsCount))}
          </div>
        </div>

        {/* Multi-segment Stacked Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${compositionStats.Food.percentage}%` }}
              className="bg-orange-500 h-full transition-all duration-500"
              title={`Food: ${compositionStats.Food.percentage}%`}
            />
            <div
              style={{ width: `${compositionStats.Vibes.percentage}%` }}
              className="bg-sky-500 h-full transition-all duration-500"
              title={`Vibes: ${compositionStats.Vibes.percentage}%`}
            />
            <div
              style={{ width: `${compositionStats.Creative.percentage}%` }}
              className="bg-purple-500 h-full transition-all duration-500"
              title={`Creative: ${compositionStats.Creative.percentage}%`}
            />
            <div
              style={{ width: `${compositionStats.Promo.percentage}%` }}
              className="bg-pink-500 h-full transition-all duration-500"
              title={`Promo: ${compositionStats.Promo.percentage}%`}
            />
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50">
              <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <div>
                <div className="font-bold text-orange-950 dark:text-orange-300">Food ({compositionStats.Food.percentage}%)</div>
                <div className="text-[10px] text-orange-700 dark:text-orange-400">Target: 40% ({compositionStats.Food.count} posts)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50">
              <div className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
              <div>
                <div className="font-bold text-sky-950 dark:text-sky-300">Vibes ({compositionStats.Vibes.percentage}%)</div>
                <div className="text-[10px] text-sky-700 dark:text-sky-400">Target: 25% ({compositionStats.Vibes.count} posts)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
              <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
              <div>
                <div className="font-bold text-purple-950 dark:text-purple-300">Creative ({compositionStats.Creative.percentage}%)</div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400">Target: 20% ({compositionStats.Creative.count} posts)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/50">
              <div className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
              <div>
                <div className="font-bold text-pink-950 dark:text-pink-300">Promo ({compositionStats.Promo.percentage}%)</div>
                <div className="text-[10px] text-pink-700 dark:text-pink-400">Target: 15% ({compositionStats.Promo.count} posts)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      {isHQ && (
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300 font-semibold">{t('branch')}:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium outline-none cursor-pointer"
            >
              <option value="all">{language === 'ko' ? '전체 지점 슬롯' : 'All Branches'}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-400 font-semibold">
            {monthSlots.length} {language === 'ko' ? '건 게시' : 'slots'}
          </span>
        </div>
      )}

      {/* Scheduled Slots Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthSlots.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            {language === 'ko' ? '선택한 기간에 예정된 노출 콘텐츠가 없습니다.' : 'No exposure slots scheduled for this period.'}
          </div>
        ) : (
          monthSlots.map((slot) => {
            const branchObj = branches.find((b) => b.id === slot.branch_id);
            return (
              <div
                key={slot.id}
                onClick={() => setSelectedInspectDate(slot.date)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-orange-500/40 dark:hover:border-orange-500/40 transition space-y-3 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                      {branchObj?.name}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">{slot.date}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        slot.pillar === 'Food'
                          ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-400'
                          : slot.pillar === 'Vibes'
                          ? 'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-400'
                          : slot.pillar === 'Creative'
                          ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400'
                          : 'bg-pink-100 dark:bg-pink-950/40 text-pink-800 dark:text-pink-400'
                      }`}
                    >
                      {slot.pillar}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {slot.format}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{slot.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mt-1">
                    {slot.caption_outline}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{slot.status}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    {isHQ && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExposureSlot(slot.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 transition"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Exposure Slot */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-amber-500" />
                <span>{t('addExposureSlotBtn')}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('branch')}</label>
                <select
                  value={newSlotBranchId}
                  onChange={(e) => setNewSlotBranchId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('slotDate')}</label>
                  <input
                    type="date"
                    required
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('slotFormat')}</label>
                  <select
                    value={newSlotFormat}
                    onChange={(e) => setNewSlotFormat(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 bg-white"
                  >
                    <option value="Reels">Reels</option>
                    <option value="Feed Carousel">Feed Carousel</option>
                    <option value="Single Post">Single Post</option>
                    <option value="Story Highlights">Story Highlights</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('slotPillar')}</label>
                <select
                  value={newSlotPillar}
                  onChange={(e) => setNewSlotPillar(e.target.value as ContentPillar)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 bg-white"
                >
                  <option value="Food">Food (40% - Hero bowls, dishes)</option>
                  <option value="Vibes">Vibes (25% - Ambiance, interior, dining)</option>
                  <option value="Creative">Creative (20% - BTS, education, branding)</option>
                  <option value="Promo">Promo (15% - Vouchers, discounts)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('slotTitle')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signature Truffle Ramen Cinematic Reel"
                  value={newSlotTitle}
                  onChange={(e) => setNewSlotTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('slotCaption')}</label>
                <textarea
                  rows={3}
                  placeholder="Outline key talking points, audio suggestion, hashtags..."
                  value={newSlotCaption}
                  onChange={(e) => setNewSlotCaption(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduled Content Inspect Modal */}
      {selectedInspectDate && (
        <ScheduledContentModal
          date={selectedInspectDate}
          isOpen={true}
          onClose={() => setSelectedInspectDate(null)}
          onAddNewSlot={(date) => {
            setSelectedInspectDate(null);
            setNewSlotDate(date);
            setIsAddModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
