import { motion } from "framer-motion"
import { Info, CheckCircle2, ShieldCheck, QrCode } from "lucide-react"

export function InstructionsCard() {
  const steps = [
    { title: "Open WhatsApp", desc: "Go to Settings or menu" },
    { title: "Linked Devices", desc: "Tap 'Link a device'" },
    { title: "Enter Code", desc: "Paste the pairing code shown here" },
    { title: "Wait for Session", desc: "We'll auto-capture your session ID" },
  ]

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col h-full relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          <QrCode className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl text-foreground font-bold">How to Pair</h2>
      </div>

      <div className="space-y-6 flex-grow">
        {steps.map((step, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.5 }}
            key={idx} 
            className="flex gap-4 group"
          >
            <div className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black/40 text-primary font-mono font-bold group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all">
              {idx + 1}
              {idx !== steps.length - 1 && (
                <div className="absolute top-10 bottom-[-24px] left-1/2 -translate-x-1/2 w-px bg-white/5 group-hover:bg-primary/20 transition-colors" />
              )}
            </div>
            <div className="pt-2">
              <h3 className="text-foreground font-display text-lg tracking-wide">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Important Tip</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keep this tab open until you see "Session ID Ready". Closing early will cancel the capture process.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground uppercase bg-black/30 py-3 rounded-lg border border-white/5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Ready for pairing request</span>
      </div>
    </div>
  )
}
