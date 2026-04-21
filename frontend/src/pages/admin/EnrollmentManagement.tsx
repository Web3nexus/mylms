import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Layout, 
  MapPin, 
  GraduationCap, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  FileText,
  ChevronRight,
  Layers,
  Building2,
  BookOpen
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function EnrollmentManagement() {
  const [activeTab, setActiveTab] = useState<'faculties' | 'departments' | 'programs'>('programs');
  const [data, setData] = useState<any>({ faculties: [], departments: [], programs: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/enrollment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching enrollment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action is irreversible.`)) return;
    try {
      await client.delete(`/admin/enrollment/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Deletion failed. Ensure no child records depend on this entry.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = Object.fromEntries(formData.entries());

    try {
      if (editingItem) {
        await client.put(`/admin/enrollment/${activeTab}/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await client.post(`/admin/enrollment/${activeTab}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert('Validation error. Please check your inputs.');
    }
  };

  const filteredData = data[activeTab].filter((item: any) => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-8 md:px-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
        <div>
           <div className="inline-flex items-center gap-3 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px] mb-6 bg-mylms-rose/5 px-6 py-2.5 rounded-full border border-mylms-rose/10">
             Enrollment Management Protocol
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-mylms-purple tracking-tighter leading-[0.85] uppercase italic mb-6">
             Academic <br />
             <span className="text-transparent border-text-mylms-purple" style={{ WebkitTextStroke: '1px var(--color-mylms-purple)' }}>Hierarchy.</span>
           </h1>
           <p className="text-text-secondary font-medium text-lg max-w-lg opacity-60 font-sans italic">
             Configure institution-scale structural units including Faculties, Departments, and Program catalogs.
           </p>
        </div>
        
        <button 
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="bg-mylms-purple text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-mylms-purple/90 transition-all shadow-2xl flex items-center gap-4 active:scale-95"
        >
          <Plus size={18} />
          Create New {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-10 mb-10 bg-white p-4 rounded-[32px] border border-border-soft shadow-sm">
        <div className="flex p-2 bg-offwhite rounded-2xl w-full lg:w-auto">
          {(['faculties', 'departments', 'programs'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${
                activeTab === tab ? 'bg-white text-mylms-purple shadow-md' : 'text-gray-400 hover:text-text-main'
              }`}
            >
              {tab === 'faculties' && <Building2 size={14} />}
              {tab === 'departments' && <Layers size={14} />}
              {tab === 'programs' && <BookOpen size={14} />}
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-8 py-4 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-bold text-sm transition-all"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[40px] border border-border-soft shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-6"></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Academic Model...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-offwhite text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <th className="px-10 py-6">Identity / Code</th>
                      {activeTab !== 'faculties' && <th className="px-10 py-6">Parent Unit</th>}
                      {activeTab === 'programs' && <th className="px-10 py-6">Level / Status</th>}
                      <th className="px-10 py-6 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                   {filteredData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-offwhite/30 transition-all group">
                         <td className="px-10 py-8">
                            <p className="text-sm font-black text-text-main uppercase tracking-tight mb-1">{item.name}</p>
                            <p className="text-[10px] font-black text-mylms-rose uppercase tracking-widest opacity-60">ID: {item.code || `PRO-${item.id}`}</p>
                         </td>
                         {activeTab === 'departments' && (
                            <td className="px-10 py-8">
                               <span className="text-[10px] font-black bg-mylms-purple/5 text-mylms-purple px-4 py-2 rounded-lg border border-mylms-purple/10 uppercase tracking-widest">{item.faculty?.name || 'Unassigned'}</span>
                            </td>
                         )}
                         {activeTab === 'programs' && (
                           <>
                            <td className="px-10 py-8">
                               <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 italic opacity-60">{item.department?.faculty?.name}</p>
                               <p className="text-[11px] font-black text-mylms-purple uppercase tracking-tight">{item.department?.name}</p>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-4">
                                  <span className="text-[9px] font-black bg-offwhite text-text-main px-3 py-1 rounded-full border border-border-soft uppercase tracking-widest">{item.degree_level}</span>
                                  {item.is_active ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-mylms-rose opacity-40" />}
                               </div>
                            </td>
                           </>
                         )}
                         <td className="px-10 py-8 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                onClick={() => { setEditingItem(item); setShowModal(true); }}
                                className="p-3 bg-offwhite text-text-secondary rounded-xl hover:bg-mylms-purple hover:text-white transition-all shadow-sm"
                               >
                                  <Edit2 size={14} />
                               </button>
                               <button 
                                onClick={() => handleDelete(activeTab, item.id)}
                                className="p-3 bg-offwhite text-mylms-rose rounded-xl hover:bg-mylms-rose hover:text-white transition-all shadow-sm"
                               >
                                  <Trash2 size={14} />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-mylms-purple/20 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl border border-border-soft overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-offwhite px-10 py-8 border-b border-border-soft flex justify-between items-center">
                 <h3 className="text-xl font-black text-mylms-purple uppercase tracking-tight italic">
                    {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)} Protocol
                 </h3>
                 <button onClick={() => setShowModal(false)} className="p-3 rounded-full hover:bg-white transition-all text-gray-400">
                    <XCircle size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleSave} className="p-10 space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Name Identification</label>
                    <input name="name" defaultValue={editingItem?.name} required className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple transition-all font-black text-mylms-purple text-xs uppercase" placeholder={`ENTER ${activeTab.toUpperCase()} NAME`} />
                 </div>

                 {activeTab !== 'programs' && (
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Registry Code</label>
                        <input name="code" defaultValue={editingItem?.code} required className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple transition-all font-black text-mylms-purple text-xs uppercase" placeholder="e.g. CS101 or FAC-SCI" />
                    </div>
                 )}

                 {activeTab === 'faculties' && (
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Description</label>
                        <textarea name="description" defaultValue={editingItem?.description} className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple transition-all font-bold text-text-secondary text-sm italic h-32" placeholder="Institutional scope details..." />
                    </div>
                 )}

                 {activeTab === 'departments' && (
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Parent Faculty</label>
                        <select name="faculty_id" defaultValue={editingItem?.faculty_id} required className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple transition-all font-black text-mylms-purple text-xs uppercase">
                            <option value="">-- SELECT FACULTY --</option>
                            {data.faculties.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                 )}

                 {activeTab === 'programs' && (
                   <div className="grid grid-cols-2 gap-8">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Parent Department</label>
                        <select name="department_id" defaultValue={editingItem?.department_id} required className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple transition-all font-black text-mylms-purple text-xs uppercase">
                            <option value="">-- SELECT DEPARTMENT --</option>
                            {data.departments.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.faculty?.name})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Degree Level</label>
                        <select name="degree_level" defaultValue={editingItem?.degree_level || 'Bachelor'} required className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple transition-all font-black text-mylms-purple text-xs uppercase">
                            <option value="Associate">Associate</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Master">Master</option>
                            <option value="PhD">PhD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Duration (Years)</label>
                        <input name="duration_years" type="number" defaultValue={editingItem?.duration_years || 4} required className="w-full p-6 bg-offwhite border-2 border-border-soft rounded-[20px] outline-none focus:border-mylms-purple transition-all font-black text-mylms-purple text-xs uppercase" />
                      </div>
                   </div>
                 )}

                <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-offwhite text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-100 transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] py-5 bg-mylms-purple text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-mylms-purple/90 active:scale-95 transition-all">Confirm {editingItem ? 'Update' : 'Creation'}</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
