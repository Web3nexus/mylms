import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useAppConfig } from '../../hooks/useAppConfig';
import AcademicCalendarManager from './AcademicCalendarManager';
import AdmissionRegistryManager from './AdmissionRegistryManager';
import { 
  Settings, 
  Layers, 
  ChevronRight, 
  PlusCircle, 
  Trash2, 
  ArrowRight,
  Database,
  Calendar,
  Building,
  Hash,
  XCircle,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  Target,
  Sparkles,
  Heart,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  ToggleRight,
  Lock,
  Zap,
  Activity,
  Edit
} from 'lucide-react';

interface Program {
  id: number;
  name: string;
  degree_level: string;
  duration_years: number;
  pricing_type: string;
  tuition_fee: string;
  application_fee: string;
  certificate_fee: string;
  is_scholarship_eligible: boolean;
  is_external: boolean;
  external_provider: string | null;
}

interface Department {
  id: number;
  name: string;
  code: string;
  programs: Program[];
}

interface Faculty {
  id: number;
  name: string;
  code: string;
  description: string;
  departments: Department[];
}

export default function AcademicManager() {
  const { appName } = useAppConfig();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFaculty, setNewFaculty] = useState({ name: '', description: '', code: '' });
  const [newDept, setNewDept] = useState({ name: '', code: '' });
  const [newProg, setNewProg] = useState({ 
    name: '', 
    degree_level: 'BSc', 
    duration_years: 4,
    pricing_type: 'hybrid',
    tuition_fee: '0',
    application_fee: '0',
    certificate_fee: '0',
    is_scholarship_eligible: true,
    is_external: false,
    external_provider: ''
  });

  const [settings, setSettings] = useState({
    admission_fee_waiver_delay_minutes: 5,
    scholarship_auto_approval: true,
    admission_email_delay_hours: 24,
    scholarship_renewal_min_gpa: 2.0,
    is_enrollment_open: true,
    enrollment_start_date: '',
    enrollment_end_date: '',
    enrollment_quota: 1000
  });

  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  const [syncing, setSyncing] = useState(false);
  
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mode: 'add_faculty' | 'edit_faculty' | 'add_department' | 'edit_department' | 'add_program' | 'edit_program' | 'delete' | null;
    type?: 'faculty' | 'department' | 'program';
    targetId?: number | null;
    targetName?: string;
    targetData?: any;
  }>({
    isOpen: false,
    mode: null,
    targetId: null
  });

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchStructure(), fetchSettings()]);
      setLoading(false);
    };
    initData();
  }, []);

  const fetchStructure = async () => {
    try {
      const res = await client.get('/admin/academic/structure', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaculties(res.data);
    } catch (err) {
      console.error('Error fetching academic structure:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await client.get('/admin/admissions/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncing(true);
    try {
      await client.patch('/admin/admissions/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLastSync(new Date().toLocaleTimeString());
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Registry Updated',
        message: 'The institutional admission protocols have been successfully synchronized.'
      });
    } catch (err) {
       setNotification({
        isOpen: true,
        type: 'error',
        title: 'Sync Failure',
        message: 'Unable to commit institutional settings to the central ledger.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/admin/academic/faculties', newFaculty, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewFaculty({ name: '', description: '', code: '' });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Faculty Registered',
        message: 'A new academic faculty has been successfully added to the registry.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Registration Error',
        message: 'Could not Provision the new faculty at this time.'
      });
    }
  };

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.targetId) return;
    try {
      await client.put(`/admin/academic/faculties/${modal.targetId}`, newFaculty, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewFaculty({ name: '', description: '', code: '' });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Faculty Updated',
        message: 'The institutional record for this faculty has been updated.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Update Failure',
        message: 'Could not commit changes to the registry.'
      });
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.targetId) return;
    try {
      await client.put(`/admin/academic/departments/${modal.targetId}`, {
        ...newDept,
        faculty_id: modal.targetData.faculty_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDept({ name: '', code: '' });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Department Updated',
        message: 'Departmental metadata has been successfully modified.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Sync Failure',
        message: 'Institutional guardrails prevented this update.'
      });
    }
  };

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.targetId) return;
    try {
      await client.put(`/admin/academic/programs/${modal.targetId}`, {
        ...newProg,
        department_id: modal.targetData.department_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProg({ 
        name: '', degree_level: 'BSc', duration_years: 4, pricing_type: 'hybrid',
        tuition_fee: '0', application_fee: '0', certificate_fee: '0',
        is_scholarship_eligible: true, is_external: false, external_provider: ''
      });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Program Updated',
        message: 'Academic program parameters have been synchronized.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Protocol Error',
        message: 'Unable to update program definitions.'
      });
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.targetId) return;
    try {
      await client.post(`/admin/academic/departments`, {
        ...newDept,
        faculty_id: modal.targetId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDept({ name: '', code: '' });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Unit Initialized',
        message: 'The new department has been successfully registered in the faculty hierarchy.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Sync Failed',
        message: 'The departmental record could not be committed to the registry.'
      });
    }
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.targetId) return;
    try {
      await client.post(`/admin/academic/programs`, {
        ...newProg,
        department_id: modal.targetId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProg({ 
        name: '', 
        degree_level: 'BSc', 
        duration_years: 4,
        pricing_type: 'hybrid',
        tuition_fee: '0',
        application_fee: '0',
        certificate_fee: '0',
        is_scholarship_eligible: true,
        is_external: false,
        external_provider: ''
      });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Program Provisioned',
        message: 'The academic program is now active and available for enrollment.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Protocol Error',
        message: 'Could not define the new program record in this session.'
      });
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    try {
      await client.delete(`/admin/academic/faculties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStructure();
      setModal({ isOpen: false, mode: null });
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Faculty Wiped',
        message: 'The faculty and all its nested units have been removed from the registry.'
      });
    } catch (err) {
       setNotification({
        isOpen: true,
        type: 'error',
        title: 'Delete Failed',
        message: 'Institutional guardrails prevented the removal of this record.'
      });
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await client.delete(`/admin/academic/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStructure();
      setModal({ isOpen: false, mode: null });
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Unit Terminated',
        message: 'The departmental record has been successfully purged.'
      });
    } catch (err) {
       setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lock Error',
        message: 'Unable to authorized termination. The record might be protected.'
      });
    }
  };

  const handleDeleteProgram = async (id: number) => {
    try {
      await client.delete(`/admin/academic/programs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStructure();
      setModal({ isOpen: false, mode: null });
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Program Terminated',
        message: 'The academic program has been permanently removed from the ledger.'
      });
    } catch (err) {
       setNotification({
        isOpen: true,
        type: 'error',
        title: 'Termination Failed',
        message: 'Record sync failed. Program could not be deleted.'
      });
    }
  };

  const handleConfirmAction = () => {
    if (!modal.targetId) return;
    if (modal.mode === 'delete') {
      if (modal.type === 'faculty') handleDeleteFaculty(modal.targetId);
      else if (modal.type === 'department') handleDeleteDepartment(modal.targetId);
      else if (modal.type === 'program') handleDeleteProgram(modal.targetId);
    }
  };

  const [activeTab, setActiveTab] = useState<'hierarchy' | 'calendar' | 'registry' | 'settings'>('hierarchy');

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[11px]">Syncing {appName} Academic Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Administrative Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12 border-b border-border-soft pb-10">
        <div>
           <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[11px]">
              <Database className="opacity-50" size={16} />
              Academic Management Operations
           </div>
           <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none font-display">Enrollment Management</h1>
           
           {/* Tab Navigation */}
           <div className="flex gap-10 mt-10">
             <button 
                onClick={() => setActiveTab('hierarchy')}
                className={`text-[11px] font-black uppercase tracking-[0.3em] pb-4 border-b-2 transition-all flex items-center gap-3 ${activeTab === 'hierarchy' ? 'border-mylms-rose text-text-main' : 'border-transparent text-gray-300 hover:text-text-main'}`}
             >
                <Layers size={16} />
                {appName} Hierarchy
             </button>
             <button 
                onClick={() => setActiveTab('registry')}
                className={`text-[11px] font-black uppercase tracking-[0.3em] pb-4 border-b-2 transition-all flex items-center gap-3 ${activeTab === 'registry' ? 'border-mylms-rose text-text-main' : 'border-transparent text-gray-300 hover:text-text-main'}`}
             >
                <ShieldCheck size={16} />
                Enrollment Protocol
             </button>
             <button 
                onClick={() => setActiveTab('calendar')}
                className={`text-[11px] font-black uppercase tracking-[0.3em] pb-4 border-b-2 transition-all flex items-center gap-3 ${activeTab === 'calendar' ? 'border-mylms-rose text-text-main' : 'border-transparent text-gray-300 hover:text-text-main'}`}
             >
                <Calendar size={16} />
                University Calendar
             </button>
             <button 
                onClick={() => setActiveTab('settings')}
                className={`text-[11px] font-black uppercase tracking-[0.3em] pb-4 border-b-2 transition-all flex items-center gap-3 ${activeTab === 'settings' ? 'border-mylms-rose text-text-main' : 'border-transparent text-gray-300 hover:text-text-main'}`}
             >
                <Settings size={16} />
                Institutional Settings
             </button>
           </div>
        </div>
        
        {activeTab === 'hierarchy' && (
          <button 
            onClick={() => {
              setNewFaculty({ name: '', description: '', code: '' });
              setModal({ isOpen: true, mode: 'add_faculty' });
            }}
            className="btn-purple flex items-center gap-3 px-10 py-4 text-xs"
          >
            + Register New Faculty
          </button>
        )}
      </div>

      {activeTab === 'calendar' ? (
        <AcademicCalendarManager />
      ) : activeTab === 'registry' ? (
        <AdmissionRegistryManager />
      ) : activeTab === 'settings' ? (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-[40px] border border-border-soft shadow-2xl p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full"></div>
              
               <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-mylms-purple/5 text-mylms-purple rounded-2xl flex items-center justify-center border border-mylms-purple/10">
                     <Settings size={32} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">Institutional Protocols</h3>
                     <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.4em]">Global System Configuration</p>
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest ml-4 italic">Last Sync: {lastSync}</span>
                     </div>
                  </div>
               </div>

               <form onSubmit={handleUpdateSettings} className="space-y-12">
                  {/* Master Enrollment Protocol */}
                  <div className="bg-offwhite/50 border-2 border-border-soft p-10 rounded-[32px] relative overflow-hidden group/protocol">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-bl-full group-hover/protocol:bg-mylms-purple/5 transition-all"></div>
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 pb-10 border-b border-white relative z-10">
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${settings.is_enrollment_open ? 'bg-green-500 text-white shadow-green-200' : 'bg-gray-400 text-white opacity-50'}`}>
                              {settings.is_enrollment_open ? <Zap size={24} /> : <Lock size={24} />}
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-text-main uppercase tracking-tight">Enrollment Master Protocol</h4>
                              <div className="flex items-center gap-2 mt-1">
                                 <Activity size={12} className={settings.is_enrollment_open ? 'text-green-500' : 'text-gray-400'} />
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${settings.is_enrollment_open ? 'text-green-600' : 'text-gray-400'}`}>
                                    Gate Status: {settings.is_enrollment_open ? 'Operational (OPEN)' : 'Suspended (CLOSED)'}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSettings({...settings, is_enrollment_open: !settings.is_enrollment_open})}
                          className={`w-20 h-10 rounded-full p-1.5 transition-all relative ${settings.is_enrollment_open ? 'bg-mylms-purple' : 'bg-gray-200'}`}
                        >
                           <div className={`w-7 h-7 bg-white rounded-full shadow-md transition-all transform ${settings.is_enrollment_open ? 'translate-x-10' : 'translate-x-0'}`} />
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div>
                           <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Enrollment Window Start</label>
                           <input 
                             type="datetime-local" 
                             value={settings.enrollment_start_date ? settings.enrollment_start_date.substring(0, 16) : ''} 
                             onChange={e => setSettings({...settings, enrollment_start_date: e.target.value})}
                             className="w-full p-5 bg-white border-2 border-border-soft rounded-2xl font-black text-xs uppercase outline-none focus:border-mylms-purple"
                           />
                        </div>
                        <div>
                           <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Enrollment Window End</label>
                           <input 
                             type="datetime-local" 
                             value={settings.enrollment_end_date ? settings.enrollment_end_date.substring(0, 16) : ''} 
                             onChange={e => setSettings({...settings, enrollment_end_date: e.target.value})}
                             className="w-full p-5 bg-white border-2 border-border-soft rounded-2xl font-black text-xs uppercase outline-none focus:border-mylms-purple"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Secondary Admission Logic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Fee Waiver Approval Delay</label>
                        <div className="relative">
                           <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                           <input 
                             type="number" 
                             value={settings.admission_fee_waiver_delay_minutes || 0} 
                             onChange={e => setSettings({...settings, admission_fee_waiver_delay_minutes: parseInt(e.target.value)})}
                             className="w-full pl-16 pr-8 py-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm"
                           />
                        </div>
                        <p className="text-[8px] text-gray-400 mt-3 font-bold uppercase italic pl-1">Auto-approval timer for candidate fee waivers.</p>
                     </div>
                     <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Scholarship Quota Quorum</label>
                        <select 
                          value={settings.scholarship_auto_approval ? '1' : '0'} 
                          onChange={e => setSettings({...settings, scholarship_auto_approval: e.target.value === '1'})}
                          className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-[10px] uppercase appearance-none"
                        >
                           <option value="1">Enabled (System Evaluate)</option>
                           <option value="0">Disabled (Review Only)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Target Admission Quota (Limit)</label>
                        <input 
                           type="number" 
                           value={settings.enrollment_quota || 0} 
                           onChange={e => setSettings({...settings, enrollment_quota: parseInt(e.target.value)})}
                           className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Renewal Minimum Performance (GPA)</label>
                        <input 
                           type="number" 
                           step="0.1" 
                           value={settings.scholarship_renewal_min_gpa || 0} 
                           onChange={e => setSettings({...settings, scholarship_renewal_min_gpa: parseFloat(e.target.value)})}
                           className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm"
                        />
                     </div>
                  </div>

                  <div className="pt-6 border-t border-offwhite">
                     <button 
                       type="submit" 
                       disabled={syncing}
                       className="w-full py-6 bg-mylms-purple text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                     >
                        {syncing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {syncing ? 'Synchronizing Protocols...' : 'Commit Institutional Configuration'}
                     </button>
                  </div>
              </form>
           </div>
        </div>
      ) : (
        <>
          <div className="space-y-12">
            {faculties.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-border-soft rounded-2xl p-40 text-center opacity-60">
                 <Building size={48} className="text-gray-100 mx-auto mb-8" />
                 <p className="text-gray-400 font-black text-[11px] uppercase tracking-[0.4em] leading-loose">The academic registry contains no authorized records.</p>
               </div>
            ) : (
              faculties.map((faculty) => (
                <div key={faculty.id} className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden group transition-all hover:border-mylms-purple/20">
                   {/* Faculty Header */}
                   <div className="p-10 bg-offwhite border-b border-border-soft flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group-hover:bg-white transition-all border-t-8 border-t-mylms-purple">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                      <div className="z-10">
                         <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase">{faculty?.name}</h2>
                         <p className="text-xs font-black text-mylms-rose uppercase tracking-[0.4em] mt-3 tracking-widest">Registry Index: AUTH-{faculty.id.toString().padStart(4, '0')}</p>
                      </div>
                       <div className="flex gap-4 z-10">
                          <button 
                             onClick={() => {
                               setNewFaculty({ name: faculty.name, description: faculty.description, code: faculty.code });
                               setModal({ isOpen: true, mode: 'edit_faculty', targetId: faculty.id, targetName: faculty?.name });
                             }}
                             className="p-3 bg-white border border-border-soft text-gray-200 hover:text-mylms-purple transition-all rounded-lg shadow-sm"
                             title="Edit Faculty"
                           >
                              <Edit size={18} />
                           </button>
                          <button 
                            onClick={() => {
                              setNewDept({ name: '', code: '' });
                              setModal({ isOpen: true, mode: 'add_department', targetId: faculty.id, targetName: faculty?.name });
                            }}
                            className="btn-minimal px-6 py-3 flex items-center gap-2 text-xs"
                          >
                             <PlusCircle size={16} />
                             Add Department
                          </button>
                           <button 
                             onClick={() => setModal({ isOpen: true, mode: 'delete', type: 'faculty', targetId: faculty.id, targetName: faculty?.name })}
                             className="p-3 bg-white border border-border-soft text-gray-200 hover:text-mylms-rose transition-all rounded-lg shadow-sm"
                           >
                              <Trash2 size={18} />
                           </button>
                       </div>
                    </div>

                   <div className="p-10 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
                         {faculty.departments.length === 0 ? (
                           <div className="col-span-full py-24 text-center bg-offwhite border border-dashed border-border-soft rounded-2xl opacity-60">
                              <p className="text-gray-300 font-black text-[11px] uppercase tracking-[0.3em] leading-none">No departmental units authorized for this faculty.</p>
                           </div>
                         ) : (
                            faculty.departments.map((dept) => (
                              <div key={dept.id} className="bg-white border border-border-soft rounded-3xl p-10 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                                 <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                                 <div className="mb-10 relative z-10">
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                       <div className="flex items-center gap-3">
                                          <Target size={14} className="text-mylms-rose" />
                                          <span className="text-xs font-black text-mylms-rose uppercase tracking-widest font-mono">CODE: {dept.code}</span>
                                       </div>
                                       <div className="flex gap-2">
                                           <button 
                                              onClick={() => {
                                                 setNewDept({ name: dept.name, code: dept.code });
                                                 setModal({ isOpen: true, mode: 'edit_department', targetId: dept.id, targetName: dept?.name, targetData: { faculty_id: faculty.id } });
                                              }}
                                              className="text-gray-200 hover:text-mylms-purple transition-all p-2"
                                              title="Edit Department"
                                           >
                                              <Edit size={16} />
                                           </button>
                                           <button 
                                              onClick={() => setModal({ isOpen: true, mode: 'delete', type: 'department', targetId: dept.id, targetName: dept?.name })}
                                              className="text-gray-200 hover:text-mylms-rose transition-all p-2"
                                           >
                                              <Trash2 size={16} />
                                           </button>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-text-main group-hover:text-mylms-purple transition-colors leading-tight uppercase tracking-tighter">
                                       {dept?.name}
                                    </h3>
                                 </div>
                                 
                                 <div className="space-y-6 grow relative z-10">
                                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.5em] mb-10 border-b border-offwhite pb-6">Academic Program Roster</p>
                                    {dept.programs.length === 0 ? (
                                      <p className="text-xs text-gray-300 font-black uppercase tracking-widest opacity-60 py-16 text-center italic">No Programs Registered in Unit</p>
                                    ) : (
                                      dept.programs.map((program) => (
                                        <div key={program.id} className="bg-offwhite/50 px-8 py-8 border border-border-soft rounded-2xl flex justify-between items-center group/program hover:bg-white transition-all shadow-sm hover:shadow-md border-l-4 border-l-mylms-purple">
                                           <div className="flex-1">
                                              <p className="font-black text-text-main text-sm uppercase leading-tight tracking-tight mb-3">{program?.name}</p>
                                              <div className="flex items-center gap-4 flex-wrap">
                                                <span className="text-[10px] font-black text-mylms-rose uppercase tracking-widest bg-mylms-rose/5 px-3 py-1 rounded-md border border-mylms-rose/10">{program.degree_level}</span>
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{program.duration_years} Years</span>
                                                 {/* Fee Badges */}
                                                 <div className="flex items-center gap-3 ml-4 bg-white/60 px-4 py-1.5 rounded-full shadow-inner border border-border-soft">
                                                    <CreditCard size={12} className="text-mylms-purple" />
                                                    <span className="text-[10px] font-black text-mylms-purple uppercase tracking-tight">${Number(program.application_fee).toFixed(0)} APP FEE</span>
                                                 </div>
                                              </div>
                                              
                                              {/* Logic Attributes */}
                                              <div className="flex items-center gap-6 mt-6 border-t border-offwhite pt-4">
                                                 <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${program.is_scholarship_eligible ? 'text-green-600' : 'text-gray-300'}`}>
                                                    <Sparkles size={11} className={program.is_scholarship_eligible ? 'text-amber-500' : 'text-gray-200'} />
                                                    {program.is_scholarship_eligible ? 'Scholarship Qualified' : 'No Scholarship'}
                                                 </div>
                                                 {program.is_external && (
                                                   <div className="flex items-center gap-2 text-[9px] font-black text-mylms-purple uppercase tracking-widest">
                                                      <Globe size={11} />
                                                      {program.external_provider}
                                                   </div>
                                                 )}
                                              </div>
                                           </div>
                                            <div className="flex flex-col gap-4 ml-8">
                                                <button 
                                                   onClick={() => setModal({ isOpen: true, mode: 'delete', type: 'program', targetId: program.id, targetName: program?.name })}
                                                   className="p-3 bg-white border border-border-soft text-gray-200 hover:text-mylms-rose transition-all rounded-xl shadow-sm"
                                                >
                                                   <Trash2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                       setNewProg({ ...program });
                                                       setModal({ isOpen: true, mode: 'edit_program', targetId: program.id, targetName: program?.name, targetData: { department_id: dept.id } });
                                                    }}
                                                    className="p-3 bg-white border border-border-soft text-gray-200 hover:text-mylms-purple transition-all rounded-xl shadow-sm" 
                                                    title="Edit Program"
                                                 >
                                                    <Edit size={16} />
                                                 </button>
                                            </div>
                                        </div>
                                      ))
                                    )}
                                 </div>

                             <button 
                                      onClick={() => {
                                        setNewProg({ 
                                          name: '', 
                                          degree_level: 'BSc', 
                                          duration_years: 4,
                                          pricing_type: 'hybrid',
                                          tuition_fee: '0',
                                          application_fee: '25',
                                          certificate_fee: '0',
                                          is_scholarship_eligible: true,
                                          is_external: false,
                                          external_provider: ''
                                        });
                                        setModal({ isOpen: true, mode: 'add_program', targetId: dept.id, targetName: dept?.name });
                                      }}
                                      className="w-full py-5 mt-12 bg-mylms-purple/5 border border-dashed border-mylms-purple/20 text-mylms-purple font-black rounded-xl hover:bg-mylms-purple hover:text-white transition-all text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 relative z-10"
                                    >
                                       <PlusCircle size={16} />
                                       Provision Program
                                    </button>
                              </div>
                            ))
                         )}
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Unified Action Modal System */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-mylms-purple/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl border border-white/20 max-w-xl w-full p-12 transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[90vh] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mylms-purple/5 rounded-bl-full"></div>
            
            <div className="relative z-10">
              {modal.mode === 'delete' ? (
                <>
                  <div className="w-20 h-20 bg-mylms-rose/10 rounded-[28px] flex items-center justify-center text-mylms-rose mb-10 shadow-inner">
                     <XCircle size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-text-main uppercase tracking-tighter leading-tight mb-4">Terminate Record?</h2>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed mb-12">
                    You are about to authorize the removal of <span className="font-black text-mylms-purple uppercase">"{modal.targetName}"</span> from the institutional ledger. This action is irreversible.
                  </p>
                  <div className="flex flex-col gap-4">
                     <button onClick={handleConfirmAction} className="w-full bg-mylms-rose text-white font-black uppercase tracking-[0.3em] py-6 rounded-2xl hover:bg-[#A00E26] shadow-xl text-[11px] active:scale-[0.98] transition-all">Authorize Deletion</button>
                     <button onClick={() => setModal({ isOpen: false, mode: null })} className="w-full bg-offwhite border border-border-soft text-gray-400 font-black uppercase tracking-[0.3em] py-6 rounded-2xl text-[11px] active:scale-[0.98] transition-all">Abort Registry Sync</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-mylms-purple/10 rounded-[28px] flex items-center justify-center text-mylms-purple mb-10 shadow-inner">
                     <PlusCircle size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-text-main uppercase tracking-tighter leading-tight mb-2">
                    {modal.mode === 'add_faculty' && 'Provision New Faculty'}
                    {modal.mode === 'edit_faculty' && 'Edit Faculty Designation'}
                    {modal.mode === 'add_department' && 'Initialize Department'}
                    {modal.mode === 'edit_department' && 'Edit Departmental Info'}
                    {modal.mode === 'add_program' && 'Define Program'}
                    {modal.mode === 'edit_program' && 'Edit Program Parameters'}
                  </h2>
                  <p className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.5em] mb-12">
                    {modal.mode === 'add_faculty' && 'System Registry: Institutional Branch'}
                    {modal.mode === 'add_department' && `Target Parent: ${modal.targetName}`}
                    {modal.mode === 'add_program' && `Host Unit: ${modal.targetName}`}
                  </p>

                  <form onSubmit={
                    modal.mode === 'add_faculty' ? handleAddFaculty : 
                    modal.mode === 'edit_faculty' ? handleUpdateFaculty :
                    modal.mode === 'add_department' ? handleAddDepartment : 
                    modal.mode === 'edit_department' ? handleUpdateDepartment :
                    modal.mode === 'edit_program' ? handleUpdateProgram :
                    handleAddProgram
                  } className="space-y-8">
                    {modal.mode === 'add_faculty' || modal.mode === 'edit_faculty' ? (
                      <div className="space-y-8">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Official Designation</label>
                          <input required value={newFaculty?.name} onChange={e => setNewFaculty({...newFaculty, name: e.target.value})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm uppercase tracking-tight" placeholder="Faculty of Humanities..." />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Registry Code (e.g. FHS)</label>
                          <input required maxLength={5} value={newFaculty.code} onChange={e => setNewFaculty({...newFaculty, code: e.target.value.toUpperCase()})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-rose shadow-inner font-black text-sm uppercase tracking-[0.2em]" placeholder="FHS" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Administrative Summary</label>
                          <textarea value={newFaculty.description} onChange={e => setNewFaculty({...newFaculty, description: e.target.value})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm uppercase tracking-tight min-h-[120px]" placeholder="Brief mission statement..." />
                        </div>
                      </div>
                    ) : null}

                    {modal.mode === 'add_department' || modal.mode === 'edit_department' ? (
                      <div className="space-y-8">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Department Identifier</label>
                          <input required value={newDept?.name} onChange={e => setNewDept({...newDept, name: e.target.value})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm uppercase tracking-tight" placeholder="Dept. of Theoretical Physics..." />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Registry Code (4 Chars)</label>
                          <input required maxLength={4} value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value.toUpperCase()})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-rose shadow-inner font-black text-sm uppercase tracking-[0.2em]" placeholder="PHYS" />
                        </div>
                      </div>
                    ) : null}

                    {modal.mode === 'add_program' || modal.mode === 'edit_program' ? (
                      <div className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Program Title</label>
                               <input required value={newProg?.name} onChange={e => setNewProg({...newProg, name: e.target.value})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm uppercase tracking-tight" placeholder="e.g. Master of Artificial Intelligence" />
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Degree Level</label>
                               <select value={newProg.degree_level} onChange={e => setNewProg({...newProg, degree_level: e.target.value})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-xs uppercase appearance-none">
                                  <option value="Associate">Associate Degree</option>
                                  <option value="Bachelor">Bachelor (Standard)</option>
                                  <option value="BSc">Bachelor (Honours)</option>
                                  <option value="Master">Master Degree</option>
                                  <option value="PhD">Doctor of Philosophy</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Duration (Years)</label>
                               <input type="number" min={1} max={7} value={newProg.duration_years} onChange={e => setNewProg({...newProg, duration_years: parseInt(e.target.value)})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm" />
                            </div>
                             {/* Pricing fields */}
                             <div>
                               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Application Fee ($)</label>
                               <input type="number" value={newProg.application_fee} onChange={e => setNewProg({...newProg, application_fee: e.target.value})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-rose shadow-inner font-black text-sm" />
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Tuition per Semester ($)</label>
                               <input type="number" value={newProg.tuition_fee} onChange={e => setNewProg({...newProg, tuition_fee: e.target.value})} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-sm" />
                            </div>
                            <div className="md:col-span-2">
                               <div className="flex items-center gap-6 p-6 bg-offwhite border-2 border-border-soft rounded-[24px]">
                                   <input 
                                     id="scholarship_check"
                                     type="checkbox" 
                                     checked={newProg.is_scholarship_eligible} 
                                     onChange={e => setNewProg({...newProg, is_scholarship_eligible: e.target.checked})}
                                     className="w-6 h-6 rounded-lg text-mylms-purple focus:ring-mylms-purple bg-white border-border-soft"
                                   />
                                   <label htmlFor="scholarship_check" className="text-xs font-black text-text-main uppercase tracking-widest cursor-pointer flex items-center gap-3">
                                      <Heart size={16} className={newProg.is_scholarship_eligible ? 'text-mylms-rose' : 'text-gray-200'} />
                                      Scholarship Program Eligible
                                   </label>
                               </div>
                            </div>
                            
                            <div className="md:col-span-2">
                               <div className="flex items-center gap-6 p-6 bg-offwhite border-2 border-border-soft rounded-[24px]">
                                   <input 
                                     id="external_check"
                                     type="checkbox" 
                                     checked={newProg.is_external} 
                                     onChange={e => setNewProg({...newProg, is_external: e.target.checked})}
                                     className="w-6 h-6 rounded-lg text-mylms-purple focus:ring-mylms-purple bg-white border-border-soft"
                                   />
                                   <label htmlFor="external_check" className="text-xs font-black text-text-main uppercase tracking-widest cursor-pointer flex items-center gap-3">
                                      <Globe size={16} className={newProg.is_external ? 'text-mylms-purple' : 'text-gray-200'} />
                                      External Partner Program
                                   </label>
                               </div>
                            </div>

                            {newProg.is_external && (
                               <div className="md:col-span-2 animate-in slide-in-from-top-4 duration-300">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Provider Designation</label>
                                  <input value={newProg.external_provider} onChange={e => setNewProg({...newProg, external_provider: e.target.value})} className="w-full p-6 bg-white border-2 border-mylms-purple/30 rounded-[24px] outline-none shadow-sm font-black text-sm uppercase" placeholder="e.g. British Council, Coursera..." />
                               </div>
                            )}
                         </div>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-6 pt-6">
                        <button type="button" onClick={() => setModal({ isOpen: false, mode: null })} className="flex-1 py-5 border border-border-soft rounded-full text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-offwhite transition-all">Cancel</button>
                        <button type="submit" className="flex-1 py-5 bg-mylms-purple text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-mylms-purple/90 transition-all">
                           {modal.mode?.startsWith('edit') ? 'Commit Changes' : 'Complete Registry'}
                        </button>
                     </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Notification Modal */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-mylms-purple/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl border border-white/20 max-w-sm w-full p-12 text-center transform animate-in zoom-in-95 duration-500">
              <div className={`w-20 h-20 mx-auto rounded-[28px] flex items-center justify-center mb-8 shadow-inner ${notification.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-mylms-rose/10 text-mylms-rose'}`}>
                 {notification.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
              </div>
              <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter mb-4">{notification?.title}</h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10">{notification.message}</p>
              <button 
                onClick={() => setNotification({ ...notification, isOpen: false })}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 ${notification.type === 'success' ? 'bg-mylms-purple text-white shadow-xl' : 'bg-mylms-rose text-white shadow-xl'}`}
              >
                Acknowledge
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
