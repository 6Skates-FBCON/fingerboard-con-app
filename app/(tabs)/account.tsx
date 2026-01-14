import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, User, Mail, Bell, Settings, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';

export default function AccountScreen() {
  const { user, session, role } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSignOut = async () => {
    console.log('===== SIGN OUT BUTTON CLICKED =====');

    try {
      if (!supabase) {
        console.log('Supabase not available');
        Alert.alert('Error', 'Supabase not available');
        return;
      }

      console.log('Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log('Sign out error:', error);
        Alert.alert('Error', 'Failed to sign out: ' + error.message);
        return;
      }

      console.log('Sign out successful, redirecting to /login');
      router.replace('/login');
    } catch (error) {
      console.log('Exception during sign out:', error);
      Alert.alert('Error', 'Failed to sign out: ' + (error as Error).message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!supabase || !session) {
        Alert.alert('Error', 'Authentication error');
        return;
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/delete-account`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      await supabase.auth.signOut();

      router.replace('/(tabs)');

      setTimeout(() => {
        Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
      }, 500);
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account: ' + (error as Error).message);
      throw error;
    }
  };

  if (!session || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </LinearGradient>

        <View style={styles.notSignedInContainer}>
          <User size={80} color="#66BB6A" strokeWidth={1.5} />
          <Text style={styles.notSignedInTitle}>Welcome!</Text>
          <Text style={styles.notSignedInText}>
            Sign in to view your profile, tickets, and access personalized features.
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFC107']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.profileRow}>
              <Mail size={18} color="#E8F5E8" />
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
            {role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#FFFFFF" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <Settings size={20} color="#E8F5E8" />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>

          <TouchableOpacity style={styles.menuItem} disabled>
            <Bell size={20} color="#E8F5E8" />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Text style={styles.comingSoonBadge}>Soon</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity
            style={styles.deleteMenuItem}
            onPress={() => setShowDeleteModal(true)}
          >
            <Trash2 size={20} color="#FF5252" />
            <Text style={styles.deleteMenuItemText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        userEmail={user.email || ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  header: {
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  notSignedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notSignedInTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 24,
  },
  notSignedInText: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
  },
  profileSection: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2E7D32',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adminBadge: {
    backgroundColor: '#FFD700',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2E7D32',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF33',
    paddingVertical: 12,
    borderRadius: 12,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  comingSoonBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    backgroundColor: '#FFFFFF22',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  deleteMenuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5252',
  },
});
