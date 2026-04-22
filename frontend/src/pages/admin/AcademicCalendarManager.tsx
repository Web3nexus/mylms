import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Calendar, 
  Clock, 
  PlusCircle, 
  CalendarDays,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface AcademicEvent {
  id: number;
  title: string;
  event_type: string;
  start_date: string;
  end_date: string;
}

interface Semester {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  events: AcademicEvent[];
}

interface AcademicSession {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  semesters: Semester[];
}

export default function AcademicCalendarManager() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState<number | null>(null);
  const [showEventModal, setShowEventModal] = useState<number | null>(null);
  
  const [sessionForm, setSessionForm] = useState({ name: '', start_date: '', end_date: '', is_active: false });
  const [semesterForm, setSemesterForm] = useState({ name: '', start_date: '', end_date: '', is_current: false });
  const [eventForm, setEventForm] = useState({ title: '', event_type: 'registration', start_date: '', end_date: '' });

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await client.get('/academic/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching academic sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/academic/sessions', sessionForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowSessionModal(false);
      fetchSessions();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Session Optimized',
        message: 'The new academic annual session has been successfully committed to the ledger.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Conflict Detected',
        message: 'Unable to provision session. Ensure date ranges do not overlap existing records.'
      });
    }
  };

  const handleCreateSemester = async (e: React.FormEvent, sessionId: number) => {
    e.preventDefault();
    try {
      await client.post(`/academic/sessions/${sessionId}/semesters`, semesterForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowSemesterModal(null);
      fetchSessions();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Term Initialized',
        message: 'The academic semester window is now active and synchronized.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Registry Error',
        message: 'Operational window could not be defined in this session.'
      });
    }
  };

  const handleCreateEvent = async (e: React.FormEvent, semesterId: number) => {
    e.preventDefault();
    try {
      await client.post('/academic/events', { ...eventForm, semester_id: semesterId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEventModal(null);
      fetchSessions();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const handleActivateSession = async (id: number) => {
    try {
      await client.post(`/academic/sessions/${id}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSessions();
    } catch (err) {
      console.error('Activation failed:', err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-text-secondary font-black uppercase tracking-widest text-[9px]">Synchronizing Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-0">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase leading-none">Academic Timeline</h2>
          <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mt-4">Administrative Control of Session & Term Dates</p>
        </div>
        <button 
          onClick={() => setShowSessionModal(true)}
          className="btn-purple px-8 py-3 flex items-center gap-3"
        >
          <PlusCircle size={16} />
          New Academic Session
        </button>
      </div>

      <div className="space-y-12">
        {sessions.map(session => (
          <div key={session.id} className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden group hover:border-mylms-purple/20 transition-all border-t-8 border-t-mylms-purple">
            <div className={`p-10 flex flex-col md:flex-row justify-between items-center gap-8 ${session.is_active ? 'bg-offwhite border-b border-border-soft' : 'bg-white border-b border-border-soft'}`}>
              <div className="relative overflow-hidden">
                <div className="flex items-center gap-4 mb-3">
                   <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase">{session?.name}</h2>
                   {session.is_active && <span className="bg-mylms-rose/5 text-mylms-rose text-[9px] font-black uppercase px-3 py-1 rounded-lg border border-mylms-rose/10">Active Session</span>}
                </div>
                <div className="flex items-center gap-3 text-text-secondary font-bold text-[10px] uppercase tracking-widest opacity-60">
                  <Calendar size={12} />
                  {new Date(session.start_date).toLocaleDateString()} — {new Date(session.end_date).toLocaleDateString()}
                </div>
              </div>
              {!session.is_active && (
                <button 
                  onClick={() => handleActivateSession(session.id)}
                  className="bg-white border border-border-soft text-text-main px-8 py-2.5 rounded-xl text-[10px] font-black hover:bg-offwhite transition-all shadow-sm uppercase tracking-widest"
                >
                  Activate Session
                </button>
              )}
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
              {session.semesters.map(semester => (
                <div key={semester.id} className="p-8 bg-white border border-border-soft rounded-2xl hover:shadow-xl transition-all group/term relative overflow-hidden flex flex-col">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover/term:bg-mylms-purple/5 transition-all"></div>
                   <div className="flex justify-between items-start mb-8 pb-6 border-b border-offwhite relative z-10">
                      <div>
                        <h3 className="text-xl font-black text-text-main tracking-tighter uppercase">{semester?.name} Semester</h3>
                        <p className="text-text-secondary font-bold text-[10px] uppercase mt-2 tracking-widest opacity-60">
                           {new Date(semester.start_date).toLocaleDateString()} — {new Date(semester.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      {semester.is_current ? (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-[9px] font-black uppercase px-3 py-1 rounded-lg border border-green-100">
                          <CheckCircle size={10} />
                          Active Term
                        </div>
                      ) : (
                        <button 
                          onClick={() => client.post(`/academic/semesters/${semester.id}/current`, {}, { headers: { Authorization: `Bearer ${token}` } }).then(fetchSessions)}
                          className="text-[9px] font-black text-mylms-purple uppercase opacity-0 group-hover/term:opacity-100 transition-all tracking-[0.2em] border-b border-mylms-purple/10"
                        >
                          Establish Term
                        </button>
                      )}
                   </div>

                   <div className="space-y-3 mb-10 grow relative z-10">
                     <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em] mb-6 border-b border-offwhite pb-3">Critical Academic Events</p>
                     {semester.events.map(event => (
                       <div key={event.id} className="bg-offwhite px-4 py-3 border border-border-soft rounded-xl flex justify-between items-center group/event hover:bg-white transition-all shadow-sm">
                          <div>
                            <p className="text-[11px] font-black text-text-main uppercase leading-none">{event?.title}</p>
                            <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mt-2 opacity-50">{event.event_type}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-mylms-purple font-mono">
                                {new Date(event.start_date).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                     ))}
                     {semester.events.length === 0 && (
                        <div className="py-10 text-center bg-offwhite/50 rounded-xl border border-dashed border-border-soft opacity-40">
                           <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest">No specific events recorded.</p>
                        </div>
                     )}
                   </div>

                   <button 
                    onClick={() => setShowEventModal(semester.id)}
                    className="w-full py-3.5 bg-white border border-dashed border-border-soft text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-mylms-purple/40 hover:text-mylms-purple transition-all shadow-sm flex items-center justify-center gap-2 relative z-10"
                   >
                     <Clock size={14} className="opacity-40" />
                     Post Registry Event
                   </button>
                </div>
              ))}

              <div className="flex flex-col items-center justify-center p-12 bg-offwhite rounded-2xl border-2 border-dashed border-border-soft text-center hover:bg-white hover:border-mylms-purple/40 transition-all cursor-pointer group/add shrink-0 h-full"
                   onClick={() => setShowSemesterModal(session.id)}>
                 <CalendarDays size={32} className="text-gray-200 mb-6 group-hover/add:text-mylms-purple transition-colors opacity-40" />
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] group-hover/add:text-mylms-purple transition-colors leading-loose">+ Register New Semester Window</p>
              </div>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
            <div className="p-40 text-center bg-white border-2 border-dashed border-border-soft rounded-3xl opacity-60">
                <Calendar size={48} className="text-gray-100 mx-auto mb-8" />
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] leading-loose">The academic registry contains no session data. Define a session to initiate protocol.</p>
            </div>
        )}
      </div>

      {/* Registry Modals */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-text-main/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl border border-border-soft w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
              <div className="bg-white p-10 border-b border-offwhite relative z-10">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Session Protocol</h2>
                       <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest mt-4 opacity-50">MyLMS Academic Year Configuration</p>
                    </div>
                    <button onClick={() => setShowSessionModal(false)} className="text-gray-300 hover:text-mylms-rose transition-all"><X size={24} /></button>
                 </div>
              </div>
              <form onSubmit={handleCreateSession} className="p-10 space-y-8 relative z-10">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Internal Registry Title (e.g. 2026/27)</label>
                  <input required value={sessionForm?.name} onChange={e => setSessionForm({...sessionForm, name: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-sm shadow-inner transition-all uppercase placeholder:text-gray-200" placeholder="e.g. 2026/2027 Academic Year" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Session Start</label>
                     <input type="date" required value={sessionForm.start_date} onChange={e => setSessionForm({...sessionForm, start_date: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-sm shadow-inner transition-all" />
                   </div>
                   <div>
                     <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Session End</label>
                     <input type="date" required value={sessionForm.end_date} onChange={e => setSessionForm({...sessionForm, end_date: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-sm shadow-inner transition-all" />
                   </div>
                </div>
                <div className="flex items-center gap-4 pt-6">
                   <button type="submit" className="grow py-5 bg-mylms-purple text-white font-black rounded-full hover:bg-mylms-purple/90 shadow-xl transition-all uppercase tracking-[0.3em] text-[10px] active:scale-95">Commit Session Entry</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {showSemesterModal && (
        <div className="fixed inset-0 bg-text-main/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl border border-border-soft w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
              <div className="bg-white p-10 border-b border-offwhite relative z-10">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Term Configuration</h2>
                       <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest mt-4 opacity-50">Operational Window Parameters</p>
                    </div>
                    <button onClick={() => setShowSemesterModal(null)} className="text-gray-300 hover:text-mylms-rose transition-all"><X size={24} /></button>
                 </div>
              </div>
              <form onSubmit={(e) => handleCreateSemester(e, showSemesterModal)} className="p-10 space-y-8 relative z-10">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Term Designation (Fall / Spring / Summer)</label>
                  <input required value={semesterForm?.name} onChange={e => setSemesterForm({...semesterForm, name: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-sm shadow-inner transition-all uppercase" placeholder="e.g. Fall 2026" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Window Open</label>
                     <input type="date" required value={semesterForm.start_date} onChange={e => setSemesterForm({...semesterForm, start_date: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-sm shadow-inner transition-all" />
                   </div>
                   <div>
                     <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Window Close</label>
                     <input type="date" required value={semesterForm.end_date} onChange={e => setSemesterForm({...semesterForm, end_date: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-sm shadow-inner transition-all" />
                   </div>
                </div>
                <div className="flex items-center gap-4 pt-6">
                   <button type="submit" className="grow py-5 bg-mylms-purple text-white font-black rounded-full hover:bg-mylms-purple/90 shadow-xl transition-all uppercase tracking-[0.3em] text-[10px] active:scale-95">Initialize Academic Term</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-text-main/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl border border-border-soft w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
              <div className="bg-white p-10 border-b border-offwhite relative z-10">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Event Registration</h2>
                       <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest mt-4 opacity-50">Unified Calendar Synchronization</p>
                    </div>
                    <button onClick={() => setShowEventModal(null)} className="text-gray-300 hover:text-mylms-rose transition-all"><X size={24} /></button>
                 </div>
              </div>
              <form onSubmit={(e) => handleCreateEvent(e, showEventModal)} className="p-10 space-y-8 relative z-10">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Event Subject</label>
                  <input required value={eventForm?.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-sm shadow-inner transition-all uppercase" placeholder="e.g. End of Semester Examinations" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Classification</label>
                  <select value={eventForm.event_type} onChange={e => setEventForm({...eventForm, event_type: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs shadow-inner transition-all uppercase">
                    <option value="registration">Course Registration</option>
                    <option value="exam">Examination Period</option>
                    <option value="holiday">MyLMS Holiday</option>
                    <option value="orientation">Student Orientation</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Commencement</label>
                     <input type="datetime-local" required value={eventForm.start_date} onChange={e => setEventForm({...eventForm, start_date: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs shadow-inner transition-all" />
                   </div>
                   <div>
                     <label className="block text-[9px] font-black text-gray-400 uppercase mb-4 tracking-widest">Conclusion</label>
                     <input type="datetime-local" required value={eventForm.end_date} onChange={e => setEventForm({...eventForm, end_date: e.target.value})} className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs shadow-inner transition-all" />
                   </div>
                </div>
                <div className="flex items-center gap-4 pt-6">
                   <button type="submit" className="grow py-5 bg-mylms-purple text-white font-black rounded-full hover:bg-mylms-purple/90 shadow-xl transition-all uppercase tracking-[0.3em] text-[10px] active:scale-95">Commit Event Protocol</button>
                </div>
              </form>
           </div>
        </div>
      )}
      {/* Notification Modal */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-mylms-purple/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl border border-white/20 max-w-sm w-full p-12 text-center transform animate-in zoom-in-95 duration-500">
              <div className={`w-20 h-20 mx-auto rounded-[28px] flex items-center justify-center mb-8 shadow-inner ${notification.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-mylms-rose/10 text-mylms-rose'}`}>
                 {notification.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
              </div>
              <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter mb-4">{notification?.title}</h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10">{notification.message}</p>
              <button 
                onClick={() => setNotification({ ...notification, isOpen: false })}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 ${notification.type === 'success' ? 'bg-mylms-purple text-white shadow-xl' : 'bg-mylms-rose text-white shadow-xl'}`}
              >
                Acknowledge
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
