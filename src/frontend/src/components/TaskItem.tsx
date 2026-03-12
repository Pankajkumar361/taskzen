import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Task } from "../backend";
import { TaskStatus } from "../backend";
import type { Priority, Subtask, TaskMeta } from "../types";
import { TASK_COLORS } from "../types";

interface Props {
  task: Task;
  meta: TaskMeta;
  index: number;
  onToggle: (id: bigint) => void;
  onDelete: (task: Task) => void;
  onEdit: (id: bigint, title: string, reminderTime: string | null) => void;
  onMoveUp: (id: bigint, sortOrder: bigint) => void;
  onMoveDown: (id: bigint, sortOrder: bigint) => void;
  onMetaChange: (id: string, meta: Partial<TaskMeta>) => void;
  isFirst: boolean;
  isLast: boolean;
}

function formatDeadline(
  deadline: string | null,
): { label: string; cls: string } | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0)
    return {
      label: "Overdue",
      cls: "bg-red-500/20 text-red-400 border-red-500/30",
    };
  if (diff === 0)
    return {
      label: "Today",
      cls: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
  if (diff === 1)
    return {
      label: "Tomorrow",
      cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
  return {
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    cls: "bg-muted text-muted-foreground border-border",
  };
}

export function TaskItem({
  task,
  meta,
  index,
  onToggle,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  onMetaChange,
  isFirst,
  isLast,
}: Props) {
  const completed = task.status === TaskStatus.completed;
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editReminder, setEditReminder] = useState(task.reminderTime ?? "");
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode) editRef.current?.focus();
  }, [editMode]);

  const saveEdit = () => {
    const t = editTitle.trim();
    if (t) onEdit(task.id, t, editReminder || null);
    setEditMode(false);
  };

  const deadline = formatDeadline(meta.deadline);
  const priorityDot =
    meta.priority === "high" ? "🔴" : meta.priority === "medium" ? "🟡" : "🟢";

  const addSubtask = () => {
    const t = newSubtask.trim();
    if (!t) return;
    const sub: Subtask = {
      id: crypto.randomUUID(),
      title: t,
      completed: false,
    };
    onMetaChange(task.id.toString(), { subtasks: [...meta.subtasks, sub] });
    setNewSubtask("");
  };

  const toggleSubtask = (sid: string) => {
    onMetaChange(task.id.toString(), {
      subtasks: meta.subtasks.map((s) =>
        s.id === sid ? { ...s, completed: !s.completed } : s,
      ),
    });
  };

  const deleteSubtask = (sid: string) => {
    onMetaChange(task.id.toString(), {
      subtasks: meta.subtasks.filter((s) => s.id !== sid),
    });
  };

  const setPriority = (p: Priority) =>
    onMetaChange(task.id.toString(), { priority: p });
  const setColor = (c: string) =>
    onMetaChange(task.id.toString(), { color: c });

  return (
    <div
      data-ocid={`todo.item.${index}`}
      className={`group relative flex flex-col border-b border-border last:border-0 transition-colors ${
        completed ? "bg-muted/20" : "bg-card hover:bg-card/80"
      }`}
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Toggle */}
        <button
          type="button"
          data-ocid={`todo.checkbox.${index}`}
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 shrink-0 transition-colors ${
            completed
              ? "text-green-500"
              : "text-muted-foreground hover:text-primary"
          }`}
          aria-label={completed ? "Mark pending" : "Mark complete"}
        >
          {completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editMode ? (
            <div className="space-y-2">
              <Input
                ref={editRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") setEditMode(false);
                }}
                className="h-7 text-sm"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={editReminder}
                  onChange={(e) => setEditReminder(e.target.value)}
                  className="h-7 text-xs w-32"
                />
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={saveEdit}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-medium leading-snug ${completed ? "task-completed" : ""}`}
                >
                  {task.title}
                </span>
                <span className="text-xs" title={`${meta.priority} priority`}>
                  {priorityDot}
                </span>
                {meta.recurring && (
                  <RefreshCw className="w-3 h-3 text-muted-foreground" />
                )}
              </div>

              {/* Chips row */}
              <div className="flex flex-wrap gap-1 mt-1">
                {meta.category && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                    {meta.category}
                  </Badge>
                )}
                {meta.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5"
                  >
                    <Tag className="w-2.5 h-2.5 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {deadline && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-4 px-1.5 border ${deadline.cls}`}
                  >
                    <Calendar className="w-2.5 h-2.5 mr-1" />
                    {deadline.label}
                  </Badge>
                )}
                {task.reminderTime && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                    <Bell className="w-2.5 h-2.5 mr-1" />
                    {task.reminderTime}
                  </Badge>
                )}
              </div>

              {/* Subtasks toggle */}
              <button
                type="button"
                onClick={() => setShowSubtasks((v) => !v)}
                className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSubtasks ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                {meta.subtasks.length > 0
                  ? `${meta.subtasks.filter((s) => s.completed).length}/${meta.subtasks.length} subtasks`
                  : "Add subtasks"}
              </button>
            </>
          )}
        </div>

        {/* Actions */}
        {!editMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground"
                aria-label="Task options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setEditTitle(task.title);
                  setEditReminder(task.reminderTime ?? "");
                  setEditMode(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <p className="text-xs text-muted-foreground mb-1 font-medium">
                  Priority
                </p>
                <div className="flex gap-1">
                  {(["high", "medium", "low"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 text-[10px] py-0.5 rounded border transition-colors ${
                        meta.priority === p
                          ? "bg-primary/20 border-primary"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <p className="text-xs text-muted-foreground mb-1 font-medium">
                  Color
                </p>
                <div className="flex gap-1 flex-wrap">
                  {TASK_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-4 h-4 rounded-full border-2 ${
                        meta.color === c
                          ? "border-foreground scale-125"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              {!isFirst && (
                <DropdownMenuItem
                  onClick={() => onMoveUp(task.id, task.sortOrder)}
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Move Up
                </DropdownMenuItem>
              )}
              {!isLast && (
                <DropdownMenuItem
                  onClick={() => onMoveDown(task.id, task.sortOrder)}
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Move Down
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-ocid={`todo.delete_button.${index}`}
                onClick={() => setShowDelete(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Subtasks panel */}
      {showSubtasks && (
        <div className="px-12 pb-3 space-y-1 animate-fade-in">
          {meta.subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2 group/sub">
              <button
                type="button"
                onClick={() => toggleSubtask(s.id)}
                className={`shrink-0 ${s.completed ? "text-green-500" : "text-muted-foreground hover:text-primary"}`}
                aria-label={
                  s.completed ? "Mark subtask pending" : "Complete subtask"
                }
              >
                {s.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
              <span
                className={`text-sm flex-1 ${s.completed ? "line-through opacity-50" : ""}`}
              >
                {s.title}
              </span>
              <button
                type="button"
                onClick={() => deleteSubtask(s.id)}
                className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive"
                aria-label="Delete subtask"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <Input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubtask();
                }
              }}
              placeholder="Add subtask…"
              className="h-7 text-sm"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={addSubtask}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent data-ocid="todo.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete "{task.title}". You can undo immediately after.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="todo.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="todo.confirm_button"
              onClick={() => {
                setShowDelete(false);
                onDelete(task);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
