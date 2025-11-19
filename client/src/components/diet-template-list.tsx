import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Copy, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AssignPlanDialog } from "@/components/assign-plan-dialog";

const DIET_CATEGORIES = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain (Bulk)' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'keto', label: 'Ketogenic' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
];

export function DietTemplateList() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { data: templates = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/diet-plan-templates'],
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/diet-plans/${id}/clone`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-templates'] });
      toast({ title: "Success", description: "Diet template cloned successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/diet-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-templates'] });
      toast({ title: "Success", description: "Diet template deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diet templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-diet-templates"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-diet-category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DIET_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button data-testid="button-create-diet-template">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading diet templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No diet templates found</p>
          <p className="text-sm text-muted-foreground mt-2">Create Your First Diet Template</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template._id} data-testid={`card-diet-template-${template._id}`}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{template.name}</span>
                  {template.category && (
                    <Badge variant="default">
                      {DIET_CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Calories</span>
                    <span className="font-semibold">{template.targetCalories || 0} cal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assigned</span>
                    <span className="font-semibold">{template.assignedCount || 0} times</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      setSelectedPlan(template);
                      setAssignDialogOpen(true);
                    }}
                    data-testid={`button-assign-${template._id}`}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => cloneMutation.mutate(template._id)}
                    data-testid={`button-clone-${template._id}`}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Clone
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid={`button-edit-${template._id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(template._id)}
                    data-testid={`button-delete-${template._id}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AssignPlanDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        plan={selectedPlan}
      />
    </div>
  );
}
