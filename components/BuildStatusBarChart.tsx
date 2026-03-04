'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface BuildStatusBarChartProps {
  success: number;
  failure: number;
}

// Bar chart comparing successful vs failed builds.
export function BuildStatusBarChart({
  success,
  failure,
}: BuildStatusBarChartProps) {
  const chartData = [{ name: "Builds", Success: success, Failure: failure }];

  return (
    <div className="h-72 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">
        Build Success vs Failure
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Success" fill="#34d399" />
          <Bar dataKey="Failure" fill="#f97373" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

