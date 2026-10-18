import React from 'react';
import { Cpu, Zap, Activity, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { ModelMetadata } from '../lib/types.ts';
import { playSound } from '../lib/soundFx.ts';

interface ModelStatusWidgetProps {
  models: ModelMetadata[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  isFreeMode: boolean;
  onToggleFreeMode: () => void;
}

export const ModelStatusWidget: React.FC<ModelStatusWidgetProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  isFreeMode,
  onToggleFreeMode,
}) => {
  const totalCostToday = models.reduce((acc, m) => acc + (m.tokensUsedToday / 1000) * m.costPer1k, 0);

  return (
    <div className="flex flex-col gap-3 font-mono text-xs select-none">
      {/* Widget Header & Budget Meter */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-cyan-200">MULTI-LLM ROUTING POOL</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            {models.length} MODELS LIVE
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Daily Spend */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#091524] border border-cyan-500/30 text-[11px]">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-cyan-400">EST SPEND:</span>
            <span className="text-emerald-300 font-bold">${totalCostToday.toFixed(3)}</span>
            <span className="text-slate-500">/ $20.00</span>
          </div>

          {/* Kilo-Code Free Mode Switch */}
          <button
            onClick={() => {
              playSound('beep');
              onToggleFreeMode();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all cursor-pointer text-[10px] font-bold ${
              isFreeMode
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_10px_#00ff88]'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>KILO-CODE FREE ONLY: {isFreeMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {models.map((m) => {
          const isSelected = m.id === selectedModelId;
          const costToday = ((m.tokensUsedToday / 1000) * m.costPer1k).toFixed(3);

          return (
            <div
              key={m.id}
              onClick={() => {
                playSound('chirp');
                onSelectModel(m.id);
              }}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-[#091a2e] border-cyan-400 shadow-[0_0_15px_rgba(0,255,200,0.2)]'
                  : 'bg-[#06101c]/90 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-[#081525]'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-100 text-[11px] truncate">{m.name}</span>
                  <div className="flex items-center gap-1">
                    {m.isFreeTier && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                        FREE
                      </span>
                    )}
                    <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px]">
                      {m.provider}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-cyan-400/80 line-clamp-1">{m.role}</p>
              </div>

              {/* Telemetry Bar */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-cyan-500/10 text-[9.5px]">
                <div className="flex flex-col">
                  <span className="text-cyan-500/60 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> LATENCY
                  </span>
                  <span className="text-cyan-300 font-bold">{m.latencyMs}ms</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-cyan-500/60 flex items-center gap-0.5">
                    <Activity className="w-2.5 h-2.5" /> TOKENS
                  </span>
                  <span className="text-cyan-200">{(m.tokensUsedToday / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-cyan-500/60 flex items-center justify-end gap-0.5">
                    <DollarSign className="w-2.5 h-2.5" /> TODAY
                  </span>
                  <span className="text-emerald-400 font-bold">${costToday}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
