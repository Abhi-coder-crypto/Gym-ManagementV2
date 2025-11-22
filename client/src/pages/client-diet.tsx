import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Utensils, 
  Droplet, 
  Pill, 
  ShoppingCart, 
  Apple, 
  Flame, 
  AlarmClock,
  ChefHat,
  AlertTriangle,
  Check,
  RefreshCw,
  Zap,
  TrendingDown,
  UtensilsCrossed,
  Dumbbell,
  Plus,
  Coffee,
  Salad,
  Cookie,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function ClientDiet() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string | null>(null);
  const [waterIntake, setWaterIntake] = useState(0);
  const [showDietaryReport, setShowDietaryReport] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  
  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: dietPlans, isLoading: isLoadingDiet } = useQuery<any[]>({
    queryKey: [`/api/diet-plans/${clientId}`],
    enabled: !!clientId,
  });

  const currentPlan = dietPlans?.find(plan => plan.clientId === clientId);
  
  // Reset currentDay when diet plan changes
  useEffect(() => {
    setCurrentDay(0);
  }, [currentPlan?._id]);

  // Handler functions for clickable elements
  const handleDietaryReport = () => {
    setShowDietaryReport(true);
  };

  const handleAISuggestion = () => {
    toast({
      title: "AI Meal Suggestion",
      description: "Generating personalized meal recommendations based on your goals and preferences...",
    });
  };

  const handleNextDay = () => {
    setCurrentDay(currentDay + 1);
  };

  const handlePrevDay = () => {
    setCurrentDay(currentDay - 1);
  };

  // Meal type icon configuration with colors
  const getMealTypeIcon = (mealIndex: number) => {
    const configs = [
      { 
        icon: Coffee, 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        type: 'Breakfast'
      },
      { 
        icon: Salad, 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        type: 'Lunch'
      },
      { 
        icon: Zap, 
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        type: 'Snack'
      },
      { 
        icon: ChefHat, 
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        type: 'Dinner'
      },
      { 
        icon: Cookie, 
        bgColor: 'bg-pink-100 dark:bg-pink-900/30',
        iconColor: 'text-pink-600 dark:text-pink-400',
        type: 'Snack'
      }
    ];
    return configs[mealIndex % configs.length];
  };

  // Extract meals from the array structure
  const hasDietPlan = currentPlan && Array.isArray(currentPlan.meals) && currentPlan.meals.length > 0;
  const allMeals = hasDietPlan ? currentPlan.meals : [];
  
  // Group meals by day (using dayIndex field if available)
  const mealsByDay: Record<number, any[]> = {};
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  allMeals.forEach((meal: any) => {
    const dayIdx = meal.dayIndex ?? 0;
    if (!mealsByDay[dayIdx]) {
      mealsByDay[dayIdx] = [];
    }
    mealsByDay[dayIdx].push(meal);
  });
  
  const totalDays = Object.keys(mealsByDay).length;
  const dayMeals = mealsByDay[currentDay] || [];
  const currentDayName = dayNames[currentDay] || `Day ${currentDay + 1}`;
  const hasNextDay = currentDay < totalDays - 1;
  const hasPrevDay = currentDay > 0;

  // Macro calculations for the current day
  const totalCalories = dayMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
  const totalProtein = dayMeals.reduce((sum: number, meal: any) => sum + (meal.protein || 0), 0);
  const totalCarbs = dayMeals.reduce((sum: number, meal: any) => sum + (meal.carbs || 0), 0);
  const totalFats = dayMeals.reduce((sum: number, meal: any) => sum + (meal.fats || 0), 0);
  
  // These are daily totals (all meals for the current day)
  const dailyCalories = totalCalories;
  
  // Goal values (can be from diet plan or defaults)
  const calorieGoal = currentPlan?.targetCalories || 2513;
  const remainingCalories = calorieGoal - dailyCalories;
  const caloriePercent = (dailyCalories / calorieGoal) * 100;

  const waterGoal = currentPlan?.waterIntakeGoal || 8;

  const handleWaterIntake = () => {
    if (waterIntake < waterGoal) {
      setWaterIntake(waterIntake + 1);
    }
  };

  const handleResetWater = () => {
    setWaterIntake(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="diet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="diet" data-testid="tab-diet">
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Diet
            </TabsTrigger>
            <TabsTrigger value="macros" data-testid="tab-macros">
              <Zap className="h-4 w-4 mr-2" />
              Macros
            </TabsTrigger>
          </TabsList>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-6">
            {isLoadingDiet ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Loading your diet plan...</p>
                </CardContent>
              </Card>
            ) : !hasDietPlan ? (
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 dark:from-orange-950 dark:to-yellow-950 dark:border-orange-800">
                <CardContent className="p-8 text-center space-y-4">
                  <UtensilsCrossed className="h-16 w-16 mx-auto text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Diet Plan Assigned</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your trainer hasn't assigned a diet plan yet. Please contact your trainer to get a personalized meal plan tailored to your fitness goals.
                  </p>
                  <Button variant="outline" className="mt-4" data-testid="button-contact-trainer">
                    Contact Trainer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Header Card */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2 mb-6">
                      <div className="w-full h-2 bg-green-400 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your personalized meal plan is ready</h2>
                      {currentPlan?.name && (
                        <p className="text-sm text-muted-foreground">Plan: {currentPlan.name}</p>
                      )}
                    </div>

                    {/* Day Navigation */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevDay}
                        disabled={!hasPrevDay}
                        data-testid="button-prev-day"
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {currentDayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dayMeals.length} meals
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextDay}
                        disabled={!hasNextDay}
                        data-testid="button-next-day"
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Total Calories Card */}
                    <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Flame className="h-6 w-6 text-orange-500" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{currentDayName} Total Calories</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalCalories} Cal</span>
                    </div>

                    {/* Meals List */}
                    {dayMeals.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                          <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No meals planned</p>
                          <p className="text-sm text-muted-foreground mt-1">Contact your trainer to get a meal plan</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {dayMeals.map((meal: any, idx: number) => {
                          const config = getMealTypeIcon(idx);
                          const IconComponent = config.icon;
                          return (
                            <Card key={idx} className="border-0 bg-white dark:bg-slate-800 hover-elevate">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  {/* Colored Icon Circle */}
                                  <div className={`${config.bgColor} rounded-full p-3 flex items-center justify-center`}>
                                    <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white">{meal.name}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {meal.time || config.type}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fats: {meal.fats}g
                                    </p>
                                  </div>
                                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0">
                                    {meal.calories}Cal
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Day Navigation Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handlePrevDay} 
                    disabled={!hasPrevDay}
                    variant="outline"
                    className="flex-1 h-12 text-lg font-semibold"
                    data-testid="button-prev-day-bottom"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous Day
                  </Button>
                  <Button 
                    onClick={handleNextDay} 
                    disabled={!hasNextDay}
                    className="flex-1 bg-green-500 hover:bg-green-600 h-12 text-lg font-semibold"
                    data-testid="button-next-day-bottom"
                  >
                    Next Day
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Macros Tab */}
          <TabsContent value="macros" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today</CardTitle>
                    <Badge className="mt-2 bg-orange-500">Premium</Badge>
                  </div>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400">
                    Lose Weight
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Circular Calories Progress */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {/* Circular Progress */}
                      <svg className="absolute w-32 h-32" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-orange-500"
                          strokeDasharray={`${(caloriePercent / 100) * (2 * Math.PI * 54)} ${2 * Math.PI * 54}`}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <div className="text-center z-10">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{remainingCalories}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Stats */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Base Goal</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{calorieGoal}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Food</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{dailyCalories}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Exercise</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">238</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Macros Breakdown */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
                    <div className="text-2xl">🌾</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Carbs</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{totalCarbs}g</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 text-center">
                    <div className="text-2xl">🍗</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Protein</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{totalProtein}g</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3 text-center">
                    <div className="text-2xl">🧈</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Fat</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{totalFats}g</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                    <div className="text-2xl">🥬</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Fiber</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">38g</div>
                  </div>
                </div>

                <Separator />

                {/* Daily Report */}
                <div className="space-y-3">
                  <Card className="hover-elevate cursor-pointer" onClick={handleDietaryReport} data-testid="button-dietary-report">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍔</span>
                        <span className="font-semibold">My Daily Dietary Report</span>
                      </div>
                      <Button variant="ghost" size="icon" data-testid="button-report-icon">
                        <TrendingDown className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dietary Report Dialog */}
      <Dialog open={showDietaryReport} onOpenChange={setShowDietaryReport}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-green-600" />
              Daily Dietary Report - {currentDayName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Daily Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Calories</p>
                    <p className="text-2xl font-bold text-orange-600">{totalCalories} Cal</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Daily Goal</p>
                    <p className="text-2xl font-bold text-orange-600">{calorieGoal} Cal</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Protein</p>
                    <p className="text-lg font-bold">{totalProtein}g</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                    <p className="text-lg font-bold">{totalCarbs}g</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Fats</p>
                    <p className="text-lg font-bold">{totalFats}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meal Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dayMeals.map((meal: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">{meal.calories} Cal</p>
                        <p className="text-xs text-muted-foreground">
                          P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Towards Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Towards Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Daily Total vs Goal</span>
                    <span className="text-sm font-medium">{Math.round(caloriePercent)}%</span>
                  </div>
                  <Progress value={caloriePercent} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Target: {calorieGoal} Cal/day • Current: {dailyCalories} Cal/day
                  </p>
                </div>
                
                {remainingCalories > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">On Track!</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You're {remainingCalories} calories below your daily goal. Great job!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">Above Goal</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        You're {Math.abs(remainingCalories)} calories over your daily goal.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
