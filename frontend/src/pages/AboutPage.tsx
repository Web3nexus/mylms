import { useBranding } from '../hooks/useBranding';
import { 
  ShieldCheck, 
  MapPin, 
  GraduationCap, 
  ArrowRight,
  Award,
  Globe,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const { branding } = useBranding();

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-mylms-rose"></span>
            <span className="text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px]">
               Institutional Profile
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter mb-10 leading-[0.9] italic">
            {branding?.about_hero_title.split(' ').map((word, i) => (
              <span key={i}>
                {i % 2 === 1 ? <span className="text-mylms-purple">{word}</span> : word}{' '}
              </span>
            ))}
          </h1>
          
          <p className="max-w-2xl text-text-secondary font-medium text-lg mb-12 opacity-80 leading-relaxed font-sans italic">
            {branding?.about_hero_desc || 'Founded on the principle of universal access, we are redefining what it means to be a global university.'}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 px-6 md:px-12 bg-offwhite">
        <div className="max-w-7xl mx-auto">
           <div className="bg-white p-12 md:p-20 rounded-[60px] shadow-2xl border border-border-soft relative overflow-hidden group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-mylms-rose"></div>
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                 <ShieldCheck size={48} className="text-mylms-rose mb-10 group-hover:rotate-12 transition-transform duration-500" />
                 <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-mylms-purple mb-8">Authoritative Mission</h2>
                 <p className="text-base md:text-lg font-medium text-text-secondary leading-relaxed italic opacity-80 max-w-2xl">
                    {branding?.about_mission || "Our mission is to provide high-quality, internationally accredited higher education to every qualified student in the world — regardless of constraints."}
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Core Values / History Grid */}
      <section className="py-32 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <div className="flex items-center gap-4 mb-8 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px]">
                    <Globe size={18} /> Global Authority
                 </div>
                 <h2 className="text-5xl font-black text-text-main tracking-tighter mb-8 italic uppercase leading-none">
                    Institutional <span className="text-mylms-purple">Heritage</span>
                 </h2>
                 <p className="text-lg text-text-secondary font-medium mb-8 leading-relaxed opacity-70 font-sans italic">
                    {branding?.about_history || "Established in the digital era, MyLMS has grown from a visionary project into a global academic authority, serving thousands of students across every continent. We are built on the foundations of innovation, accessibility, and academic excellence."}
                 </p>
                 
                 <div className="grid grid-cols-2 gap-8 pt-8">
                    {[
                      { icon: <MapPin size={20} />, label: 'Global Faculty', val: '120+' },
                      { icon: <GraduationCap size={20} />, label: 'Accreditations', val: 'Gold Standard' },
                      { icon: <Award size={20} />, label: 'Student Success', val: '98%' },
                      { icon: <BookOpen size={20} />, label: 'Courses Offered', val: '400+' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-offwhite p-6 rounded-3xl border border-border-soft">
                        <div className="text-mylms-rose mb-3">{stat.icon}</div>
                        <p className="text-2xl font-black text-text-main tracking-tighter leading-none mb-1">{stat.val}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="relative">
                 <div className="aspect-[4/5] bg-offwhite rounded-[60px] overflow-hidden shadow-2xl relative hover:scale-[1.02] transition-all duration-700">
                    <img 
                      src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070" 
                      className="w-full h-full object-cover" 
                      alt="University Heritage"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mylms-purple/40 to-transparent"></div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[40px] shadow-2xl border border-border-soft hidden md:block">
                    <p className="text-sm font-black text-mylms-purple uppercase tracking-[0.2em] mb-2 leading-none">Accredited Member</p>
                    <p className="text-text-secondary text-xs opacity-60">Global Education Commission</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-32 px-6 md:px-12 bg-offwhite overflow-hidden relative">
        <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-transparent via-mylms-rose/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center">
           <h2 className="text-5xl font-black text-text-main tracking-tighter mb-20 italic uppercase leading-none">
              {branding?.about_leadership_title || 'Institutional Leadership'}
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { name: 'Dr. Alistair Thorne', role: 'Chancellor of Academic Affairs', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974' },
                { name: 'Sarah Montgomery', role: 'Director of Global Enrollment', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976' },
                { name: 'Dr. Elena Rossi', role: 'Dean of Information Systems', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961' }
              ].map((member, i) => (
                <div key={i} className="group/member text-center">
                  <div className="aspect-square rounded-[50px] overflow-hidden mb-8 shadow-xl border-4 border-white group-hover/member:border-mylms-rose/20 transition-all duration-500">
                    <img src={member.img} className="w-full h-full object-cover group-hover/member:scale-105 transition-all duration-700" alt={member.name} />
                  </div>
                  <h4 className="text-xl font-black text-text-main tracking-tight uppercase italic mb-1 group-hover/member:text-mylms-purple transition-colors">{member.name}</h4>
                  <p className="text-[10px] font-black text-mylms-rose uppercase tracking-widest">{member.role}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 md:px-12 bg-white">
         <div className="max-w-5xl mx-auto bg-mylms-purple p-12 md:p-24 rounded-[60px] shadow-2xl text-center relative overflow-hidden group">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 italic uppercase leading-none" style={{ color: '#ffffff' }}>
               Join the <span style={{ color: 'var(--color-mylms-rose)' }}>Future</span> of Learning
            </h2>
            <div className="flex justify-center">
               <Link to="/courses" className="bg-white text-mylms-purple px-12 py-6 rounded-full font-black text-[12px] uppercase tracking-[0.4em] hover:bg-mylms-rose hover:text-white transition-all shadow-xl flex items-center gap-4 group/btn">
                  Explore Catalog <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
