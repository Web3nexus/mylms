import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import AITutorWidget from '../../components/AITutorWidget';
import SecureMediaViewer from '../../components/SecureMediaViewer';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  Award, 
  ArrowLeft,
  MessageSquare,
  Notebook,
  Save,
  Check,
  RotateCcw,
  X,
  History,
  Menu
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

interface Lesson {
  id: number;
  title: string;
  slug: string;
  content_type: 'text' | 'video';
  content_data: string;
}

export default function LessonViewer() {
  const { slug, lessonSlug } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingCert, setClaimingCert] = useState(false);
  const [error, setError] = useState('');
  
  // Note System State
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [isRegistryMobileOpen, setIsRegistryMobileOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchCourseAndContent();
  }, [slug]);

  useEffect(() => {
    if (lessons.length > 0 && lessonSlug) {
      const lesson = lessons.find(l => l.slug === lessonSlug);
      if (lesson) {
        fetchLessonContent(lesson.id);
      }
    } else if (lessons.length > 0 && !lessonSlug) {
      navigate(`/courses/${slug}/lessons/${lessons[0].slug}`);
    }
  }, [lessons, lessonSlug]);

  // Fetch Notes Enhancement
  useEffect(() => {
    if (currentLesson) {
      fetchNotes(currentLesson.id);
    }
  }, [currentLesson?.id]);

  const fetchCourseAndContent = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      const [lessonsRes, assessmentsRes] = await Promise.all([
        client.get(`/courses/${courseRes.data.id}/lessons`),
        client.get(`/courses/${courseRes.data.id}/assessments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setLessons(lessonsRes.data);
      setAssessments(assessmentsRes.data);
    } catch (err) {
      console.error('Error fetching viewer content:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonContent = async (lessonId: number) => {
    try {
      const res = await client.get(`/courses/${course.id}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentLesson(res.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unauthorized to view this lesson');
      setCurrentLesson(null);
    }
  };

  const fetchNotes = async (lessonId: number) => {
    try {
      const res = await client.get(`/lessons/${lessonId}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data.content || '');
      setLastSaved(null); // Reset saved indicator on lesson change
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const { notify } = useNotificationStore();

  const saveNotes = async (content: string) => {
    if (!currentLesson) return;
    
    setIsSaving(true);
    try {
      await client.post(`/lessons/${currentLesson.id}/notes`, { content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving notes:', err);
      notify("Registry Error: Failed to secure observation log.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setNotes(newContent);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(newContent);
    }, 1500); // Debounced save after 1.5s
  };

  const handleClaimCertificate = async () => {
    setClaimingCert(true);
    try {
      await client.post(`/courses/${course.slug}/certificate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/courses/${course.slug}/certificate`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        navigate(`/courses/${course.slug}/certificate`);
      } else {
        notify(err.response?.data?.message || 'Academic Registry: Failed to claim unit credential.', 'error');
      }
    } finally {
      setClaimingCert(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Initializing Classroom Protocol...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden transition-all relative">
      {/* Mobile Registry Overlay */}
      {isRegistryMobileOpen && (
        <div 
          className="fixed inset-0 bg-mylms-primary/40 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsRegistryMobileOpen(false)}
        />
      )}

      {/* MyLMS Sidebar - Curated Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40 lg:z-10 h-full w-80 border-r border-border-soft flex flex-col bg-offwhite overflow-y-auto shrink-0 transition-transform duration-300 shadow-2xl lg:shadow-none
        ${isRegistryMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-border-soft bg-white flex justify-between items-start">
           <div>
             <Link to="/campus" className="text-[9px] font-black uppercase text-gray-300 mb-6 hover:text-mylms-purple transition-all flex items-center gap-3">
                <ArrowLeft size={12} />
                Return to Campus
             </Link>
             <h2 className="text-xl font-black text-text-main tracking-tighter leading-tight mb-4 uppercase">{course?.title}</h2>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-mylms-rose rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Live Instructional Session</span>
             </div>
           </div>
           <button 
             onClick={() => setIsRegistryMobileOpen(false)}
             className="lg:hidden p-2 rounded-lg bg-offwhite text-text-secondary"
           >
             <X size={18} />
           </button>
        </div>
        
        <nav className="flex-1 py-8">
          <div className="px-8 mb-6">
            <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Unit Registry</h3>
          </div>
          <div className="space-y-1">
            {lessons.map((lesson, idx) => (
              <Link 
                key={lesson.id} 
                to={`/courses/${slug}/lessons/${lesson.slug}`}
                onClick={() => setIsRegistryMobileOpen(false)}
                className={`flex items-start gap-4 px-8 py-5 transition-all relative group ${lessonSlug === lesson.slug ? 'bg-white text-text-main border-l-4 border-mylms-purple shadow-sm' : 'text-gray-400 hover:text-mylms-purple border-l-4 border-transparent'}`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${lessonSlug === lesson.slug ? 'bg-mylms-purple text-white shadow-xl' : 'bg-white border border-border-soft text-gray-300 shadow-sm'}`}>
                  {idx + 1}
                </div>
                <span className={`text-[11px] font-black leading-tight uppercase group-hover:translate-x-1 transition-transform`}>{lesson.title}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 px-8">
             <Link 
                to={`/courses/${slug}/forums`}
                className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-mylms-purple/5 border border-mylms-purple/10 text-mylms-purple hover:bg-mylms-purple hover:text-white transition-all group shadow-sm"
             >
                <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Course Community</span>
             </Link>
          </div>

          {assessments.length > 0 && (
            <div className="mt-12">
              <div className="px-8 mb-6">
                <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Assessments & Tasks</h3>
              </div>
              <div className="space-y-1">
                {assessments.map((assessment) => (
                  <Link 
                    key={assessment.id} 
                    to={`/assessments/${assessment.id}`}
                    className="flex items-start gap-4 px-8 py-5 transition-all group border-l-4 border-transparent text-gray-400 hover:text-mylms-purple"
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform ${assessment.type === 'quiz' ? 'bg-mylms-rose text-white' : 'bg-mylms-purple text-white'}`}>
                      {assessment.type === 'quiz' ? 'Q' : 'A'}
                    </div>
                    <span className="text-[11px] font-black leading-tight uppercase group-hover:translate-x-1 transition-transform">{assessment.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Aggregate Progress */}
        <div className="p-8 border-t border-border-soft bg-white">
           <div className="flex justify-between items-end mb-4">
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Instructional Progress</p>
              <p className="text-[10px] font-black text-mylms-purple font-mono tracking-tighter">
                {Math.round(((lessons.findIndex(l => l.slug === lessonSlug) + 1) / lessons.length) * 100)}%
              </p>
           </div>
           <div className="w-full bg-offwhite h-1.5 rounded-full overflow-hidden border border-gray-50 shadow-inner">
             <div 
               className="bg-mylms-purple h-full transition-all duration-1000 shadow-[0_0_10px_rgba(75,52,94,0.3)]" 
               style={{ width: `${((lessons.findIndex(l => l.slug === lessonSlug) + 1) / lessons.length) * 100}%` }}
             ></div>
           </div>
        </div>
      </aside>

      {/* Primary Instruction Content Area */}
      <main className="flex-1 flex flex-col bg-white overflow-y-auto custom-scrollbar relative">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-20 text-center max-w-2xl mx-auto opacity-80">
             <div className="w-16 h-16 bg-offwhite border border-border-soft text-mylms-rose rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-sm">!</div>
             <h3 className="text-3xl font-black text-text-main tracking-tighter uppercase mb-4 leading-none">Restriction Protocol</h3>
             <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mb-12 leading-loose">
               {error}
             </p>
             <button 
               onClick={() => navigate('/campus')}
               className="btn-purple px-12 py-3.5 shadow-xl"
             >
               Return to Campus
             </button>
          </div>
        ) : currentLesson ? (
          <div className="flex h-full overflow-hidden">
            <article className={`flex-1 overflow-y-auto custom-scrollbar px-6 md:px-16 lg:px-24 py-8 md:py-16 transition-all duration-500 ${showNotes ? 'lg:pr-12' : ''}`}>
               <header className="mb-10 md:mb-16 pb-8 md:pb-12 border-b border-border-soft relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                  
                  {/* Mobile Command Bar */}
                  <div className="lg:hidden flex items-center justify-between mb-8">
                    <button 
                      onClick={() => setIsRegistryMobileOpen(true)}
                      className="p-3 rounded-xl bg-offwhite border border-border-soft text-mylms-purple shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Menu size={16} />
                      Units
                    </button>
                    <button 
                      onClick={() => setShowNotes(true)}
                      className="p-3 rounded-xl bg-mylms-purple/10 border border-mylms-purple/20 text-mylms-purple shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Notebook size={16} />
                      Notes
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4 md:gap-6">
                       <span className="px-3 py-1.5 bg-mylms-purple/5 text-mylms-purple text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-mylms-purple/10 shadow-sm flex items-center gap-2">
                          {currentLesson.content_type === 'video' ? <PlayCircle size={10} /> : <FileText size={10} />}
                          {currentLesson.content_type} Protocol
                       </span>
                    </div>
                    {/* Notes Toggle Button - Desktop Only */}
                    <button 
                      onClick={() => setShowNotes(!showNotes)}
                      className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border ${showNotes ? 'bg-mylms-purple text-white border-mylms-purple shadow-xl' : 'bg-white text-gray-400 border-border-soft hover:border-mylms-purple hover:text-mylms-purple'}`}
                    >
                      <Notebook size={14} />
                      {showNotes ? 'Close Notes' : 'Open Notes'}
                    </button>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black text-text-main tracking-tighter leading-none uppercase">{currentLesson.title}</h1>
               </header>

               <div className="prose prose-slate max-w-none">
                  {currentLesson.content_type === 'video' ? (
                     <div className="mb-16">
                        <SecureMediaViewer url={currentLesson.content_data} />
                     </div>
                  ) : (
                     <div className="text-lg text-text-main leading-loose whitespace-pre-wrap font-sans font-bold tracking-tight mb-16 opacity-80 first-letter:text-5xl first-letter:font-black first-letter:text-mylms-purple first-letter:mr-3 first-letter:float-left">
                       {currentLesson.content_data}
                     </div>
                  )}
               </div>

                <footer className="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-border-soft flex flex-col md:flex-row justify-between md:items-center gap-6 md:gap-10">
                  <div className="flex-1">
                     {lessons.findIndex(l => l.id === currentLesson.id) === lessons.length - 1 && (
                        <button 
                          onClick={handleClaimCertificate}
                          disabled={claimingCert}
                          className="w-full md:w-auto btn-rose px-12 py-4 shadow-2xl disabled:opacity-50 group flex items-center justify-center gap-3"
                        >
                          {claimingCert ? 'Transmitting Registry Data...' : 'Finalize Unit Credential'}
                          <Award size={16} className="group-hover:rotate-12 transition-transform" />
                        </button>
                     )}
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
                     <button 
                       disabled={lessons.findIndex(l => l.id === currentLesson.id) === 0}
                       onClick={() => navigate(`/courses/${slug}/lessons/${lessons[lessons.findIndex(l => l.id === currentLesson.id) - 1].slug}`)}
                       className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 bg-white border border-border-soft text-mylms-purple font-black rounded-xl hover:bg-offwhite transition-all text-[9px] uppercase tracking-[0.2em] shadow-sm disabled:opacity-30 active:scale-95 flex items-center justify-center gap-3"
                     >
                       <ChevronLeft size={14} />
                       Prev
                     </button>
                     <button 
                       disabled={lessons.findIndex(l => l.id === currentLesson.id) === lessons.length - 1}
                       onClick={() => navigate(`/courses/${slug}/lessons/${lessons[lessons.findIndex(l => l.id === currentLesson.id) + 1].slug}`)}
                       className="flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 bg-mylms-purple text-white font-black rounded-xl hover:bg-mylms-purple/90 transition-all text-[9px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-30 active:scale-95 flex items-center justify-center gap-3"
                     >
                       Next
                       <ChevronRight size={14} />
                     </button>
                  </div>
                </footer>
            </article>

            {/* Sliding Registry Note Panel */}
            <aside className={`fixed lg:relative z-40 top-0 right-0 h-full bg-offwhite border-l transition-all duration-500 ease-in-out shadow-2xl lg:shadow-none flex flex-col ${showNotes ? 'w-full lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 overflow-hidden'}`}>
                <div className="p-8 pb-4 flex justify-between items-center bg-white border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <Notebook size={18} className="text-mylms-purple" />
                    <h3 className="text-sm font-black text-text-main uppercase tracking-tighter">Lesson Registry</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                           <RotateCcw size={10} className="animate-spin text-mylms-purple" />
                           <span className="text-[8px] font-black text-mylms-purple uppercase tracking-widest">Saving...</span>
                        </div>
                      ) : lastSaved ? (
                        <div className="flex items-center gap-2">
                           <Check size={10} className="text-green-500" />
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Protocol Secured</span>
                        </div>
                      ) : (
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Registry Ready</span>
                      )}
                    </div>
                    <button onClick={() => setShowNotes(false)} className="lg:hidden text-gray-400 hover:text-mylms-rose">
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 p-8 flex flex-col overflow-hidden relative">
                   {/* Grid Background Effect */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b345e 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                   
                   <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <History size={10} />
                      Student Observation Log
                   </label>
                   
                   <textarea
                     value={notes}
                     onChange={handleNotesChange}
                     placeholder="Jot down your observations and key takeaways from this lesson here. Notes are private and automatically secured to your registry..."
                     className="flex-1 w-full bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-[13px] font-bold text-text-main border border-border-soft focus:border-mylms-purple/40 focus:ring-0 resize-none transition-all placeholder:text-gray-200 shadow-inner z-10"
                   />

                   <div className="mt-6 flex justify-between items-center z-10">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Private Student Data</p>
                      <button 
                        onClick={() => saveNotes(notes)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-border-soft text-mylms-purple rounded-xl hover:bg-mylms-purple hover:text-white transition-all font-black text-[9px] uppercase tracking-widest shadow-sm"
                      >
                        <Save size={12} />
                        Manual Protocol
                      </button>
                   </div>
                </div>
            </aside>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-offwhite/30">
            <div className="animate-spin w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full shadow-inner"></div>
          </div>
        )}
      </main>

      {/* Floating MyLMS Support Protocol */}
      {course && !error && <AITutorWidget courseId={course.id} />}
    </div>
  );
}
