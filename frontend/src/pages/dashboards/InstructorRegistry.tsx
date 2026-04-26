import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Award,
  Clock,
  ClipboardList,
  Users,
  BookOpen,
  ArrowRight,
  Layers,
  BarChart3,
  HelpCircle,
  Settings,
  GraduationCap,
  MessageCircle,
  FileText,
  Mic2,
  ChevronRight,
  Loader2,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function InstructorDashboard() {
  const { user, token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCohorts: 0,
    totalStudents: 0,
    passRate: '0%',
    pendingEvaluations: 0,
    facultyId: 'FAC-000000'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, statsRes] = await Promise.all([
          client.get('/my-courses', { headers }),
          client.get('/instructor/stats', { headers })
        ]);
        setCourses(coursesRes.data?.data || coursesRes.data || []);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching instructor data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Quick-action tools — always visible regardless of courses
  const quickActions = [
    {
      label: 'Create Course',
      desc: 'Propose a new course in your department',
      icon: <PlusCircle size={22} />,
      to: '/courses/create',
      color: 'bg-mylms-purple text-white',
      highlight: true,
    },
    {
      label: 'Course Management',
      desc: 'View and manage all assigned courses',
      icon: <BookOpen size={22} />,
      to: '/office/courses',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Curriculum & Media',
      desc: 'Upload lessons, videos and materials',
      icon: <Layers size={22} />,
      to: '/office/curriculum',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Assignment Setup',
      desc: 'Create and manage assignments',
      icon: <Settings size={22} />,
      to: '/office/assignments',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Quiz Builder',
      desc: 'Build MCQ, true/false & theory quizzes',
      icon: <HelpCircle size={22} />,
      to: '/office/quizzes',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Gradebook',
      desc: 'Grade assignments and submissions',
      icon: <Award size={22} />,
      to: '/office/gradebook',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Forum Moderation',
      desc: 'Moderate student discussion forums',
      icon: <MessageCircle size={22} />,
      to: '/office/forums',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Announcements',
      desc: 'Post course announcements',
      icon: <Mic2 size={22} />,
      to: '/office/announcements',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Student Messaging',
      desc: 'Message your students directly',
      icon: <FileText size={22} />,
      to: '/office/communications',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Performance Analytics',
      desc: 'View student performance & trends',
      icon: <BarChart3 size={22} />,
      to: '/office/analytics/performance',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Engagement Reports',
      desc: 'Track student engagement rates',
      icon: <Activity size={22} />,
      to: '/office/analytics/engagement',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
    {
      label: 'Peer Reviews',
      desc: 'Manage peer assessment tasks',
      icon: <Users size={22} />,
      to: '/office/peer-reviews',
      color: 'bg-white border border-gray-200 text-gray-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-12 min-h-screen">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-mylms-purple font-semibold text-sm">
            <ClipboardList size={16} />
            Faculty Portal
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Instructor'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ID: {stats.facultyId} &mdash; Manage your courses, assignments and students below.
          </p>
        </div>
        <Link
          to="/courses/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-mylms-purple text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-mylms-purple/90 transition-colors"
        >
          <PlusCircle size={16} />
          Create New Course
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Courses', value: stats.activeCohorts, icon: <BookOpen size={18} />, color: 'text-mylms-purple' },
          { label: 'Total Students', value: stats.totalStudents, icon: <Users size={18} />, color: 'text-blue-600' },
          { label: 'Pass Rate', value: stats.passRate, icon: <BarChart3 size={18} />, color: 'text-emerald-600' },
          { label: 'Pending Grades', value: stats.pendingEvaluations, icon: <Clock size={18} />, color: 'text-rose-600', alert: (stats.pendingEvaluations ?? 0) > 0 },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-xl border shadow-sm p-5 ${stat.alert ? 'border-rose-200' : 'border-gray-200'}`}>
            <div className={`flex items-center gap-2 mb-3 ${stat.color}`}>
              {stat.icon}
              <span className="text-xs font-semibold text-gray-500">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            {stat.alert && (
              <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                <Clock size={11} /> Action required
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-4">Teaching Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className={`group flex items-start gap-3 p-4 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 ${action.color} ${action.highlight ? 'shadow-md' : 'shadow-sm hover:border-mylms-purple/40'}`}
            >
              <div className={`shrink-0 mt-0.5 ${action.highlight ? 'text-white/80' : 'text-mylms-purple'}`}>
                {action.icon}
              </div>
              <div>
                <p className={`text-sm font-semibold leading-tight ${action.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {action.label}
                </p>
                <p className={`text-xs mt-0.5 leading-tight ${action.highlight ? 'text-white/70' : 'text-gray-500'}`}>
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* My Courses Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap size={18} className="text-mylms-purple" />
              My Courses
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage individual course content, assignments, and students</p>
          </div>
          <Link
            to="/office/courses"
            className="text-sm text-mylms-purple font-semibold hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={24} className="animate-spin text-mylms-purple mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading your courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen size={36} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-sm">You haven't created any courses yet.</p>
            <Link to="/courses/create" className="mt-4 inline-flex items-center gap-2 text-mylms-purple text-sm font-semibold hover:underline">
              <PlusCircle size={15} /> Create your first course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.filter(Boolean).filter(c => c?.title).map((course: any) => (
                  <tr key={course.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Course Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-mylms-purple font-bold text-sm shrink-0">
                          {course?.title?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{course.code || `CRS-${course.id}`}</p>
                        </div>
                      </div>
                    </td>

                    {/* Students */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Users size={14} className="text-gray-400" />
                        {course.enrollments_count ?? 0}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                        course.is_published
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${course.is_published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    {/* Per-Course Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/courses/${course.slug}/curriculum`}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-mylms-purple hover:text-mylms-purple transition-colors"
                          title="Curriculum"
                        >
                          Curriculum
                        </Link>
                        <Link
                          to={`/courses/${course.slug}/assignments`}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                          title="Assignments"
                        >
                          Assignments
                        </Link>
                        <Link
                          to={`/courses/${course.slug}/quizzes`}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-purple-400 hover:text-purple-600 transition-colors"
                          title="Quizzes"
                        >
                          Quizzes
                        </Link>
                        <Link
                          to={`/courses/${course.slug}/gradebook`}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                          title="Gradebook"
                        >
                          Gradebook
                        </Link>
                        <Link
                          to={`/courses/${course.slug}/curriculum`}
                          className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-mylms-purple hover:border-mylms-purple/30 transition-colors"
                          title="Open course"
                        >
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructor Assignment Info */}
      {user && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap size={16} className="text-mylms-purple" />
            My Department & Level Assignment
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Faculty</p>
              <p className="font-semibold text-gray-900">{(user as any).faculty?.name || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Department</p>
              <p className="font-semibold text-gray-900">{(user as any).department?.name || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Assigned Level</p>
              <p className="font-semibold text-gray-900">{(user as any).level?.name || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Role</p>
              <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Contact an Admin if your department or level assignment needs to be updated.
          </p>
        </div>
      )}

    </div>
  );
}
