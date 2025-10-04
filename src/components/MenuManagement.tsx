import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  Plus,
  TrendingUp,
  Lightbulb,
  Loader2
} from "lucide-react";
import { useMenuItems, MenuItem } from '@/hooks/useMenuItems';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { MenuItemForm } from './menu/MenuItemForm';
import { MenuItemCard } from './menu/MenuItemCard';
import { AIUpsellCard } from './menu/AIUpsellCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MenuManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const { 
    menuItems, 
    loading, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem,
    toggleAvailability 
  } = useMenuItems();

  const { suggestions, loading: suggestionsLoading } = useAISuggestions(menuItems);

  const handleAddNewItem = () => {
    setFormMode('add');
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setFormMode('edit');
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDeleteClick = (itemId: string, itemName: string) => {
    setItemToDelete({ id: itemId, name: itemName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteMenuItem(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFormSubmit = async (itemData: Omit<MenuItem, 'id'>) => {
    if (formMode === 'add') {
      return await addMenuItem(itemData);
    } else if (editingItem) {
      return await updateMenuItem(editingItem.id, itemData);
    }
    return { success: false };
  };

  const handleAddToOrder = (item: MenuItem) => {
    toast({
      title: "Added to Order",
      description: `${item.name} (₹${item.price}) added to current order`,
      variant: "default"
    });
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    await toggleAvailability(id, currentStatus);
  };

  const categories = ['all', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
            <p className="text-muted-foreground">Manage your restaurant menu and view AI-powered suggestions</p>
          </div>
          <Button variant="default" onClick={handleAddNewItem}>
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
                <MenuItemCard 
                  key={item.id} 
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteClick}
                  onToggleAvailability={handleToggleAvailability}
                />
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
                Smart recommendations based on menu items and customer preferences
              </p>
            </div>
            
            {suggestionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                  <AIUpsellCard 
                    key={idx} 
                    suggestion={suggestion}
                    onAddToOrder={handleAddToOrder}
                  />
                ))}
              </div>
            )}
            
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    AI-powered suggestions help increase order value by recommending complementary items
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Dialog */}
      <MenuItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{itemToDelete?.name}" from your menu.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MenuManagement;