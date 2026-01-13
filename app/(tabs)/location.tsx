import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, Car, Bus, Plane, Phone, Mail, Wifi, Utensils } from 'lucide-react-native';

export default function LocationScreen() {
  const openMaps = async () => {
    const address = "4 Highwood Dr, Tewksbury, MA 01876, USA";
    const url = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

  const callVenue = async () => {
    try {
      await Linking.openURL('tel:1 978-640-9000');
    } catch (error) {
      console.error('Error making call:', error);
    }
  };

  const facilities = [
    { icon: Wifi, name: 'Free WiFi for Hotel Guests', description: 'High-speed internet throughout venue' },
    { icon: Utensils, name: 'Food & Drinks', description: 'The Hotel has a full service bar and restaurant' },
    { icon: Car, name: 'Parking', description: 'Free on-site parking available' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <Text style={styles.title}>Venue Information</Text>
        <Text style={styles.subtitle}>Hilton Garden Inn Tewksbury Andover</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <MapPin size={24} color="#FF6B35" />
            <Text style={styles.addressTitle}>Event Location</Text>
          </View>
          <Text style={styles.venueText}>Hilton Garden Inn Tewksbury Andover</Text>
          <Text style={styles.addressText}>4 Highwood Dr, Tewksbury,{'\n'}MA 01876, USA</Text>
          
          <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
            <MapPin size={20} color="#FFFFFF" />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕒 Event Hours</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.dayRow}>
              <Text style={styles.dayText}>Friday, April 24</Text>
              <Text style={styles.timeText}>6:00 PM - 11:30 PM</Text>
            </View>
            <View style={styles.dayRow}>
              <Text style={styles.dayText}>Saturday, April 25</Text>
              <Text style={styles.timeText}>9:00 AM - 8:00 PM</Text>
            </View>
            <View style={styles.dayRow}>
              <Text style={styles.dayText}>Sunday, April 26</Text>
              <Text style={styles.timeText}>10:00 AM - 6:00 PM</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Getting There</Text>
          
          <View style={styles.transportCard}>
            <Car size={20} color="#00D4FF" />
            <View style={styles.transportInfo}>
              <Text style={styles.transportTitle}>By Car</Text>
              <Text style={styles.transportText}>
                Located off I-495 and Route 38. Free on-site parking available. Additional parking at nearby shopping centers.
              </Text>
            </View>
          </View>

          <View style={styles.transportCard}>
            <Bus size={20} color="#39FF14" />
            <View style={styles.transportInfo}>
              <Text style={styles.transportTitle}>Public Transit</Text>
              <Text style={styles.transportText}>
                MBTA Commuter Rail Lowell Line to Anderson/Woburn station, then taxi/rideshare (15 minutes). Limited bus service available.
              </Text>
            </View>
          </View>

          <View style={styles.transportCard}>
            <Plane size={20} color="#FF3B6B" />
            <View style={styles.transportInfo}>
              <Text style={styles.transportTitle}>From Airport</Text>
              <Text style={styles.transportText}>
                30 minutes from Boston Logan Airport via I-93 and I-495. Rideshare and rental cars available at airport.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Venue Facilities</Text>
          {facilities.map((facility, index) => (
            <View key={index} style={styles.facilityCard}>
              <facility.icon size={20} color="#FF6B35" />
              <View style={styles.facilityInfo}>
                <Text style={styles.facilityName}>{facility.name}</Text>
                <Text style={styles.facilityDescription}>{facility.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact Information</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Phone size={20} color="#00D4FF" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Hotel Contact</Text>
                <TouchableOpacity onPress={callVenue}>
                  <Text style={styles.contactValue}>(978)-640-9000</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.contactRow}>
              <Mail size={20} color="#39FF14" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>fingerboardcon@6skates.com</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Important Notes</Text>
          
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>🎫 Entry Requirements</Text>
            <Text style={styles.noteText}>
              • Valid ticket and ID required for entry{'\n'}
              • Security check at main entrance{'\n'}
              • Please remain in designated event areas (hotel lobby, restaurant, or main ballroom)
            </Text>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>📱 What to Bring</Text>
            <Text style={styles.noteText}>
              • Your ticket (digital or printed){'\n'}
              • Valid photo ID{'\n'}
              • Your fingerboard gear{'\n'}
              • Portable charger recommended
            </Text>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>🚫 Prohibited Items</Text>
            <Text style={styles.noteText}>
              • Outside food and beverages{'\n'}
            </Text>
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
  header: {
    backgroundColor: '#4CAF50',
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 5,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addressCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  venueText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#E8F5E8',
    lineHeight: 24,
    marginBottom: 16,
  },
  directionsButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  directionsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  scheduleCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#66BB6A',
  },
  dayText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
  },
  transportCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  transportInfo: {
    flex: 1,
  },
  transportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transportText: {
    fontSize: 14,
    color: '#E8F5E8',
    lineHeight: 20,
  },
  facilityCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  facilityDescription: {
    fontSize: 14,
    color: '#E8F5E8',
  },
  contactCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#66BB6A',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#E8F5E8',
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#E8F5E8',
    lineHeight: 20,
  },
});