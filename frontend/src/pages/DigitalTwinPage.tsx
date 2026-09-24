import React, { useState } from 'react';
import { SpacecraftCanvas } from '../components/three/SpacecraftCanvas';
import { useTelemetry } from '../context/TelemetryContext';
import {
  Box,
  Layers,
  Activity,
  AlertTriangle,
  RotateCw,
  Zap,
  Flame,
  Battery,
  Radio,
  Rocket,
  Compass,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DigitalTwinPage: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('Thermal');

  const subsystems = [
    {
      id: 'Thermal',
      icon: Flame,
      health: telemetry?.thermal_health ?? 95.0,
      status: (telemetry?.thermal_health ?? 95) < 70 ? 'CRITICAL' : ((telemetry?.thermal_health ?? 95) < 85 ? 'WARNING' : 'NOMINAL'),
      metrics: [
        { label: 'Bus Temperature', val: `${telemetry?.temperature ?? 24}°C` },
        { label: 'Radiator Surface', val: `${telemetry?.radiator_temp ?? -18}°C` },
        { label: 'Cooling Efficiency', val: `${telemetry?.cooling_efficiency ?? 100}%` }
      ],
      desc: 'Radiative cooling panels and loop pumps rejecting internal avionics and solar thermal loads.'
    },
    {
      id: 'Power',
      icon: Zap,
      health: telemetry?.power_health ?? 96.0,
      status: (telemetry?.power_health ?? 96) < 70 ? 'WARNING' : 'NOMINAL',
      metrics: [
        { label: 'Solar Generation', val: `${telemetry?.solar_power ?? 1450} W` },
        { label: 'Consumption', val: `${telemetry?.power_consumption ?? 820} W` },
        { label: 'Bus Voltage', val: `${telemetry?.bus_voltage ?? 28.1} V` }
      ],
      desc: 'Dual triple-junction GaAs deployable solar array wings generating regulated 28V power.'
    },
    {
      id: 'Battery',
      icon: Battery,
      health: telemetry?.battery_health_calc ?? 97.0,
      status: (telemetry?.battery_health_calc ?? 97) < 70 ? 'CRITICAL' : 'NOMINAL',
      metrics: [
        { label: 'State of Charge', val: `${telemetry?.battery ?? 92}%` },
        { label: 'Terminal Voltage', val: `${telemetry?.battery_voltage ?? 28.2} V` },
        { label: 'Pack Temp', val: `${telemetry?.battery_temperature ?? 21}°C` }
      ],
      desc: 'Lithium-ion energy storage module maintaining bus power integrity during orbital eclipse.'
    },
    {
      id: 'Propulsion',
      icon: Rocket,
      health: telemetry?.propulsion_health ?? 98.0,
      status: (telemetry?.propulsion_health ?? 98) < 70 ? 'CRITICAL' : 'NOMINAL',
      metrics: [
        { label: 'Tank Pressure', val: `${telemetry?.fuel_pressure ?? 220} bar` },
        { label: 'Thruster Pressure', val: `${telemetry?.thruster_pressure ?? 18.5} bar` },
        { label: 'Fuel Remaining', val: `${telemetry?.fuel ?? 84.5}%` }
      ],
      desc: 'Monopropellant reaction control system and orbit adjustment apogee thruster assembly.'
    },
    {
      id: 'Communication',
      icon: Radio,
      health: telemetry?.communication_health ?? 95.0,
      status: (telemetry?.communication_health ?? 95) < 70 ? 'WARNING' : 'NOMINAL',
      metrics: [
        { label: 'Signal Strength', val: `${telemetry?.communication_signal ?? 94}%` },
        { label: 'Packet Loss', val: `${telemetry?.packet_loss ?? 0.05}%` },
        { label: 'Carrier SNR', val: `${telemetry?.snr ?? 28.5} dB` }
      ],
      desc: 'High-gain steerable parabolic antenna array with dual-band S/X transponders.'
    },
    {
      id: 'Attitude',
      icon: Compass,
      health: telemetry?.attitude_health ?? 98.0,
      status: 'NOMINAL',
      metrics: [
        { label: 'Roll Drift', val: `${telemetry?.roll ?? 0.02}°` },
        { label: 'Pitch Drift', val: `${telemetry?.pitch ?? -0.01}°` },
        { label: 'Wheel Speed', val: `${telemetry?.reaction_wheel_rpm ?? 3200} RPM` }
      ],
      desc: '3-Axis reaction wheels, star tracking cameras, and inertial measurement gyroscopes.'
    }
  ];

  const currentSub = subsystems.find((s) => s.id === selectedSubsystem) || subsystems[0];

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <Box className="w-5 h-5 text-cyan-400" />
            3D SPACECRAFT DIGITAL TWIN
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Synchronized physics simulation twin with real-time component illumination & anomaly inspection.
          </p>
        </div>

        {/* Operating status badge */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-md bg-[#071328]/90 border border-cyan-700/50 telemetry-mono text-xs text-cyan-300 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-slate-400">STATE:</span>
            <span className="font-bold text-white">{telemetry?.operating_mode || 'NORMAL'}</span>
          </div>
        </div>
      </div>

      {/* Main Layout: 3D Canvas + Side Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[620px]">
        {/* 3D Canvas Area (2 Columns) */}
        <div className="lg:col-span-2 relative h-full rounded-xl overflow-hidden hud-panel hud-corner border border-[#162744] shadow-2xl">
          {/* Canvas Floating Overlay Controls */}
          <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-[#050b16]/90 border border-cyan-500/30 px-3 py-1 rounded text-xs telemetry-mono backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-bold">VIEWPORT: SYNCHRONIZED</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#050b16]/90 border border-[#162947] px-3 py-1 rounded text-[11px] telemetry-mono text-slate-400 backdrop-blur-md">
              <span>CLICK COMPONENT TO INSPECT</span>
            </div>
          </div>

          <SpacecraftCanvas interactive={true} onSelectComponent={(sub) => setSelectedSubsystem(sub)} />
        </div>

        {/* Right Subsystem Inspection & Telemetry Details */}
        <div className="flex flex-col gap-3.5 h-full overflow-hidden">
          {/* Subsystem Selector Pill Bar */}
          <div className="hud-panel p-2 rounded-xl flex flex-wrap gap-1.5 border border-[#16243f]">
            {subsystems.map((sub) => {
              const Icon = sub.icon;
              const isSelected = selectedSubsystem === sub.id;
              const isWarn = sub.status === 'WARNING';
              const isCrit = sub.status === 'CRITICAL';
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubsystem(sub.id)}
                  className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-[11px] font-hud tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-cyan-400'
                      : isCrit
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                      : isWarn
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      : 'bg-[#0a1427]/80 text-slate-400 hover:text-slate-100 hover:bg-[#101e38] border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{sub.id}</span>
                </button>
              );
            })}
          </div>

          {/* Active Subsystem Detail Card */}
          <div className="hud-panel hud-corner p-5 rounded-xl flex-1 flex flex-col justify-between overflow-y-auto border border-[#16243f]">
            <div>
              <div className="flex items-center justify-between border-b border-[#16243f] pb-3.5 mb-3.5">
                <div>
                  <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
                    SELECTED SUBSYSTEM MODULE
                  </div>
                  <h3 className="text-lg font-display font-bold text-cyan-300 flex items-center gap-2 mt-1">
                    {React.createElement(currentSub.icon, { className: 'w-5 h-5 text-cyan-400' })}
                    {currentSub.id} Subsystem
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">
                    HEALTH INTEGRITY
                  </div>
                  <div className={`text-2xl font-display font-black ${
                    currentSub.health < 70 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {currentSub.health}%
                  </div>
                </div>
              </div>

              {/* Subsystem Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">{currentSub.desc}</p>

              {/* Live Subsystem Telemetry Parameters */}
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-hud text-slate-400 uppercase font-bold tracking-widest">
                  LIVE TELEMETRY CHANNELS
                </div>
                {currentSub.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#091222]/90 border border-[#16243f] flex items-center justify-between text-xs telemetry-mono"
                  >
                    <span className="text-slate-400">{m.label}</span>
                    <span className="text-slate-100 font-bold">{m.val}</span>
                  </div>
                ))}
              </div>

              {/* Visual Highlighting Status Indicator */}
              <div className="p-3.5 rounded-lg bg-[#07101f]/90 border border-[#14233e] text-xs telemetry-mono space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-hud uppercase tracking-wider text-[11px]">
                    3D Emissive State:
                  </span>
                  <span
                    className={`font-bold ${
                      currentSub.status === 'CRITICAL'
                        ? 'text-rose-400 animate-pulse'
                        : currentSub.status === 'WARNING'
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {currentSub.status === 'CRITICAL'
                      ? '● HIGH RISK (RED GLOW)'
                      : currentSub.status === 'WARNING'
                      ? '● DEVIATING (AMBER GLOW)'
                      : '● NOMINAL (CYAN GLOW)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Subsystems dynamically shift color and emissive glow during simulated anomalies without full-screen flashing.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="border-t border-[#16243f] pt-3.5 mt-4 flex gap-2.5">
              <Link
                to="/mission-control/root-cause"
                className="flex-1 py-2 px-3 rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/80 hover:text-white text-xs font-hud tracking-wider font-bold text-center transition-all shadow-sm"
              >
                ROOT CAUSE →
              </Link>
              <Link
                to="/mission-control/simulation"
                className="flex-1 py-2 px-3 rounded-lg bg-[#0d1b33] border border-[#162947] text-slate-300 hover:text-white hover:bg-[#142646] text-xs font-hud tracking-wider font-bold text-center transition-all"
              >
                WHAT-IF SIM →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
