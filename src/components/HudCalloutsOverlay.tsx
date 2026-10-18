import React from 'react';

import type { SystemTelemetry } from '../lib/types.ts';

interface HudCalloutsOverlayProps {
  visible: boolean;
  telemetry?: SystemTelemetry | null;
}

export const HudCalloutsOverlay: React.FC<HudCalloutsOverlayProps> = ({ visible, telemetry }) => {
  if (!visible) return null;

  const netMbps = telemetry ? `${telemetry.networkSpeedMbps.toFixed(1)} MB/S` : '94.2 MB/S';
  const ping = telemetry ? `${telemetry.latencyMs}MS` : '14MS';
  const cpu = telemetry ? `${telemetry.cpuUsage}%` : '24%';
  const ram = telemetry ? `${telemetry.ramUsage}%` : '48%';
  const heap = telemetry ? `${telemetry.heapUsageMb} MB` : '124 MB';
  const uptime = telemetry ? `${telemetry.uptimeSec}S` : '1820S';

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden font-mono select-none text-[10px]">
      {/* Top Left Callout: >GATE - 074 */}
      <div className="absolute top-[22%] left-[12%] flex items-center gap-2 animate-fade-in">
        <div className="p-1.5 rounded bg-[#06121f]/90 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,255,200,0.3)]">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-xs" />
            <span>01 &gt;GATE - 074</span>
          </div>
          <span className="text-[8.5px] text-cyan-500 block">ARMORED PERIMETER HOUSING</span>
        </div>
        <svg className="w-24 h-12 stroke-cyan-400 fill-none" viewBox="0 0 100 50">
          <polyline points="0,25 60,25 90,45" strokeWidth="1.5" />
          <circle cx="90" cy="45" r="2.5" fill="#00ffc8" />
        </svg>
      </div>

      {/* Top Right Callout: HP-CONTROL */}
      <div className="absolute top-[22%] right-[12%] flex items-center gap-2 flex-row-reverse animate-fade-in">
        <div className="p-1.5 rounded bg-[#06121f]/90 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,255,200,0.3)]">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-xs" />
            <span>02 &gt;IP-CONTROL: {ping}</span>
          </div>
          <span className="text-[8.5px] text-cyan-500 block">DUAL GIMBAL · CPU {cpu}</span>
        </div>
        <svg className="w-24 h-12 stroke-cyan-400 fill-none" viewBox="0 0 100 50">
          <polyline points="100,25 40,25 10,45" strokeWidth="1.5" />
          <circle cx="10" cy="45" r="2.5" fill="#00ffc8" />
        </svg>
      </div>

      {/* Mid Left Callout: DATA TRANSFER & SEQUENCING */}
      <div className="absolute top-[46%] left-[8%] flex items-center gap-2 animate-fade-in">
        <div className="p-1.5 rounded bg-[#06121f]/90 border border-cyan-400/80 text-cyan-300">
          <div className="flex items-center justify-between gap-2 font-bold">
            <span>&lt;DATA TRANSFER</span>
            <span className="text-amber-400 text-[8.5px]">{netMbps}</span>
          </div>
          <span className="text-[8.5px] text-cyan-500/90 block">NEURAL APERTURE IRIS</span>
        </div>
        <svg className="w-28 h-8 stroke-cyan-400 fill-none" viewBox="0 0 120 30">
          <line x1="0" y1="15" x2="90" y2="15" strokeWidth="1.5" />
          <circle cx="90" cy="15" r="2.5" fill="#00ffc8" />
        </svg>
      </div>

      {/* Mid Right Callout: TELEMETRY STREAM */}
      <div className="absolute top-[46%] right-[8%] flex items-center gap-2 flex-row-reverse animate-fade-in">
        <div className="p-1.5 rounded bg-[#06121f]/90 border border-cyan-400/80 text-cyan-300">
          <div className="flex items-center justify-between gap-2 font-bold">
            <span>RAM {ram} · HEAP {heap}</span>
            <span className="text-emerald-400 text-[8.5px]">WS LIVE</span>
          </div>
          <span className="text-[8.5px] text-cyan-500/90 block">COUNTER-ROTATING TELEMETRY ARC</span>
        </div>
        <svg className="w-28 h-8 stroke-cyan-400 fill-none" viewBox="0 0 120 30">
          <line x1="120" y1="15" x2="30" y2="15" strokeWidth="1.5" />
          <circle cx="30" cy="15" r="2.5" fill="#00ffc8" />
        </svg>
      </div>

      {/* Bottom Left Callout: 0.0.1 LOADER */}
      <div className="absolute bottom-[24%] left-[14%] flex items-center gap-2 animate-fade-in">
        <div className="p-1.5 rounded bg-[#06121f]/90 border border-cyan-400 text-cyan-300">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            <span>0.0.1 LOADER: {uptime}</span>
          </div>
          <span className="text-[8.5px] text-cyan-500 block">SINGULARITY ENERGY ORB</span>
        </div>
        <svg className="w-24 h-12 stroke-cyan-400 fill-none" viewBox="0 0 100 50">
          <polyline points="0,35 60,35 90,15" strokeWidth="1.5" />
          <circle cx="90" cy="15" r="2.5" fill="#00ffc8" />
        </svg>
      </div>

      {/* Bottom Right Callout: S-PORT [21] READY */}
      <div className="absolute bottom-[24%] right-[14%] flex items-center gap-2 flex-row-reverse animate-fade-in">
        <div className="p-1.5 rounded bg-[#06121f]/90 border border-cyan-400 text-cyan-300">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <span>S-PORT [21] READY</span>
          </div>
          <span className="text-[8.5px] text-cyan-500 block">10-NODE SATELLITE SWARM</span>
        </div>
        <svg className="w-24 h-12 stroke-cyan-400 fill-none" viewBox="0 0 100 50">
          <polyline points="100,35 40,35 10,15" strokeWidth="1.5" />
          <circle cx="10" cy="15" r="2.5" fill="#00ffc8" />
        </svg>
      </div>
    </div>
  );
};
