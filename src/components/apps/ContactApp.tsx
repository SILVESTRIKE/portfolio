/*
Reason for existence: Minimalist, terminal-styled recruiter interaction workstation for Van Trong Duong (SILVESTRIKE) featuring single-box contact message drafting, direct Gmail launch, and direct CV download.
System impact if absent: Visitors, hiring managers, and engineering recruiters cannot submit callback inquiries, download Van Trong Duong's official CV, or initiate email outreach.
*/

'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { generateFingerprint } from '@/lib/fingerprint';

interface ContactAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
  isEmbedded?: boolean;
}

export function ContactApp({ onNotify, isEmbedded = false }: ContactAppProps) {
  const { t, locale } = useI18n();
  const c = t.apps.contact;

  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const emailAddress = 'vtduong04@gmail.com';
  const cvPath = '/CV_VanTrongDuong.docx';

  const copyEmailToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
      if (onNotify) {
        onNotify(`${c.copiedToast}: ${emailAddress}`, 'info');
      }
    }
  };

  const handleOpenGmail = () => {
    const su = encodeURIComponent(
      locale === 'vi'
        ? '[Liên hệ] Trao đổi cơ hội việc làm / Hợp tác'
        : '[Inquiry] Job Opportunity / Collaboration'
    );
    const body = encodeURIComponent(
      content.trim()
        ? content.trim()
        : locale === 'vi'
        ? 'Chào Dương,\n\nTôi đã xem qua WebOS Portfolio của bạn và muốn trao đổi thêm về cơ hội công việc...\n\nTrân trọng,'
        : 'Hello Duong,\n\nI reviewed your WebOS Portfolio and would like to discuss an engineering opportunity...\n\nBest regards,'
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${su}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) {
      setErrorMessage(c.errorRequired);
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      let fp: string | undefined;
      try {
        fp = generateFingerprint().fingerprint;
      } catch {
        // Ignore client fingerprint errors
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          fingerprint: fp
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setSubmitStatus('success');
        setContent('');
        if (onNotify) {
          onNotify(c.submitSuccess, 'info');
        }
      } else {
        setSubmitStatus('error');
        setErrorMessage(data?.error || c.errorGeneral);
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage(c.errorGeneral);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`w-full flex flex-col font-mono text-xs select-text bg-[#080c14] border border-white/10 rounded-lg overflow-hidden shadow-2xl ${isEmbedded ? 'h-full min-h-[440px]' : 'h-full'}`}>
      {/* Top Header / Profile Info */}
      <div className="bg-white/[0.03] border-b border-white/10 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-100">
              {c.headerTitle}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              {c.openForHire}
            </span>
          </div>
          <div className="text-slate-400 text-xs mt-1">
            {c.headerSub}
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5">
            {c.headerEdu}
          </div>
        </div>

        {/* Direct Download CV Button */}
        <a
          href={cvPath}
          download="CV_VanTrongDuong.docx"
          onClick={() => {
            if (onNotify) onNotify(c.downloadingCvToast, 'info');
          }}
          className="shrink-0 px-3.5 py-1.5 rounded border text-xs font-bold transition-all cursor-pointer bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 text-center"
        >
          {c.downloadCvBtn} (DOCX)
        </a>
      </div>

      {/* Editor Buffer Area */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto space-y-2.5 bg-[#090d14]">
        {/* Comment Header */}
        <div className="text-slate-400 text-[11px] leading-relaxed space-y-0.5 select-none shrink-0 border-b border-white/5 pb-2">
          <div className="text-emerald-400 font-semibold">#!/usr/bin/env bash</div>
          <div className="text-slate-500"># ------------------------------------------------------------------------------</div>
          <div className="text-sky-300"># SILVESTRIKE CONTACT WORKSTATION — Van Trong Duong</div>
          <div># Email: <span className="text-slate-200">vtduong04@gmail.com</span> | Status: <span className="text-emerald-400 font-bold">OPEN_FOR_HIRE</span></div>
          <div className="text-slate-500"># ------------------------------------------------------------------------------</div>
          <div className="text-amber-400/90 pt-1">
            {locale === 'vi'
              ? '# Nhập lời nhắn, thông tin liên hệ (Email/SĐT/Telegram) hoặc vị trí công việc bên dưới:'
              : '# Type your inquiry, contact information (Email/Phone/Telegram), or role below:'}
          </div>
        </div>

        {/* Freeform Terminal Textarea */}
        <div className="flex-1 min-h-[140px] flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            placeholder={c.inputPlaceholder}
            className="w-full flex-1 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-relaxed border-0 p-0 focus:ring-0 placeholder:text-slate-600 selection:bg-[#7aa2f7]/30"
          />
        </div>
      </form>

      {/* Status Bar */}
      <div className="bg-black/80 border-t border-white/10 px-3 py-1.5 text-[11px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="truncate">
          {submitStatus === 'idle' && (
            <span className="text-slate-400">
              {locale === 'vi'
                ? '[ Nhập nội dung. Bấm "Gửi thông tin" hoặc "Mở Gmail" bên dưới ]'
                : '[ Type message. Click "Submit" or "Open in Gmail" below ]'}
            </span>
          )}
          {submitStatus === 'success' && (
            <span className="text-emerald-400 font-bold">
              {locale === 'vi'
                ? '[ Đã ghi nhận: Dương sẽ liên hệ lại với bạn trong 24 giờ! ]'
                : '[ Written: Contact details recorded. Duong will reach out within 24h! ]'}
            </span>
          )}
          {submitStatus === 'error' && (
            <span className="text-rose-400 font-bold">
              {`[ Error: ${errorMessage || (locale === 'vi' ? 'Vui lòng nhập nội dung' : 'Please enter message')} ]`}
            </span>
          )}
          {isSubmitting && (
            <span className="text-[#89b4fa]">
              {locale === 'vi' ? '[ Đang gửi thông tin tới máy chủ... ]' : '[ Sending payload to server... ]'}
            </span>
          )}
        </div>

        <div className="text-[10px] text-slate-500 shrink-0">
          {locale === 'vi' ? 'Dòng ' : 'Line '} {content ? content.split('\n').length : 1}, {content.length} {locale === 'vi' ? 'ký tự' : 'chars'}
        </div>
      </div>

      {/* Recruiter-Friendly Actions Menu */}
      <div className="bg-[#06090f] border-t border-white/10 p-2.5 flex flex-wrap items-center gap-2 font-mono text-xs select-none shrink-0">
        {/* Submit Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#7aa2f7]/20 hover:bg-[#7aa2f7]/30 border border-[#7aa2f7]/40 rounded text-xs font-bold text-[#89b4fa] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>{isSubmitting ? c.submittingBtn : c.submitBtn}</span>
          <span className="text-[10px] text-slate-400 font-normal opacity-70 hidden sm:inline">(Ctrl+S)</span>
        </button>

        {/* Open in Gmail (Distinct Rose/Red Color) */}
        <button
          type="button"
          onClick={handleOpenGmail}
          className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 rounded text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
        >
          {c.openGmailBtn}
        </button>

        {/* Download CV */}
        <a
          href={cvPath}
          download="CV_VanTrongDuong.docx"
          onClick={() => {
            if (onNotify) onNotify(c.downloadingCvToast, 'info');
          }}
          className="px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded text-xs font-semibold text-emerald-300 transition-colors cursor-pointer text-center"
        >
          {c.downloadCvBtn}
        </a>

        {/* Copy Email */}
        <button
          type="button"
          onClick={copyEmailToClipboard}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded text-xs text-slate-300 hover:text-slate-100 transition-colors cursor-pointer ml-auto"
        >
          {copiedEmail ? (locale === 'vi' ? 'Đã sao chép Email' : 'Copied Email') : 'vtduong04@gmail.com'}
        </button>
      </div>
    </div>
  );
}
