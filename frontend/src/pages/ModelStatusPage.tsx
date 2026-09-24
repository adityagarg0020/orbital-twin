import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BrainCircuit,
  Database,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';

export const ModelStatusPage: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<any[]>([]);
  const [nasaChannels, setNasaChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getModelStatus(), api.getNasaChannels()])
      .then(([models, channels]) => {
        setModelStatus(models);
        setNasaChannels(channels);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            ML MODEL MONITORING & VERIFICATION REGISTRY
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Empirical validation metrics for Scikit-Learn and XGBoost models trained on NASA SMAP/MSL telemetry.
          </p>
        </div>

        <div className="text-xs telemetry-mono text-slate-400 bg-[#071328]/90 px-3.5 py-1.5 rounded-md border border-[#16243f] shadow-sm">
          BENCHMARK CHANNELS: <strong className="text-cyan-300 font-bold">{nasaChannels.length || 82}</strong>
        </div>
      </div>

      {/* Models Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modelStatus.map((m) => (
          <div key={m.id} className="hud-panel hud-corner p-5 rounded-xl space-y-4 border-l-4 border-l-cyan-400 border border-[#16243f]">
            <div className="flex items-center justify-between border-b border-[#16243f] pb-3">
              <div>
                <span className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">{m.algorithm}</span>
                <h3 className="text-base font-hud font-bold text-slate-100 mt-0.5 tracking-wide">{m.model_name}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs telemetry-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-[0_0_8px_#34d399]">
                {m.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 telemetry-mono text-center">
              <div className="p-3 rounded-lg bg-[#091222]/90 border border-[#14233e]">
                <div className="text-slate-400 text-[10px] font-hud uppercase tracking-wider font-bold">ACCURACY</div>
                <div className="text-xl font-display font-black text-slate-100 mt-1">{m.accuracy}%</div>
              </div>
              <div className="p-3 rounded-lg bg-[#091222]/90 border border-[#14233e]">
                <div className="text-slate-400 text-[10px] font-hud uppercase tracking-wider font-bold">F1-SCORE</div>
                <div className="text-xl font-display font-black text-cyan-300 mt-1">{m.f1_score}%</div>
              </div>
              <div className="p-3 rounded-lg bg-[#091222]/90 border border-[#14233e]">
                <div className="text-slate-400 text-[10px] font-hud uppercase tracking-wider font-bold">ROC-AUC</div>
                <div className="text-xl font-display font-black text-purple-300 mt-1">{m.roc_auc}%</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs telemetry-mono text-slate-300 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Model Version:</span>
                <span className="font-bold text-slate-200">{m.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dataset Source:</span>
                <span className="text-cyan-400 text-right">{m.dataset_info}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time-Series Validation:</span>
                <span className="text-emerald-400 font-bold">Chronological 80/20 Split (Zero Leakage)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NASA SMAP/MSL Channel Catalog Table */}
      <div className="hud-panel hud-corner rounded-xl overflow-hidden border border-[#16243f]">
        <div className="p-3.5 border-b border-[#16243f] flex items-center justify-between bg-[#050d1a]/80">
          <span className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            NASA SMAP/MSL BENCHMARK CHANNEL CATALOG ({nasaChannels.length} CHANNELS)
          </span>
          <span className="text-[10px] telemetry-mono text-slate-400">GROUND TRUTH ANOMALIES</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs telemetry-mono">
            <thead className="sticky top-0 bg-[#070e1c] z-10 border-b border-[#14233f]">
              <tr className="text-slate-400 text-left text-[11px] font-hud uppercase tracking-wider font-bold">
                <th className="p-3">CHANNEL ID</th>
                <th className="p-3">SPACECRAFT</th>
                <th className="p-3">SUBSYSTEM</th>
                <th className="p-3 text-right">DATAPOINTS</th>
                <th className="p-3 text-right">LABELED ANOMALIES</th>
                <th className="p-3">ANOMALY CLASS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101c34]">
              {nasaChannels.map((ch) => (
                <tr key={ch.chan_id} className="hover:bg-[#0c162b] transition-colors">
                  <td className="p-3 text-cyan-300 font-bold">{ch.chan_id}</td>
                  <td className="p-3 text-slate-300">{ch.spacecraft}</td>
                  <td className="p-3 text-slate-200 font-semibold">{ch.subsystem}</td>
                  <td className="p-3 text-right text-slate-400">{ch.num_values.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ch.anomaly_count > 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-500'
                    }`}>
                      {ch.anomaly_count}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[10px]">{ch.anomaly_class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
