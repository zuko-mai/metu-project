export type TaskStatus = "todo" | "in-progress" | "done";
export type BuildStatus = "success" | "failure";
export type UserRole = "tester" | "developer";
export type TaskPriority = "low" | "medium" | "high";

export interface Project {
  id: string;
  name: string;
}

export interface AppUser {
  id: string;
  email: string | null;
  role: UserRole;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date | null;
  projectId: string;
  assignee?: string | null;
  assigneeId?: string | null;
  assigneeEmail?: string | null;
  priority?: TaskPriority;
  createdById?: string | null;
  createdByEmail?: string | null;
  built?: boolean;
}

export interface Bug {
  id: string;
  projectId: string;
  createdAt: Date;
  resolvedAt?: Date | null;
}

export interface Build {
  id: string;
  projectId: string;
  status: BuildStatus;
  duration: number; // seconds
  timestamp: Date;
  taskId?: string | null;
  developerId?: string | null;
  testerId?: string | null;
}

