import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export default function AdminClients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    packageId: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
  });

  const style = {
    "--sidebar-width": "16rem",
  };

  const { data: clients = [], isLoading: clientsLoading } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: packages = [] } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/clients', 'POST', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Client added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/clients/${id}`, 'PATCH', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setEditingClient(null);
      resetForm();
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    },
  });

  const toggleClientStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest(`/api/clients/${id}/status`, 'PATCH', { status });
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Success",
        description: `Client status updated to ${variables.status}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client status",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      packageId: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      goal: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      packageId: formData.packageId || undefined,
      email: formData.email || undefined,
      gender: formData.gender || undefined,
      goal: formData.goal || undefined,
    };

    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient._id, data: submitData });
    } else {
      createClientMutation.mutate(submitData);
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      packageId: client.packageId?._id || "",
      age: client.age?.toString() || "",
      gender: client.gender || "",
      height: client.height?.toString() || "",
      weight: client.weight?.toString() || "",
      goal: client.goal || "",
    });
  };

  const filteredClients = clients.filter((client: any) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b min-h-[56px]">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                Client Management
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>

                <Dialog open={isAddDialogOpen || !!editingClient} onOpenChange={(open) => {
                  if (!open) {
                    setIsAddDialogOpen(false);
                    setEditingClient(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-client">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                      <DialogDescription>
                        {editingClient ? "Update client information" : "Enter client details to add them to the system"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            data-testid="input-client-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            disabled={!!editingClient}
                            data-testid="input-client-phone"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            data-testid="input-client-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="package">Package</Label>
                          <Select
                            value={formData.packageId}
                            onValueChange={(value) => setFormData({ ...formData, packageId: value })}
                          >
                            <SelectTrigger data-testid="select-package">
                              <SelectValue placeholder="Select package" />
                            </SelectTrigger>
                            <SelectContent>
                              {packages.map((pkg: any) => (
                                <SelectItem key={pkg._id} value={pkg._id}>
                                  {pkg.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            data-testid="input-client-age"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData({ ...formData, gender: value })}
                          >
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            step="0.1"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            data-testid="input-client-height"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            data-testid="input-client-weight"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal">Goal</Label>
                        <Select
                          value={formData.goal}
                          onValueChange={(value) => setFormData({ ...formData, goal: value })}
                        >
                          <SelectTrigger data-testid="select-goal">
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lose">Weight Loss</SelectItem>
                            <SelectItem value="maintain">Maintain Weight</SelectItem>
                            <SelectItem value="gain">Muscle Gain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={createClientMutation.isPending || updateClientMutation.isPending}
                          data-testid="button-save-client"
                        >
                          {editingClient ? "Update Client" : "Add Client"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Loading clients...
                        </TableCell>
                      </TableRow>
                    ) : filteredClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No clients found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((client: any) => (
                        <TableRow key={client._id} data-testid={`row-client-${client._id}`}>
                          <TableCell className="font-semibold" data-testid="text-client-name">
                            {client.name}
                          </TableCell>
                          <TableCell data-testid="text-client-phone">{client.phone}</TableCell>
                          <TableCell data-testid="text-client-email">
                            {client.email || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            {client.packageId ? (
                              <Badge variant="outline" data-testid="badge-package">
                                {client.packageId.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No package</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {client.goal ? (
                              <Badge variant="secondary" data-testid="badge-goal">
                                {client.goal === 'lose' ? 'Weight Loss' : client.goal === 'gain' ? 'Muscle Gain' : 'Maintain'}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={client.status === 'active' ? 'default' : client.status === 'inactive' ? 'secondary' : 'outline'}
                              data-testid={`badge-status-${client._id}`}
                            >
                              {client.status || 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(client)}
                                data-testid={`button-edit-${client._id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={client.status === 'active' ? 'ghost' : 'default'}
                                size="sm"
                                onClick={() => toggleClientStatusMutation.mutate({
                                  id: client._id,
                                  status: client.status === 'active' ? 'inactive' : 'active'
                                })}
                                data-testid={`button-toggle-status-${client._id}`}
                              >
                                {client.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
