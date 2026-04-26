import { ShieldCheck, RefreshCw, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegistryErrorProps {
  onRetry?: () => void;
  message?: string;
  source?: string;
}

export default function RegistryError({ 
  onRetry, 
  message = "The Academic Content Registry could not be synchronized.",
  source = window.location.hostname
}: RegistryErrorProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 bg-offwhite">
      <div className="max-w-xl w-full bg-white p-12 shadow-2xl border border-border-soft relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-mylms-rose group-hover:h-2 transition-all duration-500"></div>
        
        <div className="mb-10 w-20 h-20 bg-mylms-rose/5 flex items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform duration-500">
          <ShieldCheck size={40} className="text-mylms-rose" />
        </div>

        <h1 className="text-4xl font-serif font-black text-mylms-purple mb-4 uppercase tracking-tighter leading-tight italic">Registry Unreachable</h1>
        <p className="text-sm font-medium text-text-secondary mb-8 leading-relaxed">
          {message} <span className="font-black text-mylms-rose underline">{source}</span> node is currently non-responsive or the SSL certificate is not trusted.
        </p>

        <div className="mb-10 p-6 bg-offwhite rounded-2xl border border-border-soft">
          <p className="text-[11px] font-medium text-text-secondary leading-relaxed">
            The platform is currently undergoing scheduled registry maintenance or is experiencing a temporary synchronization delay. Our technical team has been notified and is working to restore full connectivity.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-border-soft pt-8">
          <button 
            onClick={onRetry || (() => window.location.reload())}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-mylms-rose hover:text-text-main transition-colors group"
          >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            Retry Sync
          </button>
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-mylms-purple transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Portal
          </button>
        </div>
      </div>
    </div>
  );
}
