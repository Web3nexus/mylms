import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Library, 
  BookOpen, 
  Clock, 
  ShieldCheck,
  Calendar,
  MessageSquare,
  User,
  Layout,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function StudentCampus() {
  const { token, user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampusData = async () => {
      try {
        const res = await client.get('/registration/my-courses', { 
           headers: { Authorization: `Bearer ${token}` } 
        });
        setCourses(res.data.registrations?.map((r: any) => r.course) || []);
      } catch (err) {
        console.error('Error fetching campus data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampusData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      {/* TOP INSTRUCTIONAL NAV */}
      <div className="flex items-center gap-10 border-b border-border-soft pb-6 mb-10 overflow-x-auto no-scrollbar">
         {["My Courses", "Resources", "Links", "Instructors", "My Media"].map(item => (
            <button key={item} className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-mylms-purple transition-all pb-2 whitespace-nowrap">{item}</button>
         ))}
      </div>

      {/* PORTAL SYNC BANNER */}
      <div className="bg-gradient-to-r from-mylms-purple to-mylms-rose p-10 rounded-2xl mb-12 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group shadow-lg">
         <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full text-white" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0,0 L100,100" stroke="currentColor" strokeWidth="0.5" />
            </svg>
         </div>
         <div className="relative z-10 max-w-xl">
            <h2 className="text-xl font-serif font-black text-white uppercase tracking-tight mb-2">Visit the MyLMS Student Portal</h2>
            <p className="text-white/80 text-xs font-medium leading-relaxed uppercase tracking-wider">Explore your academic progress, registration status, and financial records for a successful journey.</p>
         </div>
         <Link to="/portal" className="bg-white text-mylms-purple px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-opacity-90 transition-all shadow-xl shrink-0 group-hover:scale-105">
            Student Portal
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
         {/* Main Learning Content Area */}
         <div className="lg:col-span-3 space-y-12">
            
            {/* Timeline Widget */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-10">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[11px] font-black uppercase text-mylms-purple tracking-[0.4em]">Timeline</h3>
                  <div className="flex gap-4">
                     <select className="bg-offwhite border border-border-soft rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
                        <option>All</option>
                        <option>Overdue</option>
                     </select>
                     <input type="text" placeholder="Search by activity name" className="bg-offwhite border border-border-soft rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none min-w-[250px]" />
                  </div>
               </div>
               
               <div className="py-24 text-center bg-offwhite rounded-2xl border border-border-soft">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                     <Layout size={32} className="text-gray-200" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">No activities require action</p>
               </div>
            </div>

            {/* Courses / Recently Accessed */}
            <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase text-mylms-purple tracking-[0.4em] px-2">Registered Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {courses.map(course => (
                      <div key={course.id} className="bg-white border border-border-soft rounded-xl hover:border-mylms-rose shadow-sm overflow-hidden group transition-all">
                         <div className="h-4 bg-mylms-purple"></div>
                         <div className="p-8">
                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-3">Academic Session: 2026</p>
                            <h4 className="text-lg font-black text-text-main group-hover:text-mylms-purple transition-colors tracking-tight uppercase line-clamp-2 h-12">
                               {course.title}
                            </h4>
                            <div className="mt-8 flex justify-between items-center border-t border-border-soft pt-6">
                               <span className="text-[9px] font-black text-mylms-rose uppercase tracking-widest">Active Curriculum</span>
                               <Link to={`/courses/${course.slug}/lessons`} className="text-[9px] font-black text-text-main uppercase tracking-widest flex items-center gap-2 group-hover:text-mylms-rose transition-all">
                                  Enter <ArrowRight size={14} />
                               </Link>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
            </div>
         </div>

         {/* Right Sidebar Institutional Widgets */}
         <div className="space-y-8">
            
            {/* Clock Widget */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-8 border-t-8 border-t-mylms-purple">
               <h4 className="text-[10px] font-black uppercase text-text-main tracking-[0.3em] mb-6">Institutional Time</h4>
               <div className="bg-offwhite p-6 rounded-xl text-center border border-border-soft">
                  <p className="text-3xl font-serif font-black text-mylms-purple tracking-tighter">
                     {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">{new Date().toDateString()}</p>
               </div>
               <p className="text-[8px] font-medium text-gray-400 leading-relaxed mt-6 uppercase tracking-wider italic">
                 All activities close on Wednesdays at 11:55 PM, except for some specific proctored labs.
               </p>
            </div>

            {/* Announcements Widget */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-8">
               <h4 className="text-[10px] font-black uppercase text-text-main tracking-[0.3em] mb-8 pb-4 border-b border-border-soft">Latest Announcements</h4>
               <div className="space-y-6">
                  {[
                    { date: '2 Apr, 04:29', title: 'Final Exams Notice (Undergrad)', color: 'text-mylms-rose' },
                    { date: '26 Mar, 06:24', title: 'Course Evaluations (Week 8)', color: 'text-mylms-purple' }
                  ].map((ann, i) => (
                    <div key={i} className="group cursor-pointer">
                       <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">{ann.date}</p>
                       <p className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${ann.color}`}>{ann.title}</p>
                    </div>
                  ))}
               </div>
               <button className="w-full text-[8px] font-black text-gray-400 uppercase tracking-widest mt-8 hover:text-mylms-purple transition-all text-center">Older topics...</button>
            </div>

            {/* Internal Calendar Preview */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-8">
               <h4 className="text-[10px] font-black uppercase text-text-main tracking-[0.3em] mb-8">Registry Calendar</h4>
               <div className="aspect-square bg-offwhite rounded-xl border border-border-soft flex items-center justify-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  [ Calendar Engine ]
               </div>
            </div>

            {/* Profile Logic Widget */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-8 flex items-center gap-4 group">
               <div className="w-12 h-12 rounded-xl bg-offwhite border border-border-soft flex items-center justify-center text-mylms-purple text-xl font-black group-hover:bg-mylms-purple group-hover:text-white transition-all">
                  {user?.name?.charAt(0)}
               </div>
               <div>
                  <p className="text-[10px] font-black text-text-main uppercase tracking-tight">{user?.name}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nigeria | Verified</p>
               </div>
            </div>

         </div>
      </div>

    </div>
  );
}
