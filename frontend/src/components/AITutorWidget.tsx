import { useState, useRef, useEffect } from 'react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { 
  X, 
  Bot, 
  User, 
  ArrowUp
} from 'lucide-react';

interface Message {
  id: string;
  role: 'student' | 'tutor';
  content: string;
}

export default function AITutorWidget({ courseId }: { courseId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'tutor', content: 'Greeting Scholar. I am your MyLMS Tutor. How may I assist your curriculum comprehension today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const token = useAuthStore((state: any) => state.token);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'student', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await client.post(`/courses/${courseId}/tutor`, { message: userMsg }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'tutor', 
        content: res.data.message 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'tutor', 
        content: err.response?.data?.error || 'Registry error detected. Protocol inhibited. Please re-authenticate your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-50">
      {/* MyLMS Chat Interface */}
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-[420px] max-w-[calc(100vw-4rem)] bg-white rounded-3xl border border-border-soft shadow-2xl overflow-hidden flex flex-col mb-4 h-[600px] transition-all animate-in slide-in-from-bottom-5 group">
          
          {/* Interface Header */}
          <div className="bg-white border-b border-offwhite p-8 flex justify-between items-center relative overflow-hidden group/header">
            <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover/header:bg-mylms-purple/5 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-mylms-purple rounded-lg flex items-center justify-center text-white shadow-sm font-black text-[10px]">
                    AI
                 </div>
                 <h3 className="font-black text-lg text-text-main tracking-tighter uppercase leading-none">
                   Tutor Registry
                 </h3>
              </div>
              <p className="text-[8px] uppercase tracking-[0.4em] font-black text-gray-300">Instructional Support Protocol</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="relative z-10 w-10 h-10 bg-offwhite text-gray-400 hover:text-mylms-purple rounded-xl flex items-center justify-center transition-all shadow-inner hover:bg-white border border-transparent hover:border-border-soft"
            >
              <X size={18} />
            </button>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-offwhite/30 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm border ${
                  msg.role === 'student' 
                    ? 'bg-mylms-purple text-white border-transparent' 
                    : 'bg-white border-border-soft text-mylms-purple'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-40">
                     {msg.role === 'student' ? <User size={10} /> : <Bot size={10} />}
                     <span className="text-[7px] font-black uppercase tracking-[0.2em]">{msg.role === 'student' ? 'SCHOLAR_INPUT' : 'TUTOR_RESPONSE'}</span>
                  </div>
                  <p className="text-[12px] font-bold leading-relaxed whitespace-pre-wrap opacity-90">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start animate-pulse">
                  <div className="bg-white border border-border-soft rounded-2xl px-6 py-4 shadow-sm">
                     <div className="flex gap-2 items-center h-4">
                       <div className="w-1.5 h-1.5 bg-mylms-purple rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                       <div className="w-1.5 h-1.5 bg-mylms-purple rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-1.5 h-1.5 bg-mylms-purple rounded-full animate-bounce"></div>
                     </div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Protocol Area */}
          <form onSubmit={handleSend} className="p-6 bg-white border-t border-offwhite">
            <div className="relative flex items-center group/field">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Submit inquiry regarding course curriculum..."
                className="w-full bg-offwhite border border-border-soft rounded-2xl py-4 pl-6 pr-14 text-sm font-black text-text-main focus:outline-none focus:border-mylms-purple transition-all placeholder:text-gray-200 shadow-inner uppercase text-[11px] tracking-tight"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-mylms-purple text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-mylms-purple/90 disabled:opacity-30 transition-all shadow-xl active:scale-95"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Primary Toggle Interface */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-3xl shadow-2xl flex items-center justify-center transition-all outline-none border-4 border-white group/btn relative overflow-hidden ${isOpen ? 'bg-text-main scale-90' : 'bg-mylms-purple hover:scale-110 active:scale-95'}`}
      >
        <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full"></div>
        {isOpen ? (
          <X size={32} className="text-white" />
        ) : (
          <div className="flex flex-col items-center">
             <Bot size={28} className="text-white mb-0" />
             <span className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">SUPPORT</span>
          </div>
        )}
      </button>
    </div>
  );
}
