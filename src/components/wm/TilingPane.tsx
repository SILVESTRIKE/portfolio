/*
Reason for existence: Tiling pane wrapper rendering title bar, drag-and-drop window reordering handles, maximize/monocle toggle, and close controls.
System impact if absent: Tiling layout will lack window chrome, active focus borders, and interactive pane reordering.
*/

'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface TilingPaneProps {
  paneId?: string;
  title: string;
  isActive: boolean;
  isMaximized: boolean;
  onFocus: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  onSwapWith?: (sourcePaneId: string) => void;
  children: React.ReactNode;
}

export function TilingPane({
  paneId,
  title,
  isActive,
  isMaximized,
  onFocus,
  onToggleMaximize,
  onClose,
  onSwapWith,
  children
}: TilingPaneProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onClick={onFocus}
      onDragOver={(e) => {
        if (!isMaximized && onSwapWith) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDragEnter={() => {
        if (!isDragging && onSwapWith && !isMaximized) {
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (!isMaximized && onSwapWith) {
          e.preventDefault();
          setIsDragOver(false);
          const sourceId = e.dataTransfer.getData('text/plain');
          if (sourceId && sourceId !== paneId) {
            onSwapWith(sourceId);
          }
        }
      }}
      className={`flex-1 min-w-0 min-h-0 flex flex-col rounded-lg overflow-hidden border transition-all duration-200 ${
        isDragOver
          ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-[0_0_25px_rgba(56,189,248,0.3)] bg-sky-500/10'
          : isActive
          ? 'glass-panel-active border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
          : 'glass-panel border-white/10 hover:border-white/20'
      } ${isDragging ? 'opacity-40 scale-[0.99]' : 'opacity-100'}`}
    >
      {/* Tiling Pane Header (Draggable for reordering) */}
      <div
        draggable={!isMaximized}
        onDragStart={(e) => {
          if (paneId) {
            e.dataTransfer.setData('text/plain', paneId);
            e.dataTransfer.effectAllowed = 'move';
            setIsDragging(true);
          }
        }}
        onDragEnd={() => {
          setIsDragging(false);
          setIsDragOver(false);
        }}
        className={`h-8 px-3 bg-black/50 border-b border-white/10 flex items-center justify-between select-none ${
          !isMaximized ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${isDragOver ? 'bg-sky-500/20' : ''}`}
        title={!isMaximized ? t.apps.pane.swapTooltip : undefined}
      >
        <div className="flex items-center gap-2 font-mono text-xs font-medium min-w-0 pointer-events-none">
          {/* Drag Handle Icon (6 dots) */}
          {!isMaximized && (
            <svg className="w-3 h-3 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="6" r="2" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
              <circle cx="8" cy="18" r="2" />
              <circle cx="16" cy="18" r="2" />
            </svg>
          )}
          <span className={`shrink-0 ${isActive ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>#</span>
          <span className={`truncate ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>{title}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Maximize / Monocle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaximize();
            }}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 text-[10px] font-mono transition-colors cursor-pointer"
            title={isMaximized ? t.apps.pane.restoreTooltip : t.apps.pane.maximizeTooltip}
            aria-label="Toggle Fullscreen"
          >
            {isMaximized ? '[-]' : '[+]'}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 text-[10px] font-mono transition-colors cursor-pointer"
            title={t.apps.pane.closeTooltip}
            aria-label="Close"
          >
            [x]
          </button>
        </div>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-auto bg-black/40 relative">
        {children}
      </div>
    </div>
  );
}
