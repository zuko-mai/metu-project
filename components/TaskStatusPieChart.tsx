'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TaskStatus } from "@/types";

const COLORS: Record<TaskStatus, string> = {
  todo: "#60a5fa",
  "in-progress": "#fbbf24",
  done: "#34d399",
};

interface TaskStatusPieChartProps {
  data: Record<TaskStatus, number>;
}

// Pie chart showing how many tasks are in each status.
export function TaskStatusPieChart({ data }: TaskStatusPieChartProps) {
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <div className="h-72 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">
        Task Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            label
          >
            {chartData.map((entry, index) => {
              const key = entry.name as TaskStatus;
              return <Cell key={index} fill={COLORS[key]} />;
            })}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

