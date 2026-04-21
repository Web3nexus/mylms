import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  Server, 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Activity
} from 'lucide-react';

interface MailAccount {
  id?: number;
  category: string;
  host: string;
  port: number;
  encryption: string;
  username: string;
  password?: string;
  from_address: string;
  from_name: string;
  is_active: boolean;
}

export default function EmailAccountManager() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await client.get('/admin/mail-accounts');
      setAccounts(res.data);
    } catch (err) {
      console.error('Failed to fetch mail accounts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    setAccounts([
      ...accounts,
      {
        category: 'new_category',
        host: '',
        port: 587,
        encryption: 'tls',
        username: '',
        password: '',
        from_address: '',
        from_name: '',
        is_active: true
      }
    ]);
  };

  const handleChange = (index: number, field: keyof MailAccount, value: any) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: value };
    setAccounts(updated);
  };

  const handleSave = async (account: MailAccount) => {
    setSaving(true);
    setNotif(null);
    try {
      if (account.id) {
        await client.put(`/admin/mail-accounts/${account.id}`, account);
      } else {
        await client.post('/admin/mail-accounts', account);
      }
      setNotif({ type: 'success', message: 'SMTP Gateway updated successfully.' });
      fetchAccounts();
    } catch (err: any) {
      setNotif({ type: 'error', message: err.response?.data?.message || 'Failed to update gateway.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account: MailAccount, index: number) => {
    if (!account.id) {
      const updated = [...accounts];
      updated.splice(index, 1);
      setAccounts(updated);
      return;
    }

    if (!confirm('Are you sure you want to delete this SMTP configuration?')) return;

    try {
      await client.delete(`/admin/mail-accounts/${account.id}`);
      setNotif({ type: 'success', message: 'SMTP Gateway removed.' });
      fetchAccounts();
    } catch (err) {
      setNotif({ type: 'error', message: 'Failed to delete gateway.' });
    }
  };

  if (loading) return (
    <div className="py-20 text-center">
       <div className="w-12 h-12 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Routing Architecture...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-offwhite p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin/communications')}
              className="p-3 bg-white border border-border-soft rounded-2xl hover:bg-offwhite transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-mylms-purple uppercase tracking-tighter italic">Multi-Gateway <span className="text-mylms-rose text-stroke">Routing</span></h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Segmented SMTP Architecture</p>
            </div>
          </div>
          <button onClick={handleAddAccount} className="btn-purple px-8 py-3 text-xs flex items-center gap-2">
            <Plus size={16} /> Add Gateway
          </button>
        </div>

        {notif && (
          <div className={`mb-12 p-6 rounded-3xl border flex items-center gap-6 animate-in slide-in-from-top-4 duration-500 ${notif.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-mylms-rose/5 border-mylms-rose/20 text-mylms-rose'}`}>
            {notif.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <p className="text-xs font-black uppercase tracking-widest">{notif.message}</p>
            <button onClick={() => setNotif(null)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">✕</button>
          </div>
        )}

        <div className="space-y-8">
          {accounts.map((account, idx) => (
            <div key={idx} className="bg-white rounded-[40px] border border-border-soft shadow-sm overflow-hidden group border-t-8 border-t-mylms-purple relative transition-all">
              <div className="p-8 border-b border-border-soft bg-offwhite/50 flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-mylms-purple/10 text-mylms-purple rounded-xl flex items-center justify-center">
                       <Server size={20} />
                    </div>
                    <div>
                       <input 
                         type="text"
                         value={account.category}
                         onChange={(e) => handleChange(idx, 'category', e.target.value)}
                         className="bg-transparent font-black text-lg text-mylms-purple uppercase tracking-tight outline-none border-b border-dashed border-mylms-purple/30 focus:border-mylms-purple"
                         placeholder="e.g. academic, finance"
                       />
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Routing Category</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleSave(account)}
                      disabled={saving}
                      className="px-6 py-2 bg-text-main text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-mylms-purple transition-colors flex items-center gap-2"
                    >
                      <Save size={14} /> Save
                    </button>
                    <button 
                      onClick={() => handleDelete(account, idx)}
                      className="p-2 text-mylms-rose hover:bg-mylms-rose/10 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Host</label>
                    <input 
                      type="text" value={account.host} onChange={(e) => handleChange(idx, 'host', e.target.value)}
                      className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-xs"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Port</label>
                      <input 
                        type="number" value={account.port} onChange={(e) => handleChange(idx, 'port', Number(e.target.value))}
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-xs"
                      />
                   </div>
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Encryption</label>
                      <select 
                        value={account.encryption} onChange={(e) => handleChange(idx, 'encryption', e.target.value)}
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-xs uppercase"
                      >
                         <option value="tls">TLS</option>
                         <option value="ssl">SSL</option>
                         <option value="null">None</option>
                      </select>
                   </div>
                 </div>
                 <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Sender Profile</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" value={account.from_name} onChange={(e) => handleChange(idx, 'from_name', e.target.value)}
                        placeholder="Name" className="w-1/2 p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-xs"
                      />
                      <input 
                        type="email" value={account.from_address} onChange={(e) => handleChange(idx, 'from_address', e.target.value)}
                        placeholder="Email" className="w-1/2 p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-xs"
                      />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Username</label>
                    <input 
                      type="text" value={account.username} onChange={(e) => handleChange(idx, 'username', e.target.value)}
                      className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-xs"
                    />
                 </div>
                 <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Password</label>
                    <input 
                      type="password" value={account.password || ''} onChange={(e) => handleChange(idx, 'password', e.target.value)}
                      placeholder={account.id ? "••••••••" : "Password"}
                      className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-xs"
                    />
                 </div>
                 <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" checked={account.is_active} onChange={(e) => handleChange(idx, 'is_active', e.target.checked)}
                        className="w-5 h-5 rounded text-mylms-purple focus:ring-mylms-purple"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest {account.is_active ? 'text-green-600' : 'text-gray-400'}">
                        {account.is_active ? 'Gateway Active' : 'Gateway Inactive'}
                      </span>
                    </label>
                 </div>
              </div>
            </div>
          ))}
          
          {accounts.length === 0 && (
            <div className="bg-white p-16 rounded-[40px] border border-border-soft text-center shadow-sm">
               <Activity size={48} className="mx-auto mb-6 text-mylms-purple opacity-20" />
               <h3 className="text-xl font-black text-text-main uppercase tracking-tighter mb-2">No Secondary Gateways</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 System falls back to the master SMTP configuration.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
