import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { UtensilsCrossed, Users, BookTemplate, Plus, ChefHat, Copy, Edit, Trash2, Dumbbell } from "lucide-react";
import { AssignPlanDialog } from "@/components/assign-plan-dialog";
import { CreateDietPlanModal } from "@/components/create-diet-plan-modal";
import { MealBuilderModal } from "@/components/meal-builder-modal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TrainerDiet() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [createMealOpen, setCreateMealOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const id = localStorage.getItem('trainerId');
    if (id) {
      setTrainerId(id);
    }
  }, []);

  const { data: dietPlans = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/trainers/${trainerId}/diet-plans`],
    enabled: !!trainerId,
  });

  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ['/api/diet-plan-templates'],
  });

  const { data: meals = [] } = useQuery<any[]>({
    queryKey: ['/api/meals'],
  });

  const { data: workoutTemplates = [] } = useQuery<any[]>({
    queryKey: ['/api/workout-plans'],
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest('DELETE', `/api/diet-plans/${planId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-templates'] });
      toast({
        title: "Success",
        description: "Diet plan deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete diet plan",
        variant: "destructive",
      });
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      return apiRequest('DELETE', `/api/meals/${mealId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      toast({
        title: "Success",
        description: "Meal deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete meal",
        variant: "destructive",
      });
    },
  });

  const clonePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest('POST', `/api/diet-plans/${planId}/clone`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-templates'] });
      toast({
        title: "Success",
        description: "Diet plan cloned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clone diet plan",
        variant: "destructive",
      });
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      return apiRequest('DELETE', `/api/workout-plans/${workoutId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workout-plans'] });
      toast({
        title: "Success",
        description: "Workout plan deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete workout plan",
        variant: "destructive",
      });
    },
  });

  const handleAssignPlan = (plan: any) => {
    setSelectedPlan(plan);
    setAssignDialogOpen(true);
  };

  const handleEditMeal = (meal: any) => {
    setEditingMeal(meal);
    setCreateMealOpen(true);
  };

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <TrainerSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">
                Diet, Meals & Workout Management
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Tabs defaultValue="assignments" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="assignments" data-testid="tab-assignments">
                    <Users className="h-4 w-4 mr-2" />
                    Assignments
                  </TabsTrigger>
                  <TabsTrigger value="diet-templates" data-testid="tab-diet-templates">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Diet Templates
                  </TabsTrigger>
                  <TabsTrigger value="workout-templates" data-testid="tab-workout-templates">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Workout Templates
                  </TabsTrigger>
                  <TabsTrigger value="meals" data-testid="tab-meals">
                    <ChefHat className="h-4 w-4 mr-2" />
                    Meals Library
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      View and manage diet plans assigned to your clients
                    </p>
                    <Badge className="bg-chart-2" data-testid="badge-total-assignments">
                      {dietPlans.length} Assigned Plans
                    </Badge>
                  </div>

                  {isLoading ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Loading diet plans...
                      </CardContent>
                    </Card>
                  ) : dietPlans.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        No diet plans assigned yet
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {dietPlans.map((plan) => (
                        <Card key={plan._id} data-testid={`card-plan-${plan._id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="font-display" data-testid="text-plan-name">
                                  {plan.name}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  Assigned to: {plan.clientName || 'Unknown Client'}
                                </CardDescription>
                              </div>
                              <Badge className="bg-chart-1" data-testid="badge-calories">
                                {plan.dailyCalories || plan.targetCalories} cal
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Category:</span>
                              <Badge variant="outline" data-testid="badge-category">
                                {plan.category}
                              </Badge>
                            </div>
                            {plan.status && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge 
                                  variant={plan.status === 'active' ? 'default' : 'secondary'}
                                  data-testid="badge-status"
                                >
                                  {plan.status}
                                </Badge>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {plan.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="diet-templates" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      Create and manage diet plan templates shared with admin
                    </p>
                    <Button onClick={() => setCreatePlanOpen(true)} data-testid="button-create-template">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>

                  {templates.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <BookTemplate className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">No templates available</p>
                        <Button onClick={() => setCreatePlanOpen(true)} data-testid="button-create-first-template">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Template
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {templates.map((template) => (
                        <Card key={template._id} data-testid={`card-template-${template._id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="font-display" data-testid="text-template-name">
                                  {template.name}
                                </CardTitle>
                              </div>
                              <Badge className="bg-chart-1" data-testid="badge-template-calories">
                                {template.dailyCalories || template.targetCalories} cal
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Category:</span>
                              <Badge variant="outline" data-testid="badge-template-category">
                                {template.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                className="flex-1" 
                                variant="outline"
                                onClick={() => handleAssignPlan(template)}
                                data-testid="button-assign-template"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Assign
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => clonePlanMutation.mutate(template._id)}
                                data-testid="button-clone-template"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => deletePlanMutation.mutate(template._id)}
                                data-testid="button-delete-template"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="workout-templates" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      Create and manage workout plan templates shared with admin
                    </p>
                    <Button 
                      onClick={() => toast({
                        title: "Coming Soon",
                        description: "Workout plan builder coming soon",
                      })}
                      data-testid="button-create-workout"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workout Plan
                    </Button>
                  </div>

                  {workoutTemplates.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">No workout templates available</p>
                        <Button 
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "Workout plan builder coming soon",
                          })}
                          data-testid="button-create-first-workout"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Workout Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {workoutTemplates.map((workout) => (
                        <Card key={workout._id} data-testid={`card-workout-${workout._id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="font-display" data-testid="text-workout-name">
                                  {workout.name}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {workout.difficulty || 'General'}
                                </CardDescription>
                              </div>
                              {workout.duration && (
                                <Badge variant="outline" data-testid="badge-workout-duration">
                                  {workout.duration} weeks
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {workout.description || workout.goal}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => toast({
                                  title: "Coming Soon",
                                  description: "Workout assignment feature coming soon",
                                })}
                                data-testid="button-assign-workout"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Assign
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteWorkoutMutation.mutate(workout._id)}
                                data-testid="button-delete-workout"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="meals" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      Build a shared meal library for creating diet plans
                    </p>
                    <Button 
                      onClick={() => {
                        setEditingMeal(null);
                        setCreateMealOpen(true);
                      }} 
                      data-testid="button-create-meal"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Meal
                    </Button>
                  </div>

                  {meals.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">No meals in library</p>
                        <Button 
                          onClick={() => {
                            setEditingMeal(null);
                            setCreateMealOpen(true);
                          }} 
                          data-testid="button-create-first-meal"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Meal
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {meals.map((meal) => (
                        <Card key={meal._id} data-testid={`card-meal-${meal._id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-base font-display" data-testid="text-meal-name">
                                  {meal.name}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {meal.mealType}
                                </CardDescription>
                              </div>
                              <Badge className="bg-chart-1" data-testid="badge-meal-calories">
                                {meal.calories} cal
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Protein:</span>
                                <p className="font-medium">{meal.protein}g</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>
                                <p className="font-medium">{meal.carbs}g</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fat:</span>
                                <p className="font-medium">{meal.fat}g</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEditMeal(meal)}
                                data-testid="button-edit-meal"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteMealMutation.mutate(meal._id)}
                                data-testid="button-delete-meal"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <AssignPlanDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        plan={selectedPlan}
      />

      <CreateDietPlanModal
        open={createPlanOpen}
        onOpenChange={setCreatePlanOpen}
      />

      <MealBuilderModal
        open={createMealOpen}
        onOpenChange={setCreateMealOpen}
        meal={editingMeal}
      />
    </SidebarProvider>
  );
}
