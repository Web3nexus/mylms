import { 
  ExternalLink, 
  Library, 
  Globe, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Settings, 
  Info,
  Layers,
  Search,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  Menu
} from 'lucide-react';

const LINK_CATEGORIES = [
  {
    title: 'Academic Resources',
    links: [
      { name: 'MyLMS Digital Library', description: 'Access 40k+ scholarly journals and MyLMS textbooks.', icon: <Library size={18} /> },
      { name: 'Syllabus Repository', description: 'Global curriculum index for all undergraduate programs.', icon: <FileText size={18} /> },
      { name: 'Academic Ethics Board', description: 'MyLMS policies on originality and integrity.', icon: <ShieldCheck size={18} /> },
    ]
  },
  {
    title: 'MyLMS Support',
    links: [
      { name: 'Registry Help Desk', description: '24/7 support for admissions and financial aid inquiries.', icon: <HelpCircle size={18} /> },
      { name: 'IT Media Portal', description: 'Technical assistance and platform accessibility tools.', icon: <Settings size={18} /> },
      { name: 'Student Peer Forum', description: 'Connect with matriculated peers in official study groups.', icon: <MessageSquare size={18} /> },
    ]
  },
  {
    title: 'External Directives',
    links: [
      { name: 'Global Accreditation', description: 'Search MyLMS accreditation and compliance records.', icon: <Globe size={18} /> },
      { name: 'Partner Institutions', description: 'Directory of global pathway and relocation partners.', icon: <Info size={18} /> },
    ]
  }
];

export default function UsefulLinks() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-12 min-h-screen transition-all">
      
      {/* Header Area */}
      <div className="mb-12 border-b border-[#E9ECEF] pb-10 flex justify-between items-end">
         <div>
            <div className="flex items-center gap-3 mb-4 text-[#4B345E] font-black uppercase tracking-[0.4em] text-[9px]">
               <ExternalLink className="opacity-50" size={14} />
               MyLMS Resource Center
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">Useful Links</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-3">Direct access to established MyLMS academic and administrative networks.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
         
         {/* Main Links Feed */}
         <div className="lg:col-span-3 space-y-16">
            {LINK_CATEGORIES.map((category, idx) => (
               <div key={idx} className="space-y-10">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-2">
                     <PlusCircle size={14} className="text-[#E90171] opacity-50" />
                     {category?.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {category.links.map((link, lIdx) => (
                        <div key={lIdx} className="bg-white border border-[#E9ECEF] rounded-xl p-8 flex items-start gap-8 group hover:border-[#4B345E]/20 transition-all cursor-pointer relative overflow-hidden shadow-sm">
                           <div className="absolute top-0 right-0 w-12 h-12 bg-[#F8F9FA] rounded-bl-full group-hover:bg-[#4B345E]/5 transition-all"></div>
                           <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center text-[#6C757D] group-hover:bg-[#4B345E] group-hover:text-white transition-all shadow-sm shrink-0">
                              {link.icon}
                           </div>
                           <div className="grow">
                              <h4 className="text-lg font-black text-[#1A1A1A] uppercase tracking-tight leading-none mb-3 group-hover:text-[#4B345E] transition-colors">{link.name}</h4>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-6">{link.description}</p>
                              <div className="flex items-center gap-2 text-[8px] font-black text-[#E90171] uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                                 Navigate Portal
                                 <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>

         {/* Sidebar Widget: App Directory Style */}
         <div className="space-y-10">
            <div className="bg-white border border-[#E9ECEF] rounded-2xl p-10 shadow-sm border-t-8 border-t-[#4B345E] relative group">
               <div className="flex items-center justify-between mb-10">
                  <h4 className="text-[10px] font-black uppercase text-[#1A1A1A] tracking-[0.2em]">MyLMS Apps</h4>
                  <Menu size={16} className="text-[#6C757D]" />
               </div>
               <div className="space-y-3">
                  {['Registry SIS', 'Classroom LMS', 'Media Portal', 'Advisor Desk'].map((app, i) => (
                     <div key={i} className="py-3.5 px-6 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] hover:bg-white transition-all cursor-pointer shadow-sm border-l-2 border-l-[#E90171]/50">
                        {app}
                     </div>
                  ))}
               </div>
               <button className="w-full py-3.5 bg-white border border-[#E9ECEF] text-[#4B345E] text-[9px] font-black uppercase tracking-widest rounded-lg mt-10 hover:bg-[#F8F9FA] transition-all shadow-sm">
                  Full Application Library
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}
