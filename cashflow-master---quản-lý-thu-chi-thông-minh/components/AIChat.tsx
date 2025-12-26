
import React, { useState, useRef, useEffect } from 'react';
import { Transaction, FinancialStats } from '../types';
import { geminiService } from '../services/geminiService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface Props {
  transactions: Transaction[];
  stats: FinancialStats;
}

const AIChat: React.FC<Props> = ({ transactions, stats }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Xin chào! Tôi là trợ lý tài chính AI của bạn. Tôi có thể giúp bạn phân tích dòng tiền hoặc đưa ra lời khuyên tiết kiệm. Bạn muốn hỏi gì không?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await geminiService.getFinancialAdvice(transactions, stats, userMessage);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Rất tiếc, đã có lỗi xảy ra khi kết nối với bộ não của tôi.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await geminiService.speakText(text);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
               <i className="fas fa-robot text-lg"></i>
            </div>
            <div>
               <h3 className="font-bold text-slate-800 text-sm">FinAssist AI</h3>
               <p className="text-[10px] text-emerald-600 font-bold animate-pulse">ĐANG TRỰC TUYẾN</p>
            </div>
         </div>
         <div className="text-xs text-slate-400 italic">Dựa trên Gemini 3 Pro</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl relative group ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              {m.role === 'ai' && (
                <button 
                  onClick={() => handleSpeak(m.text)}
                  disabled={isSpeaking}
                  className="absolute -right-10 top-2 text-indigo-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Đọc văn bản"
                >
                  <i className={`fas ${isSpeaking ? 'fa-spinner fa-spin' : 'fa-volume-up'}`}></i>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi AI về tình hình tài chính của bạn..."
          className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
        <button 
          type="submit"
          className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-transform active:scale-90"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default AIChat;
