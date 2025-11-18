import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar as CalendarIcon, Users, Clock, Trash2, UserPlus, List, Video } from "lucide-react";
import { format } from "date-fns";

const SESSION_TYPES = ["Power Yoga", "HIIT", "Cardio Bootcamp", "Strength Building", "Flexibility"];
const SESSION_STATUSES = ["upcoming", "live", "completed", "cancelled"];

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sessionType: z.string().min(1, "Session type is required"),
  scheduledAt: z.string().min(1, "Date and time are required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  trainerName: z.string().optional(),
  maxCapacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  meetingLink: z.string().optional(),
  status: z.string().default("upcoming"),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  recurringDays: z.array(z.string()).optional(),
  recurringEndDate: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

export default function AdminSessions() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      description: "",
      sessionType: "",
      scheduledAt: "",
      duration: 60,
      trainerName: "",
      maxCapacity: 15,
      meetingLink: "",
      status: "upcoming",
      isRecurring: false,
    },
  });

  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ["/api/clients"],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionFormData) => {
      if (data.isRecurring && data.recurringPattern && data.recurringDays && data.recurringEndDate) {
        return await apiRequest("POST", "/api/sessions/recurring", {
          baseData: {
            ...data,
            scheduledAt: new Date(data.scheduledAt),
            currentCapacity: 0,
          },
          pattern: data.recurringPattern,
          days: data.recurringDays,
          endDate: data.recurringEndDate,
        });
      } else {
        return await apiRequest("POST", "/api/sessions", {
          ...data,
          scheduledAt: new Date(data.scheduledAt),
          currentCapacity: 0,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Success", description: "Session created successfully" });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create session", variant: "destructive" });
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Success", description: "Session cancelled successfully" });
      setIsManageDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to cancel session", variant: "destructive" });
    },
  });

  const bookSessionMutation = useMutation({
    mutationFn: async ({ sessionId, clientId }: { sessionId: string; clientId: string }) => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/book`, { clientId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Success", description: "Client booked successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to book session", variant: "destructive" });
    },
  });

  const createZoomMeetingMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/create-zoom`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Success", description: "Zoom meeting created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create Zoom meeting", variant: "destructive" });
    },
  });

  const onSubmit = (data: SessionFormData) => {
    createSessionMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "live": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "completed": return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case "cancelled": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const style = { "--sidebar-width": "16rem" };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Live Session Management</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted-foreground">Schedule and manage live training sessions with bookings and waitlists</p>
                <div className="flex items-center gap-2">
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "calendar")}>
                    <TabsList>
                      <TabsTrigger value="list" data-testid="button-view-list">
                        <List className="h-4 w-4 mr-2" />
                        List View
                      </TabsTrigger>
                      <TabsTrigger value="calendar" data-testid="button-view-calendar">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Calendar View
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-session">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              </div>

              {viewMode === "calendar" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Session Calendar</CardTitle>
                    <CardDescription>View sessions by date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      data-testid="calendar-session-view"
                    />
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                    No sessions found. Create your first session to get started.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map((session: any) => (
                    <Card key={session._id} className="hover-elevate" data-testid={`card-session-${session._id}`}>
                      <CardHeader className="gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="line-clamp-1">{session.title}</CardTitle>
                            <CardDescription className="line-clamp-1">{session.sessionType}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(session.scheduledAt), "MMM dd, yyyy 'at' h:mm a")}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {session.duration} minutes
                          </div>
                          {session.trainerName && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <UserPlus className="h-4 w-4" />
                              {session.trainerName}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {session.currentCapacity}/{session.maxCapacity} participants
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!session.joinUrl && session.status === "upcoming" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => createZoomMeetingMutation.mutate(session._id)}
                              data-testid={`button-create-zoom-${session._id}`}
                              disabled={createZoomMeetingMutation.isPending}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Create Zoom
                            </Button>
                          )}
                          {session.joinUrl && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              Zoom Ready
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedSession(session);
                              setIsManageDialogOpen(true);
                            }}
                            data-testid={`button-manage-${session._id}`}
                          >
                            Manage
                          </Button>
                          {session.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => cancelSessionMutation.mutate(session._id)}
                              data-testid={`button-cancel-${session._id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-session">
          <DialogHeader>
            <DialogTitle>Schedule New Session</DialogTitle>
            <DialogDescription>Create a new live training session with all details</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Power Yoga Session" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-session-type">
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SESSION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} data-testid="input-scheduled-at" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trainerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sarah Johnson" {...field} data-testid="input-trainer-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-max-capacity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Session description..." {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://meet.example.com/session" {...field} data-testid="input-meeting-link" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Recurring Session</FormLabel>
                      <CardDescription>Create a series of recurring sessions</CardDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-recurring" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("isRecurring") && (
                <div className="space-y-4 rounded-md border p-4">
                  <FormField
                    control={form.control}
                    name="recurringPattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence Pattern</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-recurring-pattern">
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurringEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-recurring-end-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSessionMutation.isPending} data-testid="button-submit-session">
                  {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-manage-session">
          <DialogHeader>
            <DialogTitle>Manage Session: {selectedSession?.title}</DialogTitle>
            <DialogDescription>View bookings and manage participants</DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedSession.sessionType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedSession.status)}>{selectedSession.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium">{selectedSession.currentCapacity}/{selectedSession.maxCapacity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trainer</p>
                  <p className="font-medium">{selectedSession.trainerName || "Not assigned"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Reserve Spot for Client</h4>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(clientId) => {
                      bookSessionMutation.mutate({
                        sessionId: selectedSession._id,
                        clientId,
                      });
                    }}
                  >
                    <SelectTrigger data-testid="select-client-booking">
                      <SelectValue placeholder="Select client to book" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.name} ({client.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
