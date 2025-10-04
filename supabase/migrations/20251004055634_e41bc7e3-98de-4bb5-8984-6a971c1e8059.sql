-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on restaurant_tables table
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders (authenticated staff can manage all orders)
CREATE POLICY "Allow authenticated users to view orders"
ON public.orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert orders"
ON public.orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orders"
ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete orders"
ON public.orders FOR DELETE TO authenticated USING (true);

-- RLS policies for order_items (authenticated staff can manage all order items)
CREATE POLICY "Allow authenticated users to view order_items"
ON public.order_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert order_items"
ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update order_items"
ON public.order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete order_items"
ON public.order_items FOR DELETE TO authenticated USING (true);

-- RLS policies for restaurant_tables (authenticated staff can manage all tables)
CREATE POLICY "Allow authenticated users to view restaurant_tables"
ON public.restaurant_tables FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert restaurant_tables"
ON public.restaurant_tables FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update restaurant_tables"
ON public.restaurant_tables FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete restaurant_tables"
ON public.restaurant_tables FOR DELETE TO authenticated USING (true);