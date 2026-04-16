import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl p-16 text-center relative overflow-hidden group">
        {/* Animated Background Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-mylms-rose/10 rounded-full blur-3xl group-hover:bg-mylms-purple/10 transition-all duration-1000"></div>

        <div className="relative z-10 space-y-10">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl animate-pulse">
            <XCircle size={48} />
          </div>

          <div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase mb-4 leading-tight">
              Transaction Aborted
            </h1>
            <p className="text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px] opacity-60">
              Payment Protocol Interrupted
            </p>
          </div>

          <div className="py-8">
            <p className="text-xs text-gray-400 font-bold mb-10 leading-relaxed max-w-sm mx-auto">
              Your financial transaction could not be verified by the <span className="text-mylms-rose font-black underline decoration-mylms-purple/30 decoration-4">Secured Gateway</span>. This could be due to insufficient funds, connectivity issues, or manual cancellation.
            </p>
            
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-mylms-purple text-white py-6 rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-mylms-purple/90 transition-all shadow-2xl flex items-center justify-center gap-4 group/btn"
              >
                <RotateCcw size={16} className="group-hover/btn:-rotate-180 transition-transform duration-500" />
                Retry Enrollment Protocol
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-white border border-border-soft text-text-main py-6 rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-offwhite transition-all flex items-center justify-center gap-4"
              >
                <ArrowLeft size={16} />
                Return to Academic Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
