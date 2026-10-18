import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyTaskComplexity, requiresAdversarialApproval, routeTaskToModel } from './router.ts';
import { calculateConsensusScore, evaluateAdversarialVerdict, detectHallucinationFlags, generateAuditReceipt, createSimulatedAdversarialReview } from './adversarial.ts';
import { redactSecretsAndPII, searchMemories, INITIAL_MEMORIES } from './memory.ts';
import type { ReviewerCritique } from './types.ts';

test('router correctly classifies task complexity', () => {
  assert.equal(classifyTaskComplexity('hello'), 'Trivial');
  assert.equal(classifyTaskComplexity('calculate 15 percent of 240'), 'Trivial');
  assert.equal(classifyTaskComplexity('summarize the morning news articles'), 'Small');
  assert.equal(classifyTaskComplexity('fix the null pointer exception in the auth middleware typescript function'), 'Coding');
  assert.equal(classifyTaskComplexity('deploy v2.4 to production cluster'), 'Agentic');
  assert.equal(classifyTaskComplexity('analyze deep competitor strategy and economic forecast across 5 dimensions with thorough pros and cons breakdown and comparison table'), 'Heavy');
});

test('router detects actions requiring adversarial approval', () => {
  assert.equal(requiresAdversarialApproval('deploy to production'), true);
  assert.equal(requiresAdversarialApproval('execute trade 0.5 btc'), true);
  assert.equal(requiresAdversarialApproval('delete user database records'), true);
  assert.equal(requiresAdversarialApproval('what is the weather today?'), false);
  assert.equal(requiresAdversarialApproval('explain quantum computing'), false);
});

test('routeTaskToModel routes free mode to zero-cost models', () => {
  const decision = routeTaskToModel('quick ping', true);
  assert.equal(decision.selectedModel, 'phi-4');
  assert.equal(decision.isFreeTierEligible, true);
  assert.equal(decision.estimatedCostUsd, 0);
});

test('adversarial review calculates weighted consensus score', () => {
  const critiques: ReviewerCritique[] = [
    {
      modelId: 'm1',
      modelName: 'Claude',
      role: 'proponent',
      verdict: 'FOR',
      confidence: 90,
      risks: [],
      hallucinationFlags: [],
      arguments: ['LGTM'],
      evidence: []
    },
    {
      modelId: 'm2',
      modelName: 'GPT-4o',
      role: 'security_critic',
      verdict: 'FOR',
      confidence: 85,
      risks: [],
      hallucinationFlags: [],
      arguments: ['Security checks pass'],
      evidence: []
    },
    {
      modelId: 'm3',
      modelName: 'Gemini',
      role: 'fact_auditor',
      verdict: 'FOR',
      confidence: 95,
      risks: [],
      hallucinationFlags: [],
      arguments: ['All facts grounded'],
      evidence: []
    }
  ];

  const score = calculateConsensusScore(critiques);
  assert.ok(score >= 70, `Expected score >= 70, got ${score}`);

  const verdict = evaluateAdversarialVerdict(critiques);
  assert.equal(verdict.recommendation, 'APPROVE');
  assert.equal(verdict.hallucinationDetected, false);
});

test('anti-hallucination firewall blocks action when hallucination is flagged', () => {
  const critiquesWithHallucination: ReviewerCritique[] = [
    {
      modelId: 'm1',
      modelName: 'Claude',
      role: 'proponent',
      verdict: 'FOR',
      confidence: 90,
      risks: [],
      hallucinationFlags: [],
      arguments: ['Ready'],
      evidence: []
    },
    {
      modelId: 'm2',
      modelName: 'Gemini',
      role: 'fact_auditor',
      verdict: 'AGAINST',
      confidence: 99,
      risks: ['Unverified claim'],
      hallucinationFlags: ['Hallucinated non-existent database endpoint URL'],
      arguments: ['Host cannot be resolved in DNS'],
      evidence: []
    }
  ];

  assert.equal(detectHallucinationFlags(critiquesWithHallucination), true);
  const verdict = evaluateAdversarialVerdict(critiquesWithHallucination);
  assert.equal(verdict.recommendation, 'REJECT');
  assert.equal(verdict.hallucinationDetected, true);
});

test('audit receipt creates valid tamper-evident hash structure', () => {
  const review = createSimulatedAdversarialReview('Deploy v2.1', 'deploy', 'Rolling out production build');
  const receipt = generateAuditReceipt(review, 'approved', '0xabc123');

  assert.ok(receipt.receiptId.startsWith('rcpt_'));
  assert.equal(receipt.prevHash, '0xabc123');
  assert.ok(receipt.hash.startsWith('0x'));
  assert.equal(receipt.userDecision, 'approved');
});

test('memory redacts API keys, emails, and secrets', () => {
  const sensitiveText = 'Contact alice@example.com with key sk-123456789012345678901234 and password="superSecretPass123" at 192.168.1.50';
  const { redactedText, redactedCount } = redactSecretsAndPII(sensitiveText);

  assert.ok(redactedCount >= 3, `Expected at least 3 redacted items, got ${redactedCount}`);
  assert.ok(!redactedText.includes('alice@example.com'));
  assert.ok(!redactedText.includes('sk-123456789012345678901234'));
  assert.ok(!redactedText.includes('superSecretPass123'));
  assert.ok(!redactedText.includes('192.168.1.50'));
  assert.ok(redactedText.includes('[REDACTED_EMAIL]'));
  assert.ok(redactedText.includes('[REDACTED_API_KEY]'));
});

test('memory search ranks by relevance and tags', () => {
  const results = searchMemories('trading btc', INITIAL_MEMORIES);
  assert.ok(results.length > 0);
  assert.equal(results[0].category, 'trade');
});

test('isAgentHandlingHighPriorityTask detects high/critical tasks accurately', async () => {
  const { isAgentHandlingHighPriorityTask } = await import('./agents.ts');

  const testAgent = {
    id: 'pr_reviewer' as const,
    name: 'PR Reviewer',
    role: 'Audit',
    primaryModels: ['Claude 3.7'],
    skills: ['pr_review'],
    status: 'acting' as const,
    currentTask: 'Review Staging PR #42 (CVE Patch) [High Priority]',
  };

  const tasksList = [
    {
      id: 'task_1',
      title: 'Review PR',
      description: 'Audit CVE',
      status: 'review' as const,
      assignedAgent: 'pr_reviewer' as const,
      priority: 'high' as const,
      requiresReview: true,
      tags: ['security'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'task_2',
      title: 'Low task',
      description: 'General doc update',
      status: 'in_progress' as const,
      assignedAgent: 'coder' as const,
      priority: 'low' as const,
      requiresReview: false,
      tags: ['doc'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  assert.equal(isAgentHandlingHighPriorityTask(testAgent, tasksList), true);

  const idleAgent = {
    id: 'coder' as const,
    name: 'Coder',
    role: 'Code',
    primaryModels: ['GPT-4o'],
    skills: ['code'],
    status: 'idle' as const,
    currentTask: 'Idle',
  };
  assert.equal(isAgentHandlingHighPriorityTask(idleAgent, tasksList), false);
});

