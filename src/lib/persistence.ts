/*
Reason for existence: Client-side localStorage persistence engine saving and restoring active workspace layouts, pane distributions, and virtual filesystem states.
System impact if absent: Desktop layout, open windows, and virtual files reset to initial defaults every time the browser is refreshed.
*/

import { WorkspaceId, WorkspaceState, FileNode } from '@/types';
import { LocaleId } from '@/locales';

const STORAGE_KEYS = {
  WORKSPACES: 'webos_workspaces_v1',
  ACTIVE_WS: 'webos_active_ws_v1',
  VFS: 'webos_vfs_v1',
  LOCALE: 'webos_locale_v1'
} as const;

export class WebOSPersistence {
  public static saveWorkspaces(workspaces: Record<WorkspaceId, WorkspaceState>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
    } catch {
      // Quota exceeded or private browsing safe fail
    }
  }

  public static loadWorkspaces(): Record<WorkspaceId, WorkspaceState> | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Validate basic structure
      if (parsed && parsed[1] && parsed[2] && parsed[3] && parsed[4]) {
        return parsed as Record<WorkspaceId, WorkspaceState>;
      }
    } catch {
      // Parse error
    }
    return null;
  }

  public static saveActiveWorkspace(id: WorkspaceId): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WS, String(id));
    } catch {
      // Safe fail
    }
  }

  public static loadActiveWorkspace(): WorkspaceId | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_WS);
      if (!raw) return null;
      if (raw === 'special') return 'special';
      const num = parseInt(raw, 10);
      if ([1, 2, 3, 4].includes(num)) {
        return num as WorkspaceId;
      }
    } catch {
      // Safe fail
    }
    return null;
  }

  public static saveVFS(vfsRoot: Record<string, FileNode>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.VFS, JSON.stringify(vfsRoot));
    } catch {
      // Safe fail
    }
  }

  public static loadVFS(): Record<string, FileNode> | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.VFS);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, FileNode>;
      }
    } catch {
      // Safe fail
    }
    return null;
  }

  public static saveLocale(locale: LocaleId): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
    } catch {
      // Safe fail
    }
  }

  public static loadLocale(): LocaleId | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCALE);
      if (raw === 'en' || raw === 'vi') {
        return raw;
      }
    } catch {
      // Safe fail
    }
    return null;
  }

  public static clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.WORKSPACES);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WS);
      localStorage.removeItem(STORAGE_KEYS.VFS);
      localStorage.removeItem(STORAGE_KEYS.LOCALE);
    } catch {
      // Safe fail
    }
  }
}
