'use client';

import { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Task, TaskStatus } from "@/types";

interface TaskBoardProps {
  tasks: Task[];
  currentUserId: string;
}

const COLUMNS: { key: TaskStatus; title: string }[] = [
  { key: "todo", "title": "To do" },
  { key: "in-progress", "title": "In progress" },
  { key: "done", "title": "Done" },
];

export function TaskBoard({ tasks, currentUserId }: TaskBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: [],
    "in-progress": [],
    done: [],
  };

  tasks
    .filter((task) => task.assigneeId === currentUserId)
    .forEach((task) => {
      tasksByStatus[task.status].push(task);
    });

  const handleDrop = async (status: TaskStatus) => {
    if (!draggedId) return;

    try {
      const ref = doc(db, "tasks", draggedId);
      await updateDoc(ref, {
        status,
        completedAt: status === "done" ? serverTimestamp() : null,
      });
    } catch (err) {
      console.error("Failed to update task status", err);
    } finally {
      setDraggedId(null);
    }
  };

  return (
    <section className="mt-8 rounded-lg bg-white p-5 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        My Tasks (drag & drop to change status)
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <div
            key={column.key}
            className="rounded-md border border-gray-200 bg-gray-50 min-h-[200px] flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.key)}
          >
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-100 text-sm font-semibold text-gray-800">
              {column.title}
            </div>
            <div className="flex-1 p-3 space-y-3">
              {tasksByStatus[column.key].length === 0 && (
                <p className="text-xs text-gray-400">No tasks</p>
              )}
              {tasksByStatus[column.key].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedId(task.id)}
                  className="cursor-move rounded-md bg-white shadow-sm border border-gray-200 px-3 py-2 text-sm hover:border-blue-400"
                >
                  <div className="font-medium text-gray-900 truncate">
                    {task.title}
                  </div>
                  {task.priority && (
                    <div className="mt-1 text-xs text-gray-500">
                      Priority:{" "}
                      <span className="font-semibold capitalize">
                        {task.priority}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

