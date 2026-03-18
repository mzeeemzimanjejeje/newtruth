import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { PairingForm, PairingFormRef } from "@/components/pairing/PairingForm"
import { InstructionsCard } from "@/components/pairing/InstructionsCard"
import { useHealthCheck } from "@workspace/api-client-react"
import { Copy, Check, Terminal, Clock, Link as LinkIcon } from "lucide-react"

interface LogLine {
  tag: "BOOT" | "INFO" | "SUCCESS" | "WARN" | "ERROR"
  msg: string
}

interface Stats {
  visitors: number
  requests: number
  success: number
  failed: number
  uptimeSecs: number
}

function formatUptime(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
}

export default function Home() {
  const [resetKey, setResetKey] = useState(0)
  const [sessionData, setSessionData] = useState<string | null>(null)
  const [currentCode, setCurrentCode] = useState<string | null>(null)
  const [consoleCopied, setConsoleCopied] = useState(false)
  const [barCopied, setBarCopied] = useState(false)
  const [stats, setStats] = useState<Stats>({ visitors: 0, requests: 0, success: 0, failed: 0, uptimeSecs: 0 })
  const [logs, setLogs] = useState<LogLine[]>([
    { tag: "BOOT", msg: "TRUTH-MD portal initialized." },
    { tag: "INFO", msg: "Ready for pairing request..." },
  ])
  const logsEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<PairingFormRef>(null)

  const healthQuery = useHealthCheck()
  const isOnline = healthQuery.data?.status === "ok"

  function pushLog(tag: LogLine["tag"], msg: string) {
    setLogs(prev => [...prev, { tag, msg }])
  }

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  useEffect(() => {
    const fetchStats = () => {
      fetch(`${import.meta.env.BASE_URL}api/stats`)
        .then(r => r.json())
        .then(data => setStats(data))
        .catch(() => {})
    }
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleReset = () => {
    setResetKey(prev => prev + 1)
    setSessionData(null)
    setCurrentCode(null)
    pushLog("WARN", "Session reset. Waiting for new pairing request...")
  }

  const handlePairingStarted = () => {
    pushLog("INFO", "Pairing code generated. Listening for WhatsApp link...")
    pushLog("INFO", "Polling every 3s for session capture. Keep tab open.")
  }

  const handleCodeReady = (code: string) => {
    setCurrentCode(code)
  }

  const handleSessionReady = (data: string) => {
    setSessionData(data)
    setCurrentCode(null)
    pushLog("SUCCESS", "Session captured successfully!")
    pushLog("SUCCESS", `Session ID: ${data}`)
  }

  const handleBarCopy = () => {
    const text = formRef.current?.getCopyText()
    if (!text) return
    navigator.clipboard.writeText(text)
    setBarCopied(true)
    setTimeout(() => setBarCopied(false), 2000)
  }

  const handleConsoleCopy = () => {
    const text = sessionData || currentCode
    if (!text) return
    navigator.clipboard.writeText(text)
    setConsoleCopied(true)
    setTimeout(() => setConsoleCopied(false), 2000)
  }

  const tagColor: Record<LogLine["tag"], string> = {
    BOOT: "text-primary",
    INFO: "text-sky-400",
    SUCCESS: "text-emerald-400",
    WARN: "text-yellow-400",
    ERROR: "text-red-400",
  }

  const hasCopyTarget = !!(sessionData || currentCode)

  return (
    <div className="min-h-screen flex flex-col relative bg-transparent overflow-x-hidden font-sans pb-20">

      {/* Background — no fill, body's animated gradient shows through */}
      <div className="fixed inset-0 z-[-2]">
        <img
          src={`${import.meta.env.BASE_URL}images/space-bg.png`}
          alt="Space Void"
          className="w-full h-full object-cover opacity-20 mix-blend-screen"
        />
      </div>
      <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-[-1]" />

      <Header onReset={handleReset} isOnline={isOnline} />

      <main className="flex-grow flex items-center py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <PairingForm
              ref={formRef}
              key={resetKey}
              onPairingStarted={handlePairingStarted}
              onCodeReady={handleCodeReady}
              onSessionReady={handleSessionReady}
            />
          </div>
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <InstructionsCard />
          </div>
        </div>
      </main>

      {/* Download Buttons */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-4 max-w-7xl mx-auto z-10">
        <Footer />
      </div>

      {/* Console Panel */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto z-10">
        <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden">

          {/* Console Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono font-bold text-foreground">TRUTH-MD Console</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-white/5 border border-white/10 rounded-lg px-3 py-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatUptime(stats.uptimeSecs)}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border-b border-white/10">
            {[
              { label: "Visitors", value: stats.visitors.toLocaleString(), color: "text-foreground" },
              { label: "Requests", value: stats.requests.toLocaleString(), color: "text-foreground" },
              { label: "Success", value: stats.success.toLocaleString(), color: "text-emerald-400" },
              { label: "Failed", value: stats.failed.toLocaleString(), color: "text-red-400" },
            ].map(stat => (
              <div key={stat.label} className="bg-black/40 px-5 py-4">
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Log Lines */}
          <div className="p-4 font-mono text-xs space-y-1 min-h-[90px] max-h-[160px] overflow-y-auto">
            {logs.map((line, i) => (
              <div key={i} className="flex gap-2 leading-5">
                <span className={`shrink-0 font-bold ${tagColor[line.tag]}`}>[{line.tag}]</span>
                <span className={line.tag === "SUCCESS" ? "text-emerald-400" : "text-white/60"}>{line.msg}</span>
              </div>
            ))}

            {(sessionData || currentCode) && (
              <div className="mt-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 relative">
                <div className="text-emerald-300/50 text-[10px] mb-1 uppercase tracking-widest">
                  {sessionData ? "Session ID" : "Pair Code"}
                </div>
                <div className="text-emerald-400 break-all pr-8">{sessionData || currentCode}</div>
                <button
                  onClick={handleConsoleCopy}
                  className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-primary/20 border border-white/10 transition-all"
                >
                  {consoleCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white/60" />}
                </button>
              </div>
            )}

            {!sessionData && !currentCode && (
              <div className="flex items-center gap-1 pt-1">
                <span className="text-white/20">$</span>
                <span className="w-2 h-3.5 bg-primary/70 animate-pulse inline-block" />
              </div>
            )}
            <div ref={logsEndRef} />
          </div>

        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button
            onClick={() => formRef.current?.triggerSubmit()}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-primary to-emerald-400 hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,212,255,0.2)]"
          >
            <LinkIcon className="w-4 h-4" />
            Generate
          </button>
          <button
            onClick={handleBarCopy}
            disabled={!hasCopyTarget}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl font-bold text-sm border border-white/15 bg-white/5 text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-white/10 hover:enabled:text-white transition-all"
          >
            {barCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {barCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

    </div>
  )
}
