/*
Reason for existence: Native WebOS conversational AI assistant application utilizing Google Gemini API (/api/ai) to guide visitors through Duong's portfolio, skills, and projects.
System Impact of Absence: WebOS lacks an interactive, live AI guide conversant in Duong's technical background and flagship repositories.
*/

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AIChatMessage } from '@/types';
import { useI18n } from '@/lib/i18n';

export function AIAssistantApp() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      content: t.apps.ai.initMsg,
      timestamp: '16:00'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('gemini-2.0-flash');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update initial message when locale toggles
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'init') {
        return [{ ...prev[0], content: t.apps.ai.initMsg }];
      }
      return prev;
    });
  }, [t.apps.ai.initMsg]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const quickPrompts = [
    t.apps.ai.quickPrompt1,
    t.apps.ai.quickPrompt2,
    t.apps.ai.quickPrompt3,
    t.apps.ai.quickPrompt4
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || isThinking) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toTimeString().substring(0, 5)
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setInput('');
    setIsThinking(true);

    try {
      const historyPayload = nextMessages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content
      }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'Toi da nhan thong tin cua ban.';
      if (data.model) setActiveModel(data.model);

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toTimeString().substring(0, 5)
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        content: `Tôi đã nhận được câu hỏi về "${q}".
Hiện tại kết nối mạng của Doru AI đang tạm thời gián đoạn. Bạn có thể khám phá trực tiếp các dự án của Dương:
- Samco VinFast EV E-Commerce (Next.js 14, Prisma, PostgreSQL).
- Veritas AI: Pipeline RAG pháp lý Việt Nam.
- DogDexx AI: Mô hình CNN phân loại giống chó (dogdexx.vercel.app).
Hoặc liên hệ trực tiếp với Dương qua email: vtduong04@gmail.com!`,
        timestamp: new Date().toTimeString().substring(0, 5)
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col font-sans text-xs bg-[#080c14] select-text">
      {/* Header bar */}
      <div className="h-9 px-3 bg-[#0a0e18] border-b border-white/10 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-[#7aa2f7] shadow-[0_0_8px_rgba(122,162,247,0.6)]" />
          <span className="font-bold text-slate-100">{t.apps.ai.headerTitle}</span>
        </div>
      </div>

      {/* Chat scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 font-mono">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                isUser ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                <span>{isUser ? 'user@silvestrike.dev' : 'doru-ai'}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>
              <div
                className={`p-3 rounded-lg leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[#7aa2f7]/20 text-[#89b4fa] border border-[#7aa2f7]/30'
                    : 'bg-white/[0.04] text-slate-200 border border-white/10'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="mr-auto flex items-center gap-2 text-slate-400 font-mono text-[11px] bg-white/[0.02] p-2 rounded border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7aa2f7] animate-ping" />
            <span>{t.apps.ai.thinkingMsg}</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 bg-[#060910] border-t border-white/5 flex gap-1.5 overflow-x-auto select-none font-mono">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="whitespace-nowrap bg-white/5 hover:bg-[#7aa2f7]/15 border border-white/10 hover:border-[#7aa2f7]/30 text-slate-300 hover:text-[#7aa2f7] text-[10px] px-2.5 py-1 rounded transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-2.5 bg-[#090d16] border-t border-white/10 flex items-center gap-2 select-none">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t.apps.ai.inputPlaceholder}
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-[#7aa2f7] font-mono placeholder-slate-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={isThinking}
          className="bg-[#7aa2f7] hover:bg-[#89b4fa] disabled:opacity-50 text-black font-semibold font-mono text-xs px-3.5 py-1.5 rounded transition-colors"
        >
          {t.apps.ai.sendBtn}
        </button>
      </div>
    </div>
  );
}
