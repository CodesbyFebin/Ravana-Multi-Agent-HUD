import React from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Database, 
  RotateCcw,
  Sparkles,
  Server,
  MessageSquare,
  Activity,
  Award,
  Crosshair
} from 'lucide-react';
import { playSound } from '../lib/soundFx.ts';

export type ActiveTabId = 
  | 'overview' 
  | 'swarm_skills' 
  | 'dev_infra' 
  | 'trading_finance' 
  | 'comms_intel' 
  | 'executive_tools' 
  | 'models' 
  | 'tasks' 
  | 'memory';

interface BottomControlDockProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: ActiveTabId;
  onChangeTab: (tab: ActiveTabId) => void;
  onResetCamera: () => void;
  pendingApprovalsCount: number;
  calloutsVisible: boolean;
  onToggleCallouts: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onChangeTab,
  onResetCamera,
  pendingApprovalsCount,
  calloutsVisible,
  onToggleCallouts,
}) => {
  const tabs: { id: ActiveTabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'OVERVIEW', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'dev_infra', label: 'DEV & INFRA', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'trading_finance', label: 'TRADING & FINANCE', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'comms_intel', label: 'COMMS & INTEL', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'executive_tools', label: 'EXECUTIVE & LIFE', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'swarm_skills', label: 'SWARM & SKILLS', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'models', label: 'MODEL POOL', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'tasks', label: 'TASKS', icon: <CheckSquare className="w-3.5 h-3.5" />, badge: pendingApprovalsCount },
    { id: 'memory', label: 'MEMORY VAULT', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out select-none flex flex-col items-center max-w-[min(1060px,96vw)] w-full ${
        isCollapsed ? 'bottom-2' : 'bottom-3 sm:bottom-4'
      }`}
    >
      {/* Top Toggle Controls */}
      <div className="flex items-center gap-2 mb-1">
        {/* Callouts Toggle */}
        <button
          onClick={() => {
            playSound('beep');
            onToggleCallouts();
          }}
          className={`px-3 py-1 border rounded-t font-mono text-[10px] tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
            calloutsVisible
              ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_8px_#00ffc8]'
              : 'bg-[#050c18] hover:bg-cyan-950/90 text-cyan-400 border-cyan-500/30'
          }`}
          title="Toggle Tactical HUD Callouts & Reticles [C]"
        >
          <Crosshair className="w-3 h-3" />
          <span>HUD CALLOUTS: {calloutsVisible ? 'ON' : 'OFF'}</span>
          <span className="text-[9px] opacity-75">[C]</span>
        </button>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => {
            playSound('beep');
            onToggleCollapse();
          }}
          className="px-3 py-1 bg-[#050c18] hover:bg-cyan-950/90 text-cyan-400 border border-cyan-500/30 rounded-t font-mono text-[10px] tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_-4px_10px_rgba(0,255,200,0.1)] transition-colors"
          title="Toggle HUD Dock (Zen / Cinema 3D View) [H]"
        >
          {isCollapsed ? <ChevronUp className="w-3 h-3 text-cyan-300" /> : <ChevronDown className="w-3 h-3 text-cyan-300" />}
          <span>{isCollapsed ? '▴ SHOW COMMAND DOCK' : '▾ HIDE DOCK (CINEMA MODE)'}</span>
          <span className="text-slate-500 text-[9px]">[H]</span>
        </button>
      </div>

      {/* Main Bottom Dock Bar */}
      {!isCollapsed && (
        <div className="w-full p-2 rounded-lg bg-[#06101c]/95 border border-cyan-500/40 shadow-[0_0_25px_rgba(0,255,200,0.15)] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          {/* Tab Navigation Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playSound('beep');
                    onChangeTab(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all cursor-pointer text-[10.5px] font-bold whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500 text-black border border-cyan-300 shadow-[0_0_12px_#00ffc8]'
                      : 'bg-[#091728] hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/25 hover:border-cyan-400'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-extrabold">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Actions in Dock */}
          <div className="flex items-center gap-2 pl-2 border-l border-cyan-500/20">
            <button
              onClick={() => {
                playSound('beep');
                onResetCamera();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-[10px] cursor-pointer whitespace-nowrap"
              title="Reset 3D Camera / Orbit Orientation"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">CENTER IRIS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
