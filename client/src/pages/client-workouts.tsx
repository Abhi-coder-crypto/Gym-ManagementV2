import { useState } from "react";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, CheckCircle2, Target, Clock, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

interface WorkoutSession {
  _id: string;
  clientId: string;
  workoutPlanId?: {
    _id: string;
    name: string;
  };
  workoutName: string;
  duration: number;
  caloriesBurned: number;
  exercises: any;
  completedAt: string;
  date?: string;
  notes?: string;
  completed?: boolean;
}

interface WorkoutPlan {
  _id: string;
  name: string;
  description: string;
  exercises: any[];
  difficulty: string;
}

export default function ClientWorkouts() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const { data: workoutSessions = [], isLoading: isLoadingSessions } = useQuery<WorkoutSession[]>({
    queryKey: ['/api/workout-sessions'],
  });

  const { data: assignedWorkouts = [], isLoading: isLoadingWorkouts } = useQuery<WorkoutPlan[]>({
    queryKey: ['/api/my-workouts'],
  });

  const isLoading = isLoadingSessions || isLoadingWorkouts;

  const currentWeekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const completedThisWeek = workoutSessions.filter(session => {
    const sessionDate = session.date ? parseISO(session.date) : parseISO(session.completedAt);
    return sessionDate >= currentWeekStart && sessionDate <= currentWeekEnd;
  });

  const totalWeeklyWorkouts = completedThisWeek.length;
  const totalCaloriesBurned = completedThisWeek.reduce((sum, session) => sum + (session.caloriesBurned || 0), 0);
  const totalDuration = completedThisWeek.reduce((sum, session) => sum + (session.duration || 0), 0);

  const getWorkoutsForDay = (date: Date) => {
    return workoutSessions.filter(session => {
      const sessionDate = session.date ? parseISO(session.date) : parseISO(session.completedAt);
      return isSameDay(sessionDate, date);
    });
  };

  const hasWorkoutOnDay = (date: Date) => {
    return getWorkoutsForDay(date).length > 0;
  };

  const recentWorkouts = [...workoutSessions]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ClientHeader currentPage="workouts" />
        <main className="flex-1 container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">My Workouts</h1>
            <p className="text-muted-foreground">
              Track your assigned workouts and weekly progress
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
              <p className="text-muted-foreground">Loading your workouts...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClientHeader currentPage="workouts" />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">My Workouts</h1>
          <p className="text-muted-foreground">
            Track your assigned workouts and weekly progress
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalWeeklyWorkouts}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalDuration}</div>
              <p className="text-xs text-muted-foreground mt-1">Minutes this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCaloriesBurned}</div>
              <p className="text-xs text-muted-foreground mt-1">Total calories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Workouts</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assignedWorkouts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active plans</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Workout Calendar</CardTitle>
                <CardDescription>
                  {format(currentWeekStart, 'MMM dd')} - {format(currentWeekEnd, 'MMM dd, yyyy')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousWeek} data-testid="button-previous-week">
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={goToCurrentWeek} data-testid="button-current-week">
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextWeek} data-testid="button-next-week">
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-3">
              {daysOfWeek.map((day, index) => {
                const hasWorkout = hasWorkoutOnDay(day);
                const workoutsOnDay = getWorkoutsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-md border ${
                      hasWorkout
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isToday
                        ? 'bg-accent border-accent'
                        : 'bg-card border-border'
                    }`}
                    data-testid={`day-${index}`}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium mb-1">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        {format(day, 'd')}
                      </div>
                      {hasWorkout ? (
                        <div className="text-xs">
                          {workoutsOnDay.length} {workoutsOnDay.length === 1 ? 'workout' : 'workouts'}
                        </div>
                      ) : (
                        <div className="text-xs opacity-50">Rest</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Assigned Workout Plans
              </CardTitle>
              <CardDescription>Your current training programs</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {assignedWorkouts.map((workout) => (
                    <div
                      key={workout._id}
                      className="p-4 rounded-md border hover-elevate"
                      data-testid={`workout-plan-${workout._id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{workout.name}</h3>
                        <Badge variant="outline">{workout.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{workout.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Dumbbell className="h-4 w-4" />
                        <span>{workout.exercises?.length || 0} exercises</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No workout plans assigned yet</p>
                  <p className="text-sm">Your trainer will assign workouts soon</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Recent Completed Workouts
              </CardTitle>
              <CardDescription>Your latest workout sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {recentWorkouts.map((session) => (
                    <div
                      key={session._id}
                      className="p-3 rounded-md border"
                      data-testid={`completed-workout-${session._id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{session.workoutName}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(session.completedAt), 'PPP')}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          <span>{session.caloriesBurned} cal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No completed workouts yet</p>
                  <p className="text-sm">Start your first workout to track progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
