import { useCallback, useState } from "react";
import { type TaskMeta, defaultMeta } from "../types";

const STORAGE_KEY = "taskzen_meta";

function loadMeta(): Record<string, TaskMeta> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMeta(data: Record<string, TaskMeta>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useTaskMeta() {
  const [, forceUpdate] = useState(0);

  const getTaskMeta = useCallback((id: string): TaskMeta => {
    const all = loadMeta();
    return { ...defaultMeta(), ...(all[id] ?? {}) };
  }, []);

  const setTaskMeta = useCallback((id: string, partial: Partial<TaskMeta>) => {
    const all = loadMeta();
    all[id] = { ...defaultMeta(), ...(all[id] ?? {}), ...partial };
    saveMeta(all);
    forceUpdate((n) => n + 1);
  }, []);

  const removeTaskMeta = useCallback((id: string) => {
    const all = loadMeta();
    delete all[id];
    saveMeta(all);
    forceUpdate((n) => n + 1);
  }, []);

  const getAllMeta = useCallback((): Record<string, TaskMeta> => {
    return loadMeta();
  }, []);

  return { getTaskMeta, setTaskMeta, removeTaskMeta, getAllMeta };
}
