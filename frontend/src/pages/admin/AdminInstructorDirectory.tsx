import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  Briefcase, 
  Plus,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  created_at: string;
  instructor_assignments?: {
    id: number;
    department: { id: number; name: string };
    level?: { id: number; name: string; code: string };
  }[];
}

export default function AdminInstructorDirectory() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'instructor',
    faculty_id: '',
    department_id: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [assignmentModal, setAssignmentModal] = useState<{isOpen: boolean, instructor: StaffMember | null}>({isOpen: false, instructor: null});
  const [newAssignment, setNewAssignment] = useState({ department_id: '', level_id: '' });

  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const { confirm, notify } = useNotificationStore();

  useEffect(() => {
    fetchStaff();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [facRes, depRes, lvlRes] = await Promise.all([
        client.get('/public/faculties', { headers }),
        client.get('/admin/departments', { headers }),
        client.get('/admin/levels', { headers })
      ]);
      setFaculties(facRes.data || []);
      // Safely extract array from plain array or paginated { data: [] } response
      const depts = Array.isArray(depRes.data) ? depRes.data : (depRes.data?.data ?? []);
      const lvls  = Array.isArray(lvlRes.data)  ? lvlRes.data  : (lvlRes.data?.data  ?? []);
      setDepartments(depts);
      setLevels(lvls);
    } catch (err) {
      console.error('Failed to fetch academic metadata', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await client.get('/admin/staff?type=instructor', { headers });
      setStaff(res.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await client.put(`/admin/staff/${editingId}`, formData, { headers });
        notify("Staff member updated successfully.", "success");
      } else {
        await client.post('/admin/staff', formData, { headers });
        notify("Staff member added successfully.", "success");
      }
      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (err: any) {
      console.error('Error saving staff:', err);
      notify(err.response?.data?.message || 'Failed to save staff record.', "error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Password123!',
      role: 'instructor',
      faculty_id: '',
      department_id: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(false);
  };

  const togglePermission = (featureKey: string) => {
    setFormData(prev => {
      const current = prev.permissions || [];
      const updated = current.includes(featureKey)
        ? current.filter(k => k !== featureKey)
        : [...current, featureKey];
      return { ...prev, permissions: updated };
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Staff Member',
      message: 'Are you sure you want to permanently delete this staff member? They will lose all system access.',
      confirmText: 'Delete User',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;
    try {
      await client.delete(`/admin/staff/${id}`, { headers });
      notify("Staff member deleted successfully.", "success");
      fetchStaff();
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      notify(err.response?.data?.message || 'Failed to delete staff member.', "error");
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentModal.instructor) return;
    try {
      await client.post('/admin/instructor-assignments', {
        instructor_id: assignmentModal.instructor.id,
        department_id: newAssignment.department_id,
        level_id: newAssignment.level_id || null
      }, { headers });
      notify("Academic assignment added successfully.", "success");
      setNewAssignment({ department_id: '', level_id: '' });
      fetchStaff();
      // Update modal data locally for immediate reflection
      const updatedInstructor = staff.find(s => s.id === assignmentModal.instructor!.id);
      if (updatedInstructor) setAssignmentModal({ ...assignmentModal, instructor: updatedInstructor });
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to add assignment.', "error");
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      await client.delete(`/admin/instructor-assignments/${assignmentId}`, { headers });
      notify("Assignment removed.", "success");
      fetchStaff();
    } catch (err) {
      notify("Failed to remove assignment.", "error");
    }
  };

  // Filtering and Pagination
  const filteredStaff = useMemo(() => {
    return staff.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staff, searchQuery]);

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-semibold text-sm">Loading Staff Directory...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2 text-mylms-purple font-semibold text-sm">
              <Users size={16} />
              <span>Instructor Management</span>
           </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Instructor Registry</h1>
            <p className="text-text-secondary font-bold text-xs uppercase tracking-widest mt-4">Manage academic teaching staff and assignments.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-mylms-purple hover:bg-mylms-purple/90 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-sm transition-all text-sm font-semibold"
        >
          <UserPlus size={16} />
          Add Instructor
        </button>
      </div>

      {/* Toolbar (Search) */}
      <div className="mb-6 flex items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search by name, email, or role..." 
             value={searchQuery}
             onChange={(e) => {
               setSearchQuery(e.target.value);
               setCurrentPage(1); // Reset to first page on search
             }}
             className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-mylms-purple/20 outline-none"
           />
        </div>
      </div>

      {/* Staff Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignments</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No staff members found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          member.role === 'admin' ? 'bg-rose-50 text-mylms-rose' : 'bg-purple-50 text-mylms-purple'
                        }`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                            <Mail size={12} />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.instructor_assignments && member.instructor_assignments.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {member.instructor_assignments.map(a => (
                            <span key={a.id} className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-mylms-purple bg-mylms-purple/5 px-2 py-1 rounded-md border border-mylms-purple/10">
                              <Briefcase size={10} />
                              {a.department.name} {a.level ? `(${a.level.code})` : '(All Levels)'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setAssignmentModal({ isOpen: true, instructor: member })}
                          className="p-2 text-gray-400 hover:text-mylms-purple hover:bg-mylms-purple/10 rounded-lg transition-all"
                          title="Manage Academic Assignments"
                        >
                           <Briefcase size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setFormData({ 
                              name: member.name, 
                              email: member.email, 
                              role: member.role, 
                              password: '',
                              faculty_id: (member as any).faculty_id || '',
                              department_id: (member as any).department_id || ''
                            });
                            setIsEditing(true);
                            setEditingId(member.id);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-mylms-purple hover:bg-mylms-purple/10 rounded-lg transition-all"
                          title="Edit Instructor"
                        >
                           <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-gray-400 hover:text-mylms-rose hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete User"
                        >
                           <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredStaff.length)}</span> of <span className="font-semibold text-gray-900">{filteredStaff.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Creation / Edit Drawer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
           <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={resetForm}></div>
           
           <div className="bg-white w-full max-w-md h-full shadow-2xl relative z-[110] flex flex-col animate-in slide-in-from-right-8 duration-300">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                 <div>
                   <h3 className="text-xl font-bold text-gray-900">
                      {isEditing ? 'Edit Instructor' : 'Add New Instructor'}
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">
                      {isEditing ? 'Update personnel details.' : 'Create a new instructor account.'}
                   </p>
                 </div>
                 <button onClick={resetForm} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                   <ChevronRight size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                 <form id="staff-form" onSubmit={handleSave} className="space-y-5">
                    <div className="space-y-1.5">
                       <label className="text-sm font-semibold text-gray-700">Full Name</label>
                       <input 
                         type="text"
                         required
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple transition-all text-sm text-gray-900"
                         placeholder="e.g. Jane Doe"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-sm font-semibold text-gray-700">Email Address</label>
                       <input 
                         type="email"
                         required
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple transition-all text-sm text-gray-900"
                         placeholder="staff@mylms.edu"
                       />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                           {isEditing ? 'New Password (Optional)' : 'Initial Password'}
                        </label>
                        <input 
                          type="text"
                          required={!isEditing}
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple transition-all text-sm text-gray-900"
                          placeholder={isEditing ? 'Leave blank to keep current' : ''}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Primary Faculty</label>
                        <select 
                          value={formData.faculty_id}
                          onChange={e => setFormData({...formData, faculty_id: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple transition-all text-sm text-gray-900"
                        >
                          <option value="">No Faculty Assigned</option>
                          {faculties.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Primary Department</label>
                        <select 
                          value={formData.department_id}
                          onChange={e => setFormData({...formData, department_id: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple transition-all text-sm text-gray-900"
                        >
                          <option value="">No Department Assigned</option>
                          {departments.filter(d => !formData.faculty_id || d.faculty_id === Number(formData.faculty_id)).map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                     </div>
                 </form>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                 <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                  form="staff-form"
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-mylms-purple text-white rounded-lg text-sm font-semibold hover:bg-mylms-purple/90 transition-colors shadow-sm flex items-center justify-center gap-2"
                 >
                    {isEditing ? 'Save Changes' : 'Add Instructor'}
                    {isEditing ? <Edit size={16} /> : <Plus size={16} />}
                 </button>
              </div>
           </div>
        </div>
      )}
      {/* Academic Assignments Modal */}
      {assignmentModal.isOpen && assignmentModal.instructor && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setAssignmentModal({isOpen: false, instructor: null})}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-[130] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-text-main uppercase tracking-tighter">Academic Assignments</h3>
                <p className="text-xs text-text-secondary font-bold tracking-widest uppercase mt-1">Manage departments & levels for {assignmentModal.instructor.name}</p>
              </div>
              <button onClick={() => setAssignmentModal({isOpen: false, instructor: null})} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
              {/* Current Assignments List */}
              <div className="mb-8">
                <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Current Assignments</h4>
                {(!assignmentModal.instructor.instructor_assignments || assignmentModal.instructor.instructor_assignments.length === 0) ? (
                  <div className="p-4 bg-white border border-dashed border-gray-300 rounded-xl text-center text-sm text-gray-500">
                    No academic assignments configured.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignmentModal.instructor.instructor_assignments.map((assignment: any) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-mylms-purple/10 text-mylms-purple flex items-center justify-center">
                            <Briefcase size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{assignment.department.name}</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                              {assignment.level ? `Level: ${assignment.level.name} (${assignment.level.code})` : 'All Student Levels'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Assignment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Assignment Form */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Add New Assignment</h4>
                <form onSubmit={handleAddAssignment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Department</label>
                      <select
                        required
                        className="w-full p-3 bg-offwhite border border-border-soft rounded-lg outline-none focus:border-mylms-purple font-semibold text-sm appearance-none shadow-inner"
                        value={newAssignment.department_id}
                        onChange={e => setNewAssignment({...newAssignment, department_id: e.target.value})}
                      >
                        <option value="">Select Department...</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Student Level</label>
                      <select
                        className="w-full p-3 bg-offwhite border border-border-soft rounded-lg outline-none focus:border-mylms-purple font-semibold text-sm appearance-none shadow-inner"
                        value={newAssignment.level_id}
                        onChange={e => setNewAssignment({...newAssignment, level_id: e.target.value})}
                      >
                        <option value="">All Levels (General)</option>
                        {levels.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-mylms-purple text-white rounded-lg text-sm font-black uppercase tracking-widest hover:bg-mylms-purple/90 transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus size={16} /> Assign Department
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
