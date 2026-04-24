import { useState, useEffect } from 'react';
import { 
  Send, 
  Search, 
  Settings, 
  User, 
  Mail, 
  MessageSquare,
  ShieldCheck,
  Bell
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function InstructorMessaging() {
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    emailFrom: user?.name + ' <instructor@smartuni.edu>',
    replyTo: 'instructor@smartuni.edu'
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await client.get('/my-courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Simplification: just getting some students from the courses
        // In a real app, this would be a refined student directory for the instructor
        setStudents([
            { id: 1, name: 'John Smith', email: 'john@example.com', status: 'Online' },
            { id: 2, name: 'Sarah Parker', email: 'sarah@example.com', status: 'Offline' },
            { id: 3, name: 'Michael Ross', email: 'mike@example.com', status: 'Online' }
        ]);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  const handleSendMessage = async () => {
    if (!message || !selectedStudent) return;
    
    try {
        // Logic to send notification + email
        // For demonstration, we'll hit a generic messaging endpoint
        await client.post('/notifications', {
            user_id: selectedStudent.id,
            title: `Message from ${user?.name}`,
            content: message,
            type: 'message',
            email_sync: true,
            email_from: emailSettings.emailFrom,
            reply_to: emailSettings.replyTo
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        setMessage('');
        alert('Message dispatched to student registry and email gateway.');
    } catch (err) {
        console.error('Failed to dispatch message:', err);
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen bg-offwhite">
      <div className="mb-12 flex justify-between items-end border-b border-border-soft pb-12">
        <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
                <MessageSquare className="opacity-50" size={16} />
                Student Correspondence Hub
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">Instructional Messaging</h1>
            <p className="text-text-secondary text-xs font-black uppercase tracking-widest italic opacity-60">Unified gateway for direct student engagement and email synchronization.</p>
        </div>
        
        <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 bg-white border border-border-soft rounded-2xl hover:bg-mylms-purple hover:text-white transition-all shadow-sm group"
        >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-12 bg-white p-10 rounded-3xl border border-border-soft shadow-xl animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                <ShieldCheck size={18} className="text-mylms-purple" />
                Outgoing Gateway Protocols
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Email Display Name (From)</label>
                    <input 
                        type="text" 
                        value={emailSettings.emailFrom}
                        onChange={e => setEmailSettings({...emailSettings, emailFrom: e.target.value})}
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple"
                    />
                </div>
                <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Reply-To Address</label>
                    <input 
                        type="email" 
                        value={emailSettings.replyTo}
                        onChange={e => setEmailSettings({...emailSettings, replyTo: e.target.value})}
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple"
                    />
                </div>
            </div>
            <p className="mt-8 text-[9px] font-black text-mylms-rose uppercase tracking-widest opacity-60">* SMTP authentication is managed at the institutional level. These settings only affect display headers.</p>
        </div>
      )}

      <div className="flex bg-white rounded-3xl border border-border-soft shadow-2xl overflow-hidden h-[600px]">
        {/* Sidebar */}
        <div className="w-80 border-r border-border-soft flex flex-col">
          <div className="p-8 border-b border-border-soft bg-offwhite/30">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                    type="text" 
                    placeholder="Search students..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-border-soft rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-mylms-purple"
                />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border-soft">
            {students.map(std => (
              <button 
                key={std.id}
                onClick={() => setSelectedStudent(std)}
                className={`w-full p-6 text-left hover:bg-offwhite/50 transition-all flex items-center gap-4 border-l-4 ${selectedStudent?.id === std.id ? 'border-mylms-purple bg-mylms-purple/5' : 'border-transparent'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black italic shadow-sm">
                    {std.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-text-main text-xs uppercase truncate">{std.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${std.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{std.status}</span>
                    </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-offwhite/10">
          {selectedStudent ? (
            <>
              <div className="p-8 border-b border-border-soft flex justify-between items-center bg-white shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-mylms-rose flex items-center justify-center text-white font-black">
                        {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="font-black text-text-main uppercase text-sm tracking-tight">{selectedStudent.name}</h2>
                        <p className="text-[9px] font-bold text-gray-400">{selectedStudent.email}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="p-3 bg-offwhite rounded-xl text-gray-400 hover:text-mylms-purple transition-all"><Mail size={18} /></button>
                    <button className="p-3 bg-offwhite rounded-xl text-gray-400 hover:text-mylms-purple transition-all"><Bell size={18} /></button>
                </div>
              </div>
              
              <div className="flex-1 p-10 overflow-y-auto flex flex-col gap-6">
                <div className="self-center bg-white border border-border-soft px-4 py-2 rounded-full shadow-sm">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Initiating Authenticated Session</p>
                </div>
                {/* Mock messages can go here */}
                <div className="p-8 rounded-3xl bg-white border border-border-soft shadow-sm max-w-lg self-start">
                    <p className="text-xs font-medium text-text-secondary leading-relaxed italic">System generated: Establishing secure instructional gateway between {user?.name} and {selectedStudent.name}.</p>
                </div>
              </div>

              <div className="p-8 border-t border-border-soft bg-white">
                <div className="flex gap-4 items-end">
                    <textarea 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder={`Message ${selectedStudent.name}...`}
                        className="flex-1 p-6 bg-offwhite border border-border-soft rounded-2xl font-black text-xs h-32 outline-none focus:ring-2 focus:ring-mylms-purple resize-none"
                    />
                    <button 
                        onClick={handleSendMessage}
                        className="bg-mylms-purple text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-all"
                    >
                        <Send size={24} />
                    </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 p-20">
                <MessageSquare size={120} className="text-mylms-purple mb-10" />
                <h2 className="text-3xl font-black text-text-main uppercase tracking-tighter">Student Registry</h2>
                <p className="text-xs font-black uppercase tracking-widest mt-4">Select a student from the directory to initiate secure instructional correspondence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
