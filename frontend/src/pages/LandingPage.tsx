import React from 'react';
import { Link } from 'react-router-dom';
import { SpacecraftCanvas } from '../components/three/SpacecraftCanvas';
import {
  Activity,
  Box,
  LineChart,
  AlertTriangle,
  TrendingUp,
  GitBranch,
  Sliders,
  Clock,
  LifeBuoy,
  History,
  Bot,
  Layers,
  ArrowRight,
  Shield,
  Zap,
  Flame,
  Radio,
  Rocket,
  CheckCircle2,
  Cpu,
  Database,
  Compass,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const pipelineStages = [
    { num: '01', title: 'COLLECT', subtitle: 'Multi-Node Telemetry', desc: 'Acquires synchronized sensor arrays across thermal, electrical, propulsion, and RF links at 1 Hz.' },
    { num: '02', title: 'UNDERSTAND', subtitle: 'Physics Digital Twin', desc: 'Couples thermodynamic, electrochemical, and attitude dynamics in real-time inside a synchronized 3D canvas.' },
    { num: '03', title: 'DETECT', subtitle: 'Isolation Forest ML', desc: 'Evaluates live distribution drift against the NASA SMAP/MSL benchmark to isolate micro-variances early.' },
    { num: '04', title: 'PREDICT', subtitle: 'Supervised Failure Risk', desc: 'Gradient boosted XGBoost trees forecast subsystem failure probabilities and estimate time-to-failure windows.' },
    { num: '05', title: 'SIMULATE & ACT', subtitle: 'Counterfactual Intelligence', desc: 'Simulates What-If interventions before execution, empowering flight controllers with verified procedures.' }
  ];

  const featureCards = [
    { id: '1', title: 'Real-Time Telemetry', icon: LineChart, to: '/mission-control/telemetry', desc: 'High-frequency telemetry stream with live waveform traces across all physical spacecraft channels.' },
    { id: '2', title: '3D Digital Twin', icon: Box, to: '/mission-control/digital-twin', desc: 'Interactive Three.js satellite visualization with subsystem illumination and component-level health inspection.' },
    { id: '3', title: 'AI Anomaly Detection', icon: AlertTriangle, to: '/mission-control/anomalies', desc: 'Isolation Forest scoring cross-referenced with ground-truth NASA SMAP/MSL benchmark sequences.' },
    { id: '4', title: 'Failure Prediction', icon: TrendingUp, to: '/mission-control/predictions', desc: 'XGBoost supervised models forecasting failure probability windows and degradation trajectories.' },
    { id: '5', title: 'Root Cause Analysis', icon: GitBranch, to: '/mission-control/root-cause', desc: 'Causal dependency graphs tracing physical degradation triggers to component failure risks with exact deltas.' },
    { id: '6', title: 'Explainable AI & SHAP', icon: Cpu, to: '/mission-control/root-cause', desc: 'Transparent SHAP feature attribution rankings identifying primary contributing telemetry signals.' },
    { id: '7', title: 'What-If Simulation', icon: Sliders, to: '/mission-control/simulation', desc: 'Counterfactual scenario engine simulating cooling loop failures, load spikes, and solar power collapses.' },
    { id: '8', title: 'Remaining Useful Life', icon: Clock, to: '/mission-control/rul', desc: 'Arrhenius thermal-stress degradation curves with statistical 95% confidence intervals.' },
    { id: '9', title: 'Actionable Procedures', icon: LifeBuoy, to: '/mission-control/recommendations', desc: 'Actionable procedures with direct simulation hooks to verify recovery before ground execution.' },
    { id: '10', title: 'Mission Timeline', icon: History, to: '/mission-control/timeline', desc: 'Dynamic chronological audit log capturing telemetry deviations, alerts, and mitigating interventions.' },
    { id: '11', title: 'AI Mission Assistant', icon: Bot, to: '/mission-control/ai-assistant', desc: 'Grok AI conversational operations assistant grounded in live telemetry without numerical hallucination.' },
    { id: '12', title: 'Subsystem Health Matrix', icon: Layers, to: '/mission-control/subsystems', desc: 'Comprehensive diagnostics across Power, Battery, Thermal, Propulsion, Comms, and Attitude.' }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans space-grid-bg relative overflow-x-hidden">
      {/* Public Aerospace Header */}
      <header className="border-b border-[#16243f]/80 bg-[#050b16]/85 backdrop-blur-xl sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#071329] border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-wider text-slate-100">ORBITAL TWIN</span>
              <span className="hidden sm:inline-block text-[10px] text-cyan-300 border border-cyan-700/50 bg-cyan-950/70 px-2 py-0.5 rounded telemetry-mono font-semibold tracking-wider">
                MISSION OPS
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-hud tracking-wider uppercase">
              AI-POWERED SPACECRAFT DIGITAL TWIN PLATFORM
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/mission-control/overview"
            className="px-5 py-2.5 rounded-md bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-hud text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <span>ENTER MISSION CONTROL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Aerospace Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1528]/90 border border-cyan-500/40 text-cyan-300 telemetry-mono text-xs mb-8 shadow-[0_0_16px_rgba(0,240,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
          <span className="font-semibold tracking-wider">SPACECRAFT-01 DIGITAL TWIN SYNCHRONIZED</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight max-w-5xl leading-tight text-slate-100">
          SEE THE FUTURE OF YOUR SPACECRAFT{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 drop-shadow-[0_0_30px_rgba(0,240,255,0.35)]">
            BEFORE IT HAPPENS.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed font-sans">
          An intelligent spacecraft digital twin that monitors real-time telemetry, detects anomalies with NASA-benchmarked ML,
          predicts subsystem failures, simulates counterfactual scenarios, and provides explainable mitigation procedures.
        </p>

        {/* Operational Tagline */}
        <div className="mt-5 font-hud text-sm text-cyan-400 tracking-widest uppercase font-bold flex items-center gap-2">
          <span>MONITOR</span>
          <span className="text-slate-600">•</span>
          <span>DETECT</span>
          <span className="text-slate-600">•</span>
          <span>PREDICT</span>
          <span className="text-slate-600">•</span>
          <span>SIMULATE</span>
          <span className="text-slate-600">•</span>
          <span>DECIDE</span>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/mission-control/overview"
            className="px-7 py-3.5 rounded-md bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-hud text-sm font-bold tracking-widest uppercase transition-all shadow-[0_0_24px_rgba(0,240,255,0.45)] flex items-center gap-2.5 cursor-pointer hover:scale-105"
          >
            <span>ENTER MISSION CONTROL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/mission-control/digital-twin"
            className="px-7 py-3.5 rounded-md bg-[#0a1528]/80 hover:bg-[#122240] border border-[#1e3a66] hover:border-cyan-500/50 text-slate-200 font-hud text-sm font-bold tracking-widest uppercase transition-all flex items-center gap-2.5 cursor-pointer shadow-lg hover:shadow-[0_0_16px_rgba(0,240,255,0.2)]"
          >
            <Box className="w-4 h-4 text-cyan-400" />
            <span>EXPLORE 3D TWIN</span>
          </Link>
        </div>

        {/* 3D Interactive Hero Preview Canvas Container */}
        <div className="w-full max-w-5xl h-[460px] mt-14 rounded-xl overflow-hidden hud-panel hud-corner shadow-2xl relative border border-[#162744]">
          {/* Top HUD Telemetry Banner */}
          <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-[#050b16]/90 border border-cyan-500/30 px-3 py-1 rounded text-xs telemetry-mono backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-pulse" />
              <span className="text-cyan-300 font-bold">LIVE 3D TWIN: ORBITAL-01</span>
            </div>
            <div className="flex items-center gap-2 bg-[#050b16]/90 border border-[#162947] px-3 py-1 rounded text-[11px] telemetry-mono text-slate-400 backdrop-blur-md">
              <span>MOUSE: ROTATE • SCROLL: ZOOM</span>
            </div>
          </div>

          <SpacecraftCanvas interactive={true} />

          {/* Bottom HUD Quick Status Chips */}
          <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-2 bg-[#050b16]/90 border border-emerald-500/30 px-3 py-1 rounded text-xs telemetry-mono text-emerald-400 backdrop-blur-md">
              <span>HEALTH: 95.0% NOMINAL</span>
            </div>
            <div className="flex items-center gap-2 bg-[#050b16]/90 border border-cyan-500/30 px-3 py-1 rounded text-xs telemetry-mono text-cyan-300 backdrop-blur-md">
              <span>SOLAR EPS: 1450 W</span>
            </div>
            <div className="flex items-center gap-2 bg-[#050b16]/90 border border-purple-500/30 px-3 py-1 rounded text-xs telemetry-mono text-purple-300 backdrop-blur-md">
              <span>RCS FUEL: 84.5%</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Operational Problem Section */}
      <section className="px-6 py-20 border-t border-[#16243f]/80 bg-[#040915]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-hud text-cyan-400 tracking-widest uppercase font-bold">
              THE ORBITAL IMPERATIVE
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-100">
              When Physical Inspection and Repair Are Impossible
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-slate-300 text-sm leading-relaxed">
            <div className="space-y-4 font-sans text-slate-300 leading-relaxed text-base">
              <p>
                Spacecraft operate in unforgiving deep-space and low-Earth orbit environments where physical intervention is impossible. Telemetry streams continuously contain subtle early indicators across temperature, bus voltage, battery impedance, fuel pressure, radio frequency link margins, and avionics compute loads.
              </p>
              <p>
                Traditional ground monitoring tells flight controllers <em className="text-cyan-300 font-semibold">what is happening</em> only after an alarm threshold is breached. ORBITAL TWIN shifts flight operations from reactive threshold alarms to predictive, explainable mission assurance:
              </p>
            </div>

            <div className="hud-panel hud-corner p-6 rounded-xl space-y-2.5 telemetry-mono text-xs">
              <div className="p-3 rounded-lg bg-[#091326]/90 border border-cyan-800/40 flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-sm">"What is happening?"</span>
                <span className="text-cyan-400 font-bold">→ 1Hz Telemetry Coordination</span>
              </div>
              <div className="p-3 rounded-lg bg-[#091326]/90 border border-purple-800/40 flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-sm">"Why is it happening?"</span>
                <span className="text-purple-400 font-bold">→ Root Cause & SHAP Attribution</span>
              </div>
              <div className="p-3 rounded-lg bg-[#091326]/90 border border-amber-800/40 flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-sm">"What could happen next?"</span>
                <span className="text-amber-400 font-bold">→ XGBoost Failure Risk Forecasting</span>
              </div>
              <div className="p-3 rounded-lg bg-[#091326]/90 border border-emerald-800/40 flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-sm">"What happens if we intervene?"</span>
                <span className="text-emerald-400 font-bold">→ Counterfactual Simulator</span>
              </div>
              <div className="p-3 rounded-lg bg-[#091326]/90 border border-rose-800/40 flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-sm">"What action should be taken?"</span>
                <span className="text-rose-400 font-bold">→ AI Mitigation Action Plan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage How It Works Pipeline */}
      <section className="px-6 py-20 border-t border-[#16243f]/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-hud text-cyan-400 tracking-widest uppercase font-bold">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-100">
              The Five-Stage Mission Intelligence Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineStages.map((stage) => (
              <div
                key={stage.num}
                className="hud-panel p-5 rounded-xl border border-[#162744] hover:border-cyan-400/60 transition-all font-mono space-y-3 group hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
              >
                <div className="text-3xl font-display font-black text-cyan-400 group-hover:scale-110 transition-transform origin-left">
                  {stage.num}
                </div>
                <div className="text-xs font-bold text-slate-100 uppercase tracking-wider font-hud">
                  {stage.title}
                </div>
                <div className="text-[11px] text-cyan-300 font-semibold telemetry-mono">
                  {stage.subtitle}
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed pt-1">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12 Feature Cards Grid */}
      <section className="px-6 py-20 border-t border-[#16243f]/80 bg-[#040915]/90">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-hud text-cyan-400 tracking-widest uppercase font-bold">
              COMPREHENSIVE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-100">
              End-to-End Spacecraft Health & Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.id}
                  to={feat.to}
                  className="glass-card hud-corner p-6 rounded-xl transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0d1c38] text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold font-hud tracking-wide text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{feat.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-[#121f38] mt-4 flex items-center justify-between text-xs font-hud tracking-wider text-cyan-400 font-bold">
                    <span>EXPLORE MODULE</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack & Scientific Transparency */}
      <section className="px-6 py-20 border-t border-[#16243f]/80">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-hud text-cyan-400 tracking-widest uppercase font-bold">
              ENGINEERING FOUNDATION
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-100">
              Technology Stack & Scientific Transparency
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-mono text-xs">
            <div className="hud-panel p-5 rounded-xl space-y-2.5">
              <span className="text-cyan-400 font-bold font-hud text-sm tracking-wider">AI / MACHINE LEARNING</span>
              <ul className="space-y-1.5 text-slate-300 text-[11px] telemetry-mono">
                <li>• Scikit-Learn Isolation Forest</li>
                <li>• XGBoost Multi-Output Trees</li>
                <li>• SHAP Feature Attribution</li>
                <li>• Chronological Leak-Free Split</li>
              </ul>
            </div>

            <div className="hud-panel p-5 rounded-xl space-y-2.5">
              <span className="text-cyan-400 font-bold font-hud text-sm tracking-wider">BACKEND CORE</span>
              <ul className="space-y-1.5 text-slate-300 text-[11px] telemetry-mono">
                <li>• Python FastAPI & Pydantic</li>
                <li>• High-Throughput WebSockets (1Hz)</li>
                <li>• SQLAlchemy with SQLite DB</li>
                <li>• Grok AI Assistant Engine</li>
              </ul>
            </div>

            <div className="hud-panel p-5 rounded-xl space-y-2.5">
              <span className="text-cyan-400 font-bold font-hud text-sm tracking-wider">FRONTEND EXPERIENCE</span>
              <ul className="space-y-1.5 text-slate-300 text-[11px] telemetry-mono">
                <li>• React 19 + TypeScript + Vite</li>
                <li>• Three.js WebGL 3D Satellite</li>
                <li>• Apache ECharts Waveforms</li>
                <li>• Responsive HUD Interface</li>
              </ul>
            </div>

            <div className="hud-panel p-5 rounded-xl space-y-2.5">
              <span className="text-cyan-400 font-bold font-hud text-sm tracking-wider">DATA PRINCIPLE</span>
              <ul className="space-y-1.5 text-slate-300 text-[11px] telemetry-mono">
                <li>• NASA SMAP/MSL Benchmark</li>
                <li>• Physics-Informed Simulation</li>
                <li>• Strict Real vs Synthetic Tagging</li>
                <li>• Zero-Fabrication Integrity</li>
              </ul>
            </div>
          </div>

          {/* Scientific Honesty Notice */}
          <div className="p-5 rounded-xl bg-[#071122]/90 border border-cyan-800/40 text-xs font-mono text-slate-300 leading-relaxed space-y-2 shadow-lg">
            <div className="text-cyan-300 font-bold flex items-center gap-2 font-hud text-sm tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Scientific & Data Integrity Statement</span>
            </div>
            <p className="font-sans text-slate-400 text-sm leading-relaxed">
              "NASA SMAP/MSL telemetry is used as a real-world anomaly-detection reference dataset. Additional spacecraft parameters (fuel pressure, battery internal impedance, radiator loop efficiency) and failure scenarios are generated using a physics-informed simulation engine for this mission operations platform."
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#16243f]/80 bg-[#02050c] px-6 py-10 text-center text-xs telemetry-mono text-slate-500">
        <div className="font-hud tracking-widest text-slate-400 uppercase text-sm">
          ORBITAL TWIN • AI-POWERED SPACECRAFT DIGITAL TWIN & MISSION INTELLIGENCE
        </div>
        <div className="mt-1.5 text-[11px] text-slate-600 font-sans">
          Engineered for mission flight controllers, aerospace operators, and autonomous satellite assurance.
        </div>
      </footer>
    </div>
  );
};
