import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD = 14 * 60 * 1000; // 14 minutes (1 minute warning)

export default function InactivityLogout() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const performLogout = useCallback(() => {
    logout();
    setShowWarning(false);
    navigate('/login');
  }, [logout, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let warningTimer: any;
    let logoutTimer: any;
    let countdownInterval: any;

    const resetTimers = () => {
      setShowWarning(false);
      setCountdown(60);
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownInterval);

      warningTimer = setTimeout(() => {
        setShowWarning(true);
        countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, WARNING_THRESHOLD);

      logoutTimer = setTimeout(performLogout, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimers));

    resetTimers();

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimers));
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownInterval);
    };
  }, [isAuthenticated, performLogout]);

  // Handle immediate logout on window close / PC close attempt
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optional: Could implement shared state logout here if needed
      }
    };

    const handleBeforeUnload = () => {
        // We don't necessarily logout on every reload, but on tab close 
        // persistence handles it. If user closes system, it's inactive next time.
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-mylms-purple/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-offwhite">
           <div 
             className="h-full bg-mylms-rose transition-all duration-1000 ease-linear" 
             style={{ width: `${(countdown / 60) * 100}%` }}
           ></div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-mylms-rose/10 flex items-center justify-center text-mylms-rose mb-8">
            <Clock className="animate-pulse" size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase mb-4">Security Timeout</h2>
          <p className="text-text-secondary text-sm font-medium leading-relaxed mb-10">
            For your protection, this session will expire in <span className="font-black text-mylms-purple">{countdown} seconds</span> due to inactivity.
          </p>

          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={() => {
                setShowWarning(false);
                // The event listeners will trigger resetTimers via the click
              }}
              className="w-full bg-mylms-purple text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
            >
              Maintain Active Session <ArrowRight size={14} />
            </button>
            
            <button 
              onClick={performLogout}
              className="w-full py-4 text-mylms-rose font-black uppercase tracking-[0.2em] text-[10px] hover:bg-mylms-rose/5 rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={14} /> Terminate Now
            </button>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border-soft flex items-center justify-center gap-3 opacity-40">
           <ShieldAlert size={14} className="text-mylms-purple" />
           <span className="text-[8px] font-black uppercase tracking-widest text-text-main">Encrypted MyLMS Session Manager</span>
        </div>
      </div>
    </div>
  );
}
