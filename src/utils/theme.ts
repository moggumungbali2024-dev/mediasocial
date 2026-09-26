import { WhitelabelConfig } from '../types.ts';

export interface ThemeColors {
  id: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryBorder: string;
  gradient: string;
  name: string;
  textOnPrimary: string;
  ring: string;
}

export const THEME_PRESETS: Record<string, ThemeColors> = {
  kinetic_orange: {
    id: 'kinetic_orange',
    primary: '#FF5B26',
    primaryHover: '#E44E10',
    primaryLight: 'rgba(255, 91, 38, 0.14)',
    primaryBorder: 'rgba(255, 91, 38, 0.4)',
    gradient: 'from-[#FF5B26] via-[#FF7A45] to-[#E44E10]',
    name: 'Kinetic Orange (Brand Signature / Attached)',
    textOnPrimary: '#FFFFFF',
    ring: 'focus:ring-[#FF5B26]'
  },
  deep_black: {
    id: 'deep_black',
    primary: '#121214',
    primaryHover: '#26262B',
    primaryLight: 'rgba(18, 18, 20, 0.1)',
    primaryBorder: 'rgba(18, 18, 20, 0.3)',
    gradient: 'from-[#121214] via-[#27272A] to-[#09090B]',
    name: 'Deep Obsidian Black',
    textOnPrimary: '#FFFFFF',
    ring: 'focus:ring-slate-900'
  },
  amber: {
    id: 'amber',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryLight: 'rgba(245, 158, 11, 0.14)',
    primaryBorder: 'rgba(245, 158, 11, 0.4)',
    gradient: 'from-[#F59E0B] via-[#FBBF24] to-[#D97706]',
    name: 'Golden Amber',
    textOnPrimary: '#0F172A',
    ring: 'focus:ring-amber-500'
  },
  emerald: {
    id: 'emerald',
    primary: '#10B981',
    primaryHover: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.14)',
    primaryBorder: 'rgba(16, 185, 129, 0.4)',
    gradient: 'from-[#10B981] via-[#34D399] to-[#059669]',
    name: 'Emerald Jade',
    textOnPrimary: '#FFFFFF',
    ring: 'focus:ring-emerald-500'
  },
  sky: {
    id: 'sky',
    primary: '#0284C7',
    primaryHover: '#0369A1',
    primaryLight: 'rgba(2, 132, 199, 0.14)',
    primaryBorder: 'rgba(2, 132, 199, 0.4)',
    gradient: 'from-[#0284C7] via-[#38BDF8] to-[#0369A1]',
    name: 'Electric Sky Blue',
    textOnPrimary: '#FFFFFF',
    ring: 'focus:ring-sky-500'
  },
  indigo: {
    id: 'indigo',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryLight: 'rgba(99, 102, 241, 0.14)',
    primaryBorder: 'rgba(99, 102, 241, 0.4)',
    gradient: 'from-[#6366F1] via-[#818CF8] to-[#4F46E5]',
    name: 'Royal Indigo',
    textOnPrimary: '#FFFFFF',
    ring: 'focus:ring-indigo-500'
  },
  rose: {
    id: 'rose',
    primary: '#F43F5E',
    primaryHover: '#E11D48',
    primaryLight: 'rgba(244, 63, 94, 0.14)',
    primaryBorder: 'rgba(244, 63, 94, 0.4)',
    gradient: 'from-[#F43F5E] via-[#FB7185] to-[#E11D48]',
    name: 'Crimson Rose',
    textOnPrimary: '#FFFFFF',
    ring: 'focus:ring-rose-500'
  },
  slate: {
    id: 'slate',
    primary: '#334155',
    primaryHover: '#1E293B',
    primaryLight: 'rgba(51, 65, 85, 0.14)',
    primaryBorder: 'rgba(51, 65, 85, 0.4)',
    gradient: 'from-[#334155] via-[#475569] to-[#1E293B]',
    name: 'Executive Slate',
    textOnPrimary: '#FFFFFF',
    ring: 'focus:ring-slate-600'
  }
};

/**
 * Checks contrast and determines if text on primary should be white or dark
 */
export function getContrastColor(hexColor: string): string {
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length !== 6) return '#FFFFFF';
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // YIQ formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0F172A' : '#FFFFFF';
}

export function getThemeColors(config: WhitelabelConfig): ThemeColors {
  if (config.theme_accent === 'custom' && config.custom_primary_hex) {
    const hex = config.custom_primary_hex;
    return {
      id: 'custom',
      primary: hex,
      primaryHover: hex,
      primaryLight: `${hex}22`,
      primaryBorder: `${hex}55`,
      gradient: `from-[${hex}] to-[${hex}]`,
      name: `Custom Brand (${hex})`,
      textOnPrimary: getContrastColor(hex),
      ring: 'focus:ring-slate-900'
    };
  }

  const preset = THEME_PRESETS[config.theme_accent] || THEME_PRESETS.kinetic_orange;
  if (config.custom_primary_hex && config.theme_accent === 'custom') {
    return {
      ...preset,
      primary: config.custom_primary_hex,
      textOnPrimary: getContrastColor(config.custom_primary_hex)
    };
  }
  return preset;
}

export function applyThemeVariables(config: WhitelabelConfig) {
  if (typeof document === 'undefined') return;
  const colors = getThemeColors(config);
  const root = document.documentElement;

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-hover', colors.primaryHover);
  root.style.setProperty('--color-primary-light', colors.primaryLight);
  root.style.setProperty('--color-primary-border', colors.primaryBorder);
  root.style.setProperty('--color-primary-text', colors.textOnPrimary);
}
