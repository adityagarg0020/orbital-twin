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
    grid: { left: 45, right: 20, top: 30, bottom: 25 },
    tooltip: { trigger: 'axis', backgroundColor: '#070e1e', textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'monospace' } },
    legend: { data: ['Bus Temp (°C)', 'Radiator Surface (°C)', 'Cooling Eff (%)'], textStyle: { color: '#94a3b8', fontSize: 11 } },
    xAxis: { type: 'category', data: timeLabels, axisLine: { lineStyle: { color: '#16243f' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#0d182b' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
    series: [
      { name: 'Bus Temp (°C)', type: 'line', data: recentHistory.map(h => h.temperature), smooth: true, lineStyle: { width: 2, color: '#f43f5e' } },
      { name: 'Radiator Surface (°C)', type: 'line', data: recentHistory.map(h => h.radiator_temp), smooth: true, lineStyle: { width: 1.5, color: '#00f0ff' } },
      { name: 'Cooling Eff (%)', type: 'line', data: recentHistory.map(h => h.cooling_efficiency), smooth: true, lineStyle: { width: 1.5, color: '#10b981', type: 'dashed' } }
    ]
  };

  // Battery & Power Option
  const powerOption = {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 20, top: 30, bottom: 25 },
    tooltip: { trigger: 'axis', backgroundColor: '#070e1e', textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'monospace' } },
    legend: { data: ['Battery SoC (%)', 'Bus Voltage (V)', 'Current (A)'], textStyle: { color: '#94a3b8', fontSize: 11 } },
    xAxis: { type: 'category', data: timeLabels, axisLine: { lineStyle: { color: '#16243f' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#0d182b' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
    series: [
      { name: 'Battery SoC (%)', type: 'line', data: recentHistory.map(h => h.battery), smooth: true, lineStyle: { width: 2, color: '#10b981' } },
      { name: 'Bus Voltage (V)', type: 'line', data: recentHistory.map(h => h.battery_voltage), smooth: true, lineStyle: { width: 2, color: '#00f0ff' } },
      { name: 'Current (A)', type: 'line', data: recentHistory.map(h => h.battery_current), smooth: true, lineStyle: { width: 1.5, color: '#f59e0b', type: 'dotted' } }
    ]
  };

  // RF Communication Option
  const commOption = {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 20, top: 30, bottom: 25 },
    tooltip: { trigger: 'axis', backgroundColor: '#070e1e', textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'monospace' } },
    legend: { data: ['Signal (%)', 'Packet Loss (%)', 'SNR (dB)'], textStyle: { color: '#94a3b8', fontSize: 11 } },
    xAxis: { type: 'category', data: timeLabels, axisLine: { lineStyle: { color: '#16243f' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#0d182b' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
    series: [
      { name: 'Signal (%)', type: 'line', data: recentHistory.map(h => h.communication_signal), smooth: true, lineStyle: { width: 2, color: '#00f0ff' } },
      { name: 'Packet Loss (%)', type: 'line', data: recentHistory.map(h => h.packet_loss), smooth: true, lineStyle: { width: 2, color: '#f43f5e' } },
      { name: 'SNR (dB)', type: 'line', data: recentHistory.map(h => h.snr), smooth: true, lineStyle: { width: 1.5, color: '#8b5cf6', type: 'dashed' } }
    ]
  };

  return (
    <div className="space-y-5">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f] pb-3">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            TELEMETRY MATRIX & SENSOR STREAMS
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            High-frequency multi-node telemetry acquired continuously from physical bus and simulated subsystems.
          </p>
        </div>

        {/* Time filters: 5m, 30m, 1h, 6h, 24h */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            TIME:
          </span>
          <div className="flex bg-[#071224] rounded border border-[#162947] text-xs font-mono p-0.5">
            {['5m', '30m', '1h', '6h', '24h'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeFilter === tf ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sensor Metric Tickers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono">
        <div className="aerospace-panel p-2.5 rounded">
          <div className="text-[10px] text-slate-400">BUS TEMP</div>
          <div className="text-base font-bold text-rose-400">{telemetry?.temperature ?? 24}°C</div>
          <div className="text-[9px] text-slate-500">Nominal: 24°C</div>
        </div>
        <div className="aerospace-panel p-2.5 rounded">
          <div className="text-[10px] text-slate-400">BATTERY SOC</div>
          <div className="text-base font-bold text-emerald-400">{telemetry?.battery ?? 92}%</div>
          <div className="text-[9px] text-slate-500">{telemetry?.battery_voltage ?? 28.2}V</div>
        </div>
        <div className="aerospace-panel p-2.5 rounded">
          <div className="text-[10px] text-slate-400">SOLAR GEN</div>
          <div className="text-base font-bold text-cyan-400">{telemetry?.solar_power ?? 1450}W</div>
          <div className="text-[9px] text-slate-500">Load: {telemetry?.power_consumption ?? 820}W</div>
        </div>
        <div className="aerospace-panel p-2.5 rounded">
          <div className="text-[10px] text-slate-400">FUEL PRESS</div>
          <div className="text-base font-bold text-purple-400">{telemetry?.fuel_pressure ?? 220} bar</div>
          <div className="text-[9px] text-slate-500">Chamber: {telemetry?.thruster_pressure ?? 18.5}b</div>
        </div>
        <div className="aerospace-panel p-2.5 rounded">
          <div className="text-[10px] text-slate-400">PACKET LOSS</div>
          <div className="text-base font-bold text-cyan-300">{telemetry?.packet_loss ?? 0.05}%</div>
          <div className="text-[9px] text-slate-500">SNR: {telemetry?.snr ?? 28.5}dB</div>
        </div>
        <div className="aerospace-panel p-2.5 rounded">
          <div className="text-[10px] text-slate-400">CPU LOAD</div>
          <div className="text-base font-bold text-slate-200">{telemetry?.cpu ?? 38}%</div>
          <div className="text-[9px] text-slate-500">Core: {telemetry?.cpu_temp ?? 42}°C</div>
        </div>
        <div className="aerospace-panel p-2.5 rounded">
          <div className="text-[10px] text-slate-400">WHEEL RPM</div>
          <div className="text-base font-bold text-amber-400">{telemetry?.reaction_wheel_rpm ?? 3200}</div>
          <div className="text-[9px] text-slate-500">Jitter: &lt;0.05°</div>
        </div>
      </div>

      {/* Main Graphs Area */}
      <div className="space-y-4">
        {/* Thermal Waveforms */}
        <div className="aerospace-panel p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              THERMAL TELEMETRY & RADIATOR CHANNELS
            </h3>
            <span className="text-[10px] font-mono text-slate-500">CH-TCS-01 TO 03</span>
          </div>
          <div className="h-56 w-full">
            <ReactECharts option={thermalOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Battery & Power Net Waveforms */}
        <div className="aerospace-panel p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              ELECTRICAL POWER BUS & BATTERY STATE-OF-CHARGE
            </h3>
            <span className="text-[10px] font-mono text-slate-500">CH-EPS-01 TO 03</span>
          </div>
          <div className="h-56 w-full">
            <ReactECharts option={powerOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Communications & Link Budget */}
        <div className="aerospace-panel p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              TT&C RF LINK BUDGET & PACKET ERROR RATE
            </h3>
            <span className="text-[10px] font-mono text-slate-500">CH-TTC-01 TO 03</span>
          </div>
          <div className="h-56 w-full">
            <ReactECharts option={commOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
