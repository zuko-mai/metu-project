'use client';

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppUser, TaskPriority, TaskStatus, UserRole } from "@/types";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

interface NewTaskFormProps {
  currentUserRole: UserRole | null;
  currentUserId: string;
  developers: AppUser[];
}

// Только тестировщик может создавать задачи.
// Исполнителя выбираем из списка пользователей с ролью "developer".

export function NewTaskForm({
  currentUserRole,
  currentUserId,
  developers,
}: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isTester = currentUserRole === "tester";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedDev = developers.find((d) => d.id === assigneeId);

      await addDoc(collection(db, "tasks"), {
        title,
        status,
        projectId: "default-project",
        priority,
        assignee: selectedDev?.email || null,
        assigneeId: selectedDev?.id ?? null,
        assigneeEmail: selectedDev?.email ?? null,
        createdById: currentUserId,
        built: false,
        createdAt: serverTimestamp(),
        completedAt: status === "done" ? serverTimestamp() : null,
      });

      setTitle("");
      setPriority("medium");
      setAssigneeId("");
      setStatus("todo");
      setSuccess("Task created successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  if (!isTester) {
    return (
      <section className="mb-8 rounded-lg bg-white p-5 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Create new task
        </h2>
        <p className="text-sm text-gray-600">
          Only users with the <span className="font-semibold">Tester</span> role
          can create tasks.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-lg bg-white p-5 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Create new task
      </h2>

      {error && (
        <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded bg-green-50 p-2 text-sm text-green-700 border border-green-200">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-2 md:items-end"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Implement login page"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Assignee (developer)
          </label>
          <select
            required
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select developer</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.email ?? dev.id}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create task"}
          </button>
        </div>
      </form>
    </section>
  );
}

