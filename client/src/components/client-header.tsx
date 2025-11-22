import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { CalculatorDialog } from "@/components/calculator-dialog";
import { SessionReminders } from "@/components/session-reminders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dumbbell, Calendar, Video, UtensilsCrossed, User, History, Image, ChevronDown, TrendingUp, Scale, Ruler, LineChart, Target, Award, Trophy, FileText, MessageSquare, TicketIcon, Bell, MessageCircle, CalendarDays, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { queryClient } from "@/lib/queryClient";

interface ClientHeaderProps {
  currentPage?: 'dashboard' | 'workouts' | 'videos' | 'diet' | 'sessions' | 'history' | 'workout-history' | 'progress' | 'profile' | 'weight-tracking' | 'body-measurements' | 'progress-charts' | 'weekly-completion' | 'achievements' | 'achievement-gallery' | 'personal-records' | 'monthly-reports' | 'goals' | 'calendar' | 'messages' | 'support-tickets' | 'announcements' | 'forum';
}

export function ClientHeader({ currentPage }: ClientHeaderProps) {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        queryClient.clear();
        setLocation('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button 
            onClick={() => setLocation("/client-access")} 
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 flex-shrink-0"
            data-testid="button-logo-home"
          >
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display font-bold tracking-tight">FitPro</span>
          </button>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              <Button 
                variant="ghost" 
                className={currentPage === 'dashboard' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client")}
                data-testid="link-dashboard"
              >
                {t('nav.dashboard')}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={['sessions', 'workout-history', 'videos'].includes(currentPage || '') ? 'bg-accent' : ''} data-testid="dropdown-training">
                    {t('nav.training')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setLocation("/client/sessions")} data-testid="link-sessions">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('nav.liveSessions')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/workout-history")} data-testid="link-workout-history">
                    <History className="h-4 w-4 mr-2" />
                    {t('nav.workoutHistory')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/videos")} data-testid="link-videos">
                    <Video className="h-4 w-4 mr-2" />
                    {t('nav.videoLibrary')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={currentPage === 'diet' ? 'bg-accent' : ''} data-testid="dropdown-nutrition">
                    {t('nav.nutrition')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setLocation("/client/diet")} data-testid="link-diet">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    {t('nav.dietMealPlans')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                className={currentPage === 'workouts' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client/workouts")}
                data-testid="link-workouts"
              >
                Workouts
              </Button>

              <Button 
                variant="ghost" 
                className={currentPage === 'goals' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client/goals")}
                data-testid="link-goals"
              >
                {t('goals.title')}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={['weight-tracking', 'body-measurements', 'progress-charts', 'achievements', 'personal-records', 'monthly-reports', 'progress'].includes(currentPage || '') ? 'bg-accent' : ''} data-testid="dropdown-progress">
                    {t('nav.progressAnalytics')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/weight-tracking")} data-testid="link-weight-tracking">
                    <Scale className="h-4 w-4 mr-2" />
                    {t('nav.weightTracking')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/body-measurements")} data-testid="link-body-measurements">
                    <Ruler className="h-4 w-4 mr-2" />
                    {t('nav.bodyMeasurements')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/charts")} data-testid="link-progress-charts">
                    <LineChart className="h-4 w-4 mr-2" />
                    {t('nav.progressCharts')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/achievements")} data-testid="link-achievements">
                    <Award className="h-4 w-4 mr-2" />
                    {t('nav.achievements')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/personal-records")} data-testid="link-personal-records">
                    <Trophy className="h-4 w-4 mr-2" />
                    {t('nav.personalRecords')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/client/progress-photos")} data-testid="link-progress-photos">
                    <Image className="h-4 w-4 mr-2" />
                    {t('nav.progressPhotos')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/progress/monthly-reports")} data-testid="link-monthly-reports">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('nav.monthlyReports')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={['messages', 'support-tickets', 'announcements', 'forum'].includes(currentPage || '') ? 'bg-accent' : ''} data-testid="dropdown-messages">
                    {t('comm.messages')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setLocation("/client/messages")} data-testid="link-messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('comm.trainerMessaging')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/support-tickets")} data-testid="link-support-tickets">
                    <TicketIcon className="h-4 w-4 mr-2" />
                    {t('comm.supportTickets')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/announcements")} data-testid="link-announcements">
                    <Bell className="h-4 w-4 mr-2" />
                    {t('comm.announcements')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/client/forum")} data-testid="link-forum">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t('comm.communityForum')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

          {/* Icon Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <CalculatorDialog />
            <SessionReminders />
            <NotificationBell />
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation("/client/profile")} 
              data-testid="button-profile"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
