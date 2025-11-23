import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Plus, MoreHorizontal, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dashboardApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

export default function ProjectsPage() {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', 'projects', 10],
    queryFn: () => dashboardApi.getRecentTransactions(10),
  });

  // Create "projects" from transaction data
  const projects = recentTransactions?.transactions.slice(0, 6).map((transaction, index) => ({
    id: transaction.id || index,
    name: transaction.name,
    description: `WhatsApp Bot Transaction - ${transaction.name}`,
    revenue: transaction.totalBayar,
    transactions: 1,
    users: 1,
    status: transaction.status || 'active',
    lastActivity: transaction.date,
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-400 mb-2">Failed to load projects</p>
            <p className="text-sm text-gray-400">Please check your API connection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 mt-1">WhatsApp Bot Transaction Projects</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Projects</p>
                  <p className="text-2xl font-bold text-white">{projects.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(projects.reduce((sum, p) => sum + p.revenue, 0))}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {projects.reduce((sum, p) => sum + p.users, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{project.name}</CardTitle>
                      <CardDescription className="text-gray-400">{project.description}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Revenue</span>
                    <span className="text-white font-semibold">{formatCurrency(project.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Transactions</span>
                    <span className="text-white">{project.transactions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Users</span>
                    <span className="text-white">{project.users}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      {project.status}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(project.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
