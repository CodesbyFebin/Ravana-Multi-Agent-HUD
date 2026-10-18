import type { MemoryItem } from './types.ts';

export function redactSecretsAndPII(text: string): { redactedText: string; redactedCount: number } {
  let count = 0;
  let result = text;

  // Redact API Keys (e.g. sk-..., AIzaSy..., ghp_..., etc.)
  const apiKeyRegex = /\b(sk-[a-zA-Z0-9]{20,}|AIzaSy[a-zA-Z0-9_-]{33}|ghp_[a-zA-Z0-9]{36}|Bearer\s+[a-zA-Z0-9._-]{20,})\b/g;
  result = result.replace(apiKeyRegex, () => {
    count++;
    return '[REDACTED_API_KEY]';
  });

  // Redact Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  result = result.replace(emailRegex, () => {
    count++;
    return '[REDACTED_EMAIL]';
  });

  // Redact passwords or secrets in key-value formats
  const secretPattern = /(password|passwd|secret|token|private_key)\s*[:=]\s*["']?([^\s"',;]+)["']?/gi;
  result = result.replace(secretPattern, (_, key) => {
    count++;
    return `${key}: [REDACTED_SECRET]`;
  });

  // Redact IP addresses
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  result = result.replace(ipRegex, () => {
    count++;
    return '[REDACTED_IP]';
  });

  return { redactedText: result, redactedCount: count };
}

export function searchMemories(query: string, memories: MemoryItem[]): MemoryItem[] {
  if (!query.trim()) return memories;
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  return memories
    .map(mem => {
      let score = 0;
      const contentLower = mem.content.toLowerCase();
      
      // Exact substring match
      if (contentLower.includes(q)) score += 50;

      // Term matches
      for (const term of terms) {
        if (contentLower.includes(term)) score += 15;
        if (mem.tags.some(t => t.toLowerCase().includes(term))) score += 20;
        if (mem.category.toLowerCase().includes(term)) score += 10;
      }

      // Importance bonus
      score += mem.importance * 2;

      return { mem, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.mem);
}

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_1',
    content: 'User preferences: Prefers dark cyberpunk HUD theme with cyan accent (#00ffc8), audio confirmation for approvals, and 60fps damped camera.',
    rawRedactedContent: 'User preferences: Prefers dark cyberpunk HUD theme with cyan accent (#00ffc8), audio confirmation for approvals, and 60fps damped camera.',
    tags: ['preferences', 'hud', 'theme', 'audio'],
    importance: 9,
    category: 'preference',
    createdAt: Date.now() - 3600000 * 24,
    source: 'voice_loop',
    redactedItemCount: 0
  },
  {
    id: 'mem_2',
    content: 'Trading strategy: BTC long threshold set at $68,500 with max 2% portfolio risk. Dual adversarial review mandatory before executing any order.',
    rawRedactedContent: 'Trading strategy: BTC long threshold set at $68,500 with max 2% portfolio risk. Dual adversarial review mandatory before executing any order.',
    tags: ['trading', 'btc', 'risk_management', 'adversarial'],
    importance: 10,
    category: 'trade',
    createdAt: Date.now() - 3600000 * 18,
    source: 'trader_agent',
    redactedItemCount: 0
  },
  {
    id: 'mem_3',
    content: 'Server infrastructure: Production cluster on port 3000, staging blue-green deployment via Docker container with automated rollback upon 500ms latency spike.',
    rawRedactedContent: 'Server infrastructure: Production cluster on port 3000, staging blue-green deployment via Docker container with automated rollback upon 500ms latency spike.',
    tags: ['devops', 'production', 'server', 'docker'],
    importance: 8,
    category: 'server',
    createdAt: Date.now() - 3600000 * 12,
    source: 'devops_agent',
    redactedItemCount: 0
  },
  {
    id: 'mem_4',
    content: 'Security protocol: No destructive action or external API mutation permitted without 3-LLM debate consensus (>= 70% confidence) and zero hallucination flags.',
    rawRedactedContent: 'Security protocol: No destructive action or external API mutation permitted without 3-LLM debate consensus (>= 70% confidence) and zero hallucination flags.',
    tags: ['security', 'anti_hallucination', 'firewall', 'queen'],
    importance: 10,
    category: 'business',
    createdAt: Date.now() - 3600000 * 6,
    source: 'security_agent',
    redactedItemCount: 0
  }
];
