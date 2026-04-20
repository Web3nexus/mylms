import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Clock, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';

interface RubricCriterion {
  id: number;
  name: string;
  description: string;
  max_score: number;
}

interface Rubric {
  id: number;
  title: string;
  description: string;
  criteria: RubricCriterion[];
}

interface Option {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  type: 'mcq' | 'true_false';
  options: Option[];
}

interface Assessment {
  id: number;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'peer_assignment';
  is_timed: boolean;
  duration_minutes: number;
  time_limit_minutes: number; // Legacy support
  questions: Question[];
  rubric?: Rubric;
}

export default function AssessmentPlayer() {
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [file, setFile] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const timerRef = useRef<any>(null);
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchAssessment();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [assessmentId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && !submitted) {
      if (assessment?.type === 'quiz') {
         handleSubmit();
      }
    }
  }, [timeLeft, submitted]);

  const fetchAssessment = async () => {
    try {
      const res = await client.get(`/assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessment(res.data);
      
      const timeLimit = res.data.duration_minutes || res.data.time_limit_minutes;
      if (res.data.is_timed && timeLimit > 0) {
        setTimeLeft(timeLimit * 60);
        startTimer();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unauthorized Access Profile');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const handleOptionSelect = (questionId: number, optionId: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    setLoading(true);
    try {
      const res = await client.post(`/assessments/${assessmentId}/submit`, { answers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || submitted) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file_submission', file);

    try {
      const res = await client.post(`/assessments/${assessmentId}/submit`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload protocol failed');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Initializing Assessment Session...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 md:p-20 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-offwhite border border-border-soft text-mylms-rose rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-sm">!</div>
      <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter uppercase mb-6 leading-none">Restriction Notice</h2>
      <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mb-12 leading-loose">{error}</p>
      <button onClick={() => navigate('/campus')} className="btn-purple px-12 py-3.5 shadow-xl">Return to Campus</button>
    </div>
  );

  if (submitted && result) return (
    <div className="max-w-3xl mx-auto py-12 md:py-20 px-4 md:px-8 transition-all">
      <div className="bg-white rounded-2xl border border-border-soft shadow-2xl overflow-hidden text-center p-8 md:p-16 relative group border-t-8 border-t-mylms-purple">
          <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
          
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 md:mb-10 text-2xl md:text-3xl font-black shadow-inner font-display border ${result.score !== undefined ? (result.score >= 50 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-mylms-rose/5 border-mylms-rose/20 text-mylms-rose') : 'bg-offwhite border-border-soft text-mylms-purple'}`}>
            {result.score !== undefined ? (result.score >= 50 ? 'PASS' : 'FAIL') : 'REC'}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tighter uppercase leading-none mb-4">Official Assessment Report</h1>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 md:mb-12 border-b border-offwhite pb-6 inline-block">MyLMS Unified Credential Protocol</p>
          
          {result.score !== undefined ? (
            <div className="bg-offwhite rounded-2xl py-8 md:py-12 mb-12 border border-gray-50 shadow-inner group/score">
               <span className="block text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-gray-300 group-hover/score:text-text-main transition-colors">Composite Score</span>
               <span className={`text-6xl md:text-7xl font-black font-mono tracking-tighter ${result.score >= 50 ? 'text-mylms-purple' : 'text-mylms-rose'}`}>{result.score}%</span>
               <div className="mt-8 flex items-center justify-center gap-4 text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none px-4">
                  <ShieldCheck size={14} className={result.score >= 50 ? 'text-green-500' : 'text-gray-200'} />
                  Passing Threshold Verification: 50%
               </div>
            </div>
          ) : (
            <div className="bg-offwhite rounded-2xl py-8 md:py-12 mb-12 border border-gray-50 shadow-inner">
               <Inbox size={48} className="mx-auto mb-6 text-mylms-purple opacity-20" />
               <p className="text-[11px] font-black text-text-main uppercase tracking-[0.2em] mb-2">Submission Received</p>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4">Pending Faculty Review & Rubric Evaluation</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
             <Link to="/campus" className="btn-purple px-10 py-4 shadow-xl flex items-center justify-center gap-3">
                Continue to Campus
                <ArrowRight size={16} />
             </Link>
             <Link to="/portal" className="btn-minimal px-10 py-4 shadow-sm flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest">
                <TrendingUp size={16} />
                Student Dashboard
             </Link>
          </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-offwhite py-8 md:py-16 px-4 md:px-8 select-none transition-all">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white border border-border-soft rounded-2xl p-6 md:p-10 mb-8 md:mb-12 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 relative overflow-hidden group border-t-8 border-t-mylms-purple">
          <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
          
          <div className="grow w-full z-10">
             <div className="flex justify-between items-center mb-4 md:mb-6">
                <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-0">Instructional Session Progress</p>
                {assessment?.type === 'quiz' && (
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-mylms-rose font-mono tracking-widest">{currentQuestionIdx + 1} / {assessment?.questions.length}</span>
                  </div>
                )}
             </div>
             
             {assessment?.type === 'quiz' && (
                <div className="flex gap-2 mb-6 md:mb-8">
                   {assessment?.questions.map((_, idx) => (
                     <div 
                       key={idx} 
                       className={`h-1 md:h-1.5 grow rounded-full transition-all duration-500 ${idx === currentQuestionIdx ? 'bg-mylms-purple shadow-sm' : answers[assessment.questions[idx].id] ? 'bg-mylms-rose' : 'bg-offwhite border border-gray-50 shadow-inner'}`}
                     ></div>
                   ))}
                </div>
             )}
             
             <h1 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase leading-none">{assessment?.title}</h1>
          </div>

          {timeLeft !== null && (
            <div className={`shrink-0 w-full md:w-auto px-6 md:px-8 py-4 md:py-5 rounded-2xl border font-mono text-2xl md:text-3xl font-black shadow-inner min-w-[140px] md:min-w-[180px] text-center z-10 transition-all ${timeLeft < 60 ? 'bg-mylms-rose text-white animate-pulse border-transparent' : 'bg-offwhite text-text-main border-gray-50'}`}>
               <div className="text-[8px] uppercase tracking-[0.3em] opacity-40 leading-none mb-1 md:mb-2 font-sans">Remaining Protocol</div>
               {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Content Section */}
        {assessment?.type === 'quiz' ? (
          <div className="bg-white border border-border-soft rounded-2xl shadow-xl overflow-hidden group hover:border-mylms-purple/20 transition-all">
            {assessment.questions[currentQuestionIdx] && (
              <>
                <div className="p-8 md:p-12 border-b border-border-soft bg-white group-hover:bg-offwhite/30 transition-all">
                   <div className="flex items-center gap-4 mb-4 md:mb-6">
                      <span className="text-[9px] font-black text-mylms-purple uppercase tracking-[0.3em] bg-mylms-purple/5 px-3 py-1 rounded-lg">PROCTOR_ITEM {currentQuestionIdx + 1}</span>
                      <div className="h-px grow bg-border-soft opacity-30"></div>
                   </div>
                   <h2 className="text-2xl md:text-3xl font-black text-text-main leading-tight uppercase tracking-tight">{assessment.questions[currentQuestionIdx].text}</h2>
                </div>
                
                <div className="p-8 md:p-12 space-y-4 bg-white">
                   {assessment.questions[currentQuestionIdx].options.map((option) => (
                     <button
                       key={option.id}
                       onClick={() => handleOptionSelect(assessment.questions[currentQuestionIdx].id, option.id)}
                       className={`w-full p-5 md:p-6 text-left rounded-xl border-2 transition-all flex items-center justify-between group/opt relative overflow-hidden ${answers[assessment.questions[currentQuestionIdx].id] === option.id ? 'bg-offwhite border-mylms-purple text-text-main shadow-md' : 'bg-white border-border-soft text-mylms-purple hover:border-mylms-purple/30 hover:bg-offwhite/50 shadow-sm'}`}
                     >
                        <span className="font-black text-[11px] md:text-[12px] uppercase tracking-tight group-hover/opt:translate-x-1 transition-transform relative z-10">{option.text}</span>
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 relative z-10 ${answers[assessment.questions[currentQuestionIdx].id] === option.id ? 'bg-mylms-purple border-mylms-purple shadow-sm' : 'border-border-soft group-hover/opt:border-mylms-purple/40'}`}>
                           {answers[assessment.questions[currentQuestionIdx].id] === option.id && <CheckCircle size={14} className="text-white" />}
                        </div>
                     </button>
                   ))}
                </div>

                <div className="p-6 md:p-10 bg-offwhite border-t border-border-soft flex flex-col sm:flex-row justify-between items-center gap-6">
                   <button 
                     disabled={currentQuestionIdx === 0}
                     onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                     className="w-full sm:w-auto px-10 py-3 text-gray-300 font-black hover:text-mylms-purple disabled:opacity-0 transition-colors uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
                   >
                     <ChevronLeft size={16} />
                     Previous Entry
                   </button>
                   
                   <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                      {currentQuestionIdx === assessment.questions.length - 1 ? (
                        <button 
                          onClick={handleSubmit}
                          className="w-full sm:w-auto px-12 py-4 bg-mylms-rose text-white font-black rounded-full hover:bg-mylms-rose/90 shadow-2xl transition-all uppercase tracking-[0.3em] text-[10px] active:scale-95 flex items-center justify-center gap-3"
                        >
                          Commit Final Submission
                          <Inbox size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                          className="w-full sm:w-auto px-12 py-4 bg-mylms-purple text-white font-black rounded-full hover:bg-mylms-purple/90 transition-all shadow-xl uppercase tracking-[0.3em] text-[10px] active:scale-95 flex items-center justify-center gap-3"
                        >
                          Next Entry
                          <ChevronRight size={16} />
                        </button>
                      )}
                   </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white border border-border-soft rounded-2xl p-8 md:p-12 shadow-sm">
                  <h3 className="text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-6 md:mb-8 border-b border-offwhite pb-4">Assignment Overview</h3>
                  <p className="text-[14px] md:text-base text-text-main font-bold leading-relaxed whitespace-pre-wrap">{assessment?.description || "No specific instructions provided for this assignment session."}</p>
               </div>

               <div className="bg-white border border-border-soft rounded-2xl p-8 md:p-12 shadow-xl">
                  <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.3em] mb-10">Submission Gateway</h3>
                  <form onSubmit={handleFileUpload} className="space-y-10">
                     <div className="border-2 border-dashed border-border-soft rounded-3xl p-10 md:p-16 text-center hover:border-mylms-purple/40 hover:bg-offwhite/30 transition-all group relative cursor-pointer">
                        <input 
                          type="file" 
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center">
                           <div className="w-16 h-16 md:w-20 md:h-20 bg-offwhite rounded-2xl flex items-center justify-center text-mylms-purple mb-6 group-hover:scale-110 transition-transform">
                              <Inbox size={32} />
                           </div>
                           <p className="text-[11px] md:text-[12px] font-black text-text-main uppercase tracking-tighter mb-2 px-4 line-clamp-1">
                             {file ? file.name : "Drag instructional artifacts here"}
                           </p>
                           <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4">Supports PDF, DOCX, ZIP (Max 10MB)</p>
                        </div>
                     </div>

                     <button 
                       type="submit" 
                       disabled={!file || uploading || submitted}
                       className="w-full py-5 bg-mylms-purple text-white font-black rounded-2xl hover:bg-mylms-purple/90 shadow-2xl transition-all uppercase tracking-[0.4em] text-[11px] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 active:scale-95"
                     >
                        {uploading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Inbox size={18} />
                        )}
                        {uploading ? 'Transmitting Data...' : 'Submit Academic Package'}
                     </button>
                  </form>
               </div>
            </div>

            <div className="space-y-8">
               {assessment?.rubric && (
                 <div className="bg-white border border-border-soft rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-mylms-purple/10"></div>
                    <h3 className="text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-8">Grading Rubric</h3>
                    <div className="space-y-8">
                       {assessment.rubric.criteria.map(criterion => (
                         <div key={criterion.id} className="group/crit">
                            <div className="flex justify-between items-start mb-3 gap-4">
                               <p className="text-[11px] font-black text-text-main uppercase tracking-tight group-hover/crit:text-mylms-purple transition-colors">{criterion.name}</p>
                               <span className="text-[9px] font-black text-mylms-rose bg-mylms-rose/5 px-2 py-0.5 rounded border border-mylms-rose/10 shrink-0">{criterion.max_score} pts</span>
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{criterion.description}</p>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
               
               <div className="bg-mylms-purple p-8 md:p-10 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">Session Integrity</h4>
                  <p className="text-[11px] font-bold leading-relaxed mb-8 relative z-10">
                    All submissions are time-stamped and audited via the MyLMS Protocol. Ensure your work adheres to Academic Integrity guidelines.
                  </p>
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest relative z-10">
                     <ShieldCheck size={14} className="text-mylms-rose" />
                     Verified Submission Path
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
