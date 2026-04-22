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
  ClipboardList
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

  const sections = [
    { id: 'personal_info', title: 'Personal Information', icon: <User size={24} />, desc: 'Legal name, contact details, and identity.' },
    { id: 'address_info', title: 'Address Information', icon: <MapPin size={24} />, desc: 'Permanent and current residential address.' },
    { id: 'academic_background', title: 'Academic Background', icon: <FileText size={24} />, desc: 'Previous schooling and certifications.' },
    { id: 'program_selection', title: 'Program Selection', icon: <GraduationCap size={24} />, desc: 'Choose your desired level and program.' },
    { id: 'document_upload', title: 'Documents Upload', icon: <Upload size={24} />, desc: 'Transcripts, ID proof, and certificates.' },
    { id: 'final_review', title: 'Review & Submit', icon: <ClipboardList size={24} />, desc: 'Final check and official submission.' },
  ];

  const isCompleted = (sectionId: string) => {
    return application?.step_data?.[sectionId] ? true : false;
  };

  const getOverallStatus = () => {
    if (application?.status === 'approved') return { label: 'Admission Approved', color: 'bg-green-100 text-green-700', icon: <ShieldCheck /> };
    if (application?.status === 'submitted') return { label: 'Under Review', color: 'bg-mylms-purple/10 text-mylms-purple', icon: <Clock /> };
    return { label: 'Incomplete', color: 'bg-mylms-rose/10 text-mylms-rose', icon: <Clock /> };
  };

  const status = getOverallStatus();

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-20 px-8 md:px-16 animate-in fade-in duration-700">
      
      {/* Welcome Header */}
      <div className="mb-16 flex flex-col md:row justify-between items-start md:items-end gap-10">
        <div>
          <div className="inline-flex items-center gap-3 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px] mb-6">
            Institutional Registry Protocol
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-mylms-purple tracking-tighter leading-[0.85] uppercase italic mb-6">
            Application <br />
            <span className="text-transparent border-text-mylms-purple" style={{ WebkitTextStroke: '1px var(--color-mylms-purple)' }}>Progress.</span>
          </h1>
          <p className="text-text-secondary font-medium text-lg max-w-xl opacity-60 font-sans italic">
            Welcome to your Admission Portal. Please complete all segments below to finalize your candidacy.
          </p>
        </div>
        
        <div className={`px-8 py-4 rounded-2xl border flex items-center gap-4 font-black uppercase tracking-widest text-[11px] shadow-sm ${status.color}`}>
          {status.icon}
          {status.label}
        </div>
      </div>

      {application?.status === 'submitted' ? (
        <div className="bg-white rounded-[40px] border border-border-soft p-16 text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-offwhite rounded-bl-full opacity-50"></div>
           <div className="w-24 h-24 bg-mylms-purple/10 text-mylms-purple rounded-[32px] flex items-center justify-center mx-auto mb-10">
              <Clock size={40} className="animate-pulse" />
           </div>
           <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter mb-6 italic">Application Under Review</h2>
           <p className="text-text-secondary font-medium text-lg leading-relaxed mb-12 max-w-2xl mx-auto opacity-60">
              The Academic Committee is currently reviewing your documentation. You will receive an email notification once a decision is made.
           </p>
           <button className="px-12 py-5 bg-offwhite text-mylms-purple font-black rounded-xl border border-border-soft hover:bg-white transition-all uppercase tracking-widest text-[11px]">
              View Submitted Details
           </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, idx) => (
            <div 
              key={section.id}
              className={`p-10 rounded-[40px] border transition-all duration-500 group relative overflow-hidden ${
                isCompleted(section.id) 
                  ? 'bg-white border-green-200 shadow-xl' 
                  : 'bg-white border-border-soft hover:border-mylms-purple/30 hover:shadow-2xl'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-1000 opacity-50"></div>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isCompleted(section.id) ? 'bg-green-50 text-green-600' : 'bg-mylms-purple/5 text-mylms-purple group-hover:bg-mylms-purple group-hover:text-white'
                }`}>
                  {isCompleted(section.id) ? <CheckCircle size={28} /> : section.icon}
                </div>
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Step {idx + 1}
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-black text-text-main mb-4 uppercase tracking-tight">{section?.title}</h3>
                <p className="text-[13px] font-bold text-text-secondary opacity-60 mb-10 leading-relaxed italic font-sans">{section.desc}</p>
                
                <Link 
                  to={`/apply/wizard?step=${section.id}`}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3 transition-all ${
                    isCompleted(section.id)
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-mylms-purple text-white shadow-lg active:scale-95'
                  }`}
                >
                  {isCompleted(section.id) ? 'Update Information' : 'Begin Section'}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
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
