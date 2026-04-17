import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Globe, 
  ShieldCheck, 
  X as Twitter, 
  Share2 as Linkedin, 
  ExternalLink as Github,
  Server
} from 'lucide-react';
import { useBranding } from '../../hooks/useBranding';

export default function Footer() {
  const { branding } = useBranding();

  const defaultColumns = [
    { 
      title: "Academic Programs", 
      links: [
        { label: "Master's Degree", url: "/programs/masters" },
        { label: "Bachelor's Degree", url: "/programs/bachelors" },
        { label: "Certificates", url: "/programs/certificates" }
      ] 
    },
    { 
      title: "Admissions", 
      links: [
        { label: "How to Apply", url: "/apply" },
        { label: "Scholarships", url: "/scholarships" },
        { label: "Tuition Model", url: "/tuition" }
      ] 
    },
    { 
      title: "Institutional", 
      links: [
        { label: "Our Mission", url: "/mission" },
        { label: "Accreditation", url: "/accreditation" },
        { label: "Contact Us", url: "/contact" }
      ] 
    }
  ];

  const columns = branding?.footer_columns || defaultColumns;

  return (
    <footer className="bg-mylms-purple pt-32 pb-16 px-6 md:px-24 text-white/50 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mylms-rose/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-24 mb-24">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-5 text-white mb-10 group">
              {branding?.logo_url ? (
                <div className="h-16 overflow-hidden shrink-0 transition-all flex items-center">
                  <img src={branding.logo_url} className="h-full w-auto object-contain" alt="Institutional Logo" />
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 group-hover:bg-white/15 transition-all shadow-2xl">
                    <GraduationCap size={40} className="text-mylms-rose" />
                  </div>
                  <div>
                    <span className="text-3xl font-serif font-black tracking-tight uppercase leading-none block">
                      {branding?.institutional_name || "MyLMS"}
                    </span>
                    <span className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.4em] mt-2 block">
                      {branding?.institutional_motto || "University Network Authority"}
                    </span>
                  </div>
                </div>
              )}
            </Link>
            
            <p className="text-[13px] font-bold leading-relaxed mb-10 text-white/40 uppercase tracking-[0.15em] max-w-md">
              {branding?.footer_text || "An accredited, American, tuition-free, online university dedicated to global access and academic excellence."}
            </p>

            <div className="flex gap-6 mt-12 items-center">
              <a href="#" className="p-3 bg-white/5 rounded-xl text-white/30 hover:text-white hover:bg-mylms-rose transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-3 bg-white/5 rounded-xl text-white/30 hover:text-white hover:bg-mylms-rose transition-all">
                <Linkedin size={18} />
              </a>
              <a href="#" className="p-3 bg-white/5 rounded-xl text-white/30 hover:text-white hover:bg-mylms-rose transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Dynamic Columns */}
          {columns.map((col: any) => (
            <div key={col.title}>
              <h4 className="text-white text-[11px] font-black uppercase tracking-[0.3em] mb-10 pb-4 border-b border-white/5">
                {col.title}
              </h4>
              <ul className="space-y-5">
                {col.links?.map((link: any) => (
                  <li key={link.label}>
                    <Link 
                      to={link.url} 
                      className="text-[12px] font-black text-white/40 hover:text-white hover:translate-x-1 transition-all inline-block uppercase tracking-widest"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            <span>&copy; {new Date().getFullYear()} {branding?.institutional_name || 'MyLMS'} Global</span>
            <span className="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
            <Link to="/privacy" className="hover:text-mylms-rose transition-colors">Privacy Policy</Link>
            <span className="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
            <Link to="/terms" className="hover:text-mylms-rose transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-6 bg-white/5 px-6 py-3 rounded-full border border-white/5 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Registry Online</span>
            </div>
            <div className="w-px h-3 bg-white/10"></div>
            <div className="flex items-center gap-2 text-white/40">
              <Server size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">v2.4.0-STABLE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
