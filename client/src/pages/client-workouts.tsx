import { useState } from "react";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, CheckCircle2, Target, Clock, Flame, Droplet, Plus, TrendingUp } from "lucide-react";
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
  const [waterIntake, setWaterIntake] = useState(0);
  const waterGoal = 8;

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
  
  // Calculate workout completion percentage (assuming 5 workouts per week as goal)
  const weeklyGoal = 5;
  const completionPercentage = Math.min((totalWeeklyWorkouts / weeklyGoal) * 100, 100);

  const getWorkoutsForDay = (date: Date) => {
    return workoutSessions.filter(session => {
      const sessionDate = session.date ? parseISO(session.date) : parseISO(session.completedAt);
      return isSameDay(sessionDate, date);
    });
  };

  const hasWorkoutOnDay = (date: Date) => {
    return getWorkoutsForDay(date).length > 0;
  };

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

  const handleWaterIntake = () => {
    if (waterIntake < waterGoal) {
      setWaterIntake(waterIntake + 1);
    }
  };

  const handleResetWater = () => {
    setWaterIntake(0);
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

        {/* Workout Overview with Circular Progress */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Circular Progress Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Your workout completion this week</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionPercentage / 100)}`}
                    className="text-primary transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{Math.round(completionPercentage)}%</span>
                  <span className="text-sm text-muted-foreground">Complete</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-2xl font-bold">{totalWeeklyWorkouts}/{weeklyGoal}</p>
                <p className="text-sm text-muted-foreground">Workouts completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalDuration}</div>
                <p className="text-xs text-muted-foreground mt-1">Minutes this week</p>
                <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>Keep it up!</span>
                </div>
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
                <div className="mt-2 flex items-center text-xs text-orange-600 dark:text-orange-400">
                  <Flame className="h-3 w-3 mr-1" />
                  <span>Great progress!</span>
                </div>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalWeeklyWorkouts}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed sessions</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Calendar */}
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

        {/* Water Intake Tracking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              Daily Water Intake
            </CardTitle>
            <CardDescription>Track your hydration throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{waterIntake * 250} ml</p>
                  <p className="text-sm text-muted-foreground">of {waterGoal * 250} ml goal</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {waterIntake}/{waterGoal} glasses
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((waterIntake / waterGoal) * 100)}% complete
                  </p>
                </div>
              </div>

              {/* Water Glasses Grid */}
              <div className="grid grid-cols-8 gap-3">
                {Array.from({ length: waterGoal }).map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (idx === waterIntake) {
                        handleWaterIntake();
                      }
                    }}
                    className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all hover-elevate ${
                      idx < waterIntake
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700'
                        : 'bg-muted'
                    }`}
                    data-testid={`water-glass-${idx}`}
                  >
                    {idx < waterIntake ? (
                      <Droplet className="h-6 w-6 text-white fill-white" />
                    ) : idx === waterIntake ? (
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Droplet className="h-6 w-6 text-muted-foreground opacity-30" />
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetWater}
                className="w-full"
                data-testid="button-reset-water"
              >
                Reset Daily Intake
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Workout Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Assigned Workout Plans
            </CardTitle>
            <CardDescription>Your current training programs from your trainer</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedWorkouts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignedWorkouts.map((workout) => (
                  <Card
                    key={workout._id}
                    className="hover-elevate"
                    data-testid={`workout-plan-${workout._id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{workout.name}</CardTitle>
                        <Badge 
                          variant={
                            workout.difficulty === 'Beginner' ? 'secondary' : 
                            workout.difficulty === 'Intermediate' ? 'default' : 
                            'destructive'
                          }
                        >
                          {workout.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{workout.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Dumbbell className="h-4 w-4" />
                        <span className="font-medium">{workout.exercises?.length || 0} exercises</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No workout plans assigned yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your trainer will assign personalized workouts soon
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
