import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface UserIdDebugProps {
  userActivity: any[];
  recentTransactions: any[];
  allUsers: any[];
}

export function UserIdDebug({ userActivity, recentTransactions, allUsers }: UserIdDebugProps) {
  // Extract unique user IDs from each source
  const userActivityIds = new Set(userActivity.map((u: any) => u.userId).filter(Boolean));
  const recentTransactionIds = new Set(recentTransactions.map((t: any) => 
    t.user_id || t.user || t.user_name
  ).filter(Boolean));
  const allUsersIds = new Set(allUsers.map((u: any) => 
    u.userId || u.user_id || u.user || u.username
  ).filter(Boolean));

  // Analyze ID formats
  const analyzeIdFormat = (id: string) => {
    if (!id) return 'Empty';
    if (id.includes('@s.whatsapp.net')) return 'WhatsApp Format';
    if (/^\d+$/.test(id)) return 'Phone Number';
    if (id.startsWith('User ')) return 'Display Name';
    return 'Other';
  };

  // Group IDs by format
  const groupIdsByFormat = (ids: Set<string>) => {
    const groups: { [key: string]: string[] } = {};
    Array.from(ids).forEach(id => {
      const format = analyzeIdFormat(id);
      if (!groups[format]) groups[format] = [];
      groups[format].push(id);
    });
    return groups;
  };

  const userActivityFormats = groupIdsByFormat(userActivityIds);
  const recentTransactionFormats = groupIdsByFormat(recentTransactionIds);
  const allUsersFormats = groupIdsByFormat(allUsersIds);

  // Find potential matches by normalizing IDs
  const normalizeId = (id: string) => {
    if (!id) return '';
    // Extract phone number from various formats
    const phoneMatch = id.match(/\d+/);
    return phoneMatch ? phoneMatch[0] : id;
  };

  const findMatches = () => {
    const matches: Array<{
      userActivity: string;
      recentTransaction: string;
      allUsers: string;
      normalizedId: string;
    }> = [];

    const normalizedUserActivity = new Map<string, string>();
    const normalizedRecentTransaction = new Map<string, string>();
    const normalizedAllUsers = new Map<string, string>();

    // Build normalized maps
    Array.from(userActivityIds).forEach(id => {
      const normalized = normalizeId(id);
      if (normalized) normalizedUserActivity.set(normalized, id);
    });

    Array.from(recentTransactionIds).forEach(id => {
      const normalized = normalizeId(id);
      if (normalized) normalizedRecentTransaction.set(normalized, id);
    });

    Array.from(allUsersIds).forEach(id => {
      const normalized = normalizeId(id);
      if (normalized) normalizedAllUsers.set(normalized, id);
    });

    // Find matches
    const allNormalizedIds = new Set([
      ...normalizedUserActivity.keys(),
      ...normalizedRecentTransaction.keys(),
      ...normalizedAllUsers.keys()
    ]);

    allNormalizedIds.forEach(normalizedId => {
      const userActivityId = normalizedUserActivity.get(normalizedId);
      const recentTransactionId = normalizedRecentTransaction.get(normalizedId);
      const allUsersId = normalizedAllUsers.get(normalizedId);

      if (userActivityId || recentTransactionId || allUsersId) {
        matches.push({
          userActivity: userActivityId || '-',
          recentTransaction: recentTransactionId || '-',
          allUsers: allUsersId || '-',
          normalizedId
        });
      }
    });

    return matches.sort((a, b) => a.normalizedId.localeCompare(b.normalizedId));
  };

  const matches = findMatches();

  return (
    <Card className="border-dashed border-indigo-200 bg-indigo-50/30">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-indigo-600" />
          <CardTitle className="text-sm text-indigo-800">User ID Format Analysis</CardTitle>
        </div>
        <CardDescription className="text-xs text-indigo-700">
          Analyze and compare User ID formats across different endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-100 rounded-lg">
            <div className="text-lg font-bold text-blue-800">{userActivityIds.size}</div>
            <div className="text-xs text-blue-600">User Activity IDs</div>
          </div>
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <div className="text-lg font-bold text-green-800">{recentTransactionIds.size}</div>
            <div className="text-xs text-green-600">Recent Transaction IDs</div>
          </div>
          <div className="text-center p-3 bg-purple-100 rounded-lg">
            <div className="text-lg font-bold text-purple-800">{allUsersIds.size}</div>
            <div className="text-xs text-purple-600">All Users IDs</div>
          </div>
        </div>

        {/* ID Format Analysis */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-indigo-800">ID Format Breakdown:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Activity Formats */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="text-xs font-medium text-blue-800 mb-2">User Activity</h5>
              {Object.entries(userActivityFormats).map(([format, ids]) => (
                <div key={format} className="flex justify-between text-xs mb-1">
                  <span>{format}:</span>
                  <Badge variant="secondary" className="text-xs">{ids.length}</Badge>
                </div>
              ))}
            </div>

            {/* Recent Transactions Formats */}
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="text-xs font-medium text-green-800 mb-2">Recent Transactions</h5>
              {Object.entries(recentTransactionFormats).map(([format, ids]) => (
                <div key={format} className="flex justify-between text-xs mb-1">
                  <span>{format}:</span>
                  <Badge variant="secondary" className="text-xs">{ids.length}</Badge>
                </div>
              ))}
            </div>

            {/* All Users Formats */}
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="text-xs font-medium text-purple-800 mb-2">All Users</h5>
              {Object.entries(allUsersFormats).map(([format, ids]) => (
                <div key={format} className="flex justify-between text-xs mb-1">
                  <span>{format}:</span>
                  <Badge variant="secondary" className="text-xs">{ids.length}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Matches Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-indigo-800">ID Matching Analysis:</h4>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Normalized ID</TableHead>
                  <TableHead className="text-xs">User Activity</TableHead>
                  <TableHead className="text-xs">Recent Transactions</TableHead>
                  <TableHead className="text-xs">All Users</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.slice(0, 10).map((match, index) => {
                  const hasAll = match.userActivity !== '-' && match.recentTransaction !== '-' && match.allUsers !== '-';
                  const hasPartial = [match.userActivity, match.recentTransaction, match.allUsers].filter(id => id !== '-').length >= 2;
                  
                  return (
                    <TableRow key={index} className="text-xs">
                      <TableCell className="font-mono font-medium">{match.normalizedId}</TableCell>
                      <TableCell className={match.userActivity === '-' ? 'text-red-600' : 'text-green-600'}>
                        {match.userActivity}
                      </TableCell>
                      <TableCell className={match.recentTransaction === '-' ? 'text-red-600' : 'text-green-600'}>
                        {match.recentTransaction}
                      </TableCell>
                      <TableCell className={match.allUsers === '-' ? 'text-red-600' : 'text-green-600'}>
                        {match.allUsers}
                      </TableCell>
                      <TableCell>
                        {hasAll ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        ) : hasPartial ? (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Partial
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Missing
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {matches.length > 10 && (
            <div className="text-xs text-muted-foreground text-center">
              Showing first 10 of {matches.length} matches
            </div>
          )}
        </div>

        {/* Recommendations */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>ID Format Issues Found:</strong>
            <ul className="mt-2 space-y-1">
              <li>• User Activity uses: {Object.keys(userActivityFormats).join(', ')}</li>
              <li>• Recent Transactions uses: {Object.keys(recentTransactionFormats).join(', ')}</li>
              <li>• All Users uses: {Object.keys(allUsersFormats).join(', ')}</li>
              <li>• Consider normalizing to phone numbers for consistent matching</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 