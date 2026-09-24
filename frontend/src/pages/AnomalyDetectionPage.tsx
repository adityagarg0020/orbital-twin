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
  ArrowRight,
  Cpu
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
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 14, 28, 0.95)',
      borderColor: '#1e3a66',
      textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'JetBrains Mono' }
    },
    legend: {
      data: [`NASA SMAP/MSL ${nasaChannelData.chan_id} Signal`],
      textStyle: { color: '#94a3b8', fontFamily: 'Inter' }
    },
    xAxis: {
      type: 'category',
      data: nasaChannelData.sample_indices.map((idx: number) => `T+${idx}`),
      axisLine: { lineStyle: { color: '#16243f' } },
      axisLabel: { color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(22, 36, 63, 0.5)' } },
      axisLabel: { color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }
    },
    series: [
      {
        name: `NASA SMAP/MSL ${nasaChannelData.chan_id} Signal`,
        type: 'line',
        data: nasaChannelData.sampled_signal,
        smooth: true,
        lineStyle: { width: 2, color: '#00f0ff' },
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
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            AI ANOMALY DETECTION ENGINE
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Isolation Forest statistical scoring cross-referenced with NASA SMAP/MSL benchmark sequences.
          </p>
        </div>

        {/* NASA Reference Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#071328]/90 border border-cyan-800/50 text-cyan-300 telemetry-mono text-xs shadow-sm">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">NASA SMAP/MSL BENCHMARK: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="hud-panel hud-corner p-4 rounded-xl border-l-4 border-l-rose-500">
          <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
            ACTIVE ANOMALIES
          </div>
          <div className="text-3xl font-display font-black text-rose-400 mt-1">
            {anomalies.length}
          </div>
          <div className="text-[10px] text-slate-500 telemetry-mono mt-1">
            Real-time isolation score &gt; 0.65 threshold
          </div>
        </div>

        <div className="hud-panel hud-corner p-4 rounded-xl border-l-4 border-l-cyan-400">
          <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
            CURRENT ISOLATION SCORE
          </div>
          <div className="text-3xl font-display font-black text-cyan-300 mt-1">
            {Math.round((telemetry?.anomaly_score || 0.04) * 100)}%
          </div>
          <div className="text-[10px] text-slate-500 telemetry-mono mt-1">
            Feature distribution distance
          </div>
        </div>

        <div className="hud-panel hud-corner p-4 rounded-xl border-l-4 border-l-emerald-500">
          <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
            BENCHMARK CHANNELS
          </div>
          <div className="text-3xl font-display font-black text-emerald-400 mt-1">
            82 CHANNELS
          </div>
          <div className="text-[10px] text-slate-500 telemetry-mono mt-1">
            Power, Thermal, Attitude, ECLSS arrays
          </div>
        </div>
      </div>

      {/* Active Anomalies Feed Table */}
      <div className="hud-panel hud-corner rounded-xl overflow-hidden border border-[#16243f]">
        <div className="p-3.5 border-b border-[#16243f] flex items-center justify-between bg-[#050d1a]/80">
          <span className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            ANOMALOUS INCIDENT REGISTRY
          </span>
          <span className="text-[10px] telemetry-mono text-slate-400">SORTED BY SEVERITY</span>
        </div>

        {anomalies.length > 0 ? (
          <div className="divide-y divide-[#13223d]">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-4 hover:bg-[#0c172e] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] telemetry-mono font-bold px-2 py-0.5 rounded ${
                        anom.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/80 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                      }`}
                    >
                      {anom.severity}
                    </span>
                    <span className="text-sm font-bold font-hud tracking-wider text-slate-100">
                      {anom.subsystem.toUpperCase()} SUBSYSTEM
                    </span>
                    <span className="text-xs telemetry-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                      CH: {anom.channel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{anom.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] telemetry-mono text-slate-400 pt-1">
                    <span className="text-[10px] uppercase font-hud tracking-wider">AFFECTED:</span>
                    {anom.affected_parameters.map((p, idx) => (
                      <span key={idx} className="bg-[#111e38] border border-[#1b2f54] text-slate-300 px-2 py-0.5 rounded text-[10px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score & Action Buttons */}
                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-[#16243f] pt-2 md:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] font-hud uppercase tracking-wider text-slate-400 font-bold">
                      ANOMALY SCORE
                    </div>
                    <div className="text-xl font-display font-black text-rose-400">
                      {Math.round(anom.score * 100)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInvestigatingChannel(anom.channel)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-hud font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      INVESTIGATE
                    </button>
                    <Link
                      to="/mission-control/root-cause"
                      className="px-3 py-1.5 rounded-lg bg-[#101c36] hover:bg-[#182b52] border border-[#1d3563] text-slate-200 text-xs font-hud font-bold tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      ROOT CAUSE →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs telemetry-mono text-slate-400 space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto shadow-[0_0_16px_rgba(16,185,129,0.3)]" />
            <p className="text-sm font-hud font-bold text-slate-200 tracking-wider">
              NO ACTIVE ANOMALIES DETECTED
            </p>
            <p className="text-slate-500 font-sans max-w-md mx-auto">
              Spacecraft telemetry streams strictly conform to nominal NASA SMAP/MSL training distributions.
            </p>
          </div>
        )}
      </div>

      {/* Investigation Modal Drawer */}
      {investigatingChannel && (
        <div className="hud-panel hud-corner p-5 rounded-xl border border-cyan-500/50 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#16243f] pb-3">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-display font-bold text-slate-100">
                NASA SMAP/MSL BENCHMARK: CHANNEL {investigatingChannel}
              </h3>
            </div>
            <button
              onClick={() => { setInvestigatingChannel(null); setNasaChannelData(null); }}
              className="text-slate-400 hover:text-white telemetry-mono text-xs cursor-pointer px-2 py-1 rounded bg-[#0a1428] border border-[#1a2d52]"
            >
              ✕ CLOSE INSPECTOR
            </button>
          </div>

          <div className="text-xs telemetry-mono text-slate-300 leading-relaxed font-sans">
            Comparing anomalous telemetry signature against NASA SMAP/MSL real test sequence for channel{' '}
            <strong className="text-cyan-300 font-mono">{investigatingChannel}</strong>. Ground-truth labeled anomaly intervals are highlighted in red.
          </div>

          {loadingNasa ? (
            <div className="h-56 flex items-center justify-center telemetry-mono text-xs text-slate-400">
              Loading NASA benchmark waveform...
            </div>
          ) : nasaChartOption ? (
            <div className="h-60 w-full">
              <ReactECharts option={nasaChartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          ) : (
            <div className="p-4 text-xs telemetry-mono text-slate-400">No benchmark array loaded.</div>
          )}

          <div className="p-3 rounded-lg bg-[#050c18] border border-[#16243f] text-[11px] telemetry-mono text-slate-400">
            <strong className="text-slate-300">Scientific Transparency Note:</strong> The NASA SMAP/MSL dataset provides ground-truth labeled anomaly sequences for spacecraft subsystem channels. Real-time telemetry is continuously normalized and scored against these benchmark distributions.
          </div>
        </div>
      )}
    </div>
  );
};
