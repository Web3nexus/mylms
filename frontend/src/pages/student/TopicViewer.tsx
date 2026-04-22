import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { 
  ArrowLeft, 
  MessageCircle, 
  User, 
  Clock, 
  CornerDownRight, 
  Trash2, 
  Lock, 
  Pin,
  ShieldCheck,
  Send
} from 'lucide-react';

interface Topic {
  id: number;
  forum_id: number;
  title: string;
  content: string;
  user: { id: number; name: string };
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  forum: {
     id: number;
     name: string;
     course_id: number;
     course: { slug: string; title: string };
  };
}

interface Post {
  id: number;
  topic_id: number;
  user: { id: number; name: string };
  content: string;
  created_at: string;
  parent_id: number | null;
  replies?: Post[];
}

export default function TopicViewer() {
  const { forumId, topicId } = useParams();
  const { token, user: currentUser } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchTopicData();
  }, [topicId]);

  const fetchTopicData = async () => {
    try {
      const res = await client.get(`/topics/${topicId}`, { headers });
      setTopic(res.data.topic);
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Error fetching topic:', err);
    } finally {
      setLoading(false);
    }
  };

  const { confirm, notify } = useNotificationStore();

  const handleReply = async (parentId: number | null = null) => {
    if (!replyContent.trim()) return;
    try {
      await client.post(`/topics/${topicId}/posts`, {
        content: replyContent,
        parent_id: parentId
      }, { headers });
      setReplyContent('');
      setReplyingTo(null);
      notify("Institutional Discourse: Contribution published successfully.", "success");
      fetchTopicData();
    } catch (err) {
      console.error('Reply failed:', err);
      notify('Institutional Registry: Failed to publish reply protocol.', "error");
    }
  };

  const handleDeletePost = async (postId: number) => {
    const confirmed = await confirm({
      title: 'Institutional Cleanup Protocol',
      message: 'Are you sure you want to permanently remove this content from the academic registry? This action will purge the data from all active caches.',
      confirmText: 'Purge Content',
      cancelText: 'Retain Post',
      type: 'danger'
    });

    if (!confirmed) return;
    try {
      await client.delete(`/posts/${postId}`, { headers });
      notify("Content purged from discouse history.", "success");
      fetchTopicData();
    } catch (err) {
      console.error('Delete failed:', err);
      notify("Cleanup protocol execution failure.", "error");
    }
  };

  const toggleLock = async () => {
    if (!topic || currentUser?.role !== 'instructor' && currentUser?.role !== 'admin') return;
    try {
      await client.patch(`/topics/${topicId}`, { is_locked: !topic.is_locked }, { headers });
      fetchTopicData();
    } catch (err) {
       console.error('Toggle lock failed:', err);
    }
  }

  const PostItem = ({ post, depth = 0 }: { post: Post; depth?: number }) => (
    <div className={`mt-8 ${depth > 0 ? 'ml-12 border-l border-border-soft pl-8' : ''}`}>
      <div className="bg-white rounded-2xl border border-border-soft p-8 shadow-sm hover:shadow-md transition-all relative group">
         {depth > 0 && <CornerDownRight size={14} className="absolute -left-5 top-8 text-gray-300" />}
         
         <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-offwhite flex items-center justify-center text-mylms-purple shadow-sm">
                <User size={18} />
              </div>
              <div>
                 <p className="text-[11px] font-black uppercase text-mylms-purple tracking-tight">{post.user?.name}</p>
                 <p className="text-[8px] font-bold uppercase text-gray-300 tracking-widest mt-0.5">{new Date(post.created_at).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
               {(currentUser?.id === post.user.id || currentUser?.role === 'instructor' || currentUser?.role === 'admin') && (
                 <button onClick={() => handleDeletePost(post.id)} className="text-gray-300 hover:text-mylms-rose transition-colors">
                    <Trash2 size={14} />
                 </button>
               )}
               {!topic?.is_locked && (
                 <button onClick={() => setReplyingTo(post.id)} className="text-[9px] font-black uppercase text-mylms-rose tracking-widest hover:bg-mylms-rose/5 px-3 py-1 rounded-lg">Reply</button>
               )}
            </div>
         </div>

         <div className="text-[11px] font-bold text-text-main leading-loose uppercase tracking-tight opacity-80 whitespace-pre-wrap mb-6">
            {post.content}
         </div>

         {replyingTo === post.id && (
            <div className="mt-8 border-t border-border-soft pt-8">
               <textarea 
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Synthesize your reply content..."
                  className="w-full bg-offwhite border border-border-soft rounded-xl px-6 py-4 text-xs font-bold leading-loose outline-none focus:ring-1 focus:ring-mylms-purple/20 transition-all min-h-[100px] mb-4"
               />
               <div className="flex gap-4">
                  <button onClick={() => handleReply(post.id)} className="btn-purple px-8 py-3 text-[9px]">Submit Reply</button>
                  <button onClick={() => setReplyingTo(null)} className="btn-minimal px-6 py-3 text-[9px] opacity-50">Cancel</button>
               </div>
            </div>
         )}
      </div>

      {post.replies && post.replies.map(reply => (
        <PostItem key={reply.id} post={reply} depth={depth + 1} />
      ))}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Retrieving Institutional Discourse...</p>
    </div>
  );

  if (!topic) return <div>Topic not found</div>;

  return (
    <div className="max-w-5xl mx-auto py-16 px-12 min-h-screen transition-all">
      <div className="mb-12">
        <Link to={`/courses/${topic.forum.course?.slug}/forums`} className="text-[9px] font-black uppercase text-gray-400 mb-6 hover:text-mylms-purple transition-all flex items-center gap-2">
          <ArrowLeft size={10} /> Back to {topic.forum.name}
        </Link>
        <div className="flex justify-between items-start">
           <div>
              <div className="flex items-center gap-4 mb-4">
                 <span className="bg-mylms-purple/10 text-mylms-purple text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-mylms-purple/20">
                   Academic Discussion
                 </span>
                 {topic.is_pinned && <Pin size={14} className="text-mylms-rose" />}
                 {topic.is_locked && <Lock size={14} className="text-gray-300" />}
              </div>
              <h1 className="text-4xl font-serif font-black text-mylms-purple uppercase tracking-tight mb-4">{topic.title}</h1>
           </div>
           
           {(currentUser?.role === 'instructor' || currentUser?.role === 'admin') && (
             <button 
               onClick={toggleLock}
               className={`px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2 ${topic.is_locked ? 'bg-mylms-rose text-white' : 'bg-white border border-border-soft text-mylms-purple hover:bg-mylms-rose/5 hover:border-mylms-rose'}`}
             >
                <Lock size={14} /> {topic.is_locked ? 'Unlock Discourse' : 'Archive Thread'}
             </button>
           )}
        </div>
      </div>

      {/* Main Topic Body */}
      <div className="bg-white rounded-3xl border border-border-soft p-12 shadow-sm mb-16 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8">
            <ShieldCheck size={40} className="text-mylms-rose opacity-5 rotate-12" />
         </div>
         <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
            <div className="w-12 h-12 rounded-2xl bg-mylms-purple flex items-center justify-center text-white shadow-lg">
               <User size={24} />
            </div>
            <div>
               <p className="text-[12px] font-black uppercase text-text-main tracking-tight leading-none mb-1">{topic.user?.name}</p>
               <p className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">{new Date(topic.created_at).toLocaleString()}</p>
            </div>
         </div>
         <div className="text-lg font-bold text-text-main leading-relaxed uppercase tracking-tight opacity-90 whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:text-mylms-purple first-letter:float-left first-letter:mr-3">
            {topic.content}
         </div>
      </div>

      {/* Replies Header */}
      <div className="flex items-center gap-6 mb-12">
         <h2 className="text-xl font-serif font-black text-mylms-purple uppercase tracking-tight">Institutional Replies</h2>
         <div className="h-px bg-border-soft grow"></div>
         <div className="flex items-center gap-3 bg-offwhite px-5 py-2.5 rounded-full border border-border-soft">
            <MessageCircle size={14} className="text-mylms-rose" />
            <span className="text-[10px] font-black uppercase tracking-widest">{posts.length} Contributions</span>
         </div>
      </div>

      {/* Posts List */}
      <div className="mb-20">
         {posts.map(post => (
           <PostItem key={post.id} post={post} />
         ))}
      </div>

      {/* Main Reply Form */}
      {!topic.is_locked && !replyingTo && (
         <div className="bg-offwhite border-t border-border-soft sticky bottom-0 p-10 mt-20 -mx-12 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            <div className="max-w-4xl mx-auto">
               <div className="mb-4 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-mylms-rose rounded-full animate-pulse"></div>
                  <h3 className="text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em]">Join the Discourse</h3>
               </div>
               <div className="relative">
                  <textarea 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Contribute to this academic discussion..."
                    className="w-full bg-white border border-border-soft rounded-2xl p-8 pr-32 text-xs font-bold leading-loose outline-none focus:ring-4 focus:ring-mylms-purple/5 focus:border-mylms-purple/20 transition-all min-h-[140px] shadow-sm"
                  />
                  <button 
                    onClick={() => handleReply()}
                    className="absolute right-6 bottom-6 btn-purple px-10 py-3.5 shadow-xl flex items-center gap-3"
                  >
                     Publish Reply <Send size={14} />
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
