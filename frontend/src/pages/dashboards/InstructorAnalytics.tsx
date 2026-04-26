import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  Target, 
  ArrowUpRight, 
  UserCheck,
  Zap,
  BarChart3,
  Activity,
  PieChart
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function InstructorAnalytics() {
  const { tab } = useParams();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await client.get('/instructor/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  const analyticsData = data || {
    engagement: { score: 0, trend: '0%', activeUsers: 0, metrics: [] },
    dropoutRisk: { total: 0, students: [] },
    performance: { averageGrade: '-', submissionRate: '0%', topCourse: '-' }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Compiling Analytical Registry...</p>
      </div>
    );
  }

  // Define tab headers based on the active path
  const getHeader = () => {
    switch(tab) {
      case 'performance': return { title: 'Performance Tracking', icon: <Target className="text-mylms-rose" />, sub: 'Academic projections and cohort average stability.' };
      case 'engagement': return { title: 'Engagement Reports', icon: <PieChart className="text-mylms-purple" />, sub: 'Tracking user interaction velocity and resource utilization.' };
      case 'risks': return { title: 'Dropout Risk Analysis', icon: <Activity className="text-red-500" />, sub: 'Retention risk alerts and academic continuity indicators.' };
      default: return { title: 'Instructional Insights', icon: <BarChart3 />, sub: 'Synthesized analytical overview of assigned academic cohorts.' };
    }
  };

  const header = getHeader();

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      <div className="mb-12 border-b border-border-soft pb-12">
        <div className="flex items-center gap-3 mb-4 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px]">
           {header.icon}
           Analytical Registry Hub
        </div>
        <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">{header.title}</h1>
        <p className="text-text-secondary text-xs font-black uppercase tracking-widest">{header.sub}</p>
      </div>

      {(tab === 'performance' || !tab) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-in fade-in duration-500">
           <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm border-l-8 border-l-mylms-rose">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 italic">Historical Cohort performance</p>
              <div className="flex items-baseline gap-4 text-mylms-rose">
                 <span className="text-6xl font-black tracking-tighter italic">{analyticsData.performance.averageGrade}</span>
                 <span className="text-xs font-black uppercase tracking-widest opacity-60 italic">Weighted Aggregate</span>
              </div>
           </div>
           <div className="bg-white p-10 rounded-3xl border border-border-soft shadow-sm border-l-8 border-l-blue-900">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 italic">Submission Velocity Index</p>
              <div className="flex items-baseline gap-4 text-blue-900">
                 <span className="text-6xl font-black tracking-tighter italic">{analyticsData.performance.submissionRate}</span>
                 <span className="text-xs font-black uppercase tracking-widest opacity-60 italic">On-Time Accuracy</span>
              </div>
           </div>
        </div>
      )}

      {(tab === 'engagement' || !tab) && (
        <div className="bg-white rounded-3xl border border-border-soft shadow-sm p-12 mb-12 animate-in slide-in-from-bottom-4 duration-500">
           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-10 text-mylms-purple">
              <Zap size={16} />
              Velocity Trajectory
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-10">
                 {analyticsData.engagement.metrics?.map((metric: any, i: number) => (
                    <div key={i} className="space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-gray-300">{metric.label}</span>
                          <span className="text-text-main">{metric.value}%</span>
                       </div>
                       <div className="h-3 bg-offwhite rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full ${i % 2 === 0 ? 'bg-mylms-purple' : 'bg-mylms-rose'} transition-all duration-1000 ease-out`}
                            style={{ width: `${metric.value}%` }}
                          ></div>
                       </div>
                    </div>
                 ))}
                 {(!analyticsData.engagement.metrics || analyticsData.engagement.metrics.length === 0) && (
                    <div className="p-10 text-center bg-offwhite text-gray-300 font-black uppercase text-[9px] tracking-widest italic rounded-2xl">
                       Awaiting engagement stream synchronization...
                    </div>
                 )}
              </div>
              <div className="p-10 bg-mylms-purple rounded-3xl text-white flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60 tracking-widest">Active User Index</p>
                 <div className="text-5xl font-black tracking-tighter mb-4">{analyticsData.engagement.score}%</div>
                 <p className="text-[9px] font-bold uppercase tracking-widest leading-loose text-white/50">
                    Calculated based on daily participation protocols and resource utilization metrics.
                 </p>
              </div>
           </div>
        </div>
      )}

      {(tab === 'risks' || !tab) && (
        <div className="bg-white rounded-3xl border border-border-soft shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
           <div className="px-10 py-8 border-b border-border-soft bg-mylms-rose text-white flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 italic">
                 <AlertCircle size={16} />
                 Institutional Retention Risks
              </h3>
              <span className="text-[10px] font-black bg-white/20 text-white px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/30 backdrop-blur-sm">
                 {analyticsData.dropoutRisk.total} Students Flagged
              </span>
           </div>
           <div className="divide-y divide-offwhite">
              {analyticsData.dropoutRisk.students.length > 0 ? (
                 analyticsData.dropoutRisk.students.map((student: any, i: number) => (
                    <div key={i} className="p-10 flex items-center justify-between hover:bg-mylms-rose/5 transition-all group">
                       <div className="flex items-center gap-8">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-border-soft flex items-center justify-center text-mylms-rose font-black shadow-sm uppercase italic group-hover:scale-110 transition-transform">
                             {student.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-base font-black text-text-main uppercase tracking-tight">{student.name}</p>
                             <p className="text-[10px] font-bold text-mylms-rose uppercase tracking-widest mt-1 opacity-60 italic">{student.reason}</p>
                          </div>
                       </div>
                       <div className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border ${student.risk === 'High' ? 'bg-mylms-rose text-white shadow-lg shadow-mylms-rose/20' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                          {student.risk} Priority
                       </div>
                    </div>
                 ))
              ) : (
                <div className="p-24 text-center">
                   <UserCheck size={48} className="mx-auto text-green-100 mb-6" />
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Registry Clean: No critical retention risks detected.</p>
                </div>
              )}
           </div>
        </div>
      )}
      
      <div className="h-20" />
    </div>
  );
}
