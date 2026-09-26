/*
Reason for existence: Main Next.js desktop page orchestrating Linux server workspaces, dynamic tiling panes, dock launcher, and top panel.
System impact if absent: Root route will not render and WebOS workspace tiling manager will be unavailable.
*/

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TopPanel } from '@/components/TopPanel';
import { Dock } from '@/components/Dock';
import { TilingWorkspace } from '@/components/wm/TilingWorkspace';
import { TerminalApp } from '@/components/apps/TerminalApp';
import { MonitorApp } from '@/components/apps/MonitorApp';
import { ServicesApp } from '@/components/apps/ServicesApp';
import { FilesApp } from '@/components/apps/FilesApp';
import { LogsApp } from '@/components/apps/LogsApp';
import { NetworkApp } from '@/components/apps/NetworkApp';
import { AIAssistantApp } from '@/components/apps/AIAssistantApp';
import { SpotifyPlayer } from '@/components/SpotifyPlayer';
import { GitKrakenApp } from '@/components/apps/GitKrakenApp';
import { AboutMeTerminalApp } from '@/components/apps/AboutMeTerminalApp';
import { PortfolioHubApp, PortfolioTab } from '@/components/apps/PortfolioHubApp';
import { SystemHubApp, SystemTab } from '@/components/apps/SystemHubApp';
import { WorkspaceHubApp, WorkspaceTab } from '@/components/apps/WorkspaceHubApp';
import { ContactApp } from '@/components/apps/ContactApp';
import { AdminDashboardApp } from '@/components/apps/AdminDashboardApp';
import { sendVisitorTelemetry } from '@/lib/fingerprint';
import { ToastContainer, ToastMessage } from '@/components/ToastContainer';
import { CommandPalette } from '@/components/CommandPalette';
import { globalAudio } from '@/lib/audioManager';
import { WebOSPersistence } from '@/lib/persistence';
import { useI18n } from '@/lib/i18n';
import { BootSequence } from '@/components/BootSequence';
import { AppId, WorkspaceId, WorkspaceState, TilingLayoutMode, WindowState } from '@/types';

export default function WebOSPage() {
  const { t } = useI18n();
  const [hasBooted, setHasBooted] = useState<boolean>(true);
  const [bootKey, setBootKey] = useState<number>(0);
  const [currentWsId, setCurrentWsId] = useState<WorkspaceId>(1);
  const [lastNormalWsId, setLastNormalWsId] = useState<WorkspaceId>(1);
  const [activePaneId, setActivePaneId] = useState<AppId | null>('app-terminal');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Check if initial cinematic boot sequence has run
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyBooted = sessionStorage.getItem('silves_boot_complete');
      if (!alreadyBooted) {
        setHasBooted(false);
      }
    }
  }, []);

  // Allow replaying boot sequence via terminal command 'boot' or custom event
  useEffect(() => {
    const handleReplay = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('silves_boot_complete');
      }
      setBootKey(prev => prev + 1);
      setHasBooted(false);
    };
    window.addEventListener('replay_boot_sequence', handleReplay);
    return () => window.removeEventListener('replay_boot_sequence', handleReplay);
  }, []);

  const handleBootComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('silves_boot_complete', 'true');
    }
    setHasBooted(true);
    // Auto-play background music when booted into OS
    globalAudio.play();
    const handleFirstInteraction = () => {
      if (!globalAudio.getStatus().isPlaying) {
        globalAudio.play();
      }
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
  }, []);

  // Sub-tab selection state inside each Hub
  const [portfolioTab, setPortfolioTab] = useState<PortfolioTab>('about');
  const [systemTab, setSystemTab] = useState<SystemTab>('monitor');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('ai');

  const [workspaces, setWorkspaces] = useState<Record<WorkspaceId, WorkspaceState>>({
    1: {
      id: 1,
      name: 'term',
      activeAppIds: ['app-terminal'],
      layout: 'master-stack',
      maximizedAppId: null
    },
    2: {
      id: 2,
      name: 'dev',
      activeAppIds: ['hub-portfolio'],
      layout: 'master-stack',
      maximizedAppId: null
    },
    3: {
      id: 3,
      name: 'ops',
      activeAppIds: ['hub-system'],
      layout: 'master-stack',
      maximizedAppId: null
    },
    4: {
      id: 4,
      name: 'hub',
      activeAppIds: ['hub-workspace'],
      layout: 'master-stack',
      maximizedAppId: null
    },
    special: {
      id: 'special',
      name: 'special:music',
      activeAppIds: ['app-spotify'],
      layout: 'monocle',
      maximizedAppId: null
    }
  });

  // Restore persisted workspaces on initial mount
  useEffect(() => {
    const savedWs = WebOSPersistence.loadWorkspaces();
    if (savedWs) {
      setWorkspaces(prev => {
        const merged: Record<WorkspaceId, WorkspaceState> = { ...savedWs };
        for (const k of [1, 2, 3, 4, 'special'] as WorkspaceId[]) {
          if (!merged[k] || !Array.isArray(merged[k].activeAppIds) || merged[k].activeAppIds.length === 0) {
            merged[k] = prev[k];
          }
        }
        return merged;
      });
    }
    const savedActiveWs = WebOSPersistence.loadActiveWorkspace();
    if (savedActiveWs) {
      setCurrentWsId(savedActiveWs);
    }

    // Trigger Web Visitor Analytics Telemetry with Client Fingerprint
    try {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      sendVisitorTelemetry(currentPath);
    } catch {
      // Safe noop
    }
  }, []);

  // Debounced save to localStorage on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      WebOSPersistence.saveWorkspaces(workspaces);
      WebOSPersistence.saveActiveWorkspace(currentWsId);
    }, 500);
    return () => clearTimeout(timer);
  }, [workspaces, currentWsId]);

  const showToast = useCallback((text: string, type: 'info' | 'warn' | 'error' = 'info') => {
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
      });
    }
  }, []);

  const switchWorkspace = useCallback((id: WorkspaceId) => {
    if (id !== 'special') {
      setLastNormalWsId(id);
    }
    setCurrentWsId(id);
  }, []);

  const currentWorkspace = workspaces[currentWsId] || workspaces[1];

  // Cycle layout modes: master-stack -> grid -> columns -> monocle
  const handleToggleLayout = () => {
    const modes: TilingLayoutMode[] = ['master-stack', 'grid', 'columns', 'monocle'];
    const currentIdx = modes.indexOf(currentWorkspace.layout);
    const nextMode = modes[(currentIdx + 1) % modes.length];

    setWorkspaces(prev => ({
      ...prev,
      [currentWsId]: {
        ...prev[currentWsId],
        layout: nextMode
      }
    }));
    showToast(`${t.apps.toast.switchedLayout} ${nextMode.toUpperCase()}`, 'info');
  };

  // Toggle app pane in current workspace (with smart Hub & Special Workspace mapping)
  const handleToggleApp = (appId: AppId) => {
    let targetWsId: WorkspaceId = currentWsId;
    let targetId: AppId = appId;

    if (appId === 'app-spotify') {
      if (currentWsId === 'special') {
        switchWorkspace(lastNormalWsId || 1);
        return;
      }
      targetWsId = 'special';
      targetId = 'app-spotify';
      switchWorkspace('special');
    } else if (appId === 'app-about') {
      targetWsId = 2;
      setPortfolioTab('about');
      targetId = 'hub-portfolio';
      switchWorkspace(2);
    } else if (appId === 'app-services') {
      targetWsId = 2;
      setPortfolioTab('services');
      targetId = 'hub-portfolio';
      switchWorkspace(2);
    } else if (appId === 'app-git') {
      targetWsId = 2;
      setPortfolioTab('git');
      targetId = 'hub-portfolio';
      switchWorkspace(2);
    } else if (appId === 'app-monitor') {
      targetWsId = 3;
      setSystemTab('monitor');
      targetId = 'hub-system';
      switchWorkspace(3);
    } else if (appId === 'app-logs') {
      targetWsId = 3;
      setSystemTab('logs');
      targetId = 'hub-system';
      switchWorkspace(3);
    } else if (appId === 'app-network') {
      targetWsId = 3;
      setSystemTab('network');
      targetId = 'hub-system';
      switchWorkspace(3);
    } else if (appId === 'app-ai') {
      targetWsId = 4;
      setWorkspaceTab('ai');
      targetId = 'hub-workspace';
      switchWorkspace(4);
    } else if (appId === 'app-files') {
      targetWsId = 4;
      setWorkspaceTab('files');
      targetId = 'hub-workspace';
      switchWorkspace(4);
    }

    setWorkspaces(prev => {
      const ws = prev[targetWsId] || {
        id: targetWsId,
        name: targetWsId === 'special' ? 'special:music' : `ws-${targetWsId}`,
        activeAppIds: [targetId],
        layout: 'monocle',
        maximizedAppId: null
      };
      const exists = ws.activeAppIds.includes(targetId);

      let nextIds: AppId[];
      if (exists) {
        if (targetWsId !== currentWsId) {
          nextIds = ws.activeAppIds;
          setActivePaneId(targetId);
        } else {
          nextIds = ws.activeAppIds.filter(id => id !== targetId);
          if (activePaneId === targetId) {
            setActivePaneId(nextIds[0] || null);
          }
        }
      } else {
        // Insert pane
        nextIds = [...ws.activeAppIds, targetId];
        setActivePaneId(targetId);
      }

      return {
        ...prev,
        [targetWsId]: {
          ...ws,
          activeAppIds: nextIds,
          maximizedAppId: ws.maximizedAppId === targetId ? null : ws.maximizedAppId
        }
      };
    });
  };

  // Close pane
  const handleClosePane = (appId: AppId) => {
    setWorkspaces(prev => {
      const ws = prev[currentWsId];
      const nextIds = ws.activeAppIds.filter(id => id !== appId);
      return {
        ...prev,
        [currentWsId]: {
          ...ws,
          activeAppIds: nextIds,
          maximizedAppId: ws.maximizedAppId === appId ? null : ws.maximizedAppId
        }
      };
    });
    if (activePaneId === appId) {
      setActivePaneId(null);
    }
  };

  // Toggle maximize / monocle for specific pane
  const handleToggleMaximize = (appId: AppId) => {
    setWorkspaces(prev => {
      const ws = prev[currentWsId];
      return {
        ...prev,
        [currentWsId]: {
          ...ws,
          maximizedAppId: ws.maximizedAppId === appId ? null : appId
        }
      };
    });
  };

  // Keyboard navigation (Ctrl+K palette, Alt+1..4 workspace, Alt+Q close, Alt+F maximize, Alt+L layout, Alt+T/Enter terminal)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          switchWorkspace(1);
        } else if (e.key === '2') {
          e.preventDefault();
          switchWorkspace(2);
        } else if (e.key === '3') {
          e.preventDefault();
          switchWorkspace(3);
        } else if (e.key === '4') {
          e.preventDefault();
          switchWorkspace(4);
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          switchWorkspace(currentWsId === 'special' ? (lastNormalWsId || 1) : 'special');
        } else if (e.key.toLowerCase() === 't' || e.key === 'Enter') {
          e.preventDefault();
          handleToggleApp('app-terminal');
        } else if (e.key.toLowerCase() === 'l') {
          e.preventDefault();
          handleToggleLayout();
        } else if (e.key.toLowerCase() === 'q') {
          e.preventDefault();
          if (activePaneId) {
            handleClosePane(activePaneId);
          }
        } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          if (activePaneId) {
            handleToggleMaximize(activePaneId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Render app content helper
  const renderAppContent = (id: AppId) => {
    switch (id) {
      case 'hub-portfolio':
        return {
          title: 'Dev & Portfolio Studio (SILVESTRIKE)',
          component: (
            <PortfolioHubApp
              initialTab={portfolioTab}
              onNotify={showToast}
              onOpenApp={(targetId) => handleToggleApp(targetId as AppId)}
            />
          )
        };
      case 'app-about':
        return {
          title: 'SILVESTRIKE - About Me (Terminal)',
          component: (
            <AboutMeTerminalApp
              onNotify={showToast}
              onOpenApp={(targetId) => handleToggleApp(targetId as AppId)}
            />
          )
        };
      case 'hub-system':
        return {
          title: 'Server Operations Center (srv-silvestrike)',
          component: (
            <SystemHubApp
              initialTab={systemTab}
              onNotify={showToast}
            />
          )
        };
      case 'hub-workspace':
        return {
          title: 'AI & File Workbench (/home/silvestrike)',
          component: (
            <WorkspaceHubApp
              initialTab={workspaceTab}
              onNotify={showToast}
            />
          )
        };
      case 'app-terminal':
        return {
          title: 'bash - duong@srv-silvestrike:~',
          component: <TerminalApp onOpenApp={(targetId) => handleToggleApp(targetId)} />
        };
      case 'app-monitor':
        return {
          title: 'Activity & Visitor Analytics',
          component: <MonitorApp onNotify={showToast} />
        };
      case 'app-services':
        return {
          title: 'systemctl - Service Unit Manager',
          component: <ServicesApp onNotify={showToast} onOpenApp={(targetId) => handleToggleApp(targetId as AppId)} />
        };
      case 'app-files':
        return {
          title: 'Server File Explorer (/home/silvestrike)',
          component: <FilesApp onNotify={showToast} />
        };
      case 'app-logs':
        return {
          title: 'journalctl -f (System Logging Stream)',
          component: <LogsApp onNotify={showToast} />
        };
      case 'app-network':
        return {
          title: 'Network & Port Diagnostics',
          component: <NetworkApp onNotify={showToast} />
        };
      case 'app-ai':
        return {
          title: 'Doru AI Virtual Guide',
          component: <AIAssistantApp />
        };
      case 'app-spotify':
        return {
          title: 'Music Player (Spotify & YouTube)',
          component: <SpotifyPlayer mode="full" />
        };
      case 'app-git':
        return {
          title: 'Git - Visual Git Studio',
          component: <GitKrakenApp />
        };
      case 'app-contact':
        return {
          title: t.apps.contact.title,
          component: <ContactApp onNotify={showToast} />
        };
      case 'app-admin':
        return {
          title: 'Recruiter Intelligence & Visitor Tracking',
          component: <AdminDashboardApp onNotify={showToast} />
        };
      default:
        return {
          title: 'Application',
          component: <div className="p-4 text-slate-400 font-mono">App not found</div>
        };
    }
  };

  // Build windows state object for Dock compatibility
  const dockWindowsState: Record<AppId, WindowState> = {
    'hub-portfolio': {
      id: 'hub-portfolio',
      title: 'Dev & Portfolio',
      isOpen: currentWorkspace.activeAppIds.includes('hub-portfolio'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'hub-portfolio',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'hub-system': {
      id: 'hub-system',
      title: 'Server Ops',
      isOpen: currentWorkspace.activeAppIds.includes('hub-system'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'hub-system',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'hub-workspace': {
      id: 'hub-workspace',
      title: 'AI & Files',
      isOpen: currentWorkspace.activeAppIds.includes('hub-workspace'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'hub-workspace',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-terminal': {
      id: 'app-terminal',
      title: 'Terminal',
      isOpen: currentWorkspace.activeAppIds.includes('app-terminal'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-terminal',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-monitor': {
      id: 'app-monitor',
      title: 'Resources',
      isOpen: currentWorkspace.activeAppIds.includes('app-monitor'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-monitor',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-services': {
      id: 'app-services',
      title: 'Services',
      isOpen: currentWorkspace.activeAppIds.includes('app-services'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-services',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-files': {
      id: 'app-files',
      title: 'Files',
      isOpen: currentWorkspace.activeAppIds.includes('app-files'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-files',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-logs': {
      id: 'app-logs',
      title: 'Logs',
      isOpen: currentWorkspace.activeAppIds.includes('app-logs'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-logs',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-network': {
      id: 'app-network',
      title: 'Network',
      isOpen: currentWorkspace.activeAppIds.includes('app-network'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-network',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-ai': {
      id: 'app-ai',
      title: 'Doru AI',
      isOpen: currentWorkspace.activeAppIds.includes('app-ai'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-ai',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-spotify': {
      id: 'app-spotify',
      title: 'Spotify',
      isOpen: currentWorkspace.activeAppIds.includes('app-spotify') || currentWsId === 'special',
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-spotify',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-git': {
      id: 'app-git',
      title: 'Git',
      isOpen: currentWorkspace.activeAppIds.includes('app-git'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-git',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-about': {
      id: 'app-about',
      title: 'About Me',
      isOpen: currentWorkspace.activeAppIds.includes('app-about'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-about',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-contact': {
      id: 'app-contact',
      title: t.apps.contact.title,
      isOpen: currentWorkspace.activeAppIds.includes('app-contact'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-contact',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-admin': {
      id: 'app-admin',
      title: 'Recruiter Admin',
      isOpen: currentWorkspace.activeAppIds.includes('app-admin'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-admin',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    }
  };

  const workspaceCounts: Record<WorkspaceId, number> = {
    1: workspaces[1]?.activeAppIds.length ?? 0,
    2: workspaces[2]?.activeAppIds.length ?? 0,
    3: workspaces[3]?.activeAppIds.length ?? 0,
    4: workspaces[4]?.activeAppIds.length ?? 0,
    special: workspaces.special?.activeAppIds.length ?? 0
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-screen flex items-center justify-center overflow-hidden bg-obsidian-950 relative p-0 lg:px-4 lg:pt-2.5 lg:pb-3.5">
      {/* Background ambient lighting on PC */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(122,162,247,0.06)_0%,transparent_75%)]" />

      {/* Main Workstation Frame: ~87% centered on PC, 100% max-width & max-height on mobile */}
      <div className="h-[100dvh] max-h-[100dvh] w-full max-w-full lg:w-[87%] lg:max-w-[1780px] lg:h-[94.5vh] lg:max-h-[94.5vh] flex flex-col overflow-hidden relative select-none bg-obsidian-950 lg:rounded-xl lg:border lg:border-white/10 lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] z-10">
        {/* Top System Panel with Workspace Switcher */}
        <TopPanel
          currentWorkspace={currentWsId}
          onSelectWorkspace={switchWorkspace}
          workspaceCounts={workspaceCounts}
          layoutMode={currentWorkspace.layout}
          onToggleLayout={handleToggleLayout}
          onOpenSpotify={() => handleToggleApp('app-spotify')}
        />

        {/* Main Workspace Area (Dynamic Tiling) */}
        <main id="desktop-workspace" className="flex-1 relative overflow-hidden">
          <TilingWorkspace
            appIds={currentWorkspace.activeAppIds}
            activeId={activePaneId}
            maximizedAppId={currentWorkspace.maximizedAppId}
            layoutMode={currentWorkspace.layout}
            sidebarAppId="hub-workspace"
            onFocus={(id) => setActivePaneId(id)}
            onToggleMaximize={handleToggleMaximize}
            onClose={handleClosePane}
            onReorderAppIds={(newIds) => {
              setWorkspaces(prev => ({
                ...prev,
                [currentWsId]: {
                  ...prev[currentWsId],
                  activeAppIds: newIds
                }
              }));
            }}
            renderApp={renderAppContent}
          />
        </main>

        {/* Bottom Application Dock */}
        <Dock
          windows={dockWindowsState}
          activeId={activePaneId}
          onToggleApp={handleToggleApp}
        />
      </div>

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onLaunchApp={(appId) => handleToggleApp(appId)}
        onSwitchWorkspace={switchWorkspace}
        onToggleLayout={handleToggleLayout}
        onCloseActivePane={() => {
          if (activePaneId) handleClosePane(activePaneId);
        }}
        onToggleMaximize={() => {
          if (activePaneId) handleToggleMaximize(activePaneId);
        }}
        onToggleAudio={() => {
          globalAudio.toggle();
          showToast(t.apps.toast.toggledAudio, 'info');
        }}
        currentWorkspace={currentWsId}
        layoutMode={currentWorkspace.layout}
      />

      {/* Cinematic eDEX-UI Boot Sequence Intro (First Login & Replay) */}
      {!hasBooted && <BootSequence key={bootKey} onComplete={handleBootComplete} />}
    </div>
  );
}
