import React, { useState, useRef } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { Lock, X, Check, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, Camera, Upload, User, Image, Sparkles } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80'
];

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, changePassword, updateUser, language, themeColors, t } = usePortal();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser.avatar_url || '');
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress image to canvas max 400x400
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarPreview(compressedDataUrl);
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setErrorMsg(language === 'ko' ? '이미지를 로드할 수 없습니다.' : 'Failed to load image file.');
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Save avatar
    updateUser(currentUser.id, { avatar_url: avatarPreview || undefined });

    // If changing password in the same modal
    if (newPassword.trim() || currentPassword.trim()) {
      const activePass = currentUser.password || '1';
      if (currentPassword !== activePass) {
        setErrorMsg(language === 'ko' ? '현재 비밀번호가 일치하지 않습니다.' : 'Current password is incorrect.');
        return;
      }
      if (!newPassword.trim()) {
        setErrorMsg(language === 'ko' ? '새 비밀번호를 입력해주세요.' : 'New password cannot be empty.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg(language === 'ko' ? '새 비밀번호 확인이 일치하지 않습니다.' : 'New password and confirmation do not match.');
        return;
      }

      const res = changePassword(currentUser.id, newPassword);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
    }

    setSuccessMsg(
      language === 'ko'
        ? '프로필 사진 및 계정 설정이 성공적으로 저장되었습니다!'
        : 'Profile picture and account settings updated successfully!'
    );

    setTimeout(() => {
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {language === 'ko' ? '프로필 및 비밀번호 변경' : 'Edit Profile & Account Settings'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.full_name} ({currentUser.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{language === 'ko' ? '프로필 사진 설정' : 'Profile Photo'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{language === 'ko' ? '비밀번호 변경' : 'Change Password'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          {/* 1. Profile Picture Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="relative group shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={currentUser.full_name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 shadow-md"
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: themeColors.primaryLight, color: themeColors.primary }}
                      className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl border-2 border-current shadow-md"
                    >
                      {currentUser.full_name.charAt(0)}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {currentUser.full_name}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {currentUser.role} • {currentUser.phone}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressing}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isCompressing ? (language === 'ko' ? '압축 중...' : 'Compressing...') : (language === 'ko' ? '사진 업로드' : 'Upload Photo')}</span>
                    </button>

                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview('')}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs cursor-pointer"
                      >
                        {language === 'ko' ? '초기화' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Preset Avatars */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'ko' ? '추천 프로필 아바타 선택' : 'Or choose a preset avatar'}:</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarPreview(preset)}
                      className={`relative rounded-full p-0.5 transition cursor-pointer hover:scale-105 ${
                        avatarPreview === preset ? 'ring-2 ring-purple-600 ring-offset-2' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Security / Change Password Tab */}
          {activeTab === 'security' && (
            <div className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('currentPasswordLabel')} (Default: "1")
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('newPasswordLabel')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('confirmPasswordLabel')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? (language === 'ko' ? '비밀번호 숨기기' : 'Hide Password') : (language === 'ko' ? '비밀번호 보기' : 'Show Password')}</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
              className="px-5 py-2 rounded-xl font-bold shadow-md hover:brightness-110 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'ko' ? '설정 및 사진 저장' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

