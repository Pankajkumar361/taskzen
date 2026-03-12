import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Lightbulb,
  ListChecks,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import type { Task } from "../backend";
import { TaskStatus } from "../backend";

interface Props {
  tasks: Task[];
  onAddTask?: (title: string) => void;
}

function detectPriority(title: string): string {
  const t = title.toLowerCase();
  if (/urgent|asap|critical|emergency|deadline|overdue|immediately/.test(t))
    return "high";
  if (/important|review|report|meeting|present/.test(t)) return "medium";
  return "low";
}

function improveTitle(title: string): string {
  const t = title.trim();
  if (!t) return "";
  const verbs = [
    "Complete",
    "Finish",
    "Review",
    "Write",
    "Send",
    "Schedule",
    "Update",
    "Fix",
    "Create",
    "Prepare",
  ];
  const hasVerb = verbs.some((v) =>
    t.toLowerCase().startsWith(v.toLowerCase()),
  );
  if (!hasVerb) return `Complete: ${t.charAt(0).toUpperCase() + t.slice(1)}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function generateSubtasks(title: string): string[] {
  const t = title.toLowerCase();
  if (/report|document|write/.test(t))
    return [
      "Research the topic",
      "Create an outline",
      "Write a draft",
      "Review and edit",
      "Submit final version",
    ];
  if (/design|ui|interface/.test(t))
    return [
      "Gather requirements",
      "Create wireframes",
      "Design mockups",
      "Get feedback",
      "Finalize design",
    ];
  if (/code|develop|build|implement/.test(t))
    return [
      "Define requirements",
      "Plan architecture",
      "Write the code",
      "Write tests",
      "Code review & deploy",
    ];
  if (/meeting|call|presentation/.test(t))
    return [
      "Set agenda",
      "Prepare materials",
      "Send invitations",
      "Conduct meeting",
      "Send follow-up notes",
    ];
  if (/email|message|respond/.test(t))
    return [
      "Draft the message",
      "Review tone & clarity",
      "Attach relevant files",
      "Send the message",
    ];
  return [
    "Break this into smaller steps",
    "Work on step 1",
    "Work on step 2",
    "Review progress",
    "Complete & verify",
  ];
}

function generateSchedule(tasks: Task[]): string[] {
  const pending = tasks
    .filter((t) => t.status === TaskStatus.pending)
    .slice(0, 8);
  if (pending.length === 0)
    return ["No pending tasks to schedule. You're all caught up!"];
  const slots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];
  return pending.map((t, i) => `${slots[i] ?? "6:00 PM"} — ${t.title}`);
}

function getInsight(tasks: Task[]): string {
  const total = tasks.length;
  const completed = tasks.filter(
    (t) => t.status === TaskStatus.completed,
  ).length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  if (total === 0)
    return "Start adding tasks to get personalized productivity insights.";
  if (rate === 100)
    return "🎉 Outstanding! You've completed all your tasks. Add new goals to keep your momentum going.";
  if (rate >= 75)
    return `💪 Great progress! You've completed ${rate}% of your tasks. Just ${pending} left to go.`;
  if (rate >= 50)
    return `💡 You're halfway there with ${rate}% completion. Focus on your top 3 priority tasks next.`;
  if (pending > 10)
    return `⚠️ You have ${pending} pending tasks. Consider breaking them into smaller steps or delegating some.`;
  return `✨ You have ${pending} tasks remaining. Pick the most impactful one and start there.`;
}

function getSuggestions(tasks: Task[]): string[] {
  const titles = tasks.map((t) => t.title.toLowerCase());
  const suggestions: string[] = [];
  if (!titles.some((t) => /exercise|workout|gym|walk/.test(t)))
    suggestions.push("30-minute morning workout");
  if (!titles.some((t) => /review|plan|daily/.test(t)))
    suggestions.push("Daily task review & planning session");
  if (!titles.some((t) => /email|inbox/.test(t)))
    suggestions.push("Process email inbox");
  if (!titles.some((t) => /learn|read|study/.test(t)))
    suggestions.push("Read or study for 20 minutes");
  if (!titles.some((t) => /water|health|hydrat/.test(t)))
    suggestions.push("Drink 8 glasses of water today");
  return suggestions.slice(0, 4);
}

export function AIPanel({ tasks, onAddTask }: Props) {
  const [breakInput, setBreakInput] = useState("");
  const [breakResult, setBreakResult] = useState<string[]>([]);
  const [priorityInput, setPriorityInput] = useState("");
  const [priorityResult, setPriorityResult] = useState("");
  const [improveInput, setImproveInput] = useState("");
  const [improveResult, setImproveResult] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const schedule = showSchedule ? generateSchedule(tasks) : [];
  const insight = getInsight(tasks);
  const suggestions = getSuggestions(tasks);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Productivity Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{insight}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Suggested Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {suggestions.map((s) => (
            <div key={s} className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">{s}</span>
              {onAddTask && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs shrink-0"
                  onClick={() => onAddTask(s)}
                >
                  + Add
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-blue-500" />
            Break Down a Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              data-ocid="ai.input"
              value={breakInput}
              onChange={(e) => setBreakInput(e.target.value)}
              placeholder="Enter a large task..."
              className="h-8 text-sm"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                setBreakResult(generateSubtasks(breakInput))
              }
            />
            <Button
              data-ocid="ai.suggest_button"
              size="sm"
              className="h-8"
              onClick={() => setBreakResult(generateSubtasks(breakInput))}
            >
              Break Down
            </Button>
          </div>
          {breakResult.length > 0 && (
            <ul className="space-y-1">
              {breakResult.map((step) => (
                <li key={step} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-medium">
                    {breakResult.indexOf(step) + 1}.
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Priority Detector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={priorityInput}
              onChange={(e) => setPriorityInput(e.target.value)}
              placeholder="Enter a task title..."
              className="h-8 text-sm"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                setPriorityResult(detectPriority(priorityInput))
              }
            />
            <Button
              size="sm"
              className="h-8"
              onClick={() => setPriorityResult(detectPriority(priorityInput))}
            >
              Detect
            </Button>
          </div>
          {priorityResult && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Suggested priority:
              </span>
              <Badge
                variant="outline"
                className={`text-xs ${
                  priorityResult === "high"
                    ? "text-red-400 border-red-400"
                    : priorityResult === "medium"
                      ? "text-yellow-400 border-yellow-400"
                      : "text-green-400 border-green-400"
                }`}
              >
                {priorityResult.toUpperCase()}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-pink-500" />
            Improve Task Title
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={improveInput}
              onChange={(e) => setImproveInput(e.target.value)}
              placeholder="e.g. fix the bug"
              className="h-8 text-sm"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                setImproveResult(improveTitle(improveInput))
              }
            />
            <Button
              size="sm"
              className="h-8"
              onClick={() => setImproveResult(improveTitle(improveInput))}
            >
              Improve
            </Button>
          </div>
          {improveResult && (
            <div className="bg-muted/50 rounded p-2 text-sm font-medium">
              {improveResult}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            Daily Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSchedule((v) => !v)}
          >
            {showSchedule ? "Hide Schedule" : "Generate Schedule"}
          </Button>
          {showSchedule && (
            <ul className="space-y-1">
              {schedule.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
