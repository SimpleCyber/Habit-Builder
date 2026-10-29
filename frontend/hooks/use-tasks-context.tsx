"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./use-auth";
import {
  getTasks as getTasksFromDb,
  createTask as createTaskInDb,
  updateTask as updateTaskInDb,
  deleteTask as deleteTaskFromDb,
  getTaskHistory,
  type Task,
  type TaskHistoryEntry,
} from "@/lib/firebase-db";
import { getTodayString, normalizeToLocalDateString } from "@/lib/date-utils";

interface TasksContextType {
  tasks: Task[];
  histories: Record<string, TaskHistoryEntry[]>;
  loading: boolean;
  histLoading: boolean;
  addTask: (
    taskData: Omit<Task, "id" | "createdAt" | "streak" | "lastUpdate">,
  ) => Promise<string | undefined>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  refreshHistories: (taskIds?: string[]) => Promise<void>;
  remainingTasksCount: number;
}

const TasksContext = createContext<TasksContextType>({
  tasks: [],
  histories: {},
  loading: true,
  histLoading: false,
  addTask: async () => undefined,
  updateTask: async () => {},
  deleteTask: async () => {},
  refreshHistories: async () => {},
  remainingTasksCount: 0,
});

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [histories, setHistories] = useState<
    Record<string, TaskHistoryEntry[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTasksFromDb(user.uid);
      setTasks(data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
      setHistories({});
      setLoading(false);
    }
  }, [user, loadTasks]);

  const refreshHistories = useCallback(
    async (taskIds?: string[]) => {
      if (!user) return;
      const ids = taskIds ?? tasks.map((t) => t.id);
      if (ids.length === 0) return;

      setHistLoading(true);
      try {
        const pairs = await Promise.all(
          ids.map(async (id) => {
            try {
              const h = await getTaskHistory(user.uid, id);
              return [id, h] as const;
            } catch {
              return [id, []] as const;
            }
          }),
        );
        setHistories((prev) => {
          const next = { ...prev };
          for (const [id, h] of pairs) next[id] = h;
          return next;
        });
      } finally {
        setHistLoading(false);
      }
    },
    [user, tasks],
  );

  // Lazy-load history only for tasks that haven't been loaded yet
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    const missing = tasks
      .map((t) => t.id)
      .filter((id) => histories[id] === undefined);

    if (missing.length > 0) {
      refreshHistories(missing);
    }
  }, [user, tasks, histories, refreshHistories]);

  // Optimistic Add Task
  const addTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "streak" | "lastUpdate">,
  ) => {
    if (!user || tasks.length >= 5) return;

    const tempId = `temp_${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: tempId,
      streak: 0,
      lastUpdate: null,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update list
    setTasks((prev) => [...prev, newTask]);

    try {
      const realId = await createTaskInDb(user.uid, taskData);
      if (realId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: realId } : t)),
        );
      }
      return realId;
    } catch (err) {
      console.error("Failed to add task:", err);
      // Revert optimistic add
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  // Optimistic Update Task (0ms latency check-in)
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    // 1. Snapshot previous state for rollback
    const previousTasks = [...tasks];

    // 2. Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    );

    // 3. Persist to Firestore
    try {
      await updateTaskInDb(user.uid, taskId, updates);
    } catch (err) {
      console.error("Failed to update task, rolling back:", err);
      setTasks(previousTasks);
    }
  };

  // Optimistic Delete Task
  const deleteTask = async (taskId: string) => {
    if (!user) return;

    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setHistories((prev) => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });

    try {
      await deleteTaskFromDb(user.uid, taskId);
    } catch (err) {
      console.error("Failed to delete task, rolling back:", err);
      setTasks(previousTasks);
    }
  };

  // Efficient remaining task calculation:
  // Checks lastUpdate (fastest) with history fallback
  const remainingTasksCount = tasks.filter((task) => {
    const today = getTodayString();
    if (task.lastUpdate) {
      const lastCheckDay = normalizeToLocalDateString(task.lastUpdate);
      if (lastCheckDay === today) return false;
    }

    const history = histories[task.id] || [];
    return !history.some((h) => normalizeToLocalDateString(h.date) === today);
  }).length;

  return (
    <TasksContext.Provider
      value={{
        tasks,
        histories,
        loading,
        histLoading,
        addTask,
        updateTask,
        deleteTask,
        refreshHistories,
        remainingTasksCount,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => useContext(TasksContext);
