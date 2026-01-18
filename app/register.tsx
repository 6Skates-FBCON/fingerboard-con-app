import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Phone, MapPin, Globe, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { api } from '@/lib/supabase';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !phoneNumber || !address || !city || !country) {
      setError('Please fill in all required fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (international - at least 7 digits)
    const cleanPhone = phoneNumber.replace(/[-\s().+]/g, '');
    if (cleanPhone.length < 7 || !/^[0-9+]+$/.test(phoneNumber.replace(/[-\s().]/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Starting registration...');
      const response = await api.signUp(email, password);
      console.log('SignUp response:', response);

      const userId = response.user?.id;

      if (!userId) {
        throw new Error('Registration failed: No user ID returned');
      }

      console.log('Updating user profile for:', userId);

      try {
        await api.updateUserProfile(userId, {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          address,
          city,
          state_province: stateProvince,
          postal_code: postalCode,
          country,
        });
        console.log('Profile updated successfully');
      } catch (profileError: any) {
        console.error('Error updating profile:', profileError);
      }

      setSuccess('Registration successful! Please check your email for a confirmation link. You can sign in once you verify your email address.');

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhoneNumber('');
      setAddress('');
      setCity('');
      setStateProvince('');
      setPostalCode('');
      setCountry('');

      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.year}>2025</Text>
          <Text style={styles.subtitle}>Spring Edition</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Create Account</Text>

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
            <View style={styles.rowInputs}>
              <View style={[styles.inputWrapper, styles.halfWidth]}>
                <User size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="First Name"
                  placeholderTextColor="#FFFFFF"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputWrapper, styles.halfWidth]}>
                <User size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Last Name"
                  placeholderTextColor="#FFFFFF"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

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
              <Phone size={20} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Phone Number"
                placeholderTextColor="#FFFFFF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MapPin size={20} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Street Address"
                placeholderTextColor="#FFFFFF"
                value={address}
                onChangeText={setAddress}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MapPin size={20} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="City"
                placeholderTextColor="#FFFFFF"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Globe size={20} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Country"
                placeholderTextColor="#FFFFFF"
                value={country}
                onChangeText={setCountry}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputWrapper, styles.halfWidth]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="State/Province (optional)"
                  placeholderTextColor="#FFFFFF"
                  value={stateProvince}
                  onChangeText={setStateProvince}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputWrapper, styles.halfWidth]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Postal Code (optional)"
                  placeholderTextColor="#FFFFFF"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  autoCorrect={false}
                />
              </View>
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

            <View style={styles.inputWrapper}>
              <Lock size={20} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                placeholder="Confirm Password"
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
            style={[styles.registerButton, isLoading && styles.registerButtonLoading]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.switchButton}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
      </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  year: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
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
  registerButton: {
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
  registerButtonLoading: {
    backgroundColor: '#FFC107',
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
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
  termsContainer: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  termsText: {
    fontSize: 13,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
});