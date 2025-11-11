import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Lock } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface Profile {
  display_name: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
}

export default function SettingsScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    phone_number: '',
    address: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, phone_number, address, city, state_province, postal_code, country')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile({
          display_name: data.display_name || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          city: data.city || '',
          state_province: data.state_province || '',
          postal_code: data.postal_code || '',
          country: data.country || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name || null,
          phone_number: profile.phone_number || null,
          address: profile.address || null,
          city: profile.city || null,
          state_province: profile.state_province || null,
          postal_code: profile.postal_code || null,
          country: profile.country || null,
        })
        .eq('id', user.id);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to save profile' });
        console.error('Error saving profile:', error);
        return;
      }

      setMessage({ type: 'success', text: 'Profile saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save profile' });
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please enter new password' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        return;
      }

      setMessage({ type: 'success', text: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
      console.error('Error changing password:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.backButton} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {message && (
          <View style={[styles.messageBox, message.type === 'error' ? styles.errorBox : styles.successBox]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={16} color="#E8F5E8" />
              <Text style={styles.labelText}>Display Name</Text>
            </View>
            <TextInput
              style={styles.input}
              value={profile.display_name || ''}
              onChangeText={(text) => setProfile({ ...profile, display_name: text })}
              placeholder="Enter your name"
              placeholderTextColor="#FFFFFF66"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Mail size={16} color="#E8F5E8" />
              <Text style={styles.labelText}>Email</Text>
            </View>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ''}
              editable={false}
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Phone size={16} color="#E8F5E8" />
              <Text style={styles.labelText}>Phone Number</Text>
            </View>
            <TextInput
              style={styles.input}
              value={profile.phone_number || ''}
              onChangeText={(text) => setProfile({ ...profile, phone_number: text })}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#FFFFFF66"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <MapPin size={16} color="#E8F5E8" />
              <Text style={styles.labelText}>Address</Text>
            </View>
            <TextInput
              style={styles.input}
              value={profile.address || ''}
              onChangeText={(text) => setProfile({ ...profile, address: text })}
              placeholder="Street address"
              placeholderTextColor="#FFFFFF66"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.labelText}>City</Text>
              <TextInput
                style={styles.input}
                value={profile.city || ''}
                onChangeText={(text) => setProfile({ ...profile, city: text })}
                placeholder="City"
                placeholderTextColor="#FFFFFF66"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.labelText}>State/Province</Text>
              <TextInput
                style={styles.input}
                value={profile.state_province || ''}
                onChangeText={(text) => setProfile({ ...profile, state_province: text })}
                placeholder="State/Province"
                placeholderTextColor="#FFFFFF66"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.labelText}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={profile.postal_code || ''}
                onChangeText={(text) => setProfile({ ...profile, postal_code: text })}
                placeholder="12345"
                placeholderTextColor="#FFFFFF66"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.labelText}>Country</Text>
              <TextInput
                style={styles.input}
                value={profile.country || ''}
                onChangeText={(text) => setProfile({ ...profile, country: text })}
                placeholder="Country"
                placeholderTextColor="#FFFFFF66"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={saveProfile}
            disabled={saving}
          >
            <Save size={18} color="#2E7D32" />
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Lock size={16} color="#E8F5E8" />
              <Text style={styles.labelText}>New Password</Text>
            </View>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#FFFFFF66"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Lock size={16} color="#E8F5E8" />
              <Text style={styles.labelText}>Confirm New Password</Text>
            </View>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#FFFFFF66"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={changePassword}
            disabled={saving}
          >
            <Lock size={18} color="#2E7D32" />
            <Text style={styles.saveButtonText}>{saving ? 'Changing...' : 'Change Password'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#E8F5E8',
    fontWeight: '600',
  },
  messageBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: '#4CAF50',
  },
  errorBox: {
    backgroundColor: '#F44336',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8F5E8',
  },
  input: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledInput: {
    opacity: 0.6,
  },
  helperText: {
    fontSize: 12,
    color: '#E8F5E8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
  },
});
