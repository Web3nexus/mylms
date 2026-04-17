import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Lesson {
  id: number;
  title: string;
  content_type: 'text' | 'video';
  order: number;
}

export default function CurriculumManager() {
  const { slug } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    content_type: 'text' as 'text' | 'video',
    content_data: '',
    description: '',
    is_free: false,
  });

  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchCourseAndLessons();
  }, [slug]);

  const fetchCourseAndLessons = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`);
      setCourse(courseRes.data);
      const lessonsRes = await client.get(`/courses/${courseRes.data.id}/lessons`);
      setLessons(lessonsRes.data);
    } catch (err) {
      console.error('Error fetching curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post(`/courses/${course.id}/lessons`, {
        ...newLesson,
        order: lessons.length + 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewLesson({ title: '', content_type: 'text', content_data: '', description: '', is_free: false });
      setShowAddForm(false);
      fetchCourseAndLessons();
    } catch (err) {
      console.error('Error adding lesson:', err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Syllabus...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors shadow-sm">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-none">Curriculum Management</h1>
          <p className="text-gray-500 text-sm mt-1">{course?.title}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mb-8">
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Course Syllabus</h2>
          <div className="flex gap-3">
            <Link to={`/courses/${slug}/assessment-manager`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
              Manage Assessments
            </Link>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-900 text-white px-4 py-2 rounded text-xs font-bold hover:bg-blue-800 transition-all shadow-sm"
            >
              {showAddForm ? 'Cancel Operation' : '+ Add Lesson Resource'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="p-8 bg-gray-50/50 border-b border-gray-200">
             <form onSubmit={handleAddLesson} className="space-y-6 max-w-3xl border border-gray-200 bg-white p-6 rounded shadow-sm">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Resource Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Introduction to Thermodynamics"
                      required
                      value={newLesson.title}
                      onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Material Type</label>
                      <select 
                        value={newLesson.content_type}
                        onChange={e => setNewLesson({...newLesson, content_type: e.target.value as any})}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors font-semibold text-gray-700"
                      >
                        <option value="text">Textual Content</option>
                        <option value="video">Video Lecture (URL)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-300 rounded w-full cursor-pointer hover:bg-gray-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={newLesson.is_free}
                          onChange={e => setNewLesson({...newLesson, is_free: e.target.checked})}
                          className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                        />
                        <span className="text-xs font-bold text-gray-500 uppercase">Available for Public Preview</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Course Content / Data</label>
                    <textarea 
                      placeholder={newLesson.content_type === 'text' ? 'Enter lesson content (Markdown supported)...' : 'Enter Video URL (YouTube/Vimeo)...'}
                      required
                      rows={6}
                      value={newLesson.content_data}
                      onChange={e => setNewLesson({...newLesson, content_data: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors font-mono text-xs leading-relaxed"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button type="submit" className="px-10 py-2.5 bg-blue-900 text-white font-bold rounded hover:bg-blue-800 transition-all shadow-sm text-sm">
                    Submit to Syllabus
                  </button>
                </div>
             </form>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {lessons.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-medium">
              The syllabus is currently empty.
            </div>
          ) : (
            lessons.map((lesson, index) => (
              <div key={lesson.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group border-l-4 border-transparent hover:border-blue-900">
                 <div className="flex items-center gap-5">
                    <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                       {index + 1}
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-900 text-sm">{lesson.title}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded bg-white">
                            {lesson.content_type}
                          </span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-300 hover:text-blue-900 transition-all rounded" title="Edit Item">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button className="p-2 text-gray-300 hover:text-red-900 transition-all rounded" title="Remove Item">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
