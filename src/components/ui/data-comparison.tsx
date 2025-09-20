import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Database, Users, CreditCard } from 'lucide-react';

interface DataComparisonProps {
  userActivity: any;
  recentTransactions: any;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function DataComparison({ userActivity, recentTransactions, isLoading, onRefresh }: DataComparisonProps) {
  const [activeTab, setActiveTab] = useState('comparison');

  if (isLoading) {
    return (
      <Card className="border-dashed border-purple-200 bg-purple-50/30">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <CardTitle className="text-sm text-purple-800">Loading Data Comparison...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Extract user IDs from both sources
  const userActivityUsers = userActivity?.userActivity || [];
  const recentTransactionUsers = recentTransactions?.transactions || [];
  
  // Create user ID sets
  const userActivityUserIds = new Set(userActivityUsers.map((u: any) => u.userId));
  const recentTransactionUserIds = new Set(recentTransactionUsers.map((t: any) => t.user_id || t.user));
  
  // Find mismatches
  const onlyInUserActivity = Array.from(userActivityUserIds).filter(id => !recentTransactionUserIds.has(id));
  const onlyInRecentTransactions = Array.from(recentTransactionUserIds).filter(id => !userActivityUserIds.has(id));
  const inBoth = Array.from(userActivityUserIds).filter(id => recentTransactionUserIds.has(id));

  return (
    <Card className="border-dashed border-purple-200 bg-purple-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-sm text-purple-800">Data Source Comparison</CardTitle>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs text-purple-700">
          Compare data between User Activity and Recent Transactions endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="comparison" className="text-xs">Comparison</TabsTrigger>
            <TabsTrigger value="userActivity" className="text-xs">User Activity</TabsTrigger>
            <TabsTrigger value="recentTransactions" className="text-xs">Recent Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-blue-100 rounded-lg">
                <div className="text-lg font-bold text-blue-800">
                  {userActivityUsers.length}
                </div>
                <div className="text-xs text-blue-600">User Activity Users</div>
              </div>
              <div className="text-center p-2 bg-green-100 rounded-lg">
                <div className="text-lg font-bold text-green-800">
                  {recentTransactionUsers.length}
                </div>
                <div className="text-xs text-green-600">Recent Transactions</div>
              </div>
              <div className="text-center p-2 bg-yellow-100 rounded-lg">
                <div className="text-lg font-bold text-yellow-800">
                  {inBoth.length}
                </div>
                <div className="text-xs text-yellow-600">In Both Sources</div>
              </div>
              <div className="text-center p-2 bg-red-100 rounded-lg">
                <div className="text-lg font-bold text-red-800">
                  {onlyInUserActivity.length + onlyInRecentTransactions.length}
                </div>
                <div className="text-xs text-red-600">Mismatches</div>
              </div>
            </div>

            {/* Mismatch Details */}
            <div className="space-y-3">
              {onlyInUserActivity.length > 0 && (
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <h4 className="text-xs font-medium text-yellow-800 mb-2">
                    ⚠️ Users only in User Activity ({onlyInUserActivity.length})
                  </h4>
                  <div className="text-xs text-yellow-700">
                    {onlyInUserActivity.slice(0, 5).join(', ')}
                    {onlyInUserActivity.length > 5 && ` ... and ${onlyInUserActivity.length - 5} more`}
                  </div>
                </div>
              )}

              {onlyInRecentTransactions.length > 0 && (
                <div className="p-3 bg-red-100 rounded-lg">
                  <h4 className="text-xs font-medium text-red-800 mb-2">
                    ❌ Users only in Recent Transactions ({onlyInRecentTransactions.length})
                  </h4>
                  <div className="text-xs text-red-700">
                    {onlyInRecentTransactions.slice(0, 5).join(', ')}
                    {onlyInRecentTransactions.length > 5 && ` ... and ${onlyInRecentTransactions.length - 5} more`}
                  </div>
                </div>
              )}

              {inBoth.length > 0 && (
                <div className="p-3 bg-green-100 rounded-lg">
                  <h4 className="text-xs font-medium text-green-800 mb-2">
                    ✅ Users in Both Sources ({inBoth.length})
                  </h4>
                  <div className="text-xs text-green-700">
                    {inBoth.slice(0, 5).join(', ')}
                    {inBoth.length > 5 && ` ... and ${inBoth.length - 5} more`}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="userActivity" className="space-y-3">
            <div className="text-xs text-muted-foreground mb-2">
              Data from User Activity endpoint
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">User ID</TableHead>
                    <TableHead className="text-xs">Transactions</TableHead>
                    <TableHead className="text-xs">Total Spent</TableHead>
                    <TableHead className="text-xs">Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivityUsers.slice(0, 10).map((user: any, index: number) => (
                    <TableRow key={index} className="text-xs">
                      <TableCell className="font-mono">{user.userId}</TableCell>
                      <TableCell>{user.transactionCount || 0}</TableCell>
                      <TableCell>Rp {user.totalSpent?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('id-ID') : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="recentTransactions" className="space-y-3">
            <div className="text-xs text-muted-foreground mb-2">
              Data from Recent Transactions endpoint
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">User ID</TableHead>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactionUsers.slice(0, 10).map((transaction: any, index: number) => (
                    <TableRow key={index} className="text-xs">
                      <TableCell className="font-mono">{transaction.user_id || transaction.user}</TableCell>
                      <TableCell>{transaction.name || 'N/A'}</TableCell>
                      <TableCell>Rp {transaction.totalBayar || transaction.price || 0}</TableCell>
                      <TableCell>
                        {transaction.date ? new Date(transaction.date).toLocaleDateString('id-ID') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 