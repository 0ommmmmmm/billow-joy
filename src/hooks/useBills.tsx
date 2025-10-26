import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Bill {
  id: string;
  order_id: string;
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  discount_percent: number;
  discount_amount: number;
  final_total: number;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
  paid_at: string | null;
}

export const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bills',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('bills_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills'
        },
        () => {
          fetchBills();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createBill = async (billData: {
    order_id: string;
    subtotal: number;
    tax_percent?: number;
    discount_percent?: number;
  }) => {
    try {
      const taxPercent = billData.tax_percent || 5;
      const discountPercent = billData.discount_percent || 0;
      
      const taxAmount = (billData.subtotal * taxPercent) / 100;
      const discountAmount = (billData.subtotal * discountPercent) / 100;
      const finalTotal = billData.subtotal + taxAmount - discountAmount;

      const { data, error } = await supabase
        .from('bills')
        .insert([{
          order_id: billData.order_id,
          subtotal: billData.subtotal,
          tax_percent: taxPercent,
          tax_amount: taxAmount,
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          final_total: finalTotal,
          payment_status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Bill created successfully',
      });
      return { success: true, data };
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bill',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const updateBillPayment = async (id: string, paymentMethod: string, tableId?: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ 
          payment_status: 'paid',
          payment_method: paymentMethod,
          paid_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // If table_id provided, mark table as available
      if (tableId) {
        await supabase
          .from('restaurant_tables')
          .update({ 
            status: 'available',
            current_order_id: null 
          })
          .eq('id', tableId);
      }

      toast({
        title: 'Success',
        description: 'Payment processed successfully',
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  return {
    bills,
    loading,
    createBill,
    updateBillPayment,
    refreshBills: fetchBills,
  };
};
