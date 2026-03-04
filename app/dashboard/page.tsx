'use client';

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";
import type { Task, Bug, Build, AppUser, UserRole } from "@/types";
import { calculateDashboardStats } from "@/utils/analytics";
import { Navbar } from "@/components/Navbar";
import { KpiCard } from "@/components/KpiCard";
import { TaskStatusPieChart } from "@/components/TaskStatusPieChart";
import { BuildStatusBarChart } from "@/components/BuildStatusBarChart";
import { NewTaskForm } from "@/components/NewTaskForm";
import { TaskBoard } from "@/components/TaskBoard";
import { BuildQueue } from "@/components/BuildQueue";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [developers, setDevelopers] = useState<AppUser[]>([]);
  const [testerDoneTasks, setTesterDoneTasks] = useState<Task[]>([]);

  // Protect dashboard route with Firebase Auth.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
      } else {
        setUser(firebaseUser);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Real-time listeners for tasks (для разработчика), bugs, builds collections.
  useEffect(() => {
    if (!user) return;

    setLoadingData(true);
    setError(null);

    const tasksQuery = collection(db, "tasks");
    const bugsQuery = query(collection(db, "bugs"));
    const buildsQuery = query(collection(db, "builds"));

    const unsubTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const docs: Task[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            title: data.title,
            status: data.status,
            projectId: data.projectId,
            createdAt: data.createdAt?.toDate(),
            completedAt: data.completedAt ? data.completedAt.toDate() : null,
            assignee: data.assignee ?? null,
          };
        });
        setTasks(docs);
        setLoadingData(false);
      },
      (err) => {
        console.error("Error listening to tasks", err);
        setError("Failed to load tasks.");
        setLoadingData(false);
      }
    );

    const unsubBugs = onSnapshot(
      bugsQuery,
      (snapshot) => {
        const docs: Bug[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            projectId: data.projectId,
            createdAt: data.createdAt?.toDate(),
            resolvedAt: data.resolvedAt ? data.resolvedAt.toDate() : null,
          };
        });
        setBugs(docs);
      },
      (err) => {
        console.error("Error listening to bugs", err);
        setError("Failed to load bugs.");
      }
    );

    const unsubBuilds = onSnapshot(
      buildsQuery,
      (snapshot) => {
        const docs: Build[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            projectId: data.projectId,
            status: data.status,
            duration: data.duration,
            timestamp: data.timestamp?.toDate(),
          };
        });
        setBuilds(docs);
      },
      (err) => {
        console.error("Error listening to builds", err);
        setError("Failed to load builds.");
      }
    );

    return () => {
      unsubTasks();
      unsubBugs();
      unsubBuilds();
    };
  }, [user]);

  // Для тестировщика: задачи, которые он выдал и которые уже выполнены (status = done).
  useEffect(() => {
    if (!user || userRole !== "tester") {
      setTesterDoneTasks([]);
      return;
    }

    const testerTasksQuery = query(
      collection(db, "tasks"),
      where("createdById", "==", user.uid),
      where("status", "==", "done"),
      where("built", "==", false)
    );

    const unsubscribe = onSnapshot(
      testerTasksQuery,
      (snapshot) => {
        const docs: Task[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            title: data.title,
            status: data.status,
            projectId: data.projectId,
            createdAt: data.createdAt?.toDate(),
            completedAt: data.completedAt ? data.completedAt.toDate() : null,
            assignee: data.assignee ?? null,
            assigneeId: data.assigneeId ?? null,
            assigneeEmail: data.assigneeEmail ?? null,
            priority: data.priority ?? "medium",
            createdById: data.createdById ?? null,
          };
        });
        setTesterDoneTasks(docs);
      },
      (err) => {
        console.error("Error listening to tester tasks", err);
      }
    );

    return () => unsubscribe();
  }, [user, userRole]);

  // Load current user role and list of developers for assignment.
  useEffect(() => {
    if (!user) return;

    const loadUserAndDevelopers = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data() as any | undefined;
        const role: UserRole =
          (data?.role as UserRole | undefined) ?? "developer";
        setUserRole(role);

        const devSnap = await getDocs(
          query(collection(db, "users"), where("role", "==", "developer"))
        );

        const devs: AppUser[] = devSnap.docs.map((d) => {
          const u = d.data() as any;
          return {
            id: d.id,
            email: u.email ?? null,
            role: u.role as UserRole,
          };
        });
        setDevelopers(devs);
      } catch (err) {
        console.error("Failed to load user role or developers", err);
      }
    };

    loadUserAndDevelopers();
  }, [user]);

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Redirecting to login...
      </div>
    );
  }

  const stats = calculateDashboardStats(tasks, bugs, builds);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <NewTaskForm
          currentUserRole={userRole}
          currentUserId={user.uid}
          developers={developers}
        />

        {userRole === "tester" && (
          <BuildQueue tasks={testerDoneTasks} testerId={user.uid} />
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="flex justify-center py-10 text-gray-600">
            Loading dashboard data...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4 mb-8">
              <KpiCard
                title="Total Tasks"
                value={stats.totalTasks.toString()}
                subtitle={`Completion rate: ${(stats.taskCompletionRate * 100).toFixed(
                  0
                )}%`}
              />
              <KpiCard
                title="Completed Tasks"
                value={stats.completedTasks.toString()}
              />
              <KpiCard
                title="Avg Completion Time"
                value={
                  stats.avgCompletionTimeHours === null
                    ? "N/A"
                    : `${stats.avgCompletionTimeHours} h`
                }
                subtitle="Only completed tasks are counted"
              />
              <KpiCard
                title="Quality Overview"
                value={`${stats.totalBugs} bugs`}
                subtitle={`Build failure rate: ${(stats.buildFailureRate * 100).toFixed(
                  0
                )}%`}
              />
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <TaskStatusPieChart data={stats.taskStatusCounts} />
              <BuildStatusBarChart
                success={stats.buildStatusCounts.success}
                failure={stats.buildStatusCounts.failure}
              />
            </section>

            <TaskBoard tasks={tasks} currentUserId={user.uid} />
          </>
        )}
      </main>
    </div>
  );
}

