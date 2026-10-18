import type { AdversarialReview, ReviewerCritique, AgentId, AuditReceipt } from './types.ts';

export function calculateConsensusScore(critiques: ReviewerCritique[]): number {
  if (!critiques || critiques.length === 0) return 0;
  
  let score = 0;
  let totalWeight = 0;

  for (const c of critiques) {
    const weight = c.role === 'fact_auditor' ? 1.5 : c.role === 'security_critic' ? 1.2 : 1.0;
    let base = 50;
    if (c.verdict === 'FOR') base = 90;
    else if (c.verdict === 'NEEDS_CHANGES') base = 40;
    else if (c.verdict === 'AGAINST') base = 10;

    // Dampen if confidence is lower
    const confidenceFactor = c.confidence / 100;
    const modelScore = base * confidenceFactor;

    score += modelScore * weight;
    totalWeight += weight;
  }

  const normalized = Math.round(score / totalWeight);
  return Math.min(100, Math.max(0, normalized));
}

export function detectHallucinationFlags(critiques: ReviewerCritique[]): boolean {
  for (const c of critiques) {
    if (c.hallucinationFlags && c.hallucinationFlags.length > 0) {
      return true;
    }
  }
  return false;
}

export function evaluateAdversarialVerdict(critiques: ReviewerCritique[]): {
  recommendation: 'APPROVE' | 'REJECT' | 'ESCALATE';
  consensusScore: number;
  hallucinationDetected: boolean;
} {
  const consensusScore = calculateConsensusScore(critiques);
  const hallucinationDetected = detectHallucinationFlags(critiques);

  if (hallucinationDetected) {
    return {
      recommendation: 'REJECT',
      consensusScore: Math.min(consensusScore, 30),
      hallucinationDetected: true
    };
  }

  const forCount = critiques.filter(c => c.verdict === 'FOR').length;
  if (forCount >= 2 && consensusScore >= 70) {
    return {
      recommendation: 'APPROVE',
      consensusScore,
      hallucinationDetected: false
    };
  } else if (forCount === 0 || consensusScore < 40) {
    return {
      recommendation: 'REJECT',
      consensusScore,
      hallucinationDetected: false
    };
  } else {
    return {
      recommendation: 'ESCALATE',
      consensusScore,
      hallucinationDetected: false
    };
  }
}

export function generateAuditReceipt(
  review: AdversarialReview, 
  userDecision: 'approved' | 'rejected', 
  prevHash: string = '0000000000000000'
): AuditReceipt {
  const receiptId = 'rcpt_' + Math.random().toString(36).substring(2, 10);
  const modelsUsed = review.critiques.map(c => c.modelName);
  const debateTranscript = review.critiques.map(c => 
    `[${c.role.toUpperCase()} via ${c.modelName}]: ${c.verdict} (${c.confidence}%) -> ${c.arguments.join('; ')}`
  ).join('\n');

  // Simple deterministic cryptographic-like hash simulation for browser/node
  const dataToHash = `${prevHash}:${receiptId}:${review.id}:${userDecision}:${Date.now()}`;
  let hashVal = 0;
  for (let i = 0; i < dataToHash.length; i++) {
    const char = dataToHash.charCodeAt(i);
    hashVal = ((hashVal << 5) - hashVal) + char;
    hashVal |= 0;
  }
  const hash = '0x' + Math.abs(hashVal).toString(16).padStart(16, '0');

  return {
    receiptId,
    timestamp: Date.now(),
    action: review.actionTitle,
    agent: review.proposedByAgent,
    modelsUsed,
    debateTranscript,
    verdict: review.recommendation,
    userDecision,
    prevHash,
    hash
  };
}

export function createSimulatedAdversarialReview(
  actionTitle: string,
  actionType: AdversarialReview['actionType'],
  details: string,
  agent: AgentId = 'queen'
): AdversarialReview {
  const isHighRisk = actionTitle.toLowerCase().includes('delete') || actionTitle.toLowerCase().includes('trade') || actionTitle.toLowerCase().includes('prod');
  
  const critiques: ReviewerCritique[] = [
    {
      modelId: 'claude-4',
      modelName: 'Claude 3.7 Sonnet',
      role: 'proponent',
      verdict: 'FOR',
      confidence: 88,
      risks: ['Potential dependency version mismatch during build step'],
      hallucinationFlags: [],
      arguments: [
        'Pre-flight tests pass in CI staging environment',
        'Rollback script hash verified against git HEAD',
        'Operational window is optimal with low traffic volume'
      ],
      evidence: ['staging_build_log_4812.json', 'crdt_sync_state_ok']
    },
    {
      modelId: 'gpt-4o',
      modelName: 'GPT-4o (Reasoning)',
      role: 'security_critic',
      verdict: isHighRisk ? 'NEEDS_CHANGES' : 'FOR',
      confidence: isHighRisk ? 68 : 84,
      risks: [
        'Database connection pool spike during cold start',
        'Authentication token cache invalidation latency'
      ],
      hallucinationFlags: [],
      arguments: [
        'Checked ingress firewall rules; TLS 1.3 certs valid for 180 days',
        isHighRisk ? 'Recommend adding 30-second canary drain before full rollout' : 'Risk mitigated by blue-green replica topology'
      ],
      evidence: ['security_audit_spec_v3', 'rate_limit_policy']
    },
    {
      modelId: 'gemini-4-argon',
      modelName: 'Gemini 4 Argon (Fact & Grounding Auditor)',
      role: 'fact_auditor',
      verdict: 'FOR',
      confidence: 94,
      risks: ['Network latency variance across APAC edge regions'],
      hallucinationFlags: [],
      arguments: [
        'All referenced package URLs and hashes verified via upstream registry',
        'No ungrounded factual assertions detected in agent deployment rationale',
        'State transition follows zero-hallucination compliance protocol'
      ],
      evidence: ['sha256_bundle_checksums', 'upstream_dns_propagation']
    }
  ];

  const evalResult = evaluateAdversarialVerdict(critiques);

  return {
    id: 'rev_' + Math.random().toString(36).substring(2, 9),
    actionTitle,
    actionType,
    details,
    proposedByAgent: agent,
    consensusScore: evalResult.consensusScore,
    status: 'pending',
    recommendation: evalResult.recommendation,
    critiques,
    hallucinationDetected: evalResult.hallucinationDetected,
    forArguments: critiques.flatMap(c => c.arguments.filter((_, idx) => idx % 2 === 0)),
    againstArguments: critiques.flatMap(c => c.risks),
    timestamp: Date.now()
  };
}
