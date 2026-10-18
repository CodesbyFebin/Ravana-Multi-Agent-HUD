import React, { useState, useEffect, useRef } from 'react';
import { ReactorCanvas } from './components/ReactorCanvas.tsx';
import { HeaderBar } from './components/HeaderBar.tsx';
import { VoiceCommandBar } from './components/VoiceCommandBar.tsx';
import { BottomControlDock, ActiveTabId } from './components/BottomControlDock.tsx';
import { ModelStatusWidget } from './components/ModelStatusWidget.tsx';
import { AgentSwarmWidget } from './components/AgentSwarmWidget.tsx';
import { TasksWidget } from './components/TasksWidget.tsx';
import { TradingServerWidget } from './components/TradingServerWidget.tsx';
import { MemoryWidget } from './components/MemoryWidget.tsx';
import { AdversarialModal } from './components/AdversarialModal.tsx';
import { ProactiveWorksDrawer } from './components/ProactiveWorksDrawer.tsx';
import { HudCalloutsOverlay } from './components/HudCalloutsOverlay.tsx';

// The 37 Modular Widgets Suites
import { DevOpsInfraWidgets } from './components/widgets/DevOpsInfraWidgets.tsx';
import { TradingFinanceWidgets } from './components/widgets/TradingFinanceWidgets.tsx';
import { CommsIntelWidgets } from './components/widgets/CommsIntelWidgets.tsx';
import { ExecutiveLifeWidgets } from './components/widgets/ExecutiveLifeWidgets.tsx';
import { SkillsHarnessWidgets } from './components/widgets/SkillsHarnessWidgets.tsx';

import { playSound } from './lib/soundFx.ts';

import { 
  AgentId, 
  AgentInfo, 
  AgentStatus, 
  ModelMetadata, 
  TaskItem, 
  MemoryItem, 
  AdversarialReview, 
  AuditReceipt, 
  ProactiveSuggestion 
} from './lib/types.ts';
import { INITIAL_MODEL_POOL, routeTaskToModel } from './lib/router.ts';
import { INITIAL_MEMORIES } from './lib/memory.ts';
import { createSimulatedAdversarialReview } from './lib/adversarial.ts';
import { useNexusWebSocket } from './lib/useNexusWebSocket.ts';

export default function App() {
  // Agent Swarm State (Queen + 9 Specialists)
  const [agents, setAgents] = useState<AgentInfo[]>([
    {
      id: 'queen',
      name: 'Queen Agent',
      role: 'Master Orchestrator, Gating & Planning',
      primaryModels: ['Gemini 3.8 Flash', 'Gemini 4 Argon'],
      skills: ['task_decomposition', 'routing', 'adversarial_gate', 'daily_brief'],
      status: 'idle',
      currentTask: 'Standing by for "Hey Bro" wake word',
    },
    {
      id: 'coder',
      name: 'Coder',
      role: 'Write, Refactor & Debug Codebase',
      primaryModels: ['Claude 3.7', 'GPT-4o'],
      skills: ['write_code', 'refactor', 'debug', 'git_ops'],
      status: 'idle',
      currentTask: 'Idle',
    },
    {
      id: 'pr_reviewer',
      name: 'PR Reviewer',
      role: 'Multi-LLM PR Audit & Risk Scoring',
      primaryModels: ['Claude 3.7', 'GPT-4o', 'DeepSeek-V3'],
      skills: ['pr_review', 'code_audit', 'risk_score'],
      status: 'acting',
      currentTask: 'Review Staging PR #42 (CVE Patch) [High Priority]',
    },
    {
      id: 'devops',
      name: 'DevOps / Monitor',
      role: 'Server, Latency & Deploy Operations',
      primaryModels: ['Llama 3.3 (Local)', 'Grok-3'],
      skills: ['server_health', 'deploy', 'backup_verify', 'alert_triage'],
      status: 'thinking',
      currentTask: 'Deploy Production Cluster v2.4 [Critical Priority]',
    },
    {
      id: 'trader',
      name: 'Trader',
      role: 'Portfolio P&L & Market Signals',
      primaryModels: ['Grok-3', 'DeepSeek-V3'],
      skills: ['portfolio_snapshot', 'trade_signal', 'risk_check'],
      status: 'idle',
      currentTask: 'Idle',
    },
    {
      id: 'social',
      name: 'Social / Content',
      role: 'Thread Drafting & Analytics',
      primaryModels: ['GPT-4o', 'Gemini 3.8 Flash'],
      skills: ['draft_post', 'schedule_post', 'thread_optimise'],
      status: 'idle',
      currentTask: 'Idle',
    },
    {
      id: 'researcher',
      name: 'Researcher',
      role: 'Grounding Search, Citations & Fact-Check',
      primaryModels: ['Gemini 3.8 Flash (Grounding)', 'DeepSeek-V3'],
      skills: ['web_search', 'deep_research', 'fact_check'],
      status: 'idle',
      currentTask: 'Idle',
    },
    {
      id: 'scheduler',
      name: 'Scheduler',
      role: 'Calendar & Proactive Suggestions',
      primaryModels: ['Phi-4 (Local)', 'Gemini 3.1 Flash-Lite'],
      skills: ['calendar_manage', 'daily_brief', 'remind'],
      status: 'idle',
      currentTask: 'Idle',
    },
    {
      id: 'security',
      name: 'Security Guard',
      role: 'CVE Detection & Pen-Test Audit',
      primaryModels: ['Grok-3', 'Claude 3.7'],
      skills: ['vuln_scan', 'secret_scan', 'auth_audit'],
      status: 'idle',
      currentTask: 'Idle',
    },
    {
      id: 'comms',
      name: 'Comms & Triage',
      role: 'Slack, Email & Message Triage',
      primaryModels: ['Claude 3.7', 'Phi-4 (Local)'],
      skills: ['email_triage', 'slack_digest', 'comms_reply'],
      status: 'idle',
      currentTask: 'Idle',
    },
  ]);

  const [activeAgentId, setActiveAgentId] = useState<AgentId>('queen');
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-3.8-flash');
  const [isFreeMode, setIsFreeMode] = useState(false);

  // Real-Time Full-Duplex WebSocket Engine
  const {
    connected: wsConnected,
    telemetry,
    models,
    setModels,
    tradeEvents,
    thoughtSteps,
    terminalLines,
    activeReview: wsActiveReview,
    latestResponse: wsLatestResponse,
    clearLatestResponse,
    isFrozen: wsIsFrozen,
    serverVoiceAmplitude,
    agentStatuses,
    sendUserCommand,
    sendFreeze,
    sendApprovalDecision,
    sendVoiceAmplitude,
    sendTaskUpdate,
  } = useNexusWebSocket();

  // System Core Status & Reactor Kinematics
  const [systemStatus, setSystemStatus] = useState<AgentStatus>('idle');
  const [voiceAmplitude, setVoiceAmplitude] = useState<number>(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTheme, setActiveTheme] = useState('cyan');
  const [calloutsVisible, setCalloutsVisible] = useState(true);

  // Speech Recognition & TTS
  const [isRecording, setIsRecording] = useState(false);
  const [lastSpeechResponse, setLastSpeechResponse] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const audioSourceRef = useRef<HTMLAudioElement | null>(null);

  // Tasks Kanban State
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task_1',
      title: 'Review Staging PR #42 (CVE Patch)',
      description: 'Audit dependency updates and verify zero regression in auth tokens.',
      status: 'review',
      assignedAgent: 'pr_reviewer',
      priority: 'high',
      requiresReview: true,
      tags: ['pr', 'security', 'cve'],
      createdAt: Date.now() - 3600000 * 2,
      updatedAt: Date.now(),
    },
    {
      id: 'task_2',
      title: 'Deploy Production Cluster v2.4',
      description: 'APAC and US-East blue-green canary deployment with rollback check.',
      status: 'todo',
      assignedAgent: 'devops',
      priority: 'critical',
      requiresReview: true,
      tags: ['deploy', 'prod', 'docker'],
      createdAt: Date.now() - 3600000 * 4,
      updatedAt: Date.now(),
    },
    {
      id: 'task_3',
      title: 'BTC Market Position Monitor',
      description: 'Track $68,500 threshold and prepare 0.75 BTC long order.',
      status: 'in_progress',
      assignedAgent: 'trader',
      priority: 'medium',
      requiresReview: true,
      tags: ['trading', 'btc'],
      createdAt: Date.now() - 3600000 * 6,
      updatedAt: Date.now(),
    },
    {
      id: 'task_4',
      title: 'Generate Weekly System Uptime Receipt',
      description: '99.98% cluster availability verified and signed into hash-chain.',
      status: 'done',
      assignedAgent: 'queen',
      priority: 'low',
      requiresReview: false,
      tags: ['receipt', 'uptime'],
      createdAt: Date.now() - 3600000 * 20,
      updatedAt: Date.now(),
    },
  ]);

  // Shared Memory State
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);

  // Adversarial Review Modal State
  const [activeReview, setActiveReview] = useState<AdversarialReview | null>(null);
  const [auditReceipts, setAuditReceipts] = useState<AuditReceipt[]>([]);

  // Proactive Works Drawer
  const [isProactiveOpen, setIsProactiveOpen] = useState(false);

  // Dock & Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTabId>('overview');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Speech Synthesis
  const speakText = async (text: string) => {
    if (!soundEnabled) return;

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Kore' }),
      });
      const data = await res.json();

      if (data.available && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audioSourceRef.current = audio;
        audio.onplay = () => {
          setSystemStatus('acting');
          setVoiceAmplitude(0.7);
        };
        audio.onended = () => {
          setSystemStatus('idle');
          setVoiceAmplitude(0);
        };
        audio.play();
        return;
      }
    } catch {
      // Fallback
    }

    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text.slice(0, 200));
      utter.rate = 1.05;
      utter.pitch = 0.95;
      utter.onstart = () => {
        setSystemStatus('acting');
        setVoiceAmplitude(0.5);
      };
      utter.onend = () => {
        setSystemStatus('idle');
        setVoiceAmplitude(0);
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const handleDispatchCommand = async (
    prompt: string,
    options: {
      useSearch?: boolean;
      useMaps?: boolean;
      useArgonThinking?: boolean;
      forceFreeMode?: boolean;
    } = {}
  ) => {
    if (isFrozen) {
      playSound('alert');
      return;
    }

    setSystemStatus('thinking');
    setVoiceAmplitude(0.3);
    sendVoiceAmplitude(0.3, 'thinking');

    // Send user command over WebSocket real-time bus
    if (wsConnected) {
      sendUserCommand(prompt, activeAgentId, options);
    }

    const routing = routeTaskToModel(prompt, options.forceFreeMode ?? isFreeMode);

    if (routing.requiresAdversarialReview) {
      setSystemStatus('debating');
      const actionType = prompt.toLowerCase().includes('trade')
        ? 'execute_trade'
        : prompt.toLowerCase().includes('deploy')
        ? 'deploy'
        : 'shell_exec';

      try {
        const res = await fetch('/api/adversarial-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionTitle: prompt,
            actionType,
            details: `Task complexity: ${routing.complexity}. Routed to ${routing.selectedModel}.`,
            agent: activeAgentId,
          }),
        });
        const reviewData: AdversarialReview = await res.json();
        setActiveReview(reviewData);
      } catch {
        const fallback = createSimulatedAdversarialReview(prompt, actionType, 'Execution requested by user', activeAgentId);
        setActiveReview(fallback);
      }
      return;
    }

    try {
      const chosenModel = options.useArgonThinking ? 'gemini-4-argon' : routing.selectedModel;
      setSelectedModelId(chosenModel);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          agentId: activeAgentId,
          preferredModel: chosenModel,
          useSearchGrounding: options.useSearch,
          useMapsGrounding: options.useMaps,
          forceFreeMode: options.forceFreeMode ?? isFreeMode,
        }),
      });

      const data = await res.json();
      setLastSpeechResponse(data.text);
      setSystemStatus('acting');

      setModels((prev: ModelMetadata[]) =>
        prev.map((m) =>
          m.id === chosenModel
            ? { ...m, tokensUsedToday: m.tokensUsedToday + 450 }
            : m
        )
      );

      speakText(data.text);
    } catch {
      setSystemStatus('idle');
      setVoiceAmplitude(0);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      if (!isRecording) {
        setIsRecording(true);
        setSystemStatus('listening');
        setVoiceAmplitude(0.6);
        setTimeout(() => {
          setIsRecording(false);
          setSystemStatus('idle');
          setVoiceAmplitude(0);
          handleDispatchCommand('Give me the morning executive brief and check PRs');
        }, 2200);
      } else {
        setIsRecording(false);
        setSystemStatus('idle');
        setVoiceAmplitude(0);
      }
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setSystemStatus('idle');
      setVoiceAmplitude(0);
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        setIsRecording(true);
        setSystemStatus('listening');
      }
    }
  };

  const handleBargeIn = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.pause();
      audioSourceRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSystemStatus('listening');
    setVoiceAmplitude(0.1);
  };

  // Sync freeze state from WebSocket broadcast
  useEffect(() => {
    setIsFrozen(wsIsFrozen);
  }, [wsIsFrozen]);

  // Sync agent status updates from WebSocket
  useEffect(() => {
    if (Object.keys(agentStatuses).length > 0) {
      setAgents((prev) =>
        prev.map((a) => {
          const update = agentStatuses[a.id];
          if (update) {
            return {
              ...a,
              status: update.status,
              currentTask: update.currentTask || a.currentTask,
            };
          }
          return a;
        })
      );
    }
  }, [agentStatuses]);

  // Sync WebSocket energy amplitude if server is pulsing
  useEffect(() => {
    if (serverVoiceAmplitude > 0 && !isRecording) {
      setVoiceAmplitude(serverVoiceAmplitude);
    }
  }, [serverVoiceAmplitude, isRecording]);

  // Sync adversarial review triggered via WebSocket anti-hallucination firewall
  useEffect(() => {
    if (wsActiveReview) {
      setActiveReview(wsActiveReview);
      setSystemStatus('debating');
    }
  }, [wsActiveReview]);

  // Sync command response received via WebSocket
  useEffect(() => {
    if (wsLatestResponse && wsLatestResponse.text) {
      setLastSpeechResponse(wsLatestResponse.text);
      setSystemStatus('acting');
      speakText(wsLatestResponse.text);
      clearLatestResponse();
    }
  }, [wsLatestResponse]);

  // Keyboard shortcuts [H] for dock, [C] for callouts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        if (e.key === 'h' || e.key === 'H') {
          setIsDockCollapsed((prev) => !prev);
        } else if (e.key === 'c' || e.key === 'C') {
          setCalloutsVisible((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Web Speech Recognition for "Hey Bro" Wake Word
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setSystemStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setVoiceAmplitude(0.4 + Math.random() * 0.5);

        if (transcript.toLowerCase().includes('hey bro')) {
          playSound('wake');
          const cleanCmd = transcript.replace(/hey bro/gi, '').trim();
          if (cleanCmd.length > 3) {
            handleDispatchCommand(cleanCmd);
          }
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setSystemStatus('idle');
        setVoiceAmplitude(0);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setSystemStatus('idle');
        setVoiceAmplitude(0);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleExecuteProactive = (work: ProactiveSuggestion) => {
    setActiveAgentId(work.agent);
    if (work.needsApproval) {
      const review = createSimulatedAdversarialReview(
        work.title,
        work.category === 'trading' ? 'execute_trade' : 'deploy',
        work.summary,
        work.agent
      );
      setActiveReview(review);
    } else {
      handleDispatchCommand(work.suggestedAction);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050b14] text-cyan-100 font-mono select-none">
      {/* 3D WebGL Reactor Scene (Full-bleed 100vw x 100vh) */}
      <ReactorCanvas
        status={isFrozen ? 'frozen' : systemStatus}
        amplitude={voiceAmplitude}
        onSelectAgent={(idx) => {
          const target = agents[idx % agents.length];
          if (target) {
            playSound('chirp');
            setActiveAgentId(target.id);
          }
        }}
      />

      {/* Futuristic Tactical HUD Callouts Layer */}
      <HudCalloutsOverlay visible={calloutsVisible && !isFrozen} telemetry={telemetry} />

      {/* Cyberpunk Scanlines */}
      <div className="scanlines absolute inset-0 pointer-events-none z-10" />

      {/* Top Header Bar */}
      <HeaderBar
        status={isFrozen ? 'frozen' : systemStatus}
        onToggleFreeze={() => {
          const next = !isFrozen;
          setIsFrozen(next);
          setSystemStatus(next ? 'frozen' : 'idle');
          sendFreeze(next);
        }}
        isFrozen={isFrozen}
        onOpenProactive={() => setIsProactiveOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeTheme={activeTheme}
        onChangeTheme={(th) => setActiveTheme(th)}
        activeModelName={models.find((m) => m.id === selectedModelId)?.name || 'Gemini 3.8 Flash'}
        telemetry={telemetry}
        wsConnected={wsConnected}
      />

      {/* Center Top Command HUD Layer */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-auto">
        <VoiceCommandBar
          onSendCommand={handleDispatchCommand}
          status={systemStatus}
          amplitude={voiceAmplitude}
          onBargeIn={handleBargeIn}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          thoughtSteps={thoughtSteps}
          terminalLines={terminalLines}
        />

        {/* AI Response Bubble */}
        {lastSpeechResponse && (
          <div className="mt-2 p-3 rounded-lg bg-[#071322]/95 border border-cyan-400/40 text-xs shadow-[0_0_15px_rgba(0,255,200,0.15)] flex flex-col gap-1 max-h-36 overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold border-b border-cyan-500/20 pb-1">
              <span>QUEEN RESPONSE:</span>
              <button
                onClick={() => setLastSpeechResponse('')}
                className="text-slate-400 hover:text-cyan-300 cursor-pointer text-[9px]"
              >
                DISMISS
              </button>
            </div>
            <p className="text-cyan-100 leading-relaxed text-[11px] font-mono">
              {lastSpeechResponse}
            </p>
          </div>
        )}
      </div>

      {/* Tabbed Overlays (Dock-driven, non-occluding viewport) */}
      {!isDockCollapsed && activeTab !== 'overview' && (
        <div className="absolute top-[185px] sm:top-48 bottom-22 sm:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-6xl px-3 sm:px-4 z-30 pointer-events-auto overflow-y-auto pb-4">
          <div className="p-3 sm:p-4 rounded-xl bg-[#060f1b]/95 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,255,200,0.2)]">
            {/* 1. Dev & Infra Widgets */}
            {activeTab === 'dev_infra' && (
              <div className="flex flex-col gap-4">
                <TradingServerWidget telemetry={telemetry} trades={tradeEvents} />
                <DevOpsInfraWidgets telemetry={telemetry} />
              </div>
            )}

            {/* 2. Trading & Finance Widgets */}
            {activeTab === 'trading_finance' && (
              <div className="flex flex-col gap-4">
                <TradingServerWidget telemetry={telemetry} trades={tradeEvents} />
                <TradingFinanceWidgets externalTrades={tradeEvents} />
              </div>
            )}

            {/* 3. Comms & Intel Widgets */}
            {activeTab === 'comms_intel' && <CommsIntelWidgets />}

            {/* 4. Executive & Life Hub Widgets */}
            {activeTab === 'executive_tools' && <ExecutiveLifeWidgets />}

            {/* 5. Swarm & Skills Widgets */}
            {activeTab === 'swarm_skills' && (
              <div className="flex flex-col gap-4">
                <AgentSwarmWidget
                  agents={agents}
                  tasks={tasks}
                  activeAgentId={activeAgentId}
                  onSelectAgent={(id) => setActiveAgentId(id)}
                  onSpawnTask={(id, t) => {
                    setActiveAgentId(id);
                    handleDispatchCommand(t);
                  }}
                />
                <SkillsHarnessWidgets />
              </div>
            )}

            {/* 6. Multi-LLM Routing Pool */}
            {activeTab === 'models' && (
              <ModelStatusWidget
                models={models}
                selectedModelId={selectedModelId}
                onSelectModel={(id) => setSelectedModelId(id)}
                isFreeMode={isFreeMode}
                onToggleFreeMode={() => setIsFreeMode(!isFreeMode)}
              />
            )}

            {/* 7. Task Kanban Board */}
            {activeTab === 'tasks' && (
              <TasksWidget
                tasks={tasks}
                onMoveTask={(id, st) => {
                  setTasks((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, status: st } : t))
                  );
                  sendTaskUpdate(id, st);
                }}
                onTriggerReview={(task) => {
                  const rev = createSimulatedAdversarialReview(
                    task.title,
                    task.title.toLowerCase().includes('deploy') ? 'deploy' : 'shell_exec',
                    task.description,
                    task.assignedAgent
                  );
                  setActiveReview(rev);
                }}
                onAddTask={() => {
                  const title = prompt('Enter Task Title:');
                  if (title) {
                    const newTask: TaskItem = {
                      id: 'task_' + Math.random().toString(36).substring(2, 8),
                      title,
                      description: 'Custom user command scheduled for agent execution.',
                      status: 'todo',
                      assignedAgent: activeAgentId,
                      priority: 'medium',
                      requiresReview: title.toLowerCase().includes('deploy') || title.toLowerCase().includes('trade'),
                      tags: ['user_task', activeAgentId],
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    };
                    setTasks((prev) => [newTask, ...prev]);
                  }
                }}
              />
            )}

            {/* 8. Memory Vault */}
            {activeTab === 'memory' && (
              <MemoryWidget
                memories={memories}
                onAddMemory={(mem) => setMemories((prev) => [mem, ...prev])}
              />
            )}
          </div>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <BottomControlDock
        isCollapsed={isDockCollapsed}
        onToggleCollapse={() => setIsDockCollapsed(!isDockCollapsed)}
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        onResetCamera={() => {
          playSound('chirp');
        }}
        pendingApprovalsCount={tasks.filter((t) => t.status === 'review').length}
        calloutsVisible={calloutsVisible}
        onToggleCallouts={() => setCalloutsVisible(!calloutsVisible)}
      />

      {/* Adversarial Review Modal (Anti-Hallucination Gate) */}
      {activeReview && (
        <AdversarialModal
          review={activeReview}
          onApprove={(receipt) => {
            setAuditReceipts((prev) => [receipt, ...prev]);
            sendApprovalDecision(activeReview.actionTitle, 'approved', receipt);
            setActiveReview(null);
            setSystemStatus('acting');
            setTasks((prev) =>
              prev.map((t) =>
                t.title === activeReview.actionTitle ? { ...t, status: 'done' } : t
              )
            );
            speakText(`Adversarial consensus approved action: ${activeReview.actionTitle}. Receipt logged.`);
          }}
          onReject={(receipt) => {
            setAuditReceipts((prev) => [receipt, ...prev]);
            sendApprovalDecision(activeReview.actionTitle, 'rejected', receipt);
            setActiveReview(null);
            setSystemStatus('idle');
            speakText(`Action ${activeReview.actionTitle} rejected by user. Logged to immutable audit trail.`);
          }}
          onClose={() => {
            setActiveReview(null);
            setSystemStatus('idle');
          }}
        />
      )}

      {/* Proactive Works Drawer */}
      <ProactiveWorksDrawer
        isOpen={isProactiveOpen}
        onClose={() => setIsProactiveOpen(false)}
        onExecuteWork={handleExecuteProactive}
      />
    </div>
  );
}
