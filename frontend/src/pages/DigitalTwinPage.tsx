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
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DigitalTwinPage: React.FC = () => {
  const { telemetry, triggerScenario } = useTelemetry();
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
      desc: 'Radiative cooling panels and loop pumps rejecting internal avionics and solar heat.'
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
      desc: 'Lithium-ion energy storage module maintaining bus integrity through orbital eclipse phases.'
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
      desc: 'Monopropellant reaction control system and orbit insertion apogee thruster assembly.'
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
      desc: 'High-Gain parabolic antenna with dual-axis steerable gimbal and S/X-band transponders.'
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
      desc: '3-Axis reaction wheels, star trackers, and inertial measurement gyroscopes.'
    }
  ];

  const currentSub = subsystems.find((s) => s.id === selectedSubsystem) || subsystems[0];

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#16243f] pb-3">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            3D SPACECRAFT DIGITAL TWIN
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Interactive real-time physics twin synchronized with live telemetry and ML anomaly illumination.
          </p>
        </div>

        {/* Operating status badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded bg-[#071328] border border-cyan-700/50 font-mono text-xs text-cyan-300">
            STATE: <span className="font-bold">{telemetry?.operating_mode || 'NORMAL'}</span>
          </div>
        </div>
      </div>

      {/* Main Layout: 3D Canvas + Side Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        {/* 3D Canvas Area (2 Columns) */}
        <div className="lg:col-span-2 relative h-full">
          <SpacecraftCanvas interactive={true} onSelectComponent={(sub) => setSelectedSubsystem(sub)} />
        </div>

        {/* Right Subsystem Inspection & Telemetry Details */}
        <div className="flex flex-col gap-3 h-full overflow-hidden">
          {/* Subsystem Selector Pill Bar */}
          <div className="aerospace-panel p-2 rounded flex flex-wrap gap-1">
            {subsystems.map((sub) => {
              const Icon = sub.icon;
              const isSelected = selectedSubsystem === sub.id;
              const isWarn = sub.status === 'WARNING';
              const isCrit = sub.status === 'CRITICAL';
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubsystem(sub.id)}
                  className={`flex-1 min-w-[75px] py-1.5 px-2 rounded text-[11px] font-mono flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                      : isCrit
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                      : isWarn
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                      : 'bg-[#0a1427] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{sub.id}</span>
                </button>
              );
            })}
          </div>

          {/* Active Subsystem Detail Card */}
          <div className="aerospace-panel p-4 rounded flex-1 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#16243f] pb-3 mb-3">
                <div>
                  <div className="text-xs font-mono text-slate-400">SELECTED MODULE</div>
                  <h3 className="text-lg font-bold font-mono text-cyan-300 flex items-center gap-2 mt-0.5">
                    {React.createElement(currentSub.icon, { className: 'w-5 h-5 text-cyan-400' })}
                    {currentSub.id} Subsystem
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">HEALTH</div>
                  <div className={`text-xl font-bold font-mono ${currentSub.health < 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {currentSub.health}%
                  </div>
                </div>
              </div>

              {/* Subsystem Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{currentSub.desc}</p>

              {/* Live Subsystem Telemetry Parameters */}
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                  Live Telemetry Channels
                </div>
                {currentSub.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-[#091222] border border-[#16243f] flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-400">{m.label}</span>
                    <span className="text-slate-100 font-bold">{m.val}</span>
                  </div>
                ))}
              </div>

              {/* Visual Highlighting Status Indicator */}
              <div className="p-3 rounded bg-[#07101f] border border-[#14233e] text-xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">3D Illumination State:</span>
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
                <p className="text-[10px] text-slate-500">
                  Subsystems dynamically shift color and emissive intensity during simulated anomalies without full-screen flashing.
                </p>
              </div>
            </div>

            {/* Quick Link into Root Cause or Predictions */}
            <div className="border-t border-[#16243f] pt-3 mt-4 flex gap-2">
              <Link
                to="/mission-control/root-cause"
                className="flex-1 py-1.5 px-2 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-mono text-center transition-colors"
              >
                ROOT CAUSE →
              </Link>
              <Link
                to="/mission-control/simulation"
                className="flex-1 py-1.5 px-2 rounded bg-[#0d1b33] border border-[#162947] text-slate-300 hover:text-white text-xs font-mono text-center transition-colors"
              >
                SIMULATE →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
