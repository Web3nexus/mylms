import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Info, 
  BookOpen, 
  Award, 
  ShieldCheck,
  Search, 
  DollarSign, 
  GraduationCap,
  ArrowRight,
  Clock,
  Activity,
  Zap,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import RegistryError from '../../components/layout/RegistryError';
import { useBranding } from '../../hooks/useBranding';
import { useNotificationStore } from '../../store/useNotificationStore';

interface Course {
  id: number;
  title: string;
  code: string;
  description: string;
  credits: number;
  duration: string;
  faculty: { name: string };
  department: { name: string };
  slug: string;
}

export function CourseCatalogWidget() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { branding } = useBranding();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await client.get('/public/faculties');
      // Flatten data from faculty -> department -> program
      const allCourses: Course[] = [];
      response.data.forEach((faculty: any) => {
        faculty.departments.forEach((dept: any) => {
          dept.programs.forEach((prog: any) => {
            allCourses.push({
              id: prog.id,
              title: prog?.name || 'Untitled Program',
              code: prog.code || `PRG-${prog.id}X`,
              description: prog.description || 'A comprehensive academic program designed to build future leaders and provide world-class instruction in this discipline.',
              credits: prog.credits || 120,
              duration: prog.duration || '4 Years',
              slug: prog?.slug || `prog-${prog.id}`,
              faculty: { name: faculty?.name },
              department: { name: dept?.name }
            });
          });
        });
      });
      setCourses(allCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const { notify } = useNotificationStore();

  const handleEnroll = async (courseId: number, courseSlug: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await client.post(`/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify("Academic Registry: Enrollment protocol synchronized successfully.", "success");
      navigate(`/courses/${courseSlug}/lessons`);
    } catch (err: any) {
      if (err.response?.status === 400) {
        navigate(`/courses/${courseSlug}/lessons`);
      } else {
        notify('Academic Registry: Failed to synchronize enrollment protocol. Please re-authenticate.', 'error');
      }
    }
  };

  const filteredCourses = courses.filter((c: any) => {
    const title = c?.title || (c as any)?.name || '';
    const code = c.code || '';
    const facultyName = c.faculty?.name || '';
    const term = searchTerm.toLowerCase();
    
    return title.toLowerCase().includes(term) ||
           code.toLowerCase().includes(term) ||
           facultyName.toLowerCase().includes(term);
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-8 shadow-2xl"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.5em] text-[10px]">Accessing Undergraduate Catalog...</p>
    </div>
  );

  if (error) return <RegistryError onRetry={fetchCourses} source={window.location.hostname} message="The Undergraduate Registry could not be synchronized." />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 bg-offwhite min-h-screen transition-all selection:bg-mylms-rose/20">
      
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-10 md:gap-16 border-b border-border-soft pb-10 md:pb-16 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mylms-rose/3 rounded-full blur-[100px] -translate-y-20 translate-x-10"></div>
        <div>
           <div className="flex items-center gap-4 mb-6 md:mb-10 group/sub">
              <span className="w-12 h-px bg-mylms-rose group-hover/sub:w-20 transition-all duration-500"></span>
              <span className="text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px]">{branding?.institutional_name || 'Global Academy'} Registry</span>
           </div>
           <h1 className="text-4xl md:text-8xl font-black text-text-main tracking-tighter mb-6 md:mb-10 leading-[0.9] italic">
             {(branding?.courses_hero_title || 'Educational Pathways').split(' ').map((word: string, i: number) => (
               <span key={i}>
                 {i % 2 === 1 ? <span className="text-transparent bg-clip-text bg-linear-to-r from-mylms-purple to-mylms-rose">{word}</span> : word}{' '}
               </span>
             ))}
           </h1>
           <p className="text-text-secondary font-medium text-base md:text-lg max-w-xl opacity-60 font-sans italic">
             {branding?.courses_hero_desc || `Explore our world-class academic programs designed for global impact. All programs are verified through the ${branding?.institutional_name || 'Global Academy'} Academic Office.`}
           </p>
        </div>
        
        <div className="w-full md:w-auto mt-8 md:mt-0">
          <div className="relative group/search">
            <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-mylms-purple group-hover/search:text-mylms-rose transition-colors" />
            <input 
              type="text" 
              placeholder="Search Catalog..." 
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full md:w-[380px] bg-white border-2 border-border-soft text-mylms-purple py-4 px-14 rounded-[20px] shadow-xl focus:outline-none focus:ring-2 focus:ring-mylms-rose/20 focus:border-mylms-rose transition-all font-bold text-[11px] uppercase tracking-widest"
            />
          </div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24">
         {[
            { label: "Active Programs", val: courses.length, icon: <Layers size={22} />, color: "purple" },
            { label: "Faculty Members", val: "420+", icon: <Users size={22} />, color: "rose" },
            { label: "Global Ranking", val: "#12", icon: <Sparkles size={22} />, color: "purple" },
            { label: "Industry Partners", val: "85+", icon: <Zap size={22} />, color: "rose" },
         ].map((stat: any, i: number) => (
            <div key={i} className="bg-white p-8 md:p-10 rounded-[32px] border border-border-soft flex items-center gap-6 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 w-20 h-20 bg-offwhite rounded-bl-full opacity-50 group-hover:bg-mylms-purple/3 transition-all"></div>
               <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-offwhite text-mylms-${stat.color} flex items-center justify-center group-hover:bg-mylms-${stat.color} group-hover:text-white transition-all duration-500 shadow-inner`}>
                  {stat.icon}
               </div>
               <div className="relative z-10">
                  <p className="text-2xl md:text-3xl font-black text-text-main tracking-tighter">{stat.val}</p>
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">{stat.label}</p>
               </div>
            </div>
         ))}
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-24 md:py-48 bg-white rounded-[40px] border-2 border-dashed border-border-soft shadow-inner">
           <Search size={48} className="mx-auto text-gray-100 mb-8 md:mb-12 opacity-50" />
           <p className="text-gray-300 font-black text-[10px] md:text-[12px] uppercase tracking-[0.5em] px-8 leading-loose italic">No academic programs match your current filter registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {(filteredCourses || []).filter(Boolean).map((course: any) => (
            <div key={course.id} className="flex flex-col bg-white rounded-[40px] border border-border-soft shadow-sm hover:border-mylms-purple/30 transition-all group relative overflow-hidden group-hover:-translate-y-2 duration-500">
              
              {/* MyLMS Badge */}
              <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
                <span className="bg-white/95 backdrop-blur-md text-mylms-purple text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 md:px-5 py-2 rounded-full shadow-2xl border border-border-soft flex items-center gap-2">
                  <BookOpen size={12} className="text-mylms-rose" />
                  {course.code}
                </span>
              </div>

              {/* Visual Identifier - Abstract and Modern */}
              <div className="h-48 md:h-64 bg-offwhite relative overflow-hidden flex items-center justify-center border-b border-border-soft">
                  <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="text-mylms-purple opacity-[0.03] text-[180px] md:text-[240px] font-black select-none pointer-events-none group-hover:scale-125 transition-transform duration-[2s]">{(course?.title || 'C').charAt(0)}</div>
                  
                  {/* Category Pill */}
                  <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
                     <div className="bg-mylms-purple text-white px-4 md:px-5 py-2 rounded-xl shadow-2xl flex items-center gap-3">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{course.credits} Credits</span>
                     </div>
                  </div>
              </div>
              
              <div className="p-8 md:p-12 flex flex-col grow group-hover:bg-offwhite/30 transition-all duration-500">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                   <p className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest opacity-60">Faculty: {course.faculty?.name}</p>
                </div>
                
                <h2 className="text-xl md:text-2xl font-black text-text-main mb-4 md:mb-6 leading-tight group-hover:text-mylms-purple transition-colors tracking-tighter h-14 md:h-16 line-clamp-2 italic">
                  {course?.title}
                </h2>
                
                <p className="text-text-secondary text-[13px] md:text-[14px] line-clamp-3 mb-8 md:mb-12 leading-loose grow font-sans font-medium opacity-60 italic">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mb-8 md:mb-12 pt-8 md:pt-10 border-t border-offwhite">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-offwhite border border-border-soft flex items-center justify-center text-sm font-black text-mylms-purple shadow-inner group-hover:bg-mylms-purple group-hover:text-white transition-all duration-500">
                       <Clock size={18} />
                    </div>
                    <div>
                       <p className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 opacity-60">Duration</p>
                       <p className="text-[10px] md:text-xs font-black text-text-main tracking-tight flex items-center gap-2 uppercase">
                         {course.duration}
                       </p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 opacity-60">Department</p>
                     <p className="text-[9px] md:text-[10px] font-black text-mylms-rose uppercase tracking-widest">{(course.department?.name || '').split(' ')[0]}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-auto">
                   <button 
                     onClick={() => handleEnroll(course.id, course?.slug)}
                     className="flex-1 py-4 bg-mylms-purple text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#001D4A] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 md:gap-4 group/btn"
                   >
                     Enroll Now
                     <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admissions CTA */}
      <div className="mt-24 md:mt-40 p-12 md:p-32 bg-mylms-purple rounded-[60px] md:rounded-[80px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-mylms-rose rounded-full blur-[180px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
          
          <div className="relative z-10 flex flex-col lg:row items-center justify-between gap-12 md:gap-16 text-center lg:text-left">
             <div className="max-w-3xl">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-8 md:mb-10">
                   <span className="w-12 h-px bg-mylms-rose"></span>
                   <span className="text-mylms-rose font-black uppercase tracking-[0.5em] text-[10px]">Academic Readiness Protocol</span>
                </div>
                <h2 className="text-4xl md:text-8xl font-black text-white mb-8 md:mb-10 italic uppercase tracking-tighter leading-[0.85]">
                  Your Future <br /> 
                  <span className="text-white/40">Starts Here.</span>
                </h2>
                <p className="text-white/60 text-base md:text-xl font-sans font-bold uppercase tracking-tight leading-relaxed max-w-2xl px-4 md:px-0">
                   THE 2024 ACADEMIC CYCLE IS NOW ACTIVE. SECURE YOUR PLACEMENT WITHIN OUR GLOBAL FACULTY NETWORK TODAY.
                </p>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/apply" className="bg-white text-mylms-purple px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] hover:bg-mylms-rose hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 group/btn active:scale-95">
                   Initial Application <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
             </div>
          </div>
      </div>

    </div>
  );
}

export default CourseCatalogWidget;
