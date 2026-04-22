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
      
      // Safety checks to prevent white-screen crashes
      if (res.data?.students) {
        setStudents(res.data.students.data || []);
        setStats(res.data.stats || { total: 0, matriculated: 0, pending: 0 });
        setCurrentPage(res.data.students.current_page || 1);
        setLastPage(res.data.students.last_page || 1);
        setTotal(res.data.students.total || 0);
      } else {
        throw new Error('Unexpected registry data structure');
      }
    } catch (err: any) {
      console.error('Failed to fetch student directory:', err);
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Unable to load student registry. Please check your connection.');
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
      title: 'Decommission Student Records',
      message: `Are you sure you want to permanently delete ${selectedIds.length} candidate(s)? This action will purge all associated academic history from the institutional registry.`,
      confirmText: 'Purge Records',
      cancelText: 'Abort Protocol',
      type: 'danger'
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      await client.post('/admin/students/bulk-delete', { student_ids: selectedIds }, { headers });
      setSelectedIds([]);
      fetchStudents(currentPage);
    } catch (err: any) {
      notify(err.response?.data?.message || 'Institutional Registry: Failed to purge selected candidate records.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const clearSearch = () => setSearch('');

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">

      {/* Header */}
      <div className="mb-12 border-b border-border-soft pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
            <Users className="opacity-50" size={16} />
            MyLMS Admin — Student Registry
          </div>
          <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Student Directory</h1>
          <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest mt-4">
            All registered students, matric numbers, and enrollment status.
          </p>
        </div>

        {/* Summary stat chips */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white px-6 py-4 rounded-xl border border-border-soft shadow-sm text-center min-w-[90px]">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-black text-text-main font-mono">{stats.total}</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-xl border border-green-100 shadow-sm text-center min-w-[90px]">
            <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Matriculated</p>
            <p className="text-2xl font-black text-green-700 font-mono">{stats.matriculated}</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-xl border border-amber-100 shadow-sm text-center min-w-[90px]">
            <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Pending</p>
            <p className="text-2xl font-black text-amber-600 font-mono">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Search, Filter & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center">
        {selectedIds.length > 0 ? (
          <div className="flex-1 flex gap-4 w-full h-12">
            <div className="flex-grow flex items-center justify-between px-6 bg-mylms-purple text-white rounded-xl shadow-sm">
               <span className="text-[10px] font-black uppercase tracking-widest">{selectedIds.length} Student(s) Selected</span>
               <button onClick={() => setSelectedIds([])} className="hover:text-mylms-rose transition-colors">
                  <X size={16} />
               </button>
            </div>
            <button 
              onClick={handleBulkDelete}
              disabled={deleting}
              className="px-8 bg-mylms-rose text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-colors shrink-0 disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Delete Selected
            </button>
          </div>
        ) : (
          <div className="relative grow group w-full h-12">
            <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-mylms-rose transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, or matric number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-full bg-white border border-border-soft rounded-xl pl-12 pr-10 text-[11px] font-bold focus:ring-1 focus:ring-mylms-rose/20 focus:border-mylms-rose/30 outline-none transition-all placeholder:text-gray-300 shadow-sm"
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-mylms-rose transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 shrink-0 h-12">
          {(['all', 'matriculated', 'pending'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedIds([]); }}
              className={`flex items-center gap-2 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                filter === f 
                  ? 'bg-mylms-purple text-white border-mylms-purple shadow-md' 
                  : 'bg-white text-gray-400 border-border-soft hover:border-mylms-purple/30 shadow-sm'
              }`}
            >
              <Filter size={10} />
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-8 py-5 bg-offwhite border-b border-border-soft items-center">
          <div className="col-span-4 flex items-center gap-4">
             <input 
               type="checkbox" 
               checked={students.length > 0 && selectedIds.length === students.length}
               onChange={toggleSelectAll}
               className="w-4 h-4 rounded text-mylms-purple focus:ring-mylms-purple border-border-soft"
             />
             <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">Student</span>
          </div>
          <div className="col-span-3 text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">Programme</div>
          <div className="col-span-3 text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">Matric Number</div>
          <div className="col-span-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] text-right">Status</div>
        </div>

        {error && (
          <div className="py-20 px-10 text-center bg-red-50 border-b border-red-100 italic transition-all animate-in slide-in-from-top-4 duration-500">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-700 font-bold text-xs uppercase tracking-widest">{error}</p>
            <button 
              onClick={() => fetchStudents(currentPage)} 
              className="mt-6 px-6 py-2 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 size={28} className="animate-spin text-mylms-purple" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Loading registry...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-32 text-center">
            <Users size={40} className="text-gray-100 mx-auto mb-6" />
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em]">No students match the current filter.</p>
            {search && (
              <button onClick={clearSearch} className="mt-6 text-mylms-purple text-[9px] font-black uppercase tracking-widest hover:underline">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-offwhite">
            {students.map(student => (
              <div
                key={student.id}
                onClick={() => fetchStudentDetails(student.id)}
                className={`grid grid-cols-12 px-8 py-6 items-center group hover:bg-offwhite/60 transition-all cursor-pointer ${selectedIds.includes(student.id) ? 'bg-mylms-purple/5' : selectedStudentId === student.id ? 'bg-offwhite/80 ring-1 ring-inset ring-mylms-purple/10' : ''}`}
              >
                {/* Student Info */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                     <input 
                       type="checkbox" 
                       checked={selectedIds.includes(student.id)}
                       onChange={(e) => toggleSelect(student.id, e as any)}
                       className="w-4 h-4 rounded text-mylms-purple focus:ring-mylms-purple border-border-soft"
                     />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-offwhite border border-border-soft flex items-center justify-center text-mylms-purple font-black text-sm shrink-0 group-hover:bg-mylms-purple group-hover:text-white transition-all shadow-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-text-main text-[11px] uppercase tracking-tight truncate group-hover:text-mylms-purple transition-colors">{student.name}</p>
                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-0.5 truncate">{student.email}</p>
                  </div>
                </div>

                {/* Programme */}
                <div className="col-span-3 min-w-0 pr-4">
                  {student.program ? (
                    <div>
                      <p className="text-[10px] font-black text-text-main uppercase tracking-tight truncate flex items-center gap-2">
                        <GraduationCap size={10} className="text-mylms-rose shrink-0" />
                        {student.program.degree_level}
                      </p>
                      <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-0.5 truncate">
                        {student.program.department?.code && (
                          <span className="text-mylms-purple font-black mr-1">[{student.program.department.code}]</span>
                        )}
                        {student.program.name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[9px] font-black text-gray-200 uppercase tracking-widest">Not Assigned</p>
                  )}
                </div>

                {/* Matric Number */}
                <div className="col-span-3">
                  {student.student_id ? (
                    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-2 rounded-lg">
                      <Hash size={10} className="text-green-600" />
                      <span className="text-[10px] font-black text-green-700 font-mono tracking-widest">{student.student_id}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg">
                      <Clock size={10} className="text-amber-500" />
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Pending</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2 flex justify-end items-center gap-2">
                  {student.student_id ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                    </div>
                  ) : student.admission_applications_count > 0 ? (
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <AlertCircle size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Applied</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <ShieldCheck size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Registered</span>
                    </div>
                  )}
                  <ChevronRight size={12} className="text-gray-200 group-hover:text-mylms-purple transition-colors ml-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && students.length > 0 && (
          <div className="px-8 py-5 border-t border-border-soft bg-offwhite flex items-center justify-between">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Showing {students.length} of {total} records
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchStudents(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-white border border-border-soft text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm disabled:opacity-30 hover:border-mylms-purple/30 transition-all"
              >
                Prev
              </button>
              <span className="text-[9px] font-black text-text-main uppercase tracking-widest">
                {currentPage} / {lastPage}
              </span>
              <button
                onClick={() => fetchStudents(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="px-4 py-2 bg-white border border-border-soft text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm disabled:opacity-30 hover:border-mylms-purple/30 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Details Sidebar */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
           <div className="absolute inset-0 bg-black/5 backdrop-blur-xs pointer-events-auto" onClick={() => setSelectedStudentId(null)}></div>
           <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-500 pointer-events-auto flex flex-col ${selectedStudentId ? 'translate-x-0' : 'translate-x-full'}`}>
              
              {/* Sidebar Header */}
              <div className="p-8 border-b border-border-soft flex justify-between items-center bg-offwhite">
                 <div>
                    <h3 className="text-xl font-black text-text-main tracking-tighter uppercase mb-1">Institutional Profile</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate Registry Status</p>
                 </div>
                 <button 
                   onClick={() => setSelectedStudentId(null)}
                   className="p-2 hover:bg-white rounded-full transition-colors"
                 >
                    <X size={20} className="text-gray-400" />
                 </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 {detailsLoading ? (
                   <div className="h-full flex flex-col items-center justify-center gap-4">
                      <Loader2 size={32} className="animate-spin text-mylms-purple" />
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Accessing Secure Records...</p>
                   </div>
                 ) : detailedStudent ? (
                    <div className="space-y-12">
                       {/* Identity */}
                       <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-mylms-purple rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-xl">
                             {detailedStudent.name.charAt(0)}
                          </div>
                          <div>
                             <h4 className="text-3xl font-black text-text-main tracking-tighter uppercase mb-2">{detailedStudent.name}</h4>
                             <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">{detailedStudent.email}</p>
                          </div>
                       </div>

                       {/* Status Grid */}
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 bg-offwhite rounded-2xl border border-border-soft">
                             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Matriculation</p>
                             <div className="flex items-center gap-2">
                                {detailedStudent.student_id ? (
                                   <>
                                      <Hash size={14} className="text-green-500" />
                                      <span className="text-sm font-black text-green-700 font-mono italic">{detailedStudent.student_id}</span>
                                   </>
                                ) : (
                                   <>
                                      <Clock size={14} className="text-amber-500" />
                                      <span className="text-sm font-black text-amber-600 uppercase tracking-tighter">Unassigned</span>
                                   </>
                                )}
                             </div>
                          </div>
                          <div className="p-6 bg-offwhite rounded-2xl border border-border-soft">
                             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Programs Joined</p>
                             <div className="flex items-center gap-2">
                                <GraduationCap size={14} className="text-mylms-rose" />
                                <span className="text-sm font-black text-text-main uppercase tracking-tighter">{detailedStudent.program?.degree_level || 'N/A'}</span>
                             </div>
                          </div>
                       </div>

                       {/* Applications Section */}
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 block mb-6 px-1">Admission Protocol History</label>
                          <div className="space-y-4">
                             {detailedStudent.admission_applications?.map(app => (
                                <div key={app.id} className="p-6 bg-white border border-border-soft rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                   <div className="flex justify-between items-start mb-6">
                                      <div>
                                         <p className="text-xs font-black text-text-main uppercase tracking-tight mb-2">{app.program?.name}</p>
                                         <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Submitted: {new Date(app.created_at).toLocaleDateString()}</p>
                                      </div>
                                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                         app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                         app.status === 'rejected' ? 'bg-mylms-rose/5 text-mylms-rose border-mylms-rose/20' :
                                         'bg-amber-50 text-amber-500 border-amber-100'
                                      }`}>
                                         {app.status}
                                      </span>
                                   </div>
                                   <Link 
                                     to="/admin/admissions/review" 
                                     className="w-full py-3 bg-offwhite group-hover:bg-mylms-purple group-hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                   >
                                      Open in Admissions Review
                                      <ChevronRight size={12} />
                                   </Link>
                                </div>
                             ))}
                             {detailedStudent.admission_applications?.length === 0 && (
                                <div className="text-center py-10 bg-offwhite/50 rounded-2xl border-2 border-dashed border-border-soft opacity-60">
                                   <AlertCircle size={24} className="mx-auto text-gray-200 mb-4" />
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No admission applications found.</p>
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Danger Zone / Admin Actions */}
                       <div className="pt-10 border-t border-border-soft">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-mylms-rose block mb-6 px-1">Registry Actions</label>
                          <div className="grid grid-cols-2 gap-4">
                             <button className="flex items-center justify-center gap-2 py-4 bg-offwhite border border-border-soft rounded-xl text-[9px] font-black uppercase tracking-widest text-text-main hover:bg-white hover:border-mylms-purple/30 transition-all">
                                <Search size={12} /> View Logs
                             </button>
                             <button className="flex items-center justify-center gap-2 py-4 bg-offwhite border border-border-soft rounded-xl text-[9px] font-black uppercase tracking-widest text-mylms-rose hover:bg-mylms-rose hover:text-white transition-all">
                                <X size={12} /> Revoke Access
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
