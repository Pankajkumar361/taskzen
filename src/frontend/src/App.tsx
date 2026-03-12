import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  Brain,
  Clock4,
  Focus,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Timer,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Task } from "./backend";
import { TaskStatus } from "./backend";
import { AIPanel } from "./components/AIPanel";
import { AddTaskForm } from "./components/AddTaskForm";
import { FocusMode } from "./components/FocusMode";
import { PomodoroTab } from "./components/PomodoroTab";
import { StatsTab } from "./components/StatsTab";
import { TaskList } from "./components/TaskList";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { usePreferences } from "./hooks/usePreferences";
import {
  useAddTask,
  useDeleteTask,
  useGetTasks,
  useReorderTask,
  useToggleTask,
  useUpdateTask,
} from "./hooks/useQueries";
import { useTaskMeta } from "./hooks/useTaskMeta";
import type { TaskMeta } from "./types";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm tabular-nums text-muted-foreground tracking-wider">
      {time}
    </span>
  );
}

function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm w-full animate-fade-in">
        <div className="mb-8">
          <div className="text-5xl mb-4">⚡</div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight mb-2">
            TaskZen
          </h1>
          <p className="text-muted-foreground text-sm">
            Your intelligent productivity companion.
          </p>
        </div>
        <div className="space-y-3 mb-6 text-left">
          {[
            "Smart task organization",
            "Pomodoro focus timer",
            "AI productivity assistant",
            "Stats & progress tracking",
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="text-primary">✓</span> {f}
            </div>
          ))}
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full h-11 font-medium"
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Connecting…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign in with Internet Identity
            </span>
          )}
        </Button>
        <p className="text-xs text-muted-foreground/60 mt-4">
          Secure, decentralized, no password needed.
        </p>
      </div>
    </div>
  );
}

function TaskApp() {
  const { identity, clear } = useInternetIdentity();
  const { data: tasks = [], isLoading } = useGetTasks();
  const addTask = useAddTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();
  const updateTask = useUpdateTask();
  const reorderTask = useReorderTask();
  const { getTaskMeta, setTaskMeta, removeTaskMeta } = useTaskMeta();
  const { prefs, setPrefs } = usePreferences();
  const [focusMode, setFocusMode] = useState(false);
  const firedReminders = useRef<Set<string>>(new Set());

  // Reminder check
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hhmm = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const dateStr = now.toDateString();
      for (const task of tasks) {
        if (!task.reminderTime) continue;
        if (task.status === TaskStatus.completed) continue;
        const key = `${task.id.toString()}:${dateStr}`;
        if (task.reminderTime === hhmm && !firedReminders.current.has(key)) {
          firedReminders.current.add(key);
          toast(`Reminder: ${task.title}`, {
            icon: <Clock4 className="w-4 h-4 text-primary" />,
            duration: 8000,
          });
        }
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [tasks]);

  const handleAdd = useCallback(
    (title: string, meta: Partial<TaskMeta>) => {
      addTask.mutate(
        { title, reminderTime: null },
        {
          onSuccess: (id) => {
            if (id != null) setTaskMeta(id.toString(), meta);
          },
        },
      );
    },
    [addTask, setTaskMeta],
  );

  const handleAddSimple = useCallback(
    (title: string) => {
      addTask.mutate({ title, reminderTime: null });
    },
    [addTask],
  );

  const handleDelete = useCallback(
    (task: Task) => {
      const savedMeta = getTaskMeta(task.id.toString());
      deleteTask.mutate(task.id, {
        onSuccess: () => {
          removeTaskMeta(task.id.toString());
          toast(`"${task.title}" deleted`, {
            action: {
              label: "Undo",
              onClick: () => {
                addTask.mutate(
                  {
                    title: task.title,
                    reminderTime: task.reminderTime ?? null,
                  },
                  {
                    onSuccess: (newId) => {
                      if (newId != null)
                        setTaskMeta(newId.toString(), savedMeta);
                      toast.success("Task restored");
                    },
                  },
                );
              },
            },
            duration: 5000,
          });
        },
      });
    },
    [deleteTask, addTask, getTaskMeta, removeTaskMeta, setTaskMeta],
  );

  const handleToggle = useCallback(
    (id: bigint) => {
      toggleTask.mutate(id);
    },
    [toggleTask],
  );

  const handleEdit = useCallback(
    (id: bigint, title: string, reminderTime: string | null) => {
      updateTask.mutate({ id, title, reminderTime });
    },
    [updateTask],
  );

  const handleMoveUp = useCallback(
    (id: bigint, sortOrder: bigint) => {
      reorderTask.mutate({ id, newSortOrder: sortOrder - BigInt(1) });
    },
    [reorderTask],
  );

  const handleMoveDown = useCallback(
    (id: bigint, sortOrder: bigint) => {
      reorderTask.mutate({ id, newSortOrder: sortOrder + BigInt(1) });
    },
    [reorderTask],
  );

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : "";
  const pendingCount = tasks.filter(
    (t) => t.status === TaskStatus.pending,
  ).length;

  return (
    <>
      {focusMode && (
        <FocusMode tasks={tasks} onClose={() => setFocusMode(false)} />
      )}

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
                TaskZen
              </h1>
              {pendingCount > 0 && (
                <span className="text-xs tabular-nums bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
                  {pendingCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <LiveClock />
              <Button
                data-ocid="focus_mode.button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setFocusMode(true)}
                aria-label="Focus mode"
              >
                <Focus className="w-4 h-4" />
              </Button>
              <Button
                data-ocid="theme.toggle"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setPrefs({ darkMode: !prefs.darkMode })}
                aria-label="Toggle theme"
              >
                {prefs.darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              {shortPrincipal && (
                <span className="hidden sm:block text-xs text-muted-foreground font-mono">
                  {shortPrincipal}
                </span>
              )}
              <Button
                data-ocid="auth.logout_button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={clear}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          <Tabs defaultValue="tasks">
            <TabsList className="w-full mb-6 grid grid-cols-4">
              <TabsTrigger
                data-ocid="tab.tasks"
                value="tasks"
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <Clock4 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tasks</span>
                <span className="sm:hidden">Tasks</span>
              </TabsTrigger>
              <TabsTrigger
                data-ocid="tab.stats"
                value="stats"
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Stats</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger
                data-ocid="tab.pomodoro"
                value="pomodoro"
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <Timer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pomodoro</span>
                <span className="sm:hidden">Focus</span>
              </TabsTrigger>
              <TabsTrigger
                data-ocid="tab.ai"
                value="ai"
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <Brain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <div className="space-y-4">
                <AddTaskForm onAdd={handleAdd} isLoading={addTask.isPending} />
                <div className="border border-border rounded-lg overflow-hidden">
                  <TaskList
                    tasks={tasks}
                    isLoading={isLoading}
                    getTaskMeta={getTaskMeta}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onMetaChange={setTaskMeta}
                  />
                </div>
                {!isLoading && tasks.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{pendingCount} pending</span>
                    <span>
                      {
                        tasks.filter((t) => t.status === TaskStatus.completed)
                          .length
                      }{" "}
                      completed
                    </span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <StatsTab tasks={tasks} />
            </TabsContent>

            <TabsContent value="pomodoro">
              <PomodoroTab />
            </TabsContent>

            <TabsContent value="ai">
              <AIPanel tasks={tasks} onAddTask={handleAddSimple} />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t border-border py-4 px-6">
          <p className="text-center text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} TaskZen · Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-card border border-border text-foreground",
            actionButton:
              "bg-primary text-primary-foreground hover:bg-primary/90",
          },
        }}
      />
      {identity ? <TaskApp /> : <LoginScreen />}
    </>
  );
}
