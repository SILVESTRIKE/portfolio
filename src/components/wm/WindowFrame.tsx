/*
Reason for existence: Draggable, resizable, minimizable, maximizable window frame wrapper for all WebOS desktop applications.
System impact if absent: Applications cannot be displayed as movable windows with window chrome or controls.
*/

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { WindowState } from '@/types';

interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  children: React.ReactNode;
}

export function WindowFrame({
  windowState,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  children
}: WindowFrameProps) {
  const [pos, setPos] = useState(windowState.position);
  const [size, setSize] = useState(windowState.size);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Sync internal state when external position/size changes
  useEffect(() => {
    setPos(windowState.position);
    setSize(windowState.size);
  }, [windowState.position, windowState.size]);

  // Window drag handler
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;

    onFocus();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;
      setPos({
        x: Math.max(0, dragStartRef.current.posX + dx),
        y: Math.max(0, dragStartRef.current.posY + dy)
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Window resize handler (SE corner)
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (windowState.isMaximized) return;

    onFocus();
    isResizingRef.current = true;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingRef.current) return;
      const dx = ev.clientX - resizeStartRef.current.x;
      const dy = ev.clientY - resizeStartRef.current.y;
      setSize({
        width: Math.max(380, resizeStartRef.current.width + dx),
        height: Math.max(240, resizeStartRef.current.height + dy)
      });
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!windowState.isOpen || windowState.isMinimized) {
    return null;
  }

  const isMax = windowState.isMaximized;

  return (
    <div
      onMouseDown={onFocus}
      style={{
        zIndex: windowState.zIndex,
        ...(isMax
          ? {
              top: '6px',
              left: '6px',
              width: 'calc(100vw - 12px)',
              height: 'calc(100vh - 42px - 60px - 14px)'
            }
          : {
              top: `${pos.y}px`,
              left: `${pos.x}px`,
              width: `${size.width}px`,
              height: `${size.height}px`
            })
      }}
      className={`absolute rounded-lg overflow-hidden flex flex-col transition-shadow duration-200 border ${
        isActive
          ? 'glass-panel-active border-sky-400/40 shadow-2xl'
          : 'glass-panel border-white/10 shadow-lg'
      }`}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className="h-9 px-3 bg-black/40 border-b border-white/10 flex items-center justify-between select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 font-mono text-xs font-medium text-slate-200">
          <span className="text-sky-400">#</span>
          <span>{windowState.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Traffic light buttons */}
          <button
            onClick={onMinimize}
            className="window-control-btn w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400 transition-colors"
            title="Minimize"
            aria-label="Minimize"
          />
          <button
            onClick={onMaximize}
            className="window-control-btn w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400 transition-colors"
            title="Maximize"
            aria-label="Maximize"
          />
          <button
            onClick={onClose}
            className="window-control-btn w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors"
            title="Close"
            aria-label="Close"
          />
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-auto bg-black/50 select-text relative">
        {children}
      </div>

      {/* Resize corner */}
      {!isMax && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-10"
        />
      )}
    </div>
  );
}
