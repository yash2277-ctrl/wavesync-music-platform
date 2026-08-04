import { useState } from "react";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function SpotifyConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectSpotify = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/spotify/auth-url');
      const data = await response.json();
      
      if (data.success) {
        // Open Spotify auth in same window
        window.location.href = data.authUrl;
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to Spotify. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Spotify.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={connectSpotify}
      disabled={isConnecting}
      className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold gap-2"
    >
      <Music className="w-5 h-5" />
      {isConnecting ? "Connecting..." : "Connect Spotify Premium"}
    </Button>
  );
}
