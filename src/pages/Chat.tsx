import { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useBudgets } from "@/hooks/useBudgets";
import { askFinancialQuestion, isAIConfigured, type FinancialSnapshot } from "@/lib/ai-service";
import { 
  Send,
  Sparkles,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isLoading?: boolean;
  isError?: boolean;
}

const Chat = () => {
  const { transactions, totals } = useTransactions();
  const { goals } = useGoals();
  const { budgets } = useBudgets();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "नमस्ते! 👋 I'm your पैसा Buddy AI assistant. I can help you with budgeting, savings tips, and answer any financial questions based on your actual transaction data. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageIdRef = useRef(2);

  const getNextMessageId = () => {
    const id = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;
    return id;
  };

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 20000): Promise<T> => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error("AI request timed out"));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  };

  const buildLocalReply = (question: string) => {
    const q = question.toLowerCase();
    const summary = [
      `Income: ₹${totals.income.toLocaleString('en-IN')}`,
      `Expenses: ₹${totals.expenses.toLocaleString('en-IN')}`,
      `Savings Rate: ${totals.savingsRate}%`,
    ].join(" | ");

    if (q.includes("save") || q.includes("savings")) {
      return `Based on your current data, your savings rate is ${totals.savingsRate}%. Try automating a fixed transfer right after income credit and reducing your top expense category first.\n\n${summary}`;
    }

    if (q.includes("budget") || q.includes("spend") || q.includes("expense")) {
      const topBudget = [...budgets].sort((a, b) => b.spent - a.spent)[0];
      const budgetLine = topBudget
        ? `Top spend bucket: ${topBudget.category} (₹${topBudget.spent.toLocaleString('en-IN')} of ₹${topBudget.limit.toLocaleString('en-IN')}).`
        : "No active budget categories found yet.";
      return `${budgetLine} Prioritize trimming variable expenses this week and track daily for better control.\n\n${summary}`;
    }

    if (q.includes("goal") || q.includes("target")) {
      const activeGoals = goals.filter((g) => g.current < g.target);
      return `You have ${activeGoals.length} active goals. A simple approach is to split monthly surplus across your top 1-2 goals instead of spreading too thin.\n\n${summary}`;
    }

    return `I received your question: "${question}". AI is currently unavailable, but I can still help with your finances using local analysis. Ask about savings, budgets, spending, or goals for specific suggestions.\n\n${summary}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build financial snapshot for AI context
  const financialSnapshot = useMemo((): FinancialSnapshot => {
    const expensesByCategory: Record<string, number> = {};
    const expensesByDay: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        const cat = tx.category || "Other";
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Math.abs(tx.amount);
        
        const day = new Date(tx.date).toLocaleDateString(undefined, { weekday: 'short' });
        expensesByDay[day] = (expensesByDay[day] || 0) + Math.abs(tx.amount);
      }
    });

    const highestCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];
    const topDay = Object.entries(expensesByDay).sort((a, b) => b[1] - a[1])[0];

    return {
      totals: {
        income: totals.income,
        expenses: totals.expenses,
        net: totals.balance,
        savingsRate: totals.savingsRate,
      },
      highestCategory: highestCategory ? { category: highestCategory[0], amount: highestCategory[1] } : null,
      topDay: topDay ? { day: topDay[0], amount: topDay[1] } : null,
      recent: transactions.slice(0, 20).map(t => ({
        name: t.name,
        category: t.category,
        amount: t.amount,
        date: t.date,
      })),
      goals: goals.map(g => ({
        name: g.name,
        current: g.current,
        target: g.target,
        progress: g.target > 0 ? Math.round((g.current / g.target) * 100) : 0,
      })),
      budgets: budgets.map(b => ({
        category: b.category,
        limit: b.limit,
        spent: b.spent,
        percentUsed: b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0,
      })),
    };
  }, [transactions, totals, goals, budgets]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const trimmedInput = input.trim();
    const userMessageId = getNextMessageId();
    const loadingId = getNextMessageId();
    
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: trimmedInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const loadingMessage: Message = {
      id: loadingId,
      role: "assistant",
      content: "Thinking...",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
    };
    
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsTyping(true);

    try {
      if (!isAIConfigured()) {
        // Fallback response when AI is not configured
        const localReply = buildLocalReply(trimmedInput);
        setMessages(prev => prev.map(m => 
          m.id === loadingId ? {
            ...m,
            content: localReply,
            isLoading: false,
          } : m
        ));
      } else {
        const response = await withTimeout(askFinancialQuestion(trimmedInput, financialSnapshot));
        setMessages(prev => prev.map(m => 
          m.id === loadingId ? {
            ...m,
            content: response,
            isLoading: false,
          } : m
        ));
      }
    } catch (error) {
      console.error('AI Error:', error);
      const localReply = buildLocalReply(trimmedInput);
      setMessages(prev => prev.map(m => 
        m.id === loadingId ? {
          ...m,
          content: localReply,
          isLoading: false,
          isError: false,
        } : m
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const retryMessage = (messageId: number) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex > 0) {
      const userMsg = messages[msgIndex - 1];
      if (userMsg.role === "user") {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setInput(userMsg.content);
      }
    }
  };

  const quickActions = [
    "How am I doing financially?",
    "Tips to save more",
    "Analyze my spending",
    "Budget recommendations",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 h-screen flex flex-col">
        <div className="container mx-auto max-w-4xl flex-1 flex flex-col p-4">
          {/* Chat Header */}
          <Card className="border-border/50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">पैसा Buddy AI</h2>
                    <p className={`text-xs flex items-center gap-1 ${isAIConfigured() ? 'text-success' : 'text-muted-foreground'}`}>
                      <span className={`w-2 h-2 rounded-full ${isAIConfigured() ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                      {isAIConfigured() ? 'AI Connected' : 'Demo Mode'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Transactions: {transactions.length}</p>
                  <p>Goals: {goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" 
                    ? "bg-primary" 
                    : message.isError
                    ? "bg-destructive/10"
                    : "gradient-primary shadow-glow"
                }`}>
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-primary-foreground" />
                  ) : message.isLoading ? (
                    <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                  ) : message.isError ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className={`max-w-[75%] ${message.role === "user" ? "text-right" : ""}`}>
                  <div className={`rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : message.isError
                      ? "bg-destructive/10 border border-destructive/20 rounded-tl-none"
                      : "bg-card border border-border rounded-tl-none"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.isError && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => retryMessage(message.id)}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-2">{message.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setInput(action)}
                disabled={isTyping}
              >
                {action}
              </Button>
            ))}
          </div>

          {/* Input */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Ask me anything about your finances..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="border-0 focus-visible:ring-0 bg-transparent"
                  disabled={isTyping}
                />
                <Button 
                  variant="hero" 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="flex-shrink-0"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Chat;
