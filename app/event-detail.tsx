import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Clock, MapPin, Users, Trophy, Wrench, ShoppingBag, MessageSquare, Calendar, ArrowLeft, ChevronRight } from 'lucide-react-native';

export default function EventDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    time: string;
    location: string;
    type: string;
    description: string;
    participants?: string;
    image?: string;
  }>();

  const getEventImage = (key?: string) => {
    if (key === 'pfl_bracket') {
      return require('@/assets/images/Screenshot_2026-04-05_at_5.04.14_PM.png');
    }
    return null;
  };

  const eventImage = getEventImage(params.image);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'competition': return Trophy;
      case 'workshop': return Wrench;
      case 'social': return Users;
      case 'vendor': return MapPin;
      case 'retail': return ShoppingBag;
      case 'panels': return MessageSquare;
      default: return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'competition': return '#FF6B35';
      case 'workshop': return '#39FF14';
      case 'social': return '#00D4FF';
      case 'vendor': return '#FF3B6B';
      case 'retail': return '#FFD700';
      case 'panels': return '#9B59B6';
      case 'blackriver': return '#000000';
      default: return '#FFFFFF';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'competition': return 'Competition';
      case 'workshop': return 'Workshop';
      case 'social': return 'Social Event';
      case 'vendor': return 'Vendor';
      case 'retail': return 'Retail';
      case 'panels': return 'Panel Discussion';
      case 'blackriver': return 'Blackriver Event';
      default: return 'Event';
    }
  };

  const IconComponent = getEventIcon(params.type);
  const eventColor = getEventColor(params.type);
  const isBlackriver = params.type === 'blackriver';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#FFFFFF" />
          <Text style={styles.backText}>Schedule</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: eventColor }]}>
            {isBlackriver ? (
              <Image
                source={require('@/assets/images/Blackriver Skull Logo.png')}
                style={styles.blackriverLogo}
                resizeMode="contain"
              />
            ) : (
              <IconComponent size={28} color="#000000" />
            )}
          </View>

          <View style={[styles.typeBadge, { backgroundColor: eventColor }]}>
            <Text style={styles.typeBadgeText}>{getTypeLabel(params.type)}</Text>
          </View>

          <Text style={styles.headerTitle}>{params.title}</Text>

          {eventImage && (
            <Image
              source={eventImage}
              style={styles.eventImage}
              resizeMode="contain"
            />
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={18} color="#FFD700" />
              <View style={styles.metaTextGroup}>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={styles.metaValue}>{params.time}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={18} color="#FFD700" />
              <View style={styles.metaTextGroup}>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaValue}>{params.location}</Text>
              </View>
            </View>
          </View>

          {params.participants && (
            <>
              <View style={styles.divider} />
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Users size={18} color="#FFD700" />
                  <View style={styles.metaTextGroup}>
                    <Text style={styles.metaLabel}>Participants</Text>
                    <Text style={styles.metaValue}>{params.participants}</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.descriptionText}>{params.description}</Text>
        </View>

        <View style={styles.bottomPad} />
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
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    gap: 6,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackriverLogo: {
    width: 44,
    height: 44,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  metaCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  metaRow: {
    paddingVertical: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaTextGroup: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5D6A7',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#66BB6A',
    marginVertical: 12,
  },
  section: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    color: '#E8F5E8',
    lineHeight: 26,
  },
  bottomPad: {
    height: 40,
  },
});
