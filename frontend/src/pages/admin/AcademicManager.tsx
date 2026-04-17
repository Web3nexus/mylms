import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
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
  ShieldCheck
} from 'lucide-react';

interface Program {
  id: number;
  name: string;
  degree_level: string;
  duration_years: number;
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
  description: string;
  departments: Department[];
}

export default function AcademicManager() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProg, setNewProg] = useState({ name: '', degree_level: 'BSc', duration_years: 4 });
  
  // Unified Modal System State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mode: 'add_faculty' | 'add_department' | 'add_program' | 'delete' | null;
    type?: 'faculty' | 'department' | 'program';
    targetId?: number | null;
    targetName?: string;
  }>({
    isOpen: false,
    mode: null,
    targetId: null
  });
  
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      const res = await client.get('/academic', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaculties(res.data);
    } catch (err) {
      console.error('Error fetching academic structure:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/academic/faculties', newFaculty, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewFaculty({ name: '', description: '' });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
    } catch (err) {
      console.error('Error adding faculty:', err);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.targetId) return;
    try {
      await client.post(`/academic/faculties/${modal.targetId}/departments`, newDept, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDept({ name: '', code: '' });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
    } catch (err) {
      console.error('Error adding department:', err);
    }
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.targetId) return;
    try {
      await client.post(`/academic/departments/${modal.targetId}/programs`, newProg, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProg({ name: '', degree_level: 'BSc', duration_years: 4 });
      setModal({ isOpen: false, mode: null });
      fetchStructure();
    } catch (err) {
      console.error('Error adding program:', err);
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    try {
      await client.delete(`/academic/faculties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStructure();
      setModal({ isOpen: false, mode: null });
    } catch (err) {
       console.error('Delete faculty failed:', err);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await client.delete(`/academic/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStructure();
      setModal({ isOpen: false, mode: null });
    } catch (err) {
       console.error('Delete department failed:', err);
    }
  };

  const handleDeleteProgram = async (id: number) => {
    try {
      await client.delete(`/academic/programs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStructure();
      setModal({ isOpen: false, mode: null });
    } catch (err) {
       console.error('Delete program failed:', err);
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

  const [activeTab, setActiveTab] = useState<'hierarchy' | 'calendar' | 'registry'>('hierarchy');

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[11px]">Syncing MyLMS Academic Ledger...</p>
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
           <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Academic Office</h1>
           
           {/* Tab Navigation */}
           <div className="flex gap-10 mt-10">
             <button 
                onClick={() => setActiveTab('hierarchy')}
                className={`text-[11px] font-black uppercase tracking-[0.3em] pb-3 border-b-2 transition-all flex items-center gap-3 ${activeTab === 'hierarchy' ? 'border-mylms-rose text-text-main' : 'border-transparent text-gray-300 hover:text-text-main'}`}
             >
                <Layers size={16} />
                MyLMS Hierarchy
             </button>
             <button 
                onClick={() => setActiveTab('calendar')}
                className={`text-[11px] font-black uppercase tracking-[0.3em] pb-3 border-b-2 transition-all flex items-center gap-3 ${activeTab === 'calendar' ? 'border-mylms-rose text-text-main' : 'border-transparent text-gray-300 hover:text-text-main'}`}
             >
                <Calendar size={16} />
                University Calendar
             </button>
             <button 
                onClick={() => setActiveTab('registry')}
                className={`text-[11px] font-black uppercase tracking-[0.3em] pb-3 border-b-2 transition-all flex items-center gap-3 ${activeTab === 'registry' ? 'border-mylms-rose text-text-main' : 'border-transparent text-gray-300 hover:text-text-main'}`}
             >
                <ShieldCheck size={16} />
                Enrollment Protocol
             </button>
           </div>
        </div>
        
        {activeTab === 'hierarchy' && (
          <button 
            onClick={() => {
              setNewFaculty({ name: '', description: '' });
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
                         <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase">{faculty.name}</h2>
                         <p className="text-xs font-black text-mylms-rose uppercase tracking-[0.4em] mt-3 tracking-widest">Registry Index: AUTH-{faculty.id.toString().padStart(4, '0')}</p>
                      </div>
                       <div className="flex gap-4 z-10">
                          <button 
                            onClick={() => {
                              setNewDept({ name: '', code: '' });
                              setModal({ isOpen: true, mode: 'add_department', targetId: faculty.id, targetName: faculty.name });
                            }}
                            className="btn-minimal px-6 py-3 flex items-center gap-2 text-xs"
                          >
                             <PlusCircle size={16} />
                             Add Department
                          </button>
                           <button 
                             onClick={() => setModal({ isOpen: true, mode: 'delete', type: 'faculty', targetId: faculty.id, targetName: faculty.name })}
                             className="p-3 bg-white border border-border-soft text-gray-200 hover:text-mylms-rose transition-all rounded-lg shadow-sm"
                           >
                              <Trash2 size={18} />
                           </button>
                       </div>
                    </div>

                   <div className="p-10 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         {faculty.departments.length === 0 ? (
                           <div className="col-span-full py-24 text-center bg-offwhite border border-dashed border-border-soft rounded-2xl opacity-60">
                              <p className="text-gray-300 font-black text-[11px] uppercase tracking-[0.3em] leading-none">No departmental units authorized for this faculty.</p>
                           </div>
                         ) : (
                            faculty.departments.map((dept) => (
                              <div key={dept.id} className="bg-white border border-border-soft rounded-xl p-8 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                                 <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                                 <div className="mb-8 relative z-10">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                       <div className="flex items-center gap-2">
                                          <Hash size={12} className="text-mylms-rose opacity-50" />
                                          <span className="text-xs font-black text-mylms-rose uppercase tracking-widest font-mono">CODE: {dept.code}</span>
                                       </div>
                                       <button 
                                          onClick={() => setModal({ isOpen: true, mode: 'delete', type: 'department', targetId: dept.id, targetName: dept.name })}
                                          className="text-gray-200 hover:text-mylms-rose transition-all p-1"
                                       >
                                          <Trash2 size={14} />
                                       </button>
                                    </div>
                                    <h3 className="text-xl font-black text-text-main group-hover:text-mylms-purple transition-colors leading-tight uppercase tracking-tight">
                                       {dept.name}
                                    </h3>
                                 </div>
                                 
                                 <div className="space-y-4 grow relative z-10">
                                    <p className="text-[11px] font-black uppercase text-gray-300 tracking-[0.4em] mb-6 border-b border-offwhite pb-4">Academic Programs</p>
                                    {dept.programs.length === 0 ? (
                                      <p className="text-xs text-gray-300 font-black uppercase tracking-widest opacity-60 py-10 text-center">No Programs Registered</p>
                                    ) : (
                                      dept.programs.map((program) => (
                                        <div key={program.id} className="bg-offwhite px-5 py-4 border border-border-soft rounded-lg flex justify-between items-center group/program hover:bg-white transition-all shadow-sm">
                                           <div>
                                              <p className="font-black text-text-main text-xs uppercase leading-tight tracking-tight">{program.name}</p>
                                              <div className="flex items-center gap-3 mt-2 opacity-60">
                                                <span className="text-[11px] font-black text-mylms-rose uppercase tracking-[0.2em]">{program.degree_level}</span>
                                                <span className="text-[14px] text-gray-200">&bull;</span>
                                                <span className="text-[11px] font-black text-text-secondary uppercase tracking-widest">{program.duration_years} Years</span>
                                              </div>
                                           </div>
                                            <div className="flex items-center gap-2">
                                               <button 
                                                  onClick={() => setModal({ isOpen: true, mode: 'delete', type: 'program', targetId: program.id, targetName: program.name })}
                                                  className="text-gray-200 hover:text-mylms-rose transition-all"
                                               >
                                                  <Trash2 size={14} />
                                               </button>
                                               <button className="text-gray-200 hover:text-mylms-purple transition-all" title="Program Settings">
                                                  <ChevronRight size={16} />
                                               </button>
                                            </div>
                                        </div>
                                      ))
                                    )}
                                 </div>

                             <button 
                                     onClick={() => {
                                       setNewProg({ name: '', degree_level: 'BSc', duration_years: 4 });
                                       setModal({ isOpen: true, mode: 'add_program', targetId: dept.id, targetName: dept.name });
                                     }}
                                     className="w-full py-4 mt-12 bg-offwhite border border-dashed border-border-soft text-gray-400 font-black rounded-lg hover:bg-white hover:text-mylms-purple hover:border-mylms-purple/40 transition-all text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 relative z-10"
                                   >
                                      <PlusCircle size={14} />
                                      Define Program
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
          <div className="bg-white rounded-[32px] shadow-2xl border border-white/20 max-w-xl w-full p-10 transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mylms-purple/5 rounded-bl-full"></div>
            
            <div className="relative z-10">
              {modal.mode === 'delete' ? (
                <>
                  <div className="w-16 h-16 bg-mylms-rose/10 rounded-2xl flex items-center justify-center text-mylms-rose mb-8">
                     <XCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-text-main uppercase tracking-tight leading-none mb-4">Terminate Record?</h2>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10">
                    You are about to authorize the removal of <span className="font-black text-mylms-purple uppercase">"{modal.targetName}"</span> from the institutional ledger. This action is irreversible.
                  </p>
                  <div className="flex flex-col gap-3">
                     <button onClick={handleConfirmAction} className="w-full bg-mylms-rose text-white font-black uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-[#A00E26] shadow-xl text-[10px]">Authorize Deletion</button>
                     <button onClick={() => setModal({ isOpen: false, mode: null })} className="w-full bg-offwhite border border-border-soft text-gray-400 font-black uppercase tracking-[0.2em] py-5 rounded-xl text-[10px]">Abort Registry Sync</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-mylms-purple/10 rounded-2xl flex items-center justify-center text-mylms-purple mb-8">
                     <PlusCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-text-main uppercase tracking-tight leading-none mb-2">
                    {modal.mode === 'add_faculty' && 'Provision New Faculty'}
                    {modal.mode === 'add_department' && 'Initialize Department'}
                    {modal.mode === 'add_program' && 'Define Academic Program'}
                  </h2>
                  <p className="text-xs font-black text-mylms-rose uppercase tracking-[0.3em] mb-10">
                    {modal.mode === 'add_faculty' && 'Registry: Institutional Office'}
                    {modal.mode === 'add_department' && `Target: ${modal.targetName}`}
                    {modal.mode === 'add_program' && `Unit: ${modal.targetName}`}
                  </p>

                  <form onSubmit={
                    modal.mode === 'add_faculty' ? handleAddFaculty : 
                    modal.mode === 'add_department' ? handleAddDepartment : 
                    handleAddProgram
                  } className="space-y-6">
                    {modal.mode === 'add_faculty' && (
                      <div className="space-y-6">
                        <div className="premium-input-wrapper">
                          <label className="premium-label">Designation</label>
                          <input required value={newFaculty.name} onChange={e => setNewFaculty({...newFaculty, name: e.target.value})} className="premium-input" placeholder="e.g. Faculty of Health Sciences" />
                        </div>
                        <div className="premium-input-wrapper">
                          <label className="premium-label">Administrative Summary</label>
                          <input value={newFaculty.description} onChange={e => setNewFaculty({...newFaculty, description: e.target.value})} className="premium-input" placeholder="Primary academic load..." />
                        </div>
                      </div>
                    )}

                    {modal.mode === 'add_department' && (
                      <div className="space-y-6">
                        <div className="premium-input-wrapper">
                          <label className="premium-label">Department Name</label>
                          <input required value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} className="premium-input" placeholder="e.g. Dept. of Computer Science" />
                        </div>
                        <div className="premium-input-wrapper">
                          <label className="premium-label">Matric Code (4 Chars)</label>
                          <input required maxLength={4} value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value.toUpperCase()})} className="premium-input uppercase" placeholder="CS" />
                        </div>
                      </div>
                    )}

                    {modal.mode === 'add_program' && (
                      <div className="space-y-6">
                        <div className="premium-input-wrapper">
                          <label className="premium-label">Program Title</label>
                          <input required value={newProg.name} onChange={e => setNewProg({...newProg, name: e.target.value})} className="premium-input" placeholder="e.g. BSc Software Engineering" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="premium-input-wrapper">
                            <label className="premium-label">Degree Level</label>
                            <select value={newProg.degree_level} onChange={e => setNewProg({...newProg, degree_level: e.target.value})} className="premium-input appearance-none">
                              <option value="BSc">BSc</option>
                              <option value="B.Eng">B.Eng</option>
                              <option value="MSc">MSc</option>
                              <option value="PhD">PhD</option>
                            </select>
                          </div>
                          <div className="premium-input-wrapper">
                            <label className="premium-label">Duration (Years)</label>
                            <input type="number" min={1} max={7} value={newProg.duration_years} onChange={e => setNewProg({...newProg, duration_years: parseInt(e.target.value)})} className="premium-input" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 pt-4">
                      <button type="submit" className="w-full bg-mylms-purple text-white font-black uppercase tracking-[0.2em] py-5 rounded-xl shadow-xl hover:opacity-90 transition-all text-[10px]">Commit Records</button>
                      <button type="button" onClick={() => setModal({ isOpen: false, mode: null })} className="w-full bg-offwhite border border-border-soft text-gray-400 font-black uppercase tracking-[0.2em] py-5 rounded-xl text-[10px]">Abort Process</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
