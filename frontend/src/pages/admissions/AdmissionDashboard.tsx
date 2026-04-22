import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  GraduationCap, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  CreditCard,
  FileUp
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function AdmissionDashboard() {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await client.get('/my-application', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplication(res.data);
      } catch (err) {
        console.error('Error fetching application:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const modules = [
    { 
      id: 'wizard', 
      title: 'My Application', 
      icon: <GraduationCap size={32} />, 
      desc: 'Complete your bio-data, program selection, and scholarship forms.',
      path: '/apply/wizard',
      status: application?.status === 'submitted' ? 'Submitted' : 'In Progress',
      color: 'text-mylms-purple',
      hover: 'hover:border-mylms-purple/30 shadow-[0_20px_50px_-20px_rgba(0,34,85,0.1)]'
    },
    { 
      id: 'payments', 
      title: 'My Payments', 
      icon: <CreditCard size={32} />, 
      desc: 'Review application fees, historical receipts, and bursary status.',
      path: '/billing',
      status: application?.application_fee_status === 'paid' ? 'Settled' : 'Pending',
      color: 'text-mylms-rose',
      hover: 'hover:border-mylms-rose/30 shadow-[0_20px_50px_-20px_rgba(186,22,70,0.1)]'
    },
    { 
      id: 'documents', 
      title: 'Document Bunker', 
      icon: <FileUp size={32} />, 
      desc: 'Upload transcripts, identity proof, and clinical certifications.',
      path: '/apply/wizard?step=document_upload',
      status: 'Secured',
      color: 'text-amber-600',
      hover: 'hover:border-amber-400/30 shadow-[0_20px_50px_-20px_rgba(217,119,6,0.1)]'
    },
  ];

  const getOverallStatus = () => {
    if (application?.status === 'approved') return { label: 'Admission Approved', color: 'bg-green-100 text-green-700', icon: <ShieldCheck /> };
    if (application?.status === 'submitted') return { label: 'Under Review', color: 'bg-mylms-purple/10 text-mylms-purple', icon: <Clock /> };
    return { label: 'Active Candidacy', color: 'bg-mylms-rose/10 text-mylms-rose', icon: <Clock /> };
  };

  const status = getOverallStatus();

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-20 px-8 md:px-16 animate-in fade-in duration-700">
      
      {/* Welcome Header */}
      <div className="mb-24 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-4 text-mylms-rose font-black uppercase tracking-[0.5em] text-[9px] mb-8 bg-mylms-rose/5 px-6 py-2 rounded-full border border-mylms-rose/10">
            Institutional Registry Protocol
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-mylms-purple tracking-tighter leading-[0.8] uppercase italic mb-10">
            Admission <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.5px var(--mylms-purple)' }}>Dashboard.</span>
          </h1>
          <p className="text-text-secondary font-medium text-xl max-w-xl opacity-60 font-sans italic leading-relaxed">
            Welcome to your centralized admission suite. Track your application metrics, settle financial obligations, and manage documentation here.
          </p>
        </div>
        
        <div className={`px-10 py-5 rounded-[24px] border flex items-center gap-5 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all hover:scale-105 ${status.color}`}>
          {status.icon}
          <span>{status.label}</span>
        </div>
      </div>

      {application?.status === 'submitted' ? (
        <div className="bg-white rounded-[60px] border border-border-soft p-20 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-mylms-purple/5 rounded-bl-full group-hover:scale-110 transition-transform duration-1000"></div>
           <div className="w-28 h-28 bg-mylms-purple/10 text-mylms-purple rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-inner border border-white">
              <Clock size={48} className="animate-pulse" />
           </div>
           <h2 className="text-5xl font-black text-text-main uppercase tracking-tighter mb-8 italic">Application Under Review</h2>
           <p className="text-text-secondary font-medium text-xl leading-relaxed mb-16 max-w-3xl mx-auto opacity-60">
              The Academic Committee has received your transmission. Our protocols are currently evaluating your documentation. You will receive a secure notification once a decision is logged.
           </p>
           <Link to="/apply/wizard" className="inline-flex items-center gap-4 px-14 py-6 bg-offwhite text-mylms-purple font-black rounded-2xl border border-border-soft hover:bg-white transition-all uppercase tracking-[0.3em] text-[10px] shadow-sm">
              View Transmission Details
              <ChevronRight size={16} />
           </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          {modules.map((mod) => (
            <Link 
              key={mod.id}
              to={mod.path}
              className={`p-12 bg-white border border-border-soft rounded-[48px] transition-all duration-700 group relative overflow-hidden flex flex-col items-start text-left ${mod.hover}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full pointer-events-none group-hover:scale-[2] transition-transform duration-1000 opacity-30"></div>
              
              <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-12 transition-all duration-700 bg-offwhite group-hover:scale-110 shadow-inner border border-white ${mod.color}`}>
                {mod.icon}
              </div>

              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter leading-none">{mod.title}</h3>
                  <div className="w-8 h-8 rounded-full bg-offwhite flex items-center justify-center text-text-secondary group-hover:translate-x-2 transition-transform">
                    <ChevronRight size={14} />
                  </div>
                </div>
                <p className="text-[14px] font-bold text-text-secondary opacity-60 mb-12 leading-relaxed italic font-sans">{mod.desc}</p>
                
                <div className="mt-auto pt-8 border-t border-gray-50 w-full flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Status</span>
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${
                     mod.status === 'Submitted' || mod.status === 'Settled' || mod.status === 'Secured' ? 'bg-green-50 text-green-600' : 'bg-mylms-rose/5 text-mylms-rose'
                   }`}>
                     {mod.status}
                   </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Help Footer */}
      <div className="mt-20 pt-16 border-t border-border-soft flex flex-col md:flex-row justify-between items-center gap-10">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full border border-border-soft flex items-center justify-center text-mylms-purple hover:bg-mylms-purple hover:text-white transition-all cursor-pointer">
               <ShieldCheck size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-text-main uppercase tracking-widest">Secured Portal</p>
               <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">256-bit Encryption Active</p>
            </div>
         </div>
         <div className="flex gap-10">
            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-mylms-rose transition-colors">Documentation</a>
            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-mylms-rose transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-mylms-rose transition-colors">Contact Registry</a>
         </div>
      </div>
    </div>
  );
}
