/*
Reason for existence: Visual Linux server file explorer and editor allowing directory navigation, permissions inspection, and file editing.
System impact if absent: Server File Explorer application cannot browse directories or edit configuration files.
*/

'use client';

import React, { useState, useEffect } from 'react';
import { vfs } from '@/lib/fs';
import { FileNode } from '@/types';

interface FilesAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function FilesApp({ onNotify }: FilesAppProps) {
  const [currentPath, setCurrentPath] = useState('/home/doru');
  const [items, setItems] = useState<FileNode[]>([]);
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);

  const loadDir = (path: string) => {
    const norm = vfs.normalizePath(path);
    setCurrentPath(norm);
    const list = vfs.listDir(norm) || [];
    list.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    setItems(list);
  };

  useEffect(() => {
    loadDir(currentPath);
  }, []);

  const handleOpenItem = (item: FileNode) => {
    const full = vfs.resolvePath(currentPath, item.name);
    if (item.type === 'dir') {
      loadDir(full);
    } else {
      const content = vfs.readFile(full) || '';
      setEditingFile({ path: full, content });
    }
  };

  const handleSaveEditor = () => {
    if (!editingFile) return;
    vfs.writeFile(editingFile.path, editingFile.content, 'root', '644');
    if (onNotify) onNotify(`Saved changes to ${editingFile.path}`, 'info');
    loadDir(currentPath);
    setEditingFile(null);
  };

  const handleCreateFile = () => {
    const name = window.prompt('Enter new file name:');
    if (name) {
      const p = vfs.resolvePath(currentPath, name);
      vfs.writeFile(p, '# Created on ' + new Date().toISOString() + '\n', 'root', '644');
      if (onNotify) onNotify(`Created file ${name}`, 'info');
      loadDir(currentPath);
    }
  };

  const handleCreateDir = () => {
    const name = window.prompt('Enter new directory name:');
    if (name) {
      const p = vfs.resolvePath(currentPath, name);
      vfs.createDir(p, 'root', 'root');
      if (onNotify) onNotify(`Created directory ${name}`, 'info');
      loadDir(currentPath);
    }
  };

  const handleDelete = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete '${name}'?`)) {
      const p = vfs.resolvePath(currentPath, name);
      vfs.deleteNode(p);
      if (onNotify) onNotify(`Deleted ${name}`, 'warn');
      loadDir(currentPath);
    }
  };

  const shortcuts = [
    { label: '/home/doru', path: '/home/doru' },
    { label: '/ (Root)', path: '/' },
    { label: '/etc', path: '/etc' },
    { label: '/etc/nginx', path: '/etc/nginx' },
    { label: '/var/log', path: '/var/log' },
    { label: '/proc', path: '/proc' }
  ];

  return (
    <div className="h-full w-full flex flex-col font-sans text-xs relative select-none">
      {/* Toolbar */}
      <div className="h-10 bg-black/40 border-b border-white/10 px-3 flex items-center gap-2 overflow-x-auto shrink-0">
        <button
          onClick={() => {
            const up = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
            loadDir(up);
          }}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          .. (Up)
        </button>
        <button
          onClick={() => loadDir('/home/doru')}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          Home
        </button>
        <div className="flex-1 min-w-[120px] bg-white/5 border border-white/10 rounded px-2.5 py-1 font-mono text-sky-400 truncate">
          {currentPath}
        </div>
        <button
          onClick={handleCreateFile}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          + File
        </button>
        <button
          onClick={handleCreateDir}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          + Folder
        </button>
        <button
          onClick={() => loadDir(currentPath)}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          Refresh
        </button>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-36 sm:w-44 border-r border-white/10 p-2 flex flex-col gap-1 bg-black/20 shrink-0 hidden sm:flex">
          <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 font-bold">
            Places
          </div>
          {shortcuts.map((sc) => (
            <button
              key={sc.path}
              onClick={() => loadDir(sc.path)}
              className={`text-left px-2 py-1.5 rounded font-mono text-[11px] truncate transition-colors ${
                currentPath === sc.path
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </aside>

        {/* File table */}
        <div className="flex-1 overflow-auto bg-black/30">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="sticky top-0 bg-obsidian-900 border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-2 px-3 w-2/5">Name</th>
                <th className="py-2 px-3 w-1/5">Permissions</th>
                <th className="py-2 px-3 w-1/6">Owner</th>
                <th className="py-2 px-3 w-1/8">Size</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Directory is empty
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const isDir = it.type === 'dir';
                  return (
                    <tr
                      key={it.name}
                      onClick={() => handleOpenItem(it)}
                      className="border-b border-white/[0.03] hover:bg-sky-400/5 transition-colors cursor-pointer select-none"
                    >
                      <td className="py-2 px-3 flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${isDir ? 'text-sky-400' : 'text-slate-400'}`}>
                          {isDir ? '[DIR]' : '[FILE]'}
                        </span>
                        <span className={isDir ? 'font-bold text-sky-300' : 'text-slate-200'}>
                          {it.name}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{it.permissions}</td>
                      <td className="py-2 px-3 text-slate-500">{it.owner}:{it.group}</td>
                      <td className="py-2 px-3 text-slate-400">{isDir ? '-' : (it.size || 0) + ' B'}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          {!isDir && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenItem(it);
                              }}
                              className="bg-white/10 hover:bg-white/20 text-slate-300 px-2 py-0.5 rounded text-[10px]"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(it.name, e)}
                            className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded text-[10px] border border-rose-500/30"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrated Text Editor Modal */}
      {editingFile && (
        <div className="absolute inset-0 bg-obsidian-950 flex flex-col z-30 select-text">
          <div className="h-10 bg-black/60 border-b border-white/10 px-4 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-200 font-semibold">nano {editingFile.path}</span>
            <div className="flex gap-2">
              <button
                onClick={handleSaveEditor}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1 rounded text-xs transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingFile(null)}
                className="bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1 rounded text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <textarea
            value={editingFile.content}
            onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
            className="flex-1 bg-obsidian-950 text-slate-100 p-4 font-mono text-xs outline-none border-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
