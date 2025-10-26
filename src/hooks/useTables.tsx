import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Table {
  id: string;
  name: string;
  table_number: number | null;
  status: string;
  capacity: number;
  current_order_id: string | null;
}

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTables = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('name');

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tables',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('restaurant_tables_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_tables'
        },
        () => {
          fetchTables();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTable = async (table: Omit<Table, 'id' | 'current_order_id'>) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .insert([table])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Table added successfully',
      });
      return { success: true, data };
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: 'Error',
        description: 'Failed to add table',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const updateTableStatus = async (id: string, status: string, orderId?: string | null) => {
    try {
      const updates: any = { status };
      if (orderId !== undefined) {
        updates.current_order_id = orderId;
      }

      const { error } = await supabase
        .from('restaurant_tables')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Table status updated',
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating table:', error);
      toast({
        title: 'Error',
        description: 'Failed to update table status',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  return {
    tables,
    loading,
    addTable,
    updateTableStatus,
    refreshTables: fetchTables,
  };
};
