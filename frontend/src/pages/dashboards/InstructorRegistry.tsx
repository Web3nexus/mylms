import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Award, 
  Clock, 
  ShieldCheck,
  ClipboardList,
  Users,
  BookOpen,
  ArrowRight,
  Layers,
  BarChart
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function InstructorRegistry() {
  const { user, token } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCohorts: 0,
    totalStudents: 0,
    passRate: "0%",
    pendingEvaluations: 0,
    facultyId: 'FAC-000000'
  });

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const [coursesRes, statsRes] = await Promise.all([
          client.get('/my-courses', { headers: { Authorization: `Bearer ${token}` } }),
          client.get('/instructor/stats', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCourses(coursesRes.data.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching instructor data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructorData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Accessing Faculty Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Faculty Awareness Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-10 border-b border-border-soft pb-12">
        <div>
           <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
              <ClipboardList className="opacity-50" size={16} />
              MyLMS Faculty Desk
           </div>
           <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">Faculty Portal</h1>
           <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} className="text-mylms-rose" />
              Credentials: {stats.facultyId} — Authorized Instructor
           </p>
        </div>
        
        <div className="flex gap-4">
           <Link to="/courses/create" className="btn-purple flex items-center gap-3 px-10 py-3.5 shadow-xl">
              <PlusCircle size={16} />
              Propose Syllabus
           </Link>
        </div>
      </div>

      {/* High Fidelity Faculty Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative group overflow-hidden hover:border-mylms-purple/20 transition-all">
             <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Curriculum Load</p>
             <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-text-main font-mono tracking-tighter">{stats.activeCohorts}</span>
                <span className="text-[9px] font-black text-mylms-purple uppercase tracking-widest opacity-60">Programs</span>
             </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative group overflow-hidden hover:border-mylms-purple/20 transition-all">
             <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Cohort Aggregate</p>
             <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-text-main font-mono tracking-tighter">{stats.totalStudents}</span>
                <span className="text-[9px] font-black text-mylms-rose uppercase tracking-widest opacity-60">Verified</span>
             </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative group overflow-hidden border-t-8 border-t-mylms-purple hover:border-mylms-purple/40 transition-all">
             <p className="text-[9px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-8">Performance Index</p>
             <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-text-main font-mono tracking-tighter">{stats.passRate}</span>
                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Qualified</span>
             </div>
             <div className="mt-4 flex items-center gap-2">
                <BarChart size={12} className="text-mylms-rose" />
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest font-display">Historical Stability</span>
             </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative group overflow-hidden hover:border-mylms-purple/20 transition-all">
             <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Pending Evaluations</p>
             <div className="flex items-baseline gap-3 text-mylms-rose">
                <span className="text-4xl font-black font-mono tracking-tighter">{stats.pendingEvaluations}</span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Submissions</span>
             </div>
             <div className="mt-4 flex items-center gap-2">
                <Clock size={12} className="text-mylms-rose animate-pulse" />
                <span className="text-[8px] font-black text-mylms-rose uppercase tracking-widest font-display">Action Required</span>
             </div>
          </div>
      </div>

      {/* Curriculum Registry Hub */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden mb-16 group hover:border-mylms-purple/20 transition-all border-t-8 border-t-mylms-purple">
        <div className="px-10 py-10 border-b border-border-soft bg-offwhite flex justify-between items-center group-hover:bg-white transition-all">
           <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-main flex items-center gap-4 leading-none">
                <BookOpen size={18} className="text-mylms-purple" />
                Instructional Inventory
              </h3>
              <p className="text-[9px] font-black text-gray-300 uppercase mt-4 tracking-widest">Authorized MyLMS Registry</p>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-[8px] font-black text-mylms-rose uppercase tracking-widest border border-mylms-rose/20 px-3 py-1 rounded-lg bg-mylms-rose/5 shadow-sm">VERIFIED_SYNC</span>
           </div>
        </div>

        <div className="divide-y divide-offwhite bg-white">
          {courses.length === 0 ? (
            <div className="p-40 text-center flex flex-col items-center opacity-60">
               <Layers size={48} className="text-gray-100 mb-8" />
               <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] mb-12 leading-loose">The registry identifies no authorized programs for these credentials.</p>
               <Link to="/courses/create" className="btn-minimal px-12 py-3.5 shadow-md uppercase tracking-widest text-[9px] font-black">Initiate Proposal</Link>
            </div>
          ) : (
            courses.filter(Boolean).filter(c => c && c?.title).map((course: any) => (
              <div key={course.id} className="p-10 flex flex-col md:flex-row items-center gap-12 group/row transition-all hover:bg-offwhite/50 relative border-l-8 border-transparent hover:border-l-mylms-purple">
                 <div className="w-16 h-16 bg-white border border-border-soft rounded-2xl flex items-center justify-center text-2xl font-black text-mylms-purple shadow-sm relative z-10 font-display group-hover/row:bg-mylms-purple group-hover/row:text-white transition-all duration-500">
                   {course?.title?.charAt(0) ?? '?'}
                 </div>
                 <div className="flex-1 relative z-10">
                   <div className="flex items-center gap-6 mb-4">
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">REG_ID: ML-CRS-{course.id.toString().padStart(6, '0')}</span>
                   </div>
                   <h2 className="text-3xl font-black text-text-main leading-tight group-hover/row:text-mylms-purple transition-colors tracking-tighter uppercase">
                    {course?.title}
                   </h2>
                   <div className="mt-8 flex items-center gap-12">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                           <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Syllabus Completion</p>
                           <span className="text-[10px] font-black text-mylms-purple uppercase tracking-widest font-mono">100%</span>
                        </div>
                        <div className="h-1 w-64 bg-offwhite rounded-full overflow-hidden border border-gray-50 shadow-inner">
                           <div className="h-full bg-mylms-rose w-full transition-all"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-l border-border-soft pl-12 group/cohort hover:translate-x-1 transition-transform">
                         <div className="w-10 h-10 bg-offwhite rounded-xl flex items-center justify-center border border-border-soft text-mylms-purple shadow-inner group-hover/cohort:bg-mylms-purple group-hover/cohort:text-white transition-all">
                            <Users size={16} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-text-main uppercase tracking-tight leading-none">42 Records</p>
                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2 opacity-60">Verified Cohort</p>
                         </div>
                      </div>
                   </div>
                 </div>
                 <div className="flex gap-4 w-full md:w-auto mt-8 md:mt-0 relative z-10">
                   <Link 
                     to={`/courses/${course?.slug}/curriculum`}
                     className="btn-purple px-10 py-3.5 shadow-xl flex items-center gap-3"
                   >
                     Curriculum
                     <ArrowRight size={14} />
                   </Link>
                   <Link 
                     to={`/courses/${course?.slug}/gradebook`}
                     className="btn-minimal px-10 py-3.5 shadow-sm flex items-center gap-3 uppercase tracking-[0.2em] font-black text-[9px]"
                   >
                     <Award size={16} className="text-mylms-rose" />
                     Gradebook
                   </Link>
                 </div>
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
}
