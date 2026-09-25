/*
Reason for existence: Native WebOS conversational AI assistant application answering user queries about Linux administration and SILVESTRIKE portfolio projects.
System impact if absent: WebOS lacks an interactive native AI assistant for sysadmin queries and project walkthroughs.
*/

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AIChatMessage } from '@/types';

export function AIAssistantApp() {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      content: 'Chào bạn! Tôi là Doru AI Native Assistant trên SILVESTRIKE Portfolio OS. Tôi có thể hỗ trợ giải đáp về các dự án trong portfolio của SILVESTRIKE, lệnh Linux server, hoặc phân tích trạng thái hệ thống.',
      timestamp: '16:00'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const quickPrompts = [
    'Doru AI hoạt động thế nào?',
    'Dự án DogDexx có gì đặc biệt?',
    'Tình trạng server silvestrike.dev hiện tại?',
    'Odoo Sandbox quản lý những gì?'
  ];

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toTimeString().substring(0, 5)
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const reply = generateAIResponse(q);
      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toTimeString().substring(0, 5)
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 700);
  };

  const generateAIResponse = (query: string): string => {
    const lower = query.toLowerCase();

    if (lower.includes('doru') || lower.includes('voice') || lower.includes('trợ lý')) {
      return `Doru AI là hệ thống trợ lý ảo cá nhân chạy nền trên Linux Hyprland:
- Kiến trúc gồm 8 node LangGraph kết nối pipeline: VAD -> STT (faster-whisper) -> Router -> [Desktop Tools / LLM] -> TTS (Kokoro ONNX / edge-tts).
- Sử dụng Silero VAD để lọc tiếng ồn và RepCNN ONNX phát hiện wakeword cục bộ không gửi âm thanh lên cloud.
- Hai tầng suy luận: Groq LPU (gpt-oss-20b siêu tốc 1000 t/s) và Agnes 2.0 làm fallback dự phòng.`;
    }

    if (lower.includes('dogdexx') || lower.includes('chó') || lower.includes('breed')) {
      return `DogDexx là nền tảng nhận diện giống chó và quản lý sổ theo dõi sức khỏe thú cưng bằng AI:
- Công nghệ: PyTorch (Deep Learning Convolutional Neural Network) kết hợp Next.js và Vercel Edge.
- Trạng thái: Đã deploy trực tiếp tại https://dogdexx.vercel.app.
- Tính năng: Tải ảnh chó để phân loại giống với độ chính xác cao và quản lý lịch tiêm chủng, hồ sơ y tế.`;
    }

    if (lower.includes('odoo') || lower.includes('erp') || lower.includes('crm')) {
      return `Odoo Sandbox trên WebOS mô phỏng hệ thống quản trị doanh nghiệp toàn diện Odoo 18:
- Phân hệ CRM: Theo dõi phễu khách hàng tiềm năng qua các giai đoạn (New -> Qualified -> Proposition -> Won).
- Bán hàng & Hóa đơn: Theo dõi doanh thu, tạo hóa đơn bán lẻ, quản lý trạng thái thanh toán.
- Kho vận: Quản lý số lượng tồn kho và cảnh báo mức hàng thấp.
- Backend: Chạy qua unit odoo-erp.service với kết nối PostgreSQL connection pool.`;
    }

    if (lower.includes('server') || lower.includes('tình trạng') || lower.includes('srv-doru')) {
      return `Báo cáo trạng thái server srv-doru.internal:
- Kernel: Linux 6.8.0-45-generic x86_64 (Ubuntu 24.04 LTS).
- CPU: Intel Xeon Platinum 8480+ (8 cores) đang tải ~12%.
- Memory: Đã cấp phát ~3.4 GB / 16.0 GB (21%).
- Mạng: Cổng eth0 IP 192.168.1.100, các port 22, 80, 443, 5432 và 3000 đang LISTEN.
- Tường lửa UFW: ACTIVE.`;
    }

    if (lower.includes('danhgiacamxuc') || lower.includes('cảm xúc') || lower.includes('sentiment')) {
      return `DanhGiaCamXuc là mô hình NLP xử lý ngôn ngữ tự nhiên tiếng Việt:
- Sử dụng underthesea để tách từ (word tokenization) và PyTorch huấn luyện phân loại sắc thái bình luận.
- Bạn có thể mở tab Sandbox trong ứng dụng Services để gõ thử câu tiếng Việt và xem điểm xác suất Cảm xúc Tích cực / Tiêu cực.`;
    }

    if (lower.includes('quiz') || lower.includes('document')) {
      return `document_to_quiz là công cụ tự động hóa biến tài liệu PDF/DOCX thành bộ câu hỏi ôn tập:
- Công nghệ: Node.js Express kết hợp Google Gemini Pro API để phân tích cấu trúc bài giảng.
- Hỗ trợ xuất đề trắc nghiệm có giải thích đáp án chi tiết.`;
    }

    return `Tôi đã ghi nhận yêu cầu: "${query}". Bạn có thể sử dụng thanh công cụ hoặc dock để mở các ứng dụng tương ứng như Terminal, Activity Monitor, Odoo ERP Sandbox hoặc danh mục Services của SILVESTRIKE.`;
  };

  return (
    <div className="h-full w-full flex flex-col font-sans text-xs bg-[#090c12] select-text">
      {/* Header bar */}
      <div className="h-9 px-3 bg-black/50 border-b border-white/10 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
          <span className="font-bold text-slate-100">Doru AI Native Engine</span>
          <span className="text-[10px] text-slate-500 font-normal">v2.4-fast</span>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          Backend: Local Hybrid LPU
        </div>
      </div>

      {/* Chat scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mb-1">
                <span>{isUser ? 'user@srv-doru' : 'doru-ai'}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>
              <div
                className={`p-3 rounded-lg leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-sky-500/20 text-sky-100 border border-sky-400/30'
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
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            <span>Doru AI is generating response...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 bg-black/40 border-t border-white/5 flex gap-1.5 overflow-x-auto select-none">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="whitespace-nowrap bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] px-2.5 py-1 rounded transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-2.5 bg-black/60 border-t border-white/10 flex items-center gap-2 select-none">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Doru AI about server, projects, or Linux commands..."
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-400"
        />
        <button
          onClick={() => handleSend()}
          className="bg-sky-500 hover:bg-sky-400 text-black font-semibold font-mono text-xs px-3.5 py-1.5 rounded transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
