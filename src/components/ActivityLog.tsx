import React, { useState, useMemo } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Activity, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Upload, 
  CreditCard, 
  Sparkles, 
  DollarSign, 
  Filter, 
  Search, 
  CheckCheck, 
  Clock, 
  Building2, 
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { ActivityItem, ActivityActionType } from '../types.ts';

interface ActivityLogProps {
  onNavigateTab?: (tab: string) => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ onNavigateTab }) => {
  const { 
    activities, 
    activeRole, 
    isHQ,
    currentBranch, 
    currentUser, 
    branches,
    isActivityVisibleForUser,
    markActivityAsRead,
    markAllActivitiesAsRead,
    t,
    language
  } = usePortal();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    isHQ ? 'all' : (currentBranch?.id || 'all')
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter by user role/branch with strict privacy
  const userScopedActivities = useMemo(() => {
    return activities.filter((act) => isActivityVisibleForUser(act));
  }, [activities, isActivityVisibleForUser]);

  const filteredActivities = useMemo(() => {
    return userScopedActivities.filter((act) => {
      // Category filter
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'approvals' && act.action_type !== 'request_status_changed') {
          return false;
        }
        if (
          selectedFilter === 'billing' &&
          !['invoice_generated', 'charge_updated', 'payment_verified', 'custom_pricing_updated'].includes(act.action_type)
        ) {
          return false;
        }
        if (selectedFilter === 'uploads' && act.action_type !== 'proof_uploaded') {
          return false;
        }
        if (
          selectedFilter === 'requests' &&
          !['request_submitted', 'promo_submitted', 'shoot_requested', 'budget_requested'].includes(act.action_type)
        ) {
          return false;
        }
      }

      // Branch filter (if HQ)
      if (isHQ && selectedBranchFilter !== 'all') {
        if (act.branch_id !== selectedBranchFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(query);
        const matchDesc = act.description.toLowerCase().includes(query);
        const matchBranch = (act.branch_name || '').toLowerCase().includes(query);
        const matchUser = act.user_name.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchBranch && !matchUser) return false;
      }

      return true;
    });
  }, [userScopedActivities, selectedFilter, selectedBranchFilter, searchQuery, isHQ]);

  const getActionIcon = (actionType: ActivityActionType) => {
    switch (actionType) {
      case 'request_status_changed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'request_submitted':
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 'invoice_generated':
      case 'charge_updated':
      case 'custom_pricing_updated':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'proof_uploaded':
        return <Upload className="w-4 h-4 text-sky-600" />;
      case 'payment_verified':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'exposure_scheduled':
        return <Calendar className="w-4 h-4 text-pink-600" />;
      case 'promo_submitted':
      case 'promo_campaign_active':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'budget_requested':
      case 'budget_approved':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'shoot_requested':
        return <Activity className="w-4 h-4 text-sky-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getSeverityBadge = (act: ActivityItem) => {
    const isUnread = !act.read_by.includes(currentUser.id);
    return (
      <div className="flex items-center gap-1.5">
        {isUnread && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unread" />
        )}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            act.severity === 'success'
              ? 'bg-emerald-100 text-emerald-800'
              : act.severity === 'warning'
              ? 'bg-amber-100 text-amber-800'
              : act.severity === 'purple'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-sky-100 text-sky-800'
          }`}
        >
          {act.action_type.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>
    );
  };

  const handleItemClick = (act: ActivityItem) => {
    markActivityAsRead(act.id);
    if (act.link_tab && onNavigateTab) {
      onNavigateTab(act.link_tab);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Audit Trail &amp; Feed</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Space_Grotesk']">
              {t('activity')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {language === 'ko'
                ? '디자인 승인, 청구서 발행, 영수증 제출, 촬영 및 예산 승인 등 전체 포털 활동을 실시간으로 추적합니다.'
                : 'Real-time timeline of design reviews, retainers, payments, shoots, and budget allocations.'}
            </p>
          </div>

          <button
            onClick={markAllActivitiesAsRead}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start md:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('markAllAsRead')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-3.5 sm:p-4 space-y-3 text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'ko' ? '활동, 인보이스, 디자인 제목 또는 지점명 검색...' : 'Search activity, invoice, title, or branch...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Branch filter if HQ */}
          {isHQ && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">{t('branch')}:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium outline-none cursor-pointer"
              >
                <option value="all">{language === 'ko' ? '전체 지점' : 'All Branches'} ({branches.length})</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action type filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none no-scrollbar">
          {[
            { id: 'all', label: language === 'ko' ? '전체 피드' : 'All Activities' },
            { id: 'approvals', label: language === 'ko' ? '디자인 승인' : 'Design Approvals' },
            { id: 'billing', label: language === 'ko' ? '정산 및 결제' : 'Invoices & Retainers' },
            { id: 'uploads', label: language === 'ko' ? '영수증 제출' : 'Payment Proofs' },
            { id: 'requests', label: language === 'ko' ? '운영 요청' : 'Requests & Shoots' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            {language === 'ko' ? '해당 필터에 등록된 활동 로그가 없습니다.' : 'No activity records match this filter.'}
          </div>
        ) : (
          filteredActivities.map((act) => {
            const isUnread = !act.read_by.includes(currentUser.id);
            return (
              <div
                key={act.id}
                onClick={() => handleItemClick(act)}
                className={`p-4 sm:p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-start gap-3.5 ${
                  isUnread ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getActionIcon(act.action_type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(act)}
                      {act.branch_name && (
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {act.branch_name}
                        </span>
                      )}
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{act.title}</h4>
                    </div>

                    <span className="text-[11px] text-slate-400 dark:text-slate-400 font-mono">
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{act.description}</p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 dark:text-slate-400">
                    <span>by <strong className="text-slate-700 dark:text-slate-200">{act.user_name}</strong></span>
                    {act.link_tab && (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 hover:underline">
                        <span>{language === 'ko' ? '관련 화면 열기' : 'View Section'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
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
};
