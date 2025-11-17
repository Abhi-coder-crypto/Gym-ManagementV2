import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  Download, 
  Plus, 
  FileText, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentStats {
  totalRevenue: number;
  paymentsDue: number;
  paymentsOverdue: number;
  pendingCount: number;
  overdueCount: number;
  completedCount: number;
  growthRate: number;
  lastMonthRevenue: number;
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  clientCount: number;
  paymentCount: number;
}

interface Payment {
  _id: string;
  clientId: { name: string; phone: string; email?: string };
  amount: number;
  currency: string;
  status: string;
  invoiceNumber: string;
  paymentMethod: string;
  packageId?: { name: string; price: number };
  packageName?: string;
  billingDate: string;
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: { _id: string; name: string; phone: string; email?: string };
  packageId?: { _id: string; name: string; price: number };
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  total: number;
}

interface Refund {
  _id: string;
  paymentId: any;
  clientId: { name: string; phone: string };
  amount: number;
  reason: string;
  status: string;
  requestedBy: string;
  requestedAt: string;
  processedAt?: string;
}

export default function AdminRevenueEnhanced() {
  const style = { "--sidebar-width": "16rem" };
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentFilter, setPaymentFilter] = useState("all");
  
  const [invoiceData, setInvoiceData] = useState({
    clientId: "",
    packageId: "",
    amount: "",
    dueDate: "",
    notes: "",
  });

  const [refundData, setRefundData] = useState({
    paymentId: "",
    amount: "",
    reason: "",
    refundMethod: "original",
    notes: "",
  });

  const { data: stats, isLoading: statsLoading } = useQuery<PaymentStats>({
    queryKey: ['/api/payments/stats'],
  });

  const { data: monthlyTrends = [], isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ['/api/payments/monthly-trends'],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: paymentFilter !== 'all' ? ['/api/payments', { status: paymentFilter }] : ['/api/payments'],
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: packages = [] as any[] } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: refunds = [] } = useQuery<Refund[]>({
    queryKey: ['/api/refunds'],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const selectedClient = clients.find(c => c._id === data.clientId);
      const selectedPackage = packages.find(p => p._id === data.packageId);
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: data.clientId,
          packageId: data.packageId,
          amount: parseFloat(data.amount),
          currency: 'USD',
          issueDate: new Date().toISOString(),
          dueDate: data.dueDate,
          items: [{
            description: selectedPackage?.name || 'Package Subscription',
            quantity: 1,
            unitPrice: parseFloat(data.amount),
            total: parseFloat(data.amount),
          }],
          subtotal: parseFloat(data.amount),
          total: parseFloat(data.amount),
          notes: data.notes,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create invoice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setIsInvoiceDialogOpen(false);
      setInvoiceData({ clientId: "", packageId: "", amount: "", dueDate: "", notes: "" });
      toast({
        title: "Invoice created",
        description: "The invoice has been created successfully.",
      });
    },
  });

  const createRefundMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: data.paymentId,
          clientId: selectedPayment?.clientId,
          amount: parseFloat(data.amount),
          currency: 'USD',
          reason: data.reason,
          requestedBy: 'Admin',
          refundMethod: data.refundMethod,
          notes: data.notes,
          status: 'pending',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create refund');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refunds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      setIsRefundDialogOpen(false);
      setSelectedPayment(null);
      setRefundData({ paymentId: "", amount: "", reason: "", refundMethod: "original", notes: "" });
      toast({
        title: "Refund initiated",
        description: "The refund request has been created successfully.",
      });
    },
  });

  const sendInvoiceEmailMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest('POST', `/api/invoices/${invoiceId}/send`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Invoice Email Sent",
        description: "The invoice has been sent to the client's email successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Send Invoice",
        description: error.message || "Could not send invoice email. Please try again.",
      });
    },
  });

  const handleExportReport = () => {
    const csvData = payments.map(p => ({
      'Invoice Number': p.invoiceNumber,
      'Client': p.clientId.name,
      'Package': p.packageName || p.packageId?.name || 'N/A',
      'Amount': `$${p.amount}`,
      'Status': p.status,
      'Billing Date': new Date(p.billingDate).toLocaleDateString(),
      'Payment Method': p.paymentMethod,
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ];
    
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "The revenue report has been downloaded successfully.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, icon: CheckCircle, className: "bg-green-500" },
      pending: { variant: "secondary" as const, icon: Clock, className: "bg-yellow-500" },
      overdue: { variant: "destructive" as const, icon: AlertCircle, className: "bg-red-500" },
      failed: { variant: "destructive" as const, icon: XCircle, className: "bg-red-600" },
      refunded: { variant: "outline" as const, icon: RefreshCw, className: "bg-blue-500" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={status === 'completed' ? 'bg-green-500 hover:bg-green-600' : status === 'overdue' ? 'bg-red-500 hover:bg-red-600' : status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const avgPerClient = clients.length > 0 && stats ? Math.round(stats.totalRevenue / clients.length) : 0;

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Revenue & Payment Management</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Comprehensive revenue tracking, payment management, and financial analytics</p>
                <Button onClick={handleExportReport} data-testid="button-export-report">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Revenue" 
                  value={`$${stats?.totalRevenue.toLocaleString() || '0'}`} 
                  icon={DollarSign} 
                  trend={`${stats?.growthRate || 0}% from last month`}
                  trendUp={stats ? stats.growthRate > 0 : false}
                />
                <StatCard 
                  title="Payments Due" 
                  value={`$${stats?.paymentsDue.toLocaleString() || '0'}`} 
                  icon={Clock} 
                  trend={`${stats?.pendingCount || 0} pending payments`}
                  trendUp={false}
                />
                <StatCard 
                  title="Overdue" 
                  value={`$${stats?.paymentsOverdue.toLocaleString() || '0'}`} 
                  icon={AlertCircle} 
                  trend={`${stats?.overdueCount || 0} overdue payments`}
                  trendUp={false}
                />
                <StatCard 
                  title="Avg per Client" 
                  value={`$${avgPerClient}`} 
                  icon={Users} 
                  trend={`${stats?.completedCount || 0} completed`}
                  trendUp={true}
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="refunds">Refunds</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display">Monthly Revenue Trends</CardTitle>
                      <CardDescription>Revenue and client activity over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                            <Bar yAxisId="right" dataKey="clientCount" fill="#82ca9d" name="Clients" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-display">Revenue by Package</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {packages.map((pkg: any) => {
                          const pkgPayments = payments.filter(p => 
                            p.status === 'completed' && 
                            (p.packageId?._id === pkg._id || p.packageName === pkg.name)
                          );
                          const revenue = pkgPayments.reduce((sum, p) => sum + p.amount, 0);
                          const totalRevenue = stats?.totalRevenue || 1;
                          
                          return (
                            <div key={pkg._id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{pkg.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  ${revenue.toLocaleString()} ({pkgPayments.length} payments)
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    pkg.name === "Basic" ? "bg-chart-1" :
                                    pkg.name === "Premium" ? "bg-chart-2" : "bg-chart-3"
                                  }`}
                                  style={{ width: `${(revenue / totalRevenue) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="font-display">Quick Actions</CardTitle>
                        <CardDescription>Manage payments and invoices</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          className="w-full" 
                          onClick={() => setIsInvoiceDialogOpen(true)}
                          data-testid="button-create-invoice"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Invoice
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setActiveTab("payments")}
                          data-testid="button-view-payments"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View All Payments
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setActiveTab("refunds")}
                          data-testid="button-view-refunds"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Manage Refunds
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant={paymentFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setPaymentFilter('all')}
                        data-testid="filter-all"
                      >
                        All
                      </Button>
                      <Button 
                        variant={paymentFilter === 'pending' ? 'default' : 'outline'}
                        onClick={() => setPaymentFilter('pending')}
                        data-testid="filter-pending"
                      >
                        Pending
                      </Button>
                      <Button 
                        variant={paymentFilter === 'completed' ? 'default' : 'outline'}
                        onClick={() => setPaymentFilter('completed')}
                        data-testid="filter-completed"
                      >
                        Completed
                      </Button>
                      <Button 
                        variant={paymentFilter === 'overdue' ? 'default' : 'outline'}
                        onClick={() => setPaymentFilter('overdue')}
                        data-testid="filter-overdue"
                      >
                        Overdue
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display">Payment History</CardTitle>
                      <CardDescription>{payments.length} total payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {payments.map((payment) => (
                          <div
                            key={payment._id}
                            className="flex items-center justify-between p-4 rounded-md border"
                            data-testid={`payment-${payment.invoiceNumber}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{payment.clientId.name}</p>
                                <span className="text-sm text-muted-foreground">#{payment.invoiceNumber}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {new Date(payment.billingDate).toLocaleDateString()}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {payment.packageName || payment.packageId?.name || payment.paymentMethod}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-lg">${payment.amount.toLocaleString()}</span>
                              {getStatusBadge(payment.status)}
                              {payment.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setRefundData({
                                      ...refundData,
                                      paymentId: payment._id,
                                      amount: payment.amount.toString(),
                                    });
                                    setIsRefundDialogOpen(true);
                                  }}
                                  data-testid={`button-refund-${payment.invoiceNumber}`}
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Refund
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">All Invoices</h3>
                    <Button onClick={() => setIsInvoiceDialogOpen(true)} data-testid="button-new-invoice">
                      <Plus className="h-4 w-4 mr-2" />
                      New Invoice
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {invoices.map((invoice) => (
                      <Card key={invoice._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-muted-foreground">{invoice.clientId.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Issued: {new Date(invoice.issueDate).toLocaleDateString()} | 
                                Due: {new Date(invoice.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold text-lg">${invoice.total.toLocaleString()}</p>
                                <Badge 
                                  variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}
                                  className={invoice.status === 'paid' ? 'bg-green-500' : ''}
                                >
                                  {invoice.status}
                                </Badge>
                              </div>
                              {invoice.clientId.email && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendInvoiceEmailMutation.mutate(invoice._id)}
                                  disabled={sendInvoiceEmailMutation.isPending}
                                  data-testid={`button-send-invoice-${invoice.invoiceNumber}`}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Send Email
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="refunds" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Refund Requests</h3>
                  </div>

                  <div className="grid gap-4">
                    {refunds.map((refund) => (
                      <Card key={refund._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{refund.clientId.name}</p>
                              <p className="text-sm text-muted-foreground">{refund.reason}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Requested: {new Date(refund.requestedAt).toLocaleDateString()}
                                {refund.processedAt && ` | Processed: ${new Date(refund.processedAt).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold text-lg">${refund.amount.toLocaleString()}</p>
                                <Badge 
                                  variant={refund.status === 'processed' ? 'default' : refund.status === 'rejected' ? 'destructive' : 'secondary'}
                                  className={refund.status === 'processed' ? 'bg-green-500' : ''}
                                >
                                  {refund.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Generate an invoice for a client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={invoiceData.clientId} onValueChange={(value) => setInvoiceData({ ...invoiceData, clientId: value })}>
                <SelectTrigger data-testid="select-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.name} ({client.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="package">Package</Label>
              <Select value={invoiceData.packageId} onValueChange={(value) => {
                const pkg = packages.find(p => p._id === value);
                setInvoiceData({ 
                  ...invoiceData, 
                  packageId: value,
                  amount: pkg?.price?.toString() || ""
                });
              }}>
                <SelectTrigger data-testid="select-package">
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg._id} value={pkg._id}>
                      {pkg.name} - ${pkg.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={invoiceData.amount}
                onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                placeholder="Enter amount"
                data-testid="input-amount"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                data-testid="input-due-date"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                placeholder="Add any notes..."
                data-testid="textarea-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createInvoiceMutation.mutate(invoiceData)}
              disabled={!invoiceData.clientId || !invoiceData.amount || !invoiceData.dueDate || createInvoiceMutation.isPending}
              data-testid="button-create-invoice-submit"
            >
              {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund for {selectedPayment?.clientId.name} - ${selectedPayment?.amount}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                value={refundData.amount}
                onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                placeholder="Enter refund amount"
                data-testid="input-refund-amount"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select value={refundData.reason} onValueChange={(value) => setRefundData({ ...refundData, reason: value })}>
                <SelectTrigger data-testid="select-refund-reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_request">Customer Request</SelectItem>
                  <SelectItem value="service_issue">Service Issue</SelectItem>
                  <SelectItem value="duplicate_payment">Duplicate Payment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="refundMethod">Refund Method</Label>
              <Select value={refundData.refundMethod} onValueChange={(value) => setRefundData({ ...refundData, refundMethod: value })}>
                <SelectTrigger data-testid="select-refund-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Payment Method</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="refundNotes">Notes (Optional)</Label>
              <Textarea
                id="refundNotes"
                value={refundData.notes}
                onChange={(e) => setRefundData({ ...refundData, notes: e.target.value })}
                placeholder="Add any notes..."
                data-testid="textarea-refund-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createRefundMutation.mutate(refundData)}
              disabled={!refundData.amount || !refundData.reason || createRefundMutation.isPending}
              data-testid="button-process-refund"
            >
              {createRefundMutation.isPending ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
