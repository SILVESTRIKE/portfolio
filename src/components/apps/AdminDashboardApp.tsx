/*
Reason for existence: Private recruiter intelligence and visitor tracking dashboard enabling Duong to identify visiting companies, trace recruiter leads, and manage employment outreach notes.
System impact if absent: Duong will have no dedicated interface to monitor corporate visitors, analyze recruiter interest, or record outreach follow-ups.
*/

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VisitorProfile, AnalyticsSummary } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';

interface AdminDashboardAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function AdminDashboardApp({ onNotify }: AdminDashboardAppProps) {
  const { t } = useI18n();
  const a = t.apps.admin;

  const [authToken, setAuthToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [visitors, setVisitors] = useState<VisitorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const [editingFp, setEditingFp] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [tagDraft, setTagDraft] = useState<VisitorProfile['tag']>('lead');
  const [savingNote, setSavingNote] = useState<boolean>(false);

  const loadData = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/visitors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => null);

      if (res.status === 429) {
        setIsAuthenticated(false);
        setAuthError(data?.error || 'Rate limit: Qua nhieu lan thu sai. Vui long thu lai sau 15 phut.');
        setLoading(false);
        return;
      }

      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        setAuthError(data?.error || 'Authentication token invalid');
        setLoading(false);
        return;
      }

      if (res.ok && data) {
        setSummary(data.summary);
        setVisitors(data.visitors || []);
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError(data?.error || 'Failed to fetch visitors data');
      }
    } catch {
      setAuthError('Connection error to analytics server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadData(authToken);
      const timer = setInterval(() => loadData(authToken), 8000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated, authToken, loadData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const token = tokenInput.trim();
    if (!token) return;

    setAuthToken(token);
    loadData(token);
  };

  const handleLogout = () => {
    setAuthToken('');
    setIsAuthenticated(false);
    setTokenInput('');
    setAuthError('');
  };

  const handleStartEdit = (visitor: VisitorProfile) => {
    setEditingFp(visitor.fingerprint);
    setNoteDraft(visitor.notes || '');
    setTagDraft(visitor.tag || 'general');
  };

  const handleSaveNote = async (fp: string) => {
    setSavingNote(true);
    try {
      const res = await fetch('/api/admin/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          fingerprint: fp,
          notes: noteDraft,
          tag: tagDraft
        })
      });

      if (res.ok) {
        setVisitors((prev) =>
          prev.map((v) => (v.fingerprint === fp ? { ...v, notes: noteDraft, tag: tagDraft } : v))
        );
        setEditingFp(null);
        if (onNotify) onNotify('Notes saved successfully', 'info');
      } else {
        const data = await res.json().catch(() => null);
        if (onNotify) onNotify(data?.error || 'Failed to save notes', 'error');
      }
    } catch {
      if (onNotify) onNotify('Connection error saving notes', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleCopyLeadInfo = (v: VisitorProfile) => {
    const text = [
      `Organization: ${v.org || 'Unspecified'}`,
      `Location: ${v.city}, ${v.country}`,
      `Referrer: ${v.referrer || 'Direct'}`,
      `Device: ${v.device}`,
      `Sessions: ${v.totalVisits} (${v.pageviews} views)`,
      `Pages: ${v.pagesVisited.join(', ')}`,
      `Notes: ${v.notes || 'None'}`
    ].join('\n');

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      if (onNotify) onNotify('Copied lead details to clipboard', 'info');
    }
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        v.org.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.country.toLowerCase().includes(q) ||
        v.ip.includes(q) ||
        v.fingerprint.toLowerCase().includes(q) ||
        v.referrer.toLowerCase().includes(q) ||
        v.notes.toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (filterTag === 'leads') {
        return v.isRecruiterCandidate || v.tag === 'lead' || v.tag === 'recruiter';
      }
      if (filterTag === 'contacted') {
        return v.tag === 'contacted';
      }
      if (filterTag === 'interviewing') {
        return v.tag === 'interviewing';
      }
      return true;
    });
  }, [visitors, searchQuery, filterTag]);

  const potentialLeadsCount = visitors.filter(
    (v) => v.isRecruiterCandidate || v.tag === 'lead' || v.tag === 'recruiter'
  ).length;

  if (!isAuthenticated) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4 font-mono select-none bg-[#0a0d14]">
        <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-lg p-6 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <div className="text-[#7aa2f7] font-bold text-sm">
              {a.authTitle}
            </div>
            <div className="text-slate-400 text-xs mt-1">
              {a.authSubtitle}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                {a.tokenLabel}
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder={a.tokenPlaceholder}
                className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#7aa2f7]"
                autoFocus
              />
            </div>

            {authError && (
              <div className="text-rose-400 text-xs py-1 border border-rose-500/20 bg-rose-500/10 px-2 rounded">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-[#7aa2f7]/20 border border-[#7aa2f7]/40 text-[#89b4fa] hover:bg-[#7aa2f7]/30 rounded text-xs font-bold transition-colors cursor-pointer"
            >
              {a.unlockBtn}
            </button>
          </form>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-white/5">
            {a.authDesc}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-3.5 flex flex-col gap-3 font-sans text-xs overflow-y-auto select-text bg-[#090c12]">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between bg-black/40 border border-white/10 rounded-lg p-2.5 gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#7aa2f7]">
              {a.headerTitle}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {a.liveBadge}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {a.headerSubtitle}
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => loadData(authToken)}
            disabled={loading}
            className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded text-[11px] transition-colors cursor-pointer"
          >
            {loading ? a.refreshingBtn : a.refreshBtn}
          </button>
          <button
            onClick={handleLogout}
            className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 rounded text-[11px] transition-colors cursor-pointer"
          >
            {a.lockBtn}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="text-slate-400 font-mono text-[11px] mb-1">
            {a.leadsCardTitle}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {potentialLeadsCount}
          </div>
          <div className="text-[10px] text-emerald-500/80 font-mono mt-1">
            {a.leadsCardDesc}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="text-slate-400 font-mono text-[11px] mb-1">
            {a.visitorsCardTitle}
          </div>
          <div className="text-2xl font-bold font-mono text-[#7aa2f7]">
            {visitors.length || summary?.uniqueVisitors || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {a.visitorsCardDesc}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="text-slate-400 font-mono text-[11px] mb-1">
            {a.pageviewsCardTitle}
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {summary?.totalPageviews ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {a.pageviewsCardDesc}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="text-slate-400 font-mono text-[11px] mb-1">
            {a.sessionsCardTitle}
          </div>
          <div className="text-2xl font-bold font-mono text-[#9ece6a]">
            {summary?.activeSessions ?? 1}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {a.sessionsCardDesc}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/40 border border-white/10 rounded-lg p-2 font-mono">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <span className="text-[#7aa2f7] text-xs font-bold">[Query]</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={a.searchPlaceholder}
            className="w-full bg-transparent border-none outline-none text-slate-200 text-xs placeholder-slate-600"
          />
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          {(['all', 'leads', 'contacted', 'interviewing'] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-2 py-0.5 rounded transition-colors ${
                filterTag === tag
                  ? 'bg-[#7aa2f7]/20 text-[#7aa2f7] border border-[#7aa2f7]/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tag === 'all'
                ? a.filterAll
                : tag === 'leads'
                ? a.filterLeads
                : tag === 'contacted'
                ? a.filterContacted
                : a.filterInterviewing}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visitors Table */}
      <div className="flex-1 bg-black/40 border border-white/10 rounded-lg overflow-hidden flex flex-col min-h-[350px]">
        <div className="p-2 border-b border-white/10 flex justify-between items-center font-mono text-[11px]">
          <span className="text-slate-300 font-bold">
            {a.tableTitle} ({filteredVisitors.length})
          </span>
          <span className="text-slate-500">
            {a.tableTip}
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="sticky top-0 bg-[#0c1017] border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-2 px-2.5">{a.colOrg}</th>
                <th className="py-2 px-2">{a.colLocation}</th>
                <th className="py-2 px-2">{a.colReferrer}</th>
                <th className="py-2 px-2">{a.colDevice}</th>
                <th className="py-2 px-2 text-center">{a.colVisits}</th>
                <th className="py-2 px-2">{a.colPages}</th>
                <th className="py-2 px-2">{a.colNotes}</th>
                <th className="py-2 px-2">{a.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    {a.noData}
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => {
                  const isLead = v.isRecruiterCandidate || v.tag === 'lead' || v.tag === 'recruiter';
                  const isEditing = editingFp === v.fingerprint;

                  return (
                    <tr
                      key={v.fingerprint}
                      className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
                        isLead ? 'bg-emerald-500/[0.03]' : ''
                      }`}
                    >
                      {/* Organization / ISP */}
                      <td className="py-2 px-2.5 align-top">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{v.org || 'Standard Network'}</span>
                          {isLead && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px]">
                              LEAD
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          IP: {v.ip} | ID: {v.fingerprint.substring(0, 14)}...
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-2 px-2 align-top text-slate-300">
                        <div>{v.city}</div>
                        <div className="text-[10px] text-slate-500">{v.country}</div>
                      </td>

                      {/* Referrer */}
                      <td className="py-2 px-2 align-top text-slate-400">
                        {v.referrer ? (
                          <span
                            className="text-[#7aa2f7] hover:underline truncate max-w-[120px] block"
                            title={v.referrer}
                          >
                            {v.referrer.replace(/^https?:\/\/(www\.)?/, '')}
                          </span>
                        ) : (
                          <span className="text-slate-600">Direct / Bookmark</span>
                        )}
                      </td>

                      {/* Device */}
                      <td className="py-2 px-2 align-top text-slate-300">
                        <div>{v.device}</div>
                        <div className="text-[10px] text-slate-500">
                          {v.browser} | {v.screen}
                        </div>
                      </td>

                      {/* Visits & Pageviews */}
                      <td className="py-2 px-2 align-top text-center">
                        <div className="text-[#7aa2f7] font-bold">
                          {v.totalVisits} sess
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {v.pageviews} views
                        </div>
                      </td>

                      {/* Pages Visited */}
                      <td className="py-2 px-2 align-top">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {v.pagesVisited.map((p, idx) => (
                            <span
                              key={idx}
                              className="px-1 py-0.2 bg-white/5 border border-white/10 rounded text-[10px] text-slate-300"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1">
                          {v.lastSeen.substring(11, 16)}
                        </div>
                      </td>

                      {/* Notes & Tag */}
                      <td className="py-2 px-2 align-top min-w-[180px]">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              rows={2}
                              placeholder="Notes..."
                              className="w-full p-1.5 bg-black/60 border border-white/20 rounded text-[11px] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#7aa2f7]"
                            />
                            <div className="flex items-center gap-1.5">
                              <select
                                value={tagDraft}
                                onChange={(e) =>
                                  setTagDraft(e.target.value as VisitorProfile['tag'])
                                }
                                className="bg-black/60 border border-white/20 rounded text-[10px] text-slate-200 px-1 py-0.5"
                              >
                                <option value="lead">Recruiter (Lead)</option>
                                <option value="contacted">Contacted</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="general">General Visitor</option>
                              </select>
                              <button
                                onClick={() => handleSaveNote(v.fingerprint)}
                                disabled={savingNote}
                                className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] hover:bg-emerald-500/30"
                              >
                                {a.saveBtn}
                              </button>
                              <button
                                onClick={() => setEditingFp(null)}
                                className="px-1.5 py-0.5 text-slate-400 hover:text-slate-200 text-[10px]"
                              >
                                {a.cancelBtn}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  v.tag === 'lead'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : v.tag === 'contacted'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : v.tag === 'interviewing'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-white/5 text-slate-400 border border-white/10'
                                }`}
                              >
                                {v.tag === 'lead'
                                  ? 'LEAD'
                                  : v.tag === 'contacted'
                                  ? 'CONTACTED'
                                  : v.tag === 'interviewing'
                                  ? 'INTERVIEW'
                                  : 'GENERAL'}
                              </span>
                            </div>
                            <div className="text-slate-300 text-[11px] italic">
                              {v.notes || (
                                <span className="text-slate-600 not-italic">
                                  -
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-2 align-top">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleStartEdit(v)}
                            className="px-2 py-0.5 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded text-[10px] text-center cursor-pointer"
                          >
                            {a.editNotesBtn}
                          </button>
                          <button
                            onClick={() => handleCopyLeadInfo(v)}
                            className="px-2 py-0.5 bg-[#7aa2f7]/10 border border-[#7aa2f7]/20 text-[#89b4fa] hover:bg-[#7aa2f7]/20 rounded text-[10px] text-center cursor-pointer"
                          >
                            {a.copyLeadBtn}
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
    </div>
  );
}
