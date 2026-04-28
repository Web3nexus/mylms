import { useState, useEffect } from 'react';
import { 
  Award, 
  Users, 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Mail,
  Globe,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface Partner {
  id: number;
  name: string;
  email: string | null;
  website: string | null;
  description: string | null;
  scholarships_count?: number;
}

interface Scholarship {
  id: number;
  title: string;
  amount: string;
  currency: string;
  partner?: Partner;
}

interface AwardedScholarship {
  id: number;
  user: { id: number; name: string; email: string; student_id: string | null };
  scholarship: { id: number; title: string; partner?: Partner };
  status: 'active' | 'expired' | 'revoked' | 'pending';
  awarded_at: string;
  academic_year: string | null;
}

export default function ScholarshipManager() {
  const { token } = useAuthStore();
  const { notify } = useNotificationStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'partners' | 'scholarships' | 'awards'>('awards');
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [awards, setAwards] = useState<AwardedScholarship[]>([]);
  
  const [showModal, setShowModal] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [partnerForm, setPartnerForm] = useState({ name: '', email: '', website: '', description: '' });
  const [scholarshipForm, setScholarshipForm] = useState({ scholarship_partner_id: '', title: '', amount: '', currency: 'USD', description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'partners') {
        const res = await client.get('/admin/scholarships/partners', { headers });
        setPartners(res.data);
      } else if (activeTab === 'scholarships') {
        const [sRes, pRes] = await Promise.all([
          client.get('/admin/scholarships/admin', { headers }),
          client.get('/admin/scholarships/partners', { headers })
        ]);
        setScholarships(sRes.data);
        setPartners(pRes.data);
      } else {
        const res = await client.get('/admin/scholarships/awards', { headers });
        setAwards(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch scholarship data:', err);
      notify('Failed to synchronize with scholarship registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/admin/scholarships/partners', partnerForm, { headers });
      notify('New scholarship partner onboarded.', 'success');
      setShowModal(null);
      setPartnerForm({ name: '', email: '', website: '', description: '' });
      fetchData();
    } catch (err) {
      notify('Failed to register partner.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/admin/scholarships/admin', scholarshipForm, { headers });
      notify('Scholarship program defined successfully.', 'success');
      setShowModal(null);
      setScholarshipForm({ scholarship_partner_id: '', title: '', amount: '', currency: 'USD', description: '' });
      fetchData();
    } catch (err) {
      notify('Failed to create scholarship.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await client.patch(`/admin/scholarships/awards/${id}`, { status }, { headers });
      notify(`Award status updated to ${status}.`, 'success');
      fetchData();
    } catch (err) {
      notify('Failed to update status.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-8 lg:px-12 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 border-b border-border-soft pb-10">
        <div>
           <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
              <Award className="opacity-50" size={16} />
              Philanthropy & Support Operations
           </div>
           <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Scholarship Management</h1>
           
           <div className="flex gap-10 mt-10">
              {(['awards', 'scholarships', 'partners'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-black uppercase tracking-[0.3em] pb-4 border-b-2 transition-all ${activeTab === tab ? 'border-mylms-rose text-text-main' : 'border-transparent text-gray-300 hover:text-text-main'}`}
                >
                  {tab}
                </button>
              ))}
           </div>
        </div>

        <button 
          onClick={() => setShowModal(activeTab === 'partners' ? 'add_partner' : 'add_scholarship')}
          className="btn-purple flex items-center gap-3 px-8 py-4 text-xs group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          {activeTab === 'partners' ? 'Onboard New Partner' : 'Define New Scholarship'}
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center">
           <Loader2 className="animate-spin text-mylms-purple mb-4" size={32} />
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Ledger...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {activeTab === 'awards' && (
             <div className="bg-white rounded-[32px] border border-border-soft shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-offwhite border-b border-border-soft">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Student</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Program</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Partner</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {awards.map(award => (
                      <tr key={award.id} className="hover:bg-offwhite/30 transition-all">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-mylms-purple/5 flex items-center justify-center text-mylms-purple font-black text-sm">
                                {award.user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-sm text-text-main uppercase">{award.user.name}</p>
                                <p className="text-[10px] font-bold text-gray-400">{award.user.student_id || 'ID Pending'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-black text-xs text-text-main uppercase">{award.scholarship.title}</p>
                           <p className="text-[9px] font-bold text-mylms-rose uppercase tracking-widest mt-1">{award.academic_year || 'Current Cycle'}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-gray-300" />
                              <span className="text-[10px] font-black text-gray-500 uppercase">{award.scholarship.partner?.name || 'Institutional'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                             award.status === 'active' ? 'bg-green-100 text-green-700' : 
                             award.status === 'revoked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                           }`}>
                             {award.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleUpdateStatus(award.id, 'active')}
                                className="p-2 hover:bg-green-50 text-gray-300 hover:text-green-600 transition-all rounded-lg"
                                title="Activate"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(award.id, 'revoked')}
                                className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-600 transition-all rounded-lg"
                                title="Revoke"
                              >
                                <XCircle size={16} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {awards.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                           <AlertCircle size={32} className="mx-auto text-gray-200 mb-4" />
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No scholarship awards registered in this cycle.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
           )}

           {activeTab === 'partners' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {partners.map(partner => (
                  <div key={partner.id} className="bg-white p-8 rounded-[32px] border border-border-soft shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                     <div className="relative z-10">
                        <div className="w-14 h-14 bg-mylms-purple/5 rounded-2xl flex items-center justify-center text-mylms-purple mb-6 border border-mylms-purple/10">
                           <Building2 size={24} />
                        </div>
                        <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-2">{partner.name}</h3>
                        <div className="flex flex-col gap-2 mb-8">
                           {partner.email && (
                             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                               <Mail size={12} /> {partner.email}
                             </div>
                           )}
                           {partner.website && (
                             <a href={partner.website} target="_blank" className="flex items-center gap-2 text-[10px] font-bold text-mylms-rose hover:underline">
                               <Globe size={12} /> Visit Portal
                             </a>
                           )}
                        </div>
                        <div className="pt-6 border-t border-offwhite flex items-center justify-between">
                           <span className="text-[10px] font-black text-mylms-purple uppercase tracking-widest">{partner.scholarships_count || 0} Programs</span>
                           <ChevronRight size={16} className="text-gray-200 group-hover:translate-x-1 transition-all" />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'scholarships' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {scholarships.map(scholarship => (
                  <div key={scholarship.id} className="bg-white p-8 rounded-[32px] border border-border-soft shadow-sm hover:shadow-xl transition-all group border-t-8 border-t-mylms-rose">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-mylms-rose/5 rounded-xl flex items-center justify-center text-mylms-rose">
                           <Award size={24} />
                        </div>
                        <span className="text-lg font-black text-text-main">{scholarship.currency} {Number(scholarship.amount).toLocaleString()}</span>
                     </div>
                     <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-2">{scholarship.title}</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Partner: {scholarship.partner?.name || 'Institutional'}</p>
                     
                     <button className="w-full py-4 bg-offwhite group-hover:bg-mylms-purple group-hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">
                        Manage Program
                     </button>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {/* Modals */}
      {showModal === 'add_partner' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-mylms-purple/40 backdrop-blur-md p-6">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-offwhite flex justify-between items-center">
                 <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">Onboard Partner</h2>
                 <button onClick={() => setShowModal(null)} className="p-2 hover:bg-offwhite rounded-full transition-all text-gray-400"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleAddPartner} className="p-10 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Partner Organization Name</label>
                    <input 
                      required
                      value={partnerForm.name}
                      onChange={e => setPartnerForm({...partnerForm, name: e.target.value})}
                      className="w-full p-5 bg-offwhite border-2 border-transparent focus:border-mylms-purple rounded-2xl outline-none transition-all font-bold text-sm"
                      placeholder="e.g. Ford Foundation"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Contact Email</label>
                        <input 
                          type="email"
                          value={partnerForm.email}
                          onChange={e => setPartnerForm({...partnerForm, email: e.target.value})}
                          className="w-full p-5 bg-offwhite border-2 border-transparent focus:border-mylms-purple rounded-2xl outline-none transition-all font-bold text-sm"
                          placeholder="partners@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Web Portal</label>
                        <input 
                          type="url"
                          value={partnerForm.website}
                          onChange={e => setPartnerForm({...partnerForm, website: e.target.value})}
                          className="w-full p-5 bg-offwhite border-2 border-transparent focus:border-mylms-purple rounded-2xl outline-none transition-all font-bold text-sm"
                          placeholder="https://..."
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Internal Description</label>
                    <textarea 
                      value={partnerForm.description}
                      onChange={e => setPartnerForm({...partnerForm, description: e.target.value})}
                      className="w-full p-5 bg-offwhite border-2 border-transparent focus:border-mylms-purple rounded-2xl outline-none transition-all font-bold text-sm h-32 resize-none"
                    />
                 </div>
                 <button 
                   disabled={submitting}
                   className="w-full py-6 bg-mylms-purple text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[24px] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Synchronize Partner Registry'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {showModal === 'add_scholarship' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-mylms-purple/40 backdrop-blur-md p-6">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-offwhite flex justify-between items-center">
                 <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">Define Program</h2>
                 <button onClick={() => setShowModal(null)} className="p-2 hover:bg-offwhite rounded-full transition-all text-gray-400"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleAddScholarship} className="p-10 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Funding Partner</label>
                    <select 
                      required
                      value={scholarshipForm.scholarship_partner_id}
                      onChange={e => setScholarshipForm({...scholarshipForm, scholarship_partner_id: e.target.value})}
                      className="w-full p-5 bg-offwhite border-2 border-transparent focus:border-mylms-purple rounded-2xl outline-none transition-all font-bold text-sm appearance-none"
                    >
                       <option value="">Select Partner...</option>
                       {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Program Title</label>
                    <input 
                      required
                      value={scholarshipForm.title}
                      onChange={e => setScholarshipForm({...scholarshipForm, title: e.target.value})}
                      className="w-full p-5 bg-offwhite border-2 border-transparent focus:border-mylms-purple rounded-2xl outline-none transition-all font-bold text-sm"
                      placeholder="e.g. Merit-Based Academic Grant"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Base Amount</label>
                        <input 
                          type="number"
                          required
                          value={scholarshipForm.amount}
                          onChange={e => setScholarshipForm({...scholarshipForm, amount: e.target.value})}
                          className="w-full p-5 bg-offwhite border-2 border-transparent focus:border-mylms-purple rounded-2xl outline-none transition-all font-bold text-sm"
                          placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Currency</label>
                        <select 
                          value={scholarshipForm.currency}
                          onChange={e => setScholarshipForm({...scholarshipForm, currency: e.target.value})}
                          className="w-full p-5 bg-offwhite border-2 border-transparent focus:border-mylms-purple rounded-2xl outline-none transition-all font-bold text-sm"
                        >
                           <option value="USD">USD</option>
                           <option value="NGN">NGN</option>
                           <option value="GBP">GBP</option>
                           <option value="EUR">EUR</option>
                        </select>
                    </div>
                 </div>
                 <button 
                   disabled={submitting}
                   className="w-full py-6 bg-mylms-purple text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[24px] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Authorize Scholarship Program'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
