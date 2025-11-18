import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, TrendingDown, Activity, Calendar, Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface MonthlyTrend {
  month: string;
  revenue: number;
  clients: number;
  newClients: number;
}

interface GrowthMetrics {
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
  lastMonthGrowthRate: number;
  totalClients: number;
  packageStats: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

interface ClientTimeline {
  month: string;
  newClients: number;
  totalClients: number;
}

interface EngagementScore {
  clientId: string;
  clientName: string;
  clientEmail: string;
  overallScore: number;
  activityScore: number;
  sessionScore: number;
  workoutScore: number;
  videoScore: number;
  achievementScore: number;
  churnRisk: 'low' | 'medium' | 'high';
  lastActivity: string | null;
  daysSinceLastActivity: number;
  computedAt: string;
  insights: string[];
}

interface AnalyticsReport {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  topEngagedClients: EngagementScore[];
  lowEngagedClients: EngagementScore[];
  churnRiskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  averageEngagementScore: number;
  generatedAt: string;
}

export default function AdminAnalyticsEnhanced() {
  const style = { "--sidebar-width": "16rem" };
  const [selectedClient, setSelectedClient] = useState<EngagementScore | null>(null);

  const { data: monthlyTrends = [], isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ['/api/analytics/monthly-trends'],
  });

  const { data: growthMetrics, isLoading: metricsLoading } = useQuery<GrowthMetrics>({
    queryKey: ['/api/analytics/growth-metrics'],
  });

  const { data: clientTimeline = [], isLoading: timelineLoading } = useQuery<ClientTimeline[]>({
    queryKey: ['/api/analytics/client-timeline'],
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: packages = [] } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const { data: videos = [] } = useQuery<any[]>({
    queryKey: ['/api/videos'],
  });

  // Advanced Analytics Queries
  const { data: report, isLoading: reportLoading, refetch } = useQuery<AnalyticsReport>({
    queryKey: ['/api/admin/analytics/engagement-report'],
    refetchInterval: false,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/analytics/refresh-engagement');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/engagement-report'] });
      refetch();
    },
  });

  // Helper functions for advanced analytics
  const getChurnBadgeVariant = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
    }
  };

  const getChurnIcon = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <TrendingDown className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Calculate current metrics
  const packageById = packages.reduce((map, pkg) => {
    map[pkg._id] = pkg;
    return map;
  }, {} as Record<string, any>);

  const clientsWithPackages = clients.map(client => {
    const packageId = typeof client.packageId === 'object' ? client.packageId._id : client.packageId;
    const pkg = packageById[packageId];
    return {
      ...client,
      packageData: pkg || null
    };
  });

  const totalClients = clients.length;
  const activeClients = clientsWithPackages.filter(c => c.packageData).length;
  const monthlyRevenue = clientsWithPackages.reduce((sum, client) => {
    return sum + (client.packageData?.price || 0);
  }, 0);

  const isGrowthPositive = (growthMetrics?.growthRate || 0) >= 0;

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Analytics & Growth</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div>
                <p className="text-muted-foreground">
                  Comprehensive analytics dashboard with revenue trends, client growth, and business insights
                </p>
              </div>

              <Tabs defaultValue="analytics" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="advanced" data-testid="tab-advanced-analytics">Advanced Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-8">
              {/* Key Metrics Row */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Clients" 
                  value={totalClients} 
                  icon={Users} 
                  trend={`${activeClients} active`} 
                  trendUp={true} 
                />
                <StatCard 
                  title="Monthly Revenue" 
                  value={`$${monthlyRevenue.toLocaleString()}`} 
                  icon={DollarSign} 
                  trend={`${monthlyRevenue > 0 ? '+' : ''}${monthlyRevenue.toLocaleString()}`} 
                  trendUp={monthlyRevenue > 0} 
                />
                <StatCard 
                  title="Growth Rate" 
                  value={`${growthMetrics?.growthRate || 0}%`} 
                  icon={isGrowthPositive ? TrendingUp : TrendingDown} 
                  trend={`vs last month`} 
                  trendUp={isGrowthPositive} 
                />
                <StatCard 
                  title="New This Month" 
                  value={growthMetrics?.thisMonth || 0} 
                  icon={Activity} 
                  trend={`${growthMetrics?.lastMonth || 0} last month`} 
                  trendUp={true} 
                />
              </div>

              {/* Revenue & Client Trends */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Revenue Trend (6 Months)</CardTitle>
                    <p className="text-sm text-muted-foreground">Monthly revenue with client correlation</p>
                  </CardHeader>
                  <CardContent>
                    {trendsLoading ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--chart-3))" 
                            fill="hsl(var(--chart-3))" 
                            fillOpacity={0.3}
                            name="Revenue ($)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Client Growth Timeline</CardTitle>
                    <p className="text-sm text-muted-foreground">Historical client acquisition data</p>
                  </CardHeader>
                  <CardContent>
                    {timelineLoading ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={clientTimeline}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="totalClients" 
                            stroke="hsl(var(--chart-1))" 
                            strokeWidth={2}
                            name="Total Clients"
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="newClients" 
                            stroke="hsl(var(--chart-2))" 
                            strokeWidth={2}
                            name="New Clients"
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Acquisitions & Package Distribution */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Monthly Client Acquisitions</CardTitle>
                    <p className="text-sm text-muted-foreground">New clients per month</p>
                  </CardHeader>
                  <CardContent>
                    {trendsLoading ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="newClients" 
                            fill="hsl(var(--chart-2))" 
                            name="New Clients"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Package Distribution</CardTitle>
                    <p className="text-sm text-muted-foreground">Client subscription breakdown</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {metricsLoading ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading...</p>
                      </div>
                    ) : (
                      <>
                        {growthMetrics?.packageStats.map((pkg, index) => {
                          const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
                          const color = colors[index % colors.length];
                          return (
                            <div key={pkg.name} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{pkg.name}</span>
                                <span className="text-muted-foreground">
                                  {pkg.count} clients ({pkg.percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full transition-all"
                                  style={{ 
                                    width: `${pkg.percentage}%`,
                                    backgroundColor: color
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Growth Metrics Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Growth Metrics Summary</CardTitle>
                  <p className="text-sm text-muted-foreground">Month-over-month growth analysis</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-chart-1" />
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                      </div>
                      <p className="text-3xl font-bold">{growthMetrics?.thisMonth || 0}</p>
                      <p className="text-xs text-muted-foreground">New client sign-ups</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-5 w-5 ${isGrowthPositive ? 'text-chart-3' : 'text-chart-2'}`} />
                        <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                      </div>
                      <p className={`text-3xl font-bold ${isGrowthPositive ? 'text-chart-3' : 'text-chart-2'}`}>
                        {isGrowthPositive ? '+' : ''}{growthMetrics?.growthRate || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">vs last month ({growthMetrics?.lastMonth || 0} clients)</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-chart-1" />
                        <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                      </div>
                      <p className="text-3xl font-bold">{growthMetrics?.totalClients || 0}</p>
                      <p className="text-xs text-muted-foreground">All-time registered members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3 pb-3 border-b md:border-b-0 md:border-r">
                      <Users className="h-5 w-5 text-chart-1 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Active Clients</p>
                        <p className="text-2xl font-bold mt-1">{activeClients}</p>
                        <p className="text-xs text-muted-foreground mt-1">Out of {totalClients} total</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b md:border-b-0 md:border-r">
                      <Activity className="h-5 w-5 text-chart-2 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Video Library</p>
                        <p className="text-2xl font-bold mt-1">{videos.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Available workouts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-chart-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Monthly Revenue</p>
                        <p className="text-2xl font-bold mt-1">${monthlyRevenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Recurring income</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  {reportLoading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-analytics" />
                    </div>
                  ) : !report ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                      <Activity className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground" data-testid="text-no-data">No analytics data available</p>
                      <Button onClick={() => refetch()} data-testid="button-generate-report">
                        Generate Report
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-display font-bold" data-testid="text-advanced-title">Engagement Scoring & Predictive Analytics</h2>
                          <p className="text-muted-foreground" data-testid="text-advanced-description">
                            Client engagement analysis with churn risk indicators
                          </p>
                        </div>
                        <Button
                          onClick={() => refreshMutation.mutate()}
                          disabled={refreshMutation.isPending}
                          data-testid="button-refresh-analytics"
                        >
                          {refreshMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Refresh Analytics
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold" data-testid="text-total-clients">{report.totalClients}</div>
                            <p className="text-xs text-muted-foreground">Analyzed in latest report</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-active-clients">
                              {report.activeClients}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {report.totalClients > 0 ? Math.round((report.activeClients / report.totalClients) * 100) : 0}% of total
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">At Risk Clients</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-at-risk-clients">
                              {report.atRiskClients}
                            </div>
                            <p className="text-xs text-muted-foreground">High churn risk</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.averageEngagementScore)}`} data-testid="text-avg-engagement">
                              {report.averageEngagementScore}
                            </div>
                            <p className="text-xs text-muted-foreground">Out of 100</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Churn Risk Distribution</CardTitle>
                          <CardDescription>Distribution of clients by predicted churn risk level</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center justify-between p-4 border rounded-md">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium">Low Risk</span>
                              </div>
                              <Badge variant="default" data-testid="badge-low-risk">{report.churnRiskDistribution.low}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-md">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                <span className="font-medium">Medium Risk</span>
                              </div>
                              <Badge variant="secondary" data-testid="badge-medium-risk">{report.churnRiskDistribution.medium}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-md">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <span className="font-medium">High Risk</span>
                              </div>
                              <Badge variant="destructive" data-testid="badge-high-risk">{report.churnRiskDistribution.high}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Tabs defaultValue="top" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="top" data-testid="tab-top-engaged">Top Engaged</TabsTrigger>
                          <TabsTrigger value="low" data-testid="tab-low-engaged">Low Engaged</TabsTrigger>
                          <TabsTrigger value="at-risk" data-testid="tab-at-risk">At Risk</TabsTrigger>
                        </TabsList>

                        <TabsContent value="top" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Top Engaged Clients</CardTitle>
                              <CardDescription>Clients with the highest engagement scores</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Churn Risk</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {report.topEngagedClients.map((client) => (
                                    <TableRow key={client.clientId} data-testid={`row-client-${client.clientId}`}>
                                      <TableCell>
                                        <div>
                                          <div className="font-medium" data-testid={`text-client-name-${client.clientId}`}>{client.clientName}</div>
                                          <div className="text-sm text-muted-foreground">{client.clientEmail}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <span className={`font-bold ${getScoreColor(client.overallScore)}`} data-testid={`text-score-${client.clientId}`}>
                                          {client.overallScore}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={getChurnBadgeVariant(client.churnRisk)} data-testid={`badge-churn-${client.clientId}`}>
                                          {getChurnIcon(client.churnRisk)}
                                          <span className="ml-1">{client.churnRisk}</span>
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm" data-testid={`text-last-activity-${client.clientId}`}>
                                          {client.daysSinceLastActivity === 0 
                                            ? 'Today' 
                                            : client.daysSinceLastActivity === 1 
                                            ? 'Yesterday' 
                                            : `${client.daysSinceLastActivity} days ago`}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedClient(client)}
                                          data-testid={`button-view-details-${client.clientId}`}
                                        >
                                          View Details
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="low" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Low Engaged Clients</CardTitle>
                              <CardDescription>Clients with the lowest engagement scores requiring attention</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Churn Risk</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {report.lowEngagedClients.map((client) => (
                                    <TableRow key={client.clientId} data-testid={`row-low-client-${client.clientId}`}>
                                      <TableCell>
                                        <div>
                                          <div className="font-medium">{client.clientName}</div>
                                          <div className="text-sm text-muted-foreground">{client.clientEmail}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <span className={`font-bold ${getScoreColor(client.overallScore)}`}>
                                          {client.overallScore}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={getChurnBadgeVariant(client.churnRisk)}>
                                          {getChurnIcon(client.churnRisk)}
                                          <span className="ml-1">{client.churnRisk}</span>
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">
                                          {client.daysSinceLastActivity === 0 
                                            ? 'Today' 
                                            : client.daysSinceLastActivity === 1 
                                            ? 'Yesterday' 
                                            : `${client.daysSinceLastActivity} days ago`}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedClient(client)}
                                          data-testid={`button-view-low-details-${client.clientId}`}
                                        >
                                          View Details
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="at-risk" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>At Risk Clients</CardTitle>
                              <CardDescription>Clients with high churn risk needing immediate attention</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Key Insights</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {[...report.topEngagedClients, ...report.lowEngagedClients]
                                    .filter(c => c.churnRisk === 'high')
                                    .map((client) => (
                                      <TableRow key={client.clientId} data-testid={`row-risk-client-${client.clientId}`}>
                                        <TableCell>
                                          <div>
                                            <div className="font-medium">{client.clientName}</div>
                                            <div className="text-sm text-muted-foreground">{client.clientEmail}</div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <span className={`font-bold ${getScoreColor(client.overallScore)}`}>
                                            {client.overallScore}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-sm text-red-600 dark:text-red-400">
                                            {client.daysSinceLastActivity} days ago
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          <div className="text-sm max-w-xs">
                                            {client.insights.slice(0, 2).map((insight, idx) => (
                                              <div key={idx} className="text-muted-foreground">• {insight}</div>
                                            ))}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedClient(client)}
                                            data-testid={`button-view-risk-details-${client.clientId}`}
                                          >
                                            View Details
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>

                      {selectedClient && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle>Client Details: {selectedClient.clientName}</CardTitle>
                            <CardDescription>Comprehensive engagement breakdown and insights</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-5">
                              <div>
                                <div className="text-sm text-muted-foreground">Overall Score</div>
                                <div className={`text-2xl font-bold ${getScoreColor(selectedClient.overallScore)}`}>
                                  {selectedClient.overallScore}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Activity</div>
                                <div className="text-2xl font-bold">{selectedClient.activityScore}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Sessions</div>
                                <div className="text-2xl font-bold">{selectedClient.sessionScore}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Workouts</div>
                                <div className="text-2xl font-bold">{selectedClient.workoutScore}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Videos</div>
                                <div className="text-2xl font-bold">{selectedClient.videoScore}</div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold mb-2">Insights & Recommendations</h3>
                              <div className="space-y-2">
                                {selectedClient.insights.map((insight, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <span className="text-sm">{insight}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button variant="outline" onClick={() => setSelectedClient(null)} data-testid="button-close-details">
                                Close
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="text-xs text-muted-foreground text-center">
                        Last updated: {new Date(report.generatedAt).toLocaleString()}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
