import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Users, ShoppingBag, MapPin, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const quickActions = [
    { icon: Calendar, label: 'Schedule', route: '/events' },
    { icon: ShoppingBag, label: 'Tickets', route: '/tickets' },
    { icon: Users, label: 'Vendors', route: '/vendors' },
    { icon: MapPin, label: 'Location', route: '/location' },
  ];

  const updates = [
    {
      time: '2 hours ago',
      title: 'Ticket Sales Open January 2nd. 2026',
      text: 'Tickets are limited and required for all 3 days events.',
    },
    {
      time: '5 hours ago',
      title: 'Call for Vendors',
      text: 'Many of the past vendors will be returning, there are very limited spaces for new vendors if you are interested please let us know.',
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          {updates.map((update, index) => (
            <View key={index} style={styles.updateCard}>
              <View style={styles.updateHeader}>
                <View style={styles.updateDot} />
                <Text style={styles.updateTime}>{update.time}</Text>
              </View>
              <Text style={styles.updateTitle}>{update.title}</Text>
              <Text style={styles.updateText}>{update.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Highlights</Text>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>Blackriver Ramps Sponsored Event</Text>
            <Text style={styles.highlightText}>Friday 7:00 PM - Main Ballroom</Text>
          </View>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>FBCon Main Event</Text>
            <Text style={styles.highlightText}>Synday 9:00 AM - Main Ballroom</Text>
          </View>
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
    marginBottom: 12,
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
  },
  updateText: {
    fontSize: 15,
    color: '#E8F5E8',
    lineHeight: 22,
  },
  highlightCard: {
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
  highlightTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 15,
    color: '#FFD700',
    fontWeight: '600',
  },
});