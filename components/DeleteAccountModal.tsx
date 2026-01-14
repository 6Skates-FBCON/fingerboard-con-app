import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
}

export function DeleteAccountModal({ visible, onClose, onConfirm, userEmail }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText === 'DELETE';

  const handleConfirm = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await onConfirm();
      setConfirmText('');
      onClose();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={32} color="#FF5252" strokeWidth={2.5} />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isDeleting}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Delete Account</Text>
          <Text style={styles.description}>
            This action is permanent and cannot be undone. All your data will be deleted:
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningItem}>• Your profile and account settings</Text>
            <Text style={styles.warningItem}>• All tickets you own</Text>
            <Text style={styles.warningItem}>• Ticket transfer history</Text>
            <Text style={styles.warningItem}>• Purchase history</Text>
          </View>

          <Text style={styles.emailText}>
            Account: <Text style={styles.emailBold}>{userEmail}</Text>
          </Text>

          <Text style={styles.confirmLabel}>
            Type <Text style={styles.deleteText}>DELETE</Text> to confirm:
          </Text>

          <TextInput
            style={styles.input}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="Type DELETE here"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            editable={!isDeleting}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                (!canDelete || isDeleting) && styles.deleteButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!canDelete || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Forever</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#FFF3F3',
    padding: 12,
    borderRadius: 12,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: '#FFF9F0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningItem: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 22,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  emailBold: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  confirmLabel: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  deleteText: {
    fontWeight: '900',
    color: '#FF5252',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  deleteButtonDisabled: {
    backgroundColor: '#FFCDD2',
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
