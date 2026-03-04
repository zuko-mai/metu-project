import type { Task, Bug, Build, TaskStatus } from "@/types";

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  avgCompletionTimeHours: number | null;
  totalBugs: number;
  buildFailureRate: number;
  taskCompletionRate: number;
  taskStatusCounts: Record<TaskStatus, number>;
  buildStatusCounts: { success: number; failure: number };
}

// Average completion time = completedAt - createdAt (for tasks with status "done").
export function calculateAverageCompletionTimeHours(tasks: Task[]): number | null {
  const completed = tasks.filter(
    (t) => t.status === "done" && t.createdAt && t.completedAt
  );

  if (completed.length === 0) return null;

  const totalMs = completed.reduce((sum, task) => {
    const created = task.createdAt.getTime();
    const completedAt = task.completedAt!.getTime();
    return sum + (completedAt - created);
  }, 0);

  const avgMs = totalMs / completed.length;
  const hours = avgMs / (1000 * 60 * 60);
  return Number(hours.toFixed(1));
}

// Build failure rate = failures / total builds.
export function calculateBuildFailureRate(builds: Build[]): number {
  if (builds.length === 0) return 0;
  const failures = builds.filter((b) => b.status === "failure").length;
  return failures / builds.length;
}

// Task completion rate = completed / total.
export function calculateTaskCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "done").length;
  return completed / tasks.length;
}

export function calculateTaskStatusCounts(
  tasks: Task[]
): Record<TaskStatus, number> {
  const base: Record<TaskStatus, number> = {
    todo: 0,
    "in-progress": 0,
    done: 0,
  };

  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, base);
}

export function calculateBuildStatusCounts(
  builds: Build[]
): { success: number; failure: number } {
  return builds.reduce(
    (acc, build) => {
      if (build.status === "success") acc.success += 1;
      if (build.status === "failure") acc.failure += 1;
      return acc;
    },
    { success: 0, failure: 0 }
  );
}

export function calculateDashboardStats(
  tasks: Task[],
  bugs: Bug[],
  builds: Build[]
): DashboardStats {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const avgCompletionTimeHours = calculateAverageCompletionTimeHours(tasks);
  const totalBugs = bugs.length;
  const buildFailureRate = calculateBuildFailureRate(builds);
  const taskCompletionRate = calculateTaskCompletionRate(tasks);
  const taskStatusCounts = calculateTaskStatusCounts(tasks);
  const buildStatusCounts = calculateBuildStatusCounts(builds);

  return {
    totalTasks,
    completedTasks,
    avgCompletionTimeHours,
    totalBugs,
    buildFailureRate,
    taskCompletionRate,
    taskStatusCounts,
    buildStatusCounts,
  };
}

