import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Bell,
  ChevronRight,
  TrendingUp,
  Award,
  MessageSquare,
  Clock,
  CheckCircle,
  BookOpen,
  Layers
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function StudentPortal() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab states
  const [checklistTab, setChecklistTab] = useState<'current' | 'completed'>('current');
  const [courseTab, setCourseTab] = useState<'current' | 'future' | 'past'>('current');

  const DEFAULT_DEGREE_CREDITS = 120;

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [dashRes, scholarshipRes] = await Promise.allSettled([
          client.get('/student/dashboard-home'),
          client.get('/scholarships'),
        ]);

        if (dashRes.status === 'fulfilled') {
          setDashboardData(dashRes.value.data);
        }
        if (scholarshipRes.status === 'fulfilled') {
          setScholarships(scholarshipRes.value.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortalData();
  }, [token]);

  const stats = dashboardData?.stats;
  const cgpa = stats?.cgpa ?? 0;
  const creditsEarned = stats?.credits_earned ?? 0;
  const totalCreditsRequired = stats?.credits_required ?? DEFAULT_DEGREE_CREDITS;
  const countdown = dashboardData?.countdown;
  const degreeProgress = totalCreditsRequired > 0 
    ? Math.min((creditsEarned / totalCreditsRequired) * 100, 100) 
    : 0;

  // Live course lists from API
  const currentCourses: any[] = dashboardData?.courses?.current ?? [];
  const futureCourses: any[] = dashboardData?.courses?.future ?? [];
  const pastCourses: any[] = dashboardData?.courses?.past ?? [];

  // Live checklist from API
  const checklistCurrent: any[] = dashboardData?.checklist?.current ?? [];
  const checklistCompleted: any[] = dashboardData?.checklist?.completed ?? [];

  const activeCourseList = courseTab === 'current' ? currentCourses 
    : courseTab === 'future' ? futureCourses 
    : pastCourses;

  const activeChecklist = checklistTab === 'current' ? checklistCurrent : checklistCompleted;

  // Academic standing
  const getStanding = (gpa: number) => {
    if (gpa >= 3.8) return { label: "Dean's List", color: 'text-mylms-rose' };
    if (gpa >= 3.5) return { label: 'Honours', color: 'text-green-600' };
    if (gpa >= 2.0) return { label: 'Good Standing', color: 'text-mylms-purple' };
    if (gpa > 0)    return { label: 'Academic Probation', color: 'text-amber-500' };
    return { label: 'Not Yet Evaluated', color: 'text-gray-400' };
  };
  const standing = getStanding(cgpa);

  // Progress description based on real progress
  const getProgressLabel = (pct: number) => {
    if (pct === 0) return 'Your academic journey begins here.';
    if (pct < 25) return 'Great start! Keep building your academic foundation.';
    if (pct < 50) return 'You\'re making excellent progress on your degree!';
    if (pct < 75) return 'Past the halfway mark — keep pushing forward!';
    if (pct < 100) return 'Almost there! You\'re in the final stretch of your degree.';
    return 'Congratulations — you have completed your credit requirements!';
  };

  const STATUS_COLOR: Record<string, string> = {
    graded: 'bg-green-500',
    in_progress: 'bg-blue-500 animate-pulse',
    upcoming: 'bg-amber-400',
    incomplete: 'bg-mylms-rose',
  };

  const STATUS_LABEL: Record<string, string> = {
    graded: 'Graded',
    in_progress: 'In Progress',
    upcoming: 'Upcoming',
    incomplete: 'Incomplete',
  };

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-10 px-6 md:px-12 min-h-screen">
      
      {/* Header with Title and Countdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-6">
        <div className="flex-1">
           <h1 className="text-2xl md:text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight leading-tight">
             {stats?.program_name || 'Degree Registry Active'}
           </h1>
        </div>
        <div className="w-full md:w-auto flex items-center gap-6 md:gap-10 bg-white px-6 md:px-8 py-4 rounded-xl border border-border-soft shadow-sm">
           <div className="w-full">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {countdown ? 'Term begins in' : 'Next term'}
              </p>
              {countdown ? (
                <div className="flex items-center justify-between md:justify-start gap-4 text-xl md:text-2xl font-serif font-black text-mylms-purple">
                   <div className="flex flex-col items-center">
                      <span>{countdown.days ?? '00'}</span>
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Days</span>
                   </div>
                   <span className="text-sm opacity-20">:</span>
                   <div className="flex flex-col items-center">
                      <span>{countdown.hours ?? '00'}</span>
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Hrs</span>
                   </div>
                   <span className="text-sm opacity-20">:</span>
                   <div className="flex flex-col items-center">
                      <span>{countdown.mins ?? '00'}</span>
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Mins</span>
                   </div>
                </div>
              ) : (
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No upcoming term scheduled</p>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Hero Banner Card — Real Progress */}
          <div className="lg:col-span-2 bg-linear-to-br from-white to-offwhite p-8 md:p-12 rounded-2xl border border-border-soft shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[300px] md:min-h-[350px]">
             <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <svg className="w-full h-full text-mylms-rose" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <path d="M70,20 L100,50 L80,90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                   <path d="M50,10 L90,40 L60,80 Z" fill="none" stroke="currentColor" strokeWidth="0.2" />
                </svg>
             </div>
             <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-serif font-black text-mylms-purple mb-6 uppercase tracking-tight">
                  {degreeProgress >= 75 ? 'Almost There!' : degreeProgress >= 50 ? 'Halfway Mark!' : degreeProgress > 0 ? 'Keep Going!' : 'Welcome!'}
                </h2>
                <p className="text-base md:text-lg font-medium text-text-secondary leading-relaxed max-w-lg mb-8">
                  {user?.name}, {getProgressLabel(degreeProgress)}
                </p>
                {/* Real degree progress bar */}
                <div className="space-y-2 w-full md:w-80">
                  <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Degree Progress</span>
                    <span className="text-mylms-purple">{degreeProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-mylms-rose transition-all duration-1000" 
                       style={{ width: `${degreeProgress}%` }}
                     />
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {creditsEarned} of {totalCreditsRequired} credits earned
                  </p>
                </div>
             </div>
          </div>

          {/* Academic Progress Column */}
          <div className="space-y-6">
             <div className="bg-white p-6 md:p-8 rounded-2xl border border-border-soft shadow-sm">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 border-b border-border-soft pb-4">Academic Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 md:p-6 bg-offwhite rounded-xl border border-border-soft relative group">
                      <div className="text-gray-300 absolute top-4 right-4">
                         <TrendingUp size={14} />
                      </div>
                      <p className="text-2xl md:text-3xl font-serif font-black text-mylms-purple mb-1">
                        {cgpa > 0 ? cgpa.toFixed(2) : '—'}
                      </p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cum. GPA</p>
                      {cgpa > 0 && (
                        <p className={`text-[7px] font-black uppercase tracking-widest mt-1 ${standing.color}`}>{standing.label}</p>
                      )}
                   </div>
                   <div className="p-4 md:p-6 bg-offwhite rounded-xl border border-border-soft relative">
                      <div className="text-gray-300 absolute top-4 right-4">
                         <Award size={14} />
                      </div>
                      <p className="text-2xl md:text-3xl font-serif font-black text-mylms-purple mb-1">
                        {creditsEarned} <span className="text-sm opacity-30">/ {totalCreditsRequired}</span>
                      </p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Credits</p>
                   </div>
                </div>
                <div 
                  className="mt-4 p-4 md:p-6 bg-mylms-purple/5 border border-mylms-purple/10 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-mylms-purple/10 transition-all" 
                  onClick={() => navigate('/office/advisor')}
                >
                   <div>
                      <p className="text-[11px] md:text-sm font-black text-mylms-purple uppercase tracking-tight leading-tight">Academic Advisor</p>
                      <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                         {user?.advisor?.name || 'Assigned Protocol Pending'}
                      </p>
                   </div>
                   <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-mylms-purple shadow-sm group-hover:scale-110 transition-transform">
                      <MessageSquare size={18} />
                   </div>
                </div>
                <div className="mt-4 p-4 md:p-6 bg-mylms-purple/5 border border-mylms-purple/10 rounded-xl flex justify-between items-center">
                   <div>
                      <p className="text-[11px] md:text-sm font-black text-mylms-purple uppercase tracking-tight leading-tight">Active Registrations</p>
                      <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mt-1">Semester Status</p>
                   </div>
                   <p className="text-xl md:text-3xl font-serif font-black text-mylms-purple">{stats?.active_courses_count ?? 0}</p>
                </div>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Checklist — Live from API */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
             <div className="p-6 md:p-8 border-b border-border-soft">
                <h3 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight">Checklist</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Upcoming academic events & deadlines</p>
             </div>
             <div className="flex border-b border-border-soft bg-offwhite/50">
                <button 
                  onClick={() => setChecklistTab('current')}
                  className={`flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${checklistTab === 'current' ? 'text-mylms-rose border-b-2 border-mylms-rose bg-white' : 'text-gray-400 hover:text-mylms-purple'}`}
                >
                  Current
                </button>
                <button 
                  onClick={() => setChecklistTab('completed')}
                  className={`flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${checklistTab === 'completed' ? 'text-mylms-rose border-b-2 border-mylms-rose bg-white' : 'text-gray-400 hover:text-mylms-purple'}`}
                >
                  Completed
                </button>
             </div>
             <div className="p-6 md:p-8 space-y-4">
                {loading ? (
                  <div className="py-10 text-center text-[9px] font-black text-gray-300 uppercase tracking-widest">Loading...</div>
                ) : activeChecklist.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-border-soft rounded-xl">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                      {checklistTab === 'current' ? 'No upcoming events scheduled' : 'No completed events yet'}
                    </p>
                  </div>
                ) : (
                  activeChecklist.map((item: any) => (
                    <div key={item.id} className="p-4 md:p-6 border border-border-soft rounded-xl flex justify-between items-center group hover:border-mylms-rose transition-all">
                       <div className="flex-1 pr-4">
                          <h4 className="text-sm font-black text-text-main uppercase tracking-tight leading-tight">{item.title}</h4>
                          <p className="text-[9px] font-bold text-mylms-rose uppercase tracking-widest mt-2 bg-mylms-rose/5 px-3 py-1 rounded inline-block">
                            {item.type} — {item.date}
                          </p>
                       </div>
                       {item.completed 
                         ? <CheckCircle size={20} className="text-green-500 shrink-0" />
                         : <ChevronRight className="text-gray-200 group-hover:text-mylms-rose transition-colors shrink-0" />
                       }
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Courses — Live Current / Future / Past tabs */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
             <div className="p-6 md:p-8 border-b border-border-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                   <h3 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight">Your Courses</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Session Schedule</p>
                </div>
                <div className="flex bg-offwhite p-1 rounded-lg border border-border-soft w-full sm:w-auto">
                   {(['current', 'future', 'past'] as const).map(tab => (
                     <button 
                       key={tab}
                       onClick={() => setCourseTab(tab)}
                       className={`flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase rounded transition-all ${courseTab === tab ? 'bg-white text-mylms-purple shadow-sm' : 'text-gray-400 hover:text-mylms-purple'}`}
                     >
                       {tab}
                     </button>
                   ))}
                </div>
             </div>
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[500px]">
                   <thead>
                      <tr className="bg-offwhite text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                         <th className="px-8 py-4">Course Name</th>
                         <th className="px-8 py-4">Status</th>
                         <th className="px-8 py-4">Registry</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-soft">
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="px-8 py-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">Loading courses...</td>
                        </tr>
                      ) : activeCourseList.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-8 py-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            No {courseTab} courses found.
                          </td>
                        </tr>
                      ) : (
                        activeCourseList.map((course: any) => (
                          <tr key={course.course_id} className="hover:bg-offwhite/50 transition-colors">
                             <td className="px-8 py-6">
                                <p className="text-sm font-black text-text-main uppercase tracking-tight leading-tight mb-1">{course.title}</p>
                                {course.code && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.code}</p>}
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full ${STATUS_COLOR[course.status] ?? 'bg-gray-300'}`} />
                                   <span className="text-[10px] font-black text-text-main uppercase tracking-widest">
                                      {course.grade ? `${course.letter} — ${course.grade}%` : STATUS_LABEL[course.status] ?? course.status}
                                   </span>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{course.semester}</span>
                             </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
      </div>
    </div>
  );
}
