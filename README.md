# Restaurant Management System

A complete restaurant management solution with menu management, orders, billing, and AI-powered upsell suggestions built with Lovable.

## ✅ System Status: FULLY FUNCTIONAL

All modules are now operational with proper authentication, database integration, and security.

---

## 🔐 Authentication

**Sign Up / Sign In**: Visit `/auth` to create an account or log in
- Email/password authentication  
- Automatic role assignment (all users get 'staff' role by default)
- Session persistence across page reloads
- Secure JWT-based authentication

**Default User Roles**:
- **Staff**: Can manage menu items, orders, and billing
- **Admin**: Full access (requires manual database role assignment)

---

## 🎯 Features

### ✅ Dashboard
- Real-time stats: Revenue, orders, average order value, customers served
- Active orders with status tracking
- Quick actions for menu, orders, and billing
- Today's highlights: Peak hours, top items, loyal customers

### ✅ Menu Management
- Full CRUD operations (Create, Read, Update, Delete)
- Search & filter by name, category
- Availability toggle for items
- AI-powered upsell suggestions (Google Gemini 2.5 Flash)
- Input validation with Zod schemas

### ✅ Orders
- Order tracking by table
- Status management (preparing → ready → completed)
- View items, quantities, and totals

### ✅ Billing
- Multiple payment methods (Cash, UPI, Card)
- Tip calculation (quick percentages or custom)
- Automatic tax & discount calculation
- WhatsApp receipt delivery with phone validation
- Print bill support

---

## 🔒 Security Features

✅ **Role-Based Access Control (RBAC)**
- Dedicated `user_roles` table
- Security definer functions (prevents RLS recursion)
- Staff and admin roles

✅ **Input Validation**
- Zod schemas for all inputs
- Menu items: price, name, category, prep time
- Phone numbers for WhatsApp

✅ **Row Level Security (RLS)**
- All tables protected
- Role-based policies on menu_items, orders, order_items, restaurant_tables

✅ **Authentication Security**
- JWT-based sessions
- Protected routes
- Automatic token refresh

---

## 🚀 Getting Started

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

1. Navigate to `/auth` and create an account
2. Explore the dashboard
3. Manage menu items (add/edit/delete)
4. Track orders and process billing

---

## 📊 Database Schema

**Tables**:
- `menu_items` - Menu with prices, categories, availability
- `orders` - Customer orders with table assignments
- `order_items` - Individual items within orders
- `restaurant_tables` - Table management
- `user_roles` - Staff and admin roles

**Functions**:
- `has_role()` - Security definer for role checks
- `handle_new_user()` - Auto-assigns 'staff' role

---

## 🤖 AI Integration

- **Lovable AI Gateway**: Google Gemini 2.5 Flash
- **Edge Function**: `ai-menu-suggestions`
- **Context-aware recommendations** based on current order

---

## 🔧 Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Edge Functions)
- Lovable AI Gateway (Google Gemini)
- Zod validation

---

## ✅ Success Summary

**✅ System ready — all modules functional!**

✅ Authentication (signup/login)  
✅ Role-based access control  
✅ Input validation  
✅ Menu management (full CRUD)  
✅ Order tracking  
✅ Billing with payments  
✅ AI upsell suggestions  
✅ WhatsApp receipts  
✅ Database security (RLS)  
✅ Protected routes  

---

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
