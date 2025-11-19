import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

// Force rebuild - filters should display
export function MealDatabaseList() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("all");

  const { data: meals = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/meals'],
  });

  const filteredMeals = meals.filter((meal) => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMealType = mealTypeFilter === "all" || meal.mealType === mealTypeFilter;
    return matchesSearch && matchesMealType;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-meals"
            />
          </div>
          <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-meal-type-filter">
              <SelectValue placeholder="Meal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {MEAL_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button data-testid="button-create-meal">
          <Plus className="h-4 w-4 mr-2" />
          Create Meal
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading meals...</div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No meals found</p>
          <p className="text-sm text-muted-foreground mt-2">Create Your First Meal</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeals.map((meal) => (
            <Card key={meal._id} data-testid={`card-meal-${meal._id}`}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{meal.name}</span>
                  <Badge variant="outline">{meal.mealType}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calories:</span>
                    <span className="font-semibold">{meal.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protein:</span>
                    <span className="font-semibold">{meal.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carbs:</span>
                    <span className="font-semibold">{meal.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fats:</span>
                    <span className="font-semibold">{meal.fats}g</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
