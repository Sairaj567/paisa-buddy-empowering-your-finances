import { useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useBudgets } from "@/hooks/useBudgets";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import RecurringTransactions from "@/components/dashboard/RecurringTransactions";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Loader2,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

type DateRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "ALL";

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "5Y", label: "5Y" },
  { value: "ALL", label: "All" },
];

const getDateRangeStart = (range: DateRange): Date | null => {
  const now = new Date();
  switch (range) {
    case "1W":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3M":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "1Y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "5Y":
      return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    case "ALL":
      return null;
  }
};

const Dashboard = () => {
  const { transactions, isLoading: transactionsLoading, totals } = useTransactions();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { budgets } = useBudgets();
  const { patterns, monthlyRecurringTotal, upcomingThisWeek } = useRecurringTransactions(transactions);
  const { exceededBudgets, warningBudgets } = useBudgetAlerts(budgets);
  
  const [dateRange, setDateRange] = useState<DateRange>("1M");
  const isLoading = transactionsLoading || goalsLoading;

  const parseDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return new Date();
    return d;
  };

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const rangeStart = getDateRangeStart(dateRange);
    if (!rangeStart) return transactions;
    return transactions.filter((tx) => parseDate(tx.date) >= rangeStart);
  }, [transactions, dateRange]);

  // Calculate totals for filtered period
  const filteredTotals = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = filteredTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
    return { income, expenses, balance, savingsRate };
  }, [filteredTransactions]);

  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
      .slice(0, 5);
  }, [filteredTransactions]);

  const spendingData = useMemo(() => {
    const grouped: Record<string, { name: string; rawDate: Date; income: number; expense: number }> = {};
    filteredTransactions.forEach((tx) => {
      const txDate = parseDate(tx.date);
      // Use different grouping based on date range
      let dateKey: string;
      if (dateRange === "1W") {
        dateKey = txDate.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
      } else if (dateRange === "1M" || dateRange === "3M") {
        dateKey = txDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      } else {
        dateKey = txDate.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
      }
      if (!grouped[dateKey]) grouped[dateKey] = { name: dateKey, rawDate: txDate, income: 0, expense: 0 };
      if (tx.amount > 0) grouped[dateKey].income += tx.amount;
      if (tx.amount < 0) grouped[dateKey].expense += Math.abs(tx.amount);
    });
    return Object.values(grouped)
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
      .map(({ name, income, expense }) => ({ name, income, expense }));
  }, [filteredTransactions, dateRange]);

  const categoryData = useMemo(() => {
    const colors = ["#7c3aed", "#22c55e", "#06b6d4", "#f97316", "#ef4444", "#a855f7", "#0ea5e9", "#f59e0b"];
    const grouped: Record<string, number> = {};
    filteredTransactions.forEach((tx) => {
      if (tx.amount < 0) {
        grouped[tx.category || "Other"] = (grouped[tx.category || "Other"] || 0) + Math.abs(tx.amount);
      }
    });
    return Object.entries(grouped).map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] }));
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Here's your financial overview</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <div className="flex items-center bg-muted/50 rounded-lg p-1">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateRange(option.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      dateRange === option.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button variant="hero" asChild>
                <Link to="/transactions" className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </Link>
              </Button>
            </div>
          </div>

          {/* Budget Alerts Banner */}
          {(exceededBudgets.length > 0 || warningBudgets.length > 0) && (
            <div className={`mb-6 p-4 rounded-xl border ${
              exceededBudgets.length > 0 
                ? "bg-destructive/10 border-destructive/20" 
                : "bg-amber-500/10 border-amber-500/20"
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  exceededBudgets.length > 0 ? "text-destructive" : "text-amber-500"
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {exceededBudgets.length > 0 
                      ? `${exceededBudgets.length} budget${exceededBudgets.length > 1 ? 's' : ''} exceeded!`
                      : `${warningBudgets.length} budget${warningBudgets.length > 1 ? 's' : ''} approaching limit`}
                  </p>
                  <div className="mt-2 space-y-2">
                    {[...exceededBudgets, ...warningBudgets].slice(0, 3).map((alert) => (
                      <div key={alert.category} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-32 truncate">{alert.category}</span>
                        <Progress 
                          value={Math.min(alert.percentUsed, 100)} 
                          className={`h-2 flex-1 ${alert.percentUsed >= 100 ? "[&>div]:bg-destructive" : "[&>div]:bg-amber-500"}`}
                        />
                        <span className="text-xs font-medium w-12 text-right">{alert.percentUsed}%</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" asChild>
                    <Link to="/budget">Manage Budgets</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {isLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Balance</p>
                    <p className={`text-2xl font-bold ${filteredTotals.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{filteredTotals.balance.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">{dateRange === "ALL" ? "All time" : `Last ${dateRange.replace("1", "1 ").replace("M", "month").replace("W", "week").replace("Y", "year")}`}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Income</p>
                    <p className="text-2xl font-bold text-success">₹{filteredTotals.income.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-success" />
                      <span className="text-xs text-muted-foreground">{filteredTransactions.filter(t => t.amount > 0).length} transactions</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <p className="text-2xl font-bold text-destructive">₹{filteredTotals.expenses.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                      <span className="text-xs text-muted-foreground">{filteredTransactions.filter(t => t.amount < 0).length} transactions</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Savings Rate</p>
                    <p className={`text-2xl font-bold ${filteredTotals.savingsRate >= 20 ? 'text-success' : filteredTotals.savingsRate >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                      {filteredTotals.savingsRate}%
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {filteredTotals.savingsRate >= 20 ? (
                        <ArrowUpRight className="w-3 h-3 text-success" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">{filteredTotals.savingsRate >= 20 ? 'Great!' : 'Target: 20%'}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {spendingData.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                    <p>No data for selected period.</p>
                    <Link to="/transactions" className="text-primary font-medium">Add transactions to see this chart</Link>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendingData}>
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                        />
                        <Area type="monotone" dataKey="income" stroke="hsl(152, 60%, 45%)" fill="url(#incomeGradient)" strokeWidth={2} name="Income" />
                        <Area type="monotone" dataKey="expense" stroke="hsl(0, 72%, 51%)" fill="url(#expenseGradient)" strokeWidth={2} name="Expense" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm text-center">
                    Add categorized transactions to see a breakdown.
                  </div>
                ) : (
                  <>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {categoryData.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-xs text-muted-foreground">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/transactions">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-muted-foreground">No transactions found.</p>
                    <Link to="/transactions" className="text-primary font-medium">Add transactions to populate this list</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.amount > 0 ? "bg-success/10" : "bg-muted"
                          }`}>
                            {tx.amount > 0 ? (
                              <TrendingUp className="w-5 h-5 text-success" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{tx.name}</p>
                            <p className="text-xs text-muted-foreground">{tx.category} • {tx.date}</p>
                          </div>
                        </div>
                        <p className={`font-semibold ${tx.amount > 0 ? "text-success" : "text-foreground"}`}>
                          {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Savings Goals</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/goals">
                    <Plus className="w-4 h-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <div className="space-y-3 text-center text-muted-foreground">
                    <p>No goals yet.</p>
                    <Link to="/goals" className="text-primary font-medium">Create a goal to track progress</Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {goals.map((goal) => {
                        const percentage = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
                        return (
                          <div key={goal.name}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground">{goal.name}</span>
                              <span className="text-xs text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${goal.color} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              ₹{goal.current.toLocaleString()} / ₹{goal.target.toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">AI Tip</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Increase SIP by ₹2000 to reach your Emergency Fund goal faster.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recurring Transactions Section */}
          <div className="mt-6">
            <RecurringTransactions
              patterns={patterns}
              monthlyTotal={monthlyRecurringTotal}
              upcomingThisWeek={upcomingThisWeek}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
