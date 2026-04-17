import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import AITutorWidget from '../../components/AITutorWidget';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  Award, 
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

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
  const [assessmentzes, setAssessmentzes] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingCert, setClaimingCert] = useState(false);
  const [error, setError] = useState('');
  
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

  const fetchCourseAndContent = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      const [lessonsRes, assessmentzesRes] = await Promise.all([
        client.get(`/courses/${courseRes.data.id}/lessons`),
        client.get(`/courses/${courseRes.data.id}/assessmentzes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setLessons(lessonsRes.data);
      setAssessmentzes(assessmentzesRes.data);
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
        alert(err.response?.data?.message || 'Failed to claim certificate');
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
    <div className="flex h-screen bg-white overflow-hidden transition-all">
      {/* MyLMS Sidebar - Curated Sidebar */}
      <aside className="w-80 border-r border-border-soft flex flex-col bg-offwhite overflow-y-auto shrink-0 relative z-10 transition-all">
        <div className="p-8 border-b border-border-soft bg-white">
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
        
        <nav className="flex-1 py-8">
          <div className="px-8 mb-6">
            <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Unit Registry</h3>
          </div>
          <div className="space-y-1">
            {lessons.map((lesson, idx) => (
              <Link 
                key={lesson.id} 
                to={`/courses/${slug}/lessons/${lesson.slug}`}
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

          {assessmentzes.length > 0 && (
            <div className="mt-12">
              <div className="px-8 mb-6">
                <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Assessments</h3>
              </div>
              <div className="space-y-1">
                {assessmentzes.map((assessment) => (
                  <Link 
                    key={assessment.id} 
                    to={`/assessmentzes/${assessment.id}`}
                    className="flex items-start gap-4 px-8 py-5 transition-all group border-l-4 border-transparent text-gray-400 hover:text-mylms-purple"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-lg bg-mylms-rose text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      Q
                    </div>
                    <span className="text-[11px] font-black leading-tight uppercase group-hover:translate-x-1 transition-transform">Assessment Profile: {assessment.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Aggregate Progress */}
        <div className="p-8 border-t border-border-soft bg-white">
           <div className="flex justify-between items-end mb-4">
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Curriculum Sync</p>
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
      <main className="flex-1 flex flex-col bg-white overflow-y-auto custom-scrollbar">
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
          <article className="max-w-4xl mx-auto w-full px-12 py-16 md:px-16 lg:px-24">
             <header className="mb-16 pb-12 border-b border-border-soft relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                <div className="flex items-center gap-6 mb-6">
                   <span className="px-3 py-1.5 bg-mylms-purple/5 text-mylms-purple text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-mylms-purple/10 shadow-sm flex items-center gap-2">
                      {currentLesson.content_type === 'video' ? <PlayCircle size={10} /> : <FileText size={10} />}
                      {currentLesson.content_type} Protocol
                   </span>
                   <div className="h-px w-8 bg-offwhite"></div>
                   <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                      MyLMS Certified Instruction
                   </span>
                </div>
                <h1 className="text-4xl font-black text-text-main tracking-tighter leading-none uppercase">{currentLesson.title}</h1>
             </header>

             <div className="prose prose-slate max-w-none">
                {currentLesson.content_type === 'video' ? (
                   <div className="mb-16 shadow-2xl border border-border-soft rounded-2xl overflow-hidden bg-text-main aspect-video w-full transition-all hover:scale-[1.01] hover:shadow-mylms-purple/10">
                      <iframe 
                        src={currentLesson.content_data.replace('watch?v=', 'embed/')} 
                        className="w-full h-full" 
                        allowFullScreen
                      />
                   </div>
                ) : (
                   <div className="text-lg text-text-main leading-loose whitespace-pre-wrap font-sans font-bold tracking-tight mb-16 opacity-80 first-letter:text-5xl first-letter:font-black first-letter:text-mylms-purple first-letter:mr-3 first-letter:float-left">
                     {currentLesson.content_data}
                   </div>
                )}
             </div>

             <footer className="mt-20 pt-12 border-t border-border-soft flex flex-col md:flex-row justify-between md:items-center gap-10">
                <div className="flex-1">
                   {lessons.findIndex(l => l.id === currentLesson.id) === lessons.length - 1 && (
                      <button 
                        onClick={handleClaimCertificate}
                        disabled={claimingCert}
                        className="btn-rose px-12 py-4 shadow-2xl disabled:opacity-50 group flex items-center gap-3"
                      >
                        {claimingCert ? 'Transmitting Registry Data...' : 'Finalize Unit Credential'}
                        <Award size={16} className="group-hover:rotate-12 transition-transform" />
                      </button>
                   )}
                </div>
                <div className="flex items-center gap-6">
                   <button 
                     disabled={lessons.findIndex(l => l.id === currentLesson.id) === 0}
                     onClick={() => navigate(`/courses/${slug}/lessons/${lessons[lessons.findIndex(l => l.id === currentLesson.id) - 1].slug}`)}
                     className="px-8 py-4 bg-white border border-border-soft text-mylms-purple font-black rounded-xl hover:bg-offwhite transition-all text-[9px] uppercase tracking-[0.2em] shadow-sm disabled:opacity-30 active:scale-95 flex items-center gap-3"
                   >
                     <ChevronLeft size={14} />
                     Previous Unit
                   </button>
                   <button 
                     disabled={lessons.findIndex(l => l.id === currentLesson.id) === lessons.length - 1}
                     onClick={() => navigate(`/courses/${slug}/lessons/${lessons[lessons.findIndex(l => l.id === currentLesson.id) + 1].slug}`)}
                     className="px-10 py-4 bg-mylms-purple text-white font-black rounded-xl hover:bg-mylms-purple/90 transition-all text-[9px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-30 active:scale-95 flex items-center gap-3"
                   >
                     Next Unit
                     <ChevronRight size={14} />
                   </button>
                </div>
             </footer>
          </article>
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
