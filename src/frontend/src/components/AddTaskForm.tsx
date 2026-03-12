import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Mic, MicOff, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { Priority, TaskMeta } from "../types";
import { TASK_COLORS } from "../types";

interface Props {
  onAdd: (title: string, meta: Partial<TaskMeta>) => void;
  isLoading?: boolean;
}

interface SpeechRecogResult {
  readonly transcript: string;
}
interface SpeechRecogResultList {
  readonly 0: readonly SpeechRecogResult[];
}
interface SpeechRecogEvent {
  readonly results: SpeechRecogResultList;
}
interface SpeechRecogInstance {
  lang: string;
  onresult: ((e: SpeechRecogEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognition(): (new () => SpeechRecogInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (
    (w.SpeechRecognition as (new () => SpeechRecogInstance) | undefined) ??
    (w.webkitSpeechRecognition as
      | (new () => SpeechRecogInstance)
      | undefined) ??
    null
  );
}

export function AddTaskForm({ onAdd, isLoading }: Props) {
  const [title, setTitle] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [recurring, setRecurring] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<SpeechRecogInstance | null>(null);
  const hasSR = !!getSpeechRecognition();

  const startVoice = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    const r = new SR();
    recogRef.current = r;
    r.lang = "en-US";
    r.onresult = (e: SpeechRecogEvent) => {
      setTitle(e.results[0][0].transcript);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    setListening(true);
  }, []);

  const stopVoice = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onAdd(t, {
      priority,
      category: category.trim(),
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      deadline: deadline || null,
      color,
      recurring,
      subtasks: [],
    });
    setTitle("");
    setCategory("");
    setTags("");
    setDeadline("");
    setRecurring(false);
    setPriority("medium");
    setColor("#6366f1");
    setShowOptions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            data-ocid="todo.input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={listening ? "Listening…" : "Add a new task…"}
            className="pr-10 bg-card border-border"
            autoComplete="off"
          />
          {hasSR && (
            <button
              type="button"
              onClick={listening ? stopVoice : startVoice}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={listening ? "Stop listening" : "Voice input"}
            >
              {listening ? (
                <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowOptions((v) => !v)}
          className="h-10 w-10 text-muted-foreground"
          aria-label="Toggle options"
        >
          {showOptions ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
        <Button
          data-ocid="todo.add_button"
          type="submit"
          disabled={!title.trim() || isLoading}
          className="h-10 px-4 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {showOptions && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3 animate-fade-in">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Priority
            </p>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  aria-pressed={priority === p}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    priority === p
                      ? p === "high"
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : p === "medium"
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                          : "bg-green-500/20 border-green-500 text-green-400"
                      : "border-border text-muted-foreground hover:border-foreground"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Category
              </p>
              <Input
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Work"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Tags (comma-sep)
              </p>
              <Input
                aria-label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. design, frontend"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Deadline
              </p>
              <Input
                type="date"
                aria-label="Deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Reminder
              </p>
              <Input
                type="time"
                aria-label="Reminder time"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Color</p>
            <div className="flex gap-2 flex-wrap">
              {TASK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c
                      ? "scale-125 border-foreground"
                      : "border-transparent hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="task-recurring"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="rounded"
            />
            <label
              htmlFor="task-recurring"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Recurring task
            </label>
            {recurring && (
              <Badge variant="outline" className="text-xs">
                Daily
              </Badge>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
