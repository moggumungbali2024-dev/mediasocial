/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Supabase Client & Multi-Tenant Data Synchronization Service
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  autoSync: boolean;
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://db.mediasocial.team',
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc5MDQ3OTU2MCwiZXhwIjo0OTQ2MTUzMTYwLCJyb2xlIjoiYW5vbiJ9.R0ZVq13UDWX019DRE4jrYVE4cOBQuZmdAYXY0exNHY8',
  isConnected: true,
  autoSync: true
};

export const getSupabaseConfig = (): SupabaseConfig => {
  if (typeof window === 'undefined') return DEFAULT_SUPABASE_CONFIG;
  try {
    const saved = localStorage.getItem('smp_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { ...DEFAULT_SUPABASE_CONFIG, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Failed to load Supabase config from storage', e);
  }
  return DEFAULT_SUPABASE_CONFIG;
};

export const saveSupabaseConfig = (config: Partial<SupabaseConfig>): SupabaseConfig => {
  const current = getSupabaseConfig();
  const updated = { ...current, ...config };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('smp_supabase_config', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save Supabase config to storage', e);
    }
  }
  return updated;
};

export class SupabaseService {
  /**
   * Test connection to Supabase Project
   */
  static async testConnection(url: string, key: string): Promise<{ success: boolean; message: string; status?: number }> {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      return { success: false, message: 'URL Supabase dan API Anon Key tidak boleh kosong.' };
    }

    try {
      // Ping Supabase REST API root endpoint
      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': cleanKey,
          'Authorization': `Bearer ${cleanKey}`
        }
      });

      if (response.ok || response.status === 200) {
        saveSupabaseConfig({ url: cleanUrl, anonKey: cleanKey, isConnected: true, lastSyncedAt: new Date().toISOString() });
        return { success: true, message: 'Successfully connected to Supabase PostgreSQL!', status: response.status };
      } else {
        return { 
          success: false, 
          message: `Connection rejected (HTTP ${response.status}). Please check your Supabase URL & Anon Key.`,
          status: response.status 
        };
      }
    } catch (err: any) {
      return { 
        success: false, 
        message: `Failed to reach Supabase server: ${err.message || 'Network error'}` 
      };
    }
  }

  /**
   * Upsert/Export data to Supabase REST endpoints
   */
  static async exportDataToSupabase(
    tableName: string, 
    rows: any[], 
    customUrl?: string, 
    customKey?: string
  ): Promise<{ success: boolean; count?: number; error?: string }> {
    if (!rows || rows.length === 0) return { success: true, count: 0 };
    const config = getSupabaseConfig();
    const url = customUrl || config.url;
    const key = customKey || config.anonKey;

    if (!url || !key) {
      return { success: false, error: 'Supabase URL dan Anon Key belum dikonfigurasi.' };
    }

    const cleanUrl = url.trim().replace(/\/+$/, '');

    try {
      const response = await fetch(`${cleanUrl}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(rows)
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errText}` };
      }

      saveSupabaseConfig({ lastSyncedAt: new Date().toISOString() });
      return { success: true, count: rows.length };
    } catch (err: any) {
      return { success: false, error: err.message || 'Export error' };
    }
  }

  /**
   * Fetch data from Supabase REST endpoint
   */
  static async fetchFromSupabase<T>(
    tableName: string, 
    query: string = '', 
    customUrl?: string, 
    customKey?: string
  ): Promise<{ success: boolean; data?: T[]; error?: string }> {
    const config = getSupabaseConfig();
    const url = customUrl || config.url;
    const key = customKey || config.anonKey;

    if (!url || !key) {
      return { success: false, error: 'Supabase URL dan Anon Key belum dikonfigurasi.' };
    }

    const cleanUrl = url.trim().replace(/\/+$/, '');
    const q = query ? `?${query}` : '';

    try {
      const response = await fetch(`${cleanUrl}/rest/v1/${tableName}${q}`, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errText}` };
      }

      const json = await response.json();
      return { success: true, data: json as T[] };
    } catch (err: any) {
      return { success: false, error: err.message || 'Fetch error' };
    }
  }

  /**
   * Delete row from Supabase
   */
  static async deleteFromSupabase(
    tableName: string,
    matchQuery: string,
    customUrl?: string,
    customKey?: string
  ): Promise<{ success: boolean; error?: string }> {
    const config = getSupabaseConfig();
    const url = customUrl || config.url;
    const key = customKey || config.anonKey;

    if (!url || !key) {
      return { success: false, error: 'Supabase URL and Anon Key are not configured.' };
    }

    const cleanUrl = url.trim().replace(/\/+$/, '');

    try {
      const response = await fetch(`${cleanUrl}/rest/v1/${tableName}?${matchQuery}`, {
        method: 'DELETE',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errText}` };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Delete error' };
    }
  }

  /**
   * Delete single record by ID
   */
  static async deleteRecord(
    tableName: string,
    id: string,
    customUrl?: string,
    customKey?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.deleteFromSupabase(tableName, `id=eq.${id}`, customUrl, customKey);
  }
}
