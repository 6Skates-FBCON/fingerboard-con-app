import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ticket, Send, Clock, CheckCircle, XCircle, MapPin, Phone, ExternalLink } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-native-qrcode-svg';
import { router } from 'expo-router';

interface TicketData {
  id: number;
  order_id: number;
  ticket_type: string;
  ticket_number: number;
  qr_code_data: string;
  owner_id: string;
  original_purchaser_id: string;
  status: 'active' | 'transferred' | 'validated' | 'expired' | 'cancelled';
  validated_at: string | null;
  background_color: string;
  event_name: string;
  event_date: string;
  created_at: string;
  transfer_count: number;
  was_transferred: boolean;
}

export default function MyTicketsScreen() {
  const { session, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ticket_details')
        .select('*')
        .eq('owner_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [session]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleTransfer = (ticket: TicketData) => {
    router.push({
      pathname: '/transfer-ticket',
      params: { ticketId: ticket.id.toString() },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#39FF14';
      case 'transferred':
        return '#FFC107';
      case 'validated':
        return '#4CAF50';
      case 'expired':
      case 'cancelled':
        return '#F44336';
      default:
        return '#FFFFFF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return Clock;
      case 'validated':
        return CheckCircle;
      case 'expired':
      case 'cancelled':
        return XCircle;
      default:
        return Ticket;
    }
  };

  const groupedTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.order_id]) {
      acc[ticket.order_id] = [];
    }
    acc[ticket.order_id].push(ticket);
    return acc;
  }, {} as Record<number, TicketData[]>);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
          <Text style={styles.title}>My Tickets & Hotel</Text>
        </LinearGradient>

        <View style={styles.notSignedInContainer}>
          <Ticket size={80} color="#66BB6A" strokeWidth={1.5} />
          <Text style={styles.notSignedInTitle}>Sign in required</Text>
          <Text style={styles.notSignedInText}>
            Sign in to view your purchased tickets and access your hotel booking information.
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
        <Text style={styles.title}>My Tickets & Hotel</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            My Tickets {tickets.length > 0 && `(${tickets.length})`}
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading tickets...</Text>
            </View>
          ) : tickets.length === 0 ? (
            <View style={styles.emptyTicketsContainer}>
              <Ticket size={48} color="#66BB6A" />
              <Text style={styles.emptyTicketsTitle}>No Tickets Yet</Text>
            </View>
          ) : (
            <>
              {Object.entries(groupedTickets).map(([orderId, orderTickets]) => (
                <View key={orderId} style={styles.orderGroup}>
                  <Text style={styles.orderHeader}>
                    Order #{orderId} • {orderTickets.length} Ticket{orderTickets.length !== 1 ? 's' : ''}
                  </Text>

                  {orderTickets.map((ticket) => {
                    const StatusIcon = getStatusIcon(ticket.status);
                    const statusColor = getStatusColor(ticket.status);

                    return (
                      <LinearGradient
                        key={ticket.id}
                        colors={[ticket.background_color, ticket.background_color + 'CC']}
                        style={styles.ticketCard}
                      >
                        <View style={styles.ticketHeader}>
                          <View style={styles.ticketInfo}>
                            <Text style={styles.ticketType}>{ticket.ticket_type}</Text>
                            <Text style={styles.ticketNumber}>
                              Ticket {ticket.ticket_number} of {orderTickets.length}
                            </Text>
                            <Text style={styles.eventName}>{ticket.event_name}</Text>
                            <Text style={styles.eventDate}>{ticket.event_date}</Text>
                          </View>

                          <View style={styles.qrContainer}>
                            <QRCode value={ticket.qr_code_data} size={100} backgroundColor="white" />
                          </View>
                        </View>

                        <View style={styles.ticketFooter}>
                          <View style={styles.statusContainer}>
                            <StatusIcon size={16} color={statusColor} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                              {ticket.status.toUpperCase()}
                            </Text>
                          </View>

                          {ticket.status === 'active' && (
                            <TouchableOpacity
                              style={styles.transferButton}
                              onPress={() => handleTransfer(ticket)}
                            >
                              <Send size={16} color="#FFFFFF" />
                              <Text style={styles.transferButtonText}>Transfer</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                      </LinearGradient>
                    );
                  })}
                </View>
              ))}

              <View style={styles.specialRateBanner}>
                <Text style={styles.specialRateBannerTitle}>Ticket Holder Exclusive</Text>
                <Text style={styles.specialRateBannerText}>
                  As a ticket holder, you qualify for our special hotel rate! Rooms are limited and going fast. Book now to secure your spot.
                </Text>
              </View>

              <View style={styles.hotelCard}>
                <Text style={styles.hotelName}>Hilton Garden Inn Tewksbury Andover</Text>

                <View style={styles.hotelInfoRow}>
                  <MapPin size={18} color="#FFD700" />
                  <Text style={styles.hotelInfoText}>
                    4 Highwood Dr, Tewksbury, MA 01876, USA
                  </Text>
                </View>

                <View style={styles.hotelInfoRow}>
                  <Phone size={18} color="#FFD700" />
                  <Text style={styles.hotelInfoText}>
                    (978) 640-9000
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.hotelBookButton}
                  onPress={() => Linking.openURL('https://www.hilton.com/en/book/reservation/rooms/?ctyhocn=BEDTMGI&arrivalDate=2026-04-23&departureDate=2026-04-27&groupCode=90N&room1NumAdults=1&cid=OM%2CWW%2CHILTONLINK%2CEN%2CDirectLink')}
                >
                  <ExternalLink size={18} color="#2E7D32" />
                  <Text style={styles.hotelBookButtonText}>
                    Book Your Room at the Special Rate Now
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Ticket Information</Text>
                <Text style={styles.infoText}>
                  • Each ticket has a unique QR code{'\n'}
                  • Show your QR code at event check-in{'\n'}
                  • Tickets can be transferred to other users{'\n'}
                  • Once validated, tickets cannot be transferred{'\n'}
                  • Pull down to refresh ticket status
                </Text>
              </View>
            </>
          )}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#E8F5E8',
    fontWeight: '600',
  },
  emptyTicketsContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyTicketsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
  },
  orderGroup: {
    marginBottom: 20,
  },
  orderHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 12,
  },
  ticketCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF33',
    position: 'relative',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketType: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFFCC',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFFAA',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF33',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  transferButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  specialRateBanner: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  specialRateBannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  specialRateBannerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 22,
  },
  hotelCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  hotelName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  hotelInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  hotelInfoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#E8F5E8',
  },
  hotelBookButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  hotelBookButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#E8F5E8',
    lineHeight: 22,
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
});
