import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Clock,
  X,
  Calendar,
  Layers,
  Bell
} from 'lucide-react';

interface InvoiceItem {
  id: number;
  description: string;
  amount: number;
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  created_at: string;
}

interface Invoice {
  id: number;
  total_amount: number;
  amount_paid: number;
  status: string;
  due_date: string;
  items: InvoiceItem[];
  payments: Payment[];
  semester: { name: string; academic_session: { name: string } };
}

export default function StudentBillingPortal() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await client.get('/finance/my-invoices', { headers });
        setInvoices(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Accessing Payment Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen relative">
      
      {/* Welcome Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <div className="bg-gradient-to-br from-pink-50 to-indigo-50 p-12 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full -mr-32 -mt-32"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-mylms-rose/5 blur-3xl rounded-full -ml-32 -mb-32"></div>
                 
                 <div className="relative z-10 space-y-8">
                    <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-green-400 p-4">
                       <ShieldCheck size={48} className="text-green-500" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight mb-4">Welcome to your Payments Space!</h2>
                       <p className="text-sm font-bold text-text-secondary leading-relaxed max-w-lg mx-auto">
                          This space is your go-to hub for managing all your payments effortlessly. Stay informed about upcoming payments and payment statuses to avoid missing deadlines.
                       </p>
                    </div>
                 </div>
              </div>
              <div className="p-12 flex items-center justify-center gap-6">
                 <button onClick={() => setShowModal(false)} className="px-12 py-5 bg-mylms-rose text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl hover:bg-[#A00E26] transition-all active:scale-95">Start Tour</button>
                 <button onClick={() => setShowModal(false)} className="px-12 py-5 bg-white border-2 border-border-soft text-text-main text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-offwhite transition-all active:scale-95">Skip For Now</button>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-gray-300 hover:text-mylms-rose transition-colors"
              >
                <X size={24} />
              </button>
           </div>
        </div>
      )}

      {/* Header Utilities */}
      <div className="flex justify-between items-center mb-10">
         <h1 className="text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight">Payments</h1>
         <div className="flex gap-4">
            <button className="p-3 rounded-lg bg-white border border-border-soft text-mylms-purple transition-all shadow-sm hover:shadow-md">
               <Calendar size={18} />
            </button>
            <button className="p-3 rounded-lg bg-white border border-border-soft text-mylms-purple transition-all shadow-sm hover:shadow-md">
               <Layers size={18} />
            </button>
            <button className="p-3 rounded-lg bg-white border border-border-soft text-mylms-purple transition-all shadow-sm hover:shadow-md">
               <Bell size={18} />
            </button>
         </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-border-soft mb-12 overflow-x-auto no-scrollbar">
         {["Upcoming Payments", "Payment History", "Statement of Account", "Payment Methods"].map((tab, i) => (
            <button key={tab} className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'text-mylms-rose border-b-2 border-mylms-rose' : 'text-gray-400 hover:text-mylms-purple'}`}>
               {tab}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Main Payments Flow */}
         <div className="lg:col-span-2 space-y-10">
            <div>
               <h3 className="text-[11px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-4">Upcoming Payments</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10">Quick overview of your current financial commitments.</p>

               {invoices.length === 0 ? (
                  <div className="py-24 text-center bg-offwhite border border-border-soft rounded-2xl opacity-60">
                     <Clock size={40} className="text-gray-200 mx-auto mb-6" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No pending assessments identified.</p>
                  </div>
               ) : (
                  <div className="space-y-6">
                     {invoices.map((inv) => (
                        <div key={inv.id} className="bg-white rounded-2xl border border-border-soft shadow-sm p-10 flex flex-col md:flex-row justify-between items-center gap-10 hover:border-mylms-purple/20 transition-all">
                           <div className="flex items-center gap-10 grow">
                              <div className="w-5 h-5 border-2 border-border-soft rounded-md cursor-pointer hover:border-mylms-rose"></div>
                              <div>
                                 <h4 className="text-lg font-serif font-black text-text-main mb-2 uppercase tracking-tight">{inv.semester?.name} Assessment</h4>
                                 <p className="text-[9px] font-black text-mylms-rose uppercase tracking-[0.2em]">{inv.items?.[0]?.description || 'Instructional Fee'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-16 text-right">
                              <div>
                                 <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2">Due Date</p>
                                 <p className="text-[11px] font-black text-text-secondary uppercase">{new Date(inv.due_date).toLocaleDateString()}</p>
                              </div>
                              <div className="w-px h-10 bg-border-soft"></div>
                              <div>
                                 <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2">Amount</p>
                                 <p className="text-2xl font-serif font-black text-mylms-purple">${inv.total_amount.toLocaleString()}</p>
                              </div>
                              <button className="p-4 bg-offwhite text-mylms-purple rounded-xl hover:bg-mylms-purple hover:text-white transition-all">
                                 <ArrowRight size={20} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Overview Sidebar */}
         <div className="space-y-10">
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-10">
               <h4 className="text-[11px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-8">Payment Overview</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose mb-10">Select an upcoming payment to initiate the settlement protocol.</p>
               
               <div className="py-24 flex flex-col items-center justify-center border-t border-border-soft opacity-30">
                  <CreditCard size={40} className="text-gray-300 mb-6" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Selection</p>
               </div>
            </div>

            <div className="p-8 bg-mylms-purple/5 border border-mylms-purple/10 rounded-2xl">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-mylms-rose flex items-center justify-center text-white shadow-lg">
                     <AlertCircle size={20} />
                  </div>
                  <p className="text-[11px] font-black text-mylms-purple uppercase tracking-tight">Support Notice</p>
               </div>
               <p className="text-[10px] font-bold text-text-secondary leading-loose uppercase tracking-widest">
                  Payments are processed securely via institutional-grade encryption. For billing adjustments, please contact the <span className="text-mylms-rose font-black">Bursar Registry</span>.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
