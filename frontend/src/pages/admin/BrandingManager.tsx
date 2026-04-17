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

  const updateStatField = (index: number, field: string, value: string) => {
    if (!branding) return;
    const newStats = [...branding.admissions_stats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateField('admissions_stats', newStats);
  };

  const addStat = () => {
    if (!branding) return;
    const newStats = [...branding.admissions_stats, { label: 'New Stat', value: '0', suffix: '' }];
    updateField('admissions_stats', newStats);
  };

  const removeStat = (index: number) => {
    if (!branding) return;
    const newStats = branding.admissions_stats.filter((_, i) => i !== index);
    updateField('admissions_stats', newStats);
  };

  const updateBenefitField = (index: number, field: string, value: string) => {
    if (!branding) return;
    const newBenefits = [...branding.benefit_cards];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    updateField('benefit_cards', newBenefits);
  };

  const addBenefit = () => {
    if (!branding) return;
    const newBenefits = [...branding.benefit_cards, { title: 'New Benefit', desc: 'Description here...' }];
    updateField('benefit_cards', newBenefits);
  };

  const removeBenefit = (index: number) => {
    if (!branding) return;
    const newBenefits = branding.benefit_cards.filter((_, i) => i !== index);
    updateField('benefit_cards', newBenefits);
  };

  const updateExperienceFeatureField = (index: number, field: string, value: string) => {
    if (!branding) return;
    const newFeatures = [...branding.experience_features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateField('experience_features', newFeatures);
  };

  const addExperienceFeature = () => {
    if (!branding) return;
    const newFeatures = [...branding.experience_features, { title: 'New Feature', desc: 'Description...', icon: 'globe' }];
    updateField('experience_features', newFeatures);
  };

  const removeExperienceFeature = (index: number) => {
    if (!branding) return;
    const newFeatures = branding.experience_features.filter((_, i) => i !== index);
    updateField('experience_features', newFeatures);
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
        <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 font-bold text-center rounded-xl animate-in fade-in slide-in-from-top">
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
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Logo URL</label>
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-offwhite border border-border-soft flex items-center justify-center overflow-hidden shrink-0">
                         {branding?.logo_url ? <img src={branding.logo_url} className="max-w-full max-h-full object-contain" /> : <ImageIcon size={20} className="text-gray-300" />}
                      </div>
                      <input 
                         type="text" 
                         value={branding?.logo_url || ''} 
                         onChange={(e) => updateField('logo_url', e.target.value)}
                         className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-xs focus:ring-2 focus:ring-mylms-purple/10 outline-none"
                      />
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

          {/* PAGE CONTENT REGISTRY */}
          <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
                <Layout size={20} className="text-mylms-rose" />
                <h3 className="font-black uppercase tracking-widest text-sm">Admissions Landing Page</h3>
             </div>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Hero Registry Title</label>
                  <input 
                    type="text" 
                    value={branding?.admissions_hero_title}
                    onChange={(e) => updateField('admissions_hero_title', e.target.value)}
                    className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Hero Description</label>
                  <textarea 
                    rows={3}
                    value={branding?.admissions_hero_desc}
                    onChange={(e) => updateField('admissions_hero_desc', e.target.value)}
                    className="w-full bg-offwhite border border-border-soft rounded-xl p-4 font-bold text-sm outline-none"
                  />
                </div>
                
                <div className="pt-6 border-t border-offwhite">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Institutional Statistics</label>
                    <button onClick={addStat} className="text-[9px] font-black uppercase text-mylms-purple flex items-center gap-2 hover:opacity-70"><Plus size={12}/> Add Stat</button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {branding?.admissions_stats.map((stat, idx) => (
                      <div key={idx} className="flex gap-4 items-end bg-offwhite p-4 rounded-xl relative group/stat">
                        <button onClick={() => removeStat(idx)} className="absolute top-2 right-2 opacity-0 group-hover/stat:opacity-100 text-gray-300 hover:text-mylms-rose transition-all"><Trash2 size={12}/></button>
                        <div className="flex-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase mb-1 block">Label</label>
                          <input type="text" value={stat.label} onChange={(e) => updateStatField(idx, 'label', e.target.value)} className="w-full bg-white border border-border-soft rounded-lg px-3 py-1.5 text-xs font-bold" />
                        </div>
                        <div className="w-24">
                          <label className="text-[8px] font-black text-gray-400 uppercase mb-1 block">Value</label>
                          <input type="text" value={stat.value} onChange={(e) => updateStatField(idx, 'value', e.target.value)} className="w-full bg-white border border-border-soft rounded-lg px-3 py-1.5 text-xs font-bold" />
                        </div>
                        <div className="w-16">
                          <label className="text-[8px] font-black text-gray-400 uppercase mb-1 block">Suffix</label>
                          <input type="text" value={stat.suffix} onChange={(e) => updateStatField(idx, 'suffix', e.target.value)} className="w-full bg-white border border-border-soft rounded-lg px-3 py-1.5 text-xs font-bold" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
                <Globe size={20} className="text-mylms-purple" />
                <h3 className="font-black uppercase tracking-widest text-sm">Directory Headers</h3>
             </div>
             <div className="space-y-8">
                <div className="p-6 bg-offwhite rounded-2xl space-y-4">
                  <p className="text-[10px] font-black uppercase text-mylms-purple tracking-widest border-b border-white/50 pb-2 mb-4">Scholarships Gallery</p>
                  <input type="text" value={branding?.scholarships_hero_title} onChange={(e) => updateField('scholarships_hero_title', e.target.value)} className="w-full bg-white border border-border-soft rounded-lg px-4 py-2 font-bold text-sm outline-none" placeholder="Hero Title" />
                  <textarea rows={2} value={branding?.scholarships_hero_desc} onChange={(e) => updateField('scholarships_hero_desc', e.target.value)} className="w-full bg-white border border-border-soft rounded-lg p-4 font-bold text-xs outline-none" placeholder="Intro Description" />
                </div>
                <div className="p-6 bg-offwhite rounded-2xl space-y-4">
                  <p className="text-[10px] font-black uppercase text-mylms-purple tracking-widest border-b border-white/50 pb-2 mb-4">Academic Catalog</p>
                  <input type="text" value={branding?.courses_hero_title} onChange={(e) => updateField('courses_hero_title', e.target.value)} className="w-full bg-white border border-border-soft rounded-lg px-4 py-2 font-bold text-sm outline-none" placeholder="Hero Title" />
                  <textarea rows={2} value={branding?.courses_hero_desc} onChange={(e) => updateField('courses_hero_desc', e.target.value)} className="w-full bg-white border border-border-soft rounded-lg p-4 font-bold text-xs outline-none" placeholder="Intro Description" />
                </div>
             </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
                <ShieldCheck size={20} className="text-mylms-rose" />
                <h3 className="font-black uppercase tracking-widest text-sm">Auth & Onboarding</h3>
             </div>
             <div className="space-y-6">
                <input type="text" value={branding?.auth_panel_title} onChange={(e) => updateField('auth_panel_title', e.target.value)} className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-sm outline-none" placeholder="Auth Panel Headline" />
                <textarea rows={3} value={branding?.auth_panel_desc} onChange={(e) => updateField('auth_panel_desc', e.target.value)} className="w-full bg-offwhite border border-border-soft rounded-xl p-4 font-bold text-sm outline-none" placeholder="Auth Panel Subtext" />
                
                <div className="pt-6 border-t border-offwhite">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mission Benefits</label>
                    <button onClick={addBenefit} className="text-[9px] font-black uppercase text-mylms-purple flex items-center gap-2 hover:opacity-70"><Plus size={12}/> Add Card</button>
                  </div>
                  <div className="space-y-4">
                    {branding?.benefit_cards.map((card, idx) => (
                      <div key={idx} className="bg-offwhite p-6 rounded-2xl relative group/card">
                        <button onClick={() => removeBenefit(idx)} className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 text-gray-300 hover:text-mylms-rose transition-all"><Trash2 size={16}/></button>
                        <input type="text" value={card.title} onChange={(e) => updateBenefitField(idx, 'title', e.target.value)} className="w-full bg-transparent border-b border-white mb-4 font-black text-mylms-purple uppercase tracking-widest text-xs outline-none" placeholder="Card Title" />
                        <textarea rows={2} value={card.desc} onChange={(e) => updateBenefitField(idx, 'desc', e.target.value)} className="w-full bg-transparent text-gray-500 font-medium text-xs outline-none resize-none" placeholder="Card Description" />
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
                <Globe size={20} className="text-mylms-purple" />
                <h3 className="font-black uppercase tracking-widest text-sm">Student Experience Page</h3>
             </div>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Hero Registry Title</label>
                  <input 
                    type="text" 
                    value={branding?.experience_hero_title}
                    onChange={(e) => updateField('experience_hero_title', e.target.value)}
                    className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Hero Description</label>
                  <textarea 
                    rows={3}
                    value={branding?.experience_hero_desc}
                    onChange={(e) => updateField('experience_hero_desc', e.target.value)}
                    className="w-full bg-offwhite border border-border-soft rounded-xl p-4 font-bold text-sm outline-none"
                  />
                </div>
                
                <div className="pt-6 border-t border-offwhite">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Experience Highlights</label>
                    <button onClick={addExperienceFeature} className="text-[9px] font-black uppercase text-mylms-purple flex items-center gap-2 hover:opacity-70"><Plus size={12}/> Add Feature</button>
                  </div>
                  <div className="space-y-4">
                    {branding?.experience_features.map((feature, idx) => (
                      <div key={idx} className="bg-offwhite p-6 rounded-2xl relative group/feat">
                        <button onClick={() => removeExperienceFeature(idx)} className="absolute top-4 right-4 opacity-0 group-hover/feat:opacity-100 text-gray-300 hover:text-mylms-rose transition-all"><Trash2 size={16}/></button>
                        <input type="text" value={feature.title} onChange={(e) => updateExperienceFeatureField(idx, 'title', e.target.value)} className="w-full bg-transparent border-b border-white mb-4 font-black text-mylms-purple uppercase tracking-widest text-xs outline-none" placeholder="Feature Title" />
                        <textarea rows={2} value={feature.desc} onChange={(e) => updateExperienceFeatureField(idx, 'desc', e.target.value)} className="w-full bg-transparent text-gray-500 font-medium text-xs outline-none resize-none" placeholder="Feature Description" />
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border-soft">
                <ShieldCheck size={20} className="text-mylms-rose" />
                <h3 className="font-black uppercase tracking-widest text-sm">About Institutional Profile</h3>
             </div>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Hero Title</label>
                  <input 
                    type="text" 
                    value={branding?.about_hero_title}
                    onChange={(e) => updateField('about_hero_title', e.target.value)}
                    className="w-full bg-offwhite border border-border-soft rounded-xl px-4 py-3 font-bold text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Hero Description</label>
                  <textarea 
                    rows={2}
                    value={branding?.about_hero_desc}
                    onChange={(e) => updateField('about_hero_desc', e.target.value)}
                    className="w-full bg-offwhite border border-border-soft rounded-xl p-4 font-bold text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Mission Statement</label>
                  <textarea 
                    rows={4}
                    value={branding?.about_mission}
                    onChange={(e) => updateField('about_mission', e.target.value)}
                    className="w-full bg-offwhite border border-border-soft rounded-xl p-4 font-bold text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Institutional History</label>
                  <textarea 
                    rows={4}
                    value={branding?.about_history}
                    onChange={(e) => updateField('about_history', e.target.value)}
                    className="w-full bg-offwhite border border-border-soft rounded-xl p-4 font-bold text-sm outline-none"
                  />
                </div>
             </div>
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
