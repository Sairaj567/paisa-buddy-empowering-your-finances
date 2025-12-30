import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Sparkles,
  PiggyBank,
  CreditCard
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const spendingData = [
  { name: "Jan", income: 45000, expense: 32000 },
  { name: "Feb", income: 48000, expense: 35000 },
  { name: "Mar", income: 42000, expense: 28000 },
  { name: "Apr", income: 55000, expense: 38000 },
  { name: "May", income: 50000, expense: 30000 },
  { name: "Jun", income: 52000, expense: 34000 },
];

const categoryData = [
  { name: "Essentials", value: 12000, color: "hsl(174, 62%, 35%)" },
  { name: "Needs", value: 8500, color: "hsl(35, 95%, 55%)" },
  { name: "Wants", value: 5500, color: "hsl(152, 60%, 45%)" },
  { name: "Savings", value: 8000, color: "hsl(200, 25%, 60%)" },
];

const recentTransactions = [
  { id: 1, name: "Grocery Store", category: "Essentials", amount: -2450, date: "Today" },
  { id: 2, name: "Salary Credit", category: "Income", amount: 52000, date: "Yesterday" },
  { id: 3, name: "Netflix", category: "Wants", amount: -649, date: "Dec 28" },
  { id: 4, name: "Electricity Bill", category: "Essentials", amount: -1850, date: "Dec 27" },
  { id: 5, name: "Restaurant", category: "Wants", amount: -1200, date: "Dec 26" },
];

const goals = [
  { name: "Emergency Fund", current: 72000, target: 100000, color: "bg-primary" },
  { name: "Vacation", current: 25000, target: 50000, color: "bg-accent" },
  { name: "New Laptop", current: 35000, target: 80000, color: "bg-success" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Welcome back! 👋
              </h1>
              <p className="text-muted-foreground">Here's your financial overview</p>
            </div>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-2xl font-bold text-foreground">₹1,24,500</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-success" />
                      <span className="text-xs text-success font-medium">+12.5%</span>
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
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="text-2xl font-bold text-success">+₹52,000</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-success" />
                      <span className="text-xs text-success font-medium">+8.2%</span>
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
                    <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-destructive">-₹34,000</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowDownRight className="w-3 h-3 text-success" />
                      <span className="text-xs text-success font-medium">-5.3%</span>
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
                    <p className="text-2xl font-bold text-foreground">34.6%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-success" />
                      <span className="text-xs text-success font-medium">+2.1%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Spending Trend */}
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingData}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      />
                      <Area type="monotone" dataKey="income" stroke="hsl(152, 60%, 45%)" fill="url(#incomeGradient)" strokeWidth={2} name="Income" />
                      <Area type="monotone" dataKey="expense" stroke="hsl(0, 72%, 51%)" fill="url(#expenseGradient)" strokeWidth={2} name="Expense" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
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
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
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
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.amount > 0 ? 'bg-success/10' : 'bg-muted'
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
                      <p className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Savings Goals</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.map((goal) => {
                    const percentage = Math.round((goal.current / goal.target) * 100);
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

                {/* AI Insight */}
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">AI Tip</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Increase SIP by ₹2000 to reach your Emergency Fund goal 2 months earlier! 🎯
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
