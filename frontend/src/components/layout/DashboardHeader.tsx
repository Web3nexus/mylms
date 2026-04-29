import { Search, Clock, Menu, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown';
import { useAuthStore } from '../../store/authStore';

interface DashboardHeaderProps {
  systemTime: Date;
  onToggleMobileSidebar?: () => void;
}

export default function DashboardHeader({ systemTime, onToggleMobileSidebar }: DashboardHeaderProps) {
  const user = useAuthStore(state => state.user);
  const isStudent = user?.role === 'student';

  return (
    <header className="bg-white border-b border-border-soft py-4 px-6 lg:px-12 flex justify-between items-center sticky top-0 z-30 shrink-0">
      {/* Mobile Menu & Search Bar */}
      <div className="flex items-center gap-4 lg:gap-8 grow max-w-2xl">
        <button 
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-offwhite text-text-secondary hover:text-mylms-purple transition-all"
        >
          <Menu size={20} />
        </button>

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
        {/* Matric ID for Students */}
        {isStudent && user?.student_id && (
          <div className="hidden xl:flex items-center gap-3 bg-mylms-purple/5 border border-mylms-purple/20 px-4 py-2 rounded-xl">
            <GraduationCap size={14} className="text-mylms-purple" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black uppercase tracking-widest text-mylms-purple/60">Matriculation ID</span>
              <span className="text-[11px] font-black font-mono text-mylms-purple">{user.student_id}</span>
            </div>
          </div>
        )}

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
        
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <Link 
            to="/profile" 
            className="flex items-center gap-3 p-1 pr-4 bg-offwhite hover:bg-mylms-purple/5 border border-border-soft rounded-full transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-mylms-purple flex items-center justify-center text-white text-[10px] font-black group-hover:scale-105 transition-transform shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[9px] font-black text-text-main uppercase tracking-tight leading-none mb-1">{user?.name?.split(' ')[0]}</p>
              <p className="text-[7px] font-black text-mylms-rose uppercase tracking-widest leading-none opacity-60">Account</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
