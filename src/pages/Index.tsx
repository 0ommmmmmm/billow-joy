import { Button } from "@/components/ui/button";
import { Route, Routes, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import MenuManagement from "@/components/MenuManagement";
import { TableManagement } from "@/components/TableManagement";
import { OrderManagement } from "@/components/OrderManagement";
import RestaurantDashboard from "@/components/RestaurantDashboard";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Restaurant Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs value={currentPath} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="/" asChild>
              <Link to="/">Analytics</Link>
            </TabsTrigger>
            <TabsTrigger value="/tables" asChild>
              <Link to="/tables">Tables</Link>
            </TabsTrigger>
            <TabsTrigger value="/orders" asChild>
              <Link to="/orders">Orders</Link>
            </TabsTrigger>
            <TabsTrigger value="/menu" asChild>
              <Link to="/menu">Menu</Link>
            </TabsTrigger>
            <TabsTrigger value="/billing" asChild>
              <Link to="/billing">Billing</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Routes>
          <Route path="/" element={<AnalyticsDashboard />} />
          <Route path="/tables" element={<TableManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/billing" element={<RestaurantDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default Index;
