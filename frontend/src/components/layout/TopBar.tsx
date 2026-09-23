import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Activity, Play, Pause, RotateCcw, Zap, Flame, Battery, Radio, Rocket, Sun, ShieldAlert, Cpu } from 'lucide-react';
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
    speedMultiplier
  } = useTelemetry();

  // Format Mission Elapsed Time (MET)
  const metSeconds = telemetry?.mission_elapsed_seconds || 3648240;
  const days = Math.floor(metSeconds / 86400);
  const hours = Math.floor((metSeconds % 86400) / 3600);
  const minutes = Math.floor((metSeconds % 3600) / 60);
  const seconds = metSeconds % 60;
  const metFormatted = `MET: ${String(days).padStart(3, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentMode = telemetry?.operating_mode || 'NORMAL';
  const overallHealth = telemetry?.overall_health ?? 95.0;

  const getHealthBadgeClass = (health: number) => {
    if (health >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
    if (health >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/40 animate-pulse';
  };

  return (
    <header className="w-full bg-[#050b16] border-b border-[#16243f] text-slate-200 px-4 py-2.5 flex flex-col xl:flex-row items-center justify-between gap-3 select-none sticky top-0 z-40 shadow-xl">
      {/* Spacecraft ID & Telemetry Status */}
      <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-sm bg-[#071329] border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-slate-100">ORBITAL TWIN</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 font-mono">SPACECRAFT-01</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>MISSION: ORBITAL-X</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-mono">{metFormatted}</span>
            </div>
          </div>
        </Link>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#071224] border border-[#162947]">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span className={`text-[11px] font-mono uppercase font-semibold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isConnected ? '● LIVE' : 'DISCONNECTED'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">1Hz</span>
          </div>

          {/* Overall Health Gauge Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs ${getHealthBadgeClass(overallHealth)}`}>
            <span>HEALTH:</span>
            <span className="font-bold text-sm">{overallHealth}%</span>
          </div>
        </div>
      </div>

      {/* Global Hackathon Demo Scenario Control Panel */}
      <div className="flex flex-wrap items-center gap-1.5 justify-center w-full xl:w-auto bg-[#070e1c] p-1.5 rounded border border-[#14213d]">
        <span className="text-[10px] text-slate-400 font-mono uppercase px-1.5 flex items-center gap-1 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          SCENARIO:
        </span>

        <button
          onClick={() => triggerScenario('NORMAL')}
          className={`px-2 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
            currentMode === 'NORMAL'
              ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-500/40'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-emerald-300'
          }`}
          title="Nominal spacecraft operation"
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          NORMAL
        </button>

        <button
          onClick={() => triggerScenario('THERMAL_DEGRADATION')}
          className={`px-2 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
            currentMode === 'THERMAL_DEGRADATION'
              ? 'bg-rose-600 text-white font-bold shadow-sm shadow-rose-500/40 animate-pulse'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-rose-300'
          }`}
          title="Simulate radiator cooling loop failure"
        >
          <Flame className="w-3 h-3 text-rose-400" />
          THERMAL DEGRADATION
        </button>

        <button
          onClick={() => triggerScenario('BATTERY_FAILURE')}
          className={`px-2 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
            currentMode === 'BATTERY_FAILURE'
              ? 'bg-amber-600 text-white font-bold shadow-sm shadow-amber-500/40 animate-pulse'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-amber-300'
          }`}
          title="Simulate battery internal resistance spike"
        >
          <Battery className="w-3 h-3 text-amber-400" />
          BATTERY FAULT
        </button>

        <button
          onClick={() => triggerScenario('COMMUNICATION_FAILURE')}
          className={`px-2 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
            currentMode === 'COMMUNICATION_FAILURE'
              ? 'bg-amber-600 text-white font-bold shadow-sm shadow-amber-500/40'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-amber-300'
          }`}
          title="Simulate antenna pointing jitter & packet loss"
        >
          <Radio className="w-3 h-3 text-cyan-400" />
          COMMS LOSS
        </button>

        <button
          onClick={() => triggerScenario('PROPULSION_ANOMALY')}
          className={`px-2 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
            currentMode === 'PROPULSION_ANOMALY'
              ? 'bg-purple-600 text-white font-bold shadow-sm shadow-purple-500/40'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-purple-300'
          }`}
          title="Simulate propellant valve leak"
        >
          <Rocket className="w-3 h-3 text-purple-400" />
          PROPULSION
        </button>

        <button
          onClick={() => triggerScenario('SOLAR_POWER_DROP')}
          className={`px-2 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
            currentMode === 'SOLAR_POWER_DROP'
              ? 'bg-amber-600 text-white font-bold shadow-sm shadow-amber-500/40'
              : 'bg-[#0d182e] text-slate-300 hover:bg-[#152445] hover:text-amber-300'
          }`}
          title="Simulate solar array output collapse"
        >
          <Sun className="w-3 h-3 text-amber-400" />
          SOLAR DROP
        </button>
      </div>

      {/* Playback Controls & Speed Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#071224] rounded border border-[#162947] p-0.5">
          <button
            onClick={() => (isSimRunning ? pauseSimulation() : startSimulation())}
            className="p-1.5 rounded hover:bg-[#112340] text-slate-300 hover:text-cyan-400 transition-colors"
            title={isSimRunning ? 'Pause Simulation' : 'Start Simulation'}
          >
            {isSimRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded hover:bg-[#112340] text-slate-400 hover:text-rose-400 transition-colors"
            title="Reset Digital Twin State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed multiplier selector */}
        <div className="flex items-center bg-[#071224] rounded border border-[#162947] text-[11px] font-mono overflow-hidden">
          {[1.0, 2.0, 5.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={`px-2 py-1 transition-colors ${
                speedMultiplier === spd ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
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
