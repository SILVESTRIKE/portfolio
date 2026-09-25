/*
Reason for existence: Interactive communication channels view for contact.sh and UNIX manpage view for manual.man.
System Impact of Absence: Dossier studio cannot display developer contact links, clipboard copy buttons, or UNIX manual documentation.
*/

'use client';

import React from 'react';
import { FileId } from '../types';
import { ContactApp } from '../../ContactApp';

interface ContactManualViewProps {
  activeTab: FileId;
  copiedKey: string | null;
  onCopy: (text: string, label: string) => void;
  sendEmailText?: string;
  copyText?: string;
}

export function ContactManualView({
  activeTab,
  copiedKey: _copiedKey,
  onCopy,
  sendEmailText: _sendEmailText,
  copyText: _copyText
}: ContactManualViewProps) {
  if (activeTab === 'contact.sh') {
    return (
      <div className="w-full h-full min-h-[460px] flex flex-col">
        <ContactApp
          onNotify={(msg) => onCopy(msg, 'Status')}
          isEmbedded
        />
      </div>
    );
  }

  if (activeTab === 'manual.man') {
    return (
      <div className="space-y-4 w-full font-mono text-[11px] leading-relaxed">
        <div className="p-5 bg-black/60 border border-white/10 rounded-lg space-y-4">
          <div>
            <span className="text-sky-400 font-bold">NAME</span>
            <p className="text-slate-300 ml-4">
              silvestrike - Van Trong Duong, software engineer & AI researcher
            </p>
          </div>

          <div>
            <span className="text-sky-400 font-bold">SYNOPSIS</span>
            <p className="text-slate-300 ml-4">
              silvestrike [--fullstack] [--ai-ml] [--architecture] [--hire]
            </p>
          </div>

          <div>
            <span className="text-sky-400 font-bold">DESCRIPTION</span>
            <p className="text-slate-300 ml-4">
              Graduating IT engineer specializing in robust web services, PyTorch deep learning models, and system architecture.
              Driven by Clean Architecture, high test coverage, and modular microservices.
            </p>
          </div>

          <div>
            <span className="text-sky-400 font-bold">FILES</span>
            <div className="text-slate-400 ml-4 space-y-1 mt-1">
              <div><span className="text-emerald-400">profile.yml</span> - System profile & academic background</div>
              <div><span className="text-emerald-400">skills.json</span> - 6 core programming dialects & framework matrix</div>
              <div><span className="text-emerald-400">samco-binhtan.ts</span> - VinFast EV sales CMS e-commerce platform</div>
              <div><span className="text-emerald-400">dogdexx-ai.py</span> - PyTorch CNN computer vision dog breed identification</div>
              <div><span className="text-emerald-400">doru-agent.py</span> - Linux voice desktop assistant engine</div>
              <div><span className="text-emerald-400">thesis-veritas.md</span> - Veritas Vietnamese land law RAG pipeline</div>
              <div><span className="text-emerald-400">contact.sh</span> - Direct communication channels</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
