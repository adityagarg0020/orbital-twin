import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { api } from '../services/api';
import { RootCauseAnalysisData } from '../types/telemetry';
import {
  GitBranch,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RootCausePage: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [analysis, setAnalysis] = useState<RootCauseAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRootCause()
      .then((data) => {
        setAnalysis(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [telemetry?.operating_mode, telemetry?.temperature]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            ROOT CAUSE & CAUSAL CHAIN ANALYSIS
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Explainable causal graph tracing anomaly propagation from physics deviations to subsystem failure risk.
          </p>
        </div>

        <div className="text-xs telemetry-mono text-slate-400 bg-[#071328]/90 px-3.5 py-1.5 rounded-md border border-[#16243f] shadow-sm flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>EVALUATING: <strong className="text-cyan-300">{analysis?.subsystem || 'Thermal'} Subsystem</strong></span>
        </div>
      </div>

      {/* Causal Chain Graph Flow */}
      <div className="hud-panel hud-corner p-5 rounded-xl space-y-4 border border-[#16243f]">
        <h2 className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          INCIDENT CAUSAL PROGRESSION GRAPH
        </h2>

        {/* Dynamic Nodes Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
          {analysis?.causal_chain.map((node, i) => (
            <div key={node.id} className="relative flex flex-col justify-between">
              <div
                className={`p-4 rounded-xl border telemetry-mono text-xs flex flex-col justify-between h-full space-y-2.5 transition-all ${
                  node.type === 'TRIGGER'
                    ? 'border-amber-500/70 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : node.type === 'RISK'
                    ? 'border-rose-500/80 bg-rose-950/25 shadow-[0_0_14px_rgba(244,63,94,0.3)]'
                    : 'border-[#16243f] bg-[#070e1c]/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-hud">
                    <span className="font-bold tracking-wider">STEP 0{node.step}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] telemetry-mono ${
                      node.type === 'RISK'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {node.type}
                    </span>
                  </div>
                  <div className="font-hud font-bold text-slate-100 text-sm mt-1">{node.title}</div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{node.desc}</p>
              </div>

              {/* Arrow connector between steps on desktop */}
              {i < (analysis?.causal_chain.length || 0) - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Split View: Empirical Telemetry Evidence & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Empirical Evidence Table (2 Cols) */}
        <div className="lg:col-span-2 hud-panel hud-corner p-5 rounded-xl space-y-3.5 border border-[#16243f]">
          <h2 className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center justify-between border-b border-[#16243f] pb-2.5">
            <span>EMPIRICAL TELEMETRY EVIDENCE TABLE</span>
            <span className="text-[10px] text-slate-400 font-normal telemetry-mono">DELTA FROM NOMINAL FLIGHT BASELINE</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs telemetry-mono">
              <thead>
                <tr className="text-slate-400 border-b border-[#14233f] text-left text-[11px] font-hud uppercase tracking-wider font-bold">
                  <th className="pb-2">PARAMETER</th>
                  <th className="pb-2 text-right">BASELINE</th>
                  <th className="pb-2 text-right">CURRENT</th>
                  <th className="pb-2 text-right">DELTA (%)</th>
                  <th className="pb-2 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#101c34]">
                {analysis?.evidence && analysis.evidence.length > 0 ? (
                  analysis.evidence.map((ev, i) => (
                    <tr key={i} className="hover:bg-[#0c162b] transition-colors">
                      <td className="py-2.5 text-slate-200 font-semibold">{ev.label}</td>
                      <td className="py-2.5 text-right text-slate-400">{ev.baseline} {ev.unit}</td>
                      <td className="py-2.5 text-right text-slate-100 font-bold">{ev.current} {ev.unit}</td>
                      <td className={`py-2.5 text-right font-bold ${
                        ev.status === 'CRITICAL' ? 'text-rose-400' : ev.status === 'WARNING' ? 'text-amber-400' : 'text-slate-300'
                      }`}>
                        {ev.percentage_delta}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.status === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/80 animate-pulse'
                            : ev.status === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        }`}>
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                      All telemetry channels within 5% nominal variance boundaries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainability & Feature Importance (1 Col) */}
        <div className="hud-panel hud-corner p-5 rounded-xl space-y-4 border border-[#16243f]">
          <h2 className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest border-b border-[#16243f] pb-2.5">
            MODEL FEATURE ATTRIBUTION (SHAP)
          </h2>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Normalized attribution weights assigned by the gradient-boosted failure classifier to each deviating sensor signal.
          </p>

          <div className="space-y-3 telemetry-mono">
            {analysis?.top_contributing_factors && analysis.top_contributing_factors.length > 0 ? (
              analysis.top_contributing_factors.map((f, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold">{i + 1}. {f.feature}</span>
                    <span className="text-purple-400 font-bold">{Math.round(f.weight * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#0a1222] h-2 rounded-full overflow-hidden border border-[#16243f] p-0.5">
                    <div
                      className="h-full bg-purple-500 rounded-full shadow-[0_0_6px_#a855f7]"
                      style={{ width: `${Math.round(f.weight * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 font-sans">
                Baseline stable. No elevated feature importance.
              </div>
            )}
          </div>

          <div className="border-t border-[#16243f] pt-3.5">
            <Link
              to="/mission-control/simulation"
              className="block w-full py-2.5 px-3 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 hover:text-white text-xs font-hud tracking-wider font-bold text-center transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            >
              RUN MITIGATION WHAT-IF SIMULATION →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
