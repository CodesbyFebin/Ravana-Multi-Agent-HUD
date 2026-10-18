import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Square, 
  Globe, 
  MapPin, 
  BrainCircuit, 
  Zap, 
  Search,
  Sparkles,
  Layers
} from 'lucide-react';
import { AgentStatus } from '../lib/types.ts';
import { playSound } from '../lib/soundFx.ts';

interface VoiceCommandBarProps {
  onSendCommand: (cmd: string, options: {
    useSearch: boolean;
    useMaps: boolean;
    useArgonThinking: boolean;
    forceFreeMode: boolean;
  }) => void;
  status: AgentStatus;
  amplitude: number;
  onBargeIn: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  thoughtSteps?: { id: string; text: string; highlight?: string; timestamp: number }[];
  terminalLines?: { id: string; lineType: string; text: string; timestamp: number }[];
}

export const VoiceCommandBar: React.FC<VoiceCommandBarProps> = ({
  onSendCommand,
  status,
  amplitude,
  onBargeIn,
  isRecording,
  onToggleRecording,
  thoughtSteps = [],
  terminalLines = [],
}) => {
  const [inputText, setInputText] = useState('');
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [useArgonThinking, setUseArgonThinking] = useState(false);
  const [forceFreeMode, setForceFreeMode] = useState(false);
  const [showThoughtStream, setShowThoughtStream] = useState(true);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    playSound('chirp');
    onSendCommand(inputText.trim(), {
      useSearch,
      useMaps,
      useArgonThinking,
      forceFreeMode,
    });
    setInputText('');
  };

  const quickPrompts = [
    { label: 'Morning Brief', text: 'Give me the daily morning brief with calendar, tasks, and system health' },
    { label: 'Deploy Prod v2.4 (Adversarial)', text: 'Deploy v2.4 to production cluster across APAC and US regions' },
    { label: 'Review PR #42', text: 'Review PR #42 on repo for CVEs and performance regressions' },
    { label: 'BTC Long Position (Adversarial)', text: 'Execute trade: buy 0.75 BTC at market with 2% stop-loss' },
    { label: 'Search News', text: 'Search Google for latest breakthrough news in AI agent orchestration' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 font-mono text-xs select-none">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
        <span className="text-cyan-500/70 text-[10px] shrink-0 font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          CMD SUGGEST:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              playSound('beep');
              setInputText(p.text);
            }}
            className="shrink-0 px-2.5 py-0.5 rounded bg-[#081422]/90 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-[11px] transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Interactive Command Box */}
      <div className="relative flex flex-col gap-2 p-2.5 rounded-lg bg-[#060f1b]/95 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,255,200,0.12)]">
        {/* Waveform Bar & Status */}
        <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20 text-[11px]">
          <div className="flex items-center gap-2">
            {/* Wake Word Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-bold">WAKE: "Hey Bro"</span>
            </div>

            {/* Audio Waveform Meter */}
            <div className="flex items-center gap-1 h-3.5 px-2 bg-slate-950/60 rounded border border-cyan-500/20">
              {[...Array(12)].map((_, i) => {
                const heightMult = Math.max(0.15, Math.sin(i * 0.6 + amplitude * 5) * amplitude + 0.2);
                return (
                  <span
                    key={i}
                    className="w-1 bg-cyan-400 rounded-sm transition-all duration-75"
                    style={{
                      height: `${Math.min(100, heightMult * 100)}%`,
                      opacity: amplitude > 0.05 ? 0.9 : 0.3,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Barge-In Stop Trigger */}
          <button
            onClick={() => {
              playSound('alert');
              onBargeIn();
            }}
            className="flex items-center gap-1 px-2 py-0.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded transition-colors cursor-pointer text-[10px]"
            title="Interrupt AI Speech (Barge-in)"
          >
            <Square className="w-2.5 h-2.5 fill-current" />
            <span>BARGE-IN</span>
          </button>
        </div>

        {/* Input Form with Mic Button */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Mic Toggle Button */}
          <button
            type="button"
            onClick={() => {
              playSound('chirp');
              onToggleRecording();
            }}
            className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-center ${
              isRecording
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_#00ffc8]'
                : 'bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border-cyan-500/40'
            }`}
            title={isRecording ? 'Listening... Click to Stop' : 'Click to Speak (Wake: "Hey Bro")'}
          >
            {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak command ('Hey Bro...') or type instruction here..."
              className="w-full bg-[#0a1626] border border-cyan-500/40 rounded px-3 py-2 text-cyan-100 placeholder-cyan-600/60 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-400 font-mono text-xs"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono rounded border border-cyan-300 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,200,0.3)] flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DISPATCH</span>
          </button>
        </form>

        {/* Tool & Model Routing Config Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-cyan-500/10 text-[10px]">
          <span className="text-cyan-500/60 uppercase">GROUNDING & MODES:</span>

          {/* Google Search Grounding (gemini-3.8-flash) */}
          <button
            type="button"
            onClick={() => {
              playSound('beep');
              setUseSearch(!useSearch);
              if (!useSearch) setUseMaps(false);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              useSearch
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-cyan-400'
            }`}
            title="Google Search Grounding (gemini-3.8-flash)"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>GOOGLE SEARCH</span>
          </button>

          {/* Google Maps Grounding (gemini-3.8-flash) */}
          <button
            type="button"
            onClick={() => {
              playSound('beep');
              setUseMaps(!useMaps);
              if (!useMaps) setUseSearch(false);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              useMaps
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-cyan-400'
            }`}
            title="Google Maps Grounding (gemini-3.8-flash)"
          >
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>MAPS GROUNDING</span>
          </button>

          {/* Gemini 4 Argon High Thinking */}
          <button
            type="button"
            onClick={() => {
              playSound('beep');
              setUseArgonThinking(!useArgonThinking);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              useArgonThinking
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-amber-400'
            }`}
            title="Gemini 4 Argon High Thinking (ThinkingLevel.HIGH)"
          >
            <BrainCircuit className="w-3 h-3 text-amber-400" />
            <span>ARGON HIGH THINKING</span>
          </button>

          {/* Kilo-Code Free Mode */}
          <button
            type="button"
            onClick={() => {
              playSound('beep');
              setForceFreeMode(!forceFreeMode);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              forceFreeMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-emerald-400'
            }`}
            title="Kilo-Code Free Mode (Auto-route to 100% Free / Local Models)"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>FREE-TIER ROUTING</span>
          </button>
        </div>

        {/* Real-time Thought Stream & Terminal Ticker */}
        {(thoughtSteps.length > 0 || terminalLines.length > 0) && (
          <div className="mt-1 pt-1.5 border-t border-cyan-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>LIVE THOUGHT STREAM & TELEMETRY BUS</span>
              </div>
              <button
                type="button"
                onClick={() => setShowThoughtStream(!showThoughtStream)}
                className="text-[9px] text-cyan-500/80 hover:text-cyan-300 font-mono"
              >
                {showThoughtStream ? 'HIDE [-]' : 'SHOW [+]'}
              </button>
            </div>

            {showThoughtStream && (
              <div className="max-h-24 overflow-y-auto font-mono text-[10px] space-y-1 pr-1 scrollbar-thin">
                {thoughtSteps.slice(0, 3).map((ts) => (
                  <div key={ts.id} className="flex items-start gap-1.5 text-cyan-200 bg-[#040c17]/60 p-1 rounded border border-cyan-500/10">
                    <span className="text-amber-400 font-bold">▶</span>
                    <span>{ts.text}</span>
                  </div>
                ))}
                {terminalLines.slice(0, 2).map((tl) => (
                  <div
                    key={tl.id}
                    className={`text-[9.5px] px-1 py-0.5 rounded ${
                      tl.lineType === 'warn'
                        ? 'text-amber-300 bg-amber-950/40'
                        : tl.lineType === 'error'
                        ? 'text-red-300 bg-red-950/40'
                        : tl.lineType === 'success'
                        ? 'text-emerald-300 bg-emerald-950/40'
                        : 'text-slate-400 bg-slate-950/40'
                    }`}
                  >
                    {tl.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
