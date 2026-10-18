export type AgentId = 
  | 'queen' 
  | 'coder' 
  | 'pr_reviewer' 
  | 'devops' 
  | 'trader' 
  | 'social' 
  | 'researcher' 
  | 'scheduler' 
  | 'security' 
  | 'comms';

export type AgentStatus = 'idle' | 'listening' | 'thinking' | 'acting' | 'debating' | 'frozen';

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  primaryModels: string[];
  skills: string[];
  status: AgentStatus;
  currentTask?: string;
  activeTaskId?: string;
}

export type TaskComplexity = 'Trivial' | 'Small' | 'Medium' | 'Heavy' | 'Coding' | 'Agentic';

export interface ModelMetadata {
  id: string;
  name: string;
  provider: 'Google' | 'OpenAI' | 'Anthropic' | 'xAI' | 'DeepSeek' | 'Ollama' | 'OpenRouter';
  role: string;
  isFreeTier: boolean;
  costPer1k: number;
  latencyMs: number;
  tokensUsedToday: number;
  status: 'online' | 'busy' | 'offline' | 'degraded';
  contextWindow: string;
  capabilities: string[];
}

export interface RoutingDecision {
  taskId: string;
  complexity: TaskComplexity;
  selectedModel: string;
  fallbackModels: string[];
  requiresAdversarialReview: boolean;
  estimatedCostUsd: number;
  reasoning: string;
  isFreeTierEligible: boolean;
  timestamp: number;
}

export interface ReviewerCritique {
  modelId: string;
  modelName: string;
  role: 'proponent' | 'security_critic' | 'fact_auditor';
  verdict: 'FOR' | 'AGAINST' | 'NEEDS_CHANGES';
  confidence: number; // 0-100
  risks: string[];
  hallucinationFlags: string[];
  arguments: string[];
  evidence: string[];
}

export interface AdversarialReview {
  id: string;
  actionTitle: string;
  actionType: 'deploy' | 'execute_trade' | 'file_write' | 'shell_exec' | 'send_email' | 'post_social' | 'delete_data';
  details: string;
  proposedByAgent: AgentId;
  consensusScore: number; // 0-100
  status: 'pending' | 'approved' | 'rejected' | 'blocked_hallucination';
  recommendation: 'APPROVE' | 'REJECT' | 'ESCALATE';
  critiques: ReviewerCritique[];
  hallucinationDetected: boolean;
  forArguments: string[];
  againstArguments: string[];
  timestamp: number;
  receiptHash?: string;
  userDecision?: 'approved' | 'rejected';
  userDecisionTime?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignedAgent: AgentId;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresReview: boolean;
  reviewId?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MemoryItem {
  id: string;
  content: string;
  rawRedactedContent: string;
  tags: string[];
  importance: number; // 1-10
  category: 'preference' | 'conversation' | 'business' | 'server' | 'trade' | 'code';
  createdAt: number;
  source: string;
  redactedItemCount: number;
}

export interface AuditReceipt {
  receiptId: string;
  timestamp: number;
  action: string;
  agent: AgentId;
  modelsUsed: string[];
  debateTranscript: string;
  verdict: string;
  userDecision: string;
  prevHash: string;
  hash: string;
}

export interface ProactiveSuggestion {
  id: string;
  title: string;
  summary: string;
  category: 'brief' | 'pr' | 'server' | 'trading' | 'social' | 'security' | 'health';
  urgency: 'low' | 'medium' | 'high';
  suggestedAction: string;
  needsApproval: boolean;
  agent: AgentId;
  mcpSource: string;
}

export interface SystemTelemetry {
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  networkSpeedMbps: number;
  latencyMs: number;
  heapUsageMb: number;
  uptimeSec: number;
  costTodayUsd: number;
  tokensPerHour: number;
  activeClients: number;
  circuitStatus: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  timestamp: number;
}

export interface TradeEvent {
  time: string;
  side: 'buy' | 'sell';
  pair: string;
  price: string;
  pnl: string;
}

export type WebSocketServerEvent =
  | { type: 'system_connected'; message: string; timestamp: number; telemetry?: SystemTelemetry }
  | { type: 'telemetry_update'; telemetry: SystemTelemetry }
  | { type: 'model_status'; models: ModelMetadata[] }
  | { type: 'agent_status'; agentId: AgentId; status: AgentStatus; currentTask?: string }
  | { type: 'thought_step'; text: string; highlight?: string; timestamp: number }
  | { type: 'terminal_line'; lineType: 'prompt' | 'cmd' | 'output' | 'success' | 'warn' | 'error'; text: string }
  | { type: 'trade_event'; trade: TradeEvent }
  | { type: 'approval_request'; review: AdversarialReview }
  | { type: 'approval_decision'; receipt: AuditReceipt }
  | { type: 'voice_state'; state: AgentStatus; amplitude?: number }
  | { type: 'voice_amplitude'; amplitude: number; state?: AgentStatus }
  | { type: 'barge_in'; message: string }
  | { type: 'freeze_state'; frozen: boolean }
  | { type: 'command_response'; prompt: string; text: string; agentId: AgentId; modelUsed: string };

export type WebSocketClientEvent =
  | { type: 'user_command'; prompt: string; agentId?: AgentId; options?: Record<string, unknown> }
  | { type: 'voice_state'; state: AgentStatus }
  | { type: 'voice_amplitude'; amplitude: number; state?: AgentStatus }
  | { type: 'barge_in' }
  | { type: 'freeze'; frozen: boolean }
  | { type: 'approval_decision'; reviewId: string; decision: 'approved' | 'rejected'; receipt?: AuditReceipt }
  | { type: 'task_update'; taskId: string; status: TaskItem['status'] };

