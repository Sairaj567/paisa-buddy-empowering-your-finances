import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles, TrendingUp, Wallet } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden pt-24 pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Financial Coaching
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6 animate-slide-up">
              Your Smart
              <span className="block text-primary">पैसा Buddy</span>
              <span className="block text-3xl md:text-4xl lg:text-5xl mt-2 text-muted-foreground font-medium">
                for Financial Freedom
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Intelligent budgeting, smart savings, and personalized insights designed for gig workers, students, and everyday Indians.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/learn">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start mt-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-success" />
                <span>Bank-grade Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="w-5 h-5 text-primary" />
                <span>Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span>AI-Powered Insights</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              {/* Main Card */}
              <div className="glass-card rounded-3xl p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <h3 className="text-3xl font-bold text-foreground">₹1,24,500</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-success/10 rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Income</p>
                    <p className="text-lg font-semibold text-success">+₹45,000</p>
                  </div>
                  <div className="bg-destructive/10 rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                    <p className="text-lg font-semibold text-destructive">-₹28,500</p>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">AI Insight</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You're spending 15% less on food this month. Keep it up! 🎉
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-4 top-1/3 glass-card rounded-2xl p-4 shadow-lg animate-float hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Fund</p>
                    <p className="text-sm font-semibold">72% Complete</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 glass-card rounded-2xl p-4 shadow-lg animate-float hidden md:block" style={{ animationDelay: "3s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Savings Rate</p>
                    <p className="text-sm font-semibold text-success">+23%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

const Target = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
