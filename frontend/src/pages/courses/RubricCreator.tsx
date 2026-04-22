import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { 
  Plus, 
  Trash2, 
  Save, 
  Layout, 
  ListChecks, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface Criterion {
  name: string;
  description: string;
  max_score: number;
}

export default function RubricCreator() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newRubric, setNewRubric] = useState({
    title: '',
    description: '',
    criteria: [
      { name: '', description: '', max_score: 25 }
    ] as Criterion[]
  });

  const token = useAuthStore((state: any) => state.token);

  useEffect(() => {
    fetchCourseAndRubrics();
  }, [slug]);

  const fetchCourseAndRubrics = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      const rubricsRes = await client.get(`/courses/${courseRes.data.id}/rubrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRubrics(rubricsRes.data);
    } catch (err) {
      console.error('Error fetching rubrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriterion = () => {
    setNewRubric({
      ...newRubric,
      criteria: [...newRubric.criteria, { name: '', description: '', max_score: 25 }]
    });
  };

  const handleRemoveCriterion = (index: number) => {
    setNewRubric({
      ...newRubric,
      criteria: newRubric.criteria.filter((_, i) => i !== index)
    });
  };

  const handleCriterionChange = (index: number, field: keyof Criterion, value: string | number) => {
    const updatedCriteria = [...newRubric.criteria];
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
    setNewRubric({ ...newRubric, criteria: updatedCriteria });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post(`/courses/${course.id}/rubrics`, newRubric, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewRubric({ title: '', description: '', criteria: [{ name: '', description: '', max_score: 25 }] });
      setShowAddForm(false);
      fetchCourseAndRubrics();
    } catch (err) {
      console.error('Error adding rubric:', err);
      notify('Institutional Registry: Failed to register rubric protocol.', 'error');
    }
  };

  const { confirm, notify } = useNotificationStore();

  const handleDeleteSubric = async (id: number) => {
    const confirmed = await confirm({
      title: 'Decommission Grading Schema',
      message: 'Are you sure you want to permanently delete this rubric registry? This action will impact all existing assessments using this schema and cannot be undone.',
      confirmText: 'Purge Schema',
      cancelText: 'Retain Protocol',
      type: 'danger'
    });

    if (!confirmed) return;
    try {
      await client.delete(`/rubrics/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourseAndRubrics();
    } catch (err) {
      console.error('Error deleting rubric:', err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 bg-offwhite min-h-screen">
      <div className="w-10 h-10 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Registries...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-8 transition-all min-h-screen bg-offwhite selection:bg-mylms-purple selection:text-white">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <button 
             onClick={() => navigate(`/courses/${slug}/assessment-manager`)}
             className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-mylms-purple transition-colors"
           >
             <ArrowLeft size={16} />
             Assessment Engine
           </button>
           <h1 className="text-5xl font-black text-text-main tracking-tighter uppercase leading-none">Rubric Registry</h1>
           <p className="text-mylms-purple font-bold uppercase tracking-[0.3em] text-[8px] flex items-center gap-3">
              <ListChecks size={12} />
              Academic Standards Configuration: {course?.title}
           </p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-mylms-purple text-white px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center gap-4"
        >
          {showAddForm ? 'Cancel Operation' : <><Plus size={18} /> New Grading Schema</>}
        </button>
      </header>

      {showAddForm && (
        <div className="mb-16 bg-white border border-border-soft rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-40 h-40 bg-mylms-purple/5 rounded-bl-full"></div>
           
           <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <label className="block text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-4">Protocol Title</label>
                    <input 
                      type="text" 
                      required
                      value={newRubric.title}
                      onChange={e => setNewRubric({...newRubric, title: e.target.value})}
                      className="w-full p-4 bg-offwhite border border-gray-100 rounded-2xl focus:ring-2 focus:ring-mylms-purple/10 focus:border-mylms-purple outline-none font-bold text-sm transition-all"
                      placeholder="e.g. Standard Creative Writing Rubric"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-4">Implementation Context</label>
                    <input 
                      type="text" 
                      value={newRubric.description}
                      onChange={e => setNewRubric({...newRubric, description: e.target.value})}
                      className="w-full p-4 bg-offwhite border border-gray-100 rounded-2xl focus:ring-2 focus:ring-mylms-purple/10 focus:border-mylms-purple outline-none font-bold text-sm transition-all"
                      placeholder="Describe the application of this grading schema..."
                    />
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex justify-between items-center pb-4 border-b border-offwhite">
                    <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.2em]">Criteria Definitions</h3>
                    <button 
                      type="button" 
                      onClick={handleAddCriterion}
                      className="text-[10px] font-black text-mylms-purple uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                       <Plus size={14} /> Append Criterion
                    </button>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    {newRubric.criteria.map((crit, idx) => (
                       <div key={idx} className="p-8 bg-offwhite/50 border border-gray-50 rounded-3xl flex flex-col md:flex-row gap-6 items-start transition-all hover:bg-white hover:border-mylms-purple/20 group/crit">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-mylms-purple font-black text-xs shadow-sm shrink-0 group-hover/crit:scale-110 transition-transform">
                             {idx + 1}
                          </div>
                          
                          <div className="grow grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                             <div className="md:col-span-1">
                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Label</label>
                                <input 
                                  type="text" 
                                  required
                                  value={crit.name}
                                  onChange={e => handleCriterionChange(idx, 'name', e.target.value)}
                                  className="w-full p-3 bg-white border border-gray-100 rounded-xl focus:border-mylms-purple outline-none font-black text-[10px] uppercase tracking-tight"
                                  placeholder="e.g. Grammar"
                                />
                             </div>
                             <div className="md:col-span-2">
                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Requirement Context</label>
                                <input 
                                  type="text" 
                                  value={crit.description}
                                  onChange={e => handleCriterionChange(idx, 'description', e.target.value)}
                                  className="w-full p-3 bg-white border border-gray-100 rounded-xl focus:border-mylms-purple outline-none font-bold text-[10px]"
                                  placeholder="Define proficiency standards..."
                                />
                             </div>
                             <div>
                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Max Stake</label>
                                <input 
                                  type="number" 
                                  min={0}
                                  value={crit.max_score}
                                  onChange={e => handleCriterionChange(idx, 'max_score', parseInt(e.target.value))}
                                  className="w-full p-3 bg-white border border-gray-100 rounded-xl focus:border-mylms-purple outline-none font-black text-blue-900 border-l-4 border-l-blue-900 text-center"
                                />
                             </div>
                          </div>

                          {newRubric.criteria.length > 1 && (
                             <button 
                               type="button" 
                               onClick={() => handleRemoveCriterion(idx)}
                               className="p-3 text-gray-300 hover:text-mylms-rose transition-colors shrink-0"
                             >
                                <Trash2 size={20} />
                             </button>
                          )}
                       </div>
                    ))}
                 </div>
              </div>

              <div className="pt-10 flex justify-end">
                 <button 
                   type="submit" 
                   className="px-16 py-5 bg-text-main text-white font-black rounded-2xl hover:bg-mylms-purple shadow-2xl transition-all uppercase tracking-[0.4em] text-[11px] flex items-center gap-4 group/btn"
                 >
                    <Save size={18} className="group-hover/btn:scale-110 transition-transform" />
                    Archive Schema Protocol
                 </button>
              </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rubrics.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white border border-border-soft rounded-3xl">
             <Layout className="w-12 h-12 text-gray-100 mx-auto mb-6" />
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">No Schemas Registered</p>
          </div>
        ) : (
          rubrics.map(rubric => (
            <div key={rubric.id} className="bg-white border border-border-soft rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 w-2 h-full bg-mylms-purple opacity-20"></div>
               
               <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-offwhite rounded-2xl flex items-center justify-center text-mylms-purple shadow-inner group-hover:scale-110 transition-transform">
                     <ListChecks size={24} />
                  </div>
                  <button 
                    onClick={() => handleDeleteSubric(rubric.id)}
                    className="p-2 text-gray-200 hover:text-mylms-rose transition-colors"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>

               <h3 className="text-[13px] font-black text-text-main uppercase tracking-tighter leading-tight mb-2 group-hover:text-mylms-purple transition-colors">
                  {rubric.title}
               </h3>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose mb-10 opacity-70">
                  {rubric.description || 'Global academic grading standard.'}
               </p>

               <div className="space-y-3 mb-10">
                  {rubric.criteria?.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="flex justify-between items-center text-[10px] font-black text-text-main/60 uppercase tracking-tighter border-b border-offwhite/50 pb-2">
                       <span>{c.name}</span>
                       <span className="text-mylms-rose">{c.max_score} MAX</span>
                    </div>
                  ))}
                  {rubric.criteria?.length > 3 && (
                    <p className="text-[8px] font-black text-gray-300 uppercase italic">+ {rubric.criteria.length - 3} more criteria items...</p>
                  )}
               </div>

               <div className="pt-6 border-t border-offwhite flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Standard</span>
                  </div>
                  <ChevronRight size={16} className="text-mylms-purple group-hover:translate-x-2 transition-all" />
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
