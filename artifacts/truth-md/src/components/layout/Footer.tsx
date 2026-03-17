import { useEffect, useState } from "react"
import { Download, ChevronRight, Cpu } from "lucide-react"

export function Footer() {
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setUptime(u => u + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  return (
    <footer className="w-full border-t border-white/5 bg-background/80 backdrop-blur-md mt-auto z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <button className="flex items-center gap-2 text-sm font-display tracking-widest text-muted-foreground hover:text-primary transition-colors group">
          <Download className="w-4 h-4" />
          <span>DOWNLOAD TRUTH-MD</span>
          <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Cpu className="w-3 h-3 text-primary" />
            <span>TRUTH-MD Console</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="font-mono text-sm text-primary tracking-widest glow-text">
            {formatTime(uptime)}
          </div>
        </div>

      </div>
    </footer>
  )
}
