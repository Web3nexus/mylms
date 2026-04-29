import { useState, useEffect } from 'react';
import { Video, Calendar, Plus, Users, Clock, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function LiveClassHub() {
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    course_id: '',
    description: '',
    scheduled_at: '',
  });

  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { notify } = useNotificationStore();

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [classesRes, coursesRes] = await Promise.all([
        client.get('/live-classes', { headers: { Authorization: `Bearer ${token}` } }),
        client.get('/instructor/courses', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []));
    } catch (err) {
      console.error('Error fetching live classes data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/live-classes', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify('Live class scheduled successfully', 'success');
      setShowModal(false);
      setFormData({ title: '', course_id: '', description: '', scheduled_at: '' });
      fetchData();
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to schedule class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartClass = async (id: number, roomName: string) => {
    try {
      await client.post(`/live-classes/${id}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/office/live-classes/room/${roomName}`);
    } catch (err) {
      notify('Failed to start the class', 'error');
    }
  };

  const activeClasses = classes.filter(c => c.status === 'live');
  const scheduledClasses = classes.filter(c => c.status === 'scheduled');
  const pastClasses = classes.filter(c => c.status === 'ended');

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none mb-3">Live Class Operations</h1>
          <p className="text-text-secondary text-xs font-black uppercase tracking-widest opacity-60 italic">Host and manage real-time interactive video sessions for your students.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-3 bg-mylms-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
        >
          <Plus size={14} /> Schedule New Class
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Active Classes */}
          {activeClasses.length > 0 && (
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-text-main mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Currently Live
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeClasses.map(c => (
                  <div key={c.id} className="bg-red-50 border border-red-100 rounded-3xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{c.course?.title}</p>
                      <h3 className="text-xl font-black text-text-main">{c.title}</h3>
                    </div>
                    <button 
                      onClick={() => navigate(`/office/live-classes/room/${c.room_name}`)}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-md flex items-center gap-2"
                    >
                      <Video size={14} /> Rejoin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Classes */}
          <div>
             <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Upcoming Sessions</h2>
             {scheduledClasses.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-sm p-16 text-center">
                   <Calendar size={36} className="mx-auto text-gray-200 mb-4" />
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No scheduled sessions</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scheduledClasses.map(c => (
                    <div key={c.id} className="bg-white border border-border-soft rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                      <p className="text-[9px] font-black text-mylms-purple uppercase tracking-widest mb-2 truncate">{c.course?.title}</p>
                      <h3 className="text-base font-black text-text-main leading-tight mb-4">{c.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
                        <Clock size={14} />
                        {new Date(c.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      <button 
                        onClick={() => handleStartClass(c.id, c.room_name)}
                        className="w-full py-3 bg-mylms-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-mylms-purple/90 transition-all flex items-center justify-center gap-2"
                      >
                        <Play size={14} /> Go Live Now
                      </button>
                    </div>
                  ))}
                </div>
             )}
          </div>

          {/* Past Classes */}
          {pastClasses.length > 0 && (
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Past Sessions</h2>
              <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-border-soft">
                    {pastClasses.slice(0, 5).map(c => (
                      <tr key={c.id} className="hover:bg-offwhite transition-all">
                        <td className="px-8 py-5">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{c.course?.title}</p>
                          <h3 className="text-sm font-black text-text-main">{c.title}</h3>
                        </td>
                        <td className="px-8 py-5 text-[11px] font-bold text-gray-500">
                          {new Date(c.scheduled_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-main/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-border-soft">
            <h2 className="text-2xl font-black text-text-main uppercase tracking-tight mb-6">Schedule Class</h2>
            <form onSubmit={handleSchedule} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Session Title</label>
                <input 
                  type="text" required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-offwhite border-2 border-transparent rounded-xl py-3 px-4 text-sm font-bold focus:bg-white focus:border-mylms-purple outline-none transition-all"
                  placeholder="e.g. Midterm Review Q&A"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Course</label>
                <select 
                  required
                  value={formData.course_id}
                  onChange={e => setFormData({...formData, course_id: e.target.value})}
                  className="w-full bg-offwhite border-2 border-transparent rounded-xl py-3 px-4 text-sm font-bold focus:bg-white focus:border-mylms-purple outline-none transition-all"
                >
                  <option value="">Choose a course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date & Time</label>
                <input 
                  type="datetime-local" required
                  value={formData.scheduled_at}
                  onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                  className="w-full bg-offwhite border-2 border-transparent rounded-xl py-3 px-4 text-sm font-bold focus:bg-white focus:border-mylms-purple outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-3 bg-mylms-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-mylms-purple/90 transition-all shadow-md"
                >
                  {submitting ? 'Saving...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
