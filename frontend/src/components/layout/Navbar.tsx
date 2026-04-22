import { Link, useLocation } from 'react-router-dom';
import { 
  GraduationCap,
  Mail,
  ShieldCheck,
  Globe,
  ExternalLink,
  Menu,
  X,
  User,
  ArrowRight,
  ChevronDown,
  BookOpen,
  Users,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBranding } from '../../hooks/useBranding';
import NotificationDropdown from '../NotificationDropdown';
import client from '../../api/client';
import { useAppConfig } from '../../hooks/useAppConfig';

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isDashboardRoute: boolean;
}

export default function Navbar({ isMenuOpen, setIsMenuOpen, isDashboardRoute }: NavbarProps) {
  const { appName } = useAppConfig();
  const { branding } = useBranding();
  const { isAuthenticated, user, logout, token } = useAuthStore();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      if (token) await client.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col">
      {/* Pre-Navigation Utility Bar */}
      <div className="bg-gray-100 py-3 px-6 md:px-12 border-b border-border-soft">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-mylms-purple/50">
          <div className="flex items-center gap-8">
            <a href={`mailto:support@${appName.toLowerCase()}.edu`} className="flex items-center gap-2 hover:text-mylms-rose transition-colors">
              <Mail size={12} /> Support@{appName.toLowerCase()}.edu
            </a>
            <a href="https://portal.office.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-mylms-rose transition-colors">
              <Globe size={12} /> Student Email (Office 360)
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            {isAuthenticated ? (
               <div className="flex items-center gap-6">
                <span className="text-mylms-purple/60 truncate max-w-[150px]">Signed in as {user?.name}</span>
                <button onClick={handleLogout} className="text-mylms-rose hover:underline uppercase">Sign Out</button>
               </div>
            ) : (
               <Link to="/login" className="flex items-center gap-2 text-mylms-purple/60 hover:text-mylms-rose transition-colors">
                 <ShieldCheck size={12} /> Sign In
               </Link>
            )}
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ${!isDashboardRoute ? 'bg-white border-b border-border-soft' : 'bg-white border-b border-border-soft'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex justify-between items-center">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-4 group transition-transform hover:scale-[1.02]">
          {branding?.logo_url ? (
             <div className="h-12 overflow-hidden shrink-0 transition-all flex items-center">
                <img src={branding.logo_url} className="h-full w-auto object-contain" alt="Logo" />
             </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mylms-purple flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0 rounded-xl group-hover:rotate-3 transition-transform">
                <GraduationCap size={28} />
              </div>
              <div className="flex flex-col">
                <span className="block text-xl font-serif font-black text-mylms-purple tracking-tight uppercase leading-none">
                  {branding?.institutional_name || 'MyLMS'}
                </span>
                <span className="text-[9px] font-black text-mylms-rose uppercase tracking-[0.3em] mt-1 block opacity-70">
                  {branding?.institutional_motto || 'University Network'}
                </span>
              </div>
            </div>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          <Link to="/courses" className={`text-xs font-bold transition-all ${location.pathname === '/courses' ? 'text-mylms-rose' : 'text-mylms-purple hover:text-mylms-rose'}`}>
            Courses
          </Link>
          <Link to="/admissions" className={`text-xs font-bold transition-all ${location.pathname === '/admissions' ? 'text-mylms-rose' : 'text-mylms-purple hover:text-mylms-rose'}`}>
            Admissions
          </Link>
          <Link to="/scholarships" className={`text-xs font-bold transition-all ${location.pathname === '/scholarships' ? 'text-mylms-rose' : 'text-mylms-purple hover:text-mylms-rose'}`}>
            Scholarships
          </Link>
          <Link to="/experience" className={`text-xs font-bold transition-all ${location.pathname === '/experience' ? 'text-mylms-rose' : 'text-mylms-purple hover:text-mylms-rose'}`}>
            Student Experience
          </Link>
          
          <div className="relative group">
            <span className="text-xs font-bold text-mylms-purple hover:text-mylms-rose cursor-pointer flex items-center gap-1 py-4">
              About <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-white border border-border-soft shadow-2xl rounded-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-[500px] pointer-events-none group-hover:pointer-events-auto">
              {/* Decorative Header */}
              <div className="bg-offwhite p-6 border-b border-border-soft flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-mylms-purple/5 flex items-center justify-center">
                    <Globe className="text-mylms-purple" size={24} />
                 </div>
                 <div>
                    <h3 className="font-serif font-black text-mylms-purple text-lg">Our Institution</h3>
                    <p className="text-text-secondary text-xs">Learn about our mission, governance, and global impact.</p>
                 </div>
              </div>
              
              {/* Mega Menu Grid */}
              <div className="grid grid-cols-2 gap-2 p-4">
                <Link to="/about" className="flex items-start gap-4 p-4 rounded-xl hover:bg-offwhite transition-colors group/link">
                  <div className="text-mylms-rose mt-1 group-hover/link:scale-110 transition-transform"><BookOpen size={18} /></div>
                  <div>
                     <span className="block font-bold text-mylms-purple text-sm mb-1">About Us</span>
                     <span className="text-text-secondary text-xs line-clamp-2">The history and core mission of our educational network.</span>
                  </div>
                </Link>
                <Link to="/about/leadership" className="flex items-start gap-4 p-4 rounded-xl hover:bg-offwhite transition-colors group/link">
                  <div className="text-mylms-rose mt-1 group-hover/link:scale-110 transition-transform"><Users size={18} /></div>
                  <div>
                     <span className="block font-bold text-mylms-purple text-sm mb-1">Leadership</span>
                     <span className="text-text-secondary text-xs line-clamp-2">Meet our board of directors and academic executives.</span>
                  </div>
                </Link>
                <Link to="/about/partners" className="flex items-start gap-4 p-4 rounded-xl hover:bg-offwhite transition-colors group/link">
                  <div className="text-mylms-rose mt-1 group-hover/link:scale-110 transition-transform"><Globe size={18} /></div>
                  <div>
                     <span className="block font-bold text-mylms-purple text-sm mb-1">Global Partners</span>
                     <span className="text-text-secondary text-xs line-clamp-2">Discover the universities and companies we collaborate with.</span>
                  </div>
                </Link>
                <Link to="/about/media" className="flex items-start gap-4 p-4 rounded-xl hover:bg-offwhite transition-colors group/link">
                  <div className="text-mylms-rose mt-1 group-hover/link:scale-110 transition-transform"><Sparkles size={18} /></div>
                  <div>
                     <span className="block font-bold text-mylms-purple text-sm mb-1">Media & Press</span>
                     <span className="text-text-secondary text-xs line-clamp-2">News, press releases, and brand guidelines for journalists.</span>
                  </div>
                </Link>
              </div>

              {/* Mega Menu Footer */}
              <div className="bg-mylms-purple p-4 text-center">
                 <Link to="/contact" className="text-white text-xs font-bold hover:underline flex items-center justify-center gap-2">
                    Contact Admissions Office <ExternalLink size={12} />
                 </Link>
              </div>
            </div>
          </div>
          
          <div className="h-4 w-px bg-border-soft mx-2"></div>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
               <NotificationDropdown />
               <Link 
                 to="/portal" 
                 className="bg-mylms-purple text-white px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[9px] hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
               >
                  <User size={14} /> Portal
               </Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/register" className="bg-mylms-rose text-white px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-xl flex items-center gap-2">
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="lg:hidden p-2 text-mylms-purple hover:bg-offwhite rounded-lg transition-colors"
        >
           {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-24 left-0 w-full bg-white border-b border-border-soft shadow-2xl animate-in slide-in-from-top duration-300 z-50">
          <div className="px-8 py-10 flex flex-col gap-8">
             {['Courses', 'Admissions', 'Scholarships', 'Experience', 'About'].map((item) => (
                <Link 
                  key={item} 
                  to={`/${item.toLowerCase()}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold text-mylms-purple transition-all border-l-4 border-transparent hover:border-mylms-rose pl-4"
                >
                  {item}
                </Link>
             ))}
             
             <div className="pt-8 border-t border-border-soft flex flex-col gap-6">
                <a href={`mailto:support@${appName.toLowerCase()}.edu`} className="flex items-center gap-3 text-sm font-bold text-mylms-purple/60">
                  <Mail size={18} /> Support Registry
                </a>
                <a href="https://portal.office.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-mylms-purple/60">
                  <Globe size={18} /> Student Email
                </a>
             </div>

             <div className="pt-8 border-t border-border-soft flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/portal" className="btn-purple py-4 text-center text-sm">Dashboard Portal</Link>
                    <button onClick={handleLogout} className="text-mylms-rose font-black uppercase text-[10px] tracking-widest py-2">Sign Out System</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-center font-bold text-mylms-purple py-2">Sign In</Link>
                    <Link to="/register" className="bg-mylms-rose text-white py-4 rounded-xl font-black uppercase tracking-widest text-center shadow-xl text-xs">Start Application</Link>
                  </>
                )}
             </div>
          </div>
        </div>
      )}
    </header>
  );
}
