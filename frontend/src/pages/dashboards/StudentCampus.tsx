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
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { token, user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampusData = async () => {
      try {
        const [dashRes, courseRes] = await Promise.allSettled([
          client.get('/student/dashboard-home'),
          client.get('/registration/my-courses', { 
             headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        if (dashRes.status === 'fulfilled') {
          setDashboardData(dashRes.value.data);
        }
        if (courseRes.status === 'fulfilled') {
           setCourses(courseRes.value.data.registrations?.map((r: any) => r.course) || []);
        }
      } catch (err) {
        console.error('Error fetching campus data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampusData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-10 px-6 md:px-12 min-h-screen transition-all">
      {/* TOP INSTRUCTIONAL NAV */}
      <div className="flex items-center gap-6 md:gap-10 border-b border-border-soft pb-4 md:pb-6 mb-8 md:mb-10 overflow-x-auto no-scrollbar scroll-smooth">
         {["My Courses", "Resources", "Links", "Instructors", "My Media"].map(item => (
            <button key={item} className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-mylms-purple transition-all pb-2 whitespace-nowrap">{item}</button>
         ))}
         <Link to="/campus/peer-reviews" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-mylms-rose hover:text-mylms-purple transition-all pb-2 whitespace-nowrap border-b-2 border-mylms-rose">Peer Reviews</Link>
      </div>

      {/* PORTAL SYNC BANNER */}
      <div className="bg-linear-to-r from-mylms-purple to-mylms-rose p-8 md:p-10 rounded-2xl mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 relative overflow-hidden group shadow-lg">
         <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full text-white" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0,0 L100,100" stroke="currentColor" strokeWidth="0.5" />
            </svg>
         </div>
         <div className="relative z-10 text-center md:text-left">
            <h2 className="text-lg md:text-xl font-serif font-black text-white uppercase tracking-tight mb-2 leading-tight">Visit the MyLMS Student Portal</h2>
            <p className="text-white/80 text-[10px] md:text-xs font-medium leading-relaxed uppercase tracking-wider">Explore your academic progress, registration status, and financial records for a successful journey.</p>
         </div>
         <Link to="/portal" className="w-full md:w-auto bg-white text-mylms-purple px-10 py-4 rounded-xl font-black uppercase tracking-widest text-center text-[9px] hover:bg-opacity-90 transition-all shadow-xl shrink-0 group-hover:scale-105">
            Student Portal
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
         {/* Main Learning Content Area */}
         <div className="lg:col-span-3 space-y-8 md:space-y-12">
            
            {/* Timeline Widget */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-6 md:p-10">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 gap-6">
                  <h3 className="text-[11px] font-black uppercase text-mylms-purple tracking-[0.4em]">Timeline</h3>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                     <select className="bg-offwhite border border-border-soft rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none leading-none">
                        <option>All Activities</option>
                        <option>Overdue Registry</option>
                     </select>
                     <input type="text" placeholder="Filter Registry activities" className="flex-1 sm:flex-none bg-offwhite border border-border-soft rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none min-w-0 sm:min-w-[250px]" />
                  </div>
               </div>
               
               <div className="space-y-4">
                  {dashboardData?.events?.length > 0 ? (
                    dashboardData.events.map((ev: any, i: number) => (
                      <div key={i} className="bg-offwhite p-6 rounded-xl border-l-4 border-mylms-rose flex justify-between items-center group hover:bg-white transition-all">
                         <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{new Date(ev.start_date).toDateString()}</p>
                            <p className="text-[10px] font-black text-text-main uppercase tracking-tight">{ev.title}</p>
                         </div>
                         <div className="bg-white px-3 py-1 rounded text-[8px] font-black uppercase text-mylms-rose border border-border-soft">{ev.event_type}</div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 md:py-24 text-center bg-offwhite rounded-2xl border border-border-soft">
                       <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                          <Layout size={24} className="text-gray-200 md:w-8 md:h-8" />
                       </div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-4 leading-relaxed">No activities require actions in your registry</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Courses / Recently Accessed */}
            <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase text-mylms-purple tracking-[0.4em] px-2">Registered Courses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                   {courses.filter(Boolean).filter((c: any) => c && c?.title).map(course => (
                      <div key={course.id} className="bg-white border border-border-soft rounded-xl hover:border-mylms-rose shadow-sm overflow-hidden group transition-all">
                         <div className="h-4 bg-mylms-purple"></div>
                         <div className="p-6 md:p-8">
                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-3">Academic Session: 2026</p>
                            <h4 className="text-base md:text-lg font-black text-text-main group-hover:text-mylms-purple transition-colors tracking-tight uppercase line-clamp-2 h-10 md:h-12 leading-tight">
                               {course?.title}
                            </h4>
                            <div className="mt-8 flex justify-between items-center border-t border-border-soft pt-6">
                               <span className="text-[9px] font-black text-mylms-rose uppercase tracking-widest">Active Curriculum</span>
                               <Link to={`/courses/${course?.slug}/lessons`} className="text-[9px] font-black text-text-main uppercase tracking-widest flex items-center gap-2 group-hover:text-mylms-rose transition-all">
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
                  <p className="text-2xl md:text-3xl font-serif font-black text-mylms-purple tracking-tighter">
                     {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">{new Date().toDateString()}</p>
               </div>
               <p className="text-[8px] font-medium text-gray-400 leading-relaxed mt-6 uppercase tracking-wider italic">
                 All activities close on Wednesdays at 11:55 PM, except for some proctored labs.
               </p>
            </div>

            {/* Announcements Widget */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-8">
               <h4 className="text-[10px] font-black uppercase text-text-main tracking-[0.3em] mb-8 pb-4 border-b border-border-soft">Latest Announcements</h4>
               <div className="space-y-6">
                  {dashboardData?.announcements?.length > 0 ? (
                    dashboardData.announcements.map((ann: any, i: number) => (
                      <div key={i} className="group cursor-pointer">
                         <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">
                            {new Date(ann.updated_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                         </p>
                         <p className={`text-[10px] font-bold uppercase tracking-tight transition-colors leading-tight text-mylms-purple group-hover:text-mylms-rose`}>
                            {ann.title}
                         </p>
                      </div>
                    ))
                  ) : (
                    <div className="group cursor-pointer">
                       <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Notice</p>
                       <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400">No active registry announcements.</p>
                    </div>
                  )}
               </div>
               <button className="w-full text-[8px] font-black text-gray-400 uppercase tracking-widest mt-8 hover:text-mylms-purple transition-all text-center">View all Registry notices</button>
            </div>

            {/* Internal Calendar Preview */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-8">
               <h4 className="text-[10px] font-black uppercase text-text-main tracking-[0.3em] mb-8">Registry Calendar</h4>
               <div className="aspect-square bg-offwhite rounded-xl border border-border-soft flex items-center justify-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  [ Calendar Engine ]
               </div>
            </div>

            {/* Support & Community Widget */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-8 space-y-8">
               <h4 className="text-[10px] font-black uppercase text-text-main tracking-[0.3em] pb-4 border-b border-border-soft">Support & Community</h4>
               
               {/* Advisor */}
               {user?.advisor && (
                  <div className="flex items-start gap-3">
                     <div className="w-10 h-10 rounded-xl bg-mylms-rose/10 flex items-center justify-center text-mylms-rose shrink-0">
                        <User size={18} />
                     </div>
                     <div className="min-w-0">
                        <p className="text-[8px] font-black text-mylms-rose uppercase tracking-widest mb-1">Academic Advisor</p>
                        <p className="text-[10px] font-black text-text-main uppercase truncate mb-2">{user.advisor.name}</p>
                        <a href={`mailto:${user.advisor.email}`} className="text-[9px] font-black text-mylms-purple uppercase tracking-widest hover:underline flex items-center gap-1">
                           Contact <ArrowRight size={10} />
                        </a>
                     </div>
                  </div>
               )}

               {/* WhatsApp Links */}
               <div className="space-y-4">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">Dedicated Groups</p>
                  {(user as any)?.whatsapp_groups?.map((group: any, i: number) => (
                     <a 
                        key={i} 
                        href={group.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-offwhite rounded-xl border border-border-soft hover:border-green-500 transition-all group"
                     >
                        <div className="flex items-center gap-3">
                           <MessageSquare size={14} className="text-green-600" />
                           <span className="text-[9px] font-black text-text-main uppercase truncate max-w-[120px]">{group.name}</span>
                        </div>
                        <ArrowRight size={12} className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                     </a>
                  ))}
               </div>
            </div>

            {/* Profile Logic Widget */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-8 flex items-center gap-4 group">
               <div className="w-12 h-12 rounded-xl bg-offwhite border border-border-soft flex items-center justify-center text-mylms-purple text-xl font-black group-hover:bg-mylms-purple group-hover:text-white transition-all shrink-0">
                  {user?.name?.charAt(0)}
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] font-black text-text-main uppercase tracking-tight truncate">{user?.name}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nigeria | Verified Registry</p>
               </div>
            </div>

         </div>
      </div>

    </div>
  );
}
