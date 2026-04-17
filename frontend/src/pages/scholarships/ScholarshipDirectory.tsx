import { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Globe, 
  Award, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Filter, 
  CheckCircle, 
  Clock, 
  Briefcase 
} from 'lucide-react';
import client from '../../api/client';
import RegistryError from '../../components/layout/RegistryError';
import { useBranding } from '../../hooks/useBranding';

interface Scholarship {
  id: number;
  title: string;
  provider: string;
  amount: number | null;
  currency: string;
  description: string;
  external_url: string;
  deadline: string;
  tags: string[];
}

export function ScholarshipFinderWidget() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTag, setActiveTag] = useState<string>('All');
  const { branding } = useBranding();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await client.get('/scholarships');
      setScholarships(res.data?.data || []);
    } catch (err) {
      console.error('Failed to grab scholarships', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const allTags = Array.from(new Set(scholarships.flatMap(s => s.tags || []))).sort();
  const displayTags = ['All', ...allTags];

  const filteredScholarships = activeTag === 'All' 
    ? scholarships 
    : scholarships.filter(s => (s.tags || []).includes(activeTag));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <div className="w-16 h-16 border-4 border-mylms-rose border-t-transparent rounded-full animate-spin mb-8 shadow-2xl"></div>
        <p className="text-mylms-purple font-black uppercase tracking-[0.5em] text-[10px]">Accessing Funding Registry...</p>
      </div>
    );
  }

  if (error) return <RegistryError onRetry={fetchOpportunities} source={window.location.hostname} message="The Funding Registry could not be synchronized." />;

  return (
    <div className="min-h-screen bg-offwhite transition-all selection:bg-mylms-rose/20">
      
      {/* MyLMS Funding Header */}
      <div className="bg-white border-b border-border-soft py-24 px-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-mylms-purple/[0.02] transform skew-x-12 translate-x-32 transition-transform duration-1000 group-hover:translate-x-20"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16 relative z-10">
           <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-8 text-mylms-purple font-black uppercase tracking-[0.4em] text-[10px]">
                 <span className="w-10 h-px bg-mylms-rose group-hover:w-16 transition-all duration-500"></span>
                 Office of Financial Aid • {branding?.institutional_name || 'Global Academy'}
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter mb-10 leading-[0.9] italic">
                {(branding?.scholarships_hero_title || 'Financial Aid & Scholarships').split(' ').map((word, i) => (
                  <span key={i}>
                    {i % 2 === 1 ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-mylms-purple to-mylms-rose">{word}</span> : word}{' '}
                  </span>
                ))}
              </h1>
              <p className="text-text-secondary font-medium text-lg max-w-xl opacity-60 font-sans italic">
                {branding?.scholarships_hero_desc || `Authorized MyLMS directory of academic grants, fellowships, and research bursaries curated for ${branding?.institutional_name || 'Global Academy'} Scholars.`}
              </p>
           </div>
           
           <div className="bg-white p-12 rounded-[40px] border border-border-soft shadow-2xl relative group/stats hover:border-mylms-purple/30 transition-all text-center md:text-left min-w-[340px]">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-mylms-rose flex items-center justify-center rounded-3xl text-white shadow-xl rotate-12 group-hover/stats:rotate-0 transition-all duration-500">
                 <ShieldCheck size={32} />
              </div>
              <p className="text-[10px] font-black uppercase text-mylms-purple tracking-[0.3em] mb-6">Aggregate Funding Capital</p>
              <div className="flex items-center justify-center md:justify-start gap-4 transition-all">
                 <p className="text-6xl font-black text-text-main font-mono tracking-tighter">
                   ${scholarships.reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                 </p>
              </div>
              <div className="mt-8 pt-8 border-t border-offwhite flex items-center justify-center md:justify-start gap-3">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Scholar" />
                       </div>
                    ))}
                 </div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={10} className="text-mylms-rose" />
                    Verified Data Protocol
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Directory Control Hub */}
      <div className="max-w-7xl mx-auto py-24 px-12">
         
         {/* Academic Taxonomy Filters */}
         <div className="mb-20">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-text-main tracking-[0.4em] mb-12 italic">
               <Filter size={16} className="text-mylms-purple" />
               Taxonomy Filter Registry
            </div>
            <div className="flex items-center gap-4 overflow-x-auto pb-8 no-scrollbar transition-all font-black text-[9px] uppercase tracking-widest">
               {displayTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-bold transition-all border shadow-sm flex items-center gap-3 ${
                      activeTag === tag 
                        ? 'bg-mylms-purple text-white border-mylms-purple shadow-2xl scale-105' 
                        : 'bg-white text-gray-400 border-border-soft hover:border-mylms-purple/20'
                    }`}
                  >
                    {tag}
                    {activeTag === tag && <CheckCircle size={14} className="text-mylms-rose" />}
                  </button>
               ))}
            </div>
         </div>

         {/* Opportunity Grid */}
         {filteredScholarships.length === 0 ? (
            <div className="py-48 text-center bg-white rounded-[40px] border-2 border-dashed border-border-soft shadow-inner">
               <Layers size={64} className="mx-auto text-gray-100 mb-12 opacity-50" />
               <p className="text-gray-300 font-black text-[12px] uppercase tracking-[0.5em] leading-loose italic">No active funding protocols identified in this Department Registry.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 transition-all">
              {filteredScholarships.map(scholarship => (
                <div key={scholarship.id} className="bg-white rounded-[40px] border border-border-soft shadow-sm overflow-hidden flex flex-col h-full hover:border-mylms-purple/30 group transition-all hover:shadow-2xl relative group-hover:-translate-y-2 duration-500">
                   
                   <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-[60px] group-hover:bg-mylms-purple/5 transition-all flex items-center justify-center">
                      <Globe size={20} className="text-mylms-purple opacity-10 group-hover:opacity-40 transition-opacity" />
                   </div>

                   {/* Registry Card Header */}
                   <div className="p-12 pb-10 flex flex-col justify-between h-72 relative z-10 transition-all group-hover:bg-offwhite/30">
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-10 h-10 rounded-xl bg-offwhite text-mylms-rose flex items-center justify-center border border-border-soft group-hover:bg-mylms-rose group-hover:text-white transition-all duration-500">
                              <Award size={18} />
                           </div>
                           <p className="text-[10px] font-black uppercase text-text-secondary tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">{scholarship.provider}</p>
                        </div>
                        <h2 className="text-3xl font-black text-text-main leading-tight mb-8 group-hover:text-mylms-purple transition-colors line-clamp-2 uppercase tracking-tighter italic">{scholarship.title}</h2>
                      </div>
                      
                      {scholarship.amount && (
                         <div className="self-start px-8 py-4 bg-white border border-border-soft text-mylms-purple font-black rounded-2xl text-4xl font-mono shadow-xl flex items-center gap-3 tracking-tighter group-hover:scale-110 transition-transform origin-left">
                            <span className="text-2xl text-mylms-rose">{scholarship.currency === 'USD' ? '$' : scholarship.currency}</span> 
                            {Number(scholarship.amount).toLocaleString()}
                         </div>
                      )}
                   </div>

                   {/* Registry Content */}
                   <div className="p-12 grow flex flex-col bg-white transition-all">
                      <p className="text-[14px] font-medium text-text-secondary leading-loose mb-12 line-clamp-4 font-sans opacity-70 italic">
                        {scholarship.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mb-12 mt-auto">
                         {(scholarship.tags || []).map(t => (
                            <span key={t} className="px-6 py-2.5 bg-offwhite text-mylms-purple rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-border-soft transition-all flex items-center gap-2 group-hover:bg-white group-hover:border-mylms-purple/20">
                               <div className="w-1.5 h-1.5 bg-mylms-rose rounded-full"></div>
                               {t}
                            </span>
                         ))}
                      </div>

                      <div className="flex flex-col gap-10 border-t border-offwhite pt-12 mt-auto">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-offwhite rounded-2xl flex items-center justify-center border border-border-soft text-mylms-purple shadow-inner group-hover:bg-mylms-purple group-hover:text-white transition-all">
                                   <Clock size={20} />
                                 </div>
                                 <div>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Registry Cutoff</p>
                                    <p className="font-black text-text-main text-[13px] tracking-tight uppercase">{new Date(scholarship.deadline).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2">
                                 <CheckCircle size={10} />
                                 ACTIVE
                              </span>
                          </div>
                          
                          <a 
                            href={scholarship.external_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full py-4 bg-mylms-purple text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-4 hover:bg-[#001D4A] hover:scale-[1.02] transition-all active:scale-95 group/btn"
                          >
                            Connect to Funds
                            <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                          </a>
                       </div>
                    </div>
  
                 </div>
               ))}
             </div>
          )}
       </div>
  
    </div>
  );
}

export default function ScholarshipDirectory() {
  return (
    <div className="min-h-screen bg-offwhite">
      <ScholarshipFinderWidget />
    </div>
  );
}
