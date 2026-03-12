import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "../backend";
import { TaskStatus } from "../backend";
import type { TaskMeta } from "../types";
import { TaskItem } from "./TaskItem";

interface Props {
  tasks: Task[];
  isLoading: boolean;
  getTaskMeta: (id: string) => TaskMeta;
  onToggle: (id: bigint) => void;
  onDelete: (task: Task) => void;
  onEdit: (id: bigint, title: string, reminderTime: string | null) => void;
  onMoveUp: (id: bigint, sortOrder: bigint) => void;
  onMoveDown: (id: bigint, sortOrder: bigint) => void;
  onMetaChange: (id: string, meta: Partial<TaskMeta>) => void;
}

export function TaskList({
  tasks,
  isLoading,
  getTaskMeta,
  onToggle,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  onMetaChange,
}: Props) {
  if (isLoading) {
    return (
      <div className="divide-y divide-border" data-ocid="todo.loading_state">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  const pending = tasks
    .filter((t) => t.status === TaskStatus.pending)
    .sort(
      (a, b) =>
        Number(a.sortOrder - b.sortOrder) || Number(a.createdAt - b.createdAt),
    );

  const completed = tasks
    .filter((t) => t.status === TaskStatus.completed)
    .sort((a, b) => Number(b.createdAt - a.createdAt));

  if (tasks.length === 0) {
    return (
      <div
        data-ocid="todo.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="text-4xl mb-3">✨</div>
        <p className="text-sm font-medium text-foreground">All clear!</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add your first task above to get started.
        </p>
      </div>
    );
  }

  let idx = 0;
  return (
    <div className="divide-y divide-border">
      {pending.length > 0 && (
        <>
          <div className="px-4 py-2 bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending
            </span>
          </div>
          {pending.map((task, i) => {
            const itemIdx = ++idx;
            return (
              <TaskItem
                key={task.id.toString()}
                task={task}
                meta={getTaskMeta(task.id.toString())}
                index={itemIdx}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onMetaChange={onMetaChange}
                isFirst={i === 0}
                isLast={i === pending.length - 1}
              />
            );
          })}
        </>
      )}
      {completed.length > 0 && (
        <>
          <div className="px-4 py-2 bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </span>
          </div>
          {completed.map((task, i) => {
            const itemIdx = ++idx;
            return (
              <TaskItem
                key={task.id.toString()}
                task={task}
                meta={getTaskMeta(task.id.toString())}
                index={itemIdx}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onMetaChange={onMetaChange}
                isFirst={i === 0}
                isLast={i === completed.length - 1}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
