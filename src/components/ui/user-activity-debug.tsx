import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Activity, CreditCard, TrendingUp } from 'lucide-react';

interface UserActivityDebugProps {
  userActivity: any[];
  isLoading?: boolean;
}

export function UserActivityDebug({ userActivity, isLoading }: UserActivityDebugProps) {
  if (isLoading) {
    return (
      <Card className="border-dashed border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">Loading User Activity...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!userActivity || userActivity.length === 0) {
    return (
      <Card className="border-dashed border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-sm text-red-800">No User Activity Data</CardTitle>
          <CardDescription className="text-xs text-red-700">
            Backend returned empty or invalid data
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-blue-200 bg-blue-50/30">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-sm text-blue-800">User Activity Debug</CardTitle>
          <Badge variant="outline" className="text-xs">
            {userActivity.length} users
          </Badge>
        </div>
        <CardDescription className="text-xs text-blue-700">
          Raw user data from backend - check field mapping
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-blue-100 rounded-lg">
              <div className="text-lg font-bold text-blue-800">
                {userActivity.length}
              </div>
              <div className="text-xs text-blue-600">Total Users</div>
            </div>
            <div className="text-center p-2 bg-green-100 rounded-lg">
              <div className="text-lg font-bold text-green-800">
                {userActivity.filter(u => u.transactionCount > 0).length}
              </div>
              <div className="text-xs text-green-600">With Transactions</div>
            </div>
            <div className="text-center p-2 bg-yellow-100 rounded-lg">
              <div className="text-lg font-bold text-yellow-800">
                {userActivity.filter(u => u.transactionCount === 0).length}
              </div>
              <div className="text-xs text-yellow-600">No Transactions</div>
            </div>
            <div className="text-center p-2 bg-purple-100 rounded-lg">
              <div className="text-lg font-bold text-purple-800">
                {userActivity.reduce((sum, u) => sum + (u.transactionCount || 0), 0)}
              </div>
              <div className="text-xs text-purple-600">Total Transactions</div>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User ID</TableHead>
                  <TableHead className="text-xs">Username</TableHead>
                  <TableHead className="text-xs">Transactions</TableHead>
                  <TableHead className="text-xs">Total Spent</TableHead>
                  <TableHead className="text-xs">Saldo</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userActivity.map((user, index) => (
                  <TableRow key={index} className="text-xs">
                    <TableCell className="font-mono">
                      {user.userId || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {user.username || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.transactionCount > 0 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {user.transactionCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.totalSpent ? `Rp ${user.totalSpent.toLocaleString()}` : 'Rp 0'}
                    </TableCell>
                    <TableCell>
                      {user.saldo ? `Rp ${user.saldo.toLocaleString()}` : 'Rp 0'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.role === 'gold' ? 'default' :
                          user.role === 'silver' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {user.role || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('id-ID') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Field Mapping Info */}
          <div className="p-3 bg-blue-100 rounded-lg">
            <h4 className="text-xs font-medium text-blue-800 mb-2">Field Mapping Issues:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• Check if backend sends 'totalTransaksi' or different field name</div>
              <div>• Verify 'user' field contains correct user identifier</div>
              <div>• Ensure 'lastActivity' field has valid date format</div>
              <div>• Confirm 'saldo' field exists and has numeric values</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 