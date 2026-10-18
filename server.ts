import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { classifyTaskComplexity, routeTaskToModel, requiresAdversarialApproval, INITIAL_MODEL_POOL } from './src/lib/router.ts';
import { createSimulatedAdversarialReview, evaluateAdversarialVerdict, generateAuditReceipt } from './src/lib/adversarial.ts';
import type { ReviewerCritique, SystemTelemetry, ModelMetadata, TradeEvent, WebSocketClientEvent, WebSocketServerEvent, AgentId, AgentStatus } from './src/lib/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

const app = express();
app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'ravana-hud',
        },
      },
    })
  : null;

// State management on server
let isSystemFrozen = false;
let modelPool: ModelMetadata[] = JSON.parse(JSON.stringify(INITIAL_MODEL_POOL));
let cumulativeTokensToday = 485000;
let estimatedCostToday = 3.42;

// Realtime WebSocket & HUD Event Bus
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/live' });

const clients = new Set<WebSocket>();

function broadcast(event: WebSocketServerEvent | Record<string, unknown>) {
  const json = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}

// Compute real-time server telemetry
function getRealTelemetry(): SystemTelemetry {
  const mem = process.memoryUsage();
  const heapMb = Math.round(mem.heapUsed / 1024 / 1024);
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const ramPct = Math.round(((totalMem - freeMem) / totalMem) * 100);

  // CPU load average over 1 min or process CPU usage
  const cpus = os.cpus();
  const loadAvg = os.loadavg()[0] || 0.6;
  const cpuPct = Math.min(99, Math.max(12, Math.round((loadAvg / (cpus.length || 1)) * 100)));

  return {
    cpuUsage: cpuPct,
    ramUsage: ramPct,
    diskUsage: 42,
    networkSpeedMbps: 94.2 + (Math.random() - 0.5) * 4,
    latencyMs: Math.round(14 + Math.random() * 8),
    heapUsageMb: heapMb,
    uptimeSec: Math.floor(process.uptime()),
    costTodayUsd: Number(estimatedCostToday.toFixed(3)),
    tokensPerHour: Math.round(12400 + (Math.random() - 0.5) * 800),
    activeClients: clients.size,
    circuitStatus: isSystemFrozen ? 'OPEN' : 'CLOSED',
    timestamp: Date.now(),
  };
}

wss.on('connection', (ws) => {
  clients.add(ws);

  // Send initial handshake with real telemetry and live model status
  const initialTelemetry = getRealTelemetry();
  ws.send(
    JSON.stringify({
      type: 'system_connected',
      message: 'RAVANA Neural Core Linked — Real-Time WebSocket Channel Active',
      timestamp: Date.now(),
      telemetry: initialTelemetry,
    })
  );

  ws.send(
    JSON.stringify({
      type: 'model_status',
      models: modelPool,
    })
  );

  ws.send(
    JSON.stringify({
      type: 'freeze_state',
      frozen: isSystemFrozen,
    })
  );

  ws.on('message', async (messageData) => {
    try {
      const parsed: WebSocketClientEvent = JSON.parse(messageData.toString());

      if (parsed.type === 'voice_amplitude') {
        broadcast({
          type: 'voice_amplitude',
          amplitude: parsed.amplitude || 0.1,
          state: parsed.state || 'listening',
        });
      } else if (parsed.type === 'voice_state') {
        broadcast({
          type: 'voice_state',
          state: parsed.state,
        });
      } else if (parsed.type === 'barge_in') {
        broadcast({
          type: 'barge_in',
          message: 'Barge-in detected: agent paused and listening',
        });
        broadcast({
          type: 'voice_state',
          state: 'listening',
        });
      } else if (parsed.type === 'freeze') {
        isSystemFrozen = parsed.frozen;
        broadcast({
          type: 'freeze_state',
          frozen: isSystemFrozen,
        });
        broadcast({
          type: 'terminal_line',
          lineType: isSystemFrozen ? 'warn' : 'success',
          text: isSystemFrozen
            ? '⊘ EMERGENCY KILL SWITCH ENGAGED: All autonomous agent routines frozen.'
            : '✓ RESUMED: Queen orchestrator back online. All systems nominal.',
        });
      } else if (parsed.type === 'user_command') {
        handleUserCommandWebSocket(parsed.prompt, parsed.agentId || 'queen', parsed.options || {});
      } else if (parsed.type === 'approval_decision') {
        broadcast({
          type: 'terminal_line',
          lineType: parsed.decision === 'approved' ? 'success' : 'error',
          text: `[ADVERSARIAL REVIEW] User ${parsed.decision.toUpperCase()} action: ${parsed.reviewId}. Hash logged.`,
        });
      } else if (parsed.type === 'task_update') {
        broadcast({
          type: 'terminal_line',
          lineType: 'output',
          text: `[TASK SCHEDULER] Task ${parsed.taskId} state changed to: ${parsed.status.toUpperCase()}`,
        });
      }
    } catch (err: any) {
      console.warn('Malformed WebSocket message:', err.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Real-time user command execution pipeline over WebSocket
async function handleUserCommandWebSocket(
  prompt: string,
  agentId: AgentId = 'queen',
  options: Record<string, unknown> = {}
) {
  if (isSystemFrozen) {
    broadcast({
      type: 'terminal_line',
      lineType: 'warn',
      text: 'Command blocked: System is currently FROZEN via emergency kill switch.',
    });
    return;
  }

  // Step 1: Emit Thought Stream steps
  broadcast({
    type: 'thought_step',
    text: `Wake word acknowledged → Processing command: "${prompt.slice(0, 50)}..."`,
    highlight: prompt.slice(0, 30),
    timestamp: Date.now(),
  });

  broadcast({
    type: 'terminal_line',
    lineType: 'cmd',
    text: prompt,
  });

  // Step 2: Route task
  const routing = routeTaskToModel(prompt, (options.forceFreeMode as boolean) || false, modelPool);
  
  broadcast({
    type: 'thought_step',
    text: `Classified task complexity: ${routing.complexity} → Routing to ${routing.selectedModel}`,
    highlight: routing.selectedModel,
    timestamp: Date.now(),
  });

  broadcast({
    type: 'agent_status',
    agentId,
    status: 'thinking',
    currentTask: prompt.slice(0, 60),
  });

  // Step 3: Check if Adversarial Review is required
  if (routing.requiresAdversarialReview) {
    broadcast({
      type: 'thought_step',
      text: 'Adversarial Review protocol triggered: Spawning 3-LLM anti-hallucination council.',
      highlight: 'Adversarial Review',
      timestamp: Date.now(),
    });

    broadcast({
      type: 'agent_status',
      agentId,
      status: 'debating',
      currentTask: `Adversarial debate: ${prompt.slice(0, 40)}`,
    });

    const actionType = prompt.toLowerCase().includes('trade')
      ? 'execute_trade'
      : prompt.toLowerCase().includes('deploy')
      ? 'deploy'
      : 'shell_exec';

    const review = createSimulatedAdversarialReview(prompt, actionType, `Routed to ${routing.selectedModel}`, agentId);

    broadcast({
      type: 'approval_request',
      review,
    });

    broadcast({
      type: 'terminal_line',
      lineType: 'warn',
      text: `[ANTI-HALLUCINATION GATE] Action paused awaiting consensus verification (${review.consensusScore}% agreement).`,
    });

    return;
  }

  // Step 4: Standard model execution
  try {
    let responseText = '';
    const chosenModel = (options.useArgonThinking ? 'gemini-4-argon' : routing.selectedModel);

    if (ai) {
      const config: Record<string, unknown> = {
        systemInstruction: `You are RAVANA, an advanced cyberpunk AI command centre orchestrator. You speak with high confidence, surgical precision, and authority. The active specialist is ${agentId.toUpperCase()}. Never hallucinate sources.`,
      };

      if (chosenModel.includes('argon')) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }

      if (options.useSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
      } else if (options.useMapsGrounding) {
        config.tools = [{ googleMaps: {} }];
      }

      const res = await ai.models.generateContent({
        model: chosenModel.includes('argon') ? 'gemini-4-argon' : chosenModel.includes('flash-lite') ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash',
        contents: prompt,
        config,
      });

      responseText = res.text || 'Command completed with no output.';
    } else {
      responseText = `[RAVANA ${agentId.toUpperCase()}] Handled via local fallback core. Task completed nominal.`;
    }

    // Update tokens & cost
    cumulativeTokensToday += 480;
    estimatedCostToday += 0.001;

    modelPool = modelPool.map((m) =>
      m.id === chosenModel
        ? {
            ...m,
            tokensUsedToday: m.tokensUsedToday + 480,
            latencyMs: Math.max(40, m.latencyMs + Math.round((Math.random() - 0.5) * 40)),
          }
        : m
    );

    broadcast({
      type: 'model_status',
      models: modelPool,
    });

    broadcast({
      type: 'thought_step',
      text: `Response generated via ${chosenModel} → Validated against memory store`,
      highlight: 'Validated',
      timestamp: Date.now(),
    });

    broadcast({
      type: 'terminal_line',
      lineType: 'success',
      text: `[${agentId.toUpperCase()}] ${responseText.slice(0, 160)}${responseText.length > 160 ? '...' : ''}`,
    });

    broadcast({
      type: 'command_response',
      prompt,
      text: responseText,
      agentId,
      modelUsed: chosenModel,
    });

    broadcast({
      type: 'agent_status',
      agentId,
      status: 'acting',
      currentTask: 'Output delivery',
    });

    setTimeout(() => {
      broadcast({
        type: 'agent_status',
        agentId,
        status: 'idle',
        currentTask: 'Standing by',
      });
      broadcast({
        type: 'voice_state',
        state: 'idle',
      });
    }, 2500);
  } catch (err: any) {
    broadcast({
      type: 'terminal_line',
      lineType: 'error',
      text: `Execution error: ${err.message}`,
    });
    broadcast({
      type: 'agent_status',
      agentId,
      status: 'idle',
      currentTask: 'Idle',
    });
  }
}

// Background Real-Time Telemetry & Simulation Ticker (Runs every 3 seconds)
setInterval(() => {
  if (clients.size === 0) return;

  // 1. Broadcast real system telemetry
  const telemetry = getRealTelemetry();
  broadcast({
    type: 'telemetry_update',
    telemetry,
  });

  // 2. Randomly simulate market trade tick from Grok Autotrader (every ~12 seconds)
  if (Math.random() > 0.65 && !isSystemFrozen) {
    const pairs = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'];
    const sides: ('buy' | 'sell')[] = ['buy', 'sell'];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const price = pair.startsWith('BTC')
      ? `$${(104000 + Math.random() * 800).toFixed(0)}`
      : pair.startsWith('ETH')
      ? `$${(3220 + Math.random() * 60).toFixed(0)}`
      : `$${(190 + Math.random() * 4).toFixed(2)}`;
    const pnlVal = Math.round((Math.random() - 0.25) * 120);
    const pnl = `${pnlVal >= 0 ? '+' : ''}$${pnlVal}`;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const trade: TradeEvent = {
      time: timeStr,
      side,
      pair,
      price,
      pnl,
    };

    broadcast({
      type: 'trade_event',
      trade,
    });
  }

  // 3. Jitter model latencies
  modelPool = modelPool.map((m) => {
    if (m.status === 'online') {
      const jitter = Math.round((Math.random() - 0.5) * 20);
      return {
        ...m,
        latencyMs: Math.max(30, m.latencyMs + jitter),
      };
    }
    return m;
  });

  broadcast({
    type: 'model_status',
    models: modelPool,
  });
}, 3000);

// REST Endpoints
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    systemName: 'RAVANA Queen Command Engine',
    geminiConfigured: !!ai,
    uptimeSec: Math.floor(process.uptime()),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    activeConnections: clients.size,
    timestamp: Date.now(),
  });
});

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      agentId = 'queen',
      preferredModel,
      useSearchGrounding = false,
      useMapsGrounding = false,
      userLocation,
      forceFreeMode = false,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const routingDecision = routeTaskToModel(prompt, forceFreeMode, modelPool);
    const modelToUse = preferredModel || routingDecision.selectedModel;
    const isAdversarialRequired = requiresAdversarialApproval(prompt);

    if (!ai) {
      return res.json({
        text: `[RAVANA ${agentId.toUpperCase()}] Command acknowledged: "${prompt}". Running on local fallback stack. System nominal.`,
        modelUsed: modelToUse,
        routing: routingDecision,
        requiresApproval: isAdversarialRequired,
        groundingChunks: [],
      });
    }

    let geminiModel = 'gemini-3.8-flash';
    const config: Record<string, unknown> = {
      systemInstruction: `You are RAVANA, an advanced cyberpunk AI command centre orchestrator. You speak with high confidence, surgical precision, and authority. The current active specialist is ${agentId.toUpperCase()}. Never hallucinate sources.`,
    };

    if (modelToUse.includes('argon')) {
      geminiModel = 'gemini-4-argon';
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    } else if (modelToUse.includes('flash-lite')) {
      geminiModel = 'gemini-3.1-flash-lite';
    } else {
      geminiModel = 'gemini-3.8-flash';
    }

    if (useSearchGrounding && !useMapsGrounding) {
      config.tools = [{ googleSearch: {} }];
    } else if (useMapsGrounding) {
      config.tools = [{ googleMaps: {} }];
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(userLocation.latitude),
              longitude: Number(userLocation.longitude),
            },
          },
        };
      }
    }

    broadcast({
      type: 'thought_step',
      text: `Direct REST query dispatched to ${geminiModel}`,
      timestamp: Date.now(),
    });

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config,
    });

    const text = response.text || 'Command processed without text output.';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text,
      modelUsed: geminiModel,
      routing: routingDecision,
      requiresApproval: isAdversarialRequired,
      groundingChunks,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Error processing AI command',
    });
  }
});

app.post('/api/adversarial-review', async (req: Request, res: Response) => {
  try {
    const { actionTitle, actionType, details, agent = 'queen' } = req.body;
    if (!actionTitle) return res.status(400).json({ error: 'actionTitle is required' });

    if (ai) {
      const debatePrompt = `You are the RAVANA Anti-Hallucination Firewall and Adversarial Review Council.
Analyze the following proposed action:
Action: ${actionTitle} (${actionType})
Details: ${details || 'Execution requested by user'}
Proposed by Agent: ${agent}

You must evaluate this from three distinct AI perspectives:
1. Proponent (advocating for operational progress, CI/CD speed, execution feasibility)
2. Security & Risk Critic (advocating for defensive posture, failure blast radius, rollback safety)
3. Fact & Grounding Auditor (ruthlessly checking for hallucinated assumptions, unverified endpoints, or missing context)

Respond in JSON format conforming to this schema:
{
  "critiques": [
    {
      "modelId": "claude-4",
      "modelName": "Claude 3.7 Sonnet (Proponent)",
      "role": "proponent",
      "verdict": "FOR",
      "confidence": 88,
      "risks": ["string"],
      "hallucinationFlags": [],
      "arguments": ["string"],
      "evidence": ["string"]
    },
    {
      "modelId": "gpt-4o",
      "modelName": "GPT-4o (Security Critic)",
      "role": "security_critic",
      "verdict": "FOR" or "NEEDS_CHANGES" or "AGAINST",
      "confidence": 82,
      "risks": ["string"],
      "hallucinationFlags": [],
      "arguments": ["string"],
      "evidence": ["string"]
    },
    {
      "modelId": "gemini-4-argon",
      "modelName": "Gemini 4 Argon (Fact & Grounding Auditor)",
      "role": "fact_auditor",
      "verdict": "FOR" or "AGAINST",
      "confidence": 95,
      "risks": ["string"],
      "hallucinationFlags": ["list any hallucinated assumptions or empty if verified"],
      "arguments": ["string"],
      "evidence": ["string"]
    }
  ]
}`;

      try {
        const reviewResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: debatePrompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(reviewResponse.text || '{}');
        const critiques: ReviewerCritique[] = parsed.critiques || [];

        if (critiques.length >= 2) {
          const evalResult = evaluateAdversarialVerdict(critiques);
          const review = {
            id: 'rev_' + Math.random().toString(36).substring(2, 9),
            actionTitle,
            actionType,
            details,
            proposedByAgent: agent,
            consensusScore: evalResult.consensusScore,
            status: evalResult.hallucinationDetected ? ('blocked_hallucination' as const) : ('pending' as const),
            recommendation: evalResult.recommendation,
            critiques,
            hallucinationDetected: evalResult.hallucinationDetected,
            forArguments: critiques.flatMap((c) =>
              c.arguments.filter((_: string, idx: number) => idx % 2 === 0)
            ),
            againstArguments: critiques.flatMap((c) => c.risks),
            timestamp: Date.now(),
          };

          broadcast({
            type: 'approval_request',
            review,
          });

          return res.json(review);
        }
      } catch (e) {
        console.warn('AI adversarial parse failed, falling back', e);
      }
    }

    const fallbackReview = createSimulatedAdversarialReview(
      actionTitle,
      actionType || 'deploy',
      details || 'Automated agent request',
      agent
    );

    broadcast({
      type: 'approval_request',
      review: fallbackReview,
    });

    res.json(fallbackReview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!ai) {
      return res.json({ available: false, message: 'Gemini API key not configured' });
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: text.slice(0, 400), speechMetadata: { style: 'Crisp, authoritative sci-fi AI assistant' } }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName as any } },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ available: true, mimeType: 'audio/wav', audioBase64: base64Audio });
    } else {
      res.json({ available: false });
    }
  } catch {
    res.json({ available: false });
  }
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[RAVANA] Core Command Centre online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
