import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus } from 'lucide-react';
import { AIUpsellSuggestion } from '@/hooks/useAISuggestions';

interface AIUpsellCardProps {
  suggestion: AIUpsellSuggestion;
  onAddToOrder: (item: AIUpsellSuggestion['item']) => void;
}

export const AIUpsellCard = ({ suggestion, onAddToOrder }: AIUpsellCardProps) => {
  return (
    <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            AI Suggestion
          </CardTitle>
          <Badge variant="outline" className="bg-background">
            {suggestion.confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold">{suggestion.item.name}</h4>
            <p className="text-sm text-muted-foreground">₹{suggestion.item.price}</p>
          </div>
          <p className="text-sm text-primary font-medium">{suggestion.reason}</p>
          <Button 
            size="sm" 
            variant="default" 
            className="w-full"
            onClick={() => onAddToOrder(suggestion.item)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};