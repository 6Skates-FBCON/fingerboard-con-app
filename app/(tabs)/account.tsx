import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ticket, Send, Clock, CheckCircle, XCircle, LogOut, User, Mail, Bell, Settings } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase, api } from '@/lib/supabase';
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

export default function AccountScreen() {
  const { user, session, role } = useAuth();
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

  const handleSignOut = async () => {
    if (!supabase) return;

    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      console.log('Sign out successful, navigating to login...');
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}
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
          >
            <LogOut size={18} color="#FFFFFF" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            My Tickets ({tickets.length})
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading tickets...</Text>
            </View>
          ) : tickets.length === 0 ? (
            <View style={styles.emptyTicketsContainer}>
              <Ticket size={48} color="#66BB6A" />
              <Text style={styles.emptyTicketsTitle}>No Tickets Yet</Text>
              <Text style={styles.emptyTicketsText}>Purchase tickets to see them here</Text>
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

        {tickets.length > 0 && (
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
        )}
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
  emptyTicketsText: {
    fontSize: 14,
    color: '#E8F5E8',
    marginTop: 8,
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
  },
  buyButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E7D32',
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
