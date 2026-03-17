import { useState, useEffect, useCallback } from "react"
import QRCode from "react-qr-code"
import { ArrowLeft, RefreshCw, Shield } from "lucide-react"
import { Link } from "wouter"

export default function ScanPage() {
  const [qrData, setQrData] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const fetchQr = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/qr`)
      const data = await res.json()
      setQrData(data.qr)
      setExpiresAt(data.expiresAt)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQr()
  }, [fetchQr])

  useEffect(() => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) {
        fetchQr()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [expiresAt, fetchQr])

  const expired = timeLeft === 0
  const progress = (timeLeft / 30) * 100

  const strokeDash = 2 * Math.PI * 44
  const strokeOffset = strokeDash * (1 - progress / 100)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-background font-sans p-4 pb-8">
      {/* Background */}
      <div className="fixed inset-0 z-[-2] bg-background">
        <img
          src={`${import.meta.env.BASE_URL}images/space-bg.png`}
          alt="Space"
          className="w-full h-full object-cover opacity-25 mix-blend-screen"
        />
      </div>
      <div className="fixed top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-[-1]" />

      {/* Back link */}
      <div className="w-full max-w-sm mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to number pairing
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden border-t-2 border-t-primary/50 shadow-[0_-4px_30px_rgba(0,212,255,0.06)]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">QR Scan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Open WhatsApp → Settings → Linked Devices → Link a Device, then scan this code.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 bg-white/5 text-white/70 text-xs">
            <Shield className="w-3 h-3" />
            OZ Secure
          </div>
        </div>

        {/* QR Area */}
        <div className="px-6 pb-6 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-64 h-64">

            {/* Countdown ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke={timeLeft <= 5 ? "#f87171" : "#00d4ff"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.3s" }}
              />
            </svg>

            {/* QR Code box */}
            <div className={`relative w-52 h-52 bg-white rounded-xl flex items-center justify-center transition-all duration-300 ${expired || loading ? "opacity-20 blur-sm" : "opacity-100"}`}>
              {qrData && !error && (
                <QRCode
                  value={qrData}
                  size={192}
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                  level="M"
                />
              )}
            </div>

            {/* Overlay when expired or loading */}
            {(expired || loading || error) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                {error ? (
                  <p className="text-xs text-red-400 text-center px-4">Failed to load QR.<br/>Check connection.</p>
                ) : (
                  <>
                    <RefreshCw className={`w-8 h-8 text-primary ${loading ? "animate-spin" : "animate-pulse"}`} />
                    <p className="text-xs text-muted-foreground">{loading ? "Refreshing..." : "Expired — refreshing"}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Timer + refresh */}
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className={`font-mono font-bold text-lg ${timeLeft <= 5 ? "text-red-400" : "text-primary"}`}>
              {timeLeft}s
            </span>
            <span className="text-muted-foreground text-xs">until refresh</span>
            <button
              onClick={fetchQr}
              disabled={loading}
              className="ml-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Steps */}
          <div className="mt-5 w-full space-y-2 text-xs text-muted-foreground">
            {[
              "Open WhatsApp and go to Settings",
              "Tap Linked Devices → Link a Device",
              "Point your camera at the QR code above",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
