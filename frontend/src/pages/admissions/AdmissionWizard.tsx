import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle,
  Save,
  ArrowLeft,
  X,
  AlertCircle,
  ShieldCheck,
  Heart,
  ArrowRight,
  Database,
  CreditCard,
  Sparkles,
  Clock,
  Calendar,
  Lock,
  FileUp
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function AdmissionWizard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStepId = searchParams.get('step') || 'identity_verification';
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [levels] = useState(['Associate', 'Bachelor', 'Master', 'PhD']);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scholarshipReason, setScholarshipReason] = useState('');
  const [waiverRequested, setWaiverRequested] = useState(false);
  const [waiverDelayMinutes, setWaiverDelayMinutes] = useState(5);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [enrollmentProtocol, setEnrollmentProtocol] = useState<{
    isOpen: boolean;
    startDate: string | null;
    endDate: string | null;
  } | null>(null);

  const [registryFields, setRegistryFields] = useState<any[]>([]);

  const token = useAuthStore(state => state.token);
  const phase1Done = application?.step_data?.identity_verification;
  const feeCleared = application?.application_fee_status === 'waived' || application?.application_fee_status === 'paid';

  const steps = [
    { id: 'identity_verification', title: 'Bio-Data Registry', icon: <User size={18} />, categories: ['personal', 'contact'] },
    { id: 'fee_protocol', title: 'Fee Gateway', icon: <CreditCard size={18} />, isGate: true },
    { id: 'program_selection', title: 'Academic Pursuit', icon: <GraduationCap size={18} /> },
    { id: 'academic_registry', title: 'Scholastic History', icon: <FileText size={18} />, categories: ['academic', 'financial'] },
    { id: 'institutional_context', title: 'Cultural Integration', icon: <Heart size={18} />, categories: ['membership'] },
    { id: 'credentials_setup', title: 'Portal Credentials', icon: <ShieldCheck size={18} />, categories: ['credentials'] },
    { id: 'document_upload', title: 'Evidence Bunker', icon: <Upload size={18} />, categories: ['documents'] },
    { id: 'final_review', title: 'Final Transmission', icon: <CheckCircle size={18} /> },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStepId);
  const currentStep = currentIndex !== -1 ? steps[currentIndex] : steps[0];
  const nextStep = currentIndex !== -1 ? steps[currentIndex + 1] : null;
  const prevStep = currentIndex !== -1 ? steps[currentIndex - 1] : null;

  const [formData, setFormData] = useState<any>({});

  useEffect(() => { 
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchApplication(), fetchProtocol(), fetchRegistry()]);
      setLoading(false);
    };
    init();
  }, [token]);

  useEffect(() => {
    if (selectedLevel) {
      client.get(`/programs-by-level/${selectedLevel}`).then(res => setAvailablePrograms(res.data));
    }
  }, [selectedLevel]);

  const fetchApplication = async () => {
    try {
      const res = await client.get('/my-application');
      setApplication(res.data);
      const currentData = res.data.step_data?.[currentStepId] || {};
      setFormData(currentData);
      if (res.data.program?.degree_level) setSelectedLevel(res.data.program.degree_level);
    } catch (err) {
      console.error('Error fetching application:', err);
    }
  };

  const fetchProtocol = async () => {
    try {
      const res = await client.get('/admin/admissions/settings');
      setEnrollmentProtocol({
        isOpen: res.data.is_enrollment_open,
        startDate: res.data.enrollment_start_date,
        endDate: res.data.enrollment_end_date
      });
    } catch (err) {
      console.error('Error fetching protocol:', err);
    }
  };

  const fetchRegistry = async () => {
    try {
      const res = await client.get('/admissions/fields');
      setRegistryFields(res.data);
    } catch (err) {
      console.error('Error fetching registry:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const saveStep = async (nextStepId?: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await client.post('/admission/save-step', {
        step: currentStepId,
        step_data: formData,
      });
      setApplication(res.data.application);
      if (nextStepId) {
        setSearchParams({ step: nextStepId });
        setFormData(res.data.application?.step_data?.[nextStepId] || {});
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save progress.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const payload = new FormData();
    payload.append('type', fileKey);
    payload.append('file', file);
    setSaving(true);
    try {
      const res = await client.post('/admission/upload-document', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApplication(res.data.application);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePayFee = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await client.post('/admission/pay-fee');
      setApplication(res.data.application);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestWaiver = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await client.post('/admission/request-waiver');
      setWaiverRequested(true);
      setWaiverDelayMinutes(res.data.delay_minutes ?? 5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Waiver request failed.');
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await client.post('/admission/submit', {
        scholarship_reason: scholarshipReason,
      });
      setSubmissionResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const now = new Date();
  const isDateWindowOpen = enrollmentProtocol 
    ? (!enrollmentProtocol.startDate || now >= new Date(enrollmentProtocol.startDate)) && 
      (!enrollmentProtocol.endDate || now <= new Date(enrollmentProtocol.endDate))
    : true;
  
  const isGateOpen = enrollmentProtocol?.isOpen && isDateWindowOpen;

  // Enrollment Guard Screen
  if (!isGateOpen && enrollmentProtocol) {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-[40px] border border-border-soft shadow-2xl p-10 md:p-20 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mylms-purple/5 rounded-bl-full group-hover:bg-mylms-purple/10 transition-all duration-1000" />
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-mylms-rose/10 text-mylms-rose rounded-[32px] flex items-center justify-center mx-auto mb-12 shadow-inner">
                <Lock size={48} />
              </div>

              <div className="inline-flex items-center gap-3 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px] mb-8 bg-mylms-rose/8 px-6 py-2 rounded-full border border-mylms-rose/20">
                Institutional Protocol: Closed
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-mylms-purple uppercase tracking-tighter leading-none mb-8 italic">
                Enrollment<br /><span className="text-mylms-rose">Suspended</span>
              </h1>
              
              <p className="text-text-secondary font-medium leading-relaxed mb-12 max-w-md mx-auto">
                The academic registry has temporarily closed the enrollment gate. This usually happens between sessions or when the quota quorum has been reached.
              </p>

              {enrollmentProtocol.startDate && new Date(enrollmentProtocol.startDate) > now && (
                <div className="p-8 bg-offwhite rounded-3xl border border-border-soft mb-12 inline-block">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">Scheduled Re-opening</p>
                  <div className="flex items-center gap-4 text-mylms-purple">
                    <Calendar size={20} />
                    <span className="text-xl font-black">{new Date(enrollmentProtocol.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <div>
                <button 
                  onClick={() => navigate('/apply/dashboard')}
                  className="px-12 py-5 bg-mylms-purple text-white font-black rounded-2xl shadow-xl uppercase tracking-[0.4em] text-[11px] hover:translate-y-[-2px] transition-all active:scale-[0.98]"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

    // Phase barrier logic below


  // ─── FEE GATE ───────────────────────────────────────────────────────────────
  // ─── FEE GATE LOGIC (Phase Barrier) ─────────────────────────────────────────
  const isAfterPhase1 = currentIndex > 0;
  if (isAfterPhase1 && !feeCleared && currentStepId !== 'identity_verification') {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-700">
          <button onClick={() => setSearchParams({ step: 'identity_verification' })} className="flex items-center gap-3 text-gray-400 hover:text-mylms-purple transition-colors mb-12 font-black text-xs uppercase tracking-widest">
            <ArrowLeft size={16} /> Edit Phase 1 Details
          </button>

          <div className="bg-white rounded-[40px] border border-border-soft shadow-2xl p-10 md:p-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mylms-rose/5 rounded-bl-full pointer-events-none group-hover:bg-mylms-rose/10 transition-all duration-1000" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-mylms-purple/10 text-mylms-purple rounded-[28px] flex items-center justify-center mb-10 shadow-inner">
                <CreditCard size={40} />
              </div>

              <div className="inline-flex items-center gap-3 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px] mb-6 bg-mylms-rose/8 px-5 py-2 rounded-full border border-mylms-rose/20">
                <Sparkles size={12} /> Fee Protocol Activation
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-mylms-purple uppercase tracking-tighter leading-none mb-6 italic">
                Application<br /><span className="text-mylms-rose">Gate</span> Lockdown
              </h1>
              <p className="text-text-secondary font-medium leading-relaxed mb-10 max-w-lg italic opacity-70">
                Your Phase 1 Bio-Data has been secured. To proceed with the Scholastic Registry and Document Bunker, the application fee protocol must be satisfied.
              </p>

              {error && (
                <div className="mb-8 p-5 bg-mylms-rose/5 border border-mylms-rose/20 rounded-2xl flex items-center gap-4 text-mylms-rose text-xs font-black uppercase tracking-widest">
                  <AlertCircle size={18} />{error}
                  <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
                </div>
              )}

              {waiverRequested ? (
                <div className="p-8 bg-amber-50 border-2 border-amber-200 rounded-[28px] text-center">
                  <Clock size={40} className="text-amber-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-black text-amber-800 uppercase tracking-tight mb-2 italic">Standard Wait Period Active</h3>
                  <p className="text-amber-700 font-medium text-sm leading-relaxed">
                    Your fee waiver is being processed by the institutional protocol. Access to Phase 2 will unlock automatically in approximately <strong>{waiverDelayMinutes} minutes</strong>.
                  </p>
                  <button onClick={() => fetchApplication()} className="mt-8 bg-amber-500 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-lg active:scale-95">
                    Check Protocol Status
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    onClick={handlePayFee}
                    disabled={saving}
                    className="flex-1 py-6 bg-mylms-purple text-white font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,34,85,0.4)] uppercase tracking-[0.3em] text-[11px] hover:translate-y-[-2px] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    <CreditCard size={20} />
                    {saving ? 'Processing...' : 'Pay Protocol Fee'}
                  </button>
                  <button
                    onClick={handleRequestWaiver}
                    disabled={saving}
                    className="flex-1 py-6 bg-white border-2 border-border-soft text-mylms-purple font-black rounded-2xl uppercase tracking-[0.3em] text-[11px] hover:border-mylms-purple/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    <Heart size={20} />
                    Request Waiver Wait
                  </button>
                </div>
              )}

              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-10 opacity-50 italic">
                Fee waivers are reviewed in real-time. Document Phase follows this gateway.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUBMISSION SUCCESS ─────────────────────────────────────────────────────
  if (submissionResult) {
    const scholarshipApproved = submissionResult.scholarship_status === 'approved';
    return (
      <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-[40px] border border-border-soft shadow-2xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-mylms-purple/3 to-mylms-rose/3 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h1 className="text-4xl font-black text-mylms-purple uppercase tracking-tighter mb-4">Application Submitted!</h1>
              <p className="text-text-secondary font-medium leading-relaxed mb-10">
                Your application is now under review. Our admissions team will contact you soon.
              </p>

              {scholarshipApproved && submissionResult.scholarship_provider && (
                <div className="p-8 bg-amber-50 border-2 border-amber-200 rounded-[28px] mb-10 text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <Sparkles size={24} className="text-amber-500" />
                    <h3 className="font-black text-amber-800 uppercase tracking-tight text-sm">Scholarship Approved!</h3>
                  </div>
                  <p className="text-amber-700 font-medium text-sm leading-relaxed">
                    Based on your scholarship application, you have been identified as eligible for funding. Your scholarship is sponsored by:
                  </p>
                  <p className="text-2xl font-black text-amber-800 uppercase tracking-tighter mt-4">
                    {submissionResult.scholarship_provider}
                  </p>
                </div>
              )}

              <button onClick={() => navigate('/apply/dashboard')} className="bg-mylms-purple text-white px-12 py-5 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:opacity-90 transition-all active:scale-95">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Mini Header */}
      <div className="bg-white border-b border-border-soft px-8 py-6 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/apply/dashboard')} className="p-3 rounded-full hover:bg-offwhite transition-all text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-mylms-purple uppercase tracking-tight">Admission Wizard</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 bg-offwhite px-4 py-2 rounded-full border border-border-soft">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Auto-save Active</span>
          </div>
          {/* Fee cleared badge */}
          <div className="hidden md:flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full border border-green-200">
            <ShieldCheck size={14} className="text-green-600" />
            <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">
              Fee {application?.application_fee_status === 'waived' ? 'Waived' : 'Paid'}
            </span>
          </div>
          <button onClick={() => saveStep()} className="p-3 bg-mylms-purple/5 text-mylms-purple rounded-xl hover:bg-mylms-purple/10 transition-all">
            <Save size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="hidden lg:flex w-80 bg-white border-r border-border-soft flex-col p-10 overflow-y-auto">
          <div className="mb-10">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Application Progress</p>
            <div className="h-1.5 w-full bg-offwhite rounded-full overflow-hidden">
              <div className="h-full bg-mylms-rose transition-all duration-1000" style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}></div>
            </div>
          </div>
          <nav className="space-y-4">
            {steps.map((s, idx) => {
              const isActive = s.id === currentStepId;
              const isDone = application?.step_data?.[s.id];
              return (
                <button
                  key={s.id}
                  onClick={() => { if (isDone || isActive || idx <= currentIndex) saveStep(s.id); }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 group ${
                    isActive ? 'bg-mylms-purple text-white border-mylms-purple shadow-xl' :
                    isDone ? 'bg-green-50 text-green-700 border-green-100' :
                    'bg-white text-gray-400 border-border-soft hover:border-mylms-purple/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? 'bg-white/20 text-white' :
                    isDone ? 'bg-green-100 text-green-600' :
                    'bg-offwhite text-gray-300 group-hover:text-mylms-purple'
                  }`}>
                    {isDone && !isActive ? <CheckCircle size={16} /> : s.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-0.5">Section {idx + 1}</p>
                    <p className={`text-[11px] font-black uppercase tracking-tight ${isActive ? 'text-white' : 'text-text-main'}`}>{s.title}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16 selection:bg-mylms-rose/10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-16">
              <div className="inline-flex items-center gap-4 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px] mb-6">
                <span className="w-10 h-px bg-mylms-rose"></span>
                Current Protocol Stage
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-mylms-purple tracking-tighter uppercase italic leading-[0.9]">
                {steps[currentIndex].title}
              </h2>
            </div>

            {error && (
              <div className="mb-10 p-6 bg-mylms-rose/5 border border-mylms-rose/20 rounded-2xl flex items-center gap-4 text-mylms-rose text-sm font-black uppercase tracking-widest animate-in slide-in-from-top-4">
                <AlertCircle size={20} />
                {error}
                <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
              </div>
            )}

            <div className="bg-white p-10 md:p-16 rounded-[40px] border border-border-soft shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-all duration-1000"></div>

              <div className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {registryFields
                    .filter(f => steps[currentIndex].categories?.includes(f.category))
                    .map(field => (
                      <div key={field.id} className={`${field.type === 'textarea' || field.category === 'documents' ? 'md:col-span-2' : ''}`}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">
                          {field.label} {field.is_required && <span className="text-mylms-rose">*</span>}
                        </label>
                        
                        {field.type === 'text' && (
                          <input 
                            type="text" 
                            name={field.field_key} 
                            value={formData[field.field_key] || ''} 
                            onChange={handleInputChange} 
                            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-rose transition-all font-black text-mylms-purple text-xs uppercase" 
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}

                        {field.type === 'select' && (
                          <select 
                            name={field.field_key} 
                            value={formData[field.field_key] || ''} 
                            onChange={handleInputChange} 
                            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-rose transition-all font-black text-mylms-purple text-xs uppercase shadow-inner"
                          >
                            <option value="">-- Select {field.label} --</option>
                            {field.options?.map((o: string) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                          </select>
                        )}

                        {field.type === 'date' && (
                          <input 
                            type="date" 
                            name={field.field_key} 
                            value={formData[field.field_key] || ''} 
                            onChange={handleInputChange} 
                            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-rose transition-all font-black text-mylms-purple text-xs uppercase shadow-inner"
                          />
                        )}

                        {field.type === 'number' && (
                          <input 
                            type="number" 
                            name={field.field_key} 
                            value={formData[field.field_key] || ''} 
                            onChange={handleInputChange} 
                            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-rose transition-all font-black text-mylms-purple text-xs uppercase shadow-inner"
                          />
                        )}

                        {field.type === 'textarea' && (
                          <textarea 
                            name={field.field_key} 
                            value={formData[field.field_key] || ''} 
                            onChange={handleInputChange} 
                            rows={4}
                            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-rose transition-all font-medium text-text-main text-sm shadow-inner"
                            placeholder={`Describe ${field.label.toLowerCase()}...`}
                          />
                        )}

                        {field.type === 'file' && (
                          <div className={`p-10 bg-offwhite rounded-[40px] border-2 transition-all group/file shadow-inner relative overflow-hidden ${application?.documents?.[field.field_key] ? 'border-green-200' : 'border-border-soft hover:border-mylms-rose'}`}>
                            <div className="relative z-10">
                              {application?.documents?.[field.field_key] ? (
                                <div className="flex items-center gap-6 bg-green-50/50 p-4 rounded-2xl">
                                  <CheckCircle size={20} className="text-green-600" />
                                  <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{field.label} Secured</span>
                                  <input type="file" onChange={(e) => handleFileChange(e, field.field_key)} className="hidden" id={`file-${field.field_key}`} />
                                  <label htmlFor={`file-${field.field_key}`} className="ml-auto text-[9px] font-black text-mylms-purple uppercase tracking-widest cursor-pointer underline hover:text-mylms-rose">Replace</label>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center py-4">
                                  <FileUp size={32} className="text-gray-300 mb-6 group-hover/file:text-mylms-rose transition-colors" />
                                  <input type="file" onChange={(e) => handleFileChange(e, field.field_key)} className="w-full text-[10px] font-black uppercase tracking-widest file:bg-mylms-purple file:text-white file:px-8 file:py-3 file:rounded-xl file:border-0 file:mr-6 cursor-pointer" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* PROGRAM SELECTION - Special Logic Override */}
                {currentStepId === 'program_selection' && (
                  <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 bg-mylms-purple/5 border-2 border-mylms-purple/10 rounded-[32px] flex items-center gap-8">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-mylms-purple shadow-sm"><GraduationCap size={32}/></div>
                      <div>
                        <h4 className="text-sm font-black text-mylms-purple uppercase tracking-tight italic">Enrollment Pursuit</h4>
                        <p className="text-[10px] font-medium text-text-secondary opacity-60 uppercase tracking-widest mt-1">Authorized Phase 2: Select your academic destination.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Degree Level</label>
                        <select
                          value={selectedLevel}
                          onChange={(e) => { setSelectedLevel(e.target.value); setFormData({...formData, program_id: ''}); }}
                          className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-rose transition-all font-black text-mylms-purple text-xs uppercase shadow-inner"
                        >
                          <option value="">-- SELECT LEVEL --</option>
                          {levels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Academic Program</label>
                        <select
                          name="program_id"
                          value={formData.program_id || ''}
                          onChange={handleInputChange}
                          disabled={!selectedLevel}
                          className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-rose transition-all font-black text-mylms-purple text-xs uppercase shadow-inner disabled:opacity-30"
                        >
                          <option value="">-- {selectedLevel ? 'SELECT PROGRAM' : 'SELECT LEVEL FIRST'} --</option>
                          {availablePrograms.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {formData.program_id && (
                      <div className="p-10 bg-offwhite rounded-[40px] border border-border-soft flex items-center justify-between border-l-8 border-l-mylms-rose animate-in slide-in-from-left duration-700 shadow-inner">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Institutional Context</p>
                          <p className="text-sm font-black text-text-main uppercase tracking-tight">
                            {availablePrograms.find(p => p.id.toString() === formData.program_id.toString())?.department?.faculty?.name || 'Loading Faculty...'}
                          </p>
                        </div>
                        <ShieldCheck className="text-mylms-rose opacity-40" size={32} />
                      </div>
                    )}
                  </div>
                )}

                {/* FINAL REVIEW + SCHOLARSHIP */}
                {currentStepId === 'final_review' && (
                  <div className="space-y-12">
                    {/* Summary */}
                    <div>
                      <div className="w-20 h-20 bg-mylms-rose/10 text-mylms-rose rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                        <ShieldCheck size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter mb-4 italic">Submission Protocol Readiness</h3>
                      <p className="text-text-secondary font-medium leading-relaxed max-w-lg opacity-60 italic font-sans">
                        Review your candidacy profile before final transmission.
                      </p>
                    </div>

                    <div className="p-8 bg-offwhite rounded-[28px] border border-border-soft text-left shadow-inner">
                      <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Protocol Metadata</p>
                        <span className="bg-green-100 text-green-700 text-[8px] font-black px-3 py-1 rounded-full uppercase">Valid</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                          <span className="text-text-secondary opacity-40">Candidate</span>
                          <span className="text-mylms-purple">{application?.step_data?.personal_info?.full_name || 'Protocol Anonymous'}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                          <span className="text-text-secondary opacity-40">Target Degree</span>
                          <span className="text-mylms-purple">{application?.program?.name || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                          <span className="text-text-secondary opacity-40">Fee Status</span>
                          <span className="text-green-600">{application?.application_fee_status === 'waived' ? '✓ Waived' : '✓ Paid'}</span>
                        </div>
                      </div>
                    </div>

                    {/* SCHOLARSHIP REASON - Key Feature */}
                    <div className="p-8 bg-mylms-purple/5 border-2 border-mylms-purple/15 rounded-[28px]">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-mylms-purple rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                          <Heart size={22} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-mylms-purple uppercase tracking-tight">Scholarship Application</h4>
                          <p className="text-[10px] font-medium text-text-secondary opacity-60 uppercase tracking-widest mt-1">Optional — but strongly encouraged</p>
                        </div>
                      </div>
                      <p className="text-text-secondary font-medium text-sm leading-relaxed mb-8">
                        Tell us why you need financial support. A compelling statement (50+ words mentioning your personal goals, challenges, and community impact) is <strong className="text-mylms-purple">automatically evaluated</strong> by our scholarship engine. Approved applicants are sponsored by our partners:
                        <strong className="text-mylms-purple"> Hudorian Trust</strong> &amp; <strong className="text-mylms-purple">The Maart</strong>.
                      </p>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Why do you need a scholarship?</label>
                      <textarea
                        value={scholarshipReason}
                        onChange={(e) => setScholarshipReason(e.target.value)}
                        rows={6}
                        placeholder="Describe your financial situation, academic goals, and how this scholarship would transform your future and community..."
                        className="w-full p-6 bg-white border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple transition-all font-medium text-text-main text-sm leading-relaxed resize-none"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Word count: {scholarshipReason.trim() ? scholarshipReason.trim().split(/\s+/).length : 0}
                          {scholarshipReason.trim().split(/\s+/).length >= 50 && <span className="text-green-600 ml-2">✓ Strong</span>}
                        </p>
                        <p className="text-[9px] font-medium text-gray-400">Leaving blank skips the scholarship evaluation</p>
                      </div>
                    </div>

                    <button
                      onClick={submitApplication}
                      disabled={saving}
                      className="w-full py-8 bg-gradient-to-r from-mylms-purple to-mylms-rose text-white font-black rounded-full shadow-[0_20px_50px_-15px_rgba(186,22,70,0.4)] uppercase tracking-[0.5em] text-[12px] active:scale-95 transition-all flex items-center justify-center gap-6 group hover:brightness-110 disabled:opacity-50"
                    >
                      {saving ? 'Transmitting Data...' : (
                        <>
                          Transmit Official Application
                          <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* NAV BUTTONS */}
            {currentStepId !== 'final_review' && (
              <div className="mt-16 flex flex-col md:flex-row gap-8">
                {prevStep && (
                  <button
                    onClick={() => { saveStep(prevStep.id); }}
                    className="w-full md:w-auto px-12 py-6 bg-white border-2 border-border-soft text-mylms-purple font-black rounded-xl hover:bg-offwhite transition-all uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 group"
                  >
                    <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                    Back: {prevStep.title}
                  </button>
                )}
                {nextStep && (
                  <button
                    onClick={() => { saveStep(nextStep.id); }}
                    disabled={saving}
                    className="w-full flex-1 py-8 bg-mylms-purple text-white font-black rounded-xl hover:bg-mylms-purple/90 transition-all shadow-[0_20px_50px_-10px_rgba(0,34,85,0.4)] uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-6 group active:scale-95 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Securing Data...
                      </>
                    ) : (
                      <>
                        Proceed to {nextStep.title}
                        <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
