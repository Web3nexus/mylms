import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface Department {
  id: number;
  name: string;
}

export default function CourseCreate() {
  const [formData, setFormData] = useState({
    title: '',
    department_id: '',
    description: '',
    price: '0.00',
    status: 'draft' as 'draft' | 'published',
  });
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const { notify } = useNotificationStore();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await client.get('/admin/departments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await client.post('/courses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify('Course proposal created successfully!', 'success');
      navigate('/office/courses');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target?.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Course</h1>
          <p className="text-gray-500 mt-1">Submit a new course proposal to the academic catalog.</p>
        </div>
        <Link to="/office/portal" className="text-sm font-semibold text-blue-900 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Course Identification</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide text-[11px]">Primary Title</label>
              <input 
                name="title"
                type="text" 
                required
                value={formData?.title}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-colors outline-none font-medium" 
                placeholder="e.g., Advanced Calculus II"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide text-[11px]">Academic Department</label>
              <select
                name="department_id"
                required
                value={formData.department_id}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-colors outline-none font-medium text-gray-700 cursor-pointer"
              >
                <option value="">Select a department...</option>
                {departments.map(dept => <option key={dept.id} value={dept.id}>{dept?.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide text-[11px]">Course Abstract / Description</label>
              <textarea 
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-colors outline-none font-medium resize-none leading-relaxed" 
                placeholder="Provide a detailed overview of the curriculum, learning objectives, and prerequisites..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide text-[11px]">Tuition / Enrollment Fee ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                  <input 
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-colors outline-none font-medium" 
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">Set to 0 for free open-access courses.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide text-[11px]">Visibility Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-colors outline-none font-bold text-blue-900 cursor-pointer"
                >
                  <option value="draft">Internal Draft</option>
                  <option value="published">Official Publication</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-6 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-blue-900 text-white font-bold rounded hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Processing Proposal...' : 'Create Course Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
