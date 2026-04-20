import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Rubric {
  id: number;
  title: string;
}

interface Assessment {
  id: number;
  title: string;
  type: 'quiz' | 'assignment' | 'peer_assignment';
  duration_minutes: number;
  is_timed: boolean;
  rubric_id?: number;
}

export default function AssessmentCreator() {
  const { slug } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [allocating, setAllocating] = useState<number | null>(null);
  
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    type: 'quiz' as const,
    is_timed: false,
    duration_minutes: 0,
    rubric_id: '' as string | number
  });

  const [aiParams, setAiParams] = useState({
    topic: '',
    context: '',
    num_questions: 5
  });

  const token = useAuthStore((state: any) => state.token);

  useEffect(() => {
    fetchCourseData();
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      
      const [assessmentsRes, rubricsRes] = await Promise.all([
        client.get(`/courses/${courseRes.data.id}/assessments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        client.get(`/courses/${courseRes.data.id}/rubrics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setAssessments(assessmentsRes.data);
      setRubrics(rubricsRes.data);
    } catch (err) {
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newAssessment,
        rubric_id: newAssessment.rubric_id === '' ? null : newAssessment.rubric_id
      };
      
      await client.post(`/courses/${course.id}/assessments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewAssessment({ 
        title: '', 
        description: '', 
        type: 'quiz', 
        is_timed: false, 
        duration_minutes: 0,
        rubric_id: ''
      });
      setShowAddForm(false);
      fetchCourseData();
    } catch (err) {
      console.error('Error adding assessment:', err);
    }
  };

  const handleAllocatePeers = async (assessmentId: number) => {
     if (!window.confirm("Initialize peer assessment allocation for all current submissions?")) return;
     
     setAllocating(assessmentId);
     try {
        await client.post(`/assessments/${assessmentId}/allocate-peers`, { reviews_per_student: 3 }, {
           headers: { Authorization: `Bearer ${token}` }
        });
        alert("Peer allocation successful.");
     } catch (err: any) {
        alert(err.response?.data?.message || "Allocation failed");
     } finally {
        setAllocating(null);
     }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiGenerating(true);
    try {
      const aiRes = await client.post(`/courses/${course.id}/assessments/generate`, aiParams, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const generatedQuestions = aiRes.data.questions;
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('AI returned no valid questions.');
      }

      const assessmentWrapRes = await client.post(`/courses/${course.id}/assessments`, {
        title: aiParams.topic + ' Assessment',
        description: `MyLMS assessment generated based on context: ${aiParams.topic}`,
        type: 'quiz',
        is_timed: true,
        duration_minutes: aiParams.num_questions * 2,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const newAssessmentId = assessmentWrapRes.data.id;

      await client.post(`/assessments/${newAssessmentId}/questions`, {
        questions: generatedQuestions
      }, { headers: { Authorization: `Bearer ${token}` } });

      setShowAIModal(false);
      setAiParams({ topic: '', context: '', num_questions: 5 });
      fetchCourseData();
      
    } catch (err: any) {
      console.error('Error generating AI assessment:', err);
      alert(err.response?.data?.error || err.message || 'Error generating assessment');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Assessments...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 relative selection:bg-blue-900 selection:text-white">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/courses/${slug}/curriculum`} className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors shadow-sm">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none uppercase">Assessment Control Registry</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">{course?.title}</p>
        </div>
      </div>

      {/* AI Modal Overlay */}
      {showAIModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
              <div className="bg-blue-900 p-8 text-white">
                 <h2 className="text-2xl font-black tracking-tight mb-2 uppercase">Neural Question Engine</h2>
                 <p className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">Autonomous assessment synthesis via instruction context.</p>
              </div>
              <form onSubmit={handleAIGenerate} className="p-8 space-y-6 bg-gray-50/30">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Knowledge Focus</label>
                       <input 
                         type="text" 
                         required
                         value={aiParams.topic}
                         onChange={e => setAiParams({...aiParams, topic: e.target.value})}
                         className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none transition-all font-bold text-sm"
                         placeholder="e.g. Molecular Biology"
                         disabled={aiGenerating}
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Volume</label>
                       <input 
                         type="number" 
                         required
                         min={1} max={20}
                         value={aiParams.num_questions}
                         onChange={e => setAiParams({...aiParams, num_questions: parseInt(e.target.value)})}
                         className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none transition-all font-black text-center text-blue-900"
                         disabled={aiGenerating}
                       />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Instructional Source Materials</label>
                    <textarea 
                      required
                      value={aiParams.context}
                      onChange={e => setAiParams({...aiParams, context: e.target.value})}
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none transition-all font-semibold text-xs h-40 leading-relaxed resize-none"
                      placeholder="Paste teaching materials, transcripts, or key learning objectives here..."
                      disabled={aiGenerating}
                    />
                 </div>
                 
                 <div className="flex gap-4 pt-4 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowAIModal(false)}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-xs uppercase tracking-widest"
                      disabled={aiGenerating}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={aiGenerating}
                      className="px-8 py-3 bg-blue-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-xl text-xs uppercase tracking-[0.2em] disabled:opacity-50 flex items-center gap-3"
                    >
                      {aiGenerating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : 'Execute Synthesis'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden mb-12">
        <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Assessment Ledger</h2>
          <div className="flex gap-4 w-full md:w-auto">
             <button 
               onClick={() => setShowAIModal(true)}
               className="grow md:grow-0 bg-white border border-blue-900/20 text-blue-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm flex items-center justify-center gap-2"
             >
               ✨ AI Synthesis
             </button>
             <button 
               onClick={() => setShowAddForm(!showAddForm)}
               className="grow md:grow-0 bg-blue-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
             >
               {showAddForm ? 'Close Interface' : '+ New Assessment'}
             </button>
          </div>
        </div>

        {showAddForm && (
          <div className="p-10 bg-gray-50/30 border-b border-gray-100">
             <form onSubmit={handleAddAssessment} className="space-y-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Protocol Title</label>
                     <input 
                       type="text" 
                       required
                       value={newAssessment.title}
                       onChange={e => setNewAssessment({...newAssessment, title: e.target.value})}
                       className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none font-bold"
                       placeholder="e.g. Unit 3 Summative Evaluation"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Component Type</label>
                     <select 
                       value={newAssessment.type}
                       onChange={e => setNewAssessment({...newAssessment, type: e.target.value as any})}
                       className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none font-black text-[10px] uppercase tracking-widest"
                     >
                       <option value="quiz">Objective Quiz</option>
                       <option value="assignment">Written Assignment</option>
                       <option value="peer_assignment">Peer Evaluated Assignment</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="flex items-center gap-6 p-6 bg-white border border-gray-100 rounded-2xl">
                      <div className="grow">
                         <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Timed Session</p>
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Limit submission window once initialized</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={newAssessment.is_timed}
                        onChange={e => setNewAssessment({...newAssessment, is_timed: e.target.checked})}
                        className="w-6 h-6 rounded-lg text-blue-900 focus:ring-0 border-gray-200 cursor-pointer"
                      />
                   </div>
                   
                   <div className={`p-6 bg-white border border-gray-100 rounded-2xl transition-opacity ${newAssessment.is_timed ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                      <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 text-center">Duration Registry (MIN)</label>
                      <input 
                        type="number" 
                        min={0}
                        value={newAssessment.duration_minutes}
                        onChange={e => setNewAssessment({...newAssessment, duration_minutes: parseInt(e.target.value)})}
                        className="w-full bg-transparent border-none text-center font-black text-2xl text-blue-900 outline-none p-0"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Grading Rubric Registry</label>
                      <select 
                        value={newAssessment.rubric_id}
                        onChange={e => setNewAssessment({...newAssessment, rubric_id: e.target.value})}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none font-black text-[10px] uppercase tracking-widest"
                      >
                        <option value="">No Rubric Assigned</option>
                        {rubrics.map(r => (
                          <option key={r.id} value={r.id}>{r.title}</option>
                        ))}
                      </select>
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Instructional Parameters</label>
                   <textarea 
                     value={newAssessment.description}
                     onChange={e => setNewAssessment({...newAssessment, description: e.target.value})}
                     className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none resize-none text-[12px] font-semibold leading-relaxed"
                     rows={4}
                     placeholder="Define the scope, expectations, and instructional goals for this assessment session..."
                   />
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-12 py-4 bg-blue-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-2xl text-[11px] uppercase tracking-[0.3em] active:scale-95">
                    Register Assessment Session
                  </button>
                </div>
             </form>
          </div>
        )}

        <div className="divide-y divide-gray-50 bg-white">
          {assessments.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mx-auto mb-6">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Registry Empty</p>
            </div>
          ) : (
            assessments.map((assessment, index) => (
              <div key={assessment.id} className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50/50 transition-colors group border-l-4 border-transparent hover:border-blue-900">
                 <div className="flex items-center gap-8 mb-6 md:mb-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-[11px] font-black text-white shadow-lg">
                       {index + 1}
                    </div>
                    <div>
                       <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-black text-gray-900 tracking-tighter uppercase leading-none">{assessment.title}</h3>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${assessment.type === 'quiz' ? 'bg-blue-50 text-blue-700 border-blue-100' : assessment.type === 'peer_assignment' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                             {assessment.type.replace('_', ' ')}
                          </span>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">
                             {assessment.is_timed ? `Duration: ${assessment.duration_minutes}m` : 'Unrestricted Session'}
                          </span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          {assessment.rubric_id && (
                             <span className="text-[9px] font-bold uppercase text-blue-900/60 tracking-widest">Rubric Attached</span>
                          )}
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {assessment.type === 'peer_assignment' && (
                       <button 
                         onClick={() => handleAllocatePeers(assessment.id)}
                         disabled={allocating === assessment.id}
                         className="grow md:grow-0 px-6 py-2.5 bg-blue-900 text-white font-black rounded-xl hover:bg-black transition-all text-[9px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2"
                       >
                          {allocating === assessment.id ? (
                             <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : 'Allocate Peers'}
                       </button>
                    )}
                    <button className="grow md:grow-0 px-6 py-2.5 bg-white border border-gray-200 text-gray-900 font-black rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-[9px] uppercase tracking-widest shadow-sm">
                       Manage Items
                    </button>
                    <button className="grow md:grow-0 px-6 py-2.5 bg-white border border-rose-100 text-rose-600 font-black rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all text-[9px] uppercase tracking-widest shadow-sm">
                       Delete
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
