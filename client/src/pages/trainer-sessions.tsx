import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Video as VideoIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

// MongoDB LiveSession interface (matches actual backend data)
interface LiveSession {
  _id: string;
  title: string;
  description?: string;
  sessionType: string;
  scheduledAt: string | Date;
  duration: number;
  meetingLink?: string;
  trainerName?: string;
  maxCapacity: number;
  currentCapacity: number;
  status: string;
  joinUrl?: string;
  startUrl?: string;
}

export default function TrainerSessions() {
  const style = {
    "--sidebar-width": "16rem",
  };

  const { data: user } = useQuery<any>({
    queryKey: ['/api/me']
  });

  const trainerId = user?.userId;

  const { data: sessions = [], isLoading } = useQuery<LiveSession[]>({
    queryKey: ['/api/trainers', trainerId, 'sessions'],
    enabled: !!trainerId
  });

  const upcomingSessions = sessions.filter((s: LiveSession) => 
    s.status === 'upcoming' && new Date(s.scheduledAt) > new Date()
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastSessions = sessions.filter((s: LiveSession) => 
    s.status === 'completed' || new Date(s.scheduledAt) <= new Date()
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <TrainerSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">
                Live Sessions
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{upcomingSessions.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pastSessions.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{sessions.length}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No upcoming sessions</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingSessions.map((session: LiveSession) => (
                        <Card key={session._id} className="hover-elevate">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="h-10 w-10 rounded-md bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white">
                                    <Calendar className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{session.title}</h3>
                                    <p className="text-sm text-muted-foreground">{session.description}</p>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{format(new Date(session.scheduledAt), 'PPp')}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{session.currentCapacity || 0}/{session.maxCapacity || 10} participants</span>
                                  </div>
                                  <Badge variant="default">
                                    {session.sessionType || 'Group'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <Button data-testid={`button-join-${session._id}`}>
                                <VideoIcon className="h-4 w-4 mr-2" />
                                Start Session
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {pastSessions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No past sessions</p>
                  ) : (
                    <div className="space-y-2">
                      {pastSessions.slice(0, 10).map((session: LiveSession) => (
                        <div key={session._id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                          <div className="flex-1">
                            <p className="font-medium">{session.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(session.scheduledAt), 'PPp')}
                            </p>
                          </div>
                          <Badge variant="secondary">{session.status}</Badge>
                        </div>
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
