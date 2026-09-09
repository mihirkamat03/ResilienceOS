import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ExternalLink,
  Shield,
  FileCheck,
  TrendingDown,
  Network,
  Wrench,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { queryCopilot } from '../../core/copilotEngine';
import { formatINR } from '../../core/riskEngine';

export const AIRiskCopilotDrawer = () => {
  const store = useRiskStore();
  const {
    isCopilotDrawerOpen,
    setIsCopilotDrawerOpen,
    activeRole,
    setSelectedRiskId,
    setSelectedAssetId,
    setActiveTab
  } = store;

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `Hello. I am the **ResilienceOS Grounded AI Risk Copilot**.

I synthesize natural language insights directly from our **active FAIR quantification engine**, **0/1 Knapsack optimizer**, **asset topology graph**, and **compliance controls**.

*Quantitative figures are grounded in current platform state with controlled fallback when information is unavailable.*`,
      sources: [
        { type: 'ENGINE', label: 'FAIR Risk Engine (Active)' },
        { type: 'STATE', label: 'Live Application State' }
      ],
      actions: [
        { label: 'Summarize for Board', actionText: 'Summarize our risk posture for the Board' },
        { label: 'Biggest Financial Risk', actionText: 'What is our biggest financial risk?' },
        { label: 'Optimal ₹20L Allocation', actionText: 'We have ₹20L. What should we do?' }
      ]
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isCopilotDrawerOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isCopilotDrawerOpen]);

  if (!isCopilotDrawerOpen) return null;

  const suggestedQuickPrompts = [
    'What is our biggest financial risk?',
    'We have ₹20L. What should we do?',
    'How can an attacker reach the Core Banking database?',
    'What changed recently in telemetry?',
    'Which compliance gaps are most important?',
    'Why is the database risk ranked above the dev sandbox?',
    'Summarize our security posture for the Board.'
  ];

  const handleSend = (textToSend) => {
    const queryText = (textToSend || inputQuery).trim();
    if (!queryText) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Query Copilot Grounding Engine
    setTimeout(() => {
      const response = queryCopilot(queryText, store, activeRole);

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        text: response.text,
        sources: response.sources || [],
        actions: response.actions || []
      };

      setMessages(prev => [...prev, botMsg]);
    }, 150);
  };

  const handleActionClick = (action) => {
    if (action.actionText) {
      handleSend(action.actionText);
    } else if (action.tab) {
      if (action.recordId) {
        setSelectedRiskId(action.recordId);
      }
      setActiveTab(action.tab);
      setIsCopilotDrawerOpen(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-[#12131b] border-l border-white/[0.08] shadow-2xl shadow-black/80 flex flex-col animate-slide-in-right">
      {/* Drawer Header */}
      <div className="p-4 bg-[#161720] border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Risk Copilot</h3>
              <span className="text-[10px] font-mono bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Role context: <span className="text-zinc-200 font-semibold">{activeRole}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCopilotDrawerOpen(false)}
          className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-medium rounded-2xl rounded-tr-sm p-4 shadow-md shadow-orange-500/15'
                  : 'bg-[#161720] border border-white/[0.07] text-zinc-200 rounded-2xl rounded-tl-sm p-4 space-y-3 shadow-md'
              }`}
            >
              {/* Message Body with simple markdown line rendering */}
              <div className="whitespace-pre-wrap">
                {msg.text.split('\n').map((line, lidx) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={lidx} className="font-bold text-white text-xs mt-2 mb-1">{line.replace('### ', '')}</h4>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <div key={lidx} className="font-semibold text-amber-300 my-1">{line.replace(/\*\*/g, '')}</div>;
                  }
                  return <div key={lidx}>{line}</div>;
                })}
              </div>

              {/* Source Attribution Metadata Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-3 border-t border-white/[0.06] mt-2">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
                    Grounded State Citations:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, sidx) => (
                      <span
                        key={sidx}
                        className="bg-[#111218] text-zinc-300 text-[10px] font-mono px-2.5 py-1 rounded-md border border-white/[0.06]"
                      >
                        {src.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Direct Action Buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2 mt-1">
                  {msg.actions.map((act, aidx) => (
                    <button
                      key={aidx}
                      onClick={() => handleActionClick(act)}
                      className="px-3 py-1.5 bg-[#111218] hover:bg-[#181924] text-amber-300 rounded-xl text-[11px] border border-amber-500/30 flex items-center space-x-1.5 font-semibold transition-all shadow-sm"
                    >
                      <span>{act.label}</span>
                      <ExternalLink className="w-3 h-3 text-amber-400 ml-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[10px] text-zinc-500 font-mono mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3.5 bg-[#161720] border-t border-white/[0.07]">
        <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Suggested Queries</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {suggestedQuickPrompts.map((prompt, pidx) => (
            <button
              key={pidx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] bg-[#111218] hover:bg-[#181924] text-zinc-300 hover:text-white px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-amber-500/30 whitespace-nowrap transition-all flex-shrink-0 shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 bg-[#161720] border-t border-white/[0.07]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask anything about risks, budget, attack paths, or compliance..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            className="flex-1 bg-[#111218] text-xs text-white px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-500/50 transition-colors placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 disabled:opacity-40 text-zinc-950 font-bold rounded-xl transition-all shadow-md shadow-orange-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
