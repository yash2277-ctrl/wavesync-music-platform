import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

const WaveBackground = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const newBubbles: Bubble[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 10,
      duration: Math.random() * 6 + 6,
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Ocean gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(210 60% 6%) 0%, hsl(200 55% 10%) 40%, hsl(190 50% 15%) 70%, hsl(180 45% 18%) 100%)"
        }}
      />

      {/* Animated glow orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, hsla(190, 100%, 50%, 0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, hsla(160, 70%, 45%, 0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "2s",
        }}
      />

      {/* Wave layers */}
      <svg
        className="absolute bottom-0 left-0 w-full h-64 animate-wave"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="hsla(190, 60%, 25%, 0.3)"
          d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <svg
        className="absolute bottom-0 left-0 w-full h-48 animate-wave-slow"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ animationDelay: "-2s" }}
      >
        <path
          fill="hsla(180, 50%, 20%, 0.4)"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <svg
        className="absolute bottom-0 left-0 w-full h-32"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ animation: "wave 10s ease-in-out infinite reverse" }}
      >
        <path
          fill="hsla(200, 45%, 12%, 0.6)"
          d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Rising bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: `${bubble.left}%`,
            bottom: "-20px",
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            background: "radial-gradient(circle at 30% 30%, hsla(190, 100%, 80%, 0.6), hsla(190, 80%, 50%, 0.2))",
            animation: `bubble-rise ${bubble.duration}s ease-in infinite`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default WaveBackground;
