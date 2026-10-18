import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Zap, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Palette
} from 'lucide-react';
import type { AgentStatus, SystemTelemetry } from '../lib/types.ts';
import { playSound } from '../lib/soundFx.ts';

interface HeaderBarProps {
  status: AgentStatus;
  onToggleFreeze: () => void;
  isFrozen: boolean;
  onOpenProactive: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeTheme: string;
  onChangeTheme: (theme: string) => void;
  activeModelName: string;
  telemetry?: SystemTelemetry | null;
  wsConnected?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  status,
  onToggleFreeze,
  isFrozen,
  onOpenProactive,
  soundEnabled,
  onToggleSound,
  activeTheme,
  onChangeTheme,
  activeModelName,
  telemetry,
  wsConnected = false,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0').slice(0, 2));
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  const themes = [
    { id: 'cyan', label: 'CYBER CYAN', color: '#00ffc8' },
    { id: 'matrix', label: 'MATRIX', color: '#00ff66' },
    { id: 'amber', label: 'NEO GOLD', color: '#ffaa00' },
    { id: 'purple', label: 'SYNTH VIOLET', color: '#d946ef' },
  ];

  const getStatusBadge = () => {
    switch (status) {
      case 'listening':
        return { text: 'LISTENING', bg: 'bg-cyan-950/80', border: 'border-cyan-400', textCol: 'text-cyan-300' };
      case 'thinking':
        return { text: 'THINKING', bg: 'bg-amber-950/80', border: 'border-amber-400', textCol: 'text-amber-300' };
      case 'acting':
        return { text: 'ACTING', bg: 'bg-emerald-950/80', border: 'border-emerald-400', textCol: 'text-emerald-300' };
      case 'debating':
        return { text: 'ADVERSARIAL DEBATE', bg: 'bg-purple-950/80', border: 'border-purple-400', textCol: 'text-purple-300' };
      case 'frozen':
        return { text: 'SYSTEM FROZEN', bg: 'bg-red-950/80', border: 'border-red-400', textCol: 'text-red-300' };
      case 'idle':
      default:
        return { text: 'QUEEN READY', bg: 'bg-slate-900/80', border: 'border-cyan-500/30', textCol: 'text-cyan-400' };
    }
  };

  const badge = getStatusBadge();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-2.5 flex items-center justify-between border-b border-cyan-500/20 bg-[#050b14]/90 backdrop-blur-none text-xs select-none">
      {/* Brand Identity & Telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-cyan-400 rotate-45 border border-cyan-300 shadow-[0_0_8px_#00ffc8]" />
          <span className="font-orbitron font-bold text-sm tracking-wider text-cyan-300">
            RAVANA <span className="text-cyan-600 font-light">// CODESBYFEBIN</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-400 border border-cyan-500/40 font-mono">
            AI AGENTIC HUD
          </span>
        </div>

        {/* Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono font-semibold ${badge.bg} ${badge.border} ${badge.textCol}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{badge.text}</span>
        </div>

        {/* Model info telemetry */}
        <div className="hidden lg:flex items-center gap-3 text-cyan-400/70 border-l border-cyan-500/20 pl-3">
          {/* Real WebSocket Link Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#040d18] border border-cyan-500/30">
            <span
              className={`w-2 h-2 rounded-full ${
                wsConnected
                  ? 'bg-emerald-400 shadow-[0_0_6px_#00ff88] animate-pulse'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className={`font-mono text-[10px] font-bold ${wsConnected ? 'text-emerald-300' : 'text-amber-300'}`}>
              {wsConnected ? 'WS: LINKED' : 'WS: RECONNECT'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-500">CPU:</span>
            <span className="text-cyan-200 font-bold">{telemetry ? `${telemetry.cpuUsage}%` : '24%'}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-500">RAM:</span>
            <span className="text-cyan-200 font-bold">{telemetry ? `${telemetry.ramUsage}%` : '48%'}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-cyan-500">PING:</span>
            <span className="text-emerald-400 font-bold">{telemetry ? `${telemetry.latencyMs}ms` : '14ms'}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] border-l border-cyan-500/20 pl-2">
            <span className="text-cyan-500">ROUTER:</span>
            <span className="text-cyan-100 font-mono font-medium truncate max-w-[140px]">{activeModelName}</span>
          </div>
        </div>
      </div>

      {/* Center Digital Clock */}
      <div className="hidden md:flex items-center gap-2 font-mono text-cyan-300 font-semibold tracking-widest text-[11px] px-3 py-1 bg-cyan-950/40 rounded border border-cyan-500/20">
        <span className="text-cyan-500">SYS_TICK:</span>
        <span>{timeStr}</span>
      </div>

      {/* Control Actions & Kill Switch */}
      <div className="flex items-center gap-2.5">
        {/* Proactive Works Button */}
        <button
          onClick={() => {
            playSound('chirp');
            onOpenProactive();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 rounded transition-colors font-mono cursor-pointer"
          title="Open Proactive Suggestions"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">PROACTIVE</span>
          <span className="px-1 bg-cyan-900 text-cyan-200 rounded text-[9px]">24</span>
        </button>

        {/* Theme Selector */}
        <div className="relative group">
          <button
            onClick={() => {
              playSound('beep');
              const nextIdx = (themes.findIndex(t => t.id === activeTheme) + 1) % themes.length;
              onChangeTheme(themes[nextIdx].id);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded cursor-pointer transition-colors"
            title="Toggle Visual Theme"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono">{activeTheme.toUpperCase()}</span>
          </button>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            onToggleSound();
            playSound('beep');
          }}
          className={`p-1.5 rounded border transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900 border-slate-700 text-slate-500'
          }`}
          title={soundEnabled ? 'Mute HUD Audio' : 'Enable HUD Audio'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Freeze Kill Switch */}
        <button
          onClick={() => {
            if (!isFrozen) playSound('alert');
            else playSound('wake');
            onToggleFreeze();
          }}
          className={`flex items-center gap-1 px-2 sm:px-3 py-1 font-mono font-bold rounded border transition-all cursor-pointer text-[10px] sm:text-xs shrink-0 ${
            isFrozen
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_#00ffc8]'
              : 'bg-red-950/80 text-red-300 border-red-500/60 hover:bg-red-900/90'
          }`}
          title="Emergency Agent Freeze (Kill Switch)"
        >
          <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{isFrozen ? 'UNFREEZE' : 'FREEZE'}</span>
        </button>
      </div>
    </header>
  );
};
