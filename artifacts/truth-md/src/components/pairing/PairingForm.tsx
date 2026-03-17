import { useState, useEffect } from "react"
import { Copy, Loader2, Smartphone, Shield, QrCode, Check, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CustomButton } from "@/components/ui/custom-button"
import { useToast } from "@/hooks/use-toast"
import { useRequestPairCode, useGetSession } from "@workspace/api-client-react"
import { Link } from "wouter"

interface PairingFormProps {
  onSessionReady?: (sessionData: string) => void
  onPairingStarted?: () => void
}

export function PairingForm({ onSessionReady, onPairingStarted }: PairingFormProps) {
  const [phone, setPhone] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [hasCopied, setHasCopied] = useState(false)
  const [notifiedReady, setNotifiedReady] = useState(false)
  
  const { toast } = useToast()
  const pairMutation = useRequestPairCode()

  // Polling hook
  const sessionQuery = useGetSession(sessionId || "", {
    query: {
      enabled: !!sessionId,
      refetchInterval: (queryInfo) => {
        // Stop polling if status is ready or failed
        const status = (queryInfo as any)?.state?.data?.status
        if (status === "ready" || status === "failed") return false
        return 3000
      },
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    pairMutation.mutate(
      { data: { phone } },
      {
        onSuccess: (res) => {
          setCode(res.code)
          setSessionId(res.sessionId)
          onPairingStarted?.()
        },
        onError: (err) => {
          toast({
            title: "Failed to generate code",
            description: err?.message || "Please check the phone number and try again.",
            variant: "destructive"
          })
        }
      }
    )
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "You can now paste it in WhatsApp.",
      duration: 3000,
    })
  }

  const status = sessionQuery.data?.status
  const sessionData = sessionQuery.data?.sessionData

  useEffect(() => {
    if (status === "ready" && sessionData && !notifiedReady) {
      setNotifiedReady(true)
      onSessionReady?.(sessionData)
    }
  }, [status, sessionData, notifiedReady, onSessionReady])

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden border-t-2 border-t-primary/50 shadow-[0_-5px_30px_rgba(0,212,255,0.05)]">
      
      {/* Header section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Pair Device</h2>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              <Shield className="w-3 h-3" />
              OZ Secure
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Enter your WhatsApp number (include country code). We'll generate a pairing code and capture your session.
          </p>
        </div>
        
        <Link href="/scan" className="flex flex-col items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
            <QrCode className="w-5 h-5" />
          </div>
          <span>QR Scan</span>
        </Link>
      </div>

      <div className="flex-grow flex flex-col justify-center min-h-[300px]">
        <AnimatePresence mode="wait">
          
          {/* STATE 1: Input Form */}
          {!code && !sessionId && (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground ml-1">
                  WhatsApp Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Smartphone className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+2547xxxxxxxx"
                    className="w-full bg-black/50 border border-white/10 text-foreground text-lg px-12 py-4 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-black/80 transition-all font-mono placeholder:text-muted-foreground/50"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-muted-foreground">
                      REQ
                    </div>
                  </div>
                </div>
              </div>

              <CustomButton 
                type="submit" 
                size="lg" 
                className="w-full relative overflow-hidden group"
                disabled={pairMutation.isPending || !phone}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {pairMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> GENERATING...</>
                  ) : (
                    "GENERATE PAIR CODE"
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </CustomButton>
            </motion.form>
          )}

          {/* STATE 2: Pending/Polling Code */}
          {code && status === "pending" && (
            <motion.div 
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="space-y-2">
                <p className="text-sm font-mono text-primary uppercase tracking-widest glow-text">Generated Code</p>
                
                <div className="relative group mt-2">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-emerald-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-black border border-white/10 rounded-xl p-6 md:p-8 flex items-center gap-6">
                    <span className="font-mono text-3xl md:text-5xl font-bold tracking-[0.2em] text-foreground">
                      {code}
                    </span>
                    <button 
                      onClick={() => handleCopy(code)}
                      className="p-3 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg border border-white/10 hover:border-primary/50 transition-all"
                      title="Copy code"
                    >
                      {hasCopied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Tap to copy and paste in WhatsApp</p>
              </div>

              <div className="w-full max-w-sm p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0" />
                <p className="text-sm text-left text-muted-foreground leading-relaxed">
                  Keep this tab open. Session capture will begin automatically once linked.
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 3: Session Ready */}
          {status === "ready" && sessionData && (
            <motion.div 
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center text-center space-y-6 w-full"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-display font-bold text-foreground">Session Captured</h3>
                <p className="text-sm text-muted-foreground">Your TRUTH MD session ID is ready.</p>
              </div>

              <div className="w-full text-left relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-primary/50 rounded-xl blur opacity-30"></div>
                <div className="relative bg-black/80 border border-white/20 rounded-lg p-4 font-mono text-xs md:text-sm text-emerald-400 break-all max-h-48 overflow-y-auto scanlines">
                  {sessionData}
                </div>
                <button 
                  onClick={() => handleCopy(sessionData)}
                  className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded border border-white/10 transition-all text-white"
                >
                  {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 4: Failed */}
          {status === "failed" && (
            <motion.div 
              key="failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-full text-destructive">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display text-foreground">Pairing Failed</h3>
              <p className="text-sm text-muted-foreground">The session request timed out or was rejected.</p>
              <CustomButton variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </CustomButton>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
