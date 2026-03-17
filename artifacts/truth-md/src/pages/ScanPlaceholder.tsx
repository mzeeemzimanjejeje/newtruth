import { ArrowLeft, QrCode } from "lucide-react"
import { Link } from "wouter"
import { CustomButton } from "@/components/ui/custom-button"

export default function ScanPlaceholder() {
  return (
    <div className="min-h-screen flex flex-col relative bg-background font-sans items-center justify-center p-4">
      <div className="fixed inset-0 z-[-1]">
        <img
          src={`${import.meta.env.BASE_URL}images/space-bg.png`}
          alt="Space"
          className="w-full h-full object-cover opacity-20 mix-blend-screen"
        />
      </div>
      
      <div className="glass-panel p-10 rounded-3xl max-w-md w-full text-center flex flex-col items-center border-t-primary/50 border-t-2">
        <div className="w-24 h-24 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mb-6 relative group">
          <QrCode className="w-12 h-12 text-primary" />
          <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-2xl" />
          {/* Scanner line animation */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-primary shadow-[0_0_10px_#00d4ff] animate-[shimmer_2s_infinite]" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">QR Scanner</h1>
        <p className="text-muted-foreground text-sm mb-8">
          This feature is currently under development. Please use the phone number pairing method instead.
        </p>
        
        <Link href="/">
          <CustomButton variant="outline" className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            BACK TO NUMBER PAIRING
          </CustomButton>
        </Link>
      </div>
    </div>
  )
}
