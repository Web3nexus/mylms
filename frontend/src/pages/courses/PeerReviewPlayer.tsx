import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck, 
  ArrowLeft,
  Send,
  Info
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

interface RubricCriterion {
  id: number;
  name: string;
  description: string;
  max_score: number;
}

interface PeerReviewData {
  id: number;
  status: 'pending' | 'completed';
  score: number | null;
  feedback: string | null;
  submission: {
    id: number;
    file_path: string;
    assessment: {
      title: string;
      description: string;
      rubric: {
        criteria: RubricCriterion[];
      };
    };
  };
}

export default function PeerReviewPlayer() {
  const { reviewId } = useParams();
  const [review, setReview] = useState<PeerReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState('');

  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      const res = await client.get(`/peer-reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReview(res.data);
      if (res.data.status === 'completed') {
        setScore(res.data.score);
        setFeedback(res.data.feedback);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  const { notify } = useNotificationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || (review && review.status === 'completed')) return;

    setSubmitting(true);
    try {
      await client.post(`/peer-reviews/${reviewId}/submit`, { score, feedback }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify("Academic Registry: Peer audit protocol synchronized successfully.", "success");
      navigate('/campus/peer-reviews');
    } catch (err: any) {
      notify(err.response?.data?.message || 'Academic Registry: Submission protocol failure.', "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !review) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center bg-offwhite">
      <h2 className="text-3xl font-black text-text-main uppercase mb-8">{error || 'Session Not Found'}</h2>
      <button onClick={() => navigate('/campus/peer-reviews')} className="btn-purple px-10 py-3">Return to Listing</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-offwhite py-12 px-8 transition-all selection:bg-mylms-purple selection:text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
           <div>
              <button 
                onClick={() => navigate('/campus/peer-reviews')}
                className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-mylms-purple transition-colors mb-6"
              >
                <ArrowLeft size={16} />
                Back to Assignments
              </button>
              <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none mb-2">Audit Session</h1>
              <p className="text-mylms-purple font-bold uppercase tracking-[0.3em] text-[8px] flex items-center gap-3">
                 <ShieldCheck size={12} />
                 Instructional Evaluation Protocol: {review.submission.assessment.title}
              </p>
           </div>
           
           <div className={`px-8 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm ${review.status === 'completed' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-mylms-rose/5 border-mylms-rose/10 text-mylms-rose'}`}>
              {review.status}
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Left: Submission Data */}
           <div className="space-y-10">
              <section className="bg-white border border-border-soft rounded-3xl p-10 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                 <h3 className="text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-8 border-b border-offwhite pb-4">Academic Work Product</h3>
                 
                 <div className="flex items-center gap-6 p-8 bg-offwhite rounded-2xl border border-gray-100 mb-8 hover:bg-white transition-all group/artifact">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-mylms-purple shadow-sm group-hover/artifact:scale-110 transition-transform">
                       <FileText size={32} />
                    </div>
                    <div className="grow">
                       <p className="text-[11px] font-black text-text-main uppercase tracking-tight mb-1">Attached Documentation</p>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Instructional artifact to be audited against the rubric registry.</p>
                    </div>
                    <a 
                      href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${review.submission.file_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 bg-mylms-purple text-white rounded-xl shadow-lg hover:bg-mylms-purple/90 transition-all active:scale-90"
                    >
                       <ExternalLink size={18} />
                    </a>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-text-main uppercase tracking-[0.2em] opacity-40">Contextual Parameters</p>
                    <p className="text-[12px] font-bold text-text-main leading-relaxed italic opacity-80 border-l-4 border-mylms-purple/20 pl-6">
                       {review.submission.assessment.description}
                    </p>
                 </div>
              </section>

              <section className="bg-mylms-purple p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-all duration-1000"></div>
                 <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                       <Info size={24} />
                    </div>
                    <div>
                       <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-4">Evaluator Guidance</h4>
                       <p className="text-[10px] font-bold leading-loose opacity-80 uppercase tracking-widest">
                          Objectivity is the foundation of the MyLMS Protocol. Assess the work based strictly on the visible criteria and instructional standards provided in the rubric section.
                       </p>
                    </div>
                 </div>
              </section>
           </div>

           {/* Right: Rubric & Form */}
           <div className="bg-white border border-border-soft rounded-3xl shadow-xl overflow-hidden flex flex-col">
              <div className="p-10 border-b border-border-soft bg-offwhite/50">
                 <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.3em]">Evaluation Ledger</h3>
              </div>

              <div className="flex-1 p-10 space-y-12">
                 {/* Rubric Display */}
                 <div className="space-y-8">
                    {review.submission.assessment.rubric.criteria.map(criterion => (
                      <div key={criterion.id} className="p-6 rounded-2xl border border-gray-50 bg-offwhite/30 hover:border-mylms-purple/20 transition-all group/crit">
                         <div className="flex justify-between items-start mb-4">
                            <h5 className="text-[11px] font-black text-text-main uppercase tracking-tight group-hover/crit:text-mylms-purple transition-colors">{criterion.name}</h5>
                            <span className="px-2 py-0.5 bg-mylms-rose/5 text-mylms-rose text-[8px] font-black rounded border border-mylms-rose/10">{criterion.max_score} MAX</span>
                         </div>
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            {criterion.description}
                         </p>
                      </div>
                    ))}
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-8 pt-8 border-t border-offwhite">
                    <div>
                       <label className="text-[10px] font-black text-text-main uppercase tracking-[0.3em] mb-4 flex justify-between">
                          Weighted Score Registry
                          <span className={`${score >= 50 ? 'text-green-600' : 'text-mylms-rose'} font-mono text-lg`}>{score}%</span>
                       </label>
                       <input 
                         type="range" 
                         min="0" 
                         max="100" 
                         value={score} 
                         onChange={(e) => setScore(parseInt(e.target.value))}
                         disabled={review.status === 'completed'}
                         className="w-full h-2 bg-offwhite rounded-full appearance-none cursor-pointer accent-mylms-purple"
                       />
                       <div className="flex justify-between mt-3 text-[8px] font-black text-gray-300 uppercase tracking-widest">
                          <span>Instructional Failure</span>
                          <span>Elite Proficiency</span>
                       </div>
                    </div>

                    <div>
                       <label className="block text-[10px] font-black text-text-main uppercase tracking-[0.3em] mb-4">Qualitative Feedback Context</label>
                       <textarea 
                         required
                         rows={6}
                         value={feedback}
                         onChange={(e) => setFeedback(e.target.value)}
                         disabled={review.status === 'completed'}
                         placeholder="Enter instructional insights and auditing notes..."
                         className="w-full p-6 bg-offwhite border border-gray-100 rounded-2xl text-[12px] font-bold text-text-main placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:bg-white transition-all resize-none leading-loose"
                       />
                    </div>

                    <button 
                      type="submit"
                      disabled={submitting || review.status === 'completed'}
                      className="w-full py-5 bg-text-main text-white font-black rounded-2xl hover:bg-mylms-purple shadow-2xl transition-all uppercase tracking-[0.4em] text-[11px] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 active:scale-95 group"
                    >
                       {submitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                          review.status === 'completed' ? <CheckCircle size={18} /> : <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                       )}
                       {submitting ? 'Transmitting Audit...' : (review.status === 'completed' ? 'Evaluation Archived' : 'Finalize Audit Transaction')}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
