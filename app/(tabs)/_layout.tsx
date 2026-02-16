import { Tabs } from 'expo-router';
import { Chrome as Home, Calendar, ShoppingBag, Users, MapPin, UserCircle, Shield, Ticket } from 'lucide-react-native';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { isAdmin } = useIsAdmin();
  const { loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#4CAF50',
          borderTopWidth: 0,
          height: 88,
          paddingBottom: 24,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#E8F5E8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Buy',
          tabBarIcon: ({ size, color }) => (
            <ShoppingBag size={size} color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="my-tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ size, color }) => (
            <Ticket size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          title: 'Vendors',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          tabBarIcon: ({ size, color }) => (
            <MapPin size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ size, color }) => (
            <UserCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: 'Staff',
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} />
          ),
          href: isAdmin ? '/staff' : null,
        }}
      />
    </Tabs>
  );
}