import { CheckCircle, ArrowRight, GraduationCap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl p-16 text-center relative overflow-hidden group">
        {/* Animated Background Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-mylms-purple/10 rounded-full blur-3xl group-hover:bg-mylms-rose/10 transition-all duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-mylms-rose/10 rounded-full blur-3xl group-hover:bg-mylms-purple/10 transition-all duration-1000"></div>

        <div className="relative z-10 space-y-10">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl animate-bounce">
            <CheckCircle size={48} />
          </div>

          <div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase mb-4 leading-tight">
              Transaction Success
            </h1>
            <p className="text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px] opacity-60">
              Your Enrollment Protocol has been Initialized
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-left border-y border-border-soft py-10 opacity-80">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Document Registry</p>
              <div className="flex items-center gap-3 text-text-main font-bold">
                <GraduationCap size={16} className="text-mylms-rose" />
                Enrollment Verified
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Processing Time</p>
              <div className="flex items-center gap-3 text-text-main font-bold">
                <Calendar size={16} className="text-mylms-purple" />
                Instant Confirmation
              </div>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-xs text-gray-400 font-bold mb-10 leading-relaxed max-w-sm mx-auto">
              Your application has been moved to the <span className="text-mylms-purple font-black underline decoration-mylms-rose/30 decoration-4">Academic Review Board</span>. You will receive an official response within 24-48 business hours.
            </p>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-text-main text-white py-6 rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-mylms-purple transition-all shadow-2xl flex items-center justify-center gap-4 group/btn"
            >
              Access Student Portal
              <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
