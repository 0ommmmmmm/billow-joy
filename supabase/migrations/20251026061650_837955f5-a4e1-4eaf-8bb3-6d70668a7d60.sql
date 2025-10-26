-- Update tables structure to match requirements
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 4;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS current_order_id uuid REFERENCES orders(id);

-- Add table_number column if not exists (for better organization)
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS table_number integer;

-- Update orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS staff_id uuid REFERENCES auth.users(id);

-- Create bills table (separate from billing)
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  subtotal numeric NOT NULL,
  tax_percent numeric DEFAULT 5,
  tax_amount numeric NOT NULL,
  discount_percent numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  final_total numeric NOT NULL,
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

-- Enable RLS on bills
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Policies for bills
CREATE POLICY "Staff can view bills"
ON bills FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can manage bills"
ON bills FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON bills(payment_status);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE bills;

-- Update order_items to store price at time of order
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_at_order numeric;