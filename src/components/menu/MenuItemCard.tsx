import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Star, ChefHat } from 'lucide-react';
import { MenuItem } from '@/hooks/useMenuItems';
import { Switch } from '@/components/ui/switch';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string, name: string) => void;
  onToggleAvailability: (id: string, currentStatus: boolean) => void;
}

export const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }: MenuItemCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {item.is_popular && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-primary/90">
            <Star className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {item.name}
            </CardTitle>
            <CardDescription className="mt-1">{item.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">₹{item.price}</span>
            <Badge variant="outline" className="text-xs">
              <ChefHat className="h-3 w-3 mr-1" />
              {item.preparation_time}m
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {item.is_available ? 'Available' : 'Unavailable'}
            </span>
            <Switch
              checked={item.is_available}
              onCheckedChange={() => onToggleAvailability(item.id, item.is_available)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onDelete(item.id, item.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};