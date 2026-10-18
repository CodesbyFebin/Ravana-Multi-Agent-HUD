import React from 'react';
import { 
  Crown, 
  Code2, 
  GitPullRequest, 
  Server, 
  TrendingUp, 
  Share2, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  Play, 
  Pause 
} from 'lucide-react';
import { AgentInfo, AgentId, TaskItem } from '../lib/types.ts';
import { playSound } from '../lib/soundFx.ts';
import { isAgentHandlingHighPriorityTask } from '../lib/agents.ts';

interface AgentSwarmWidgetProps {
  agents: AgentInfo[];
  tasks?: TaskItem[];
  activeAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  onSpawnTask: (agentId: AgentId, defaultTask: string) => void;
}

export const AgentSwarmWidget: React.FC<AgentSwarmWidgetProps> = ({
  agents,
  tasks = [],
  activeAgentId,
  onSelectAgent,
  onSpawnTask,
}) => {
  const getAgentIcon = (id: AgentId) => {
    switch (id) {
      case 'queen': return <Crown className="w-4 h-4 text-amber-400" />;
      case 'coder': return <Code2 className="w-4 h-4 text-cyan-400" />;
      case 'pr_reviewer': return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'devops': return <Server className="w-4 h-4 text-emerald-400" />;
      case 'trader': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'social': return <Share2 className="w-4 h-4 text-pink-400" />;
      case 'researcher': return <Search className="w-4 h-4 text-blue-400" />;
      case 'scheduler': return <Calendar className="w-4 h-4 text-yellow-400" />;
      case 'security': return <ShieldCheck className="w-4 h-4 text-red-400" />;
      case 'comms': return <Mail className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getStatusBadge = (status: AgentInfo['status']) => {
    switch (status) {
      case 'listening': return 'bg-cyan-950 text-cyan-300 border-cyan-400';
      case 'thinking': return 'bg-amber-950 text-amber-300 border-amber-400';
      case 'acting': return 'bg-emerald-950 text-emerald-300 border-emerald-400';
      case 'debating': return 'bg-purple-950 text-purple-300 border-purple-400';
      case 'frozen': return 'bg-red-950 text-red-300 border-red-400';
      default: return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="font-orbitron font-bold text-cyan-200">SPECIALIST AGENT SWARM</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            10 AGENTS ON-CALL
          </span>
        </div>
        <span className="text-[10px] text-cyan-500/80">
          Orchestrated by Queen Agent • Shared Memory & MCP Tools
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {agents.map((ag) => {
          const isActive = ag.id === activeAgentId;
          const isHighPriority = isAgentHandlingHighPriorityTask(ag, tasks);

          return (
            <div
              key={ag.id}
              onClick={() => {
                playSound('chirp');
                onSelectAgent(ag.id);
              }}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-[#0a1e35] border-cyan-400 shadow-[0_0_15px_rgba(0,255,200,0.25)]'
                  : 'bg-[#06101c]/90 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-[#091728]'
              }`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getAgentIcon(ag.id)}
                    <span className="font-bold text-cyan-100 text-[11px]">{ag.name}</span>
                  </div>

                  {/* Status Indicator with subtle CSS pulse animation on high-priority task */}
                  <span
                    data-testid={`status-indicator-${ag.id}`}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold uppercase transition-all duration-300 ${
                      isHighPriority
                        ? 'status-pulse-high border-amber-400 text-amber-200 bg-amber-950/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : getStatusBadge(ag.status)
                    }`}
                    title={isHighPriority ? 'Handling High-Priority Task' : `Status: ${ag.status}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isHighPriority
                          ? 'bg-amber-400 animate-pulse ring-1 ring-amber-300 shadow-[0_0_6px_#fbbf24]'
                          : ag.status === 'idle'
                          ? 'bg-slate-500'
                          : 'bg-cyan-400'
                      }`}
                    />
                    <span>{ag.status}</span>
                    {isHighPriority && (
                      <span className="text-[7.5px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold tracking-wide border border-amber-400/40">
                        PRIORITY
                      </span>
                    )}
                  </span>
                </div>

                <p className="text-[10px] text-cyan-400/80 line-clamp-1">{ag.role}</p>
                <div className="text-[9.5px] text-slate-400 line-clamp-1">
                  Models: {ag.primaryModels.join(', ')}
                </div>
              </div>

              {/* Current Task or Quick Spawn */}
              <div className="pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[10px]">
                <div className="flex flex-col max-w-[70%]">
                  <div className="flex items-center gap-1">
                    <span className="text-cyan-500/60 text-[9px]">TASK:</span>
                    {isHighPriority && (
                      <span className="text-[8px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-400/40 font-bold">
                        HIGH
                      </span>
                    )}
                  </div>
                  <span className="text-cyan-200 truncate">{ag.currentTask || 'Idle / Standing by'}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound('beep');
                    onSpawnTask(ag.id, `Execute standard telemetry & audit task for ${ag.name}`);
                  }}
                  className="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold cursor-pointer transition-colors"
                >
                  ASSIGN
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
