import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  BookOpen, 
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

interface Props {
  title: string;
  subtitle: string;
  linkBuilder: (slug: string) => string;
}

export default function InstructorCourseSelector({ title, subtitle, linkBuilder }: Props) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await client.get('/instructor/courses', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (err) {
        console.error('Error fetching instructor courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="w-8 h-8 border-4 border-mylms-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none mb-3">{title}</h1>
          <p className="text-text-secondary text-xs font-black uppercase tracking-widest opacity-60 italic">{subtitle}</p>
        </div>
        
        {courses.length > 0 && (
          <button 
            onClick={() => {
              // Quick action: jump to the first course's builder
              navigate(linkBuilder(courses[0].slug));
            }}
            className="px-8 py-3 bg-mylms-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
          >
            Create New for {courses[0].code || 'Course'}
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-offwhite/50 border-b border-border-soft">
                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Course Identification</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Enrollment</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Term / Period</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-100 mb-6" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">No assigned courses found in the faculty registry.</p>
                    <button 
                      onClick={() => navigate('/courses/create')}
                      className="px-6 py-3 bg-mylms-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-mylms-purple/90 transition-all shadow-md inline-flex items-center gap-2"
                    >
                      <ArrowRight size={14} /> Create Your First Course
                    </button>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr 
                    key={course.id}
                    onClick={() => navigate(linkBuilder(course.slug))}
                    className="group hover:bg-offwhite transition-all cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-offwhite flex items-center justify-center text-mylms-purple group-hover:bg-mylms-purple group-hover:text-white transition-all shadow-inner shrink-0">
                          <Layers size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-mylms-rose uppercase tracking-[0.2em] mb-1 opacity-70">{course.code || 'CRS-ID'}</p>
                          <h3 className="text-sm font-black text-text-main uppercase tracking-tight group-hover:text-mylms-purple transition-all">
                            {course.title}
                          </h3>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[11px] font-black text-text-main uppercase">
                        <Users size={14} className="text-mylms-purple opacity-40" />
                        {course.enrollments_count || 0} <span className="text-[9px] text-gray-400 font-normal">Active Students</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[11px] font-black text-text-main uppercase">
                        <Clock size={14} className="text-mylms-purple opacity-40" />
                        {course.semester?.name || 'Academic Term'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${course.is_published ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                        <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                          {course.is_published ? 'Published' : 'Draft Mode'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <ChevronRight size={18} className="text-gray-200 group-hover:text-mylms-purple group-hover:translate-x-1 transition-all inline-block" />
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
