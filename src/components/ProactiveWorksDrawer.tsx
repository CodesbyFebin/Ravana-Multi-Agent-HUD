import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  GitPullRequest, 
  Server, 
  Share2, 
  Mail, 
  BookOpen, 
  AlertTriangle 
} from 'lucide-react';
import { ProactiveSuggestion, AgentId } from '../lib/types.ts';
import { playSound } from '../lib/soundFx.ts';

interface ProactiveWorksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteWork: (work: ProactiveSuggestion) => void;
}

export const PROACTIVE_WORKS_CATALOG: ProactiveSuggestion[] = [
  {
    id: 'pw_1',
    title: 'Morning Executive Briefing',
    summary: 'Calendar: 3 meetings, 2 open PRs, weather in Mumbai 28°C, overnight BTC +3.4%.',
    category: 'brief',
    urgency: 'high',
    suggestedAction: 'Deliver morning brief with speech summary',
    needsApproval: false,
    agent: 'queen',
    mcpSource: 'calendar, weather, exchange',
  },
  {
    id: 'pw_2',
    title: 'PR Review Queue',
    summary: '3 PRs awaiting your sign-off on repository. Automated review found 1 security issue.',
    category: 'pr',
    urgency: 'high',
    suggestedAction: 'Trigger PR Reviewer multi-LLM critique',
    needsApproval: false,
    agent: 'pr_reviewer',
    mcpSource: 'github',
  },
  {
    id: 'pw_3',
    title: 'Server Latency Spike (+12%)',
    summary: 'APAC cluster ingress latency rose from 38ms to 64ms over the past 30 minutes.',
    category: 'server',
    urgency: 'medium',
    suggestedAction: 'Run auto-diagnostic on connection pool and restart canary',
    needsApproval: true,
    agent: 'devops',
    mcpSource: 'prometheus',
  },
  {
    id: 'pw_4',
    title: 'BTC Trading Threshold Crossed',
    summary: 'BTC crossed $68,000 target. Optimal 0.75 BTC long setup detected with 2% stop-loss.',
    category: 'trading',
    urgency: 'high',
    suggestedAction: 'Execute trade order with adversarial review gating',
    needsApproval: true,
    agent: 'trader',
    mcpSource: 'binance, alpaca',
  },
  {
    id: 'pw_5',
    title: 'Social Post Ready for X/LinkedIn',
    summary: 'Generated thread on multi-agent adversarial orchestration. Estimated high reach.',
    category: 'social',
    urgency: 'low',
    suggestedAction: 'Review draft and queue for optimal 2:00 PM post slot',
    needsApproval: true,
    agent: 'social',
    mcpSource: 'twitter, linkedin',
  },
  {
    id: 'pw_6',
    title: 'Email & Communications Triage',
    summary: '14 unread messages overnight. 2 urgent emails from stakeholders flagged for reply.',
    category: 'brief',
    urgency: 'medium',
    suggestedAction: 'Draft context-aware replies for review',
    needsApproval: false,
    agent: 'comms',
    mcpSource: 'email_imap',
  },
  {
    id: 'pw_7',
    title: 'Dependency CVE Security Audit',
    summary: '2 dependencies have known moderate CVEs. Automated PR created to patch them cleanly.',
    category: 'security',
    urgency: 'high',
    suggestedAction: 'Review dependency diff and merge patch branch',
    needsApproval: true,
    agent: 'security',
    mcpSource: 'npm_audit, snyk',
  },
  {
    id: 'pw_8',
    title: 'Off-Peak Deployment Window',
    summary: 'CI build passed and tests green. Next 2-hour window has lowest regional traffic.',
    category: 'server',
    urgency: 'medium',
    suggestedAction: 'Deploy staging build v2.4 to production with canary drain',
    needsApproval: true,
    agent: 'devops',
    mcpSource: 'docker, k8s',
  },
  {
    id: 'pw_9',
    title: 'Competitor Intelligence Alert',
    summary: 'Competitor X announced new real-time WebXR feature. Summarized 2-page brief prepared.',
    category: 'brief',
    urgency: 'low',
    suggestedAction: 'Read key technical differentiators breakdown',
    needsApproval: false,
    agent: 'researcher',
    mcpSource: 'web_search, news',
  },
  {
    id: 'pw_10',
    title: 'Git Hygiene: 3 Stale Branches',
    summary: 'Branches feature/proto-ar and dev/old-api have had zero commits for >40 days.',
    category: 'pr',
    urgency: 'low',
    suggestedAction: 'Archive and prune merged branches',
    needsApproval: false,
    agent: 'coder',
    mcpSource: 'git_ops',
  },
  {
    id: 'pw_11',
    title: 'Health & Wellbeing Coding Break',
    summary: 'Continuous 4-hour high-intensity terminal focus detected. Recommended 5-min eye break.',
    category: 'health',
    urgency: 'low',
    suggestedAction: 'Pause active timers and dim HUD glow for 5 minutes',
    needsApproval: false,
    agent: 'queen',
    mcpSource: 'system_timer',
  },
  {
    id: 'pw_12',
    title: 'API Quota Guard (80% Gemini Limit)',
    summary: 'Consumed 82% of monthly free-tier allocation. Free-tier fallback router primed.',
    category: 'server',
    urgency: 'medium',
    suggestedAction: 'Enforce local Phi-4 and Llama 3.3 for trivial queries',
    needsApproval: false,
    agent: 'queen',
    mcpSource: 'cost_guard',
  },
];

export const ProactiveWorksDrawer: React.FC<ProactiveWorksDrawerProps> = ({
  isOpen,
  onClose,
  onExecuteWork,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 select-none">
      <div className="w-full max-w-md h-full bg-[#06101c] border-l border-cyan-500/40 shadow-2xl p-4 flex flex-col gap-3 font-mono text-xs text-cyan-100 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-orbitron font-bold text-sm text-cyan-200">
              PROACTIVE INTELLIGENCE
            </span>
          </div>
          <button
            onClick={() => {
              playSound('beep');
              onClose();
            }}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-cyan-400/80">
          The Queen Agent constantly monitors system metrics, markets, PRs, and communications, proactively proposing high-impact works.
        </p>

        {/* Suggestion list */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
          {PROACTIVE_WORKS_CATALOG.map((work) => (
            <div
              key={work.id}
              className="p-3 rounded-lg bg-[#081524] border border-cyan-500/20 hover:border-cyan-400/50 flex flex-col gap-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-100 text-[11px]">{work.title}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                    work.urgency === 'high'
                      ? 'bg-red-950 text-red-300 border border-red-500/30'
                      : work.urgency === 'medium'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {work.urgency} URGENCY
                </span>
              </div>

              <p className="text-[10px] text-cyan-300/80 leading-relaxed">
                {work.summary}
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-cyan-500/10 text-[9.5px]">
                <span className="text-cyan-500/70">AGENT: {work.agent.toUpperCase()}</span>

                <button
                  onClick={() => {
                    playSound('chirp');
                    onExecuteWork(work);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-400 font-bold transition-all cursor-pointer"
                >
                  <span>EXECUTE</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
