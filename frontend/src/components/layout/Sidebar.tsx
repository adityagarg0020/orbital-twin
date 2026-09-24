import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  LayoutDashboard,
  Box,
  LineChart,
  AlertTriangle,
  TrendingUp,
  Layers,
  GitBranch,
  Sliders,
  LifeBuoy,
  Clock,
  History,
  Bot,
  BrainCircuit,
  Database,
  ChevronLeft,
  ChevronRight,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: string;
  badgeColor?: string;
  isAi?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { anomalies, predictions } = useTelemetry();

  // Active anomaly count
  const activeAnomalyCount = anomalies.length;

  // Maximum failure prediction probability
  const maxRisk = predictions.reduce((max, p) => Math.max(max, p.failure_probability), 0);

  const navSections: NavSection[] = [
    {
      title: 'CORE FLIGHT OPS',
      items: [
        { to: '/mission-control/overview', label: 'Overview', icon: LayoutDashboard },
        { to: '/mission-control/digital-twin', label: 'Digital Twin 3D', icon: Box, highlight: true },
        { to: '/mission-control/data-lab', label: 'Telemetry Data Lab', icon: Database, badge: 'LAB', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' },
        { to: '/mission-control/telemetry', label: 'Real-Time Telemetry', icon: LineChart },
      ]
    },
    {
      title: 'DIAGNOSTICS & ML',
      items: [
        {
          to: '/mission-control/anomalies',
          label: 'Anomaly Detection',
          icon: AlertTriangle,
          badge: activeAnomalyCount > 0 ? `${activeAnomalyCount}` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
        },
        {
          to: '/mission-control/predictions',
          label: 'Failure Predictions',
          icon: TrendingUp,
          badge: maxRisk > 0.4 ? `${Math.round(maxRisk * 100)}%` : undefined,
          badgeColor: maxRisk > 0.7 ? 'bg-rose-500 text-white shadow-[0_0_8px_#f43f5e]' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        },
        { to: '/mission-control/subsystems', label: 'Subsystem Matrix', icon: Layers },
        { to: '/mission-control/root-cause', label: 'Root Cause & SHAP', icon: GitBranch },
      ]
    },
    {
      title: 'SIMULATION & ACTION',
      items: [
        { to: '/mission-control/simulation', label: 'What-If Simulator', icon: Sliders },
        { to: '/mission-control/rul', label: 'RUL Estimation', icon: Clock },
        { to: '/mission-control/recommendations', label: 'Recommendations', icon: LifeBuoy },
      ]
    },
    {
      title: 'LOGS & INTELLIGENCE',
      items: [
        { to: '/mission-control/timeline', label: 'Mission Timeline', icon: History },
        { to: '/mission-control/ai-assistant', label: 'AI Flight Assistant', icon: Bot, isAi: true },
        { to: '/mission-control/model-status', label: 'Model Architecture', icon: BrainCircuit },
      ]
    }
  ];

  return (
    <aside
      className={`bg-[#060c18]/95 backdrop-blur-xl border-r border-[#16243f] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Collapser */}
      <div className="p-3 border-b border-[#16243f]/80 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] font-hud tracking-widest text-cyan-400 font-bold uppercase">
            NAVIGATION CONSOLE
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-[#101b33] text-slate-400 hover:text-cyan-400 ml-auto transition-all cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-hud tracking-wider text-slate-500 font-bold uppercase">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/90 to-cyan-950/30 text-cyan-300 border-l-2 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#0c162b]'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      item.isAi
                        ? 'text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)] animate-pulse'
                        : item.highlight
                        ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]'
                        : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 tracking-wide text-[12px]">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[9px] telemetry-mono font-bold px-1.5 py-0.5 rounded ${
                        item.badgeColor || 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      {!collapsed ? (
        <div className="p-3 border-t border-[#16243f]/90 bg-[#040812]/90 text-[11px] telemetry-mono text-slate-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI/ML ENGINE</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
              <span className="text-emerald-400 font-bold text-[10px]">ONLINE</span>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 truncate tracking-wide">
            NASA SMAP/MSL + PHYSICS
          </div>
        </div>
      ) : (
        <div className="p-2.5 border-t border-[#16243f] flex justify-center bg-[#040812]/90">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="ML Engine Online" />
        </div>
      )}
    </aside>
  );
};
