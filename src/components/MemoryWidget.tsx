import React, { useState } from 'react';
import { Database, Search, ShieldCheck, Tag, Plus, Check } from 'lucide-react';
import { MemoryItem } from '../lib/types.ts';
import { searchMemories, redactSecretsAndPII } from '../lib/memory.ts';
import { playSound } from '../lib/soundFx.ts';

interface MemoryWidgetProps {
  memories: MemoryItem[];
  onAddMemory: (mem: MemoryItem) => void;
}

export const MemoryWidget: React.FC<MemoryWidgetProps> = ({
  memories,
  onAddMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newContent, setNewContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredMemories = searchMemories(searchQuery, memories).filter(
    (m) => activeCategory === 'all' || m.category === activeCategory
  );

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    playSound('chirp');
    // Auto-redact secrets and PII before saving
    const { redactedText, redactedCount } = redactSecretsAndPII(newContent.trim());

    const newItem: MemoryItem = {
      id: 'mem_' + Math.random().toString(36).substring(2, 9),
      content: redactedText,
      rawRedactedContent: redactedText,
      tags: ['user_note', 'custom', activeCategory !== 'all' ? activeCategory : 'general'],
      importance: 8,
      category: (activeCategory !== 'all' ? activeCategory : 'conversation') as any,
      createdAt: Date.now(),
      source: 'user_vault',
      redactedItemCount: redactedCount,
    };

    onAddMemory(newItem);
    setNewContent('');
    setShowAddForm(false);
  };

  const categories = [
    { id: 'all', label: 'ALL MEMORIES' },
    { id: 'preference', label: 'PREFERENCES' },
    { id: 'trade', label: 'TRADING' },
    { id: 'server', label: 'SERVER & DEVOPS' },
    { id: 'business', label: 'SECURITY & OPS' },
  ];

  return (
    <div className="flex flex-col gap-3 font-mono text-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-cyan-200">SHARED UNIFIED MEMORY VAULT</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            AUTO-REDACTION ACTIVE
          </span>
        </div>

        <button
          onClick={() => {
            playSound('beep');
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>{showAddForm ? 'CANCEL' : 'STORE MEMORY'}</span>
        </button>
      </div>

      {/* Add Memory Box with PII Auto-Redaction Notice */}
      {showAddForm && (
        <form onSubmit={handleSaveMemory} className="p-3 rounded-lg bg-[#0b1c2e] border border-cyan-400/50 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold">
            <span>ENTER RAW NOTE / SECRET / CONTEXT:</span>
            <span className="text-[9.5px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> API keys & PII will be automatically redacted before vaulting
            </span>
          </div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="e.g. Deploy credentials for admin@corp.com with secret: sk-12345678901234567890..."
            className="w-full h-18 p-2 rounded bg-[#06101c] border border-cyan-500/30 text-cyan-100 text-xs focus:outline-none focus:border-cyan-400 font-mono resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>REDACT & SAVE TO MEMORY</span>
            </button>
          </div>
        </form>
      )}

      {/* Search and Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Semantic search across shared memories, decisions, tags..."
            className="w-full bg-[#06101c] border border-cyan-500/30 rounded pl-8 pr-3 py-1.5 text-cyan-100 placeholder-cyan-600/60 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                playSound('beep');
                setActiveCategory(c.id);
              }}
              className={`px-2 py-1 rounded text-[10px] whitespace-nowrap cursor-pointer transition-colors ${
                activeCategory === c.id
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold'
                  : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto scrollbar-thin">
        {filteredMemories.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-slate-500 font-mono text-[11px]">
            No matching memory nodes found in knowledge vault.
          </div>
        ) : (
          filteredMemories.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/20 flex flex-col justify-between gap-2 hover:border-cyan-500/40"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold uppercase">
                    {m.category}
                  </span>
                  <div className="flex items-center gap-2 text-[9.5px] text-cyan-500/80">
                    {m.redactedItemCount > 0 && (
                      <span className="text-emerald-400 font-bold">
                        {m.redactedItemCount} REDACTED
                      </span>
                    )}
                    <span>IMP: {m.importance}/10</span>
                  </div>
                </div>

                <p className="text-cyan-100 text-[11px] leading-relaxed">
                  {m.content}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-cyan-500/10 text-[9px]">
                {m.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="px-1.5 py-0.2 rounded bg-slate-900 text-cyan-400 flex items-center gap-0.5">
                    <Tag className="w-2.5 h-2.5 text-cyan-500" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
