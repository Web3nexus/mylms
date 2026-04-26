import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  Layout, 
  Type, 
  Image as ImageIcon
} from "lucide-react";
import client from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/useNotificationStore";

export default function GuidedPageEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state: any) => state.token);
  
  const [page, setPage] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { notify } = useNotificationStore();

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await client.get(`/admin/pages/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPage(res.data);
        const parsedContent = res.data.puck_json?.content || [];
        
        // Auto-inject missing structural properties so they instantly appear on live servers
        parsedContent.forEach((block: any) => {
          if (block.type === 'Hero') {
            if (block.props.showBgImage === undefined) block.props.showBgImage = "true";
            if (block.props.showOverlay === undefined) block.props.showOverlay = "true";
            if (block.props.overlayColor === undefined) block.props.overlayColor = "";
            if (block.props.overlayOpacity === undefined) block.props.overlayOpacity = 0.8;
          }
        });

        setContent(parsedContent);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug, token]);

  const handleUpdateField = (blockIndex: number, fieldName: string, value: any, zone?: string, zoneIndex?: number) => {
    const newContent = [...content];
    if (zone && zoneIndex !== undefined) {
      // Handle nested blocks in FlexColumns DropZones
      if (!newContent[blockIndex].zones) newContent[blockIndex].zones = {};
      newContent[blockIndex].zones[zone][zoneIndex].props[fieldName] = value;
    } else {
      newContent[blockIndex].props[fieldName] = value;
    }
    setContent(newContent);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.patch(`/admin/pages/${page.id}`, {
        puck_json: { ...page.puck_json, content },
        is_published: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveSuccess(true);
      notify("Institutional Registry: Content synchronized successfully.", "success");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      notify("Institutional Registry Error: Failed to synchronize changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-offwhite pb-24">
      {/* Institutional Top Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border-soft px-12 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
           <button onClick={() => navigate('/admin/pages')} className="p-2.5 rounded-xl hover:bg-offwhite transition-all text-mylms-purple border border-border-soft">
              <ArrowLeft size={18} />
           </button>
           <div>
              <h1 className="text-xl font-black text-text-main tracking-tighter uppercase leading-none">{page?.title}</h1>
              <p className="text-[10px] font-black text-mylms-rose tracking-[0.2em] uppercase mt-2">Guided Institutional Editor</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           {saveSuccess && (
             <div className="flex items-center gap-2 text-green-600 font-black text-[9px] uppercase tracking-widest animate-in fade-in slide-in-from-right">
                <CheckCircle size={14} />
                Registry Updated
             </div>
           )}
           <button 
            disabled={saving}
            onClick={handleSave}
            className="bg-mylms-purple text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl hover:bg-mylms-purple/90 transition-all active:scale-95 disabled:opacity-50"
           >
             {saving ? "Deploying..." : (
               <>
                 <Save size={16} />
                 Save Changes
               </>
             )}
           </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-12 px-8">
         <div className="mb-12 p-10 bg-mylms-purple text-white rounded-[32px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
            <h2 className="text-2xl font-black mb-4 tracking-tighter uppercase">Structured Content Management</h2>
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest leading-loose max-w-xl">
               This is a protected institutional page. The layout structure is locked to maintain brand integrity, 
               but you can freely edit all text, imagery, and links below.
            </p>
         </div>

         <div className="space-y-12">
            {content.map((block, i) => (
              <div key={i} className="bg-white border border-border-soft rounded-3xl overflow-hidden shadow-sm hover:border-mylms-purple/30 transition-all">
                <div className="px-8 py-5 bg-offwhite border-b border-border-soft flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-mylms-purple shadow-sm">
                         {block.type === 'Hero' ? <Layout size={18} /> : block.type === 'RichText' ? <Type size={18} /> : <ImageIcon size={18} />}
                      </div>
                      <span className="text-[11px] font-black text-text-main uppercase tracking-[0.2em]">{block.type} Block</span>
                   </div>
                </div>

                <div className="p-10 space-y-10">
                   {/* Standard Fields for basic blocks */}
                   {Object.entries(block.props).map(([key, value]: [string, any]) => {
                     const isToggle = key === 'showOverlay' || key === 'showBgImage';
                     const isVariant = key === 'variant';
                     
                     if (isToggle) {
                       const isEnabled = value === "true" || value === true;
                       return (
                         <div key={key} className="flex items-center justify-between p-5 bg-offwhite border border-border-soft rounded-2xl">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</label>
                            <button
                              onClick={() => handleUpdateField(i, key, isEnabled ? "false" : "true")}
                              className={`w-14 h-8 rounded-full transition-colors relative ${isEnabled ? 'bg-mylms-purple' : 'bg-gray-300'}`}
                            >
                              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${isEnabled ? 'left-7' : 'left-1'}`}></div>
                            </button>
                         </div>
                       );
                     }
                     
                     if (isVariant) {
                        return (
                         <div key={key}>
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Layout Variant</label>
                            <select 
                              value={value}
                              onChange={(e) => handleUpdateField(i, key, e.target.value)}
                              className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-bold text-sm tracking-tight transition-all appearance-none"
                            >
                              <option value="default">Modern Purple</option>
                              <option value="split-gradient">Split Gradient Overlay</option>
                            </select>
                         </div>
                        );
                     }

                     if (typeof value === 'string' || typeof value === 'number') {
                       const isColor = key.toLowerCase().includes('color');
                       return (
                         <div key={key}>
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{key.replace(/([A-Z])/g, ' $1')}</label>
                            {typeof value === 'string' && value.length > 60 ? (
                              <textarea 
                                value={value}
                                onChange={(e) => handleUpdateField(i, key, e.target.value)}
                                className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-bold text-sm tracking-tight transition-all min-h-[120px]"
                              />
                            ) : (
                              <div className="flex items-center gap-3">
                                {isColor && (
                                  <div 
                                    className="w-10 h-10 rounded-xl border border-border-soft shadow-inner shrink-0" 
                                    style={{ backgroundColor: typeof value === 'string' ? value || 'transparent' : 'transparent' }}
                                  ></div>
                                )}
                                <input 
                                  type={typeof value === 'number' ? 'number' : 'text'}
                                  step={typeof value === 'number' ? '0.1' : undefined}
                                  value={value}
                                  onChange={(e) => handleUpdateField(i, key, typeof value === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                  className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-bold text-sm tracking-tight transition-all"
                                  placeholder={isColor ? "#HEX or rgba()" : ""}
                                />
                              </div>
                            )}
                         </div>
                       )
                     }
                     return null;
                   })}

                   {/* Nested Blocks for FlexColumns */}
                   {block.type === 'FlexColumns' && block.zones && (
                     <div className="space-y-12 pt-8 border-t border-offwhite">
                        {Object.entries(block.zones).map(([zoneName, zoneBlocks]: [string, any]) => (
                          <div key={zoneName} className="space-y-8">
                             <h4 className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.4em]">{zoneName.toUpperCase()} COLUMN CONTENT</h4>
                             {zoneBlocks.map((zBlock: any, zi: number) => (
                               <div key={zi} className="pl-8 border-l-4 border-mylms-purple/10 space-y-8">
                                  {Object.entries(zBlock.props).map(([zKey, zValue]: [string, any]) => {
                                    if (typeof zValue === 'string') {
                                      return (
                                        <div key={zKey}>
                                           <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">{zKey.replace(/([A-Z])/g, ' $1')} ({zBlock.type})</label>
                                           <textarea 
                                              value={zValue}
                                              onChange={(e) => handleUpdateField(i, zKey, e.target.value, zoneName, zi)}
                                              className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple font-bold text-sm tracking-tight transition-all min-h-[100px]"
                                           />
                                        </div>
                                      )
                                    }
                                    return null;
                                  })}
                               </div>
                             ))}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
