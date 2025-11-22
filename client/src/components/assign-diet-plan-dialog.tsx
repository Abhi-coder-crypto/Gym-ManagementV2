import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AssignDietPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dietPlan: {
    id: number;
    name: string;
    calories: number;
    type: string;
    meals: number;
  } | null;
}

export function AssignDietPlanDialog({ open, onOpenChange, dietPlan }: AssignDietPlanDialogProps) {
  const { toast } = useToast();
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: packages = [] } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const packageById = packages.reduce((map: Record<string, any>, pkg) => {
    map[pkg._id] = pkg;
    return map;
  }, {});

  const clientsWithPackages = clients.map(client => {
    const packageId = typeof client.packageId === 'object' ? client.packageId._id : client.packageId;
    const pkg = packageById[packageId];
    return {
      ...client,
      packageData: pkg || null
    };
  });

  const assignMutation = useMutation({
    mutationFn: async (clientIds: string[]) => {
      if (!dietPlan) return;
      
      const assignments = clientIds.map(clientId => 
        apiRequest('POST', '/api/diet-plans', {
          clientId,
          name: dietPlan.name,
          targetCalories: dietPlan.calories,
          protein: Math.round(dietPlan.calories * 0.30 / 4),
          carbs: Math.round(dietPlan.calories * 0.40 / 4),
          fats: Math.round(dietPlan.calories * 0.30 / 9),
          meals: generateMeals(dietPlan.calories, dietPlan.meals, dietPlan.type),
          mealsPerDay: dietPlan.meals,
        })
      );
      
      return Promise.all(assignments);
    },
    onSuccess: (_, clientIds) => {
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plans'] });
      toast({
        title: "Success",
        description: `Diet plan assigned to ${clientIds.length} client(s)`,
      });
      setSelectedClients(new Set());
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign diet plan",
        variant: "destructive",
      });
    },
  });

  const toggleClient = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleAssign = () => {
    if (selectedClients.size === 0) {
      toast({
        title: "No clients selected",
        description: "Please select at least one client",
        variant: "destructive",
      });
      return;
    }
    assignMutation.mutate(Array.from(selectedClients));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Assign Diet Plan</DialogTitle>
          <DialogDescription>
            Select clients to assign "{dietPlan?.name}" ({dietPlan?.calories} cal, {dietPlan?.type})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-2">
              {clientsWithPackages.length > 0 ? (
                clientsWithPackages.map((client) => {
                  const hasPackageAccess = client.packageData?.dietPlanAccess || false;
                  const packageName = client.packageData?.name || 'No Package';
                  const isDisabled = !hasPackageAccess;
                  
                  return (
                    <div
                      key={client._id}
                      className={`flex items-center gap-3 p-3 rounded-md ${!isDisabled ? 'hover-elevate cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                      onClick={() => !isDisabled && toggleClient(client._id)}
                      data-testid={`client-${client._id}`}
                    >
                      <Checkbox
                        checked={selectedClients.has(client._id)}
                        disabled={isDisabled}
                        onCheckedChange={() => !isDisabled && toggleClient(client._id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{packageName}</Badge>
                        {!hasPackageAccess && (
                          <Badge variant="outline" className="bg-muted">No Diet Access</Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No clients found
                </p>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedClients.size} client(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssign} 
                disabled={assignMutation.isPending}
                data-testid="button-confirm-assign"
              >
                {assignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Assign to Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateMeals(calories: number, mealCount: number, type: string) {
  const caloriesPerMeal = Math.round(calories / mealCount);
  const mealTimes = ["7:00 AM", "10:00 AM", "12:00 PM", "3:00 PM", "7:00 PM"];
  const mealTypes = ["Breakfast", "Snack", "Lunch", "Snack", "Dinner"];
  const mealNames: Record<string, string[]> = {
    "Low Carb": ["Scrambled Eggs & Avocado", "Almonds & Cheese", "Grilled Chicken Salad", "Greek Yogurt", "Salmon with Vegetables"],
    "High Protein": ["Protein Pancakes", "Protein Shake", "Turkey & Quinoa Bowl", "Cottage Cheese & Berries", "Lean Beef with Broccoli"],
    "Balanced": ["Oatmeal with Berries", "Apple & Peanut Butter", "Chicken & Rice", "Greek Yogurt & Fruit", "Fish with Sweet Potato"],
    "Ketogenic": ["Keto Breakfast Bowl", "Keto Fat Bombs", "Keto Chicken Salad", "Keto Snack Plate", "Keto Dinner"],
    "Vegan": ["Tofu Scramble", "Hummus & Veggies", "Lentil Buddha Bowl", "Mixed Nuts", "Vegan Stir Fry"],
  };

  const names = mealNames[type] || mealNames["Balanced"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Generate meals for 7 days (1 week) with specified meals per day
  const meals = [];
  for (let day = 0; day < 7; day++) {
    for (let meal = 0; meal < mealCount; meal++) {
      meals.push({
        day: days[day],
        dayIndex: day,
        time: mealTimes[meal % mealTimes.length],
        type: mealTypes[meal % mealTypes.length],
        name: names[meal % names.length],
        calories: caloriesPerMeal,
        protein: Math.round(caloriesPerMeal * 0.30 / 4),
        carbs: Math.round(caloriesPerMeal * 0.40 / 4),
        fats: Math.round(caloriesPerMeal * 0.30 / 9),
      });
    }
  }
  
  return meals;
}
