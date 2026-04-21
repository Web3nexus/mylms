import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  Mail, 
  Send, 
  Settings, 
  Shield, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Save,
  Server,
  Lock,
  User,
  ExternalLink,
  Loader2,
  Layout
} from 'lucide-react';

interface CommunicationSettings {
  mail_host: string;
  mail_port: number;
  mail_encryption: string;
  mail_username: string;
  mail_password: string;
  mail_from_address: string;
  mail_from_name: string;
}

export default function CommunicationManager() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<CommunicationSettings>({
    mail_host: '',
    mail_port: 587,
    mail_encryption: 'tls',
    mail_username: '',
    mail_password: '',
    mail_from_address: '',
    mail_from_name: ''
  });

  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await client.get('/communications/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch communication settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotif(null);
    try {
      await client.post('/communications/settings', settings);
      setNotif({ type: 'success', message: 'Institutional communication gateway updated.' });
    } catch (err: any) {
      setNotif({ type: 'error', message: err.response?.data?.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTesting(true);
    setNotif(null);
    try {
      await client.post('/communications/test-email', { email: testEmail });
      setNotif({ type: 'success', message: 'Test protocol initiated. Check the target inbox.' });
    } catch (err: any) {
      setNotif({ type: 'error', message: err.response?.data?.error || 'Test transmission failed. Verify credentials.' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return (
    <div className="py-20 text-center">
       <Loader2 className="w-12 h-12 text-mylms-purple animate-spin mx-auto mb-6" />
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Gateway Settings...</p>
    </div>
  );

  return (
    <div className="p-8 md:p-16 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
           <div className="inline-flex items-center gap-3 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px] mb-6">
              <span className="w-10 h-px bg-mylms-purple"></span>
              Centralized Communications
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-mylms-purple uppercase tracking-tighter leading-none italic">
             Institutional<br /><span className="text-mylms-rose text-stroke">Gateway</span>
           </h1>
        </div>

         <div className="flex flex-col md:flex-row items-center gap-4">
            <button 
              onClick={() => navigate('/admin/communications/templates')}
              className="flex items-center gap-4 bg-mylms-purple p-4 px-8 rounded-3xl border border-mylms-purple shadow-lg text-white hover:opacity-90 transition-all active:scale-95"
            >
               <Layout size={20} />
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-tight">Template Architecture</p>
                  <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mt-1">Manage institutional Emails</p>
               </div>
            </button>
            <button 
              onClick={() => navigate('/admin/communications/gateways')}
              className="flex items-center gap-4 bg-white p-4 px-8 rounded-3xl border border-border-soft shadow-sm hover:border-mylms-purple transition-all active:scale-95 group"
            >
               <Server size={20} className="text-text-secondary group-hover:text-mylms-purple transition-colors" />
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-tight text-text-main group-hover:text-mylms-purple transition-colors">Gateway Routing</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 group-hover:text-mylms-purple/60 transition-colors">Multiple SMTP Config</p>
               </div>
            </button>
            <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-border-soft shadow-sm hidden lg:flex">
               <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Shield size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-text-main uppercase tracking-tight">Security Status</p>
                  <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-1">TLS Protocol Active</p>
               </div>
            </div>
         </div>
      </div>

      {notif && (
        <div className={`mb-12 p-6 rounded-3xl border flex items-center gap-6 animate-in slide-in-from-top-4 duration-500 ${notif.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-mylms-rose/5 border-mylms-rose/20 text-mylms-rose'}`}>
          {notif.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <p className="text-xs font-black uppercase tracking-widest">{notif.message}</p>
          <button onClick={() => setNotif(null)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* SMTP CONFIG */}
          <div className="bg-white rounded-[40px] border border-border-soft shadow-xl overflow-hidden group border-t-8 border-t-mylms-purple relative">
             <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full pointer-events-none group-hover:bg-mylms-purple/5 transition-all duration-1000" />
             
             <div className="p-10 border-b border-border-soft flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-mylms-purple/10 text-mylms-purple rounded-2xl flex items-center justify-center">
                      <Server size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-mylms-purple uppercase tracking-tight">SMTP Configuration</h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Global Delivery Protocol</p>
                   </div>
                </div>
                <Activity className="text-mylms-purple/20" size={32} />
             </div>

             <form onSubmit={handleUpdate} className="p-10 space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Mail Host</label>
                      <div className="relative">
                        <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="text" 
                          value={settings.mail_host}
                          onChange={e => setSettings({...settings, mail_host: e.target.value})}
                          placeholder="smtp.provider.com"
                          className="w-full p-4 pl-12 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs"
                        />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Port</label>
                      <input 
                        type="number" 
                        value={settings.mail_port}
                        onChange={e => setSettings({...settings, mail_port: parseInt(e.target.value)})}
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs uppercase"
                      />
                   </div>
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Encryption</label>
                      <select 
                        value={settings.mail_encryption}
                        onChange={e => setSettings({...settings, mail_encryption: e.target.value})}
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs appearance-none uppercase"
                      >
                         <option value="tls">TLS (Standard)</option>
                         <option value="ssl">SSL (Legacy)</option>
                         <option value="null">None (Insecure)</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Username / Account</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="text" 
                          value={settings.mail_username}
                          onChange={e => setSettings({...settings, mail_username: e.target.value})}
                          className="w-full p-4 pl-12 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs"
                        />
                      </div>
                   </div>
                   <div className="md:col-span-2">
                       <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">App Password / Secret</label>
                       <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                         <input 
                           type="password" 
                           value={settings.mail_password}
                           onChange={e => setSettings({...settings, mail_password: e.target.value})}
                           className="w-full p-4 pl-12 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main text-xs"
                         />
                       </div>
                   </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-offwhite">
                   <button 
                     type="submit"
                     disabled={saving}
                     className="btn-purple px-10 py-4 text-xs flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                   >
                      {saving ? 'Syncing...' : 'Update Gateway Config'}
                      <Save size={16} />
                   </button>
                </div>
             </form>
          </div>

          {/* IDENTITY CONFIG */}
          <div className="bg-white rounded-[40px] border border-border-soft shadow-xl overflow-hidden group border-t-8 border-t-mylms-rose relative">
             <div className="absolute top-0 right-0 w-48 h-48 bg-offwhite rounded-bl-full pointer-events-none group-hover:bg-mylms-rose/5 transition-all duration-1000" />
             
             <div className="p-10 border-b border-border-soft flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-mylms-rose/10 text-mylms-rose rounded-2xl flex items-center justify-center">
                      <Mail size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-mylms-rose uppercase tracking-tight">Institutional Identity</h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Sender Profile Protocol</p>
                   </div>
                </div>
             </div>

             <div className="p-10 space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Sender Name (Visible)</label>
                      <input 
                        type="text" 
                        value={settings.mail_from_name}
                        onChange={e => setSettings({...settings, mail_from_name: e.target.value})}
                        placeholder="MyLMS Admissions"
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-rose font-black text-text-main text-xs uppercase"
                      />
                   </div>
                   <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Contact Email (Reply-To)</label>
                      <input 
                        type="email" 
                        value={settings.mail_from_address}
                        onChange={e => setSettings({...settings, mail_from_address: e.target.value})}
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-rose font-black text-text-main text-xs uppercase"
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-12">
           {/* TEST PROTOCOL CARD */}
           <div className="bg-mylms-purple p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
              
              <div className="relative z-10">
                 <h4 className="text-xl font-black uppercase tracking-tight mb-4 italic">Test Protocol</h4>
                 <p className="text-[10px] font-bold opacity-60 leading-relaxed mb-8 uppercase tracking-widest">
                   Verify connectivity by transmitting a System Test Protocol to a verified inbox.
                 </p>

                 <div className="space-y-6">
                    <div>
                       <label className="block text-[9px] font-black opacity-40 uppercase tracking-widest mb-3 pl-1">Target Recipient</label>
                       <input 
                         type="email" 
                         value={testEmail}
                         onChange={e => setTestEmail(e.target.value)}
                         placeholder="you@example.com"
                         className="w-full p-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:bg-white/20 font-black text-white text-xs"
                       />
                    </div>
                    <button 
                      onClick={handleTestEmail}
                      disabled={testing || !testEmail}
                      className="w-full py-4 bg-white text-mylms-purple font-black rounded-xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all active:scale-95 disabled:opacity-50"
                    >
                       {testing ? 'Transmitting...' : 'Send Test Protocol'}
                       <Send size={14} />
                    </button>
                 </div>
              </div>
           </div>

           {/* HELP / DOCS */}
           <div className="bg-white p-10 rounded-[40px] border border-border-soft shadow-sm">
              <h4 className="text-xs font-black text-text-main uppercase tracking-widest mb-6 flex items-center gap-3">
                 <Shield size={16} className="text-mylms-rose" />
                 SMTP Best Practices
              </h4>
              <ul className="space-y-4">
                 <li className="flex gap-3">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-text-secondary leading-normal uppercase">Use App Passwords for Gmail/Outlook.</p>
                 </li>
                 <li className="flex gap-3">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-text-secondary leading-normal uppercase">Ensure Port 587 (TLS) is open on your firewall.</p>
                 </li>
              </ul>
              
              <div className="mt-8 pt-8 border-t border-offwhite">
                 <p className="text-[9px] font-bold text-gray-400 leading-normal uppercase mb-4">Need a premium provider?</p>
                 <a href="https://postmarkapp.com" target="_blank" className="text-[10px] font-black text-mylms-purple flex items-center gap-2 hover:text-mylms-rose transition-colors uppercase italic">
                    Postmark <ExternalLink size={12} />
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
