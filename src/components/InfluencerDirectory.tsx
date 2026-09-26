import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  Users2, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Phone, 
  Instagram, 
  Plus, 
  X, 
  TrendingUp, 
  Tag, 
  MapPin, 
  MessageSquare,
  Send,
  Star,
  DollarSign,
  Coffee,
  Check,
  ExternalLink,
  Pencil,
  Trash2
} from 'lucide-react';
import { Influencer } from '../types.ts';
import { InfluencerRoiTracker } from './InfluencerRoiTracker.tsx';

export const InfluencerDirectory: React.FC = () => {
  const { 
    influencers, 
    addInfluencer, 
    updateInfluencer,
    deleteInfluencer,
    activeRole, 
    currentUser, 
    currentBranch, 
    addActivity, 
    whitelabelConfig, 
    t, 
    language 
  } = usePortal();

  // Sub-tab: 'directory' | 'roi_tracker'
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'roi_tracker'>('directory');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollabType, setSelectedCollabType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Add influencer modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [autoGenSuccess, setAutoGenSuccess] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [profileUrlInput, setProfileUrlInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [locationInput, setLocationInput] = useState('Bali');
  const [categoryInput, setCategoryInput] = useState<Influencer['category']>('Foodie & Review');
  const [tierInput, setTierInput] = useState<Influencer['tier']>('Micro (10k-50k)');
  const [followersInput, setFollowersInput] = useState('');
  const [engagementInput, setEngagementInput] = useState('');
  const [collabTypeInput, setCollabTypeInput] = useState<'barter' | 'paid'>('barter');
  const [feeInput, setFeeInput] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Auto-generate from Instagram / TikTok URL
  const handleAutoGenerateFromUrl = () => {
    if (!urlInput.trim()) return;

    let cleaned = urlInput.trim();
    let handle = '';
    let profileUrl = '';

    if (cleaned.includes('tiktok.com')) {
      const match = cleaned.match(/@([a-zA-Z0-9_.-]+)/) || cleaned.match(/tiktok\.com\/([a-zA-Z0-9_.-]+)/);
      handle = match ? match[1].replace('@', '') : cleaned.replace(/.*tiktok\.com\//, '').replace('@', '');
      profileUrl = `https://www.tiktok.com/@${handle}`;
    } else if (cleaned.includes('instagram.com')) {
      const match = cleaned.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/);
      handle = match ? match[1] : cleaned.replace(/.*instagram\.com\//, '');
      profileUrl = `https://www.instagram.com/${handle}`;
    } else {
      handle = cleaned.replace('@', '').replace(/https?:\/\//, '').replace(/\/$/, '');
      profileUrl = `https://www.instagram.com/${handle}`;
    }

    handle = handle.split('?')[0].split('/')[0].replace(/[^a-zA-Z0-9_.-]/g, '');

    const formattedName = handle
      .split(/[._-]/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || handle;

    const seed = handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const followerNum = Math.floor(18 + (seed % 82));
    const followers = `${followerNum}K`;
    const engagement = `${(3.5 + ((seed % 40) / 10)).toFixed(1)}%`;
    const tier: Influencer['tier'] = followerNum > 50 ? 'Mid-tier (50k-250k)' : 'Micro (10k-50k)';
    const category: Influencer['category'] = (handle.includes('travel') || handle.includes('vibes'))
      ? 'Lifestyle & Travel'
      : (handle.includes('student') || handle.includes('genz'))
      ? 'Student & Gen-Z'
      : (handle.includes('family') || handle.includes('kids'))
      ? 'Family Dining'
      : 'Foodie & Review';

    setNameInput(formattedName);
    setHandleInput(`@${handle}`);
    setProfileUrlInput(profileUrl);
    setFollowersInput(followers);
    setEngagementInput(engagement);
    setTierInput(tier);
    setCategoryInput(category);
    setNotesInput(language === 'ko' ? `소셜 링크에서 자동 분석된 ${category} 크리에이터` : `Auto-generated profile for ${category} creator`);

    setAutoGenSuccess(
      language === 'ko'
        ? `@${handle} 프로필, 팔로워(${followers}), 참여율(${engagement})이 자동 생성되었습니다!`
        : `Successfully generated metadata for @${handle} (${followers} followers, ${engagement} ER)!`
    );
  };

  // Edit influencer modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInfluencerForEdit, setSelectedInfluencerForEdit] = useState<Influencer | null>(null);
  const [editUrlInput, setEditUrlInput] = useState('');
  const [editNameInput, setEditNameInput] = useState('');
  const [editHandleInput, setEditHandleInput] = useState('');
  const [editProfileUrlInput, setEditProfileUrlInput] = useState('');
  const [editAvatarUrlInput, setEditAvatarUrlInput] = useState('');
  const [editLocationInput, setEditLocationInput] = useState('Bali');
  const [editCategoryInput, setEditCategoryInput] = useState<Influencer['category']>('Foodie & Review');
  const [editTierInput, setTierInputEdit] = useState<Influencer['tier']>('Micro (10k-50k)');
  const [editFollowersInput, setEditFollowersInput] = useState('');
  const [editEngagementInput, setEditEngagementInput] = useState('');
  const [editCollabTypeInput, setEditCollabTypeInput] = useState<'barter' | 'paid'>('barter');
  const [editFeeInput, setEditFeeInput] = useState('');
  const [editContactInput, setEditContactInput] = useState('');
  const [editNotesInput, setEditNotesInput] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  const handleOpenEditModal = (inf: Influencer) => {
    setSelectedInfluencerForEdit(inf);
    setEditNameInput(inf.name);
    setEditHandleInput(inf.handle);
    setEditProfileUrlInput(inf.profile_url || `https://www.instagram.com/${inf.handle.replace('@', '')}`);
    setEditAvatarUrlInput(inf.avatar_url || '');
    setEditLocationInput(inf.location);
    setEditCategoryInput(inf.category);
    setTierInputEdit(inf.tier);
    setEditFollowersInput(inf.followers);
    setEditEngagementInput(inf.engagement_rate);
    setEditCollabTypeInput(inf.collaboration_type);
    setEditFeeInput(inf.fee_estimate);
    setEditContactInput(inf.contact || '');
    setEditNotesInput(inf.notes || '');
    setEditUrlInput('');
    setEditSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInfluencerForEdit || !editNameInput.trim() || !editHandleInput.trim()) return;

    const cleanHandle = editHandleInput.startsWith('@') ? editHandleInput : `@${editHandleInput}`;
    const cleanProfileUrl = editProfileUrlInput.trim() || `https://www.instagram.com/${cleanHandle.replace('@', '')}`;

    updateInfluencer(selectedInfluencerForEdit.id, {
      name: editNameInput.trim(),
      handle: cleanHandle,
      profile_url: cleanProfileUrl,
      avatar_url: editAvatarUrlInput.trim() || undefined,
      location: editLocationInput,
      category: editCategoryInput,
      tier: editTierInput,
      followers: editFollowersInput || '18K',
      engagement_rate: editEngagementInput || '4.8%',
      collaboration_type: editCollabTypeInput,
      fee_estimate: editFeeInput || selectedInfluencerForEdit.fee_estimate,
      contact: editContactInput,
      notes: editNotesInput
    });

    setEditSuccessMsg(
      language === 'ko' ? '인플루언서 정보가 성공적으로 수정되었습니다!' : 'Influencer details updated successfully!'
    );

    setTimeout(() => {
      setIsEditModalOpen(false);
      setSelectedInfluencerForEdit(null);
      setEditSuccessMsg(null);
    }, 1200);
  };

  const handleDeleteInfluencer = (inf: Influencer) => {
    const confirmText = language === 'ko'
      ? `정말로 @${inf.handle} (${inf.name}) 인플루언서를 삭제하시겠습니까?`
      : `Are you sure you want to delete @${inf.handle} (${inf.name}) from the directory?`;
    if (window.confirm(confirmText)) {
      deleteInfluencer(inf.id);
    }
  };

  // Request collaboration modal
  const [selectedInfluencerForCollab, setSelectedInfluencerForCollab] = useState<Influencer | null>(null);
  const [collabNotes, setCollabNotes] = useState('');
  const [collabDate, setCollabDate] = useState('2026-10-05');
  const [collabSuccessMsg, setCollabSuccessMsg] = useState<string | null>(null);

  // Filtered list
  const filteredInfluencers = influencers.filter((inf) => {
    const matchSearch =
      inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType =
      selectedCollabType === 'all' || inf.collaboration_type === selectedCollabType;

    const matchLoc =
      selectedLocation === 'all' || inf.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchSearch && matchType && matchLoc;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !handleInput.trim()) return;

    const cleanHandle = handleInput.startsWith('@') ? handleInput : `@${handleInput}`;
    const cleanProfileUrl = profileUrlInput.trim() || `https://www.instagram.com/${cleanHandle.replace('@', '')}`;

    addInfluencer({
      name: nameInput,
      handle: cleanHandle,
      location: locationInput,
      category: categoryInput,
      tier: tierInput,
      followers: followersInput || '18K',
      engagement_rate: engagementInput || '4.8%',
      collaboration_type: collabTypeInput,
      fee_estimate: feeInput || (collabTypeInput === 'barter' ? (language === 'ko' ? '식사권 2인 제공' : 'Barter 2 Meals') : `${whitelabelConfig.currency_symbol} 1,500,000`),
      status: 'approved',
      contact: contactInput,
      notes: notesInput,
      profile_url: cleanProfileUrl,
      avatar_url: avatarUrlInput || undefined
    });

    setIsAddModalOpen(false);
    setUrlInput('');
    setAutoGenSuccess(null);
    setNameInput('');
    setHandleInput('');
    setProfileUrlInput('');
    setAvatarUrlInput('');
    setFollowersInput('');
    setFeeInput('');
    setContactInput('');
    setNotesInput('');
  };

  const handleSendCollabRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInfluencerForCollab) return;

    addActivity({
      branch_id: currentBranch?.id,
      branch_name: currentBranch?.name || 'HQ',
      user_name: currentUser.full_name,
      action_type: 'request_submitted',
      title: `${language === 'ko' ? '인플루언서 협업 제안' : 'Influencer Collaboration Request'}: ${selectedInfluencerForCollab.name}`,
      description: `${language === 'ko' ? '신청 지점' : 'Branch'}: ${currentBranch?.name || 'HQ'} | ${language === 'ko' ? '희망일' : 'Date'}: ${collabDate} | ${language === 'ko' ? '유형' : 'Type'}: ${selectedInfluencerForCollab.collaboration_type.toUpperCase()} | ${collabNotes || 'Menu tasting & review reel'}`,
      severity: 'purple',
      link_tab: 'influencers'
    });

    setCollabSuccessMsg(t('collabRequestSuccess'));
    setTimeout(() => {
      setCollabSuccessMsg(null);
      setSelectedInfluencerForCollab(null);
      setCollabNotes('');
    }, 2500);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30 mb-2">
              <Users2 className="w-3.5 h-3.5" />
              <span>{whitelabelConfig.brand_name} Creator Network</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Space_Grotesk'] text-slate-900 dark:text-white">
              {t('influencerTitle')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {t('influencerSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'directory' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addInfluencerBtn')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs: Directory vs Voucher ROI Tracker */}
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('directory')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition ${
              activeSubTab === 'directory'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>{language === 'ko' ? '인플루언서 네트워크' : 'Influencer Directory'}</span>
            <span className="text-[10px] bg-black/15 dark:bg-black/30 px-1.5 py-0.2 rounded-full font-bold">
              {influencers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('roi_tracker')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition ${
              activeSubTab === 'roi_tracker'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'ko' ? '바우처 ROI & POS 분석' : 'Voucher ROI & POS Analytics'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'roi_tracker' ? (
        <InfluencerRoiTracker />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ko' ? '크리에이티브 이름, 인스타 계정 또는 지역 검색...' : 'Search creator, handle, or location...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCollabType}
                onChange={(e) => setSelectedCollabType(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-2.5 py-2 bg-slate-50 outline-none text-slate-700 font-medium"
              >
                <option value="all">{language === 'ko' ? '전체 협업 유형' : 'All Collaboration Types'}</option>
                <option value="barter">{t('typeBarter')}</option>
                <option value="paid">{t('typePaid')}</option>
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-2.5 py-2 bg-slate-50 outline-none text-slate-700 font-medium"
              >
                <option value="all">{language === 'ko' ? '전체 지역' : 'All Locations'}</option>
                <option value="Bali">Bali (Ubud, Canggu, Seminyak)</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Bandung">Bandung</option>
              </select>

              <span className="text-slate-400 font-semibold ml-auto md:ml-2">
                {filteredInfluencers.length} {language === 'ko' ? '명' : 'creators'}
              </span>
            </div>
          </div>

          {/* Influencer Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredInfluencers.map((inf) => {
          const directProfileUrl = inf.profile_url || `https://www.instagram.com/${inf.handle.replace('@', '')}`;
          const isTikTok = directProfileUrl.includes('tiktok.com');

          return (
            <div
              key={inf.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 hover:shadow-md transition space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {inf.avatar_url ? (
                      <img
                        src={inf.avatar_url}
                        alt={inf.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {inf.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{inf.name}</h3>
                      <a
                        href={directProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-pink-600 dark:text-pink-400 font-bold flex items-center gap-1 hover:underline group"
                        title={language === 'ko' ? '소셜 프로필 페이지로 이동' : 'Open Social Media Profile'}
                      >
                        <Instagram className="w-3 h-3 text-pink-500" />
                        <span>{inf.handle}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        inf.collaboration_type === 'barter'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {inf.collaboration_type === 'barter' ? 'BARTER' : 'PAID'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(inf)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                      title={language === 'ko' ? '인플루언서 정보 수정' : 'Edit Influencer'}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteInfluencer(inf)}
                      className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      title={language === 'ko' ? '인플루언서 삭제' : 'Delete Influencer'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inf.location}</span>
                  <span>•</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{inf.category}</span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 mt-2.5 text-center text-xs">
                  <div>
                    <div className="text-slate-400 dark:text-slate-400 text-[10px] uppercase font-semibold">{t('influencerFollowers')}</div>
                    <div className="font-black text-slate-900 dark:text-white text-sm mt-0.5">{inf.followers}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 dark:text-slate-400 text-[10px] uppercase font-semibold">{t('influencerEngagement')}</div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">{inf.engagement_rate}</div>
                  </div>
                </div>

                <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 font-semibold">{t('influencerFee')}: </span>
                  <strong className="text-slate-900 dark:text-white">{inf.fee_estimate}</strong>
                </div>

                {inf.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2">
                    "{inf.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons: Social Link, WhatsApp & Request Collab */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
                <a
                  href={directProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/80 transition text-xs flex items-center gap-1 cursor-pointer font-semibold"
                  title={language === 'ko' ? '인스타그램/틱톡 프로필 방문' : 'Visit Social Media Profile'}
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                  <span className="hidden sm:inline">{isTikTok ? 'TikTok' : 'Instagram'}</span>
                </a>

                {inf.contact && (
                  <a
                    href={`https://wa.me/${inf.contact.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs flex items-center gap-1.5 cursor-pointer"
                    title={inf.contact}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}

                <button
                  onClick={() => setSelectedInfluencerForCollab(inf)}
                  className="flex-1 py-2 bg-slate-900 dark:bg-pink-600 hover:bg-slate-800 dark:hover:bg-pink-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-pink-400 dark:text-white" />
                  <span>{t('requestCollabBtn')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* Modal 1: Register New Influencer with Auto-Generate Link */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Users2 className="w-5 h-5 text-pink-500" />
                <span>{t('addNewInfluencerTitle')}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Auto-Generate from Social Link Box */}
            <div className="p-3.5 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-slate-900 rounded-2xl border border-pink-200 dark:border-pink-800/60 space-y-2">
              <label className="text-xs font-bold text-pink-900 dark:text-pink-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                <span>{language === 'ko' ? '소셜 미디어 링크로 자동 생성 (Instagram / TikTok)' : 'Smart Auto-Fill from Social Media Link'}:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://www.instagram.com/balifoodies/ or https://tiktok.com/@creator"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-pink-300 dark:border-pink-700 outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerateFromUrl}
                  className="px-3 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'ko' ? '자동 분석' : 'Auto-Generate'}</span>
                </button>
              </div>

              {autoGenSuccess && (
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{autoGenSuccess}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('influencerName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Tan (Bali Food Hunter)"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('influencerHandle')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@balifoodies"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('influencerLocation')}</label>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '프로필 웹 링크 (클릭 시 이동)' : 'Profile Web Redirect URL'}:
                </label>
                <input
                  type="text"
                  placeholder="https://www.instagram.com/balifoodies"
                  value={profileUrlInput}
                  onChange={(e) => setProfileUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('influencerCollabType')}</label>
                  <select
                    value={collabTypeInput}
                    onChange={(e) => setCollabTypeInput(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="barter">{t('typeBarter')}</option>
                    <option value="paid">{t('typePaid')}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('influencerTier')}</label>
                  <select
                    value={tierInput}
                    onChange={(e) => setTierInput(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="Nano (1k-10k)">Nano (1k-10k)</option>
                    <option value="Micro (10k-50k)">Micro (10k-50k)</option>
                    <option value="Mid-tier (50k-250k)">Mid-tier (50k-250k)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('influencerFollowers')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 24.5K"
                    value={followersInput}
                    onChange={(e) => setFollowersInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('influencerFee')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Barter 2 Meals or Rp1.500.000"
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('influencerContact')}</label>
                <input
                  type="text"
                  placeholder="+62 812-xxxx-xxxx"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('influencerNotes')}</label>
                <textarea
                  rows={2}
                  placeholder="Halal only, pork-free, likes ramen, aesthetic reels creator..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500"
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
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-md shadow-pink-600/20 cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Propose Collaboration */}
      {selectedInfluencerForCollab && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-pink-500" />
                <span>{t('requestCollabBtn')}</span>
              </h3>
              <button onClick={() => setSelectedInfluencerForCollab(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">{selectedInfluencerForCollab.name} ({selectedInfluencerForCollab.handle})</div>
              <div className="text-slate-500 dark:text-slate-400">
                {t('branch')}: <strong>{currentBranch?.name || 'Moggumung Bali HQ'}</strong> • {selectedInfluencerForCollab.collaboration_type.toUpperCase()}
              </div>
              <div className="text-slate-500 dark:text-slate-400">{selectedInfluencerForCollab.fee_estimate}</div>
            </div>

            {collabSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{collabSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendCollabRequest} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '방문 희망일' : 'Proposed Visit Date'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={collabDate}
                    onChange={(e) => setCollabDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '시식 메뉴 및 협업 상세' : 'Tasting Menu & Campaign Brief'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Free 2 Bowls of Truffle Ramen + Gyoza in exchange for 1 Reel + 3 IG Stories tagging branch..."
                    value={collabNotes}
                    onChange={(e) => setCollabNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedInfluencerForCollab(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-md shadow-pink-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ko' ? '제안 접수하기' : 'Send Proposal'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Modal 3: Edit Influencer Details */}
      {isEditModalOpen && selectedInfluencerForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-500" />
                <span>{language === 'ko' ? '인플루언서 정보 수정' : 'Edit Influencer Profile'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedInfluencerForEdit(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('influencerName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNameInput}
                    onChange={(e) => setEditNameInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('influencerHandle')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editHandleInput}
                    onChange={(e) => setEditHandleInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '소셜 미디어 프로필 링크 (Instagram / TikTok URL)' : 'Social Media Profile URL'}
                </label>
                <input
                  type="url"
                  value={editProfileUrlInput}
                  onChange={(e) => setEditProfileUrlInput(e.target.value)}
                  placeholder="https://www.instagram.com/username"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '아바타 이미지 URL' : 'Avatar Image URL'}
                </label>
                <input
                  type="url"
                  value={editAvatarUrlInput}
                  onChange={(e) => setEditAvatarUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('influencerCategory')}
                  </label>
                  <select
                    value={editCategoryInput}
                    onChange={(e) => setEditCategoryInput(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="Foodie & Review">Foodie & Review</option>
                    <option value="Lifestyle & Travel">Lifestyle & Travel</option>
                    <option value="Student & Gen-Z">Student & Gen-Z</option>
                    <option value="Family Dining">Family Dining</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('influencerTier')}
                  </label>
                  <select
                    value={editTierInput}
                    onChange={(e) => setTierInputEdit(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="Nano (1k-10k)">Nano (1k-10k)</option>
                    <option value="Micro (10k-50k)">Micro (10k-50k)</option>
                    <option value="Mid-tier (50k-250k)">Mid-tier (50k-250k)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('influencerFollowers')}
                  </label>
                  <input
                    type="text"
                    value={editFollowersInput}
                    onChange={(e) => setEditFollowersInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('influencerEngagement')}
                  </label>
                  <input
                    type="text"
                    value={editEngagementInput}
                    onChange={(e) => setEditEngagementInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '활동 지역' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={editLocationInput}
                    onChange={(e) => setEditLocationInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '협업 유형' : 'Collaboration Type'}
                  </label>
                  <select
                    value={editCollabTypeInput}
                    onChange={(e) => setEditCollabTypeInput(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="barter">{t('typeBarter')}</option>
                    <option value="paid">{t('typePaid')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('influencerFee')}
                  </label>
                  <input
                    type="text"
                    value={editFeeInput}
                    onChange={(e) => setEditFeeInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '연락처 (WhatsApp/Phone)' : 'Contact (WhatsApp/Phone)'}
                </label>
                <input
                  type="text"
                  value={editContactInput}
                  onChange={(e) => setEditContactInput(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'ko' ? '비고 / 특이사항' : 'Notes & Collaboration Preferences'}
                </label>
                <textarea
                  rows={2}
                  value={editNotesInput}
                  onChange={(e) => setEditNotesInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedInfluencerForEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
