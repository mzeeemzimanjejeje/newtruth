import { Link } from "wouter";
import { Terminal } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative font-sans text-center">
      <div className="fixed inset-0 z-[-1]">
        <img
          src={`${import.meta.env.BASE_URL}images/space-bg.png`}
          alt="Space Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="glass-panel p-8 md:p-12 rounded-2xl max-w-lg w-full border-t-2 border-t-destructive/50">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center mb-6 border border-destructive/20 text-destructive">
          <Terminal className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2 tracking-wider">404 ERROR</h1>
        <p className="text-muted-foreground mb-8 text-sm font-mono">
          System anomaly detected. The requested terminal pathway does not exist.
        </p>
        <Link href="/">
          <CustomButton variant="outline" className="w-full">
            RETURN TO MAIN CONSOLE
          </CustomButton>
        </Link>
      </div>
    </div>
  );
}
