import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  Layers,
  Zap,
  Battery,
  Flame,
  Rocket,
  Radio,
  Compass,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SubsystemsPage: React.FC = () => {
  const { telemetry, anomalies, predictions } = useTelemetry();
  const [activeTab, setActiveTab] = useState<string>('thermal');

  const subsystems = [
    {
      id: 'thermal',
      name: 'Thermal Control Subsystem (TCS)',
      icon: Flame,
      health: telemetry?.thermal_health ?? 95.0,
      trend: (telemetry?.thermal_health ?? 95) < 85 ? 'DEGRADING' : 'STABLE',
      status: (telemetry?.thermal_health ?? 95) < 70 ? 'CRITICAL' : ((telemetry?.thermal_health ?? 95) < 85 ? 'WARNING' : 'NOMINAL'),
      telemetryItems: [
        { label: 'Bus Core Temperature', value: `${telemetry?.temperature ?? 24.0}°C`, nominal: '24.0°C' },
        { label: 'Radiator Surface Temp', value: `${telemetry?.radiator_temp ?? -18.2}°C`, nominal: '-18.0°C' },
        { label: 'Cooling Loop Efficiency', value: `${telemetry?.cooling_efficiency ?? 100}%`, nominal: '100%' },
        { label: 'Thermal Capacity', value: '25,000 J/K', nominal: '25,000 J/K' }
      ],
      description: 'Maintains spacecraft electronic bus and battery within safe operating thermal limits through radiant heat rejection louvers and fluid loops.',
      recommendedAction: 'Verify radiator fluid loop pump speeds and shed secondary instrument payloads.'
    },
    {
      id: 'power',
      name: 'Electrical Power Subsystem (EPS)',
      icon: Zap,
      health: telemetry?.power_health ?? 96.0,
      trend: (telemetry?.power_health ?? 96) < 85 ? 'DEGRADING' : 'STABLE',
      status: (telemetry?.power_health ?? 96) < 70 ? 'WARNING' : 'NOMINAL',
      telemetryItems: [
        { label: 'Solar Generation', value: `${telemetry?.solar_power ?? 1450} W`, nominal: '1450 W' },
        { label: 'Total Power Draw', value: `${telemetry?.power_consumption ?? 820} W`, nominal: '820 W' },
        { label: 'Regulated Bus Voltage', value: `${telemetry?.bus_voltage ?? 28.1} V`, nominal: '28.0 V' },
        { label: 'Array Sun Angle', value: '3.4°', nominal: '0.0°' }
      ],
      description: 'Generates electrical energy via dual triple-junction GaAs solar arrays and regulates 28V power distribution.',
      recommendedAction: 'Optimize solar array drive orientation to maximize sun exposure.'
    },
    {
      id: 'battery',
      name: 'Battery Energy Storage (BMS)',
      icon: Battery,
      health: telemetry?.battery_health_calc ?? 97.0,
      trend: (telemetry?.battery_health_calc ?? 97) < 85 ? 'DEGRADING' : 'STABLE',
      status: (telemetry?.battery_health_calc ?? 97) < 70 ? 'CRITICAL' : 'NOMINAL',
      telemetryItems: [
        { label: 'State of Charge (SoC)', value: `${telemetry?.battery ?? 92.4}%`, nominal: '90-100%' },
        { label: 'Cell Terminal Voltage', value: `${telemetry?.battery_voltage ?? 28.3} V`, nominal: '28.2 V' },
        { label: 'Discharge Current', value: `${telemetry?.battery_current ?? 4.1} A`, nominal: '4.0 A' },
        { label: 'Battery Core Temp', value: `${telemetry?.battery_temperature ?? 21.2}°C`, nominal: '21.0°C' }
      ],
      description: 'Stores energy for eclipse duration and transient high-current subsystem demands.',
      recommendedAction: 'Prevent deep cyclic discharge and maintain pack temperature below 35°C.'
    },
    {
      id: 'propulsion',
      name: 'Propulsion & Reaction Control (RCS)',
      icon: Rocket,
      health: telemetry?.propulsion_health ?? 98.0,
      trend: 'STABLE',
      status: (telemetry?.propulsion_health ?? 98) < 70 ? 'CRITICAL' : 'NOMINAL',
      telemetryItems: [
        { label: 'Fuel Remaining', value: `${telemetry?.fuel ?? 84.5}%`, nominal: '>50%' },
        { label: 'Propellant Tank Pressure', value: `${telemetry?.fuel_pressure ?? 219} bar`, nominal: '220 bar' },
        { label: 'Thruster Manifold Pressure', value: `${telemetry?.thruster_pressure ?? 18.5} bar`, nominal: '18.5 bar' },
        { label: 'Thruster Chamber Temp', value: `${telemetry?.thruster_temp ?? 18.2}°C`, nominal: '18.0°C' }
      ],
      description: 'Provides delta-V for orbit raising, collision avoidance, and momentum desaturation maneuvers.',
      recommendedAction: 'Monitor valve seal leak rates and thruster line pressure stability.'
    },
    {
      id: 'communication',
      name: 'Telemetry, Tracking & Command (TT&C)',
      icon: Radio,
      health: telemetry?.communication_health ?? 95.0,
      trend: 'STABLE',
      status: (telemetry?.communication_health ?? 95) < 70 ? 'WARNING' : 'NOMINAL',
      telemetryItems: [
        { label: 'RF Signal Strength', value: `${telemetry?.communication_signal ?? 94}%`, nominal: '>90%' },
        { label: 'Packet Error Rate', value: `${telemetry?.packet_loss ?? 0.05}%`, nominal: '<0.1%' },
        { label: 'Carrier-to-Noise (SNR)', value: `${telemetry?.snr ?? 28.5} dB`, nominal: '>25 dB' },
        { label: 'Downlink Latency', value: `${telemetry?.latency ?? 118} ms`, nominal: '120 ms' }
      ],
      description: 'Coordinates space-to-ground telemetry downlinks and mission control command uplinks.',
      recommendedAction: 'Re-align High-Gain Antenna gimbal to ground station azimuth.'
    },
    {
      id: 'attitude',
      name: 'Attitude Determination & Control (ADCS)',
      icon: Compass,
      health: telemetry?.attitude_health ?? 98.0,
      trend: 'STABLE',
      status: 'NOMINAL',
      telemetryItems: [
        { label: 'Roll Angle Drift', value: `${telemetry?.roll ?? 0.02}°`, nominal: '0.00°' },
        { label: 'Pitch Angle Drift', value: `${telemetry?.pitch ?? -0.01}°`, nominal: '0.00°' },
        { label: 'Yaw Angle Drift', value: `${telemetry?.yaw ?? 0.03}°`, nominal: '0.00°' },
        { label: 'Reaction Wheel Speed', value: `${telemetry?.reaction_wheel_rpm ?? 3200} RPM`, nominal: '3000 RPM' }
      ],
      description: 'Maintains precise pointing for solar panels, antenna, and scientific payloads.',
      recommendedAction: 'Execute magnetic torquer momentum desaturation sequence.'
    }
  ];

  const current = subsystems.find((s) => s.id === activeTab) || subsystems[0];

  // Failure prediction for this subsystem
  const matchingPred = predictions.find((p) => p.subsystem.toLowerCase() === current.id.toLowerCase());
  const failProb = matchingPred ? Math.round(matchingPred.failure_probability * 100) : 5;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            MULTI-SUBSYSTEM HEALTH MATRIX
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Cross-subsystem diagnostic telemetry, live sensor channels, anomaly correlation, and degradation predictions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#16243f] pb-3">
        {subsystems.map((sub) => {
          const Icon = sub.icon;
          const isActive = activeTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveTab(sub.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-hud tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950 to-cyan-900 text-cyan-300 border border-cyan-500/60 font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-[#0a1427]/80 text-slate-400 hover:text-slate-100 border border-transparent hover:border-[#16243f]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{sub.name.split('(')[0]}</span>
              <span className={`text-[10px] telemetry-mono px-1.5 py-0.2 rounded font-bold ${
                sub.health < 70 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-[#101d36] text-slate-300'
              }`}>
                {sub.health}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Subsystem Deep Dive View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Telemetry & Description */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hud-panel hud-corner p-6 rounded-xl space-y-4 border border-[#16243f]">
            <div className="flex items-center justify-between border-b border-[#16243f] pb-3.5">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#0d1c38] text-cyan-400 shadow-sm">
                  {React.createElement(current.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h2 className="text-base font-hud font-bold text-slate-100 tracking-wide">{current.name}</h2>
                  <div className="text-xs telemetry-mono text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>TREND:</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      current.trend === 'DEGRADING' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'
                    }`}>
                      {current.trend === 'DEGRADING' ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                      {current.trend}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right telemetry-mono">
                <div className="text-[10px] font-hud uppercase tracking-widest text-slate-400 font-bold">HEALTH</div>
                <div className={`text-3xl font-display font-black ${current.health < 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {current.health}%
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{current.description}</p>

            {/* Telemetry Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {current.telemetryItems.map((item, i) => (
                <div key={i} className="p-3.5 rounded-lg bg-[#091222]/90 border border-[#16243f] telemetry-mono text-xs">
                  <div className="text-slate-400 text-[11px] font-hud uppercase tracking-wider">{item.label}</div>
                  <div className="text-lg font-display font-bold text-slate-100 mt-1">{item.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Expected Baseline: {item.nominal}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI & ML Risk Projection Card */}
        <div className="space-y-4">
          <div className="hud-panel hud-corner p-6 rounded-xl space-y-4 border border-[#16243f]">
            <h3 className="text-xs font-hud font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-[#16243f] pb-2.5">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              ML RISK & DEGRADATION ESTIMATE
            </h3>

            <div className="space-y-2 telemetry-mono">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-400 font-hud tracking-wider uppercase text-[11px]">Failure Risk:</span>
                <span className={`text-2xl font-display font-black ${failProb > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {failProb}%
                </span>
              </div>
              <div className="w-full bg-[#0a1222] h-2 rounded-full overflow-hidden border border-[#16243f] p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${failProb > 50 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}
                  style={{ width: `${failProb}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#07101f]/90 border border-[#14233e] space-y-1.5 text-xs telemetry-mono">
              <div className="text-slate-400 text-[10px] font-hud uppercase tracking-widest font-bold">Recommended Mitigation:</div>
              <p className="text-slate-200 text-xs leading-relaxed font-sans">{current.recommendedAction}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/mission-control/simulation"
                className="py-2.5 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 hover:text-white text-xs font-hud font-bold tracking-wider text-center transition-all shadow-sm"
              >
                SIMULATE THIS SUBSYSTEM →
              </Link>
              <Link
                to="/mission-control/recommendations"
                className="py-2.5 px-3 rounded-lg bg-[#0e1a32] hover:bg-[#15274d] border border-[#1a3360] text-slate-300 hover:text-white text-xs font-hud font-bold tracking-wider text-center transition-all"
              >
                VIEW ACTION PLAN →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
