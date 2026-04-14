import { motion } from "framer-motion"

export function SyncRibbon() {
  const ribbonItems = [
    "Build AI Agents Fast", "5-Minute Deployment", "Agentic Reasoning", "Superhumanly OS", 
    "Automated Workflows", "Scale with AI", "VIP Founders Hub", "Expert Playbooks",
    "Build AI Agents Fast", "5-Minute Deployment", "Agentic Reasoning", "Superhumanly OS", 
    "Automated Workflows", "Scale with AI", "VIP Founders Hub", "Expert Playbooks"
  ]

  return (
    <div id="sync" className="py-7 border-y-[0.5px] border-border bg-white overflow-hidden relative">

      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ 
            duration: 80, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-24 items-center px-24"
        >
          {ribbonItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 group opacity-50 hover:opacity-100 transition-opacity duration-700">
              <div className="w-[1px] h-3 bg-border group-hover:bg-accent transition-colors" />
              <span className="text-[13px] font-bold text-black uppercase tracking-[0.2em] cursor-default leading-none">
                {item}
              </span>
            </div>
          ))}
          {/* Triplicate for seamless long loop */}
          {ribbonItems.map((item, idx) => (
            <div key={`dup-${idx}`} className="flex items-center gap-8 group opacity-50 hover:opacity-100 transition-opacity duration-700">
              <div className="w-[1px] h-3 bg-border group-hover:bg-accent transition-colors" />
              <span className="text-[13px] font-bold text-black uppercase tracking-[0.2em] cursor-default leading-none">
                {item}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Extreme Minimalist Accents */}
      <div className="absolute top-0 right-[35%] w-[0.5px] h-full bg-border/10" />
      <div className="absolute top-0 left-[30%] w-[0.5px] h-full bg-border/10" />
    </div>
  )
}


