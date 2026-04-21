import { useState, useEffect } from 'react';
import client from '../../api/client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Mail, 
  ChevronLeft, 
  Save, 
  Code, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  Layout,
  Search,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: number;
  slug: string;
  subject: string;
  content_html: string;
  category: string;
  placeholders: string[];
}

export default function EmailTemplateManager() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await client.get('/admin/email-templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    setNotif(null);
    try {
      await client.put(`/admin/email-templates/${selectedTemplate.id}`, {
        subject: selectedTemplate.subject,
        content_html: selectedTemplate.content_html
      });
      setNotif({ type: 'success', message: 'Institutional template updated.' });
      fetchTemplates();
    } catch (err: any) {
      setNotif({ type: 'error', message: err.response?.data?.message || 'Failed to update template.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.slug.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'clean'],
      [{ 'color': [] }, { 'background': [] }],
    ],
  };

  if (loading) return (
    <div className="py-20 text-center">
       <div className="w-12 h-12 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Academic Templates...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-offwhite p-8 md:p-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate('/admin/communications')}
            className="p-3 bg-white border border-border-soft rounded-2xl hover:bg-offwhite transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-mylms-purple uppercase tracking-tighter italic">Template <span className="text-mylms-rose text-stroke">Architecture</span></h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Institutional Communication Management</p>
          </div>
        </div>

        {notif && (
          <div className={`mb-12 p-6 rounded-3xl border flex items-center gap-6 animate-in slide-in-from-top-4 duration-500 ${notif.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-mylms-rose/5 border-mylms-rose/20 text-mylms-rose'}`}>
            {notif.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <p className="text-xs font-black uppercase tracking-widest">{notif.message}</p>
            <button onClick={() => setNotif(null)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar: Template List */}
          <div className="lg:col-span-4 space-y-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white border border-border-soft rounded-[24px] outline-none focus:border-mylms-purple font-black text-xs uppercase tracking-tight shadow-sm"
              />
            </div>

            <div className="space-y-4">
              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full text-left p-6 rounded-[28px] border transition-all relative overflow-hidden group ${
                    selectedTemplate?.id === t.id 
                    ? 'bg-mylms-purple text-white border-mylms-purple shadow-2xl' 
                    : 'bg-white text-text-main border-border-soft hover:border-mylms-purple/30'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        selectedTemplate?.id === t.id ? 'bg-white/10 text-white' : 'bg-offwhite text-gray-400'
                      }`}>
                        {t.category}
                      </span>
                      <Mail size={14} className={selectedTemplate?.id === t.id ? 'text-white/40' : 'text-mylms-purple/40'} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-tight mb-1">{t.slug.replace('_', ' ')}</h4>
                    <p className={`text-[9px] font-bold truncate ${selectedTemplate?.id === t.id ? 'text-white/60' : 'text-gray-400'}`}>
                      {t.subject}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main: Template Editor */}
          <div className="lg:col-span-8">
            {selectedTemplate ? (
              <div className="bg-white rounded-[40px] border border-border-soft shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-10 border-b border-border-soft bg-offwhite/50 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-mylms-purple/10 text-mylms-purple rounded-2xl flex items-center justify-center">
                         <Layout size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-mylms-purple uppercase tracking-tight">{selectedTemplate.slug.replace('_', ' ')}</h3>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Institutional Layout Protocol</p>
                      </div>
                   </div>
                   <button 
                     onClick={handleSave}
                     disabled={saving}
                     className="btn-purple px-10 py-4 text-[10px] flex items-center gap-3 active:scale-95 transition-all shadow-lg"
                   >
                     {saving ? 'Transmitting...' : 'Commit Changes'}
                     <Save size={16} />
                   </button>
                </div>

                <div className="p-10 space-y-10">
                  {/* Subject Line */}
                  <div className="premium-input-wrapper group/input">
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Email Subject Line</label>
                    <div className="relative">
                      <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-mylms-rose" size={18} />
                      <input 
                        type="text" 
                        value={selectedTemplate.subject}
                        onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-black text-xs"
                      />
                    </div>
                  </div>

                  {/* Placeholders Info */}
                  <div className="p-8 bg-mylms-purple/5 border-2 border-dashed border-mylms-purple/10 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Code size={16} className="text-mylms-purple" />
                      <h5 className="text-[10px] font-black text-mylms-purple uppercase tracking-widest">Available Placeholders</h5>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(Array.isArray(selectedTemplate.placeholders) ? selectedTemplate.placeholders : (typeof selectedTemplate.placeholders === 'string' ? JSON.parse(selectedTemplate.placeholders || '[]') : [])).map((p: string) => (
                        <span key={p} className="px-3 py-2 bg-white border border-mylms-purple/20 text-mylms-purple text-[9px] font-black rounded-lg uppercase tracking-tight">
                          {`{{${p}}}`}
                        </span>
                      ))}
                      <span className="px-3 py-2 bg-white border border-border-soft text-gray-300 text-[9px] font-black rounded-lg uppercase tracking-tight">
                        {"{{campus_name}}"}
                      </span>
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <div className="space-y-4">
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Communication Body (HTML High-Fidelity)</label>
                    <div className="rounded-3xl border border-border-soft overflow-hidden h-[500px] flex flex-col">
                      <ReactQuill 
                        theme="snow" 
                        value={selectedTemplate.content_html} 
                        onChange={(content) => setSelectedTemplate({...selectedTemplate, content_html: content})}
                        modules={quillModules}
                        className="flex-1 overflow-y-auto"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
                     <Info className="text-amber-500 shrink-0" size={18} />
                     <p className="text-[10px] font-medium text-amber-700 leading-relaxed uppercase tracking-tighter">
                       Institutional Alert: Changes to system templates affect all active transmissions immediately. Ensure all placeholders are preserved to maintain data synchronization.
                     </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[800px] bg-white border-2 border-dashed border-border-soft rounded-[40px] flex flex-col items-center justify-center p-20 text-center group">
                <div className="w-24 h-24 bg-offwhite text-gray-300 rounded-[32px] flex items-center justify-center mb-10 group-hover:bg-mylms-purple/5 group-hover:text-mylms-purple transition-all duration-700">
                  <Mail size={48} />
                </div>
                <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter mb-4">No Template Selected</h3>
                <p className="text-text-secondary font-medium text-sm max-w-sm mx-auto leading-relaxed opacity-60">
                  Select an institutional communication protocol from the left panel to begin structural modification.
                </p>
                <div className="mt-12 flex items-center gap-4 text-[10px] font-black text-mylms-purple uppercase tracking-widest animate-pulse">
                   Select a protocol to proceed <ArrowRight size={14} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .quill {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .ql-container {
          flex: 1;
          font-family: inherit;
        }
        .ql-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: 1px solid #f0f0f0 !important;
          background: #f8fafc;
          padding: 15px !important;
        }
        .ql-editor {
          padding: 30px !important;
          font-size: 14px;
          color: #333;
        }
      `}</style>
    </div>
  );
}
