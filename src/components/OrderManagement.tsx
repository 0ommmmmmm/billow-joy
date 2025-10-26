import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ShoppingCart, Minus, Trash2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useTables } from '@/hooks/useTables';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { AIUpsellCard } from './menu/AIUpsellCard';
import { MenuItem } from '@/hooks/useMenuItems';

export const OrderManagement = () => {
  const { orders, loading, createOrder, updateOrderStatus } = useOrders();
  const { tables } = useTables();
  const { menuItems } = useMenuItems();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [selectedTable, setSelectedTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number }>>([]);

  const currentOrderItems = cart.map(c => c.item);
  const { suggestions, loading: aiLoading } = useAISuggestions(menuItems, currentOrderItems);

  const availableTables = tables.filter(t => t.status === 'available');

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, { item, quantity }) => sum + (item.price * quantity), 0);
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(c => c.item.id === item.id);
    if (existingItem) {
      setCart(cart.map(c => 
        c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.item.id === itemId) {
        const newQuantity = c.quantity + delta;
        return newQuantity > 0 ? { ...c, quantity: newQuantity } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.item.id !== itemId));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const orderData = {
      table_id: orderType === 'dine-in' ? selectedTable : null,
      customer_name: orderType === 'takeaway' ? customerName : undefined,
      order_type: orderType,
      items: cart.map(c => ({
        menu_item_id: c.item.id,
        quantity: c.quantity,
        price: c.item.price,
      })),
    };

    const result = await createOrder(orderData);
    if (result.success) {
      setCart([]);
      setIsDialogOpen(false);
      setSelectedTable('');
      setCustomerName('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'served': return 'bg-green-500';
      case 'paid': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Create and track orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            
            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dine-in">Dine-in</TabsTrigger>
                <TabsTrigger value="takeaway">Takeaway</TabsTrigger>
              </TabsList>

              <TabsContent value="dine-in" className="space-y-4">
                <div>
                  <Label>Select Table</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map(table => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name} (Capacity: {table.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="takeaway" className="space-y-4">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Menu Items</h3>
              <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto">
                {menuItems.filter(item => item.is_available).map(item => (
                  <Card key={item.id} className="cursor-pointer hover:bg-accent" onClick={() => addToCart(item)}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {suggestions.length > 0 && !aiLoading && (
                <div className="space-y-2">
                  <h3 className="font-semibold">AI Suggestions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {suggestions.map((suggestion, idx) => (
                      <AIUpsellCard
                        key={idx}
                        suggestion={suggestion}
                        onAddToOrder={addToCart}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart ({cart.length} items)
                </h3>
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items added yet</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map(({ item, quantity }) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-accent rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price} × {quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded font-bold">
                      <span>Total:</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handlePlaceOrder} 
                className="w-full"
                disabled={cart.length === 0 || (orderType === 'dine-in' && !selectedTable)}
              >
                Place Order (₹{cartTotal.toFixed(2)})
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {order.order_type === 'dine-in' ? 'Dine-in' : 'Takeaway'}
                    {order.customer_name && ` - ${order.customer_name}`}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  {order.status !== 'paid' && (
                    <Select
                      value={order.status}
                      onValueChange={(status) => updateOrderStatus(order.id, status)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="served">Served</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.menu_item?.name} × {item.quantity}</span>
                    <span>₹{(item.price_at_order * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{order.total?.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Order
          </Button>
        </div>
      )}
    </div>
  );
};
