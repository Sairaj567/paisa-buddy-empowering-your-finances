import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

const goals = [
  { 
    id: 1, 
    name: "Emergency Fund", 
    type: "Emergency",
    current: 72000, 
    target: 100000, 
    deadline: "Mar 2025",
    monthlyTarget: 7000,
    color: "bg-primary" 
  },
  { 
    id: 2, 
    name: "Goa Trip", 
    type: "Vacation",
    current: 25000, 
    target: 50000, 
    deadline: "Jun 2025",
    monthlyTarget: 4200,
    color: "bg-accent" 
  },
  { 
    id: 3, 
    name: "MacBook Pro", 
    type: "Other",
    current: 45000, 
    target: 150000, 
    deadline: "Dec 2025",
    monthlyTarget: 8750,
    color: "bg-success" 
  },
  { 
    id: 4, 
    name: "MBA Fund", 
    type: "Education",
    current: 100000, 
    target: 500000, 
    deadline: "Aug 2026",
    monthlyTarget: 20000,
    color: "bg-warning" 
  },
];

const Goals = () => {
  const [activeView, setActiveView] = useState<"grid" | "list">("grid");

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = Math.round((totalSaved / totalTarget) * 100);

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
            <Button variant="hero">
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
                    Based on your income pattern, you can increase your Emergency Fund contribution by ₹2,000/month without affecting your lifestyle. This will help you reach your goal 6 weeks earlier!
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Apply Suggestion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const percentage = Math.round((goal.current / goal.target) * 100);
              const Icon = goalIcons[goal.type] || <Target className="w-6 h-6" />;
              
              return (
                <Card key={goal.id} className="border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl ${goal.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <div className={`${goal.color.replace('bg-', 'text-')}`}>
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

          {/* Add Goal CTA */}
          <Card className="border-dashed border-2 border-border mt-6 hover:border-primary/50 transition-colors cursor-pointer group">
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
    </div>
  );
};

export default Goals;
