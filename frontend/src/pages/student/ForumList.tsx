import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  MessageSquare, 
  PlusCircle, 
  Lock, 
  Pin, 
  MessageCircle,
  User,
  Clock,
  ChevronRight,
  ArrowLeft,
  Volume2
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

interface Forum {
  id: number;
  name: string;
  description: string;
  type: 'announcement' | 'general' | 'q&a';
}

interface Topic {
  id: number;
  forum_id: number;
  title: string;
  content: string;
  user: { id: number; name: string };
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  posts_count?: number;
}

export default function ForumList() {
  const { slug } = useParams();
  const { token, user } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [course, setCourse] = useState<any>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [activeForum, setActiveForum] = useState<Forum | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  
  // Create Topic State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [slug]);

  useEffect(() => {
    if (activeForum) {
      fetchTopics(activeForum.id);
    }
  }, [activeForum]);

  const fetchInitialData = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      const forumsRes = await client.get(`/courses/${courseRes.data.id}/forums`, { headers });
      setForums(forumsRes.data);
      if (forumsRes.data.length > 0) {
        setActiveForum(forumsRes.data[0]);
      }
    } catch (err) {
      console.error('Error fetching forums:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (forumId: number) => {
    try {
      const res = await client.get(`/forums/${forumId}`, { headers });
      // Logic for pagination (since we used paginate in the controller)
      setTopics(res.data.data);
    } catch (err) {
      console.error('Error fetching topics:', err);
    }
  };

  const { notify } = useNotificationStore();

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForum) return;
    try {
      await client.post(`/forums/${activeForum.id}/topics`, {
        title: newTitle,
        content: newContent
      }, { headers });
      setNewTitle('');
      setNewContent('');
      setShowCreateTopic(false);
      notify("Institutional Discourse: Topic initialized and published to the academic registry.", "success");
      fetchTopics(activeForum.id);
    } catch (err) {
       console.error('Failed to create topic:', err);
       notify('Institutional Registry Error: Failed to publish discussion topic protocol.', "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Connecting to Course Community...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-8 min-h-screen transition-all">
      {/* Header Utilities */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <Link to={`/courses/${slug}/lessons`} className="text-[9px] font-black uppercase text-gray-400 mb-2 hover:text-mylms-purple transition-all flex items-center gap-2">
            <ArrowLeft size={10} /> Back to Classroom
          </Link>
          <h1 className="text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight">Course Community Forum</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{course?.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Forums List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-6">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-6 px-2">Academic Rooms</h3>
            <div className="space-y-2">
              {forums.map((forum) => (
                <button
                  key={forum.id}
                  onClick={() => setActiveForum(forum)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center gap-4 group ${activeForum?.id === forum.id ? 'bg-mylms-purple text-white shadow-lg' : 'hover:bg-offwhite text-text-secondary'}`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${activeForum?.id === forum.id ? 'bg-white/10' : 'bg-offwhite'}`}>
                    {forum.type === 'announcement' ? <Volume2 size={16} /> : <MessageSquare size={16} />}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight leading-none mb-1">{forum?.name}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest ${activeForum?.id === forum.id ? 'text-white/50' : 'text-gray-400'}`}>{forum.type}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-8 bg-mylms-rose/5 border border-mylms-rose/10 rounded-2xl">
             <h4 className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.2em] mb-4">Registry Rules</h4>
             <p className="text-[9px] font-bold text-text-secondary leading-loose uppercase tracking-widest">
               Please adhere to the institutional code of conduct. Hostile or inappropriate content will be archived immediately.
             </p>
          </div>
        </div>

        {/* Topics Area */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight leading-none mb-2">{activeForum?.name}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeForum?.description}</p>
            </div>
            
            {(activeForum?.type !== 'announcement' || user?.role === 'instructor' || user?.role === 'admin') && (
              <button 
                onClick={() => setShowCreateTopic(true)}
                className="btn-purple px-10 py-3 shadow-xl"
              >
                <PlusCircle size={14} className="mr-2 inline" /> New Discussion
              </button>
            )}
          </div>

          {showCreateTopic && (
            <div className="bg-white rounded-2xl border-2 border-mylms-purple/20 shadow-2xl p-10 mb-12 animate-in slide-in-from-top-4 duration-300">
               <h3 className="text-sm font-black text-mylms-purple uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                 <PlusCircle size={18} /> Initiate Institutional Discourse
               </h3>
               <form onSubmit={handleCreateTopic}>
                  <div className="mb-6">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Topic Title</label>
                    <input 
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Inquiry regarding Final Review session"
                      className="w-full bg-offwhite border border-border-soft rounded-lg px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-mylms-purple/20 transition-all"
                      required
                    />
                  </div>
                  <div className="mb-8">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Detailed Content</label>
                    <textarea 
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Synthesize your discussion points here..."
                      className="w-full bg-offwhite border border-border-soft rounded-xl px-6 py-4 text-xs font-bold leading-loose outline-none focus:ring-1 focus:ring-mylms-purple/20 transition-all min-h-[160px]"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-purple px-12 py-4">Publish Topic</button>
                    <button type="button" onClick={() => setShowCreateTopic(false)} className="btn-minimal px-10 py-4 opacity-50">Cancel</button>
                  </div>
               </form>
            </div>
          )}

          <div className="space-y-4">
            {topics.length === 0 ? (
              <div className="bg-offwhite/50 border-2 border-dashed border-border-soft rounded-3xl py-24 text-center">
                 <MessageSquare size={40} className="mx-auto text-gray-200 mb-6 opacity-30" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                   This academic room is currently silent.<br/>Be the first to initiate discourse.
                 </p>
              </div>
            ) : (
              topics.map((topic) => (
                <Link 
                  key={topic.id}
                  to={`/forums/${activeForum?.id}/topics/${topic.id}`}
                  className="bg-white rounded-2xl border border-border-soft p-8 shadow-sm hover:shadow-xl hover:border-mylms-purple/20 transition-all flex justify-between items-center group relative overflow-hidden"
                >
                  <div className="flex items-start gap-8">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-offwhite flex items-center justify-center text-mylms-purple group-hover:bg-mylms-purple group-hover:text-white transition-all shadow-sm">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        {topic.is_pinned && <Pin size={12} className="text-mylms-rose rotate-12" />}
                        <h4 className="text-sm font-black text-text-main uppercase tracking-tight group-hover:text-mylms-purple transition-all">{topic?.title}</h4>
                        {topic.is_locked && <Lock size={12} className="text-gray-300" />}
                      </div>
                      <div className="flex items-center gap-8 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                         <span className="flex items-center gap-2"><User size={10} /> {topic.user?.name}</span>
                         <span className="flex items-center gap-2"><Clock size={10} /> {new Date(topic.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                     <div className="text-right">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Activity</p>
                        <div className="flex items-center gap-2 text-mylms-purple">
                           <MessageCircle size={14} />
                           {/* posts_count would be added later with backend optimization */}
                           <span className="text-sm font-black">Open</span>
                        </div>
                     </div>
                     <ChevronRight size={20} className="text-gray-200 group-hover:translate-x-2 group-hover:text-mylms-purple transition-all" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
