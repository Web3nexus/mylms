import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Hash, 
  ShieldCheck, 
  Clock,
  GraduationCap,
  ChevronRight,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import client from '../../api/client';
import { Link } from 'react-router-dom';
import { useAppConfig } from '../../hooks/useAppConfig';

interface Student {
  id: number;
  name: string;
  email: string;
  student_id: string | null;
  program_id: number | null;
  admission_applications_count: number;
  admission_applications?: any[]; // For detailed view
  program?: { 
    name: string; 
    degree_level: string;
    department?: { name: string; code: string };
  };
  created_at: string;
}

interface DirectoryStats {
  total: number;
  matriculated: number;
  pending: number;
}

export default function StudentDirectory() {
  const { appName } = useAppConfig();
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'matriculated' | 'pending'>('all');
  const [stats, setStats] = useState<DirectoryStats>({ total: 0, matriculated: 0, pending: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Detailed View State
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [detailedStudent, setDetailedStudent] = useState<Student | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page };
      if (search) params.search = search;
      if (filter === 'matriculated') params.has_matric = true;
      if (filter === 'pending') params.has_matric = false;

      const res = await client.get('/admin/students', { params });
      
      if (res.data?.students) {
        setStudents(res.data.students.data || []);
        setStats(res.data.stats || { total: 0, matriculated: 0, pending: 0 });
        setCurrentPage(res.data.students.current_page || 1);
        setLastPage(res.data.students.last_page || 1);
        setTotal(res.data.students.total || 0);
      } else {
        throw new Error('Unexpected data structure');
      }
    } catch (err: any) {
      console.error('Failed to fetch student directory:', err);
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Unable to load students. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [search, filter, token]);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(1), 300);
    return () => clearTimeout(timer);
  }, [search, filter]);

  const fetchStudentDetails = async (id: number) => {
    setDetailsLoading(true);
    setSelectedStudentId(id);
    try {
      const res = await client.get(`/admin/students/${id}`, { headers });
      setDetailedStudent(res.data);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const { confirm, notify } = useNotificationStore();

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    
    const confirmed = await confirm({
      title: 'Delete Student Records',
      message: `Are you sure you want to permanently delete ${selectedIds.length} student(s)? This action cannot be undone.`,
      confirmText: 'Delete Records',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      await client.post('/admin/students/bulk-delete', { student_ids: selectedIds }, { headers });
      setSelectedIds([]);
      notify('Student records deleted successfully.', 'success');
      fetchStudents(currentPage);
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to delete selected records.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const clearSearch = () => setSearch('');

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-12 min-h-screen transition-all">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-mylms-purple font-semibold text-sm">
            <Users size={16} />
            <span>Student Management</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all registered students, matric numbers, and enrollment statuses.
          </p>
        </div>

        {/* Summary stat chips */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm min-w-[90px]">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl border border-emerald-100 shadow-sm min-w-[90px]">
            <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Matriculated</p>
            <p className="text-xl font-bold text-emerald-700">{stats.matriculated}</p>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl border border-amber-100 shadow-sm min-w-[90px]">
            <p className="text-xs font-semibold text-amber-500 uppercase mb-1">Pending</p>
            <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Search, Filter & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        {selectedIds.length > 0 ? (
          <div className="flex-1 flex gap-4 w-full h-11">
            <div className="flex-grow flex items-center justify-between px-4 bg-mylms-purple text-white rounded-lg shadow-sm">
               <span className="text-sm font-semibold">{selectedIds.length} Student(s) Selected</span>
               <button onClick={() => setSelectedIds([])} className="hover:text-mylms-rose transition-colors">
                  <X size={16} />
               </button>
            </div>
            <button 
              onClick={handleBulkDelete}
              disabled={deleting}
              className="px-6 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shrink-0 disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} Delete Selected
            </button>
          </div>
        ) : (
          <div className="relative flex-1 w-full h-11">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or matric number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-full bg-white border border-gray-200 rounded-lg pl-11 pr-10 text-sm focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple outline-none transition-all shadow-sm"
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 shrink-0 h-11 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {(['all', 'matriculated', 'pending'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedIds([]); }}
              className={`flex items-center gap-2 px-4 rounded-md text-xs font-semibold capitalize transition-all ${
                filter === f 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={12} />
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {error && (
          <div className="p-6 text-center bg-red-50 border-b border-red-100">
            <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
            <p className="text-red-700 font-medium text-sm">{error}</p>
            <button 
              onClick={() => fetchStudents(currentPage)} 
              className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={students.length > 0 && selectedIds.length === students.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-mylms-purple focus:ring-mylms-purple border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Programme</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Matric Number</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2 size={24} className="animate-spin text-mylms-purple mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-500">Loading student directory...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Users size={32} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-sm">No students found matching your criteria.</p>
                    {search && (
                      <button onClick={clearSearch} className="mt-4 text-mylms-purple text-sm font-semibold hover:underline">
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr 
                    key={student.id}
                    onClick={() => fetchStudentDetails(student.id)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedIds.includes(student.id) ? 'bg-purple-50/50' : 
                      selectedStudentId === student.id ? 'bg-gray-50 ring-1 ring-inset ring-gray-200' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                       <input 
                         type="checkbox" 
                         checked={selectedIds.includes(student.id)}
                         onChange={(e) => toggleSelect(student.id, e as any)}
                         className="w-4 h-4 rounded text-mylms-purple focus:ring-mylms-purple border-gray-300 cursor-pointer"
                       />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-mylms-purple font-bold text-sm shrink-0">
                          {student?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{student?.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.program ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                            <GraduationCap size={14} className="text-gray-400" />
                            {student.program.degree_level}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {student.program.department?.code && (
                              <span className="font-semibold mr-1">[{student.program.department.code}]</span>
                            )}
                            {student.program?.name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.student_id ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-emerald-50 text-emerald-700 font-mono">
                          <Hash size={14} className="text-emerald-500" />
                          {student.student_id}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-amber-50 text-amber-600">
                          <Clock size={14} className="text-amber-500" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {student.student_id ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                            <CheckCircle size={14} /> Active
                          </span>
                        ) : student.admission_applications_count > 0 ? (
                          <span className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                            <AlertCircle size={14} /> Applied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                            <ShieldCheck size={14} /> Registered
                          </span>
                        )}
                        <ChevronRight size={16} className="text-gray-300 ml-2" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && students.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{students.length}</span> of <span className="font-medium text-gray-900">{total}</span> students
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchStudents(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-700 px-2">
                Page {currentPage} of {lastPage}
              </span>
              <button
                onClick={() => fetchStudents(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="px-3 py-1.5 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Details Sidebar */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setSelectedStudentId(null)}></div>
           
           <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
              
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">Student Profile</h3>
                    <p className="text-sm text-gray-500 mt-0.5">View details and history</p>
                 </div>
                 <button 
                   onClick={() => setSelectedStudentId(null)}
                   className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-6">
                 {detailsLoading ? (
                   <div className="h-full flex flex-col items-center justify-center gap-4">
                      <Loader2 size={24} className="animate-spin text-mylms-purple" />
                      <p className="text-sm text-gray-500">Loading profile...</p>
                   </div>
                 ) : detailedStudent ? (
                    <div className="space-y-8">
                       {/* Identity */}
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-mylms-purple font-bold text-2xl shrink-0">
                             {detailedStudent?.name.charAt(0)}
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-gray-900 mb-1">{detailedStudent?.name}</h4>
                             <p className="text-sm text-gray-500">{detailedStudent?.email}</p>
                          </div>
                       </div>

                       {/* Status Grid */}
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Matriculation</p>
                             <div className="flex items-center gap-2">
                                {detailedStudent.student_id ? (
                                   <>
                                      <Hash size={16} className="text-emerald-500" />
                                      <span className="text-sm font-bold text-emerald-700 font-mono">{detailedStudent.student_id}</span>
                                   </>
                                ) : (
                                   <>
                                      <Clock size={16} className="text-amber-500" />
                                      <span className="text-sm font-medium text-amber-600">Pending</span>
                                   </>
                                )}
                             </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Program Level</p>
                             <div className="flex items-center gap-2">
                                <GraduationCap size={16} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">{detailedStudent.program?.degree_level || 'N/A'}</span>
                             </div>
                          </div>
                       </div>

                       {/* Applications Section */}
                       <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Admission History</h4>
                          <div className="space-y-3">
                             {detailedStudent.admission_applications?.map(app => (
                                <div key={app.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-mylms-purple/30 transition-all group">
                                   <div className="flex justify-between items-start mb-4">
                                      <div className="pr-4">
                                         <p className="text-sm font-semibold text-gray-900 mb-1">{app.program?.name}</p>
                                         <p className="text-xs text-gray-500">Submitted: {new Date(app.created_at).toLocaleDateString()}</p>
                                      </div>
                                      <span className={`text-xs font-medium px-2.5 py-1 rounded-md shrink-0 border ${
                                         app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                         app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                         'bg-amber-50 text-amber-700 border-amber-100'
                                      }`}>
                                         <span className="capitalize">{app.status}</span>
                                      </span>
                                   </div>
                                   <Link 
                                     to="/admin/admissions/review" 
                                     className="w-full py-2 bg-gray-50 group-hover:bg-purple-50 group-hover:text-mylms-purple rounded-lg text-sm font-medium text-gray-600 transition-all flex items-center justify-center gap-2"
                                   >
                                      View Application
                                      <ChevronRight size={14} />
                                   </Link>
                                </div>
                             ))}
                             {detailedStudent.admission_applications?.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                   <AlertCircle size={20} className="mx-auto text-gray-400 mb-2" />
                                   <p className="text-sm text-gray-500">No applications found.</p>
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Actions */}
                       <div className="pt-6 border-t border-gray-100">
                          <h4 className="text-sm font-bold text-gray-900 mb-4">Account Actions</h4>
                          <div className="grid grid-cols-2 gap-3">
                             <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                <Search size={14} /> Activity Logs
                             </button>
                             <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors shadow-sm">
                                <X size={14} /> Suspend Account
                             </button>
                          </div>
                       </div>
                    </div>
                 ) : null}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
