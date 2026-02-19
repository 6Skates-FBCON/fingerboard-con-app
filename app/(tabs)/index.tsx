import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Users, ShoppingBag, MapPin, Bell, Zap } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const quickActions = [
    { icon: Calendar, label: 'Schedule', route: '/events' },
    { icon: ShoppingBag, label: 'Tickets', route: '/my-tickets' },
    { icon: Users, label: 'Vendors', route: '/vendors' },
    { icon: MapPin, label: 'Location', route: '/location' },
  ];

  const updates = [
    {
      time: '',
      title: 'FINGERBOARD CON — OFFICIALLY 100% SOLD OUT',
      text: 'The ticket drop was bigger than anything we expected — the demand was massive!\n\nThank you. The support from this community is unreal. We\'re incredibly grateful that you continue to show up and trust us to bring this event to life.\n\nWe also understand how disappointing it is if you weren\'t able to secure a ticket. We don\'t take that lightly.\n\nImportant:\n\n• Tickets are required for entry on all three days of the event.\n• Tickets will be checked daily.\n• The hotel has required tighter access control this year for safety and capacity reasons.\n• No tickets will be available at the door.\n• Non-ticket holders will not be permitted entry.\n\nIf you come across tickets on the secondary market, please proceed carefully. We strongly recommend only purchasing from someone you personally know and trust. FBCon is not responsible for any losses related to fake or invalid tickets.\n\nEvery year we learn, adjust, and improve. Thank you for allowing us to keep building this for the community. We\'re committed to making it better every time.\n\nBoston is going to be something special.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('@/assets/images/fbcon_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.eventYear}>Boston 2026</Text>
          
          <View style={styles.eventCard}>
            <Text style={styles.eventDate}>April 24-26, 2026 • Tewksbury, MA</Text>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => router.push(action.route)}
              >
                <View style={styles.actionIcon}>
                  <action.icon size={24} color="#1A1A1A" />
                </View>
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.ticketNotice}>
          <Zap size={24} color="#2E7D32" style={styles.ticketNoticeIcon} />
          <Text style={styles.ticketNoticeText}>
            Tickets are Solt Out & required for all 3 days of events.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          {updates.map((update, index) => (
            <View key={index} style={styles.updateCard}>
              <Text style={styles.updateTitle}>{update.title}</Text>
              <Text style={styles.updateText}>{update.text}</Text>
            </View>
          ))}
        </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 8,
  },
  eventYear: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#66BB6A',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  soldOutText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF0000',
    textAlign: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginRight: 8,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    flexBasis: '48%',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  updateCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    marginRight: 8,
  },
  updateTime: {
    fontSize: 13,
    color: '#E8F5E8',
    fontWeight: '600',
  },
  updateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  updateText: {
    fontSize: 15,
    color: '#E8F5E8',
    lineHeight: 22,
  },
  ticketNotice: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketNoticeIcon: {
    marginRight: 12,
  },
  ticketNoticeText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#2E7D32',
    lineHeight: 24,
  },
});