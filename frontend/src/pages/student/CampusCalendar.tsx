import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Bell,
  ArrowRight,
  Printer,
  TrendingUp
} from 'lucide-react';

const ACADEMIC_EVENTS = [
  { id: 1, title: 'Session Registration Opens', date: '2026-04-10', type: 'ADMIN', description: 'Early registration for AY2026-T4 opens at 09:00 AM (GMT-5).' },
  { id: 2, title: 'Unit 1 Assignment Deadline', date: '2026-04-14', type: 'ACADEMIC', description: 'Final submission window for Unit 1 assessments in CS101 and BUS202.' },
  { id: 3, title: 'Bursar Clearance Deadline', date: '2026-04-20', type: 'FINANCE', description: 'MyLMS deadline for current term fee payments and scholarship audits.' },
];

export default function CampusCalendar() {
  const [currentMonth] = useState(new Date());

  // Simple calendar generator for the current month
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Header Area */}
      <div className="mb-12 border-b border-border-soft pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <div className="flex items-center gap-3 mb-4 text-mylms-purple font-black uppercase tracking-[0.4em] text-[9px]">
               <CalendarIcon className="opacity-50" size={14} />
               Session AY2026-T3 Timeline
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase leading-none">Campus Calendar</h1>
            <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest mt-3">Registry events and unit deadlines for the MyLMS learning network.</p>
         </div>
         <div className="flex gap-4">
            <button className="btn-minimal px-6 py-2.5 flex items-center gap-2">
               <Printer size={14} />
               Export PDF
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
         
         {/* Calendar Grid View */}
         <div className="lg:col-span-3 space-y-12">
            <div className="bg-white border border-border-soft rounded-xl shadow-sm overflow-hidden border-t-8 border-t-mylms-purple transition-all">
               <div className="px-10 py-6 border-b border-border-soft flex items-center justify-between bg-white transition-all">
                  <h3 className="text-[11px] font-black uppercase text-text-main tracking-[0.3em] flex items-center gap-2">
                     <Clock size={16} className="text-mylms-rose" />
                     Academic Ledger: {monthName} {year}
                  </h3>
                  <div className="flex items-center gap-6">
                     <button className="text-gray-400 hover:text-mylms-purple transition-all p-2 rounded-lg border border-transparent hover:border-border-soft"><ChevronLeft size={20} /></button>
                     <button className="text-gray-400 hover:text-mylms-purple transition-all p-2 rounded-lg border border-transparent hover:border-border-soft"><ChevronRight size={20} /></button>
                  </div>
               </div>

               <div className="p-10">
                  <div className="grid grid-cols-7 mb-4 border-b border-border-soft pb-4">
                     {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
                     ))}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                      {/* Placeholders for previous month days */}
                      {Array.from({ length: firstDayOfMonth(year, currentMonth.getMonth()) }).map((_, i) => (
                        <div key={`prev-${i}`} className="h-24 bg-offwhite/30 rounded-lg border border-dashed border-border-soft opacity-20"></div>
                      ))}
                      {/* Current month days */}
                      {Array.from({ length: daysInMonth(year, currentMonth.getMonth()) }).map((_, i) => (
                        <div key={i + 1} className="h-24 bg-white border border-border-soft rounded-xl p-3 flex flex-col items-center justify-center group hover:border-mylms-purple hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-6 h-6 bg-offwhite rounded-bl-full group-hover:bg-mylms-purple/5 transition-all"></div>
                           <span className="text-lg font-black text-text-secondary group-hover:text-mylms-purple transition-colors">{i + 1}</span>
                           {(i + 1) % 12 === 0 && <div className="mt-2 w-1.5 h-1.5 bg-mylms-rose rounded-full shadow-lg"></div>}
                        </div>
                      ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar: Event Details & Checklists */}
         <div className="space-y-10">
            <div>
               <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] mb-10 flex items-center gap-2">
                  <Bell size={14} className="text-mylms-rose opacity-50" />
                  Upcoming Ledger Items
               </h3>

               <div className="space-y-6">
                  {ACADEMIC_EVENTS.map(event => (
                     <div key={event.id} className="bg-white border border-border-soft rounded-xl p-8 group hover:border-mylms-purple/20 transition-all shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                           <p className="text-[9px] font-black text-mylms-rose uppercase tracking-widest">{event.type}</p>
                           <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{event.date}</p>
                        </div>
                        <h4 className="text-sm font-black text-text-main uppercase tracking-tight mb-4 group-hover:text-mylms-purple transition-colors">{event?.title}</h4>
                        <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed mb-6">{event.description}</p>
                        <div className="flex items-center gap-2 text-[8px] font-black text-mylms-purple uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                           Registry View
                           <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="mt-12 p-10 bg-white border border-border-soft rounded-2xl shadow-sm border-t-8 border-t-mylms-purple group">
               <h3 className="text-[10px] font-black uppercase text-text-main tracking-[0.3em] flex items-center gap-2 mb-8">
                  <TrendingUp size={14} className="text-mylms-rose" />
                  Term Performance
               </h3>
               <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-loose mb-10 group-hover:text-text-main transition-colors">
                  Ensure all course registrations for the current window are finalized and confirmed by the registry board.
               </p>
               <button className="w-full py-3.5 bg-white border border-border-soft text-mylms-purple text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-offwhite transition-all flex items-center justify-center gap-3 shadow-sm font-display">
                  Finalize Registry
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
