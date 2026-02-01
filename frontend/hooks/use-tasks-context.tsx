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
    const data = await getTasksFromDb(user.uid);
    setTasks(data || []);
    setLoading(false);
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
            const h = await getTaskHistory(user.uid, id);
            return [id, h] as const;
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

  // Load/refresh history whenever tasks list changes
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    const missing = tasks
      .map((t) => t.id)
      .filter((id) => histories[id] === undefined);

    if (missing.length > 0) {
      refreshHistories(missing);
    }
  }, [user, tasks, histories, refreshHistories]);

  const addTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "streak" | "lastUpdate">,
  ) => {
    if (!user || tasks.length >= 5) return;
    const taskId = await createTaskInDb(user.uid, taskData);
    await loadTasks();
    return taskId;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    await updateTaskInDb(user.uid, taskId, updates);
    await loadTasks();
    // Also refresh history for this task in case it affects completion state
    await refreshHistories([taskId]);
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteTaskFromDb(user.uid, taskId);
    setHistories((prev) => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
    await loadTasks();
  };

  // Calculate remaining tasks for today
  const remainingTasksCount = tasks.filter((task) => {
    const history = histories[task.id] || [];
    const today = new Date().toDateString();
    return !history.some((h) => new Date(h.date).toDateString() === today);
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
