import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { WhitelabelConfig } from '../types.ts';
import { THEME_PRESETS, getThemeColors } from '../utils/theme.ts';
import {
  Palette,
  Building2,
  CreditCard,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Eye,
  Save,
  Sparkles,
  FileText,
  ShieldCheck,
  Globe2,
  DollarSign,
  Pipette,
  Check,
  Layers,
  Flame,
  Info,
  Clock,
  MapPin,
  ArrowRightLeft
} from 'lucide-react';
import { TIMEZONE_PRESETS, getOfficeTimeInfo } from '../utils/timezone.ts';

export const WhitelabelSettings: React.FC = () => {
  const {
    whitelabelConfig,
    updateWhitelabelConfig,
    resetWhitelabelConfig,
    themeColors: activeGlobalTheme,
    t,
    language
  } = usePortal();

  const [form, setForm] = useState<WhitelabelConfig>({ ...whitelabelConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute preview theme colors dynamically from form state
  const previewColors = getThemeColors(form);

  const themePresetList = [
    {
      id: 'kinetic_orange',
      name: language === 'ko' ? '키네틱 오렌지 (시그니처 / Moggumung)' : 'Kinetic Orange (Original / Attached Brand)',
      hex: '#FF5B26',
      badge: 'Brand Energy'
    },
    {
      id: 'deep_black',
      name: language === 'ko' ? '딥 블랙 (모던 모노크롬)' : 'Deep Obsidian Black (Monochrome)',
      hex: '#121214'
    },
    {
      id: 'sky',
      name: language === 'ko' ? '일렉트릭 스카이 블루' : 'Electric Sky Blue',
      hex: '#0284C7'
    },
    {
      id: 'emerald',
      name: language === 'ko' ? '에메랄드 제이드' : 'Emerald Jade',
      hex: '#10B981'
    },
    {
      id: 'indigo',
      name: language === 'ko' ? '로열 인디고' : 'Deep Royal Indigo',
      hex: '#6366F1'
    },
    {
      id: 'rose',
      name: language === 'ko' ? '크림슨 로즈' : 'Crimson Rose',
      hex: '#F43F5E'
    },
    {
      id: 'amber',
      name: language === 'ko' ? '골든 앰버' : 'Golden Amber',
      hex: '#F59E0B'
    },
    {
      id: 'slate',
      name: language === 'ko' ? '이그제큐티브 슬레이트' : 'Executive Slate',
      hex: '#334155'
    }
  ];

  const handleSelectPreset = (presetId: string, hex: string) => {
    setForm((prev) => ({
      ...prev,
      theme_accent: presetId as any,
      custom_primary_hex: hex
    }));
  };

  const handleCustomHexChange = (hex: string) => {
    setForm((prev) => ({
      ...prev,
      theme_accent: 'custom',
      custom_primary_hex: hex
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhitelabelConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleReset = () => {
    if (confirm(language === 'ko' ? '기본 설정으로 초기화하시겠습니까?' : 'Reset to factory default settings?')) {
      resetWhitelabelConfig();
      setForm({
        ...whitelabelConfig,
        theme_accent: 'kinetic_orange',
        custom_primary_hex: '#FF5B26'
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#121214] via-slate-900 to-[#121214] rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: previewColors.primaryLight, color: previewColors.primary }}
              className="p-3 rounded-2xl border border-current shadow-sm"
            >
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                {t('whitelabelTitle')}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('whitelabelSubtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('restoreDefaults')}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('saveWhitelabelSuccess')}</span>
        </div>
      )}

      {/* 2. Color System Philosophy Showcase Cards (Attached Image 1 Representation) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
              Color System Foundation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The site's design is based on a black-white-grey foundation with orange energy strokes.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Design Tokens
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pure White */}
          <div className="rounded-2xl p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-bold">#FFFFFF</span>
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white shadow-2xs" />
            </div>
            <div className="mt-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Pure White</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Stands for clarity, simplicity, and minimalism. Creates breathing space in the layout and makes accents pop.
              </p>
            </div>
          </div>

          {/* Card 2: Deep Black */}
          <div className="rounded-2xl p-4 border border-slate-800 bg-[#121214] text-white shadow-xs flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700 font-bold">#121214</span>
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700" />
            </div>
            <div className="mt-3">
              <h3 className="font-extrabold text-sm text-white">Deep Black</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Represents strength, confidence, and contrast. Adds a premium feel and structural depth to the visual style.
              </p>
            </div>
          </div>

          {/* Card 3: Neutral Grey */}
          <div className="rounded-2xl p-4 border border-slate-300 dark:border-slate-700 bg-slate-500 text-white shadow-xs flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-white/80 bg-black/20 px-2 py-0.5 rounded-md font-bold">#64748B</span>
              <div className="w-3.5 h-3.5 rounded-full bg-slate-400 border border-slate-300" />
            </div>
            <div className="mt-3">
              <h3 className="font-extrabold text-sm text-white">Neutral Grey</h3>
              <p className="text-[11px] text-slate-100 mt-1 leading-snug">
                A color of balance and stability. Works as a soft background, enhancing contrast and highlighting main accents.
              </p>
            </div>
          </div>

          {/* Card 4: Kinetic Orange (Customizable / Upgradeable Energy Accent) */}
          <div
            style={{ backgroundColor: previewColors.primary, color: previewColors.textOnPrimary }}
            className="rounded-2xl p-4 shadow-md flex flex-col justify-between min-h-[140px] transition-colors duration-300 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] bg-black/20 px-2 py-0.5 rounded-md font-bold text-white">
                {previewColors.primary}
              </span>
              <Flame className="w-4 h-4 text-white/90" />
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white">
                  {form.theme_accent === 'kinetic_orange' ? 'Kinetic Orange' : 'Active Energy Accent'}
                </h3>
              </div>
              <p className="text-[11px] text-white/90 mt-1 leading-snug">
                Symbolizes energy, motion, and innovation. Instantly grabs attention, drives action, and is fully upgradeable below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-time Live Theme & Brand Preview Strip */}
      <div className="bg-[#121214] text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
            <Eye className="w-4 h-4" style={{ color: previewColors.primary }} />
            <span>{language === 'ko' ? '실시간 브랜딩 & 테마 컬러 미리보기' : 'Real-time Branding & Color Preview'}</span>
          </span>
          <span className="text-[11px] bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 font-mono">
            Primary Hex: <strong style={{ color: previewColors.primary }}>{previewColors.primary}</strong>
          </span>
        </div>

        {/* Live UI Components Demonstration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80">
          {/* A. Brand Monogram & Name */}
          <div className="flex items-center gap-3">
            {form.brand_logo_url ? (
              <img src={form.brand_logo_url} alt="Logo" className="w-10 h-10 object-contain rounded-2xl bg-white p-1" />
            ) : (
              <div
                style={{ backgroundColor: previewColors.primary, color: previewColors.textOnPrimary }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base tracking-tighter shadow-md transition-colors duration-300"
              >
                {form.brand_monogram || 'MG'}
              </div>
            )}
            <div className="truncate">
              <div className="font-extrabold text-sm text-white font-['Space_Grotesk'] truncate">
                {form.brand_name || 'BRAND NAME'}
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {form.brand_subtitle || 'Social Media Portal'}
              </p>
            </div>
          </div>

          {/* B. Simulated Sidebar Active Tab */}
          <div className="flex items-center justify-center">
            <div
              style={{
                backgroundColor: previewColors.primary,
                color: previewColors.textOnPrimary,
                boxShadow: `0 4px 14px ${previewColors.primaryLight}`
              }}
              className="px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 w-full justify-center transition-all duration-300"
            >
              <Building2 className="w-4 h-4" />
              <span>Sidebar Active Tab</span>
            </div>
          </div>

          {/* C. Simulated Action Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              style={{
                backgroundColor: previewColors.primary,
                color: previewColors.textOnPrimary
              }}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold w-full transition shadow-sm hover:opacity-95"
            >
              Primary Action Button
            </button>
          </div>

          {/* D. Simulated Badge & Accent */}
          <div className="flex items-center justify-center gap-2">
            <span
              style={{
                backgroundColor: previewColors.primaryLight,
                color: previewColors.primary,
                borderColor: previewColors.primaryBorder
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors duration-300"
            >
              Active Badge
            </span>
            <span
              style={{ backgroundColor: previewColors.primary }}
              className="w-2.5 h-2.5 rounded-full animate-pulse"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 4. Theme & Color Customizer Section (HIGHLIGHTED AS REQUESTED) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Palette className="w-5 h-5" style={{ color: previewColors.primary }} />
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
                  {language === 'ko' ? '테마 색상 & 업그레이드 가능한 화이트라벨 팔레트' : 'Theme Color & Whitelabel Dynamic Palette'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'ko'
                    ? '시그니처 컬러(키네틱 오렌지) 또는 가맹 프랜차이즈 고유 브랜드 컬러로 언제든지 자유롭게 변경할 수 있습니다.'
                    : 'Choose the signature attached kinetic orange or customize with your franchise brand color.'}
                </p>
              </div>
            </div>
          </div>

          {/* Preset Color Swatches */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3 uppercase tracking-wider">
              {language === 'ko' ? '프리셋 색상 선택 (클릭 시 즉시 적용)' : 'Select Theme Preset (Instant Preview)'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themePresetList.map((preset) => {
                const isSelected = form.theme_accent === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id, preset.hex)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 relative cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-md ring-2 ring-slate-900/10 dark:ring-white/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: preset.hex }}
                      className="w-7 h-7 rounded-xl shrink-0 shadow-xs border border-black/10 flex items-center justify-center text-white"
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {preset.name.split(' (')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {preset.hex}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Color Picker */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    id="custom-color-picker"
                    value={form.custom_primary_hex || '#FF5B26'}
                    onChange={(e) => handleCustomHexChange(e.target.value)}
                    className="w-11 h-11 rounded-2xl cursor-pointer border-0 p-0 overflow-hidden bg-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="custom-color-picker" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer block">
                    {language === 'ko' ? '커스텀 브랜드 컬러 피커' : 'Custom Brand Hex Color Picker'}
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'ko' ? '스펙트럼에서 색상을 직접 선택하거나 HEX 코드를 입력하세요.' : 'Pick any custom color or type your exact brand hex code.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">HEX:</span>
                <input
                  type="text"
                  maxLength={7}
                  placeholder="#FF5B26"
                  value={form.custom_primary_hex || ''}
                  onChange={(e) => handleCustomHexChange(e.target.value)}
                  className="w-28 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white p-2 text-xs font-mono font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-white uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleCustomHexChange(form.custom_primary_hex || '#FF5B26')}
                  style={{ backgroundColor: previewColors.primary, color: previewColors.textOnPrimary }}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                >
                  {language === 'ko' ? '적용' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Brand Identity & Franchise Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Identity */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 font-['Space_Grotesk']">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{t('brandIdentity')}</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t('brandNameLabel')}
              </label>
              <input
                type="text"
                required
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t('brandSubtitleLabel')}
              </label>
              <input
                type="text"
                value={form.brand_subtitle}
                onChange={(e) => setForm({ ...form, brand_subtitle: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('monogramLabel')}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={form.brand_monogram}
                  onChange={(e) => setForm({ ...form, brand_monogram: e.target.value.toUpperCase() })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('logoUrlLabel')}
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={form.brand_logo_url || ''}
                  onChange={(e) => setForm({ ...form, brand_logo_url: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('companyLegalNameLabel')}
                </label>
                <input
                  type="text"
                  value={form.company_legal_name}
                  onChange={(e) => setForm({ ...form, company_legal_name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('hqLocationLabel')}
                </label>
                <input
                  type="text"
                  value={form.hq_location}
                  onChange={(e) => setForm({ ...form, hq_location: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t('hqAddressLabel')}
              </label>
              <input
                type="text"
                value={form.hq_address}
                onChange={(e) => setForm({ ...form, hq_address: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('contactEmailLabel')}
                </label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('contactWhatsappLabel')}
                </label>
                <input
                  type="text"
                  value={form.contact_whatsapp}
                  onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Office Region & Timezone Settings */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-['Space_Grotesk']">
                  <Globe2 className="w-4 h-4 text-amber-500" />
                  <span>{language === 'ko' ? '본사 리전 & 타임존 설정 (Office Region & Timezone)' : 'Region Kantor & Zona Waktu Jam'}</span>
                </label>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  {form.timezone_label || 'WITA'} ({form.timezone_id || 'Asia/Makassar'})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'ko'
                  ? '본사 국가와 도시를 설정하면 포털 시계 및 출퇴근 기록이 본사 기준 시간으로 작동하며, 접속자 위치와의 시차를 실시간으로 자동 표기합니다.'
                  : 'Atur negara dan kota kantor pusat agar jam portal & presensi sesuai zona waktu kantor. Jika jam user berbeda dengan kantor, selisih jam akan otomatis dituliskan.'}
              </p>

              {/* Quick Presets selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {language === 'ko' ? '빠른 리전 선택 (Presets):' : 'Pilihan Cepat Region Kantor (Preset):'}
                </label>
                <select
                  value={form.timezone_id || 'Asia/Makassar'}
                  onChange={(e) => {
                    const selected = TIMEZONE_PRESETS.find(p => p.timezoneId === e.target.value);
                    if (selected) {
                      setForm({
                        ...form,
                        office_country: selected.country,
                        office_city: selected.city.split('/')[0].trim(),
                        timezone_id: selected.timezoneId,
                        timezone_label: selected.label
                      });
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-semibold cursor-pointer focus:ring-2 focus:ring-amber-500"
                >
                  {TIMEZONE_PRESETS.map((p) => (
                    <option key={p.timezoneId} value={p.timezoneId}>
                      {p.country} - {p.city} ({p.label}, {p.utcOffset})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '국가 (Country)' : 'Negara Kantor'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indonesia, South Korea, Singapore"
                    value={form.office_country || ''}
                    onChange={(e) => setForm({ ...form, office_country: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '도시 / 본사 위치 (City)' : 'Kota Kantor'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bali, Jakarta, Seoul, Tokyo"
                    value={form.office_city || ''}
                    onChange={(e) => setForm({ ...form, office_city: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? 'IANA 타임존 ID' : 'IANA Timezone ID'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Asia/Makassar, Asia/Jakarta, Asia/Seoul"
                    value={form.timezone_id || 'Asia/Makassar'}
                    onChange={(e) => setForm({ ...form, timezone_id: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-mono focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'ko' ? '타임존 약어 표기' : 'Label Singkatan Zona Waktu'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WITA, WIB, WIT, KST, SGT"
                    value={form.timezone_label || 'WITA'}
                    onChange={(e) => setForm({ ...form, timezone_label: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-bold font-mono uppercase focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Dynamic Live Timezone Preview Pill */}
              {(() => {
                const previewInfo = getOfficeTimeInfo(
                  new Date(),
                  form.timezone_id || 'Asia/Makassar',
                  form.timezone_label || 'WITA',
                  form.office_city || 'Bali',
                  form.office_country || 'Indonesia',
                  language as any
                );
                return (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>{language === 'ko' ? '실시간 본사 시계 미리보기:' : 'Pratinjau Jam Kantor & Selisih:'}</span>
                      </span>
                      <span className="font-mono text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg">
                        {previewInfo.officeTimeString} {previewInfo.officeLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>
                        🏢 <strong>{language === 'ko' ? '본사 위치:' : 'Lokasi Kantor:'}</strong> {previewInfo.officeLocation}
                      </div>
                      <div>
                        💻 <strong>{language === 'ko' ? '내 기기/브라우저:' : 'Waktu Perangkat Anda:'}</strong> {previewInfo.localTimeString} ({previewInfo.localLabel})
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5 pt-1 border-t border-amber-500/20">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>
                        {previewInfo.isDifferent
                          ? `${language === 'ko' ? '시차 감지됨:' : 'Selisih waktu terdeteksi:'} ${previewInfo.diffDescription} (Jam lokal ${previewInfo.localTimeString})`
                          : (language === 'ko' ? '기기 시간이 본사 시간과 일치합니다.' : 'Waktu perangkat Anda sama persis dengan jam kantor.')}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Banking & Operational Rules */}
          <div className="space-y-6">
            {/* Banking Setup */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 font-['Space_Grotesk']">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{t('bankingSection')}</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('bankNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('currencySymbolLabel')}
                  </label>
                  <input
                    type="text"
                    value={form.currency_symbol}
                    onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('bankAccNumberLabel')}
                  </label>
                  <input
                    type="text"
                    value={form.bank_account_number}
                    onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-mono focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('bankAccNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={form.bank_account_name}
                    onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('invoiceFooterNoteLabel')}
                </label>
                <textarea
                  rows={2}
                  value={form.invoice_note_footer}
                  onChange={(e) => setForm({ ...form, invoice_note_footer: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Quota & Workflow Rules */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 font-['Space_Grotesk']">
                <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('quotaPolicies')}</span>
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('defaultRetainerLabel')} ({form.currency_symbol})
                </label>
                <input
                  type="number"
                  value={form.default_monthly_retainer}
                  onChange={(e) => setForm({ ...form, default_monthly_retainer: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('maxDesignQuotaLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.max_monthly_design_requests}
                    onChange={(e) => setForm({ ...form, max_monthly_design_requests: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('maxPromoQuotaLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.max_monthly_active_promos}
                    onChange={(e) => setForm({ ...form, max_monthly_active_promos: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('leadDaysLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={form.design_min_lead_days}
                    onChange={(e) => setForm({ ...form, design_min_lead_days: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('promoCutoffLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={form.promo_cutoff_day_of_month}
                    onChange={(e) => setForm({ ...form, promo_cutoff_day_of_month: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Save button footer */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ko'
              ? '설정은 브라우저 저장소에 즉시 반영되며 사이드바, 바텀 메뉴, 버튼 색상이 동기화됩니다.'
              : 'Settings are saved immediately and updated across sidebar, mobile nav, and buttons.'}
          </span>
          <button
            type="submit"
            style={{
              backgroundColor: previewColors.primary,
              color: previewColors.textOnPrimary
            }}
            className="px-6 py-2.5 rounded-2xl font-bold text-xs shadow-md transition flex items-center gap-2 hover:opacity-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('saveSettings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
