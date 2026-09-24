import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { api } from '../services/api';
import { MissionEventItem } from '../types/telemetry';
import {
  History,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Zap,
  Flame,
  Info,
  ShieldAlert,
  Clock
} from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const { latestEvent } = useTelemetry();
  const [events, setEvents] = useState<MissionEventItem[]>([]);

  useEffect(() => {
    api.getTimeline()
      .then((data) => setEvents(data))
      .catch(() => {});
  }, [latestEvent?.id]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-800 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse';
      case 'WARNING':
        return 'bg-amber-950 text-amber-300 border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      case 'SUCCESS':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      default:
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <History className="w-5 h-5 text-cyan-400" />
            MISSION INCIDENT & EVENT TIMELINE
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Chronological audit trail logging telemetry shifts, anomaly triggers, and controller interventions.
          </p>
        </div>

        <div className="text-xs telemetry-mono text-slate-400 bg-[#071328]/90 px-3.5 py-1.5 rounded-md border border-[#16243f] shadow-sm">
          LOGGED EVENTS: <strong className="text-cyan-300 font-bold">{events.length}</strong>
        </div>
      </div>

      {/* Chronological Event Stream */}
      <div className="hud-panel hud-corner p-6 rounded-xl space-y-4 border border-[#16243f]">
        <div className="relative border-l-2 border-cyan-500/30 ml-4 space-y-6 py-2">
          {events.map((ev) => {
            const timeStr = new Date(ev.timestamp).toLocaleTimeString();
            return (
              <div key={ev.id} className="relative pl-6 group">
                {/* Node Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#050b16] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_8px_#00f0ff]">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                </div>

                {/* Event Card */}
                <div className="p-4 rounded-xl bg-[#071020]/90 border border-[#14233e] hover:border-cyan-500/50 hover:bg-[#0c1830] transition-all telemetry-mono space-y-2 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      {getSeverityIcon(ev.severity)}
                      <span className="font-hud font-bold text-sm text-slate-100">{ev.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0f1d38] border border-[#1a2d54] text-slate-300">
                        {ev.subsystem}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(ev.severity)}`}>
                        {ev.severity}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {timeStr}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">{ev.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
