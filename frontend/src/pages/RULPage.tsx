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
  TrendingDown
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
    tooltip: { trigger: 'axis', backgroundColor: '#070e1e', textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'monospace' } },
    legend: {
      data: ['Historical Trend', 'Estimated Remaining Health', '95% Confidence Interval Upper', '95% Confidence Interval Lower'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
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
      axisLabel: { color: '#64748b', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: '#0d182b' } },
      axisLabel: { color: '#64748b', fontSize: 10 }
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
          color: 'rgba(245, 158, 11, 0.1)'
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
            <Clock className="w-5 h-5 text-amber-400" />
            REMAINING USEFUL LIFE (RUL) ESTIMATION
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Physics-informed degradation curves with empirical Arrhenius thermal stress acceleration and 95% uncertainty intervals.
          </p>
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
              className={`aerospace-panel p-4 rounded border flex flex-col justify-between ${
                isCrit
                  ? 'border-rose-500/70 bg-rose-950/20'
                  : isWarn
                  ? 'border-amber-500/60 bg-amber-950/15'
                  : 'border-[#16243f]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-200">{name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isCrit ? 'bg-rose-950 text-rose-300' : isWarn ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {data.status}
                  </span>
                </div>

                <div className="my-3 font-mono">
                  <div className="text-[10px] text-slate-400">ESTIMATED RUL</div>
                  <div className={`text-2xl font-bold ${isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-cyan-300'}`}>
                    {data.estimated_rul_hours.toLocaleString()} hrs
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    (~{Math.round(data.estimated_rul_hours / 24)} days remaining)
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono border-t border-[#14233f] pt-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Health:</span>
                    <span className="font-bold">{data.current_health}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thermal Stress Mult:</span>
                    <span className="text-amber-300 font-bold">{data.stress_factor}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">95% Uncertainty Window:</span>
                    <span className="text-slate-300 text-[10px]">{data.confidence_window}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Degradation Trajectory Chart */}
      <div className="aerospace-panel p-5 rounded space-y-4">
        <div className="flex items-center justify-between border-b border-[#16243f] pb-3">
          <div>
            <div className="text-[10px] font-mono text-slate-400">DEGRADATION TRAJECTORY (ARRHENIUS THERMAL ACCELERATION)</div>
            <h2 className="text-sm font-bold font-mono text-slate-100">
              BATTERY MODULE SOH & REMAINING USEFUL LIFE CURVE
            </h2>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONFIDENCE BOUNDS: 95% INTERVAL</span>
          </div>
        </div>

        {chartOption ? (
          <div className="h-64 w-full">
            <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        ) : (
          <div className="h-56 flex items-center justify-center font-mono text-xs text-slate-400">
            Synthesizing degradation trajectory...
          </div>
        )}

        <div className="p-3 rounded bg-[#07101f] border border-[#14233e] text-[11px] font-mono text-slate-400 space-y-1">
          <span className="text-cyan-300 font-bold">Scientific Methodology:</span> RUL is not presented as an exact scalar. It is computed via coupled electrochemical-thermal stress factors that expand statistical uncertainty intervals over the operational time horizon.
        </div>
      </div>
    </div>
  );
};
