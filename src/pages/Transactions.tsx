import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Filter,
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Film,
  Smartphone,
  Heart,
  MoreHorizontal,
  Download,
  Upload,
  Plus
} from "lucide-react";

const categoryIcons: { [key: string]: React.ReactNode } = {
  "Food & Dining": <Utensils className="w-5 h-5" />,
  "Shopping": <ShoppingCart className="w-5 h-5" />,
  "Housing": <Home className="w-5 h-5" />,
  "Transport": <Car className="w-5 h-5" />,
  "Entertainment": <Film className="w-5 h-5" />,
  "Bills & Utilities": <Smartphone className="w-5 h-5" />,
  "Healthcare": <Heart className="w-5 h-5" />,
  "Income": <TrendingUp className="w-5 h-5" />,
  "Other": <MoreHorizontal className="w-5 h-5" />,
};

const transactions = [
  { id: 1, name: "Swiggy Order", category: "Food & Dining", amount: -485, date: "Dec 30, 2024", type: "Wants" },
  { id: 2, name: "Monthly Salary", category: "Income", amount: 52000, date: "Dec 29, 2024", type: "Income" },
  { id: 3, name: "Electricity Bill", category: "Bills & Utilities", amount: -1850, date: "Dec 28, 2024", type: "Essentials" },
  { id: 4, name: "Amazon Shopping", category: "Shopping", amount: -2999, date: "Dec 27, 2024", type: "Wants" },
  { id: 5, name: "Petrol", category: "Transport", amount: -1200, date: "Dec 26, 2024", type: "Needs" },
  { id: 6, name: "Rent Payment", category: "Housing", amount: -15000, date: "Dec 25, 2024", type: "Essentials" },
  { id: 7, name: "Netflix Subscription", category: "Entertainment", amount: -649, date: "Dec 24, 2024", type: "Wants" },
  { id: 8, name: "Grocery - BigBasket", category: "Food & Dining", amount: -2340, date: "Dec 23, 2024", type: "Essentials" },
  { id: 9, name: "Doctor Visit", category: "Healthcare", amount: -800, date: "Dec 22, 2024", type: "Needs" },
  { id: 10, name: "Freelance Payment", category: "Income", amount: 15000, date: "Dec 21, 2024", type: "Income" },
];

const typeColors: { [key: string]: string } = {
  "Essentials": "bg-primary/10 text-primary",
  "Needs": "bg-accent/10 text-accent",
  "Wants": "bg-warning/10 text-warning",
  "Income": "bg-success/10 text-success",
};

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Essentials", "Needs", "Wants", "Income"];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || tx.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Transactions
              </h1>
              <p className="text-muted-foreground">Track and manage your expenses</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className="whitespace-nowrap"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Essentials</p>
                <p className="text-lg font-bold text-primary">₹19,190</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Needs</p>
                <p className="text-lg font-bold text-accent">₹2,000</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Wants</p>
                <p className="text-lg font-bold text-warning">₹4,133</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Income</p>
                <p className="text-lg font-bold text-success">₹67,000</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {activeFilter === "All" ? "All Transactions" : `${activeFilter} Transactions`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-success/10' : 'bg-muted'
                      }`}>
                        {tx.amount > 0 ? (
                          <TrendingUp className="w-5 h-5 text-success" />
                        ) : (
                          categoryIcons[tx.category] || <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{tx.category}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{tx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[tx.type]}`}>
                        {tx.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Transactions;
