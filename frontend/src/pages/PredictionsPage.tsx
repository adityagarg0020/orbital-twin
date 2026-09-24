import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  TrendingUp,
  Flame,
  Battery,
  Zap,
  Rocket,
  Radio,
  Compass,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PredictionsPage: React.FC = () => {
  const { predictions } = useTelemetry();

  const getSubsystemIcon = (sub: string) => {
    switch (sub) {
      case 'Thermal': return Flame;
      case 'Battery': return Battery;
      case 'Power': return Zap;
      case 'Propulsion': return Rocket;
      case 'Communication': return Radio;
      case 'Attitude': return Compass;
      default: return TrendingUp;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-800/80 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-800/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      case 'MODERATE':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800/80';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            SUBSYSTEM FAILURE PREDICTION MATRIX
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Supervised multi-output XGBoost gradient boosted trees forecasting time-to-failure windows and degradation risks.
          </p>
        </div>

        <div className="text-xs telemetry-mono text-slate-400 bg-[#071328]/90 px-3.5 py-1.5 rounded-md border border-[#16243f] flex items-center gap-2 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>MODEL: <strong className="text-cyan-300">XGBoost Multi-Output (ONLINE)</strong></span>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {predictions.map((pred) => {
          const Icon = getSubsystemIcon(pred.subsystem);
          const isHigh = pred.failure_probability >= 0.6;
          const isCritical = pred.failure_probability >= 0.8;
          const pct = Math.round(pred.failure_probability * 100);

          return (
            <div
              key={pred.subsystem}
              className={`hud-panel hud-corner p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isCritical
                  ? 'border-rose-500/70 bg-rose-950/25 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  : isHigh
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_14px_rgba(245,158,11,0.2)]'
                  : 'border-[#16243f] hover:border-cyan-500/40'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3.5 border-b border-[#14233f] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#0d1c38] text-cyan-400 shadow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-hud font-bold text-base text-slate-100">{pred.subsystem} Subsystem</span>
                  </div>
                  <span className={`text-[10px] telemetry-mono font-bold px-2 py-0.5 rounded border ${getRiskBadge(pred.risk_level)}`}>
                    {pred.risk_level} RISK
                  </span>
                </div>

                {/* Probability Bar */}
                <div className="space-y-1.5 mb-4 telemetry-mono">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400 font-hud tracking-wider uppercase text-[11px]">
                      Failure Probability:
                    </span>
                    <span className={`text-2xl font-display font-black ${
                      isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-[#0a1222] h-2.5 rounded-full overflow-hidden border border-[#16243f] p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical
                          ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                          : isHigh
                          ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                          : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Predicted Issue Description */}
                <div className="space-y-1 mb-3.5 text-xs telemetry-mono">
                  <div className="text-slate-400 text-[10px] font-hud uppercase tracking-widest font-bold">
                    PREDICTED ANOMALOUS DRIFT:
                  </div>
                  <div className="text-slate-200 leading-relaxed font-semibold font-sans">{pred.predicted_issue}</div>
                </div>

                {/* Time Window & Confidence */}
                <div className="grid grid-cols-2 gap-2 mb-3.5 text-[11px] telemetry-mono bg-[#07101f]/90 p-2.5 rounded-lg border border-[#14233e]">
                  <div>
                    <div className="text-slate-500 text-[9px] font-hud uppercase tracking-wider font-bold">
                      TIME TO CRITICAL
                    </div>
                    <div className="text-cyan-300 font-bold flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {pred.time_window}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] font-hud uppercase tracking-wider font-bold">
                      MODEL CONFIDENCE
                    </div>
                    <div className="text-slate-200 font-bold mt-0.5">
                      {Math.round((pred.confidence || 0.88) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Top Contributing Factors */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
                    TOP CONTRIBUTING FEATURES:
                  </div>
                  <div className="space-y-1">
                    {pred.contributing_factors && pred.contributing_factors.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] telemetry-mono bg-[#0c162c] px-2.5 py-1 rounded border border-[#14233e]">
                        <span className="text-slate-300">{f.feature}</span>
                        <span className="text-purple-300 font-bold">{Math.round(f.weight * 100)}% wt</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#16243f] pt-3.5 flex gap-2">
                <Link
                  to="/mission-control/root-cause"
                  className="flex-1 text-center py-2 px-3 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/50 text-cyan-300 text-xs font-hud font-bold tracking-wider transition-all"
                >
                  ROOT CAUSE →
                </Link>
                <Link
                  to="/mission-control/recommendations"
                  className="flex-1 text-center py-2 px-3 rounded-lg bg-[#0f1b34] hover:bg-[#182c56] border border-[#1d3563] text-slate-300 text-xs font-hud font-bold tracking-wider transition-all"
                >
                  MITIGATE →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
