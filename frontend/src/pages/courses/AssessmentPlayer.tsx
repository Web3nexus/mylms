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
  time_limit_minutes: number;
  questions: Question[];
}

export default function AssessmentPlayer() {
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
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
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  const fetchAssessment = async () => {
    try {
      const res = await client.get(`/assessmentzes/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessment(res.data);
      if (res.data.time_limit_minutes > 0) {
        setTimeLeft(res.data.time_limit_minutes * 60);
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
      const res = await client.post(`/assessmentzes/${assessmentId}/submit`, { answers }, {
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-offwhite border border-border-soft text-mylms-rose rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-sm">!</div>
      <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase mb-6 leading-none">Restriction Notice</h2>
      <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mb-12 leading-loose">{error}</p>
      <button onClick={() => navigate('/campus')} className="btn-purple px-12 py-3.5 shadow-xl">Return to Campus</button>
    </div>
  );

  if (submitted && result) return (
    <div className="max-w-3xl mx-auto py-20 px-8 transition-all">
      <div className="bg-white rounded-2xl border border-border-soft shadow-2xl overflow-hidden text-center p-16 relative group border-t-8 border-t-mylms-purple">
         <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
         
         <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-10 text-3xl font-black shadow-inner font-display border ${result.score >= 50 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-mylms-rose/5 border-mylms-rose/20 text-mylms-rose'}`}>
           {result.score >= 50 ? 'PASS' : 'FAIL'}
         </div>
         
         <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none mb-4">Official Assessment Report</h1>
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-12 border-b border-offwhite pb-6 inline-block">MyLMS Unified Credential Protocol</p>
         
         <div className="bg-offwhite rounded-2xl py-12 mb-12 border border-gray-50 shadow-inner group/score">
            <span className="block text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-gray-300 group-hover/score:text-text-main transition-colors">Composite Score</span>
            <span className={`text-7xl font-black font-mono tracking-tighter ${result.score >= 50 ? 'text-mylms-purple' : 'text-mylms-rose'}`}>{result.score}%</span>
            <div className="mt-8 flex items-center justify-center gap-4 text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">
               <ShieldCheck size={14} className={result.score >= 50 ? 'text-green-500' : 'text-gray-200'} />
               Passing Threshold Verification: 50%
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/campus" className="btn-purple px-10 py-4 shadow-xl flex items-center gap-3">
               Continue to Campus
               <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="btn-minimal px-10 py-4 shadow-sm flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
               <TrendingUp size={16} />
               Audited Registry
            </Link>
         </div>
      </div>
    </div>
  );

  const currentQuestion = assessment?.questions[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-offwhite py-16 px-8 select-none transition-all">
      <div className="max-w-5xl mx-auto">
        {/* Examination Control Header */}
        <div className="bg-white border border-border-soft rounded-2xl p-10 mb-12 shadow-sm flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden group border-t-8 border-t-mylms-purple">
          <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
          
          <div className="grow w-full z-10">
             <div className="flex justify-between items-center mb-6">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-0">Instructional Assessment Progress</p>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-mylms-rose font-mono tracking-widest">{currentQuestionIdx + 1} / {assessment?.questions.length}</span>
                </div>
             </div>
             <div className="flex gap-2 mb-8">
                {assessment?.questions.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 grow rounded-full transition-all duration-500 ${idx === currentQuestionIdx ? 'bg-mylms-purple shadow-sm' : answers[assessment.questions[idx].id] ? 'bg-mylms-rose' : 'bg-offwhite border border-gray-50 shadow-inner'}`}
                  ></div>
                ))}
             </div>
             <h1 className="text-2xl font-black text-text-main tracking-tighter uppercase leading-none">{assessment?.title}</h1>
          </div>

          {timeLeft !== null && (
            <div className={`shrink-0 px-8 py-5 rounded-2xl border font-mono text-3xl font-black shadow-inner min-w-[180px] text-center z-10 transition-all ${timeLeft < 60 ? 'bg-mylms-rose text-white animate-pulse border-transparent' : 'bg-offwhite text-text-main border-gray-50'}`}>
               <div className="text-[8px] uppercase tracking-[0.3em] opacity-40 leading-none mb-2 font-sans">Remaining Protocol</div>
               {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Examination Content Module */}
        {currentQuestion && (
          <div className="bg-white border border-border-soft rounded-2xl shadow-xl overflow-hidden group hover:border-mylms-purple/20 transition-all">
            <div className="p-12 border-b border-border-soft bg-white group-hover:bg-offwhite/30 transition-all">
               <div className="flex items-center gap-4 mb-6">
                  <span className="text-[9px] font-black text-mylms-purple uppercase tracking-[0.3em] bg-mylms-purple/5 px-3 py-1 rounded-lg">PROCTOR_ITEM {currentQuestionIdx + 1}</span>
                  <div className="h-px grow bg-border-soft opacity-30"></div>
               </div>
               <h2 className="text-3xl font-black text-text-main leading-tight uppercase tracking-tight">{currentQuestion.text}</h2>
            </div>
            
            <div className="p-12 space-y-4 bg-white">
               {currentQuestion.options.map((option) => (
                 <button
                   key={option.id}
                   onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                   className={`w-full p-6 text-left rounded-xl border-2 transition-all flex items-center justify-between group/opt relative overflow-hidden ${answers[currentQuestion.id] === option.id ? 'bg-offwhite border-mylms-purple text-text-main shadow-md' : 'bg-white border-border-soft text-mylms-purple hover:border-mylms-purple/30 hover:bg-offwhite/50 shadow-sm'}`}
                 >
                    <span className="font-black text-[12px] uppercase tracking-tight group-hover/opt:translate-x-1 transition-transform relative z-10">{option.text}</span>
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 relative z-10 ${answers[currentQuestion.id] === option.id ? 'bg-mylms-purple border-mylms-purple shadow-sm' : 'border-border-soft group-hover/opt:border-mylms-purple/40'}`}>
                       {answers[currentQuestion.id] === option.id && <CheckCircle size={14} className="text-white" />}
                    </div>
                 </button>
               ))}
            </div>

            <div className="p-10 bg-offwhite border-t border-border-soft flex justify-between items-center">
               <button 
                 disabled={currentQuestionIdx === 0}
                 onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                 className="px-10 py-3 text-gray-300 font-black hover:text-mylms-purple disabled:opacity-0 transition-colors uppercase tracking-[0.2em] text-[10px] flex items-center gap-3"
               >
                 <ChevronLeft size={16} />
                 Previous Entry
               </button>
               
               <div className="flex items-center gap-6">
                  {currentQuestionIdx === (assessment?.questions.length ?? 0) - 1 ? (
                    <button 
                      onClick={handleSubmit}
                      className="px-12 py-4 bg-mylms-rose text-white font-black rounded-full hover:bg-mylms-rose/90 shadow-2xl transition-all uppercase tracking-[0.3em] text-[10px] active:scale-95 flex items-center gap-3"
                    >
                      Commit Final Submission
                      <Inbox size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                      className="px-12 py-4 bg-mylms-purple text-white font-black rounded-full hover:bg-mylms-purple/90 transition-all shadow-xl uppercase tracking-[0.3em] text-[10px] active:scale-95 flex items-center gap-3"
                    >
                      Next Entry
                      <ChevronRight size={16} />
                    </button>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
