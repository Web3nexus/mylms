import { useState, useEffect } from 'react';
import { Video, Calendar, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function StudentLiveClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await client.get('/student/live-classes', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching live classes data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeClasses = classes.filter(c => c.status === 'live');
  const scheduledClasses = classes.filter(c => c.status === 'scheduled');

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none mb-3">Live Classes</h1>
        <p className="text-text-secondary text-xs font-black uppercase tracking-widest opacity-60 italic">Join real-time interactive video sessions for your enrolled courses.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : classes.length === 0 ? (
         <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-sm p-24 text-center">
            <Video size={48} className="mx-auto text-gray-200 mb-6" />
            <h2 className="text-xl font-black text-text-main uppercase tracking-tight mb-2">No Upcoming Sessions</h2>
            <p className="text-sm font-medium text-gray-400 mb-6">Your instructors haven't scheduled any live classes yet.</p>
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
                      <Play size={14} /> Join Class
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Classes */}
          {scheduledClasses.length > 0 && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Upcoming Sessions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scheduledClasses.map(c => (
                    <div key={c.id} className="bg-white border border-border-soft rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                      <p className="text-[9px] font-black text-mylms-purple uppercase tracking-widest mb-2 truncate">{c.course?.title}</p>
                      <h3 className="text-base font-black text-text-main leading-tight mb-4">{c.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-500">
                          {new Date(c.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                           <Calendar size={12} /> Scheduled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          )}
        </div>
      )}
    </div>
  );
}
