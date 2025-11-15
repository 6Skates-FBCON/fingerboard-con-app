import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, AlertTriangle, CheckSquare, Square } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function TransferConfirmScreen() {
  const { ticketId, recipientId, recipientEmail, ticketType, ticketNumber } = useLocalSearchParams<{
    ticketId: string;
    recipientId: string;
    recipientEmail: string;
    ticketType: string;
    ticketNumber: string;
  }>();

  const { session } = useAuth();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const handleConfirmTransfer = async () => {
    console.log('Transfer button clicked');
    console.log('Agreed to terms:', agreedToTerms);
    console.log('Params:', { ticketId, recipientId, recipientEmail, ticketType, ticketNumber });
    console.log('Session:', session);

    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please check the box to confirm you understand the transfer terms.');
      return;
    }

    if (!ticketId || !recipientId || !session) {
      console.error('Missing required data:', { ticketId, recipientId, hasSession: !!session });
      Alert.alert('Error', `Missing required information. Please try again.\n\nDebug: ticketId=${!!ticketId}, recipientId=${!!recipientId}, session=${!!session}`);
      return;
    }

    setTransferring(true);

    try {
      console.log('Starting transfer...');

      const transferData = {
        ticket_id: parseInt(ticketId),
        from_user_id: session.user.id,
        to_user_id: recipientId,
        transfer_status: 'completed',
        transferred_at: new Date().toISOString(),
      };

      console.log('Transfer data:', transferData);

      const { data: transferResult, error: transferError } = await supabase
        .from('ticket_transfers')
        .insert(transferData)
        .select();

      console.log('Transfer result:', transferResult);
      console.log('Transfer error:', transferError);

      if (transferError) {
        console.error('Error creating transfer:', transferError);
        Alert.alert('Transfer Failed', `Failed to transfer ticket: ${transferError.message}`);
        setTransferring(false);
        return;
      }

      console.log('Updating ticket owner...');

      const { data: updateResult, error: updateError } = await supabase
        .from('tickets')
        .update({
          owner_id: recipientId,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select();

      console.log('Update result:', updateResult);
      console.log('Update error:', updateError);

      if (updateError) {
        console.error('Error updating ticket:', updateError);
        Alert.alert('Transfer Failed', `Failed to update ticket ownership: ${updateError.message}`);
        setTransferring(false);
        return;
      }

      console.log('Transfer completed successfully!');
      setTransferring(false);
      router.replace('/account');
    } catch (error) {
      console.error('Error transferring ticket:', error);
      Alert.alert('Error', `An unexpected error occurred: ${error}`);
      setTransferring(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#2E7D32', '#1B5E20']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Transfer</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ticketInfo}>
          <Text style={styles.sectionTitle}>Ticket Details</Text>
          <View style={styles.infoCard}>
            <Text style={styles.ticketType}>{ticketType}</Text>
            <Text style={styles.ticketNumber}>Ticket #{ticketNumber}</Text>
          </View>
        </View>

        <View style={styles.recipientInfo}>
          <Text style={styles.sectionTitle}>Transfer To</Text>
          <View style={styles.infoCard}>
            <Text style={styles.recipientEmail}>{recipientEmail}</Text>
          </View>
        </View>

        <View style={styles.warningSection}>
          <View style={styles.warningHeader}>
            <AlertTriangle size={24} color="#FF9800" />
            <Text style={styles.warningTitle}>Important Terms</Text>
          </View>
          <View style={styles.termsList}>
            <Text style={styles.term}>• Verify the recipient's email address is correct</Text>
            <Text style={styles.term}>• The recipient MUST have a registered account</Text>
            <Text style={styles.term}>• Transfers are IMMEDIATE and PERMANENT</Text>
            <Text style={styles.term}>• You will IMMEDIATELY lose access to this ticket</Text>
            <Text style={styles.term}>• The new owner can transfer it to anyone else</Text>
            <Text style={styles.term}>• Once validated at the event, tickets cannot be transferred</Text>
            <Text style={styles.term}>• There are NO REFUNDS for incorrect transfers</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
        >
          {agreedToTerms ? (
            <CheckSquare size={24} color="#4CAF50" />
          ) : (
            <Square size={24} color="#FFFFFF" />
          )}
          <Text style={styles.checkboxText}>
            I understand and agree to these terms. This transfer is permanent and cannot be undone.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, !agreedToTerms && styles.confirmButtonDisabled]}
          onPress={handleConfirmTransfer}
          disabled={!agreedToTerms || transferring}
        >
          {transferring ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Transfer</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={transferring}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  ticketInfo: {
    marginBottom: 24,
  },
  recipientInfo: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ticketType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recipientEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  warningSection: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
    marginLeft: 8,
  },
  termsList: {
    gap: 12,
  },
  term: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
