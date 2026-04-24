import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Plus, 
  HelpCircle, 
  Type, 
  CheckCircle2, 
  Settings2,
  Save,
  Trash2,
  MoreVertical
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function QuizBuilder() {
  const { slug } = useParams();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      const res = await client.get(`/courses/${slug}`);
      setCourse(res.data);
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: 'mcq' | 'essay') => {
    const newQ = {
      id: Date.now(),
      type,
      text: '',
      points: 10,
      options: type === 'mcq' ? [{ text: '', isCorrect: false }] : []
    };
    setQuestions([...questions, newQ]);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-offwhite">
      <div className="w-10 h-10 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-12 min-h-screen bg-offwhite">
      <div className="mb-12 flex justify-between items-end border-b border-border-soft pb-12">
        <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
                <HelpCircle className="opacity-50" size={16} />
                Pedagogical Assessment
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter mb-4 uppercase leading-none">Quiz Builder</h1>
            <p className="text-text-secondary text-xs font-black uppercase tracking-widest italic opacity-60">Architecting interactive evaluations for {course?.title}</p>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={() => addQuestion('mcq')}
                className="px-6 py-3 bg-white border-2 border-border-soft rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-mylms-purple transition-all flex items-center gap-2"
            >
                <Plus size={14} /> MCQ
            </button>
            <button 
                onClick={() => addQuestion('essay')}
                className="px-6 py-3 bg-white border-2 border-border-soft rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-mylms-rose transition-all flex items-center gap-2"
            >
                <Plus size={14} /> Essay
            </button>
        </div>
      </div>

      <div className="space-y-8">
          {questions.length === 0 ? (
            <div className="p-24 text-center bg-white rounded-3xl border-2 border-dashed border-border-soft">
                <HelpCircle size={48} className="mx-auto text-gray-100 mb-6" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Initiate the pedagogical framework by adding questions.</p>
            </div>
          ) : (
            questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-8 rounded-3xl border border-border-soft shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xs italic">{idx + 1}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-mylms-purple bg-mylms-purple/5 px-3 py-1 rounded-lg">
                                {q.type === 'mcq' ? 'Multiple Choice' : 'Critical Essay'}
                            </span>
                        </div>
                        <button className="text-gray-300 hover:text-mylms-rose transition-all">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    
                    <textarea 
                        placeholder="Enter the interrogation / question data..."
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-mylms-purple mb-6"
                    />

                    {q.type === 'mcq' && (
                        <div className="space-y-3">
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-4">Response Inventory</p>
                            {[1, 2, 3, 4].map(opt => (
                                <div key={opt} className="flex items-center gap-4 group/opt">
                                    <div className="w-5 h-5 rounded-full border-2 border-border-soft cursor-pointer hover:border-mylms-purple transition-all" />
                                    <input 
                                        type="text" 
                                        placeholder={`Option ${opt} data...`}
                                        className="flex-1 bg-offwhite border border-border-soft rounded-lg px-4 py-2 text-[11px] font-bold outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))
          )}
      </div>

      <div className="mt-12 flex justify-end gap-4 border-t border-border-soft pt-12">
          <button className="px-10 py-4 bg-mylms-purple text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:opacity-90 active:scale-95 transition-all">
              <Save size={18} /> Synchronize Assessment
          </button>
      </div>
    </div>
  );
}
