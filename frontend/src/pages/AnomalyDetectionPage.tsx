import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { api } from '../services/api';
import ReactECharts from 'echarts-for-react';
import {
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnomalyDetectionPage: React.FC = () => {
  const { anomalies, telemetry } = useTelemetry();
  const [investigatingChannel, setInvestigatingChannel] = useState<string | null>(null);
  const [nasaChannelData, setNasaChannelData] = useState<any | null>(null);
  const [loadingNasa, setLoadingNasa] = useState(false);

  // Load NASA channel data when investigating
  useEffect(() => {
    if (!investigatingChannel) return;
    setLoadingNasa(true);
    api.getNasaChannelData(investigatingChannel)
      .then((data) => {
        setNasaChannelData(data);
        setLoadingNasa(false);
      })
      .catch(() => {
        setLoadingNasa(false);
      });
  }, [investigatingChannel]);

  // NASA Comparison Chart Option
  const nasaChartOption = nasaChannelData ? {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 20, top: 30, bottom: 25 },
    tooltip: { trigger: 'axis', backgroundColor: '#070e1e', textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'monospace' } },
    legend: { data: [`NASA SMAP/MSL ${nasaChannelData.chan_id} Signal`], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: nasaChannelData.sample_indices.map((idx: number) => `T+${idx}`),
      axisLine: { lineStyle: { color: '#16243f' } },
      axisLabel: { color: '#64748b', fontSize: 10 }
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#0d182b' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
    series: [
      {
        name: `NASA SMAP/MSL ${nasaChannelData.chan_id} Signal`,
        type: 'line',
        data: nasaChannelData.sampled_signal,
        smooth: true,
        lineStyle: { width: 1.8, color: '#00f0ff' },
        markArea: {
          itemStyle: { color: 'rgba(239, 68, 68, 0.25)' },
          data: nasaChannelData.anomaly_windows.map((win: [number, number]) => [
            { name: 'Ground Truth Anomaly', coord: [`T+${win[0]}`] },
            { coord: [`T+${win[1]}`] }
          ])
        }
      }
    ]
  } : null;

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f] pb-3">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            AI ANOMALY DETECTION ENGINE
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Powered by Scikit-Learn Isolation Forest trained on NASA SMAP/MSL multi-channel benchmark telemetry.
          </p>
        </div>

        {/* NASA Reference Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#071328] border border-cyan-800/40 text-cyan-300 font-mono text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>NASA SMAP/MSL BENCHMARK: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="aerospace-panel p-3.5 rounded border-l-4 border-l-rose-500">
          <div className="text-[11px] font-mono text-slate-400">ACTIVE ANOMALIES</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{anomalies.length}</div>
          <div className="text-[10px] text-slate-500 font-mono">Real-time isolation score &gt; 0.65</div>
        </div>
        <div className="aerospace-panel p-3.5 rounded border-l-4 border-l-cyan-500">
          <div className="text-[11px] font-mono text-slate-400">CURRENT ISOLATION SCORE</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            {Math.round((telemetry?.anomaly_score || 0.04) * 100)}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Decision function distance</div>
        </div>
        <div className="aerospace-panel p-3.5 rounded border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-mono text-slate-400">BENCHMARK CHANNELS</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">82 CHANNELS</div>
          <div className="text-[10px] text-slate-500 font-mono">Power, Thermal, Attitude, ECLSS</div>
        </div>
      </div>

      {/* Active Anomalies Feed Table */}
      <div className="aerospace-panel rounded overflow-hidden">
        <div className="p-3 border-b border-[#16243f] flex items-center justify-between bg-[#050d1a]">
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            ANOMALOUS INCIDENT REGISTRY
          </span>
          <span className="text-[10px] font-mono text-slate-500">SORTED BY SEVERITY</span>
        </div>

        {anomalies.length > 0 ? (
          <div className="divide-y divide-[#13223d]">
            {anomalies.map((anom) => (
              <div key={anom.id} className="p-4 hover:bg-[#0c172e] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        anom.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {anom.severity}
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-100">{anom.subsystem} Subsystem</span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                      CH: {anom.channel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{anom.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
                    <span>AFFECTED:</span>
                    {anom.affected_parameters.map((p, idx) => (
                      <span key={idx} className="bg-[#111e38] text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score & Action Buttons */}
                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-[#16243f] pt-2 md:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400">ANOMALY SCORE</div>
                    <div className="text-lg font-bold font-mono text-rose-400">{Math.round(anom.score * 100)}%</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInvestigatingChannel(anom.channel)}
                      className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-mono flex items-center gap-1 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      INVESTIGATE
                    </button>
                    <Link
                      to="/mission-control/root-cause"
                      className="px-3 py-1.5 rounded bg-[#101c36] hover:bg-[#182b52] border border-[#1d3563] text-slate-200 text-xs font-mono flex items-center gap-1 transition-colors"
                    >
                      ROOT CAUSE →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-mono text-slate-400 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm text-slate-300">No active anomalies detected.</p>
            <p className="text-slate-500">Spacecraft telemetry conforms to normal NASA SMAP/MSL training distribution.</p>
          </div>
        )}
      </div>

      {/* Investigation Modal Drawer */}
      {investigatingChannel && (
        <div className="aerospace-panel p-4 rounded border-cyan-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-[#16243f] pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono text-slate-100">
                NASA SMAP/MSL GROUND TRUTH BENCHMARK: CHANNEL {investigatingChannel}
              </h3>
            </div>
            <button
              onClick={() => { setInvestigatingChannel(null); setNasaChannelData(null); }}
              className="text-slate-400 hover:text-white font-mono text-xs"
            >
              ✕ CLOSE INSPECTOR
            </button>
          </div>

          <div className="text-xs font-mono text-slate-300 leading-relaxed">
            Comparing anomalous telemetry signature against NASA SMAP/MSL real test sequence for channel{' '}
            <strong className="text-cyan-300">{investigatingChannel}</strong>. Ground-truth labeled anomaly intervals are highlighted in red.
          </div>

          {loadingNasa ? (
            <div className="h-56 flex items-center justify-center font-mono text-xs text-slate-400">
              Loading NASA benchmark waveform...
            </div>
          ) : nasaChartOption ? (
            <div className="h-60 w-full">
              <ReactECharts option={nasaChartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          ) : (
            <div className="p-4 text-xs font-mono text-slate-400">No benchmark array loaded.</div>
          )}

          <div className="p-2.5 rounded bg-[#050c18] border border-[#16243f] text-[11px] font-mono text-slate-400">
            <strong>Scientific Transparency Note:</strong> The NASA SMAP/MSL dataset provides ground-truth labeled anomaly sequences for spacecraft subsystem channels. Real-time telemetry is continuously normalized and scored against these benchmark distributions.
          </div>
        </div>
      )}
    </div>
  );
};
