"use client";
import React, { useId, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { trends, categoryExpenses, money } from "@/lib/demo";
export const palette = ["#387bf6", "#20b5a1", "#9b88da", "#edb35f", "#b8c4d4"];
function ChartBox({
  children,
  height = 245,
  label,
}: {
  children: React.ReactElement;
  height?: number;
  label: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className="chart-box" style={{ height }} role="img" aria-label={label}>
      {ready ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={1}
          minHeight={1}
          initialDimension={{ width: 600, height }}
        >
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="chart-skeleton" />
      )}
    </div>
  );
}
const axis = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "#8a98aa", fontSize: 11 },
};
export function FinanceChart({
  kind = "cash",
  data = trends,
  height = 245,
}: {
  kind?: "cash" | "profit" | "sales";
  data?: typeof trends;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <ChartBox
      height={height}
      label={
        kind === "cash" ? "Revenue and expenses by month" : kind + " by month"
      }
    >
      <AreaChart
        data={data}
        margin={{ top: 10, right: 12, left: -15, bottom: 0 }}
      >
        <defs>
          <linearGradient id={"gradient" + id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#387bf6" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#387bf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="#edf1f6"
          strokeDasharray="4 4"
        />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} tickFormatter={(v) => "$" + v / 1000 + "k"} />
        <Tooltip
          formatter={(v) => money(Number(v))}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e6edf5",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey={kind === "cash" ? "revenue" : kind}
          name={
            kind === "cash" ? "Revenue" : kind === "sales" ? "Sales" : "Profit"
          }
          stroke="#387bf6"
          strokeWidth={2.5}
          fill={"url(#gradient" + id + ")"}
          isAnimationActive={false}
        />
        {kind === "cash" && (
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#20b5a1"
            strokeWidth={2.5}
            fill="transparent"
            isAnimationActive={false}
          />
        )}
      </AreaChart>
    </ChartBox>
  );
}
export function ExpenseChart({ total = 10100 }: { total?: number }) {
  const values = categoryExpenses.map((entry) => ({ ...entry, value: entry.value / 10100 * total }));
  return (
    <div className="expense-chart">
      <div className="donut-holder">
        <ChartBox
          height={188}
          label="Expense categories: ingredients 30%, salary 25%, rent 22%, utilities 10%, other 13%"
        >
          <PieChart>
            <Pie
              data={values}
              dataKey="value"
              innerRadius={62}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
              isAnimationActive={false}
            >
              {categoryExpenses.map((e, i) => (
                <Cell key={e.name} fill={palette[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => money(Number(v))} />
          </PieChart>
        </ChartBox>
        <div className="donut-label">
          <small>Total expenses</small>
          <strong>{money(total)}</strong>
        </div>
      </div>
      <div className="chart-key">
        {categoryExpenses.map((e, i) => (
          <div key={e.name}>
            <i style={{ background: palette[i] }} />
            <span>{e.name}</span>
            <b>{Math.round(e.value / 101)}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ProductChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ChartBox height={250} label="Product sales comparison">
      <BarChart data={data} margin={{ left: -25, right: 10, top: 10 }}>
        <CartesianGrid vertical={false} stroke="#edf1f6" />
        <XAxis
          dataKey="name"
          {...axis}
          tick={{ fontSize: 10, fill: "#7b8ca2" }}
        />
        <YAxis {...axis} />
        <Tooltip />
        <Bar
          dataKey="value"
          name="Revenue ($)"
          radius={[5, 5, 0, 0]}
          isAnimationActive={false}
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={palette[i % 5]} />
          ))}
        </Bar>
      </BarChart>
    </ChartBox>
  );
}
export function ForecastChart({ months }: { months: number }) {
  const rows: { month: string; actual?: number; forecast?: number }[] =
    trends.map((t) => ({
      month: t.month,
      actual: t.revenue,
      ...(t.month === "Sep" ? { forecast: t.revenue } : {}),
    }));
  for (let i = 0; i < months; i++)
    rows.push({
      month: [
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
      ][i],
      forecast: Math.round(16800 * Math.pow(1.035, i)),
    });
  return (
    <ChartBox
      height={315}
      label="Historical revenue shown as solid blue, projected revenue as dashed teal"
    >
      <LineChart data={rows} margin={{ left: -10, right: 15, top: 20 }}>
        <CartesianGrid
          vertical={false}
          stroke="#edf1f6"
          strokeDasharray="4 4"
        />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} tickFormatter={(v) => "$" + v / 1000 + "k"} />
        <Tooltip formatter={(v) => money(Number(v))} />
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
        <Line
          name="Historical revenue"
          dataKey="actual"
          stroke="#387bf6"
          strokeWidth={3}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          name="Forecast revenue"
          dataKey="forecast"
          stroke="#20b5a1"
          strokeWidth={3}
          strokeDasharray="6 5"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartBox>
  );
}
