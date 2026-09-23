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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { anomalies, predictions } = useTelemetry();

  // Active anomaly count
  const activeAnomalyCount = anomalies.length;

  // Maximum failure prediction probability
  const maxRisk = predictions.reduce((max, p) => Math.max(max, p.failure_probability), 0);

  const navItems = [
    { to: '/mission-control/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/mission-control/digital-twin', label: 'Digital Twin', icon: Box, highlight: true },
    { to: '/mission-control/telemetry', label: 'Telemetry', icon: LineChart },
    {
      to: '/mission-control/anomalies',
      label: 'Anomalies',
      icon: AlertTriangle,
      badge: activeAnomalyCount > 0 ? `${activeAnomalyCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    {
      to: '/mission-control/predictions',
      label: 'Predictions',
      icon: TrendingUp,
      badge: maxRisk > 0.4 ? `${Math.round(maxRisk * 100)}%` : undefined,
      badgeColor: maxRisk > 0.7 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
    },
    { to: '/mission-control/subsystems', label: 'Subsystems', icon: Layers },
    { to: '/mission-control/root-cause', label: 'Root Cause', icon: GitBranch },
    { to: '/mission-control/simulation', label: 'What-If Simulation', icon: Sliders },
    { to: '/mission-control/rul', label: 'RUL Estimation', icon: Clock },
    { to: '/mission-control/recommendations', label: 'Recommendations', icon: LifeBuoy },
    { to: '/mission-control/timeline', label: 'Mission Timeline', icon: History },
    { to: '/mission-control/ai-assistant', label: 'AI Assistant', icon: Bot, isAi: true },
    { to: '/mission-control/model-status', label: 'Model Status', icon: BrainCircuit }
  ];

  return (
    <aside
      className={`bg-[#060c18] border-r border-[#16243f] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Collapser */}
      <div className="p-3 border-b border-[#16243f] flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] font-mono tracking-wider text-cyan-400 font-bold uppercase">
            MISSION NAVIGATION
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-[#101b33] text-slate-400 hover:text-cyan-400 ml-auto transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border-l-2 border-cyan-400 shadow-sm shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#0c162b]'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  item.isAi ? 'text-purple-400 animate-pulse' : 'text-slate-400 group-hover:text-cyan-400'
                }`}
              />
              {!collapsed && (
                <span className="truncate flex-1 tracking-wide">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    item.badgeColor || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      {!collapsed ? (
        <div className="p-3 border-t border-[#16243f] bg-[#040812] text-[11px] font-mono text-slate-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>ML ENGINE:</span>
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </div>
          <div className="text-[10px] text-slate-600 truncate">
            NASA SMAP/MSL + PHYSICS
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-[#16243f] flex justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400" title="ML Engine Online" />
        </div>
      )}
    </aside>
  );
};
