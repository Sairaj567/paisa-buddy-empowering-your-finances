import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  PiggyBank,
  CreditCard,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const weeklySpending = [
  { day: "Mon", amount: 1200 },
  { day: "Tue", amount: 850 },
  { day: "Wed", amount: 2100 },
  { day: "Thu", amount: 650 },
  { day: "Fri", amount: 1800 },
  { day: "Sat", amount: 3200 },
  { day: "Sun", amount: 1500 },
];

const savingsProjection = [
  { month: "Jan", actual: 15000, projected: 15000 },
  { month: "Feb", actual: 32000, projected: 30000 },
  { month: "Mar", actual: 48000, projected: 45000 },
  { month: "Apr", actual: 62000, projected: 60000 },
  { month: "May", actual: null, projected: 78000 },
  { month: "Jun", actual: null, projected: 95000 },
];

const insights = [
  {
    id: 1,
    type: "warning",
    title: "High Weekend Spending",
    description: "Your weekend spending is 2.3x higher than weekdays. Consider setting a weekend budget limit.",
    icon: AlertTriangle,
    color: "bg-warning/10 text-warning border-warning/20",
  },
  {
    id: 2,
    type: "tip",
    title: "Save on Subscriptions",
    description: "You have 4 entertainment subscriptions totaling ₹1,847/month. Consider consolidating.",
    icon: Lightbulb,
    color: "bg-accent/10 text-accent border-accent/20",
  },
  {
    id: 3,
    type: "positive",
    title: "Great Savings Rate!",
    description: "Your savings rate improved by 8% this month. You're on track to hit your Emergency Fund goal!",
    icon: TrendingUp,
    color: "bg-success/10 text-success border-success/20",
  },
  {
    id: 4,
    type: "tip",
    title: "Food Spending Alert",
    description: "Restaurant spending increased 40% this month. Try cooking at home 2 more days/week to save ₹3,000.",
    icon: CreditCard,
    color: "bg-primary/10 text-primary border-primary/20",
  },
];

const quickActions = [
  { label: "Set Budget Alert", icon: AlertTriangle },
  { label: "Review Subscriptions", icon: RefreshCw },
  { label: "Optimize Savings", icon: PiggyBank },
  { label: "Update Goals", icon: Target },
];

const Insights = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                AI Insights
              </h1>
              <p className="text-muted-foreground">Personalized financial recommendations</p>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Insights
            </Button>
          </div>

          {/* AI Summary Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Monthly Financial Summary</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This month you've <span className="text-success font-medium">saved ₹18,000</span> (34.6% of income), 
                    which is <span className="text-success font-medium">↑8% better</span> than last month. Your biggest 
                    expense category was <span className="text-foreground font-medium">Housing (₹15,000)</span>. 
                    You're on track to reach your Emergency Fund goal by March 2025!
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button key={action.label} variant="outline" size="sm" className="bg-background/50">
                          <Icon className="w-4 h-4 mr-2" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Spending */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-accent" />
                  Weekly Spending Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklySpending}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Saturday is your highest spending day. Average: ₹1,614/day
                </p>
              </CardContent>
            </Card>

            {/* Savings Projection */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Savings Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={savingsProjection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number | null) => value ? [`₹${value.toLocaleString()}`, ''] : ['-', '']}
                      />
                      <Line type="monotone" dataKey="actual" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))' }} name="Actual" />
                      <Line type="monotone" dataKey="projected" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projected" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Projected to save ₹95,000 by June. Keep up the great work!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Insights Grid */}
          <h2 className="text-xl font-semibold text-foreground mb-4">Personalized Tips</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <Card 
                  key={insight.id} 
                  className={`border ${insight.color.split(' ')[2]} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${insight.color.split(' ').slice(0,2).join(' ')} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
