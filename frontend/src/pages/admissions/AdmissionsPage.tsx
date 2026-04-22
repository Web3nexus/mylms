import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ChevronRight,
  BookOpen,
  Globe,
  Award,
  Users,
  Clock,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Layers,
  Star,
} from 'lucide-react';
import client from '../../api/client';
import { useBranding } from '../../hooks/useBranding';
import { useAppConfig } from '../../hooks/useAppConfig';

interface Program { id: number; name: string; }
interface Department { id: number; name: string; programs: Program[]; }
interface Faculty { id: number; name: string; departments: Department[]; }

export function AdmissionsInner() {
  const { appName } = useAppConfig();
  const { branding } = useBranding();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [activeFaculty, setActiveFaculty] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/public/faculties')
      .then(res => {
        setFaculties(res.data || []);
        if (res.data?.length > 0) setActiveFaculty(res.data[0].id);
      })
      .catch(() => {
        // Fallback sample data if API is unreachable
        const sample: Faculty[] = [
          { id: 1, name: 'Faculty of Business & Management', departments: [
            { id: 1, name: 'Business Administration', programs: [
              { id: 1, name: 'Bachelor of Business Administration (BBA)' },
              { id: 2, name: 'Master of Business Administration (MBA)' },
              { id: 3, name: 'Certificate in Entrepreneurship' },
            ]},
            { id: 2, name: 'Finance & Economics', programs: [
              { id: 4, name: 'B.Sc. Finance' },
              { id: 5, name: 'M.Sc. Financial Analysis' },
            ]},
          ]},
          { id: 2, name: 'Faculty of Technology & Computing', departments: [
            { id: 3, name: 'Computer Science', programs: [
              { id: 6, name: 'B.Sc. Computer Science' },
              { id: 7, name: 'M.Sc. Artificial Intelligence' },
              { id: 8, name: 'Certificate in Web Development' },
            ]},
            { id: 4, name: 'Information Systems', programs: [
              { id: 9, name: 'B.Sc. Information Systems' },
              { id: 10, name: 'M.Sc. Cybersecurity' },
            ]},
          ]},
          { id: 3, name: 'Faculty of Social Sciences', departments: [
            { id: 5, name: 'Psychology', programs: [
              { id: 11, name: 'B.Sc. Psychology' },
              { id: 12, name: 'M.Sc. Clinical Psychology' },
            ]},
            { id: 6, name: 'International Relations', programs: [
              { id: 13, name: 'B.A. International Relations' },
              { id: 14, name: 'M.A. Diplomacy & Global Affairs' },
            ]},
          ]},
        ];
        setFaculties(sample);
        setActiveFaculty(sample[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const selected = faculties.find(f => f.id === activeFaculty);
  const institutionName = branding?.institutional_name || appName;

  const statsData = branding?.admissions_stats || [
    { value: '40+', label: 'Degree Programs' },
    { value: '100%', label: 'Online & Tuition-Free' },
    { value: '12k+', label: 'Global Students' },
    { value: 'Accredited', label: 'Internationally' },
  ];

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('program') || l.includes('degree')) return <GraduationCap size={24} />;
    if (l.includes('global') || l.includes('online') || l.includes('world')) return <Globe size={24} />;
    if (l.includes('student') || l.includes('user')) return <Users size={24} />;
    if (l.includes('accredit') || l.includes('quality') || l.includes('verify')) return <ShieldCheck size={24} />;
    return <Star size={24} />;
  };

  return (
    <div className="">

      {/* ─── HERO ─── */}
      <section className="relative bg-mylms-purple overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #E90171 0%, transparent 60%), radial-gradient(circle at 20% 80%, #E90171 0%, transparent 50%)' }}
        />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 border-l-[200px] border-l-transparent border-t-[200px] border-t-white" />

        <div className="max-w-7xl mx-auto px-8 md:px-16 py-28 relative z-10 grid md:grid-cols-2 gap-16 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-3 text-white font-black uppercase tracking-[0.4em] text-[10px] mb-10 bg-mylms-rose px-6 py-3 rounded-full shadow-lg">
              <Star size={12} className="text-white" />
              Enrollment Cycle {new Date().getFullYear()}–{new Date().getFullYear() + 1}
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase mb-10 font-serif" style={{ color: '#ffffff' }}>
              {(branding?.admissions_hero_title || 'Enrollment & Admissions').split(' ').map((word, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1 ? <span style={{ color: 'var(--color-mylms-rose)' }}>{word}</span> : word + ' '}
                  {i % 2 === 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-lg mb-14 font-sans">
              {branding?.admissions_hero_desc || `Join thousands of scholars worldwide at ${institutionName}. Apply for fully online, internationally accredited degree programs — tuition-free.`}
            </p>
            <div className="flex flex-wrap gap-6">
              {branding?.admissions_enabled ? (
                <Link to="/register" className="bg-mylms-rose text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-[#A00E26] transition-all shadow-2xl flex items-center gap-3 active:scale-95">
                  Start Application <ArrowRight size={16} />
                </Link>
              ) : (
                <div className="bg-white/10 border border-white/20 text-white/40 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 backdrop-blur-sm cursor-not-allowed">
                  Registry Currently Closed
                </div>
              )}
              <Link to="/login" className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-white/20 transition-all flex items-center gap-3 backdrop-blur-sm">
                Sign In <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {(statsData || []).filter(Boolean).map((s: any, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all group">
                <div className="text-mylms-rose mb-4 group-hover:scale-110 transition-transform">{getIcon(s.label)}</div>
                <p className="text-4xl font-black text-white tracking-tighter mb-2">{s.value}{s.suffix || ''}</p>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROGRAMS ─── */}
      <section className="max-w-7xl mx-auto py-32 px-8 md:px-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-4 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px] mb-8">
            <span className="w-10 h-px bg-mylms-rose" />
            Academic Registry
            <span className="w-10 h-px bg-mylms-rose" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-text-main tracking-tighter leading-[0.9] mb-6 font-serif">
            Available <span className="text-mylms-purple">Programs</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-medium opacity-60 font-sans">
            Explore our full catalog of accredited degree programs across multiple faculties. Each program is 100% online and designed for working professionals.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Faculty Tabs */}
            <div className="lg:col-span-4 space-y-3">
              {faculties.map(faculty => (
                <button
                  key={faculty.id}
                  onClick={() => setActiveFaculty(faculty.id)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all font-bold text-xs flex items-center justify-between group ${
                    activeFaculty === faculty.id
                      ? 'bg-mylms-purple text-white border-mylms-purple shadow-2xl'
                      : 'bg-white text-text-main border-border-soft hover:border-mylms-purple/30'
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <Layers size={16} className={activeFaculty === faculty.id ? 'text-mylms-rose' : 'text-gray-300 group-hover:text-mylms-purple'} />
                    {faculty.name}
                  </span>
                  <ChevronRight size={14} className={activeFaculty === faculty.id ? 'text-mylms-rose' : 'text-gray-300'} />
                </button>
              ))}
            </div>

            {/* Programs Grid */}
            <div className="lg:col-span-8 space-y-8">
              {selected && selected.departments.map(dept => (
                <div key={dept.id} className="bg-white rounded-3xl border border-border-soft overflow-hidden shadow-sm">
                  <div className="bg-offwhite px-8 py-6 border-b border-border-soft flex items-center gap-4">
                    <BookOpen size={16} className="text-mylms-purple" />
                    <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-text-main">{dept.name}</h3>
                    <span className="ml-auto bg-white text-mylms-purple text-[9px] font-black px-4 py-1.5 rounded-full border border-border-soft">
                      {dept.programs.length} programs
                    </span>
                  </div>
                  <div className="divide-y divide-border-soft">
                    {dept.programs.map(prog => (
                      <div key={prog.id} className="flex items-center justify-between px-8 py-5 hover:bg-offwhite transition-all group">
                        <div className="flex items-center gap-4">
                          <CheckCircle size={14} className="text-mylms-rose shrink-0" />
                          <span className="font-bold text-text-main text-sm">{prog.name}</span>
                        </div>
                        {branding?.admissions_enabled && (
                          <Link to="/register" className="text-[9px] font-black uppercase tracking-widest text-mylms-purple opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                            Apply <ArrowRight size={12} />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="bg-white border-y border-border-soft py-32 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-text-main tracking-tighter leading-tight mb-4 font-serif">
              Student <span className="text-mylms-rose">Experience</span>
            </h2>
            <p className="text-text-secondary font-medium opacity-60 font-sans">What makes {institutionName} different</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {(branding?.benefit_cards || [
              { title: '100% Online', desc: 'Study from anywhere in the world, on your schedule. No campus visits required.' },
              { title: 'Internationally Accredited', desc: 'Our degrees are recognized by employers and institutions worldwide.' },
              { title: 'Flexible Pacing', desc: 'Self-paced modules designed for working professionals and busy learners.' },
            ]).filter(Boolean).map((item, i) => (
              <div key={i} className="p-10 rounded-3xl border border-border-soft hover:border-mylms-purple/30 transition-all group hover:shadow-xl">
                <div className="w-16 h-16 bg-mylms-purple/5 text-mylms-purple rounded-2xl flex items-center justify-center mb-8 group-hover:bg-mylms-purple group-hover:text-white transition-all">
                  {getIcon(item.title)}
                </div>
                <h3 className="text-xl font-black text-text-main mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-text-secondary text-sm font-medium leading-relaxed opacity-70 italic">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRE-FOOTER CTA ─── */}
      <section className="bg-offwhite py-24 px-8 md:px-16 -mb-1">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[40px] overflow-hidden border border-mylms-purple/15 shadow-2xl shadow-mylms-purple/10 bg-white/80 backdrop-blur-sm">
            {/* Subtle tinted glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-mylms-purple/5 via-white/0 to-mylms-rose/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-mylms-rose/8 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 p-12 md:p-16 text-center">
              <div className="inline-flex items-center gap-3 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px] mb-8 bg-mylms-rose/8 px-6 py-2.5 rounded-full border border-mylms-rose/20">
                <Star size={12} />
                Enrollment Now Open
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter leading-[0.9] mb-6 font-serif">
                Ready to <span className="text-mylms-rose">Enroll?</span>
              </h2>
              <p className="text-text-secondary font-medium text-base mb-12 max-w-xl mx-auto font-sans opacity-70 leading-relaxed">
                Create your account today and begin your application in minutes. Our admissions team will guide you every step of the way.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                {branding?.admissions_enabled ? (
                  <Link to="/register" className="bg-mylms-purple text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-xl flex items-center gap-3 active:scale-95">
                    Create Account &amp; Apply <ArrowRight size={16} />
                  </Link>
                ) : (
                  <div className="bg-mylms-purple/10 text-mylms-purple/40 border border-mylms-purple/20 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] cursor-not-allowed">
                    Applications Paused
                  </div>
                )}
                <Link to="/courses" className="bg-white text-mylms-purple border border-border-soft px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:border-mylms-purple/30 transition-all flex items-center gap-3 shadow-sm">
                  Browse Courses <BookOpen size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <AdmissionsInner />
    </div>
  );
}
