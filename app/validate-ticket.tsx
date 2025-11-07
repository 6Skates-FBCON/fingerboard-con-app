import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, CheckCircle, XCircle, Ticket } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface ValidationResult {
  success: boolean;
  ticket?: {
    id: number;
    ticket_type: string;
    ticket_number: number;
    event_name: string;
    owner_email: string;
  };
  message: string;
}

export default function ValidateTicketScreen() {
  const { session } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Validate Ticket</Text>
        </LinearGradient>

        <View style={styles.permissionContainer}>
          <Camera size={64} color="#FFD700" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>We need camera access to scan QR codes</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (validating || !scanning) return;

    setScanning(false);
    setValidating(true);

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey || !session) {
        throw new Error('Configuration missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/validate-ticket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          qr_code_data: data,
        }),
      });

      const result = await response.json();

      setValidationResult(result);

      if (result.success) {
        Alert.alert('Valid Ticket', result.message);
      } else {
        Alert.alert('Invalid Ticket', result.message);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        success: false,
        message: 'Failed to validate ticket',
      });
      Alert.alert('Error', 'Failed to validate ticket');
    } finally {
      setValidating(false);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setValidationResult(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Validate Ticket</Text>
      </LinearGradient>

      <View style={styles.content}>
        {scanning && !validationResult ? (
          <>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Position QR code within frame</Text>
            </View>
          </>
        ) : validationResult ? (
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.resultCard,
                validationResult.success ? styles.successCard : styles.errorCard,
              ]}
            >
              {validationResult.success ? (
                <>
                  <CheckCircle size={80} color="#39FF14" />
                  <Text style={styles.resultTitle}>Valid Ticket</Text>
                </>
              ) : (
                <>
                  <XCircle size={80} color="#F44336" />
                  <Text style={styles.resultTitle}>Invalid Ticket</Text>
                </>
              )}

              <Text style={styles.resultMessage}>{validationResult.message}</Text>

              {validationResult.ticket && (
                <View style={styles.ticketDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{validationResult.ticket.ticket_type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ticket #:</Text>
                    <Text style={styles.detailValue}>{validationResult.ticket.ticket_number}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Event:</Text>
                    <Text style={styles.detailValue}>{validationResult.ticket.event_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Owner:</Text>
                    <Text style={styles.detailValue}>{validationResult.ticket.owner_email}</Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.scanAgainText}>Scan Another Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Validating ticket...</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Scan ticket QR codes to validate entry at the event. Valid tickets will be marked as used.
        </Text>
      </View>
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
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#E8F5E8',
    marginTop: 8,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#00000099',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 24,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultCard: {
    width: '100%',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: '#4CAF50',
  },
  errorCard: {
    backgroundColor: '#F44336',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 16,
  },
  resultMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  ticketDetails: {
    width: '100%',
    marginTop: 24,
    backgroundColor: '#FFFFFF33',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFFCC',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  scanAgainText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: '#4CAF50',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
