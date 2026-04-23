import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Search, 
  ChevronRight, 
  User, 
  Mail, 
  GraduationCap, 
  Send, 
  Paperclip, 
  FileText,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: number;
  name: string;
  email: string;
  student_id: string;
  program?: { name: string };
  avatar_url?: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export default function AdvisorPortal() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student';

  useEffect(() => {
    if (!isStudent) {
      fetchStudents();
    } else {
      // Student view: the "selectedStudent" is actually the advisor profile for header display, 
      // but the API calls will use the advisor's ID
      if (user?.academic_advisor_id) {
         setSelectedStudent({
            id: user.academic_advisor_id,
            name: (user as any).advisor?.name || 'Academic Advisor',
            email: (user as any).advisor?.email || 'Office of Admissions',
            is_advisor: true
         });
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchChat(selectedStudent.id);
      const interval = setInterval(() => fetchChat(selectedStudent.id, true), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const res = await client.get('/advisor/my-students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async (studentId: number, silent = false) => {
    if (!silent) setChatLoading(true);
    try {
      const res = await client.get(`/advisor/chat/${studentId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch chat:', err);
    } finally {
      if (!silent) setChatLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newMessage.trim()) return;

    try {
      const res = await client.post('/advisor/send', {
        receiver_id: selectedStudent.id,
        message: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Caseload...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-offwhite flex flex-col lg:flex-row h-screen overflow-hidden">
      
      {/* Sidebar: Assigned Students (Always hidden for Students) */}
      {!isStudent && (
        <aside className="w-full lg:w-96 bg-white border-r border-border-soft flex flex-col">
          <div className="p-8 border-b border-border-soft bg-linear-to-br from-white to-offwhite">
            <div className="flex items-center gap-4 mb-6 text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">
              <ShieldCheck size={18} />
              Academic Advisory Portal
            </div>
            <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase italic leading-none">Advisor Desk</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Manage your assigned academic caseload</p>
          </div>

          <div className="p-6">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-mylms-purple transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="w-full pl-12 pr-6 py-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-bold text-xs uppercase tracking-widest transition-all shadow-inner"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-2 mb-4">Assigned Mentees</h3>
            {students.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full p-6 rounded-2xl border transition-all flex items-center gap-6 group relative overflow-hidden ${selectedStudent?.id === s.id ? 'bg-offwhite border-mylms-purple shadow-md' : 'bg-white border-border-soft hover:border-mylms-purple/20'}`}
              >
                <div className="w-14 h-14 bg-offwhite rounded-xl flex items-center justify-center border border-border-soft font-black text-mylms-purple text-lg shadow-inner group-hover:scale-110 transition-transform">
                  {s.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-sm uppercase tracking-tight text-text-main leading-none mb-2">{s.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{s.program?.name || 'Academic Record'}</p>
                  <p className="text-[9px] font-black text-mylms-rose uppercase tracking-[0.2em] mt-3 font-mono">ID: {s.student_id || 'PENDING'}</p>
                </div>
                <ChevronRight size={18} className={`${selectedStudent?.id === s.id ? 'text-mylms-purple' : 'text-gray-200'} transition-all`} />
              </button>
            ))}
            {students.length === 0 && (
              <div className="py-20 text-center opacity-40">
                 <Users size={40} className="mx-auto mb-6 text-gray-200" />
                 <p className="text-[10px] font-black uppercase tracking-widest leading-loose">No students assigned <br/> to your desk yet.</p>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Content: Chat / Inbox */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedStudent ? (
          <>
            {/* Chat Header */}
            <div className="p-8 border-b border-border-soft flex justify-between items-center bg-white z-10 shadow-sm relative">
               <div className="flex items-center gap-6">
                  {isStudent && (
                    <button onClick={() => navigate(-1)} className="p-4 rounded-xl hover:bg-offwhite text-gray-400 mr-2">
                       <ArrowLeft size={20} />
                    </button>
                  )}
                  <div className="w-16 h-16 bg-offwhite rounded-2xl flex items-center justify-center border border-border-soft shadow-inner font-black text-2xl text-mylms-purple text-center">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter leading-none mb-3 italic">{isStudent ? 'Academic Advisor' : selectedStudent.name}</h3>
                    <div className="flex items-center gap-4">
                       <span className="flex items-center gap-2 text-[10px] font-black text-mylms-rose uppercase tracking-widest bg-mylms-rose/5 px-3 py-1 rounded-lg border border-mylms-rose/10 italic">
                         {isStudent ? 'Staff Profile' : 'Registry Verified'}
                       </span>
                       <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{selectedStudent.email}</p>
                    </div>
                  </div>
               </div>
               <div className="flex gap-4">
                  <button className="p-4 rounded-xl border border-border-soft text-gray-400 hover:text-mylms-purple transition-all bg-offwhite/30">
                    <FileText size={20} />
                  </button>
                  <button className="p-4 rounded-xl border border-border-soft text-gray-400 hover:text-mylms-purple transition-all bg-offwhite/30">
                    <GraduationCap size={20} />
                  </button>
               </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar bg-linear-to-b from-offwhite/40 to-white">
               {messages.map((msg, idx) => (
                 <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                   <div className="flex flex-col max-w-xl">
                      <div className={`p-8 rounded-3xl shadow-xl border ${msg.sender_id === user?.id ? 'bg-mylms-purple text-white border-mylms-purple/20' : 'bg-white text-text-main border-border-soft'}`}>
                        <p className="font-bold text-sm leading-relaxed italic">{msg.message}</p>
                        {msg.attachment_url && (
                          <div className={`mt-6 p-4 rounded-xl border flex items-center gap-4 transition-all hover:scale-105 cursor-pointer ${msg.sender_id === user?.id ? 'bg-white/10 border-white/20 text-white' : 'bg-offwhite border-border-soft text-mylms-purple'}`}>
                             <Paperclip size={18} />
                             <span className="text-[10px] font-black uppercase tracking-widest">institutional_document.pdf</span>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-3 mt-4 text-[9px] font-black uppercase tracking-widest text-gray-300 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                         <Clock size={12} />
                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         {msg.sender_id === user?.id && <CheckCircle size={12} className={msg.is_read ? 'text-green-500' : 'text-gray-200'} />}
                      </div>
                   </div>
                 </div>
               ))}
               {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <MessageSquare size={64} className="text-gray-100 mb-8" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Initialize Advisory Dialogue</p>
                 </div>
               )}
            </div>

            {/* Message Input */}
            <div className="p-8 border-t border-border-soft bg-white z-10 shadow-2xl relative">
               <form onSubmit={handleSendMessage} className="flex items-center gap-6">
                  <button type="button" className="p-5 rounded-2xl bg-offwhite border border-border-soft text-gray-400 hover:text-mylms-purple transition-all shadow-inner">
                    <Paperclip size={20} />
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isStudent ? "Message your advisor..." : "Compose academic advisory response..."}
                      className="w-full p-5 pl-8 bg-offwhite border-2 border-border-soft rounded-2xl outline-none focus:border-mylms-purple transition-all font-bold text-sm text-text-main shadow-inner"
                    />
                  </div>
                  <button type="submit" className="p-5 px-10 bg-mylms-purple text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest">
                    {isStudent ? 'Send Message' : 'Post Message'}
                    <Send size={18} />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-700">
             <div className="w-32 h-32 bg-offwhite rounded-[40px] flex items-center justify-center mb-12 shadow-inner border border-border-soft text-mylms-purple">
                <MessageSquare size={64} className="opacity-10" />
             </div>
             <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter mb-6 italic">Secure {isStudent ? 'Advisory' : 'Messaging'} Registry</h2>
             <p className="text-text-secondary font-bold text-base max-w-sm leading-relaxed opacity-60 uppercase tracking-widest mb-12 italic">
               {isStudent ? 'Your academic advisor has not been assigned yet. Please check back later.' : 'Select an assigned academic mentee from the registry to initiate a secure encrypted dialogue protocol.'}
             </p>
          </div>
        )}
      </main>
    </div>
  );
}
