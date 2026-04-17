import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileCheck, 
  Upload, 
  ChevronRight,
  ChevronLeft,
  BookOpen,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  GraduationCap,
  User,
  Globe,
  Award,
  Briefcase
} from 'lucide-react';
import GatewaySelector from '../../components/finance/GatewaySelector';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useBranding } from '../../hooks/useBranding';
import RegistryError from '../../components/layout/RegistryError';

interface Faculty {
  id: number;
  name: string;
  departments: { id: number; name: string; programs: { id: number; name: string }[] }[];
}

interface Instructor {
  id: number;
  name: string;
  email: string;
}

interface DynamicField {
  id: number;
  field_key: string;
  label: string;
  category: string;
  type: string;
  options: string[] | null;
  is_required: boolean;
}

export function AdmissionFormWidget() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState<any>({
    program_id: '',
    faculty_id: '',
    instructor_id: '',
    personal_statement: '',
    form_data: {}
  });

  const [selectedGateway, setSelectedGateway] = useState('stripe');

  const [files, setFiles] = useState<{ transcript: File | null; id_proof: File | null }>({
    transcript: null,
    id_proof: null,
  });

  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const { branding, loading: brandingLoading } = useBranding();

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (formData.faculty_id) {
       fetchInstructors(formData.faculty_id);
    } else {
       setInstructors([]);
    }
  }, [formData.faculty_id]);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [facRes, appRes, fieldRes] = await Promise.all([
        client.get('/academic', { headers: { Authorization: `Bearer ${token}` } }),
        client.get('/my-application', { headers: { Authorization: `Bearer ${token}` } }),
        client.get('/admissions/fields', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setFaculties(facRes.data);
      setApplication(appRes.data);
      setDynamicFields(fieldRes.data);
    } catch (err) {
      console.error('Error fetching admission data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async (facultyId: string) => {
    try {
      const res = await client.get(`/faculties/${facultyId}/instructors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstructors(res.data);
    } catch (err) {
      console.error('Error fetching instructors:', err);
    }
  };

  const handleDynamicChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      form_data: {
        ...formData.form_data,
        [key]: value
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.transcript || !files.id_proof) {
      alert('Please upload all required documents.');
      return;
    }

    const payload = new FormData();
    payload.append('program_id', formData.program_id);
    payload.append('faculty_id', formData.faculty_id);
    payload.append('instructor_id', formData.instructor_id);
    payload.append('personal_statement', formData.personal_statement);
    payload.append('documents[transcript]', files.transcript);
    payload.append('documents[id_proof]', files.id_proof);
    
    // Append dynamic form data
    Object.keys(formData.form_data).forEach(key => {
      payload.append(`form_data[${key}]`, formData.form_data[key]);
    });

    try {
      setLoading(true);
      const res = await client.post('/apply', payload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setApplication(res.data.application);
      setStep(5); // Move to payment
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePayment = async () => {
    if (!application?.invoice?.id) return;
    setLoading(true);
    try {
      const res = await client.post(`/finance/invoices/${application.invoice.id}/pay`, {
        gateway: selectedGateway
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = res.data.checkout_url;
    } catch (err) {
      console.error('Payment Init Error:', err);
      alert('Failed to initialize secure payment protocol.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    try {
      await client.post(`/admission-offers/${offerId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error accepting offer:', err);
    }
  };

  const renderField = (field: DynamicField) => {
    const value = formData.form_data[field.field_key] || '';
    
    switch(field.type) {
      case 'select':
        return (
          <select
            key={field.field_key}
            required={field.is_required}
            value={value}
            onChange={(e) => handleDynamicChange(field.field_key, e.target.value)}
            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple font-black text-[11px] text-mylms-purple transition-all shadow-xl uppercase tracking-widest"
          >
            <option value="">-- SELECT {field.label} --</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            key={field.field_key}
            required={field.is_required}
            value={value}
            onChange={(e) => handleDynamicChange(field.field_key, e.target.value)}
            className="w-full p-8 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-bold text-sm text-text-main transition-all shadow-xl h-48 italic font-sans"
            placeholder={`ENTER ${field.label}...`}
          />
        );
      case 'date':
        return (
          <input
            key={field.field_key}
            type="date"
            required={field.is_required}
            value={value}
            onChange={(e) => handleDynamicChange(field.field_key, e.target.value)}
            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple font-black text-[11px] text-mylms-purple transition-all shadow-xl uppercase tracking-widest"
          />
        );
      default:
        return (
          <input
            key={field.field_key}
            type={field.type}
            required={field.is_required}
            value={value}
            onChange={(e) => handleDynamicChange(field.field_key, e.target.value)}
            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple font-black text-[11px] text-mylms-purple transition-all shadow-xl uppercase tracking-widest"
            placeholder={`ENTER ${field.label}...`}
          />
        );
    }
  };

  if (loading || brandingLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite">
      <div className="w-16 h-16 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-8"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Institutional Registry...</p>
    </div>
  );

  if (!branding?.admissions_enabled) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite p-8">
       <div className="w-full max-w-2xl premium-card p-20 text-center animate-in fade-in slide-in-from-top duration-700">
          <div className="w-24 h-24 bg-mylms-rose/10 text-mylms-rose rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-inner">
             <Clock size={40} />
          </div>
          <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter mb-6">Enrollment Wizard Locked</h2>
          <p className="text-text-secondary font-medium text-lg leading-relaxed mb-12 opacity-60">
             The official Enrollment Protocol has been paused by the academic office. Access to the candidacy wizard is restricted until the next cycle (<span className="text-mylms-purple font-black">{branding?.admissions_opens_at || 'TBA'}</span>).
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
             <button onClick={() => navigate('/dashboard')} className="btn-purple px-12 py-5">Return to Portal</button>
             <button onClick={() => navigate('/')} className="btn-minimal px-12 py-5">View Official Status</button>
          </div>
       </div>
    </div>
  );

  if (error) return <RegistryError onRetry={fetchData} source={window.location.hostname} message="The Admission Registry could not be synchronized." />;

  // 1. Check if Admissions are globally disabled
  if (branding && !branding.admissions_enabled) {
    return (
      <div className="max-w-4xl mx-auto py-32 px-8 transition-all">
        <div className="bg-white rounded-[60px] border border-border-soft shadow-2xl p-24 text-center relative overflow-hidden group border-t-16 border-t-mylms-rose">
          <div className="absolute top-0 right-0 w-80 h-80 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-all duration-1000"></div>
          
          <div className="w-32 h-32 mx-auto mb-16 rounded-[40px] bg-mylms-rose/5 border border-mylms-rose/20 text-mylms-rose flex items-center justify-center text-5xl shadow-inner relative z-10 transition-transform group-hover:scale-110 duration-700">
            <Clock size={64} className="animate-pulse" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter mb-8 uppercase leading-[0.85] relative z-10 italic">
            Admissions <br />
            <span className="text-mylms-rose">Closed.</span>
          </h1>
          <p className="text-mylms-purple font-black uppercase tracking-[0.5em] text-[10px] mb-16 flex items-center justify-center gap-4 opacity-60 relative z-10">
            <ShieldCheck size={18} />
            Institutional Registration Cycle Inactive
          </p>

          <div className="max-w-xl mx-auto p-16 bg-offwhite rounded-[40px] border border-border-soft mb-16 text-center relative z-10 hover:border-mylms-rose/20 transition-all group/date shadow-inner">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em] mb-6 opacity-50 group-hover/date:text-mylms-rose transition-colors">Projected Reopening Date</p>
             <p className="text-5xl font-black text-mylms-purple tracking-tighter uppercase font-mono">
               {new Date(branding.admissions_opens_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
             </p>
          </div>

          <p className="text-[13px] font-bold text-text-secondary leading-loose uppercase tracking-widest max-w-lg mx-auto mb-20 opacity-70 italic font-sans">
            The Academic Registrar of {branding?.institutional_name || 'Global Academy'} has temporarily suspended all new enrollment protocols for the current cycle. Please rejoin the registry on the date mentioned above.
          </p>

          <button 
            onClick={() => navigate('/')}
            className="px-20 py-8 bg-mylms-purple text-white rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all text-[11px] font-black tracking-[0.4em] relative z-10 uppercase"
          >
            Return to Site Home
          </button>
        </div>
      </div>
    );
  }

  // 2. Check if user is logged in (Guest State)
  if (!token) {
    return (
      <div className="max-w-4xl mx-auto py-32 px-8 transition-all">
        <div className="bg-white rounded-[60px] border border-border-soft shadow-2xl p-24 text-center relative overflow-hidden group border-t-16 border-t-mylms-purple">
           <div className="absolute top-0 right-0 w-80 h-80 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all duration-1000"></div>
           
           <div className="w-32 h-32 mx-auto mb-16 rounded-[40px] bg-mylms-purple/5 border border-mylms-purple/20 text-mylms-purple flex items-center justify-center text-5xl shadow-inner relative z-10">
              <User size={64} />
           </div>

           <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter mb-8 uppercase leading-[0.85] relative z-10 italic">
             Identify <br />
             <span className="text-mylms-purple">Yourself.</span>
           </h1>
           <p className="text-mylms-rose font-black uppercase tracking-[0.5em] text-[10px] mb-16 flex items-center justify-center gap-4 opacity-60 relative z-10">
              <ShieldCheck size={18} />
              Identity Verification Required
           </p>

           <p className="text-[13px] font-bold text-text-secondary leading-loose uppercase tracking-widest max-w-lg mx-auto mb-20 opacity-70 italic font-sans">
              In order to initiate an official enrollment protocol, you must first secure a validated account within the MyLMS registry.
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 relative z-10 w-full">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:flex-1 py-8 bg-mylms-purple text-white rounded-full shadow-2xl hover:scale-105 transition-all text-[11px] font-black tracking-[0.4em] uppercase"
              >
                 Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:flex-1 py-8 bg-mylms-rose text-white rounded-full shadow-2xl hover:scale-105 transition-all text-[11px] font-black tracking-[0.4em] uppercase"
              >
                 Create Profile
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (application) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-8 transition-all">
        <div className="bg-white rounded-[60px] border border-border-soft shadow-2xl p-16 md:p-24 text-center relative overflow-hidden group border-t-12 border-t-mylms-purple">
          <div className="absolute top-0 right-0 w-64 h-64 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
          
          <div className={`w-28 h-28 mx-auto mb-12 rounded-[32px] flex items-center justify-center text-4xl shadow-inner border transition-transform group-hover:scale-110 duration-700 ${
            application.status === 'approved' ? 'bg-green-50 border-green-200 text-green-600' : 
            application.status === 'rejected' ? 'bg-mylms-rose/5 border-mylms-rose/20 text-mylms-rose' : 
            'bg-offwhite border-border-soft text-mylms-purple'
          }`}>
            {application.status === 'approved' ? <UserCheck size={48} /> : 
             application.status === 'rejected' ? <XCircle size={48} /> : 
             <Clock size={48} className="animate-pulse" />}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-text-main tracking-tighter mb-6 uppercase leading-[0.9] italic">
            {application.status === 'pending' && 'Application Submitted'}
            {application.status === 'review' && 'Academic Review Protocol'}
            {application.status === 'approved' && 'Admission Granted'}
            {application.status === 'rejected' && 'Admission Declined'}
          </h1>
          <p className="text-mylms-rose font-black uppercase tracking-[0.5em] text-[10px] mb-16 flex items-center justify-center gap-3 opacity-60">
            <ShieldCheck size={16} />
            Registry Code: {application.id.toString().padStart(8, '0')}
          </p>

          <div className="p-16 bg-offwhite rounded-[40px] border border-border-soft mb-16 text-left relative overflow-hidden group shadow-inner transition-all hover:border-mylms-purple/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/50 rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3 opacity-60">
               <BookOpen size={18} className="text-mylms-purple" />
               Selected Degree Program
            </p>
            <h3 className="text-4xl font-black text-text-main tracking-tighter uppercase italic">{application.program.name}</h3>
          </div>

          {application.status === 'approved' && application.offer && !application.offer.accepted && (
            <div className="p-16 bg-green-50 rounded-[40px] border-2 border-green-200 mb-16 shadow-2xl animate-pulse flex flex-col items-center">
               <CheckCircle size={48} className="text-green-600 mb-8" />
               <h3 className="text-3xl font-black text-green-900 mb-6 uppercase tracking-tighter italic">Official Enrollment Offer</h3>
               <p className="text-green-700 font-bold mb-12 text-[13px] opacity-80 uppercase tracking-[0.2em] leading-loose text-center italic font-sans">The Academic Committee has authorized your permanent record creation. Please confirm your placement to finalize protocol.</p>
               <button 
                onClick={() => handleAcceptOffer(application.offer.id)}
                className="bg-mylms-purple text-white px-20 py-7 rounded-full text-[11px] font-black hover:bg-mylms-purple/90 transition-all uppercase tracking-[0.4em] shadow-2xl active:scale-95 flex items-center gap-4"
               >
                 Confirm Placement Protocol
                 <ChevronRight size={18} />
               </button>
            </div>
          )}

          {application.status === 'approved' && application.offer?.accepted && (
            <div className="p-16 bg-mylms-purple text-white rounded-[40px] shadow-2xl mb-16 text-left border-t-12 border-mylms-rose relative overflow-hidden group transition-all">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/3 rounded-bl-full group-hover:bg-mylms-rose/10 transition-all duration-1000"></div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10 transition-all">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-mylms-rose mb-6 flex items-center gap-3">
                       <ShieldCheck size={18} />
                       Student Identification Number
                     </p>
                    <p className="text-6xl font-black font-mono tracking-tighter">
                      {application.user?.student_id || `ID-${new Date().getFullYear()}-${application.id.toString().padStart(5, '0')}`}
                    </p> 
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">Registry Cycle</p>
                    <p className="text-4xl font-black tracking-[0.5em] text-white italic">{new Date().getFullYear()}</p>
                  </div>
               </div>
            </div>
          )}

          <button onClick={() => navigate('/dashboard')} className="text-gray-300 font-black hover:text-mylms-rose transition-all uppercase tracking-[0.5em] text-[10px] flex items-center justify-center gap-3 mx-auto group">
             <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
             Return to Academic Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-24 px-8 transition-all selection:bg-mylms-rose/20">
      
      {/* Wizard Header */}
      <div className="mb-24 flex flex-col lg:row justify-between items-center lg:items-end gap-16 border-b-2 border-border-soft pb-16 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mylms-purple/3 rounded-full blur-[100px] -translate-y-20 translate-x-10"></div>
        <div className="text-center lg:text-left">
           <div className="flex items-center justify-center lg:justify-start gap-4 mb-10 group/sub">
              <span className="w-12 h-px bg-mylms-rose group-hover/sub:w-20 transition-all duration-500"></span>
              <span className="text-mylms-rose font-black uppercase tracking-[0.5em] text-[10px]">Enrollment Protocol {new Date().getFullYear()}</span>
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter mb-10 leading-[0.85] uppercase italic">
             Academic <br />
             <span className="text-transparent bg-clip-text bg-linear-to-r from-mylms-purple to-mylms-rose text-stroke">Candidate.</span>
           </h1>
           <p className="text-text-secondary font-medium text-lg max-w-xl opacity-60 font-sans italic mx-auto lg:mx-0">
             Initiate your official registration within the {branding?.institutional_name || 'Global Academy'} Registry. Complete all stages to verify your candidacy.
           </p>
        </div>
        
        {/* Step Rail Indicator */}
        <div className="flex items-center gap-6 bg-white shadow-2xl p-6 rounded-[32px] border border-border-soft">
           {[1, 2, 3, 4, 5].map(s => (
             <div key={s} className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${
                  step === s ? 'bg-mylms-purple text-white shadow-[0_15px_30px_-5px_rgba(0,34,85,0.4)] scale-110' : 
                  step > s ? 'bg-green-100 text-green-600' : 
                  'bg-offwhite text-gray-300'
                }`}>
                  {step > s ? <CheckCircle size={22} /> : s}
                </div>
                {s < 5 && <div className="w-6 h-1 bg-offwhite rounded-full"></div>}
             </div>
           ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        
        {/* STEP 1: PERSONAL IDENTITY */}
        {step === 1 && (
          <div className="space-y-16">
            <div className="bg-white p-12 md:p-20 rounded-[60px] border border-border-soft shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-all duration-[2s]"></div>
              <h2 className="text-4xl font-black text-text-main mb-16 tracking-tighter uppercase border-b-2 border-offwhite pb-12 flex items-center gap-6 relative z-10 italic leading-none">
                <User size={32} className="text-mylms-rose" />
                Personal Profile Registry
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                {dynamicFields.filter(f => f.category === 'personal').map(field => (
                  <div key={field.field_key}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-2 opacity-60 group-hover:text-mylms-rose transition-colors">
                      {field.label} {field.is_required && '*'}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONTACT PROTOCOL */}
        {step === 2 && (
          <div className="space-y-16">
            <div className="bg-white p-12 md:p-20 rounded-[60px] border border-border-soft shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all duration-[2s]"></div>
              <h2 className="text-4xl font-black text-text-main mb-16 tracking-tighter uppercase border-b-2 border-offwhite pb-12 flex items-center gap-6 relative z-10 italic leading-none">
                <Globe size={32} className="text-mylms-purple" />
                Contact & Residency Protocol
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                {dynamicFields.filter(f => f.category === 'contact').map(field => (
                  <div key={field.field_key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-2 opacity-60 group-hover:text-mylms-purple transition-colors">
                      {field.label} {field.is_required && '*'}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ACADEMIC REGISTRY */}
        {step === 3 && (
          <div className="space-y-16">
            <div className="bg-white p-12 md:p-20 rounded-[60px] border border-border-soft shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-all duration-[2s]"></div>
              <h2 className="text-4xl font-black text-text-main mb-16 tracking-tighter uppercase border-b-2 border-offwhite pb-12 flex items-center gap-6 relative z-10 italic leading-none">
                <Award size={32} className="text-mylms-rose" />
                Academic Specialization
              </h2>
              
              <div className="space-y-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Faculty Selection */}
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-2 opacity-60">Home Faculty Selection</label>
                      <select
                        required
                        value={formData.faculty_id}
                        onChange={(e) => setFormData({...formData, faculty_id: e.target.value, instructor_id: ''})}
                        className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple font-black text-[11px] text-mylms-purple transition-all shadow-xl uppercase tracking-widest"
                      >
                         <option value="">-- FORMAL FACULTY SELECT --</option>
                         {faculties.map(f => (
                           <option key={f.id} value={f.id}>{f.name}</option>
                         ))}
                      </select>
                   </div>

                   {/* Program Selection */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-2 opacity-60">Target Degree Program</label>
                      <select 
                        required
                        value={formData.program_id}
                        onChange={e => setFormData({...formData, program_id: e.target.value})}
                        className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple font-black text-[11px] text-mylms-purple transition-all shadow-xl uppercase tracking-widest"
                      >
                        <option value="">-- OFFICIAL PROGRAM SELECTION --</option>
                        {faculties.find(f => f.id.toString() === formData.faculty_id.toString())?.departments.map(d => (
                           <optgroup key={d.id} label={d.name} className="font-black text-[10px] uppercase tracking-[0.4em] py-6 bg-white text-gray-300">
                             {d.programs.map(p => (
                               <option key={p.id} value={p.id} className="text-text-main normal-case font-bold p-6">{p.name}</option>
                             ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Authorized Instructor */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-2 opacity-60">Authorized Academic Advisor</label>
                      <select 
                        required
                        value={formData.instructor_id}
                        onChange={e => setFormData({...formData, instructor_id: e.target.value})}
                        disabled={!formData.faculty_id}
                        className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple font-black text-[11px] text-mylms-purple transition-all shadow-xl uppercase tracking-widest disabled:opacity-30"
                      >
                        <option value="">-- {formData.faculty_id ? 'FORMAL ADVISOR SELECT' : 'SELECT FACULTY FIRST'} --</option>
                        {instructors.map(instr => (
                           <option key={instr.id} value={instr.id}>{instr.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dynamic Academic Fields */}
                    {dynamicFields.filter(f => f.category === 'academic').map(field => (
                      <div key={field.field_key}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-2 opacity-60">
                          {field.label} {field.is_required && '*'}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                </div>

                <div className="pt-12 border-t-2 border-offwhite">
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 ml-2 opacity-60">Formal Mission Statement</label>
                   <textarea 
                    required
                    minLength={100}
                    value={formData.personal_statement}
                    onChange={e => setFormData({...formData, personal_statement: e.target.value})}
                    className="w-full p-10 bg-offwhite border-2 border-border-soft rounded-[40px] outline-none focus:border-mylms-purple min-h-[300px] font-bold text-text-main leading-loose text-lg shadow-inner transition-all placeholder:text-gray-200 italic font-sans"
                    placeholder="Document your academic motivations and institutional goals (Min 100 characters)..."
                   />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FINANCIAL & EVIDENCE */}
        {step === 4 && (
          <div className="space-y-16">
            <div className="bg-white p-12 md:p-20 rounded-[60px] border border-border-soft shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all duration-[2s]"></div>
              <h2 className="text-4xl font-black text-text-main mb-16 tracking-tighter uppercase border-b-2 border-offwhite pb-12 flex items-center gap-6 relative z-10 italic leading-none">
                <Briefcase size={32} className="text-mylms-purple" />
                Sponsorship & Financial Support
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                {dynamicFields.filter(f => f.category === 'financial').map(field => (
                  <div key={field.field_key} className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-2 opacity-60 group-hover:text-mylms-purple transition-colors">
                      {field.label} {field.is_required && '*'}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-12 md:p-20 rounded-[60px] border border-border-soft shadow-2xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-all duration-[2s]"></div>
               <h2 className="text-4xl font-black text-text-main mb-16 tracking-tighter uppercase border-b-2 border-offwhite pb-12 flex items-center gap-6 relative z-10 italic leading-none">
                  <FileCheck size={32} className="text-mylms-rose" />
                  Proof of Evidence Protocol
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="p-10 bg-offwhite rounded-[40px] border-2 border-border-soft hover:border-mylms-purple transition-all group/file shadow-inner">
                     <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10 group-hover/file:text-mylms-purple flex items-center gap-3 transition-colors">
                        <Upload size={18} className="opacity-40" />
                        Academic Transcript (PDF/JPG)
                     </p>
                     <input 
                       type="file" 
                       required
                       accept=".pdf,.jpg,.png"
                       onChange={e => setFiles({...files, transcript: e.target.files?.[0] || null})}
                       className="w-full text-[10px] text-text-secondary file:mr-8 file:py-4 file:px-10 file:rounded-3xl file:border-0 file:text-[10px] file:font-black file:bg-mylms-purple file:text-white hover:file:bg-mylms-purple/90 transition-all uppercase tracking-widest cursor-pointer font-black"
                     />
                  </div>
                  <div className="p-10 bg-offwhite rounded-[40px] border-2 border-border-soft hover:border-mylms-purple transition-all group/file shadow-inner">
                     <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10 group-hover/file:text-mylms-purple flex items-center gap-3 transition-colors">
                        <Upload size={18} className="opacity-40" />
                        National Identity Matrix
                     </p>
                     <input 
                       type="file" 
                       required
                       accept=".pdf,.jpg,.png"
                       onChange={e => setFiles({...files, id_proof: e.target.files?.[0] || null})}
                       className="w-full text-[10px] text-text-secondary file:mr-8 file:py-4 file:px-10 file:rounded-3xl file:border-0 file:text-[10px] file:font-black file:bg-mylms-purple file:text-white hover:file:bg-mylms-purple/90 transition-all uppercase tracking-widest cursor-pointer font-black"
                     />
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* STEP 5: GATEWAY SELECTION & FINALIZATION */}
        {step === 5 && (
          <div className="space-y-16">
            <div className="bg-white p-12 md:p-20 rounded-[60px] border border-border-soft shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-all duration-[2s]"></div>
              <h2 className="text-4xl font-black text-text-main mb-16 tracking-tighter uppercase border-b-2 border-offwhite pb-12 flex items-center gap-6 relative z-10 italic leading-none">
                <ShieldCheck size={32} className="text-mylms-rose" />
                Enrollment Fee Processing
              </h2>
              <div className="relative z-10 space-y-16">
                <div className="flex items-center justify-between p-10 bg-offwhite rounded-[40px] border-2 border-border-soft shadow-inner">
                   <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] leading-none">Registry Processing Fee</p>
                   <p className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none italic">$60.00 <span className="text-sm font-black text-gray-300 ml-2">USD</span></p>
                </div>
                <GatewaySelector selected={selectedGateway} onSelect={setSelectedGateway} />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Rail */}
        <div className="flex flex-col md:flex-row items-center gap-8 pt-12">
           {step > 1 && (
             <button 
              type="button"
              onClick={() => setStep(step - 1)}
              className="w-full md:w-auto px-16 py-8 bg-white border-2 border-border-soft text-mylms-purple font-black rounded-full hover:bg-offwhite transition-all shadow-xl uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-6 group"
             >
                <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                Previous Protocol
             </button>
           )}
           
           {step < 4 ? (
             <button 
              type="button"
              onClick={() => setStep(step + 1)}
              className="w-full flex-1 py-8 bg-mylms-purple text-white font-black rounded-full hover:bg-mylms-purple/90 transition-all shadow-[0_25px_60px_-15px_rgba(0,34,85,0.4)] uppercase tracking-[0.4em] text-[11px] active:scale-95 flex items-center justify-center gap-6 group"
             >
                Next Advancement Stage
                <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
             </button>
           ) : step === 4 ? (
             <button 
              type="submit" 
              disabled={loading}
              className="w-full flex-1 py-10 bg-mylms-rose text-white font-black rounded-full hover:bg-mylms-rose/90 transition-all shadow-[0_25px_60px_-15px_rgba(186,22,70,0.4)] uppercase tracking-[0.5em] text-[12px] disabled:opacity-50 active:scale-95 flex items-center justify-center gap-6 group"
             >
                {loading ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     Transmitting Registry Data...
                   </>
                ) : (
                   <>
                     Finalize Admissions Registry
                     <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                   </>
                )}
             </button>
           ) : (
             <button 
              type="button" 
              onClick={handleInitializePayment}
              disabled={loading}
              className="w-full flex-1 py-10 bg-mylms-purple text-white font-black rounded-full hover:bg-mylms-purple/90 transition-all shadow-[0_25px_60px_-15px_rgba(0,34,85,0.4)] uppercase tracking-[0.5em] text-[12px] disabled:opacity-50 active:scale-95 flex items-center justify-center gap-6 group"
             >
                {loading ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     Redirecting to Secured Gateway...
                   </>
                ) : (
                   <>
                     Complete {selectedGateway} Protocol
                     <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                   </>
                )}
             </button>
           )}
        </div>
      </form>
    </div>
  );
}

export default function AdmissionApplication() {
  return (
    <div className="min-h-screen bg-offwhite">
      <AdmissionFormWidget />
    </div>
  );
}
