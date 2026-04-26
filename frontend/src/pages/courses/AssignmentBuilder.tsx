import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  FileText, 
  Users, 
  ShieldCheck, 
  Settings,
  Clock,
  Layout,
  BookOpen
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function AssignmentBuilder() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'assignment',
    description: '',
    due_date: '',
    points: 100,
    allow_late: false,
    peer_review: false,
    rubric_id: ''
  });

  const fetchCourseAndAssessments = async () => {
    try {
      const [courseRes, assessRes] = await Promise.all([
        client.get(`/courses/${slug}`),
        client.get(`/courses/${slug}/assessments`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourse(courseRes.data);
      // Filter out quizzes for the Assignment Builder
      setAssessments(assessRes.data.filter((a: any) => a.type !== 'quiz'));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndAssessments();
  }, [slug]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post(`/courses/${course.id}/assessments`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Assignment created successfully.');
      setShowForm(false);
      setFormData({
        title: '',
        type: 'assignment',
        description: '',
        due_date: '',
        points: 100,
        allow_late: false,
        peer_review: false,
        rubric_id: ''
      });
      fetchCourseAndAssessments();
    } catch (err) {
      console.error('Failed to create assessment:', err);
      alert('Failed to create assignment. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen bg-offwhite">
      <div className="mb-12 flex justify-between items-end border-b border-border-soft pb-12">
        <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-rose font-black uppercase tracking-[0.4em] text-[10px]">
                <FileText className="opacity-50" size={16} />
                Assessment Framework
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">Assignment Builder</h1>
            <p className="text-text-secondary text-xs font-black uppercase tracking-widest italic opacity-60">Defining grading protocols for {course?.title}</p>
        </div>
        
        <button 
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-3 bg-mylms-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
        >
            <Plus size={16} /> Create Evaluation
        </button>
      </div>

      {showForm && (
        <div className="mb-12 bg-white p-10 rounded-3xl border border-border-soft shadow-2xl animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-10 text-mylms-purple">
                <Settings size={18} />
                Evaluation Configuration
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Assignment Title</label>
                        <input 
                            type="text" 
                            required
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Mid-term Research Paper"
                            className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Evaluation Type</label>
                        <select 
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                            className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple cursor-pointer"
                        >
                            <option value="assignment">Individual Assignment</option>
                            <option value="peer_review">Peer Review Project</option>
                            <option value="practicum">Clinical Practicum</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Assessment Brief / Rubric Targets</label>
                    <textarea 
                        rows={6}
                        required
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Define learning objectives, requirements, and grading criteria..."
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Submission Deadline</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input 
                                type="datetime-local" 
                                required
                                value={formData.due_date}
                                onChange={e => setFormData({...formData, due_date: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 bg-offwhite border border-border-soft rounded-xl font-bold text-xs"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Total Points (Weight)</label>
                        <input 
                            type="number" 
                            value={formData.points}
                            onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                            className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple shadow-inner"
                        />
                    </div>
                    <div className="flex flex-col justify-end gap-3 pb-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input 
                             type="checkbox" 
                             checked={formData.peer_review}
                             onChange={e => setFormData({...formData, peer_review: e.target.checked})}
                             className="w-5 h-5 rounded border-mylms-purple text-mylms-purple focus:ring-mylms-purple"
                           />
                           <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-mylms-purple transition-all">Enable Peer Oversight</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-border-soft flex justify-end gap-4">
                    <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-text-main transition-all">Discard</button>
                    <button type="submit" className="px-10 py-3 bg-mylms-rose text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all">Publish Assessment</button>
                </div>
            </form>
        </div>
      )}

      {/* Actual List of Assessments */}
      {assessments.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-border-soft">
          <FileText size={48} className="mx-auto text-gray-100 mb-6" />
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No assignments have been created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {assessments.map(assessment => (
              <div key={assessment.id} className="bg-white p-10 rounded-3xl border border-border-soft flex items-center gap-8 shadow-sm hover:shadow-xl transition-all group">
                  <div className={`w-16 h-16 rounded-2xl bg-offwhite flex items-center justify-center ${assessment.type === 'peer_assignment' ? 'text-mylms-rose' : 'text-mylms-purple'}`}>
                      {assessment.type === 'peer_assignment' ? <Users size={32} /> : <FileText size={32} />}
                  </div>
                  <div>
                      <h3 className="font-black uppercase text-xl leading-none mb-2 tracking-tighter group-hover:text-mylms-purple transition-colors">{assessment.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                         {assessment.type.replace('_', ' ')} • {assessment.points} Points 
                         {assessment.due_date && ` • Due ${new Date(assessment.due_date).toLocaleDateString()}`}
                      </p>
                  </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
