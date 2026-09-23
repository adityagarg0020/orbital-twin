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
          <h3 key={idx} className="text-cyan-300 font-bold text-sm font-mono mt-3 mb-1 flex items-center gap-1.5 border-b border-[#142646] pb-1">
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
            <span className="text-cyan-400 font-bold font-mono tracking-wider">{title}:</span>
            <span className="text-slate-200 ml-1">{renderInline(rest)}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f] pb-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            GROK AI MISSION INTELLIGENCE ASSISTANT
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Conversational analysis grounded in real-time telemetry, model failure probabilities, and counterfactual simulation.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#071328] border border-purple-800/40 text-purple-300 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI ENGINE: ONLINE</span>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          SUGGESTIONS:
        </span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded bg-[#0a152a] hover:bg-[#122345] border border-[#16294a] text-slate-300 hover:text-cyan-300 text-xs font-mono transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 overflow-y-auto aerospace-panel p-4 rounded space-y-4 font-mono text-xs">
        {messages.map((m) => {
          const isAi = m.sender === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-4xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 text-xs ${
                  isAi ? 'bg-purple-950 border border-purple-700/60 text-purple-300' : 'bg-cyan-950 border border-cyan-700/60 text-cyan-300'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded border space-y-2 ${
                  isAi
                    ? 'bg-[#060e1e] border-[#162644] text-slate-200'
                    : 'bg-[#0a1730] border-cyan-800/60 text-cyan-100'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-[#14233e] pb-1 text-[10px] text-slate-400">
                  <span className="font-bold">{isAi ? 'GROK MISSION ASSISTANT' : 'FLIGHT CONTROLLER'}</span>
                  <span>{m.timestamp}</span>
                </div>

                <div className="space-y-1 font-sans text-xs">
                  {renderFormattedText(m.text)}
                </div>

                {isAi && m.sources && (
                  <div className="pt-2 border-t border-[#122036] flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="text-slate-500">SOURCES:</span>
                    {m.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.2 rounded bg-[#09152b] text-cyan-400 border border-cyan-900/50"
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
            <div className="w-7 h-7 rounded-sm bg-purple-950 border border-purple-700/60 text-purple-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded bg-[#060e1e] border border-[#162644] text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing live telemetry and calculating model inference...</span>
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
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Grok about spacecraft anomalies, failure probabilities, or simulated what-if outcomes..."
          className="flex-1 bg-[#060d1b] border border-[#162744] focus:border-cyan-500 rounded px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-950"
        >
          <Send className="w-3.5 h-3.5" />
          <span>QUERY</span>
        </button>
      </form>
    </div>
  );
};
