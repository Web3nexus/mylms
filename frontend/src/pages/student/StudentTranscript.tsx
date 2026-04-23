import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Printer, 
  ShieldCheck, 
  Layers,
  Bell
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

export default function StudentTranscript() {
  const { branding } = useBranding();
  const { token, user } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const { notify } = useNotificationStore();

  const [data, setData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranscript();
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
    } catch (err) {
      console.error('Failed to download transcript:', err);
      notify('Institutional Registry: Failed to generate your official transcript at this time.', 'error');
    }
  };

  // Compute dynamic GPA chart bars from real semester data
  const chartBars = data?.transcript?.map(t => ({ label: t.semester_name, value: t.sgpa })) ?? [];
  const maxSgpa = Math.max(...chartBars.map(b => b.value), 4);

  // Dynamically count passed courses
  const countPassed = (courses: CourseRecord[]) =>
    courses.filter(c => c.letter !== null && c.letter !== 'F').length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Generating Official Transcript...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      {/* Header Utilities */}
      <div className="flex justify-between items-center mb-10">
         <div className="flex flex-col gap-1">
            {branding?.logo_url ? (
              <div className="h-10 overflow-hidden shrink-0 transition-all flex items-center mb-2">
                <img src={branding.logo_url} className="h-full w-auto object-contain" alt="Logo" />
              </div>
            ) : (
              <h1 className="text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight">{branding?.institutional_name || 'MyLMS'}</h1>
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
         {["Grades", "Degree Audit Report", "Documents", "Order Tracking"].map((tab, i) => (
            <button key={tab} className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'text-mylms-rose border-b-2 border-mylms-rose' : 'text-gray-400 hover:text-mylms-purple'}`}>
               {tab}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
         {/* Main Summary Metrics */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-10 relative overflow-hidden">
                <div className="flex justify-between items-center mb-10 border-b border-border-soft pb-6">
                   <div className="flex items-center gap-3">
                      <p className="text-[11px] font-black text-text-main uppercase tracking-tight">Institutional ID: <span className="text-mylms-purple">{user?.student_id || '—'}</span></p>
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                     {data?.transcript?.[0]?.academic_session || 'Academic Registry'}
                   </p>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                   <div className="p-8 text-center border-r border-border-soft relative group">
                      <p className="text-5xl font-serif font-black text-mylms-purple mb-4">
                        {data?.total_credits_earned ?? '—'}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Credits Earned</p>
                   </div>
                   <div className="p-8 text-center border-r border-border-soft relative">
                      <p className="text-5xl font-serif font-black text-mylms-purple mb-4">
                        {data?.cgpa != null ? data.cgpa.toFixed(2) : '—'}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cumulative GPA</p>
                   </div>
                   <div className="p-8 text-center relative">
                      <p className="text-5xl font-serif font-black text-mylms-purple mb-4">
                        {data?.transcript ? data.transcript.reduce((sum, t) => sum + countPassed(t.courses), 0) : '—'}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Courses Passed</p>
                   </div>
                </div>
            </div>
         </div>

         {/* GPA Trend Chart — Dynamic */}
         <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-10">
            <h4 className="text-[11px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-6">GPA Trend</h4>
            {chartBars.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-[10px] text-gray-300 font-black uppercase tracking-widest">No Data Yet</div>
            ) : (
              <>
                <div className="h-48 flex items-end justify-around gap-4 px-4 pb-4 border-b border-l border-border-soft">
                   {chartBars.map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-[9px] font-bold text-gray-500">{bar.value.toFixed(2)}</span>
                        <div
                          className="w-full rounded-t-lg bg-mylms-purple hover:bg-mylms-rose transition-all"
                          style={{ height: `${(bar.value / maxSgpa) * 100}%` }}
                        />
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

      {/* Grade Ledger Detail */}
      <div className="space-y-8">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight">Grades</h2>
            <button 
              onClick={handleDownloadTranscript}
              className="text-[10px] font-black text-mylms-rose uppercase tracking-widest flex items-center gap-2 hover:bg-mylms-rose/5 px-4 py-2 rounded-lg transition-all"
            >
               <Printer size={14} /> Download Official Transcript
            </button>
         </div>

         <select className="bg-white border border-border-soft rounded-lg px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm mb-10 w-full lg:w-96">
            <option>All Academic Sessions</option>
            {data?.transcript?.map((t, i) => (
              <option key={i} value={t.semester_id}>{t.semester_name} — {t.academic_session}</option>
            ))}
         </select>

         {/* Term Accordions */}
         {!data || data.transcript.length === 0 ? (
            <div className="py-24 text-center bg-offwhite border border-border-soft rounded-2xl">
               <Layers size={40} className="text-gray-200 mx-auto mb-6 opacity-50" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active performance records identified</p>
            </div>
         ) : (
            data.transcript.map((term, i) => (
               <div key={i} className="bg-offwhite rounded-2xl border border-border-soft overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-border-soft group cursor-pointer hover:bg-white transition-all">
                     <h3 className="text-sm font-black text-mylms-purple uppercase tracking-tight mb-6">
                        {term.semester_name} - {term.academic_session}
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">GPA per Term</p>
                           <p className="text-xl font-serif font-black text-text-main">{term.sgpa.toFixed(2)}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Credits Earned</p>
                           <p className="text-xl font-serif font-black text-text-main">{term.total_credits}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Courses Passed</p>
                           <p className="text-xl font-serif font-black text-text-main">{countPassed(term.courses)} of {term.courses.length}</p>
                        </div>
                     </div>
                  </div>
                  
                  {/* Course Details List */}
                  <div className="p-8 bg-white space-y-4">
                     {term.courses.map((course, j) => (
                        <div key={j} className="p-6 border border-border-soft rounded-xl flex justify-between items-center group hover:border-mylms-purple/20 transition-all">
                           <div>
                              <h4 className="text-sm font-black text-text-main uppercase tracking-tight">{course?.title}</h4>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">CRS-ID: {course.course_id}</p>
                           </div>
                           <div className="flex items-center gap-10">
                              <div className="text-center">
                                 <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Weight</p>
                                 <p className="text-sm font-black text-mylms-purple">{course.credits}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Grade</p>
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

      {/* Registry Support Disclaimer */}
      <div className="mt-20 p-10 bg-mylms-purple/5 border border-mylms-purple/10 rounded-2xl flex flex-col items-center text-center max-w-3xl mx-auto">
         <ShieldCheck size={32} className="text-mylms-rose mb-6" />
         <p className="text-[11px] font-bold text-text-secondary leading-loose uppercase tracking-widest mb-8">
            Access the Institutional catalog for detailed grading policies for both <span className="text-mylms-rose font-black">undergraduate</span> and <span className="text-mylms-rose font-black">graduate</span> programs. Your official transcript can be requested through the Registry Hub.
         </p>
         <button className="btn-minimal px-10 py-4 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">Review Grading Policy</button>
      </div>

    </div>
  );
}
