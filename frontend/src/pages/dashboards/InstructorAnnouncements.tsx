import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Send,
  Trash2,
  Bell,
  Search,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function InstructorAnnouncements() {
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  
  // New Announcement State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      // In this system, announcements are CMS pages with 'announcement' in slug
      const res = await client.get('/admin/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filtered = res.data.filter((p: any) => p.slug.startsWith('announcement'));
      setAnnouncements(filtered);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await client.post('/announcements', { title, content }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTitle('');
        setContent('');
        setShowCreate(false);
        fetchAnnouncements();
        alert('Institutional Announcement Dispatched successfully.');
    } catch (err) {
        console.error('Failed to post announcement:', err);
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-12 min-h-screen bg-offwhite">
      <div className="mb-12 flex justify-between items-end border-b border-border-soft pb-12">
        <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
                <Megaphone className="opacity-50" size={16} />
                Institutional Broadcasting
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">Announcements Hub</h1>
            <p className="text-text-secondary text-xs font-black uppercase tracking-widest italic opacity-60">Architect campus-wide notices and pedagogical updates.</p>
        </div>
        
        <button 
            onClick={() => setShowCreate(!showCreate)}
            className="btn-purple px-10 py-4 flex items-center gap-3 shadow-2xl transition-all active:scale-95"
        >
            <Plus size={18} /> {showCreate ? 'Discard Draft' : 'Initiate Notice'}
        </button>
      </div>

      {showCreate && (
        <div className="mb-12 bg-white p-10 rounded-3xl border border-border-soft shadow-xl animate-in slide-in-from-top-4 duration-500">
            <form onSubmit={handlePost}>
                <div className="mb-8">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Notice Title / Protocol Name</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. End of Term Examination Protocols"
                        className="w-full p-6 bg-offwhite border border-border-soft rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-mylms-purple"
                        required
                    />
                </div>
                <div className="mb-8">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Broadcasting Content (Synthesized)</label>
                    <textarea 
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Detail the institutional update here..."
                        className="w-full p-6 bg-offwhite border border-border-soft rounded-2xl font-bold text-xs h-40 outline-none focus:ring-2 focus:ring-mylms-purple resize-none"
                        required
                    />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="px-12 py-5 bg-mylms-purple text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all">
                        <Send size={18} /> Dispatch to Campus
                    </button>
                </div>
            </form>
        </div>
      )}

      <div className="space-y-6">
        {announcements.length === 0 ? (
            <div className="p-24 text-center bg-white rounded-3xl border-2 border-dashed border-border-soft">
                <Megaphone size={48} className="mx-auto text-gray-100 mb-6" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No institutional notices found in the registry.</p>
            </div>
        ) : (
            announcements.map((ann, idx) => (
                <div key={ann.id} className="bg-white p-8 rounded-3xl border border-border-soft shadow-sm hover:shadow-xl transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="w-14 h-14 rounded-2xl bg-offwhite flex items-center justify-center text-mylms-purple group-hover:bg-mylms-purple group-hover:text-white transition-all">
                            <Bell size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-mylms-rose bg-mylms-rose/5 px-3 py-1 rounded-lg italic">Published Registry</span>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-tight">{ann.title}</h3>
                            </div>
                            <div className="flex items-center gap-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2 italic"><Calendar size={12} /> {new Date(ann.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-2 italic"><Clock size={12} /> {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                        <button className="p-4 bg-offwhite text-gray-400 rounded-xl hover:text-mylms-purple hover:bg-white border border-transparent hover:border-mylms-purple transition-all">
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
