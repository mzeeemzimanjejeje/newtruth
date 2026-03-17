import { Terminal, RefreshCw, Activity } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { Link } from "wouter"

interface HeaderProps {
  onReset: () => void
  isOnline: boolean
}

export function Header({ onReset, isOnline }: HeaderProps) {
  return (
    <header className="w-full border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 group-hover:border-primary/60 transition-colors">
            <Terminal className="w-5 h-5 text-primary" />
            <div className="absolute inset-0 rounded-xl glow-box opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-none tracking-widest text-foreground group-hover:text-primary transition-colors">
              TRUTH MD
            </h1>
            <p className="text-[10px] text-primary/70 font-mono tracking-widest uppercase">
              Secure Terminal
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/5">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse glow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
            <span className="text-xs font-mono tracking-wider text-muted-foreground uppercase mt-0.5">
              {isOnline ? 'Server Online' : 'Server Offline'}
            </span>
          </div>

          <CustomButton 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="gap-2 border border-transparent hover:border-primary/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Session</span>
          </CustomButton>
        </div>
      </div>
    </header>
  )
}
