import { useState, useEffect } from 'react';
import { 
  Palette, 
  Trash2, 
  Plus, 
  Save, 
  ArrowLeft, 
  Layout, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Image as ImageIcon,
  Type,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { Branding } from '../../hooks/useBranding';

export default function BrandingManager() {
  const { token } = useAuthStore();
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // track which field is uploading
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await client.get('/branding', { headers });
        setBranding(response.data);
      } catch (err) {
        console.error('Failed to load branding:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, [token]);

  const handleSave = async () => {
    if (!branding) return;
    setSaving(true);
    setMessage('');
    setStatus(null);
    try {
      await client.patch('/branding', branding, { headers });
      setMessage('Branding Profile Updated Successfully');
      setStatus('success');
      setTimeout(() => { setMessage(''); setStatus(null); }, 3000);
    } catch (err: any) {
      console.error('Update failed:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update branding settings.';
      setMessage(errorMsg);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Branding, value: any) => {
    if (!branding) return;
    setBranding({ ...branding, [field]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'logo_light' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await client.post('/branding/upload', formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const fieldMap: Record<string, keyof Branding> = {
          'logo': 'logo_url',
          'logo_light': 'logo_light_url',
          'favicon': 'favicon_url'
        };
        updateField(fieldMap[type], response.data.url);
        setMessage(`${type.replace('_', ' ')} uploaded successfully`);
        setStatus('success');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setMessage(err.response?.data?.message || 'Upload failed');
      setStatus('error');
    } finally {
      setUploading(null);
    }
  };

  const addColumn = () => {
    if (!branding) return;
    const newColumns = [...branding.footer_columns, { title: 'New Column', links: [] }];
    updateField('footer_columns', newColumns);
  };

  const removeColumn = (index: number) => {
    if (!branding) return;
    const newColumns = branding.footer_columns.filter((_, i) => i !== index);
    updateField('footer_columns', newColumns);
  };

  const updateColumnTitle = (index: number, title: string) => {
    if (!branding) return;
    const newColumns = [...branding.footer_columns];
    newColumns[index].title = title;
    updateField('footer_columns', newColumns);
  };

  const addLink = (colIndex: number) => {
    if (!branding) return;
    const newColumns = [...branding.footer_columns];
    newColumns[colIndex].links.push({ label: 'New Link', url: '/' });
    updateField('footer_columns', newColumns);
  };

  const removeLink = (colIndex: number, linkIndex: number) => {
    if (!branding) return;
    const newColumns = [...branding.footer_columns];
    newColumns[colIndex].links = newColumns[colIndex].links.filter((_, i) => i !== linkIndex);
    updateField('footer_columns', newColumns);
  };

  const updateLink = (colIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    if (!branding) return;
    const newColumns = [...branding.footer_columns];
    newColumns[colIndex].links[linkIndex][field] = value;
    updateField('footer_columns', newColumns);
  };


  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-offwhite">
         <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin"></div>
       </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-12 min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div>
          <Link to="/securegate" className="flex items-center gap-2 text-mylms-purple font-black uppercase tracking-widest text-[10px] mb-4 hover:gap-4 transition-all">
            <ArrowLeft size={14} />
            Back to Overview
          </Link>
          <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase">Branding & System Control</h1>
          <p className="text-text-secondary font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Global Visual Identity and Navigation Matrix</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-purple flex items-center gap-3 px-12 py-4 shadow-2xl disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
          {saving ? 'Synchronizing...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`mb-8 p-4 border rounded-xl animate-in fade-in slide-in-from-top font-bold text-center ${
          status === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Core Identity Section */}
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
                <Palette className="text-mylms-purple" />
                <h3 className="font-black uppercase tracking-widest text-sm">Visual Identity</h3>
             </div>

             <div className="space-y-8">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Institutional Name</label>
                   <input 
                      type="text" 
                      value={branding?.institutional_name} 
                      onChange={(e) => updateField('institutional_name', e.target.value)}
                      className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-mylms-purple/10 outline-none"
                   />
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Institutional Motto</label>
                   <input 
                      type="text" 
                      value={branding?.institutional_motto} 
                      onChange={(e) => updateField('institutional_motto', e.target.value)}
                      className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-mylms-purple/10 outline-none"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Primary Color</label>
                      <div className="flex gap-2">
                         <input 
                            type="color" 
                            value={branding?.primary_color}
                            onChange={(e) => updateField('primary_color', e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                         />
                         <input 
                            type="text" 
                            value={branding?.primary_color}
                            onChange={(e) => updateField('primary_color', e.target.value)}
                            className="w-full bg-offwhite border border-border-soft rounded-xl px-4 font-mono text-xs"
                         />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Accent Color</label>
                      <div className="flex gap-2">
                         <input 
                            type="color" 
                            value={branding?.accent_color}
                            onChange={(e) => updateField('accent_color', e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                         />
                         <input 
                            type="text" 
                            value={branding?.accent_color}
                            onChange={(e) => updateField('accent_color', e.target.value)}
                            className="w-full bg-offwhite border border-border-soft rounded-xl px-4 font-mono text-xs"
                         />
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Institutional Logo (Dark)</label>
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-offwhite border border-border-soft flex items-center justify-center overflow-hidden shrink-0">
                         {branding?.logo_url ? <img src={branding.logo_url} className="max-w-full max-h-full object-contain" /> : <ImageIcon size={20} className="text-gray-300" />}
                      </div>
                      <div className="grow space-y-2">
                        <input 
                           type="text" 
                           value={branding?.logo_url || ''} 
                           onChange={(e) => updateField('logo_url', e.target.value)}
                           className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-xs focus:ring-2 focus:ring-mylms-purple/10 outline-none"
                           placeholder="URL or Upload..."
                        />
                        <div className="flex items-center gap-3">
                           <label className="cursor-pointer bg-mylms-purple/5 hover:bg-mylms-purple/10 border border-mylms-purple/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-mylms-purple transition-all flex items-center gap-2">
                              {uploading === 'logo' ? <div className="w-3 h-3 border-2 border-mylms-purple border-t-transparent rounded-full animate-spin"></div> : <Plus size={12} />}
                              {uploading === 'logo' ? 'Uploading...' : 'Upload File'}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} disabled={!!uploading} />
                           </label>
                        </div>
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Institutional Logo (Light/White)</label>
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-mylms-purple border border-border-soft flex items-center justify-center overflow-hidden shrink-0">
                         {branding?.logo_light_url ? <img src={branding.logo_light_url} className="max-w-full max-h-full object-contain" /> : <ImageIcon size={20} className="text-white/20" />}
                      </div>
                      <div className="grow space-y-2">
                        <input 
                           type="text" 
                           value={branding?.logo_light_url || ''} 
                           onChange={(e) => updateField('logo_light_url', e.target.value)}
                           className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-xs focus:ring-2 focus:ring-mylms-purple/10 outline-none"
                           placeholder="URL or Upload..."
                        />
                        <div className="flex items-center gap-3">
                           <label className="cursor-pointer bg-mylms-purple/5 hover:bg-mylms-purple/10 border border-mylms-purple/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-mylms-purple transition-all flex items-center gap-2">
                              {uploading === 'logo_light' ? <div className="w-3 h-3 border-2 border-mylms-purple border-t-transparent rounded-full animate-spin"></div> : <Plus size={12} />}
                              {uploading === 'logo_light' ? 'Uploading...' : 'Upload File'}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_light')} disabled={!!uploading} />
                           </label>
                        </div>
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Institutional Favicon (32x32)</label>
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-offwhite border border-border-soft flex items-center justify-center overflow-hidden shrink-0">
                         {branding?.favicon_url ? <img src={branding.favicon_url} className="w-6 h-6 object-contain" /> : <Globe size={20} className="text-gray-300" />}
                      </div>
                      <div className="grow space-y-2">
                        <input 
                           type="text" 
                           value={branding?.favicon_url || ''} 
                           onChange={(e) => updateField('favicon_url', e.target.value)}
                           className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-xs focus:ring-2 focus:ring-mylms-purple/10 outline-none"
                           placeholder="URL or Upload..."
                        />
                        <div className="flex items-center gap-3">
                           <label className="cursor-pointer bg-mylms-purple/5 hover:bg-mylms-purple/10 border border-mylms-purple/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-mylms-purple transition-all flex items-center gap-2">
                              {uploading === 'favicon' ? <div className="w-3 h-3 border-2 border-mylms-purple border-t-transparent rounded-full animate-spin"></div> : <Plus size={12} />}
                              {uploading === 'favicon' ? 'Uploading...' : 'Upload File'}
                              <input type="file" className="hidden" accept=".ico,.png" onChange={(e) => handleFileUpload(e, 'favicon')} disabled={!!uploading} />
                           </label>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
                <ShieldCheck className="text-mylms-rose" />
                <h3 className="font-black uppercase tracking-widest text-sm">Enrollment Registry Status</h3>
             </div>
             
             <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-offwhite rounded-2xl border border-border-soft">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-mylms-purple mb-1">Applications Enabled</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Global student registry access</p>
                   </div>
                   <button 
                     onClick={() => updateField('admissions_enabled', !branding?.admissions_enabled)}
                     className={`transition-all duration-500 ${branding?.admissions_enabled ? 'text-mylms-rose' : 'text-gray-300'}`}
                   >
                      {branding?.admissions_enabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                   </button>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Registry Re-Opening Date</label>
                   <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input 
                         type="date" 
                         value={branding?.admissions_opens_at} 
                         onChange={(e) => updateField('admissions_opens_at', e.target.value)}
                         className="w-full bg-offwhite border border-border-soft rounded-xl pl-12 pr-4 py-3 font-bold text-sm focus:ring-2 focus:ring-mylms-purple/10 outline-none"
                      />
                   </div>
                </div>

                <Link 
                  to="/admin/admissions/registry"
                  className="w-full py-4 border-2 border-dashed border-mylms-purple/20 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-mylms-purple hover:bg-mylms-purple/5 transition-all"
                >
                   <Settings size={14} />
                   Configure Wizard Fields
                </Link>
             </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
                <Type className="text-mylms-purple" />
                <h3 className="font-black uppercase tracking-widest text-sm">Global Footer Blurb</h3>
             </div>
             <textarea 
                rows={4}
                value={branding?.footer_text}
                onChange={(e) => updateField('footer_text', e.target.value)}
                className="w-full bg-offwhite border border-border-soft rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-mylms-purple/10 outline-none leading-relaxed"
                placeholder="Institutional description for the footer..."
             />
          </div>

          <div className="bg-mylms-purple/5 p-10 rounded-3xl border border-mylms-purple/10 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
             <div className="flex items-center gap-4 mb-6">
                <Layout size={24} className="text-mylms-purple" />
                <h3 className="font-black uppercase tracking-widest text-sm">Centralized Page Registry</h3>
             </div>
             <p className="text-[11px] font-bold text-gray-500 mb-8 leading-relaxed uppercase tracking-wider">
                Marketing content for Landing, About, and Experience pages has been migrated to the 
                centralized CMS Registry for better management.
             </p>
             <Link 
               to="/admin/pages" 
               className="inline-flex items-center gap-3 bg-mylms-purple text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-mylms-purple/90 transition-all active:scale-95"
             >
                Access Registry Center
                <ExternalLink size={14} />
             </Link>
          </div>
        </div>

        {/* Navigation & Footer Structure Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-12 rounded-3xl border border-border-soft shadow-sm min-h-full">
             <div className="flex justify-between items-center mb-12 pb-6 border-b border-border-soft">
                <div className="flex items-center gap-4">
                   <Layout className="text-mylms-rose" />
                   <h3 className="font-black uppercase tracking-widest text-sm">Footer Navigation Matrix</h3>
                </div>
                <button 
                  onClick={addColumn}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-mylms-purple hover:bg-offwhite px-4 py-2 rounded-lg transition-all"
                >
                   <Plus size={14} />
                   Add Column
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {branding?.footer_columns.map((col, colIdx) => (
                   <div key={colIdx} className="bg-offwhite p-8 rounded-2xl border border-border-soft relative group">
                      <button 
                        onClick={() => removeColumn(colIdx)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-mylms-rose transition-colors"
                      >
                         <Trash2 size={16} />
                      </button>
                      
                      <div className="mb-8">
                         <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Column Title</label>
                         <input 
                            type="text" 
                            value={col.title}
                            onChange={(e) => updateColumnTitle(colIdx, e.target.value)}
                            className="bg-transparent border-b border-gray-200 w-full font-black text-lg uppercase tracking-tighter text-mylms-purple outline-none focus:border-mylms-rose transition-all"
                         />
                      </div>

                      <div className="space-y-4">
                         {col.links.map((link, linkIdx) => (
                            <div key={linkIdx} className="bg-white p-4 rounded-xl shadow-sm border border-border-soft flex gap-4 items-end">
                               <div className="grow space-y-3">
                                  <div className="flex justify-between items-center">
                                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">Link {linkIdx + 1}</span>
                                     <button 
                                       onClick={() => removeLink(colIdx, linkIdx)}
                                       className="text-gray-200 hover:text-mylms-rose transition-colors"
                                     >
                                        <Trash2 size={12} />
                                     </button>
                                  </div>
                                  <input 
                                     type="text" 
                                     value={link.label}
                                     onChange={(e) => updateLink(colIdx, linkIdx, 'label', e.target.value)}
                                     placeholder="Label"
                                     className="w-full text-xs font-bold text-text-main outline-none"
                                  />
                                  <div className="flex items-center gap-2 text-gray-400">
                                     <Globe size={10} />
                                     <input 
                                        type="text" 
                                        value={link.url}
                                        onChange={(e) => updateLink(colIdx, linkIdx, 'url', e.target.value)}
                                        placeholder="URL (/path)"
                                        className="w-full text-[10px] font-mono outline-none bg-transparent"
                                     />
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>

                      <button 
                         onClick={() => addLink(colIdx)}
                         className="w-full mt-6 py-4 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-mylms-rose hover:text-mylms-rose transition-all flex items-center justify-center gap-2"
                      >
                         <Plus size={12} />
                         Add Link
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
      
      {/* Visual Preview Alert */}
      <div className="mt-12 bg-mylms-purple p-8 rounded-3xl text-white flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
               <Globe size={24} />
            </div>
            <div>
               <h5 className="font-black uppercase tracking-tighter text-lg leading-none mb-1">Live Preview Synchronization</h5>
               <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Changes saved here will propagate across the entire public platform immediately.</p>
            </div>
         </div>
         <a href="/" target="_blank" className="flex items-center gap-3 bg-white text-mylms-purple px-10 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl">
            View Live Site
            <ExternalLink size={14} />
         </a>
      </div>
    </div>
  );
}
