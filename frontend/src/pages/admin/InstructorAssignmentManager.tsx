import { useEffect, useState } from 'react';
import {
  Plus, Trash2, User, BookOpen, Layers, Loader2,
  AlertCircle, GraduationCap, X, ChevronDown, Calendar
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface Assignment {
  id: number;
  instructor: { id: number; name: string; email: string };
  department: { id: number; name: string };
  level: { id: number; name: string; code: string } | null;
  academic_year: string | null;
}

interface Instructor { id: number; name: string; email: string; role: string; }
interface Department { id: number; name: string; }
interface Level { id: number; name: string; code: string; }

export default function InstructorAssignmentManager() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const { notify, confirm } = useNotificationStore();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ instructor_id: '', department_id: '', level_id: '', academic_year: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setError(null);
    try {
      const [assignRes, staffRes, structRes, levelRes] = await Promise.all([
        client.get('/admin/instructor-assignments', { headers }),
        client.get('/admin/staff', { headers }),
        client.get('/admin/academic/structure', { headers }),
        client.get('/admin/levels', { headers }),
      ]);

      setAssignments(assignRes.data);

      // Only keep instructors from staff list
      const instructorList = (Array.isArray(staffRes.data) ? staffRes.data : staffRes.data?.data || [])
        .filter((u: any) => u.role === 'instructor');
      setInstructors(instructorList);

      // Flatten departments from faculty structure
      const depts: Department[] = [];
      (structRes.data || []).forEach((f: any) =>
        (f.departments || []).forEach((d: any) => depts.push({ id: d.id, name: `${f.name} → ${d.name}` }))
      );
      setDepartments(depts);
      setLevels(levelRes.data || []);
    } catch (err: any) {
      setError('Failed to load assignment data. Please retry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.instructor_id || !form.department_id) return;
    setSaving(true);
    try {
      await client.post('/admin/instructor-assignments', {
        instructor_id: Number(form.instructor_id),
        department_id: Number(form.department_id),
        level_id: form.level_id ? Number(form.level_id) : null,
        academic_year: form.academic_year || null,
      }, { headers });
      notify('Instructor assigned successfully.', 'success');
      setShowDrawer(false);
      setForm({ instructor_id: '', department_id: '', level_id: '', academic_year: '' });
      fetchAll();
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to assign instructor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, instructorName: string) => {
    const ok = await confirm({
      title: 'Remove Assignment',
      message: `Remove ${instructorName}'s assignment? They will no longer be authorised for this department/level.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!ok) return;
    try {
      await client.delete(`/admin/instructor-assignments/${id}`, { headers });
      notify('Assignment removed.', 'success');
      fetchAll();
    } catch {
      notify('Failed to remove assignment.', 'error');
    }
  };

  const filtered = assignments.filter(a =>
    a.instructor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.level?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-8 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap size={20} className="text-mylms-purple" />
            Instructor Assignments
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Assign instructors to departments and academic levels.
          </p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 bg-mylms-purple text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-mylms-purple/90 transition-colors"
        >
          <Plus size={16} /> New Assignment
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={fetchAll} className="text-xs font-semibold text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by instructor, department or level..."
          className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 size={22} className="animate-spin text-mylms-purple mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading assignments...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No assignments found.</p>
                    <button
                      onClick={() => setShowDrawer(true)}
                      className="mt-3 text-sm text-mylms-purple font-semibold hover:underline"
                    >
                      Create the first assignment
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-mylms-purple font-bold text-sm shrink-0">
                          {a.instructor?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{a.instructor?.name}</p>
                          <p className="text-xs text-gray-400">{a.instructor?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Layers size={14} className="text-gray-400 shrink-0" />
                        {a.department?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {a.level ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          {a.level.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">All Levels</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-mylms-rose uppercase tracking-widest">{a.academic_year || 'Any'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(a.id, a.instructor?.name)}
                        className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                        title="Remove assignment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">{filtered.length} assignment{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h3 className="text-base font-bold text-gray-900">New Instructor Assignment</h3>
              <button onClick={() => setShowDrawer(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Instructor Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User size={14} /> Instructor
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.instructor_id}
                    onChange={e => setForm({ ...form, instructor_id: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple"
                  >
                    <option value="">Select instructor...</option>
                    {instructors.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
                {instructors.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No instructors found. Ensure staff members have the "instructor" role.</p>
                )}
              </div>

              {/* Department Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} /> Department
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.department_id}
                    onChange={e => setForm({ ...form, department_id: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple"
                  >
                    <option value="">Select department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Level Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap size={14} /> Academic Level <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={form.level_id}
                    onChange={e => setForm({ ...form, level_id: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple"
                  >
                    <option value="">All Levels</option>
                    {levels.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave blank to allow access to all levels in the department.</p>
              </div>

              {/* Year Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} /> Year of Enrollment
                </label>
                <div className="relative">
                  <select
                    value={form.academic_year}
                    onChange={e => setForm({ ...form, academic_year: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple"
                  >
                    <option value="">Any Year</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - (i + 1)).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-mylms-purple text-white text-sm font-semibold rounded-lg hover:bg-mylms-purple/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Assign Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
