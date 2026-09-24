import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  Battery,
  Radio,
  Rocket,
  Sun,
  ShieldAlert,
  Cpu,
  Database,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopBar: React.FC = () => {
  const {
    telemetry,
    isConnected,
    isSimRunning,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    triggerScenario,
    setSpeed,
    speedMultiplier,
    dataSource
  } = useTelemetry();

  // Format Mission Elapsed Time (MET)
  const metSeconds = telemetry?.mission_elapsed_seconds || 3648240;
  const days = Math.floor(metSeconds / 86400);
  const hours = Math.floor((metSeconds % 86400) / 3600);
  const minutes = Math.floor((metSeconds % 3600) / 60);
  const seconds = metSeconds % 60;
  const metFormatted = `${String(days).padStart(3, '0')}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentMode = telemetry?.operating_mode || 'NORMAL';
  const overallHealth = telemetry?.overall_health ?? 95.0;

  const getHealthBadgeClass = (health: number) => {
    if (health >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40 shadow-emerald-500/20';
    if (health >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-950/40 shadow-amber-500/20';
    return 'text-rose-400 border-rose-500/50 bg-rose-950/40 shadow-rose-500/30 animate-pulse';
  };

  return (
    <header className="w-full bg-[#050b16]/90 backdrop-blur-xl border-b border-[#16243f]/90 text-slate-100 px-4 py-2.5 flex flex-col xl:flex-row items-center justify-between gap-3 select-none sticky top-0 z-40 shadow-2xl transition-all">
      {/* Spacecraft ID & Telemetry Status */}
      <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded bg-[#071329] border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
                ORBITAL TWIN
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-700/50 telemetry-mono font-semibold tracking-wider">
                SC-01
              </span>
            </div>
            <div className="text-[11px] text-slate-400 telemetry-mono flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold tracking-wide">LEO ORBIT</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-medium">MET: {metFormatted}</span>
            </div>
          </div>
        </Link>

        {/* Live Status & Health */}
        <div className="flex items-center gap-2.5">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#071224]/80 border border-[#162947] backdrop-blur-sm">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping' : 'bg-rose-500'}`} />
            <span className={`text-[11px] telemetry-mono font-bold tracking-wider ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isConnected ? 'LIVE 1Hz' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Overall Health Gauge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded border telemetry-mono text-xs shadow-sm ${getHealthBadgeClass(overallHealth)}`}>
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400">HEALTH</span>
            <span className="font-bold text-sm">{overallHealth}%</span>
          </div>

          {/* Data Source Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#071224]/80 border border-[#162947] telemetry-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase">SRC:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
              dataSource === 'UPLOADED DATA'
                ? 'bg-purple-950 text-purple-300 border border-purple-600/50 animate-pulse'
                : dataSource === 'NASA DATA'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
            }`}>
              {dataSource || 'SIMULATION'}
            </span>
          </div>

          {/* Link to Data Lab */}
          <Link
            to="/mission-control/data-lab"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 hover:text-white telemetry-mono text-xs transition-all hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            title="Telemetry Data Lab - CSV Upload & Parameter Injection"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-[11px]">DATA LAB</span>
          </Link>
        </div>
      </div>

      {/* Global Hackathon Demo Scenario Control Panel */}
      <div className="flex flex-wrap items-center gap-1 justify-center w-full xl:w-auto bg-[#070e1c]/90 p-1.5 rounded-lg border border-[#16243f] shadow-inner">
        <span className="text-[10px] text-slate-400 font-hud tracking-wider uppercase px-2 flex items-center gap-1 font-bold">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          SCENARIO:
        </span>

        <button
          onClick={() => triggerScenario('NORMAL')}
          className={`px-2.5 py-1 rounded text-[11px] telemetry-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentMode === 'NORMAL'
              ? 'bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-emerald-300 border border-transparent'
          }`}
          title="Nominal spacecraft operation"
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          NORMAL
        </button>

        <button
          onClick={() => triggerScenario('THERMAL_DEGRADATION')}
          className={`px-2.5 py-1 rounded text-[11px] telemetry-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentMode === 'THERMAL_DEGRADATION'
              ? 'bg-rose-600 text-white font-bold shadow-[0_0_14px_rgba(244,63,94,0.6)] border border-rose-400 animate-pulse'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-rose-300 border border-transparent'
          }`}
          title="Simulate radiator cooling loop failure"
        >
          <Flame className="w-3 h-3 text-rose-400" />
          THERMAL
        </button>

        <button
          onClick={() => triggerScenario('BATTERY_FAILURE')}
          className={`px-2.5 py-1 rounded text-[11px] telemetry-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentMode === 'BATTERY_FAILURE'
              ? 'bg-amber-600 text-white font-bold shadow-[0_0_14px_rgba(245,158,11,0.6)] border border-amber-400 animate-pulse'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-amber-300 border border-transparent'
          }`}
          title="Simulate battery internal resistance spike"
        >
          <Battery className="w-3 h-3 text-amber-400" />
          BATTERY
        </button>

        <button
          onClick={() => triggerScenario('COMMUNICATION_FAILURE')}
          className={`px-2.5 py-1 rounded text-[11px] telemetry-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentMode === 'COMMUNICATION_FAILURE'
              ? 'bg-cyan-600 text-white font-bold shadow-[0_0_14px_rgba(0,240,255,0.6)] border border-cyan-400 animate-pulse'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-cyan-300 border border-transparent'
          }`}
          title="Simulate antenna pointing jitter & packet loss"
        >
          <Radio className="w-3 h-3 text-cyan-400" />
          COMMS
        </button>

        <button
          onClick={() => triggerScenario('PROPULSION_ANOMALY')}
          className={`px-2.5 py-1 rounded text-[11px] telemetry-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentMode === 'PROPULSION_ANOMALY'
              ? 'bg-purple-600 text-white font-bold shadow-[0_0_14px_rgba(168,85,247,0.6)] border border-purple-400'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-purple-300 border border-transparent'
          }`}
          title="Simulate propellant valve leak"
        >
          <Rocket className="w-3 h-3 text-purple-400" />
          PROPULSION
        </button>

        <button
          onClick={() => triggerScenario('SOLAR_POWER_DROP')}
          className={`px-2.5 py-1 rounded text-[11px] telemetry-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentMode === 'SOLAR_POWER_DROP'
              ? 'bg-amber-600 text-white font-bold shadow-[0_0_14px_rgba(245,158,11,0.6)] border border-amber-400'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-amber-300 border border-transparent'
          }`}
          title="Simulate solar array output collapse"
        >
          <Sun className="w-3 h-3 text-amber-400" />
          SOLAR DROP
        </button>
      </div>

      {/* Playback Controls & Speed Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#071224] rounded-md border border-[#162947] p-0.5 shadow-sm">
          <button
            onClick={() => (isSimRunning ? pauseSimulation() : startSimulation())}
            className="p-1.5 rounded hover:bg-[#112340] text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            title={isSimRunning ? 'Pause Simulation' : 'Start Simulation'}
          >
            {isSimRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded hover:bg-[#112340] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Reset Digital Twin State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed multiplier selector */}
        <div className="flex items-center bg-[#071224] rounded-md border border-[#162947] text-[11px] telemetry-mono overflow-hidden shadow-sm">
          {[1.0, 2.0, 5.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={`px-2 py-1 transition-all cursor-pointer ${
                speedMultiplier === spd
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1930]'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
