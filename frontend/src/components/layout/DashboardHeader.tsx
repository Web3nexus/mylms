import { Search, Clock } from 'lucide-react';
import NotificationDropdown from '../NotificationDropdown';

interface DashboardHeaderProps {
  systemTime: Date;
}

export default function DashboardHeader({ systemTime }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-border-soft py-4 px-12 flex justify-between items-center sticky top-0 z-30 shrink-0">
      {/* Search Bar */}
      <div className="flex items-center gap-8 grow max-w-2xl">
        <div className="relative grow">
          <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search academic resources..." 
            className="w-full bg-offwhite border border-transparent rounded-lg py-2.5 px-14 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-mylms-rose/10 outline-none transition-all" 
          />
        </div>
      </div>
      
      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 bg-offwhite px-4 py-2 rounded-lg border border-border-soft">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Sync Active</span>
          </div>
          <div className="w-px h-3 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-mylms-rose shadow-sm px-2 py-0.5 rounded">
            <Clock size={12} />
            <span className="text-xs font-black font-mono tracking-tight">
              {systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>
        </div>
        
        <NotificationDropdown />
      </div>
    </header>
  );
}
