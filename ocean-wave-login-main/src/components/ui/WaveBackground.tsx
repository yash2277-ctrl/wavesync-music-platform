import { useEffect, useState } from 'react';

interface Bubble { id: number; left: number; size: number; delay: number; duration: number }

const WaveBackground = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 10,
      duration: Math.random() * 6 + 6,
    })));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, hsl(210 60% 6%) 0%, hsl(200 55% 10%) 40%, hsl(190 50% 15%) 70%, hsl(180 45% 18%) 100%)' }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-pulse-glow" style={{ background: 'radial-gradient(circle, hsla(190,100%,50%,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full animate-pulse-glow" style={{ background: 'radial-gradient(circle, hsla(160,70%,45%,0.12) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '2s' }} />

      {/* Wave SVGs */}
      <svg className="absolute bottom-0 left-0 w-full h-64 animate-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="hsla(190,60%,25%,0.3)" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full h-48 animate-wave-slow" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ animationDelay: '-2s' }}>
        <path fill="hsla(180,50%,20%,0.4)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z" />
      </svg>

      {/* Bubbles */}
      {bubbles.map(b => (
        <div key={b.id} className="absolute rounded-full" style={{ left: `${b.left}%`, bottom: '-20px', width: `${b.size}px`, height: `${b.size}px`, background: 'radial-gradient(circle at 30% 30%, hsla(190,100%,80%,0.6), hsla(190,80%,50%,0.2))', animation: `bubble-rise ${b.duration}s ease-in infinite`, animationDelay: `${b.delay}s` }} />
      ))}
    </div>
  );
};

export default WaveBackground;
