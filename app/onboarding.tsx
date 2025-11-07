import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Chrome, Apple } from 'lucide-react-native';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const handleEmailSignUp = () => {
    router.push('/login');
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign up');
    router.push('/login');
  };

  const handleAppleSignUp = () => {
    // TODO: Implement Apple Sign In
    console.log('Apple sign up');
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/Fingerboard_Con_Transparent.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.eventTitle}>Fingerboard Con 2026</Text>
            <Text style={styles.subtitle}>Boston • April 24-26, 2026</Text>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Create an account to:</Text>
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🎫</Text>
              <Text style={styles.benefitText}>Purchase tickets securely</Text>
            </View>
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>📅</Text>
              <Text style={styles.benefitText}>Save your schedule</Text>
            </View>
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🔔</Text>
              <Text style={styles.benefitText}>Get event notifications</Text>
            </View>
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>⭐</Text>
              <Text style={styles.benefitText}>Access exclusive content</Text>
            </View>
          </View>

          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.emailButton} onPress={handleEmailSignUp}>
              <Mail size={20} color="#2E7D32" />
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
              <Chrome size={20} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignUp}>
              <Apple size={20} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.disclaimerText}>
              Sign in is required to purchase tickets and access exclusive features.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 240,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8F5E8',
    textAlign: 'center',
    marginTop: 8,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  benefitText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  authButtons: {
    gap: 16,
  },
  emailButton: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  emailButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2E7D32',
  },
  socialButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  socialButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});