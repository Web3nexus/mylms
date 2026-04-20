import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  PlusCircle, 
  Bell,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Layers,
  HelpCircle,
  Award,
  Hash,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

interface TranscriptData {
  cgpa: number;
  total_credits_earned: number;
  total_degree_credits: number;
  program_name: string;
  transcript: any[];
}

export default function StudentPortal() {
  const { user, token } = useAuthStore();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);

  // Degree total credit hours fallback
  const DEFAULT_DEGREE_CREDITS = 120;

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [transcriptRes, scholarshipsRes] = await Promise.allSettled([
          client.get('/transcript'),
          client.get('/scholarships'),
        ]);

        if (transcriptRes.status === 'fulfilled') {
          setTranscriptData(transcriptRes.value.data);
        }
        if (scholarshipsRes.status === 'fulfilled') {
          setScholarships(scholarshipsRes.value.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortalData();
  }, [token]);

  const cgpa = transcriptData?.cgpa ?? 0;
  const creditsEarned = transcriptData?.total_credits_earned ?? 0;
  const totalCreditsRequired = transcriptData?.total_degree_credits ?? DEFAULT_DEGREE_CREDITS;
  const degreeProgress = Math.min((creditsEarned / totalCreditsRequired) * 100, 100);

  // Determine academic standing label
  const getStanding = (gpa: number) => {
    if (gpa >= 3.8) return { label: "Dean's List", color: 'text-mylms-rose' };
    if (gpa >= 3.5) return { label: 'Honours', color: 'text-green-600' };
    if (gpa >= 2.0) return { label: 'Good Standing', color: 'text-mylms-purple' };
    if (gpa > 0)    return { label: 'Academic Probation', color: 'text-amber-500' };
    return { label: 'Not Yet Evaluated', color: 'text-gray-400' };
  };
  const standing = getStanding(cgpa);

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-10 px-6 md:px-12 min-h-screen">
      
      {/* Header with Title and Countdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-6">
        <div className="flex-1">
           <h1 className="text-2xl md:text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight leading-tight">
             {transcriptData?.program_name || 'Bachelor\'s Degree in Computer Science'}
           </h1>
        </div>
        <div className="w-full md:w-auto flex items-center gap-6 md:gap-10 bg-white px-6 md:px-8 py-4 rounded-xl border border-border-soft shadow-sm">
           <div className="w-full">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Term begins in</p>
              <div className="flex items-center justify-between md:justify-start gap-4 text-xl md:text-2xl font-serif font-black text-mylms-purple">
                 <div className="flex flex-col items-center">
                    <span>06</span>
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Days</span>
                 </div>
                 <span className="text-sm opacity-20">:</span>
                 <div className="flex flex-col items-center">
                    <span>18</span>
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Hrs</span>
                 </div>
                 <span className="text-sm opacity-20">:</span>
                 <div className="flex flex-col items-center">
                    <span>54</span>
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Mins</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Hero Banner Card */}
          <div className="lg:col-span-2 bg-linear-to-br from-white to-offwhite p-8 md:p-12 rounded-2xl border border-border-soft shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[300px] md:min-h-[350px]">
             <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <svg className="w-full h-full text-mylms-rose" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <path d="M70,20 L100,50 L80,90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                   <path d="M50,10 L90,40 L60,80 Z" fill="none" stroke="currentColor" strokeWidth="0.2" />
                </svg>
             </div>
             <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-serif font-black text-mylms-purple mb-6 uppercase tracking-tight">Almost There!</h2>
                <p className="text-base md:text-lg font-medium text-text-secondary leading-relaxed max-w-lg mb-8">
                  {user?.name}, the term is almost over. Good luck with your exams! Keep pushing towards your global degree.
                </p>
                <div className="h-1.5 w-full md:w-64 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-mylms-rose animate-pulse" style={{ width: '85%' }}></div>
                </div>
             </div>
          </div>

          {/* Academic Progress Column */}
          <div className="space-y-6">
             <div className="bg-white p-6 md:p-8 rounded-2xl border border-border-soft shadow-sm">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 border-b border-border-soft pb-4">Academic Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 md:p-6 bg-offwhite rounded-xl border border-border-soft relative group">
                      <div className="text-gray-300 absolute top-4 right-4">
                         <TrendingUp size={14} />
                      </div>
                      <p className="text-2xl md:text-3xl font-serif font-black text-mylms-purple mb-1">
                        {cgpa > 0 ? cgpa.toFixed(2) : '3.84'}
                      </p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cum. GPA</p>
                   </div>
                   <div className="p-4 md:p-6 bg-offwhite rounded-xl border border-border-soft relative">
                      <div className="text-gray-300 absolute top-4 right-4">
                         <Award size={14} />
                      </div>
                      <p className="text-2xl md:text-3xl font-serif font-black text-mylms-purple mb-1">
                        {creditsEarned} <span className="text-sm opacity-30">/ {totalCreditsRequired}</span>
                      </p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Credits</p>
                   </div>
                </div>
                <div className="mt-4 p-4 md:p-6 bg-mylms-purple/5 border border-mylms-purple/10 rounded-xl flex justify-between items-center">
                   <div>
                      <p className="text-[11px] md:text-sm font-black text-mylms-purple uppercase tracking-tight leading-tight">Courses to Finalize</p>
                      <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mt-1">Protocol status</p>
                   </div>
                   <p className="text-xl md:text-3xl font-serif font-black text-mylms-purple">2 <span className="text-sm opacity-30">/ 2</span></p>
                </div>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
             <div className="p-6 md:p-8 border-b border-border-soft">
                <h3 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight">Checklist</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">A to-do list for you</p>
             </div>
             <div className="flex border-b border-border-soft bg-offwhite/50">
                <button className="flex-1 md:flex-none px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-mylms-rose border-b-2 border-mylms-rose bg-white">Current</button>
                <button className="flex-1 md:flex-none px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-mylms-purple transition-colors">Completed</button>
             </div>
             <div className="p-6 md:p-8 space-y-4">
                <div className="p-4 md:p-6 border border-border-soft rounded-xl flex justify-between items-center group hover:border-mylms-rose transition-all">
                   <div className="flex-1 pr-4">
                      <h4 className="text-sm font-black text-text-main uppercase tracking-tight leading-tight">Course Registration Opens Soon</h4>
                      <p className="text-[9px] font-bold text-mylms-rose uppercase tracking-widest mt-2 bg-mylms-rose/5 px-3 py-1 rounded inline-block">
                        Opens April 9th, 2026
                      </p>
                   </div>
                   <ChevronRight className="text-gray-200 group-hover:text-mylms-rose transition-colors shrink-0" />
                </div>
                <div className="p-4 md:p-6 border border-border-soft rounded-xl flex justify-between items-center group opacity-50">
                   <div className="flex-1 pr-4">
                      <h4 className="text-sm font-black text-text-main uppercase tracking-tight leading-tight">Financial Aid Verification</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Verified March 2026</p>
                   </div>
                   <ShieldCheck size={20} className="text-green-500 shrink-0" />
                </div>
             </div>
          </div>

          {/* Current Courses */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
             <div className="p-6 md:p-8 border-b border-border-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                   <h3 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight">Your Courses</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Current Session Schedule</p>
                </div>
                <div className="flex bg-offwhite p-1 rounded-lg border border-border-soft w-full sm:w-auto">
                   <button className="flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase bg-white text-mylms-purple rounded shadow-sm">Future</button>
                   <button className="flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase text-gray-400">Past</button>
                </div>
             </div>
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[600px]">
                   <thead>
                      <tr className="bg-offwhite text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                         <th className="px-8 py-4">Course Name</th>
                         <th className="px-8 py-4">Status</th>
                         <th className="px-8 py-4">Registry</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-soft">
                      {transcriptData?.transcript.map((course, i) => (
                         <tr key={i} className="hover:bg-offwhite/50 transition-colors">
                            <td className="px-8 py-6">
                               <p className="text-sm font-black text-text-main uppercase tracking-tight leading-tight mb-1">{course.course_name}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.course_code}</p>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                  <span className="text-[10px] font-black text-text-main uppercase tracking-widest">Registered</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Registry</span>
                            </td>
                         </tr>
                      )) || (
                         <tr>
                           <td colSpan={3} className="px-8 py-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No active courses found for this term.</td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
      </div>
    </div>
  );
}
