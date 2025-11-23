import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Plus, Clock, User, CreditCard, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dashboardApi } from '@/services/api';
import { formatCurrency, formatDate, formatTime, getTransactionUserName, getTransactionPaymentMethod, getTransactionReferenceId } from '@/lib/utils';

export default function TasksPage() {
  const { data: recentTransactions, isLoading, error } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(20),
  });

  // Convert transactions to "tasks"
  const tasks = recentTransactions?.transactions.map((transaction, index) => ({
    id: transaction.id || index,
    title: transaction.name,
    priority: transaction.totalBayar > 100000 ? 'high' : transaction.totalBayar > 50000 ? 'medium' : 'low',
    assignee: getTransactionUserName(transaction),
    dueDate: transaction.date,
    completed: transaction.status === 'completed',
    amount: transaction.totalBayar,
    paymentMethod: getTransactionPaymentMethod(transaction),
    referenceId: getTransactionReferenceId(transaction),
  })) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading tasks...</p>
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
            <p className="text-red-400 mb-2">Failed to load tasks</p>
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
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <p className="text-gray-400 mt-1">WhatsApp Bot Transaction Tasks</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Task Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold text-white">{tasks.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-white">{tasks.filter(t => t.completed).length}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-white">{tasks.filter(t => !t.completed).length}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(tasks.reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Transaction Tasks</CardTitle>
            <CardDescription className="text-gray-400">Manage your WhatsApp bot transaction tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckSquare className={`h-5 w-5 ${task.completed ? 'text-green-400' : 'text-gray-400'}`} />
                      <span className={`text-white ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    <Badge variant="secondary" className="bg-gray-600 text-white text-xs">
                      {getPriorityText(task.priority)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="h-4 w-4" />
                      {task.assignee}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      {formatDate(task.dueDate, 'short')}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{formatCurrency(task.amount)}</p>
                      <p className="text-xs text-gray-400">{task.paymentMethod}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
