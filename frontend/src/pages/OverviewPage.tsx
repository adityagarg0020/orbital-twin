import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import ReactECharts from 'echarts-for-react';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Shield,
  Zap,
  Flame,
  Battery,
  Radio,
  Rocket,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const { telemetry, history, anomalies, predictions } = useTelemetry();

  const health = telemetry?.overall_health ?? 95.0;
  const activeAnomalyCount = anomalies.length;

  const highestRiskPred = predictions.reduce(
    (max: any, p: any) => (p.failure_probability > (max?.failure_probability || 0) ? p : max),
    null as any
  );

  // Subsystem Cards configuration
  const subsystemCards = [
    {
      id: 'power',
      name: 'Power (EPS)',
      icon: Zap,
      health: telemetry?.power_health ?? 96.0,
      val1: `${telemetry?.solar_power ?? 1450} W`,
      label1: 'Solar Gen',
      val2: `${telemetry?.power_consumption ?? 820} W`,
      label2: 'Bus Load',
      status: (telemetry?.power_health ?? 96) < 70 ? 'WARNING' : 'NOMINAL',
      color: 'text-cyan-400'
    },
    {
      id: 'battery',
      name: 'Battery (BMS)',
      icon: Battery,
      health: telemetry?.battery_health_calc ?? 97.0,
      val1: `${telemetry?.battery ?? 92}%`,
      label1: 'SoC Pack',
      val2: `${telemetry?.battery_voltage ?? 28.2} V`,
      label2: 'Terminal V',
      status: (telemetry?.battery_health_calc ?? 97) < 70 ? 'CRITICAL' : 'NOMINAL',
      color: 'text-emerald-400'
    },
    {
      id: 'thermal',
      name: 'Thermal (TCS)',
      icon: Flame,
      health: telemetry?.thermal_health ?? 95.0,
      val1: `${telemetry?.temperature ?? 24.0}°C`,
      label1: 'Bus Core',
      val2: `${telemetry?.cooling_efficiency ?? 100}%`,
      label2: 'Rad Loop',
      status: (telemetry?.thermal_health ?? 95) < 70 ? 'CRITICAL' : ((telemetry?.thermal_health ?? 95) < 85 ? 'WARNING' : 'NOMINAL'),
      color: 'text-rose-400'
    },
    {
      id: 'propulsion',
      name: 'Propulsion (RCS)',
      icon: Rocket,
      health: telemetry?.propulsion_health ?? 98.0,
      val1: `${telemetry?.fuel ?? 84.5}%`,
      label1: 'Tank Fuel',
      val2: `${telemetry?.fuel_pressure ?? 220} bar`,
      label2: 'Manifold P',
      status: (telemetry?.propulsion_health ?? 98) < 70 ? 'CRITICAL' : 'NOMINAL',
      color: 'text-purple-400'
    },
    {
      id: 'communication',
      name: 'Comms (TT&C)',
      icon: Radio,
      health: telemetry?.communication_health ?? 95.0,
      val1: `${telemetry?.communication_signal ?? 94}%`,
      label1: 'RF Signal',
      val2: `${telemetry?.packet_loss ?? 0.05}%`,
      label2: 'Pkt Loss',
      status: (telemetry?.communication_health ?? 95) < 70 ? 'WARNING' : 'NOMINAL',
      color: 'text-cyan-400'
    },
    {
      id: 'attitude',
      name: 'Attitude (ADCS)',
      icon: Compass,
      health: telemetry?.attitude_health ?? 98.0,
      val1: `${telemetry?.roll ?? 0.02}°`,
      label1: 'Roll Rate',
      val2: `${telemetry?.pitch ?? -0.01}°`,
      label2: 'Pitch Rate',
      status: 'NOMINAL',
      color: 'text-amber-400'
    }
  ];

  // ECharts Multi-Channel Telemetry Stream Option
  const chartPoints = history.slice(-40);
  const timeLabels = chartPoints.map((_: any, i: number) => `-${chartPoints.length - i}s`);
  const temperatures = chartPoints.map((p: any) => p.temperature);
  const batterySoC = chartPoints.map((p: any) => p.battery);
  const solarPower = chartPoints.map((p: any) => p.solar_power);

  const chartOption = {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 20, top: 32, bottom: 25 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 14, 28, 0.95)',
      borderColor: '#1e3a66',
      borderWidth: 1,
      textStyle: { color: '#f1f5f9', fontFamily: 'JetBrains Mono', fontSize: 11 }
    },
    legend: {
      data: ['Core Temp (°C)', 'Battery SoC (%)', 'Solar Gen (W / 15)'],
      textStyle: { color: '#94a3b8', fontSize: 11, fontFamily: 'Inter' },
      top: 0
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
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
        name: 'Core Temp (°C)',
        type: 'line',
        data: temperatures,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#f43f5e' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(244, 63, 94, 0.25)' },
              { offset: 1, color: 'transparent' }
            ]
          }
        }
      },
      {
        name: 'Battery SoC (%)',
        type: 'line',
        data: batterySoC,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#10b981' }
      },
      {
        name: 'Solar Gen (W / 15)',
        type: 'line',
        data: solarPower.map((v: any) => Math.round(v / 15)),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, color: '#00f0ff', type: 'dashed' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Health Card with Gauge */}
        <div className="hud-panel hud-corner p-4 rounded-xl flex items-center justify-between border-l-4 border-l-cyan-400">
          <div>
            <div className="text-[11px] font-hud text-slate-400 uppercase tracking-widest font-bold">
              MISSION HEALTH SCORE
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-display font-black tracking-tight ${
                health >= 80 ? 'text-emerald-400' : (health >= 60 ? 'text-amber-400' : 'text-rose-400 animate-pulse')
              }`}>
                {health}%
              </span>
              <span className="text-[11px] telemetry-mono text-slate-400 font-semibold">
                {health >= 80 ? 'NOMINAL' : (health >= 60 ? 'DEGRADED' : 'CRITICAL')}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 telemetry-mono mt-1">
              Weighted 6-subsystem composite
            </div>
          </div>
          {/* Circular SVG Mini Arc */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="23" stroke="#16243f" strokeWidth="4" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="23"
                stroke={health >= 80 ? '#10b981' : (health >= 60 ? '#f59e0b' : '#ef4444')}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="144"
                strokeDashoffset={144 - (144 * health) / 100}
                className="transition-all duration-500"
              />
            </svg>
            <Shield className="w-5 h-5 text-cyan-400 absolute" />
          </div>
        </div>

        {/* Active Anomalies Card */}
        <div className="hud-panel hud-corner p-4 rounded-xl flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <div className="text-[11px] font-hud text-slate-400 uppercase tracking-widest font-bold">
              ACTIVE ANOMALIES
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-display font-black ${
                activeAnomalyCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-100'
              }`}>
                {activeAnomalyCount}
              </span>
              <span className="text-[11px] telemetry-mono text-slate-400 font-semibold">
                {activeAnomalyCount > 0 ? 'FLAGGED' : 'CLEAR'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 telemetry-mono mt-1">
              Isolation Forest ML scoring
            </div>
          </div>
          <AlertTriangle className={`w-8 h-8 ${activeAnomalyCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-600'}`} />
        </div>

        {/* Highest Failure Risk Card */}
        <div className="hud-panel hud-corner p-4 rounded-xl flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <div className="text-[11px] font-hud text-slate-400 uppercase tracking-widest font-bold">
              HIGHEST FAILURE RISK
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-display font-bold text-cyan-300 uppercase truncate">
                {highestRiskPred ? highestRiskPred.subsystem : 'NOMINAL'}
              </span>
              <span className="text-xs telemetry-mono font-bold text-purple-400">
                {highestRiskPred ? `${Math.round(highestRiskPred.failure_probability * 100)}%` : '0%'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 telemetry-mono mt-1 truncate max-w-[150px]">
              {highestRiskPred ? highestRiskPred.predicted_issue : 'All systems nominal'}
            </div>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-400" />
        </div>

        {/* Operating State Card */}
        <div className="hud-panel hud-corner p-4 rounded-xl flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <div className="text-[11px] font-hud text-slate-400 uppercase tracking-widest font-bold">
              SIMULATION MODE
            </div>
            <div className="text-lg font-display font-bold text-emerald-400 mt-1 uppercase truncate">
              {telemetry?.operating_mode || 'NORMAL'}
            </div>
            <div className="text-[10px] text-slate-500 telemetry-mono mt-1">
              Coupled physics loop active
            </div>
          </div>
          <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Subsystem Health Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-hud font-bold text-slate-200 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            SUBSYSTEM INTEGRITY MATRIX
          </h2>
          <Link
            to="/mission-control/subsystems"
            className="text-xs font-hud tracking-wider text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
          >
            DETAILED DIAGNOSTICS <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {subsystemCards.map((sub) => {
            const Icon = sub.icon;
            const isWarn = sub.status === 'WARNING';
            const isCrit = sub.status === 'CRITICAL';
            return (
              <div
                key={sub.id}
                className={`hud-panel hud-corner p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                  isCrit
                    ? 'border-rose-500/70 bg-rose-950/20 shadow-[0_0_16px_rgba(244,63,94,0.3)]'
                    : isWarn
                    ? 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'border-[#16243f] hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-hud font-bold text-slate-200 truncate">{sub.name}</span>
                  <Icon className={`w-4 h-4 ${sub.color}`} />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className={`text-2xl font-display font-black ${
                    isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-slate-100'
                  }`}>
                    {sub.health}%
                  </span>
                  <span className={`text-[10px] telemetry-mono font-bold px-1.5 py-0.5 rounded ${
                    isCrit
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/60 animate-pulse'
                      : isWarn
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  }`}>
                    {sub.status}
                  </span>
                </div>

                {/* Micro parameters */}
                <div className="border-t border-[#16243f] pt-2 space-y-1 text-[11px] telemetry-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>{sub.label1}:</span>
                    <span className="text-slate-200 font-semibold">{sub.val1}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{sub.label2}:</span>
                    <span className="text-slate-200 font-semibold">{sub.val2}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Telemetry Stream & Live Alerts Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live Telemetry Chart */}
        <div className="lg:col-span-2 hud-panel hud-corner p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3 border-b border-[#16243f] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
              <span className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest">
                LIVE TELEMETRY WAVEFORMS (1Hz STREAM)
              </span>
            </div>
            <Link to="/mission-control/telemetry" className="text-xs font-hud tracking-wider text-cyan-400 hover:text-cyan-300 font-bold">
              FULL TELEMETRY SUITE →
            </Link>
          </div>
          <div className="h-64 w-full">
            <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Live Alerts Feed */}
        <div className="hud-panel hud-corner p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#16243f] pb-2.5">
              <span className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                INCIDENT ALERTS FEED
              </span>
              <span className="text-[10px] telemetry-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                LIVE 1Hz
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {anomalies.length > 0 ? (
                anomalies.map((anom: any) => (
                  <div
                    key={anom.id}
                    className="p-3 rounded-lg bg-[#0b1324]/90 border border-rose-900/60 text-xs telemetry-mono space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400 flex items-center gap-1.5 font-hud tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                        {anom.subsystem.toUpperCase()} ANOMALY
                      </span>
                      <span className="text-[10px] text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800/60 font-bold">
                        SCORE: {Math.round(anom.score * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{anom.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-[#13223d]">
                      <span>CH: {anom.channel}</span>
                      <Link
                        to="/mission-control/anomalies"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                      >
                        INVESTIGATE →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-lg bg-[#07101f]/80 border border-[#14233e] text-center text-xs telemetry-mono text-slate-400 space-y-3 my-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
                  <p className="font-sans text-slate-300 text-xs">
                    All telemetry channels nominal. Zero anomalous signatures detected across NASA benchmark channels.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#16243f] pt-3 mt-3 flex justify-between items-center text-[11px] telemetry-mono text-slate-400">
            <span className="font-hud tracking-wider">NASA SMAP/MSL VALIDATION:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
