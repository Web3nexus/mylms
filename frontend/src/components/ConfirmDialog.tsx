import React from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export const ConfirmDialog: React.FC = () => {
  const { confirmState, closeConfirm } = useNotificationStore();

  if (!confirmState || !confirmState.isOpen) return null;

  const { title, message, confirmText, cancelText, type } = confirmState;

  const iconMap = {
    danger: <AlertTriangle className="w-8 h-8 text-rose-500" />,
    warning: <AlertCircle className="w-8 h-8 text-amber-500" />,
    info: <Info className="w-8 h-8 text-indigo-500" />,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
        onClick={() => closeConfirm(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-start gap-5">
            <div className={`p-3 rounded-2xl ${
              type === 'danger' ? 'bg-rose-50' : 
              type === 'warning' ? 'bg-amber-50' : 'bg-indigo-50'
            }`}>
              {iconMap[type]}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{title}</h3>
                <button 
                  onClick={() => closeConfirm(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => closeConfirm(false)}
              className="flex-1 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => closeConfirm(true)}
              className={`flex-1 px-6 py-3 rounded-2xl text-white font-bold transition-all active:scale-95 shadow-lg ${
                type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 
                type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 
                'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
