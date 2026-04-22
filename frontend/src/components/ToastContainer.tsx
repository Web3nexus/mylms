import React from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-8 right-8 z-[110] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-xl border animate-in slide-in-from-right-full duration-300
            ${toast.type === 'success' ? 'bg-white border-green-100 text-green-900' : 
              toast.type === 'error' ? 'bg-white border-rose-100 text-rose-900' : 
              'bg-white border-indigo-100 text-indigo-900'}
          `}
        >
          <div className={`p-2 rounded-xl ${
            toast.type === 'success' ? 'bg-green-50 text-green-600' : 
            toast.type === 'error' ? 'bg-rose-50 text-rose-600' : 
            'bg-indigo-50 text-indigo-600'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
          </div>
          
          <p className="text-[11px] font-black uppercase tracking-widest leading-none">
            {toast.message}
          </p>

          <button 
            onClick={() => removeToast(toast.id)}
            className="ml-4 p-1 hover:bg-slate-50 rounded-lg transition-colors border border-transparent"
          >
            <X className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      ))}
    </div>
  );
};
