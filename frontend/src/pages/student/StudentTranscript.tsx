import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Printer, 
  ShieldCheck, 
  Layers,
  Bell,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Send,
  BookOpen,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useBranding } from '../../hooks/useBranding';
import { useNotificationStore } from '../../store/useNotificationStore';

interface CourseRecord {
  course_id: number;
  title: string;
  credits: number;
  grade: number | null;
  letter: string | null;
  points: number | null;
}

interface SemesterRecord {
  semester_id: number;
  semester_name: string;
  academic_session: string;
  courses: CourseRecord[];
  sgpa: number;
  total_credits: number;
}

interface TranscriptData {
  transcript: SemesterRecord[];
  cgpa: number;
  total_credits_earned: number;
}

const TABS = ['Grades', 'Degree Audit Report', 'Documents', 'Order Tracking'] as const;
type Tab = typeof TABS[number];

// Document request types supported
const DOC_TYPES = [
  { id: 'transcript', label: 'Official Transcript', icon: <FileText size={18} />, description: 'Certified academic record for institutions and employers.' },
  { id: 'enrollment_letter', label: 'Enrollment Verification', icon: <CheckCircle size={18} />, description: 'Official letter confirming current enrollment status.' },
  { id: 'grade_report', label: 'Grade Report', icon: <BarChart3 size={18} />, description: 'Current semester grade report for the student.' },
  { id: 'degree_certificate', label: 'Degree Certificate', icon: <BookOpen size={18} />, description: 'Copy of awarded degree certificate (graduates only).' },
];

export default function StudentTranscript() {
  const { branding } = useBranding();
  const { token, user } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const { notify } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<Tab>('Grades');
  const [data, setData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);

  // Document requests state
  const [docRequests, setDocRequests] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [submittingDoc, setSubmittingDoc] = useState<string | null>(null);

  useEffect(() => {
    fetchTranscript();
    fetchDocRequests();
  }, []);

  const fetchTranscript = async () => {
    try {
      const res = await client.get('/transcript', { headers });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocRequests = async () => {
    setLoadingDocs(true);
    try {
      const res = await client.get('/student/form-requests', { headers });
      setDocRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const requestDocument = async (type: string) => {
    setSubmittingDoc(type);
    try {
      await client.post('/student/form-requests', { type: 'transcript', notes: `Document request: ${type}` }, { headers });
      notify('Document request submitted. Processing within 3-5 business days.', 'success');
      fetchDocRequests();
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to submit request.', 'error');
    } finally {
      setSubmittingDoc(null);
    }
  };

  const handleDownloadTranscript = async () => {
    try {
      const response = await client.get('/transcript/download', {
        headers,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Official_Transcript_${user?.name || 'Student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      notify('Transcript downloaded successfully.', 'success');
    } catch (err) {
      notify('Failed to generate transcript. Please try again.', 'error');
    }
  };

  // Dynamic GPA chart from real semester data
  const chartBars = data?.transcript?.map(t => ({ label: t.semester_name, value: t.sgpa })) ?? [];
  const maxSgpa = Math.max(...chartBars.map(b => b.value), 4);

  const countPassed = (courses: CourseRecord[]) =>
    courses.filter(c => c.letter !== null && c.letter !== 'F').length;

  // Degree audit: % completion based on credits
  const creditGoal = 120;
  const creditsEarned = data?.total_credits_earned ?? 0;
  const degreeProgress = Math.min((creditsEarned / creditGoal) * 100, 100);

  const STATUS_COLOR: Record<string, string> = {
    processed: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Loading Academic Record...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
         <div className="flex flex-col gap-1">
            {branding?.logo_url ? (
              <div className="h-10 overflow-hidden shrink-0 transition-all flex items-center mb-2">
                <img src={branding.logo_url} className="h-full w-auto object-contain" alt="Logo" />
              </div>
            ) : (
              <h1 className="text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight">
                {branding?.institutional_name || import.meta.env.VITE_APP_NAME || 'Institution'}
              </h1>
            )}
            <h2 className="text-xl font-serif font-black text-text-secondary uppercase tracking-tight opacity-40">Academic Progress</h2>
         </div>
         <div className="flex gap-4">
            <button className="p-3 rounded-lg bg-white border border-border-soft text-mylms-purple transition-all shadow-sm hover:shadow-md">
               <Bell size={18} />
            </button>
            <button className="p-3 rounded-lg bg-white border border-border-soft text-mylms-purple transition-all shadow-sm hover:shadow-md">
               <Layers size={18} />
            </button>
         </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-border-soft mb-12 overflow-x-auto no-scrollbar">
         {TABS.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'text-mylms-rose border-b-2 border-mylms-rose' : 'text-gray-400 hover:text-mylms-purple'}`}
            >
               {tab}
            </button>
         ))}
      </div>

      {/* ─── GRADES TAB ─────────────────────────────────── */}
      {activeTab === 'Grades' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-10 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10 border-b border-border-soft pb-6">
                       <p className="text-[11px] font-black text-text-main uppercase tracking-tight">
                         Institutional ID: <span className="text-mylms-purple">{user?.student_id || '—'}</span>
                       </p>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                         {data?.transcript?.[0]?.academic_session || 'Academic Registry'}
                       </p>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                       <div className="p-8 text-center border-r border-border-soft">
                          <p className="text-5xl font-serif font-black text-mylms-purple mb-4">{data?.total_credits_earned ?? '—'}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Credits Earned</p>
                       </div>
                       <div className="p-8 text-center border-r border-border-soft">
                          <p className="text-5xl font-serif font-black text-mylms-purple mb-4">
                            {data?.cgpa != null ? data.cgpa.toFixed(2) : '—'}
                          </p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cumulative GPA</p>
                       </div>
                       <div className="p-8 text-center">
                          <p className="text-5xl font-serif font-black text-mylms-purple mb-4">
                            {data?.transcript ? data.transcript.reduce((s,t) => s + countPassed(t.courses), 0) : '—'}
                          </p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Courses Passed</p>
                       </div>
                    </div>
                </div>
             </div>

             {/* GPA Trend */}
             <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-10">
                <h4 className="text-[11px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <TrendingUp size={14} className="text-mylms-rose" /> GPA Trend
                </h4>
                {chartBars.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-[10px] text-gray-300 font-black uppercase tracking-widest">No Data Yet</div>
                ) : (
                  <>
                    <div className="h-48 flex items-end justify-around gap-4 px-4 pb-4 border-b border-l border-border-soft">
                       {chartBars.map((bar, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[9px] font-bold text-gray-500">{bar.value.toFixed(2)}</span>
                            <div className="w-full rounded-t-lg bg-mylms-purple hover:bg-mylms-rose transition-all" style={{ height: `${(bar.value / maxSgpa) * 100}%` }} />
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest mt-4">
                       {chartBars.map((bar, i) => <span key={i}>{bar.label}</span>)}
                    </div>
                  </>
                )}
             </div>
          </div>

          {/* Grade Ledger */}
          <div className="space-y-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight">Grades</h2>
                <button onClick={handleDownloadTranscript} className="text-[10px] font-black text-mylms-rose uppercase tracking-widest flex items-center gap-2 hover:bg-mylms-rose/5 px-4 py-2 rounded-lg transition-all">
                   <Printer size={14} /> Download Official Transcript
                </button>
             </div>

             <select className="bg-white border border-border-soft rounded-lg px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm mb-10 w-full lg:w-96">
                <option>All Academic Sessions</option>
                {data?.transcript?.map((t, i) => (
                  <option key={i} value={t.semester_id}>{t.semester_name} — {t.academic_session}</option>
                ))}
             </select>

             {!data || data.transcript.length === 0 ? (
                <div className="py-24 text-center bg-offwhite border border-border-soft rounded-2xl">
                   <Layers size={40} className="text-gray-200 mx-auto mb-6 opacity-50" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No performance records available yet</p>
                </div>
             ) : (
                data.transcript.map((term, i) => (
                   <div key={i} className="bg-offwhite rounded-2xl border border-border-soft overflow-hidden shadow-sm">
                      <div className="p-8 border-b border-border-soft">
                         <h3 className="text-sm font-black text-mylms-purple uppercase tracking-tight mb-6">{term.semester_name} - {term.academic_session}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">GPA per Term</p><p className="text-xl font-serif font-black text-text-main">{term.sgpa.toFixed(2)}</p></div>
                            <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Credits</p><p className="text-xl font-serif font-black text-text-main">{term.total_credits}</p></div>
                            <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Passed</p><p className="text-xl font-serif font-black text-text-main">{countPassed(term.courses)} of {term.courses.length}</p></div>
                         </div>
                      </div>
                      <div className="p-8 bg-white space-y-4">
                         {term.courses.map((course, j) => (
                            <div key={j} className="p-6 border border-border-soft rounded-xl flex justify-between items-center hover:border-mylms-purple/20 transition-all">
                               <div>
                                  <h4 className="text-sm font-black text-text-main uppercase tracking-tight">{course?.title}</h4>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {course.course_id}</p>
                               </div>
                               <div className="flex items-center gap-10">
                                  <div className="text-center"><p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Credits</p><p className="text-sm font-black text-mylms-purple">{course.credits}</p></div>
                                  <div className="text-right"><p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Grade</p>
                                    <div className={`text-lg font-black ${course.letter === 'F' ? 'text-mylms-rose' : 'text-green-600'}`}>
                                      {course.grade !== null ? `${course.grade} / ${course.letter || 'P'}` : 'N/A'}
                                    </div>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                ))
             )}
          </div>
        </>
      )}

      {/* ─── DEGREE AUDIT REPORT ────────────────────────── */}
      {activeTab === 'Degree Audit Report' && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-10">
            <h3 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight mb-2">Degree Audit Report</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10">Credit completion progress towards your degree requirements.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="p-8 bg-mylms-purple text-white rounded-2xl text-center shadow-lg">
                <p className="text-4xl font-serif font-black mb-2">{creditsEarned}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Credits Earned</p>
              </div>
              <div className="p-8 bg-offwhite border border-border-soft rounded-2xl text-center">
                <p className="text-4xl font-serif font-black text-text-main mb-2">{creditGoal - creditsEarned}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Credits Remaining</p>
              </div>
              <div className="p-8 bg-offwhite border border-border-soft rounded-2xl text-center">
                <p className="text-4xl font-serif font-black text-mylms-rose mb-2">{degreeProgress.toFixed(0)}%</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Completion</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                <span>Degree Progress</span><span className="text-mylms-purple">{degreeProgress.toFixed(0)}% of {creditGoal} credits</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-mylms-purple to-mylms-rose rounded-full transition-all duration-1000" style={{ width: `${degreeProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Per-term breakdown */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border-soft">
              <h4 className="text-sm font-black text-mylms-purple uppercase tracking-tight">Term-by-Term Breakdown</h4>
            </div>
            {!data || data.transcript.length === 0 ? (
              <div className="py-16 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No records yet</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-offwhite text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-4 text-left">Term</th>
                    <th className="px-8 py-4 text-left">SGPA</th>
                    <th className="px-8 py-4 text-left">Credits</th>
                    <th className="px-8 py-4 text-left">Passed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {data.transcript.map((term, i) => (
                    <tr key={i} className="hover:bg-offwhite/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-black text-text-main uppercase">{term.semester_name} — {term.academic_session}</td>
                      <td className="px-8 py-5 text-sm font-black text-mylms-purple">{term.sgpa.toFixed(2)}</td>
                      <td className="px-8 py-5 text-sm font-black text-text-secondary">{term.total_credits}</td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${countPassed(term.courses) === term.courses.length ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {countPassed(term.courses)} / {term.courses.length}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── DOCUMENTS TAB ──────────────────────────────── */}
      {activeTab === 'Documents' && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight mb-2">Request Official Documents</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Select the document you need. Processed within 3–5 academic registry cycles.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DOC_TYPES.map(doc => (
                <div key={doc.id} className="bg-white border border-border-soft rounded-2xl p-8 flex items-start gap-6 group hover:border-mylms-purple/20 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-mylms-purple/10 text-mylms-purple rounded-xl flex items-center justify-center shrink-0 group-hover:bg-mylms-purple group-hover:text-white transition-all">
                    {doc.icon}
                  </div>
                  <div className="grow">
                    <h4 className="text-sm font-black text-text-main uppercase tracking-tight mb-2">{doc.label}</h4>
                    <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed mb-4">{doc.description}</p>
                    <button
                      onClick={() => requestDocument(doc.id)}
                      disabled={submittingDoc === doc.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-mylms-purple text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-mylms-purple/90 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                    >
                      <Send size={12} />
                      {submittingDoc === doc.id ? 'Requesting...' : 'Request Document'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── ORDER TRACKING TAB ─────────────────────────── */}
      {activeTab === 'Order Tracking' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight mb-2">Order Tracking</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Track all your document requests and their current processing status.</p>
          </div>

          {loadingDocs ? (
            <div className="py-16 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">Loading orders...</div>
          ) : docRequests.length === 0 ? (
            <div className="py-24 text-center bg-offwhite border border-border-soft rounded-2xl">
              <Upload size={40} className="text-gray-200 mx-auto mb-6" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">No document requests submitted yet</p>
              <button onClick={() => setActiveTab('Documents')} className="text-[9px] font-black text-mylms-rose uppercase tracking-widest border border-mylms-rose/20 px-6 py-3 rounded-lg hover:bg-mylms-rose/5 transition-all">
                Request a Document
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {docRequests.map((req: any) => (
                <div key={req.id} className="bg-white border border-border-soft rounded-2xl p-8 flex items-center justify-between gap-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-offwhite border border-border-soft rounded-xl flex items-center justify-center">
                      {req.status === 'processed' ? <CheckCircle size={20} className="text-green-500" /> :
                       req.status === 'rejected'  ? <AlertCircle size={20} className="text-red-500" /> :
                       <Clock size={20} className="text-amber-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-main uppercase tracking-tight">{req.type?.replace(/-/g, ' ')}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{req.reference}</p>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest border-l border-gray-100 pl-4">{new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      {req.notes && <p className="text-[9px] text-gray-400 mt-2 max-w-sm">{req.notes}</p>}
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${STATUS_COLOR[req.status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="mt-20 p-10 bg-mylms-purple/5 border border-mylms-purple/10 rounded-2xl flex flex-col items-center text-center max-w-3xl mx-auto">
         <ShieldCheck size={32} className="text-mylms-rose mb-6" />
         <p className="text-[11px] font-bold text-text-secondary leading-loose uppercase tracking-widest mb-8">
            All academic records are certified by {branding?.institutional_name || 'the institution'}. 
            Official transcripts can be downloaded or requested through the Registry Hub.
         </p>
         <button onClick={handleDownloadTranscript} className="btn-minimal px-10 py-4 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-2">
           <Printer size={14} /> Download Official Transcript
         </button>
      </div>

    </div>
  );
}
