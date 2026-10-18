import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  Lock, 
  Hash, 
  ExternalLink 
} from 'lucide-react';
import { AdversarialReview, AuditReceipt } from '../lib/types.ts';
import { generateAuditReceipt } from '../lib/adversarial.ts';
import { playSound } from '../lib/soundFx.ts';

interface AdversarialModalProps {
  review: AdversarialReview;
  onApprove: (receipt: AuditReceipt) => void;
  onReject: (receipt: AuditReceipt) => void;
  onClose: () => void;
}

export const AdversarialModal: React.FC<AdversarialModalProps> = ({
  review,
  onApprove,
  onReject,
  onClose,
}) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showReceipt, setShowReceipt] = useState<AuditReceipt | null>(null);

  const handleDecision = (decision: 'approved' | 'rejected') => {
    if (decision === 'approved') {
      playSound('approve');
      const receipt = generateAuditReceipt(review, 'approved');
      setShowReceipt(receipt);
      onApprove(receipt);
    } else {
      playSound('reject');
      const receipt = generateAuditReceipt(review, 'rejected');
      setShowReceipt(receipt);
      onReject(receipt);
    }
  };

  const getConsensusColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
    if (score >= 50) return 'text-amber-400 border-amber-500 bg-amber-950/40';
    return 'text-red-400 border-red-500 bg-red-950/40';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-lg bg-[#07111e] border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(0,255,200,0.25)] p-5 text-xs font-mono text-cyan-100 flex flex-col gap-4">
        {/* Header with Anti-Hallucination Shield */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-400/50 text-cyan-300">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-orbitron font-bold text-sm text-cyan-300 tracking-wider flex items-center gap-2">
                <span>ANTI-HALLUCINATION FIREWALL</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 font-mono">
                  3-LLM ADVERSARIAL REVIEW
                </span>
              </div>
              <p className="text-[11px] text-cyan-500/80">
                Gated approval protocol: No destructive action executes without multi-provider AI consensus.
              </p>
            </div>
          </div>

          {/* Consensus Score Gauge */}
          <div className={`flex flex-col items-center px-3 py-1.5 rounded border ${getConsensusColor(review.consensusScore)}`}>
            <span className="text-[10px] uppercase font-bold tracking-wider">CONSENSUS</span>
            <span className="font-orbitron font-extrabold text-lg">{review.consensusScore}%</span>
          </div>
        </div>

        {/* Action Proposed Summary */}
        <div className="p-3 rounded bg-[#0b1b2d] border border-cyan-500/30 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              PROPOSED ACTION:
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              AGENT: {review.proposedByAgent.toUpperCase()}
            </span>
          </div>
          <h3 className="font-orbitron text-sm text-cyan-100 font-bold tracking-wide">
            {review.actionTitle}
          </h3>
          <p className="text-cyan-300/80 leading-relaxed">{review.details}</p>
        </div>

        {/* Hallucination Alert Banner (if flagged) */}
        {review.hallucinationDetected && (
          <div className="p-3 rounded bg-red-950/90 border-2 border-red-500 text-red-200 flex items-start gap-2.5 shadow-[0_0_15px_rgba(255,50,50,0.3)]">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold font-orbitron text-red-300">
                CRITICAL: UNVERIFIED FACT / HALLUCINATION DETECTED
              </span>
              <p className="text-[11px] text-red-200/90">
                Fact auditor flagged unverified infrastructure claims. Action execution is BLOCKED until verified.
              </p>
            </div>
          </div>
        )}

        {/* 3-Panel LLM Debate Grid */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400">
            <span>INDEPENDENT REVIEW COUNCIL:</span>
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-cyan-300 hover:text-cyan-100 flex items-center gap-1 underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showEvidence ? 'Hide Source Evidence' : 'Show "Prove It" Evidence'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {review.critiques.map((c, idx) => (
              <div
                key={idx}
                className="p-3 rounded bg-[#091524] border border-cyan-500/20 flex flex-col gap-2"
              >
                {/* Reviewer Header */}
                <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1.5">
                  <div className="flex flex-col">
                    <span className="font-bold text-cyan-200 text-[11px]">{c.modelName}</span>
                    <span className="text-[9px] uppercase text-cyan-500/80">{c.role.replace('_', ' ')}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      c.verdict === 'FOR'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : c.verdict === 'AGAINST'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {c.verdict} ({c.confidence}%)
                  </span>
                </div>

                {/* Key Arguments */}
                <div className="flex flex-col gap-1 text-[10.5px]">
                  <span className="text-cyan-400/70 font-semibold">ARGUMENTS:</span>
                  <ul className="list-disc list-inside text-cyan-200/90 space-y-0.5">
                    {c.arguments.map((arg, aIdx) => (
                      <li key={aIdx}>{arg}</li>
                    ))}
                  </ul>
                </div>

                {/* Risks / Flags */}
                {c.risks.length > 0 && (
                  <div className="flex flex-col gap-0.5 text-[10px] text-amber-300/90 pt-1 border-t border-cyan-500/10">
                    <span className="font-semibold text-amber-400">RISK FACTOR:</span>
                    <span>{c.risks.join(', ')}</span>
                  </div>
                )}

                {/* Evidence citations */}
                {showEvidence && c.evidence && c.evidence.length > 0 && (
                  <div className="flex flex-col gap-0.5 text-[9.5px] text-cyan-400/80 pt-1 border-t border-cyan-500/10">
                    <span className="font-bold text-cyan-300">PROVE IT EVIDENCE:</span>
                    {c.evidence.map((ev, eIdx) => (
                      <span key={eIdx} className="font-mono truncate">
                        • {ev}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Audit Receipt preview if decision made */}
        {showReceipt && (
          <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40 text-[10px] font-mono flex flex-col gap-1">
            <div className="flex items-center justify-between text-emerald-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                IMMUTABLE AUDIT RECEIPT LOGGED
              </span>
              <span>{showReceipt.receiptId}</span>
            </div>
            <p className="text-emerald-200/80">
              Hash: <span className="text-cyan-300">{showReceipt.hash}</span> (Linked to Prev: {showReceipt.prevHash})
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/30">
          <button
            onClick={() => {
              playSound('beep');
              onClose();
            }}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
          >
            DISMISS MODAL
          </button>

          <div className="flex items-center gap-3">
            {/* Reject Button */}
            <button
              onClick={() => handleDecision('rejected')}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/60 font-bold cursor-pointer transition-colors shadow-[0_0_10px_rgba(255,50,50,0.2)]"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>REJECT ACTION</span>
            </button>

            {/* Approve Button (disabled if blocked by hallucination) */}
            <button
              disabled={review.hallucinationDetected}
              onClick={() => handleDecision('approved')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded font-bold cursor-pointer transition-all ${
                review.hallucinationDetected
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-300 shadow-[0_0_15px_#00ff88]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>CONFIRM & EXECUTE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
