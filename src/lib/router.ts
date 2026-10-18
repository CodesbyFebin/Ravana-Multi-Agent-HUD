import type { TaskComplexity, RoutingDecision, ModelMetadata } from './types.ts';

export const INITIAL_MODEL_POOL: ModelMetadata[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google',
    role: 'General Tasks & Grounding Orchestration',
    isFreeTier: true,
    costPer1k: 0.0001,
    latencyMs: 380,
    tokensUsedToday: 42150,
    status: 'online',
    contextWindow: '1M tokens',
    capabilities: ['search_grounding', 'maps_grounding', 'fast_multimodal', 'voice_tts']
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon (High Thinking)',
    provider: 'Google',
    role: 'Deep Reasoning, Complex Architecture & Debate',
    isFreeTier: false,
    costPer1k: 0.0025,
    latencyMs: 920,
    tokensUsedToday: 18400,
    status: 'online',
    contextWindow: '2M tokens',
    capabilities: ['high_thinking', 'complex_math', 'code_synthesis', 'adversarial_logic']
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    provider: 'Google',
    role: 'Ultra-Fast Sub-Second Classifier',
    isFreeTier: true,
    costPer1k: 0.00005,
    latencyMs: 140,
    tokensUsedToday: 95400,
    status: 'online',
    contextWindow: '1M tokens',
    capabilities: ['ultra_fast', 'classification', 'extraction', 'sentiment']
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    role: 'Heavy Reasoning & Code Audit',
    isFreeTier: false,
    costPer1k: 0.005,
    latencyMs: 1100,
    tokensUsedToday: 26500,
    status: 'online',
    contextWindow: '128k tokens',
    capabilities: ['reasoning', 'code', 'vision']
  },
  {
    id: 'claude-4',
    name: 'Claude 3.7 / 4 Sonnet',
    provider: 'Anthropic',
    role: 'Long-Context Codebase Analysis & PR Review',
    isFreeTier: false,
    costPer1k: 0.003,
    latencyMs: 1050,
    tokensUsedToday: 31200,
    status: 'online',
    contextWindow: '200k tokens',
    capabilities: ['code_review', 'refactor', 'safety_audit']
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provider: 'DeepSeek',
    role: 'Cost-Effective Heavy Reasoning & Math',
    isFreeTier: true,
    costPer1k: 0.00028,
    latencyMs: 650,
    tokensUsedToday: 54100,
    status: 'online',
    contextWindow: '64k tokens',
    capabilities: ['math', 'code', 'fast_cot']
  },
  {
    id: 'grok-3',
    name: 'Grok-3',
    provider: 'xAI',
    role: 'Real-Time News, Social & Trading Sentiment',
    isFreeTier: false,
    costPer1k: 0.004,
    latencyMs: 820,
    tokensUsedToday: 12800,
    status: 'online',
    contextWindow: '128k tokens',
    capabilities: ['realtime_x', 'sentiment', 'market_pulse']
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B (Local)',
    provider: 'Ollama',
    role: 'Private On-Device Fallback',
    isFreeTier: true,
    costPer1k: 0.0,
    latencyMs: 420,
    tokensUsedToday: 120500,
    status: 'online',
    contextWindow: '128k tokens',
    capabilities: ['offline_private', 'zero_cost', 'local_inference']
  },
  {
    id: 'phi-4',
    name: 'Phi-4 (Local)',
    provider: 'Ollama',
    role: 'Low-Power Fast Intent Extraction',
    isFreeTier: true,
    costPer1k: 0.0,
    latencyMs: 95,
    tokensUsedToday: 210000,
    status: 'online',
    contextWindow: '16k tokens',
    capabilities: ['micro_latency', 'local_intent', 'zero_cost']
  }
];

export function classifyTaskComplexity(prompt: string): TaskComplexity {
  const p = prompt.toLowerCase();
  
  // Destructive / Action verbs
  if (
    p.includes('deploy') || 
    p.includes('execute trade') || 
    p.includes('buy ') || 
    p.includes('sell ') ||
    p.includes('delete') || 
    p.includes('drop database') ||
    p.includes('rm -rf') ||
    p.includes('shell') ||
    p.includes('restart server')
  ) {
    return 'Agentic';
  }

  // Coding tasks
  if (
    p.includes('code') || 
    p.includes('refactor') || 
    p.includes('bug') || 
    p.includes('function') || 
    p.includes('component') ||
    p.includes('pr ') || 
    p.includes('pull request') || 
    p.includes('typescript') || 
    p.includes('python') ||
    p.includes('git')
  ) {
    return 'Coding';
  }

  // Heavy reasoning or deep analysis
  if (
    p.includes('architecture') || 
    p.includes('strategy') || 
    p.includes('compare') || 
    p.includes('debate') || 
    p.includes('critique') || 
    p.includes('deep research') || 
    p.includes('forecast') ||
    p.length > 300
  ) {
    return 'Heavy';
  }

  // Trivial tasks: single calculation, time, greeting, ping
  if (
    p.includes('hello') || 
    p.includes('hey bro') || 
    p.includes('ping') || 
    p.includes('time') || 
    p.includes('calculate') ||
    p.length < 30
  ) {
    return 'Trivial';
  }

  if (p.includes('summarize') || p.includes('explain') || p.includes('what is') || p.includes('search')) {
    return 'Small';
  }

  return 'Medium';
}

export function requiresAdversarialApproval(prompt: string): boolean {
  const p = prompt.toLowerCase();
  const destructiveTriggers = [
    'deploy',
    'trade',
    'buy',
    'sell',
    'delete',
    'purge',
    'send email',
    'post to x',
    'post to linkedin',
    'shell exec',
    'rollback',
    'modify schema',
    'transfer'
  ];
  return destructiveTriggers.some(trigger => p.includes(trigger));
}

export function routeTaskToModel(
  prompt: string, 
  forceFreeMode: boolean = false, 
  availableModels: ModelMetadata[] = INITIAL_MODEL_POOL
): RoutingDecision {
  const complexity = classifyTaskComplexity(prompt);
  const requiresReview = requiresAdversarialApproval(prompt);
  const taskId = 'task_' + Math.random().toString(36).substring(2, 9);
  
  let selectedModel = 'gemini-3.8-flash';
  let fallbacks: string[] = ['llama-3.3-70b', 'phi-4'];
  let reasoning = '';

  if (forceFreeMode) {
    if (complexity === 'Trivial' || complexity === 'Small') {
      selectedModel = 'phi-4';
      fallbacks = ['gemini-3.1-flash-lite', 'llama-3.3-70b'];
      reasoning = 'Free mode active: Routed to local low-latency Phi-4 with zero token cost.';
    } else {
      selectedModel = 'gemini-3.8-flash';
      fallbacks = ['deepseek-v3', 'llama-3.3-70b'];
      reasoning = 'Free mode active: Routed to Gemini 3.8 Flash free tier with DeepSeek/Llama fallback.';
    }
  } else {
    switch (complexity) {
      case 'Trivial':
        selectedModel = 'gemini-3.1-flash-lite';
        fallbacks = ['phi-4', 'gemini-3.8-flash'];
        reasoning = 'Ultra-fast sub-second latency model for trivial classification and micro-prompts.';
        break;
      case 'Small':
        selectedModel = 'gemini-3.8-flash';
        fallbacks = ['gemini-3.1-flash-lite', 'deepseek-v3'];
        reasoning = 'Balanced speed & accuracy with native Google search/maps grounding.';
        break;
      case 'Medium':
        selectedModel = 'gemini-3.8-flash';
        fallbacks = ['deepseek-v3', 'gpt-4o'];
        reasoning = 'General intent model with rich tool grounding and fast generation.';
        break;
      case 'Heavy':
        selectedModel = 'gemini-4-argon';
        fallbacks = ['claude-4', 'gpt-4o', 'deepseek-v3'];
        reasoning = 'Deep multi-step reasoning with High Thinking Level enabled for complex problem spaces.';
        break;
      case 'Coding':
        selectedModel = 'claude-4';
        fallbacks = ['gemini-4-argon', 'gpt-4o', 'deepseek-v3'];
        reasoning = 'High-fidelity coding specialist with cross-file context and bug diagnostic precision.';
        break;
      case 'Agentic':
        selectedModel = 'gemini-4-argon';
        fallbacks = ['gpt-4o', 'claude-4'];
        reasoning = 'Critical agentic execution: High-thinking deliberation before triggering adversarial review.';
        break;
    }
  }

  // Cost estimate based on expected tokens
  const estimatedTokens = complexity === 'Trivial' ? 50 : complexity === 'Small' ? 300 : complexity === 'Medium' ? 1200 : 3500;
  const modelMeta = availableModels.find(m => m.id === selectedModel);
  const cost = ((modelMeta?.costPer1k ?? 0.0001) / 1000) * estimatedTokens;

  return {
    taskId,
    complexity,
    selectedModel,
    fallbackModels: fallbacks,
    requiresAdversarialReview: requiresReview,
    estimatedCostUsd: Number(cost.toFixed(5)),
    reasoning,
    isFreeTierEligible: modelMeta?.isFreeTier ?? false,
    timestamp: Date.now()
  };
}
