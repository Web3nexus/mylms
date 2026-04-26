import { useState } from 'react';
import client from '../../api/client';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle, 
  Activity, 
  ArrowLeft, 
  Lock, 
  Award, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface CertificateResult {
  valid: boolean;
  certified_student?: string;
  course?: string;
  instructor?: string;
  issue_date?: string;
  certificate_code?: string;
}

export default function PublicVerification() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setResult(null);
    setError('');

    // Clean up input (e.g. if they pasted a URL)
    let cleanCode = code.trim();
    if (cleanCode.includes('CERT-')) {
      const parts = cleanCode.split('CERT-');
      if (parts.length > 1) cleanCode = 'CERT-' + parts[1].substring(0, 12);
    }

    try {
      const res = await client.get(`/verify/${cleanCode}`);
      setResult(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No certificate identified in the registry matching this hash.');
      } else {
        setError('Registry synchronization error. Please re-authenticate your request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8 transition-all">
      
      {/* Navigation Return */}
      <div className="absolute top-10 left-10">
         <Link to="/" className="text-[10px] font-black uppercase text-gray-300 hover:text-[#4B345E] transition-all flex items-center gap-3 tracking-[0.3em]">
            <ArrowLeft size={16} />
            Return to MyLMS
         </Link>
      </div>

      <div className="text-center mb-16 max-w-2xl mx-auto">
         <div className="w-20 h-20 bg-white border border-[#E9ECEF] text-[#4B345E] rounded-2zl mx-auto flex items-center justify-center text-3xl font-black mb-8 shadow-sm hover:bg-[#4B345E] hover:text-white transition-all cursor-crosshair">
            M
         </div>
         <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter mb-6 uppercase leading-none">Official Verification Portal</h1>
         <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-loose">Verify the authenticity of digital credentials issued by the MyLMS Academic Network. Enter the unique cryptographic hash identifier below.</p>
      </div>

      <div className="bg-white p-12 md:p-16 w-full max-w-2xl rounded-3xl border border-[#E9ECEF] shadow-2xl relative overflow-hidden group transition-all hover:border-[#4B345E]/20">
         
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8F9FA] rounded-bl-full group-hover:bg-[#4B345E]/5 transition-all"></div>

         <form onSubmit={handleVerify} className="mb-12">
            <label className="block text-[9px] font-black uppercase text-gray-300 tracking-[0.3em] mb-4">Registry Hash Identifier</label>
            <div className="flex flex-col md:flex-row gap-6">
               <div className="relative grow group/input">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within/input:text-[#4B345E] transition-colors" size={18} />
                  <input 
                     type="text" 
                     value={code}
                     onChange={(e) => setCode(e.target.value.toUpperCase())}
                     placeholder="e.g. CERT-A1B2C3D4E5"
                     className="w-full font-mono bg-[#F8F9FA] text-[#1A1A1A] font-black p-5 pl-16 rounded-2xl border border-transparent outline-none focus:bg-white focus:border-[#4B345E] transition-all uppercase shadow-inner text-sm tracking-widest"
                     required
                  />
               </div>
               <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-purple px-10 py-5 shadow-2xl flex items-center justify-center gap-4"
               >
                  {loading ? 'Transmitting...' : 'Verify Protocol'}
                  <Activity size={18} />
               </button>
            </div>
         </form>

         {error && (
            <div className="bg-[#E90171]/5 border border-[#E90171]/10 text-[#E90171] p-8 rounded-2xl text-center font-black text-[10px] uppercase tracking-[0.2em] mb-6 animate-shake flex items-center justify-center gap-4">
               <AlertCircle size={18} />
               {error}
            </div>
         )}

         {result && result.valid && (
            <div className="bg-white border-2 border-[#4B345E]/10 p-10 rounded-3xl animate-in slide-in-from-bottom-5 transition-all relative overflow-hidden group/result">
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#F8F9FA] rounded-bl-full transition-all group-hover/result:bg-[#4B345E]/5"></div>
               
               <div className="w-16 h-16 bg-[#4B345E] text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-8 shadow-xl shadow-[#4B345E]/20 font-black">
                  ML
               </div>
               
               <div className="flex items-center justify-center gap-4 mb-4">
                  <CheckCircle className="text-green-500" size={14} />
                  <p className="text-[9px] font-black uppercase text-green-600 tracking-[0.4em] mb-0">Authentic MyLMS Credential</p>
               </div>
               <h3 className="text-3xl font-black text-[#1A1A1A] mb-10 tracking-tighter uppercase underline decoration-[#E90171] decoration-4 underline-offset-8">{result.course}</h3>

               <div className="grid grid-cols-2 gap-6 text-left">
                  <div className="bg-[#F8F9FA] p-6 rounded-2xl border border-[#E9ECEF] shadow-inner transition-all hover:bg-white hover:border-[#4B345E]/20">
                     <div className="flex items-center gap-3 mb-2 opacity-40">
                        <User size={10} />
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Scholar Name</p>
                     </div>
                     <p className="font-black text-[#1A1A1A] uppercase tracking-tighter text-lg">{result.certified_student}</p>
                  </div>
                  <div className="bg-[#F8F9FA] p-6 rounded-2xl border border-[#E9ECEF] shadow-inner transition-all hover:bg-white hover:border-[#4B345E]/20">
                     <div className="flex items-center gap-3 mb-2 opacity-40">
                        <Calendar size={10} />
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Conferred Date</p>
                     </div>
                     <p className="font-black text-[#1A1A1A] uppercase tracking-tighter text-lg">{result.issue_date}</p>
                  </div>
                  <div className="col-span-2 bg-[#F8F9FA] p-6 rounded-2xl border border-[#E9ECEF] mt-4 shadow-inner">
                     <div className="flex items-center gap-3 mb-2 opacity-40">
                        <ShieldCheck size={10} />
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Registry Hash Validation</p>
                     </div>
                     <p className="font-mono text-xs font-black text-[#1A1A1A] break-all tracking-[0.2em]">{result.certificate_code}</p>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* MyLMS Security Footer */}
      <div className="mt-16 text-center transition-opacity opacity-40 hover:opacity-100">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-3">
            <Lock size={12} className="text-[#4B345E]" />
            Unified Registry Protocol Beta Security Active
         </p>
      </div>

    </div>
  );
}
