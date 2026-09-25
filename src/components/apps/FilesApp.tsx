/*
Reason for existence: Visual Linux server file explorer and editor allowing directory navigation, permissions inspection, and file editing.
System impact if absent: Server File Explorer application cannot browse directories or edit configuration files.
*/

'use client';

import React, { useState, useEffect } from 'react';
import { vfs } from '@/lib/fs';
import { FileNode } from '@/types';
import { useI18n } from '@/lib/i18n';

interface FilesAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function FilesApp({ onNotify }: FilesAppProps) {
  const { t } = useI18n();
  const [currentPath, setCurrentPath] = useState('/home/silvestrike');
  const [items, setItems] = useState<FileNode[]>([]);
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);

  const loadDir = (path: string) => {
    let norm = vfs.normalizePath(path);
    setCurrentPath(norm);
    let list = vfs.listDir(norm) || [];
    if (list.length === 0 && norm === '/home/silvestrike') {
      vfs.ensureEssentialFiles();
      list = vfs.listDir(norm) || [];
    }
    list.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    setItems(list);
  };

  useEffect(() => {
    loadDir(currentPath);
  }, []);

  const downloadBlob = (filename: string, content: string) => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback
    }
  };

  const handleOpenItem = (item: FileNode) => {
    const full = vfs.resolvePath(currentPath, item.name);
    if (item.type === 'dir') {
      loadDir(full);
    } else {
      const content = vfs.readFile(full) || '';
      setEditingFile({ path: full, content });
    }
  };

  const handleSaveAndDownload = () => {
    if (!editingFile) return;
    vfs.writeFile(editingFile.path, editingFile.content, 'root', '644');
    const filename = editingFile.path.split('/').pop() || 'document.txt';
    downloadBlob(filename, editingFile.content);
    if (onNotify) onNotify(`Saved & downloaded ${filename} to your device`, 'info');
    loadDir(currentPath);
  };

  const handleSaveEditor = () => {
    if (!editingFile) return;
    vfs.writeFile(editingFile.path, editingFile.content, 'root', '644');
    if (onNotify) onNotify(`${t.apps.files.savedToast} ${editingFile.path}`, 'info');
    loadDir(currentPath);
    setEditingFile(null);
  };

  const handleCreateFile = () => {
    const name = window.prompt(t.apps.files.newFilePrompt, 'untitled.txt');
    if (name && name.trim()) {
      const cleanName = name.trim();
      const p = vfs.resolvePath(currentPath, cleanName);
      const initialContent = `# Created on ${new Date().toLocaleDateString()}\n\n`;
      vfs.writeFile(p, initialContent, 'root', '644');
      loadDir(currentPath);
      setEditingFile({ path: p, content: initialContent });
      if (onNotify) onNotify(`${t.apps.files.createdFileToast} ${cleanName}`, 'info');
    }
  };

  const handleCreateDir = () => {
    const name = window.prompt(t.apps.files.newFolderPrompt);
    if (name) {
      const p = vfs.resolvePath(currentPath, name);
      vfs.createDir(p, 'root', 'root');
      if (onNotify) onNotify(`${t.apps.files.createdDirToast} ${name}`, 'info');
      loadDir(currentPath);
    }
  };

  const handleDownloadItem = (item: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'file') {
      if (item.name.toLowerCase().includes('.docx') || item.name.toLowerCase().includes('cv')) {
        const a = document.createElement('a');
        a.href = '/CV_VanTrongDuong.docx';
        a.download = 'CV_VanTrongDuong.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (onNotify) onNotify('Downloaded CV_VanTrongDuong.docx to your device', 'info');
        return;
      }
      const full = vfs.resolvePath(currentPath, item.name);
      const content = vfs.readFile(full) || '';
      downloadBlob(item.name, content);
      if (onNotify) onNotify(`Downloaded ${item.name} to your device`, 'info');
    }
  };

  const shortcuts = [
    { label: '/home/silvestrike', path: '/home/silvestrike' },
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
          {t.apps.files.upBtn}
        </button>
        <button
          onClick={() => loadDir('/home/silvestrike')}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          {t.apps.files.homeBtn}
        </button>
        <div className="flex-1 min-w-[120px] bg-white/5 border border-white/10 rounded px-2.5 py-1 font-mono text-[#7aa2f7] truncate">
          {currentPath}
        </div>
        <button
          onClick={handleCreateFile}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          {t.apps.files.newFileBtn}
        </button>
        <button
          onClick={handleCreateDir}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          {t.apps.files.newFolderBtn}
        </button>
        <button
          onClick={() => loadDir(currentPath)}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded font-mono text-[11px] shrink-0"
        >
          {t.apps.files.refreshBtn}
        </button>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-36 sm:w-44 border-r border-white/10 p-2 flex flex-col gap-1 bg-black/20 shrink-0 hidden sm:flex">
          <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 font-bold">
            {t.apps.files.placesLabel}
          </div>
          {shortcuts.map((sc) => (
            <button
              key={sc.path}
              onClick={() => loadDir(sc.path)}
              className={`text-left px-2 py-1.5 rounded font-mono text-[11px] truncate transition-colors ${currentPath === sc.path
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
                <th className="py-2 px-3 w-2/5">{t.apps.files.colName}</th>
                <th className="py-2 px-3 w-1/5">{t.apps.files.colPermissions}</th>
                <th className="py-2 px-3 w-1/6">{t.apps.files.colOwner}</th>
                <th className="py-2 px-3 w-1/8">{t.apps.files.colSize}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    {t.apps.files.emptyDir}
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
                      <td className="py-2 px-3">
                        {!isDir && it.name.toLowerCase().includes('cv') && (
                          <button
                            onClick={(e) => handleDownloadItem(it, e)}
                            className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black px-2.5 py-0.5 rounded text-[10px] border border-emerald-500/30 font-semibold transition-colors"
                            title="Download CV to your device"
                          >
                            Download CV
                          </button>
                        )}
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
        <div className="absolute inset-0 bg-[#0d1117] flex flex-col z-30 select-text font-mono">
          <div className="h-10 bg-black/70 border-b border-white/10 px-4 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[#7aa2f7] font-bold">nano</span>
              <span className="text-slate-300 font-semibold">{editingFile.path}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndDownload}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                title="Save file to virtual workspace and download directly to your computer"
              >
                <span>Save & Download</span>
              </button>
              <button
                onClick={handleSaveEditor}
                className="bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors"
                title="Save to WebOS Virtual Filesystem"
              >
                Save
              </button>
              <button
                onClick={() => setEditingFile(null)}
                className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <textarea
            value={editingFile.content}
            onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
            className="flex-1 bg-[#090d13] text-slate-100 p-4 font-mono text-xs outline-none border-none resize-none leading-relaxed"
            spellCheck={false}
            autoFocus
          />
          <div className="h-7 bg-black/60 border-t border-white/10 px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <span>
              Lines: {editingFile.content.split('\n').length} | Chars: {editingFile.content.length}
            </span>
            <span className="text-slate-500 hidden sm:inline">
              UTF-8 | Click &apos;Save &amp; Download&apos; to download to your device
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
