import { useState } from 'react';
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
  Layers
} from 'lucide-react';

const FORM_TYPES = [
  { id: 'transcript', title: 'Official Transcript Request', description: 'Request a certified hardcopy or digital transcript for external institutions.', icon: <FileText size={20} /> },
  { id: 'deferral', title: 'Academic Deferral', description: 'Suspend your studies for the upcoming term due to extenuating circumstances.', icon: <Clock size={20} /> },
  { id: 'withdraw', title: 'Course Withdrawal', description: 'Formally withdraw from a registered course after the grace period.', icon: <AlertCircle size={20} /> },
  { id: 'id-renewal', title: 'ID Card Renewal', description: 'Request a new physical or digital MyLMS identification card.', icon: <ShieldCheck size={20} /> },
  { id: 'readmission', title: 'Re-admission Form', description: 'Apply for re-admission after a period of academic inactivity.', icon: <FilePlus size={20} /> },
];

export default function SelfServiceForms() {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  // Mock application history
  const history = [
    { id: 'FRM-8271', title: 'Transcript Request', date: '2026-03-20', status: 'PROCESSED', icon: <CheckCircle className="text-green-500" /> },
    { id: 'FRM-9102', title: 'Course Withdrawal (CS101)', date: '2026-03-25', status: 'PENDING', icon: <Clock className="text-amber-500" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Header Area */}
      <div className="mb-12 border-b border-border-soft pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[9px]">
               <Layers className="opacity-50" size={14} />
               MyLMS Registry Desk
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
                    className={`bg-white border transition-all rounded-xl p-8 flex items-center gap-8 group cursor-pointer hover:shadow-md ${activeForm === form.id ? 'ring-2 ring-mylms-purple/10 border-mylms-purple' : 'border-border-soft hover:border-mylms-purple/20'}`}
                  >
                     <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${activeForm === form.id ? 'bg-mylms-purple text-white' : 'bg-offwhite text-text-secondary group-hover:bg-mylms-purple/5 group-hover:text-mylms-purple'}`}>
                        {form.icon}
                     </div>
                     <div className="grow">
                        <h4 className="text-xl font-black text-text-main uppercase tracking-tight leading-none mb-3 group-hover:text-mylms-purple transition-colors">{form.title}</h4>
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
                  {history.map(item => (
                     <div key={item.id} className="bg-white border border-border-soft rounded-xl p-6 shadow-sm flex items-center gap-6 group hover:border-mylms-purple/20 transition-all">
                        <div className="w-10 h-10 bg-offwhite rounded-lg flex items-center justify-center border border-border-soft group-hover:bg-mylms-purple/5 transition-all shadow-inner">
                           {item.icon}
                        </div>
                        <div className="grow">
                           <p className="text-[9px] font-black text-text-main uppercase leading-none mb-2">{item?.title}</p>
                           <div className="flex items-center gap-4">
                              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{item.id}</p>
                              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest border-l border-gray-100 pl-4">{item.date}</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-100 group-hover:text-mylms-purple" />
                     </div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-white border border-border-soft rounded-2xl shadow-sm border-t-8 border-t-mylms-purple relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-16 h-16 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
               <h4 className="text-[10px] font-black text-mylms-purple uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-mylms-rose" />
                  MyLMS Policy
               </h4>
               <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-loose mb-10">
                  All formal requests are processed within 3-5 academic registry cycles (GMT-5). Official transcripts require a verified Bursar clearance.
               </p>
               <button className="w-full py-3.5 bg-mylms-purple text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-mylms-purple/90 transition-all shadow-xl font-display">
                  Registry Knowledge Base
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
