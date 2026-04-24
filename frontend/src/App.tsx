import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { 
  Library, 
  FileText, 
  CreditCard, 
  FolderSearch,
  PlusCircle,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  LogOut,
  Bell,
  Award,
  ChevronRight,
  User,
  Settings,
  Inbox,
  LayoutDashboard,
  Search,
  Clock,
  HelpCircle,
  ExternalLink,
  Calendar,
  Layers,
  BookOpen,
  Globe,
  ArrowRight,
  Menu,
  X,
  ChevronLeft,
  Terminal,
  Mail,
  Briefcase,
  MessageCircle,
  CheckSquare,
  BarChart3,
  Users,
  Settings2,
  FilePlus,
  UploadCloud,
  Users2,
  PieChart,
  Activity
} from 'lucide-react'

// Auth & API
import { useAuthStore } from './store/authStore'
import client from './api/client'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationDropdown from './components/NotificationDropdown'
import { NotificationProvider } from './components/NotificationProvider'

// Base Pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CourseList from './pages/courses/CourseList'
import PublicVerification from './pages/credentials/PublicVerification'
import VerifyEmail from './pages/VerifyEmail'
import ScholarshipDirectory from './pages/scholarships/ScholarshipDirectory'
import AdmissionApplication from './pages/admissions/AdmissionApplication'
import AdmissionsPage from './pages/admissions/AdmissionsPage'
import AdmissionDashboard from './pages/admissions/AdmissionDashboard'
import AdmissionWizard from './pages/admissions/AdmissionWizard'
import ExperiencePage from './pages/ExperiencePage'
import AboutPage from './pages/AboutPage'

// CMS & Landing
import PublicPage from './pages/PublicPage'
import CMSPageManager from './pages/admin/CMSPageManager'
import LandingEditor from './pages/admin/LandingEditor'
import GuidedPageEditor from './pages/admin/GuidedPageEditor'

// Academic & Instructor
import AcademicManager from './pages/admin/AcademicManager'
import AdmissionsReview from './pages/admin/AdmissionsReview'
import AdmissionRegistryManager from './pages/admin/AdmissionRegistryManager'
import StudentDirectory from './pages/admin/StudentDirectory'
import AdminStaffDirectory from './pages/admin/AdminStaffDirectory'
import InstructorGradebook from './pages/courses/InstructorGradebook'
import CourseCreate from './pages/courses/CourseCreate'
import CurriculumManager from './pages/courses/CurriculumManager'
import LessonViewer from './pages/courses/LessonViewer'
import AssessmentPlayer from './pages/courses/AssessmentPlayer'
import AssessmentCreator from './pages/courses/AssessmentCreator'
import RubricCreator from './pages/courses/RubricCreator'
import StudentTranscript from './pages/student/StudentTranscript'
import StudentBillingPortal from './pages/finance/StudentBillingPortal'
import AdminFinanceDashboard from './pages/finance/AdminFinanceDashboard'
import CourseRegistrationPage from './pages/registration/CourseRegistrationPage'
import CourseCertificate from './pages/credentials/CourseCertificate'
import PaymentSuccess from './pages/finance/PaymentSuccess'
import PaymentFailed from './pages/finance/PaymentFailed'
import AssignmentBuilder from './pages/courses/AssignmentBuilder'
import QuizBuilder from './pages/courses/QuizBuilder'

// New MyLMS Pages
import SelfServiceForms from './pages/student/SelfServiceForms'
import UsefulLinks from './pages/student/UsefulLinks'
import CampusCalendar from './pages/student/CampusCalendar'
import PeerReviewList from './pages/courses/PeerReviewList';
import PeerReviewPlayer from './pages/courses/PeerReviewPlayer';
import ForumList from './pages/student/ForumList';
import TopicViewer from './pages/student/TopicViewer'

// Specialized Dashboards
import StudentPortal from './pages/dashboards/StudentPortal'
import StudentCampus from './pages/dashboards/StudentCampus'
import InstructorDashboard from './pages/dashboards/InstructorRegistry'
import InstructorMessaging from './pages/dashboards/InstructorMessaging'
import InstructorAnnouncements from './pages/dashboards/InstructorAnnouncements'
import AdminOperations from './pages/dashboards/AdminOperations'
import BrandingManager from './pages/admin/BrandingManager'
import CommunicationManager from './pages/admin/CommunicationManager'
import EmailTemplateManager from './pages/admin/EmailTemplateManager'
import EmailAccountManager from './pages/admin/EmailAccountManager'
import CommandCenter from './pages/admin/CommandCenter'
import PaymentSettings from './pages/admin/PaymentSettings'
import AdvisorPortal from './pages/advisors/AdvisorPortal'

// Hooks
import { useBranding } from './hooks/useBranding'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import DashboardHeader from './components/layout/DashboardHeader'
import MobileOptimizationPrompt from './components/MobileOptimizationPrompt'
import InactivityLogout from './components/layout/InactivityLogout'
import { useAppConfig } from './hooks/useAppConfig'
import InstructorAnalytics from './pages/dashboards/InstructorAnalytics'

function Home() {
  return <PublicPage />;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout, token } = useAuthStore()
  const { branding } = useBranding()
  const { appName } = useAppConfig()
  const navigate = useNavigate()
  const location = useLocation()
  const [systemTime, setSystemTime] = useState(new Date())

  const isCampus = location.pathname.startsWith('/campus')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const verifyAuth = async () => {
      // Run only if token exists and not on auth pages
      if (!token || ['/login', '/register', '/office', '/securegate'].includes(location.pathname)) return;
      
      try {
        await client.get('/auth/me');
      } catch (err: any) {
        if (err.response?.status === 401) {
          console.error('Session expired. Logging out.');
          logout();
          navigate('/login');
        }
      }
    };
    
    // Check auth on mount, and then every 5 minutes maximum
    verifyAuth();
  }, [token, logout, navigate]); // Removed location.pathname to solve rate-limit spam业务


  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Dynamic Document Title
  useEffect(() => {
    const institutionName = branding?.institutional_name || appName;
    const cleanPath = location.pathname.split('/').pop() || 'Portal';
    const pageName = cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1).replace('-', ' ');
    
    if (location.pathname === '/') {
       document.title = `${institutionName} | Unified Campus`;
    } else {
       document.title = `${pageName} - ${institutionName}`;
    }
  }, [location.pathname, branding?.institutional_name, appName]);
  
  const handleLogout = async () => {
    try {
      if (token) client.post('/auth/logout')
    } catch (err) {
      console.error(err)
    } finally {
      logout()
      navigate('/login')
    }
  }

  const dashboardRoutes = ['/portal', '/campus', '/admin', '/office', '/billing', '/register-courses', '/transcript', '/apply', '/branding', '/courses/create', '/courses'];
  const isDashboardRoute = isAuthenticated && dashboardRoutes.some(route => location.pathname.startsWith(route));

  // Sidebar link definitions mirroring MyLMS structure
  type NavItem = { name: string; path?: string; icon?: React.ReactNode; isHeader?: boolean };
  let sidebarLinks: NavItem[] = [];
  
  const userRole = user?.role?.toLowerCase();
  
  // SECURITY DEBUG LOGS (Delete after fixing live server)
  useEffect(() => {
    if (isAuthenticated) {
       console.log('🛡️ MyLMS SECURITY DEBUG:', {
         isAuthenticated,
         role: user?.role,
         normalizedRole: userRole,
         pathname: location.pathname
       });
    }
  }, [isAuthenticated, user, userRole, location.pathname]);

  if (userRole === 'student') {
    if (isCampus) {
      sidebarLinks = [
        { name: 'Dashboard', path: '/campus', icon: <LayoutDashboard size={18} /> },
        { name: 'Site Home', path: '/', icon: <Library size={18} /> },
        { name: 'Calendar', path: '/campus/calendar', icon: <Calendar size={18} /> },
      ]
    } else if (user?.student_id) {
      // Approved Students in Portal
      sidebarLinks = [
        { name: 'Home', path: '/portal', icon: <LayoutDashboard size={18} /> },
        { name: 'My Payments', path: '/billing', icon: <CreditCard size={18} /> },
        { name: 'My Courses', path: '/register-courses', icon: <Library size={18} /> },
        { name: 'Transcript', path: '/transcript', icon: <TrendingUp size={18} /> },
        { name: 'Self Service', path: '/portal/forms', icon: <Layers size={18} /> },
        { name: 'Scholarships', path: '/scholarships', icon: <Award size={18} /> },
      ]
    } else {
      // Applicants/Candidates
      sidebarLinks = [
        { name: 'Status Dashboard', path: '/apply/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Admission Wizard', path: '/apply/wizard', icon: <PlusCircle size={18} /> },
        { name: 'Scholarships', path: '/scholarships', icon: <Award size={18} /> },
      ]
    }
  } else if (['admin', 'staff', 'instructor'].includes(userRole || '')) {
    const isAdmin = userRole === 'admin';
    const isInstructor = userRole === 'instructor';
    const permissions = user?.permissions || [];
    
    sidebarLinks = [];

    // Default High-Level Entry
    if (isAdmin || permissions.length > 0) {
      sidebarLinks.push({ name: 'Operations', path: '/admin/portal', icon: <LayoutDashboard size={18} /> });
    }

    // Instructor Default Tools
    if (isInstructor) {
      sidebarLinks.push({ name: 'Faculty Registry', path: '/office/portal', icon: <Briefcase size={18} /> });
      
      // Teaching Tools Section
      sidebarLinks.push({ name: 'Teaching Tools', isHeader: true });
      sidebarLinks.push({ name: 'Course Management', path: '/courses', icon: <Library size={18} /> });
      sidebarLinks.push({ name: 'Curriculum & Media', path: '/courses/create', icon: <UploadCloud size={18} /> });
      sidebarLinks.push({ name: 'Assignment Setup', path: '/courses', icon: <FilePlus size={18} /> });
      sidebarLinks.push({ name: 'Quiz Builder', path: '/courses', icon: <HelpCircle size={18} /> });

      // Grading Section
      sidebarLinks.push({ name: 'Grading System', isHeader: true });
      sidebarLinks.push({ name: 'Gradebook', path: '/office/portal', icon: <CheckSquare size={18} /> });
      sidebarLinks.push({ name: 'Rubrics & Bulk', path: '/office/portal', icon: <Layers size={18} /> });
      sidebarLinks.push({ name: 'Peer Oversight', path: '/office/portal', icon: <Users2 size={18} /> });

      // Communication Section
      sidebarLinks.push({ name: 'Communication', isHeader: true });
      sidebarLinks.push({ name: 'Announcements', path: '/office/announcements', icon: <Mail size={18} /> });
      sidebarLinks.push({ name: 'Student Messaging', path: '/office/communications', icon: <MessageCircle size={18} /> });
      sidebarLinks.push({ name: 'Forum Moderation', path: '/courses', icon: <Inbox size={18} /> });

      // Analytics Section
      sidebarLinks.push({ name: 'Analytics', isHeader: true });
      sidebarLinks.push({ name: 'Performance Tracking', path: '/office/analytics', icon: <PieChart size={18} /> });
      sidebarLinks.push({ name: 'Engagement Reports', path: '/office/analytics', icon: <BarChart3 size={18} /> });
      sidebarLinks.push({ name: 'Dropout Risks', path: '/office/analytics', icon: <Activity size={18} /> });
    }

    // Permission-Based Admin Tools
    if (isAdmin || permissions.includes('academic_enrollment')) {
      sidebarLinks.push({ name: 'Academic Manager', path: '/admin/academic', icon: <Settings size={18} /> });
    }
    if (isAdmin || permissions.includes('admissions_portal')) {
       sidebarLinks.push({ name: 'Admissions Review', path: '/admin/admissions', icon: <Inbox size={18} /> });
    }
    if (isAdmin || permissions.includes('student_registry')) {
       sidebarLinks.push({ name: 'Students', path: '/admin/students', icon: <GraduationCap size={18} /> });
    }
    if (isAdmin || permissions.includes('cms_marketing')) {
       sidebarLinks.push({ name: 'CMS & Content', path: '/admin/pages', icon: <Layers size={18} /> });
    }
    if (isAdmin || permissions.includes('finance_bursary')) {
       sidebarLinks.push({ name: 'Bursar & Finance', path: '/admin/finance', icon: <CreditCard size={18} /> });
       if (isAdmin) {
         sidebarLinks.push({ name: 'Payment Settings', path: '/admin/finance/settings', icon: <ShieldCheck size={18} /> });
       }
    }
    if (isAdmin || permissions.includes('branding_identity')) {
       sidebarLinks.push({ name: 'Branding', path: '/branding', icon: <ShieldCheck size={18} /> });
    }
    
    if (isAdmin) {
      sidebarLinks.push({ name: 'Communications', path: '/admin/communications', icon: <Mail size={18} /> });
      sidebarLinks.push({ name: 'Command Center', path: '/admin/command-center', icon: <Terminal size={18} /> });
    }

    if (userRole === 'advisor') {
      sidebarLinks.push({ name: 'Advisor Desk', path: '/office/advisor', icon: <ShieldCheck size={18} /> });
    }
  }

  return (
    <div 
      className={`min-h-screen flex font-sans text-text-main selection:bg-mylms-rose/20 ${isCampus ? 'theme-campus' : 'theme-portal'} ${!isDashboardRoute ? 'flex-col bg-offwhite' : 'bg-white'}`}
      style={{
        // @ts-ignore
        '--mylms-primary': branding?.primary_color || '#1A1B41',
        '--mylms-secondary': (branding as any)?.secondary_color || '#BA1200'
      }}
    >
      <InactivityLogout />
      <MobileOptimizationPrompt />
      {/* SIDEBAR (Auth Only) */}
      {isDashboardRoute && (
        <>
          {/* Mobile Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-mylms-primary/40 backdrop-blur-sm z-45 lg:hidden animate-in fade-in duration-300"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          <aside className={`
            fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 h-screen shadow-sm shrink-0 border-r border-border-soft bg-white text-text-secondary transition-all duration-300
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          `}>
            <div className="p-8 pb-8 flex items-center justify-between">
              {!isSidebarCollapsed && (
                <Link to="/" className="flex flex-col items-start gap-1 group">
                  {branding?.logo_url ? (
                    <div className="h-10 overflow-hidden shrink-0 transition-all flex items-center">
                      <img src={branding.logo_url} className="h-full w-auto object-contain" alt="Logo" />
                    </div>
                  ) : (
                    <>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg overflow-hidden shadow-inner border border-border-soft transition-all group-hover/card:bg-mylms-purple group-hover/card:text-white ${location.pathname.includes('securegate') ? 'text-mylms-rose' : 'text-mylms-purple'}`}>
                     {branding?.favicon_url ? (
                       <img src={branding.favicon_url} className="w-full h-full object-contain" alt="Identity" />
                     ) : (
                       location.pathname.includes('securegate') ? 'SG' : location.pathname.includes('office') ? 'SO' : 'ML'
                     )}
                  </div>
                      <span className="text-[11px] font-black text-text-main tracking-[0.2em] leading-none mt-3 uppercase">{branding?.institutional_name || 'MyLMS'}</span>
                      <span className="text-[7px] font-black text-mylms-rose uppercase tracking-[0.3em] mt-1 opacity-50">{branding?.institutional_motto || 'University Network'}</span>
                    </>
                  )}
                </Link>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:block p-2 rounded-lg bg-offwhite text-text-secondary hover:text-mylms-purple transition-all">
                  {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden p-2 rounded-lg bg-mylms-rose/10 text-mylms-rose">
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 space-y-1">
              {sidebarLinks.map((link, idx) => (
                link.isHeader ? (
                  !isSidebarCollapsed && (
                    <div key={`header-${idx}`} className="px-4 pt-6 pb-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] border-t border-gray-50 mt-4 first:mt-0 first:pt-0 first:border-0">
                      {link.name}
                    </div>
                  )
                ) : (
                  <Link 
                    key={link.name} 
                    to={link.path || '#'} 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-[0.15em] ${location.pathname === link.path ? 'bg-mylms-purple/5 text-mylms-purple border-l-2 border-mylms-purple' : 'hover:bg-gray-50 text-text-secondary'}`}
                  >
                    <span className={isSidebarCollapsed ? 'mx-auto' : ''}>{link.icon}</span>
                    {!isSidebarCollapsed && <span>{link.name}</span>}
                  </Link>
                )
              ))}
            </div>

            <div className="p-4 mt-auto">
              <div className={`bg-offwhite p-4 rounded-2xl border border-border-soft ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
                {!isSidebarCollapsed ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-mylms-purple flex items-center justify-center text-white font-black text-xs">{user?.name?.charAt(0) || 'U'}</div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-black text-text-main truncate">{user?.name}</p>
                          <p className="text-[8px] font-black text-mylms-rose uppercase tracking-[0.2em]">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full py-2 bg-white text-[9px] font-black uppercase border border-border-soft rounded-lg hover:text-mylms-rose transition-all flex items-center justify-center gap-2">
                      <LogOut size={12} /> Logout
                    </button>
                  </>
                ) : (
                  <button onClick={handleLogout} className="p-2 text-text-secondary hover:text-mylms-rose transition-all"><LogOut size={18} /></button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      {/* NAVBAR (Public Only) */}
      {!isDashboardRoute && (
        <Navbar 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
          isDashboardRoute={isDashboardRoute} 
        />
      )}

      {/* MAIN BODY */}
      <div className={`flex-1 flex flex-col min-w-0 ${isDashboardRoute ? 'h-screen overflow-y-auto bg-offwhite' : ''}`}>
        
        {/* DASHBOARD HEADER */}
        {isDashboardRoute && (
          <DashboardHeader 
            systemTime={systemTime} 
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {/* CONTENT */}
        <main className={`grow ${!isDashboardRoute ? 'animate-in fade-in duration-700' : ''}`}>
          {children}
        </main>

        {/* FOOTER */}
        {!isDashboardRoute && <Footer />}
      </div>
    </div>
  )
}

function App() {
  const { user } = useAuthStore();
  const { branding } = useBranding();

  // Dynamic Favicon Synchronization
  useEffect(() => {
    if (branding?.favicon_url) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.favicon_url;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = branding.favicon_url;
        document.head.appendChild(newLink);
      }
    }
  }, [branding?.favicon_url]);

  return (
    <NotificationProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/office" element={<Login />} />
          <Route path="/securegate" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify" element={<PublicVerification />} />
          
          <Route path="/dashboard" element={<Navigate to="/portal" replace />} />

          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="/portal" element={user?.student_id ? <StudentPortal /> : <Navigate to="/apply/dashboard" replace />} />
            <Route path="/apply/dashboard" element={<AdmissionDashboard />} />
            <Route path="/apply/wizard" element={<AdmissionWizard />} />
            <Route path="/register-courses" element={<CourseRegistrationPage />} />
            <Route path="/transcript" element={<StudentTranscript />} />
            <Route path="/billing" element={<StudentBillingPortal />} />
            <Route path="/portal/forms" element={<SelfServiceForms />} />
            <Route path="/portal/links" element={<UsefulLinks />} />
            <Route path="/scholarships" element={<ScholarshipDirectory />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
          </Route>

          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="/campus" element={<StudentCampus />} />
            <Route path="/campus/calendar" element={<CampusCalendar />} />
            <Route path="/campus/peer-reviews" element={<PeerReviewList />} />
            <Route path="/peer-reviews/:reviewId" element={<PeerReviewPlayer />} />
            <Route path="/courses/:slug/lessons" element={<LessonViewer />} />
            <Route path="/courses/:slug/lessons/:lessonSlug" element={<LessonViewer />} />
            <Route path="/courses/:slug/forums" element={<ForumList />} />
            <Route path="/forums/:forumId/topics/:topicId" element={<TopicViewer />} />
            <Route path="/courses/:slug/certificate" element={<CourseCertificate />} />
            <Route path="/assessments/:assessmentId" element={<AssessmentPlayer />} />
          </Route>
   
          <Route element={<ProtectedRoute roles={['instructor']} />}>
            <Route path="/office/portal" element={<InstructorDashboard />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/office/analytics" element={<InstructorAnalytics />} />
            <Route path="/office/communications" element={<InstructorMessaging />} />
            <Route path="/office/announcements" element={<InstructorAnnouncements />} />
            <Route path="/courses/create" element={<CourseCreate />} />
            <Route path="/courses/:slug/curriculum" element={<CurriculumManager />} />
            <Route path="/courses/:slug/assignments" element={<AssignmentBuilder />} />
            <Route path="/courses/:slug/quizzes" element={<QuizBuilder />} />
            <Route path="/courses/:slug/gradebook" element={<InstructorGradebook />} />
            <Route path="/courses/:slug/rubrics" element={<RubricCreator />} />
            <Route path="/courses/:slug/assessment-manager" element={<AssessmentCreator />} />
            <Route path="/admin/communications" element={<CommunicationManager />} />
          </Route>

          <Route element={<ProtectedRoute roles={['advisor']} />}>
            <Route path="/office/advisor" element={<AdvisorPortal />} />
          </Route>
   
          <Route element={<ProtectedRoute roles={['admin', 'staff']} />}>
            <Route path="/admin/portal" element={<AdminOperations />} />
            <Route path="/admin/academic" element={<AcademicManager />} />
            <Route path="/admin/admissions" element={<AdmissionsReview />} />
            <Route path="/admin/admissions/registry" element={<AdmissionRegistryManager />} />
            <Route path="/admin/students" element={<StudentDirectory />} />
            <Route path="/admin/staff" element={<AdminStaffDirectory />} />
            <Route path="/admin/finance" element={<AdminFinanceDashboard />} />
            <Route path="/admin/finance/settings" element={<PaymentSettings />} />
            <Route path="/admin/pages" element={<CMSPageManager />} />
            <Route path="/admin/cms/edit/:slug" element={<LandingEditor />} />
            <Route path="/admin/cms/guided/:slug" element={<GuidedPageEditor />} />
            <Route path="/branding" element={<BrandingManager />} />
            <Route path="/admin/communications/templates" element={<EmailTemplateManager />} />
            <Route path="/admin/communications/gateways" element={<EmailAccountManager />} />
            <Route path="/admin/command-center" element={<CommandCenter />} />
          </Route>
          
          <Route path="/:slug" element={<PublicPage />} />
          <Route path="/p/:slug" element={<PublicPage />} />
        </Routes>
      </MainLayout>
    </NotificationProvider>
  )
}

export default App
