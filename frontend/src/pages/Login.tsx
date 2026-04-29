import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Hash,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Globe,
  QrCode,
  Key
} from 'lucide-react';
import { useBranding } from '../hooks/useBranding';
import { useAppConfig } from '../hooks/useAppConfig';

export default function Login() {
  const { branding } = useBranding();
  const { appName } = useAppConfig();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginContext, setLoginContext] = useState<'portal' | 'campus'>('portal');
  
  // 2FA States
  const [requires2FA, setRequires2FA] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState<number | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  // Determine the entry gate based on the path
  const isSecurityGate = location.pathname === '/securegate';
  const isStaffGate = location.pathname === '/office';
  const isStudentGate = !isSecurityGate && !isStaffGate;

  const gateName = isSecurityGate ? 'Admin Security Gate' : 
                   isStaffGate ? 'Staff Office Gate' : 
                   'Student Registry';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await client.post('/auth/login', { 
        identifier, 
        password,
        context: loginContext
      });

      if (response.data.requires_2fa) {
        setRequires2FA(true);
        setUserIdFor2FA(response.data.user_id);
        setLoading(false);
        return;
      }

      const { user, access_token } = response.data;

      // ROLE ENFORCEMENT
      if (isSecurityGate && user.role !== 'admin') {
         setError('RESTRICTED ACCESS: Administrative credentials required.');
         setLoading(false);
         return;
      }

      if (isStaffGate && user.role !== 'instructor') {
         setError('RESTRICTED ACCESS: Staff credentials required.');
         setLoading(false);
         return;
      }
      
      setAuth(user, access_token);
      
      if (user.role === 'admin') navigate('/admin/portal');
      else if (user.role === 'instructor') navigate('/office/portal');
      else navigate('/portal');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await client.post('/auth/2fa/verify-login', { 
        user_id: userIdFor2FA,
        code: twoFactorCode
      });
      const { user, access_token } = response.data;
      
      setAuth(user, access_token);
      
      if (user.role === 'admin') navigate('/admin/portal');
      else if (user.role === 'instructor') navigate('/office/portal');
      else navigate('/portal');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid 2FA code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white selection:bg-mylms-rose/20 overflow-hidden">
      {/* Left Panel: Visual/Branding Side */}
      <div className="lg:w-5/12 p-12 lg:p-24 flex flex-col justify-between bg-mylms-purple relative overflow-hidden group">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.05] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-[3s]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white opacity-[0.02] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 transition-all duration-1000 group-hover:translate-x-2">
          <Link to="/" className="flex items-center gap-5 group/logo">
            {branding?.logo_light_url ? (
              <div className="h-16 overflow-hidden shrink-0 transition-all flex items-center">
                <img src={branding.logo_light_url} className="h-full w-auto object-contain" alt="Logo" />
              </div>
            ) : branding?.logo_url ? (
               <div className="h-16 overflow-hidden shrink-0 transition-all flex items-center bg-white p-3 rounded-2xl shadow-2xl">
                 <img src={branding.logo_url} className="h-full w-auto object-contain" alt="Logo" />
               </div>
            ) : (
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white flex items-center justify-center text-mylms-purple rounded-2xl shadow-2xl transition-all group-hover/logo:-rotate-6">
                  <GraduationCap size={36} />
                </div>
                <div>
                   <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{branding?.institutional_name || appName}</h1>
                   <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mt-2">{branding?.institutional_motto || 'University Network Authority'}</p>
                </div>
              </div>
            )}
          </Link>

          <div className="mt-32 max-w-sm">
             <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-white/5 backdrop-blur-md">
                <ShieldCheck size={14} className="text-white" />
                Secure Gateway Protocol
             </div>
             <h2 className="text-6xl lg:text-7xl font-serif font-black text-white leading-[0.9] tracking-tighter uppercase mb-10">
               {branding?.auth_panel_title || 'Access the Nexus.'}
             </h2>
             <p className="text-white/60 text-lg font-medium leading-relaxed mb-10">
                {branding?.auth_panel_desc || 'Enter your institutional credentials to sync with the global academic registry and manage your learning journey.'}
             </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-12 border-t border-white/10 pt-10 mt-20">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">System Identity</p>
              <p className="text-white font-black text-xs uppercase flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Operational
              </p>
           </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Registry Sync</p>
              <p className="text-white font-black text-xs uppercase flex items-center gap-2">
                <Globe size={12} className="text-white/40" /> Verified Secure
              </p>
           </div>
        </div>
      </div>

      <div className="lg:w-7/12 flex items-center justify-center p-8 lg:p-24 bg-offwhite">
        <div className={`w-full max-w-xl premium-card group/card ${isSecurityGate ? 'border-t-[12px] border-t-mylms-rose' : ''}`}>
          
          <div className="p-10">
            <div className="mb-10">
               <div className="flex justify-between items-center mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg overflow-hidden shadow-inner border border-border-soft transition-all group-hover/card:bg-mylms-purple group-hover/card:text-white ${isSecurityGate ? 'text-mylms-rose' : 'text-mylms-purple'}`}>
                     {branding?.favicon_url ? (
                       <img src={branding.favicon_url} className="w-full h-full object-contain" alt="Identity" />
                     ) : (
                       isSecurityGate ? 'SG' : isStaffGate ? 'SO' : 'ML'
                     )}
                  </div>
                  {isStudentGate && !requires2FA && (
                    <div className="flex bg-offwhite p-1 rounded-xl border border-border-soft shadow-inner">
                       <button 
                         onClick={() => setLoginContext('portal')}
                         className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${loginContext === 'portal' ? 'bg-white text-mylms-purple shadow-sm' : 'text-gray-400 hover:text-mylms-purple'}`}
                       >Admission</button>
                       <button 
                         onClick={() => setLoginContext('campus')}
                         className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${loginContext === 'campus' ? 'bg-white text-mylms-purple shadow-sm' : 'text-gray-400 hover:text-mylms-purple'}`}
                       >Campus</button>
                    </div>
                  )}
               </div>
               <h2 className={`text-3xl font-black tracking-tighter uppercase leading-none ${isSecurityGate ? 'text-mylms-rose' : 'text-text-main'}`}>
                  {requires2FA ? 'Identity Verification' : gateName}
               </h2>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-4 opacity-70">
                 {requires2FA ? 'Enter Multi-Factor Protocol Code' : isSecurityGate ? branding?.institutional_name : 'Unified Academic Network Entry'}
               </p>
            </div>

            {error && (
              <div className="mb-12 p-6 bg-mylms-rose/5 border border-mylms-rose/20 text-mylms-rose rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 animate-shake">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {!requires2FA ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="premium-input-wrapper group/input">
                  <label className="premium-label">
                    {isStudentGate ? (loginContext === 'portal' ? 'Email Address' : 'Student Number') : 'Institutional ID'}
                  </label>
                  <div className="relative">
                    <Mail className="premium-input-icon" size={20} />
                    <input 
                      type={isStudentGate && loginContext === 'portal' ? 'email' : 'text'}
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="premium-input" 
                      placeholder="Enter Credentials"
                    />
                  </div>
                </div>
                
                <div className="premium-input-wrapper group/input">
                  <div className="flex justify-between items-center mb-4">
                    <label className="premium-label !text-white !text-[8px] tracking-widest !mb-0">Security Protocol</label>
                    <Link to="/forgot-password" className="text-[9px] font-black text-mylms-rose hover:-translate-x-1 transition-all uppercase tracking-widest">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="premium-input-icon" size={20} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="premium-input" 
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-5 mt-6 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 disabled:opacity-50 relative overflow-hidden group/btn shadow-2xl active:scale-95 transition-all ${isSecurityGate ? 'bg-mylms-rose shadow-mylms-rose/20' : 'bg-mylms-purple shadow-mylms-purple/20'}`}
                >
                  {loading ? 'Validating Unified Protocol...' : gateName === 'Student Registry' ? `Enter ${appName} Campus` : 'Authorize Security Gateway'}
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <form onSubmit={handle2FAVerify} className="space-y-6">
                <div className="premium-input-wrapper group/input">
                  <label className="premium-label">2FA AUTHENTICATION CODE</label>
                  <div className="relative">
                    <Key className="premium-input-icon" size={20} />
                    <input 
                      type="text"
                      required
                      autoFocus
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="premium-input tracking-[0.5em] text-center text-xl" 
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4 text-center">
                    Enter the 6-digit code from your authenticator app.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-5 mt-6 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 disabled:opacity-50 relative overflow-hidden group/btn shadow-2xl active:scale-95 transition-all ${isSecurityGate ? 'bg-mylms-rose shadow-mylms-rose/20' : 'bg-mylms-purple shadow-mylms-purple/20'}`}
                >
                  {loading ? 'Verifying Identity...' : 'Confirm Verification'}
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <button 
                  type="button"
                  onClick={() => setRequires2FA(false)}
                  className="w-full text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4 hover:text-mylms-purple transition-colors"
                >
                  Back to standard login
                </button>
              </form>
            )}

            <div className="mt-12 text-center pt-8 border-t border-offwhite">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isStudentGate ? (
                  <>New Candidate? <Link to="/register" className="text-mylms-purple hover:text-mylms-rose transition-colors ml-2 border-b-2 border-mylms-purple/10">Apply For Entry</Link></>
                ) : (
                  <span className="opacity-40 flex items-center justify-center gap-2"><ShieldCheck size={14} /> Unauthorized attempts are monitored.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorator */}
      <div className="fixed bottom-10 right-10 flex gap-6 opacity-40 hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-3">
            <Sparkles size={14} className="text-mylms-rose animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400">Identity Framework 2.4</span>
         </div>
      </div>
    </div>
  );
}

