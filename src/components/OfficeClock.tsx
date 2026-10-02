import React, { useState, useEffect } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { getOfficeTimeInfo, OfficeTimeInfo } from '../utils/timezone.ts';
import { Clock, Globe2, MapPin, ArrowRightLeft, Settings, ChevronDown, Check } from 'lucide-react';

interface OfficeClockProps {
  compact?: boolean;
  onOpenSettings?: () => void;
  className?: string;
}

export const OfficeClock: React.FC<OfficeClockProps> = ({
  compact = false,
  onOpenSettings,
  className = ''
}) => {
  const { whitelabelConfig, language } = usePortal();
  const [now, setNow] = useState<Date>(new Date());
  const [showPopover, setShowPopover] = useState(false);
  const [clockMode, setClockMode] = useState<'user' | 'office'>(() => {
    try {
      return (localStorage.getItem('preferred_clock_mode') as 'user' | 'office') || 'user';
    } catch {
      return 'user';
    }
  });

  const handleSetClockMode = (mode: 'user' | 'office') => {
    setClockMode(mode);
    try {
      localStorage.setItem('preferred_clock_mode', mode);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const officeTz = whitelabelConfig?.timezone_id || 'Asia/Makassar';
  const officeLabel = whitelabelConfig?.timezone_label || 'WITA';
  const officeCity = whitelabelConfig?.office_city || 'Bali';
  const officeCountry = whitelabelConfig?.office_country || 'Indonesia';

  const timeInfo: OfficeTimeInfo = getOfficeTimeInfo(
    now,
    officeTz,
    officeLabel,
    officeCity,
    officeCountry,
    language as any
  );

  const displayTime = clockMode === 'user' ? timeInfo.localTimeString : timeInfo.officeTimeString;
  const displayLabel = clockMode === 'user' ? timeInfo.localLabel : timeInfo.officeLabel;
  const displayCity = clockMode === 'user' ? timeInfo.localCity : officeCity;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className={`group flex items-center gap-2 rounded-2xl transition cursor-pointer ${
          compact
            ? 'px-2.5 py-1 text-xs bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80'
            : 'px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-2xs'
        }`}
        title={`${clockMode === 'user' ? 'Your Local Time' : 'Office HQ Time'}: ${displayTime} ${displayLabel} (${displayCity})`}
      >
        {/* Glowing Clock Icon */}
        <div className="relative flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>

        {/* Display Time & Label */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold tracking-tight">
            {displayTime}
          </span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {displayLabel}
          </span>
        </div>

        {/* City Tag */}
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans border-l border-slate-200 dark:border-slate-700 pl-2">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{displayCity}</span>
        </span>

        {/* Time difference badge if viewer device is in a different timezone */}
        {timeInfo.isDifferent && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-sans animate-in fade-in duration-200">
            <ArrowRightLeft className="w-2.5 h-2.5 shrink-0 text-sky-500" />
            <span>{timeInfo.diffHours > 0 ? `+${timeInfo.diffHours}h` : `${timeInfo.diffHours}h`}</span>
          </span>
        )}

        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition" />
      </button>

      {/* Popover Dropdown Breakdown */}
      {showPopover && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white">
                {language === 'ko' ? '시계 & 타임존 설정' : 'Clock & Timezone Settings'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
            >
              {language === 'ko' ? '닫기' : 'Close'}
            </button>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSetClockMode('user')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                clockMode === 'user'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ko' ? '내 기기 시간' : 'User Local Time'}</span>
              {clockMode === 'user' && <Check className="w-3 h-3 text-emerald-500" />}
            </button>
            <button
              type="button"
              onClick={() => handleSetClockMode('office')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                clockMode === 'office'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'ko' ? '본사 HQ 시간' : 'Office HQ Time'}</span>
              {clockMode === 'office' && <Check className="w-3 h-3 text-emerald-500" />}
            </button>
          </div>

          {/* User Local Device Time Card */}
          <div
            onClick={() => handleSetClockMode('user')}
            className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
              clockMode === 'user'
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-1 ring-amber-400/30'
                : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{language === 'ko' ? '내 기기 / 브라우저 로컬 시간' : 'Your Device / Local Time'}</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                {timeInfo.localLabel}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {timeInfo.localTimeString}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[150px]" title={timeInfo.localTimezoneId}>
                📍 {timeInfo.localCity} ({timeInfo.localTimezoneId})
              </div>
            </div>
          </div>

          {/* Office HQ Time Card */}
          <div
            onClick={() => handleSetClockMode('office')}
            className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
              clockMode === 'office'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-400/30'
                : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500" />
                <span>{language === 'ko' ? '본사 기준 시간 (Office HQ)' : 'Office HQ Time (Studio)'}</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-mono">
                {timeInfo.officeLabel}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {timeInfo.officeTimeString}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {timeInfo.officeDateString}
              </div>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              📍 {timeInfo.officeLocation} ({officeTz})
            </div>
          </div>

          {/* Time difference summary pill */}
          <div
            className={`p-2.5 rounded-xl text-xs flex items-center justify-between ${
              timeInfo.isDifferent
                ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-semibold'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
              <span>
                {timeInfo.isDifferent
                  ? language === 'ko'
                    ? `시차: ${timeInfo.diffDescription}`
                    : `Time Difference: ${timeInfo.diffDescription}`
                  : language === 'ko'
                  ? '동일 시간대 (시차 없음)'
                  : 'Same timezone as office (No difference)'}
              </span>
            </div>
            {timeInfo.isDifferent && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-100 font-mono">
                {timeInfo.diffHours > 0 ? `+${timeInfo.diffHours}h` : `${timeInfo.diffHours}h`}
              </span>
            )}
          </div>

          {/* Action button to change region in Whitelabel */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowPopover(false);
                if (onOpenSettings) {
                  onOpenSettings();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>{language === 'ko' ? '본사 리전 설정 변경' : 'Configure Office Region'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
