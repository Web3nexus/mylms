import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  TrendingUp, 
  AlertCircle, 
  Download, 
  PlusCircle, 
  ShieldCheck, 
  Activity,
  Layers,
  CreditCard
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAppConfig } from '../../hooks/useAppConfig';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Semester {
  id: number;
  name: string;
  academic_session: { name: string };
}

interface Invoice {
  id: number;
  total_amount: number;
  amount_paid: number;
  status: string;
  due_date: string;
  user: User;
  semester: Semester;
}

interface Metrics {
  expected_revenue: number;
  collected_revenue: number;
  outstanding_balance: number;
}

interface GatewayPerformance {
  payment_method: string;
  total_collected: number;
  count: number;
}

interface FinanceData {
  metrics: Metrics;
  gateway_performance: GatewayPerformance[];
  recent_invoices: Invoice[];
}

export default function AdminFinanceDashboard() {
  const { appName } = useAppConfig();
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  // States for generating invoices manually
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [targetSemesterId, setTargetSemesterId] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await client.get('/finance/dashboard', { headers });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { notify } = useNotificationStore();

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await client.post('/finance/invoices/generate', {
        user_id: targetUserId,
        semester_id: targetSemesterId
      }, { headers });
      
      setShowGenerateModal(false);
      setTargetUserId('');
      setTargetSemesterId('');
      notify("Financial Registry: Invoice successfully provisioned for the requested scholar.", "success");
      fetchDashboard();
    } catch (err: any) {
      console.error(err);
      notify(err.response?.data?.message || 'Financial Registry: Failed to authorize invoice provision.', "error");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-offwhite">
        <div className="w-12 h-12 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.3em] text-[10px]">Accessing Financial Analytics...</p>
      </div>
    );
  }

  const progressPercentage = data?.metrics.expected_revenue 
    ? (data.metrics.collected_revenue / data.metrics.expected_revenue) * 100 
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Bursar Header Area */}
      <div className="mb-12 border-b border-border-soft pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
               <CreditCard className="opacity-50" size={16} />
               {appName} Bursar Records
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Finance Control</h1>
            <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest mt-4">Official revenue lifecycle and assessment management.</p>
         </div>
         <button 
           onClick={() => setShowGenerateModal(true)}
           className="btn-purple flex items-center gap-2 px-10 py-3.5"
         >
           <PlusCircle size={16} />
           Provision Billing
         </button>
      </div>

      {/* High Fidelity Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
         {/* Receivables Projection */}
         <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative overflow-hidden group hover:border-mylms-purple/20 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Assessment Principal</p>
            <p className="text-3xl font-black text-text-main font-mono tracking-tighter">${data?.metrics.expected_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-3 mb-2">Total Projected Levy</p>
            <div className="flex items-center gap-2 text-[8px] font-black text-text-secondary uppercase tracking-widest bg-offwhite w-fit px-3 py-1 rounded-lg">
               <Activity size={10} className="text-mylms-rose" />
               Calculated Registry Data
            </div>
         </div>

         {/* Collected Liquidity */}
         <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative overflow-hidden group hover:border-mylms-purple/20 transition-all border-t-8 border-t-mylms-purple">
            <p className="text-[9px] font-black uppercase text-mylms-purple tracking-[0.3em] mb-4">Realized Collection</p>
            <p className="text-3xl font-black text-text-main font-mono tracking-tighter">${data?.metrics.collected_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            
            <div className="w-full bg-offwhite h-1.5 rounded-full mt-6 overflow-hidden border border-gray-100 shadow-inner">
               <div className="bg-mylms-purple h-full transition-all duration-1000 group-hover:bg-mylms-rose" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-3">
               <p className="text-[9px] font-black text-mylms-purple uppercase tracking-widest">{progressPercentage.toFixed(1)}% Realization</p>
               <TrendingUp size={12} className="text-mylms-rose" />
            </div>
         </div>

         {/* Outstanding Deficit */}
         <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm relative overflow-hidden group hover:border-mylms-purple/20 transition-all">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Deficit Registry</p>
            <p className="text-3xl font-black text-mylms-rose font-mono tracking-tighter">${data?.metrics.outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-[9px] font-black text-mylms-rose uppercase tracking-widest mt-3 mb-2 opacity-60">Aggregate Unsettled</p>
            <div className="flex items-center gap-2 text-[8px] font-black text-mylms-rose uppercase tracking-widest bg-mylms-rose/5 w-fit px-3 py-1 rounded-lg">
               <AlertCircle size={10} />
               Urgent Collection Window
            </div>
         </div>
      </div>

      {/* Gateway Connectivity & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
         {['stripe', 'paystack', 'flutterwave'].map(gw => {
           const performance = data?.gateway_performance.find(p => p.payment_method === gw);
           return (
             <div key={gw} className="bg-white p-6 rounded-2xl border border-border-soft flex items-center justify-between group hover:border-mylms-purple transition-all shadow-sm">
               <div>
                 <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.4em] mb-3">{gw} Registry</p>
                 <p className="text-xl font-black text-text-main font-mono">${(performance?.total_collected || 0).toLocaleString()} <span className="text-[10px] text-gray-300">USD</span></p>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                    Online
                 </span>
                 <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{performance?.count || 0} Unified Txns</span>
               </div>
             </div>
           );
         })}
      </div>

      {/* Registry Table Hub */}
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary flex items-center gap-3">
           <Layers size={14} className="text-mylms-purple" />
           {appName} Billing Registry
        </h3>
        <button className="text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-mylms-purple transition-colors flex items-center gap-2">
           Full Export
           <Download size={14} />
        </button>
      </div>
      
      <div className="bg-white border border-border-soft rounded-2xl shadow-sm overflow-hidden group hover:border-mylms-purple/20 transition-all">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-offwhite border-b border-border-soft">
                     <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-text-secondary">Scholar & Term Identification</th>
                     <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-text-secondary">Total Levy</th>
                     <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-text-secondary">Method</th>
                     <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-text-secondary">Status</th>
                     <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-text-secondary text-right">Registry ID</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-offwhite bg-white">
                  {data?.recent_invoices.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="px-10 py-32 text-center">
                           <Layers size={48} className="text-gray-100 mx-auto mb-8" />
                           <p className="text-gray-300 font-black text-[10px] uppercase tracking-[0.4em] leading-loose">No transaction records identified in the central registry.</p>
                        </td>
                     </tr>
                  ) : (
                     data?.recent_invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-offwhite/50 transition-all group/row border-l-8 border-transparent hover:border-mylms-purple">
                           <td className="px-10 py-8">
                              <p className="font-black text-text-main text-[12px] leading-tight uppercase group-hover/row:text-mylms-purple transition-colors">{inv.user?.name}</p>
                              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2">{inv.semester?.name}</p>
                           </td>
                           <td className="px-10 py-8">
                              <span className="font-black text-text-main text-lg font-mono tracking-tighter group-hover/row:text-mylms-rose transition-colors">${inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-mylms-purple uppercase tracking-widest">
                                    {(inv as any).payments?.[0]?.payment_method || '---'}
                                 </span>
                                 <span className="text-[8px] font-bold text-gray-300 font-mono mt-1">
                                    {(inv as any).payments?.[0]?.transaction_id?.substring(0, 10) || 'NO_TXN'}
                                 </span>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <span className={`px-4 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest shadow-sm ${
                                 inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' :
                                 inv.status === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                 'bg-offwhite text-text-secondary border-border-soft'
                              }`}>
                                 {inv.status}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <p className="text-[10px] font-black text-text-main font-mono tracking-tighter opacity-40 group-hover/row:opacity-100 transition-opacity">INVC-ML-{inv.id.toString().padStart(8, '0')}</p>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Manual Billing Generation Module */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-text-main/80 backdrop-blur-md transition-all">
          <div className="bg-white rounded-2xl border border-border-soft p-12 w-full max-w-xl shadow-2xl relative overflow-hidden group/modal">
            <div className="absolute top-0 right-0 w-32 h-32 bg-offwhite rounded-bl-full group-hover/modal:bg-mylms-purple/5 transition-all"></div>
            
            <div className="mb-12 relative z-10">
               <h3 className="text-2xl font-black text-text-main tracking-tighter uppercase mb-3">Provision Billing Record</h3>
               <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest leading-loose">Authorized mapping of academic assessment based on validated credit registration records.</p>
            </div>
            
            <form onSubmit={handleGenerateInvoice} className="relative z-10">
              <div className="space-y-8 mb-12">
                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Scholar Registry ID</label>
                  <input 
                    type="number" 
                    required 
                    value={targetUserId} 
                    onChange={e => setTargetUserId(e.target.value)} 
                    placeholder="e.g. 00482" 
                    className="w-full bg-offwhite text-text-main font-black p-5 rounded-xl border border-border-soft outline-none focus:border-mylms-purple transition-all text-sm placeholder:text-gray-200 shadow-inner" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Term Authority ID</label>
                  <input 
                    type="number" 
                    required 
                    value={targetSemesterId} 
                    onChange={e => setTargetSemesterId(e.target.value)} 
                    placeholder="e.g. 101" 
                    className="w-full bg-offwhite text-text-main font-black p-5 rounded-xl border border-border-soft outline-none focus:border-mylms-purple transition-all text-sm placeholder:text-gray-200 shadow-inner" 
                  />
                </div>
              </div>
              <div className="flex gap-6 justify-end pt-8 border-t border-border-soft">
                <button type="button" onClick={() => setShowGenerateModal(false)} className="px-10 py-3.5 text-text-secondary font-black hover:text-text-main transition-colors uppercase tracking-[0.2em] text-[10px]">Abort</button>
                <button 
                  type="submit" 
                  disabled={generating} 
                  className="btn-purple px-10 py-3.5 flex items-center gap-3 disabled:opacity-50"
               >
                  {generating ? 'Processing Registry...' : 'Authorize Provision'}
                  <ShieldCheck size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
