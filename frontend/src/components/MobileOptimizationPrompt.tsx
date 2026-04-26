import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, ArrowRight, X } from 'lucide-react';

export default function MobileOptimizationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detect mobile/tablet
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                    || window.innerWidth <= 1024;
    
    const wasDismissed = sessionStorage.getItem('mylms_mobile_prompt_dismissed');
    
    if (isMobile && !wasDismissed) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('mylms_mobile_prompt_dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-6 bg-mylms-primary/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-full max-w-md bg-white rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 ease-out">
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-6 right-6 p-2 rounded-full bg-offwhite text-text-secondary hover:text-mylms-rose transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Decor */}
        <div className="h-32 bg-linear-to-br from-mylms-primary to-mylms-purple p-8 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Smartphone size={32} />
            </div>
            <div className="w-4 h-px bg-white/30"></div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white animate-pulse">
              <Monitor size={32} />
            </div>
          </div>
        </div>

        <div className="p-10 text-center">
          <h2 className="text-2xl font-black text-text-main mb-4 leading-tight">
            Optimize Your <span className="text-mylms-rose">Learning Environment</span>
          </h2>
          <p className="text-sm text-text-secondary font-medium leading-relaxed mb-8">
            You're currently using a mobile device. For the best experience with complex lesson registries and interactive media, we recommend using a <span className="font-bold text-text-main">Desktop Environment</span>.
          </p>

          <div className="space-y-4">
            <button 
              onClick={handleDismiss}
              className="w-full py-4 bg-mylms-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-mylms-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              Continue Anyway <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-50">
              MyLMS Academic Advisory
            </p>
          </div>
        </div>

        {/* Footer Glow */}
        <div className="h-2 bg-linear-to-r from-mylms-rose via-mylms-purple to-mylms-primary opacity-50"></div>
      </div>
    </div>
  );
}
