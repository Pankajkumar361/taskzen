import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Task } from "../backend";
import { TaskStatus } from "../backend";

interface Props {
  tasks: Task[];
  onClose: () => void;
}

export function FocusMode({ tasks, onClose }: Props) {
  const pending = tasks
    .filter((t) => t.status === TaskStatus.pending)
    .slice(0, 10);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-8">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={onClose}
        aria-label="Close focus mode"
      >
        <X className="w-5 h-5" />
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-1">Focus Mode</h2>
        <p className="text-sm text-muted-foreground">Press ESC to exit</p>
      </div>

      {/* Mini Pomodoro */}
      <div className="flex items-center gap-4 mb-8 bg-card border border-border rounded-xl px-6 py-4">
        <span className="font-mono text-3xl font-bold tabular-nums">
          {mm}:{ss}
        </span>
        <div className="flex gap-2">
          <Button
            data-ocid="pomodoro.start_button"
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={() => setRunning((v) => !v)}
          >
            {running ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            data-ocid="pomodoro.reset_button"
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={() => {
              setRunning(false);
              setSeconds(25 * 60);
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task list */}
      <div className="w-full max-w-md space-y-2">
        {pending.length === 0 ? (
          <p className="text-center text-muted-foreground">
            ✨ No pending tasks. Great job!
          </p>
        ) : (
          pending.map((task, i) => (
            <div
              key={task.id.toString()}
              className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3"
            >
              <span className="text-muted-foreground text-sm tabular-nums w-5">
                {i + 1}.
              </span>
              <span className="text-sm font-medium">{task.title}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
