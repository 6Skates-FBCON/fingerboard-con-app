import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Send } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function SendNotificationScreen() {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    setSending(true);

    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`;
      const token = session?.access_token;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          sendToAll: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification');
      }

      Alert.alert(
        'Success',
        `Notification sent to ${result.sent} ${result.sent === 1 ? 'user' : 'users'}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setBody('');
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Bell size={32} color="#FFD700" />
          </View>
          <Text style={styles.headerTitle}>Send Notification</Text>
          <Text style={styles.headerSubtitle}>Push to all attendees</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Notification Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter title..."
            placeholderTextColor="#999999"
            value={title}
            onChangeText={setTitle}
            editable={!sending}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your message..."
            placeholderTextColor="#999999"
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!sending}
            maxLength={500}
          />
          <Text style={styles.charCount}>{body.length}/500</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              This notification will be sent to all users who have the app installed and notifications enabled.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, (sending || !title.trim() || !body.trim()) && styles.sendButtonDisabled]}
          onPress={handleSendNotification}
          disabled={sending || !title.trim() || !body.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#2E7D32" />
          ) : (
            <>
              <Send size={24} color="#2E7D32" />
              <Text style={styles.sendButtonText}>Send Notification</Text>
            </>
          )}
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
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    marginLeft: 20,
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8F5E8',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#E8F5E8',
    textAlign: 'right',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  infoText: {
    fontSize: 14,
    color: '#E8F5E8',
    lineHeight: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E7D32',
    marginLeft: 12,
  },
});
