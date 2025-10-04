-- Enable RLS on menu_items table
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (staff/admin) to view all menu items
CREATE POLICY "Allow authenticated users to view menu items"
ON public.menu_items
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert menu items
CREATE POLICY "Allow authenticated users to insert menu items"
ON public.menu_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update menu items
CREATE POLICY "Allow authenticated users to update menu items"
ON public.menu_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete menu items
CREATE POLICY "Allow authenticated users to delete menu items"
ON public.menu_items
FOR DELETE
TO authenticated
USING (true);

-- Add image_url column if it doesn't exist
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS image_url text;