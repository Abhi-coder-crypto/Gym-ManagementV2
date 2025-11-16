import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateDietPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: any;
}

export function CreateDietPlanModal({ open, onOpenChange, plan }: CreateDietPlanModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Balanced");
  const [targetCalories, setTargetCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [isTemplate, setIsTemplate] = useState(true);

  useEffect(() => {
    if (plan) {
      setName(plan.name || "");
      setDescription(plan.description || "");
      setCategory(plan.category || "Balanced");
      setTargetCalories(String(plan.targetCalories || ""));
      setProtein(String(plan.protein || ""));
      setCarbs(String(plan.carbs || ""));
      setFats(String(plan.fats || ""));
      setIsTemplate(plan.isTemplate ?? true);
    } else {
      resetForm();
    }
  }, [plan, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("Balanced");
    setTargetCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setIsTemplate(true);
  };

  const autoCalculateMacros = () => {
    const calories = parseFloat(targetCalories);
    if (!calories) return;

    const macroDistributions: Record<string, { protein: number; carbs: number; fats: number }> = {
      "Balanced": { protein: 30, carbs: 40, fats: 30 },
      "High Protein": { protein: 40, carbs: 30, fats: 30 },
      "Low Carb": { protein: 35, carbs: 25, fats: 40 },
      "Ketogenic": { protein: 25, carbs: 5, fats: 70 },
      "Vegan": { protein: 25, carbs: 50, fats: 25 },
      "Paleo": { protein: 35, carbs: 30, fats: 35 },
      "Mediterranean": { protein: 25, carbs: 45, fats: 30 },
    };

    const distribution = macroDistributions[category] || macroDistributions["Balanced"];
    
    const proteinGrams = Math.round((calories * (distribution.protein / 100)) / 4);
    const carbsGrams = Math.round((calories * (distribution.carbs / 100)) / 4);
    const fatsGrams = Math.round((calories * (distribution.fats / 100)) / 9);

    setProtein(String(proteinGrams));
    setCarbs(String(carbsGrams));
    setFats(String(fatsGrams));
  };

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (plan) {
        return apiRequest('PATCH', `/api/diet-plans/${plan._id}`, data);
      }
      return apiRequest('POST', '/api/diet-plans', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-templates'] });
      toast({
        title: "Success",
        description: plan ? "Diet plan updated successfully" : "Diet plan created successfully",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save diet plan",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !targetCalories) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name,
      description,
      category,
      targetCalories: parseFloat(targetCalories),
      protein: protein ? parseFloat(protein) : undefined,
      carbs: carbs ? parseFloat(carbs) : undefined,
      fats: fats ? parseFloat(fats) : undefined,
      isTemplate,
      meals: plan?.meals || {
        breakfast: { name: "Custom Breakfast", calories: 0, protein: 0, carbs: 0, fats: 0 },
        lunch: { name: "Custom Lunch", calories: 0, protein: 0, carbs: 0, fats: 0 },
        dinner: { name: "Custom Dinner", calories: 0, protein: 0, carbs: 0, fats: 0 },
      },
    };

    createOrUpdateMutation.mutate(data);
  };

  const categories = [
    "Low Carb",
    "High Protein",
    "Ketogenic",
    "Vegan",
    "Balanced",
    "Paleo",
    "Mediterranean",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {plan ? "Edit Diet Plan" : "Create Diet Plan Template"}
          </DialogTitle>
          <DialogDescription>
            {plan ? "Update the diet plan details below" : "Create a new reusable diet plan template"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weight Loss Plan"
                data-testid="input-plan-name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the plan..."
                data-testid="input-plan-description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="calories">Target Calories *</Label>
              <div className="flex gap-2">
                <Input
                  id="calories"
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(e.target.value)}
                  placeholder="2000"
                  data-testid="input-calories"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={autoCalculateMacros}
                  data-testid="button-auto-calculate"
                >
                  Auto Calculate Macros
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="150"
                  data-testid="input-protein"
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="200"
                  data-testid="input-carbs"
                />
              </div>
              <div>
                <Label htmlFor="fats">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  placeholder="65"
                  data-testid="input-fats"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <Label htmlFor="isTemplate">Save as Template</Label>
                <p className="text-sm text-muted-foreground">
                  Templates can be reused and assigned to multiple clients
                </p>
              </div>
              <Switch
                id="isTemplate"
                checked={isTemplate}
                onCheckedChange={setIsTemplate}
                data-testid="switch-is-template"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOrUpdateMutation.isPending}
              data-testid="button-save-plan"
            >
              {createOrUpdateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {plan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
