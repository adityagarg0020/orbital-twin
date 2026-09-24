import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import ReactECharts from 'echarts-for-react';
import {
  LineChart,
  Filter,
  Flame,
  Battery,
  Zap,
  Rocket,
  Radio,
  Compass,
  Cpu,
  RefreshCw
} from 'lucide-react';

export const TelemetryPage: React.FC = () => {
  const { telemetry, history } = useTelemetry();
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('5m');

  // Chart data extraction based on time filter
  const sampleCount = timeFilter === '5m' ? 30 : timeFilter === '30m' ? 60 : 100;
  const recentHistory = history.slice(-sampleCount);
  const timeLabels = recentHistory.map((_, i) => `${-(recentHistory.length - i)}s`);

  // Thermal Chart Option
  const thermalOption = {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 20, top: 32, bottom: 25 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 14, 28, 0.95)',
      borderColor: '#1e3a66',
      textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'JetBrains Mono' }
    },
    legend: {
      data: ['Bus Temp (°C)', 'Radiator Surface (°C)', 'Cooling Eff (%)'],
      textStyle: { color: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }
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
      { name: 'Bus Temp (°C)', type: 'line', data: recentHistory.map(h => h.temperature), smooth: true, lineStyle: { width: 2, color: '#f43f5e' } },
      { name: 'Radiator Surface (°C)', type: 'line', data: recentHistory.map(h => h.radiator_temp), smooth: true, lineStyle: { width: 1.8, color: '#00f0ff' } },
      { name: 'Cooling Eff (%)', type: 'line', data: recentHistory.map(h => h.cooling_efficiency), smooth: true, lineStyle: { width: 1.8, color: '#10b981', type: 'dashed' } }
    ]
  };

  // Battery & Power Option
  const powerOption = {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 20, top: 32, bottom: 25 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 14, 28, 0.95)',
      borderColor: '#1e3a66',
      textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'JetBrains Mono' }
    },
    legend: {
      data: ['Battery SoC (%)', 'Bus Voltage (V)', 'Current (A)'],
      textStyle: { color: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }
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
      { name: 'Battery SoC (%)', type: 'line', data: recentHistory.map(h => h.battery), smooth: true, lineStyle: { width: 2, color: '#10b981' } },
      { name: 'Bus Voltage (V)', type: 'line', data: recentHistory.map(h => h.battery_voltage), smooth: true, lineStyle: { width: 2, color: '#00f0ff' } },
      { name: 'Current (A)', type: 'line', data: recentHistory.map(h => h.battery_current), smooth: true, lineStyle: { width: 1.8, color: '#f59e0b', type: 'dotted' } }
    ]
  };

  // RF Communication Option
  const commOption = {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 20, top: 32, bottom: 25 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 14, 28, 0.95)',
      borderColor: '#1e3a66',
      textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'JetBrains Mono' }
    },
    legend: {
      data: ['Signal (%)', 'Packet Loss (%)', 'SNR (dB)'],
      textStyle: { color: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }
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
      { name: 'Signal (%)', type: 'line', data: recentHistory.map(h => h.communication_signal), smooth: true, lineStyle: { width: 2, color: '#00f0ff' } },
      { name: 'Packet Loss (%)', type: 'line', data: recentHistory.map(h => h.packet_loss), smooth: true, lineStyle: { width: 2, color: '#f43f5e' } },
      { name: 'SNR (dB)', type: 'line', data: recentHistory.map(h => h.snr), smooth: true, lineStyle: { width: 1.8, color: '#a855f7', type: 'dashed' } }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <LineChart className="w-5 h-5 text-cyan-400" />
            TELEMETRY MATRIX & SENSOR STREAMS
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Continuous multi-node telemetry acquired from physical bus models and live sensors.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-hud tracking-wider uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            WINDOW:
          </span>
          <div className="flex bg-[#071224]/90 rounded-lg border border-[#162947] text-xs telemetry-mono p-1 shadow-sm">
            {['5m', '30m', '1h', '6h', '24h'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  timeFilter === tf
                    ? 'bg-cyan-600 text-white font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-[#0f1d38]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sensor Metric Tickers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 telemetry-mono">
        <div className="hud-panel hud-corner p-3.5 rounded-xl border border-[#16243f]">
          <div className="text-[10px] font-hud uppercase tracking-wider text-slate-400 font-bold">BUS TEMP</div>
          <div className="text-lg font-display font-black text-rose-400 mt-0.5">{telemetry?.temperature ?? 24}°C</div>
          <div className="text-[10px] text-slate-500">Nom: 24.0°C</div>
        </div>
        <div className="hud-panel hud-corner p-3.5 rounded-xl border border-[#16243f]">
          <div className="text-[10px] font-hud uppercase tracking-wider text-slate-400 font-bold">BATTERY SOC</div>
          <div className="text-lg font-display font-black text-emerald-400 mt-0.5">{telemetry?.battery ?? 92}%</div>
          <div className="text-[10px] text-slate-500">{telemetry?.battery_voltage ?? 28.2}V</div>
        </div>
        <div className="hud-panel hud-corner p-3.5 rounded-xl border border-[#16243f]">
          <div className="text-[10px] font-hud uppercase tracking-wider text-slate-400 font-bold">SOLAR GEN</div>
          <div className="text-lg font-display font-black text-cyan-400 mt-0.5">{telemetry?.solar_power ?? 1450}W</div>
          <div className="text-[10px] text-slate-500">Load: {telemetry?.power_consumption ?? 820}W</div>
        </div>
        <div className="hud-panel hud-corner p-3.5 rounded-xl border border-[#16243f]">
          <div className="text-[10px] font-hud uppercase tracking-wider text-slate-400 font-bold">FUEL PRESS</div>
          <div className="text-lg font-display font-black text-purple-400 mt-0.5">{telemetry?.fuel_pressure ?? 220} bar</div>
          <div className="text-[10px] text-slate-500">RCS: {telemetry?.thruster_pressure ?? 18.5}b</div>
        </div>
        <div className="hud-panel hud-corner p-3.5 rounded-xl border border-[#16243f]">
          <div className="text-[10px] font-hud uppercase tracking-wider text-slate-400 font-bold">PACKET LOSS</div>
          <div className="text-lg font-display font-black text-cyan-300 mt-0.5">{telemetry?.packet_loss ?? 0.05}%</div>
          <div className="text-[10px] text-slate-500">SNR: {telemetry?.snr ?? 28.5}dB</div>
        </div>
        <div className="hud-panel hud-corner p-3.5 rounded-xl border border-[#16243f]">
          <div className="text-[10px] font-hud uppercase tracking-wider text-slate-400 font-bold">CPU LOAD</div>
          <div className="text-lg font-display font-black text-slate-100 mt-0.5">{telemetry?.cpu ?? 38}%</div>
          <div className="text-[10px] text-slate-500">Core: {telemetry?.cpu_temp ?? 42}°C</div>
        </div>
        <div className="hud-panel hud-corner p-3.5 rounded-xl border border-[#16243f]">
          <div className="text-[10px] font-hud uppercase tracking-wider text-slate-400 font-bold">WHEEL RPM</div>
          <div className="text-lg font-display font-black text-amber-400 mt-0.5">{telemetry?.reaction_wheel_rpm ?? 3200}</div>
          <div className="text-[10px] text-slate-500">Jitter: &lt;0.05°</div>
        </div>
      </div>

      {/* Main Graphs Area */}
      <div className="space-y-5">
        {/* Thermal Waveforms */}
        <div className="hud-panel hud-corner p-5 rounded-xl border border-[#16243f]">
          <div className="flex items-center justify-between mb-3 border-b border-[#16243f] pb-2.5">
            <h3 className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              THERMAL TELEMETRY & RADIATOR CHANNELS
            </h3>
            <span className="text-[10px] telemetry-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
              CH-TCS-01 TO 03
            </span>
          </div>
          <div className="h-56 w-full">
            <ReactECharts option={thermalOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Battery & Power Net Waveforms */}
        <div className="hud-panel hud-corner p-5 rounded-xl border border-[#16243f]">
          <div className="flex items-center justify-between mb-3 border-b border-[#16243f] pb-2.5">
            <h3 className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              ELECTRICAL POWER BUS & BATTERY STATE-OF-CHARGE
            </h3>
            <span className="text-[10px] telemetry-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
              CH-EPS-01 TO 03
            </span>
          </div>
          <div className="h-56 w-full">
            <ReactECharts option={powerOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Communications & Link Budget */}
        <div className="hud-panel hud-corner p-5 rounded-xl border border-[#16243f]">
          <div className="flex items-center justify-between mb-3 border-b border-[#16243f] pb-2.5">
            <h3 className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              TT&C RF LINK BUDGET & PACKET ERROR RATE
            </h3>
            <span className="text-[10px] telemetry-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
              CH-TTC-01 TO 03
            </span>
          </div>
          <div className="h-56 w-full">
            <ReactECharts option={commOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
