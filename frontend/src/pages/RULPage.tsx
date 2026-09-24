import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import ReactECharts from 'echarts-for-react';
import {
  Clock,
  Battery,
  Flame,
  Rocket,
  Sun,
  ShieldAlert,
  Info,
  TrendingDown,
  Cpu
} from 'lucide-react';

export const RULPage: React.FC = () => {
  const { rul, telemetry } = useTelemetry();

  const components = rul?.components || {
    Battery: { estimated_rul_hours: 143.0, current_health: 78.0, stress_factor: 1.45, confidence_window: '126.0 - 160.0 hrs', status: 'WARNING' },
    'Thermal Radiators': { estimated_rul_hours: 320.0, current_health: 85.0, stress_factor: 1.2, confidence_window: '272.0 - 368.0 hrs', status: 'NOMINAL' },
    Propulsion: { estimated_rul_hours: 7400.0, current_health: 84.5, stress_factor: 1.0, confidence_window: '6660.0 - 8140.0 hrs', status: 'NOMINAL' },
    'Solar Arrays': { estimated_rul_hours: 24500.0, current_health: 98.0, stress_factor: 1.0, confidence_window: '22540.0 - 26460.0 hrs', status: 'NOMINAL' }
  };

  const curves = rul?.battery_curves;

  // RUL Degradation Projection Chart Option
  const chartOption = curves ? {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 25, top: 35, bottom: 25 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 14, 28, 0.95)',
      borderColor: '#1e3a66',
      textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'JetBrains Mono' }
    },
    legend: {
      data: ['Historical Trend', 'Estimated Remaining Health', '95% Confidence Interval Upper', '95% Confidence Interval Lower'],
      textStyle: { color: '#94a3b8', fontSize: 11, fontFamily: 'Inter' },
      top: 0
    },
    xAxis: {
      type: 'category',
      data: [
        ...curves.historical.map(h => `${h.time_offset_hours}h`),
        '0h (Now)',
        ...curves.projected.map(p => `+${p.time_offset_hours}h`)
      ],
      axisLine: { lineStyle: { color: '#16243f' } },
      axisLabel: { color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(22, 36, 63, 0.5)' } },
      axisLabel: { color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }
    },
    series: [
      {
        name: 'Historical Trend',
        type: 'line',
        data: [...curves.historical.map(h => h.health), telemetry?.battery_health_calc || 90, ...curves.projected.map(() => null)],
        lineStyle: { width: 2, color: '#00f0ff' }
      },
      {
        name: 'Estimated Remaining Health',
        type: 'line',
        data: [...curves.historical.map(() => null), telemetry?.battery_health_calc || 90, ...curves.projected.map(p => p.estimated_health)],
        lineStyle: { width: 2.5, color: '#f59e0b', type: 'dashed' }
      },
      {
        name: '95% Confidence Interval Upper',
        type: 'line',
        data: [...curves.historical.map(() => null), telemetry?.battery_health_calc || 90, ...curves.projected.map(p => p.confidence_upper_95)],
        lineStyle: { width: 1, color: 'rgba(245, 158, 11, 0.4)', type: 'dotted' }
      },
      {
        name: '95% Confidence Interval Lower',
        type: 'line',
        data: [...curves.historical.map(() => null), telemetry?.battery_health_calc || 90, ...curves.projected.map(p => p.confidence_lower_95)],
        lineStyle: { width: 1, color: 'rgba(245, 158, 11, 0.4)', type: 'dotted' },
        areaStyle: {
          color: 'rgba(245, 158, 11, 0.08)'
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
            <Clock className="w-5 h-5 text-amber-400" />
            REMAINING USEFUL LIFE (RUL) ESTIMATION
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Physics-informed Arrhenius stress-acceleration curves with 95% statistical confidence envelopes.
          </p>
        </div>

        <div className="text-xs telemetry-mono text-slate-400 bg-[#071328]/90 px-3.5 py-1.5 rounded-md border border-[#16243f] shadow-sm flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>STATISTICAL FIT: <strong className="text-emerald-400">ARRHENIUS EXPONENTIAL</strong></span>
        </div>
      </div>

      {/* Component RUL Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(components).map(([name, data]) => {
          const isWarn = data.status === 'WARNING';
          const isCrit = data.status === 'CRITICAL';
          return (
            <div
              key={name}
              className={`hud-panel hud-corner p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isCrit
                  ? 'border-rose-500/70 bg-rose-950/20 shadow-[0_0_16px_rgba(244,63,94,0.3)]'
                  : isWarn
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'border-[#16243f] hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-hud font-bold text-slate-200">{name}</span>
                  <span className={`text-[10px] telemetry-mono px-2 py-0.5 rounded font-bold ${
                    isCrit
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : isWarn
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {data.status}
                  </span>
                </div>

                <div className="my-3 telemetry-mono">
                  <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
                    ESTIMATED RUL
                  </div>
                  <div className={`text-2xl font-display font-black ${
                    isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-cyan-300'
                  }`}>
                    {data.estimated_rul_hours.toLocaleString()} hrs
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    (~{Math.round(data.estimated_rul_hours / 24)} operational days)
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] telemetry-mono border-t border-[#14233f] pt-2.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Health:</span>
                    <span className="font-bold">{data.current_health}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thermal Stress Mult:</span>
                    <span className="text-amber-300 font-bold">{data.stress_factor}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">95% Window:</span>
                    <span className="text-slate-300 text-[10px]">{data.confidence_window}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Degradation Trajectory Chart */}
      <div className="hud-panel hud-corner p-5 rounded-xl space-y-4 border border-[#16243f]">
        <div className="flex items-center justify-between border-b border-[#16243f] pb-3">
          <div>
            <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
              DEGRADATION TRAJECTORY (ARRHENIUS THERMAL ACCELERATION)
            </div>
            <h2 className="text-sm font-display font-bold text-slate-100">
              BATTERY MODULE SOH & REMAINING USEFUL LIFE CURVE
            </h2>
          </div>
          <div className="text-[11px] telemetry-mono text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONFIDENCE ENVELOPE: 95% BOUNDS</span>
          </div>
        </div>

        {chartOption ? (
          <div className="h-64 w-full">
            <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        ) : (
          <div className="h-56 flex items-center justify-center telemetry-mono text-xs text-slate-400">
            Synthesizing degradation trajectory...
          </div>
        )}

        <div className="p-3.5 rounded-lg bg-[#07101f]/90 border border-[#14233e] text-[11px] telemetry-mono text-slate-400 space-y-1">
          <span className="text-cyan-300 font-bold">Scientific Methodology:</span> RUL is not presented as an exact scalar. It is computed via coupled electrochemical-thermal stress factors that expand statistical uncertainty intervals over the operational time horizon.
        </div>
      </div>
    </div>
  );
};
