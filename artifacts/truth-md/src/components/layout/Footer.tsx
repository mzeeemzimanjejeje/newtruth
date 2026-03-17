import { Download } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full z-40 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="#"
          className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-display font-bold tracking-widest text-sm text-white bg-gradient-to-r from-primary via-teal-400 to-emerald-400 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,212,255,0.25)]"
        >
          <Download className="w-5 h-5" />
          DOWNLOAD TRUTH-MD
        </a>
        <a
          href="#"
          className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-display font-bold tracking-widest text-sm text-white bg-gradient-to-r from-violet-600 via-purple-500 to-primary hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.25)]"
        >
          <Download className="w-5 h-5" />
          DOWNLOAD SPACE~MD
        </a>
      </div>
    </footer>
  )
}
