import React, { useState, useEffect } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { getOfficeTimeInfo, OfficeTimeInfo } from '../utils/timezone.ts';
import { Clock, Globe2, MapPin, ArrowRightLeft, Info, Settings, ChevronDown } from 'lucide-react';

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
  const { whitelabelConfig, themeColors, language, setActiveTab } = usePortal();
  const [now, setNow] = useState<Date>(new Date());
  const [showPopover, setShowPopover] = useState(false);

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
        title={`Office Time (${timeInfo.officeLocation}): ${timeInfo.officeTimeString} ${timeInfo.officeLabel}`}
      >
        {/* Glowing Clock Icon */}
        <div className="relative flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>

        {/* Office Time & Label */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold tracking-tight">
            {timeInfo.officeTimeString}
          </span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {timeInfo.officeLabel}
          </span>
        </div>

        {/* Office City Tag */}
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans border-l border-slate-200 dark:border-slate-700 pl-2">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{officeCity}</span>
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
                {language === 'ko' ? '본사 리전 & 시차 안내' : 'Office Region & Timezone'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
            >
              {language === 'ko' ? '닫기' : 'Tutup'}
            </button>
          </div>

          {/* Office HQ Time Card */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{language === 'ko' ? '본사 기준 시간 (Office HQ)' : 'Waktu Kantor Pusat (HQ)'}</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                {timeInfo.officeLabel}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {timeInfo.officeTimeString}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {timeInfo.officeDateString}
              </div>
            </div>
            <div className="text-[11px] text-amber-900 dark:text-amber-200 font-semibold">
              📍 {timeInfo.officeLocation} ({officeTz})
            </div>
          </div>

          {/* User Local Device Time Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{language === 'ko' ? '내 기기/브라우저 로컬 시간' : 'Waktu Perangkat / Browser Anda'}</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                {timeInfo.localLabel}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">
                {timeInfo.localTimeString}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[140px]" title={timeInfo.localTimezoneId}>
                {timeInfo.localTimezoneId}
              </div>
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
                    : `Selisih Waktu: ${timeInfo.diffDescription}`
                  : language === 'ko'
                  ? '동일 시간대 (시차 없음)'
                  : 'Zona waktu sama dengan kantor (Tidak ada selisih)'}
              </span>
            </div>
            {timeInfo.isDifferent && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-100 font-mono">
                {timeInfo.diffHours > 0 ? `+${timeInfo.diffHours} Jam` : `${timeInfo.diffHours} Jam`}
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
                } else if (setActiveTab) {
                  setActiveTab('whitelabel');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>{language === 'ko' ? '본사 리전 설정 변경' : 'Ubah Region Kantor'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
