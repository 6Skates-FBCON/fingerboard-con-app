import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ExternalLink, Ticket, Star, Users, Calendar, Check, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import LoginPromptModal from '@/components/LoginPromptModal';

export default function TicketsScreen() {
  const { session, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vendorCodeModalVisible, setVendorCodeModalVisible] = useState(false);
  const [vendorCode, setVendorCode] = useState('');
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingTicketName, setPendingTicketName] = useState<string>('');
  const [productsRequiringCode, setProductsRequiringCode] = useState<Set<string>>(new Set());

  interface TicketType {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    features: string[];
    popular?: boolean;
    soldOut?: boolean;
    stripePriceId?: string;
  }

  useEffect(() => {
    const fetchProductRequirements = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_products')
          .select('name, requires_access_code')
          .eq('active', true)
          .eq('requires_access_code', true);

        if (error) {
          console.error('Error fetching product requirements:', error);
          return;
        }

        if (data) {
          const productNames = new Set(data.map(p => p.name));
          setProductsRequiringCode(productNames);
        }
      } catch (error) {
        console.error('Error loading product requirements:', error);
      }
    };

    fetchProductRequirements();
  }, []);

  const ticketTypes: TicketType[] = [
    {
      id: 'general',
      name: 'General Admission',
      price: '$25',
      features: [
        'All 3 days access',
        'Access to all public areas',
        'Vendor hall access',
      ],
      stripePriceId: 'price_1SNP5KLz01V9GjOutNzMowcF',
    },
    {
      id: 'deck combo',
      name: 'Complete & Admission',
      price: '$50',
      popular: true,
      features: [
        'All 3 days access',
        'Access to all public areas',
        'Vendor access',
        'Commemorative Complete Fingerboard',
      ],
      stripePriceId: 'price_1SoWBnLz01V9GjOuJ3ef4l4w',
    },
    {
      id: 'blackriver deck combo',
      name: 'Blackriver FBCon Deck & Admission',
      price: '$70',
      features: [
        'All 3 days access',
        'Access to all public areas',
        'Vendor access',
        'Exclusive FBCON Blackriver Fingerboard',
      ],
      stripePriceId: 'price_1SNPBDLz01V9GjOuOn3ajum9',
    },
    {
      id: 'vendor',
      name: 'Vendor Package',
      price: '$280',
      features: [
        'Official use of the Fingerboard Con logo for your event releases',
        'Joint marketing + cross-promotion through our channels',
        'Exclusive limited-edition Vendor FB Con fingerboard (only for vendors)',
        '2 full admission passes to Fingerboard Con',
        'Access to vendor-only networking event',
      ],
      stripePriceId: 'price_1SoWqNLz01V9GjOuKJ9cm8Wv',
    },
  ];

  const validateVendorCode = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      Alert.alert('Invalid Code', 'Please enter an access code.');
      return false;
    }

    setValidatingCode(true);
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const queryPromise = supabase
        .from('vendor_codes')
        .select('id, code, is_active, used_count, max_uses')
        .eq('code', code.trim().toUpperCase())
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error validating code:', error);
        Alert.alert('Error', `Failed to validate access code: ${error.message || 'Please try again.'}`);
        return false;
      }

      if (!data) {
        Alert.alert('Invalid Code', 'This access code is not valid.');
        return false;
      }

      if (!data.is_active) {
        Alert.alert('Code Inactive', 'This access code is no longer active.');
        return false;
      }

      if (data.max_uses !== null && data.used_count >= data.max_uses) {
        Alert.alert('Code Expired', 'This access code has reached its maximum number of uses.');
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Validation error:', error);
      const message = error.message === 'Request timeout'
        ? 'The request timed out. Please check your internet connection and try again.'
        : 'An error occurred while validating the code. Please try again.';
      Alert.alert('Error', message);
      return false;
    } finally {
      setValidatingCode(false);
    }
  };

  const handleVendorCodeSubmit = async () => {
    const isValid = await validateVendorCode(vendorCode);
    if (isValid && pendingPriceId) {
      setVendorCodeModalVisible(false);
      await proceedWithPurchase(pendingPriceId, vendorCode.trim().toUpperCase());
      setVendorCode('');
      setPendingPriceId(null);
      setPendingTicketName('');
    } else {
      setVendorCodeModalVisible(false);
      setVendorCode('');
      setPendingPriceId(null);
      setPendingTicketName('');
    }
  };

  const handlePurchase = async (priceId: string, ticketId: string, ticketName: string) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    // If this ticket requires an access code, show the modal
    if (productsRequiringCode.has(ticketName)) {
      setPendingPriceId(priceId);
      setPendingTicketName(ticketName);
      setVendorCodeModalVisible(true);
      return;
    }

    // For other tickets, proceed directly
    await proceedWithPurchase(priceId);
  };

  const proceedWithPurchase = async (priceId: string, vendorCode?: string) => {
    setLoading(true);

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      console.log('Starting checkout...');

      const requestBody: any = {
        price_id: priceId,
        mode: 'payment',
        success_url: 'fingerboardcon://tickets?success=true',
        cancel_url: 'fingerboardcon://tickets?canceled=true',
      };

      if (vendorCode) {
        requestBody.vendor_code = vendorCode;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (!response.ok) {
        console.error('Error response:', responseText);

        let errorMessage = 'Failed to start checkout. Please try again.';
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }

        Alert.alert('Checkout Error', errorMessage);
        return;
      }

      const data = JSON.parse(responseText);

      if (data.error) {
        Alert.alert('Error', data.error);
        return;
      }

      if (data.url) {
        console.log('Opening checkout URL:', data.url);
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', 'No checkout URL received');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert('Error', error.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <Text style={styles.title}>Get Your Tickets</Text>
        <Text style={styles.subtitle}>Fingerboard Con 2026 • April 24-26</Text>
        <View style={styles.eventInfo}>
          <View style={styles.infoItem}>
            <Calendar size={16} color="#FF6B35" />
            <Text style={styles.infoText}>3 Days</Text>
          </View>
          <View style={styles.infoItem}>
            <Users size={16} color="#FF6B35" />
            <Text style={styles.infoText}>300+ Attendees</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.urgencyBanner}>
          <Text style={styles.urgencyText}>⚡ Tickets are limited & required for all 3 days of events</Text>
        </View>

        {ticketTypes.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            {ticket.popular && (
              <View style={styles.popularBadge}>
                <Star size={16} color="#000000" />
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            
            <View style={styles.ticketHeader}>
              <View>
                <Text style={styles.ticketName}>{ticket.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{ticket.price}</Text>
                  {ticket.originalPrice && (
                    <Text style={styles.originalPrice}>{ticket.originalPrice}</Text>
                  )}
                </View>
              </View>
              <Ticket size={32} color="#FF6B35" />
            </View>

            <View style={styles.featuresContainer}>
              {ticket.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Check size={16} color="#39FF14" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              <View style={styles.feature}>
                <Check size={16} color="#39FF14" />
                <Text style={styles.featureText}>Special hotel room rate (limited qty)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.purchaseButton,
                ticket.soldOut && styles.soldOutButton,
                !ticket.stripePriceId && styles.disabledButton,
              ]}
              disabled={ticket.soldOut || !ticket.stripePriceId || loading}
              onPress={() => ticket.stripePriceId && handlePurchase(ticket.stripePriceId, ticket.id, ticket.name)}
            >
              <Text style={[
                styles.purchaseButtonText,
                ticket.soldOut && styles.soldOutButtonText,
              ]}>
                {ticket.soldOut
                  ? 'SOLD OUT'
                  : ticket.stripePriceId
                  ? (loading ? 'LOADING...' : 'BUY NOW')
                  : 'AVAILABLE SOON'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Important Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>🎫 Ticket Policies</Text>
            <Text style={styles.infoCardText}>
              • All sales are final – no refunds{'\n'}
              • Tickets are transferable, but Fingerboard Con is not responsible for private resale transactions or ensuring legitimacy of secondhand sales{'\n'}
              • Buying tickets for the sole purpose of resale is lame. Those found doing so will be publicly shamed and made to fingerboard on three wheels all weekend!{'\n'}
              • Valid ID required for entry{'\n'}
              • Children under 5 enter free with an adult{'\n'}
              • Non-fingerboarding companions also require a ticket
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>📍 Venue Info</Text>
            <Text style={styles.infoCardText}>
              Hilton Garden Inn Tewksbury Andover{'\n'}
              4 Highwood Dr, Tewksbury, MA 01876, USA{'\n'}
              Parking: Free on-site
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>❓ Need Help?</Text>
            <Text style={styles.infoCardText}>
              Contact us at:{'\n'}
              📧 fingerboardcon@6skates.com{'\n'}
            </Text>
          </View>
        </View>

        <View style={styles.externalPurchaseSection}>
          <Text style={styles.externalPurchaseTitle}>Alternative Purchase Option</Text>
          <Text style={styles.externalPurchaseDescription}>
            You can also purchase tickets directly through our Stripe checkout page
          </Text>
          <TouchableOpacity
            style={styles.externalButton}
            onPress={() => Linking.openURL('https://buy.stripe.com/4gw2b78Bk9hQ15S001')}
          >
            <ExternalLink size={20} color="#2E7D32" />
            <Text style={styles.externalButtonText}>Buy Tickets Online</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={vendorCodeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setVendorCodeModalVisible(false);
          setVendorCode('');
          setPendingPriceId(null);
          setPendingTicketName('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Access Code Required</Text>
              <TouchableOpacity
                onPress={() => {
                  setVendorCodeModalVisible(false);
                  setVendorCode('');
                  setPendingPriceId(null);
                  setPendingTicketName('');
                }}
                style={styles.closeButton}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Please enter your access code to continue with your purchase.
            </Text>

            <TextInput
              style={styles.codeInput}
              placeholder={pendingTicketName === 'Vendor Package' ? 'Enter vendor code' : 'Enter access code'}
              placeholderTextColor="#81C784"
              value={vendorCode}
              onChangeText={setVendorCode}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!validatingCode}
            />

            <TouchableOpacity
              style={[styles.submitButton, validatingCode && styles.submitButtonDisabled]}
              onPress={handleVendorCodeSubmit}
              disabled={validatingCode || !vendorCode.trim()}
            >
              <Text style={styles.submitButtonText}>
                {validatingCode ? 'Validating...' : 'Continue to Checkout'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message="You need to sign in to purchase tickets. Create an account or sign in to continue."
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
    backgroundColor: '#4CAF50',
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventInfo: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#E8F5E8',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  urgencyBanner: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  urgencyText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  ticketCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#66BB6A',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2E7D32',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  ticketName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    maxWidth: 200,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
  },
  originalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8F5E8',
    textDecorationLine: 'line-through',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#E8F5E8',
    fontWeight: '600',
  },
  purchaseButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  soldOutButton: {
    backgroundColor: '#81C784',
  },
  disabledButton: {
    backgroundColor: '#81C784',
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  soldOutButtonText: {
    color: '#E8F5E8',
  },
  infoSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  infoSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#E8F5E8',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 15,
    color: '#E8F5E8',
    marginBottom: 20,
    lineHeight: 22,
  },
  codeInput: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#66BB6A',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
  externalPurchaseSection: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  externalPurchaseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  externalPurchaseDescription: {
    fontSize: 14,
    color: '#E8F5E8',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  externalButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  externalButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
});