import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Globe,
  Clock
} from 'lucide-react';
import { useBranding } from '../hooks/useBranding';

export default function Register() {
  const { branding } = useBranding();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'student' as 'student' | 'instructor',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await client.post('/auth/register', formData);
      const { user, access_token } = response.data;

      setAuth(user, access_token);
      // If student registrant, redirect to admissions wizard immediately
      if (user.role === 'student') navigate('/apply');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please verify your information.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white selection:bg-mylms-rose/20 overflow-hidden">
      {/* Left Panel: Visual/Branding Side */}
      <div className="lg:w-5/12 p-12 lg:p-24 flex flex-col justify-between bg-mylms-purple relative overflow-hidden group">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.05] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-[3s]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white opacity-[0.02] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
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
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{branding?.institutional_name || 'MyLMS'}</h1>
                  <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mt-2">{branding?.institutional_motto || 'University Network Authority'}</p>
                </div>
              </div>
            )}
          </Link>

          <div className="mt-32 max-w-sm">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-white/5 backdrop-blur-md">
              <ShieldCheck size={14} className="text-white" />
              Student Candidacy Registry
            </div>
            <h2 className="text-6xl lg:text-7xl font-serif font-black text-white leading-[0.9] tracking-tighter uppercase mb-10">
              {branding?.auth_panel_title || 'Begin your Journey.'}
            </h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed mb-10 font-sans">
              {branding?.auth_panel_desc || 'Join a global network of academic excellence. Register your candidacy to access specialized programs and unified student resources.'}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-12 border-t border-white/10 pt-10 mt-20">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Network Reach</p>
            <p className="text-white font-black text-xs uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Global Active
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Credentials</p>
            <p className="text-white font-black text-xs uppercase flex items-center gap-2">
              <Globe size={12} className="text-white/40" /> ISO Certified
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Form Side */}
      <div className="lg:w-7/12 flex items-center justify-center p-8 lg:p-24 bg-offwhite">
        <div className="w-full max-w-2xl premium-card group/card">

          <div className="p-10">
            <div className="mb-10">
              <div className="w-16 h-16 bg-white border border-border-soft flex items-center justify-center text-mylms-purple font-black text-2xl rounded-2xl shadow-sm mb-6 font-display relative z-10 transition-all group-hover/card:bg-mylms-purple group-hover/card:text-white">
                ML
              </div>
              <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase leading-none relative z-10">
                {branding?.admissions_enabled ? 'Student Enrollment' : 'Enrollment Protocol Paused'}
              </h2>
              <p className="text-mylms-purple text-[9px] font-black uppercase tracking-[0.4em] mt-4 relative z-10 opacity-60">MyLMS Unified Academic Network</p>
            </div>

            {!branding?.admissions_enabled ? (
              <div className="py-20 text-center animate-in fade-in slide-in-from-bottom duration-700">
                <div className="w-24 h-24 bg-mylms-rose/10 text-mylms-rose rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <Clock size={40} />
                </div>
                <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter mb-4">Admissions Currently Restricted</h3>
                <p className="text-text-secondary font-medium text-sm leading-relaxed mb-10 opacity-60 max-w-md mx-auto">
                  The academic registry is currently not accepting new student candidates. Applications are scheduled to re-open on <span className="text-mylms-purple font-black">{branding?.admissions_opens_at || 'the next cycle'}.</span>
                </p>
                <Link to="/" className="btn-purple inline-flex px-12">Return to Official Page</Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-12 p-6 bg-mylms-rose/5 border border-mylms-rose/20 text-mylms-rose rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 animate-shake">
                    <CheckCircle className="text-mylms-rose" size={20} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="premium-input-wrapper group/input">
                      <label className="premium-label">Full Legal Name</label>
                      <div className="relative">
                        <User className="premium-input-icon" size={20} />
                        <input
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="premium-input"
                          placeholder="e.g. Ade Okoro"
                        />
                      </div>
                    </div>
                    <div className="premium-input-wrapper group/input">
                      <label className="premium-label">Email Registry</label>
                      <div className="relative">
                        <Mail className="premium-input-icon" size={20} />
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="premium-input"
                          placeholder="name@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="premium-input-wrapper group/input">
                      <label className="premium-label">Security Protocol</label>
                      <div className="relative">
                        <Lock className="premium-input-icon" size={20} />
                        <input
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="premium-input"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="premium-input-wrapper group/input">
                      <label className="premium-label">Verify Protocol</label>
                      <div className="relative">
                        <ShieldCheck className="premium-input-icon" size={20} />
                        <input
                          name="password_confirmation"
                          type="password"
                          required
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          className="premium-input"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-mylms-purple/5 p-8 rounded-3xl border border-mylms-purple/20 flex items-center gap-6">
                    <div className="w-12 h-12 bg-mylms-purple/10 rounded-2xl flex items-center justify-center text-mylms-purple shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-loose opacity-70">
                      Registry Protocol: Candidate records are ISO 27001 encrypted. Enrollment is subject to formal academic verification.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 mt-6 bg-mylms-purple text-white font-black rounded-2xl shadow-2xl hover:bg-mylms-purple/90 transition-all uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 group/btn"
                  >
                    {loading ? 'Processing Application Registry...' : 'Submit Institutional Application'}
                    <UserPlus size={20} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </form>
              </>
            )}

            <div className="mt-20 text-center pt-10 border-t border-offwhite">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Already registered in the system?{' '}
                <Link to="/login" className="text-mylms-purple hover:text-mylms-rose transition-colors ml-2 border-b-2 border-mylms-purple/10">Proceed to Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Footer */}
      <div className="fixed bottom-10 left-10 right-10 flex justify-center transition-opacity opacity-40 hover:opacity-100">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-3">
          <Sparkles size={12} className="text-mylms-purple animate-pulse" />
          Official MyLMS Global Admissions Framework Active
        </p>
      </div>
    </div>
  );
}
