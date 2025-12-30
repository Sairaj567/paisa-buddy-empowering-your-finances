import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
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
  RefreshCw,
  Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

type Transaction = {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  type?: string;
};

const quickActions = [
  { label: "Set Budget Alert", icon: AlertTriangle },
  { label: "Review Subscriptions", icon: RefreshCw },
  { label: "Optimize Savings", icon: PiggyBank },
  { label: "Update Goals", icon: Target },
];

const parseDate = (raw: string) => {
  if (!raw) return new Date();
  // Support dd-mm-yyyy and yyyy-mm-dd
  const parts = raw.includes("-") ? raw.split("-") : raw.split("/");
  if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
    const [dd, mm, yyyy] = parts;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!Number.isNaN(d.getTime())) return d;
  }
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString()}`;

const Insights = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [geminiInsight, setGeminiInsight] = useState("");
  const [geminiState, setGeminiState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [geminiError, setGeminiError] = useState("");

  const storageKey = user ? `pb-transactions-${user.email}` : "pb-transactions-guest";
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const loadData = () => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed: Transaction[] = JSON.parse(raw);
        setTransactions(parsed);
      } catch {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [storageKey]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const net = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;
    return { income, expenses, net, savingsRate };
  }, [transactions]);

  const weeklySpending = useMemo(() => {
    const now = new Date();
    const last30 = transactions.filter((t) => {
      const d = parseDate(t.date);
      return now.getTime() - d.getTime() <= 30 * 24 * 60 * 60 * 1000;
    });
    const buckets: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    last30.forEach((t) => {
      if (t.amount < 0) {
        const d = parseDate(t.date);
        const day = d.toLocaleDateString("en-US", { weekday: "short" });
        buckets[day] = (buckets[day] || 0) + Math.abs(t.amount);
      }
    });
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, amount: buckets[day] || 0 }));
  }, [transactions]);

  const monthlyNet = useMemo(() => {
    const grouped: Record<string, { month: string; actual: number; projected?: number | null }> = {};
    transactions.forEach((t) => {
      const d = parseDate(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = { month: key, actual: 0, projected: null };
      grouped[key].actual += t.amount;
    });

    const sortedKeys = Object.keys(grouped).sort();
    const actualData = sortedKeys.map((key) => ({
      month: key,
      actual: grouped[key].actual,
      projected: null,
    }));

    const recent = actualData.slice(-3);
    const avgNet = recent.length ? recent.reduce((s, r) => s + r.actual, 0) / recent.length : 0;
    const next1 = new Date();
    next1.setMonth(next1.getMonth() + 1);
    const next2 = new Date();
    next2.setMonth(next2.getMonth() + 2);
    const monthLabel = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const projected = avgNet !== 0 ? [
      { month: monthLabel(next1), actual: null, projected: avgNet },
      { month: monthLabel(next2), actual: null, projected: avgNet },
    ] : [];

    return [...actualData, ...projected];
  }, [transactions]);

  const highestCategory = useMemo(() => {
    const buckets: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.amount < 0) {
        buckets[t.category || "Other"] = (buckets[t.category || "Other"] || 0) + Math.abs(t.amount);
      }
    });
    const entries = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
    return entries[0] ? { category: entries[0][0], amount: entries[0][1] } : null;
  }, [transactions]);

  const topDay = useMemo(() => {
    const entries = weeklySpending.slice().sort((a, b) => b.amount - a.amount);
    return entries[0]?.amount ? entries[0] : null;
  }, [weeklySpending]);

  const dynamicInsights = useMemo(() => {
    const items = [] as Array<{ id: number; title: string; description: string; icon: typeof Lightbulb; color: string }>;
    if (!transactions.length) {
      items.push({
        id: 1,
        title: "No data yet",
        description: "Import or add transactions to unlock personalized insights.",
        icon: Lightbulb,
        color: "bg-muted/40 text-muted-foreground border-border/50",
      });
      return items;
    }

    if (topDay) {
      items.push({
        id: 1,
        title: `Highest spending on ${topDay.day}`,
        description: `Spent ${formatCurrency(topDay.amount)} on your top weekday. Set a cap for that day to smooth cash flow.`,
        icon: AlertTriangle,
        color: "bg-warning/10 text-warning border-warning/20",
      });
    }

    if (highestCategory) {
      items.push({
        id: 2,
        title: `Biggest spend: ${highestCategory.category}`,
        description: `This category totals ${formatCurrency(highestCategory.amount)}. Move it to Needs only when required to trim costs.`,
        icon: CreditCard,
        color: "bg-primary/10 text-primary border-primary/20",
      });
    }

    items.push({
      id: 3,
      title: totals.net >= 0 ? "Positive cash flow" : "Cash flow at risk",
      description: totals.net >= 0
        ? `You are net positive by ${formatCurrency(totals.net)}. Consider auto-moving 10% to savings.`
        : `You are overspending by ${formatCurrency(Math.abs(totals.net))}. Pause wants for a week to get back on track.`,
      icon: totals.net >= 0 ? TrendingUp : TrendingDown,
      color: totals.net >= 0 ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/30",
    });

    items.push({
      id: 4,
      title: "Savings rate check",
      description: totals.savingsRate
        ? `Savings rate: ${totals.savingsRate}%. Aim for +5% by cutting one frequent expense category.`
        : "No savings yet this period. Route first credit inflow to savings automatically.",
      icon: PiggyBank,
      color: "bg-accent/10 text-accent border-accent/20",
    });

    return items;
  }, [transactions, topDay, highestCategory, totals]);

  const latestSnapshot = useMemo(() => {
    const sample = transactions.slice(-20).map((tx) => ({
      name: tx.name,
      category: tx.category,
      amount: tx.amount,
      date: tx.date,
    }));
    return {
      totals,
      highestCategory,
      topDay,
      recent: sample,
    };
  }, [transactions, totals, highestCategory, topDay]);

  const buildPrompt = () => `You are Google Gemini helping a user understand their finances. Summarize the key risks and opportunities in 3 concise bullet points referencing INR amounts.

Data snapshot:
${JSON.stringify(latestSnapshot, null, 2)}

Guidelines:
- Highlight overspending or positive cash flow in plain language.
- Recommend one concrete action for savings and one for income.
- Output Markdown with bullet points.`;

  const handleGemini = async () => {
    if (!geminiKey) {
      setGeminiState("error");
      setGeminiError("Add VITE_GEMINI_API_KEY in your .env to enable Gemini.");
      return;
    }

    if (!transactions.length) {
      setGeminiState("error");
      setGeminiError("Import or add transactions to request Gemini insights.");
      return;
    }

    try {
      setGeminiState("loading");
      setGeminiError("");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt() }],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Gemini request failed");
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((part: { text: string }) => part.text).join("\n");

      if (!text) throw new Error("Empty Gemini response");

      setGeminiInsight(text.trim());
      setGeminiState("ready");
    } catch (error) {
      console.error(error);
      setGeminiState("error");
      setGeminiError("Gemini could not generate insight. Check API key/quotas and try again.");
    }
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
                  {transactions.length ? (
                    <p className="text-muted-foreground leading-relaxed">
                      Net this period: <span className="text-success font-medium">{formatCurrency(totals.net)}</span>. Savings rate <span className="text-success font-medium">{totals.savingsRate}%</span>.{" "}
                      {highestCategory ? (
                        <> Top spend: <span className="text-foreground font-medium">{highestCategory.category} ({formatCurrency(highestCategory.amount)})</span>. </>
                      ) : ""}
                      {topDay ? (
                        <> Highest daily spend on <span className="text-foreground font-medium">{topDay.day}</span>. </>
                      ) : ""}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Add or import transactions to see live insights.</p>
                  )}
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

          <Card className="border-border/50 mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Gemini AI Insight
                </CardTitle>
                <p className="text-sm text-muted-foreground">Powered by Google Gemini. Configure VITE_GEMINI_API_KEY to enable.</p>
              </div>
              <Button onClick={handleGemini} disabled={geminiState === "loading"}>
                {geminiState === "loading" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate
              </Button>
            </CardHeader>
            <CardContent>
              {geminiState === "ready" && geminiInsight ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground" dangerouslySetInnerHTML={{ __html: geminiInsight.replace(/\n/g, '<br />') }} />
              ) : geminiState === "error" ? (
                <p className="text-sm text-destructive">{geminiError}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Press Generate to let Gemini review your latest data.</p>
              )}
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
                {transactions.length ? (
                  <>
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
                            formatter={(value: number) => [`₹${Math.round(value).toLocaleString()}`, 'Spent']}
                          />
                          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      {topDay ? `${topDay.day} is your highest spending day: ${formatCurrency(topDay.amount)}` : "Spending data will appear as you add expenses."}
                    </p>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Import transactions to view weekly spending.
                  </div>
                )}
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
                {monthlyNet.length ? (
                  <>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyNet}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number | null) => value !== null ? [`₹${Math.round(value).toLocaleString()}`, ''] : ['-', '']}
                          />
                          <Line type="monotone" dataKey="actual" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))' }} name="Actual" />
                          <Line type="monotone" dataKey="projected" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projected" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Projection uses your recent average net cash flow.
                    </p>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Add transactions to generate a projection.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights Grid */}
          <h2 className="text-xl font-semibold text-foreground mb-4">Personalized Tips</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {dynamicInsights.map((insight) => {
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
