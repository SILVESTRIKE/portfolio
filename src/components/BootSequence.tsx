/*
Reason for existence: Minimalist eDEX-UI inspired boot sequence for SILVES WebOS with crisp typography, zero glow, zero pulsating dots, and clean flat terminal aesthetic.
System impact if absent: Desktop launches immediately without the interactive terminal initialization sequence.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LOG_LINES = [
  '[    0.000000] SILVES Hyper-VFS Kernel 6.8.0-silvestrike init',
  '[    0.012410] Architecture: x86_64 Virtual Vector Core [8 Cores, 12 Threads]',
  '[    0.024512] Memory: 16,384 MB High-Throughput Allocator [OK]',
  '[    0.038102] Compositor: Caelestia Hyprland Wayland Engine [OK]',
  '[    0.051201] Security: Hardware Ed25519 Handshake Verified [OK]',
  '[    0.068940] Neural Weights: LangGraph / Groq / Agnes Pipeline Ready',
  '[    0.082103] Mount: /dev/vfs0 -> /home/silvestrike [OK]',
  '[    0.104210] Telemetry: Zero-Retention Ephemeral Mode Active',
  '[    0.121040] Microservices: SAMCO, DogDexx, Doru AI, Veritas RAG Loaded',
  '[    0.145020] Audio Engine: WebAudio DSP Buffer Online',
  '[    0.168400] Sandbox: Private Network Protection Shield ENGAGED',
  '[    0.192000] System Integrity: 100% HEALTHY',
  '>>> ALL SUBSYSTEMS NOMINAL. INITIALIZING WORKSTATION <<<'
];

export function BootSequence({ onComplete }: BootSequenceProps) {
  // Phases: 'logs' -> 'blackout' -> 'logo' -> 'fadeout'
  const [phase, setPhase] = useState<'logs' | 'blackout' | 'logo' | 'fadeout'>('logs');
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.02) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume().catch(() => { });
      }
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < BOOT_LOG_LINES.length) {
        setDisplayedLogs(prev => [...prev, BOOT_LOG_LINES[currentLine]]);
        setProgress(Math.round(((currentLine + 1) / BOOT_LOG_LINES.length) * 100));
        playTone(600 + currentLine * 40, 0.02, 'sine', 0.015);
        currentLine++;
      } else {
        clearInterval(interval);
        const t1 = setTimeout(() => {
          setPhase('blackout');
          const t2 = setTimeout(() => {
            setPhase('logo');
            const t3 = setTimeout(() => {
              setPhase('fadeout');
              const t4 = setTimeout(() => {
                onComplete();
              }, 400);
              timeoutsRef.current.push(t4);
            }, 1200);
            timeoutsRef.current.push(t3);
          }, 250);
          timeoutsRef.current.push(t2);
        }, 200);
        timeoutsRef.current.push(t1);
      }
    }, 85);

    return () => {
      clearInterval(interval);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        timeoutsRef.current.forEach(clearTimeout);
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const handleSkipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    timeoutsRef.current.forEach(clearTimeout);
    onComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#07090e] text-slate-300 font-mono select-none overflow-hidden transition-opacity duration-400 ${
        phase === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 h-10 px-6 flex items-center justify-between text-xs text-slate-400 border-b border-white/10 bg-black/60 z-20">
        <span className="font-semibold tracking-wider text-[#7aa2f7]">SILVESTRIKE // KERNEL 6.8</span>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 hidden sm:inline">BOOT: {progress}%</span>
          <button
            onClick={handleSkipClick}
            className="px-2 py-0.5 rounded border border-white/20 hover:bg-white/10 text-slate-300 transition-colors text-[11px] font-mono cursor-pointer"
          >
            [ESC] SKIP
          </button>
        </div>
      </div>

      {/* PHASE 1: Clean Minimalist Monospace Kernel Log Stream */}
      {phase === 'logs' && (
        <div className="absolute inset-0 pt-16 pb-12 px-6 sm:px-12 flex flex-col justify-end overflow-hidden z-10">
          <div className="space-y-1 text-xs text-slate-400">
            {displayedLogs.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className={idx === BOOT_LOG_LINES.length - 1 ? 'text-[#7aa2f7] font-semibold' : 'text-slate-400'}>
                  {line}
                </span>
              </div>
            ))}
          </div>

          {/* Minimalist Flat Progress Bar */}
          <div className="mt-4 w-full max-w-md h-1 bg-white/10 rounded-none overflow-hidden">
            <div
              className="h-full bg-[#7aa2f7] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* PHASE 2: Brief Blackout */}
      {phase === 'blackout' && (
        <div className="absolute inset-0 bg-[#07090e] z-30" />
      )}

      {/* PHASE 3: Minimalist Flat SILVES Logo */}
      {phase === 'logo' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
          <div className="flex flex-col items-center">
            {/* Flat SILVES Typography */}
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-[0.25em] text-[#7aa2f7] select-none font-mono">
              SILVES
            </h1>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-8 px-6 flex items-center justify-between text-[11px] text-slate-500 border-t border-white/10 bg-black/60 z-20 font-mono">
        <span>SECURITY: VERIFIED // VFS ENCRYPTED</span>
        <span>PRESS [ESC] TO SKIP</span>
      </div>
    </div>
  );
}
