import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Terminal, 
  CloudSun, 
  CheckCircle2, 
  Timer, 
  StickyNote, 
  BatteryCharging, 
  Activity, 
  Home, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Plus, 
  Send 
} from 'lucide-react';
import { playSound } from '../../lib/soundFx.ts';

interface ExecutiveLifeWidgetsProps {
  externalTerminalLogs?: { type: 'prompt' | 'cmd' | 'output' | 'success' | 'warn' | 'error'; text: string }[];
  onExecuteTerminalCmd?: (cmd: string) => void;
}

export const ExecutiveLifeWidgets: React.FC<ExecutiveLifeWidgetsProps> = ({
  externalTerminalLogs,
  onExecuteTerminalCmd,
}) => {
  // 1. SoundCloud Tracks Data
  const [tracks, setTracks] = useState([
    { title: 'Neon Pulse — Cyberpunk Mix', artist: 'SynthWav_2077', duration: '4:32', playing: true, progress: 67 },
    { title: 'Deep Focus — Alpha Waves', artist: 'BrainFM', duration: '1:02:00', playing: false, progress: 0 },
    { title: 'Night Drive — Lo-fi Beats', artist: 'MidnightCoder', duration: '3:45', playing: false, progress: 0 },
    { title: 'RAVANA Theme — Original Score', artist: 'You (AI Generated)', duration: '2:18', playing: false, progress: 0 },
    { title: 'Rain on Glass — Ambient', artist: 'LoFi Drift', duration: '8:12', playing: false, progress: 0 },
  ]);
  const [isPlaying, setIsPlaying] = useState(true);

  // 2. Terminal Lines
  const [terminalLines, setTerminalLines] = useState([
    { type: 'prompt', text: 'queen@ravana:~$' },
    { type: 'cmd', text: 'status --all' },
    { type: 'output', text: '  [OK] Core orchestrator ............ v3.7.1 (uptime 4h 23m)' },
    { type: 'output', text: '  [OK] Voice pipeline ................ STT: faster-whisper | TTS: Piper' },
    { type: 'output', text: '  [OK] Memory core ................... 2,847 entries | 847 vectors' },
    { type: 'output', text: '  [OK] Model pool .................... 12/14 online | 2 busy' },
    { type: 'output', text: '  [OK] Agent swarm ................... 4 active | 6 idle' },
    { type: 'success', text: '  All systems nominal. No errors in last 24h.' },
    { type: 'prompt', text: 'queen@ravana:~$' },
    { type: 'cmd', text: 'route "review PR #142" --auto' },
    { type: 'output', text: '  → Classifying: Coding / Medium' },
    { type: 'output', text: '  → Routing to: Claude-4 (primary) + GPT-4o (cross-check)' },
    { type: 'output', text: '  → Spawning: PR_Reviewer agent [task_id: a3f2-8812]' },
    { type: 'success', text: '  → Agent active. ETA: ~45s' },
  ]);
  const [termInput, setTermInput] = useState('');

  // 3. Pomodoro Timer
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');
  const [pomoSessions, setPomoSessions] = useState(3);

  // 4. Habits Data
  const [habits, setHabits] = useState([
    { name: 'Meditation (10 min)', streak: 14, week: [true, true, true, true, true, true, false] },
    { name: 'Coding (4h)', streak: 7, week: [true, true, true, true, true, false, false] },
    { name: 'Exercise (30 min)', streak: 5, week: [true, false, true, true, true, false, false] },
    { name: 'Read (20 pages)', streak: 3, week: [false, true, true, true, false, false, false] },
    { name: 'No sugar', streak: 21, week: [true, true, true, true, true, true, false] },
    { name: 'RAVANA review', streak: 9, week: [true, true, true, true, true, true, true] },
    { name: 'Sleep by 23:00', streak: 2, week: [false, false, true, true, false, false, false] },
  ]);

  // 5. Notes Data
  const [notes, setNotes] = useState([
    { time: '09:15', text: 'Call Acme at 14:00 — ask about Q4 budget. Mention RAVANA demo.' },
    { time: '08:45', text: 'PR #145 needs rate limiting before merge. Assign to Coder agent.' },
    { time: 'Yesterday', text: 'Grok-Momentum bot: increase position size to 1.5% after 20 trades.' },
    { time: 'Yesterday', text: 'Buy domain: ravana-ai.in — $12/yr. Renewal: Oct 2027.' },
  ]);
  const [newNote, setNewNote] = useState('');

  // 6. Devices / Power
  const powerData = [
    { icon: '💻', name: 'MacBook Pro M4', pct: 78, charging: false },
    { icon: '📱', name: 'Pixel 9 Pro', pct: 45, charging: true },
    { icon: '🖥', name: 'RAVANA Server (Ryzen 9)', pct: 100, charging: false },
    { icon: '🎧', name: 'AirPods Max', pct: 23, charging: false },
  ];

  // 7. Internet & Ping Graph
  const [pingBars, setPingBars] = useState([12, 18, 14, 22, 19, 15, 28, 14, 16, 20, 18, 12, 15, 24, 16, 14, 18, 20, 15, 17]);

  // 8. Smart Home
  const smartHome = [
    { room: 'LIVING ROOM', devices: [
      { icon: '💡', name: 'Ceiling Light', state: 'on' },
      { icon: '📺', name: 'TV (LG C4)', state: 'off' },
      { icon: '❄️', name: 'AC', state: 'on', temp: '24°C' },
    ]},
    { room: 'OFFICE', devices: [
      { icon: '💡', name: 'Desk Lamp', state: 'on' },
      { icon: '🖥', name: 'Monitor (Dell U27)', state: 'on' },
      { icon: '🌡', name: 'Thermostat', state: 'on', temp: '22°C' },
    ]},
    { room: 'SECURITY', devices: [
      { icon: '🚪', name: 'Front Door', state: 'on' },
      { icon: '📹', name: 'Cam 1 (Gate)', state: 'on' },
    ]},
  ];

  // Weather Hourly
  const weatherHourly = [
    { time: 'Now', icon: '⛅', temp: '28°' },
    { time: '14', icon: '🌤', temp: '30°' },
    { time: '15', icon: '🌤', temp: '31°' },
    { time: '16', icon: '☁️', temp: '29°' },
    { time: '17', icon: '🌧', temp: '27°' },
    { time: '18', icon: '🌧', temp: '26°' },
    { time: '19', icon: '⛈', temp: '25°' },
  ];

  // Live timer for Pomodoro
  useEffect(() => {
    let interval: any = null;
    if (pomoRunning) {
      interval = setInterval(() => {
        setPomoSeconds(prev => {
          if (prev <= 1) {
            playSound('alert');
            const nextMode = pomoMode === 'work' ? 'break' : 'work';
            setPomoMode(nextMode);
            if (nextMode === 'work') setPomoSessions(s => s + 1);
            return (nextMode === 'work' ? 25 : 5) * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoMode]);

  // Music progress loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPlaying) return;
      setTracks(prev => prev.map(t => {
        if (!t.playing) return t;
        const next = (t.progress + 0.4) % 100;
        return { ...t, progress: next };
      }));

      // Live ping jitter
      setPingBars(prev => {
        const next = [...prev.slice(1), 10 + Math.round(Math.random() * 20)];
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termInput.trim()) return;
    playSound('beep');

    const cmd = termInput.trim();
    if (onExecuteTerminalCmd) {
      onExecuteTerminalCmd(cmd);
    } else {
      setTerminalLines(prev => [
        ...prev,
        { type: 'prompt', text: 'queen@ravana:~$' },
        { type: 'cmd', text: cmd },
        { type: 'output', text: `  → Executing: ${cmd}... done.` },
        { type: 'success', text: '  [OK] Return code: 0' }
      ]);
    }
    setTermInput('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    playSound('chirp');
    setNotes(prev => [{ time: 'Just now', text: newNote.trim() }, ...prev]);
    setNewNote('');
  };

  const currentPlayingTrack = tracks.find(t => t.playing);

  return (
    <div className="flex flex-col gap-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-cyan-200">EXECUTIVE COMMAND, MEDIA & LIFE HUB</span>
        </div>
        <span className="text-[10px] text-cyan-400/80">
          Music • Terminal • Weather • Pomodoro • Smart Home
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Module 1: SoundCloud Cyber Music Player */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-cyan-400" /> SOUNDCLOUD
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              {isPlaying ? 'PLAYING' : 'PAUSED'}
            </span>
          </div>

          {currentPlayingTrack && (
            <div className="p-2 rounded bg-cyan-950/40 border-l-2 border-cyan-400 flex flex-col gap-0.5">
              <span className="font-bold text-cyan-200 text-[10.5px] truncate">▶ {currentPlayingTrack.title}</span>
              <span className="text-[9px] text-slate-400">{currentPlayingTrack.artist}</span>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-cyan-400 shadow-[0_0_6px_#00ffc8]" style={{ width: `${currentPlayingTrack.progress}%` }} />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between text-[11px] text-cyan-300">
            <button
              onClick={() => {
                playSound('beep');
                setIsPlaying(!isPlaying);
              }}
              className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <span className="text-[9px] text-slate-400">Vol: 70% · Lo-Fi Cyber</span>
          </div>

          {/* Tracklist */}
          <div className="flex flex-col gap-1 max-h-[110px] overflow-y-auto scrollbar-thin">
            {tracks.map((t, idx) => (
              <div
                key={idx}
                onClick={() => {
                  playSound('chirp');
                  setTracks(prev => prev.map((item, i) => ({ ...item, playing: i === idx })));
                  setIsPlaying(true);
                }}
                className={`flex items-center justify-between text-[9.5px] p-1 rounded cursor-pointer transition-colors ${t.playing ? 'bg-cyan-950/80 text-cyan-200 font-bold' : 'text-slate-400 hover:bg-[#081525]'}`}
              >
                <span className="truncate">{t.title}</span>
                <span className="text-[8.5px]">{t.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: Queen Interactive Terminal */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col justify-between gap-2 md:col-span-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> QUEEN TERMINAL
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">SYSTEM ONLINE</span>
          </div>

          <div className="p-2.5 rounded bg-[#03070d] border border-cyan-500/20 font-mono text-[9.5px] max-h-[160px] overflow-y-auto scrollbar-thin flex flex-col gap-0.5">
            {(externalTerminalLogs || terminalLines).map((l, idx) => (
              <div key={idx} className={`${l.type === 'prompt' ? 'text-cyan-400 font-bold' : l.type === 'cmd' ? 'text-white' : l.type === 'success' ? 'text-emerald-400' : l.type === 'warn' ? 'text-amber-400' : l.type === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                {l.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold text-[10px]">queen@ravana:~$</span>
            <input
              type="text"
              value={termInput}
              onChange={(e) => setTermInput(e.target.value)}
              placeholder="status, route, memory search, approve..."
              className="flex-1 bg-[#091728] border border-cyan-500/30 rounded px-2 py-1 text-cyan-100 text-[10px] focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold cursor-pointer"
            >
              RUN
            </button>
          </form>
        </div>

        {/* Module 3: Weather (Mumbai 28°C) */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" /> WEATHER — MUMBAI
            </span>
            <span className="text-[9px] text-cyan-300 font-bold">28°C</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⛅</span>
              <div className="flex flex-col">
                <span className="font-orbitron font-extrabold text-lg text-cyan-100">28°C</span>
                <span className="text-[9.5px] text-slate-400">Partly Cloudy · Feels 31°</span>
              </div>
            </div>
            <div className="text-[9px] text-slate-400 flex flex-col text-right">
              <span>Humidity: 72%</span>
              <span>Wind: 14 km/h</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto py-1 border-t border-cyan-500/10">
            {weatherHourly.map((h, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[28px] text-[8.5px]">
                <span className="text-slate-400">{h.time}</span>
                <span>{h.icon}</span>
                <span className="text-cyan-200 font-bold">{h.temp}</span>
              </div>
            ))}
          </div>

          <div className="p-1.5 rounded bg-amber-950/30 border-l-2 border-amber-400 text-[9px] text-amber-300">
            ⚠ Rain expected 17:00–20:00. Carry umbrella.
          </div>
        </div>

        {/* Module 4: Pomodoro Focus Timer */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-cyan-400" /> FOCUS TIMER
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              {pomoMode.toUpperCase()}
            </span>
          </div>

          <div className="text-center py-1">
            <div className="font-orbitron font-extrabold text-2xl text-cyan-300 tracking-wider">
              {String(Math.floor(pomoSeconds / 60)).padStart(2, '0')}:{String(pomoSeconds % 60).padStart(2, '0')}
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest">
              {pomoMode === 'work' ? 'Deep Focus Session' : 'Quick Rest Break'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                playSound('beep');
                setPomoRunning(!pomoRunning);
              }}
              className={`px-3 py-1 rounded font-bold text-[9.5px] cursor-pointer ${pomoRunning ? 'bg-amber-500 text-black' : 'bg-cyan-500 text-black'}`}
            >
              {pomoRunning ? 'PAUSE' : 'START'}
            </button>
            <button
              onClick={() => {
                playSound('beep');
                setPomoSeconds((pomoMode === 'work' ? 25 : 5) * 60);
                setPomoRunning(false);
              }}
              className="px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[9px] cursor-pointer"
            >
              RESET
            </button>
            <button
              onClick={() => {
                playSound('chirp');
                const next = pomoMode === 'work' ? 'break' : 'work';
                setPomoMode(next);
                setPomoSeconds((next === 'work' ? 25 : 5) * 60);
                setPomoRunning(false);
              }}
              className="px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[9px] cursor-pointer"
            >
              SKIP
            </button>
          </div>

          <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-cyan-500/10">
            Sessions Today: <span className="text-cyan-300 font-bold">{pomoSessions} / 8</span>
          </div>
        </div>

        {/* Module 5: Daily Habits Tracker */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> DAILY HABITS
            </span>
            <span className="text-[9px] text-cyan-300">4/7 DONE</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
            {habits.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px] border-b border-cyan-500/5 pb-1">
                <span className="text-cyan-100 flex-1 truncate">{h.name}</span>
                <span className="text-[9px] text-amber-400 font-bold mr-2">🔥{h.streak}</span>
                <div className="flex items-center gap-1">
                  {h.week.map((done, dIdx) => (
                    <button
                      key={dIdx}
                      onClick={() => {
                        playSound('beep');
                        setHabits(prev => prev.map((item, i) => {
                          if (i !== idx) return item;
                          const newWeek = [...item.week];
                          newWeek[dIdx] = !newWeek[dIdx];
                          return { ...item, week: newWeek };
                        }));
                      }}
                      className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${done ? 'bg-emerald-400 shadow-[0_0_3px_#00ff88]' : 'bg-slate-800 border border-slate-700'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 6: Quick Notes Scratchpad */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-cyan-400" /> QUICK NOTES
            </span>
            <span className="text-[9px] text-slate-400">{notes.length} NOTES</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[130px] overflow-y-auto scrollbar-thin">
            {notes.map((n, idx) => (
              <div key={idx} className="p-1.5 rounded bg-[#091728] border-l-2 border-cyan-400 text-[9.5px]">
                <span className="text-[8px] text-cyan-500/80 block">{n.time}</span>
                <span className="text-cyan-100">{n.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote} className="flex items-center gap-1 pt-1 border-t border-cyan-500/10">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add scratchpad note..."
              className="flex-1 bg-[#091728] border border-cyan-500/30 rounded px-2 py-1 text-cyan-100 text-[9.5px] focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold cursor-pointer"
            >
              SAVE
            </button>
          </form>
        </div>

        {/* Module 7: Devices & Battery Telemetry */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> CONNECTED DEVICES
            </span>
            <span className="text-[9px] text-emerald-400">4 ONLINE</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {powerData.map((d, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px] border-b border-cyan-500/5 pb-1">
                <span className="text-sm">{d.icon}</span>
                <span className="flex-1 text-cyan-100">{d.name}</span>
                {d.charging && <span className="text-emerald-400 text-[9px] font-bold">⚡</span>}
                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${d.pct < 30 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-cyan-200 text-[9px] font-mono">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module 8: Internet Speed & Realtime Ping Graph */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> INTERNET SPEED
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">94.2 Mbps</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-orbitron font-extrabold text-xl text-cyan-200">94.2</span>
              <span className="text-[9px] text-slate-400">Mbps ↓ · 12.8 Mbps ↑</span>
            </div>
            <div className="text-[9px] text-cyan-300 font-mono">
              Ping: 18ms · Jitter: 2.4ms
            </div>
          </div>

          {/* Dynamic Ping Bars */}
          <div className="h-7 flex items-end gap-1 bg-[#040912] p-1 rounded border border-cyan-500/15">
            {pingBars.map((p, idx) => (
              <div
                key={idx}
                className="flex-1 bg-cyan-400/80 rounded-t-xs transition-all duration-300"
                style={{ height: `${Math.min(100, (p / 35) * 100)}%` }}
              />
            ))}
          </div>
          <span className="text-[8px] text-slate-500">ISP: ACT Fibernet (Latency last 20 ticks)</span>
        </div>

        {/* Module 9: Smart Home Control */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-cyan-400" /> SMART HOME
            </span>
            <span className="text-[9px] text-cyan-300">8 DEVICES</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
            {smartHome.map((rm, idx) => (
              <div key={idx} className="flex flex-col gap-1 border-b border-cyan-500/5 pb-1">
                <span className="text-[8.5px] font-bold text-cyan-400 uppercase tracking-wider">{rm.room}</span>
                {rm.devices.map((d, dIdx) => (
                  <div key={dIdx} className="flex items-center justify-between text-[9.5px]">
                    <div className="flex items-center gap-1.5">
                      <span>{d.icon}</span>
                      <span className="text-cyan-100">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {d.temp && <span className="text-cyan-300 text-[8.5px]">{d.temp}</span>}
                      <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold uppercase ${d.state === 'on' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {d.state}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
