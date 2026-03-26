import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Durations } from "@/hooks/use-timer";

interface SettingsModalProps {
  durations: Durations;
  onSave: (newDurations: Durations) => void;
}

export function SettingsModal({ durations, onSave }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [localDurations, setLocalDurations] = useState<Durations>(durations);

  const handleSave = () => {
    // Ensure minimums
    const safeDurations = {
      pomodoro: Math.max(1, localDurations.pomodoro),
      shortBreak: Math.max(1, localDurations.shortBreak),
      longBreak: Math.max(1, localDurations.longBreak),
    };
    onSave(safeDurations);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-full h-12 w-12">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-3xl bg-background/95 backdrop-blur-xl">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-medium">Timer Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Time (minutes)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pomodoro" className="text-xs">Pomodoro</Label>
                <Input 
                  id="pomodoro" 
                  type="number" 
                  min="1" 
                  className="bg-card shadow-sm border-border focus-visible:ring-primary h-12 rounded-xl text-center font-medium text-lg"
                  value={localDurations.pomodoro}
                  onChange={(e) => setLocalDurations(p => ({ ...p, pomodoro: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortBreak" className="text-xs whitespace-nowrap">Short Break</Label>
                <Input 
                  id="shortBreak" 
                  type="number" 
                  min="1" 
                  className="bg-card shadow-sm border-border focus-visible:ring-primary h-12 rounded-xl text-center font-medium text-lg"
                  value={localDurations.shortBreak}
                  onChange={(e) => setLocalDurations(p => ({ ...p, shortBreak: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longBreak" className="text-xs whitespace-nowrap">Long Break</Label>
                <Input 
                  id="longBreak" 
                  type="number" 
                  min="1" 
                  className="bg-card shadow-sm border-border focus-visible:ring-primary h-12 rounded-xl text-center font-medium text-lg"
                  value={localDurations.longBreak}
                  onChange={(e) => setLocalDurations(p => ({ ...p, longBreak: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} className="rounded-xl px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
