// Removed unused React import
import { motion } from 'framer-motion';
import { 
  Activity, Users, Mail, MessageSquare, 
  Share2, Layout, Megaphone, BarChart3 
} from 'lucide-react';

const agents = [
  { id: 'track', name: 'Event Tracking', icon: Activity, status: 'Active', load: '0.02ms' },
  { id: 'score', name: 'Lead Scoring', icon: Users, status: 'Analyzing', load: '0.14ms' },
  { id: 'email', name: 'Email Automation', icon: Mail, status: 'Ready', load: '0.05ms' },
  { id: 'msg', name: 'Message Agent', icon: MessageSquare, status: 'Ready', load: '0.08ms' },
  { id: 'social', name: 'Social Media', icon: Share2, status: 'Syncing', load: '1.2s' },
  { id: 'personal', name: 'Personalization', icon: Layout, status: 'Active', load: '0.11ms' },
  { id: 'ads', name: 'Ads Campaign', icon: Megaphone, status: 'Standby', load: '0.00ms' },
  { id: 'analytics', name: 'Analytics Agent', icon: BarChart3, status: 'Reporting', load: '0.9s' }
];

export function FlowVisualizer() {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-20 px-6">
      {/* Background Decorative Lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <div className="w-full h-[0.5px] bg-accent" />
        <div className="w-[0.5px] h-full bg-accent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group relative p-6 rounded-2xl border-[0.5px] border-border bg-white/5 backdrop-blur-md hover:border-accent/40 transition-all duration-500"
          >
            {/* HUD Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-accent/5 rounded-lg group-hover:bg-accent/10 transition-colors">
                <agent.icon className="w-5 h-5 text-accent" />
              </div>
              <div className="text-right">
                <span className="text-[8px] font-bold text-muted uppercase tracking-widest block mb-1">LOAD_LATENCY</span>
                <span className="text-[10px] font-bold text-text uppercase tracking-tighter">{agent.load}</span>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h4 className="text-[14px] font-bold text-text uppercase tracking-wider mb-2">{agent.name}</h4>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'Active' ? 'bg-green animate-pulse' : 'bg-accent/40'}`} />
                <span className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">{agent.status}</span>
              </div>
            </div>

            {/* Connection Indicator */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[0.5px] h-8 bg-gradient-to-b from-border to-transparent hidden lg:block" />
            
            {/* Corner Markers */}
            <div className="absolute top-3 left-3 w-1.5 h-1.5 border-t border-l border-border/40" />
            <div className="absolute bottom-3 right-3 w-1.5 h-1.5 border-b border-r border-border/40" />
          </motion.div>
        ))}
      </div>

      {/* Central Orchestration Link (Visual Only) */}
      <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-[0.5px] border-accent/20 rounded-full animate-float opacity-30">
        <div className="absolute inset-0 border-[0.5px] border-accent/10 rounded-full scale-110 animate-pulse" />
      </div>
    </div>
  );
}
