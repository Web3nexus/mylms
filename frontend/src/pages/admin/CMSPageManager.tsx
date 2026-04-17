import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Edit3, 
  Eye, 
  Trash2, 
  ArrowLeft,
  Clock
} from "lucide-react";
import client from "../../api/client";
import { useAuthStore } from "../../store/authStore";

interface CMSPage {
  id: number;
  slug: string;
  title: string;
  is_published: boolean;
  is_core: boolean;
  updated_at: string;
}

export default function CMSPageManager() {
  const navigate = useNavigate();
  const token = useAuthStore((state: any) => state.token);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "" });

  const fetchPages = async () => {
    try {
      const res = await client.get("/admin/pages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(res.data);
    } catch (err) {
      console.error("Fetch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post("/admin/pages", newPage, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setNewPage({ title: "", slug: "" });
      fetchPages();
    } catch (err) {
      alert("Failed to create page registry entry.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to decommission this page?")) return;
    try {
      await client.delete(`/admin/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPages();
    } catch (err) {
      alert("Decommissioning failed.");
    }
  };

  const handleTogglePublish = async (page: CMSPage) => {
    try {
      await client.patch(`/admin/pages/${page.id}`, {
        is_published: !page.is_published
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPages();
    } catch (err) {
      alert("Failed to update publication status.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-12 transition-all">
      <div className="flex justify-between items-end mb-12 border-b border-border-soft pb-10">
        <div>
           <button onClick={() => navigate('/admin/portal')} className="flex items-center gap-2 text-[9px] font-black text-mylms-purple uppercase tracking-widest mb-4 hover:opacity-70 transition-all">
              <ArrowLeft size={12} />
              Return to Operations
           </button>
           <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase mb-2">CMS Page Registry</h1>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Institutional Content & Visual Strategy Center</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-10 py-4 bg-mylms-rose text-white font-black rounded-full shadow-2xl hover:bg-mylms-rose/90 transition-all uppercase tracking-widest text-[10px] flex items-center gap-3 active:scale-95"
        >
          <Plus size={16} />
          Create New Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-3xl border border-border-soft shadow-xl overflow-hidden group relative transition-all hover:-translate-y-2 hover:shadow-2xl">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full transition-all ${page.is_core ? 'bg-mylms-rose/5' : 'bg-offwhite group-hover:bg-mylms-purple/5'}`}></div>
            
            <div className="p-10 relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleTogglePublish(page)}
                    className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                      page.is_published ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {page.is_published ? "Live System" : "Draft Registry"}
                  </button>
                  {page.is_core && (
                    <span className="bg-mylms-rose/10 text-mylms-rose px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Institutional Core
                    </span>
                  )}
                </div>
                {!page.is_core && (
                  <button onClick={() => handleDelete(page.id)} className="text-gray-200 hover:text-mylms-rose transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h3 className="text-2xl font-black text-text-main mb-2 tracking-tight uppercase group-hover:text-mylms-purple transition-colors">{page.title}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10 opacity-70">URL SLUG: /{page.slug}</p>
              
              <div className="flex items-center gap-3 mb-8 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                 <Clock size={12} />
                 Updated {new Date(page.updated_at).toLocaleDateString()}
              </div>

              <div className="mt-auto pt-8 border-t border-offwhite flex gap-4">
                <Link 
                  to={page.is_core ? `/admin/cms/guided/${page.slug}` : `/admin/cms/edit/${page.slug}`}
                  className={`flex-1 py-4 text-white rounded-xl font-black uppercase tracking-widest text-[9px] text-center shadow-lg transition-all flex items-center justify-center gap-2 ${
                    page.is_core ? 'bg-mylms-rose hover:bg-[#C01F4F]' : 'bg-mylms-purple hover:bg-mylms-purple/90'
                  }`}
                >
                  <Edit3 size={14} />
                  {page.is_core ? "Guided Editor" : "Visual Builder"}
                </Link>
                <a 
                  href={`/${page.slug}`}
                  target="_blank"
                  className="px-6 py-4 bg-white border border-border-soft text-text-main rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  <Eye size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-text-main/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white rounded-3xl p-12 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-text-main mb-8 uppercase tracking-tighter">New Page Protocol</h2>
            <form onSubmit={handleCreate} className="space-y-8">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Institutional Title</label>
                <input 
                  required
                  type="text" 
                  value={newPage.title}
                  onChange={e => setNewPage({...newPage, title: e.target.value})}
                  className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-bold text-sm tracking-tight transition-all"
                  placeholder="e.g. Undergraduate Programs"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">URL Registry Slug</label>
                <input 
                  required
                  type="text" 
                  value={newPage.slug}
                  onChange={e => setNewPage({...newPage, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-bold text-sm tracking-tight transition-all"
                  placeholder="e.g. programs"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 text-text-secondary font-black uppercase tracking-widest text-[10px]"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-mylms-purple text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-mylms-purple/90 transition-all"
                >
                  Initialize Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
