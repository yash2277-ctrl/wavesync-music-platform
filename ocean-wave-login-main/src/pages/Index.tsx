import WaveBackground from "@/components/ui/WaveBackground";
import WaveSyncLogo from "@/components/ui/WaveSyncLogo";
import LoginForm from "@/components/LoginForm";
import { Headphones } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <WaveBackground />
      
      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        {/* Glass card */}
        <div className="glass-card rounded-3xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <WaveSyncLogo />
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8 animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to continue your musical journey
            </p>
          </div>

          {/* Login form */}
          <LoginForm />
        </div>

        {/* Floating music note decorations */}
        <div 
          className="absolute -top-8 -right-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/10 flex items-center justify-center animate-float"
          style={{ animationDelay: "0s" }}
        >
          <Headphones className="w-8 h-8 text-primary/60" />
        </div>
        <div 
          className="absolute -bottom-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-sm border border-accent/10 flex items-center justify-center animate-float"
          style={{ animationDelay: "2s" }}
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent" />
        </div>
      </div>

      {/* Bottom wave reflection */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
