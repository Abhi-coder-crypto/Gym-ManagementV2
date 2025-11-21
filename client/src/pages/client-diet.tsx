import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  Plus
} from "lucide-react";

export default function ClientDiet() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string | null>(null);
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: dietPlans } = useQuery<any[]>({
    queryKey: ['/api/diet-plans', clientId],
    enabled: !!clientId,
  });

  const currentPlan = dietPlans?.[0];

  // Meal schedule with better structure
  const mealSchedule = [
    {
      time: "7:00 AM",
      type: "Breakfast",
      icon: "🥞",
      meal: currentPlan?.meals?.breakfast || {
        name: "Whole wheat pancakes with maple syrup",
        calories: 502,
        protein: 15,
        carbs: 65,
        fats: 12,
      }
    },
    {
      time: "12:30 PM",
      type: "Lunch",
      icon: "🥗",
      meal: currentPlan?.meals?.lunch || {
        name: "Grilled Chicken Caesar Salad",
        calories: 879,
        protein: 45,
        carbs: 40,
        fats: 18,
      }
    },
    {
      time: "7:00 PM",
      type: "Dinner",
      icon: "🍲",
      meal: currentPlan?.meals?.dinner || {
        name: "Baked salmon with quinoa and steamed broccoli",
        calories: 628,
        protein: 50,
        carbs: 55,
        fats: 20,
      }
    },
    {
      time: "4:00 PM",
      type: "Snacks",
      icon: "🌽",
      meal: {
        name: "Corn chips with salsa",
        calories: 502,
        protein: 8,
        carbs: 65,
        fats: 12,
      }
    }
  ];

  // Macro calculations
  const totalCalories = mealSchedule.reduce((sum, item) => sum + item.meal.calories, 0);
  const totalProtein = mealSchedule.reduce((sum, item) => sum + item.meal.protein, 0);
  const totalCarbs = mealSchedule.reduce((sum, item) => sum + item.meal.carbs, 0);
  const totalFats = mealSchedule.reduce((sum, item) => sum + item.meal.fats, 0);
  
  // Goal values (can be from diet plan or defaults)
  const calorieGoal = currentPlan?.targetCalories || 2513;
  const remainingCalories = calorieGoal - totalCalories;
  const caloriePercent = (totalCalories / calorieGoal) * 100;

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
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="diet" data-testid="tab-diet">
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Diet
            </TabsTrigger>
            <TabsTrigger value="macros" data-testid="tab-macros">
              <Zap className="h-4 w-4 mr-2" />
              Macros
            </TabsTrigger>
            <TabsTrigger value="fitness" data-testid="tab-fitness">
              <Dumbbell className="h-4 w-4 mr-2" />
              Fitness
            </TabsTrigger>
          </TabsList>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-6">
            {/* Header Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-2 mb-6">
                  <div className="w-full h-2 bg-green-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your personalized meal plan is ready</h2>
                </div>

                {/* Total Calories Card */}
                <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">Total Calories</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalCalories} Cal</span>
                </div>

                {/* Meals List */}
                <div className="space-y-3">
                  {mealSchedule.map((meal, idx) => (
                    <Card key={idx} className="border-0 bg-white dark:bg-slate-800 hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{meal.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{meal.type}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{meal.meal.name}</p>
                          </div>
                          <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0">
                            {meal.meal.calories}Cal
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Button */}
            <Button className="w-full bg-green-500 hover:bg-green-600 h-12 text-lg font-semibold">
              Next
            </Button>
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
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{totalCalories}</div>
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

                {/* Daily Report & Breakfast */}
                <div className="space-y-3">
                  <Card className="hover-elevate">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍔</span>
                        <span className="font-semibold">My Daily Dietary Report</span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <TrendingDown className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="hover-elevate">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥣</span>
                        <span className="font-semibold">Breakfast</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                          <span className="text-green-500 text-lg">🤖</span>
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Exercise</CardTitle>
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0">
                  Burned 238 Cal
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Daily Steps */}
                <Card className="hover-elevate bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-0">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">👟</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Daily steps</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">5,299 steps</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">238 Cal</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weight In */}
                <Card className="hover-elevate bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-0">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">⚖️</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Weight in</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">88.5 kg</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Record
                    </Button>
                  </CardContent>
                </Card>

                {/* Water Intake */}
                <Card className="hover-elevate">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Water</h4>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{waterIntake * 250} ml</span>
                    </div>

                    {/* Water Glasses Grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: waterGoal }).map((_, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (idx === waterIntake) {
                              handleWaterIntake();
                            }
                          }}
                          className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                            idx < waterIntake
                              ? 'bg-blue-500 dark:bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          {idx < waterIntake ? (
                            <Droplet className="h-4 w-4 text-white" />
                          ) : idx === waterIntake ? (
                            <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetWater}
                      className="w-full"
                    >
                      Reset
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
