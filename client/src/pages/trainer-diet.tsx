import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UtensilsCrossed, Search, Dumbbell, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DietTemplateList } from "@/components/diet-template-list";
import { MealDatabaseList } from "@/components/meal-database-list";
import { WorkoutPlanTemplates } from "@/components/workout-plan-templates";
import { PlanAssignments } from "@/components/plan-assignments";

export default function TrainerDiet() {
  const style = { "--sidebar-width": "16rem" };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <TrainerSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                Diet Plan Management
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="templates" data-testid="tab-diet-templates">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Diet Templates
                  </TabsTrigger>
                  <TabsTrigger value="meals" data-testid="tab-meal-database">
                    <Search className="h-4 w-4 mr-2" />
                    Meal Database
                  </TabsTrigger>
                  <TabsTrigger value="workouts" data-testid="tab-workout-plans">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Workout Plans
                  </TabsTrigger>
                  <TabsTrigger value="assignments" data-testid="tab-assignments">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assignments
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                  <DietTemplateList />
                </TabsContent>

                <TabsContent value="meals" className="space-y-4">
                  <MealDatabaseList />
                </TabsContent>

                <TabsContent value="workouts" className="space-y-4">
                  <WorkoutPlanTemplates />
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                  <PlanAssignments />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
