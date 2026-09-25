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
import { SysInfoApp } from '@/components/apps/SysInfoApp';
import { AIAssistantApp } from '@/components/apps/AIAssistantApp';
import { OdooSandboxApp } from '@/components/apps/OdooSandboxApp';
import { SpotifyPlayer } from '@/components/SpotifyPlayer';
import { GitKrakenApp } from '@/components/apps/GitKrakenApp';
import { AboutMeTerminalApp } from '@/components/apps/AboutMeTerminalApp';
import { PortfolioHubApp, PortfolioTab } from '@/components/apps/PortfolioHubApp';
import { SystemHubApp, SystemTab } from '@/components/apps/SystemHubApp';
import { WorkspaceHubApp, WorkspaceTab } from '@/components/apps/WorkspaceHubApp';
import { ToastContainer, ToastMessage } from '@/components/ToastContainer';
import { CommandPalette } from '@/components/CommandPalette';
import { globalAudio } from '@/lib/audioManager';
import { WebOSPersistence } from '@/lib/persistence';
import { useI18n } from '@/lib/i18n';
import { AppId, WorkspaceId, WorkspaceState, TilingLayoutMode, WindowState } from '@/types';

export default function WebOSPage() {
  const { t } = useI18n();
  const [currentWsId, setCurrentWsId] = useState<WorkspaceId>(1);
  const [activePaneId, setActivePaneId] = useState<AppId | null>('app-terminal');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sub-tab selection state inside each Hub
  const [portfolioTab, setPortfolioTab] = useState<PortfolioTab>('about');
  const [systemTab, setSystemTab] = useState<SystemTab>('monitor');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('ai');

  const [workspaces, setWorkspaces] = useState<Record<WorkspaceId, WorkspaceState>>({
    1: {
      id: 1,
      name: 'term',
      activeAppIds: ['app-terminal', 'hub-workspace'],
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
      activeAppIds: ['hub-portfolio', 'hub-system'],
      layout: 'master-stack',
      maximizedAppId: null
    }
  });

  // Restore persisted workspaces on initial mount
  useEffect(() => {
    const savedWs = WebOSPersistence.loadWorkspaces();
    if (savedWs) {
      setWorkspaces(savedWs);
    }
    const savedActiveWs = WebOSPersistence.loadActiveWorkspace();
    if (savedActiveWs) {
      setCurrentWsId(savedActiveWs);
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

  const currentWorkspace = workspaces[currentWsId];

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

  // Toggle app pane in current workspace (with smart Hub mapping)
  const handleToggleApp = (appId: AppId) => {
    let targetId: AppId = appId;

    if (appId === 'app-about') {
      setPortfolioTab('about');
      targetId = 'hub-portfolio';
    } else if (appId === 'app-services') {
      setPortfolioTab('services');
      targetId = 'hub-portfolio';
    } else if (appId === 'app-gitkraken') {
      setPortfolioTab('gitkraken');
      targetId = 'hub-portfolio';
    } else if (appId === 'app-odoo') {
      setPortfolioTab('odoo');
      targetId = 'hub-portfolio';
    } else if (appId === 'app-monitor') {
      setSystemTab('monitor');
      targetId = 'hub-system';
    } else if (appId === 'app-logs') {
      setSystemTab('logs');
      targetId = 'hub-system';
    } else if (appId === 'app-network') {
      setSystemTab('network');
      targetId = 'hub-system';
    } else if (appId === 'app-settings') {
      setSystemTab('specs');
      targetId = 'hub-system';
    } else if (appId === 'app-ai') {
      setWorkspaceTab('ai');
      targetId = 'hub-workspace';
    } else if (appId === 'app-files') {
      setWorkspaceTab('files');
      targetId = 'hub-workspace';
    }

    setWorkspaces(prev => {
      const ws = prev[currentWsId];
      const exists = ws.activeAppIds.includes(targetId);

      let nextIds: AppId[];
      if (exists) {
        // If already open and clicked same sub-item, keep open or toggle focus
        nextIds = ws.activeAppIds.filter(id => id !== targetId);
        if (activePaneId === targetId) {
          setActivePaneId(nextIds[0] || null);
        }
      } else {
        // Insert pane
        nextIds = [...ws.activeAppIds, targetId];
        setActivePaneId(targetId);
      }

      return {
        ...prev,
        [currentWsId]: {
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
          setCurrentWsId(1);
        } else if (e.key === '2') {
          e.preventDefault();
          setCurrentWsId(2);
        } else if (e.key === '3') {
          e.preventDefault();
          setCurrentWsId(3);
        } else if (e.key === '4') {
          e.preventDefault();
          setCurrentWsId(4);
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
          title: 'Server Operations Center (srv-doru)',
          component: (
            <SystemHubApp
              initialTab={systemTab}
              onNotify={showToast}
            />
          )
        };
      case 'hub-workspace':
        return {
          title: 'AI & File Workbench (/home/doru)',
          component: (
            <WorkspaceHubApp
              initialTab={workspaceTab}
              onNotify={showToast}
            />
          )
        };
      case 'app-terminal':
        return {
          title: 'bash - root@srv-doru:~',
          component: <TerminalApp onOpenApp={(targetId) => handleToggleApp(targetId)} />
        };
      case 'app-monitor':
        return {
          title: 'htop - System Activity Monitor',
          component: <MonitorApp onNotify={showToast} />
        };
      case 'app-services':
        return {
          title: 'systemctl - Service Unit Manager',
          component: <ServicesApp onNotify={showToast} onOpenApp={(targetId) => handleToggleApp(targetId as AppId)} />
        };
      case 'app-files':
        return {
          title: 'Server File Explorer (/home/doru)',
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
      case 'app-settings':
        return {
          title: 'Server Specifications & Platform',
          component: <SysInfoApp />
        };
      case 'app-ai':
        return {
          title: 'Doru AI Native Assistant',
          component: <AIAssistantApp />
        };
      case 'app-odoo':
        return {
          title: 'Odoo 18 ERP Enterprise Suite',
          component: <OdooSandboxApp onNotify={showToast} />
        };
      case 'app-spotify':
        return {
          title: 'Spotify Live Stream & Player',
          component: <SpotifyPlayer mode="full" />
        };
      case 'app-gitkraken':
        return {
          title: 'GitKraken - Visual Git Studio',
          component: <GitKrakenApp />
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
    'app-odoo': {
      id: 'app-odoo',
      title: 'Odoo ERP',
      isOpen: currentWorkspace.activeAppIds.includes('app-odoo'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-odoo',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-spotify': {
      id: 'app-spotify',
      title: 'Spotify',
      isOpen: currentWorkspace.activeAppIds.includes('app-spotify'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-spotify',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-gitkraken': {
      id: 'app-gitkraken',
      title: 'GitKraken',
      isOpen: currentWorkspace.activeAppIds.includes('app-gitkraken'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-gitkraken',
      zIndex: 1,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 }
    },
    'app-settings': {
      id: 'app-settings',
      title: 'SysInfo',
      isOpen: currentWorkspace.activeAppIds.includes('app-settings'),
      isMinimized: false,
      isMaximized: currentWorkspace.maximizedAppId === 'app-settings',
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
    }
  };

  const workspaceCounts: Record<WorkspaceId, number> = {
    1: workspaces[1].activeAppIds.length,
    2: workspaces[2].activeAppIds.length,
    3: workspaces[3].activeAppIds.length,
    4: workspaces[4].activeAppIds.length
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative select-none bg-obsidian-950">
      {/* Top System Panel with Workspace Switcher */}
      <TopPanel
        currentWorkspace={currentWsId}
        onSelectWorkspace={(id) => setCurrentWsId(id)}
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

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onLaunchApp={(appId) => handleToggleApp(appId)}
        onSwitchWorkspace={(wsId) => setCurrentWsId(wsId)}
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
    </div>
  );
}
