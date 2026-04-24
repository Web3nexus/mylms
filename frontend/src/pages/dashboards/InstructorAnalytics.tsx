import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  UserCheck,
  Zap,
  BarChart3
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function InstructorAnalytics() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Data fetched from the backend /instructor/stats endpoint
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
    engagement: { score: 0, trend: '0%', activeUsers: 0 },
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

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      <div className="mb-12 border-b border-border-soft pb-12">
        <div className="flex items-center gap-3 mb-4 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px]">
           <BarChart3 className="opacity-50" size={16} />
           Performance & Analytics Hub
        </div>
        <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">Instructional Insights</h1>
        <p className="text-text-secondary text-xs font-black uppercase tracking-widest">Tracking engagement, progress, and historical stability across active cohorts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Engagement Overview */}
          <div className="bg-white p-8 rounded-3xl border border-border-soft shadow-sm relative group overflow-hidden border-l-8 border-l-mylms-purple">
              <div className="flex justify-between items-start mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-mylms-purple/5 flex items-center justify-center text-mylms-purple">
                    <Zap size={24} />
                 </div>
                 <div className="flex items-center gap-1 text-green-600 font-black text-[10px] bg-green-50 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={12} /> {analyticsData.engagement.trend}
                 </div>
              </div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Engagement Index</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-text-main tracking-tighter">{analyticsData.engagement.score}%</span>
                 <span className="text-[9px] font-black text-mylms-purple uppercase tracking-widest opacity-60">Verified</span>
              </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white p-8 rounded-3xl border border-border-soft shadow-sm relative group overflow-hidden border-l-8 border-l-mylms-rose">
              <div className="flex justify-between items-start mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-mylms-rose/5 flex items-center justify-center text-mylms-rose">
                    <Target size={24} />
                 </div>
              </div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Academic Projection</p>
              <div className="flex items-baseline gap-2 text-mylms-rose">
                 <span className="text-5xl font-black tracking-tighter italic">{analyticsData.performance.averageGrade}</span>
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Cohort Average</span>
              </div>
          </div>

          {/* Enrollment Vitality */}
          <div className="bg-white p-8 rounded-3xl border border-border-soft shadow-sm relative group overflow-hidden border-l-8 border-l-blue-900">
              <div className="flex justify-between items-start mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-900">
                    <Users size={24} />
                 </div>
              </div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Submission Velocity</p>
              <div className="flex items-baseline gap-2 text-blue-900">
                 <span className="text-5xl font-black tracking-tighter">{analyticsData.performance.submissionRate}</span>
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-60">On-Time Index</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Dropout Risk Indicators */}
          <div className="bg-white rounded-3xl border border-border-soft shadow-sm overflow-hidden">
             <div className="px-10 py-8 border-b border-border-soft bg-offwhite flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <AlertCircle size={16} className="text-mylms-rose" />
                   Retention Risk Alert
                </h3>
                <span className="text-[9px] font-black bg-mylms-rose text-white px-3 py-1 rounded-full uppercase tracking-widest">
                   {analyticsData.dropoutRisk.total} Flagged
                </span>
             </div>
             <div className="divide-y divide-offwhite">
                {analyticsData.dropoutRisk.students.map((student, i) => (
                   <div key={i} className="p-8 flex items-center justify-between hover:bg-offwhite/50 transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-xl bg-white border border-border-soft flex items-center justify-center text-mylms-purple font-black shadow-sm uppercase italic">
                            {student.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-black text-text-main uppercase">{student.name}</p>
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 italic">{student.reason}</p>
                         </div>
                      </div>
                      <div className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${student.risk === 'High' ? 'bg-mylms-rose/5 text-mylms-rose border-mylms-rose/20' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                         {student.risk} Risk
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Historical Trends */}
          <div className="bg-white rounded-3xl border border-border-soft shadow-sm p-10">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-10">
                 <TrendingUp size={16} className="text-mylms-purple" />
                 Engagement Trajectory
              </h3>
              
              <div className="space-y-8">
                 {[
                   { label: 'Platform Usage', value: 78, color: 'bg-mylms-purple' },
                   { label: 'Resource Downloads', value: 64, color: 'bg-mylms-rose' },
                   { label: 'Forum Interactions', value: 42, color: 'bg-blue-900' }
                 ].map((metric, i) => (
                   <div key={i} className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <span className="text-gray-300">{metric.label}</span>
                         <span className="text-text-main">{metric.value}%</span>
                      </div>
                      <div className="h-2 bg-offwhite rounded-full overflow-hidden shadow-inner">
                         <div 
                           className={`h-full ${metric.color} transition-all duration-1000 ease-out`}
                           style={{ width: `${metric.value}%` }}
                         ></div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-6 bg-mylms-purple rounded-2xl flex items-center gap-6">
                 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <UserCheck size={24} />
                 </div>
                 <div>
                    <p className="text-white text-xs font-black uppercase tracking-widest">Peer Review Velocity</p>
                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mt-1">Status: Operational Stability</p>
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
}
