import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, Send, User } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface UserData {
  id: string;
  email: string;
}

interface TicketData {
  id: number;
  ticket_type: string;
  ticket_number: number;
  background_color: string;
  event_name: string;
  event_date: string;
}

export default function TransferTicketScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const { session } = useAuth();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    if (!ticketId || !session) return;

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_type, ticket_number, background_color, event_name, event_date')
        .eq('id', ticketId)
        .eq('owner_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching ticket:', error);
        Alert.alert('Error', 'Failed to load ticket');
        router.back();
        return;
      }

      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      Alert.alert('Error', 'Failed to load ticket');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchEmail.toLowerCase() === session?.user.email?.toLowerCase()) {
      Alert.alert('Invalid', 'You cannot transfer a ticket to yourself');
      return;
    }

    setSearching(true);

    try {
      const { data, error } = await supabase.rpc('search_users_by_email', {
        search_email: searchEmail.toLowerCase(),
      });

      if (error) {
        console.error('Error searching users:', error);
        Alert.alert('Error', 'Failed to search users');
        return;
      }

      setSearchResults(data || []);

      if (!data || data.length === 0) {
        Alert.alert('No Results', 'No users found with that email');
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleTransfer = async (recipientId: string, recipientEmail: string) => {
    if (!ticket || !session) return;

    Alert.alert(
      'Confirm Transfer',
      `Transfer "${ticket.ticket_type}" (Ticket ${ticket.ticket_number}) to ${recipientEmail}?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            setTransferring(true);

            try {
              const { data: transferData, error: transferError } = await supabase
                .from('ticket_transfers')
                .insert({
                  ticket_id: ticket.id,
                  from_user_id: session.user.id,
                  to_user_id: recipientId,
                  transfer_status: 'completed',
                })
                .select()
                .single();

              if (transferError) {
                console.error('Error creating transfer:', transferError);
                Alert.alert('Error', 'Failed to transfer ticket');
                return;
              }

              const { error: updateError } = await supabase
                .from('tickets')
                .update({
                  owner_id: recipientId,
                  status: 'transferred',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', ticket.id);

              if (updateError) {
                console.error('Error updating ticket:', updateError);
                Alert.alert('Error', 'Failed to update ticket ownership');
                return;
              }

              Alert.alert('Success', `Ticket transferred to ${recipientEmail}`, [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error('Error transferring ticket:', error);
              Alert.alert('Error', 'An error occurred during transfer');
            } finally {
              setTransferring(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ticket not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Transfer Ticket</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[ticket.background_color, ticket.background_color + 'CC']} style={styles.ticketCard}>
          <Text style={styles.ticketType}>{ticket.ticket_type}</Text>
          <Text style={styles.ticketNumber}>Ticket #{ticket.ticket_number}</Text>
          <Text style={styles.eventName}>{ticket.event_name}</Text>
          <Text style={styles.eventDate}>{ticket.event_date}</Text>
        </LinearGradient>

        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Find Recipient</Text>
          <Text style={styles.sectionSubtitle}>Enter the email address of the person you want to transfer this ticket to</Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter email address"
              placeholderTextColor="#FFFFFF66"
              value={searchEmail}
              onChangeText={setSearchEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={searchUsers}
              disabled={searching || !searchEmail.trim()}
            >
              {searching ? (
                <ActivityIndicator size="small" color="#2E7D32" />
              ) : (
                <Search size={20} color="#2E7D32" />
              )}
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              {searchResults.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userCard}
                  onPress={() => handleTransfer(user.id, user.email)}
                  disabled={transferring}
                >
                  <View style={styles.userIcon}>
                    <User size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                  <Send size={20} color="#4CAF50" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>Important</Text>
          <Text style={styles.warningText}>
            • Transfers are immediate and cannot be undone{'\n'}
            • The recipient must have an account{'\n'}
            • You will no longer have access to this ticket{'\n'}
            • The recipient can transfer the ticket to others{'\n'}
            • Once validated at the event, tickets cannot be transferred
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
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
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
    marginTop: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#E8F5E8',
    fontWeight: '600',
  },
  ticketCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF33',
  },
  ticketType: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFFCC',
    marginBottom: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFFAA',
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#E8F5E8',
    marginBottom: 16,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    marginTop: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  warningSection: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#E8F5E8',
    lineHeight: 22,
  },
});
