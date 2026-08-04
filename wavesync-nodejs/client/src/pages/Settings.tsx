import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, Volume2, Wifi, Download, Moon, Sun, Monitor, Globe, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [audioQuality, setAudioQuality] = useState("high");
  const [downloadQuality, setDownloadQuality] = useState("high");
  const [theme, setTheme] = useState("dark");
  const [autoplay, setAutoplay] = useState(true);
  const [crossfade, setCrossfade] = useState(false);
  const [normalizeVolume, setNormalizeVolume] = useState(true);
  const [streamingSource, setStreamingSource] = useState("auto");
  const [volume, setVolume] = useState([80]);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem("wavesync-settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAudioQuality(settings.audioQuality || "high");
      setDownloadQuality(settings.downloadQuality || "high");
      setTheme(settings.theme || "dark");
      setAutoplay(settings.autoplay !== undefined ? settings.autoplay : true);
      setCrossfade(settings.crossfade || false);
      setNormalizeVolume(settings.normalizeVolume !== undefined ? settings.normalizeVolume : true);
      setStreamingSource(settings.streamingSource || "auto");
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      audioQuality,
      downloadQuality,
      theme,
      autoplay,
      crossfade,
      normalizeVolume,
      streamingSource,
    };
    localStorage.setItem("wavesync-settings", JSON.stringify(settings));
    
    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    saveSettings();
  }, [audioQuality, downloadQuality, theme, autoplay, crossfade, normalizeVolume, streamingSource]);

  const handleLogout = () => {
    localStorage.removeItem("wavesync-token");
    localStorage.removeItem("wavesync-user");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <div className="pb-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Appearance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-5 h-5" /> : theme === "light" ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            Appearance
          </h2>
          <div className="bg-card rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="text-base">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Audio Quality */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Audio Quality
          </h2>
          <div className="bg-card rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality" className="text-base">Streaming Quality</Label>
              <Select value={audioQuality} onValueChange={setAudioQuality}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (96 kbps)</SelectItem>
                  <SelectItem value="normal">Normal (160 kbps)</SelectItem>
                  <SelectItem value="high">High (320 kbps)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="download-quality" className="text-base">Download Quality</Label>
              <Select value={downloadQuality} onValueChange={setDownloadQuality}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (160 kbps)</SelectItem>
                  <SelectItem value="high">High (320 kbps)</SelectItem>
                  <SelectItem value="very-high">Very High (FLAC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="normalize" className="text-base">Normalize Volume</Label>
                <p className="text-sm text-muted-foreground">Set the same volume level for all tracks</p>
              </div>
              <Switch
                id="normalize"
                checked={normalizeVolume}
                onCheckedChange={setNormalizeVolume}
              />
            </div>
          </div>
        </div>

        {/* Playback */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Playback
          </h2>
          <div className="bg-card rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoplay" className="text-base">Autoplay</Label>
                <p className="text-sm text-muted-foreground">Continue playing similar tracks when your music ends</p>
              </div>
              <Switch
                id="autoplay"
                checked={autoplay}
                onCheckedChange={setAutoplay}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="crossfade" className="text-base">Crossfade</Label>
                <p className="text-sm text-muted-foreground">Allow seamless transitions between tracks</p>
              </div>
              <Switch
                id="crossfade"
                checked={crossfade}
                onCheckedChange={setCrossfade}
              />
            </div>
          </div>
        </div>

        {/* Streaming Source */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Streaming Source
          </h2>
          <div className="bg-card rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="source" className="text-base">Preferred Source</Label>
                <p className="text-sm text-muted-foreground">Choose where to stream music from</p>
              </div>
              <Select value={streamingSource} onValueChange={setStreamingSource}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Library</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="bg-card rounded-lg p-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application</span>
              <span className="font-medium">WaveSync</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License</span>
              <span className="font-medium">MIT</span>
            </div>
          </div>
        </div>

        <Button onClick={saveSettings} className="w-full mb-4">
          Save Settings
        </Button>

        <Button onClick={handleLogout} variant="destructive" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </motion.div>
    </div>
  );
}
