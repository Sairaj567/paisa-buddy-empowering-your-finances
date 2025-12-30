import type React from "react";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus,
  Target,
  Plane,
  Shield,
  GraduationCap,
  Home,
  Car,
  Sparkles,
  TrendingUp,
  Calendar
} from "lucide-react";

const goalIcons: { [key: string]: React.ReactNode } = {
  "Emergency": <Shield className="w-6 h-6" />,
  "Vacation": <Plane className="w-6 h-6" />,
  "Education": <GraduationCap className="w-6 h-6" />,
  "Home": <Home className="w-6 h-6" />,
  "Vehicle": <Car className="w-6 h-6" />,
  "Other": <Target className="w-6 h-6" />,
};

type Goal = {
  id: number;
  name: string;
  type: string;
  current: number;
  target: number;
  deadline: string;
  monthlyTarget: number;
  color: string;
};

const goalColors: Record<string, string> = {
  Emergency: "bg-primary",
  Vacation: "bg-accent",
  Education: "bg-warning",
  Home: "bg-secondary",
  Vehicle: "bg-muted",
  Other: "bg-success",
};

const getColorForType = (type: string) => goalColors[type] ?? "bg-primary";

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    type: "Emergency",
    current: "",
    target: "",
    deadline: "",
    monthlyTarget: "",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storageKey = user ? `pb-goals-${user.email}` : "pb-goals-guest";

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setGoals(JSON.parse(saved));
      } catch {
        setGoals([]);
      }
    } else {
      setGoals([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    }
  }, [goals, storageKey, user]);

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const hasGoals = goals.length > 0;

  const resetGoalForm = () =>
    setNewGoal({ name: "", type: "Emergency", current: "", target: "", deadline: "", monthlyTarget: "" });

  const handleAddGoal = () => {
    const targetValue = Number(newGoal.target);
    const currentValue = Number(newGoal.current) || 0;
    const monthlyValue = Number(newGoal.monthlyTarget) || 0;

    if (!newGoal.name || Number.isNaN(targetValue) || targetValue <= 0) {
      toast.error("Enter a goal name and target amount.");
      return;
    }

    const next: Goal = {
      id: goals.length ? Math.max(...goals.map((g) => g.id)) + 1 : 1,
      name: newGoal.name,
      type: newGoal.type,
      current: currentValue,
      target: targetValue,
      deadline: newGoal.deadline || "",
      monthlyTarget: monthlyValue,
      color: getColorForType(newGoal.type),
    };

    setGoals((prev) => [...prev, next]);
    toast.success("Goal added");
    resetGoalForm();
    setGoalDialogOpen(false);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (!lines.length) throw new Error("Empty file");

      const parseLine = (line: string) =>
        line.match(/("([^"]|"")*"|[^,]+)/g)?.map((cell) =>
          cell.replace(/^"|"$/g, "").replace(/""/g, "")
        ) ?? [];

      const header = parseLine(lines[0]).map((h) => h.toLowerCase());
      const required = ["name", "type", "target"];
      const hasHeader = required.every((key) => header.includes(key));
      const dataLines = hasHeader ? lines.slice(1) : lines;
      const getValue = (cells: string[], key: string, idx: number) => {
        if (hasHeader) {
          const headerIndex = header.indexOf(key);
          return headerIndex >= 0 ? cells[headerIndex] : "";
        }
        return cells[idx] ?? "";
      };

      const normalized: Goal[] = dataLines.map((line, idx) => {
        const cells = parseLine(line);
        const type = getValue(cells, "type", 1) || "Emergency";
        return {
          id: idx + 1,
          name: getValue(cells, "name", 0) || `Goal ${idx + 1}`,
          type,
          current: Number(getValue(cells, "current", 2)) || 0,
          target: Number(getValue(cells, "target", 3) || getValue(cells, "targetamount", 3)) || 0,
          deadline: getValue(cells, "deadline", 4),
          monthlyTarget: Number(getValue(cells, "monthlytarget", 5)) || 0,
          color: getColorForType(type),
        };
      });

      setGoals(normalized);
      toast.success(`Imported ${normalized.length} goals from CSV`);
    } catch (error) {
      toast.error("Upload a CSV with columns: name, type, target, current, deadline, monthlyTarget.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Savings Goals
              </h1>
              <p className="text-muted-foreground">Track your progress towards financial goals</p>
            </div>
            <Button variant="hero" onClick={() => setGoalDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>

          {/* Overview Card */}
          <Card className="border-border/50 mb-8 gradient-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative z-10">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <p className="text-primary-foreground/80 mb-2">Total Savings Progress</p>
                  <h2 className="text-3xl font-bold mb-4">₹{totalSaved.toLocaleString()}</h2>
                  <div className="relative">
                    <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-primary-foreground/70">{overallProgress}% complete</span>
                      <span className="text-sm text-primary-foreground/70">₹{totalTarget.toLocaleString()} target</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-2 mx-auto">
                      <Target className="w-10 h-10" />
                    </div>
                    <p className="text-sm text-primary-foreground/80">{goals.length} Active Goals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestion */}
          <Card className="border-primary/20 bg-primary/5 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">AI Recommendation</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your first goal to unlock personalized savings insights tailored to your targets and timelines.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setGoalDialogOpen(true)}>
                    Add a goal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals Grid */}
          {hasGoals ? (
            <div className="grid md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const percentage = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
                const Icon = goalIcons[goal.type] || <Target className="w-6 h-6" />;

                return (
                  <Card key={goal.id} className="border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl ${goal.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <div className={`${goal.color.replace("bg-", "text-")}`}>
                              {Icon}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{goal.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{goal.deadline}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${goal.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm font-medium text-foreground">₹{goal.current.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">₹{goal.target.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-sm text-muted-foreground">
                            Monthly target: <span className="font-medium text-foreground">₹{goal.monthlyTarget.toLocaleString()}</span>
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Add funds
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border mb-6">
              <CardContent className="p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-muted mx-auto flex items-center justify-center">
                  <Target className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">No goals yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Start fresh by adding your first savings goal. Once you add goals, progress and insights will appear here.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="hero" size="sm" onClick={() => setGoalDialogOpen(true)}>Create goal</Button>
                  <Button variant="outline" size="sm" onClick={handleImportClick}>Import data</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Goal CTA */}
          <Card className="border-dashed border-2 border-border mt-6 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setGoalDialogOpen(true)}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Create a New Goal</h3>
              <p className="text-sm text-muted-foreground">
                Set up a savings goal for education, travel, emergency fund, or anything else!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="goal-name">Name</Label>
              <Input
                id="goal-name"
                value={newGoal.name}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Emergency Fund"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-type">Type</Label>
              <select
                id="goal-type"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={newGoal.type}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="Emergency">Emergency</option>
                <option value="Vacation">Vacation</option>
                <option value="Education">Education</option>
                <option value="Home">Home</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-target">Target amount</Label>
              <Input
                id="goal-target"
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, target: e.target.value }))}
                placeholder="100000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-current">Current saved</Label>
              <Input
                id="goal-current"
                type="number"
                value={newGoal.current}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, current: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-deadline">Deadline</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-monthly">Monthly target</Label>
              <Input
                id="goal-monthly"
                type="number"
                value={newGoal.monthlyTarget}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, monthlyTarget: e.target.value }))}
                placeholder="5000"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { resetGoalForm(); setGoalDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Save goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
