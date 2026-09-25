/*
Reason for existence: Git Visual Git Studio application rendering real commit graphs, branch hierarchy, and unified diff viewer.
System impact if absent: WebOS workspace cannot display visual Git commit history or source control diff inspection.
*/

'use client';

import React, { useState, useEffect } from 'react';
import { GitBranchInfo, GitCommitNode, GitFileDiff, GitRepoData, GitRepoItem } from '@/types';

export function GitKrakenApp() {
  const [repoData, setRepoData] = useState<GitRepoData | null>(null);
  const [selectedRepo, setSelectedRepo] = useState('SILVESTRIKE/portfolio');
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const [repoList, setRepoList] = useState<GitRepoItem[]>([]);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [customRepoInput, setCustomRepoInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommit, setSelectedCommit] = useState<GitCommitNode | null>(null);
  const [commitDiffs, setCommitDiffs] = useState<GitFileDiff[]>([]);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Fetch repository commits and branch data
  const loadRepo = async (targetRepo = selectedRepo, branch?: string) => {
    setIsLoading(true);
    setSelectedCommit(null);
    setCommitDiffs([]);
    try {
      const url = `/api/git?action=repo&repo=${encodeURIComponent(targetRepo)}${branch ? `&branch=${encodeURIComponent(branch)}` : ''
        }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as GitRepoData;
        setRepoData(data);
        if (data.commits && data.commits.length > 0) {
          handleSelectCommit(data.commits[0], targetRepo);
        }
      }
    } catch {
      // Failed to load
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRepo(selectedRepo);
    // Fetch available repositories
    fetch('/api/git?action=repos')
      .then((res) => res.json())
      .then((data) => {
        if (data?.repos) setRepoList(data.repos);
      })
      .catch(() => { });
  }, []);

  // Fetch diffs when a commit is selected
  const handleSelectCommit = async (commit: GitCommitNode, targetRepo = selectedRepo) => {
    setSelectedCommit(commit);
    setSelectedFileIndex(0);
    setIsLoadingDiff(true);
    try {
      const res = await fetch(
        `/api/git?action=diff&repo=${encodeURIComponent(targetRepo)}&hash=${commit.hash}`
      );
      if (res.ok) {
        const data = await res.json();
        setCommitDiffs(data.diffs || []);
      } else {
        setCommitDiffs([]);
      }
    } catch {
      setCommitDiffs([]);
    } finally {
      setIsLoadingDiff(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filter repositories
  const filteredRepoList = repoList.filter((r) => {
    if (!repoSearchQuery.trim()) return true;
    const q = repoSearchQuery.toLowerCase();
    return r.fullName.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
  });

  // Filter commits
  const filteredCommits = (repoData?.commits || []).filter(c => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.message.toLowerCase().includes(query) ||
      c.shortHash.toLowerCase().includes(query) ||
      c.author.toLowerCase().includes(query)
    );
  });

  const getCommitBadgeColor = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.startsWith('feat')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (msg.startsWith('fix')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (msg.startsWith('perf')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (msg.startsWith('refactor')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (msg.startsWith('docs')) return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getNodeColor = (index: number) => {
    const colors = ['#00e5ff', '#a855f7', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6'];
    return colors[index % colors.length];
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#121620] text-slate-200 font-sans select-none overflow-hidden text-xs">
      {/* Top Toolbar */}
      <div className="h-11 bg-[#181e2b] border-b border-white/10 px-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#1cd0a5] flex items-center justify-center text-black font-black text-[10px]">
              Git
            </div>
            <span className="font-bold text-slate-100 hidden sm:inline tracking-tight text-sm">
              Git Studio
            </span>
          </div>

          {/* Repo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
              className="flex items-center gap-1.5 bg-black/50 hover:bg-black/80 px-2.5 py-1 rounded-md border border-white/10 hover:border-[#1cd0a5]/50 transition-all font-mono text-[11px] text-white focus:outline-none"
              title="Click to switch repository (via GitHub API)"
            >
              <svg className="w-3.5 h-3.5 text-[#1cd0a5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-semibold">{repoData?.repoName || selectedRepo}</span>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${isRepoDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Click outside backdrop */}
            {isRepoDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRepoDropdownOpen(false)}
              />
            )}

            {/* Dropdown Popover */}
            {isRepoDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-[#141923] border border-white/15 rounded-lg shadow-2xl p-2.5 z-50 flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                  <span>Switch Repository</span>
                  <span className="text-[#1cd0a5]">GitHub API</span>
                </div>

                {/* Filter input */}
                <input
                  type="text"
                  placeholder="Filter repos..."
                  value={repoSearchQuery}
                  onChange={(e) => setRepoSearchQuery(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded px-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#1cd0a5]"
                  autoFocus
                />

                {/* Repos list */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {filteredRepoList.map((r) => {
                    const isSelected = r.fullName === (repoData?.repoName || selectedRepo);
                    return (
                      <button
                        key={r.fullName}
                        onClick={() => {
                          setSelectedRepo(r.fullName);
                          setIsRepoDropdownOpen(false);
                          loadRepo(r.fullName);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between gap-2 transition-colors ${isSelected
                          ? 'bg-[#1cd0a5]/20 text-[#1cd0a5] font-semibold border border-[#1cd0a5]/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                      >
                        <div className="truncate flex-1">
                          <div className="truncate text-[11px]">{r.fullName}</div>
                          {r.description && (
                            <div className="text-[9.5px] text-slate-500 truncate">{r.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {r.isLocal ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Local
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              Cloud
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom repo write-in */}
                <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter owner/repo"
                    value={customRepoInput}
                    onChange={(e) => setCustomRepoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customRepoInput.trim()) {
                        const target = customRepoInput.trim();
                        setSelectedRepo(target);
                        setIsRepoDropdownOpen(false);
                        loadRepo(target);
                        setCustomRepoInput('');
                      }
                    }}
                    className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#1cd0a5]"
                  />
                  <button
                    onClick={() => {
                      if (customRepoInput.trim()) {
                        const target = customRepoInput.trim();
                        setSelectedRepo(target);
                        setIsRepoDropdownOpen(false);
                        loadRepo(target);
                        setCustomRepoInput('');
                      }
                    }}
                    className="px-2 py-1 bg-[#1cd0a5]/20 hover:bg-[#1cd0a5]/30 text-[#1cd0a5] border border-[#1cd0a5]/40 rounded text-[11px] font-bold"
                  >
                    Go
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Branch */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#1cd0a5]/10 text-[#1cd0a5] px-2 py-1 rounded-md border border-[#1cd0a5]/30 font-mono text-[11px]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span>{repoData?.currentBranch || 'main'}</span>
          </div>

        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search commits (hash, msg, author)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-md px-2.5 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#1cd0a5] w-48 lg:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1 text-slate-500 hover:text-white"
              >
                x
              </button>
            )}
          </div>

          <button
            onClick={() => loadRepo(selectedRepo)}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] font-mono text-slate-300 transition-colors flex items-center gap-1"
            title="Refresh Git commits"
          >
            <svg className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Fetch</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar (Git Tree / Branches) */}
        <div className="w-48 bg-[#141923] border-r border-white/10 flex flex-col shrink-0 hidden md:flex">
          <div className="p-3 border-b border-white/5 font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Repository Navigator
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4 font-mono text-[11px]">
            {/* Local Branches */}
            <div>
              <div className="text-slate-500 text-[10px] font-bold px-2 py-1 uppercase">
                Local Branches
              </div>
              <div className="space-y-0.5 mt-1">
                {(repoData?.branches || []).filter(b => !b.isRemote).map(b => (
                  <div
                    key={b.name}
                    onClick={() => loadRepo(selectedRepo, b.name)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${b.isCurrent
                      ? 'bg-[#1cd0a5]/15 text-[#1cd0a5] font-semibold'
                      : 'text-slate-400 hover:bg-white/5'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${b.isCurrent ? 'bg-[#1cd0a5]' : 'bg-slate-600'}`} />
                    <span className="truncate">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Remote Branches */}
            <div>
              <div className="text-slate-500 text-[10px] font-bold px-2 py-1 uppercase">
                Remotes (origin)
              </div>
              <div className="space-y-0.5 mt-1">
                {(repoData?.branches || []).filter(b => b.isRemote).map(b => (
                  <div
                    key={b.name}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-slate-400 hover:bg-white/5 cursor-pointer"
                  >
                    <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    <span className="truncate">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Git Metadata */}
            <div className="pt-2 border-t border-white/5 text-[10px] text-slate-500 space-y-1 px-2">
              <div>Total Commits: <span className="text-slate-300 font-semibold">{repoData?.totalCommits || 0}</span></div>
              <div>Author: <span className="text-slate-300">SILVESTRIKE</span></div>
              <div>Status: <span className="text-[#1cd0a5]">Clean Working Tree</span></div>
            </div>
          </div>
        </div>

        {/* Center: Visual Commit Graph & List */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/10 bg-[#10141d]">
          {/* Table Header */}
          <div className="h-8 bg-[#151a24] border-b border-white/10 px-3 flex items-center text-slate-400 font-mono text-[10px] uppercase font-bold shrink-0">
            <div className="w-14">Graph</div>
            <div className="flex-1 min-w-0">Commit Message</div>
            <div className="w-28 hidden sm:block">Author</div>
            <div className="w-24 hidden md:block">Date</div>
            <div className="w-20 text-right">SHA</div>
          </div>

          {/* Commits List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono">
                Loading Git repository commits...
              </div>
            ) : filteredCommits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono">
                No commits found matching query.
              </div>
            ) : (
              filteredCommits.map((c, index) => {
                const isSelected = selectedCommit?.hash === c.hash;
                const nodeColor = getNodeColor(index);
                const isHead = index === 0;

                return (
                  <div
                    key={c.hash}
                    onClick={() => handleSelectCommit(c)}
                    className={`h-10 px-3 flex items-center cursor-pointer border-b border-white/[0.04] transition-colors ${isSelected
                      ? 'bg-[#1e2638] text-white shadow-inner border-l-2 border-l-[#1cd0a5]'
                      : 'hover:bg-white/[0.03] text-slate-300'
                      }`}
                  >
                    {/* Visual Commit Graph Node */}
                    <div className="w-14 relative h-full flex items-center justify-center shrink-0">
                      {/* Vertical line connecting nodes */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-700/60" />
                      {/* Circle node */}
                      <div
                        className="relative z-10 w-3 h-3 rounded-full border-2 border-[#10141d] shadow-sm transition-transform"
                        style={{ backgroundColor: nodeColor }}
                      />
                    </div>

                    {/* Commit Message & Badges */}
                    <div className="flex-1 min-w-0 flex items-center gap-2 pr-3">
                      {isHead && (
                        <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#1cd0a5]/20 text-[#1cd0a5] border border-[#1cd0a5]/40">
                          HEAD
                        </span>
                      )}
                      <span className={`shrink-0 px-1.5 py-0.2 rounded text-[9px] font-mono border ${getCommitBadgeColor(c.message)}`}>
                        {c.message.split('(')[0].split(':')[0]}
                      </span>
                      <span className="truncate font-medium text-[11px] text-slate-200">
                        {c.message}
                      </span>
                    </div>

                    {/* Author */}
                    <div className="w-28 hidden sm:flex items-center gap-1.5 text-slate-400 truncate text-[11px]">
                      <div className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 font-bold text-[9px] flex items-center justify-center shrink-0">
                        {c.author[0]}
                      </div>
                      <span className="truncate">{c.author}</span>
                    </div>

                    {/* Date / Relative Time */}
                    <div className="w-24 hidden md:block text-slate-500 font-mono text-[10px] truncate">
                      {c.relativeTime || c.date}
                    </div>

                    {/* Commit SHA */}
                    <div className="w-20 text-right font-mono text-[11px] shrink-0">
                      <span
                        onClick={e => {
                          e.stopPropagation();
                          handleCopyHash(c.hash);
                        }}
                        className="px-1.5 py-0.5 rounded bg-black/40 text-slate-400 hover:text-white hover:bg-black/60 border border-white/5 transition-colors cursor-copy"
                        title="Click to copy full commit hash"
                      >
                        {copiedHash === c.hash ? 'COPIED' : c.shortHash}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Commit Inspector & Real Unified Diff Viewer */}
        <div className="w-72 md:w-80 lg:w-96 max-w-[48%] bg-[#131722] flex flex-col shrink-0 overflow-hidden">
          {selectedCommit ? (
            <div className="h-full flex flex-col">
              {/* Commit Details Header */}
              <div className="p-3.5 border-b border-white/10 bg-[#171c28]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Commit Inspector
                  </span>
                  <button
                    onClick={() => handleCopyHash(selectedCommit.hash)}
                    className="text-[10px] font-mono text-[#1cd0a5] hover:underline"
                  >
                    {copiedHash === selectedCommit.hash ? 'Hash Copied!' : selectedCommit.shortHash}
                  </button>
                </div>

                <h3 className="font-bold text-sm text-white mt-1.5 leading-snug">
                  {selectedCommit.message}
                </h3>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-col gap-1 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Author:</span>
                    <span className="text-slate-200">{selectedCommit.author} ({selectedCommit.email})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="text-slate-200">{selectedCommit.date} ({selectedCommit.relativeTime})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hash:</span>
                    <span className="text-slate-400 truncate max-w-[180px]">{selectedCommit.hash}</span>
                  </div>
                </div>
              </div>

              {/* Changed Files Selector */}
              <div className="p-2 border-b border-white/10 bg-[#111520]">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase px-1 mb-1.5 flex items-center justify-between">
                  <span>Files Changed ({commitDiffs.length})</span>
                  {isLoadingDiff && <span className="text-[#1cd0a5] animate-pulse">Reading diff...</span>}
                </div>

                <div className="max-h-28 overflow-y-auto space-y-1">
                  {commitDiffs.map((file, idx) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFileIndex(idx)}
                      className={`w-full text-left px-2 py-1 rounded font-mono text-[10px] flex items-center justify-between transition-colors ${selectedFileIndex === idx
                        ? 'bg-[#1cd0a5]/20 text-[#1cd0a5] font-semibold'
                        : 'text-slate-300 hover:bg-white/5'
                        }`}
                    >
                      <span className="truncate pr-2">{file.path}</span>
                      <span className={`uppercase font-bold text-[9px] px-1 rounded ${file.status === 'added' ? 'text-emerald-400' : file.status === 'deleted' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                        {file.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real Unified Diff Display */}
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed bg-[#0c0f17]">
                {isLoadingDiff ? (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Loading unified diff...
                  </div>
                ) : commitDiffs.length > 0 && commitDiffs[selectedFileIndex] ? (
                  <div className="space-y-0.5">
                    <div className="text-slate-400 font-bold pb-2 border-b border-white/5 truncate">
                      {commitDiffs[selectedFileIndex].path}
                    </div>
                    {commitDiffs[selectedFileIndex].diff.split('\n').map((line, lIdx) => {
                      const isAdd = line.startsWith('+') && !line.startsWith('+++');
                      const isDel = line.startsWith('-') && !line.startsWith('---');
                      const isHunk = line.startsWith('@@');

                      return (
                        <div
                          key={lIdx}
                          className={`px-1 py-0.5 rounded whitespace-pre-wrap break-all ${isAdd
                            ? 'bg-emerald-950/40 text-emerald-300 font-semibold'
                            : isDel
                              ? 'bg-rose-950/40 text-rose-300'
                              : isHunk
                                ? 'bg-blue-950/30 text-blue-300 font-bold my-1'
                                : 'text-slate-400'
                            }`}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No diff available for this commit.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center text-slate-500 font-mono text-xs">
              Select a commit from the graph to inspect file diffs and commit changes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
