import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ticket, Send, Clock, CheckCircle, XCircle } from 'lucide-react-native';
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
  const { session } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('ticket_details')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        Alert.alert('Error', 'Failed to load tickets');
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
    Alert.alert(
      'Transfer Ticket',
      `Transfer "${ticket.ticket_type}" (Ticket ${ticket.ticket_number})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          onPress: () => {
            router.push({
              pathname: '/transfer-ticket',
              params: { ticketId: ticket.id },
            });
          },
        },
      ]
    );
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

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please log in to view your tickets</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.header}>
        <Text style={styles.title}>My Tickets</Text>
        <Text style={styles.subtitle}>{tickets.length} Ticket{tickets.length !== 1 ? 's' : ''}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading tickets...</Text>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ticket size={64} color="#66BB6A" />
            <Text style={styles.emptyTitle}>No Tickets Yet</Text>
            <Text style={styles.emptyText}>Purchase tickets to see them here</Text>
            <TouchableOpacity style={styles.buyButton} onPress={() => router.push('/tickets')}>
              <Text style={styles.buyButtonText}>Buy Tickets</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Object.entries(groupedTickets).map(([orderId, orderTickets]) => (
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

                    {ticket.was_transferred && (
                      <View style={styles.transferBadge}>
                        <Text style={styles.transferBadgeText}>
                          {ticket.transfer_count > 0 ? `Transferred ${ticket.transfer_count}x` : 'Received'}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                );
              })}
            </View>
          ))
        )}

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
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 5,
    fontWeight: '600',
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
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#E8F5E8',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#E8F5E8',
    marginTop: 8,
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
  orderGroup: {
    marginBottom: 24,
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
  transferBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  transferBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
  },
  infoSection: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
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
});
