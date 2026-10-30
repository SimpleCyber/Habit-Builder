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
  loading: false,
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
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(false);

  // 1. Instant local hydration from localStorage
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setHistories({});
      return;
    }

    try {
      const cached = localStorage.getItem(`habitx_tasks_${user.uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      }
    } catch {}
  }, [user]);

  // 2. Background sync with Firestore
  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTasksFromDb(user.uid);
      if (data) {
        setTasks(data);
        try {
          localStorage.setItem(
            `habitx_tasks_${user.uid}`,
            JSON.stringify(data),
          );
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, loadTasks]);

  // Load history on-demand when needed
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

    setTasks((prev) => {
      const updated = [...prev, newTask];
      try {
        localStorage.setItem(
          `habitx_tasks_${user.uid}`,
          JSON.stringify(updated),
        );
      } catch {}
      return updated;
    });

    try {
      const realId = await createTaskInDb(user.uid, taskData);
      if (realId) {
        setTasks((prev) => {
          const updated = prev.map((t) =>
            t.id === tempId ? { ...t, id: realId } : t,
          );
          try {
            localStorage.setItem(
              `habitx_tasks_${user.uid}`,
              JSON.stringify(updated),
            );
          } catch {}
          return updated;
        });
      }
      return realId;
    } catch (err) {
      console.error("Failed to add task:", err);
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  // Optimistic Update Task (0ms response)
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    const previousTasks = [...tasks];
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t,
      );
      try {
        localStorage.setItem(
          `habitx_tasks_${user.uid}`,
          JSON.stringify(updated),
        );
      } catch {}
      return updated;
    });

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
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      try {
        localStorage.setItem(
          `habitx_tasks_${user.uid}`,
          JSON.stringify(updated),
        );
      } catch {}
      return updated;
    });

    try {
      await deleteTaskFromDb(user.uid, taskId);
    } catch (err) {
      console.error("Failed to delete task, rolling back:", err);
      setTasks(previousTasks);
    }
  };

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
