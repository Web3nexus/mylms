import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Inbox
} from 'lucide-react';

interface NotificationData {
  id: string;
  data: {
    title: string;
    message: string;
    action_url: string;
    icon: string;
    color: string;
  };
  read_at: string | null;
  created_at: string;
}

export default function NotificationDropdown() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token || !user) return;
    
    fetchNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [token, user]);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleNotificationClick = async (id: string, url: string) => {
    try {
      // Mark as read
      await client.post(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state directly so it feels instant
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prevList => 
        prevList.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );

      setOpen(false);
      navigate(url);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await client.post('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prevList => 
        prevList.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative outline-none border ${open ? 'bg-mylms-purple text-white border-transparent' : 'bg-offwhite text-mylms-purple border-border-soft hover:bg-white hover:border-mylms-purple/30'}`}
      >
        <Bell size={20} className={open ? 'animate-pulse' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-mylms-rose rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-16 w-80 md:w-[420px] bg-white border border-border-soft shadow-2xl rounded-3xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-300">
          
          <div className="p-8 border-b border-offwhite flex justify-between items-center bg-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
             <div className="relative z-10">
                <h3 className="font-black text-text-main tracking-tighter uppercase leading-none text-lg">
                  Alerts Registry
                </h3>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300 mt-2">MyLMS Sync Status</p>
             </div>
             {unreadCount > 0 && (
               <button 
                onClick={markAllAsRead} 
                className="relative z-10 text-[9px] font-black uppercase text-mylms-rose hover:text-mylms-purple tracking-[0.2em] border-b border-transparent hover:border-mylms-purple/10 transition-all font-display"
               >
                 Acknowledge All
               </button>
             )}
          </div>

          <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center opacity-60">
                <Inbox size={48} className="text-gray-100 mb-6" />
                <p className="text-gray-300 font-black text-[10px] uppercase tracking-[0.4em] leading-loose">No active alerts identified in the internal registry.</p>
              </div>
            ) : (
              <div className="divide-y divide-offwhite bg-white">
                {notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id, notif.data.action_url)}
                    className={`w-full text-left p-6 hover:bg-offwhite transition-all flex gap-6 relative group/notif border-l-4 border-transparent hover:border-mylms-purple ${!notif.read_at ? 'bg-offwhite/30' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover/notif:scale-110 transition-all border border-border-soft ${!notif.read_at ? 'bg-white' : 'bg-offwhite opacity-50'}`}>
                       {notif.data.icon === 'alert' ? <AlertCircle size={20} className="text-mylms-rose" /> : 
                        notif.data.icon === 'check' ? <CheckCircle size={20} className="text-green-500" /> : 
                        <Info size={20} className="text-mylms-purple" />}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className={`text-sm font-black uppercase tracking-tight ${!notif.read_at ? 'text-text-main' : 'text-gray-400'}`}>{notif.data.title}</h4>
                          {!notif.read_at && <div className="w-2 h-2 rounded-full bg-mylms-rose mt-1 shadow-[0_0_10px_rgba(233,1,113,0.5)]"></div>}
                       </div>
                       <p className={`text-[12px] font-bold leading-relaxed line-clamp-2 ${!notif.read_at ? 'text-mylms-purple' : 'text-gray-300'}`}>
                         {notif.data.message}
                       </p>
                       <div className="flex items-center justify-between mt-4">
                          <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest leading-none">
                            {new Date(notif.created_at).toLocaleDateString()} — Registry Entry
                          </p>
                          <ArrowRight size={12} className="text-gray-200 group-hover/notif:text-mylms-rose transition-colors" />
                       </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-offwhite text-center bg-offwhite/30">
             <div className="flex items-center justify-center gap-3">
                <ShieldCheck size={12} className="text-mylms-purple opacity-20" />
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Official MyLMS Registry Protocol</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
