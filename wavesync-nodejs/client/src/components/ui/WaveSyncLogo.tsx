const WaveSyncLogo = () => {
  return (
    <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
          {/* Simple Wave Icon */}
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
            <path
              d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-primary-foreground"
            />
          </svg>
        </div>
        <div className="absolute -inset-1 rounded-xl bg-primary/30 blur-lg -z-10 animate-pulse-glow" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          WaveSync
        </h1>
        <p className="text-xs text-muted-foreground tracking-wide">Feel the rhythm</p>
      </div>
    </div>
  );
};

export default WaveSyncLogo;
