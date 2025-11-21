import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Video as VideoIcon, Users, TrendingUp, Activity, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Client, LiveSession, Video as VideoType } from "@shared/schema";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrainerDashboard() {
  const style = {
    "--sidebar-width": "16rem",
  };

  const { data: user } = useQuery<any>({
    queryKey: ['/api/me']
  });

  const trainerId = user?.userId;

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/trainers', trainerId, 'clients'],
    enabled: !!trainerId
  });

  const { data: sessions = [] } = useQuery<LiveSession[]>({
    queryKey: ['/api/trainers', trainerId, 'sessions'],
    enabled: !!trainerId
  });

  const { data: videos = [] } = useQuery<VideoType[]>({
    queryKey: ['/api/videos'],
    enabled: !!trainerId
  });

  const upcomingSessions = sessions.filter((s: LiveSession) => 
    s.status === 'upcoming' && new Date(s.scheduledAt) > new Date()
  );

  const thisWeekSessions = sessions.filter((s: LiveSession) => {
    const sessionDate = new Date(s.scheduledAt);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return sessionDate >= now && sessionDate <= weekFromNow;
  });

  const activeClients = clients;

  const clientGrowthData = [
    { month: 'Jan', clients: 8 },
    { month: 'Feb', clients: 12 },
    { month: 'Mar', clients: 15 },
    { month: 'Apr', clients: 18 },
    { month: 'May', clients: activeClients.length || 20 },
  ];

  const sessionData = [
    { day: 'Mon', sessions: 3 },
    { day: 'Tue', sessions: 5 },
    { day: 'Wed', sessions: 4 },
    { day: 'Thu', sessions: 6 },
    { day: 'Fri', sessions: 5 },
    { day: 'Sat', sessions: 7 },
    { day: 'Sun', sessions: 2 },
  ];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <TrainerSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">
                Trainer Dashboard
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Clients</CardTitle>
                    <Users className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{clients?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active clients under your supervision</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                    <Calendar className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{sessions?.filter((s: any) => s.status === 'upcoming')?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">{thisWeekSessions.length} sessions this week</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Videos Created</CardTitle>
                    <VideoIcon className="h-5 w-5 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{videos.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Training videos uploaded</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile</CardTitle>
                    <User className="h-5 w-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{user?.name || 'Trainer'}</div>
                    <p className="text-xs text-muted-foreground mt-1">Strength & Conditioning</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <CardTitle>Client Growth</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={clientGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="clients" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <CardTitle>Weekly Sessions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={sessionData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="sessions" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <CardTitle>Recent Clients</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeClients.slice(0, 5).map((client: Client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize">{client.goal || 'Weight Loss'}</p>
                          <p className="text-xs text-muted-foreground">Client</p>
                        </div>
                      </div>
                    ))}
                    {activeClients.length === 0 && (
                      <p className="text-center text-muted-foreground py-6">No clients assigned yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
