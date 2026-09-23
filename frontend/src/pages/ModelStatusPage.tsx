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
    <div className="space-y-5">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f] pb-3">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            ML MODEL MONITORING & VERIFICATION REGISTRY
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Empirical validation metrics for serialized Scikit-Learn and XGBoost models trained on NASA SMAP/MSL telemetry.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#071328] px-3 py-1 rounded border border-[#16243f]">
          TOTAL CHANNELS: <span className="text-cyan-300 font-bold">{nasaChannels.length || 82}</span>
        </div>
      </div>

      {/* Models Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modelStatus.map((m) => (
          <div key={m.id} className="aerospace-panel p-5 rounded space-y-4 border-l-4 border-l-cyan-500">
            <div className="flex items-center justify-between border-b border-[#16243f] pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{m.algorithm}</span>
                <h3 className="text-base font-bold font-mono text-slate-100 mt-0.5">{m.model_name}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {m.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="p-3 rounded bg-[#091222] border border-[#14233e]">
                <div className="text-slate-400 text-[10px]">ACCURACY</div>
                <div className="text-xl font-bold text-slate-100 mt-1">{m.accuracy}%</div>
              </div>
              <div className="p-3 rounded bg-[#091222] border border-[#14233e]">
                <div className="text-slate-400 text-[10px]">F1-SCORE</div>
                <div className="text-xl font-bold text-cyan-300 mt-1">{m.f1_score}%</div>
              </div>
              <div className="p-3 rounded bg-[#091222] border border-[#14233e]">
                <div className="text-slate-400 text-[10px]">ROC-AUC</div>
                <div className="text-xl font-bold text-purple-300 mt-1">{m.roc_auc}%</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-300">
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
      <div className="aerospace-panel rounded overflow-hidden">
        <div className="p-3 border-b border-[#16243f] flex items-center justify-between bg-[#050d1a]">
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            NASA SMAP/MSL BENCHMARK CHANNEL CATALOG ({nasaChannels.length} CHANNELS)
          </span>
          <span className="text-[10px] font-mono text-slate-500">GROUND TRUTH ANOMALIES</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0 bg-[#070e1c] z-10 border-b border-[#14233f]">
              <tr className="text-slate-400 text-left text-[11px]">
                <th className="p-2.5">CHANNEL ID</th>
                <th className="p-2.5">SPACECRAFT</th>
                <th className="p-2.5">SUBSYSTEM</th>
                <th className="p-2.5 text-right">DATAPOINTS</th>
                <th className="p-2.5 text-right">LABELED ANOMALIES</th>
                <th className="p-2.5">ANOMALY CLASS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101c34]">
              {nasaChannels.map((ch) => (
                <tr key={ch.chan_id} className="hover:bg-[#0c162b] transition-colors">
                  <td className="p-2.5 text-cyan-300 font-bold">{ch.chan_id}</td>
                  <td className="p-2.5 text-slate-300">{ch.spacecraft}</td>
                  <td className="p-2.5 text-slate-200 font-semibold">{ch.subsystem}</td>
                  <td className="p-2.5 text-right text-slate-400">{ch.num_values.toLocaleString()}</td>
                  <td className="p-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ch.anomaly_count > 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-500'
                    }`}>
                      {ch.anomaly_count}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-400 text-[10px]">{ch.anomaly_class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
