import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start Your Journey Today
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
            Take Control of Your
            <span className="block">Financial Future</span>
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of Indians who are already making smarter financial decisions with पैसा Buddy. It's free to get started!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="glass" size="xl" className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/learn">
              <Button variant="outline" size="xl" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-primary-foreground/20">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground">10K+</p>
              <p className="text-sm text-primary-foreground/70">Active Users</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground">₹50Cr+</p>
              <p className="text-sm text-primary-foreground/70">Tracked</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground">4.8★</p>
              <p className="text-sm text-primary-foreground/70">User Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
