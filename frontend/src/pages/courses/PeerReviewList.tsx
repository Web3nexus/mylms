import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface PeerReview {
  id: number;
  status: 'pending' | 'completed';
  submission: {
    assessment: {
      title: string;
    }
  };
  created_at: string;
}

export default function PeerReviewList() {
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await client.get('/peer-reviews/assigned', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-offwhite py-12 px-8 transition-all">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-mylms-purple/10 text-mylms-purple text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-mylms-purple/20">Peer Assessment Module</span>
                 <div className="h-px w-8 bg-gray-200"></div>
              </div>
              <h1 className="text-5xl font-black text-text-main tracking-tighter uppercase leading-none">Review Assignments</h1>
              <p className="text-text-secondary font-bold uppercase tracking-widest text-[9px] opacity-60">MyLMS Collaborative Evaluation Protocol</p>
           </div>

           <div className="bg-white border border-border-soft p-6 rounded-2xl shadow-sm flex items-center gap-6 group hover:border-mylms-purple/30 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black transition-all ${pendingCount > 0 ? 'bg-mylms-rose text-white animate-pulse' : 'bg-green-50 text-green-600'}`}>
                 {pendingCount}
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-main uppercase tracking-tight">Active Dispatches</p>
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pending Evaluation Items</p>
              </div>
           </div>
        </header>

        {reviews.length === 0 ? (
          <div className="bg-white border border-border-soft rounded-3xl p-20 text-center shadow-sm">
             <div className="w-20 h-20 bg-offwhite rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-8">
                <ClipboardCheck size={32} />
             </div>
             <h3 className="text-2xl font-black text-text-main tracking-tighter uppercase mb-4">Registry Clear</h3>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-10 max-w-md mx-auto leading-relaxed">
                No peer assessment dispatches have been allocated to your profile at this time.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.filter(r => r && r.submission && r.submission.assessment && r.submission.assessment.title).map((review) => (
              <Link 
                key={review.id}
                to={`/peer-reviews/${review.id}`}
                className="bg-white border border-border-soft rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-mylms-purple/30 transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-2 h-full ${review.status === 'pending' ? 'bg-mylms-rose opacity-40' : 'bg-green-400 opacity-40'}`}></div>
                
                <div className="flex justify-between items-start mb-10">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${review.status === 'pending' ? 'bg-mylms-rose/10 text-mylms-rose shadow-sm' : 'bg-green-50 text-green-600 shadow-sm'}`}>
                      {review.status === 'pending' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                   </div>
                   <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${review.status === 'pending' ? 'bg-mylms-rose/5 text-mylms-rose border-mylms-rose/20' : 'bg-green-50 text-green-600 border-green-100'}`}>
                      {review.status}
                   </span>
                </div>

                <h3 className="text-[13px] font-black text-text-main uppercase tracking-tighter leading-tight mb-4 group-hover:text-mylms-purple transition-colors">
                   {review.submission.assessment.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-8 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                   <span>Allocated: {new Date(review.created_at).toLocaleDateString()}</span>
                </div>

                <div className="pt-6 border-t border-offwhite flex items-center justify-between text-mylms-purple mt-auto">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                      {review.status === 'pending' ? 'Execute Review' : 'View Audit'}
                   </span>
                   <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}

        <footer className="mt-20 p-10 bg-mylms-purple/5 border border-mylms-purple/10 rounded-3xl flex gap-8 items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-mylms-purple/5 rounded-bl-full"></div>
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-mylms-purple shadow-sm shrink-0">
              <ShieldAlert size={24} />
           </div>
           <div>
              <h4 className="text-[12px] font-black text-mylms-purple uppercase tracking-[0.2em] mb-4">Academic Integrity Protocol</h4>
              <p className="text-[10px] font-bold text-text-main/70 uppercase tracking-widest leading-loose max-w-xl">
                 Perform your evaluations with precision and objectivity. All peer feedback tokens are archived and monitored for quality assurance and instructional consistency.
              </p>
           </div>
        </footer>
      </div>
    </div>
  );
}
