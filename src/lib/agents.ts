import type { AgentInfo, TaskItem } from './types.ts';

/**
 * Determines whether a given agent is currently assigned to or actively handling
 * a high-priority or critical task.
 */
export function isAgentHandlingHighPriorityTask(
  agent: AgentInfo,
  tasks: TaskItem[] = []
): boolean {
  // 1. Check tasks array for active high or critical tasks assigned to this agent
  if (tasks.length > 0) {
    const hasActiveHighTask = tasks.some(
      (t) =>
        t.assignedAgent === agent.id &&
        (t.priority === 'high' || t.priority === 'critical') &&
        t.status !== 'done'
    );
    if (hasActiveHighTask) return true;
  }

  // 2. Check agent's activeTaskId if specified
  if (agent.activeTaskId && tasks.length > 0) {
    const activeTask = tasks.find((t) => t.id === agent.activeTaskId);
    if (
      activeTask &&
      (activeTask.priority === 'high' || activeTask.priority === 'critical') &&
      activeTask.status !== 'done'
    ) {
      return true;
    }
  }

  // 3. Check agent's currentTask string for priority keywords
  if (agent.currentTask) {
    const lower = agent.currentTask.toLowerCase();
    if (
      lower.includes('high priority') ||
      lower.includes('critical') ||
      lower.includes('urgent') ||
      lower.includes('cve') ||
      lower.includes('p0') ||
      lower.includes('p1')
    ) {
      return true;
    }
  }

  return false;
}
