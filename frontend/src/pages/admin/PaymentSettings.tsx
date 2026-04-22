import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  ShieldCheck, 
  Settings, 
  CreditCard, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe, 
  Zap, 
  Save, 
  Bell, 
  ExternalLink,
  Info
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function PaymentSettings() {
  const token = useAuthStore(state => state.token);
  const { notify } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const [settings, setSettings] = useState({
    paystack_enabled: false,
    paystack_public_key: '',
    paystack_secret_key: '',
    flutterwave_enabled: false,
    flutterwave_public_key: '',
    flutterwave_secret_key: '',
    turnstile_enabled: false,
    turnstile_site_key: '',
    turnstile_secret_key: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await client.get('/admin/finance/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
    } catch (err) {
      notify('Registry Access Denied', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await client.post('/admin/finance/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify('Institutional Financial Protocols Synchronized', 'success');
      fetchSettings(); // Refresh to get masked values back if they were changed
    } catch (err) {
      notify('Registry Commit Failure', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return (
     <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Accessing Financial Registry...</p>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12 border-b border-border-soft pb-10">
        <div>
           <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[11px]">
              <Lock className="opacity-50" size={16} />
              Security & Settlement Protocols
           </div>
           <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none font-display">Financial Settings</h1>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6">
              Manage your institutional payment gateways and global security layers.
           </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-purple flex items-center gap-3 px-10 py-4 text-xs shadow-mylms-purple/20 shadow-2xl"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
          Commit Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Paystack Panel */}
        <div className="bg-white rounded-[40px] border border-border-soft shadow-xl p-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full group-hover:scale-110 transition-transform duration-1000"></div>
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <CreditCard size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Paystack Gateway</h3>
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Settlement Provider A</p>
                 </div>
              </div>
              <button 
                onClick={() => setSettings({...settings, paystack_enabled: !settings.paystack_enabled})}
                className={`w-14 h-7 rounded-full p-1 transition-all relative ${settings.paystack_enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                 <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${settings.paystack_enabled ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
           </div>

           <div className={`space-y-8 relative z-10 transition-all ${!settings.paystack_enabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="space-y-3">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Public Key <Info size={12} className="opacity-50" />
                 </label>
                 <input 
                   type="text" 
                   value={settings.paystack_public_key}
                   onChange={e => setSettings({...settings, paystack_public_key: e.target.value})}
                   placeholder="pk_live_..."
                   className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-blue-500 transition-all font-mono text-xs"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secret Key (Encrypted)</label>
                 <div className="relative">
                    <input 
                      type={showSecrets['paystack'] ? 'text' : 'password'} 
                      value={settings.paystack_secret_key}
                      onChange={e => setSettings({...settings, paystack_secret_key: e.target.value})}
                      placeholder="sk_live_..."
                      className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-blue-500 transition-all font-mono text-xs"
                    />
                    <button 
                      onClick={() => toggleSecret('paystack')}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-500 transition-all"
                    >
                       {showSecrets['paystack'] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Flutterwave Panel */}
        <div className="bg-white rounded-[40px] border border-border-soft shadow-xl p-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-full group-hover:scale-110 transition-transform duration-1000"></div>
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Globe size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Flutterwave Gateway</h3>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1">Settlement Provider B</p>
                 </div>
              </div>
              <button 
                onClick={() => setSettings({...settings, flutterwave_enabled: !settings.flutterwave_enabled})}
                className={`w-14 h-7 rounded-full p-1 transition-all relative ${settings.flutterwave_enabled ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                 <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${settings.flutterwave_enabled ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
           </div>

           <div className={`space-y-8 relative z-10 transition-all ${!settings.flutterwave_enabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="space-y-3">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Public Key</label>
                 <input 
                   type="text" 
                   value={settings.flutterwave_public_key}
                   onChange={e => setSettings({...settings, flutterwave_public_key: e.target.value})}
                   placeholder="FLWPUBK_..."
                   className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-orange-500 transition-all font-mono text-xs"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secret Key (Encrypted)</label>
                 <div className="relative">
                    <input 
                      type={showSecrets['flutterwave'] ? 'text' : 'password'} 
                      value={settings.flutterwave_secret_key}
                      onChange={e => setSettings({...settings, flutterwave_secret_key: e.target.value})}
                      placeholder="FLWSECK_..."
                      className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-orange-500 transition-all font-mono text-xs"
                    />
                    <button 
                      onClick={() => toggleSecret('flutterwave')}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-orange-500 transition-all"
                    >
                       {showSecrets['flutterwave'] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Cloudflare Turnstile Panel */}
        <div className="bg-white rounded-[40px] border border-border-soft shadow-xl p-10 relative overflow-hidden group lg:col-span-2">
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/20 rounded-bl-full group-hover:scale-110 transition-transform duration-1000"></div>
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-orange-100/50 text-orange-600 rounded-3xl flex items-center justify-center shadow-inner border border-orange-200/50">
                    <ShieldCheck size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-text-main uppercase tracking-tight leading-none mb-2 text-orange-600">Cloudflare Turnstile</h3>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Institutional Security Protocol</p>
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => setSettings({...settings, turnstile_enabled: !settings.turnstile_enabled})}
                className={`w-14 h-7 rounded-full p-1 transition-all relative ${settings.turnstile_enabled ? 'bg-orange-600' : 'bg-gray-200'}`}
              >
                 <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${settings.turnstile_enabled ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
           </div>

           <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 transition-all ${!settings.turnstile_enabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="space-y-6">
                 <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-3xl">
                    <p className="text-[10px] font-bold text-orange-800 leading-loose uppercase tracking-widest italic opacity-70">
                       Turnstile is a privacy-first reCAPTCHA alternative. When enabled, it protects your financial endpoints from automated bot settlements and brute-force key verification attempts.
                    </p>
                    <a href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">
                       Access Dashboard <ExternalLink size={12} />
                    </a>
                 </div>
              </div>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Site Key (Public API)</label>
                    <input 
                      type="text" 
                      value={settings.turnstile_site_key}
                      onChange={e => setSettings({...settings, turnstile_site_key: e.target.value})}
                      placeholder="0x4AAAAAA..."
                      className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-orange-500 transition-all font-mono text-xs"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secret Key (Encrypted)</label>
                    <div className="relative">
                       <input 
                         type={showSecrets['turnstile'] ? 'text' : 'password'} 
                         value={settings.turnstile_secret_key}
                         onChange={e => setSettings({...settings, turnstile_secret_key: e.target.value})}
                         placeholder="0x4AAAAAA..."
                         className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-orange-500 transition-all font-mono text-xs"
                       />
                       <button 
                         onClick={() => toggleSecret('turnstile')}
                         className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-orange-500 transition-all"
                       >
                          {showSecrets['turnstile'] ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
