import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function PlanAssignments() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: assignments = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/diet-plan-assignments'],
  });

  const filteredAssignments = assignments.filter((assignment) => {
    return assignment.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-assignments"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading assignments...</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No assignments found</p>
          <p className="text-sm text-muted-foreground mt-2">Assign plans to clients to see them here</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment._id} data-testid={`card-assignment-${assignment._id}`}>
              <CardHeader>
                <CardTitle className="text-base">{assignment.clientName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diet Plan:</span>
                  <Badge variant="outline">{assignment.dietPlanName || 'None'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workout Plan:</span>
                  <Badge variant="outline">{assignment.workoutPlanName || 'None'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
