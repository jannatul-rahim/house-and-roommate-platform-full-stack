"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactNumber, formatCurrency } from "@/lib/format";

// Validated categorical order (light + dark pass the CVD checks); colours follow
// the entity, so each series keeps its slot regardless of filtering.
export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const axis = { stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false } as const;

function TooltipBox({ label, rows }: { label?: string; rows: { name: string; value: string; color?: string }[] }) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-semibold text-popover-foreground">{label}</p>}
      {rows.map((r) => (
        <p key={r.name} className="flex items-center gap-2 text-muted-foreground">
          {r.color && <span className="size-2 rounded-full" style={{ background: r.color }} />}
          {r.name}: <span className="font-medium text-popover-foreground">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

export interface SeriesPoint {
  label: string;
  value: number;
}

/** Single-series money trend (e.g. rent collected per month). */
export function RevenueAreaChart({ data, name = "Revenue" }: { data: SeriesPoint[]; name?: string }) {
  return (
    <div className="h-72" role="img" aria-label={`${name} by month`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" {...axis} />
          <YAxis {...axis} width={48} tickFormatter={(v: number) => `৳${formatCompactNumber(v)}`} />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: 4 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? <TooltipBox label={String(label)} rows={[{ name, value: formatCurrency(Number(payload[0].value)), color: "var(--chart-1)" }]} /> : null
            }
          />
          <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill="url(#revFill)" activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Magnitude per category (e.g. listings per city). Single hue = one measure. */
export function CategoryBarChart({ data, name = "Count", color = "var(--chart-1)" }: { data: SeriesPoint[]; name?: string; color?: string }) {
  return (
    <div className="h-72" role="img" aria-label={`${name} by category`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" {...axis} interval={0} />
          <YAxis {...axis} width={36} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? <TooltipBox label={String(label)} rows={[{ name, value: String(payload[0].value), color }]} /> : null
            }
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Part-to-whole for a handful of categories, with a legend so identity isn't colour-only. */
export function DonutChart({ data, name = "Total" }: { data: SeriesPoint[]; name?: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const visible = data.filter((d) => d.value > 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-52 w-52 shrink-0" role="img" aria-label={`${name} breakdown`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={visible} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="95%" paddingAngle={2} stroke="var(--card)" strokeWidth={2}>
              {visible.map((d) => (
                <Cell key={d.label} fill={CHART_COLORS[data.indexOf(d) % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TooltipBox rows={[{ name: String(payload[0].name), value: `${payload[0].value} (${Math.round((Number(payload[0].value) / total) * 100)}%)` }]} />
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden />
              {d.label}
            </span>
            <span className="font-medium tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
