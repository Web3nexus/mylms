import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Award, 
  ShieldCheck, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  Lock,
  Search
} from 'lucide-react';
import { useBranding } from '../../hooks/useBranding';

interface CertificateData {
  course: {
    title: string;
    instructor: {
      name: string;
    };
  };
  user: {
    name: string;
  };
  certificate_code: string;
  issued_at: string;
}

export default function CourseCertificate() {
  const { branding } = useBranding();
  const { slug } = useParams();
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [slug]);

  const fetchCertificate = async () => {
    try {
      const res = await client.get(`/courses/${slug}/certificate`, { headers });
      setCert(res.data);
    } catch (err: any) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="w-12 h-12 border-4 border-[#E90171] border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-[#4B345E] font-black uppercase tracking-[0.3em] text-[10px]">Accessing Vault Registry...</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-[#F8F9FA] border border-[#E9ECEF] text-[#E90171] rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-sm">!</div>
        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter uppercase mb-6 leading-none">Registry Notice</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-12 leading-loose">The requested Certificate of Completion is not identified in the central registry for these credentials.</p>
        <button onClick={() => window.history.back()} className="btn-purple px-12 py-3.5 shadow-xl">Return to Campus</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-16 px-8 flex flex-col items-center transition-all">
      
      {/* MyLMS Utility Hub */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-16 print:hidden">
         <Link to="/portal" className="text-[10px] font-black uppercase text-gray-300 hover:text-[#4B345E] transition-all flex items-center gap-3 tracking-[0.3em]">
            <ArrowLeft size={16} />
            Back to Registry
         </Link>
         <button 
            onClick={() => window.print()} 
            className="btn-purple flex items-center gap-3 px-10 py-4 shadow-2xl"
         >
            Download Protocol Registry
            <Download size={18} />
         </button>
      </div>

      {/* Actual Certificate Document (MyLMS Premium Style) */}
      <div className="bg-white w-full max-w-5xl aspect-[1.414/1] relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-20 md:p-32 text-center border-[20px] border-[#F8F9FA] print:shadow-none print:border-none print:aspect-auto group transition-all hover:border-[#4B345E]/10">
         
         {/* Minimalist MyLMS Decor */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#F8F9FA] rounded-bl-full group-hover:bg-[#4B345E]/5 transition-all"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F8F9FA] rounded-tr-full group-hover:bg-[#E90171]/5 transition-all"></div>
         
         <div className="absolute top-12 left-12 border-l-4 border-t-4 border-[#4B345E] w-24 h-24 opacity-20"></div>
         <div className="absolute bottom-12 right-12 border-r-4 border-b-4 border-[#E90171] w-24 h-24 opacity-20"></div>

         {/* Content Module */}
         <div className="relative z-10 w-full flex flex-col items-center">
            {branding?.logo_url ? (
               <div className="h-16 overflow-hidden shrink-0 transition-all flex items-center mb-12">
                  <img src={branding.logo_url} className="h-full w-auto object-contain" alt="Logo" />
               </div>
            ) : (
               <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-[#4B345E] flex items-center justify-center text-white font-black text-xl rounded-xl shadow-md font-display">
                    {(branding?.institutional_name?.charAt(0) || 'M')}
                  </div>
                  <div>
                     <h4 className="text-[#1A1A1A] font-black tracking-[0.5em] uppercase text-xs md:text-sm leading-none">
                        {branding?.institutional_name || 'MyLMS Academic Network'}
                     </h4>
                     <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em] mt-2">
                        {branding?.institutional_motto || 'MyLMS Registry of Credentials'}
                     </p>
                  </div>
               </div>
            )}
            
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter mb-16 uppercase leading-none">
               Certificate of Completion
            </h1>

            <div className="flex items-center gap-6 mb-10">
               <div className="h-px w-10 bg-[#E9ECEF]"></div>
               <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px]">Officially Conferred Upon</p>
               <div className="h-px w-10 bg-[#E9ECEF]"></div>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-[#4B345E] mx-auto border-b-8 border-[#F8F9FA] pb-6 inline-block mb-16 px-12 uppercase tracking-tighter">
               {cert.user?.name}
            </h2>

            <p className="text-gray-400 font-black tracking-[0.4em] text-[10px] mb-6 uppercase">Successfully Verified Requirements for the Completion of</p>
            <h3 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-24 max-w-3xl mx-auto uppercase tracking-tighter leading-tight">
               {cert?.course?.title}
            </h3>

            {/* Verification & Signatures */}
            <div className="grid grid-cols-3 gap-16 w-full px-12 items-end">
               <div className="text-left">
                  <div className="border-b-2 border-[#E9ECEF] pb-4 mb-4 relative">
                     <p className="font-display text-4xl text-[#1A1A1A] group-hover:translate-x-1 transition-transform">{cert.course.instructor?.name}</p>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">MyLMS Faculty Lead</p>
               </div>

               <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-8 border-[#F8F9FA] group-hover:border-[#4B345E]/10 flex items-center justify-center text-[#4B345E] mb-6 shadow-inner transition-all relative">
                     <div className="absolute inset-0 border-2 border-dashed border-[#4B345E]/20 rounded-full animate-slow-spin"></div>
                     <ShieldCheck size={48} className="opacity-10 group-hover:opacity-40 transition-opacity" />
                  </div>
                  <span className="text-[8px] font-black text-[#E90171] uppercase tracking-[0.4em]">VERIFIED_PROTOCOL</span>
               </div>

               <div className="text-right">
                  <div className="border-b-2 border-[#E9ECEF] pb-4 mb-4">
                     <p className="font-black text-[#1A1A1A] text-2xl tabular-nums tracking-tighter">{new Date(cert.issued_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Conferred Date Registry</p>
               </div>
            </div>

         </div>

         {/* Cryptographic Registry Summary */}
         <div className="absolute bottom-12 w-full text-center px-20">
            <div className="flex items-center justify-center gap-6 mb-4">
               <div className="h-px grow bg-[#F8F9FA]"></div>
               <Activity size={14} className="text-[#E90171] opacity-20" />
               <div className="h-px grow bg-[#F8F9FA]"></div>
            </div>
            <p className="text-[9px] font-black text-gray-300 tracking-[0.6em] font-mono uppercase">
               OFFICIAL_ENTRY_ID: {cert.certificate_code}
            </p>
         </div>

      </div>

      {/* Global Verification Note */}
      <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity print:hidden">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center justify-center gap-3">
            <Lock size={12} className="text-[#4B345E]" />
            Official Security Certificate Protocol by MyLMS Registry Office
         </p>
      </div>

    </div>
  );
}
