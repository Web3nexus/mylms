import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.post('/auth/verify-otp', { otp: code });
      setSuccess(true);
      
      // Update local store with verified user
      setTimeout(() => {
        setAuth(response.data.user, localStorage.getItem('auth_token') || '');
        navigate('/apply');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await client.post('/auth/resend-otp');
      setCooldown(60);
    } catch (err: any) {
      setError('Failed to resend code. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-mylms-purple/5 via-transparent to-transparent">
      <div className="w-full max-w-md">
        <div className="premium-card overflow-hidden">
          <div className="bg-mylms-purple p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Security Protocol</h1>
              <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] mt-2">Identity Verification Required</p>
            </div>
          </div>

          <div className="p-10">
            {success ? (
              <div className="text-center py-10 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter mb-4">Identity Verified</h2>
                <p className="text-text-secondary font-medium text-sm leading-relaxed">
                  Your institutional credentials have been synchronized. Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <p className="text-text-secondary font-medium text-sm leading-relaxed">
                    A 6-digit security code has been transmitted to <span className="text-mylms-purple font-black">{user?.email}</span>. Please enter it below to authorize your session.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex justify-between gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-full h-16 text-center text-2xl font-black text-mylms-purple bg-white border border-border-soft rounded-xl focus:border-mylms-purple focus:ring-4 focus:ring-mylms-purple/5 transition-all outline-none shadow-sm"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="p-4 bg-mylms-rose/5 border border-mylms-rose/20 rounded-xl flex items-center gap-3 animate-shake">
                      <AlertCircle className="text-mylms-rose shrink-0" size={18} />
                      <p className="text-[10px] font-black text-mylms-rose uppercase tracking-wider">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.some(d => !d)}
                    className="w-full py-5 bg-mylms-purple text-white font-black rounded-2xl shadow-xl hover:bg-mylms-purple/90 transition-all uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Authorizing Protocol...' : 'Finalize Verification'}
                    <ArrowRight size={18} />
                  </button>
                </form>

                <div className="mt-10 text-center">
                  <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || resending}
                    className="group"
                  >
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-3 group-hover:text-mylms-purple transition-colors">
                      {resending ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} className={cooldown > 0 ? 'opacity-50' : 'group-hover:rotate-180 transition-transform duration-500'} />
                      )}
                      {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Request New Security Code'}
                    </p>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">
          Learnforth Unified Security Framework v4.0
        </p>
      </div>
    </div>
  );
}
