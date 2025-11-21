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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

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
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [step, setStep] = useState<'package' | 'trainer' | 'clients'>('package');

  const { data: packages = [], isLoading: isLoadingPackages } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const { data: trainers = [], isLoading: isLoadingTrainers } = useQuery<any[]>({
    queryKey: ['/api/trainers'],
  });

  const { data: allClients = [], isLoading: isLoadingAllClients } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: currentAssignments = {} } = useQuery<any>({
    queryKey: ['/api/sessions', sessionId, 'assignments'],
    enabled: open && !!sessionId,
  });

  const { data: sessionClients = [], isLoading: isLoadingAssigned } = useQuery<any[]>({
    queryKey: ['/api/sessions', sessionId, 'clients'],
    enabled: open && !!sessionId,
  });

  // Filter clients by selected package and eligibility
  const filteredClients = selectedPackage
    ? allClients.filter(client => {
        // Only show Fit Plus, Pro Transformation, Elite Athlete (not Fit Basics)
        if (!client.packageId) return false;
        const pkg = typeof client.packageId === 'object' ? client.packageId : null;
        const packageName = pkg?.name || '';
        
        if (packageName === 'Fit Basics') return false; // Exclude Fit Basics
        return client.packageId._id === selectedPackage || client.packageId === selectedPackage;
      })
    : [];

  const assignedClientIds = new Set(sessionClients.map((client: any) => client._id));

  const assignTrainerMutation = useMutation({
    mutationFn: async (trainerId: string) => {
      return await apiRequest('POST', `/api/sessions/${sessionId}/assign-trainer`, { trainerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: "Success",
        description: "Trainer assigned successfully",
      });
      setStep('clients');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign trainer",
        variant: "destructive",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (clientIds: string[]) => {
      return await apiRequest('POST', `/api/sessions/${sessionId}/assign`, { clientIds, packageId: selectedPackage });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId, 'clients'] });
      
      const message = data.errors && data.errors.length > 0
        ? `Batch assigned to ${data.assigned} client(s). ${data.errors.length} already assigned.`
        : `Batch assigned to ${data.assigned} client(s)`;
      
      toast({
        title: "Success",
        description: message,
      });
      setSelectedClients([]);
      setSelectedPackage("");
      setSelectedTrainer(null);
      setStep('package');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign batch",
        variant: "destructive",
      });
    },
  });

  const handleToggleClient = (clientId: string) => {
    if (selectedClients.length >= 10 && !selectedClients.includes(clientId)) {
      toast({
        title: "Batch Full",
        description: "Maximum 10 clients per batch. Create another session for more clients.",
        variant: "destructive",
      });
      return;
    }
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
    setStep('clients');
  };

  const getPackageName = (packageId: string) => {
    const pkg = packages.find(p => p._id === packageId);
    return pkg?.name || '';
  };

  const getPackageBadgeColor = (packageName: string) => {
    switch (packageName) {
      case 'Fit Plus':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'Pro Transformation':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'Elite Athlete':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedClients([]);
      setSelectedPackage("");
      setSelectedTrainer(null);
      setStep('package');
    }
    onOpenChange(newOpen);
  };

  // Get live session eligible packages only
  const eligiblePackages = packages.filter(pkg => 
    pkg.name && !pkg.name.includes('Fit Basics') && 
    (pkg.liveGroupTrainingAccess === true || (pkg.liveSessionsPerMonth && pkg.liveSessionsPerMonth > 0))
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-assign-session">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {step === 'package' ? 'Select Package Batch' : step === 'trainer' ? 'Assign Trainer' : 'Assign Clients'}
          </DialogTitle>
          <DialogDescription>
            {step === 'package' 
              ? `Choose package for "${sessionTitle}"`
              : step === 'trainer'
              ? `Select a trainer to manage "${sessionTitle}"`
              : `Assign up to 10 "${sessionTitle}" clients from selected package`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'package' && (
            <div className="space-y-3">
              {isLoadingPackages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {eligiblePackages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No eligible packages found
                    </div>
                  ) : (
                    eligiblePackages.map((pkg: any) => (
                      <Card
                        key={pkg._id}
                        className={`p-4 cursor-pointer hover-elevate border-2 transition-colors ${
                          selectedPackage === pkg._id
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent'
                        }`}
                        onClick={() => setSelectedPackage(pkg._id)}
                        data-testid={`package-option-${pkg._id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{pkg.name}</div>
                            <div className="text-sm text-muted-foreground">₹{pkg.price}/month</div>
                          </div>
                          <Checkbox
                            checked={selectedPackage === pkg._id}
                            onCheckedChange={() => setSelectedPackage(pkg._id)}
                            data-testid={`checkbox-package-${pkg._id}`}
                          />
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'trainer' && (
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
                      <Label htmlFor={`trainer-${trainer._id}`} className="flex-1 cursor-pointer">
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
          )}

          {step === 'clients' && (
            <>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium">
                  <Badge className={getPackageBadgeColor(getPackageName(selectedPackage))}>
                    {getPackageName(selectedPackage)}
                  </Badge>
                  <span className="ml-2">Batch - {selectedClients.length}/10 selected</span>
                </p>
              </div>

              {sessionClients.length > 0 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Already assigned:</strong> {sessionClients.map((c: any) => c.name).join(', ')}
                  </p>
                </div>
              )}

              {isLoadingAllClients || isLoadingAssigned ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {filteredClients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No eligible clients in this package
                      </div>
                    ) : (
                      filteredClients.map((client) => (
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
                          <Label htmlFor={`client-${client._id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground">{client.email}</div>
                              </div>
                              {assignedClientIds.has(client._id) && (
                                <Badge variant="secondary">Already Assigned</Badge>
                              )}
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
            onClick={() => {
              if (step === 'clients') setStep('trainer');
              else if (step === 'trainer') setStep('package');
              else onOpenChange(false);
            }}
            data-testid="button-cancel-assign"
          >
            {step === 'package' ? 'Cancel' : 'Back'}
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
            onClick={() => {
              if (step === 'package') setStep('trainer');
              else if (step === 'trainer') handleSubmitTrainer();
              else handleSubmitClients();
            }}
            disabled={
              step === 'package' ? !selectedPackage : 
              step === 'trainer' ? assignTrainerMutation.isPending : 
              assignMutation.isPending
            }
            data-testid="button-submit-assign"
          >
            {step === 'package'
              ? 'Next: Select Trainer'
              : step === 'trainer'
              ? assignTrainerMutation.isPending ? 'Assigning...' : 'Next: Select Clients'
              : assignMutation.isPending ? 'Assigning...' : `Assign Batch (${selectedClients.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
