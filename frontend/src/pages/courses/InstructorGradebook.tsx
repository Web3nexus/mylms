import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Semester {
  id: number;
  name: string;
}

interface Registration {
  id: number;
  grade: number | null;
  grade_letter: string | null;
  status: string;
  user: User;
  semester: Semester;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  credit_hours: number;
}

export default function InstructorGradebook() {
  const { slug } = useParams();
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [course, setCourse] = useState<Course | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editGrade, setEditGrade] = useState<string>('');
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCourseAndRoster();
  }, [slug]);

  const fetchCourseAndRoster = async () => {
    try {
      const courseRes = await client.get(`/courses/${slug}`, { headers });
      setCourse(courseRes.data);

      const rosterRes = await client.get(`/courses/${courseRes.data.id}/gradebook`, { headers });
      setRegistrations(rosterRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async (registration: Registration) => {
    if (!course || editGrade === '') return;

    setSavingId(registration.id);
    try {
      const res = await client.post(
        `/courses/${course.id}/gradebook/${registration.id}`,
        { grade: Number(editGrade) },
        { headers }
      );
      
      setRegistrations(registrations.map(r => 
        r.id === registration.id ? { ...r, grade: res.data.registration.grade, grade_letter: res.data.registration.grade_letter, status: 'completed' } : r
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save grade', err);
      alert('Failed to save grade. Ensure it is between 0 and 100.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Gradebook...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to={`/courses/${slug}/curriculum`} className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-none">Academic Evaluation Record</h1>
            <p className="text-gray-500 text-sm mt-1">{course?.title} &bull; {course?.credit_hours} Credit Hours</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white px-5 py-3 rounded border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 text-gray-900 border border-gray-200 rounded flex items-center justify-center text-lg font-bold">
              {registrations.length}
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Enrollment</p>
              <p className="font-bold text-gray-900 text-sm leading-none">Matriculated Students</p>
            </div>
          </div>
          <div className="bg-white px-5 py-3 rounded border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 text-green-800 border border-green-100 rounded flex items-center justify-center text-lg font-bold">
              {registrations.filter(r => r.grade !== null).length}
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Evaluation Status</p>
              <p className="font-bold text-gray-900 text-sm leading-none">Completed Grading</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Student Identity</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Academic Term</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Numeric Score</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Scale Grade</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center text-gray-400 font-medium">
                    No matriculated students record found for this directory.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-blue-900">
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-900 text-sm">{reg.user.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{reg.user.email}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                        {reg.semester?.name || 'Active Term'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {editingId === reg.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editGrade}
                          onChange={(e) => setEditGrade(e.target.value)}
                          className="w-20 px-3 py-1.5 border border-blue-900 rounded outline-none font-bold text-gray-900 shadow-inner bg-blue-50/30"
                          placeholder="0-100"
                          autoFocus
                        />
                      ) : (
                        <span className="text-base font-bold text-gray-900 font-mono">
                          {reg.grade !== null ? reg.grade : '--'}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {reg.grade_letter ? (
                        <div className="w-8 h-8 border border-green-200 rounded flex items-center justify-center font-bold text-sm bg-green-50 text-green-800">
                          {reg.grade_letter}
                        </div>
                      ) : (
                        <div className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center font-bold text-sm bg-gray-50 text-gray-300">
                          -
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {editingId === reg.id ? (
                        <div className="flex justify-end gap-2 text-[10px] font-bold uppercase">
                          <button
                            onClick={() => { setEditingId(null); setEditGrade(''); }}
                            className="px-3 py-1.5 text-gray-400 hover:text-gray-600 transition"
                            disabled={savingId === reg.id}
                          >
                            Abort
                          </button>
                          <button
                            onClick={() => handleSaveGrade(reg)}
                            className="px-4 py-1.5 bg-blue-900 text-white rounded hover:bg-blue-800 shadow-sm transition"
                            disabled={savingId === reg.id}
                          >
                            {savingId === reg.id ? 'Saving...' : 'Finalize Grade'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(reg.id); setEditGrade(reg.grade !== null ? reg.grade.toString() : ''); }}
                          className="px-5 py-1.5 bg-white border border-gray-300 text-gray-700 font-bold rounded hover:bg-blue-900 hover:text-white hover:border-blue-900 transition text-[10px] uppercase tracking-widest shadow-sm"
                        >
                          {reg.grade !== null ? 'Modify Assessment' : 'Assign Score'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
