import React, { useState, useRef, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { api } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Battery,
  Database,
  Terminal,
  Cpu
} from 'lucide-react';

interface ChatMessageUI {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [messages, setMessages] = useState<ChatMessageUI[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text:
        "Welcome to the **ORBITAL TWIN AI Mission Intelligence Assistant**. " +
        "I am actively synchronized with live telemetry, ML anomaly scores (Isolation Forest), " +
        "supervised degradation models (XGBoost), and the What-If simulation engine.\n\n" +
        "All answers are grounded in actual spacecraft state. How may I assist your mission analysis?",
      sources: ["Live Telemetry", "Isolation Forest ML", "XGBoost Predictions"],
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Why is thermal health declining?",
    "What is the highest current risk?",
    "Explain the latest anomaly.",
    "What happens if solar power drops by 30%?",
    "Summarize current mission status."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessageUI = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.sender,
        content: m.text
      }));

      const res = await api.chat(text, historyPayload);

      const aiMsg: ChatMessageUI = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        sources: res.sources || ["Live Telemetry", "ML Inference"],
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessageUI = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "Temporary communication fault with AI backend. Spacecraft core monitoring remains fully operational.",
        sources: ["System"],
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
      setLoading(false);
    }
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-cyan-200 font-bold font-mono">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-cyan-300 font-bold text-sm font-hud tracking-wider mt-3 mb-1.5 flex items-center gap-1.5 border-b border-[#142646] pb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('**') && line.includes('**:')) {
        const parts = line.split('**:');
        const title = parts[0].replace('**', '');
        const rest = parts.slice(1).join('**:');
        return (
          <div key={idx} className="mt-2 text-xs">
            <span className="text-cyan-400 font-bold font-hud tracking-wider uppercase text-[11px]">{title}:</span>
            <span className="text-slate-200 ml-1.5 font-sans leading-relaxed">{renderInline(rest)}</span>
          </div>
        );
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-xs my-0.5 font-sans leading-relaxed">
            {renderInline(itemText)}
          </li>
        );
      }
      if (line.trim().match(/^\d+\.\s/)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-slate-300 text-xs my-0.5 font-sans leading-relaxed">
            {renderInline(line.trim().replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-200 font-sans leading-relaxed">
          {renderInline(line)}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f]/80 pb-3.5 shrink-0">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-purple-400" />
            AI MISSION INTELLIGENCE CONSOLE
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Operational conversational reasoning grounded in real-time telemetry, XGBoost forecasts, and physical state.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#071328]/90 border border-purple-800/50 text-purple-300 telemetry-mono text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
            <span className="font-bold">AI REASONING: ONLINE</span>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-[11px] font-hud uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          SUGGESTED QUERIES:
        </span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 rounded-md bg-[#0a152a]/90 hover:bg-[#122345] border border-[#16294a] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs telemetry-mono transition-all cursor-pointer shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 overflow-y-auto hud-panel hud-corner p-5 rounded-xl space-y-4 telemetry-mono text-xs border border-[#16243f]">
        {messages.map((m) => {
          const isAi = m.sender === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-4xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-md ${
                  isAi
                    ? 'bg-purple-950 border border-purple-600/70 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-cyan-950 border border-cyan-600/70 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2.5 shadow-sm ${
                  isAi
                    ? 'bg-[#060e1e]/95 border-[#162644] text-slate-200'
                    : 'bg-[#0a1730]/95 border-cyan-800/70 text-cyan-100'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-[#14233e] pb-1.5 text-[10px] text-slate-400">
                  <span className="font-hud uppercase tracking-wider font-bold text-slate-300">
                    {isAi ? 'AI FLIGHT DIRECTOR ASSISTANT' : 'FLIGHT OPERATIONS CONTROLLER'}
                  </span>
                  <span className="telemetry-mono">{m.timestamp}</span>
                </div>

                <div className="space-y-1 font-sans text-xs">
                  {renderFormattedText(m.text)}
                </div>

                {isAi && m.sources && (
                  <div className="pt-2.5 border-t border-[#122036] flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="text-slate-500 font-hud font-bold uppercase tracking-wider">SOURCES:</span>
                    {m.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#09152b] text-cyan-400 border border-cyan-900/60 font-mono text-[9px]"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-700/60 text-purple-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin text-purple-400" />
            </div>
            <div className="p-3.5 rounded-xl bg-[#060e1e] border border-[#162644] text-slate-300 text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-ping" />
              <span className="font-hud tracking-wide font-bold">Querying live telemetry & evaluating model inference...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2.5 shrink-0"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AI Flight Director about subsystem health, predicted anomalies, or what-if interventions..."
          className="flex-1 bg-[#060d1b]/95 border border-[#162744] focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.25)] rounded-lg px-4 py-3 text-xs telemetry-mono text-slate-100 placeholder-slate-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 text-white font-hud text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(0,240,255,0.35)] cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>QUERY</span>
        </button>
      </form>
    </div>
  );
};
