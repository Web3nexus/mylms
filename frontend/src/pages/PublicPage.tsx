import { useState, useEffect, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Render } from "@puckeditor/core";
import { config } from "../cms/puck.config";
import client from "../api/client";
import { GraduationCap, Package, AlertTriangle } from "lucide-react";
import RegistryError from "../components/layout/RegistryError";

// Error Boundary to catch Puck render crashes and show the actual error
class PuckErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 bg-offwhite">
          <div className="max-w-2xl w-full bg-white border border-mylms-rose/30 rounded-[32px] p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-mylms-rose/10 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-mylms-rose" />
              </div>
              <h2 className="text-lg font-black text-mylms-purple uppercase tracking-tight">Page Render Error</h2>
            </div>
            <p className="text-sm font-medium text-text-secondary mb-4 leading-relaxed">
              The CMS page renderer encountered an error. This is usually caused by a malformed or missing component.
            </p>
            <pre className="bg-offwhite rounded-xl p-4 text-xs text-mylms-rose overflow-auto max-h-48 border border-mylms-rose/20">
              {this.state.error?.message}
              {"\n\n"}
              {this.state.error?.stack?.split("\n").slice(0, 8).join("\n")}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-mylms-purple text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
        // Normalize: ensure every content block has a valid `id` in props
        if (puckData && Array.isArray(puckData.content)) {
          puckData.content = puckData.content.map((item: any, i: number) => ({
            ...item,
            props: {
              ...(item.props || {}),
              id: item.props?.id || `${item.type || 'Block'}-${i}`,
            },
          }));
        }
        setData(puckData && puckData.content ? puckData : null);
      } catch (err: any) {
        console.error("Error fetching CMS page:", err);
        
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
        <PuckErrorBoundary>
          <Render config={config} data={data} />
        </PuckErrorBoundary>
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
