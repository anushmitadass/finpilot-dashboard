import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCpu, FiSend, FiArrowUpRight, FiCheck } from 'react-icons/fi';

export default function AICopilot({ isOpen, onClose, searchQuery, clearSearchQuery }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Namaste Sarah, I am your FinPilot copilot. I've audited your Indian accounts and mutual funds for May 2026. What would you like to review?",
      time: '12:30 PM',
      chips: [
        'Analyze Zomato & Swiggy spending',
        'Optimize FD / Vault yields',
        'Check tax harvesting risk',
        'Rebalance my mutual fund SIPs'
      ]
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle external search query injection
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      handleUserSubmit(searchQuery);
      clearSearchQuery();
    }
  }, [searchQuery]);

  const handleUserSubmit = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "";
      let recommendations = null;

      const lowerText = text.toLowerCase();
      if (lowerText.includes('spend') || lowerText.includes('dining') || lowerText.includes('zomato') || lowerText.includes('swiggy') || lowerText.includes('food')) {
        replyText = "I found that food delivery and dining expenses on **Zomato** and **Swiggy** rose **12.4%** compared to last month. To maintain your planned monthly SIP contributions, I recommend capping food delivery spending to **₹8,000/month**.";
        recommendations = [
          { label: 'Set dynamic dining budget to ₹8,000', action: 'applied' },
          { label: 'Set alert for transaction >₹1,500', action: 'apply' }
        ];
      } else if (lowerText.includes('yield') || lowerText.includes('vault') || lowerText.includes('saving') || lowerText.includes('fd') || lowerText.includes('interest')) {
        replyText = "Partner bank vault rates have increased. Your current idle savings bank balance of **₹4,20,000** is earning only **3.0% interest**. Shifting **₹2,50,000** to the high-yield partners vault would unlock **7.25% interest APY**, earning you an extra **₹10,625** in automated annual yields.";
        recommendations = [
          { label: 'Shift ₹2,50,000 to partner vaults', action: 'apply' }
        ];
      } else if (lowerText.includes('harvest') || lowerText.includes('tax') || lowerText.includes('risk') || lowerText.includes('capital gain')) {
        replyText = "Your tax-loss harvesting threshold has been reached on **Reliance Industries** holdings with an unrealized short-term capital loss of **-₹12,400**. I recommend executing a harvest transaction to offset tax liabilities and purchasing a Nifty 50 Index Fund immediately to keep equity exposure.";
        recommendations = [
          { label: 'Harvest Reliance losses & buy Nifty 50 ETF', action: 'apply' }
        ];
      } else if (lowerText.includes('rebalance') || lowerText.includes('sip') || lowerText.includes('tech') || lowerText.includes('mutual fund') || lowerText.includes('portfolio')) {
        replyText = "Your high-growth equity mutual funds (specifically small-cap and tech funds) are currently at **54%** of your net wealth, which exceeds your target asset allocation risk limit of **45%**. I suggest reallocating **₹84,000** from active funds into debt funds or liquid vaults yielding **6.5% interest**.";
        recommendations = [
          { label: 'Reallocate ₹84,000 from Equity to Debt Funds', action: 'apply' }
        ];
      } else {
        replyText = `Understood. Analyzing "${text}" against current Indian financial markets. Based on your moderate-risk profile, your total assets of **₹25,29,000** are well distributed. I suggest regular automated monthly SIPs to smooth market volatility.`;
      }

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: recommendations
      };

      setMessages(prev => [...prev, assistantMsg]);
    }, 1500);
  };

  const handleChipClick = (chip) => {
    handleUserSubmit(chip);
  };

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] bg-[#111827] border-l border-slate-800 shadow-xl flex flex-col transition-all duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 bg-[#111827]">
          <div className="flex items-center gap-2">
            <FiCpu className="w-4.5 h-4.5 text-blue-500" />
            <h3 className="font-bold text-slate-100 text-sm">FinPilot AI Copilot</h3>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Logs Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col max-w-[85%]
                ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}
              `}
            >
              {/* Bubble text */}
              <div className={`px-3 py-2.5 rounded-lg text-xs leading-relaxed border
                ${m.sender === 'user' 
                  ? 'bg-blue-600 border-blue-500 text-white rounded-br-none' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 rounded-bl-none'
                }
              `}>
                {m.text.split('**').map((part, index) => 
                  index % 2 === 1 ? <strong key={index} className="text-white font-bold">{part}</strong> : part
                )}

                {/* Simulated Recommendations */}
                {m.recommendations && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5">
                    <p className="text-[9px] uppercase font-bold tracking-wider text-blue-400">Available Actions</p>
                    {m.recommendations.map((rec, i) => (
                      <button 
                        key={i}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer
                          ${rec.action === 'applied' 
                            ? 'bg-slate-950/40 border-slate-800/40 text-slate-450 cursor-default' 
                            : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-300'
                          }
                        `}
                        disabled={rec.action === 'applied'}
                      >
                        <span>{rec.label}</span>
                        {rec.action === 'applied' ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiArrowUpRight className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[8px] text-slate-500 font-semibold mt-1 font-mono">
                {m.time}
              </span>

              {/* Prompt Suggestions */}
              {m.chips && m.chips.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(chip)}
                      className="px-2.5 py-1 text-[10px] font-semibold rounded bg-slate-900 border border-slate-800 hover:border-blue-500/30 text-slate-350 hover:text-white transition-all cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start mr-auto max-w-[80%]">
              <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-[#111827]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleUserSubmit(inputVal);
            }}
            className="flex items-center gap-2"
          >
            <input 
              type="text" 
              placeholder="Ask FinPilot..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 h-9 px-3 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg focus:border-blue-500"
            />
            <button 
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="w-9 h-9 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <FiSend className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
