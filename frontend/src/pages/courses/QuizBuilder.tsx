import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, 
  HelpCircle, 
  CheckCircle2, 
  Settings2,
  Save,
  Trash2,
  List,
  Calendar,
  X
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function QuizBuilder() {
  const { slug } = useParams();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  
  // Quizzes list
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  // State for creating a new Quiz
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    type: 'quiz',
    is_timed: false,
    duration_minutes: 30,
    due_date: ''
  });

  // State for editing questions of a specific quiz
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [savingQuestions, setSavingQuestions] = useState(false);

  useEffect(() => {
    fetchCourseAndQuizzes();
  }, [slug]);

  const fetchCourseAndQuizzes = async () => {
    try {
      const [courseRes, assessRes] = await Promise.all([
        client.get(`/courses/${slug}`),
        client.get(`/courses/${slug}/assessments`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourse(courseRes.data);
      // Filter ONLY quizzes
      setQuizzes(assessRes.data.filter((a: any) => a.type === 'quiz'));
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post(`/courses/${course.id}/assessments`, newQuiz, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Quiz created successfully.');
      setShowCreateForm(false);
      setNewQuiz({ ...newQuiz, title: '', description: '' });
      fetchCourseAndQuizzes();
    } catch (err) {
      console.error('Failed to create quiz:', err);
      alert('Failed to create quiz.');
    }
  };

  const openQuestionEditor = (quiz: any) => {
    setActiveQuiz(quiz);
    // If the backend returns questions, we'd load them here.
    // For now, if it's empty, we start with an empty array.
    setQuestions(quiz.questions || []);
  };

  const addQuestion = (type: 'mcq' | 'true_false' | 'essay') => {
    const newQ = {
      id: Date.now().toString(), // temporary ID
      type,
      text: '',
      points: 10,
      options: type === 'mcq' 
        ? [{ text: '', is_correct: false }, { text: '', is_correct: false }] 
        : type === 'true_false'
        ? [{ text: 'True', is_correct: true }, { text: 'False', is_correct: false }]
        : []
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (idx: number) => {
    const updated = [...questions];
    updated.splice(idx, 1);
    setQuestions(updated);
  };

  const updateQuestionText = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].text = text;
    setQuestions(updated);
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = text;
    setQuestions(updated);
  };

  const setCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.forEach((o: any, i: number) => {
      o.is_correct = (i === optIdx);
    });
    setQuestions(updated);
  };

  const addOption = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.push({ text: '', is_correct: false });
    setQuestions(updated);
  };

  const handleSaveQuestions = async () => {
    if (!activeQuiz) return;
    setSavingQuestions(true);
    try {
      await client.post(`/assessments/${activeQuiz.id}/questions`, { questions }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Questions synchronized successfully.');
      setActiveQuiz(null);
      fetchCourseAndQuizzes();
    } catch (err) {
      console.error('Failed to save questions:', err);
      alert('Failed to save questions.');
    } finally {
      setSavingQuestions(false);
    }
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
        
        {!activeQuiz && (
          <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-8 py-3 bg-mylms-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
          >
              <Plus size={16} /> Create Quiz
          </button>
        )}
      </div>

      {showCreateForm && !activeQuiz && (
        <div className="mb-12 bg-white p-10 rounded-3xl border border-border-soft shadow-2xl animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-10 text-mylms-purple">
                <Settings2 size={18} />
                Quiz Configuration
            </h3>
            
            <form onSubmit={handleCreateQuiz} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Quiz Title</label>
                        <input 
                            type="text" 
                            required
                            value={newQuiz.title}
                            onChange={e => setNewQuiz({...newQuiz, title: e.target.value})}
                            placeholder="e.g. Chapter 1 Quiz"
                            className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Duration (Minutes)</label>
                        <input 
                            type="number" 
                            required
                            value={newQuiz.duration_minutes}
                            onChange={e => setNewQuiz({...newQuiz, duration_minutes: parseInt(e.target.value)})}
                            className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple shadow-inner"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Instructions</label>
                    <textarea 
                        rows={4}
                        value={newQuiz.description}
                        onChange={e => setNewQuiz({...newQuiz, description: e.target.value})}
                        placeholder="Instructions for students..."
                        className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-mylms-purple shadow-inner"
                    />
                </div>

                <div className="pt-6 border-t border-border-soft flex justify-end gap-4">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-text-main transition-all">Cancel</button>
                    <button type="submit" className="px-10 py-3 bg-mylms-rose text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all">Save Quiz Settings</button>
                </div>
            </form>
        </div>
      )}

      {activeQuiz ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl border border-border-soft shadow-sm">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-mylms-purple">{activeQuiz.title}</h2>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-1">Question Editor</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setActiveQuiz(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
              <button 
                  onClick={() => addQuestion('mcq')}
                  className="px-6 py-3 bg-white border-2 border-border-soft rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-mylms-purple transition-all flex items-center gap-2"
              >
                  <Plus size={14} /> Add MCQ
              </button>
              <button 
                  onClick={() => addQuestion('true_false')}
                  className="px-6 py-3 bg-white border-2 border-border-soft rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-mylms-purple transition-all flex items-center gap-2"
              >
                  <Plus size={14} /> Add True/False
              </button>
          </div>

          <div className="space-y-8">
              {questions.length === 0 ? (
                <div className="p-24 text-center bg-white rounded-3xl border-2 border-dashed border-border-soft">
                    <List size={48} className="mx-auto text-gray-100 mb-6" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No questions added yet. Click above to start.</p>
                </div>
              ) : (
                questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-8 rounded-3xl border border-border-soft shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xs italic">{idx + 1}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-mylms-purple bg-mylms-purple/5 px-3 py-1 rounded-lg">
                                    {q.type === 'mcq' ? 'Multiple Choice' : q.type === 'true_false' ? 'True / False' : 'Essay'}
                                </span>
                            </div>
                            <button onClick={() => removeQuestion(idx)} className="text-gray-300 hover:text-mylms-rose transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        
                        <textarea 
                            value={q.text}
                            onChange={(e) => updateQuestionText(idx, e.target.value)}
                            placeholder="Enter the question text..."
                            className="w-full p-4 bg-offwhite border border-border-soft rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-mylms-purple mb-6"
                        />

                        {q.type === 'mcq' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-4">
                                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Response Inventory</p>
                                  <button onClick={() => addOption(idx)} className="text-[9px] font-black uppercase text-mylms-purple hover:underline">+ Add Option</button>
                                </div>
                                {q.options.map((opt: any, optIdx: number) => (
                                    <div key={optIdx} className="flex items-center gap-4 group/opt">
                                        <button 
                                          onClick={() => setCorrectOption(idx, optIdx)}
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${opt.is_correct ? 'border-green-500 bg-green-500 text-white' : 'border-border-soft hover:border-mylms-purple'}`}
                                        >
                                          {opt.is_correct && <CheckCircle2 size={12} />}
                                        </button>
                                        <input 
                                            type="text" 
                                            value={opt.text}
                                            onChange={(e) => updateOptionText(idx, optIdx, e.target.value)}
                                            placeholder={`Option ${optIdx + 1}...`}
                                            className="flex-1 bg-offwhite border border-border-soft rounded-lg px-4 py-2 text-[11px] font-bold outline-none focus:border-mylms-purple"
                                        />
                                    </div>
                                ))}
                                <p className="text-[8px] text-gray-400 italic mt-2">Click the circle to mark the correct answer.</p>
                            </div>
                        )}

                        {q.type === 'true_false' && (
                            <div className="space-y-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-4">Select Correct Answer</p>
                                <div className="flex gap-4">
                                  {q.options.map((opt: any, optIdx: number) => (
                                      <button 
                                        key={optIdx}
                                        onClick={() => setCorrectOption(idx, optIdx)}
                                        className={`px-6 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${opt.is_correct ? 'border-green-500 bg-green-50 text-green-700' : 'border-border-soft text-gray-400 hover:border-mylms-purple'}`}
                                      >
                                        {opt.text}
                                      </button>
                                  ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))
              )}
          </div>

          <div className="mt-12 flex justify-end gap-4 border-t border-border-soft pt-12">
              <button 
                onClick={handleSaveQuestions}
                disabled={savingQuestions}
                className="px-10 py-4 bg-mylms-purple text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                  <Save size={18} /> {savingQuestions ? 'Synchronizing...' : 'Synchronize Assessment Questions'}
              </button>
          </div>
        </div>
      ) : (
        /* List of Quizzes */
        <>
          {quizzes.length === 0 && !showCreateForm ? (
            <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-border-soft">
              <HelpCircle size={48} className="mx-auto text-gray-100 mb-6" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No quizzes have been created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="bg-white p-8 rounded-3xl border border-border-soft flex justify-between items-center shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-offwhite flex items-center justify-center text-mylms-purple">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-black uppercase text-xl leading-none mb-2 tracking-tighter group-hover:text-mylms-purple transition-colors">{quiz.title}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              {quiz.duration_minutes} Minutes
                            </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => openQuestionEditor(quiz)}
                        className="px-6 py-2 bg-offwhite text-mylms-purple rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-mylms-purple hover:text-white transition-all"
                      >
                        Edit Questions
                      </button>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
