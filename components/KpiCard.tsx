'use client';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

// Simple card to display one KPI metric.
export function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

