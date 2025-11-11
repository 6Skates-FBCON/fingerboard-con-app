import { createClient } from '@supabase/supabase-js';

// Supabase configuration - these will be available after connecting to Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export interface Event {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  is_current: boolean;
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  phone_number?: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock data for development
export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Fingerboard Con 2026 - Boston Edition',
    start_date: '2026-04-24',
    end_date: '2026-04-26',
    location: 'Hilton Garden Inn Tewksbury Andover',
    is_current: true,
  },
  {
    id: '2',
    name: 'Fingerboard Con 2025 - Spring Edition',
    start_date: '2025-03-15',
    end_date: '2025-03-17',
    location: 'Los Angeles Convention Center',
    is_current: false,
  },
];

// API functions
export const api = {
  // Auth functions
  signUp: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not connected. Please connect to Supabase first.');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  signIn: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not connected. Please connect to Supabase first.');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  signOut: async () => {
    if (!supabase) {
      throw new Error('Supabase not connected. Please connect to Supabase first.');
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    if (!supabase) {
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  isUserAdmin: async (userId: string): Promise<boolean> => {
    if (!supabase) {
      return false;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.role === 'admin';
  },

  updateUserProfile: async (userId: string, profile: Partial<UserProfile>) => {
    if (!supabase) {
      throw new Error('Supabase not connected. Please connect to Supabase first.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return data;
  },
  
  // Events functions
  getEvents: async (): Promise<Event[]> => {
    // TODO: Replace with actual Supabase query when events table is created
    return mockEvents;
  },
  
  getCurrentEvent: async (): Promise<Event | null> => {
    // TODO: Replace with actual Supabase query when events table is created
    return mockEvents.find(event => event.is_current) || null;
  },
  
  getEventById: async (id: string): Promise<Event | null> => {
    // TODO: Replace with actual Supabase query when events table is created
    return mockEvents.find(event => event.id === id) || null;
  },
};