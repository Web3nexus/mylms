import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Assessment {
  id: number;
  title: string;
  time_limit_minutes: number;
}

export default function AssessmentCreator() {
  const { slug } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [assessmentzes, setAssessmentzes] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    time_limit_minutes: 30,
  });

  const [aiParams, setAiParams] = useState({
    topic: '',
    context: '',
    num_questions: 5
  });

  const token = useAuthStore((state: any) => state.token);

  useEffect(() => {
    fetchCourseAndAssessmentzes();
  }, [slug]);

  const fetchCourseAndAssessmentzes = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      const assessmentzesRes = await client.get(`/courses/${courseRes.data.id}/assessmentzes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessmentzes(assessmentzesRes.data);
    } catch (err) {
      console.error('Error fetching assessmentzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post(`/courses/${course.id}/assessmentzes`, newAssessment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewAssessment({ title: '', description: '', time_limit_minutes: 30 });
      setShowAddForm(false);
      fetchCourseAndAssessmentzes();
    } catch (err) {
      console.error('Error adding assessment:', err);
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiGenerating(true);
    try {
      const aiRes = await client.post(`/courses/${course.id}/assessmentzes/generate`, aiParams, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const generatedQuestions = aiRes.data.questions;
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('AI returned no valid questions.');
      }

      const assessmentWrapRes = await client.post(`/courses/${course.id}/assessmentzes`, {
        title: aiParams.topic + ' Assessment',
        description: `MyLMS assessment generated based on context: ${aiParams.topic}`,
        time_limit_minutes: aiParams.num_questions * 2,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const newAssessmentId = assessmentWrapRes.data.id;

      await client.post(`/assessmentzes/${newAssessmentId}/questions`, {
        questions: generatedQuestions
      }, { headers: { Authorization: `Bearer ${token}` } });

      setShowAIModal(false);
      setAiParams({ topic: '', context: '', num_questions: 5 });
      fetchCourseAndAssessmentzes();
      
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
    <div className="max-w-5xl mx-auto py-10 px-6 relative">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/courses/${slug}/curriculum`} className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors shadow-sm">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-none">Assessment Manager</h1>
          <p className="text-gray-500 text-sm mt-1">{course?.title}</p>
        </div>
      </div>

      {/* AI Modal Overlay */}
      {showAIModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded border border-gray-200 w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="bg-blue-900 p-8 text-white border-b border-blue-800">
                 <h2 className="text-2xl font-bold tracking-tight mb-2">Neural Question Generator</h2>
                 <p className="text-sm font-medium text-blue-200">Automatically synthesize assessment items from course transcripts or reference materials.</p>
              </div>
              <form onSubmit={handleAIGenerate} className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assessment Focus / Topic</label>
                      <input 
                        type="text" 
                        required
                        value={aiParams.topic}
                        onChange={e => setAiParams({...aiParams, topic: e.target.value})}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors font-semibold"
                        placeholder="e.g. Statistical Inference"
                        disabled={aiGenerating}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Item Count</label>
                      <input 
                        type="number" 
                        required
                        min={1} max={20}
                        value={aiParams.num_questions}
                        onChange={e => setAiParams({...aiParams, num_questions: parseInt(e.target.value)})}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors font-bold text-center text-blue-900"
                        disabled={aiGenerating}
                      />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Syllabus Context / Reference Text</label>
                    <textarea 
                      required
                      value={aiParams.context}
                      onChange={e => setAiParams({...aiParams, context: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors font-mono text-xs h-40 leading-relaxed"
                      placeholder="Paste teaching materials, transcripts, or key learning objectives here..."
                      disabled={aiGenerating}
                    />
                 </div>
                 
                 <div className="flex gap-3 pt-4 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowAIModal(false)}
                      className="px-6 py-2 bg-white border border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-50 transition-colors text-xs uppercase"
                      disabled={aiGenerating}
                    >
                      Close
                    </button>
                    <button 
                      type="submit" 
                      disabled={aiGenerating}
                      className="px-8 py-2 bg-blue-900 text-white font-bold rounded hover:bg-blue-800 transition-all shadow-sm text-xs uppercase disabled:opacity-50 flex items-center gap-3"
                    >
                      {aiGenerating ? 'Neural Processing...' : 'Generate Assessment'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mb-8">
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Course Assessments</h2>
          <div className="flex gap-3">
             <button 
               onClick={() => setShowAIModal(true)}
               className="bg-white border border-blue-900 text-blue-900 px-4 py-2 rounded text-xs font-bold hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2"
             >
               ✨ Neural Generator
             </button>
             <button 
               onClick={() => setShowAddForm(!showAddForm)}
               className="bg-blue-900 text-white px-4 py-2 rounded text-xs font-bold hover:bg-blue-800 transition-all shadow-sm"
             >
               {showAddForm ? 'Cancel Operation' : '+ Create Manual Item'}
             </button>
          </div>
        </div>

        {showAddForm && (
          <div className="p-8 bg-gray-50/50 border-b border-gray-200">
             <form onSubmit={handleAddAssessment} className="space-y-6 max-w-3xl border border-gray-200 bg-white p-6 rounded shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Primary Title</label>
                    <input 
                      type="text" 
                      required
                      value={newAssessment.title}
                      onChange={e => setNewAssessment({...newAssessment, title: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
                      placeholder="e.g. Unit 3 Summative Assessment"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Time Allocation (min)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={newAssessment.time_limit_minutes}
                      onChange={e => setNewAssessment({...newAssessment, time_limit_minutes: parseInt(e.target.value)})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none font-bold text-blue-900"
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assessment Instructions</label>
                   <textarea 
                     value={newAssessment.description}
                     onChange={e => setNewAssessment({...newAssessment, description: e.target.value})}
                     className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none resize-none text-sm"
                     rows={3}
                     placeholder="Provide clear instructions for students..."
                   />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="px-10 py-2.5 bg-blue-900 text-white font-bold rounded hover:bg-blue-800 transition-all shadow-sm text-sm uppercase">
                    Initialize Assessment
                  </button>
                </div>
             </form>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {assessmentzes.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-medium">
              No assessments have been recorded for this course.
            </div>
          ) : (
            assessmentzes.map((assessment, index) => (
              <div key={assessment.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors group border-l-4 border-transparent hover:border-blue-900">
                 <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                       {index + 1}
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-gray-900 leading-none">{assessment.title}</h3>
                       <div className="flex items-center gap-3 mt-2">
                          <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Duration: {assessment.time_limit_minutes} minutes</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span className="text-[9px] font-bold uppercase text-green-700 tracking-wider">Evaluation Active</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest shadow-sm">
                       Configure Items
                    </button>
                    <button className="px-4 py-2 bg-white border border-red-200 text-red-700 font-bold rounded hover:bg-red-50 transition-all text-[10px] uppercase tracking-widest shadow-sm">
                       Revoke
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
