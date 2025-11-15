import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { api } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting sign in...');
      const result = await api.signIn(email, password);
      console.log('Sign in successful:', result);

      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'An error occurred during authentication');
      setIsLoading(false);
    }
  };

  const handleGoToRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logoText}>FINGERBOARD CON</Text>
            <Text style={styles.eventYear}>Boston 2026</Text>
            <View style={styles.eventCard}>
              <Text style={styles.eventDate}>April 24-26, 2026 • Tewksbury, MA</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>
              Welcome Back
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email address"
                  placeholderTextColor="#FFFFFF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor="#FFFFFF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#FFFFFF" />
                  ) : (
                    <Eye size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.authButton, isLoading && styles.authButtonLoading]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Text style={styles.authButtonText}>
                {isLoading ? 'Please wait...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={handleGoToRegister}>
                <Text style={styles.switchButton}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#76B84B',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
  },
  eventYear: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#66BB6A',
    paddingHorizontal: 20,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    padding: 8,
  },
  authButton: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  authButtonLoading: {
    backgroundColor: '#FFC107',
  },
  authButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
  },
  forgotButton: {
    alignItems: 'center',
    marginBottom: 32,
  },
  forgotText: {
    fontSize: 15,
    color: '#FFD700',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  switchText: {
    fontSize: 15,
    color: '#E8F5E8',
  },
  switchButton: {
    fontSize: 15,
    color: '#FFD700',
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: '#FF5252',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});