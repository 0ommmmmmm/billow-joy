import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MenuManagement from "./MenuManagement";
import BillingInterface from "./BillingInterface";
import { 
  UtensilsCrossed, 
  Receipt, 
  TrendingUp, 
  Users, 
  CreditCard, 
  ShoppingBag,
  Plus,
  MessageSquare,
  BarChart3,
  Clock,
  DollarSign,
  Menu,
  LogOut
} from "lucide-react";

interface Order {
  id: string;
  table: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  timestamp: Date;
}

interface DashboardStats {
  todayRevenue: number;
  ordersCount: number;
  avgOrderValue: number;
  customersServed: number;
}

const RestaurantDashboard = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'orders' | 'billing' | 'analytics' | 'menu'>('dashboard');
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([
    {
      id: '001',
      table: 'Table 5',
      items: [
        { name: 'Butter Chicken', price: 320, quantity: 2 },
        { name: 'Naan', price: 80, quantity: 3 }
      ],
      total: 880,
      status: 'preparing',
      timestamp: new Date()
    },
    {
      id: '002', 
      table: 'Takeaway',
      items: [
        { name: 'Biryani', price: 280, quantity: 1 },
        { name: 'Raita', price: 60, quantity: 1 }
      ],
      total: 340,
      status: 'ready',
      timestamp: new Date()
    }
  ]);
  
  // Mock data
  const stats: DashboardStats = {
    todayRevenue: 12450,
    ordersCount: 87,
    avgOrderValue: 143,
    customersServed: 156
  };

  const handleOrderStatusUpdate = (orderId: string) => {
    setActiveOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const nextStatus = order.status === 'preparing' ? 'ready' : 
                          order.status === 'ready' ? 'completed' : 'preparing';
        
        toast({
          title: "Order Status Updated",
          description: `Order #${orderId} is now ${nextStatus}`,
          variant: "default"
        });
        
        return { ...order, status: nextStatus };
      }
      return order;
    }));
  };

  const handleCompleteOrder = (orderId: string) => {
    setActiveOrders(prev => prev.filter(order => order.id !== orderId));
    toast({
      title: "Order Completed",
      description: `Order #${orderId} has been completed and removed from active orders`,
      variant: "default"
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  const StatCard = ({ icon: Icon, title, value, description, trend }: {
    icon: any;
    title: string;
    value: string | number;
    description: string;
    trend?: string;
  }) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend && <TrendingUp className="h-3 w-3 text-success" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-3 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.table}</CardTitle>
          <Badge variant={order.status === 'ready' ? 'default' : 'secondary'}>
            {order.status}
          </Badge>
        </div>
        <CardDescription>Order #{order.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 mb-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total: ₹{order.total}</span>
          <Button 
            size="sm" 
            variant={order.status === 'ready' ? 'default' : 'outline'}
            onClick={() => order.status === 'ready' ? handleCompleteOrder(order.id) : handleOrderStatusUpdate(order.id)}
          >
            {order.status === 'ready' ? 'Complete Order' : 'Update Status'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  RestoBill Pro
                </h1>
                <p className="text-sm text-muted-foreground">Smart Restaurant Billing</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground mr-2">
                {user?.email}
              </div>
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('dashboard')}
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentView === 'menu' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('menu')}
                size="sm"
              >
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
              <Button
                variant={currentView === 'orders' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('orders')}
                size="sm"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Orders
              </Button>
              <Button
                variant={currentView === 'billing' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('billing')}
                size="sm"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Billing
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={DollarSign}
                title="Today's Revenue"
                value={`₹${stats.todayRevenue.toLocaleString()}`}
                description="+12% from yesterday"
                trend="up"
              />
              <StatCard
                icon={Receipt}
                title="Orders"
                value={stats.ordersCount}
                description="Active orders: 8"
              />
              <StatCard
                icon={TrendingUp}
                title="Average Order"
                value={`₹${stats.avgOrderValue}`}
                description="+5% from last week"
                trend="up"
              />
              <StatCard
                icon={Users}
                title="Customers Served"
                value={stats.customersServed}
                description="Across all tables"
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Start a new order or process payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col space-y-2" onClick={() => setCurrentView('menu')}>
                    <Menu className="h-6 w-6" />
                    <span>Manage Menu</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => setCurrentView('orders')}>
                    <ShoppingBag className="h-6 w-6" />
                    <span>New Order</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => setCurrentView('billing')}>
                    <CreditCard className="h-6 w-6" />
                    <span>Process Payment</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Orders Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Active Orders
                  </CardTitle>
                  <CardDescription>Orders currently being prepared</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Highlights</CardTitle>
                  <CardDescription>Key insights for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <div>
                        <p className="font-medium">Peak Hour</p>
                        <p className="text-sm text-muted-foreground">7:30 PM - Most orders</p>
                      </div>
                    </div>
                    <Badge variant="outline">+24 orders</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">Top Item</p>
                        <p className="text-sm text-muted-foreground">Butter Chicken</p>
                      </div>
                    </div>
                    <Badge variant="outline">18 sold</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <div>
                        <p className="font-medium">Loyal Customer</p>
                        <p className="text-sm text-muted-foreground">Rajesh Kumar - 5th visit</p>
                      </div>
                    </div>
                    <Badge variant="outline">VIP</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'menu' && (
          <div className="animate-fade-in">
            <MenuManagement />
          </div>
        )}

        {currentView === 'orders' && (
          <div className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Create and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Order Management Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Full order management with menu selection, AI upsells, and table tracking will be available once you connect to Supabase.
                  </p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-primary">
                      💡 <strong>Tip:</strong> Connect to Supabase to store orders, menu items, and customer data securely.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'billing' && (
          <div className="animate-fade-in">
            <BillingInterface />
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantDashboard;