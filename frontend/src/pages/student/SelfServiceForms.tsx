import { useState, useEffect } from 'react';
import React from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FilePlus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  History,
  Layers,
  X,
  Send
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

const FORM_TYPES = [
  { id: 'transcript', title: 'Official Transcript Request', description: 'Request a certified hardcopy or digital transcript for external institutions.', icon: <FileText size={20} /> },
  { id: 'deferral', title: 'Academic Deferral', description: 'Suspend your studies for the upcoming term due to extenuating circumstances.', icon: <Clock size={20} /> },
  { id: 'withdraw', title: 'Course Withdrawal', description: 'Formally withdraw from a registered course after the grace period.', icon: <AlertCircle size={20} /> },
  { id: 'id-renewal', title: 'ID Card Renewal', description: 'Request a new physical or digital identification card.', icon: <ShieldCheck size={20} /> },
  { id: 'readmission', title: 'Re-admission Form', description: 'Apply for re-admission after a period of academic inactivity.', icon: <FilePlus size={20} /> },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  processed: <CheckCircle size={16} className="text-green-500" />,
  pending: <Clock size={16} className="text-amber-500" />,
  processing: <Clock size={16} className="text-blue-400" />,
  rejected: <AlertCircle size={16} className="text-red-400" />,
};

interface FormRequest {
  id: number;
  reference: string;
  type: string;
  status: string;
  created_at: string;
}

export default function SelfServiceForms() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const { notify } = useNotificationStore();

  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<FormRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await client.get('/student/form-requests', { headers });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load form history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeForm) return;
    setSubmitting(true);
    try {
      await client.post('/student/form-requests', { type: activeForm, notes }, { headers });
      notify('Form request submitted successfully. You will receive a confirmation shortly.', 'success');
      setActiveForm(null);
      setNotes('');
      fetchHistory(); // Refresh history
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to submit form request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const activeFormMeta = FORM_TYPES.find(f => f.id === activeForm);

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Form Submission Modal */}
      {activeForm && activeFormMeta && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] max-w-xl w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-border-soft flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-mylms-purple/10 text-mylms-purple rounded-xl flex items-center justify-center">
                  {activeFormMeta.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-main uppercase tracking-tight">{activeFormMeta.title}</h3>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Registry Submission Protocol</p>
                </div>
              </div>
              <button onClick={() => setActiveForm(null)} className="text-gray-300 hover:text-mylms-rose transition-colors p-2">
                <X size={20} />
              </button>
            </div>
            <div className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Supporting Notes <span className="text-gray-300">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Provide any additional context or supporting information for your request..."
                  className="w-full p-5 bg-offwhite border border-border-soft rounded-2xl outline-none focus:border-mylms-purple transition-all text-sm font-medium text-text-main"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-5 bg-mylms-purple text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:bg-mylms-purple/90 transition-all active:scale-95 shadow-lg disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? 'Submitting...' : 'Submit Official Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="mb-12 border-b border-border-soft pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[9px]">
               <Layers className="opacity-50" size={14} />
               Registry Desk
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Self-Service Forms</h1>
            <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest mt-4">Submit and track official academic and administrative requests.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         {/* Forms Directory */}
         <div className="lg:col-span-2 space-y-12">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-2">
               <FilePlus size={14} className="text-mylms-rose opacity-50" />
               New Request Registry
            </h3>

            <div className="grid grid-cols-1 gap-6">
               {FORM_TYPES.map(form => (
                  <div 
                    key={form.id} 
                    onClick={() => setActiveForm(form.id)}
                    className="bg-white border transition-all rounded-xl p-8 flex items-center gap-8 group cursor-pointer hover:shadow-md border-border-soft hover:border-mylms-purple/20"
                  >
                     <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all bg-offwhite text-text-secondary group-hover:bg-mylms-purple/5 group-hover:text-mylms-purple">
                        {form.icon}
                     </div>
                     <div className="grow">
                        <h4 className="text-xl font-black text-text-main uppercase tracking-tight leading-none mb-3 group-hover:text-mylms-purple transition-colors">{form?.title}</h4>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">{form.description}</p>
                     </div>
                     <div className="shrink-0 text-gray-200 group-hover:text-mylms-rose transition-all">
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Right Rail: History & Assistance */}
         <div className="space-y-10">
            <div>
               <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] mb-10 flex items-center gap-2">
                  <History size={14} className="text-mylms-rose opacity-50" />
                  Submission Archive
               </h3>

               <div className="space-y-4">
                  {loadingHistory ? (
                    <div className="py-8 text-center text-[9px] font-black text-gray-300 uppercase tracking-widest">Loading archive...</div>
                  ) : history.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-border-soft rounded-xl">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No submissions yet</p>
                    </div>
                  ) : (
                    history.map(item => (
                      <div key={item.id} className="bg-white border border-border-soft rounded-xl p-6 shadow-sm flex items-center gap-6 group hover:border-mylms-purple/20 transition-all">
                         <div className="w-10 h-10 bg-offwhite rounded-lg flex items-center justify-center border border-border-soft group-hover:bg-mylms-purple/5 transition-all shadow-inner">
                            {STATUS_ICON[item.status] ?? <Clock size={16} className="text-gray-400" />}
                         </div>
                         <div className="grow">
                            <p className="text-[9px] font-black text-text-main uppercase leading-none mb-2">{item.type.replace(/-/g, ' ')}</p>
                            <div className="flex items-center gap-4">
                               <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{item.reference}</p>
                               <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest border-l border-gray-100 pl-4">
                                 {new Date(item.created_at).toLocaleDateString()}
                               </p>
                            </div>
                         </div>
                         <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                           item.status === 'processed' ? 'bg-green-50 text-green-600' :
                           item.status === 'rejected' ? 'bg-red-50 text-red-500' :
                           'bg-amber-50 text-amber-600'
                         }`}>{item.status}</span>
                         <ChevronRight size={14} className="text-gray-100 group-hover:text-mylms-purple" />
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="p-8 bg-white border border-border-soft rounded-2xl shadow-sm border-t-8 border-t-mylms-purple relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
               <h4 className="text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-mylms-rose" />
                  Registry Policy
               </h4>
               <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-loose mb-10">
                  All formal requests are processed within 3-5 academic registry cycles. Official transcripts require a verified Bursar clearance.
               </p>
               <button className="w-full py-3.5 bg-mylms-purple text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-mylms-purple/90 transition-all shadow-xl">
                  Registry Knowledge Base
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
