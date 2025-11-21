import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssignSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTitle: string;
}

export function AssignSessionDialog({ open, onOpenChange, sessionId, sessionTitle }: AssignSessionDialogProps) {
  const { toast } = useToast();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [step, setStep] = useState<'trainer' | 'clients'>('trainer');

  const { data: trainers = [], isLoading: isLoadingTrainers } = useQuery<any[]>({
    queryKey: ['/api/trainers'],
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<any[]>({
    queryKey: ['/api/sessions/eligible-clients'],
    queryFn: async () => {
      const response = await fetch('/api/sessions/eligible-clients');
      if (!response.ok) {
        throw new Error('Failed to fetch eligible clients');
      }
      return response.json();
    },
  });

  const { data: currentAssignments = {} } = useQuery<any>({
    queryKey: ['/api/sessions', sessionId, 'assignments'],
    enabled: open && !!sessionId,
  });

  const { data: sessionClients = [], isLoading: isLoadingAssigned } = useQuery<any[]>({
    queryKey: ['/api/sessions', sessionId, 'clients'],
    enabled: open && !!sessionId,
  });

  const assignTrainerMutation = useMutation({
    mutationFn: async (trainerId: string) => {
      return await apiRequest('POST', `/api/sessions/${sessionId}/assign-trainer`, { trainerId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: "Success",
        description: `Session assigned to trainer`,
      });
      setStep('clients');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign session to trainer",
        variant: "destructive",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (clientIds: string[]) => {
      return await apiRequest('POST', `/api/sessions/${sessionId}/assign`, { clientIds });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId, 'clients'] });
      
      const message = data.errors && data.errors.length > 0
        ? `Session assigned to ${data.assigned} client(s). ${data.errors.length} already assigned.`
        : `Session assigned to ${data.assigned} client(s)`;
      
      toast({
        title: "Success",
        description: message,
      });
      setSelectedClients([]);
      setSelectedTrainer(null);
      setStep('trainer');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign session",
        variant: "destructive",
      });
    },
  });

  const handleToggleClient = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSubmitTrainer = () => {
    if (!selectedTrainer) {
      toast({
        title: "Error",
        description: "Please select a trainer",
        variant: "destructive",
      });
      return;
    }
    assignTrainerMutation.mutate(selectedTrainer);
  };

  const handleSubmitClients = () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one client",
        variant: "destructive",
      });
      return;
    }
    assignMutation.mutate(selectedClients);
  };

  const handleSkipTrainer = () => {
    // Skip trainer selection and go straight to clients
    setStep('clients');
  };

  // sessionClients is already an array of full client objects returned by getSessionClients
  const assignedClientIds = new Set(sessionClients.map((client: any) => client._id));

  const getPackageBadge = (packageType: string) => {
    switch (packageType) {
      case 'basic':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700">Basic</Badge>;
      case 'premium':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-700">Premium</Badge>;
      case 'elite':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-700">Elite</Badge>;
      default:
        return null;
    }
  };

  // Reset selected clients when dialog is opened with a new session
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedClients([]);
      setSelectedTrainer(null);
      setStep('trainer');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-assign-session">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {step === 'trainer' ? 'Assign Trainer to Session' : 'Assign Clients to Session'}
          </DialogTitle>
          <DialogDescription>
            {step === 'trainer' 
              ? `Select a trainer to manage "${sessionTitle}"`
              : `Assign "${sessionTitle}" to one or more clients`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'trainer' && currentAssignments?.trainerId && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Currently assigned to:</strong> {trainers.find((t: any) => t._id === currentAssignments.trainerId)?.name || 'Trainer'}
              </p>
            </div>
          )}
          {step === 'trainer' ? (
            // TRAINER SELECTION STEP
            isLoadingTrainers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {trainers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No trainers found
                    </div>
                  ) : (
                    trainers.map((trainer: any) => (
                      <div
                        key={trainer._id}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate"
                        data-testid={`trainer-item-${trainer._id}`}
                      >
                        <Checkbox
                          id={`trainer-${trainer._id}`}
                          checked={selectedTrainer === trainer._id}
                          onCheckedChange={() => setSelectedTrainer(selectedTrainer === trainer._id ? null : trainer._id)}
                          data-testid={`checkbox-trainer-${trainer._id}`}
                        />
                        <Label
                          htmlFor={`trainer-${trainer._id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">{trainer.name || trainer.email}</div>
                            <div className="text-sm text-muted-foreground">{trainer.email}</div>
                          </div>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )
          ) : (
            // CLIENTS SELECTION STEP
            <>
              {sessionClients.length > 0 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Already assigned:</strong> {sessionClients.map((c: any) => c.name).join(', ')}
                  </p>
                </div>
              )}
              {isLoadingClients || isLoadingAssigned ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {clients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No clients found
                      </div>
                    ) : (
                    clients.map((client) => (
                      <div
                        key={client._id}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate"
                        data-testid={`client-item-${client._id}`}
                      >
                        <Checkbox
                          id={`client-${client._id}`}
                          checked={selectedClients.includes(client._id)}
                          onCheckedChange={() => handleToggleClient(client._id)}
                          disabled={assignedClientIds.has(client._id)}
                          data-testid={`checkbox-client-${client._id}`}
                        />
                        <Label
                          htmlFor={`client-${client._id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPackageBadge(client.package)}
                              {assignedClientIds.has(client._id) && (
                                <Badge variant="secondary">Already Assigned</Badge>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))
                  )}
                  </div>
                </ScrollArea>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => step === 'clients' ? setStep('trainer') : onOpenChange(false)}
            data-testid="button-cancel-assign"
          >
            {step === 'clients' ? 'Back' : 'Cancel'}
          </Button>
          {step === 'trainer' && (
            <Button
              variant="outline"
              onClick={handleSkipTrainer}
              data-testid="button-skip-trainer"
            >
              Skip Trainer
            </Button>
          )}
          <Button
            onClick={step === 'trainer' ? handleSubmitTrainer : handleSubmitClients}
            disabled={step === 'trainer' ? assignTrainerMutation.isPending : assignMutation.isPending}
            data-testid="button-submit-assign"
          >
            {step === 'trainer'
              ? assignTrainerMutation.isPending ? "Assigning..." : "Next: Select Clients"
              : assignMutation.isPending ? "Assigning..." : "Assign Clients"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
