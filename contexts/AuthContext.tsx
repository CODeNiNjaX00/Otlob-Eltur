import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { User, UserRole } from '../types';

type RegisterData = {
  email: string;
  password: string;
  name: string;
  phone_number: string;
  district: string;
  address_details: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .rpc('get_user_profile', { user_id: supabaseUser.id })
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: PostgREST "No rows found"
        throw error;
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          phone_number: profile.phone_number,
          district: profile.district,
          address_details: profile.address_details,
          restaurantId: profile.restaurant_id,
        });
      } else {
        // This is a fallback in case the trigger fails.
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: supabaseUser.id, 
            email: supabaseUser.email,
            name: supabaseUser.user_metadata.full_name || 'New User', 
            role: UserRole.CUSTOMER 
          })
          .select()
          .single();

        if (insertError) {
            throw insertError;
        }

        setUser({
            id: newProfile.id,
            name: newProfile.name,
            email: newProfile.email,
            role: newProfile.role,
        });
      }
    } catch (error: any) {
      console.error('Error in fetchUserProfile:', error.message);
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (data: RegisterData) => {
    const { email, password, name, ...rest } = data;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          ...rest
        },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }; 

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};