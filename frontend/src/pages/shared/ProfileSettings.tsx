import { useState, useEffect } from 'react';
import { User, Mail, Shield, Award, Users, MessageCircle, ArrowRight, Save, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function ProfileSettings() {
  const { user: authUser, token, setUser } = useAuthStore();
  const [user, setFullUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFullUser(res.data);
      setFormData({
        name: res.data.name,
        email: res.data.email,
      });
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
      const res = await client.patch('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
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
      await client.patch('/auth/profile/password', passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Password updated successfully!');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-mylms-purple font-black uppercase tracking-widest text-[9px]">Synchronizing Account Data...</p>
      </div>
    );
  }

  const isStudent = user?.role === 'student';

  return (
    <div className="max-w-6xl mx-auto py-12 px-8">
      <div className="mb-12 border-b border-border-soft pb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
            <Shield size={16} className="opacity-50" />
            Security & Identity
          </div>
          <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Profile Settings</h1>
          <p className="text-text-secondary text-xs font-black uppercase tracking-widest opacity-60 italic mt-3">Manage your institutional identity and security credentials</p>
        </div>
        {isStudent && (
          <div className="bg-mylms-purple/5 border border-mylms-purple/20 px-6 py-3 rounded-2xl flex flex-col items-end">
            <span className="text-[8px] font-black text-mylms-purple uppercase tracking-widest mb-1">Official Matric Number</span>
            <span className="text-xl font-black text-text-main font-mono tracking-tighter">{user.student_id || 'NOT_ASSIGNED'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white border-2 border-border-soft rounded-[32px] p-8 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mylms-purple/5 rounded-bl-full -z-0"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-[32px] bg-mylms-purple flex items-center justify-center text-white text-4xl font-black mb-6 shadow-xl ring-8 ring-mylms-purple/10">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-1">{user.name}</h3>
              <p className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.3em] mb-4">{user.role}</p>
              
              <div className="w-full pt-6 border-t border-gray-50 mt-4 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Faculty</span>
                  <span className="text-text-main">{user.program?.department?.faculty?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Department</span>
                  <span className="text-text-main">{user.program?.department?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Academic Level</span>
                  <span className="text-mylms-purple">{user.level?.name || 'Not Enrolled'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Advisor Card */}
          {isStudent && user.advisor && (
            <div className="bg-mylms-rose/5 border-2 border-mylms-rose/20 rounded-[32px] p-8 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-mylms-rose flex items-center justify-center text-white">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.2em]">Academic Advisor</h4>
                  <p className="text-sm font-black text-text-main uppercase">{user.advisor.name}</p>
                </div>
              </div>
              <p className="text-[10px] text-text-secondary font-medium leading-relaxed mb-6">
                Your assigned advisor is available for academic counseling and course registration approvals.
              </p>
              <a 
                href={`mailto:${user.advisor.email}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-mylms-rose/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-mylms-rose hover:bg-mylms-rose hover:text-white transition-all shadow-sm"
              >
                <Mail size={14} /> Send Message
              </a>
            </div>
          )}

          {/* WhatsApp Groups */}
          {isStudent && user.whatsapp_groups && (
            <div className="bg-green-50 border-2 border-green-100 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-green-700">
                <MessageCircle size={20} />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Groups</h4>
              </div>
              <div className="space-y-3">
                {user.whatsapp_groups.map((group: any, i: number) => (
                  <a 
                    key={i}
                    href={group.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-2xl hover:border-green-500 transition-all group shadow-sm"
                  >
                    <div className="overflow-hidden">
                      <p className="text-[9px] font-black text-green-700 uppercase tracking-widest truncate">{group.name}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Official Community</p>
                    </div>
                    <ArrowRight size={14} className="text-green-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-12">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700 text-xs font-black uppercase tracking-widest animate-in shake duration-300">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-2xl text-green-700 text-xs font-black uppercase tracking-widest animate-in fade-in duration-300">
              {success}
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white border-2 border-border-soft rounded-[40px] p-10 shadow-sm">
            <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-8 flex items-center gap-3">
              <User size={24} className="text-mylms-purple" />
              Account Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Full Legal Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-purple outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Institutional Email</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-purple outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-mylms-purple text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-2 shadow-xl"
                >
                  <Save size={16} /> {saving ? 'Processing...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Security */}
          <div className="bg-white border-2 border-border-soft rounded-[40px] p-10 shadow-sm">
            <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-8 flex items-center gap-3">
              <Clock size={24} className="text-mylms-rose" />
              Security Update
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Current Password</label>
                <input 
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-rose outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">New Password</label>
                  <input 
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                    className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-rose outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Confirm Password</label>
                  <input 
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                    className="w-full bg-offwhite border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-mylms-rose outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-mylms-rose text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-2 shadow-xl"
                >
                  <Shield size={16} /> {saving ? 'Updating Key...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
