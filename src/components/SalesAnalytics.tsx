import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type CourseSales = { course: string; sales: number; revenue?: number };
type CategorySales = { name: string; value: number };
type RevenuePoint = { date: string; revenue: number };

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
];

const mockCourseSales: CourseSales[] = [
  { course: "React Basics", sales: 120, revenue: 4800 },
  { course: "Advanced TypeScript", sales: 90, revenue: 5400 },
  { course: "UI/UX Design", sales: 75, revenue: 3750 },
  { course: "Python ML", sales: 140, revenue: 9800 },
  { course: "Marketing 101", sales: 65, revenue: 2600 },
];

const mockCategorySales: CategorySales[] = [
  { name: "Programming", value: 45 },
  { name: "Design", value: 20 },
  { name: "Marketing", value: 15 },
  { name: "Business", value: 10 },
  { name: "Data", value: 10 },
];

const daysInMonth = 30;
const mockRevenueLastMonth: RevenuePoint[] = Array.from(
  { length: daysInMonth },
  (_, i) => ({
    date: `${i + 1}`,
    revenue: Math.round(200 + Math.random() * 400),
  })
);

const mockRevenueLast3Months: RevenuePoint[] = Array.from(
  { length: 12 },
  (_, i) => ({
    date: `W${i + 1}`,
    revenue: Math.round(1200 + Math.random() * 2400),
  })
);

type RangeKey = "last_month" | "last_3_months";

const SalesAnalytics: React.FC = () => {
  const [range, setRange] = useState<RangeKey>("last_month");

  const totalRevenue = useMemo(() => {
    const data =
      range === "last_month" ? mockRevenueLastMonth : mockRevenueLast3Months;
    return data.reduce((sum, p) => sum + p.revenue, 0);
  }, [range]);

  const prevRevenue = useMemo(() => {
    const data =
      range === "last_month" ? mockRevenueLastMonth : mockRevenueLast3Months;
    const firstHalf = data
      .slice(0, Math.floor(data.length / 2))
      .reduce((s, p) => s + p.revenue, 0);
    const secondHalf = data
      .slice(Math.floor(data.length / 2))
      .reduce((s, p) => s + p.revenue, 0);
    return { firstHalf, secondHalf };
  }, [range]);

  const growthPercent = useMemo(() => {
    if (prevRevenue.firstHalf === 0) return 0;
    return Math.round(
      ((prevRevenue.secondHalf - prevRevenue.firstHalf) /
        prevRevenue.firstHalf) *
        100
    );
  }, [prevRevenue]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle>Sales per Course</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockCourseSales}
              margin={{ left: 8, right: 8, top: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="course" tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="sales"
                name="Sales"
                radius={[6, 6, 0, 0]}
                fill="#6366F1"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Sales per Category</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={mockCategorySales}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {mockCategorySales.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Revenue Trends</CardTitle>
            <div className="mt-1 text-sm text-gray-500">
              Total Revenue: ${totalRevenue.toLocaleString()}{" "}
              <span
                className={
                  growthPercent >= 0 ? "text-emerald-600" : "text-red-600"
                }
              >
                {growthPercent >= 0 ? "↑" : "↓"} {Math.abs(growthPercent)}% from
                previous period
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setRange("last_month")}
              className={`px-3 py-1.5 rounded-lg border transition ${
                range === "last_month"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setRange("last_3_months")}
              className={`px-3 py-1.5 rounded-lg border transition ${
                range === "last_3_months"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Last 3 Months
            </button>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {range === "last_month" ? (
              <AreaChart
                data={mockRevenueLastMonth}
                margin={{ left: 8, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#6366F1"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={mockRevenueLast3Months}
                margin={{ left: 8, right: 8, top: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
