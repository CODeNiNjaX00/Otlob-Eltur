// Fix: Added full content for types.ts to define application-wide types.
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  DELIVERY = 'delivery',
  RESTAURANT = 'restaurant',
}

export interface User {
  id: string; // Changed from number to string for Supabase UUID
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone_number?: string;
  district?: string;
  address_details?: string;
  vendorId?: number;
}

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface Category {
  id: number;
  name: string;
  image_url?: string;
}

export interface Vendor {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  imageUrl: string;
  menu: Dish[];
  category_id: number;
}

export interface CartItem {
  id: string; // Unique ID for the cart line item
  dish: Dish;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: number;
  customerName: string;
  vendorName: string;
  deliveryAddress: string;
  totalPrice: number;
  status: 'pending' | 'in_progress' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: CartItem[];
  date: string; // ISO date string (e.g., "2023-10-27")
  problemNotes?: string;
  applicantIds: string[]; // Array of user IDs for delivery personnel who applied
  assignedDeliveryId: string | null; // The user ID of the assigned delivery person
}