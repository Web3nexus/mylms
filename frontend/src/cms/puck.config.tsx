import type { Config } from "@puckeditor/core";
import { DropZone } from "@puckeditor/core";
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  ChevronDown,
  User,
  Quote,
  Activity,
  Image as ImageIcon,
  CheckCircle,
  PlayCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { useState } from "react";

// Import System Widgets
import { CourseCatalogWidget } from "../pages/courses/CourseList";
import { AdmissionFormWidget } from "../pages/admissions/AdmissionApplication";
import { ScholarshipFinderWidget } from "../pages/scholarships/ScholarshipDirectory";
import { ExperienceInner } from "../pages/ExperiencePage";
import { AboutInner } from "../pages/AboutPage";
import { AdmissionsInner } from "../pages/admissions/AdmissionsPage";
import { useBranding } from "../hooks/useBranding";

const DualLogosStripInner = ({ leftTitle, leftLogos, rightTitle, rightLogos }: any) => {
  const { branding } = useBranding();
  const accreditorLogos = (leftLogos && leftLogos.length > 0) ? leftLogos : (branding?.accreditor_logos || []);
  const partnerLogos = (rightLogos && rightLogos.length > 0) ? rightLogos : (branding?.partner_logos || []);
  return (
    <div className="bg-white border-b border-border-soft flex flex-col md:flex-row">
      <div className="flex-1 py-16 px-10 md:border-r border-border-soft flex flex-col items-center">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-10">{leftTitle || "Accredited By"}</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-60 hover:opacity-100 transition-duration-700">
          {accreditorLogos.map((logo: any, i: number) => {
             const src = typeof logo === 'string' ? logo : logo?.src;
             if (!src) return null;
             return <img key={i} src={src} alt={logo?.alt || "Accreditor"} className="h-10 md:h-12 w-auto object-contain" />;
          })}
        </div>
      </div>
      <div className="flex-1 py-16 px-10 flex flex-col items-center bg-gray-50/50">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-10">{rightTitle || "In Partnership With"}</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-40 hover:opacity-100 transition-duration-700 grayscale hover:grayscale-0">
          {partnerLogos.map((logo: any, i: number) => {
             const src = typeof logo === 'string' ? logo : logo?.src;
             if (!src) return null;
             return <img key={i} src={src} alt={logo?.alt || "Partner"} className="h-8 md:h-10 w-auto object-contain" />;
          })}
        </div>
      </div>
    </div>
  );
};

export type Props = {
  Hero: { title: string; titleColor?: string; description: string; buttonText: string; buttonLink: string; bgImage?: string; showBgImage?: string; variant: "default" | "split-gradient"; showOverlay?: boolean | string; overlayColor?: string; overlayOpacity?: number };
  DualLogosStrip: { leftTitle: string; leftLogos: { src: string; alt: string }[]; rightTitle: string; rightLogos: { src: string; alt: string }[] };
  ProgramGrid: { title: string; description: string; categories: { name: string; programs: { name: string; link: string }[] }[] };
  FeaturedHighlights: { title: string; items: { category: string; title: string; image: string; link: string }[] };
  FeatureGrid: { items: { title: string; description: string; icon: string }[] };
  CTAStrip: { text: string; buttonText: string; buttonLink: string; variant: "primary" | "secondary" | "white" };
  FlexColumns: { layout: "50-50" | "70-30" | "30-70" };
  RichText: { content: string; align: "left" | "center" };
  DirectorLetter: { title: string; message: string; directorName: string; directorRole: string; directorImage: string; signatureImage?: string };
  AccordionFAQ: { title: string; items: { question: string; answer: string }[] };
  TestimonialMosaic: { title: string; quote: string; author: string; role: string; avatars: { src: string }[] };
  ResourcesGrid: { title: string; resources: { title: string; description: string; image: string }[] };
  InstitutionalImage: { src: string; alt: string; caption?: string; aspect: "video" | "square" | "auto" };
  BottomApplyCTA: { title: string; studentCount: string; buttonText: string };

  // STATS & WIDGETS
  StatsCounters: { items: { label: string; value: string; suffix: string }[] };
  PricingCard: { recommended: boolean; title: string; price: string; duration: string; features: { text: string }[]; buttonText: string; buttonLink: string };
  FacultyGallery: { title: string; subtitle: string; staff: { name: string; role: string; image: string; highlight: boolean }[] };
  VideoParallax: { videoUrl: string; headline: string; subheadline: string; overlayOpacity: number };
  CalloutBox: { type: "info" | "warning" | "success"; title: string; description: string; actionText?: string; actionLink?: string };

  // SYSTEM HYBRID WIDGETS
  CourseCatalog: {};
  AdmissionForm: {};
  ScholarshipFinder: {};
  ExperienceContent: {};
  AboutContent: {};
  AdmissionsContent: {};
};

export const config: Config<Props> = {
  components: {
    // ---------------- EXISTING BLOCKS ---------------- //
    Hero: {
      fields: {
        showOverlay: { type: "select", options: [{ label: "ON (Show Overlay)", value: "true" }, { label: "OFF (Hide Overlay)", value: "false" }] },
        showBgImage: { type: "select", options: [{ label: "ON (Show Image)", value: "true" }, { label: "OFF (Hide Image)", value: "false" }] },
        overlayColor: { type: "text" },
        overlayOpacity: { type: "number" },
        title: { type: "text" },
        titleColor: { type: "text" },
        description: { type: "textarea" },
        buttonText: { type: "text" },
        buttonLink: { type: "text" },
        bgImage: { type: "text" },
        variant: {
          type: "select",
          options: [{ label: "Modern Purple", value: "default" }, { label: "Split Gradient Overlay", value: "split-gradient" }]
        }
      },
      render: ({ title, titleColor, description, buttonText, buttonLink, bgImage, showBgImage = "true", variant, showOverlay = "true", overlayColor, overlayOpacity = 0.8 }) => {
        const titleStyle = { fontSize: '42px', color: titleColor || "#C6C09A" };
        const overlayEnabled = showOverlay === "true" || showOverlay === true;
        const imageEnabled = showBgImage === "true";
        const overlayStyle = overlayEnabled ? { 
           backgroundColor: overlayColor || undefined, 
           backgroundImage: overlayColor ? 'none' : undefined,
           opacity: overlayOpacity 
        } : { display: 'none' };

        if (variant === "split-gradient") {
          return (
            <div className="relative min-h-[85vh] flex items-center pt-20">
              {bgImage && imageEnabled && (
                <div className="absolute inset-0 z-0">
                  <img src={bgImage} className="w-full h-full object-cover" alt="" />
                  <div 
                    className="absolute inset-0 bg-linear-to-r from-mylms-purple via-mylms-purple/80 to-transparent"
                    style={overlayStyle}
                  ></div>
                </div>
              )}
              <div className="relative z-10 px-6 md:px-20 max-w-7xl mx-auto w-full flex items-center">
                <div className="max-w-2xl bg-white/5 backdrop-blur-sm p-10 md:p-16 border-l-8 border-mylms-rose rounded-r-3xl shadow-2xl">
                  <h1 className="font-serif font-black leading-tight mb-8 drop-shadow-xl" style={titleStyle}>{title}</h1>
                  <p className="text-base font-medium text-white/90 mb-12 drop-shadow-md">{description}</p>
                  <a href={buttonLink} className="bg-mylms-rose text-white px-10 py-5 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-[#A00E26] shadow-xl inline-flex items-center gap-3 active:scale-95 transition-all">{buttonText}<ArrowRight size={16} /></a>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div className="relative bg-mylms-purple min-h-[70vh] flex items-center justify-center text-center overflow-hidden">
            {bgImage && imageEnabled && (
              <div className="absolute inset-0 opacity-40">
                <img src={bgImage} className="w-full h-full object-cover" alt="" />
                <div 
                  className="absolute inset-0 bg-linear-to-b from-transparent to-mylms-purple"
                  style={overlayStyle}
                ></div>
              </div>
            )}
            <div className="relative z-10 max-w-4xl px-6 py-20">
              <h1 className="font-serif font-black tracking-tight mb-8 leading-tight uppercase" style={titleStyle}>{title}</h1>
              <p className="text-base text-white/80 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">{description}</p>
              <a href={buttonLink} className="bg-mylms-rose text-white px-10 py-5 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-[#A00E26] shadow-xl inline-flex items-center gap-3 active:scale-95 transition-all">{buttonText}<ArrowRight size={16} /></a>
            </div>
          </div>
        )
      },
    },
    DualLogosStrip: {
      fields: {
        leftTitle: { type: "text" },
        leftLogos: {
          type: "array",
          getItemSummary: (item) => item.alt || "Accreditor",
          arrayFields: { src: { type: "text" }, alt: { type: "text" } }
        },
        rightTitle: { type: "text" },
        rightLogos: {
          type: "array",
          getItemSummary: (item) => item.alt || "Partner",
          arrayFields: { src: { type: "text" }, alt: { type: "text" } }
        }
      },
      render: (props) => <DualLogosStripInner {...props} />
    },
    ProgramGrid: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        categories: {
          type: "array",
          getItemSummary: (item) => item.name || "Category",
          arrayFields: {
            name: { type: "text" },
            programs: {
              type: "array",
              getItemSummary: (item) => item.name || "Program",
              arrayFields: { name: { type: "text" }, link: { type: "text" } }
            }
          }
        }
      },
      render: ({ title, description, categories }) => (
        <div className="py-32 px-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 border-l-4 border-mylms-rose pl-10">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-serif font-black text-mylms-purple leading-tight uppercase mb-6">{title}</h2>
                <p className="text-lg font-medium text-text-secondary leading-relaxed">{description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories?.map((cat, i) => (
                <div key={i} className="bg-white p-10 rounded-2xl shadow-sm border border-border-soft group overflow-hidden relative transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-mylms-rose/5 rounded-bl-full group-hover:scale-150 transition-duration-500"></div>
                  <h3 className="text-xl font-serif font-black text-mylms-purple border-b border-border-soft pb-6 mb-8 uppercase tracking-tight">{cat?.name}</h3>
                  <ul className="space-y-4 relative z-10">
                    {cat?.programs?.map((p, j) => (
                      <li key={j}>
                        <a href={p?.link} className="text-xs font-bold text-gray-500 hover:text-mylms-rose transition-colors flex items-center justify-between group/link uppercase tracking-widest">{p?.name}<ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-mylms-rose" /></a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    FeaturedHighlights: {
      fields: {
        title: { type: "text" },
        items: {
          type: "array",
          getItemSummary: (item) => item.title || "Featured Program",
          arrayFields: { category: { type: "text" }, title: { type: "text" }, image: { type: "text" }, link: { type: "text" } }
        }
      },
      render: ({ title, items }) => (
        <section className="py-24 px-10 bg-mylms-purple text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-mylms-rose via-transparent to-transparent"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif font-black mb-16 text-center uppercase tracking-tight">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {items?.map((item, i) => (
                <a key={i} href={item.link} className="group relative rounded-2xl overflow-hidden aspect-[4/5] block shadow-2xl border border-white/10 hover:border-mylms-rose/50 transition-colors">
                  <img src={item.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 w-full p-8 flex flex-col justify-end">
                    <div className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.3em] mb-3">{item.category}</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight leading-tight group-hover:text-mylms-rose transition-colors">{item.title}</h3>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                      Explore Profile <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )
    },
    FeatureGrid: {
      fields: {
        items: {
          type: "array",
          getItemSummary: (item) => item.title || "Feature Item",
          arrayFields: {
            title: { type: "text" },
            description: { type: "textarea" },
            icon: { type: "select", options: [{ label: "Graduation", value: "graduation" }, { label: "Shield", value: "shield" }, { label: "Clock", value: "clock" }, { label: "Layers", value: "layers" }] },
          },
        },
      },
      render: ({ items }) => (
        <div className="py-32 px-10 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            {items.map((item, i) => (
              <div key={i} className="group p-10 rounded-2xl bg-white border border-border-soft hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-mylms-purple/5 rounded-bl-full group-hover:scale-150 transition-duration-700"></div>
                <div className="w-14 h-14 bg-mylms-purple rounded-xl flex items-center justify-center text-white mb-10 shadow-lg group-hover:bg-mylms-rose transition-colors relative z-10">
                  <Layers size={28} />
                </div>
                <h3 className="text-2xl font-serif font-black text-mylms-purple mb-6 tracking-tight uppercase relative z-10">{item.title}</h3>
                <p className="text-text-secondary font-medium leading-relaxed relative z-10">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    CTAStrip: {
      fields: {
        text: { type: "text" },
        buttonText: { type: "text" },
        buttonLink: { type: "text" },
        variant: { type: "select", options: [{ label: "Navy (Primary)", value: "primary" }, { label: "Crimson (Accent)", value: "secondary" }, { label: "Global White (Soft)", value: "white" }] },
      },
      render: ({ text, buttonText, buttonLink, variant }) => {
        const isWhite = variant === "white";
        return (
          <div className={`py-24 px-10 text-center ${variant === "primary" ? "bg-mylms-purple" : variant === "secondary" ? "bg-mylms-rose" : "bg-white border-y border-border-soft"}`}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
              <h2 className={`text-4xl md:text-5xl font-serif font-black tracking-tight uppercase text-left max-w-2xl leading-tight ${isWhite ? 'text-mylms-purple' : 'text-white'}`}>{text}</h2>
              <a href={buttonLink} className={`${isWhite ? 'bg-mylms-purple text-white hover:bg-mylms-rose' : 'bg-white text-mylms-purple hover:bg-gray-50'} px-14 py-6 rounded-lg font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all`}>{buttonText}</a>
            </div>
          </div>
        );
      },
    },
    TestimonialMosaic: {
      fields: {
        title: { type: "text" },
        quote: { type: "textarea" },
        author: { type: "text" },
        role: { type: "text" },
        avatars: {
          type: "array",
          arrayFields: { src: { type: "text" } }
        }
      },
      render: ({ title, quote, author, role, avatars }) => (
        <section className="py-24 px-12 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <h2 className="text-5xl font-serif font-black text-mylms-purple mb-8 uppercase tracking-tighter leading-tight">{title}</h2>
              <blockquote className="text-xl font-medium text-text-secondary italic mb-10 leading-relaxed border-l-4 border-mylms-rose pl-8">"{quote}"</blockquote>
              <div>
                <p className="font-black text-mylms-purple uppercase tracking-widest">{author}</p>
                <p className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.3em] mt-1">{role}</p>
              </div>
              <div className="flex -space-x-4 mt-12">
                {avatars?.map((av, i) => <img key={i} src={av.src} className="w-12 h-12 rounded-full border-4 border-white shadow-lg" alt="Student" />)}
              </div>
            </div>
          </div>
        </section>
      )
    },
    BottomApplyCTA: {
      fields: { title: { type: "text" }, studentCount: { type: "text" }, buttonText: { type: "text" } },
      render: ({ title, studentCount, buttonText }) => (
        <section className="relative py-24 px-6 md:px-12 flex justify-center z-20 overflow-visible bg-offwhite">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-mylms-purple/5 to-transparent"></div>
          <div className="w-full max-w-5xl backdrop-blur-2xl bg-white/70 border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.05)] rounded-[3rem] p-16 md:p-24 text-center text-mylms-purple relative overflow-hidden group hover:-translate-y-2 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-mylms-rose/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-mylms-purple/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <h2 className="text-4xl md:text-5xl font-serif font-black mb-6 uppercase tracking-tighter leading-none relative z-10">{title}</h2>
            <div className="text-5xl md:text-6xl font-serif font-black mb-12 relative z-10">
              <span className="text-mylms-rose underline decoration-mylms-purple/20 underline-offset-8">{studentCount}</span>
              <span className="text-lg md:text-2xl ml-4 opacity-40 uppercase tracking-[0.5em] font-sans align-middle">Global Students</span>
            </div>
            <button className="relative z-10 bg-mylms-rose text-white px-16 py-6 rounded-xl font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_40px_rgba(160,14,38,0.2)] active:scale-95 transition-all hover:bg-[#a00e26] hover:shadow-[0_10px_20px_rgba(160,14,38,0.2)] hover:-translate-y-1">{buttonText}</button>
          </div>
        </section>
      )
    },
    RichText: {
      fields: { content: { type: "textarea" }, align: { type: "radio", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }] } },
      render: ({ content, align }) => (
        <div className={`max-w-5xl mx-auto px-10 py-20 ${align === "center" ? "text-center" : "text-left"}`}>
          <div className="text-2xl font-serif font-medium text-text-main leading-relaxed opacity-80 whitespace-pre-wrap italic">{content}</div>
        </div>
      ),
    },
    DirectorLetter: {
      fields: {
        title: { type: "text" },
        message: { type: "textarea" },
        directorName: { type: "text" },
        directorRole: { type: "text" },
        directorImage: { type: "text" },
        signatureImage: { type: "text" }
      },
      render: ({ title, message, directorName, directorRole, directorImage, signatureImage }) => (
        <section className="py-32 px-10 bg-offwhite overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-5/12 relative group">
              <div className="absolute inset-0 bg-mylms-purple rounded-3xl translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform"></div>
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 z-10 border-8 border-white">
                <img src={directorImage} className="w-full h-full object-cover" alt={directorName} />
              </div>
            </div>
            <div className="w-full lg:w-7/12 flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-serif font-black text-mylms-purple mb-10 tracking-tight uppercase leading-tight relative">
                <div className="absolute -left-12 -top-10 text-[150px] text-mylms-rose opacity-10 leading-none">"</div>
                {title}
              </h2>
              <div className="text-lg md:text-xl font-serif font-medium text-text-secondary leading-relaxed italic mb-12 whitespace-pre-wrap">
                {message}
              </div>
              <div className="flex items-end gap-8 border-t border-border-soft pt-10">
                {signatureImage && <img src={signatureImage} className="h-16 object-contain" alt="Signature" />}
                <div>
                  <p className="font-black uppercase tracking-widest text-mylms-purple">{directorName}</p>
                  <p className="text-[10px] font-black tracking-[0.2em] text-mylms-rose uppercase mt-1">{directorRole}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    },
    AccordionFAQ: {
      fields: {
        title: { type: "text" },
        items: { type: "array", getItemSummary: (item: any) => item.question || "FAQ Item", arrayFields: { question: { type: "text" }, answer: { type: "textarea" } } },
      },
      render: ({ title, items }) => (
        <section className="py-24 px-12 bg-offwhite">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-serif font-black text-mylms-purple mb-16 text-center uppercase tracking-tight">{title}</h2>
            <div className="space-y-4">
              {items?.map((item, i) => (
                <details key={i} className="group bg-white border border-border-soft rounded-xl overflow-hidden shadow-sm">
                  <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                    <span className="text-sm font-black uppercase tracking-tight text-mylms-purple">{item.question}</span>
                    <div className="w-8 h-8 rounded-full bg-offwhite flex items-center justify-center group-open:rotate-180 transition-transform"><GraduationCap size={14} className="text-mylms-rose" /></div>
                  </summary>
                  <div className="p-6 pt-0 text-sm text-text-secondary leading-relaxed border-t border-border-soft bg-gray-50/30">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      ),
    },
    InstitutionalImage: {
      fields: { src: { type: "text" }, alt: { type: "text" }, caption: { type: "text" }, aspect: { type: "radio", options: [{ label: "Video (16:9)", value: "video" }, { label: "Square (1:1)", value: "square" }, { label: "Auto", value: "auto" }] } },
      render: ({ src, alt, caption, aspect }) => (
        <div className="py-20 group max-w-7xl mx-auto px-10">
          <div className={`overflow-hidden rounded-3xl shadow-2xl border-8 border-white ${aspect === "video" ? "aspect-video" : aspect === "square" ? "aspect-square" : ""}`}>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          </div>
          {caption && <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center italic">{caption}</p>}
        </div>
      )
    },
    ResourcesGrid: {
      fields: {
        title: { type: "text" },
        resources: { type: "array", arrayFields: { title: { type: "text" }, description: { type: "textarea" }, image: { type: "text" } } }
      },
      render: ({ title, resources }) => (
        <section className="py-24 px-12 bg-offwhite">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-serif font-black text-mylms-purple mb-16 uppercase tracking-tight">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {resources?.map((res, i) => (
                <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-border-soft">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={res.image} className="w-full h-full object-cover" alt={res.title} />
                  </div>
                  <div className="p-8">
                    <h3 className="text-lg font-black text-mylms-purple mt-4 uppercase">{res.title}</h3>
                    <p className="text-xs text-text-secondary mt-4">{res.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    FlexColumns: {
      fields: { layout: { type: "select", options: [{ label: "50/50", value: "50-50" }, { label: "70/30", value: "70-30" }, { label: "30/70", value: "30-70" }] } },
      render: ({ layout }) => (
        <div className="py-10 text-center"><p className="text-gray-400 text-xs">DropZone placeholder ({layout})</p></div>
      )
    },

    // ---------------- NEW 5 BLOCKS ADDITIONS ---------------- //

    StatsCounters: {
      fields: {
        items: {
          type: "array",
          getItemSummary: (item) => item.label || "Stat Item",
          arrayFields: {
            value: { type: "text" },
            suffix: { type: "text" },
            label: { type: "text" },
          }
        }
      },
      render: ({ items }) => (
        <section className="bg-mylms-purple py-20 px-6 text-white text-center rounded-2xl mx-6 my-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-around gap-12 relative z-10">
            {items?.map((item, i) => (
              <div key={i}>
                <div className="text-6xl md:text-7xl font-serif font-black text-mylms-rose leading-none mb-4 tracking-tighter">
                  {item.value}<span className="text-3xl ml-1 text-white/50">{item.suffix}</span>
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white/70">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )
    },
    PricingCard: {
      fields: {
        recommended: { type: "radio", options: [{ label: "Standard", value: false }, { label: "Recommended/Highlighted", value: true }] },
        title: { type: "text" },
        price: { type: "text" },
        duration: { type: "text" },
        features: { type: "array", getItemSummary: (i) => i.text, arrayFields: { text: { type: "text" } } },
        buttonText: { type: "text" },
        buttonLink: { type: "text" }
      },
      render: ({ recommended, title, price, duration, features, buttonText, buttonLink }) => (
        <div className={`p-10 rounded-2xl border flex flex-col mx-auto max-w-sm w-full ${recommended ? 'border-mylms-rose shadow-2xl scale-105 bg-mylms-purple text-white relative' : 'border-border-soft bg-white text-text-main shadow-sm'}`}>
          {recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mylms-rose text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">Most Popular</div>}
          <h3 className={`text-xl font-black uppercase tracking-widest border-b pb-6 mb-8 ${recommended ? 'border-white/10 text-white' : 'border-border-soft text-mylms-purple'}`}>{title}</h3>
          <div className="mb-10">
            <span className="text-5xl font-serif font-black tracking-tighter">{price}</span>
            <span className={`text-xs ml-2 uppercase font-bold tracking-widest ${recommended ? 'text-white/50' : 'text-gray-400'}`}>/{duration}</span>
          </div>
          <ul className="mb-12 space-y-4 flex-1">
            {features?.map((f, i) => (
              <li key={i} className="flex items-start gap-4 text-sm font-medium">
                <CheckCircle size={18} className={`shrink-0 mt-0.5 ${recommended ? 'text-mylms-rose' : 'text-green-500'}`} />
                <span className={recommended ? 'text-white/80' : 'text-text-secondary'}>{f.text}</span>
              </li>
            ))}
          </ul>
          <a href={buttonLink} className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] text-center w-full transition-all active:scale-95 ${recommended ? 'bg-mylms-rose hover:bg-[#A00E26] text-white shadow-xl' : 'bg-offwhite text-mylms-purple hover:bg-mylms-purple hover:text-white border border-border-soft'}`}>
            {buttonText}
          </a>
        </div>
      )
    },
    FacultyGallery: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        staff: {
          type: "array",
          getItemSummary: (s) => s.name || "Faculty",
          arrayFields: { name: { type: "text" }, role: { type: "text" }, image: { type: "text" }, highlight: { type: "radio", options: [{ label: "No", value: false }, { label: "Yes", value: true }] } }
        }
      },
      render: ({ title, subtitle, staff }) => (
        <section className="py-24 px-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-serif font-black text-mylms-purple uppercase tracking-tight mb-6">{title}</h2>
              <p className="text-lg text-text-secondary font-medium leading-relaxed">{subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {staff?.map((s, i) => (
                <div key={i} className={`group text-center ${s.highlight ? "md:col-span-2 md:row-span-2 bg-offwhite p-10 rounded-3xl border border-border-soft flex flex-col justify-center" : ""}`}>
                  <div className={`overflow-hidden rounded-2xl mx-auto mb-6 bg-gray-100 ${s.highlight ? 'w-48 h-48 sm:w-64 sm:h-64 rounded-full shadow-2xl border-8 border-white' : 'aspect-square'}`}>
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                  </div>
                  <h3 className="text-xl font-black text-text-main uppercase tracking-tight">{s.name}</h3>
                  <p className="text-[10px] font-black text-mylms-rose uppercase tracking-[0.2em] mt-2">{s.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    VideoParallax: {
      fields: {
        videoUrl: { type: "text" },
        headline: { type: "text" },
        subheadline: { type: "text" },
        overlayOpacity: { type: "number" }
      },
      render: ({ videoUrl, headline, subheadline, overlayOpacity = 0.5 }) => (
        <div className="relative min-h-[60vh] w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black z-0">
            <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-50" />
          </div>
          <div className="absolute inset-0 bg-mylms-purple mix-blend-multiply z-10" style={{ opacity: overlayOpacity }}></div>
          <div className="relative z-20 text-center px-6 max-w-4xl text-white">
            <PlayCircle size={64} className="mx-auto mb-10 text-mylms-rose animate-pulse cursor-pointer hover:scale-110 transition-transform" />
            <h2 className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tight leading-none mb-6 text-shadow-xl">{headline}</h2>
            <p className="text-xl md:text-3xl font-serif italic text-white/80">{subheadline}</p>
          </div>
        </div>
      )
    },
    CalloutBox: {
      fields: {
        type: { type: "select", options: [{ label: "Info (Purple)", value: "info" }, { label: "Warning (Rose)", value: "warning" }, { label: "Success (Green)", value: "success" }] },
        title: { type: "text" },
        description: { type: "textarea" },
        actionText: { type: "text" },
        actionLink: { type: "text" }
      },
      render: ({ type, title, description, actionText, actionLink }) => {
        const colors = {
          info: "bg-mylms-purple text-white border-mylms-purple/20",
          warning: "bg-mylms-rose text-white border-mylms-rose/20",
          success: "bg-green-700 text-white border-green-800",
        };
        const Icon = type === 'warning' ? AlertTriangle : (type === 'success' ? CheckCircle : Info);

        return (
          <div className="px-6 py-6 max-w-6xl mx-auto drop-shadow-xl my-6">
            <div className={`${colors[type] || colors.info} rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden border-4`}>
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none scale-150 -translate-y-10 translate-x-10"><Icon size={200} /></div>
              <div className="flex items-start gap-6 relative z-10">
                <Icon size={36} className="shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{title}</h3>
                  <p className="text-white/80 font-medium leading-relaxed max-w-3xl">{description}</p>
                </div>
              </div>
              {actionText && actionLink && (
                <a href={actionLink} className="relative z-10 shrink-0 bg-white text-text-main px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-100 transition-all shadow-lg text-center">{actionText}</a>
              )}
            </div>
          </div>
        )
      }
    },

    // ---------------- SYSTEM HYBRID WIDGETS ---------------- //

    CourseCatalog: {
      render: () => <CourseCatalogWidget />
    },
    AdmissionForm: {
      render: () => <AdmissionFormWidget />
    },
    ScholarshipFinder: {
      render: () => <ScholarshipFinderWidget />
    },
    ExperienceContent: {
      render: () => <ExperienceInner />
    },
    AboutContent: {
      render: () => <AboutInner />
    },
    AdmissionsContent: {
      render: () => <AdmissionsInner />
    }
  },
};

