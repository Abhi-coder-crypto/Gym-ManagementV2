import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Filter,
  X,
  Eye,
  UserCheck,
  UserX,
  UserPlus,
  Activity,
  Calendar,
  Package,
  FileText,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminClientsEnhanced() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("joinDate");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
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
    status: "active",
    adminNotes: "",
  });

  const style = {
    "--sidebar-width": "16rem",
  };

  const { data: clients = [], isLoading: clientsLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/clients/search', searchQuery, statusFilter, packageFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (packageFilter && packageFilter !== 'all') params.append('packageId', packageFilter);
      if (sortBy) params.append('sortBy', sortBy);
      
      const response = await fetch(`/api/admin/clients/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: packages = [] } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const { data: clientActivity, isLoading: activityLoading } = useQuery<any>({
    queryKey: ['/api/admin/clients', viewingClient?._id, 'activity'],
    enabled: !!viewingClient,
    queryFn: async () => {
      if (!viewingClient) return null;
      const response = await fetch(`/api/admin/clients/${viewingClient._id}/activity`);
      if (!response.ok) {
        throw new Error('Failed to fetch client activity');
      }
      return response.json();
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/clients', 'POST', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients/search'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients/search'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setEditingClient(null);
      setViewingClient(null);
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients/search'] });
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

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/clients/${id}`, 'DELETE');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients/search'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ clientIds, updates }: { clientIds: string[]; updates: any }) => {
      const response = await apiRequest('/api/admin/clients/bulk-update', 'POST', {
        clientIds,
        updates,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients/search'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setSelectedClients(new Set());
      setIsBulkActionsOpen(false);
      toast({
        title: "Success",
        description: "Clients updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update clients",
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
      status: "active",
      adminNotes: "",
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
      status: formData.status || 'active',
      adminNotes: formData.adminNotes || undefined,
    };

    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient._id, data: submitData });
    } else {
      createClientMutation.mutate(submitData);
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    let packageId = "";
    if (client.packageId) {
      if (typeof client.packageId === 'object' && '_id' in client.packageId) {
        packageId = String(client.packageId._id);
      } else if (typeof client.packageId === 'object') {
        packageId = client.packageId.toString();
      } else {
        packageId = String(client.packageId);
      }
    }
    setFormData({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      packageId: packageId,
      age: client.age?.toString() || "",
      gender: client.gender || "",
      height: client.height?.toString() || "",
      weight: client.weight?.toString() || "",
      goal: client.goal || "",
      status: client.status || "active",
      adminNotes: client.adminNotes || "",
    });
  };

  const handleToggleSelect = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleSelectAll = () => {
    const clientsArray = Array.isArray(clients) ? clients : [];
    if (selectedClients.size === clientsArray.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(clientsArray.map((c: any) => c._id)));
    }
  };

  const handleBulkStatusUpdate = (newStatus: string) => {
    bulkUpdateMutation.mutate({
      clientIds: Array.from(selectedClients),
      updates: { status: newStatus },
    });
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/clients/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clients.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Client data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export client data",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      active: { variant: "default" as const, icon: UserCheck, label: "Active" },
      inactive: { variant: "secondary" as const, icon: UserX, label: "Inactive" },
      pending: { variant: "outline" as const, icon: UserPlus, label: "Pending" },
    };
    const config = variants[status] || variants.active;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1" data-testid={`badge-status-${status}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const clientsArray = Array.isArray(clients) ? clients : [];
  const totalClients = clientsArray.length;
  const activeCount = clientsArray.filter((c: any) => c.status === 'active').length;
  const inactiveCount = clientsArray.filter((c: any) => c.status === 'inactive').length;
  const pendingCount = clientsArray.filter((c: any) => c.status === 'pending').length;

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">
                Client Management
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-clients">{totalClients}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-active-clients">{activeCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                    <UserX className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-inactive-clients">{inactiveCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <UserPlus className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600" data-testid="text-pending-clients">{pendingCount}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={packageFilter} onValueChange={setPackageFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-package-filter">
                    <Package className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packages</SelectItem>
                    {packages.map((pkg: any) => (
                      <SelectItem key={pkg._id} value={pkg._id}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joinDate">Join Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="lastActivity">Last Activity</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2 ml-auto">
                  {selectedClients.size > 0 && (
                    <Dialog open={isBulkActionsOpen} onOpenChange={setIsBulkActionsOpen}>
                      <Button
                        variant="outline"
                        onClick={() => setIsBulkActionsOpen(true)}
                        data-testid="button-bulk-actions"
                      >
                        Bulk Actions ({selectedClients.size})
                      </Button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Actions</DialogTitle>
                          <DialogDescription>
                            Update {selectedClients.size} selected client{selectedClients.size !== 1 ? 's' : ''}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Update Status</Label>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => handleBulkStatusUpdate('active')}
                                data-testid="button-bulk-active"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Mark Active
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleBulkStatusUpdate('inactive')}
                                data-testid="button-bulk-inactive"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Mark Inactive
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={handleExport}
                    data-testid="button-export"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>

                  <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-client">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </div>

              {/* Clients Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedClients.size === clientsArray.length && clientsArray.length > 0}
                            onCheckedChange={handleSelectAll}
                            data-testid="checkbox-select-all"
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            Loading clients...
                          </TableCell>
                        </TableRow>
                      ) : clientsArray.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No clients found
                          </TableCell>
                        </TableRow>
                      ) : (
                        clientsArray.map((client: any) => (
                          <TableRow key={client._id} data-testid={`row-client-${client._id}`}>
                            <TableCell>
                              <Checkbox
                                checked={selectedClients.has(client._id)}
                                onCheckedChange={() => handleToggleSelect(client._id)}
                                data-testid={`checkbox-client-${client._id}`}
                              />
                            </TableCell>
                            <TableCell className="font-semibold" data-testid="text-client-name">
                              {client.name}
                            </TableCell>
                            <TableCell data-testid="text-client-phone">{client.phone}</TableCell>
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
                              {getStatusBadge(client.status || 'active')}
                            </TableCell>
                            <TableCell data-testid="text-join-date">
                              {new Date(client.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewingClient(client)}
                                  data-testid={`button-view-${client._id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(client)}
                                  data-testid={`button-edit-${client._id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {client.status === 'active' ? 'Active' : 'Inactive'}
                                  </span>
                                  <Switch
                                    checked={client.status === 'active'}
                                    onCheckedChange={(checked) => {
                                      toggleClientStatusMutation.mutate({
                                        id: client._id,
                                        status: checked ? 'active' : 'inactive'
                                      });
                                    }}
                                    disabled={toggleClientStatusMutation.isPending}
                                    data-testid={`switch-status-${client._id}`}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Add/Edit Client Dialog */}
      <Dialog open={isAddDialogOpen || !!editingClient} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingClient(null);
          resetForm();
        }
      }}>
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

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                placeholder="Private notes about this client..."
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                rows={3}
                data-testid="textarea-admin-notes"
              />
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

      {/* View Client Details Dialog */}
      <Dialog open={!!viewingClient} onOpenChange={(open) => {
        if (!open) setViewingClient(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4">
              <span>{viewingClient?.name}</span>
              {viewingClient && getStatusBadge(viewingClient.status || 'active')}
            </DialogTitle>
            <DialogDescription>Complete client profile and activity history</DialogDescription>
          </DialogHeader>

          {viewingClient && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Admin Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{viewingClient.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{viewingClient.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Package</Label>
                    <p className="font-medium">{viewingClient.packageId?.name || 'No package'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Join Date</Label>
                    <p className="font-medium">{new Date(viewingClient.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Age</Label>
                    <p className="font-medium">{viewingClient.age || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Gender</Label>
                    <p className="font-medium">{viewingClient.gender || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Height</Label>
                    <p className="font-medium">{viewingClient.height ? `${viewingClient.height} cm` : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Weight</Label>
                    <p className="font-medium">{viewingClient.weight ? `${viewingClient.weight} kg` : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Goal</Label>
                    <p className="font-medium">{viewingClient.goal || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Activity</Label>
                    <p className="font-medium">
                      {viewingClient.lastActivityDate 
                        ? new Date(viewingClient.lastActivityDate).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-4">
                {activityLoading ? (
                  <p className="text-center text-muted-foreground">Loading activity...</p>
                ) : clientActivity ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{clientActivity.totalWorkouts}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Live Sessions</CardTitle>
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{clientActivity.totalLiveSessions}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Workout Plans</CardTitle>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{clientActivity.assignedWorkoutPlans}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Diet Plans</CardTitle>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{clientActivity.assignedDietPlans}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {clientActivity.recentWorkouts.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Recent Workouts</h4>
                        <div className="space-y-2">
                          {clientActivity.recentWorkouts.slice(0, 5).map((workout: any, index: number) => (
                            <Card key={index}>
                              <CardContent className="flex items-center justify-between p-4">
                                <div>
                                  <p className="font-medium">{workout.workoutName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(workout.completedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{workout.duration} min</p>
                                  <p className="text-sm text-muted-foreground">{workout.caloriesBurned} cal</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No activity data available</p>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={viewingClient.adminNotes || ''}
                    onChange={(e) => {
                      setViewingClient({
                        ...viewingClient,
                        adminNotes: e.target.value,
                      });
                    }}
                    placeholder="Add private notes about this client..."
                    rows={10}
                    data-testid="textarea-view-admin-notes"
                  />
                  <Button 
                    onClick={() => {
                      updateClientMutation.mutate({
                        id: viewingClient._id,
                        data: { adminNotes: viewingClient.adminNotes },
                      });
                    }}
                    data-testid="button-save-notes"
                  >
                    Save Notes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
