import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate auth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: isSignUp ? "Welcome to WaveSync!" : "Welcome back!",
      description: isSignUp 
        ? "Your account has been created successfully." 
        : "You've successfully signed in to WaveSync.",
    });
    
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex bg-secondary/30 rounded-xl p-1 backdrop-blur-sm border border-border/30">
        <button
          type="button"
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
            !isSignUp 
              ? "bg-primary text-primary-foreground shadow-glow" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
            isSignUp 
              ? "bg-primary text-primary-foreground shadow-glow" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field - Only for Sign Up */}
        {isSignUp && (
          <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            <Label htmlFor="name" className="text-sm font-medium text-foreground/80">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-12 h-12 input-wave rounded-xl"
                required
              />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2 animate-fade-up" style={{ animationDelay: isSignUp ? "0.2s" : "0.3s", opacity: 0 }}>
          <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-12 input-wave rounded-xl"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2 animate-fade-up" style={{ animationDelay: isSignUp ? "0.3s" : "0.4s", opacity: 0 }}>
          <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-12 input-wave rounded-xl"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password - Only for Sign Up */}
        {isSignUp && (
          <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 pr-12 h-12 input-wave rounded-xl"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Remember Me / Forgot Password - Only for Sign In */}
        {!isSignUp && (
          <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me
              </Label>
            </div>
            <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </a>
          </div>
        )}

        {/* Terms Agreement - Only for Sign Up */}
        {isSignUp && (
          <div className="flex items-start gap-2 animate-fade-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
              I agree to the{" "}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                Privacy Policy
              </a>
            </Label>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 btn-wave rounded-xl text-base gap-2 group animate-fade-up"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              {isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative animate-fade-up" style={{ animationDelay: "0.7s", opacity: 0 }}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-4 text-muted-foreground">or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "0.8s", opacity: 0 }}>
          <SocialButton icon="google" />
          <SocialButton icon="apple" />
          <SocialButton icon="spotify" />
        </div>

        {/* Toggle Mode Link */}
        <p className="text-center text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.9s", opacity: 0 }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {isSignUp ? "Sign in" : "Sign up for free"}
          </button>
        </p>
      </form>
    </div>
  );
};

const SocialButton = ({ icon }: { icon: "google" | "apple" | "spotify" }) => {
  const icons = {
    google: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    apple: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    spotify: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  };

  return (
    <button
      type="button"
      className="h-12 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 flex items-center justify-center transition-all duration-300 hover:border-primary/30 hover:shadow-glow/20 text-foreground/70 hover:text-foreground"
    >
      {icons[icon]}
    </button>
  );
};

export default LoginForm;
