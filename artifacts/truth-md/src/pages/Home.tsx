import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { PairingForm } from "@/components/pairing/PairingForm"
import { InstructionsCard } from "@/components/pairing/InstructionsCard"
import { useHealthCheck } from "@workspace/api-client-react"

export default function Home() {
  // Simple reset trick by toggling key
  const [resetKey, setResetKey] = useState(0)
  
  const healthQuery = useHealthCheck()
  const isOnline = healthQuery.data?.status === "ok"

  const handleReset = () => {
    setResetKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-transparent overflow-x-hidden font-sans">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-[-2] bg-background">
        <img
          src={`${import.meta.env.BASE_URL}images/space-bg.png`}
          alt="Space Void"
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
      </div>
      
      {/* Overlays */}
      <div className="fixed inset-0 z-[-1] pointer-events-none scanlines opacity-5" />
      <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-[-1]" />
      
      {/* App Structure */}
      <Header onReset={handleReset} isOnline={isOnline} />
      
      <main className="flex-grow flex items-center py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
          
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <PairingForm key={resetKey} />
          </div>
          
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <InstructionsCard />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
