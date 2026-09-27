// Timezone & Office Region Utilities for Mediasocial Portal

export interface TimezonePreset {
  country: string;
  city: string;
  timezoneId: string;
  label: string;
  utcOffset: string;
}

export const TIMEZONE_PRESETS: TimezonePreset[] = [
  { country: 'Indonesia', city: 'Bali / Denpasar', timezoneId: 'Asia/Makassar', label: 'WITA', utcOffset: 'UTC+8' },
  { country: 'Indonesia', city: 'Jakarta / Surabaya', timezoneId: 'Asia/Jakarta', label: 'WIB', utcOffset: 'UTC+7' },
  { country: 'Indonesia', city: 'Jayapura / Papua', timezoneId: 'Asia/Jayapura', label: 'WIT', utcOffset: 'UTC+9' },
  { country: 'South Korea', city: 'Seoul', timezoneId: 'Asia/Seoul', label: 'KST', utcOffset: 'UTC+9' },
  { country: 'Singapore', city: 'Singapore', timezoneId: 'Asia/Singapore', label: 'SGT', utcOffset: 'UTC+8' },
  { country: 'Malaysia', city: 'Kuala Lumpur', timezoneId: 'Asia/Kuala_Lumpur', label: 'MYT', utcOffset: 'UTC+8' },
  { country: 'Japan', city: 'Tokyo', timezoneId: 'Asia/Tokyo', label: 'JST', utcOffset: 'UTC+9' },
  { country: 'Australia', city: 'Sydney', timezoneId: 'Australia/Sydney', label: 'AEST', utcOffset: 'UTC+10' },
  { country: 'United Kingdom', city: 'London', timezoneId: 'Europe/London', label: 'GMT/BST', utcOffset: 'UTC+0' },
  { country: 'United States', city: 'New York', timezoneId: 'America/New_York', label: 'EST/EDT', utcOffset: 'UTC-5' },
  { country: 'United States', city: 'Los Angeles', timezoneId: 'America/Los_Angeles', label: 'PST/PDT', utcOffset: 'UTC-8' },
  { country: 'United Arab Emirates', city: 'Dubai', timezoneId: 'Asia/Dubai', label: 'GST', utcOffset: 'UTC+4' }
];

export interface OfficeTimeInfo {
  officeTimeString: string; // e.g. "16:20:45"
  officeTimeShort: string; // e.g. "16:20"
  officeDateString: string; // e.g. "27 Sep 2026"
  officeLabel: string; // e.g. "WITA"
  officeLocation: string; // e.g. "Bali, Indonesia"
  localTimeString: string; // e.g. "15:20:45"
  localTimeShort: string; // e.g. "15:20"
  localTimezoneId: string; // e.g. "Asia/Jakarta"
  localLabel: string; // e.g. "WIB"
  diffHours: number; // e.g. -1
  diffMinutes: number; // e.g. -60
  isDifferent: boolean; // true if viewer timezone != office timezone
  diffDescription: string; // e.g. "-1 jam dari kantor" or "+1 hour from office"
}

export function getOfficeTimeInfo(
  date: Date = new Date(),
  officeTz: string = 'Asia/Makassar',
  officeLabelFallback: string = 'WITA',
  officeCity: string = 'Bali',
  officeCountry: string = 'Indonesia',
  lang: 'id' | 'en' | 'ko' = 'id'
): OfficeTimeInfo {
  const safeOfficeTz = officeTz || 'Asia/Makassar';

  // 1. Office Time formatting
  let officeTimeString = '00:00:00';
  let officeTimeShort = '00:00';
  let officeDateString = '';
  let officeLabel = officeLabelFallback;

  try {
    const formatterFull = new Intl.DateTimeFormat('id-ID', {
      timeZone: safeOfficeTz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    officeTimeString = formatterFull.format(date);

    const formatterShort = new Intl.DateTimeFormat('id-ID', {
      timeZone: safeOfficeTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    officeTimeShort = formatterShort.format(date);

    const formatterDate = new Intl.DateTimeFormat('id-ID', {
      timeZone: safeOfficeTz,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    officeDateString = formatterDate.format(date);
  } catch (err) {
    console.warn('Error formatting office time:', err);
    officeTimeString = date.toLocaleTimeString('id-ID', { hour12: false });
    officeTimeShort = officeTimeString.slice(0, 5);
  }

  // Determine timezone label if not explicitly given
  if (!officeLabel) {
    if (safeOfficeTz === 'Asia/Makassar') officeLabel = 'WITA';
    else if (safeOfficeTz === 'Asia/Jakarta') officeLabel = 'WIB';
    else if (safeOfficeTz === 'Asia/Jayapura') officeLabel = 'WIT';
    else if (safeOfficeTz === 'Asia/Seoul') officeLabel = 'KST';
    else if (safeOfficeTz === 'Asia/Singapore') officeLabel = 'SGT';
    else if (safeOfficeTz === 'Asia/Tokyo') officeLabel = 'JST';
    else officeLabel = 'Office';
  }

  // 2. User Local Time formatting
  let localTimeString = '00:00:00';
  let localTimeShort = '00:00';
  let localTimezoneId = 'Local';
  let localLabel = 'Local';

  try {
    localTimezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    const localFormatterFull = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    localTimeString = localFormatterFull.format(date);

    const localFormatterShort = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    localTimeShort = localFormatterShort.format(date);

    // Resolve user local label
    if (localTimezoneId === 'Asia/Jakarta') localLabel = 'WIB';
    else if (localTimezoneId === 'Asia/Makassar') localLabel = 'WITA';
    else if (localTimezoneId === 'Asia/Jayapura') localLabel = 'WIT';
    else if (localTimezoneId === 'Asia/Seoul') localLabel = 'KST';
    else if (localTimezoneId === 'Asia/Singapore') localLabel = 'SGT';
    else if (localTimezoneId === 'Asia/Tokyo') localLabel = 'JST';
    else {
      const parts = localTimezoneId.split('/');
      localLabel = parts[parts.length - 1].replace(/_/g, ' ');
    }
  } catch (err) {
    console.warn('Error formatting local time:', err);
    localTimeString = date.toLocaleTimeString('id-ID', { hour12: false });
    localTimeShort = localTimeString.slice(0, 5);
  }

  // 3. Calculate exact hour & minute difference
  let diffMinutes = 0;
  let diffHours = 0;
  let isDifferent = false;

  try {
    const getParts = (tz?: string) => {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      };
      if (tz) options.timeZone = tz;
      return new Intl.DateTimeFormat('en-US', options).formatToParts(date);
    };

    const officeParts = getParts(safeOfficeTz);
    const localParts = getParts(); // system local

    const parsePart = (parts: Intl.DateTimeFormatPart[], type: string) => {
      const p = parts.find((x) => x.type === type);
      return p ? parseInt(p.value, 10) : 0;
    };

    const officeUtc = Date.UTC(
      parsePart(officeParts, 'year'),
      parsePart(officeParts, 'month') - 1,
      parsePart(officeParts, 'day'),
      parsePart(officeParts, 'hour'),
      parsePart(officeParts, 'minute'),
      parsePart(officeParts, 'second')
    );

    const localUtc = Date.UTC(
      parsePart(localParts, 'year'),
      parsePart(localParts, 'month') - 1,
      parsePart(localParts, 'day'),
      parsePart(localParts, 'hour'),
      parsePart(localParts, 'minute'),
      parsePart(localParts, 'second')
    );

    diffMinutes = Math.round((localUtc - officeUtc) / (1000 * 60));
    diffHours = Number((diffMinutes / 60).toFixed(1));
    if (Math.abs(diffHours - Math.round(diffHours)) < 0.05) {
      diffHours = Math.round(diffHours);
    }
    isDifferent = Math.abs(diffMinutes) >= 1;
  } catch (err) {
    console.warn('Error calculating timezone diff:', err);
  }

  // 4. Readable difference text
  let diffDescription = '';
  if (isDifferent) {
    const sign = diffHours > 0 ? '+' : '';
    if (lang === 'ko') {
      diffDescription = `${sign}${diffHours}시간 (본사 기준)`;
    } else if (lang === 'id') {
      const formattedHours = `${sign}${diffHours} jam`;
      diffDescription = `${formattedHours} dari kantor`;
    } else {
      const formattedHours = `${sign}${diffHours}h`;
      diffDescription = `${formattedHours} from office`;
    }
  } else {
    diffDescription = lang === 'ko' ? '본사 시간과 동일' : lang === 'id' ? 'Sama dengan jam kantor' : 'Same as office time';
  }

  const officeLocation = [officeCity, officeCountry].filter(Boolean).join(', ') || 'Headquarters';

  return {
    officeTimeString,
    officeTimeShort,
    officeDateString,
    officeLabel,
    officeLocation,
    localTimeString,
    localTimeShort,
    localTimezoneId,
    localLabel,
    diffHours,
    diffMinutes,
    isDifferent,
    diffDescription
  };
}
