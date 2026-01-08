import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api, supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const token_hash = Array.isArray(params.token_hash) ? params.token_hash[0] : params.token_hash;
  const type = Array.isArray(params.type) ? params.type[0] : params.type;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasValidSession, setHasValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const verifyResetToken = async () => {
      console.log('Reset password page loaded');
      console.log('Token hash:', token_hash);
      console.log('Type:', type);
      console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');

      if (!supabase) {
        setError('Unable to connect to authentication service');
        setCheckingSession(false);
        return;
      }

      try {
        // If we have a token_hash from the email link, verify it
        if (token_hash && type === 'recovery') {
          console.log('Attempting to verify OTP token...');
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'recovery',
          });

          console.log('Verify OTP result:', data);
          console.log('Verify OTP error:', verifyError);

          if (verifyError) {
            console.error('Token verification error:', verifyError);
            setError('Invalid or expired reset link. Please request a new password reset.');
            setCheckingSession(false);
            return;
          }

          if (data?.session) {
            console.log('Session created successfully');
            setHasValidSession(true);
          } else {
            console.error('No session in response');
            setError('Unable to verify reset link. Please request a new password reset.');
          }
        } else {
          console.log('No token_hash or type mismatch, checking existing session...');
          // Check if there's already a valid session
          const { data: { session } } = await supabase.auth.getSession();
          console.log('Existing session:', session);
          if (session?.user) {
            setHasValidSession(true);
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        }
      } catch (err) {
        console.error('Error verifying reset link:', err);
        setError('Unable to verify reset link. Please try again.');
      } finally {
        setCheckingSession(false);
      }
    };

    verifyResetToken();
  }, [token_hash, type]);

  const handleResetPassword = async () => {
    if (!hasValidSession) {
      setError('Invalid session. Please request a new password reset link.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.updatePassword(password);
      setSuccess('Password updated successfully!');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Verifying reset link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/fbcon_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.eventYear}>Boston 2026</Text>
            <View style={styles.eventCard}>
              <Text style={styles.eventDate}>April 24-26, 2026 • Tewksbury, MA</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>
              Create New Password
            </Text>

            <Text style={styles.description}>
              Enter your new password below.
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="New Password"
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

              <View style={styles.inputWrapper}>
                <Lock size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#FFFFFF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#FFFFFF" />
                  ) : (
                    <Eye size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.resetButton, (isLoading || !hasValidSession) && styles.resetButtonLoading]}
              onPress={handleResetPassword}
              disabled={isLoading || !hasValidSession}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>

            {!hasValidSession && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace('/forgot-password')}
              >
                <Text style={styles.backButtonText}>
                  Request New Reset Link
                </Text>
              </TouchableOpacity>
            )}
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
  logo: {
    width: 300,
    height: 100,
    marginBottom: 12,
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
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
  resetButton: {
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
  resetButtonLoading: {
    backgroundColor: '#FFC107',
  },
  resetButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
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
  successContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  successText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
