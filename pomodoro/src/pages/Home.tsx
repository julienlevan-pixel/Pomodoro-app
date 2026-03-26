import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimer, TimerMode } from "@/hooks/use-timer";
import { SettingsModal } from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";

export default function Home() {
  const {
    formattedTime,
    isRunning,
    mode,
    durations,
    completedSessions,
    progress,
    toggleTimer,
    resetTimer,
    switchMode,
    setDurations,
  } = useTimer();

  const modes: { id: TimerMode; label: string }[] = [
    { id: "pomodoro", label: "Pomodoro" },
    { id: "shortBreak", label: "Short Break" },
    { id: "longBreak", label: "Long Break" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-background selection:bg-primary/20 transition-colors duration-500 overflow-hidden relative">
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <main className="w-full max-w-2xl flex flex-col items-center z-10">
        
        {/* Mode Selector */}
        <div className="flex p-1.5 space-x-1 bg-black/5 dark:bg-white/10 rounded-2xl backdrop-blur-sm shadow-inner mb-12">
          {modes.map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={`
                  relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out outline-none
                  ${isActive ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-xl shadow-sm shadow-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timer Display Card */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-md aspect-[4/3] mb-12 group">
          
          {/* Subtle linear progress bar positioned at top of timer */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>

          <motion.div 
            className="text-[6rem] sm:text-[9rem] font-bold font-mono tracking-tighter text-foreground tabular-nums select-none mt-4"
            animate={{ scale: isRunning ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {formattedTime}
          </motion.div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6 mb-16">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetTimer}
            className="h-14 w-14 rounded-full text-muted-foreground hover:text-foreground bg-card shadow-sm hover:shadow-md border border-border/50 hover:border-border transition-all hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Reset Timer"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button 
            size="icon"
            onClick={toggleTimer}
            className={`
              h-24 w-24 rounded-full shadow-xl transition-all duration-300 ease-out
              hover:-translate-y-1 active:translate-y-0 active:shadow-md
              ${isRunning 
                ? "bg-secondary text-secondary-foreground shadow-black/5 hover:bg-secondary/80" 
                : "bg-primary text-primary-foreground shadow-primary/30 hover:shadow-primary/40"
              }
            `}
            aria-label={isRunning ? "Pause" : "Start"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isRunning ? "pause" : "play"}
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                {isRunning ? (
                  <Pause className="h-10 w-10 fill-current" />
                ) : (
                  <Play className="h-10 w-10 fill-current ml-1" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>

          <SettingsModal durations={durations} onSave={setDurations} />
        </div>

        {/* Session Tracker */}
        <div className="flex flex-col items-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sessions Today
          </span>
          <div className="flex gap-2">
            {[...Array(Math.max(4, completedSessions + 1))].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-3 h-3 rounded-full ${
                  i < completedSessions 
                    ? "bg-primary shadow-sm shadow-primary/40" 
                    : "bg-black/10 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
          <div className="text-sm font-medium text-foreground/80 mt-2">
            {completedSessions} {completedSessions === 1 ? "session" : "sessions"} completed
          </div>
        </div>

      </main>
    </div>
  );
}
