import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  ShieldCheck, 
  Terminal, 
  Boxes, 
  GitBranch, 
  Globe2, 
  Lock, 
  Radio, 
  AlertTriangle,
  Play,
  RotateCw,
} from 'lucide-react';
import type { SystemTelemetry } from '../../lib/types.ts';

interface DevOpsInfraWidgetsProps {
  telemetry?: SystemTelemetry | null;
}

export const DevOpsInfraWidgets: React.FC<DevOpsInfraWidgetsProps> = ({ telemetry }) => {
  // 1. Servers Monitoring Data
  const [serverData, setServerData] = useState([
    { name: 'api-prod-01 (Active Host)', cpu: 72, mem: 64, status: 'up' },
    { name: 'api-prod-02', cpu: 34, mem: 51, status: 'up' },
    { name: 'worker-01', cpu: 89, mem: 78, status: 'degraded' },
    { name: 'db-primary', cpu: 45, mem: 71, status: 'up' },
    { name: 'cache-redis', cpu: 12, mem: 38, status: 'up' },
  ]);

  // 2. Dev Servers Data
  const [devServers, setDevServers] = useState([
    { name: 'ravana-core (Rust)', port: '8080', status: 'running', cpu: 34, log: 'Listening on 0.0.0.0:8080' },
    { name: 'ravana-hud (Vite)', port: '3000', status: 'running', cpu: 12, log: 'HMR active · 3 clients' },
    { name: 'ollama (LLM)', port: '11434', status: 'running', cpu: 78, log: 'llama3.3-70b loaded · 42GB VRAM' },
    { name: 'postgres (ravana-db)', port: '5432', status: 'running', cpu: 8, log: '14 connections · 2 active' },
    { name: 'redis (cache)', port: '6379', status: 'running', cpu: 3, log: '2,847 keys · 45MB used' },
    { name: 'chromadb (vectors)', port: '8000', status: 'building', cpu: 22, log: 'Indexing 847 new vectors...' },
    { name: 'playwright (browser)', port: '9222', status: 'stopped', cpu: 0, log: 'Ready on demand' },
  ]);

  // 3. Docker Containers
  const dockerContainers = [
    { name: 'ravana-core', image: 'ravana/core:3.7.1', status: 'running', res: '128MB / 2.1GB' },
    { name: 'ravana-hud', image: 'ravana/hud:3.7.1', status: 'running', res: '64MB / 512MB' },
    { name: 'ollama', image: 'ollama/ollama:latest', status: 'running', res: '42GB / 48GB' },
    { name: 'postgres', image: 'postgres:16-alpine', status: 'running', res: '256MB / 2GB' },
    { name: 'redis', image: 'redis:7-alpine', status: 'running', res: '45MB / 512MB' },
    { name: 'chromadb', image: 'chromadb/chroma:0.5', status: 'restarting', res: '512MB / 2GB' },
    { name: 'ntfy', image: 'binwiederhier/ntfy:latest', status: 'running', res: '32MB / 256MB' },
  ];

  // 4. API Gateway Routes
  const [apiRoutes, setApiRoutes] = useState([
    { method: 'GET', path: '/api/v1/status', latency: '12ms', count: '45/min' },
    { method: 'POST', path: '/api/v1/voice/transcribe', latency: '840ms', count: '8/min' },
    { method: 'GET', path: '/api/v1/memory/search', latency: '23ms', count: '120/min' },
    { method: 'POST', path: '/api/v1/agents/spawn', latency: '120ms', count: '3/min' },
    { method: 'GET', path: '/api/v1/models/health', latency: '45ms', count: '60/min' },
    { method: 'POST', path: '/api/v1/approval/submit', latency: '2.4s', count: '1/min' },
    { method: 'GET', path: '/api/v1/trading/positions', latency: '89ms', count: '12/min' },
    { method: 'PUT', path: '/api/v1/config/models', latency: '34ms', count: '0/min' },
  ]);

  // 5. Network Nodes
  const networkNodes = [
    { name: 'api-prod-01', latency: 12, status: 'up' },
    { name: 'api-prod-02', latency: 18, status: 'up' },
    { name: 'worker-01', latency: 340, status: 'degraded' },
    { name: 'db-primary', latency: 4, status: 'up' },
    { name: 'ollama-local', latency: 2, status: 'up' },
  ];

  // 6. Git Branches
  const gitBranches = [
    { name: 'main', current: false, ahead: 0, behind: 0, conflict: false, time: '2h ago' },
    { name: 'feat/adversarial-review', current: true, ahead: 12, behind: 3, conflict: false, time: '30m ago' },
    { name: 'feat/grok-autotrader', current: false, ahead: 8, behind: 0, conflict: false, time: '1h ago' },
    { name: 'fix/memory-leak-agent-pool', current: false, ahead: 3, behind: 5, conflict: true, time: '4h ago' },
    { name: 'feat/tor-integration', current: false, ahead: 5, behind: 0, conflict: false, time: '6h ago' },
    { name: 'chore/tauri-2.5-upgrade', current: false, ahead: 1, behind: 12, conflict: false, time: '1d ago' },
  ];

  // 7. Process Monitor
  const [processes, setProcesses] = useState([
    { pid: '1204', name: 'ollama (llama3.3-70b)', cpu: 78, mem: '42.1G', cls: 'high' },
    { pid: '892', name: 'ravana-core (tokio)', cpu: 34, mem: '128M', cls: 'med' },
    { pid: '1456', name: 'chrome (12 tabs)', cpu: 22, mem: '1.8G', cls: 'med' },
    { pid: '756', name: 'ravana-hud (tauri)', cpu: 12, mem: '64M', cls: 'low' },
    { pid: '234', name: 'postgres', cpu: 8, mem: '256M', cls: 'low' },
    { pid: '445', name: 'redis-server', cpu: 3, mem: '45M', cls: 'low' },
    { pid: '678', name: 'faster-whisper (CT2)', cpu: 45, mem: '2.3G', cls: 'med' },
    { pid: '891', name: 'piper-tts', cpu: 12, mem: '89M', cls: 'low' },
    { pid: '1023', name: 'openwakeword (Hey Bro)', cpu: 8, mem: '34M', cls: 'low' },
    { pid: '1567', name: 'playwright (chromium)', cpu: 15, mem: '340M', cls: 'low' },
  ]);

  // Sync real telemetry from WebSocket
  useEffect(() => {
    if (!telemetry) return;

    setServerData(prev => [
      { name: 'api-prod-01 (Current Node)', cpu: telemetry.cpuUsage, mem: telemetry.ramUsage, status: telemetry.circuitStatus === 'OPEN' ? 'degraded' : 'up' },
      { name: 'api-prod-02 (Canary)', cpu: Math.max(10, Math.round(telemetry.cpuUsage * 0.8)), mem: Math.round(telemetry.ramUsage * 0.85), status: 'up' },
      ...prev.slice(2),
    ]);

    setDevServers(prev => prev.map(s => {
      if (s.name.includes('Vite') || s.name.includes('ravana-hud')) {
        return {
          ...s,
          cpu: telemetry.cpuUsage,
          log: `Port 3000 online · Heap: ${telemetry.heapUsageMb}MB · WS: ${telemetry.activeClients} client(s)`,
        };
      }
      return s;
    }));

    setProcesses(prev => prev.map(p => {
      if (p.name.includes('ravana-hud') || p.name.includes('ravana-core')) {
        return {
          ...p,
          cpu: telemetry.cpuUsage,
          mem: `${telemetry.heapUsageMb}M`,
          cls: telemetry.cpuUsage > 60 ? 'high' : telemetry.cpuUsage > 30 ? 'med' : 'low',
        };
      }
      return p;
    }));

    setApiRoutes(prev => prev.map((r, idx) => {
      if (idx === 0) {
        return { ...r, latency: `${telemetry.latencyMs}ms` };
      }
      return r;
    }));
  }, [telemetry]);

  return (
    <div className="flex flex-col gap-4 font-mono text-xs select-none">
      {/* Category Title */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-cyan-200">DEVOPS, INFRASTRUCTURE & SECURITY STACK</span>
        </div>
        <span className="text-[10px] text-cyan-400/80">
          8 Telemetry Modules Live • WireGuard & Tor Enforced
        </span>
      </div>

      {/* Grid of Infrastructure Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Module 1: Production Servers */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" /> SERVERS (4/5 UP)
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              CLUSTER OK
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {serverData.map((s, idx) => {
              const cpuCol = s.cpu > 85 ? 'bg-red-500' : s.cpu > 70 ? 'bg-amber-400' : 'bg-emerald-400';
              const memCol = s.mem > 85 ? 'bg-red-500' : s.mem > 70 ? 'bg-amber-400' : 'bg-cyan-400';

              return (
                <div key={idx} className="flex items-center gap-2 text-[10px] border-b border-cyan-500/5 pb-1">
                  <span className="flex-1 text-cyan-100 truncate">{s.name}</span>
                  <span className={`text-[9.5px] ${s.cpu > 85 ? 'text-red-400 font-bold' : s.cpu > 70 ? 'text-amber-400' : 'text-cyan-300'}`}>
                    {s.cpu}%
                  </span>
                  <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${cpuCol}`} style={{ width: `${s.cpu}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400">{s.mem}%</span>
                  <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${memCol}`} style={{ width: `${s.mem}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 2: Dev Servers & Microservices */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> DEV SERVICES
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              7 SERVICES
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
            {devServers.map((s, idx) => (
              <div key={idx} className="flex flex-col border-b border-cyan-500/5 pb-1">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'running' ? 'bg-emerald-400 shadow-[0_0_4px_#00ff88]' : s.status === 'building' ? 'bg-amber-400' : 'bg-red-500'}`} />
                    <span className="text-cyan-100 font-medium truncate max-w-[110px]">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      :{s.port}
                    </span>
                    <span className="text-[9px] text-cyan-400">{s.cpu}%</span>
                  </div>
                </div>
                {s.log && (
                  <span className="text-[8.5px] text-cyan-500/70 truncate pl-3 italic">
                    {s.log}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Module 3: Docker Containers */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" /> DOCKER (7 CT)
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              DAEMON ACTIVE
            </span>
          </div>

          <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto scrollbar-thin">
            {dockerContainers.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9.5px] border-b border-cyan-500/5 pb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'running' ? 'bg-emerald-400' : c.status === 'restarting' ? 'bg-amber-400' : 'bg-red-500'}`} />
                  <span className="text-cyan-100 font-medium">{c.name}</span>
                </div>
                <span className="text-cyan-400/80 text-[8.5px] font-mono">{c.res}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module 4: API Gateway */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" /> API GATEWAY
            </span>
            <span className="text-[9px] text-cyan-300 font-bold">1.2k req/min</span>
          </div>

          <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto scrollbar-thin">
            {apiRoutes.slice(0, 5).map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9px] border-b border-cyan-500/5 pb-0.5">
                <div className="flex items-center gap-1 truncate">
                  <span className={`px-1 py-0.2 rounded text-[7.5px] font-bold ${r.method === 'GET' ? 'bg-emerald-950 text-emerald-300' : r.method === 'POST' ? 'bg-cyan-950 text-cyan-300' : 'bg-amber-950 text-amber-300'}`}>
                    {r.method}
                  </span>
                  <span className="text-cyan-200 truncate">{r.path}</span>
                </div>
                <span className="text-cyan-400 font-mono text-[8.5px]">{r.latency}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-cyan-500/10 text-[9px]">
            <span className="text-slate-400">Auth: JWT + mTLS</span>
            <span className="text-emerald-400 font-bold">RATE LIMIT: OK</span>
          </div>
        </div>

        {/* Module 5: WireGuard VPN & Tor Circuit */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> WIREGUARD VPN
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              CONNECTED
            </span>
          </div>

          <div className="flex flex-col gap-1 text-[9.5px]">
            <div className="flex justify-between"><span className="text-slate-400">Server</span><span className="text-cyan-200 font-bold">Singapore (SG-03)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Tunnel IP</span><span className="text-emerald-400 font-mono">103.152.xx.xx</span></div>
            <div className="flex justify-between"><span className="text-slate-400">DNS Security</span><span className="text-cyan-300">1.1.1.1 (DoH)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Leak Test</span><span className="text-emerald-400">PASSED (0 leaks)</span></div>
          </div>
          <div className="p-1 rounded bg-red-950/40 border border-red-500/30 text-[8.5px] text-red-300 text-center">
            ⊘ KILL SWITCH: Drops lock all outbound traffic
          </div>
        </div>

        {/* Module 6: Tor 3-Hop Circuit */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" /> TOR ROUTING
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              CIRCUIT OK
            </span>
          </div>

          <div className="flex flex-col gap-1 text-[9.5px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-amber-400 bg-amber-400/20" />
              <span className="text-slate-400">ENTRY:</span>
              <span className="text-cyan-200">185.220.101.34</span>
              <span className="text-cyan-400 ml-auto">🇩🇪 DE</span>
            </div>
            <div className="w-0.5 h-2 bg-cyan-500/30 ml-2" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-cyan-400 bg-cyan-400/20" />
              <span className="text-slate-400">MID:</span>
              <span className="text-cyan-200">91.234.88.12</span>
              <span className="text-cyan-400 ml-auto">🇳🇱 NL</span>
            </div>
            <div className="w-0.5 h-2 bg-cyan-500/30 ml-2" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-emerald-400 bg-emerald-400/20" />
              <span className="text-slate-400">EXIT:</span>
              <span className="text-cyan-200">45.77.12.98</span>
              <span className="text-emerald-400 ml-auto">🇸🇬 SG</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-cyan-500/10 text-[9px]">
            <span className="text-slate-400">Anonymity Level</span>
            <span className="text-emerald-400 font-bold">STRONG ✓</span>
          </div>
        </div>

        {/* Module 7: Git Branches & Sync */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> GIT REPO
            </span>
            <span className="text-[9px] text-cyan-400 font-bold">6 BRANCHES</span>
          </div>

          <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto scrollbar-thin">
            {gitBranches.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9.5px] border-b border-cyan-500/5 pb-1">
                <div className="flex items-center gap-1 truncate">
                  <span className={`text-[8px] ${b.current ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {b.current ? '●' : '○'}
                  </span>
                  <span className={`truncate ${b.current ? 'text-emerald-300 font-bold' : 'text-cyan-200'}`}>
                    {b.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {b.conflict && (
                    <span className="px-1 rounded bg-red-950 text-red-300 text-[7.5px] font-bold">
                      CONFLICT
                    </span>
                  )}
                  {b.ahead > 0 && <span className="text-cyan-400 text-[8.5px]">↑{b.ahead}</span>}
                  {b.behind > 0 && <span className="text-amber-400 text-[8.5px]">↓{b.behind}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 8: Process Monitor */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> TOP PROCESSES
            </span>
            <span className="text-[9px] text-cyan-400">342 TOTAL</span>
          </div>

          <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto scrollbar-thin">
            {processes.slice(0, 5).map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9px] border-b border-cyan-500/5 pb-0.5">
                <span className="text-slate-400 font-mono text-[8px] w-6">{p.pid}</span>
                <span className="flex-1 text-cyan-100 truncate">{p.name}</span>
                <span className={`font-mono font-bold text-[8.5px] ${p.cls === 'high' ? 'text-red-400' : p.cls === 'med' ? 'text-amber-400' : 'text-cyan-300'}`}>
                  {p.cpu}%
                </span>
                <span className="text-cyan-400 text-[8px] font-mono ml-2">{p.mem}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
