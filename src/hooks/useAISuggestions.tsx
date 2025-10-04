import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from './useMenuItems';
import { useToast } from '@/hooks/use-toast';

export interface AIUpsellSuggestion {
  item: MenuItem;
  reason: string;
  confidence: number;
}

export const useAISuggestions = (menuItems: MenuItem[], currentOrderItems: MenuItem[] = []) => {
  const [suggestions, setSuggestions] = useState<AIUpsellSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    if (menuItems.length === 0) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('ai-menu-suggestions', {
        body: {
          currentOrderItems: currentOrderItems.map(item => ({ name: item.name, category: item.category })),
          menuItems: menuItems.map(item => ({ 
            id: item.id,
            name: item.name, 
            price: item.price, 
            category: item.category 
          })),
        },
      });

      if (error) {
        if (error.message.includes('Rate limit')) {
          toast({
            title: 'Rate Limit',
            description: 'AI suggestions temporarily unavailable. Please try again in a moment.',
            variant: 'default',
          });
        } else if (error.message.includes('credits')) {
          toast({
            title: 'AI Credits Exhausted',
            description: 'Please add credits to continue using AI suggestions.',
            variant: 'destructive',
          });
        }
        throw error;
      }

      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      // Set fallback suggestions
      setSuggestions(
        menuItems.slice(0, 2).map(item => ({
          item,
          reason: 'Popular choice among customers',
          confidence: 80,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [menuItems.length]);

  return {
    suggestions,
    loading,
    refreshSuggestions: fetchSuggestions,
  };
};