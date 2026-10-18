import React from 'react';
import { CheckSquare, Clock, AlertCircle, ShieldCheck, ArrowRight, Plus } from 'lucide-react';
import { TaskItem, AgentId } from '../lib/types.ts';
import { playSound } from '../lib/soundFx.ts';

interface TasksWidgetProps {
  tasks: TaskItem[];
  onMoveTask: (taskId: string, newStatus: TaskItem['status']) => void;
  onTriggerReview: (task: TaskItem) => void;
  onAddTask: () => void;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({
  tasks,
  onMoveTask,
  onTriggerReview,
  onAddTask,
}) => {
  const columns: { id: TaskItem['status']; label: string; color: string }[] = [
    { id: 'todo', label: 'TO DO', color: 'border-slate-600 text-slate-300' },
    { id: 'in_progress', label: 'IN PROGRESS', color: 'border-cyan-500 text-cyan-300' },
    { id: 'review', label: 'ADVERSARIAL GATE', color: 'border-amber-500 text-amber-300' },
    { id: 'done', label: 'COMPLETED & AUDITED', color: 'border-emerald-500 text-emerald-300' },
  ];

  const getPriorityBadge = (p: TaskItem['priority']) => {
    switch (p) {
      case 'critical': return 'bg-red-950 text-red-300 border-red-500/50';
      case 'high': return 'bg-amber-950 text-amber-300 border-amber-500/50';
      case 'medium': return 'bg-cyan-950 text-cyan-300 border-cyan-500/50';
      default: return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-cyan-200">TASK ORCHESTRATION BOARD</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            {tasks.length} TASKS TRACKED
          </span>
        </div>

        <button
          onClick={() => {
            playSound('beep');
            onAddTask();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 cursor-pointer text-[10px] font-bold"
        >
          <Plus className="w-3 h-3" />
          <span>NEW TASK</span>
        </button>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="p-2.5 rounded-lg bg-[#06101c]/90 border border-cyan-500/20 flex flex-col gap-2 min-h-[220px]"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-1.5 border-b border-cyan-500/15 ${col.color}`}>
                <span className="font-bold text-[11px] tracking-wider">{col.label}</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[9px] font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Items */}
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] scrollbar-thin">
                {colTasks.length === 0 ? (
                  <div className="text-[10px] text-slate-500 text-center py-6 font-mono">
                    No tasks in queue
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded bg-[#091728] border border-cyan-500/20 hover:border-cyan-400/50 flex flex-col gap-1.5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.2 rounded border text-[8.5px] font-bold uppercase ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-[9px] text-cyan-400 font-bold">
                          {task.assignedAgent.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="font-bold text-cyan-100 text-[11px] leading-snug">
                        {task.title}
                      </h4>
                      <p className="text-[9.5px] text-cyan-400/70 line-clamp-2">
                        {task.description}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-cyan-500/10 text-[9px]">
                        {task.status === 'review' ? (
                          <button
                            onClick={() => {
                              playSound('alert');
                              onTriggerReview(task);
                            }}
                            className="w-full py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>LAUNCH REVIEW</span>
                          </button>
                        ) : (
                          <>
                            <span className="text-slate-500 text-[8.5px]">
                              {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            {task.status !== 'done' && (
                              <button
                                onClick={() => {
                                  playSound('chirp');
                                  const nextStatus = task.status === 'todo' ? 'in_progress' : task.requiresReview ? 'review' : 'done';
                                  onMoveTask(task.id, nextStatus);
                                }}
                                className="flex items-center gap-0.5 text-cyan-300 hover:text-cyan-100 cursor-pointer"
                              >
                                <span>ADVANCE</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
