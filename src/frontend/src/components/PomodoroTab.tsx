import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Phase = "work" | "short" | "long";

const PHASES: Record<Phase, { label: string; minutes: number; color: string }> =
  {
    work: { label: "Focus", minutes: 25, color: "#6366f1" },
    short: { label: "Short Break", minutes: 5, color: "#22c55e" },
    long: { label: "Long Break", minutes: 15, color: "#06b6d4" },
  };

const SIZE = 160;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function getNextPhase(current: Phase, count: number): Phase {
  if (current !== "work") return "work";
  const newCount = count + 1;
  return newCount % 4 === 0 ? "long" : "short";
}

export function PomodoroTab() {
  const [phase, setPhase] = useState<Phase>("work");
  const [seconds, setSeconds] = useState(PHASES.work.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("work");
  const sessionsRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  const totalSeconds = PHASES[phase].minutes * 60;
  const progress = seconds / totalSeconds;
  const dashOffset = CIRC * (1 - progress);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            const currentPhase = phaseRef.current;
            const currentSessions = sessionsRef.current;
            const newCount =
              currentPhase === "work" ? currentSessions + 1 : currentSessions;
            const np = getNextPhase(currentPhase, newCount);
            setSessions(newCount);
            setPhase(np);
            setSeconds(PHASES[np].minutes * 60);
            toast(
              `${PHASES[currentPhase].label} done! Starting ${PHASES[np].label}.`,
              { duration: 5000 },
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setSeconds(PHASES[phase].minutes * 60);
  };

  const skip = () => {
    setRunning(false);
    const newCount = phase === "work" ? sessions + 1 : sessions;
    const np = getNextPhase(phase, newCount);
    setSessions(newCount);
    setPhase(np);
    setSeconds(PHASES[np].minutes * 60);
  };

  const switchPhase = (p: Phase) => {
    setRunning(false);
    setPhase(p);
    setSeconds(PHASES[p].minutes * 60);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const phaseColor = PHASES[phase].color;

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in py-4">
      {/* Phase selector */}
      <div className="flex gap-2">
        {(Object.entries(PHASES) as [Phase, (typeof PHASES)[Phase]][]).map(
          ([key, val]) => (
            <button
              key={key}
              type="button"
              data-ocid="pomodoro.toggle"
              onClick={() => switchPhase(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                phase === key
                  ? "text-white border-transparent"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
              style={phase === key ? { backgroundColor: phaseColor } : {}}
            >
              {val.label}
            </button>
          ),
        )}
      </div>

      {/* Ring timer */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          style={{ transform: "rotate(-90deg)" }}
          aria-label={`${PHASES[phase].label} timer: ${mm}:${ss}`}
          role="img"
        >
          <title>{PHASES[phase].label} Timer</title>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={phaseColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            className="pomodoro-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-bold tabular-nums">
            {mm}:{ss}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {PHASES[phase].label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          data-ocid="pomodoro.reset_button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={reset}
          aria-label="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          data-ocid="pomodoro.start_button"
          size="lg"
          className="h-12 w-32 text-base font-semibold"
          onClick={() => setRunning((v) => !v)}
          style={{ backgroundColor: phaseColor, color: "white" }}
        >
          {running ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={skip}
          aria-label="Skip"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Session count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Sessions completed:{" "}
        <Badge variant="outline" className="tabular-nums">
          {sessions}
        </Badge>
      </div>

      {/* Tips */}
      <div className="bg-muted/40 rounded-lg p-4 max-w-sm text-center">
        <p className="text-xs text-muted-foreground">
          {phase === "work"
            ? "🎯 Stay focused. Close distractions and work on one task at a time."
            : phase === "short"
              ? "☕ Take a short break. Stretch, breathe, hydrate."
              : "🌳 Great work! Take a longer break to recharge your mind."}
        </p>
      </div>
    </div>
  );
}
