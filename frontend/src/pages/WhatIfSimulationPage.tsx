import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import { api } from '../services/api';
import ReactECharts from 'echarts-for-react';
import {
  Sliders,
  Play,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Battery,
  Zap,
  Radio,
  Rocket
} from 'lucide-react';

export const WhatIfSimulationPage: React.FC = () => {
  const { telemetry } = useTelemetry();
  const location = useLocation();

  // Simulation parameter states
  const [solarReduction, setSolarReduction] = useState<number>(0);
  const [coolingFailure, setCoolingFailure] = useState<number>(45);
  const [powerLoadIncrease, setPowerLoadIncrease] = useState<number>(20);
  const [commDegradation, setCommDegradation] = useState<number>(0);
  const [thrusterDrop, setThrusterDrop] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(6.0);

  const [simResult, setSimResult] = useState<any | null>(null);
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.prefill) {
      const p = state.prefill;
      if (p.cooling_failure_percent !== undefined) setCoolingFailure(p.cooling_failure_percent);
      if (p.solar_power_reduction !== undefined) setSolarReduction(p.solar_power_reduction);
      if (p.power_load_increase !== undefined) setPowerLoadIncrease(p.power_load_increase);
      if (p.duration_hours !== undefined) setDurationHours(p.duration_hours);

      setRunning(true);
      api.runWhatIf({
        scenario: state.title || 'Mitigation Action Assessment',
        solar_power_reduction: p.solar_power_reduction || 0,
        cooling_failure_percent: p.cooling_failure_percent || 0,
        power_load_increase: p.power_load_increase || 0,
        communication_degradation: p.communication_degradation || 0,
        thruster_pressure_drop: p.thruster_pressure_drop || 0,
        duration_hours: p.duration_hours || 6.0
      })
        .then((res) => {
          setSimResult(res);
          setRunning(false);
        })
        .catch(() => setRunning(false));
    }
  }, [location.state]);

  // Preset Scenario Handlers
  const applyPreset = (type: string) => {
    if (type === 'cooling') {
      setSolarReduction(0);
      setCoolingFailure(65);
      setPowerLoadIncrease(25);
      setCommDegradation(0);
      setThrusterDrop(0);
    } else if (type === 'solar') {
      setSolarReduction(40);
      setCoolingFailure(0);
      setPowerLoadIncrease(0);
      setCommDegradation(0);
      setThrusterDrop(0);
    } else if (type === 'battery') {
      setSolarReduction(15);
      setCoolingFailure(20);
      setPowerLoadIncrease(35);
      setCommDegradation(0);
      setThrusterDrop(0);
    } else if (type === 'nominal') {
      setSolarReduction(0);
      setCoolingFailure(0);
      setPowerLoadIncrease(0);
      setCommDegradation(0);
      setThrusterDrop(0);
    }
  };

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      const res = await api.runWhatIf({
        scenario: 'Counterfactual Scenario Assessment',
        solar_power_reduction: solarReduction,
        cooling_failure_percent: coolingFailure,
        power_load_increase: powerLoadIncrease,
        communication_degradation: commDegradation,
        thruster_pressure_drop: thrusterDrop,
        duration_hours: durationHours
      });
      setSimResult(res);
      setRunning(false);
    } catch (e) {
      console.error(e);
      setRunning(false);
    }
  };

  // Trajectory Dual-Line Option
  const trajectoryOption = simResult ? {
    backgroundColor: 'transparent',
    grid: { left: 45, right: 25, top: 35, bottom: 25 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 14, 28, 0.95)',
      borderColor: '#1e3a66',
      textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'JetBrains Mono' }
    },
    legend: {
      data: ['Without Intervention (Health %)', 'With Mitigated Intervention (Health %)', 'Unmitigated Temp (°C)'],
      textStyle: { color: '#94a3b8', fontSize: 11, fontFamily: 'Inter' },
      top: 0
    },
    xAxis: {
      type: 'category',
      data: simResult.trajectories.map((p: any) => `T+${p.hour}h`),
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
        name: 'Without Intervention (Health %)',
        type: 'line',
        data: simResult.trajectories.map((p: any) => p.unmitigated_health),
        smooth: true,
        lineStyle: { width: 2.5, color: '#f43f5e', type: 'dashed' }
      },
      {
        name: 'With Mitigated Intervention (Health %)',
        type: 'line',
        data: simResult.trajectories.map((p: any) => p.mitigated_health),
        smooth: true,
        lineStyle: { width: 3, color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
              { offset: 1, color: 'transparent' }
            ]
          }
        }
      },
      {
        name: 'Unmitigated Temp (°C)',
        type: 'line',
        data: simResult.trajectories.map((p: any) => p.unmitigated_temp),
        smooth: true,
        lineStyle: { width: 1.5, color: '#f59e0b' }
      }
    ]
  } : null;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            MISSION SCENARIO SIMULATOR (WHAT-IF)
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Evaluate counterfactual degradation scenarios and test mitigations before uplink.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#071328]/90 p-1.5 rounded-lg border border-[#16243f] text-xs telemetry-mono shadow-sm">
          <span className="text-slate-400 font-hud font-bold uppercase text-[10px] px-1.5">
            PRESETS:
          </span>
          <button
            onClick={() => applyPreset('cooling')}
            className="px-2.5 py-1 rounded bg-[#0d1c38] hover:bg-[#152a52] text-rose-300 font-hud tracking-wider uppercase text-[11px] font-bold cursor-pointer transition-all border border-rose-900/40"
          >
            Cooling Loss
          </button>
          <button
            onClick={() => applyPreset('solar')}
            className="px-2.5 py-1 rounded bg-[#0d1c38] hover:bg-[#152a52] text-amber-300 font-hud tracking-wider uppercase text-[11px] font-bold cursor-pointer transition-all border border-amber-900/40"
          >
            Solar Drop
          </button>
          <button
            onClick={() => applyPreset('battery')}
            className="px-2.5 py-1 rounded bg-[#0d1c38] hover:bg-[#152a52] text-cyan-300 font-hud tracking-wider uppercase text-[11px] font-bold cursor-pointer transition-all border border-cyan-900/40"
          >
            Power Surge
          </button>
          <button
            onClick={() => applyPreset('nominal')}
            className="px-2.5 py-1 rounded bg-[#0d1c38] hover:bg-[#152a52] text-emerald-300 font-hud tracking-wider uppercase text-[11px] font-bold cursor-pointer transition-all border border-emerald-900/40"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Controls Sliders (1 Col) */}
        <div className="hud-panel hud-corner p-5 rounded-xl space-y-4 border border-[#16243f]">
          <h2 className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest border-b border-[#16243f] pb-2.5 flex items-center justify-between">
            <span>SCENARIO PARAMETERS</span>
            <span className="text-[10px] text-cyan-400 font-normal telemetry-mono">HORIZON: {durationHours}H</span>
          </h2>

          {/* Cooling Loop Slider */}
          <div className="space-y-1.5 telemetry-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-hud tracking-wider font-bold">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Cooling Loop Degradation:
              </span>
              <span className="font-bold text-rose-400 font-display">{coolingFailure}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={coolingFailure}
              onChange={(e) => setCoolingFailure(Number(e.target.value))}
              className="w-full accent-rose-500 bg-[#0a1428] rounded cursor-pointer"
            />
          </div>

          {/* Solar Power Reduction */}
          <div className="space-y-1.5 telemetry-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-hud tracking-wider font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Solar Power Reduction:
              </span>
              <span className="font-bold text-amber-400 font-display">{solarReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={solarReduction}
              onChange={(e) => setSolarReduction(Number(e.target.value))}
              className="w-full accent-amber-500 bg-[#0a1428] rounded cursor-pointer"
            />
          </div>

          {/* Power Load Increase */}
          <div className="space-y-1.5 telemetry-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-hud tracking-wider font-bold">
                <Battery className="w-3.5 h-3.5 text-cyan-400" />
                Bus Power Load Surge:
              </span>
              <span className="font-bold text-cyan-300 font-display">+{powerLoadIncrease}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="60"
              value={powerLoadIncrease}
              onChange={(e) => setPowerLoadIncrease(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-[#0a1428] rounded cursor-pointer"
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-1.5 telemetry-mono text-xs pt-2.5 border-t border-[#16243f]">
            <div className="flex justify-between text-slate-300">
              <span className="font-hud tracking-wider font-bold">Projection Horizon:</span>
              <span className="font-bold text-slate-100 font-display">{durationHours} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-[#0a1428] rounded cursor-pointer"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunSimulation}
            disabled={running}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-hud text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {running ? 'CALCULATING ORBITAL TRAJECTORY...' : 'RUN WHAT-IF SIMULATION'}
          </button>
        </div>

        {/* Results Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {simResult ? (
            <div className="hud-panel hud-corner p-5 rounded-xl space-y-4 border border-[#16243f]">
              <div className="flex items-center justify-between border-b border-[#16243f] pb-3">
                <div>
                  <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
                    SIMULATION FORECAST OUTCOME
                  </div>
                  <h3 className="text-sm font-display font-bold text-slate-100">
                    BASELINE vs COUNTERFACTUAL PROJECTION ({durationHours}h)
                  </h3>
                </div>
                <div className={`px-3 py-1 rounded-md text-xs telemetry-mono font-bold border ${
                  simResult.recovery_possible
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-950 text-rose-300 border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                }`}>
                  {simResult.recovery_possible ? '✓ MITIGATION FEASIBLE' : '⚠ CRITICAL FAILURE PROJECTED'}
                </div>
              </div>

              {/* Side-by-side metric comparison */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 telemetry-mono text-xs">
                <div className="p-3.5 rounded-lg bg-[#091222]/90 border border-[#16243f]">
                  <div className="text-slate-400 text-[10px] font-hud uppercase tracking-wider font-bold">
                    CURRENT HEALTH
                  </div>
                  <div className="text-xl font-display font-black text-slate-100 mt-1">{simResult.current_state.health}%</div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#091222]/90 border border-rose-900/60">
                  <div className="text-slate-400 text-[10px] font-hud uppercase tracking-wider font-bold">
                    WITHOUT ACTION
                  </div>
                  <div className="text-xl font-display font-black text-rose-400 mt-1">{simResult.simulated_state.unmitigated_health}%</div>
                  <div className="text-[10px] text-slate-400">Bus: {simResult.simulated_state.unmitigated_temp}°C</div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#091222]/90 border border-emerald-900/60">
                  <div className="text-slate-400 text-[10px] font-hud uppercase tracking-wider font-bold">
                    WITH MITIGATION
                  </div>
                  <div className="text-xl font-display font-black text-emerald-400 mt-1">{simResult.simulated_state.mitigated_health}%</div>
                  <div className="text-[10px] text-slate-400">Bus: {simResult.simulated_state.mitigated_temp}°C</div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#091222]/90 border border-cyan-900/60">
                  <div className="text-slate-400 text-[10px] font-hud uppercase tracking-wider font-bold">
                    BATTERY RECOVERED
                  </div>
                  <div className="text-xl font-display font-black text-cyan-300 mt-1">{simResult.simulated_state.mitigated_battery}%</div>
                  <div className="text-[10px] text-slate-400">SoC maintained</div>
                </div>
              </div>

              {/* Trajectory Forecast Chart */}
              <div className="h-60 w-full pt-2">
                <ReactECharts option={trajectoryOption} style={{ height: '100%', width: '100%' }} />
              </div>

              {/* Summary and Action Recommendation */}
              <div className="p-4 rounded-xl bg-[#060e1d]/90 border border-[#14223d] space-y-2 telemetry-mono text-xs">
                <div className="text-slate-400 text-[10px] font-hud uppercase tracking-widest font-bold">
                  PHYSICS MODEL NARRATIVE:
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">{simResult.outcome_summary}</p>
                <div className="pt-2 border-t border-[#121e36] text-[11px] text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Operator Directive:</strong> {simResult.recommended_mitigation}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="hud-panel hud-corner p-14 rounded-xl text-center space-y-3 font-mono text-slate-400 border border-[#16243f]">
              <Sliders className="w-14 h-14 text-cyan-500/40 mx-auto animate-pulse" />
              <div className="text-base font-hud font-bold text-slate-200 tracking-wider">
                SIMULATOR STANDING BY
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
                Adjust degradation sliders or select a preset scenario, then click "RUN WHAT-IF SIMULATION" to calculate counterfactual future trajectories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
