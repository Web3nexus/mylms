import { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Award, Users, MessageCircle, Save, Clock, Smartphone, QrCode, Lock, CheckCircle2, Copy, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function ProfileSettings() {
  const { user: authUser, token, setUser } = useAuthStore();
  const [user, setFullUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'achievements' | 'mobile'>('general');

  // Form States
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2FA States
  const [twoFactorQr, setTwoFactorQr] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } });
      setFullUser(res.data.user);
      setCertificates(res.data.certificates || []);
      setFormData({ name: res.data.user.name, email: res.data.user.email });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (avatarFile) data.append('avatar', avatarFile);

      const res = await client.post('/user/profile', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setFullUser(res.data.user);
      setUser(res.data.user); // Update global store
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await client.patch('/auth/profile/password', passwordData, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Password updated successfully!');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const generate2FA = async () => {
    try {
      const res = await client.post('/2fa/generate', {}, { headers: { Authorization: `Bearer ${token}` } });
      setTwoFactorQr(res.data.qr_svg);
      setTwoFactorSecret(res.data.secret);
    } catch (err) {
      setError('Failed to generate 2FA credentials');
    }
  };

  const enable2FA = async () => {
    try {
      await client.post('/2fa/enable', { code: twoFactorCode }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Two-Factor Authentication enabled successfully!');
      setTwoFactorQr(null);
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid 2FA code');
    }
  };

  const disable2FA = async () => {
    try {
      await client.post('/2fa/disable', {}, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Two-Factor Authentication disabled.');
      fetchProfile();
    } catch (err) {
      setError('Failed to disable 2FA');
    }
  };

  if (loading || !user) {
    return (
      <div className="py-20 flex flex-col justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-mylms-purple font-black uppercase tracking-widest text-[9px]">Synchronizing Identity...</p>
      </div>
    );
  }

  const isStudent = user.role === 'student';

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      {/* Header */}
      <div className="mb-12 border-b border-border-soft pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
            <Shield size={16} className="opacity-50" /> Identity Hub
          </div>
          <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Profile Settings</h1>
        </div>
        
        <div className="flex bg-offwhite p-1 rounded-2xl shadow-inner border border-border-soft overflow-x-auto max-w-full hide-scrollbar">
          {(['general', 'security', 'achievements', 'mobile'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-mylms-purple shadow-sm' : 'text-gray-400 hover:text-mylms-purple'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Sidebar Info Card */}
        <div className="space-y-8">
          <div className="bg-white border border-border-soft rounded-[32px] p-8 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mylms-purple/5 rounded-bl-full -z-0"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-mylms-purple flex items-center justify-center text-white text-4xl font-black shadow-xl ring-8 ring-mylms-purple/10 overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                {activeTab === 'general' && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-3 bg-mylms-rose text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera size={14} />
                  </button>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-text-main tracking-tight mb-1">{user.name}</h3>
              <p className="text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-4">{user.role}</p>
              
              {isStudent && (
                 <div className="bg-mylms-purple/5 px-6 py-3 rounded-2xl w-full text-left mb-6">
                   <p className="text-[8px] font-black text-mylms-purple uppercase tracking-widest">Matric Number</p>
                   <p className="text-lg font-black text-text-main font-mono">{user.student_id || 'PENDING_REG'}</p>
                 </div>
              )}

              <div className="w-full pt-6 border-t border-gray-50 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Department</span>
                  <span className="text-text-main">{user.department?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Level</span>
                  <span className="text-text-main">{user.level?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {error && <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700 text-xs font-black uppercase tracking-widest">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 p-4 rounded-2xl text-green-700 text-xs font-black uppercase tracking-widest">{success}</div>}

          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="bg-white border border-border-soft rounded-[40px] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-8 flex items-center gap-3">
                <User size={24} className="text-mylms-purple" /> General Information
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={e => setAvatarFile(e.target.files?.[0] || null)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Full Legal Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-purple outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
                    <input type="email" value={formData.email} disabled className="w-full bg-gray-100 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-gray-400 cursor-not-allowed outline-none" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={saving} className="bg-mylms-purple text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-2 shadow-xl">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SECURITY & 2FA */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white border border-border-soft rounded-[40px] p-10 shadow-sm">
                <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Lock size={24} className="text-mylms-rose" /> Password Update
                </h3>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Current Password</label>
                    <input type="password" value={passwordData.current_password} onChange={e => setPasswordData({...passwordData, current_password: e.target.value})} className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-rose outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">New Password</label>
                      <input type="password" value={passwordData.password} onChange={e => setPasswordData({...passwordData, password: e.target.value})} className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-rose outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Confirm Password</label>
                      <input type="password" value={passwordData.password_confirmation} onChange={e => setPasswordData({...passwordData, password_confirmation: e.target.value})} className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-rose outline-none transition-all" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" disabled={saving} className="bg-mylms-rose text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-2 shadow-xl">
                      <Shield size={16} /> Update Password
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white border border-border-soft rounded-[40px] p-10 shadow-sm">
                 <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-4 flex items-center gap-3">
                  <Shield size={24} className="text-blue-500" /> Two-Factor Authentication
                 </h3>
                 <p className="text-sm font-medium text-gray-500 mb-8 max-w-lg">Protect your account with an additional layer of security. Once configured, you'll be required to enter both your password and an authentication code from your mobile app.</p>
                 
                 {user.two_factor_enabled ? (
                    <div className="bg-green-50 border border-green-200 p-8 rounded-[24px] flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <CheckCircle2 size={32} className="text-green-500" />
                          <div>
                            <h4 className="text-sm font-black text-green-800 uppercase tracking-widest">2FA is Enabled</h4>
                            <p className="text-xs font-bold text-green-600 mt-1">Your account is highly secure.</p>
                          </div>
                       </div>
                       <button onClick={disable2FA} className="px-6 py-3 bg-white text-red-500 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm">
                         Disable 2FA
                       </button>
                    </div>
                 ) : (
                    <div>
                      {!twoFactorQr ? (
                        <button onClick={generate2FA} className="px-8 py-4 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2">
                           <QrCode size={16} /> Setup Authenticator App
                        </button>
                      ) : (
                        <div className="bg-offwhite p-8 rounded-[24px] border border-border-soft">
                           <h4 className="text-xs font-black uppercase tracking-widest text-text-main mb-6">Scan QR Code</h4>
                           <div className="flex flex-col md:flex-row gap-8 items-center">
                              <div className="bg-white p-4 rounded-2xl shadow-sm" dangerouslySetInnerHTML={{ __html: atob(twoFactorQr) }} />
                              <div className="space-y-6 flex-1 w-full">
                                <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Secret Key</p>
                                  <div className="flex items-center gap-2 bg-gray-200 p-3 rounded-xl">
                                    <code className="text-xs font-mono font-bold text-text-main flex-1">{twoFactorSecret}</code>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Verification Code</p>
                                  <div className="flex gap-4">
                                    <input 
                                      type="text" 
                                      value={twoFactorCode} 
                                      onChange={e => setTwoFactorCode(e.target.value)} 
                                      placeholder="000000"
                                      className="flex-1 bg-white border-2 border-transparent rounded-xl py-3 px-4 text-sm font-bold focus:border-blue-500 outline-none tracking-[0.5em] text-center"
                                    />
                                    <button onClick={enable2FA} className="px-8 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md">Verify</button>
                                  </div>
                                </div>
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                 )}
              </div>
            </div>
          )}

          {/* TAB: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white border border-border-soft rounded-[40px] p-10 shadow-sm">
                 <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Award size={24} className="text-yellow-500" /> Digital Badges
                 </h3>
                 {user.badges && user.badges.length > 0 ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {user.badges.map((b: any) => (
                        <div key={b.id} className="bg-offwhite border border-border-soft p-6 rounded-3xl text-center group hover:bg-white hover:border-yellow-400 transition-all shadow-sm">
                           <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                             <Award size={32} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-main leading-tight mb-1">{b.name}</p>
                           <p className="text-[8px] font-bold text-gray-400 uppercase">{new Date(b.pivot.awarded_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="p-12 text-center bg-offwhite border border-dashed border-border-soft rounded-3xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No badges awarded yet.</p>
                   </div>
                 )}
              </div>

              {isStudent && (
                <div className="bg-white border border-border-soft rounded-[40px] p-10 shadow-sm">
                   <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-8 flex items-center gap-3">
                    <Award size={24} className="text-mylms-purple" /> Course Certificates
                   </h3>
                   {certificates.length > 0 ? (
                      <div className="space-y-4">
                         {certificates.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-6 bg-offwhite rounded-2xl border border-border-soft">
                               <div>
                                 <p className="text-[10px] font-black text-mylms-purple uppercase tracking-widest mb-1">{c.course?.code}</p>
                                 <h4 className="text-sm font-black text-text-main">{c.course?.title}</h4>
                               </div>
                               <button className="px-6 py-3 bg-white text-mylms-purple border border-mylms-purple/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-mylms-purple hover:text-white transition-all shadow-sm">
                                 Download PDF
                               </button>
                            </div>
                         ))}
                      </div>
                   ) : (
                     <div className="p-12 text-center bg-offwhite border border-dashed border-border-soft rounded-3xl">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No completed certificates available.</p>
                     </div>
                   )}
                </div>
              )}
            </div>
          )}

          {/* TAB: MOBILE APP */}
          {activeTab === 'mobile' && (
            <div className="bg-mylms-purple border border-mylms-purple/80 rounded-[40px] p-12 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-full"></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-white">
                  <div className="flex-1 text-center md:text-left">
                     <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 text-[9px] font-black uppercase tracking-widest">
                       <Smartphone size={14} /> MyLMS Mobile OS
                     </div>
                     <h3 className="text-4xl font-black tracking-tighter uppercase leading-none mb-6">Take Campus with You</h3>
                     <p className="text-white/70 font-medium leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                       Download the official mobile app to access lectures, submit assignments, and receive real-time Push Notifications on your device.
                     </p>
                     <div className="flex gap-4 justify-center md:justify-start">
                        <button className="px-8 py-4 bg-white text-mylms-purple rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                          App Store (iOS)
                        </button>
                        <button className="px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl border border-white/10 hover:scale-105 transition-transform">
                          Google Play
                        </button>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] shadow-2xl flex flex-col items-center">
                     <QrCode size={120} className="text-mylms-purple mb-4" />
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">Scan to Download</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

