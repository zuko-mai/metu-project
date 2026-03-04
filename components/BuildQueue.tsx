'use client';

import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BuildStatus, Task } from "@/types";

interface BuildQueueProps {
  tasks: Task[];
  testerId: string;
}

// Список задач, которые тестировщик выдал разработчикам и которые уже в статусе "done".
// Тестировщик может "собрать билд" (успешный или с ошибкой), что создаёт запись в коллекции builds.

export function BuildQueue({ tasks, testerId }: BuildQueueProps) {
  const handleBuild = async (task: Task, status: BuildStatus) => {
    try {
      await addDoc(collection(db, "builds"), {
        taskId: task.id,
        projectId: task.projectId,
        status,
        duration: 60,
        timestamp: serverTimestamp(),
        developerId: task.assigneeId ?? null,
        testerId,
      });

      // После любого билда задача больше не должна появляться в очереди.
      await updateDoc(doc(db, "tasks", task.id), {
        built: true,
      });
    } catch (err) {
      console.error("Failed to create build", err);
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 mb-8 rounded-lg bg-white p-5 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Builds for completed tasks
      </h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium text-gray-900">{task.title}</div>
              <div className="text-xs text-gray-500">
                Assignee: {task.assigneeEmail ?? task.assignee ?? "Unknown"}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBuild(task, "success")}
                className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
              >
                Build success
              </button>
              <button
                type="button"
                onClick={() => handleBuild(task, "failure")}
                className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
              >
                Build failed
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

