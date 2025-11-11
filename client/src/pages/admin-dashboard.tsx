import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StatCard } from "@/components/stat-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Users, Activity, DollarSign, TrendingUp, UserPlus, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const style = {
    "--sidebar-width": "16rem",
  };

  const recentClients = [
    { name: "John Doe", package: "Elite", joinedDate: "Nov 10, 2025", status: "active" },
    { name: "Sarah Smith", package: "Premium", joinedDate: "Nov 9, 2025", status: "active" },
    { name: "Mike Johnson", package: "Basic", joinedDate: "Nov 8, 2025", status: "active" },
    { name: "Emily Brown", package: "Premium", joinedDate: "Nov 7, 2025", status: "inactive" },
  ];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">
                Dashboard
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Clients"
                  value={156}
                  icon={Users}
                  trend="+12% from last month"
                  trendUp={true}
                />
                <StatCard
                  title="Active Users"
                  value={142}
                  icon={Activity}
                  trend="+8% from last month"
                  trendUp={true}
                />
                <StatCard
                  title="Monthly Revenue"
                  value="$8,420"
                  icon={DollarSign}
                  trend="+23% from last month"
                  trendUp={true}
                />
                <StatCard
                  title="Growth Rate"
                  value="18%"
                  icon={TrendingUp}
                  trend="Steady increase"
                  trendUp={true}
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Recent Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentClients.map((client, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4 p-3 rounded-md hover-elevate"
                          data-testid={`row-client-${index}`}
                        >
                          <div className="flex-1">
                            <p className="font-semibold" data-testid="text-client-name">
                              {client.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Joined {client.joinedDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" data-testid="badge-package">
                              {client.package}
                            </Badge>
                            <Badge
                              className={
                                client.status === "active"
                                  ? "bg-chart-3"
                                  : "bg-muted"
                              }
                              data-testid="badge-status"
                            >
                              {client.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      data-testid="button-view-all-clients"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      View All Clients
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" data-testid="button-add-video">
                      <Video className="h-4 w-4 mr-2" />
                      Add New Video
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="button-schedule-session">
                      <Activity className="h-4 w-4 mr-2" />
                      Schedule Live Session
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="button-create-diet">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Create Diet Plan
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="button-view-analytics">
                      <Users className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
