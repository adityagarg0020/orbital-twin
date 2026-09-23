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
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PredictionsPage: React.FC = () => {
  const { predictions, telemetry } = useTelemetry();

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
        return 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'MODERATE':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f] pb-3">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            SUBSYSTEM FAILURE PREDICTION MATRIX
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Supervised multi-output XGBoost gradient boosted decision trees predicting time-to-failure windows and degradation risks.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#071328] px-3 py-1 rounded border border-[#16243f]">
          MODEL: <span className="text-cyan-300 font-bold">XGBoost v2.0.1 (ONLINE)</span>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((pred) => {
          const Icon = getSubsystemIcon(pred.subsystem);
          const isHigh = pred.failure_probability >= 0.6;
          const isCritical = pred.failure_probability >= 0.8;
          const pct = Math.round(pred.failure_probability * 100);

          return (
            <div
              key={pred.subsystem}
              className={`aerospace-panel p-4 rounded border transition-all flex flex-col justify-between ${
                isCritical
                  ? 'border-rose-500/70 bg-rose-950/20 shadow-lg shadow-rose-950/40'
                  : isHigh
                  ? 'border-amber-500/60 bg-amber-950/15'
                  : 'border-[#16243f]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3 border-b border-[#14233f] pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-[#0d1c38] text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-100">{pred.subsystem} System</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getRiskBadge(pred.risk_level)}`}>
                    {pred.risk_level} RISK
                  </span>
                </div>

                {/* Probability Bar */}
                <div className="space-y-1 mb-4 font-mono">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Failure Probability:</span>
                    <span className={`text-xl font-bold ${isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-[#0a1222] h-2 rounded-full overflow-hidden border border-[#16243f]">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Predicted Issue Description */}
                <div className="space-y-1 mb-3 text-xs font-mono">
                  <div className="text-slate-400 text-[10px] uppercase">Predicted Degradation:</div>
                  <div className="text-slate-200 leading-relaxed font-semibold">{pred.predicted_issue}</div>
                </div>

                {/* Time Window & Confidence */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] font-mono bg-[#07101f] p-2 rounded border border-[#14233e]">
                  <div>
                    <div className="text-slate-500 text-[9px]">TIME WINDOW</div>
                    <div className="text-cyan-300 font-bold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {pred.time_window}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px]">CONFIDENCE</div>
                    <div className="text-slate-200 font-bold mt-0.5">
                      {Math.round((pred.confidence || 0.88) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Top Contributing Factors */}
                <div className="space-y-1 mb-4">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Top Contributing Signals:</div>
                  <div className="space-y-1">
                    {pred.contributing_factors && pred.contributing_factors.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-mono bg-[#0c162c] px-2 py-1 rounded">
                        <span className="text-slate-300">{f.feature}</span>
                        <span className="text-purple-300 font-bold">{Math.round(f.weight * 100)}% wt</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#16243f] pt-3 flex gap-2">
                <Link
                  to="/mission-control/root-cause"
                  className="flex-1 text-center py-1.5 px-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/40 text-cyan-300 text-xs font-mono transition-colors"
                >
                  ROOT CAUSE →
                </Link>
                <Link
                  to="/mission-control/recommendations"
                  className="flex-1 text-center py-1.5 px-2 rounded bg-[#0f1b34] hover:bg-[#182c56] border border-[#1d3563] text-slate-300 text-xs font-mono transition-colors"
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
