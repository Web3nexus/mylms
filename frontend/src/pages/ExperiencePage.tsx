import { useBranding } from '../hooks/useBranding';
import { 
  Globe, 
  Terminal, 
  Database, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ReactNode> = {
  globe: <Globe size={24} />,
  terminal: <Terminal size={24} />,
  database: <Database size={24} />,
  users: <Users size={24} />,
  zap: <Zap size={24} />,
  cpu: <Cpu size={24} />
};

export default function ExperiencePage() {
  const { branding } = useBranding();

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-mylms-purple/5 -z-10"></div>
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-mylms-rose"></span>
            <span className="text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px]">
              The {branding?.institutional_name || 'MyLMS'} Journey
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter mb-10 leading-[0.9] italic">
            {branding?.experience_hero_title.split(' ').map((word, i) => (
              <span key={i}>
                {i % 2 === 1 ? <span className="text-mylms-purple">{word}</span> : word}{' '}
              </span>
            ))}
          </h1>
          
          <p className="max-w-2xl text-text-secondary font-medium text-lg mb-12 opacity-80 leading-relaxed font-sans italic">
            {branding?.experience_hero_desc || 'Experience a world-class digital education environment designed for the modern scholar.'}
          </p>

          <div className="flex gap-6">
            <Link to="/admissions" className="bg-mylms-purple text-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-2xl active:scale-95 flex items-center gap-4 group">
              Begin Enrollment <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {branding?.experience_features.map((feature, idx) => (
              <div key={idx} className="group/card p-10 rounded-[40px] bg-offwhite border border-border-soft hover:border-mylms-purple/20 hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-mylms-purple mb-8 shadow-sm group-hover/card:scale-110 group-hover/card:rotate-6 transition-all">
                  {iconMap[feature.icon] || <Zap size={24} />}
                </div>
                <h3 className="text-2xl font-black text-text-main mb-4 tracking-tighter italic uppercase group-hover/card:text-mylms-purple transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[13px] text-text-secondary font-medium leading-relaxed opacity-70">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase Section */}
      <section className="py-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-mylms-purple/5 -skew-x-12 translate-x-1/2 -z-10"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="flex items-center gap-4 mb-8 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px]">
              <ShieldCheck size={18} /> Digital Infrastructure
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 leading-none italic uppercase text-text-main">
              The <span className="text-mylms-purple">Modern Nexus</span>
            </h2>
            <p className="text-lg text-text-secondary font-medium mb-10 leading-relaxed opacity-80 font-sans italic">
              Our campus is not measured in acres, but in bandwidth and possibilities. We provide every student with the tools to compete on a global stage.
            </p>
            
            <div className="space-y-6 mb-12">
              {[
                'Full Microsoft Office 365 Academic Suite',
                '24/7 Virtual Research Library Access',
                'High-Speed Global Academic CDN',
                'State-of-the-Art Learning Management System'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-sm font-bold text-text-main">
                  <div className="w-6 h-6 rounded-full bg-mylms-purple/10 flex items-center justify-center text-mylms-purple">
                    <Zap size={12} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-white p-4 rounded-[60px] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
               <img 
                 src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070" 
                 className="w-full h-full object-cover rounded-[50px]" 
                 alt="Digital Campus"
               />
               <div className="absolute -bottom-10 -left-10 bg-mylms-purple p-8 rounded-3xl shadow-2xl -rotate-12 animate-pulse">
                  <p className="text-white text-3xl font-black italic tracking-tighter">100%</p>
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-1">Authorized Digital</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 md:px-12 bg-mylms-purple text-white">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 italic uppercase leading-none" style={{ color: '#ffffff' }}>
               Join the <span style={{ color: 'var(--color-mylms-rose)' }}>Global Scholar</span> Registry
            </h2>
            <p className="text-xl text-white/60 font-medium mb-12 font-sans italic">
               Your journey towards academic excellence starts with a single step. Secure your position in the institutional registry today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <Link to="/apply" className="bg-mylms-rose text-white px-12 py-6 rounded-full font-black text-[12px] uppercase tracking-[0.4em] hover:opacity-90 transition-all shadow-2xl flex items-center justify-center gap-4 group/btn active:scale-95">
                  Initial Application <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
