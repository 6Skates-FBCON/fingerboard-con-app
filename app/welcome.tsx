import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, LogIn } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const handleContinueWithoutAccount = async () => {
    await AsyncStorage.setItem('browsing_mode', 'true');
    router.replace('/(tabs)');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Calendar size={80} color="#FFD700" strokeWidth={1.5} />
            <Text style={styles.year}>2025</Text>
            <Text style={styles.subtitle}>Spring Edition</Text>
            <Text style={styles.description}>
              Welcome to FBCON! Explore the schedule, vendors, and location, or sign in to purchase tickets and manage your account.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinueWithoutAccount}
            >
              <Text style={styles.continueButtonText}>Continue without account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
            >
              <LogIn size={20} color="#2E7D32" style={styles.buttonIcon} />
              <Text style={styles.signInButtonText}>Sign in / Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  year: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
  },
  signInButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonIcon: {
    marginRight: 8,
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
