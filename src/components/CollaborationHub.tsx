import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { 
  MessageSquare, 
  Send, 
  AtSign, 
  Link2, 
  Users, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Palette, 
  Tag, 
  Smile, 
  Paperclip, 
  X, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  Building,
  Image as ImageIcon,
  Video as VideoIcon,
  Maximize2,
  Download,
  AlertCircle
} from 'lucide-react';
import { TeamChatMessage } from '../types.ts';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🎉', '🚀', '✨', '💡', '🍕', '☕', '👏', '💯', '🙌', '🎨', '📈', '✅'];

const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😎', '🥳', '😏', '🤔', '🤫', '🤭', '😮', '😱', '🥺'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '✋', '👋', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🧠'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '✨', '⭐', '🌟', '💥', '💯'],
  work_objects: ['🎨', '📸', '🎥', '💻', '📱', '📊', '📈', '📉', '📁', '📂', '📄', '📝', '📌', '📍', '🏷️', '💼', '🚀', '⏰', '📅', '💡', '🔔', '📣', '🎯'],
  food_dining: ['☕', '🍵', '🧋', '🍕', '🍔', '🍟', '🍜', '🍲', '🍱', '🍙', '🍣', '🍤', '🥩', '🍗', '🥗', '🍩', '🍰', '🍦', '🍨', '🍻', '🥂']
};

export const CollaborationHub: React.FC = () => {
  const { 
    currentUser, 
    isHQ, 
    branches, 
    users, 
    designRequests, 
    promos, 
    teamChatMessages, 
    sendTeamChatMessage, 
    markChatAsRead,
    currentBranch,
    simulatedDate,
    whitelabelConfig,
    t,
    language
  } = usePortal();

  // Active channel: 'hq_internal' | 'branch_collab'
  const [activeChannel, setActiveChannel] = useState<'hq_internal' | 'branch_collab'>('branch_collab');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tag / Mention popover state
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionFilterQuery, setMentionFilterQuery] = useState('');
  const [selectedTaggedUsers, setSelectedTaggedUsers] = useState<string[]>([]);

  // Project Link popover state
  const [isLinkRequestOpen, setIsLinkRequestOpen] = useState(false);
  const [selectedLinkedRequest, setSelectedLinkedRequest] = useState<{ id: string; title: string } | null>(null);

  // Emoji Popover state
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');

  // Media Attachment state with Client Compression
  const [mediaAttachment, setMediaAttachment] = useState<{
    url: string;
    type: 'image' | 'video';
    fileName: string;
    originalSize?: string;
    compressedSize?: string;
  } | null>(null);
  const [isCompressingMedia, setIsCompressingMedia] = useState(false);

  // Image Lightbox zoom modal
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto mark channel as read
  useEffect(() => {
    markChatAsRead(activeChannel);
  }, [activeChannel, teamChatMessages.length]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [teamChatMessages, activeChannel]);

  // Handle typing input and inline @ detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const query = textBeforeCursor.slice(lastAtIdx + 1);
      // If there is no space after @ or it's a short name search
      if (!query.includes(' ') && query.length <= 15) {
        setMentionFilterQuery(query);
        setIsMentionOpen(true);
        return;
      }
    }
    setMentionFilterQuery('');
  };

  // Filtered users for mention
  const filteredMentionUsers = useMemo(() => {
    if (!mentionFilterQuery.trim()) return users;
    const q = mentionFilterQuery.toLowerCase();
    return users.filter((u) =>
      u.full_name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [users, mentionFilterQuery]);

  const handleSelectMentionUser = (user: { id: string; full_name: string }) => {
    // Replace @query with @FullName
    const cursor = inputRef.current?.selectionStart || messageInput.length;
    const textBeforeCursor = messageInput.slice(0, cursor);
    const textAfterCursor = messageInput.slice(cursor);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    let newText = messageInput;
    if (lastAtIdx !== -1) {
      const prefix = textBeforeCursor.slice(0, lastAtIdx);
      newText = `${prefix}@${user.full_name} ${textAfterCursor}`;
    } else {
      newText = `${messageInput}@${user.full_name} `;
    }

    setMessageInput(newText);
    if (!selectedTaggedUsers.includes(user.id)) {
      setSelectedTaggedUsers((prev) => [...prev, user.id]);
    }
    setIsMentionOpen(false);
    setMentionFilterQuery('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Handle Media Attachment with HTML5 Canvas Compression
  const handleFileAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalSizeKb = (file.size / 1024).toFixed(0);

    if (file.type.startsWith('image/')) {
      setIsCompressingMedia(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.70);
            const compressedSizeKb = (compressed.length * 0.75 / 1024).toFixed(0);

            setMediaAttachment({
              url: compressed,
              type: 'image',
              fileName: file.name,
              originalSize: `${originalSizeKb} KB`,
              compressedSize: `${compressedSizeKb} KB`
            });
          }
          setIsCompressingMedia(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      // For video, create object URL
      const videoUrl = URL.createObjectURL(file);
      setMediaAttachment({
        url: videoUrl,
        type: 'video',
        fileName: file.name,
        originalSize: `${originalSizeKb} KB`,
        compressedSize: `${originalSizeKb} KB`
      });
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setIsEmojiOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Messages in active channel
  const channelMessages = useMemo(() => {
    return teamChatMessages.filter((msg) => {
      const matchChannel = msg.channel === activeChannel;
      const matchSearch = searchQuery.trim() === '' || 
        msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchChannel && matchSearch;
    });
  }, [teamChatMessages, activeChannel, searchQuery]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !mediaAttachment) return;

    sendTeamChatMessage(
      activeChannel,
      messageInput,
      selectedTaggedUsers,
      selectedLinkedRequest?.id,
      selectedLinkedRequest?.title,
      mediaAttachment?.url,
      mediaAttachment?.type
    );

    setMessageInput('');
    setSelectedTaggedUsers([]);
    setSelectedLinkedRequest(null);
    setMediaAttachment(null);
    setIsMentionOpen(false);
    setIsLinkRequestOpen(false);
    setIsEmojiOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Banner - Compact on Mobile */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white shadow-xl border border-slate-800 w-full max-w-full overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1.5 sm:mb-2">
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{whitelabelConfig.brand_name} Collaboration</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight font-['Space_Grotesk']">
              {language === 'ko' ? 'HQ & 가맹점 실시간 협업 채널' : 'HQ & Branch Team Collaboration'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
              {language === 'ko'
                ? '본사 크리에이티브팀 및 지점 대표/스태프 간의 실시간 피드백, @멘션 태그 알림, 이미지/동영상 압축 첨부 및 디자인 요청 연동'
                : 'Real-time discussion between HQ and branch owners/managers. Tag team members with @mentions, attach compressed media, and link requests.'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Me" className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
              <span>{currentUser.full_name} ({currentUser.role})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating Sticky Channel Switcher for Mobile Devices */}
      <div className="flex sm:hidden items-center gap-1.5 sticky top-[52px] z-20 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-lg text-xs font-bold w-full">
        <button
          type="button"
          onClick={() => setActiveChannel('branch_collab')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeChannel === 'branch_collab'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{language === 'ko' ? '지점 협업' : 'Branch Collab'}</span>
        </button>

        {isHQ && (
          <button
            type="button"
            onClick={() => setActiveChannel('hq_internal')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeChannel === 'hq_internal'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'ko' ? 'HQ 내부' : 'HQ Internal'}</span>
          </button>
        )}
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[540px] w-full max-w-full overflow-hidden">
        {/* Left Col: Channel Directory & Members (Hidden on Mobile in favor of top tabs) */}
        <div className="hidden lg:flex lg:col-span-1 bg-white dark:bg-[#15171e] rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                {language === 'ko' ? '채널 목록' : 'Channels'}
              </h2>
            </div>

            {/* Channels List */}
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveChannel('branch_collab')}
                className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeChannel === 'branch_collab'
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <div>
                    <div className="text-xs font-bold">
                      {language === 'ko' ? '전체 지점 협업' : 'Branch Network'}
                    </div>
                    <div className={`text-[10px] ${activeChannel === 'branch_collab' ? 'text-purple-200' : 'text-slate-400'}`}>
                      HQ + Branch Owners
                    </div>
                  </div>
                </div>
              </button>

              {isHQ && (
                <button
                  onClick={() => setActiveChannel('hq_internal')}
                  className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between cursor-pointer ${
                    activeChannel === 'hq_internal'
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <div>
                      <div className="text-xs font-bold">
                        {language === 'ko' ? '본사 내부 회의실' : 'HQ Internal Studio'}
                      </div>
                      <div className={`text-[10px] ${activeChannel === 'hq_internal' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        Leader &amp; Creative Team
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Member Directory */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{language === 'ko' ? '팀원 목록 (@멘션 가능)' : 'Team Members'} ({users.length})</span>
              </h3>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectMentionUser(u)}
                    className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left cursor-pointer group"
                    title={`Click to tag @${u.full_name}`}
                  >
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.full_name} className="w-6 h-6 rounded-full object-cover shrink-0 border" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {u.full_name[0]}
                      </div>
                    )}
                    <div className="truncate flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {u.full_name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">{u.role}</div>
                    </div>
                    <AtSign className="w-3 h-3 text-slate-300 group-hover:text-purple-500 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Active Chat Feed & Message Input */}
        <div className="lg:col-span-3 bg-white dark:bg-[#15171e] rounded-3xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm flex flex-col justify-between space-y-3 sm:space-y-4 w-full max-w-full min-w-0 overflow-hidden">
          {/* Feed Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2 flex-wrap min-w-0">
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5 sm:gap-2 truncate">
                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="truncate">
                  {activeChannel === 'hq_internal'
                    ? (language === 'ko' ? '본사 내부 스튜디오' : 'HQ Internal Studio')
                    : (language === 'ko' ? '전체 지점 네트워크 협업' : 'Branch Network Collaboration')}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {channelMessages.length} {language === 'ko' ? '개 메시지' : 'messages'}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-32 sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'ko' ? '검색...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs border border-transparent focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3.5 pr-1 max-h-[420px] min-h-[280px] w-full max-w-full">
            {channelMessages.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-500" />
                <p>{language === 'ko' ? '아직 등록된 대화 내용이 없습니다. 첫 메시지를 작성해보세요!' : 'No messages in this channel yet. Start the conversation!'}</p>
              </div>
            ) : (
              channelMessages.map((msg) => {
                const isMe = msg.sender_id === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} text-xs w-full max-w-full`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 flex-wrap max-w-full">
                      {msg.sender_avatar && (
                        <img src={msg.sender_avatar} alt="Avatar" className="w-4 h-4 rounded-full object-cover shrink-0" />
                      )}
                      <span className="font-bold text-slate-700 dark:text-slate-300">{msg.sender_name}</span>
                      <span>•</span>
                      <span className="text-[10px]">{msg.sender_role}</span>
                      {msg.branch_name && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                            {msg.branch_name}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-mono text-[10px]">{msg.created_at}</span>
                    </div>

                    <div
                      className={`p-3 sm:p-3.5 rounded-2xl w-fit max-w-[88%] sm:max-w-md space-y-2 shadow-xs break-words [overflow-wrap:anywhere] min-w-0 ${
                        isMe
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      {/* Linked Request badge if attached */}
                      {msg.linked_request_id && (
                        <div
                          className={`p-1.5 px-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 max-w-full overflow-hidden ${
                            isMe ? 'bg-purple-700/80 text-purple-100' : 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          <Link2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">Linked: {msg.linked_request_title || msg.linked_request_id}</span>
                        </div>
                      )}

                      {/* Media Image Attachment */}
                      {msg.media_url && msg.media_type === 'image' && (
                        <div className="relative group rounded-xl overflow-hidden cursor-pointer max-w-full" onClick={() => setSelectedZoomImage(msg.media_url!)}>
                          <img
                            src={msg.media_url}
                            alt="Attachment"
                            className="max-h-56 sm:max-h-60 w-auto rounded-xl object-cover hover:scale-[1.02] transition duration-150"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>
                      )}

                      {/* Media Video Attachment */}
                      {msg.media_url && msg.media_type === 'video' && (
                        <div className="rounded-xl overflow-hidden bg-black max-w-full">
                          <video
                            src={msg.media_url}
                            controls
                            playsInline
                            className="w-full max-h-56 rounded-xl"
                          />
                        </div>
                      )}

                      {msg.message && (
                        <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.message}</p>
                      )}

                      {/* Tagged user mentions */}
                      {msg.tagged_user_names && msg.tagged_user_names.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-1 text-[10px] font-semibold opacity-90">
                          <AtSign className="w-3 h-3 shrink-0" />
                          <span>Tagged: {msg.tagged_user_names.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Media Attachment Preview Bar */}
          {mediaAttachment && (
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between gap-3 animate-in fade-in max-w-full overflow-hidden">
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                {mediaAttachment.type === 'image' ? (
                  <img src={mediaAttachment.url} alt="Attachment" className="w-10 h-10 rounded-xl object-cover border shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-purple-200 dark:bg-purple-900 flex items-center justify-center shrink-0">
                    <VideoIcon className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                  </div>
                )}
                <div className="truncate text-xs min-w-0">
                  <div className="font-bold text-purple-950 dark:text-purple-200 truncate">{mediaAttachment.fileName}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                    ✓ Compressed to {mediaAttachment.compressedSize} (from {mediaAttachment.originalSize})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMediaAttachment(null)}
                className="p-1 rounded-full text-slate-400 hover:text-red-500 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Reaction Emojis Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-base select-none no-scrollbar w-full max-w-full">
            {QUICK_EMOJIS.map((em, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddEmoji(em)}
                className="hover:scale-125 transition-transform p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Tagged users preview / Linked request preview bar */}
          {(selectedTaggedUsers.length > 0 || selectedLinkedRequest) && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-300 flex-wrap max-w-full overflow-hidden">
              {selectedTaggedUsers.length > 0 && (
                <div className="flex items-center gap-1 min-w-0 truncate">
                  <AtSign className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">
                    Tagged: {selectedTaggedUsers.map((uid) => users.find((x) => x.id === uid)?.full_name).join(', ')}
                  </span>
                  <button onClick={() => setSelectedTaggedUsers([])} className="hover:text-red-500 ml-1 cursor-pointer shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {selectedLinkedRequest && (
                <div className="flex items-center gap-1 ml-auto min-w-0 truncate">
                  <Link2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">Project: {selectedLinkedRequest.title}</span>
                  <button onClick={() => setSelectedLinkedRequest(null)} className="hover:text-red-500 ml-1 cursor-pointer shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 relative w-full min-w-0">
            {/* Popovers: Dynamic @ Mention Search Popup */}
            {isMentionOpen && (
              <div className="absolute bottom-full left-0 right-0 sm:right-auto mb-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full sm:w-80 max-w-[calc(100vw-32px)] space-y-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between font-bold text-[11px] text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <AtSign className="w-3.5 h-3.5 text-purple-600" />
                    {language === 'ko' ? '팀원 멘션 태그' : 'Tag Team Member (@mention)'}
                  </span>
                  <button type="button" onClick={() => setIsMentionOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {filteredMentionUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectMentionUser(u)}
                      className="w-full text-left p-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-950/60 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-purple-200 dark:bg-purple-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {u.full_name[0]}
                          </div>
                        )}
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{u.full_name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0 ml-1">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popover: Emoji Picker */}
            {isEmojiOpen && (
              <div className="absolute bottom-full left-0 sm:left-12 right-0 sm:right-auto mb-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full sm:w-80 max-w-[calc(100vw-32px)] space-y-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEmojiCategory(cat)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                          emojiCategory === cat
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setIsEmojiOpen(false)} className="text-slate-400 hover:text-slate-600 ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto text-lg p-1">
                  {EMOJI_CATEGORIES[emojiCategory].map((em, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddEmoji(em)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-125 transition-transform flex items-center justify-center cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popover: Link Project Request */}
            {isLinkRequestOpen && (
              <div className="absolute bottom-full left-0 sm:left-24 right-0 sm:right-auto mb-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full sm:w-80 max-w-[calc(100vw-32px)] space-y-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                  <span className="truncate">{language === 'ko' ? '디자인 / 프로모션 프로젝트 연결' : 'Link Request or Campaign'}:</span>
                  <button type="button" onClick={() => setIsLinkRequestOpen(false)} className="text-slate-400 hover:text-slate-600 ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 max-h-44 overflow-y-auto">
                  {designRequests.map((req) => (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => {
                        setSelectedLinkedRequest({ id: req.id, title: req.title });
                        setIsLinkRequestOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs truncate hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 cursor-pointer transition"
                    >
                      🎨 {req.title}
                    </button>
                  ))}
                  {promos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedLinkedRequest({ id: p.id, title: p.title });
                        setIsLinkRequestOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs truncate hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 cursor-pointer transition"
                    >
                      🏷️ {p.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileAttachmentChange}
              className="hidden"
            />

            <div className="flex items-center gap-1 sm:gap-2 w-full min-w-0">
              {/* Media Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressingMedia}
                className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
                title={language === 'ko' ? '사진/동영상 첨부 (자동 압축)' : 'Attach Photo/Video (Auto-compressed)'}
              >
                <Paperclip className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </button>

              {/* Emoji Picker Button */}
              <button
                type="button"
                onClick={() => {
                  setIsEmojiOpen(!isEmojiOpen);
                  setIsMentionOpen(false);
                  setIsLinkRequestOpen(false);
                }}
                className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
                title="Emoji"
              >
                <Smile className="w-4 h-4 text-amber-500" />
              </button>

              {/* Mention Tag Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMentionOpen(!isMentionOpen);
                  setIsLinkRequestOpen(false);
                  setIsEmojiOpen(false);
                }}
                className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
                title="Tag Member (@)"
              >
                <AtSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>

              {/* Link Project Button */}
              <button
                type="button"
                onClick={() => {
                  setIsLinkRequestOpen(!isLinkRequestOpen);
                  setIsMentionOpen(false);
                  setIsEmojiOpen(false);
                }}
                className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer hidden md:inline-flex shrink-0"
                title="Link Project / Request"
              >
                <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>

              <input
                ref={inputRef}
                type="text"
                placeholder={language === 'ko' ? '메시지 입력 (@멘션, 미디어 첨부)...' : 'Type message here (@mention, attach)...'}
                value={messageInput}
                onChange={handleInputChange}
                className="min-w-0 flex-1 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <button
                type="submit"
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'ko' ? '전송' : 'Send'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Lightbox Zoom Modal */}
      {selectedZoomImage && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedZoomImage}
              alt="Zoomed Image"
              className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl border border-slate-800"
            />
            <button
              onClick={() => setSelectedZoomImage(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

