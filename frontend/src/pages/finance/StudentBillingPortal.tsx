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
  Bell,
  CheckCircle,
  TrendingDown,
  Plus,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

declare global {
  interface Window {
    turnstile: any;
  }
}

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
  const [activeTab, setActiveTab] = useState('Upcoming Payments');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<any>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { notify } = useNotificationStore();

  const TABS = ["Upcoming Payments", "Payment History", "Statement of Account", "Payment Methods"];

  useEffect(() => {
    const initData = async () => {
      try {
        const [invRes, gateRes] = await Promise.all([
          client.get('/finance/my-invoices', { headers }),
          client.get('/finance/gateways', { headers })
        ]);
        setInvoices(invRes.data);
        setGatewayConfig(gateRes.data);
        
        if (gateRes.data?.turnstile?.enabled) {
          loadTurnstile();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const loadTurnstile = () => {
    if (document.getElementById('turnstile-script')) return;
    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  useEffect(() => {
    if (selectedInvoice && gatewayConfig?.turnstile?.enabled && window.turnstile) {
       // Render Turnstile when an invoice is selected
       setTimeout(() => {
         const container = document.getElementById('turnstile-container');
         if (container && container.innerHTML === '') {
           window.turnstile.render('#turnstile-container', {
             sitekey: gatewayConfig.turnstile.site_key,
             callback: (token: string) => setTurnstileToken(token),
           });
         }
       }, 500);
    }
  }, [selectedInvoice, gatewayConfig]);

  const handleInitializePayment = async (gateway: string) => {
    if (!selectedInvoice) return;
    
    setInitializingPayment(true);
    try {
      const res = await client.post(`/finance/invoices/${selectedInvoice.id}/pay`, {
        gateway,
        turnstile_token: turnstileToken
      }, { headers });

      // Handle Redirects
      const url = res.data.authorization_url || res.data.link || res.data.url;
      if (url) {
        window.location.href = url;
      } else {
        notify('Payment Initialization Failed', 'error');
      }
    } catch (err: any) {
      notify(err.response?.data?.message || 'Settlement Protocol Error', 'error');
    } finally {
      setInitializingPayment(false);
    }
  };

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
      <div className="flex justify-between items-center mb-12">
         <div>
            <h1 className="text-3xl font-black text-mylms-purple uppercase tracking-tighter italic leading-none mb-2">Financial Hub</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Registry & Settlement Protocol</p>
         </div>
         <div className="flex gap-3">
            <button 
              onClick={() => notify("Academic Calendar: Syncing dates...", "success")}
              className="p-3.5 rounded-xl bg-white border border-border-soft text-mylms-purple transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
               <Calendar size={18} />
            </button>
            <button 
              onClick={() => notify("Registry Layers: Initializing data stack...", "success")}
              className="p-3.5 rounded-xl bg-white border border-border-soft text-mylms-purple transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
               <Layers size={18} />
            </button>
            <button 
              onClick={() => notify("Notification Center: 0 pending transmissions identified.", "success")}
              className="p-3.5 rounded-xl bg-mylms-rose/5 border border-mylms-rose/10 text-mylms-rose transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
               <Bell size={18} />
            </button>
         </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-border-soft mb-12 overflow-x-auto no-scrollbar gap-2">
         {TABS.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all rounded-t-2xl ${
                activeTab === tab 
                  ? 'bg-mylms-purple text-white shadow-lg translate-y-[-2px]' 
                  : 'text-gray-400 hover:text-mylms-purple hover:bg-offwhite'
              }`}
            >
               {tab}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
         <div className="lg:col-span-2 space-y-10">
            {activeTab === 'Upcoming Payments' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10">
                   <h3 className="text-sm font-black text-mylms-purple uppercase tracking-tight italic mb-2">Upcoming Transitions</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active financial commitments awaiting settlement protocol.</p>
                </div>

                {invoices.length === 0 ? (
                   <div className="py-20 text-center bg-white border border-border-soft rounded-[32px] shadow-sm opacity-60">
                      <Clock size={40} className="text-gray-200 mx-auto mb-6" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No pending assessments located.</p>
                   </div>
                ) : (
                   <div className="space-y-6">
                      {invoices.map((inv) => (
                         <div key={inv.id} className="bg-white rounded-[32px] border border-border-soft shadow-sm p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:border-mylms-purple/20 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-mylms-purple/5 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="flex items-center gap-8 grow relative z-10">
                               <div className="w-6 h-6 border-2 border-border-soft rounded-lg cursor-pointer hover:border-mylms-rose transition-all flex items-center justify-center group-hover:bg-mylms-rose/10 group-hover:border-mylms-rose shadow-inner">
                                  <Plus size={10} className="text-mylms-rose opacity-0 group-hover:opacity-100" />
                               </div>
                               <div>
                                  <h4 className="text-lg font-black text-text-main mb-1 uppercase tracking-tighter italic leading-none">{inv.semester?.name} Assessment</h4>
                                  <p className="text-[9px] font-black text-mylms-rose uppercase tracking-[0.2em] opacity-60">{inv.items?.[0]?.description || 'Instructional Fee Registry'}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-10 text-right relative z-10">
                               <div className="hidden sm:block">
                                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2 italic">Due Date</p>
                                  <p className="text-[10px] font-black text-text-secondary uppercase">{new Date(inv.due_date).toLocaleDateString()}</p>
                               </div>
                               <div className="hidden sm:block w-px h-8 bg-border-soft"></div>
                                 <div>
                                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 italic">Amount</p>
                                  <p className="text-2xl font-black text-mylms-purple uppercase tracking-tighter leading-none">${inv.total_amount.toLocaleString()}</p>
                               </div>
                               <button 
                                 onClick={() => setSelectedInvoice(inv)}
                                 className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center shadow-sm ${selectedInvoice?.id === inv.id ? 'bg-mylms-rose text-white' : 'bg-offwhite text-mylms-purple hover:bg-mylms-purple hover:text-white'}`}
                               >
                                  <ArrowRight size={18} />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
              </div>
            )}

            {activeTab === 'Payment History' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="mb-10 text-left">
                    <h3 className="text-sm font-black text-mylms-purple uppercase tracking-tight italic mb-2">Historical Transmissions</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Inventory of all secured settlements and archival receipts.</p>
                 </div>
                 
                 {invoices.flatMap(inv => inv.payments).length === 0 ? (
                    <div className="py-20 text-center bg-white border border-border-soft rounded-[32px] opacity-60 shadow-sm">
                       <History size={40} className="text-gray-200 mx-auto mb-6" />
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No historical payments identified.</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {invoices.flatMap(inv => inv.payments).map((pay, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-2xl border border-border-soft flex items-center justify-between hover:shadow-md transition-all group">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shadow-inner">
                                   <CheckCircle size={20} />
                                </div>
                                <div>
                                   <p className="text-[11px] font-black text-text-main uppercase tracking-tight">Transmission #{pay.transaction_id.slice(-8).toUpperCase()}</p>
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{new Date(pay.created_at).toLocaleDateString()} | {pay.payment_method}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[14px] font-black text-green-600 uppercase tracking-tighter italic">+${pay.amount.toLocaleString()}</p>
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Confirmed Protocol</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
            )}

            {activeTab === 'Statement of Account' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                 <div className="mb-6">
                    <h3 className="text-sm font-black text-mylms-purple uppercase tracking-tight italic mb-2">Institutional Statement</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Archival consolidation of all scholastic financial records.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-mylms-purple text-white rounded-[32px] shadow-xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full group-hover:scale-150 transition-transform duration-1000"></div>
                       <FileSpreadsheet className="text-white/20 mb-10" size={32} />
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Total Scholastic Debt</p>
                       <p className="text-4xl font-black italic tracking-tighter">${invoices.reduce((acc, inv) => acc + inv.total_amount, 0).toLocaleString()}</p>
                    </div>
                    <div className="p-8 bg-offwhite border-2 border-green-100 rounded-[32px] shadow-sm flex flex-col justify-between">
                       <div>
                          <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.4em] mb-2">Total Settled</p>
                          <p className="text-4xl font-black text-mylms-purple italic tracking-tighter">${invoices.reduce((acc, inv) => acc + inv.amount_paid, 0).toLocaleString()}</p>
                       </div>
                       <div className="mt-8 pt-6 border-t border-green-50 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-[9px] font-black text-green-700 uppercase tracking-widest italic">Registry in Compliance</span>
                       </div>
                    </div>
                 </div>

                 <div className="p-10 bg-white rounded-[40px] border border-border-soft shadow-inner">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8 italic">Breakdown Analysis</h4>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                          <span className="text-gray-400">Archival Assessments</span>
                          <span className="text-mylms-purple">{invoices.length} Records Identified</span>
                       </div>
                       <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                          <span className="text-gray-400">Total Transmissions</span>
                          <span className="text-mylms-purple">{invoices.flatMap(i => i.payments).length} Confirmed Protocols</span>
                       </div>
                       <div className="flex justify-between items-center border-t border-offwhite pt-6 text-[11px] font-black uppercase tracking-tight">
                          <span className="text-gray-400 italic">Net Outstanding Protocol</span>
                          <span className="text-mylms-rose text-lg tracking-tighter italic">
                             ${(invoices.reduce((acc, inv) => acc + inv.total_amount, 0) - invoices.reduce((acc, inv) => acc + inv.amount_paid, 0)).toLocaleString()}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'Payment Methods' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                 <div className="flex justify-between items-end mb-10">
                    <div>
                       <h3 className="text-sm font-black text-mylms-purple uppercase tracking-tight italic mb-2">Settlement Protocols</h3>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Manage your institutional-grade payment methods.</p>
                    </div>
                 </div>

                 <div className="py-16 text-center bg-white border border-dashed border-border-soft rounded-[32px] flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-offwhite flex items-center justify-center text-gray-300">
                       <CreditCard size={28} />
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No saved payment methods on file.</p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] max-w-xs leading-relaxed">
                       Payment methods are managed directly through the gateway during checkout. Contact the Bursar for manual arrangements.
                    </p>
                 </div>

                 <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-6">
                    <ShieldCheck size={28} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-widest opacity-80">
                       Institutional standards require 3D-Secure 2.0 verification for all new card protocols. Your data is encrypted at rest and in transit.
                    </p>
                 </div>
              </div>
            )}
         </div>

          {/* Overview Sidebar */}
          <div className="space-y-10 animate-in fade-in slide-in-from-right duration-700">
            <div className="bg-white rounded-[32px] border border-border-soft shadow-xl p-10 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-2 h-full bg-mylms-rose opacity-20"></div>
               <h4 className="text-[10px] font-black text-mylms-purple uppercase tracking-[0.4em] mb-6 italic opacity-60">Settlement Protocol</h4>
               
               {!selectedInvoice ? (
                  <>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] leading-loose mb-10">Select an active assessment to initiate the archival settlement process.</p>
                    <div className="py-12 flex flex-col items-center justify-center border-y border-offwhite group-hover:bg-offwhite transition-all rounded-3xl">
                        <div className="w-20 h-20 bg-mylms-purple/5 text-mylms-purple rounded-full flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 transition-transform duration-500">
                          <CreditCard size={32} />
                        </div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Awaiting Selection</p>
                    </div>
                  </>
               ) : (
                  <div className="animate-in fade-in slide-in-from-top-4">
                     <div className="mb-8 p-6 bg-offwhite rounded-2xl border border-border-soft">
                        <p className="text-[8px] font-black text-mylms-rose uppercase tracking-[0.3em] mb-2">Target Invoice</p>
                        <p className="text-sm font-black text-text-main uppercase tracking-tight italic">Semester {selectedInvoice.semester?.name} Assessment</p>
                        <p className="text-2xl font-black text-mylms-purple mt-4 tracking-tighter">${selectedInvoice.total_amount.toLocaleString()}</p>
                     </div>

                     {gatewayConfig?.turnstile?.enabled && (
                        <div className="mb-8 overflow-hidden rounded-xl border border-border-soft">
                           <div id="turnstile-container" className="flex justify-center py-2 bg-offwhite/50"></div>
                           <p className="text-[7px] text-center font-black text-gray-300 uppercase tracking-widest py-2 bg-white">Protected by Turnstile Security Layer</p>
                        </div>
                     )}

                     <div className="space-y-4">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Select Settlement Provider:</p>
                        
                        {gatewayConfig?.paystack?.enabled && (
                          <button 
                            onClick={() => handleInitializePayment('paystack')}
                            disabled={initializingPayment || (gatewayConfig.turnstile.enabled && !turnstileToken)}
                            className="w-full py-5 bg-white border-2 border-border-soft text-text-main font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-4 group/btn shadow-sm"
                          >
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                             Paystack Gateway
                             <ArrowRight size={14} className="opacity-0 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                          </button>
                        )}

                        {gatewayConfig?.flutterwave?.enabled && (
                          <button 
                            onClick={() => handleInitializePayment('flutterwave')}
                            disabled={initializingPayment || (gatewayConfig.turnstile.enabled && !turnstileToken)}
                            className="w-full py-5 bg-white border-2 border-border-soft text-text-main font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-4 group/btn shadow-sm"
                          >
                             <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                             Flutterwave Secure
                             <ArrowRight size={14} className="opacity-0 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                          </button>
                        )}

                        {!gatewayConfig?.paystack?.enabled && !gatewayConfig?.flutterwave?.enabled && (
                           <div className="p-6 bg-mylms-rose/5 border border-mylms-rose/10 rounded-2xl text-center">
                              <p className="text-[10px] font-black text-mylms-rose uppercase tracking-widest opacity-60">Settlement Gateway Off-line</p>
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>

            <div className="p-8 bg-mylms-purple text-white rounded-[32px] shadow-2xl relative overflow-hidden group border border-white/10">
               <div className="absolute bottom-0 right-0 w-48 h-48 bg-mylms-rose/10 rounded-tl-full blur-3xl pointer-events-none"></div>
               <div className="flex items-center gap-5 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-mylms-rose shadow-lg border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                     <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">Custodian Notice</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">Transparency Protocol</p>
                  </div>
               </div>
               <p className="text-[10px] font-medium text-white/70 leading-loose uppercase tracking-[0.15em] italic font-sans">
                  Payments are processed via institutional-grade encrypted gateways. For bursary adjustments, contact the <span className="text-mylms-rose font-black shadow-mylms-rose/40 shadow-sm">Registry Bursar</span>.
               </p>
            </div>
          </div>
      </div>
    </div>
  );
}
