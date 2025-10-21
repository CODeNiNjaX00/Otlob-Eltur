import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';
import { Vendor, Order, User, UserRole, Dish, Category } from '../types';

// State interface
interface DataState {
  vendors: Vendor[];
  orders: Order[];
  users: User[];
  categories: Category[];
}

type AddVendorAndUserData = Omit<Vendor, 'id'> & {
    email: string;
    password?: string;
};

// Context Type
interface DataContextType {
  dataState: DataState;
  loading: boolean;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User & { password?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addVendor: (vendorData: AddVendorAndUserData) => Promise<void>;
  updateVendor: (vendor: Vendor) => Promise<void>;
  deleteVendor: (vendorId: number) => Promise<void>;
  fetchVendorWithMenu: (vendorId: string) => Promise<Vendor | null>;
  addOrder: (orderData: Omit<Order, 'id' | 'date' | 'status' | 'applicantIds' | 'assignedDeliveryId'>) => Promise<Order>;
  updateOrderStatus: (orderId: number, status: Order['status'], notes?: string) => Promise<void>;
  applyForOrder: (orderId: number, deliveryId: string) => Promise<void>;
  assignDelivery: (orderId: number, deliveryId: string) => Promise<void>;
  addDish: (dish: Omit<Dish, 'id'>, vendorId: number) => Promise<void>;
  updateDish: (dish: Dish) => Promise<void>;
  deleteDish: (dishId: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [dataState, setDataState] = useState<DataState>({ vendors: [], orders: [], users: [], categories: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: categoryData, error: categoriesError } = await supabase.from('categories').select('*');
      if (categoriesError) throw categoriesError;
      const categories: Category[] = categoryData || [];

      const { data: vendorData, error: vendorsError } = await supabase.from('vendors').select('*, dishes(*)');
      if (vendorsError) throw vendorsError;

      const vendors: Vendor[] = vendorData ? vendorData.map(v => {
        const { dishes, image_url, ...rest } = v;
        return { ...rest, imageUrl: image_url, menu: dishes || [] };
      }) : [];

      const { data: usersData, error: usersError } = await supabase.from('profiles').select('*');
      if (usersError) throw usersError;
      const users: User[] = usersData || [];

      let orders: Order[] = [];
      if (user) {
        let query;
        if (user.role === UserRole.ADMIN) {
          query = supabase.from('orders').select('*, order_items(*, dishes(*))');
        } else if (user.role === UserRole.RESTAURANT) {
          if (user.vendorId) { // Check if vendorId exists
            query = supabase.from('orders').select('*, order_items(*, dishes(*))').eq('vendor_id', user.vendorId);
          }
        } else if (user.role === UserRole.DELIVERY) {
          query = supabase.from('orders').select('*, order_items(*, dishes(*))').in('status', ['in_progress', 'out_for_delivery']);
        } else {
          query = supabase.from('orders').select('*, order_items(*, dishes(*))').eq('customer_id', user.id);
        }

        if (query) { // Only execute if a query was built
            const { data: orderData, error: ordersError } = await query;
            if (ordersError) throw ordersError;
            
            if (orderData) {
                orders = orderData.map(o => ({
                    ...o,
                    items: o.order_items.map(oi => ({
                        id: oi.id.toString(),
                        dish: oi.dishes ? { ...oi.dishes, imageUrl: oi.dishes.image_url } : null,
                        quantity: oi.quantity,
                        notes: oi.notes,
                    })),
                })) as Order[];
            }
        }
      }
      
      setDataState({ vendors, orders, users, categories });
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchVendorWithMenu = async (vendorId: string): Promise<Vendor | null> => {
    try {
        const { data, error } = await supabase.from('vendors').select('*, dishes(*)').eq('id', vendorId).single();
        if (error) throw error;
        if (!data) return null;
        const { dishes, image_url, ...rest } = data;
        return { ...rest, imageUrl: image_url, menu: dishes.map(d => ({...d, imageUrl: d.image_url})) || [] } as Vendor;
    } catch (error: any) {
        console.error('Error fetching vendor:', error.message);
        return null;
    }
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    const { error } = await supabase.functions.invoke('create-user', {
        body: userData,
    });
    if (error) {
        console.error('Error creating user:', error);
        throw error;
    } else {
        await fetchData();
    }
  };

  const updateUser = async (userToUpdate: User & { password?: string }) => {
    const { id, email, password, vendorId, ...restOfUser } = userToUpdate;
    
    const updateData: { [key: string]: any } = { ...restOfUser };
    if (vendorId !== undefined) {
      updateData.vendor_id = vendorId;
    }

    const { data, error } = await supabase.from('profiles').update(updateData).eq('id', id);
    if (error) {
        console.error("Error updating user:", error);
        throw error;
    } else {
        if (password) {
            console.warn("Password update from admin dashboard is not implemented yet.");
        }
        await fetchData();
    }
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId },
    });
    if (error) {
        console.error('Error deleting user:', error);
        throw error;
    } else {
        await fetchData();
    }
  };

  const addVendor = async (data: AddVendorAndUserData) => {
    const { menu, ...vendorData } = data;
    const { data: newVendor, error } = await supabase
      .from('vendors')
      .insert({ name: vendorData.name, description: vendorData.description, cuisine: vendorData.cuisine, rating: vendorData.rating, delivery_time: vendorData.deliveryTime, image_url: vendorData.imageUrl, category_id: vendorData.category_id })
      .select().single();
    if (error) {
        console.error("Error adding vendor:", error);
        throw error;
    }

    if (newVendor) {
        await addUser({
            name: vendorData.name,
            email: vendorData.email,
            password: vendorData.password,
            role: UserRole.RESTAURANT,
            vendorId: newVendor.id,
        });

        if (menu) {
            const menuItems = menu.map((item) => ({
                ...item,
                vendor_id: newVendor.id,
            }));
            const { error: menuError } = await supabase.from('dishes').insert(menuItems);
            if (menuError) {
                console.error("Error adding menu items:", menuError);
                throw menuError;
            }
        }
    }

    await fetchData();
  };

  const updateVendor = async (vendor: Vendor) => {
    const { menu, imageUrl, ...rest } = vendor;
    const { data: updatedVendor, error } = await supabase.from('vendors').update({ ...rest, image_url: imageUrl }).eq('id', vendor.id);
    if (error) throw error;
    await fetchData();
  };

  const deleteVendor = async (vendorId: number) => {
    const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
    if (error) throw error;
    await fetchData();
  };

  const addDish = async (dish: Omit<Dish, 'id'>, vendorId: number) => {
    const { imageUrl, ...rest } = dish;
    const { error } = await supabase.from('dishes').insert({ ...rest, image_url: imageUrl, vendor_id: vendorId });
    if (error) throw error;
    await fetchData();
  };

  const updateDish = async (dish: Dish) => {
    const { id, imageUrl, ...rest } = dish;
    const { error } = await supabase.from('dishes').update({ ...rest, image_url: imageUrl }).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteDish = async (dishId: number) => {
    const { error } = await supabase.from('dishes').delete().eq('id', dishId);
    if (error) throw error;
    await fetchData();
  };
  
  const addOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status' | 'applicantIds' | 'assignedDeliveryId'>): Promise<Order> => {
    if (!user) throw new Error("User must be logged in to create an order.");
    const { items, customerName, vendorName, ...restOfOrderData } = orderData;
    const { data: newOrder, error } = await supabase.from('orders').insert({ ...restOfOrderData, customer_id: user.id, status: 'pending' }).select().single();
    if (error) throw error;
    const orderItems = items.map(item => ({ order_id: newOrder.id, dish_id: item.dish.id, quantity: item.quantity, notes: item.notes }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;
    const finalOrder = { ...newOrder, items, customerName, vendorName };
    await fetchData();
    return finalOrder;
  };

  const updateOrderStatus = async (orderId: number, status: Order['status'], notes?: string) => {
    const { data: updatedOrder, error } = await supabase.from('orders').update({ status, problem_notes: notes }).eq('id', orderId).select().single();
    if (error) throw error;
    await fetchData();
  };

  const applyForOrder = async (orderId: number, deliveryId: string) => {
    const { error } = await supabase.from('order_applicants').insert({ order_id: orderId, applicant_id: deliveryId });
    if (error) throw error;
  };

  const assignDelivery = async (orderId: number, deliveryId: string) => {
      const { error } = await supabase.from('orders').update({ assigned_delivery_id: deliveryId, status: 'out_for_delivery' }).eq('id', orderId);
      if (error) throw error;
  };
  
  return (
    <DataContext.Provider value={{ dataState, loading, addUser, updateUser, deleteUser, addVendor, updateVendor, deleteVendor, fetchVendorWithMenu, addOrder, updateOrderStatus, applyForOrder, assignDelivery, addDish, updateDish, deleteDish }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};