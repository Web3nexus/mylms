import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  BookOpen, 
  CreditCard, 
  Clock, 
  Inbox, 
  Database,
  Activity,
  CheckCircle,
  GraduationCap,
  Layers,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBranding } from '../../hooks/useBranding';
import client from '../../api/client';

export default function AdminOperations() {
  const { token } = useAuthStore();
  const { branding, loading: brandingLoading } = useBranding();
  const headers = { Authorization: `Bearer ${token}` };
  
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    pendingAdmissions: 0,
    activeSessions: 1,
    revenueMtd: 0,
    expectedRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [financeRes, admissionsRes, studentsRes] = await Promise.all([
          client.get('/finance/dashboard', { headers }),
          client.get('/admissions/applications', { headers }),
          client.get('/admin/students', { headers })
        ]);

        setMetrics({
          totalStudents: studentsRes.data.stats?.matriculated || 0, 
          pendingAdmissions: (admissionsRes.data || []).filter((a: any) => a.status === 'pending' || a.status === 'review').length,
          activeSessions: 3, 
          revenueMtd: financeRes.data.metrics?.collected_revenue || 0,
          expectedRevenue: financeRes.data.metrics?.expected_revenue || 0,
        });
      } catch (err) {
        console.error('Error fetching admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, [token]);

  if (loading || brandingLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing MyLMS Data...</p>
      </div>
    );
  }

  const revenueSuccessRate = metrics.expectedRevenue > 0 
    ? (metrics.revenueMtd / metrics.expectedRevenue) * 100 
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Admin Operations Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-10 border-b border-border-soft pb-12">
        <div>
           <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
              <Settings className="opacity-50" size={16} />
              MyLMS Administrative SIS
           </div>
           <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">Admin Operations</h1>
           <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Database size={12} className="text-mylms-rose" />
              MyLMS Security: Auth Systems Override Active
           </p>
        </div>
        
        <div className="flex gap-4">
           <Link to="/admin/academic" className="btn-purple flex items-center gap-3 px-10 py-3.5 shadow-xl">
              <BookOpen size={16} />
              Enrollment & Programs
           </Link>
           <Link to="/admin/admissions" className="btn-minimal flex items-center gap-3 px-10 py-3.5 shadow-sm">
              <Inbox size={16} />
              Admissions Review
           </Link>
        </div>
      </div>

      {/* High Fidelity MyLMS Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {/* Revenue Realization */}
          <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative group overflow-hidden border-t-8 border-t-mylms-purple transition-all hover:border-mylms-purple/40">
             <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all duration-500"></div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Revenue MTD</p>
             <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-text-main font-mono tracking-tighter">${metrics.revenueMtd.toLocaleString()}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-mylms-rose">Verified</span>
             </div>
             <div className="mt-4 flex items-center gap-2">
                <div className="h-1 grow bg-offwhite rounded-full overflow-hidden border border-gray-50 shadow-inner">
                   <div className="h-full bg-mylms-rose transition-all" style={{ width: `${revenueSuccessRate}%` }}></div>
                </div>
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest font-display whitespace-nowrap">{revenueSuccessRate.toFixed(1)}% Realized</span>
             </div>
          </div>
          
          {/* Student Population */}
          <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative group overflow-hidden hover:border-mylms-purple/20 transition-all">
             <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Matriculated Count</p>
             <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-text-main font-mono tracking-tighter">{metrics.totalStudents}</span>
                <span className="text-[9px] font-black text-mylms-purple uppercase tracking-widest opacity-60">Verified Active</span>
             </div>
             <div className="mt-6 flex items-center gap-2 group-hover:gap-4 transition-all">
                <Users size={12} className="text-mylms-rose" />
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">MyLMS Registry</span>
             </div>
          </div>

          {/* Admissions Queue */}
          <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative group overflow-hidden hover:border-mylms-purple/20 transition-all">
             <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-all"></div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Admissions Pending</p>
             <div className="flex items-baseline gap-3 text-mylms-rose">
                <span className="text-3xl font-black font-mono tracking-tighter">{metrics.pendingAdmissions}</span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Actionable</span>
             </div>
             <div className="mt-4 flex items-center gap-2">
                <Clock size={12} className="text-mylms-rose animate-pulse" />
                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest font-display">Cycle Review Active</span>
             </div>
          </div>

          {/* System Performance */}
          <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative group overflow-hidden hover:border-mylms-purple/20 transition-all">
             <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">System Integrity</p>
             <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-text-main font-mono tracking-tighter">98%</span>
                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">Optimal</span>
             </div>
             <div className="mt-6 flex items-center gap-2">
                <Activity size={12} className="text-mylms-purple opacity-40" />
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Real-time Sync Active</span>
             </div>
          </div>
      </div>

      {/* High Fidelity Service Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          <Link to="/admin/pages" className="p-10 bg-white border border-border-soft rounded-2xl shadow-sm hover:border-mylms-rose hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-colors"></div>
             <div className="w-16 h-16 bg-offwhite text-mylms-rose rounded-2xl flex items-center justify-center mb-8 border border-gray-50 group-hover:bg-mylms-rose group-hover:text-white transition-all duration-500 shadow-inner">
                <Layers size={28} />
             </div>
             <h4 className="text-xl font-black text-text-main uppercase tracking-tighter mb-3 leading-none">CMS & Marketing</h4>
             <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-loose">Visual Page Builder & Content Strategy.</p>
          </Link>

          <Link to="/admin/academic" className="p-10 bg-white border border-border-soft rounded-2xl shadow-sm hover:border-mylms-purple hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-colors"></div>
             <div className="w-16 h-16 bg-offwhite text-mylms-purple rounded-2xl flex items-center justify-center mb-8 border border-gray-50 group-hover:bg-mylms-purple group-hover:text-white transition-all duration-500 shadow-inner">
                <BookOpen size={28} />
             </div>
             <h4 className="text-xl font-black text-text-main uppercase tracking-tighter mb-3 leading-none">Enrollment Management</h4>
             <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-loose">Curriculum Control & Session Management.</p>
          </Link>

          <Link to="/admin/staff" className="p-10 bg-white border border-border-soft rounded-2xl shadow-sm hover:border-mylms-purple hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-colors"></div>
             <div className="w-16 h-16 bg-offwhite text-mylms-purple rounded-2xl flex items-center justify-center mb-8 border border-gray-50 group-hover:bg-mylms-purple group-hover:text-white transition-all duration-500 shadow-inner">
                <Users size={28} />
             </div>
             <h4 className="text-xl font-black text-text-main uppercase tracking-tighter mb-3 leading-none">Staff Registry</h4>
             <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-loose">Faculty Hiring & Security Access Management.</p>
          </Link>

          <Link to="/admin/admissions" className="p-10 bg-white border border-border-soft rounded-2xl shadow-sm hover:border-mylms-purple hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-colors"></div>
             <div className="w-16 h-16 bg-offwhite text-mylms-purple rounded-2xl flex items-center justify-center mb-8 border border-gray-50 group-hover:bg-mylms-purple group-hover:text-white transition-all duration-500 shadow-inner">
                <Inbox size={28} />
             </div>
             <h4 className="text-xl font-black text-text-main uppercase tracking-tighter mb-3 leading-none">Admissions</h4>
             <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-loose">Candidate Evaluation & Registry Sync.</p>
          </Link>

          <Link to="/admin/finance" className="p-10 bg-white border border-border-soft rounded-2xl shadow-sm hover:border-mylms-purple hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-colors"></div>
             <div className="w-16 h-16 bg-offwhite text-mylms-purple rounded-2xl flex items-center justify-center mb-8 border border-gray-100 group-hover:bg-mylms-purple group-hover:text-white transition-all duration-500 shadow-inner">
                <CreditCard size={28} />
             </div>
             <h4 className="text-xl font-black text-text-main uppercase tracking-tighter mb-3 leading-none">Bursary Desk</h4>
             <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-loose">Revenue Tracking & Payment Settlement.</p>
          </Link>

          <Link to="/admin/students" className="p-10 bg-white border border-border-soft rounded-2xl shadow-sm hover:border-mylms-purple hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-rose/5 transition-colors"></div>
             <div className="w-16 h-16 bg-offwhite text-mylms-purple rounded-2xl flex items-center justify-center mb-8 border border-gray-100 group-hover:bg-mylms-purple group-hover:text-white transition-all duration-500 shadow-inner">
                <GraduationCap size={28} />
             </div>
             <h4 className="text-xl font-black text-text-main uppercase tracking-tighter mb-3 leading-none">Student Registry</h4>
             <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-loose">Student Directory & Matriculation Info.</p>
          </Link>

          <Link to="/branding" className="p-10 bg-white border border-border-soft rounded-2xl shadow-sm hover:border-mylms-purple hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute top-0 right-0 w-12 h-12 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-colors"></div>
             <div className="w-16 h-16 bg-offwhite text-mylms-purple rounded-2xl flex items-center justify-center mb-8 border border-gray-100 group-hover:bg-mylms-purple group-hover:text-white transition-all duration-500 shadow-inner">
                <Palette size={28} />
             </div>
             <h4 className="text-xl font-black text-text-main uppercase tracking-tighter mb-3 leading-none">Brand Identity</h4>
             <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-loose">Global Aesthetics & Footer Matrix.</p>
          </Link>
      </div>

      <div className="mt-20 p-12 bg-white rounded-3xl border border-border-soft shadow-sm border-t-8 border-t-mylms-purple relative overflow-hidden group transition-all hover:border-mylms-purple/20">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-offwhite rounded-tl-full group-hover:bg-mylms-purple/5 transition-all"></div>
          <div className="max-w-2xl z-10 w-full">
             <h3 className="text-2xl font-black text-text-main mb-4 tracking-tighter uppercase flex items-center gap-4">
                <ShieldCheck size={24} className="text-mylms-rose" />
                Admissions Master Control
             </h3>
             <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.4em] mb-10 opacity-60">Global enrollment status override protocol.</p>
             
             <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex items-center gap-6 bg-offwhite p-6 rounded-2xl border border-border-soft shadow-inner">
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Registry Entry Status</span>
                   <button 
                     onClick={async () => {
                        const newState = !branding?.admissions_enabled;
                        try {
                           await client.patch('/branding', { admissions_enabled: newState }, { headers });
                           window.location.reload(); // Refresh to sync branding state
                        } catch (err) {
                           alert('Control Protocol Failed');
                        }
                     }}
                     className={`relative w-20 h-10 rounded-full transition-all duration-500 shadow-lg ${branding?.admissions_enabled ? 'bg-green-500 ring-4 ring-green-100' : 'bg-mylms-rose ring-4 ring-mylms-rose/10'}`}
                   >
                      <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all duration-500 shadow-md ${branding?.admissions_enabled ? 'left-11' : 'left-1'}`}></div>
                   </button>
                   <span className={`text-[11px] font-black uppercase tracking-widest ${branding?.admissions_enabled ? 'text-green-600' : 'text-mylms-rose'}`}>
                      {branding?.admissions_enabled ? 'Active' : 'Closed'}
                   </span>
                </div>

                <div className="flex items-center gap-6 bg-offwhite p-6 rounded-2xl border border-border-soft shadow-inner grow">
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Next Cycle Start</span>
                   <input 
                     type="date"
                     defaultValue={branding?.admissions_opens_at}
                     onBlur={async (e) => {
                        try {
                           await client.patch('/branding', { admissions_opens_at: e.target.value }, { headers });
                        } catch (err) {
                           console.error(err);
                        }
                     }}
                     className="bg-white border border-border-soft rounded-lg px-4 py-2 font-black text-xs text-mylms-purple shadow-sm uppercase tracking-widest outline-none focus:ring-2 focus:ring-mylms-purple/10"
                   />
                </div>
             </div>
          </div>
          <div className="shrink-0 hidden lg:flex flex-col items-end z-10">
             <span className="text-[9px] font-black text-green-600 uppercase tracking-[0.4em] mb-3 flex items-center gap-3">
                Operational
                <CheckCircle size={14} className="animate-pulse" />
             </span>
             <span className="text-[8px] font-black text-gray-200 uppercase tracking-widest border border-gray-100 px-3 py-1 rounded-lg shadow-inner">Institutional Sync Health</span>
          </div>
      </div>

    </div>
  );
}
