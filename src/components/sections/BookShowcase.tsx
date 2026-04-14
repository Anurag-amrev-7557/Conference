import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Bot,
  Send
} from 'lucide-react';
import { MarketingService } from '../../lib/marketing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const demoSteps = [
  {
    id: 'ingestion',
    title: 'Precision Ingestion',
    icon: Database,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    content: 'Connect your private data layer (Knowledge Base, CRM, APIs). Our system autonomously vectors these into a semantic mesh.',
    prompt: 'Synthesizing knowledge graph from 50,000 corporate records...'
  },
  {
    id: 'orchestration',
    title: 'Agentic Logic',
    icon: Cpu,
    color: 'text-brand-indigo',
    bg: 'bg-brand-indigo/10',
    content: 'Define behaviors using natural language. The orchestrator decomposes complex goals into executable agent swarms.',
    prompt: 'Running multi-agent reasoning chain for lead intent...'
  },
  {
    id: 'dispatch',
    title: 'Autonomous Dispatch',
    icon: Send,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    content: 'The final agent executes high-priority actions: hyper-personalized outreach, real-time strategy calls, and revenue events.',
    prompt: 'Dispatched hyper-personalized campaign to prospect id #921'
  }
];

export function BookShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    tl.from(".reveal-text", {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power4.out"
    })
    .from(".reveal-card", {
      x: -50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.5");
  }, { scope: containerRef });

  const handleStepChange = (idx: number) => {
    setActiveStep(idx);
    MarketingService.logEvent('showcase_step_view', { step: demoSteps[idx].id });
  };

  const handleRunDemo = () => {
    setIsBuilding(true);
    setTimeout(() => {
      setIsBuilding(false);
      MarketingService.logEvent('showcase_demo_complete', { outcome: 'success' });
    }, 4000);
  };

  return (
    <section ref={containerRef} className="py-24 bg-bg-off relative overflow-hidden border-y border-border/10">
      {/* Neural Pulse Aura */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-indigo/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 right-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none rotate-12">
        <Bot size={400} />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-8">
            <div className="reveal-text inline-flex items-center px-4 py-1.5 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo text-[12px] font-black uppercase tracking-[0.2em] mb-4">
              <Zap size={14} className="mr-2" /> Prototype Node
            </div>
            
            <h2 className="reveal-text text-[clamp(40px,5vw,64px)] font-serif italic text-text leading-tight">
              Build Zero-Latency <span className="text-brand-indigo not-italic">Agents</span> in Minutes.
            </h2>
            
            <p className="reveal-text text-lg text-muted font-medium max-w-xl">
              From raw data to autonomous outreach. The Superhumanly Studio follows a museum-grade architectural blueprint for scaling intelligence.
            </p>

            <div className="space-y-4 pt-4">
              {demoSteps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(idx)}
                  className={`reveal-card w-full flex items-center gap-6 p-6 rounded-3xl transition-all border text-left ${
                    activeStep === idx 
                      ? 'bg-white border-brand-indigo/30 shadow-xl shadow-brand-indigo/5 translate-x-2' 
                      : 'bg-white/40 border-border/50 hover:bg-white/60 hover:border-brand-indigo/20 grayscale opacity-60'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${step.bg} ${step.color}`}>
                    <step.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-text">{step.title}</h4>
                    {activeStep === idx && (
                      <p className="text-sm text-muted mt-1 font-medium italic">{step.content}</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    {activeStep === idx ? (
                      <div className="w-2 h-2 rounded-full bg-brand-indigo animate-pulse" />
                    ) : (
                      <ArrowRight size={16} className="text-muted/40" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Debugger / Visualization */}
          <div className="lg:w-1/2 w-full h-full flex flex-col pt-12 lg:pt-0">
            <div className="bg-[#091b36] rounded-[40px] p-1 border-4 border-white shadow-[0_32px_120px_rgba(0,0,0,0.1)] overflow-hidden">
               <div className="bg-white/5 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-white/10">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-400" />
                   <div className="w-3 h-3 rounded-full bg-yellow-400" />
                   <div className="w-3 h-3 rounded-full bg-green-400" />
                 </div>
                 <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-mono">Terminal: Agent_Init.sh</div>
                 <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[9px] font-bold rounded border border-green-400/30">RUNTIME LIVE</span>
               </div>

               <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                    >
                      {/* Central Visual */}
                      <div className="relative">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className={`w-36 h-36 rounded-full ${demoSteps[activeStep].bg} flex items-center justify-center border-4 border-white/10`}
                        >
                          {(() => {
                            const Icon = demoSteps[activeStep].icon;
                            return <Icon size={64} className={demoSteps[activeStep].color} />;
                          })()}
                        </motion.div>
                        
                        {/* Dynamic connection lines simulation */}
                        <div className="absolute inset-0 -z-10 bg-brand-indigo/10 blur-3xl opacity-30 rounded-full" />
                      </div>

                      <div className="space-y-4 max-w-sm">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm font-mono text-[13px] text-brand-indigo/70 leading-relaxed italic">
                          "{demoSteps[activeStep].prompt}"
                        </div>
                        {isBuilding ? (
                          <div className="flex items-center justify-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-brand-indigo animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 rounded-full bg-brand-indigo animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 rounded-full bg-brand-indigo animate-bounce" />
                          </div>
                        ) : (
                          <CheckCircle2 size={24} className="text-green-500 mx-auto opacity-40" />
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-auto pt-10">
                    <button
                      onClick={handleRunDemo}
                      disabled={isBuilding}
                      className="w-full h-16 bg-white text-[#091b36] rounded-2xl font-black text-[13px] uppercase tracking-[0.3em] hover:bg-white/90 transition-all flex items-center justify-center gap-4 group"
                    >
                      {isBuilding ? (
                        <>Injesting Node Graph...</>
                      ) : (
                        <>
                          <Sparkles size={16} /> Deploy Autonomous Sandbox <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-white/30 text-center mt-4 font-mono font-bold uppercase tracking-widest">Powered by Vellux Orchestration Engine v4.0</p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
