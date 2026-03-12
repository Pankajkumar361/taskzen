import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Task } from "../backend";
import { TaskStatus } from "../backend";

interface Props {
  tasks: Task[];
}

function getWeeklyData(tasks: Task[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const data = days.map((day, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - ((today.getDay() - i + 7) % 7));
    const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime() * 1e6;
    const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime() * 1e6;
    const completed = tasks.filter(
      (t) =>
        t.status === TaskStatus.completed &&
        Number(t.createdAt) >= dayStart &&
        Number(t.createdAt) <= dayEnd,
    ).length;
    return { day, completed };
  });
  return data;
}

function getStreak(tasks: Task[]): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime() * 1e6;
    const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime() * 1e6;
    const hasCompleted = tasks.some(
      (t) =>
        t.status === TaskStatus.completed &&
        Number(t.createdAt) >= dayStart &&
        Number(t.createdAt) <= dayEnd,
    );
    if (hasCompleted) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export function StatsTab({ tasks }: Props) {
  const total = tasks.length;
  const completed = tasks.filter(
    (t) => t.status === TaskStatus.completed,
  ).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streak = getStreak(tasks);
  const weeklyData = getWeeklyData(tasks);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: total, color: "text-foreground" },
          { label: "Pending", value: pending, color: "text-yellow-500" },
          { label: "Completed", value: completed, color: "text-green-500" },
          { label: "Streak", value: `${streak}🔥`, color: "text-orange-500" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <CardContent className="pt-4 pb-3">
              <div className={`text-2xl font-bold tabular-nums ${color}`}>
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={completionRate} className="flex-1 h-3" />
            <span className="text-sm font-semibold tabular-nums w-12 text-right">
              {completionRate}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tasks Completed This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={weeklyData}
              margin={{ top: 4, right: 4, bottom: 4, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="completed"
                fill="oklch(65% 0.16 250)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {total === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Add some tasks to see your stats here.
        </div>
      )}
    </div>
  );
}
