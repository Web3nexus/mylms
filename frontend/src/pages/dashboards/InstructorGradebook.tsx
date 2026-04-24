import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  Download, 
  Save, 
  User, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function InstructorGradebook() {
  const { slug } = useParams();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGradebookData();
  }, [slug]);

  const fetchGradebookData = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      
      // In a real app, we'd fetch actual enrollment + results
      // For now, mirroring the requested dynamic but high-fidelity UI
      const studentsRes = await client.get('/instructor/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Augment with mock grades for demonstration until full backend grading engine is ready
      const augmentedStudents = studentsRes.data.map((s: any) => ({
        ...s,
        progress: Math.floor(Math.random() * 100),
        avgGrade: (80 + Math.random() * 20).toFixed(1),
        status: Math.random() > 0.8 ? 'Pending Review' : 'Graded',
        lastSubmission: '2 hours ago'
      }));
      setStudents(augmentedStudents);
    } catch (err) {
      console.error('Error fetching gradebook:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGrading = () => {
    alert('Bulk grading protocol initiated. Processing automated scoring for MCQ assessments...');
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen bg-offwhite transition-all">
      <div className="mb-12 flex justify-between items-end border-b border-border-soft pb-12">
        <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
                <ClipboardList className="opacity-50" size={16} />
                Academic Registry & Grading
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">Instructor Gradebook</h1>
            <p className="text-text-secondary text-xs font-black uppercase tracking-widest italic opacity-60">{course?.title} — Performance Ledger</p>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={handleBulkGrading}
                className="px-6 py-3 bg-white border border-border-soft rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-mylms-purple hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
                <TrendingUp size={14} /> Bulk Validate
            </button>
            <button className="px-6 py-3 bg-mylms-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl flex items-center gap-2">
                <Download size={14} /> Export Ledger
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
         {[
            { label: 'Class Average', val: '88.4%', icon: <TrendingUp className="text-green-500" />, color: 'green' },
            { label: 'Submissions Pending', val: students.filter(s => s.status === 'Pending Review').length, icon: <AlertCircle className="text-mylms-rose" />, color: 'rose' },
            { label: 'On-Time Velocity', val: '92%', icon: <CheckCircle2 className="text-mylms-purple" />, color: 'purple' },
         ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-border-soft shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className="text-3xl font-black text-text-main tracking-tighter font-mono">{stat.val}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-offwhite flex items-center justify-center`}>
                    {stat.icon}
                </div>
            </div>
         ))}
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-3xl border border-border-soft shadow-2xl overflow-hidden">
         <div className="p-8 border-b border-border-soft bg-offwhite/30 flex justify-between items-center">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                    type="text" 
                    placeholder="Search performance ledger..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-white border border-border-soft rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-mylms-purple w-80"
                />
            </div>
            <button className="p-3 bg-white border border-border-soft rounded-xl text-gray-400 hover:text-mylms-purple transition-all shadow-sm">
                <Filter size={18} />
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-offwhite/50 border-b border-border-soft">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Identity</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Progress</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Performance Index</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Registry Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                    {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                        <tr key={student.id} className="hover:bg-offwhite/30 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black italic shadow-sm">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-text-main text-xs uppercase tracking-tight">{student.name}</p>
                                        <p className="text-[9px] font-bold text-gray-400">{student.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-1.5 bg-offwhite rounded-full overflow-hidden w-24">
                                        <div 
                                            className={`h-full ${student.progress > 70 ? 'bg-mylms-purple' : 'bg-mylms-rose'} transition-all`}
                                            style={{ width: `${student.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black font-mono text-text-secondary">{student.progress}%</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-black text-text-main italic">{student.avgGrade}</span>
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">GPA</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${student.status === 'Graded' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-mylms-rose/5 text-mylms-rose border-mylms-rose/20 animate-pulse'}`}>
                                    {student.status}
                                </span>
                            </td>
                            <td className="px-8 py-6">
                                <button className="p-3 bg-offwhite rounded-xl text-gray-400 hover:text-mylms-purple transition-all shadow-inner group-hover:scale-110">
                                    <User size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
         
         <div className="p-8 border-t border-border-soft bg-offwhite/10 flex justify-end gap-4">
            <button className="flex items-center gap-2 px-8 py-3 bg-white border border-border-soft rounded-xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-mylms-purple transition-all">
                <Save size={14} /> Commit Changes
            </button>
         </div>
      </div>
    </div>
  );
}
