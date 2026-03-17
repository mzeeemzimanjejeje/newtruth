import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { Copy, Loader2, Smartphone, Shield, QrCode, Check, CheckCircle2, Link as LinkIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useRequestPairCode, useGetSession } from "@workspace/api-client-react"

export interface PairingFormRef {
  triggerSubmit: () => void
  getCopyText: () => string | null
}

interface PairingFormProps {
  onSessionReady?: (sessionData: string) => void
  onPairingStarted?: () => void
  onCodeReady?: (code: string) => void
}

export const PairingForm = forwardRef<PairingFormRef, PairingFormProps>(
  ({ onSessionReady, onPairingStarted, onCodeReady }, ref) => {
    const [phone, setPhone] = useState("")
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [code, setCode] = useState<string | null>(null)
    const [hasCopied, setHasCopied] = useState(false)
    const [notifiedReady, setNotifiedReady] = useState(false)

    const { toast } = useToast()
    const pairMutation = useRequestPairCode()

    const sessionQuery = useGetSession(sessionId || "", {
      query: {
        enabled: !!sessionId,
        refetchInterval: (queryInfo) => {
          const status = (queryInfo as any)?.state?.data?.status
          if (status === "ready" || status === "failed") return false
          return 3000
        },
      }
    })

    const status = sessionQuery.data?.status
    const sessionData = sessionQuery.data?.sessionData

    useImperativeHandle(ref, () => ({
      triggerSubmit: () => {
        if (!phone || pairMutation.isPending || code) return
        doGenerate()
      },
      getCopyText: () => sessionData || code || null,
    }))

    const doGenerate = () => {
      if (!phone) return
      pairMutation.mutate(
        { data: { phone } },
        {
          onSuccess: (res) => {
            setCode(res.code)
            setSessionId(res.sessionId)
            onPairingStarted?.()
            onCodeReady?.(res.code)
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

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      doGenerate()
    }

    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Paste it in WhatsApp Linked Devices.",
        duration: 3000,
      })
    }

    useEffect(() => {
      if (status === "ready" && sessionData && !notifiedReady) {
        setNotifiedReady(true)
        onSessionReady?.(sessionData)
      }
    }, [status, sessionData, notifiedReady, onSessionReady])

    return (
      <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden border-t-2 border-t-primary/50 shadow-[0_-5px_30px_rgba(0,212,255,0.05)]">

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">Pair Device</h2>
          <p className="text-sm text-muted-foreground">
            Enter your WhatsApp number (include country code). We'll generate a pairing code and capture your session.
          </p>

          {/* QR Scan row */}
          <div className="mt-3">
            <p className="text-sm font-bold text-foreground mb-0.5">QR Scan</p>
            <a href="/scan" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" />
              Click here to scan QR instead
            </a>
          </div>

          {/* OZ Secure badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 bg-white/5 text-white/70 text-xs">
            <Shield className="w-3 h-3" />
            OZ Secure
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">

            {/* STATE 1: Input Form */}
            {!code && (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground block">WhatsApp Number</label>
                  <div className="relative group flex items-center">
                    <span className="absolute left-4 text-muted-foreground font-mono text-lg select-none">+</span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="2547xxxxxxxx"
                      className="w-full bg-black/50 border border-white/10 text-foreground text-base pl-9 pr-4 py-4 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-black/80 transition-all font-mono placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pairMutation.isPending || !phone}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold tracking-wide text-white bg-gradient-to-r from-violet-600 via-primary to-emerald-400 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-sm"
                >
                  <LinkIcon className="w-4 h-4" />
                  {pairMutation.isPending ? "Generating..." : "Generate Pair Code"}
                </button>
              </motion.form>
            )}

            {/* STATE 2: Code Generated / Pending */}
            {code && status === "pending" && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center space-y-5"
              >
                <div>
                  <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Pairing Code Generated</p>
                  <div
                    onClick={() => handleCopy(code)}
                    className="cursor-pointer relative group"
                    title="Tap to copy"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-emerald-500/40 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <div className="relative bg-black border border-white/10 rounded-xl px-6 py-5 font-mono text-3xl sm:text-4xl font-bold tracking-[0.25em] text-foreground">
                      {code}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Tap the code to copy</p>
                </div>

                <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                  <p className="text-sm text-left text-muted-foreground">
                    Open WhatsApp → Linked Devices → Link a Device → Link with Phone Number, then enter this code. Keep this tab open.
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
                className="flex flex-col items-center text-center space-y-5 w-full"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground">Session Captured</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your TRUTH MD session ID is ready.</p>
                </div>
                <div className="w-full text-left relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/40 to-primary/40 rounded-xl blur opacity-25" />
                  <div className="relative bg-black/80 border border-white/20 rounded-lg p-4 font-mono text-xs text-emerald-400 break-all max-h-40 overflow-y-auto">
                    {sessionData}
                  </div>
                  <button
                    onClick={() => handleCopy(sessionData)}
                    className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded border border-white/10 transition-all"
                  >
                    {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
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
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-display text-foreground">Pairing Failed</h3>
                <p className="text-sm text-muted-foreground">The session request timed out or was rejected.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-5 py-2.5 rounded-xl border border-white/20 text-sm text-white hover:bg-white/10 transition"
                >
                  Try Again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    )
  }
)

PairingForm.displayName = "PairingForm"
