import { useState, useEffect } from 'react';
import { 
  Inbox, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Search, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Download,
  Eye,
  TrendingUp,
  Layers,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useAppConfig } from '../../hooks/useAppConfig';

interface Application {
  id: number;
  user: { name: string; email: string; student_id?: string | null };
  program: { name: string };
  faculty?: { name: string };
  instructor?: { name: string };
  status: string;
  personal_statement: string;
  form_data: any;
  documents: Record<string, string>;
  submitted_at: string;
  review_notes?: string;
}

export default function AdmissionsReview() {
  const { appName } = useAppConfig();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [activeDataTab, setActiveDataTab] = useState<'personal' | 'contact' | 'academic' | 'financial'>('personal');
  
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await client.get('/admissions/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: number, status: 'approved' | 'rejected' | 'review') => {
    try {
      await client.post(`/admissions/applications/${id}/review`, {
        status,
        review_notes: reviewNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewNote('');
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[11px]">Syncing Admissions Registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Admissions Header Area */}
      <div className="mb-12 border-b border-border-soft pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[11px]">
               <Inbox className="opacity-50" size={20} />
               Admissions Management Office
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Review Registry</h1>
            <p className="text-text-secondary font-bold text-xs uppercase tracking-widest mt-4">Matriculation protocol for academic candidates.</p>
         </div>
         <div className="bg-white px-8 py-6 rounded-xl border border-border-soft shadow-sm flex items-center gap-6 group">
            <div className="w-12 h-12 bg-offwhite rounded-lg flex items-center justify-center text-mylms-rose shadow-inner group-hover:scale-110 transition-transform border border-border-soft">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Decision Inbox</p>
               <p className="text-2xl font-black text-text-main uppercase tracking-tight">
                 {applications.filter(a => a.status === 'pending' || a.status === 'review').length} Pending
               </p>
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Applicants Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] mb-10 px-2">Decision Queue</h3>
          
          <div className="space-y-4">
            {applications.map(app => (
              <button 
                key={app.id} 
                onClick={() => setSelectedApp(app)}
                className={`w-full text-left p-6 rounded-xl border transition-all flex justify-between items-center group relative overflow-hidden ${selectedApp?.id === app.id ? 'bg-offwhite border-mylms-purple shadow-md translate-x-2' : 'bg-white border-border-soft hover:border-mylms-purple/20 text-text-secondary shadow-sm'}`}
              >
                <div className="relative z-10">
                  <p className="font-black text-sm uppercase tracking-tight text-text-main group-hover:text-mylms-purple transition-colors">{app.user?.name}</p>
                  <p className={`text-[11px] font-black uppercase mt-2 tracking-widest ${selectedApp?.id === app.id ? 'text-mylms-rose' : 'text-gray-300'}`}>{app.program.name}</p>
                  {app.user.student_id && <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-2 font-mono">ID: {app.user.student_id}</p>}
                </div>
                <div className="flex items-center gap-4 relative z-10">
                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm border ${
                     app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                     app.status === 'rejected' ? 'bg-mylms-rose/5 text-mylms-rose border-mylms-rose/20' :
                     'bg-amber-50 text-amber-500 border-amber-100'
                   }`}>{app.status}</span>
                   <ChevronRight size={18} className={`${selectedApp?.id === app.id ? 'text-mylms-purple' : 'text-gray-200 group-hover:text-gray-400'} transition-all`} />
                </div>
              </button>
            ))}
            
            {applications.length === 0 && (
              <div className="p-20 text-center bg-white border-2 border-dashed border-border-soft rounded-2xl opacity-60">
                 <Search size={40} className="mx-auto text-gray-100 mb-8" />
                 <p className="text-gray-400 font-black text-[11px] uppercase tracking-[0.4em] leading-loose">{appName} registry is currently empty.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Application Review */}
        <div className="lg:w-2/3">
          {selectedApp ? (
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-12 relative overflow-hidden transition-all group border-t-8 border-t-mylms-purple">
               <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
               
               <div className="flex justify-between items-start mb-12 border-b border-border-soft pb-10 relative z-10">
                  <div className="flex items-start gap-8">
                     <div className="w-20 h-20 bg-offwhite rounded-2xl flex items-center justify-center border border-border-soft shadow-inner font-display font-black text-3xl text-mylms-purple">
                        {selectedApp.user?.name.charAt(0)}
                     </div>
                     <div>
                        <h2 className="text-4xl font-black text-text-main tracking-tighter uppercase mb-4 leading-none">{selectedApp.user?.name}</h2>
                         <div className="flex items-center gap-4 flex-wrap">
                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg border shadow-sm ${
                              selectedApp.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                              selectedApp.status === 'rejected' ? 'bg-mylms-rose/5 text-mylms-rose border-mylms-rose/20' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>{selectedApp.status.toUpperCase()}</span>
                            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest pl-2">{selectedApp.user?.email}</p>
                         </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em] mb-4 flex items-center justify-end gap-2">
                        <Clock size={16} />
                        Submission
                     </p>
                     <p className="text-lg font-black text-text-main font-mono tracking-tighter">{new Date(selectedApp.submitted_at).toLocaleDateString()}</p>
                  </div>
               </div>

               {/* Profile Quick Stats */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
                  <div className="p-6 bg-offwhite rounded-xl border border-border-soft">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Authorized Faculty</p>
                     <p className="text-sm font-black text-text-main uppercase">{selectedApp.faculty?.name || 'N/A'}</p>
                  </div>
                  <div className="p-6 bg-offwhite rounded-xl border border-border-soft">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Academic Advisor</p>
                     <p className="text-sm font-black text-text-main uppercase">{selectedApp.instructor?.name || 'Unassigned'}</p>
                  </div>
                  <div className="p-6 bg-offwhite rounded-xl border border-border-soft">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Program</p>
                     <p className="text-sm font-black text-text-main uppercase">{selectedApp.program.name}</p>
                  </div>
               </div>

               {/* Data Tabs */}
               <div className="flex gap-8 border-b border-offwhite mb-10 relative z-10">
                   {(['personal', 'contact', 'academic', 'financial'] as const).map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveDataTab(tab)}
                        className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeDataTab === tab ? 'border-mylms-purple text-mylms-purple' : 'border-transparent text-gray-300 hover:text-text-main'}`}
                     >
                        {tab === 'personal' && <User size={14} />}
                        {tab === 'contact' && <Mail size={14} />}
                        {tab === 'academic' && <GraduationCap size={14} />}
                        {tab === 'financial' && <Briefcase size={14} />}
                        {tab}
                     </button>
                   ))}
               </div>

               {/* Dynamic Form Data Display */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-10 animate-in fade-in duration-300">
                   {selectedApp.form_data && Object.keys(selectedApp.form_data).length > 0 ? (
                      Object.keys(selectedApp.form_data).map(key => (
                         // Filtering by keyword as category isn't stored in results, only keys.
                         // This is a simple fallback logic for better UX.
                         <div key={key} className="p-6 bg-offwhite/50 border border-border-soft rounded-xl shadow-sm hover:shadow-md transition-all">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{key.replace(/_/g, ' ')}</p>
                            <p className="text-sm font-bold text-text-main uppercase">{selectedApp.form_data[key]}</p>
                         </div>
                      ))
                   ) : (
                      <div className="col-span-full py-10 text-center text-gray-200 uppercase tracking-widest font-black text-[10px]">No dynamic protocol data found.</div>
                   )}
               </div>

               <div className="mb-16 relative z-10">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 pl-1">
                     <FileText size={18} className="text-mylms-purple opacity-50" />
                     Personal Candidacy Statement
                  </p>
                  <div className="p-10 bg-offwhite border-l-8 border-mylms-purple rounded-r-2xl text-text-main leading-loose font-bold text-sm uppercase shadow-inner tracking-tight">
                     "{selectedApp.personal_statement}"
                  </div>
               </div>

               <div className="border-t border-border-soft pt-12 relative z-10">
                  <label className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 pl-1">
                     <ShieldCheck size={18} className="text-mylms-rose" />
                     Academic Committee Evaluation
                  </label>
                  <textarea 
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                    className="w-full p-8 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-black text-text-main leading-relaxed min-h-[160px] mb-12 text-sm shadow-inner transition-all placeholder:text-gray-200 uppercase"
                    placeholder="Provide formal findings regarding candidate eligibility..."
                  />
                  
                  <div className="flex gap-4">
                     <button 
                      onClick={() => handleReview(selectedApp.id, 'approved')}
                      className="grow py-6 bg-mylms-purple text-white font-black rounded-full hover:bg-mylms-purple/90 shadow-xl transition-all uppercase tracking-[0.3em] text-xs active:scale-95 flex items-center justify-center gap-4"
                     >
                       <CheckCircle size={20} />
                       Commit Admission
                     </button>
                     <button 
                      onClick={() => handleReview(selectedApp.id, 'rejected')}
                      className="py-6 px-12 bg-white border border-border-soft text-mylms-rose font-black rounded-full hover:bg-offwhite transition-all uppercase tracking-[0.3em] text-xs active:scale-95 flex items-center gap-4 shadow-sm"
                     >
                       <XCircle size={20} />
                       Reject Profile
                     </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-40 bg-white rounded-3xl border-2 border-dashed border-border-soft text-center shadow-inner opacity-60">
               <div className="w-24 h-24 bg-offwhite rounded-full flex items-center justify-center mb-12 text-mylms-purple shadow-inner border border-border-soft">
                  <Inbox size={48} className="opacity-20" />
               </div>
               <p className="text-text-secondary font-black text-xs uppercase tracking-[0.4em] leading-loose max-w-xs px-10">Select a candidate from the queue to initiate protocol.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
