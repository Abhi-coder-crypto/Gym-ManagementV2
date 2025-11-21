import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Target, TrendingUp, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Client } from "@shared/schema";
import { useState } from "react";
import { hasFeature, getRemainingDays, FEATURE_LABELS } from "@/lib/featureAccess";

export default function TrainerClients() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const style = {
    "--sidebar-width": "16rem",
  };

  const { data: user } = useQuery<any>({
    queryKey: ['/api/me']
  });

  const trainerId = user?.userId;

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/trainers', trainerId, 'clients'],
    enabled: !!trainerId
  });

  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <TrainerSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">
                My Clients
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{clients.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {clients.filter((c: Client) => c.status === 'active').length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {clients.filter((c: Client) => {
                        const created = new Date(c.createdAt);
                        const now = new Date();
                        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                      }).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-center text-muted-foreground py-8">Loading clients...</p>
                  ) : filteredClients.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No clients found</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredClients.map((client: Client) => (
                        <Card key={client._id} className="hover-elevate">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                {client.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">{client.name}</h3>
                                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                    {client.status}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1.5 text-sm">
                                  {client.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-3.5 w-3.5" />
                                      <span className="truncate">{client.email}</span>
                                    </div>
                                  )}
                                  {client.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="h-3.5 w-3.5" />
                                      <span>{client.phone}</span>
                                    </div>
                                  )}
                                  {client.goal && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Target className="h-3.5 w-3.5" />
                                      <span className="capitalize">{client.goal}</span>
                                    </div>
                                  )}
                                  {client.fitnessLevel && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <TrendingUp className="h-3.5 w-3.5" />
                                      <span className="capitalize">{client.fitnessLevel}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 mt-3">
                                  <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-${client._id}`}>
                                    View Details
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1" data-testid={`button-message-${client._id}`}>
                                    Message
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

                    {/* Package & Subscription Info */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-t pt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Package</p>
                        <p className="font-semibold text-sm">{(client as any).packageName || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expires In</p>
                        <p className={`font-semibold text-sm ${getRemainingDays((client as any).subscriptionEndDate) <= 7 ? 'text-yellow-600' : ''}`}>
                          {getRemainingDays((client as any).subscriptionEndDate)} days
                        </p>
                      </div>
                    </div>

                    {/* Subscription Alert */}
                    {getRemainingDays((client as any).subscriptionEndDate) <= 7 && getRemainingDays((client as any).subscriptionEndDate) > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800 mt-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">Expiring soon</p>
                      </div>
                    )}

                    {getRemainingDays((client as any).subscriptionEndDate) <= 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800 mt-2">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <p className="text-xs text-red-800 dark:text-red-200">Subscription expired</p>
                      </div>
                    )}

                    {/* Available Features */}
                    <div className="py-2 border-t pt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Available Features</p>
                      <div className="space-y-1">
                        {['workouts', 'diet', 'recorded_videos', 'personalized_diet', 'weekly_checkins', 'one_on_one_calls', 'habit_coaching', 'performance_tracking'].map((feature) => {
                          const available = hasFeature((client as any).packageName, feature);
                          return (
                            <div key={feature} className="flex items-center gap-1 text-xs">
                              {available ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-muted-foreground">✗</span>
                              )}
                              <span className={available ? '' : 'text-muted-foreground'}>{FEATURE_LABELS[feature] || feature}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
