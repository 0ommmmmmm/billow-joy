import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  ChefHat,
  Lightbulb
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isPopular: boolean;
  isAvailable: boolean;
  preparationTime: number;
}

interface AIUpsellSuggestion {
  item: MenuItem;
  reason: string;
  confidence: number;
}

const MenuManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken pieces',
      price: 320,
      category: 'Main Course',
      isPopular: true,
      isAvailable: true,
      preparationTime: 25
    },
    {
      id: '2',
      name: 'Paneer Tikka',
      description: 'Marinated cottage cheese grilled to perfection',
      price: 280,
      category: 'Starters',
      isPopular: true,
      isAvailable: true,
      preparationTime: 15
    },
    {
      id: '3',
      name: 'Biryani',
      description: 'Fragrant basmati rice with aromatic spices',
      price: 350,
      category: 'Main Course',
      isPopular: false,
      isAvailable: true,
      preparationTime: 30
    },
    {
      id: '4',
      name: 'Kulfi',
      description: 'Traditional Indian ice cream with cardamom',
      price: 120,
      category: 'Desserts',
      isPopular: false,
      isAvailable: true,
      preparationTime: 5
    }
  ]);

  const handleAddNewItem = () => {
    toast({
      title: "Add New Item",
      description: "New menu item form would open here. Connect to Supabase for full functionality.",
      variant: "default"
    });
  };

  const handleEditItem = (itemId: string, itemName: string) => {
    toast({
      title: "Edit Item",
      description: `Edit form for "${itemName}" would open here`,
      variant: "default"
    });
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Item Deleted",
      description: `"${itemName}" has been removed from the menu`,
      variant: "default"
    });
  };

  const handleAddToOrder = (item: MenuItem) => {
    toast({
      title: "Added to Order",
      description: `${item.name} (₹${item.price}) added to current order`,
      variant: "default"
    });
  };

  // Mock AI upsell suggestions based on current order
  const aiSuggestions: AIUpsellSuggestion[] = [
    {
      item: menuItems[3], // Kulfi
      reason: "Perfect dessert pairing with spicy main course",
      confidence: 85
    },
    {
      item: menuItems[1], // Paneer Tikka
      reason: "Popular starter, increases order value by 40%",
      confidence: 92
    }
  ];

  const categories = ['all', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const MenuItem = ({ item }: { item: MenuItem }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {item.isPopular && (
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
              {item.preparationTime}m
            </Badge>
          </div>
          <Badge variant={item.isAvailable ? "success" : "destructive"}>
            {item.isAvailable ? 'Available' : 'Out of Stock'}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => handleEditItem(item.id, item.name)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => handleDeleteItem(item.id, item.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const AIUpsellCard = ({ suggestion }: { suggestion: AIUpsellSuggestion }) => (
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
            onClick={() => handleAddToOrder(suggestion.item)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">Manage your restaurant menu and view AI-powered suggestions</p>
        </div>
        <Button variant="warm" onClick={handleAddNewItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Items' : category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              AI Upsell Suggestions
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Smart recommendations based on current orders and customer preferences
            </p>
          </div>
          
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, idx) => (
              <AIUpsellCard key={idx} suggestion={suggestion} />
            ))}
          </div>
          
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Connect to Supabase to enable advanced AI-powered menu optimization and customer preference analysis
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;