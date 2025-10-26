import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, TrendingUp, Users, UtensilsCrossed } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    customersServed: 0,
    activeTables: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch today's bills
      const { data: bills } = await supabase
        .from('bills')
        .select('final_total, payment_status')
        .gte('created_at', today.toISOString())
        .eq('payment_status', 'paid');

      // Fetch today's orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total, table_id, customer_name')
        .gte('created_at', today.toISOString());

      // Fetch active tables
      const { data: tables } = await supabase
        .from('restaurant_tables')
        .select('status')
        .eq('status', 'occupied');

      const todayRevenue = bills?.reduce((sum, bill) => sum + Number(bill.final_total), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? todayRevenue / totalOrders : 0;
      
      // Count unique customers (tables + takeaway orders)
      const uniqueTables = new Set(orders?.filter(o => o.table_id).map(o => o.table_id));
      const takeawayOrders = orders?.filter(o => !o.table_id && o.customer_name).length || 0;
      const customersServed = uniqueTables.size + takeawayOrders;

      setStats({
        todayRevenue,
        totalOrders,
        averageOrderValue,
        customersServed,
        activeTables: tables?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Subscribe to real-time updates
    const billsChannel = supabase
      .channel('bills_analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, fetchAnalytics)
      .subscribe();

    const ordersChannel = supabase
      .channel('orders_analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAnalytics)
      .subscribe();

    const tablesChannel = supabase
      .channel('tables_analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(billsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(tablesChannel);
    };
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-500',
    },
    {
      title: 'Average Order Value',
      value: `₹${stats.averageOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
    {
      title: 'Customers Served',
      value: stats.customersServed.toString(),
      icon: Users,
      color: 'text-orange-500',
    },
    {
      title: 'Active Tables',
      value: stats.activeTables.toString(),
      icon: UtensilsCrossed,
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Real-time restaurant performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Total Revenue:</span> ₹{stats.todayRevenue.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Orders Processed:</span> {stats.totalOrders}
            </p>
            <p>
              <span className="font-semibold">Average per Order:</span> ₹{stats.averageOrderValue.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Customers:</span> {stats.customersServed}
            </p>
            <p>
              <span className="font-semibold">Tables in Use:</span> {stats.activeTables}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
