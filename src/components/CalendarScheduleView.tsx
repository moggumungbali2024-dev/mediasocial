import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  Palette, 
  Camera, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  X, 
  CalendarDays,
  CalendarRange,
  ListFilter,
  Eye,
  Trash2,
  Sparkles
} from 'lucide-react';
import { MeetingAgenda } from '../types.ts';

export const CalendarScheduleView: React.FC = () => {
  const { 
    currentUser, 
    isHQ, 
    branches, 
    designRequests, 
    promos, 
    shootRequests, 
    budgetRequests, 
    meetingAgendas, 
    addMeetingAgenda, 
    deleteMeetingAgenda,
    simulatedDate,
    whitelabelConfig,
    t,
    language
  } = usePortal();

  // Calendar View: 'monthly' | 'weekly' | 'daily'
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [currentDateStr, setCurrentDateStr] = useState<string>(simulatedDate); // '2026-09-21'
  const [selectedDate, setSelectedDate] = useState<string>(simulatedDate);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New Meeting Modal
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(simulatedDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [locationOrLink, setLocationOrLink] = useState('HQ Conference Room A / Google Meet');
  const [attendees, setAttendees] = useState<string[]>([currentUser.full_name]);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Selected event detail inspector
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    type: 'design' | 'promo' | 'shoot' | 'meeting' | 'budget';
    title: string;
    date: string;
    branchName?: string;
    status?: string;
    details?: string;
    extra?: any;
  } | null>(null);

  // Parse current date
  const currentDate = useMemo(() => new Date(currentDateStr), [currentDateStr]);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'monthly') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'weekly') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    const iso = d.toISOString().split('T')[0];
    setCurrentDateStr(iso);
    setSelectedDate(iso);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'monthly') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    const iso = d.toISOString().split('T')[0];
    setCurrentDateStr(iso);
    setSelectedDate(iso);
  };

  const handleToday = () => {
    setCurrentDateStr(simulatedDate);
    setSelectedDate(simulatedDate);
  };

  // Compile all unified events
  const allEvents = useMemo(() => {
    const events: Array<{
      id: string;
      type: 'design' | 'promo' | 'shoot' | 'meeting' | 'budget';
      title: string;
      date: string;
      branchName?: string;
      status?: string;
      details?: string;
      color: string;
      extra?: any;
    }> = [];

    // 1. Design Requests
    designRequests.forEach((req) => {
      const b = branches.find((x) => x.id === req.branch_id);
      events.push({
        id: req.id,
        type: 'design',
        title: `🎨 [${b?.name || 'Design'}] ${req.title}`,
        date: req.target_date,
        branchName: b?.name,
        status: req.status,
        details: req.description,
        color: 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40',
        extra: req
      });
    });

    // 2. Promo Campaigns
    promos.forEach((p) => {
      const b = branches.find((x) => x.id === p.branch_id);
      events.push({
        id: p.id,
        type: 'promo',
        title: `🏷️ [${b?.name || 'Promo'}] ${p.title}`,
        date: p.start_date,
        branchName: b?.name,
        status: p.status,
        details: `${p.mechanic} (Valid until ${p.end_date})`,
        color: 'bg-purple-500/20 text-purple-900 dark:text-purple-300 border-purple-500/40',
        extra: p
      });
    });

    // 3. Shoot Requests
    shootRequests.forEach((s) => {
      events.push({
        id: s.id,
        type: 'shoot',
        title: `📸 [${s.branch_name || 'Shoot'}] ${s.title}`,
        date: s.preferred_date,
        branchName: s.branch_name,
        status: s.status,
        details: `Assigned to: ${s.assigned_creative_name || 'Creative Team'} • Focus: ${s.focus_products?.join(', ') || 'Menu'}`,
        color: 'bg-sky-500/20 text-sky-900 dark:text-sky-300 border-sky-500/40',
        extra: s
      });
    });

    // 4. Budget Requests
    budgetRequests.forEach((b) => {
      events.push({
        id: b.id,
        type: 'budget',
        title: `💰 [HQ Budget] ${b.title} (${whitelabelConfig.currency_symbol} ${b.amount.toLocaleString()})`,
        date: b.created_at,
        branchName: b.target_branch_name,
        status: b.status,
        details: `${b.type} - Objective: ${b.objective}`,
        color: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-500/40',
        extra: b
      });
    });

    // 5. Meeting Agendas
    meetingAgendas.forEach((m) => {
      events.push({
        id: m.id,
        type: 'meeting',
        title: `🗓️ [Meeting] ${m.title} (${m.start_time})`,
        date: m.date,
        status: 'scheduled',
        details: `${m.start_time} - ${m.end_time} | ${m.location_or_link}. Agenda: ${m.notes || 'HQ Sync'}`,
        color: 'bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border-indigo-500/40',
        extra: m
      });
    });

    return events;
  }, [designRequests, promos, shootRequests, budgetRequests, meetingAgendas, branches, whitelabelConfig]);

  // Filter events by category
  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'all') return allEvents;
    return allEvents.filter((e) => e.type === categoryFilter);
  }, [allEvents, categoryFilter]);

  // Monthly Matrix calculation
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

    // Prev month padding
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const mStr = String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0');
      const yNum = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        dateStr: `${yNum}-${mStr}-${String(dNum).padStart(2, '0')}`,
        dayNum: dNum,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      days.push({
        dateStr: `${currentYear}-${mStr}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // Next month padding to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const mStr = String(currentMonth + 2 > 12 ? 1 : currentMonth + 2).padStart(2, '0');
      const yNum = currentMonth + 2 > 12 ? currentYear + 1 : currentYear;
      days.push({
        dateStr: `${yNum}-${mStr}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Weekly Days calculation
  const weeklyDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 = Sun
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days: Array<{ dateStr: string; dayNum: number; dayName: string }> = [];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesKo = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        dateStr: iso,
        dayNum: d.getDate(),
        dayName: language === 'ko' ? dayNamesKo[i] : dayNamesEn[i]
      });
    }
    return days;
  }, [currentDate, language]);

  // Submit new meeting
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    const res = addMeetingAgenda({
      title: meetingTitle.trim(),
      date: meetingDate,
      start_time: startTime,
      end_time: endTime,
      type: 'hq_sync',
      location_or_link: locationOrLink,
      attendees: attendees.length > 0 ? attendees : [currentUser.full_name],
      notes: meetingNotes,
      host_name: currentUser.full_name
    });

    setNotification(res.message);
    setIsNewMeetingModalOpen(false);
    setMeetingTitle('');
    setMeetingNotes('');
    setTimeout(() => setNotification(null), 4000);
  };

  // Month Name Formatter
  const monthTitle = useMemo(() => {
    const monthNamesEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesKo = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    if (language === 'ko') {
      return `${currentYear}년 ${monthNamesKo[currentMonth]}`;
    }
    return `${monthNamesEn[currentMonth]} ${currentYear}`;
  }, [currentYear, currentMonth, language]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.date === selectedDate);
  }, [filteredEvents, selectedDate]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{whitelabelConfig.brand_name} Multi-Channel Production Calendar</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Space_Grotesk']">
              {language === 'ko' ? '통합 프로덕션 & 캠페인 캘린더' : 'Master Production & Campaign Calendar'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {language === 'ko'
                ? '디자인 요청 일정, 프로모션 캠페인, 현장 방문 촬영, 본사 예산 승인 및 팀 미팅 아젠다를 한눈에 관리합니다.'
                : 'Track design deadlines, promo schedules, photoshoot visits, HQ budget disbursements, and team sync meetings.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNewMeetingModalOpen(true)}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ko' ? '회의 일정 등록' : 'Schedule Meeting'}</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Calendar Toolbar */}
      <div className="bg-white dark:bg-[#15171e] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Date Navigator */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 font-bold text-[11px] text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              {language === 'ko' ? '오늘' : 'Today'}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 font-['Space_Grotesk'] ml-2">
            {viewMode === 'daily' ? selectedDate : monthTitle}
          </h2>
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <ListFilter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-bold text-[11px] text-slate-700 dark:text-slate-200 outline-none px-1.5 py-0.5 cursor-pointer"
            >
              <option value="all">{language === 'ko' ? '전체 항목 (All)' : 'All Channels'}</option>
              <option value="design">{language === 'ko' ? '디자인 요청 (Design)' : 'Design Requests'}</option>
              <option value="promo">{language === 'ko' ? '프로모션 캠페인 (Promo)' : 'Promo Campaigns'}</option>
              <option value="shoot">{language === 'ko' ? '현장 촬영 (Shoots)' : 'Photoshoot Visits'}</option>
              <option value="budget">{language === 'ko' ? '예산 승인 (Budgets)' : 'Budget Requests'}</option>
              <option value="meeting">{language === 'ko' ? '팀 회의 (Meetings)' : 'Meeting Agendas'}</option>
            </select>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['monthly', 'weekly', 'daily'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode === 'monthly'
                  ? (language === 'ko' ? '월간' : 'Monthly')
                  : mode === 'weekly'
                  ? (language === 'ko' ? '주간' : 'Weekly')
                  : (language === 'ko' ? '일간' : 'Daily')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* VIEW: MONTHLY GRID                                         */}
      {/* ========================================================== */}
      {viewMode === 'monthly' && (
        <div className="bg-white dark:bg-[#15171e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center font-bold text-[11px] text-slate-600 dark:text-slate-400 py-2.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
              <div key={d}>
                {language === 'ko' ? ['일', '월', '화', '수', '목', '금', '토'][idx] : d}
              </div>
            ))}
          </div>

          {/* 7-col grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
            {monthDays.map((cell) => {
              const dayEvents = filteredEvents.filter((e) => e.date === cell.dateStr);
              const isToday = cell.dateStr === simulatedDate;
              const isSelected = cell.dateStr === selectedDate;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 transition flex flex-col justify-between cursor-pointer ${
                    !cell.isCurrentMonth ? 'opacity-35 bg-slate-50/50 dark:bg-slate-900/30' : ''
                  } ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-md w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : isSelected
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border truncate cursor-pointer ${ev.color}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-bold pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW: WEEKLY VIEW                                          */}
      {/* ========================================================== */}
      {viewMode === 'weekly' && (
        <div className="bg-white dark:bg-[#15171e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {weeklyDays.map((w) => {
              const dayEvents = filteredEvents.filter((e) => e.date === w.dateStr);
              const isToday = w.dateStr === simulatedDate;

              return (
                <div key={w.dateStr} className="p-3 min-h-[260px] flex flex-col">
                  <div className={`p-2 rounded-xl text-center mb-3 ${
                    isToday ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}>
                    <div className="text-[10px] uppercase font-bold">{w.dayName}</div>
                    <div className="text-base font-black">{w.dayNum}</div>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayEvents.length === 0 ? (
                      <div className="text-[11px] text-slate-400 text-center py-4 italic">
                        {language === 'ko' ? '일정 없음' : 'No agenda'}
                      </div>
                    ) : (
                      dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-2 rounded-xl border text-[11px] cursor-pointer hover:shadow-xs transition ${ev.color}`}
                        >
                          <div className="font-bold line-clamp-1">{ev.title}</div>
                          <div className="text-[10px] opacity-80 line-clamp-2 mt-0.5">{ev.details}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW: DAILY VIEW                                           */}
      {/* ========================================================== */}
      {viewMode === 'daily' && (
        <div className="bg-white dark:bg-[#15171e] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              <span>
                {language === 'ko' ? `${selectedDate} 상세 일정` : `Detailed Agendas for ${selectedDate}`}
              </span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {selectedDateEvents.length} {language === 'ko' ? '건 항목' : 'events scheduled'}
            </span>
          </div>

          <div className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {language === 'ko' ? '선택한 날짜에 예정된 일정이 없습니다.' : 'No events scheduled for this date.'}
              </div>
            ) : (
              selectedDateEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition ${ev.color}`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-xs sm:text-sm">{ev.title}</div>
                    <div className="text-xs opacity-90">{ev.details}</div>
                  </div>
                  <button className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl text-xs font-bold">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Day Agenda Drawer Card */}
      <div className="bg-white dark:bg-[#15171e] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>
              {language === 'ko' ? `선택일 일정 요약 (${selectedDate})` : `Selected Date Deliverables (${selectedDate})`}
            </span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {selectedDateEvents.length} {language === 'ko' ? '건 등록됨' : 'Items'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedDateEvents.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-slate-400">
              {language === 'ko' ? '이 날짜에 배정된 일정이나 마감 요청이 없습니다.' : 'No scheduled deliverables or meetings for this date.'}
            </div>
          ) : (
            selectedDateEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`p-3 rounded-2xl border transition hover:shadow-md cursor-pointer ${ev.color}`}
              >
                <div className="font-bold text-xs line-clamp-1">{ev.title}</div>
                <div className="text-[11px] opacity-80 line-clamp-2 mt-1">{ev.details}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* MODAL: NEW MEETING AGENDA                                  */}
      {/* ========================================================== */}
      {isNewMeetingModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'ko' ? '새 회의 및 아젠다 등록' : 'Schedule Team Sync / Meeting'}</span>
              </h3>
              <button onClick={() => setIsNewMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '회의 주제' : 'Meeting Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ko' ? '예: Q4 신메뉴 론칭 브리핑 및 마케팅 전략' : 'e.g. Q4 Menu Launch & Social Strategy'}
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '회의 일자' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '시작 시간' : 'Start Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '종료 시간' : 'End Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '장소 / 화상회의 링크' : 'Location / Meet Link'}
                </label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/abc-xyz or HQ Studio 2"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '아젠다 및 회의 메모' : 'Agenda Notes'}
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'ko' ? '논의할 주요 내용...' : 'Key discussion points...'}
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{language === 'ko' ? '일정 캘린더 등록' : 'Schedule on Calendar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================== */}
      {/* MODAL: EVENT DETAIL INSPECTOR                              */}
      {/* ========================================================== */}
      {selectedEvent && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15171e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {selectedEvent.type === 'design' && <Palette className="w-4 h-4 text-amber-500" />}
                  {selectedEvent.type === 'promo' && <Tag className="w-4 h-4 text-purple-500" />}
                  {selectedEvent.type === 'shoot' && <Camera className="w-4 h-4 text-sky-500" />}
                  {selectedEvent.type === 'budget' && <DollarSign className="w-4 h-4 text-emerald-500" />}
                  {selectedEvent.type === 'meeting' && <CalendarIcon className="w-4 h-4 text-indigo-500" />}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedEvent.title}</h3>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedEvent.date}</div>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="text-slate-700 dark:text-slate-300">{selectedEvent.details}</div>
              {selectedEvent.status && (
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Status:</span>
                  <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">{selectedEvent.status}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {selectedEvent.type === 'meeting' && isHQ && (
                <button
                  onClick={() => {
                    deleteMeetingAgenda(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'ko' ? '회의 삭제' : 'Delete'}</span>
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="ml-auto px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
