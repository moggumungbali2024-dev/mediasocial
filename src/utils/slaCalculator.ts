import { DesignRequest } from '../types.ts';

export interface SlaInfo {
  status: 'on_track' | 'warning' | 'breached' | 'completed';
  hoursRemaining: number;
  minutesRemaining: number;
  hoursOverdue: number;
  percentElapsed: number; // 0 - 100
  badgeText: string;
  badgeSubtext: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    dot: string;
    bar: string;
  };
}

export function calculateDesignSla(req: DesignRequest, language: string = 'en'): SlaInfo {
  const isKo = language === 'ko';

  if (req.status === 'approved') {
    return {
      status: 'completed',
      hoursRemaining: 0,
      minutesRemaining: 0,
      hoursOverdue: 0,
      percentElapsed: 100,
      badgeText: isKo ? '완료됨' : 'SLA Met',
      badgeSubtext: isKo ? '정시 납품 완료' : 'Delivered On-Time',
      colorClass: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        bar: 'bg-emerald-500'
      }
    };
  }

  // Determine SLA duration in hours
  // Pending / In Progress: 48h SLA; Review: 24h SLA
  const totalSlaHours = req.sla_hours || (req.status === 'review' ? 24 : 48);
  const totalSlaMs = totalSlaHours * 60 * 60 * 1000;

  // Creation date parse
  const createdDate = new Date(req.created_at || Date.now());
  const now = new Date();

  // If target_date is given and closer or specific, use the earliest deadline
  let deadline = new Date(createdDate.getTime() + totalSlaMs);
  if (req.target_date) {
    const targetDateObj = new Date(`${req.target_date}T18:00:00`);
    if (!isNaN(targetDateObj.getTime()) && targetDateObj.getTime() < deadline.getTime()) {
      deadline = targetDateObj;
    }
  }

  const diffMs = deadline.getTime() - now.getTime();
  const elapsedMs = Math.max(0, now.getTime() - createdDate.getTime());
  const percentElapsed = Math.min(100, Math.round((elapsedMs / (deadline.getTime() - createdDate.getTime())) * 100)) || 0;

  if (diffMs <= 0) {
    const overdueMs = Math.abs(diffMs);
    const hoursOverdue = Math.floor(overdueMs / (1000 * 60 * 60));
    const minsOverdue = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      status: 'breached',
      hoursRemaining: 0,
      minutesRemaining: 0,
      hoursOverdue,
      percentElapsed: 100,
      badgeText: isKo ? `SLA 초과: ${hoursOverdue}시간` : `Overdue: ${hoursOverdue}h ${minsOverdue}m`,
      badgeSubtext: isKo ? '지연됨 (즉시 처리 필요)' : 'Deadline Breached',
      colorClass: {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500 animate-pulse',
        bar: 'bg-rose-500'
      }
    };
  }

  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hoursRemaining <= 12) {
    return {
      status: 'warning',
      hoursRemaining,
      minutesRemaining,
      hoursOverdue: 0,
      percentElapsed,
      badgeText: isKo ? `마감 임박: ${hoursRemaining}시간` : `Urgent: ${hoursRemaining}h ${minutesRemaining}m`,
      badgeSubtext: isKo ? '12시간 이내 마감' : 'Expiring Soon',
      colorClass: {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500 animate-ping',
        bar: 'bg-amber-500'
      }
    };
  }

  return {
    status: 'on_track',
    hoursRemaining,
    minutesRemaining,
    hoursOverdue: 0,
    percentElapsed,
    badgeText: isKo ? `SLA: ${hoursRemaining}시간 남음` : `SLA: ${hoursRemaining}h left`,
    badgeSubtext: isKo ? '정상 진행 중' : 'On Track',
    colorClass: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-500'
    }
  };
}
