import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, CheckCircle, XCircle, Keyboard, ScanLine } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Audio } from 'expo-av';

let CameraView: any = null;
let useCameraPermissions: any = null;
if (Platform.OS !== 'web') {
  const cameraModule = require('expo-camera');
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
}

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

async function validateTicketCode(code: string, accessToken: string): Promise<ValidationResult> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configuration missing');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/validate-ticket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ qr_code_data: code }),
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: `Server error (${response.status})` };
  }
}

async function playSuccessChime() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3' },
      { shouldPlay: true, volume: 1.0 }
    );
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {}
}

function ResultCard({
  result,
  onReset,
}: {
  result: ValidationResult;
  onReset: () => void;
}) {
  useEffect(() => {
    if (result.success) {
      playSuccessChime();
    }
  }, [result.success]);
  return (
    <View style={styles.resultContainer}>
      <View style={[styles.resultCard, result.success ? styles.successCard : styles.errorCard]}>
        {result.success ? (
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
        <Text style={styles.resultMessage}>{result.message}</Text>
        {result.ticket && (
          <View style={styles.ticketDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <View style={styles.detailValueGroup}>
                <Text style={styles.detailValue}>
                  {result.ticket.ticket_type === 'guest_list'
                    ? 'General Admission'
                    : result.ticket.ticket_type}
                </Text>
                {result.ticket.ticket_type === 'guest_list' && (
                  <Text style={styles.guestListBadge}>Guest List</Text>
                )}
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ticket #:</Text>
              <Text style={styles.detailValue}>{result.ticket.ticket_number}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Event:</Text>
              <Text style={styles.detailValue}>{result.ticket.event_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Owner:</Text>
              <Text style={styles.detailValue}>{result.ticket.owner_email}</Text>
            </View>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.scanAgainButton} onPress={onReset}>
        <Camera size={20} color="#FFFFFF" />
        <Text style={styles.scanAgainText}>Scan Another Ticket</Text>
      </TouchableOpacity>
    </View>
  );
}

function ManualEntry({
  onSubmit,
  validating,
}: {
  onSubmit: (code: string) => void;
  validating: boolean;
}) {
  const [code, setCode] = useState('');

  return (
    <View style={styles.manualContainer}>
      <View style={styles.manualIconRow}>
        <Keyboard size={28} color="#FFD700" />
        <Text style={styles.manualTitle}>Enter Ticket Code</Text>
      </View>
      <TextInput
        style={styles.manualInput}
        value={code}
        onChangeText={setCode}
        placeholder="Paste or type QR code value"
        placeholderTextColor="#88AA88"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!validating}
      />
      <TouchableOpacity
        style={[styles.manualSubmitButton, (!code.trim() || validating) && styles.disabledButton]}
        onPress={() => code.trim() && onSubmit(code.trim())}
        disabled={!code.trim() || validating}
      >
        {validating ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Text style={styles.manualSubmitText}>Validate</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function WebScanner({ onScanned }: { onScanned: (code: string) => void }) {
  const videoRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices || devices.length === 0) {
          if (active) setError('No camera found on this device.');
          return;
        }

        const backCamera =
          devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[0];

        if (active) setReady(true);

        await reader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current,
          (result: any, err: any) => {
            if (result && active) {
              setDetectedCode(result.getText());
            }
          }
        );
      } catch (e: any) {
        if (active) {
          if (e?.name === 'NotAllowedError' || e?.message?.includes('Permission')) {
            setError('Camera permission denied. Please allow camera access in your browser.');
          } else {
            setError('Unable to start camera. Use manual entry below.');
          }
        }
      }
    }

    startScanner();

    return () => {
      active = false;
      if (readerRef.current) {
        try {
          readerRef.current.reset();
        } catch {}
      }
    };
  }, []);

  const handleConfirm = useCallback(() => {
    if (detectedCode) {
      onScanned(detectedCode);
    }
  }, [detectedCode, onScanned]);

  if (error) {
    return (
      <View style={styles.webCameraError}>
        <Camera size={48} color="#FFD700" />
        <Text style={styles.webCameraErrorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.webScannerWrapper}>
      {!ready && (
        <View style={styles.webScannerLoading}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Starting camera...</Text>
        </View>
      )}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: ready ? 'block' : 'none',
        }}
        muted
        playsInline
      />
      {ready && !detectedCode && (
        <View style={styles.scanOverlay} pointerEvents="none">
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>Position QR code within frame</Text>
        </View>
      )}
      {ready && detectedCode && (
        <View style={styles.scanOverlay}>
          <View style={styles.detectedFrame} />
          <TouchableOpacity style={styles.confirmScanButton} onPress={handleConfirm}>
            <ScanLine size={22} color="#2E7D32" />
            <Text style={styles.confirmScanText}>Validate This Ticket</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function WebValidateTicket() {
  const { session } = useAuth();
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showManual, setShowManual] = useState(false);
  const scannedRef = useRef(false);

  const handleCode = async (code: string) => {
    if (validating || scannedRef.current) return;
    scannedRef.current = true;
    setValidating(true);

    try {
      if (!session) throw new Error('Not authenticated');
      const res = await validateTicketCode(code, session.access_token);
      setResult(res);
    } catch {
      setResult({ success: false, message: 'Failed to validate ticket.' });
    } finally {
      setValidating(false);
    }
  };

  const reset = () => {
    scannedRef.current = false;
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Validate Ticket</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {validating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Validating ticket...</Text>
          </View>
        ) : result ? (
          <ResultCard result={result} onReset={reset} />
        ) : (
          <>
            <View style={styles.webCameraSection}>
              <WebScanner onScanned={handleCode} />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or enter manually</Text>
              <View style={styles.dividerLine} />
            </View>

            <ManualEntry onSubmit={handleCode} validating={validating} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NativeValidateTicket() {
  const { session } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </SafeAreaView>
    );
  }

  const handleCode = async (code: string) => {
    setValidating(true);
    setDetectedCode(null);

    try {
      if (!session) throw new Error('Not authenticated');
      const res = await validateTicketCode(code, session.access_token);
      setResult(res);
    } catch {
      setResult({ success: false, message: 'Failed to validate ticket.' });
    } finally {
      setValidating(false);
    }
  };

  const handleBarcodeDetected = ({ data }: { data: string }) => {
    if (!detectedCode && !validating) {
      setDetectedCode(data);
    }
  };

  const handleConfirmNative = () => {
    if (detectedCode) {
      handleCode(detectedCode);
    }
  };

  const reset = () => {
    setDetectedCode(null);
    setResult(null);
    setShowManual(false);
  };

  const renderHeader = () => (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.title}>Validate Ticket</Text>
    </LinearGradient>
  );

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#FFD700" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>We need camera access to scan QR codes</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerTextDark}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>
          <ManualEntry onSubmit={handleCode} validating={validating} />
        </View>
      </SafeAreaView>
    );
  }

  if (validating) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Validating ticket...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (result) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <ResultCard result={result} onReset={reset} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <View style={styles.content}>
        {showManual ? (
          <ScrollView keyboardShouldPersistTaps="handled">
            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => setShowManual(false)}
            >
              <Camera size={18} color="#FFD700" />
              <Text style={styles.switchModeText}>Use Camera Scanner</Text>
            </TouchableOpacity>
            <ManualEntry onSubmit={handleCode} validating={validating} />
          </ScrollView>
        ) : (
          <>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={detectedCode ? undefined : handleBarcodeDetected}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />
            {!detectedCode && (
              <View style={styles.scanOverlay} pointerEvents="none">
                <View style={styles.scanFrame} />
                <Text style={styles.scanText}>Position QR code within frame</Text>
              </View>
            )}
            {detectedCode && (
              <View style={styles.scanOverlay}>
                <View style={styles.detectedFrame} />
                <TouchableOpacity style={styles.confirmScanButton} onPress={handleConfirmNative}>
                  <ScanLine size={22} color="#2E7D32" />
                  <Text style={styles.confirmScanText}>Validate This Ticket</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setDetectedCode(null)}
                >
                  <Text style={styles.rescanText}>Rescan</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.manualFallbackButton}
              onPress={() => setShowManual(true)}
            >
              <Keyboard size={16} color="#FFFFFF" />
              <Text style={styles.manualFallbackText}>Enter code manually</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function ValidateTicketScreen() {
  if (Platform.OS === 'web' || !useCameraPermissions) {
    return <WebValidateTicket />;
  }
  return <NativeValidateTicket />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    minHeight: 200,
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
  manualFallbackButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00000088',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF44',
  },
  manualFallbackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  switchModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  switchModeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFD700',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
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
  detailValueGroup: {
    alignItems: 'flex-end',
  },
  guestListBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    marginTop: 2,
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
  webCameraSection: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    backgroundColor: '#1a2e1a',
  },
  webScannerWrapper: {
    flex: 1,
    position: 'relative',
  },
  webScannerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webCameraError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  webCameraErrorText: {
    fontSize: 15,
    color: '#E8F5E8',
    textAlign: 'center',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4CAF5088',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A5D6A7',
  },
  dividerTextDark: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E8F5E8',
  },
  manualContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  manualIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  manualTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  manualInput: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  manualSubmitButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  manualSubmitText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
  disabledButton: {
    opacity: 0.5,
  },
  detectedFrame: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: '#39FF14',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  confirmScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmScanText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D32',
  },
  rescanButton: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF88',
    backgroundColor: '#00000066',
  },
  rescanText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
