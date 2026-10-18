import React from 'react';
import { 
  GitPullRequest, 
  MessageSquare, 
  Share2, 
  Radio, 
  Globe, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

export const CommsIntelWidgets: React.FC = () => {
  // 1. GitHub Data
  const githubData = [
    { num: 142, title: 'Auth refactor — JWT rotation', ci: 'pass', review: '2/3' },
    { num: 145, title: 'Add rate limiting middleware', ci: 'pending', review: '0/2' },
    { num: 148, title: 'Fix memory leak in agent pool', ci: 'fail', review: '1/2' },
  ];

  // 2. Slack Data
  const slackData = [
    { channel: '#ravana-dev', unread: 3, mention: false },
    { channel: '#trading', unread: 1, mention: true },
    { channel: '#design', unread: 2, mention: false },
    { channel: '#alerts', unread: 1, mention: true },
    { channel: '#general', unread: 0, mention: false },
  ];

  // 3. Social Media Posts
  const socialData = [
    { platform: 'x', text: 'RAVANA v3.7 shipped — multi-agent adversarial review is live. No more one-model hallucinations.', time: '2h ago', likes: 234, reposts: 45 },
    { platform: 'li', text: 'Building a self-hosted AI command centre. 14 models, 10 agents, zero cloud dependency. Thread →', time: '1d ago', likes: 892, reposts: 156 },
    { platform: 'yt', text: 'RAVANA HUD walkthrough — cyberpunk command centre for your AI agents', time: '3d ago', views: '12.4k' },
    { draft: 'LinkedIn: "What I learned building a multi-LLM adversarial review pipeline"' },
  ];

  // 4. Intel & Threat Feed
  const intelData = [
    { source: 'CVE', text: 'Critical: Node.js 20.x RCE (CVE-2026-3184). Your 3 repos affected.', urgent: true },
    { source: 'MARKET', text: 'Fed rate decision in 48h. Volatility expected. Consider hedging.', urgent: false },
    { source: 'GITHUB', text: 'Tauri 2.5 released — new WebView API, 12% perf gain.', urgent: false },
    { source: 'COMPETITOR', text: 'SwarmClaw v4.2 shipped: added peer-to-peer agent mesh.', urgent: false },
    { source: 'RESEARCH', text: 'New paper: "Adversarial LLM Consensus" — 3-model debate reduces hallucination 74%.', urgent: false },
  ];

  // 5. Browser Tabs
  const browserTabs = [
    { title: 'RAVANA — GitHub PR #142', fav: '⌂', favBg: 'bg-cyan-950 text-cyan-300', time: 'now', active: true },
    { title: 'Binance — BTC/USDC Chart', fav: '₿', favBg: 'bg-amber-950 text-amber-300', time: '2m', active: false },
    { title: 'Slack — #ravana-dev', fav: 'S', favBg: 'bg-purple-950 text-purple-300', time: '5m', active: false },
    { title: 'DeepSeek API Docs', fav: 'D', favBg: 'bg-blue-950 text-blue-300', time: '12m', active: false },
    { title: 'Tauri 2.5 Release Notes', fav: 'T', favBg: 'bg-orange-950 text-orange-300', time: '18m', active: false },
    { title: 'arXiv: Adversarial LLM Consensus', fav: '📄', favBg: 'bg-slate-900 text-slate-300', time: '34m', active: false },
  ];

  return (
    <div className="flex flex-col gap-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-cyan-200">COMMUNICATIONS, INTEL & BROWSER</span>
        </div>
        <span className="text-[10px] text-cyan-400/80">
          GitHub • Slack • Social • Threat Intelligence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Module 1: GitHub PRs & CI */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <GitPullRequest className="w-3.5 h-3.5 text-purple-400" /> GITHUB
            </span>
            <span className="text-[9px] text-cyan-400">3 PRs · 2 Issues</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {githubData.map((pr) => (
              <div key={pr.num} className="flex items-center gap-2 text-[10px] border-b border-cyan-500/5 pb-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${pr.ci === 'pass' ? 'bg-emerald-400 shadow-[0_0_4px_#00ff88]' : pr.ci === 'fail' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <span className="font-bold text-cyan-300 min-w-[38px]">#{pr.num}</span>
                <span className="flex-1 text-cyan-100 truncate">{pr.title}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/20">
                  {pr.review}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: Slack & Comms */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> SLACK / COMMS
            </span>
            <span className="text-[9px] text-amber-400 font-bold">7 UNREAD</span>
          </div>

          <div className="flex flex-col gap-1">
            {slackData.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px] border-b border-cyan-500/5 pb-1">
                <span className="text-cyan-200 font-medium">{s.channel}</span>
                <div className="flex items-center gap-1.5">
                  {s.mention && (
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                      @you
                    </span>
                  )}
                  {s.unread > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-bold">
                      {s.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 3: Social Media Queue */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-pink-400" /> SOCIAL MEDIA
            </span>
            <span className="text-[9px] text-cyan-400">2 DRAFTS READY</span>
          </div>

          <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto scrollbar-thin">
            {socialData.map((post, idx) => (
              <div key={idx} className="flex flex-col text-[10px] border-b border-cyan-500/5 pb-1.5">
                {post.platform ? (
                  <>
                    <div className="flex items-center justify-between text-[9px] mb-0.5">
                      <span className={`px-1 rounded font-bold uppercase ${post.platform === 'x' ? 'bg-slate-800 text-white' : post.platform === 'li' ? 'bg-blue-900 text-blue-200' : 'bg-red-900 text-red-200'}`}>
                        {post.platform}
                      </span>
                      <span className="text-slate-400">{post.time}</span>
                    </div>
                    <p className="text-cyan-100 text-[9.5px] line-clamp-2">{post.text}</p>
                    <span className="text-[8.5px] text-cyan-400/80 mt-0.5">
                      {post.likes ? `♥ ${post.likes} · ↻ ${post.reposts}` : `▶ ${post.views}`}
                    </span>
                  </>
                ) : (
                  <div className="p-1.5 rounded bg-amber-950/30 border-l-2 border-amber-400 text-[9px] text-amber-300">
                    ✎ DRAFT: {post.draft}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Module 4: Intel & Threat Feed */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" /> INTEL FEED
            </span>
            <span className="text-[9px] text-red-400 font-bold">1 URGENT</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[170px] overflow-y-auto scrollbar-thin">
            {intelData.map((item, idx) => (
              <div key={idx} className={`p-1.5 rounded border text-[9.5px] flex flex-col gap-0.5 ${item.urgent ? 'bg-red-950/40 border-red-500/40' : 'bg-[#091728] border-cyan-500/15'}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-[9px] ${item.urgent ? 'text-red-400' : 'text-cyan-400'}`}>
                    [{item.source}]
                  </span>
                  {item.urgent && <span className="text-[8px] text-red-300 font-bold">URGENT</span>}
                </div>
                <p className="text-cyan-100 text-[9.5px] leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Module 5: Browser Activity Tabs */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2 md:col-span-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> BROWSER ACTIVITY (12 TABS)
            </span>
            <div className="flex items-center gap-3 text-[9px] text-slate-400">
              <span>RAM: 1.8 GB</span>
              <span>SESSION: 2h 34m</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {browserTabs.map((tab, idx) => (
              <div key={idx} className={`flex items-center gap-2 p-1.5 rounded text-[10px] border transition-colors ${tab.active ? 'bg-cyan-950/60 border-cyan-400 text-cyan-100' : 'bg-[#081525] border-cyan-500/15 text-slate-300'}`}>
                <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[8.5px] ${tab.favBg}`}>
                  {tab.fav}
                </span>
                <span className="flex-1 truncate">{tab.title}</span>
                <span className="text-[8.5px] text-slate-500">{tab.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
