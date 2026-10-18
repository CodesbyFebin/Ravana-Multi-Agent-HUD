import { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  SystemTelemetry, 
  ModelMetadata, 
  TradeEvent, 
  AdversarialReview, 
  AuditReceipt, 
  AgentId, 
  AgentStatus, 
  TaskItem,
  WebSocketServerEvent, 
  WebSocketClientEvent 
} from './types.ts';
import { INITIAL_MODEL_POOL } from './router.ts';

export interface ThoughtStepItem {
  id: string;
  text: string;
  highlight?: string;
  timestamp: number;
}

export interface TerminalLogLine {
  id: string;
  lineType: 'prompt' | 'cmd' | 'output' | 'success' | 'warn' | 'error';
  text: string;
  timestamp: number;
}

export function useNexusWebSocket() {
  const [connected, setConnected] = useState(false);
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [models, setModels] = useState<ModelMetadata[]>(INITIAL_MODEL_POOL);
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([]);
  const [thoughtSteps, setThoughtSteps] = useState<ThoughtStepItem[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLogLine[]>([]);
  const [activeReview, setActiveReview] = useState<AdversarialReview | null>(null);
  const [latestResponse, setLatestResponse] = useState<{
    prompt: string;
    text: string;
    agentId: AgentId;
    modelUsed: string;
  } | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [serverVoiceAmplitude, setServerVoiceAmplitude] = useState<number>(0);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, { status: AgentStatus; currentTask?: string }>>({});

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const isHttps = window.location.protocol === 'https:';
      const protocol = isHttps ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/live`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onclose = () => {
        setConnected(false);
        // Exponential backoff or 3s retry
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketServerEvent = JSON.parse(event.data);

          switch (data.type) {
            case 'system_connected':
              if (data.telemetry) setTelemetry(data.telemetry);
              setTerminalLines((prev) => [
                {
                  id: Math.random().toString(36).substring(2, 9),
                  lineType: 'output',
                  text: data.message,
                  timestamp: data.timestamp,
                },
                ...prev.slice(0, 50),
              ]);
              break;

            case 'telemetry_update':
              setTelemetry(data.telemetry);
              break;

            case 'model_status':
              setModels(data.models);
              break;

            case 'agent_status':
              setAgentStatuses((prev) => ({
                ...prev,
                [data.agentId]: {
                  status: data.status,
                  currentTask: data.currentTask,
                },
              }));
              break;

            case 'thought_step':
              setThoughtSteps((prev) => [
                {
                  id: Math.random().toString(36).substring(2, 9),
                  text: data.text,
                  highlight: data.highlight,
                  timestamp: data.timestamp,
                },
                ...prev.slice(0, 20),
              ]);
              break;

            case 'terminal_line':
              setTerminalLines((prev) => [
                {
                  id: Math.random().toString(36).substring(2, 9),
                  lineType: data.lineType,
                  text: data.text,
                  timestamp: Date.now(),
                },
                ...prev.slice(0, 50),
              ]);
              break;

            case 'trade_event':
              setTradeEvents((prev) => [data.trade, ...prev.slice(0, 40)]);
              break;

            case 'approval_request':
              setActiveReview(data.review);
              break;

            case 'voice_amplitude':
              setServerVoiceAmplitude(data.amplitude);
              break;

            case 'freeze_state':
              setIsFrozen(data.frozen);
              break;

            case 'command_response':
              setLatestResponse({
                prompt: data.prompt,
                text: data.text,
                agentId: data.agentId,
                modelUsed: data.modelUsed,
              });
              break;

            default:
              break;
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    } catch (e) {
      console.warn('Could not initialize WebSocket:', e);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendEvent = useCallback((event: WebSocketClientEvent) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(event));
      return true;
    }
    return false;
  }, []);

  const sendUserCommand = useCallback(
    (prompt: string, agentId: AgentId = 'queen', options: Record<string, unknown> = {}) => {
      sendEvent({
        type: 'user_command',
        prompt,
        agentId,
        options,
      });
    },
    [sendEvent]
  );

  const sendFreeze = useCallback(
    (frozen: boolean) => {
      setIsFrozen(frozen);
      sendEvent({
        type: 'freeze',
        frozen,
      });
    },
    [sendEvent]
  );

  const sendApprovalDecision = useCallback(
    (reviewId: string, decision: 'approved' | 'rejected', receipt?: AuditReceipt) => {
      sendEvent({
        type: 'approval_decision',
        reviewId,
        decision,
        receipt,
      });
    },
    [sendEvent]
  );

  const sendVoiceAmplitude = useCallback(
    (amplitude: number, state?: AgentStatus) => {
      sendEvent({
        type: 'voice_amplitude',
        amplitude,
        state,
      });
    },
    [sendEvent]
  );

  const sendTaskUpdate = useCallback(
    (taskId: string, status: TaskItem['status']) => {
      sendEvent({
        type: 'task_update',
        taskId,
        status,
      });
    },
    [sendEvent]
  );

  return {
    connected,
    telemetry,
    models,
    setModels,
    tradeEvents,
    thoughtSteps,
    terminalLines,
    activeReview,
    setActiveReview,
    latestResponse,
    clearLatestResponse: () => setLatestResponse(null),
    isFrozen,
    serverVoiceAmplitude,
    agentStatuses,
    sendUserCommand,
    sendFreeze,
    sendApprovalDecision,
    sendVoiceAmplitude,
    sendTaskUpdate,
  };
}
