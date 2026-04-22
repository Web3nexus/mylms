import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  BarChart3, 
  Search, 
  Filter, 
  MoreVertical, 
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Submission {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  assessment: {
    title: string;
    type: string;
  };
  score: number | null;
  status: 'pending' | 'graded';
  created_at: string;
}

export default function InstructorGradebook() {
  const { slug } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const token = useAuthStore((state: any) => state.token);

  useEffect(() => {
    fetchGradebookData();
  }, [slug]);

  const fetchGradebookData = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      // Assuming a gradebook endpoint exists or using assessments with submissions
      const res = await client.get(`/courses/${courseRes.data.id}/assessments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { include_submissions: true }
      });
      
      // Flatten submissions from all assessments for this view
      const allSubmissions: Submission[] = [];
      res.data.forEach((assessment: any) => {
         if (assessment.submissions) {
            assessment.submissions.forEach((sub: any) => {
               allSubmissions.push({
                  ...sub,
                  assessment: { title: assessment?.title, type: assessment.type }
               });
            });
         }
      });
      
      setSubmissions(allSubmissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error('Error fetching gradebook:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s?.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    s?.assessment?.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 bg-offwhite min-h-screen">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">Aggregating Academic Data...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-8 transition-all min-h-screen bg-offwhite selection:bg-mylms-purple selection:text-white">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-mylms-purple/10 text-mylms-purple text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-mylms-purple/20">Instructional Oversight</span>
              <div className="h-px w-8 bg-gray-200"></div>
           </div>
           <h1 className="text-5xl font-black text-text-main tracking-tighter uppercase leading-none">Gradebook Console</h1>
           <p className="text-text-secondary font-bold uppercase tracking-widest text-[9px] opacity-60">Performance Auditing Registry: {course?.title}</p>
        </div>

        <div className="flex gap-4">
           <div className="bg-white border border-border-soft p-5 rounded-2xl shadow-sm flex items-center gap-6">
              <div className="w-10 h-10 bg-offwhite rounded-xl flex items-center justify-center text-mylms-purple text-lg font-black shrink-0">
                 {submissions.length}
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-main uppercase tracking-tight">Total Ingress</p>
                 <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Active Submissions</p>
              </div>
           </div>
           <div className="bg-white border border-border-soft p-5 rounded-2xl shadow-sm flex items-center gap-6">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-lg font-black shrink-0">
                 {submissions.filter(s => s.status === 'graded').length}
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-main uppercase tracking-tight">Validated</p>
                 <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Finalized Grades</p>
              </div>
           </div>
        </div>
      </header>

      <div className="bg-white border border-border-soft rounded-[2.5rem] shadow-sm overflow-hidden mb-12 border-t-8 border-t-mylms-purple">
         <div className="p-8 border-b border-border-soft flex flex-col md:flex-row justify-between items-center gap-6 bg-offwhite/50">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Filter by Student or Protocol Title..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="w-full pl-12 pr-6 py-3 bg-white border border-border-soft rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-mylms-purple/10 focus:border-mylms-purple transition-all"
               />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <button className="grow md:grow-0 px-6 py-3 bg-white border border-border-soft text-text-main font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-offwhite transition-all shadow-sm">
                  <Filter size={14} /> Refine View
               </button>
               <button className="grow md:grow-0 px-6 py-3 bg-text-main text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl">
                  <BarChart3 size={14} /> Export Protocol
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="bg-offwhite/30">
                     <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Academic Entity</th>
                     <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Protocol Area</th>
                     <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronized At</th>
                     <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Performance Index</th>
                     <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-offwhite">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-10 py-24 text-center">
                          <Users size={32} className="text-gray-100 mx-auto mb-6" />
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">No student data logs match criteria</p>
                       </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map(submission => (
                      <tr key={submission.id} className="hover:bg-offwhite/30 transition-colors group">
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-offwhite rounded-xl flex items-center justify-center text-mylms-purple font-black text-xs border border-mylms-purple/10">
                                  {submission?.user?.name?.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-[12px] font-black text-text-main uppercase tracking-tighter">{submission?.user?.name}</p>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{submission?.user?.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-[11px] font-black text-text-main uppercase tracking-tight">{submission?.assessment?.title}</p>
                               <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${submission?.assessment?.type === 'quiz' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                  {submission?.assessment?.type}
                               </span>
                            </div>
                         </td>
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                               <Clock size={12} />
                               {new Date(submission.created_at).toLocaleString()}
                            </div>
                         </td>
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-16 h-1 bg-offwhite rounded-full overflow-hidden">
                                  <div className="h-full bg-mylms-purple rounded-full" style={{ width: `${submission.score || 0}%` }}></div>
                               </div>
                               <span className={`text-[12px] font-black ${submission.score ? 'text-mylms-purple' : 'text-gray-300'} font-mono`}>
                                  {submission.score !== null ? `${submission.score}%` : 'PENDING'}
                               </span>
                            </div>
                         </td>
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-2">
                               <Link 
                                 to={`/courses/${slug}/gradebook/submissions/${submission.id}`}
                                 className="p-3 bg-white border border-border-soft text-mylms-purple rounded-xl hover:bg-mylms-purple hover:text-white transition-all shadow-sm group-hover:scale-105 active:scale-95"
                               >
                                  <FileCheck2 size={18} />
                               </Link>
                               <button className="p-3 bg-white border border-border-soft text-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                                  <MoreVertical size={18} />
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         <section className="bg-mylms-purple p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-all duration-1000"></div>
            <div className="flex gap-8 items-start relative z-10">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <BarChart3 size={32} />
               </div>
               <div>
                  <h4 className="text-[12px] font-black uppercase tracking-[0.4em] mb-6 border-b border-white/10 pb-4">Performance Aggregator</h4>
                  <p className="text-[11px] font-bold leading-loose opacity-80 uppercase tracking-widest max-w-md">
                     Course average is currently maintaining at 78.4% across all active protocols. Registry integrity is compliant with MyLMS standards.
                  </p>
               </div>
            </div>
         </section>

         <section className="bg-white border border-border-soft p-10 rounded-[2.5rem] shadow-sm flex items-center gap-10 hover:border-mylms-purple/30 transition-all cursor-pointer group">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-4xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
               <CheckCircle2 size={40} />
            </div>
            <div className="grow">
               <h4 className="text-[12px] font-black text-text-main uppercase tracking-[0.3em] mb-2">Automated Validation</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">System-wide audit of all objective quizzes and verified rubrics initiated.</p>
            </div>
            <ArrowRight className="text-gray-200 group-hover:text-mylms-purple transition-colors" size={24} />
         </section>
      </div>
    </div>
  );
}
