import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { config } from "../../cms/puck.config";
import client from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";

export default function LandingEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state: any) => state.token);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageId, setPageId] = useState<number | null>(null);
  const { notify } = useNotificationStore();

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await client.get(`/admin/pages/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const puckData = res.data.puck_json;
        // Ensure the data structure is exactly what Puck expects to prevent white-screens
        setData(puckData && typeof puckData === 'object' && puckData.content ? puckData : { content: [], root: { props: { title: res.data?.title } } });
        setPageId(res.data.id);
      } catch (err) {
        console.error("Error fetching CMS page:", err);
        notify("The Requested Page Protocol could not be synchronized.", "error");
        navigate('/admin/pages');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  const handleSave = async (newData: any) => {
    if (!pageId) return;
    setSaving(true);
    try {
      await client.patch(`/admin/pages/${pageId}`, {
        puck_json: newData,
        is_published: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify("Institutional Registry: Content synchronized successfully.", "success");
    } catch (err) {
      console.error("Save failure:", err);
      notify("Failed to synchronize layout with the central registry.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <Loader2 className="w-10 h-10 text-mylms-purple animate-spin" />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-offwhite"
      style={{ height: '100dvh' }}
    >
      {/* Editor Header */}
      <header className="bg-white border-b border-border-soft px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-text-main transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-text-main leading-none">Visual Editor</h1>
            <p className="text-[10px] font-bold text-mylms-rose uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-ping"></span>
              /{slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {saving && <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Saving...</span>}
        </div>
      </header>

      {/* Puck Editor — fills all remaining height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Puck
          config={config}
          data={data}
          onPublish={handleSave}
        />
      </div>
    </div>
  );
}
