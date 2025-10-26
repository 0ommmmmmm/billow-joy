import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Clock } from 'lucide-react';
import { useTables } from '@/hooks/useTables';

export const TableManagement = () => {
  const { tables, loading, addTable } = useTables();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    table_number: '',
    capacity: '4',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAddTable = async () => {
    const result = await addTable({
      name: newTable.name,
      table_number: parseInt(newTable.table_number) || null,
      status: 'available',
      capacity: parseInt(newTable.capacity) || 4,
    });

    if (result.success) {
      setIsDialogOpen(false);
      setNewTable({ name: '', table_number: '', capacity: '4' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tables...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground">Manage restaurant tables and their status</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Table Name</Label>
                <Input
                  id="name"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  placeholder="e.g., Table 1"
                />
              </div>
              <div>
                <Label htmlFor="table_number">Table Number</Label>
                <Input
                  id="table_number"
                  type="number"
                  value={newTable.table_number}
                  onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                  placeholder="4"
                />
              </div>
              <Button onClick={handleAddTable} className="w-full">
                Add Table
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{table.name}</CardTitle>
                <Badge className={getStatusColor(table.status)}>
                  {table.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                Capacity: {table.capacity} people
              </div>
              {table.current_order_id && (
                <div className="flex items-center text-sm text-amber-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Order in progress
                </div>
              )}
              {table.table_number && (
                <div className="text-sm">
                  Table #{table.table_number}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tables found</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Table
          </Button>
        </div>
      )}
    </div>
  );
};
