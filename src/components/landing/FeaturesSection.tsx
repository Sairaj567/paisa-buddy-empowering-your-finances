import { 
  Wallet, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Shield, 
  Sparkles,
  MessageCircle,
  BookOpen,
  Scan
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Budgeting",
    description: "Smart monthly budgets that adapt to your irregular income patterns and spending habits.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Scan,
    title: "Auto-Categorize",
    description: "Automatically classify transactions from SMS and OCR scanned bills and statements.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set and track savings goals for travel, emergencies, education, and more.",
    color: "bg-success/10 text-success",
  },
  {
    icon: TrendingUp,
    title: "Stock Portfolio",
    description: "Track your investments with performance analysis and educational insights.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description: "Interactive charts showing spending trends and category-wise breakdowns.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MessageCircle,
    title: "Expert Consult",
    description: "Chat with financial consultants for personalized guidance and advice.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BookOpen,
    title: "Financial Literacy",
    description: "Learn with short lessons and quizzes to boost your financial awareness.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Bank-grade encryption with biometric-ready authentication support.",
    color: "bg-destructive/10 text-destructive",
  },
  {
    icon: Sparkles,
    title: "AI Chat Assistant",
    description: "Ask questions about your finances and get personalized AI-powered advice instantly.",
    color: "bg-primary/10 text-primary",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-primary">Master Your Money</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powered by multiple AI agents working together to give you personalized financial insights and recommendations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
