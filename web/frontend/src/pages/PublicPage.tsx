import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Render } from "@puckeditor/core";
import { config } from "../cms/puck.config";
import client from "../api/client";
import { GraduationCap, Package } from "lucide-react";
import RegistryError from "../components/layout/RegistryError";

export default function PublicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setNetworkError(false);
      try {
        const res = await client.get(`/pages/${slug || "home"}`);
        let puckData = res.data.puck_json;
        if (typeof puckData === "string") {
            try { puckData = JSON.parse(puckData); } catch(e) {}
        }
        setData(puckData && puckData.content ? puckData : null);
      } catch (err: any) {
        console.error("Error fetching CMS page:", err);
        
        // Handle Network/CORS/SSL errors specifically
        if (!err.response) {
          setNetworkError(true);
        } else if (err.response.status === 404) {
          if (!slug || slug === "home") {
             setData(null);
          } else {
             navigate("/404");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug, navigate]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-mylms-purple/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <GraduationCap size={32} className="text-mylms-purple animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-mylms-purple">Synchronizing Registry</p>
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Verifying Institutional Protocols...</p>
      </div>
    </div>
  );

  if (networkError) return <RegistryError onRetry={() => window.location.reload()} />;

  return (
    <div className="grow">
      {data ? (
        <Render config={config} data={data} />
      ) : (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 bg-offwhite">
          <div className="max-w-xl w-full bg-white p-12 shadow-2xl border border-border-soft relative overflow-hidden group text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-mylms-purple group-hover:h-2 transition-all duration-500"></div>
            
            <div className="mb-10 mx-auto w-20 h-20 bg-mylms-purple/5 flex items-center justify-center rounded-2xl">
              <Package size={40} className="text-mylms-purple" />
            </div>

            <h1 className="text-4xl font-serif font-black text-mylms-purple mb-4 uppercase tracking-tighter leading-tight">Registry Entry Empty</h1>
            <p className="text-sm font-medium text-text-secondary mb-10 leading-relaxed max-w-sm mx-auto">
              This academic resource has been reserved but not yet finalized for publication. Please check back later.
            </p>

            <button 
              onClick={() => navigate("/admin/pages")}
              className="inline-flex items-center gap-4 bg-mylms-purple text-white px-10 py-5 rounded-lg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#001D4A] transition-all shadow-xl active:scale-95"
            >
              Initialize Registry Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
