import { useState, useEffect } from 'react';
import { Award, Briefcase, Calendar, Info, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function StudentScholarship() {
  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchScholarship();
  }, []);

  const fetchScholarship = async () => {
    try {
      const res = await client.get('/student/my-scholarship', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScholarship(res.data.scholarship);
    } catch (err) {
      console.error('Error fetching student scholarship:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-mylms-purple font-black uppercase tracking-widest text-[9px]">Fetching Award Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-8">
      <div className="mb-12 border-b border-border-soft pb-8">
        <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
          <Award size={16} className="opacity-50" />
          Financial Aid Office
        </div>
        <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">My Scholarship</h1>
        <p className="text-text-secondary text-xs font-black uppercase tracking-widest opacity-60 italic mt-3">Personal Academic Funding Profile</p>
      </div>

      {scholarship ? (
        <div className="bg-white border-2 border-mylms-purple rounded-[40px] shadow-2xl p-12 relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mylms-purple/5 rounded-bl-full pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 text-mylms-purple/10 pointer-events-none">
            <Award size={200} />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Awarding Provider</p>
                <h3 className="text-xl font-black text-mylms-purple uppercase tracking-tight flex items-center gap-2">
                  <Briefcase size={20} /> {scholarship.provider || 'Institutional Grant'}
                </h3>
              </div>
              <div className="bg-green-50 text-green-700 px-6 py-2 rounded-xl border border-green-200 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest">Active Award</span>
              </div>
            </div>

            <h2 className="text-5xl font-black text-text-main tracking-tighter uppercase mb-6 leading-none">{scholarship.title}</h2>

            <div className="flex items-baseline gap-4 mb-10 pb-10 border-b border-border-soft">
              <span className="text-6xl text-mylms-rose font-bold">
                {scholarship.amount ? `${scholarship.currency === 'USD' ? '$' : scholarship.currency}${Number(scholarship.amount).toLocaleString()}` : 'FULL RIDE'}
              </span>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Allocated Funds</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div>
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Info size={14} className="text-mylms-purple" />
                  Award Description
                </h4>
                <p className="text-sm font-medium text-text-secondary leading-relaxed">{scholarship.description}</p>
              </div>
              <div className="space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4 flex items-center gap-2">
                      <Calendar size={14} className="text-mylms-rose" />
                      Award Date
                    </h4>
                    <p className="text-lg font-black text-text-main uppercase">{new Date(scholarship.created_at).toLocaleDateString()}</p>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4 flex items-center gap-2">
                      <Award size={14} className="text-green-600" />
                      Recipient
                    </h4>
                    <p className="text-lg font-black text-text-main uppercase">{user?.name}</p>
                 </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
              <AlertCircle size={24} className="text-amber-500 shrink-0" />
              <div>
                <h5 className="text-sm font-black text-amber-800 uppercase tracking-tight mb-1">Maintenance Requirements</h5>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  This scholarship requires you to maintain a minimum GPA as specified by the academic senate. Your progress will be reviewed at the end of each academic year to determine renewal eligibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 px-8 bg-white border-2 border-dashed border-border-soft rounded-3xl animate-in fade-in">
          <Award size={64} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-2xl font-black text-text-main uppercase tracking-tight mb-4">No Active Scholarship</h3>
          <p className="text-gray-500 font-medium max-w-md mx-auto mb-10">
            You currently do not have any active institutional scholarships or grants applied to your student profile.
          </p>
          <Link 
            to="/scholarships" 
            className="inline-flex items-center gap-2 bg-mylms-purple text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl"
          >
            Browse Available Scholarships <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
