import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientHeader } from "@/components/client-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dumbbell,
  Flame,
  Trophy,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Clock,
  Zap
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface DashboardData {
  client: {
    name: string;
    packageName: string;
    goal: string;
  };
  stats: {
    currentStreak: number;
    maxStreak: number;
    totalSessions: number;
    weekSessions: number;
    monthSessions: number;
    totalCalories: number;
    weekCalories: number;
  };
  progress: {
    initialWeight: number;
    currentWeight: number;
    targetWeight: number;
    weightProgress: number;
    weeklyWorkoutCompletion: number;
  };
  nextSession: any;
  upcomingSessions: any[];
  recentSessions: any[];
  achievements: any[];
  hasWorkoutPlan: boolean;
  hasDietPlan: boolean;
  calendarData: Array<{ date: string; hasWorkout: boolean; isToday: boolean }>;
}

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  // Fetch client's package access details
  const { data: packageAccess } = useQuery<any>({
    queryKey: ['/api/client-access', clientId],
    enabled: !!clientId,
  });

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard', clientId],
    enabled: !!clientId,
  });

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader currentPage="dashboard" />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-6 space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { client, stats, progress, nextSession, upcomingSessions, achievements, calendarData = [] } = dashboardData;

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="dashboard" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight" data-testid="text-welcome">
                Welcome back, {client.name.split(' ')[0]}!
              </h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                <span>You're on the</span>
                <Badge className="bg-chart-2" data-testid="badge-package">{client.packageName} Plan</Badge>
                <span>•</span>
                <span className="text-sm">Goal: {client.goal}</span>
                {packageAccess?.subscriptionEnd && (
                  <>
                    <span>•</span>
                    <span className="text-sm">
                      Expires: {new Date(packageAccess.subscriptionEnd).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Button data-testid="button-start-workout" onClick={() => setLocation('/client/workouts')}>
              <Dumbbell className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packageAccess?.features?.workoutPlanAccess ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-streak">{stats.currentStreak} days</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.currentStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Trophy className="h-3 w-3" />
                    <span>Best: {stats.maxStreak} days</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="opacity-60">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Available in Fit Plus+</p>
                </CardContent>
              </Card>
            )}

            {packageAccess?.features?.recordedSessionsAccess || packageAccess?.features?.liveGroupTrainingAccess ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                  <Trophy className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-sessions">{stats.totalSessions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{stats.weekSessions} this week
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{stats.monthSessions} this month</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="opacity-60">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                  <Trophy className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Available in Pro Transformation+</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-week-calories">
                  {stats.weekCalories.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3" />
                  <span>{stats.totalCalories.toLocaleString()} total</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Session</CardTitle>
                <Calendar className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                {nextSession ? (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-next-session">
                      {formatDistanceToNow(new Date(nextSession.scheduledAt), { addSuffix: true })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{nextSession.title}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{nextSession.duration} min</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-medium text-muted-foreground">No sessions</div>
                    <p className="text-xs text-muted-foreground mt-1">Check sessions page</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Workout Streak Calendar
                  </CardTitle>
                  <CardDescription>
                    Your workout consistency over the last 4 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarData.map((day, i) => {
                      return (
                        <div
                          key={day.date}
                          className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                            day.isToday
                              ? 'border-2 border-primary'
                              : day.hasWorkout
                              ? 'bg-chart-2 text-chart-2-foreground'
                              : 'bg-muted'
                          }`}
                          data-testid={`calendar-day-${i}`}
                          title={day.date}
                        >
                          {day.isToday ? 'T' : day.hasWorkout ? '✓' : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-chart-2"></div>
                      <span>Workout completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-muted"></div>
                      <span>Rest day</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Live Sessions</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation("/client/sessions")}
                      data-testid="button-view-all-sessions"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingSessions.map((session: any) => {
                        const sessionDate = new Date(session.scheduledAt);
                        return (
                          <Card key={session._id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold" data-testid={`session-title-${session._id}`}>
                                    {session.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {session.description}
                                  </p>
                                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {format(sessionDate, 'MMM dd, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {format(sessionDate, 'h:mm a')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Dumbbell className="h-4 w-4" />
                                      {session.duration} min
                                    </div>
                                  </div>
                                </div>
                                {session.joinUrl ? (
                                  <Button
                                    size="sm"
                                    onClick={() => window.open(session.joinUrl, '_blank')}
                                    data-testid={`button-join-${session._id}`}
                                  >
                                    Join Now
                                  </Button>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    Zoom link coming soon
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming sessions scheduled
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-chart-2" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {progress.targetWeight > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Weight Goal</span>
                        <span className="text-sm text-muted-foreground">
                          {progress.currentWeight} / {progress.targetWeight} kg
                        </span>
                      </div>
                      <Progress value={progress.weightProgress} className="h-2" data-testid="progress-weight" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {progress.weightProgress}% of goal achieved
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Weekly Workouts</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.weekSessions} / 5 sessions
                      </span>
                    </div>
                    <Progress value={progress.weeklyWorkoutCompletion} className="h-2" data-testid="progress-weekly" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress.weeklyWorkoutCompletion}% weekly goal
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Workout Plan</span>
                      <Badge variant={dashboardData.hasWorkoutPlan ? "default" : "outline"}>
                        {dashboardData.hasWorkoutPlan ? 'Active' : 'None'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Diet Plan</span>
                      <Badge variant={dashboardData.hasDietPlan ? "default" : "outline"}>
                        {dashboardData.hasDietPlan ? 'Active' : 'None'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <div className="space-y-3">
                      {achievements.map((achievement: any) => (
                        <div
                          key={achievement._id}
                          className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                          data-testid={`achievement-${achievement._id}`}
                        >
                          <div className="p-2 rounded-full bg-yellow-500/10">
                            <Award className="h-4 w-4 text-yellow-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Complete workouts to earn achievements!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Feature Access Display Section - Add this near the end before export
function FeatureAccessSection({ client, packageName }: { client: any, packageName: string | null }) {
  const { hasFeature } = require('@/lib/featureAccess');
  const isSubscriptionActive = client?.subscriptionEndDate && new Date() < new Date(client.subscriptionEndDate);
  
  const allFeatures = [
    { id: 'workouts', label: 'Workout Plans', packages: ['Fit Basics', 'Fit Plus', 'Pro Transformation', 'Elite Athlete'] },
    { id: 'diet', label: 'Basic Diet', packages: ['Fit Basics', 'Fit Plus', 'Pro Transformation', 'Elite Athlete'] },
    { id: 'recorded_videos', label: 'Recorded Videos', packages: ['Fit Basics', 'Fit Plus', 'Pro Transformation', 'Elite Athlete'] },
    { id: 'personalized_diet', label: 'Personalized Diet', packages: ['Fit Plus', 'Pro Transformation', 'Elite Athlete'] },
    { id: 'weekly_checkins', label: 'Weekly Check-ins', packages: ['Fit Plus', 'Pro Transformation', 'Elite Athlete'] },
    { id: 'one_on_one_calls', label: '1-on-1 Calls', packages: ['Pro Transformation', 'Elite Athlete'] },
    { id: 'habit_coaching', label: 'Habit Coaching', packages: ['Pro Transformation', 'Elite Athlete'] },
    { id: 'performance_tracking', label: 'Performance Tracking', packages: ['Elite Athlete'] },
    { id: 'priority_support', label: 'Priority Support', packages: ['Elite Athlete'] },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Your Features</CardTitle>
        <CardDescription>
          {!isSubscriptionActive ? (
            <span className="text-red-600">Subscription expired - renew to access features</span>
          ) : (
            <span>Current package: <Badge>{packageName}</Badge></span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allFeatures.map((feature) => {
            const hasAccess = isSubscriptionActive && hasFeature(packageName, feature.id);
            const requiredPackages = feature.packages;
            const minPackage = requiredPackages[0];
            
            return (
              <div
                key={feature.id}
                className={`p-3 rounded-md border flex items-center justify-between ${
                  hasAccess
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                    : 'bg-muted border-muted-foreground/20 opacity-60'
                }`}
              >
                <div>
                  <p className="font-semibold text-sm">{feature.label}</p>
                  {!hasAccess && (
                    <p className="text-xs text-muted-foreground">
                      Available in {minPackage}+
                    </p>
                  )}
                </div>
                {hasAccess ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-muted-foreground">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
