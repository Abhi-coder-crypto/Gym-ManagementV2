import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { CalculatorDialog } from "@/components/calculator-dialog";
import { SessionReminders } from "@/components/session-reminders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dumbbell, Calendar, Video, UtensilsCrossed, User, History, Image, ChevronDown, TrendingUp, Scale, Ruler, LineChart, Target, Award, Trophy, FileText } from "lucide-react";
import { useLocation } from "wouter";

interface ClientHeaderProps {
  currentPage?: 'dashboard' | 'workouts' | 'videos' | 'diet' | 'sessions' | 'history' | 'workout-history' | 'progress' | 'profile' | 'weight-tracking' | 'body-measurements' | 'progress-charts' | 'weekly-completion' | 'achievements' | 'achievement-gallery' | 'personal-records' | 'monthly-reports' | 'goals';
}

export function ClientHeader({ currentPage }: ClientHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLocation("/")} 
              className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1"
              data-testid="button-logo-home"
            >
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="text-2xl font-display font-bold tracking-tight">FitPro</span>
            </button>
            <nav className="hidden md:flex items-center gap-4">
              <Button 
                variant="ghost" 
                className={currentPage === 'dashboard' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client")}
                data-testid="link-dashboard"
              >
                Dashboard
              </Button>

              <Button 
                variant="ghost" 
                className={currentPage === 'goals' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client/goals")}
                data-testid="link-goals"
              >
                <Target className="h-4 w-4 mr-2" />
                Goals
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={['sessions', 'workout-history', 'videos'].includes(currentPage || '') ? 'bg-accent' : ''} data-testid="dropdown-training">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Training
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setLocation("/client/sessions")} data-testid="link-sessions">
                    <Calendar className="h-4 w-4 mr-2" />
                    Live Sessions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/workout-history")} data-testid="link-workout-history">
                    <History className="h-4 w-4 mr-2" />
                    Workout History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/videos")} data-testid="link-videos">
                    <Video className="h-4 w-4 mr-2" />
                    Video Library
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={currentPage === 'diet' ? 'bg-accent' : ''} data-testid="dropdown-nutrition">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Nutrition
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setLocation("/client/diet")} data-testid="link-diet">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Diet & Meal Plans
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={['weight-tracking', 'body-measurements', 'progress-charts', 'weekly-completion', 'achievements', 'achievement-gallery', 'personal-records', 'monthly-reports', 'progress'].includes(currentPage || '') ? 'bg-accent' : ''} data-testid="dropdown-progress">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Progress & Analytics
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/weight-tracking")} data-testid="link-weight-tracking">
                    <Scale className="h-4 w-4 mr-2" />
                    Weight Tracking
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/body-measurements")} data-testid="link-body-measurements">
                    <Ruler className="h-4 w-4 mr-2" />
                    Body Measurements
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/charts")} data-testid="link-progress-charts">
                    <LineChart className="h-4 w-4 mr-2" />
                    Progress Charts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/weekly-completion")} data-testid="link-weekly-completion">
                    <Target className="h-4 w-4 mr-2" />
                    Weekly Workout Completion
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/achievements")} data-testid="link-achievements">
                    <Award className="h-4 w-4 mr-2" />
                    Achievement System
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/achievement-gallery")} data-testid="link-achievement-gallery">
                    <Trophy className="h-4 w-4 mr-2" />
                    Achievement Gallery
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/personal-records")} data-testid="link-personal-records">
                    <Trophy className="h-4 w-4 mr-2" />
                    Personal Records
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/client/progress-photos")} data-testid="link-progress-photos">
                    <Image className="h-4 w-4 mr-2" />
                    Progress Photos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/monthly-reports")} data-testid="link-monthly-reports">
                    <FileText className="h-4 w-4 mr-2" />
                    Monthly Reports
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <CalculatorDialog />
            <SessionReminders />
            <NotificationCenter />
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation("/client/profile")} 
              data-testid="button-profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
