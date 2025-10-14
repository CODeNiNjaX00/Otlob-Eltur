import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';
import { Restaurant, Order, User, UserRole, Dish } from '../types';

// State interface
interface DataState {
  restaurants: Restaurant[];
  orders: Order[];
  users: User[];
}

type AddRestaurantAndUserData = Omit<Restaurant, 'id' | 'menu'> & {
    email: string;
    password?: string;
};

// Context Type
interface DataContextType {
  dataState: DataState;
  loading: boolean;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addRestaurant: (restaurantData: AddRestaurantAndUserData) => Promise<void>;
  updateRestaurant: (restaurant: Restaurant) => Promise<void>;
  deleteRestaurant: (restaurantId: number) => Promise<void>;
  fetchRestaurantWithMenu: (restaurantId: string) => Promise<Restaurant | null>;
  addOrder: (orderData: Omit<Order, 'id' | 'date' | 'status' | 'applicantIds' | 'assignedDeliveryId'>) => Promise<Order>;
  updateOrderStatus: (orderId: number, status: Order['status'], notes?: string) => Promise<void>;
  applyForOrder: (orderId: number, deliveryId: string) => Promise<void>;
  assignDelivery: (orderId: number, deliveryId: string) => Promise<void>;
  addDish: (dish: Omit<Dish, 'id'>, restaurantId: number) => Promise<void>;
  updateDish: (dish: Dish) => Promise<void>;
  deleteDish: (dishId: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [dataState, setDataState] = useState<DataState>({ restaurants: [], orders: [], users: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: restaurantData, error: restaurantsError } = await supabase.from('restaurants').select('*, dishes(*)');
      if (restaurantsError) throw restaurantsError;

      const restaurants: Restaurant[] = restaurantData ? restaurantData.map(r => {
        const { dishes, image_url, ...rest } = r;
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
          query = supabase.from('orders').select('*, order_items(*, dishes(*))').eq('restaurant_id', user.restaurantId);
        } else if (user.role === UserRole.DELIVERY) {
          query = supabase.from('orders').select('*, order_items(*, dishes(*))').in('status', ['in_progress', 'out_for_delivery']);
        } else {
          query = supabase.from('orders').select('*, order_items(*, dishes(*))').eq('customer_id', user.id);
        }
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
      
      setDataState({ restaurants, orders, users });
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchRestaurantWithMenu = async (restaurantId: string): Promise<Restaurant | null> => {
    try {
        const { data, error } = await supabase.from('restaurants').select('*, dishes(*)').eq('id', restaurantId).single();
        if (error) throw error;
        if (!data) return null;
        const { dishes, image_url, ...rest } = data;
        return { ...rest, imageUrl: image_url, menu: dishes.map(d => ({...d, imageUrl: d.image_url})) || [] } as Restaurant;
    } catch (error: any) {
        console.error('Error fetching restaurant:', error.message);
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

  const updateUser = async (userToUpdate: User) => {
    const { id, email, ...restOfUser } = userToUpdate;
    const { data, error } = await supabase.from('profiles').update(restOfUser).eq('id', id);
    if (error) {
        console.error("Error updating user:", error);
        throw error;
    } else {
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

  const addRestaurant = async (data: AddRestaurantAndUserData) => {
    console.log("Attempting to add restaurant:", data);
    const { data: newRestaurant, error } = await supabase
      .from('restaurants')
      .insert({ name: data.name, cuisine: data.cuisine, rating: data.rating, delivery_time: data.deliveryTime, image_url: data.imageUrl })
      .select().single();
    if (error) {
        console.error("Error adding restaurant:", error);
        throw error;
    }
    console.log("Successfully added restaurant:", newRestaurant);
    await fetchData();
  };

  const updateRestaurant = async (restaurant: Restaurant) => {
    const { menu, imageUrl, ...rest } = restaurant;
    const { data: updatedRestaurant, error } = await supabase.from('restaurants').update({ ...rest, image_url: imageUrl }).eq('id', restaurant.id);
    if (error) throw error;
    await fetchData();
  };

  const deleteRestaurant = async (restaurantId: number) => {
    const { error } = await supabase.from('restaurants').delete().eq('id', restaurantId);
    if (error) throw error;
    await fetchData();
  };

  const addDish = async (dish: Omit<Dish, 'id'>, restaurantId: number) => {
    const { imageUrl, ...rest } = dish;
    const { error } = await supabase.from('dishes').insert({ ...rest, image_url: imageUrl, restaurant_id: restaurantId });
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
    const { items, customerName, restaurantName, ...restOfOrderData } = orderData;
    const { data: newOrder, error } = await supabase.from('orders').insert({ ...restOfOrderData, customer_id: user.id, status: 'pending' }).select().single();
    if (error) throw error;
    const orderItems = items.map(item => ({ order_id: newOrder.id, dish_id: item.dish.id, quantity: item.quantity, notes: item.notes }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;
    const finalOrder = { ...newOrder, items, customerName, restaurantName };
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
    <DataContext.Provider value={{ dataState, loading, addUser, updateUser, deleteUser, addRestaurant, updateRestaurant, deleteRestaurant, fetchRestaurantWithMenu, addOrder, updateOrderStatus, applyForOrder, assignDelivery, addDish, updateDish, deleteDish }}>
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