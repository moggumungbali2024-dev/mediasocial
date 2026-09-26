import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowRight,
  Tag,
  Store,
  Layers,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ScheduledContentModal } from './ScheduledContentModal.tsx';

interface EventCountdownItem {
  id: string;
  title: string;
  category: 'Reels Launch' | 'Promo Banner' | 'Photoshoot Visit' | 'Cutoff Deadline' | 'Menu Audit';
  typeBadge: string;
  typeColor: string;
  targetDate: string;
  daysRemaining: number;
  progressPercent: number;
  branchName: string;
}

export const DashboardTimelineCards: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const {
    currentBranch,
    isHQ,
    simulatedDate,
    branches,
    designRequests,
    promos,
    shootRequests,
    whitelabelConfig,
    themeColors,
    language,
    t
  } = usePortal();

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = parseInt(simulatedDate.split('-')[2], 10);
    return isNaN(d) ? 21 : d;
  });

  const [modalDate, setModalDate] = useState<string | null>(null);

  // Calendar days generation for September 2026
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Notable scheduled timeline events
  const timelineEvents: EventCountdownItem[] = [
    {
      id: 'evt-1',
      title: 'Autumn Truffle Ramen Launch Reels',
      category: 'Reels Launch',
      typeBadge: 'Reels 9:16',
      typeColor: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      targetDate: '2026-09-26',
      daysRemaining: 5,
      progressPercent: 65,
      branchName: 'Moggumung Seminyak'
    },
    {
      id: 'evt-2',
      title: 'October Promo Submission Cut-off',
      category: 'Cutoff Deadline',
      typeBadge: 'Policy Cut-off',
      typeColor: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
      targetDate: '2026-09-25',
      daysRemaining: 4,
      progressPercent: 80,
      branchName: 'All Branches'
    },
    {
      id: 'evt-3',
      title: 'Sunset Terrace & Cocktail Shoot Visit',
      category: 'Photoshoot Visit',
      typeBadge: 'On-Site Crew',
      typeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      targetDate: '2026-09-28',
      daysRemaining: 7,
      progressPercent: 40,
      branchName: 'Moggumung Seminyak'
    },
    {
      id: 'evt-4',
      title: 'Chef Special Wood-Fired Bowls Promo',
      category: 'Promo Banner',
      typeBadge: 'Feed 1:1',
      typeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      targetDate: '2026-10-01',
      daysRemaining: 10,
      progressPercent: 25,
      branchName: 'Moggumung Ubud'
    }
  ];

  // Highlight days with events
  const eventDays = [5, 14, 19, 21, 22, 25, 26, 28];

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const dateStr = `2026-09-${String(day).padStart(2, '0')}`;
    setModalDate(dateStr);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
            {language === 'ko' ? '콘텐츠 일정 & 실시간 릴리즈 카운트다운' : 'Content Schedule & Launch Countdown'}
          </h2>
        </div>
        <button
          onClick={() => onNavigateTab('exposure')}
          style={{ color: themeColors.primary }}
          className="text-xs font-bold hover:underline flex items-center gap-1"
        >
          <span>{t('exposure')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid: Left Calendar + Right Countdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. Mini Visual Calendar Card (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-sm text-slate-900 dark:text-white font-['Space_Grotesk']">
                September 2026
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Dates grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
              {/* Previous month filler (Aug 31) */}
              <span className="p-2 text-slate-300 dark:text-slate-700">31</span>

              {daysInMonth.map((day) => {
                const isSelected = selectedDay === day;
                const hasEvent = eventDays.includes(day);
                const isCutoff = day === 25;

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    style={
                      isSelected
                        ? { backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }
                        : undefined
                    }
                    className={`relative p-2 rounded-xl transition flex flex-col items-center justify-center font-semibold text-xs ${
                      isSelected
                        ? 'font-bold shadow-xs'
                        : isCutoff
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold border border-red-200 dark:border-red-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{day}</span>
                    {hasEvent && !isSelected && (
                      <span
                        style={{ backgroundColor: isCutoff ? '#EF4444' : themeColors.primary }}
                        className="w-1 h-1 rounded-full absolute bottom-1"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColors.primary }} />
              <span>Event / Live Post (Click to inspect)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>25th Cut-off</span>
            </div>
          </div>
        </div>

        {/* 2. Countdown Schedule Cards (lg:col-span-7) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {timelineEvents.map((evt) => {
            return (
              <div
                key={evt.id}
                onClick={() => setModalDate(evt.targetDate)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:shadow-md transition group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${evt.typeColor}`}>
                      {evt.typeBadge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {evt.branchName}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 leading-snug line-clamp-2">
                    {evt.title}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.targetDate}</span>
                  </div>
                </div>

                {/* Progress bar & Days remaining */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span>Days remaining</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {evt.daysRemaining} {evt.daysRemaining === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{
                        width: `${evt.progressPercent}%`,
                        backgroundColor: themeColors.primary
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Content Modal */}
      {modalDate && (
        <ScheduledContentModal
          date={modalDate}
          isOpen={true}
          onClose={() => setModalDate(null)}
          onAddNewSlot={(d) => {
            setModalDate(null);
            onNavigateTab('exposure');
          }}
        />
      )}
    </div>
  );
};
