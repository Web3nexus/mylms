import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  Briefcase, 
  CheckCircle,
  Plus,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight
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
}

export default function AdminStaffDirectory() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'staff',
    permissions: [] as string[]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const AVAILABLE_FEATURES = [
    { key: 'cms_marketing', label: 'CMS & Marketing', color: 'text-mylms-rose' },
    { key: 'academic_enrollment', label: 'Academic & Enrollment', color: 'text-mylms-purple' },
    { key: 'staff_registry', label: 'Personnel Registry', color: 'text-mylms-purple' },
    { key: 'admissions_portal', label: 'Admissions Desk', color: 'text-mylms-purple' },
    { key: 'finance_bursary', label: 'Bursary & Finance', color: 'text-mylms-rose' },
    { key: 'student_registry', label: 'Student Registry', color: 'text-mylms-purple' },
    { key: 'branding_identity', label: 'Brand Identity', color: 'text-mylms-rose' },
  ];
  
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const { confirm, notify } = useNotificationStore();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await client.get('/admin/staff?type=staff', { headers });
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
      role: 'staff',
      permissions: [] as string[]
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
              <span>Staff Management</span>
           </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Administrative Staff</h1>
            <p className="text-text-secondary font-bold text-xs uppercase tracking-widest mt-4">University personnel and platform administrators.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-mylms-purple hover:bg-mylms-purple/90 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-sm transition-all text-sm font-semibold"
        >
          <UserPlus size={16} />
          Add Staff Member
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                         member.role === 'admin' 
                           ? 'bg-rose-50 text-mylms-rose' 
                           : member.role === 'staff' 
                             ? 'bg-orange-50 text-orange-600'
                             : 'bg-purple-50 text-mylms-purple'
                      }`}>
                        {member.role === 'admin' ? <ShieldCheck size={12} /> : <Briefcase size={12} />}
                        <span className="capitalize">{member.role}</span>
                      </span>
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
                          onClick={() => {
                            setFormData({ 
                              name: member.name, 
                              email: member.email, 
                              role: member.role, 
                              password: '',
                              permissions: member.permissions || [] 
                            });
                            setIsEditing(true);
                            setEditingId(member.id);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-mylms-purple hover:bg-mylms-purple/10 rounded-lg transition-all"
                          title="Edit Staff Member"
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
                      {isEditing ? 'Edit Staff Member' : 'Add New Staff'}
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">
                      {isEditing ? 'Update personnel details and roles.' : 'Create a new staff account.'}
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
                       <label className="text-sm font-semibold text-gray-700">System Role</label>
                       <select
                  required
                  className="w-full p-4 bg-offwhite border border-border-soft rounded-xl outline-none focus:border-mylms-purple font-black text-text-main uppercase text-xs tracking-widest appearance-none shadow-inner"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="staff">Standard Staff</option>
                  <option value="admin">Administrator</option>
                </select>
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

                    {formData.role !== 'admin' && (
                       <div className="pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">Feature Permissions</h4>
                          <p className="text-xs text-gray-500 mb-4">Select administrative modules available for this account.</p>
                          
                          <div className="space-y-2">
                             {AVAILABLE_FEATURES.map(feature => (
                                <label
                                  key={feature.key}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    formData.permissions?.includes(feature.key)
                                      ? 'bg-mylms-purple/5 border-mylms-purple/30'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                   <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                      formData.permissions?.includes(feature.key) ? 'bg-mylms-purple border-mylms-purple text-white' : 'border-gray-300 bg-white'
                                   }`}>
                                      {formData.permissions?.includes(feature.key) && <CheckCircle size={14} />}
                                   </div>
                                   <span className="text-sm font-medium text-gray-700">
                                      {feature.label}
                                   </span>
                                </label>
                             ))}
                          </div>
                       </div>
                    )}
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
                    {isEditing ? 'Save Changes' : 'Add Staff'}
                    {isEditing ? <Edit size={16} /> : <Plus size={16} />}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
