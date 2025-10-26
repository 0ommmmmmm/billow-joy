import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from './useMenuItems';

export interface OrderItem {
  id?: string;
  menu_item_id: string;
  quantity: number;
  price_at_order: number;
  menu_item?: MenuItem;
}

export interface Order {
  id: string;
  table_id: string | null;
  customer_name: string | null;
  order_type: string;
  status: string;
  total: number;
  created_at: string;
  staff_id: string | null;
  order_items?: OrderItem[];
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_item:menu_items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createOrder = async (orderData: {
    table_id?: string | null;
    customer_name?: string;
    order_type: 'dine-in' | 'takeaway';
    items: { menu_item_id: string; quantity: number; price: number }[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          table_id: orderData.table_id,
          customer_name: orderData.customer_name,
          order_type: orderData.order_type,
          status: 'pending',
          total,
          staff_id: user?.id,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price_at_order: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update table status if dine-in
      if (orderData.table_id) {
        await supabase
          .from('restaurant_tables')
          .update({ 
            status: 'occupied',
            current_order_id: order.id 
          })
          .eq('id', orderData.table_id);
      }

      toast({
        title: 'Success',
        description: 'Order created successfully',
      });
      
      return { success: true, data: order };
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order status updated',
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    refreshOrders: fetchOrders,
  };
};
