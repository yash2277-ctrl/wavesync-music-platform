const WaveSyncLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const svgSize  = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
      <div className="relative">
        <div className={`${iconSize} rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg`}>
          <svg viewBox="0 0 24 24" className={svgSize} fill="none">
            <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute -inset-1 rounded-xl bg-cyan-400/30 blur-lg -z-10 animate-pulse" />
      </div>
      <div>
        <h1 className={`${textSize} font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent`}>
          WaveSync
        </h1>
        <p className="text-xs text-muted-foreground tracking-widest uppercase">AI Music</p>
      </div>
    </div>
  );
};

export default WaveSyncLogo;
