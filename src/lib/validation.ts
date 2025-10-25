import { z } from 'zod';

export const MenuItemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').default(''),
  price: z.number().positive('Price must be positive').max(100000, 'Price is too high'),
  category: z.string().trim().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  preparation_time: z.number().int().min(1, 'Preparation time must be at least 1 minute').max(180, 'Preparation time must be less than 180 minutes'),
  is_popular: z.boolean().default(false),
  is_available: z.boolean().default(true),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')).default(''),
});

export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const OrderItemSchema = z.object({
  menu_item_id: z.string().uuid('Invalid menu item ID'),
  quantity: z.number().int().positive('Quantity must be positive').max(100, 'Quantity is too high'),
});

export const OrderSchema = z.object({
  table_id: z.string().uuid('Invalid table ID').optional(),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  total: z.number().positive('Total must be positive'),
  status: z.enum(['pending', 'preparing', 'served', 'paid']).default('pending'),
});

export type MenuItemInput = z.infer<typeof MenuItemSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
