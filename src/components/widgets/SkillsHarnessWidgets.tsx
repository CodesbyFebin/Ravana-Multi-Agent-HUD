import React, { useState } from 'react';
import { 
  Award, 
  Workflow, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Cpu 
} from 'lucide-react';

export const SkillsHarnessWidgets: React.FC = () => {
  // 1. Skill Registry (47 skills sample)
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const skillsData = [
    { name: 'pr_review', agent: 'Coder', uses: 34, status: 'active', cat: 'CODING' },
    { name: 'write_code', agent: 'Coder', uses: 128, status: 'active', cat: 'CODING' },
    { name: 'debug', agent: 'Coder', uses: 67, status: 'idle', cat: 'CODING' },
    { name: 'test_gen', agent: 'Coder', uses: 45, status: 'idle', cat: 'CODING' },
    { name: 'server_health', agent: 'DevOps', uses: 234, status: 'active', cat: 'DEVOPS' },
    { name: 'deploy', agent: 'DevOps', uses: 12, status: 'idle', cat: 'DEVOPS' },
    { name: 'alert_triage', agent: 'DevOps', uses: 89, status: 'active', cat: 'DEVOPS' },
    { name: 'trade_signal', agent: 'Trader', uses: 56, status: 'active', cat: 'TRADING' },
    { name: 'execute_trade', agent: 'Trader', uses: 14, status: 'idle', cat: 'TRADING' },
    { name: 'backtest', agent: 'Trader', uses: 8, status: 'idle', cat: 'TRADING' },
    { name: 'draft_post', agent: 'Social', uses: 23, status: 'idle', cat: 'SOCIAL' },
    { name: 'engagement_analyse', agent: 'Social', uses: 41, status: 'active', cat: 'SOCIAL' },
    { name: 'deep_research', agent: 'Researcher', uses: 19, status: 'idle', cat: 'RESEARCH' },
    { name: 'fact_check', agent: 'Researcher', uses: 67, status: 'active', cat: 'RESEARCH' },
    { name: 'vuln_scan', agent: 'Security', uses: 6, status: 'idle', cat: 'SECURITY' },
    { name: 'secret_scan', agent: 'Security', uses: 12, status: 'idle', cat: 'SECURITY' },
    { name: 'email_triage', agent: 'Comms', uses: 156, status: 'active', cat: 'COMMS' },
    { name: 'daily_brief', agent: 'Queen', uses: 14, status: 'active', cat: 'CORE' },
    { name: 'memory_search', agent: 'All', uses: 2847, status: 'active', cat: 'CORE' },
    { name: 'debate', agent: 'Queen', uses: 34, status: 'idle', cat: 'CORE' },
  ];

  // 2. Test Harness CI Pipelines
  const harnessPipelines = [
    { 
      name: 'ravana-core (Rust)', 
      stages: [
        { name: 'cargo build', status: 'pass', dur: '42s' },
        { name: 'cargo test', status: 'pass', dur: '18s' },
        { name: 'clippy', status: 'pass', dur: '8s' },
        { name: 'docker build', status: 'running', dur: '...' },
        { name: 'deploy-staging', status: 'pending', dur: '' },
      ]
    },
    { 
      name: 'ravana-hud (Tauri)', 
      stages: [
        { name: 'npm ci', status: 'pass', dur: '12s' },
        { name: 'svelte-check', status: 'pass', dur: '5s' },
        { name: 'vite build', status: 'pass', dur: '23s' },
        { name: 'tauri build', status: 'pass', dur: '67s' },
        { name: 'e2e (playwright)', status: 'pass', dur: '34s' },
      ]
    },
    { 
      name: 'agents (Python)', 
      stages: [
        { name: 'pip install', status: 'pass', dur: '8s' },
        { name: 'pytest', status: 'fail', dur: '22s' },
        { name: 'mypy', status: 'pending', dur: '' },
        { name: 'ruff check', status: 'pending', dur: '' },
      ]
    },
  ];

  // 3. System Hardware Health Bars
  const sysHealth = [
    { label: 'CPU', val: 64, color: 'bg-emerald-400' },
    { label: 'RAM', val: 71, color: 'bg-amber-400' },
    { label: 'DISK', val: 42, color: 'bg-emerald-400' },
    { label: 'NET', val: 23, color: 'bg-emerald-400' },
    { label: 'GPU', val: 88, color: 'bg-amber-400' },
  ];

  const categories = ['ALL', 'CORE', 'CODING', 'DEVOPS', 'TRADING', 'SOCIAL', 'RESEARCH', 'SECURITY', 'COMMS'];

  const filteredSkills = skillsData.filter(s => {
    const matchCat = selectedCat === 'ALL' || s.cat === selectedCat;
    const matchSearch = s.name.toLowerCase().includes(skillSearch.toLowerCase()) || s.agent.toLowerCase().includes(skillSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col gap-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-cyan-200">SKILLS REGISTRY, CI HARNESS & HEALTH</span>
        </div>
        <span className="text-[10px] text-cyan-400/80">
          47 Verified Skills • 3 Active CI Pipelines
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Module 1: Skill Registry (47 skills) */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/15 pb-1.5">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" /> SKILL REGISTRY (47 ACTIVE)
            </span>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 text-cyan-400 absolute left-2 top-2" />
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Filter skills or agents..."
                  className="bg-[#091728] border border-cyan-500/30 rounded pl-7 pr-2 py-0.5 text-cyan-100 text-[10px] focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Categories Pill Selector */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer whitespace-nowrap transition-colors ${selectedCat === cat ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-slate-400 hover:text-cyan-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[190px] overflow-y-auto scrollbar-thin">
            {filteredSkills.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-[#081525] border border-cyan-500/10 text-[9.5px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-emerald-400 shadow-[0_0_3px_#00ff88]' : 'bg-slate-500'}`} />
                  <span className="text-cyan-100 font-bold">{s.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30 text-[8px]">
                    {s.agent}
                  </span>
                  <span className="text-slate-400 text-[8.5px] min-w-[28px] text-right font-mono">
                    {s.uses}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: Test Harness & System Health */}
        <div className="flex flex-col gap-3">
          {/* CI Pipelines */}
          <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
              <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-cyan-400" /> TEST HARNESS
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">PASSING</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[130px] overflow-y-auto scrollbar-thin">
              {harnessPipelines.map((pipe, idx) => (
                <div key={idx} className="flex flex-col gap-1 text-[9.5px] border-b border-cyan-500/5 pb-1">
                  <span className="font-bold text-cyan-300 text-[10px]">{pipe.name}</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {pipe.stages.map((st, sIdx) => (
                      <span
                        key={sIdx}
                        className={`px-1.5 py-0.2 rounded text-[8px] font-bold flex items-center gap-1 ${
                          st.status === 'pass'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : st.status === 'fail'
                            ? 'bg-red-950 text-red-300 border border-red-500/30'
                            : st.status === 'running'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {st.status === 'pass' ? '✓' : st.status === 'fail' ? '✗' : st.status === 'running' ? '◉' : '○'} {st.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Hardware Health */}
          <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
              <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM HEALTH
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">NOMINAL</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {sysHealth.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[9.5px]">
                  <span className="w-8 text-slate-400">{item.label}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                  </div>
                  <span className="text-cyan-200 font-mono w-7 text-right">{item.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
