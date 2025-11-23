import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { dashboardApi } from '@/services/api';
import { formatCurrency, getTransactionUserName } from '@/lib/utils';

export default function CustomerReportPage() {
  const { data: recentTransactions, isLoading, error } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(50),
  });

  // Process customer data from transactions
  const customers = recentTransactions?.transactions.reduce((acc, transaction) => {
    const userName = getTransactionUserName(transaction);
    const existingCustomer = acc.find(c => c.name === userName);
    
    if (existingCustomer) {
      existingCustomer.orders += 1;
      existingCustomer.totalSpent += transaction.totalBayar;
    } else {
      acc.push({
        id: transaction.id || Math.random(),
        name: userName,
        email: `${userName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: '+62 812 3456 7890',
        location: 'Jakarta, Indonesia',
        orders: 1,
        totalSpent: transaction.totalBayar,
        lastOrder: transaction.date,
      });
    }
    
    return acc;
  }, [] as any[]) || [];

  // Sort by total spent
  const topCustomers = customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading customer report...</p>
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
            <p className="text-red-400 mb-2">Failed to load customer report</p>
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
            <h1 className="text-2xl font-bold text-white">Customer Report</h1>
            <p className="text-gray-400 mt-1">WhatsApp Bot Customer Analytics</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-white">{customers.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
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
                    {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Customers</CardTitle>
            <CardDescription className="text-gray-400">Customers with highest spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 border border-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{customer.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-sm text-gray-400">{customer.orders} orders</p>
                    <p className="text-xs text-gray-500">
                      Last: {new Date(customer.lastOrder).toLocaleDateString()}
                    </p>
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
