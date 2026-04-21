import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  PlusCircle, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Hash,
  Layers,
  ArrowRight,
  ShieldCheck,
  Type,
  List,
  Calendar,
  AlertCircle,
  FileCode,
  ShieldAlert,
  UserCheck,
  FileUp
} from 'lucide-react';

interface AdmissionField {
  id: number;
  field_key: string;
  label: string;
  category: string;
  type: string;
  options: string[] | null;
  is_required: boolean;
  is_active: boolean;
  order_index: number;
}

export default function AdmissionRegistryManager() {
  const [fields, setFields] = useState<AdmissionField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({
    field_key: '',
    label: '',
    category: 'personal',
    type: 'text',
    is_required: true,
    options: ''
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
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await client.get('/admissions/fields-admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFields(res.data);
    } catch (err) {
      console.error('Error fetching fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newField,
        options: newField.options ? newField.options.split(',').map(o => o.trim()) : null
      };
      await client.post('/admissions/fields', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewField({ field_key: '', label: '', category: 'personal', type: 'text', is_required: true, options: '' });
      setShowAddField(false);
      fetchFields();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Registry Updated',
        message: 'The new enrollment protocol field has been successfully authorized.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Provisioning Error',
        message: 'The registry unique key might already be in use.'
      });
    }
  };

  const toggleField = async (id: number) => {
    try {
      await client.post(`/admissions/fields/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFields();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const deleteField = async (id: number) => {
    try {
      await client.delete(`/admissions/fields/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFields();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Field Purged',
        message: 'The dynamic field has been removed from the enrollment protocol.'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Access Denied',
        message: 'System protected fields cannot be removed from the registry.'
      });
    }
  };

  const categories = ['personal', 'contact', 'academic', 'financial', 'membership', 'credentials', 'documents'];

  if (loading) return (
    <div className="py-20 text-center">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-mylms-purple font-black uppercase tracking-widest text-[9px]">Syncing Registry Protocol...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Field Registry Dashboard */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-8 mb-10">
         <div>
            <h3 className="text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Enrollment Registry Settings</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
               <ShieldCheck size={14} className="text-mylms-rose" />
               Dynamic Enrollment Protocol config
            </p>
         </div>
         <button 
           onClick={() => setShowAddField(!showAddField)}
           className="btn-purple px-10 py-4 flex items-center gap-3 text-xs"
         >
           {showAddField ? 'Abort Registry' : '+ Define New Protocol Field'}
         </button>
      </div>

      {showAddField && (
        <div className="bg-white p-10 rounded-2xl border border-border-soft shadow-xl border-t-8 border-t-mylms-rose relative group overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full transition-all group-hover:bg-mylms-rose/5"></div>
           <h4 className="text-xs font-black text-text-main uppercase tracking-[0.4em] mb-10 flex items-center gap-3 relative z-10">
              <PlusCircle size={16} className="text-mylms-rose" />
              Provision New Data Point
           </h4>
           
           <form onSubmit={handleAddField} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="md:col-span-1">
                 <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Unique Field Key (No Spaces)</label>
                 <input 
                   type="text" 
                   required
                   value={newField.field_key}
                   onChange={e => setNewField({...newField, field_key: e.target.value.toLowerCase().replace(/ /g, '_')})}
                   placeholder="e.g. religion_status"
                   className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs shadow-inner"
                 />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Display Label</label>
                 <input 
                   type="text" 
                   required
                   value={newField.label}
                   onChange={e => setNewField({...newField, label: e.target.value})}
                   placeholder="e.g. Official Student Religion"
                   className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs shadow-inner"
                 />
              </div>
              <div>
                 <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Wizard Category</label>
                 <select 
                   value={newField.category}
                   onChange={e => setNewField({...newField, category: e.target.value})}
                   className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs appearance-none uppercase tracking-widest"
                 >
                    {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Input Protocol</label>
                 <select 
                   value={newField.type}
                   onChange={e => setNewField({...newField, type: e.target.value})}
                   className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs appearance-none uppercase tracking-widest"
                 >
                    <option value="text">TEXT STRING</option>
                    <option value="select">DROPDOWN SELECTION</option>
                    <option value="date">DATE PICKER</option>
                    <option value="number">NUMERIC DATA</option>
                    <option value="textarea">EXTENDED CONTENT</option>
                    <option value="file">FILE UPLOAD</option>
                 </select>
              </div>
              <div>
                 <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Mandatory Status</label>
                 <select 
                   value={newField.is_required ? '1' : '0'}
                   onChange={e => setNewField({...newField, is_required: e.target.value === '1'})}
                   className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs appearance-none uppercase tracking-widest"
                 >
                    <option value="1">REQUIRED PROTOCOL</option>
                    <option value="0">OPTIONAL DATA</option>
                 </select>
              </div>
              
              {newField.type === 'select' && (
                <div className="md:col-span-3 pb-4">
                   <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Selection Options (Comma Separated)</label>
                   <input 
                     type="text" 
                     required
                     value={newField.options}
                     onChange={e => setNewField({...newField, options: e.target.value})}
                     placeholder="Option 1, Option 2, Option 3..."
                     className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs shadow-inner"
                   />
                </div>
              )}

              <div className="md:col-span-3 flex justify-end gap-6 pt-4 border-t border-offwhite">
                 <button 
                  type="submit"
                  className="btn-purple px-12 py-4 text-xs flex items-center gap-3"
                 >
                    Commit New Field Registry
                    <ArrowRight size={16} />
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* Field Groups */}
      <div className="space-y-16">
         {categories.map(cat => (
           <div key={cat} className="bg-white rounded-3xl border border-border-soft shadow-sm overflow-hidden border-t-8 border-t-mylms-purple relative group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full transition-all group-hover:bg-mylms-purple/5"></div>
              
              <div className="p-10 border-b border-border-soft relative z-10 flex items-center justify-between">
                 <div>
                    <h5 className="text-xl font-black text-text-main uppercase tracking-tight">{cat} Registry Section</h5>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mt-2">Wizard Part {categories.indexOf(cat) + 1}</p>
                 </div>
                 <Layers size={24} className="text-mylms-purple opacity-20" />
              </div>

              <div className="p-10">
                 <div className="grid grid-cols-1 gap-6">
                    {fields.filter(f => f.category === cat).map(field => (
                      <div key={field.id} className="bg-offwhite p-6 rounded-2xl border border-border-soft flex items-center justify-between transition-all hover:bg-white hover:shadow-md group/row">
                         <div className="flex items-center gap-10">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-mylms-purple shadow-sm border border-border-soft transition-all group-hover/row:scale-110">
                               {field.type === 'text' && <Type size={18} />}
                               {field.type === 'select' && <List size={18} />}
                               {field.type === 'date' && <Calendar size={18} />}
                               {field.type === 'number' && <Hash size={18} />}
                               {field.type === 'textarea' && <AlertCircle size={18} />}
                               {field.type === 'file' && <FileUp size={18} />}
                            </div>
                            <div>
                               <p className="text-sm font-black text-text-main uppercase flex items-center gap-3">
                                  {field.label}
                                  {field.is_required && <span className="text-[9px] bg-mylms-rose/10 text-mylms-rose px-2 py-0.5 rounded-full uppercase tracking-widest opacity-60">Required</span>}
                               </p>
                               <p className="text-[10px] font-mono text-gray-300 uppercase tracking-widest mt-1 opacity-60">Key: {field.field_key}</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-8">
                            <button 
                              onClick={() => toggleField(field.id)}
                              className={`flex items-center gap-3 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                                field.is_active ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-400 border border-border-soft'
                              }`}
                            >
                               {field.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                               {field.is_active ? 'Authorized (Allow)' : 'Restricted (Disallow)'}
                            </button>
                            <button 
                              onClick={() => deleteField(field.id)}
                              className="w-10 h-10 bg-white border border-border-soft text-gray-200 hover:text-mylms-rose hover:border-mylms-rose/20 transition-all rounded-xl shadow-sm flex items-center justify-center group-hover/row:opacity-100 opacity-20"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                    ))}
                    {fields.filter(f => f.category === cat).length === 0 && (
                      <div className="py-12 text-center opacity-30 border-2 border-dashed border-border-soft rounded-2xl uppercase tracking-[0.4em] font-black text-[9px]">No dynamic fields defined for this section</div>
                    )}
                 </div>
              </div>
           </div>
         ))}
      </div>

       {/* Notification Modal */}
       {notification.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-mylms-purple/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl border border-white/20 max-w-sm w-full p-12 text-center transform animate-in zoom-in-95 duration-500">
              <div className={`w-20 h-20 mx-auto rounded-[28px] flex items-center justify-center mb-8 shadow-inner ${notification.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-mylms-rose/10 text-mylms-rose'}`}>
                 {notification.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
              </div>
              <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter mb-4">{notification.title}</h3>
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
