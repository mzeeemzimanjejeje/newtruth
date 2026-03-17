import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { PairingForm } from "@/components/pairing/PairingForm"
import { InstructionsCard } from "@/components/pairing/InstructionsCard"
import { useHealthCheck } from "@workspace/api-client-react"
import { Copy, Check, Terminal, Loader2 } from "lucide-react"

export default function Home() {
  const [resetKey, setResetKey] = useState(0)
  const [sessionData, setSessionData] = useState<string | null>(null)
  const [isPairing, setIsPairing] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState<{ time: string; msg: string; type: "info" | "success" | "warn" }[]>([
    { time: now(), msg: "TRUTH-MD Console initialised.", type: "info" },
    { time: now(), msg: "Waiting for pairing request...", type: "info" },
  ])
  const [copied, setCopied] = useState(false)

  const healthQuery = useHealthCheck()
  const isOnline = healthQuery.data?.status === "ok"

  function now() {
    return new Date().toLocaleTimeString("en-US", { hour12: false })
  }

  function pushLog(msg: string, type: "info" | "success" | "warn" = "info") {
    setConsoleLogs(prev => [...prev, { time: now(), msg, type }])
  }

  const handleReset = () => {
    setResetKey(prev => prev + 1)
    setSessionData(null)
    setIsPairing(false)
    setConsoleLogs([
      { time: now(), msg: "Session reset. Waiting for new pairing request...", type: "warn" },
    ])
  }

  const handlePairingStarted = () => {
    setIsPairing(true)
    pushLog("Pairing code generated. Listening for WhatsApp link...", "info")
    pushLog("Keep this tab open. Polling every 3s for session capture.", "warn")
  }

  const handleSessionReady = (data: string) => {
    setSessionData(data)
    setIsPairing(false)
    pushLog("✓ Session captured successfully!", "success")
    pushLog(`Session ID: ${data}`, "success")
  }

  const handleCopy = () => {
    if (!sessionData) return
    navigator.clipboard.writeText(sessionData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-transparent overflow-x-hidden font-sans">

      {/* Background */}
      <div className="fixed inset-0 z-[-2] bg-background">
        <img
          src={`${import.meta.env.BASE_URL}images/space-bg.png`}
          alt="Space Void"
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
      </div>
      <div className="fixed inset-0 z-[-1] pointer-events-none scanlines opacity-5" />
      <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-[-1]" />

      <Header onReset={handleReset} isOnline={isOnline} />

      <main className="flex-grow flex items-center py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <PairingForm
              key={resetKey}
              onPairingStarted={handlePairingStarted}
              onSessionReady={handleSessionReady}
            />
          </div>
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <InstructionsCard />
          </div>
        </div>
      </main>

      {/* Console Panel */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl mx-auto z-10">
        <div className="rounded-xl border border-white/10 bg-black/70 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.05)]">
          {/* Console Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-primary">TRUTH-MD Console</span>
              {isPairing && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-400 ml-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> CAPTURING SESSION...
                </span>
              )}
              {sessionData && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 ml-2">
                  ● SESSION READY
                </span>
              )}
            </div>
            {sessionData && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy Session ID"}
              </button>
            )}
          </div>

          {/* Console Body */}
          <div className="p-4 font-mono text-xs space-y-1 min-h-[120px] max-h-[200px] overflow-y-auto">
            {consoleLogs.map((log, i) => (
              <div key={i} className="flex gap-3 leading-5">
                <span className="text-white/30 shrink-0">[{log.time}]</span>
                <span
                  className={
                    log.type === "success"
                      ? "text-emerald-400"
                      : log.type === "warn"
                      ? "text-yellow-400"
                      : "text-white/60"
                  }
                >
                  {log.msg}
                </span>
              </div>
            ))}

            {/* Session ID block */}
            {sessionData && (
              <div className="mt-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <div className="text-emerald-300/60 mb-1">$ session_id=</div>
                <div className="text-emerald-400 break-all leading-relaxed">{sessionData}</div>
              </div>
            )}

            {/* Blinking cursor */}
            {!sessionData && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-white/30">$</span>
                <span className="w-2 h-3.5 bg-primary/70 animate-pulse inline-block" />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
