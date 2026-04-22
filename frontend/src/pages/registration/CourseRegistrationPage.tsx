import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Library, 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  AlertCircle,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Semester {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  academic_session: { name: string };
}

interface Course {
  id: number;
  title: string;
  slug: string;
  credit_hours: number;
  instructor: { name: string };
  category: { name: string };
  is_registered: boolean;
}

interface Registration {
  id: number;
  status: string;
  course: Course;
  semester: Semester;
}

export default function CourseRegistrationPage() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [maxCredits] = useState(18);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-courses'>('catalog');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemesterId) {
      fetchCatalog(selectedSemesterId);
      fetchMyRegistrations(selectedSemesterId);
    }
  }, [selectedSemesterId]);

  const fetchSemesters = async () => {
    try {
      const res = await client.get('/registration/semesters', { headers });
      setSemesters(res.data);
      const current = res.data.find((s: Semester) => s.is_current);
      if (current) setSelectedSemesterId(current.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async (semId: number) => {
    try {
      const res = await client.get(`/registration/catalog?semester_id=${semId}`, { headers });
      setCatalog(res.data.courses);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyRegistrations = async (semId: number) => {
    try {
      const res = await client.get(`/registration/my-courses?semester_id=${semId}`, { headers });
      setMyRegistrations(res.data.registrations);
      setTotalCredits(res.data.total_credits);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (course: Course) => {
    if (!selectedSemesterId) return;
    setActionLoading(course.id);
    setError('');
    try {
      await client.post(`/registration/courses/${course.id}/register`, {
        semester_id: selectedSemesterId,
      }, { headers });
      fetchCatalog(selectedSemesterId);
      fetchMyRegistrations(selectedSemesterId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration protocol failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDrop = async (course: Course) => {
    if (!selectedSemesterId) return;
    setActionLoading(course.id);
    setError('');
    try {
      await client.post(`/registration/courses/${course.id}/drop`, {
        semester_id: selectedSemesterId,
      }, { headers });
      fetchCatalog(selectedSemesterId);
      fetchMyRegistrations(selectedSemesterId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Drop protocol failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const currentSemester = semesters.find(s => s.id === selectedSemesterId);
  const creditPercent = Math.min((totalCredits / maxCredits) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Syncing Academic Catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* MyLMS Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 border-b border-border-soft pb-12">
        <div>
           <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
              <Library className="opacity-50" size={14} />
              MyLMS Course Registry
           </div>
           <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Course Portal</h1>
           <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest mt-4">Authorized curriculum registration and session management.</p>
        </div>

        {/* Semester & Credit Status (Minimalist Detail Card) */}
        <div className="bg-white rounded-xl border border-border-soft p-8 shadow-sm min-w-80 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[.3em] mb-4">Active Decision Window</p>
           <select
             value={selectedSemesterId ?? ''}
             onChange={e => setSelectedSemesterId(Number(e.target.value))}
             className="w-full font-black text-text-main bg-transparent outline-none text-base mb-6 cursor-pointer"
           >
             {semesters.map(s => (
               <option key={s.id} value={s.id} className="font-sans text-sm">
                 {s?.name} — {s.academic_session?.name}
                 {s.is_current ? ' ★' : ''}
               </option>
             ))}
           </select>
           
           {/* Credit Load Indicator */}
           <div>
             <div className="flex justify-between mb-3 items-end">
               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Aggregate Credits</span>
               <span className={`text-[10px] font-black ${totalCredits > 15 ? 'text-mylms-rose' : 'text-mylms-purple'} uppercase`}>
                 {totalCredits} / {maxCredits} Units
               </span>
             </div>
             <div className="h-1.5 bg-offwhite rounded-full overflow-hidden border border-gray-100 shadow-inner">
               <div
                 className={`h-full rounded-full transition-all duration-1000 ${creditPercent > 85 ? 'bg-mylms-rose' : 'bg-mylms-purple'}`}
                 style={{ width: `${creditPercent}%` }}
               />
             </div>
           </div>
        </div>
      </div>

      {/* MyLMS Error Notification */}
      {error && (
        <div className="bg-white border border-border-soft border-l-4 border-l-mylms-rose rounded-xl p-6 mb-10 flex items-center gap-5 shadow-sm">
          <AlertCircle size={20} className="text-mylms-rose" />
          <p className="text-text-main font-black text-[10px] uppercase tracking-widest flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-gray-300 hover:text-text-main transition-colors"><Trash2 size={16} /></button>
        </div>
      )}

      {/* Tab Registry */}
      <div className="flex gap-2 bg-offwhite p-1.5 rounded-2xl mb-12 w-fit border border-border-soft shadow-inner">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-10 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'catalog' ? 'bg-white shadow-md text-text-main border border-border-soft' : 'text-text-secondary hover:text-mylms-purple'}`}
        >
          <BookOpen size={14} />
          Course Catalog
        </button>
        <button
          onClick={() => setActiveTab('my-courses')}
          className={`px-10 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'my-courses' ? 'bg-white shadow-md text-text-main border border-border-soft' : 'text-text-secondary hover:text-mylms-purple'}`}
        >
          <TrendingUp size={14} />
          Registered Courses
          {myRegistrations.length > 0 && (
            <span className="ml-2 bg-mylms-rose text-white text-[8px] rounded-lg px-2.5 py-1 shadow-sm font-mono">{myRegistrations.length}</span>
          )}
        </button>
      </div>

      {/* Catalog Registry Hub */}
      {activeTab === 'catalog' && (
        <div>
          {catalog.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-border-soft p-32 text-center flex flex-col items-center opacity-60">
              <Layers size={48} className="text-gray-200 mb-8" />
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[.4em] leading-loose">The academic office has not yet initialized catalog records for this window.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {catalog.filter(Boolean).filter(c => c && c?.title).map(course => (
                <div key={course.id} className={`bg-white rounded-2xl border transition-all hover:shadow-xl group relative overflow-hidden flex flex-col ${course.is_registered ? 'border-mylms-rose/20 bg-offwhite/50' : 'border-border-soft hover:border-mylms-purple/20'}`}>
                  {/* Accent Header */}
                  <div className={`p-8 border-b ${course.is_registered ? 'bg-white/50 border-mylms-rose/10' : 'bg-offwhite border-border-soft group-hover:bg-white'} transition-all`}>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">{course.category?.name}</span>
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm border ${course.is_registered ? 'bg-mylms-rose text-white border-transparent' : 'bg-white text-mylms-purple border-border-soft'}`}>
                        {course.is_registered ? '✓ VERIFIED' : `${course.credit_hours ?? 3} Units`}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-text-main leading-tight tracking-tight uppercase group-hover:text-mylms-purple transition-colors line-clamp-2 h-14">{course?.title}</h3>
                    <div className="mt-4 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white border border-border-soft flex items-center justify-center text-mylms-purple font-black text-[10px] shadow-sm">
                          {course.instructor?.name.charAt(0)}
                       </div>
                       <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">{course.instructor?.name}</p>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="p-8 mt-auto bg-white">
                    <div className="flex items-center gap-4">
                      {!course.is_registered ? (
                        <button
                          onClick={() => handleRegister(course)}
                          disabled={actionLoading === course.id}
                          className="grow py-4 bg-mylms-purple text-white font-black rounded-xl hover:bg-mylms-purple/90 transition-all text-[9px] uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                        >
                          {actionLoading === course.id ? 'Authorizing...' : 'Finalize Registration'}
                          <ChevronRight size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDrop(course)}
                          disabled={actionLoading === course.id}
                          className="grow py-4 bg-white border border-border-soft text-mylms-rose font-black rounded-xl hover:bg-offwhite transition-all text-[9px] uppercase tracking-[0.2em] shadow-sm disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                        >
                          {actionLoading === course.id ? 'Transmitting...' : 'Drop Protocol'}
                          <Trash2 size={12} />
                        </button>
                      )}
                      {course.is_registered && (
                        <Link
                          to={`/courses/${course?.slug}/lessons`}
                          className="w-12 h-12 bg-white border border-border-soft rounded-xl flex items-center justify-center text-mylms-purple hover:bg-offwhite transition-all shadow-sm group-hover:border-mylms-rose/20"
                        >
                          <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Official Registrations View */}
      {activeTab === 'my-courses' && (
        <div className="space-y-12">
          {myRegistrations.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-border-soft p-32 text-center flex flex-col items-center opacity-60">
              <GraduationCap size={48} className="text-gray-200 mb-8" />
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[.4em] mb-10">No authorized enrollments identified in the registry.</p>
              <button onClick={() => setActiveTab('catalog')} className="btn-minimal px-12 py-3 shadow-md">Browse Curriculums</button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* MyLMS Summary Banner */}
              <div className="bg-white border-l-8 border-l-mylms-purple border border-border-soft p-10 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-10 shadow-sm relative overflow-hidden group mb-12">
                <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary mb-4">{currentSemester?.name} Registry Sync</p>
                   <h2 className="text-4xl font-black text-text-main tracking-tighter uppercase">{myRegistrations.length} Active Records</h2>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-mylms-rose mb-4">Aggregated Session Load</p>
                   <p className="text-4xl font-black text-mylms-purple tracking-tighter uppercase">{totalCredits} <span className="text-gray-300 text-xl"> / {maxCredits}</span></p>
                </div>
              </div>

              {myRegistrations.filter(Boolean).filter(r => r && r.course && r.course?.title).map(reg => (
                <div key={reg.id} className="bg-white rounded-2xl border border-border-soft p-8 flex flex-col md:flex-row items-start md:items-center gap-10 shadow-sm hover:shadow-md transition-all group border-t-4 border-t-white hover:border-t-mylms-rose">
                  <div className="w-16 h-16 bg-offwhite border border-border-soft rounded-xl flex items-center justify-center text-2xl font-black text-mylms-purple shrink-0 group-hover:bg-mylms-purple group-hover:text-white transition-all shadow-sm font-display">
                    {reg?.course?.title?.charAt(0) ?? '?'}
                  </div>
                  <div className="grow">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{reg.course.category?.name}</span>
                      <span className="text-[9px] font-black text-mylms-rose uppercase tracking-[0.2em] bg-mylms-rose/5 px-3 py-1 rounded-lg">Verified Session</span>
                    </div>
                    <h3 className="text-2xl font-black text-text-main tracking-tight group-hover:text-mylms-purple transition-colors uppercase">{reg?.course?.title}</h3>
                    <p className="text-[9px] font-black text-text-secondary mt-2 uppercase tracking-widest">Lead Instructor: {reg.course.instructor?.name}</p>
                  </div>
                  <div className="flex gap-4 shrink-0 w-full md:w-auto">
                    <Link
                      to={`/courses/${reg?.course?.slug}/lessons`}
                      className="btn-purple px-10 py-3.5 grow md:grow-0"
                    >
                      Classroom
                    </Link>
                    <button
                      onClick={() => handleDrop(reg.course)}
                      disabled={actionLoading === reg.course.id}
                      className="btn-minimal px-8 py-3.5 text-mylms-rose grow md:grow-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
