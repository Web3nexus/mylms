import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  User,
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
  const [levels, setLevels] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scholarshipReason, setScholarshipReason] = useState('');
  const [waiverRequested, setWaiverRequested] = useState(false);
  const [waiverDelayMinutes, setWaiverDelayMinutes] = useState(5);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [enrollmentProtocol, setEnrollmentProtocol] = useState<{
    isOpen: boolean;
    startDate: string | null;
    endDate: string | null;
  } | null>(null);

  const [registryFields, setRegistryFields] = useState<any[]>([]);

  const token = useAuthStore(state => state.token);
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
    client.get('/active-degree-levels').then(res => setLevels(res.data));
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
      if (res.data.program?.degree_level) setSelectedLevel(res.data.program.degree_level);
      
      if (res.data.admission_fee_waiver_delay_minutes) {
        setWaiverDelayMinutes(res.data.admission_fee_waiver_delay_minutes);
      }

      if (res.data.waiver_requested_at && res.data.application_fee_status === 'pending') {
        setWaiverRequested(true);
        calculateRemainingTime(res.data.waiver_requested_at, res.data.admission_fee_waiver_delay_minutes || 5, res.data.server_time);
      }
    } catch (err) {
      console.error('Error fetching application:', err);
    }
  };

  const calculateRemainingTime = (requestedAt: string, delayMins: number, serverTimeStr?: string) => {
    const start = new Date(requestedAt).getTime();
    const expiry = start + (delayMins * 60 * 1000);
    const now = serverTimeStr ? new Date(serverTimeStr).getTime() : Date.now();
    const diff = Math.max(0, Math.floor((expiry - now) / 1000));
    setRemainingSeconds(diff);
  };

  // Persistency Sync: Load step data when step changes
  useEffect(() => {
    if (application?.step_data && currentStepId) {
      let data = { ...(application.step_data[currentStepId] || {}) };
      
      // Auto-populate 'course_interest' if we're on Scholastic History (academic_registry)
      if (currentStepId === 'academic_registry' && !data.course_interest && application.program?.name) {
          data.course_interest = application.program.name;
      }
      
      setFormData(data);
    }
  }, [currentStepId, application?.step_data, application?.program]);

  useEffect(() => {
    let timer: any;
    if (waiverRequested && remainingSeconds !== null && remainingSeconds >= 0) {
      timer = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            fetchApplication(); // Pull fresh fee status
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [waiverRequested, remainingSeconds]);

  // Periodic Polling specifically for Fee Status when waiting
  useEffect(() => {
    let polling: any;
    if (waiverRequested && remainingSeconds === 0 && !feeCleared) {
      polling = setInterval(() => fetchApplication(), 5000);
    }
    return () => clearInterval(polling);
  }, [waiverRequested, remainingSeconds, feeCleared]);

  // Handle Automatic Redirect after Fee Protocol Clearance
  useEffect(() => {
    if (feeCleared && (currentStepId === 'fee_protocol' || currentIndex === 1)) {
      setSearchParams({ step: 'program_selection' });
    }
  }, [feeCleared, currentStepId]);

  // Proactive Status Polling for Automated Redirection (Registry Review Phase)
  useEffect(() => {
    let pollingTimer: any;
    const isStationaryStatus = application?.status === 'submitted' || application?.status === 'pending' || application?.status === 'review';
    
    if (isStationaryStatus) {
      pollingTimer = setInterval(() => {
        fetchApplication();
      }, 60000); // Re-validate status every 60 seconds
    }
    
    return () => clearInterval(pollingTimer);
  }, [application?.status]);

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
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
      if (nextStepId) {
        setSearchParams({ step: nextStepId });
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
      await fetchApplication();
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

  const isGateOpen = enrollmentProtocol?.isOpen;

  // Enrollment Guard Screen
  if (!isGateOpen && enrollmentProtocol) {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl border border-border-soft shadow-2xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mylms-purple/5 rounded-bl-full" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-mylms-rose/10 text-mylms-rose rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Lock size={40} />
              </div>
              <h1 className="text-3xl font-black text-mylms-purple uppercase tracking-tight mb-4 italic">Enrollment Suspended</h1>
              <p className="text-text-secondary font-medium leading-relaxed mb-10 max-w-md mx-auto text-sm opacity-80">
                The academic registry has temporarily closed the enrollment gate.
              </p>
              <button onClick={() => navigate('/apply/dashboard')} className="px-10 py-4 bg-mylms-purple text-white font-black rounded-xl shadow-xl uppercase tracking-widest text-[10px]">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STATUS SCREENS (Auto-Redirection Logic) ────────────────────────────────
  if (application?.status === 'approved' || application?.user?.student_id) {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-white rounded-3xl border border-border-soft shadow-2xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-mylms-purple/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-green-500 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-white">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-mylms-purple uppercase tracking-tight mb-4 italic">Admission Offer Approved</h1>
              <p className="text-text-secondary font-medium leading-relaxed mb-8 text-sm opacity-80">
                The Academic Registry has confirmed your candidacy. Congratulations, you are now officially a student of the university.
              </p>

              <div className="p-8 bg-offwhite rounded-2xl border border-border-soft mb-8 grid grid-cols-2 gap-6 text-left shadow-inner">
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Matric Number</p>
                   <p className="text-lg font-black text-mylms-purple font-mono uppercase">{application?.user?.student_id || 'PROVISIONING...'}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Major Pursuit</p>
                   <p className="text-sm font-black text-text-main uppercase leading-tight">{application?.program?.name || 'Academic Core'}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/billing')} className="flex-1 bg-mylms-purple text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-3">
                  <CreditCard size={16} /> Pay Tuition & Synchronize
                </button>
                <button onClick={() => navigate('/apply/dashboard')} className="flex-1 bg-white border border-border-soft text-mylms-purple py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-offwhite transition-all shadow-sm active:scale-95">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (application?.status === 'submitted' || application?.status === 'pending') {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-white rounded-3xl border border-border-soft shadow-2xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-mylms-purple/3 to-mylms-rose/3 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-mylms-purple/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Clock size={40} className="text-mylms-purple animate-pulse" />
              </div>
              <h1 className="text-3xl font-black text-mylms-purple uppercase tracking-tight mb-4 italic leading-tight">Registry Review<br />In Progress</h1>
              <p className="text-text-secondary font-medium leading-relaxed mb-8 text-sm opacity-80">
                Your application has been received and is currently passing through the institutional evaluation protocol.
              </p>

              <div className="inline-flex items-center gap-4 bg-offwhite px-8 py-3 rounded-full border border-border-soft mb-12">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Awaiting Quorum Decision</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => navigate('/apply/dashboard')} className="bg-mylms-purple text-white px-12 py-5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:opacity-90 transition-all active:scale-95">
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submissionResult) {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl border border-border-soft shadow-2xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-mylms-purple/3 to-mylms-rose/3 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-white">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-mylms-purple uppercase tracking-tight mb-4 italic">Application Transmitted!</h1>
              <p className="text-text-secondary font-medium leading-relaxed mb-10 text-sm opacity-80">
                Your scholastic profile is now in the registry. Our admissions team will notify you via the institutional mail protocol once reviewed.
              </p>
              <button onClick={() => navigate('/apply/dashboard')} className="bg-mylms-purple text-white px-12 py-5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:opacity-90 transition-all active:scale-95">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── FEE GATE LOCKDOWN ─────────────────────────────────────────────────────
  const isAfterPhase1 = currentIndex > 0;
  if (isAfterPhase1 && !feeCleared && currentStepId !== 'identity_verification') {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-700">
          <button onClick={() => setSearchParams({ step: 'identity_verification' })} className="flex items-center gap-3 text-gray-400 hover:text-mylms-purple transition-colors mb-12 font-black text-xs uppercase tracking-widest">
            <ArrowLeft size={16} /> Edit Phase 1 Details
          </button>
          <div className="bg-white rounded-3xl border border-border-soft shadow-2xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mylms-rose/5 rounded-bl-full pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-mylms-purple/10 text-mylms-purple rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CreditCard size={40} />
              </div>
              <h1 className="text-3xl font-black text-mylms-purple uppercase tracking-tight mb-4 italic leading-tight">Application Gate Lockdown</h1>
              <p className="text-text-secondary font-medium leading-relaxed mb-10 text-sm opacity-70">
                Your Phase 1 data has been secured. To proceed, the application fee protocol must be satisfied.
              </p>
              {error && (
                <div className="mb-8 p-5 bg-mylms-rose/5 border border-mylms-rose/20 rounded-2xl flex items-center gap-4 text-mylms-rose text-xs font-black uppercase tracking-widest">
                  <AlertCircle size={18} />{error}
                  <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
                </div>
              )}
              {waiverRequested ? (
                <div className="p-8 bg-offwhite border-2 border-border-soft rounded-3xl text-center max-w-md mx-auto relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 overflow-hidden">
                     <div 
                        className="h-full bg-mylms-rose transition-all duration-1000 ease-linear" 
                        style={{ width: `${remainingSeconds !== null ? (1 - remainingSeconds / (waiverDelayMinutes * 60)) * 100 : 0}%` }}
                     />
                  </div>
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <Clock size={32} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-mylms-rose ${remainingSeconds !== 0 ? 'animate-pulse' : ''}`} />
                  </div>
                  <h3 className="text-sm font-black text-mylms-purple uppercase tracking-tight mb-4 italic">
                    {remainingSeconds === 0 ? 'Protocol Satisfied' : 'Wait Period Active'}
                  </h3>
                  <div className="flex flex-col items-center justify-center gap-1 mb-6">
                    <p className={`text-2xl font-black tabular-nums transition-colors ${remainingSeconds === 0 ? 'text-green-600' : 'text-mylms-purple'}`}>
                      {remainingSeconds !== null ? `${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')}` : '--:--'}
                    </p>
                  </div>
                  {feeCleared ? (
                     <button onClick={() => setSearchParams({ step: 'program_selection' })} className="w-full bg-green-600 text-white py-5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:brightness-110 animate-bounce">
                        Continue to Registry
                     </button>
                  ) : (
                    <button 
                      onClick={() => fetchApplication()} 
                      disabled={loading}
                      className="w-full bg-white border border-border-soft text-mylms-purple py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-offwhite transition-all shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Re-validating Protocol...' : 'Sync Status Now'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handlePayFee} disabled={saving} className="flex-1 py-5 bg-mylms-purple text-white font-black rounded-xl shadow-lg uppercase tracking-widest text-[10px] active:scale-95">
                    Pay Fee
                  </button>
                  <button onClick={handleRequestWaiver} disabled={saving} className="flex-1 py-5 bg-white border-2 border-border-soft text-mylms-purple font-black rounded-xl uppercase tracking-widest text-[10px] active:scale-95">
                    Request Waiver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN WIZARD ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Mini Header */}
      <div className="bg-white border-b border-border-soft px-8 py-6 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/apply/dashboard')} className="p-3 rounded-full hover:bg-offwhite transition-all text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-mylms-purple uppercase tracking-tight italic">My Application</h1>
        </div>
        <div className="flex items-center gap-3 bg-offwhite px-4 py-2 rounded-full border border-border-soft">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Auto-save Active</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="hidden lg:flex w-80 bg-white border-r border-border-soft flex-col p-10 overflow-y-auto">
          <nav className="space-y-4">
            {steps.map((s, idx) => {
              const isActive = s.id === currentStepId;
              const isDone = s.isGate ? feeCleared : !!application?.step_data?.[s.id];
              return (
                <button
                  key={idx}
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
                    <p className={`text-[11px] font-black uppercase tracking-tight italic ${isActive ? 'text-white' : 'text-text-main'}`}>{s?.title}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16 selection:bg-mylms-rose/10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-mylms-purple tracking-tight uppercase italic leading-none">
                {steps[currentIndex]?.title}
              </h2>
            </div>

            {error && (
              <div className="mb-10 p-6 bg-mylms-rose/5 border border-mylms-rose/20 rounded-2xl flex items-center gap-4 text-mylms-rose text-sm font-black uppercase tracking-widest">
                <AlertCircle size={20} />
                {error}
                <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
              </div>
            )}

            <div className="bg-white p-8 md:p-12 rounded-3xl border border-border-soft shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {registryFields
                    .filter(f => currentStep?.categories?.includes(f.category))
                    .map((field, fidx) => (
                      <div key={fidx} className={`${field.type === 'textarea' || field.category === 'documents' ? 'md:col-span-2' : ''}`}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">
                          {field.label} {field.is_required && <span className="text-mylms-rose">*</span>}
                        </label>
                        
                        {field.type === 'text' && (
                          <input 
                            type="text" 
                            name={field.field_key} 
                            value={formData[field.field_key] || ''} 
                            onChange={handleInputChange} 
                            className="w-full p-5 bg-offwhite border-2 border-border-soft rounded-2xl outline-none focus:border-mylms-purple transition-all font-black text-mylms-purple text-xs uppercase" 
                          />
                        )}

                        {field.type === 'select' && (
                          <select 
                            name={field.field_key} 
                            value={formData[field.field_key] || ''} 
                            onChange={handleInputChange} 
                            className="w-full p-5 bg-offwhite border-2 border-border-soft rounded-2xl outline-none focus:border-mylms-purple transition-all font-black text-mylms-purple text-xs uppercase"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((o: string) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                          </select>
                        )}

                        {field.type === 'date' && (
                          <input type="date" name={field.field_key} value={formData[field.field_key] || ''} onChange={handleInputChange} className="w-full p-5 bg-offwhite border-2 border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-black text-mylms-purple text-xs uppercase" />
                        )}

                        {field.type === 'number' && (
                          <input type="number" name={field.field_key} value={formData[field.field_key] || ''} onChange={handleInputChange} className="w-full p-5 bg-offwhite border-2 border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-black text-mylms-purple text-xs uppercase" />
                        )}

                        {field.type === 'textarea' && (
                          <textarea 
                            name={field.field_key} 
                            value={formData[field.field_key] || ''} 
                            onChange={handleInputChange} 
                            rows={3}
                            className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-medium text-text-main text-xs" 
                          />
                        )}

                        {field.type === 'file' && (
                          <div className={`p-8 bg-offwhite rounded-3xl border-2 transition-all ${application?.documents?.[field.field_key] ? 'border-green-200' : 'border-border-soft'}`}>
                            {application?.documents?.[field.field_key] ? (
                              <div className="flex items-center gap-4 bg-green-50/50 p-3 rounded-xl">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Secured</span>
                                <input type="file" onChange={(e) => handleFileChange(e, field.field_key)} className="hidden" id={`file-${field.field_key}`} />
                                <label htmlFor={`file-${field.field_key}`} className="ml-auto text-[8px] font-black text-mylms-purple uppercase underline cursor-pointer">Update</label>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center py-2">
                                <FileUp size={24} className="text-gray-300 mb-3" />
                                <input type="file" onChange={(e) => handleFileChange(e, field.field_key)} className="w-full text-[9px] font-black uppercase tracking-widest file:bg-mylms-purple/10 file:text-mylms-purple file:px-4 file:py-2 file:rounded-lg file:border-0 cursor-pointer" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {currentStepId === 'program_selection' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Degree Level</label>
                        <select
                          value={selectedLevel}
                          onChange={(e) => { setSelectedLevel(e.target.value); setFormData({...formData, program_id: ''}); }}
                          className="w-full p-5 bg-offwhite border-2 border-border-soft rounded-2xl font-black text-mylms-purple text-xs uppercase"
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
                          className="w-full p-5 bg-offwhite border-2 border-border-soft rounded-2xl font-black text-mylms-purple text-xs uppercase disabled:opacity-30"
                        >
                          <option value="">-- {selectedLevel ? 'SELECT PROGRAM' : 'SELECT LEVEL FIRST'} --</option>
                          {availablePrograms.map(p => (
                            <option key={p.id} value={p.id}>{p?.name.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepId === 'final_review' && (
                  <div className="space-y-10">
                    <div className="p-8 bg-offwhite rounded-3xl border border-border-soft">
                      <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-6 italic">Submission Protocol Readiness</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                          <span className="text-text-secondary opacity-40">Candidate</span>
                          <span className="text-mylms-purple">{application?.step_data?.personal_info?.full_name || 'Protocol Anonymous'}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                          <span className="text-text-secondary opacity-40">Target Degree</span>
                          <span className="text-mylms-purple">{application?.program?.name || 'Not selected'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-mylms-purple/5 border-2 border-mylms-purple/15 rounded-3xl">
                      <h4 className="text-sm font-black text-mylms-purple uppercase tracking-tight mb-4">Scholarship Application (Optional)</h4>
                      <textarea
                        value={scholarshipReason}
                        onChange={(e) => setScholarshipReason(e.target.value)}
                        rows={5}
                        placeholder="Why do you need financial support?..."
                        className="w-full p-6 bg-white border-2 border-border-soft rounded-2xl font-medium text-text-main text-sm"
                      />
                    </div>

                    <button
                      onClick={submitApplication}
                      disabled={saving}
                      className="w-full py-6 bg-mylms-purple text-white font-black rounded-full shadow-lg uppercase tracking-widest text-[12px] active:scale-95 transition-all"
                    >
                      {saving ? 'Transmitting...' : 'Transmit Official Application'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {currentStepId !== 'final_review' && (
              <div className="mt-12 flex flex-col md:flex-row gap-6">
                {prevStep && (
                  <button
                    onClick={() => { saveStep(prevStep.id); }}
                    className="w-full md:w-auto px-10 py-5 bg-white border-2 border-border-soft text-mylms-purple font-black rounded-xl hover:bg-offwhite transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-4"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
                {nextStep && (
                  <button
                    onClick={() => { saveStep(nextStep.id); }}
                    disabled={saving}
                    className="w-full flex-1 py-6 bg-mylms-purple text-white font-black rounded-2xl hover:brightness-110 transition-all shadow-xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-6"
                  >
                    {saving ? 'Saving...' : `Proceed to ${nextStep?.title}`}
                    <ChevronRight size={18} />
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
