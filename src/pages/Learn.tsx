import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen,
  PlayCircle,
  CheckCircle,
  Lock,
  Star,
  Trophy,
  Clock,
  ChevronRight,
  Award
} from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Basics of Budgeting",
    description: "Learn how to create and stick to a budget that works for you.",
    lessons: 5,
    completed: 5,
    duration: "30 min",
    difficulty: "Beginner",
    unlocked: true,
    badge: "Budget Master",
  },
  {
    id: 2,
    title: "Emergency Fund 101",
    description: "Why you need an emergency fund and how to build one.",
    lessons: 4,
    completed: 3,
    duration: "25 min",
    difficulty: "Beginner",
    unlocked: true,
    badge: null,
  },
  {
    id: 3,
    title: "Understanding Credit Scores",
    description: "How credit scores work and tips to improve yours.",
    lessons: 6,
    completed: 0,
    duration: "40 min",
    difficulty: "Intermediate",
    unlocked: true,
    badge: null,
  },
  {
    id: 4,
    title: "Introduction to Investing",
    description: "Start your investment journey with stocks, mutual funds, and SIPs.",
    lessons: 8,
    completed: 0,
    duration: "60 min",
    difficulty: "Intermediate",
    unlocked: false,
    badge: null,
  },
  {
    id: 5,
    title: "Tax Planning Essentials",
    description: "Save money legally with smart tax planning strategies.",
    lessons: 6,
    completed: 0,
    duration: "45 min",
    difficulty: "Intermediate",
    unlocked: false,
    badge: null,
  },
  {
    id: 6,
    title: "Retirement Planning",
    description: "Plan for a comfortable retirement with NPS, PPF, and more.",
    lessons: 7,
    completed: 0,
    duration: "55 min",
    difficulty: "Advanced",
    unlocked: false,
    badge: null,
  },
];

const badges = [
  { id: 1, name: "Budget Master", icon: Trophy, earned: true },
  { id: 2, name: "First Saver", icon: Star, earned: true },
  { id: 3, name: "Quiz Champion", icon: Award, earned: false },
  { id: 4, name: "Investor", icon: Star, earned: false },
];

const difficultyColors: { [key: string]: string } = {
  "Beginner": "bg-success/10 text-success",
  "Intermediate": "bg-accent/10 text-accent",
  "Advanced": "bg-primary/10 text-primary",
};

const Learn = () => {
  const totalLessons = courses.reduce((sum, c) => sum + c.lessons, 0);
  const completedLessons = courses.reduce((sum, c) => sum + c.completed, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Financial Literacy
              </h1>
              <p className="text-muted-foreground">Learn to manage your money like a pro</p>
            </div>
            <Button variant="hero">
              <PlayCircle className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          </div>

          {/* Progress & Badges Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Progress Card */}
            <Card className="lg:col-span-2 border-border/50 gradient-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Learning Progress</h3>
                    <p className="text-primary-foreground/70">{completedLessons} of {totalLessons} lessons completed</p>
                  </div>
                </div>
                <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <p className="text-sm text-primary-foreground/70 mt-2">{overallProgress}% complete</p>
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {badges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div 
                        key={badge.id}
                        className={`aspect-square rounded-xl flex items-center justify-center ${
                          badge.earned 
                            ? 'bg-accent/10' 
                            : 'bg-muted opacity-50'
                        }`}
                        title={badge.name}
                      >
                        <Icon className={`w-6 h-6 ${badge.earned ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {badges.filter(b => b.earned).length} of {badges.length} badges earned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          <h2 className="text-xl font-semibold text-foreground mb-4">Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = Math.round((course.completed / course.lessons) * 100);
              const isCompleted = course.completed === course.lessons;
              
              return (
                <Card 
                  key={course.id} 
                  className={`border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                    !course.unlocked ? 'opacity-70' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[course.difficulty]}`}>
                        {course.difficulty}
                      </div>
                      {!course.unlocked && (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {course.unlocked && (
                      <div className="mb-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.completed}/{course.lessons} lessons
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                      <Button 
                        variant={course.unlocked ? "ghost" : "outline"} 
                        size="sm"
                        disabled={!course.unlocked}
                      >
                        {isCompleted ? "Review" : course.unlocked ? "Continue" : "Unlock"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    {course.badge && isCompleted && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-accent">
                          <Trophy className="w-4 h-4" />
                          Badge earned: {course.badge}
                        </div>
                      </div>
                    )}
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

export default Learn;
