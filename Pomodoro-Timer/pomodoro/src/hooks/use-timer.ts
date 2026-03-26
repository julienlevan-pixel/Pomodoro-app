import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { useToast } from "./use-toast";

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export interface Durations {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_DURATIONS: Durations = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
};

// Web Audio API helper for a gentle chime
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Create a pleasant double-chime sound
    osc.type = "sine";
    
    const now = ctx.currentTime;
    
    // First chime
    osc.frequency.setValueAtTime(523.25, now); // C5
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    // Second chime
    osc.frequency.setValueAtTime(659.25, now + 0.3); // E5
    gainNode.gain.setValueAtTime(0, now + 0.3);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.35);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.start(now);
    osc.stop(now + 1.3);
  } catch (err) {
    console.error("Audio playback failed", err);
  }
};

export function useTimer() {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [durations, setDurations] = useState<Durations>(() => {
    const saved = localStorage.getItem("pomodoro-durations");
    return saved ? JSON.parse(saved) : DEFAULT_DURATIONS;
  });
  
  const [timeLeft, setTimeLeft] = useState<number>(durations[mode] * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  const expectedEndTimeRef = useRef<number | null>(null);
  const { toast } = useToast();

  const getDurationInSeconds = useCallback((currentMode: TimerMode, currentDurations: Durations) => {
    return currentDurations[currentMode] * 60;
  }, []);

  const totalTime = getDurationInSeconds(mode, durations);
  const progress = 1 - timeLeft / totalTime;

  // Save durations to local storage when they change
  useEffect(() => {
    localStorage.setItem("pomodoro-durations", JSON.stringify(durations));
  }, [durations]);

  // Update timer if durations change while paused and reset
  useEffect(() => {
    if (!isRunning && timeLeft === getDurationInSeconds(mode, durations)) {
      setTimeLeft(getDurationInSeconds(mode, durations));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durations, mode, isRunning]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    playNotificationSound();
    
    if (mode === "pomodoro") {
      setCompletedSessions((prev) => prev + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b6b', '#fca311', '#ff9f1c']
      });
      toast({
        title: "Session complete!",
        description: "Great focus. Time for a break.",
      });
    } else {
      toast({
        title: "Break's over!",
        description: "Ready to focus again?",
      });
    }
  }, [mode, toast]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      if (!expectedEndTimeRef.current) {
        expectedEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      intervalId = setInterval(() => {
        const now = Date.now();
        const newTimeLeft = Math.round((expectedEndTimeRef.current! - now) / 1000);

        if (newTimeLeft <= 0) {
          setTimeLeft(0);
          handleTimerComplete();
          expectedEndTimeRef.current = null;
        } else {
          setTimeLeft(newTimeLeft);
        }
      }, 200); // Check more frequently than 1s for smoother sync
    } else {
      expectedEndTimeRef.current = null;
    }

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const toggleTimer = () => {
    if (!isRunning && timeLeft <= 0) {
      // If we're at 0 and trying to start, reset first
      setTimeLeft(getDurationInSeconds(mode, durations));
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    expectedEndTimeRef.current = null;
    setTimeLeft(getDurationInSeconds(mode, durations));
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    expectedEndTimeRef.current = null;
    setMode(newMode);
    setTimeLeft(getDurationInSeconds(newMode, durations));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formattedTime = formatTime(timeLeft);

  // Update document title dynamically
  useEffect(() => {
    const prefix = isRunning ? "⏳ " : "⏸ ";
    const modeName = mode === "pomodoro" ? "Focus" : "Break";
    document.title = `${prefix}${formattedTime} - ${modeName}`;
    
    return () => {
      document.title = "Pomodoro Timer";
    };
  }, [formattedTime, isRunning, mode]);

  return {
    timeLeft,
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
  };
}
