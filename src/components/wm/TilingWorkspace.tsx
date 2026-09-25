/*
Reason for existence: Dynamic tiling grid container arranging open panes in Master-Stack, Grid, Columns, or Monocle layout algorithms with interactive drag-and-drop window reordering.
System impact if absent: Tiling layout calculation, pane distribution, and drag-and-drop window swapping will fail.
*/

'use client';

import React, { useState, useRef } from 'react';
import { AppId, TilingLayoutMode } from '@/types';
import { TilingPane } from './TilingPane';
import { useI18n } from '@/lib/i18n';

interface TilingWorkspaceProps {
  appIds: AppId[];
  activeId: AppId | null;
  maximizedAppId: AppId | null;
  layoutMode: TilingLayoutMode;
  onFocus: (id: AppId) => void;
  onToggleMaximize: (id: AppId) => void;
  onClose: (id: AppId) => void;
  onReorderAppIds?: (newAppIds: AppId[]) => void;
  renderApp: (id: AppId) => { title: string; component: React.ReactNode };
}

export function TilingWorkspace({
  appIds,
  activeId,
  maximizedAppId,
  layoutMode,
  onFocus,
  onToggleMaximize,
  onClose,
  onReorderAppIds,
  renderApp
}: TilingWorkspaceProps) {
  const { t } = useI18n();
  const [masterRatio, setMasterRatio] = useState<number>(55);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;

    const onMouseMove = (moveEv: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = moveEv.clientX - rect.left;
      const percent = Math.max(25, Math.min(75, Math.round((x / rect.width) * 100)));
      setMasterRatio(percent);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSwap = (sourceId: AppId, targetId: AppId) => {
    if (!sourceId || sourceId === targetId || !onReorderAppIds) return;
    const next = [...appIds];
    const idxA = next.indexOf(sourceId);
    const idxB = next.indexOf(targetId);
    if (idxA !== -1 && idxB !== -1) {
      next[idxA] = targetId;
      next[idxB] = sourceId;
      onReorderAppIds(next);
      onFocus(sourceId);
    }
  };

  if (appIds.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center font-mono text-xs text-slate-500 gap-2 select-none">
        <div className="text-slate-400 font-semibold">{t.workspace.emptyTitle}</div>
        <div>{t.workspace.emptySubtitle}</div>
      </div>
    );
  }

  // If a pane is maximized (monocle), show only that pane full screen
  if (maximizedAppId && appIds.includes(maximizedAppId)) {
    const { title, component } = renderApp(maximizedAppId);
    return (
      <div className="h-full w-full p-2">
        <TilingPane
          paneId={maximizedAppId}
          title={title}
          isActive={activeId === maximizedAppId}
          isMaximized={true}
          onFocus={() => onFocus(maximizedAppId)}
          onToggleMaximize={() => onToggleMaximize(maximizedAppId)}
          onClose={() => onClose(maximizedAppId)}
        >
          {component}
        </TilingPane>
      </div>
    );
  }

  // 1 Pane: Full Screen
  if (appIds.length === 1) {
    const id = appIds[0];
    const { title, component } = renderApp(id);
    return (
      <div className="h-full w-full p-2 flex">
        <TilingPane
          paneId={id}
          title={title}
          isActive={activeId === id}
          isMaximized={false}
          onFocus={() => onFocus(id)}
          onToggleMaximize={() => onToggleMaximize(id)}
          onClose={() => onClose(id)}
        >
          {component}
        </TilingPane>
      </div>
    );
  }

  // Monocle layout: focused pane takes full space
  if (layoutMode === 'monocle') {
    const focused = activeId && appIds.includes(activeId) ? activeId : appIds[0];
    const { title, component } = renderApp(focused);
    return (
      <div className="h-full w-full p-2 flex">
        <TilingPane
          paneId={focused}
          title={title}
          isActive={true}
          isMaximized={false}
          onFocus={() => onFocus(focused)}
          onToggleMaximize={() => onToggleMaximize(focused)}
          onClose={() => onClose(focused)}
        >
          {component}
        </TilingPane>
      </div>
    );
  }

  // Columns Layout: equal vertical columns
  if (layoutMode === 'columns') {
    return (
      <div className="h-full w-full p-2 flex flex-col md:flex-row gap-2 overflow-auto">
        {appIds.map((id) => {
          const { title, component } = renderApp(id);
          return (
            <TilingPane
              key={id}
              paneId={id}
              title={title}
              isActive={activeId === id}
              isMaximized={false}
              onFocus={() => onFocus(id)}
              onToggleMaximize={() => onToggleMaximize(id)}
              onClose={() => onClose(id)}
              onSwapWith={(src) => handleSwap(src as AppId, id)}
            >
              {component}
            </TilingPane>
          );
        })}
      </div>
    );
  }

  // Grid Layout: 2x2 grid (1 col on mobile, 2 cols on tablet+)
  if (layoutMode === 'grid') {
    return (
      <div className="h-full w-full p-2 grid grid-cols-1 md:grid-cols-2 grid-rows-none md:grid-rows-2 gap-2 overflow-auto">
        {appIds.map((id) => {
          const { title, component } = renderApp(id);
          return (
            <TilingPane
              key={id}
              paneId={id}
              title={title}
              isActive={activeId === id}
              isMaximized={false}
              onFocus={() => onFocus(id)}
              onToggleMaximize={() => onToggleMaximize(id)}
              onClose={() => onClose(id)}
              onSwapWith={(src) => handleSwap(src as AppId, id)}
            >
              {component}
            </TilingPane>
          );
        })}
      </div>
    );
  }

  // Master-Stack Layout (Default Hyprland / tmux style)
  // Left 55% = Master Pane (First app in list)
  // Right 45% = Stacked Panes (Remaining apps)
  const masterId = appIds[0];
  const stackIds = appIds.slice(1);
  const masterApp = renderApp(masterId);

  return (
    <div ref={containerRef} className="h-full w-full p-2 flex flex-col md:flex-row gap-2 overflow-auto">
      {/* Master Pane */}
      <div
        style={{ flex: stackIds.length > 0 ? `0 0 ${masterRatio}%` : '1 1 100%' }}
        className="min-w-0 min-h-[280px] md:min-h-0 flex"
      >
        <TilingPane
          paneId={masterId}
          title={masterApp.title}
          isActive={activeId === masterId}
          isMaximized={false}
          onFocus={() => onFocus(masterId)}
          onToggleMaximize={() => onToggleMaximize(masterId)}
          onClose={() => onClose(masterId)}
          onSwapWith={(src) => handleSwap(src as AppId, masterId)}
        >
          {masterApp.component}
        </TilingPane>
      </div>

      {/* Interactive Resizer Splitter */}
      {stackIds.length > 0 && (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setMasterRatio(55)}
          className="hidden md:flex w-2 items-center justify-center cursor-col-resize group select-none hover:bg-sky-500/20 rounded transition-colors -mx-1 z-10"
          title={t.workspace.splitterTooltip}
        >
          <div className="w-0.5 h-12 bg-white/20 group-hover:bg-sky-400 group-hover:h-20 rounded transition-all duration-200" />
        </div>
      )}

      {/* Stack Column */}
      {stackIds.length > 0 && (
        <div
          style={{ flex: `1 1 ${100 - masterRatio}%` }}
          className="min-w-0 min-h-0 flex flex-col gap-2"
        >
          {stackIds.map((id) => {
            const { title, component } = renderApp(id);
            return (
              <div key={id} className="flex-1 min-w-0 min-h-[240px] md:min-h-0 flex">
                <TilingPane
                  paneId={id}
                  title={title}
                  isActive={activeId === id}
                  isMaximized={false}
                  onFocus={() => onFocus(id)}
                  onToggleMaximize={() => onToggleMaximize(id)}
                  onClose={() => onClose(id)}
                  onSwapWith={(src) => handleSwap(src as AppId, id)}
                >
                  {component}
                </TilingPane>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
