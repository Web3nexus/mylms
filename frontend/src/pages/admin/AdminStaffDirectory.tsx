import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  Briefcase, 
  Clock, 
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAppConfig } from '../../hooks/useAppConfig';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminStaffDirectory() {
  const { appName } = useAppConfig();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'instructor'
  });
  
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await client.get('/admin/staff', { headers });
      setStaff(res.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      fetchStaff();
      notify("Personnel Registry: Staff member successfully onboarded.", "success");
    } catch (err) {
      console.error('Error creating staff:', err);
      notify('Personnel Registry Error: Failed to onboard personnel. Please verify institutional credentials.', "error");
    }
  };

  const { confirm, notify } = useNotificationStore();

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Purge Personnel Record',
      message: 'Are you sure you want to permanently remove this staff member from the institutional registry? This action is irreversible and will revoke all access immediately.',
      confirmText: 'Purge Record',
      cancelText: 'Abort Protocol',
      type: 'danger'
    });

    if (!confirmed) return;
    try {
      await client.delete(`/admin/staff/${id}`, { headers });
      notify("Personnel Registry: Record successfully purged.", "success");
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      notify('Personnel Registry Error: Failed to purge record.', "error");
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Accessing Personnel Registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-10">
        <div>
           <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
              <Users className="opacity-50" size={16} />
              Institutional Personnel Registry
           </div>
           <h1 className="text-5xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">University Staffing</h1>
           <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} className="text-mylms-rose" />
              MyLMS Security: Staff Gatekeeper Active
           </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="btn-purple flex items-center gap-4 px-10 py-5 shadow-2xl hover:scale-105 transition-all text-[10px] tracking-[0.2em]"
        >
          <UserPlus size={18} />
          Onboard New Personnel
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.map((member) => (
          <div key={member.id} className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm hover:border-mylms-purple/30 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
             
             <div className="flex items-center gap-6 mb-10 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border ${
                  member.role === 'admin' ? 'bg-mylms-rose/5 border-mylms-rose/10 text-mylms-rose' : 'bg-mylms-purple/5 border-mylms-purple/10 text-mylms-purple'
                }`}>
                  {member?.name.charAt(0)}
                </div>
                <div>
                   <h4 className="text-xl font-black text-text-main tracking-tighter uppercase mb-1">{member?.name}</h4>
                   <p className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${
                     member.role === 'admin' ? 'text-mylms-rose' : 'text-mylms-purple opacity-60'
                   }`}>
                      {member.role === 'admin' ? <ShieldCheck size={12} /> : <Briefcase size={12} />}
                      {member.role}
                   </p>
                </div>
             </div>

             <div className="space-y-4 mb-10 relative z-10">
                <div className="flex items-center gap-3 text-text-secondary text-[11px] font-bold py-3 px-4 bg-offwhite rounded-xl border border-gray-50">
                   <Mail size={14} className="text-gray-300" />
                   {member?.email}
                </div>
                <div className="flex items-center gap-3 text-text-secondary text-[10px] font-bold px-4">
                   <Clock size={14} className="text-gray-300" />
                   Joined: {new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
             </div>

             <div className="flex items-center justify-between border-t border-offwhite pt-8 relative z-10">
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle size={14} />
                   Active Record
                </span>
                <button 
                  onClick={() => handleDelete(member.id)}
                  className="p-3 text-gray-300 hover:text-mylms-rose hover:bg-mylms-rose/5 rounded-xl transition-all"
                >
                   <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
           <div className="absolute inset-0 bg-mylms-purple/40 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
           <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-110 overflow-hidden animate-in zoom-in-95 duration-300 border border-border-soft">
              <div className="p-12">
                 <h3 className="text-3xl font-black text-text-main uppercase tracking-tighter mb-4">Personnel Onboarding</h3>
                 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-10 opacity-60">{appName} Security: New Staff Protocol</p>

                 <form onSubmit={handleCreate} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                       <input 
                         type="text"
                         required
                         value={formData?.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple transition-all font-black text-sm tracking-tight text-text-main shadow-inner"
                         placeholder="e.g. Professor X"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Institutional Email</label>
                       <input 
                         type="email"
                         required
                         value={formData?.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple transition-all font-black text-sm tracking-tight text-text-main shadow-inner"
                         placeholder="staff@mylms.edu"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Personnel Role</label>
                          <select 
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                            className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple transition-all font-black text-sm tracking-tight text-text-main shadow-inner appearance-none cursor-pointer"
                          >
                             <option value="instructor">Instructor</option>
                             <option value="admin">Administrator</option>
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
                          <input 
                            type="text"
                            required
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple transition-all font-black text-sm tracking-tight text-text-main shadow-inner"
                          />
                       </div>
                    </div>

                    <div className="flex items-center gap-6 pt-6">
                       <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-5 border border-border-soft rounded-full text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-offwhite transition-all"
                       >
                          Cancel Protocol
                       </button>
                       <button 
                        type="submit"
                        className="flex-1 py-5 bg-mylms-purple text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-mylms-purple/90 transition-all flex items-center justify-center gap-3"
                       >
                          Complete Registry
                          <Plus size={16} />
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
