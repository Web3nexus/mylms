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
        setCourses(res.data);
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
      <div className="mb-12">
        <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none mb-3">{title}</h1>
        <p className="text-text-secondary text-xs font-black uppercase tracking-widest opacity-60 italic">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-white rounded-3xl border-2 border-dashed border-border-soft">
            <BookOpen size={48} className="mx-auto text-gray-100 mb-6" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No assigned courses found in the faculty registry.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div 
              key={course.id}
              onClick={() => navigate(linkBuilder(course.slug))}
              className="bg-white border border-border-soft rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-mylms-purple/20 transition-all cursor-pointer group flex items-start gap-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-offwhite flex items-center justify-center text-mylms-purple group-hover:bg-mylms-purple group-hover:text-white transition-all shadow-inner shrink-0">
                <Layers size={32} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <span className="px-3 py-1 bg-mylms-purple/5 border border-mylms-purple/10 rounded-lg text-[8px] font-black text-mylms-purple uppercase tracking-[0.2em]">
                      {course.code || 'FAC-DEV'}
                   </span>
                   {course.is_published ? (
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   ) : (
                     <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                   )}
                </div>
                
                <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-4 group-hover:text-mylms-purple transition-all leading-tight">
                  {course.title}
                </h3>
                
                <div className="flex items-center gap-6 text-[9px] font-black text-gray-400 uppercase tracking-widest italic opacity-70">
                   <div className="flex items-center gap-2">
                      <Users size={12} />
                      {course.enrollments_count || 0} Students
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock size={12} />
                      Term {course.semester?.name || 'Active'}
                   </div>
                </div>
              </div>

              <div className="self-center">
                <ChevronRight size={20} className="text-gray-200 group-hover:text-mylms-purple group-hover:translate-x-2 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
