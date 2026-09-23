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
  Database
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const pipelineStages = [
    { num: '01', title: 'COLLECT', subtitle: 'Continuous Telemetry', desc: 'Acquires multi-channel sensor arrays across thermal, electrical, RF, and propulsion systems.' },
    { num: '02', title: 'UNDERSTAND', subtitle: 'Physics Digital Twin', desc: 'Maps coupled thermodynamic, electrochemical, and orbital dynamics into a live 3D synchronized state.' },
    { num: '03', title: 'DETECT', subtitle: 'Isolation Forest ML', desc: 'Evaluates real-time sensor distributions against the NASA SMAP/MSL benchmark to pinpoint early variance.' },
    { num: '04', title: 'PREDICT', subtitle: 'Supervised Failure Risk', desc: 'Gradient boosted trees forecast subsystem failure probabilities and estimate time-to-failure windows.' },
    { num: '05', title: 'SIMULATE & ACT', subtitle: 'Actionable Intelligence', desc: 'Runs counterfactual What-If scenarios and presents actionable mitigation actions to flight controllers.' }
  ];

  const featureCards = [
    { id: '1', title: 'Real-Time Telemetry', icon: LineChart, to: '/mission-control/telemetry', desc: 'High-frequency multi-node sensor streams covering thermal, electrical, propulsion, and RF links.' },
    { id: '2', title: 'Interactive Digital Twin', icon: Box, to: '/mission-control/digital-twin', desc: 'Three.js 3D satellite visualization with subsystem illumination and component-level health inspection.' },
    { id: '3', title: 'AI Anomaly Detection', icon: AlertTriangle, to: '/mission-control/anomalies', desc: 'Isolation Forest scoring cross-referenced with ground-truth NASA SMAP/MSL benchmark sequences.' },
    { id: '4', title: 'Failure Prediction', icon: TrendingUp, to: '/mission-control/predictions', desc: 'XGBoost supervised models estimating time-to-failure windows and degradation trajectory curves.' },
    { id: '5', title: 'Root Cause Analysis', icon: GitBranch, to: '/mission-control/root-cause', desc: 'Explainable causal graph tracing physical triggers to component failure risks with empirical deltas.' },
    { id: '6', title: 'Explainable AI', icon: Cpu, to: '/mission-control/root-cause', desc: 'Transparent SHAP feature importance rankings identifying primary contributing telemetry signals.' },
    { id: '7', title: 'What-If Simulation', icon: Sliders, to: '/mission-control/simulation', desc: 'Counterfactual scenario engine simulating cooling failure, load spikes, and solar power drops.' },
    { id: '8', title: 'Remaining Useful Life', icon: Clock, to: '/mission-control/rul', desc: 'Arrhenius thermal-stress degradation curves with statistical 95% confidence intervals.' },
    { id: '9', title: 'Smart Recommendations', icon: LifeBuoy, to: '/mission-control/recommendations', desc: 'Actionable procedures with direct simulation hooks to verify recovery before ground execution.' },
    { id: '10', title: 'Mission Timeline', icon: History, to: '/mission-control/timeline', desc: 'Dynamic chronological audit log capturing telemetry deviations, alerts, and mitigating interventions.' },
    { id: '11', title: 'AI Mission Assistant', icon: Bot, to: '/mission-control/ai-assistant', desc: 'Grok AI conversational operations assistant grounded in live telemetry without numerical hallucination.' },
    { id: '12', title: 'Subsystem Health Matrix', icon: Layers, to: '/mission-control/subsystems', desc: 'Comprehensive diagnostics across Power, Battery, Thermal, Propulsion, Comms, and Attitude.' }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans space-grid-bg">
      {/* Public Aerospace Header */}
      <header className="border-b border-[#16243f] bg-[#050b16]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#071329] border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wider text-slate-100 font-mono">ORBITAL TWIN</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-cyan-400 border border-cyan-800/50 bg-cyan-950/60 px-1.5 py-0.5 rounded font-mono">
              AI MISSION INTELLIGENCE PLATFORM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/mission-control/overview"
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-cyan-950 flex items-center gap-1.5"
          >
            <span>ENTER MISSION CONTROL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Aerospace Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a1528] border border-cyan-500/30 text-cyan-300 font-mono text-xs mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SPACECRAFT-01 DIGITAL TWIN SYNCHRONIZED</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl font-mono leading-tight">
          SEE THE FUTURE OF YOUR SPACECRAFT{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
            BEFORE IT HAPPENS.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
          An intelligent spacecraft digital twin that monitors telemetry, detects anomalies with NASA-benchmarked ML,
          predicts subsystem failures, simulates future scenarios, and provides explainable recommendations before critical failures occur.
        </p>

        <div className="mt-4 font-mono text-xs text-cyan-400 tracking-wider uppercase font-semibold">
          MONITOR • DETECT • PREDICT • SIMULATE • DECIDE
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/mission-control/overview"
            className="px-6 py-3.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-sm font-bold tracking-wider uppercase transition-all shadow-xl shadow-cyan-950 flex items-center gap-2"
          >
            <span>ENTER MISSION CONTROL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/mission-control/digital-twin"
            className="px-6 py-3.5 rounded bg-[#0a1528] hover:bg-[#122240] border border-[#1e3a66] text-slate-200 font-mono text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-2"
          >
            <Box className="w-4 h-4 text-cyan-400" />
            <span>EXPLORE DIGITAL TWIN</span>
          </Link>
        </div>

        {/* 3D Interactive Hero Preview Canvas */}
        <div className="w-full max-w-4xl h-[420px] mt-12 rounded-lg overflow-hidden border border-[#162744] bg-[#040813] shadow-2xl relative">
          <SpacecraftCanvas interactive={true} />
        </div>
      </section>

      {/* The Operational Problem Section */}
      <section className="px-6 py-16 border-t border-[#16243f] bg-[#040915]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase font-bold">
              THE ORBITAL IMPERATIVE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
              When Physical Inspection and Repair Are Impossible
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-slate-300 text-sm leading-relaxed">
            <div className="space-y-4 font-sans">
              <p>
                Spacecraft operate in unforgiving deep-space and low-Earth orbit environments where physical intervention is impossible. Telemetry streams continuously contain subtle early indicators across temperature, bus voltage, battery impedance, fuel pressure, radio frequency link margins, and avionics compute loads.
              </p>
              <p>
                Traditional ground monitoring tells flight controllers <em>what is happening</em> only after a threshold is breached. ORBITAL TWIN shifts the paradigm from reactive alerting to predictive mission intelligence:
              </p>
            </div>

            <div className="aerospace-panel p-5 rounded space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded bg-[#091326] border border-cyan-900/50 flex items-center justify-between text-slate-300">
                <span>"What is happening?"</span>
                <span className="text-cyan-400 font-bold">→ 1Hz Telemetry</span>
              </div>
              <div className="p-2.5 rounded bg-[#091326] border border-cyan-900/50 flex items-center justify-between text-slate-300">
                <span>"Why is it happening?"</span>
                <span className="text-purple-400 font-bold">→ Root Cause Causal Graph</span>
              </div>
              <div className="p-2.5 rounded bg-[#091326] border border-cyan-900/50 flex items-center justify-between text-slate-300">
                <span>"What could happen next?"</span>
                <span className="text-amber-400 font-bold">→ XGBoost Failure Prediction</span>
              </div>
              <div className="p-2.5 rounded bg-[#091326] border border-cyan-900/50 flex items-center justify-between text-slate-300">
                <span>"What happens if we intervene?"</span>
                <span className="text-emerald-400 font-bold">→ What-If Scenario Simulator</span>
              </div>
              <div className="p-2.5 rounded bg-[#091326] border border-cyan-900/50 flex items-center justify-between text-slate-300">
                <span>"What action should the engineer take?"</span>
                <span className="text-rose-400 font-bold">→ AI Mitigation Action Plan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage How It Works Pipeline */}
      <section className="px-6 py-16 border-t border-[#16243f]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase font-bold">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
              The Five-Stage Mission Intelligence Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineStages.map((stage) => (
              <div
                key={stage.num}
                className="aerospace-panel p-4 rounded border border-[#162744] hover:border-cyan-500/60 transition-all font-mono space-y-2"
              >
                <div className="text-2xl font-bold text-cyan-400">{stage.num}</div>
                <div className="text-xs font-bold text-slate-100 uppercase">{stage.title}</div>
                <div className="text-[11px] text-cyan-300 font-semibold">{stage.subtitle}</div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12 Feature Cards Grid */}
      <section className="px-6 py-16 border-t border-[#16243f] bg-[#040915]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase font-bold">
              COMPREHENSIVE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
              End-to-End Spacecraft Health & Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.id}
                  to={feat.to}
                  className="aerospace-panel p-5 rounded border border-[#16243f] hover:border-cyan-500/50 hover:bg-[#091326] transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="w-9 h-9 rounded bg-[#0d1c38] text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{feat.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-[#121f38] mt-4 flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span>EXPLORE MODULE</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack & Scientific Transparency */}
      <section className="px-6 py-16 border-t border-[#16243f]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase font-bold">
              ENGINEERING FOUNDATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
              Technology Stack & Scientific Transparency
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="aerospace-panel p-4 rounded space-y-2">
              <span className="text-cyan-400 font-bold">AI / MACHINE LEARNING</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• Scikit-Learn Isolation Forest</li>
                <li>• XGBoost Multi-Output Trees</li>
                <li>• SHAP Feature Attribution</li>
                <li>• Chronological Leak-Free Validation</li>
              </ul>
            </div>

            <div className="aerospace-panel p-4 rounded space-y-2">
              <span className="text-cyan-400 font-bold">BACKEND CORE</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• Python FastAPI & Pydantic</li>
                <li>• High-Throughput WebSockets (1Hz)</li>
                <li>• SQLAlchemy with SQLite / Postgres</li>
                <li>• Grok AI Conversational Intelligence</li>
              </ul>
            </div>

            <div className="aerospace-panel p-4 rounded space-y-2">
              <span className="text-cyan-400 font-bold">FRONTEND EXPERIENCE</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• React 19 + TypeScript + Vite</li>
                <li>• Three.js WebGL 3D Satellite Model</li>
                <li>• Apache ECharts Waveform Graphs</li>
                <li>• Responsive Mission Operations UI</li>
              </ul>
            </div>

            <div className="aerospace-panel p-4 rounded space-y-2">
              <span className="text-cyan-400 font-bold">DATA PRINCIPLE</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• NASA SMAP/MSL Benchmark (82 Channels)</li>
                <li>• Physics-Informed Coupled Simulation</li>
                <li>• Strict Real vs Synthetic Demarcation</li>
                <li>• Verified Zero-Fabrication Integrity</li>
              </ul>
            </div>
          </div>

          {/* Scientific Honesty Notice */}
          <div className="p-4 rounded bg-[#071122] border border-cyan-800/40 text-xs font-mono text-slate-300 leading-relaxed space-y-1">
            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Scientific & Data Integrity Statement</span>
            </div>
            <p>
              "NASA SMAP/MSL telemetry is used as a real-world anomaly-detection reference dataset. Additional spacecraft parameters (fuel pressure, battery internal impedance, radiator loop efficiency) and failure scenarios are generated using a physics-informed simulation engine for this mission operations platform."
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#16243f] bg-[#02050c] px-6 py-8 text-center text-xs font-mono text-slate-500">
        <div>ORBITAL TWIN • AI-POWERED SPACECRAFT DIGITAL TWIN & MISSION INTELLIGENCE</div>
        <div className="mt-1 text-[11px] text-slate-600">Built for mission control engineers and autonomous aerospace operations.</div>
      </footer>
    </div>
  );
};
