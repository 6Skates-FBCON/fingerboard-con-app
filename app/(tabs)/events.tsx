import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Users, Trophy, Wrench, ShoppingBag, MessageSquare } from 'lucide-react-native';
import { router } from 'expo-router';

interface Event {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'competition' | 'workshop' | 'social' | 'vendor' | 'retail' | 'panels';
  participants?: number;
  description: string;
}

export default function EventsScreen() {
  const [selectedDay, setSelectedDay] = useState('friday');

  const events: Record<string, Event[]> = {
    friday: [
      {
        id: '1',
        title: 'Registration & Check-in',
        time: '3:00 PM - 5:00 PM',
        location: 'Ballroom Entrance',
        type: 'social',
        description: 'Get your wristbands.'
      },
      {
        id: '2',
        title: 'Friday Night Pre Party',
        time: '4:00 PM - 11:30 PM',
        location: 'Main Ballroom',
        type: 'social',
        description: 'Kick off the weekend fingerboarding and sponsored events!'
      },
      {
        id: '3',
        title: 'Blackriver Ramps Sponsored Event',
        time: '7:00 PM - 9:00 PM',
        location: 'Main Ballroom',
        type: 'compitition',
        description: 'Your chance to beat a Blackriver pro and win sick prizes.'
      },
      {
        id: '4',
        title: 'Sponsored Event',
        time: '5:00 PM - 6:30 PM',
        location: 'Main Ballroom',
        type: 'social',
        description: 'Details to follow'
      },
    ],
    saturday: [
      {
        id: '5',
        title: 'FlatFace Rendezvous',
        time: '12:00 PM - 5:30 PM',
        location: 'FlatFace Warehouse, 54 Chuck Dr, Dracut, MA 01826',
        type: 'Social',
        description: 'Open Fingerboard Session'
      },
      {
        id: '6',
        title: 'Official After Vous',
        time: '6:00 PM - 12:00 AM',
        location: 'Main Ballroom & Hotel Lobby',
        type: 'social',
        participants: 20,
        description: 'Open Session, Hotel Restaurant & Bar Open'
      },
      {
        id: '7',
        title: 'Sponsored Event',
        time: '7:00 PM - 9:00 PM',
        location: 'Main Ballroom',
        type: 'competition',
        participants: 32,
        description: 'Details to follow'
      },
    ],
    sunday: [
      {
        id: '9',
        title: 'Fingerboard Con',
        time: '10:00 AM - 4:00 PM',
        location: 'Main Ballroom',
        type: 'social',
        description: 'Open Session'
      },
      {
        id: '10',
        title: 'FBCon Vending',
        time: '10:00 AM - 4:00 PM',
        location: 'Main Ballroom',
        type: 'retail',
        participants: 16,
        description: 'Getting cool stuff!'
      },
      {
        id: '11',
        title: 'Panel Discussions',
        time: '12:00 PM - 3:00 PM',
        location: 'Main Stage',
        type: 'panels',
        description: 'Talking about the FB Scene'
      },
    ],
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'competition':
        return Trophy;
      case 'workshop':
        return Wrench;
      case 'social':
        return Users;
      case 'vendor':
        return MapPin;
      case 'retail':
        return ShoppingBag;
      case 'panels':
        return MessageSquare;
      default:
        return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'competition':
        return '#FF6B35';
      case 'workshop':
        return '#39FF14';
      case 'social':
        return '#00D4FF';
      case 'vendor':
        return '#FF3B6B';
      case 'retail':
        return '#FFD700';
      case 'panels':
        return '#9B59B6';
      default:
        return '#FFFFFF';
    }
  };

  const days = [
    { id: 'friday', label: 'Friday', date: '24' },
    { id: 'saturday', label: 'Saturday', date: '25' },
    { id: 'sunday', label: 'Sunday', date: '26' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <Text style={styles.title}>Event Schedule</Text>
        <Text style={styles.subtitle}>Fingerboard Con 2026</Text>
      </LinearGradient>

      <View style={styles.daySelector}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayButton,
              selectedDay === day.id && styles.dayButtonActive
            ]}
            onPress={() => setSelectedDay(day.id)}
          >
            <Text style={[
              styles.dayDate,
              selectedDay === day.id && styles.dayDateActive
            ]}>
              {day.date}
            </Text>
            <Text style={[
              styles.dayLabel,
              selectedDay === day.id && styles.dayLabelActive
            ]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {events[selectedDay]?.map((event) => {
          const IconComponent = getEventIcon(event.type);
          const eventColor = getEventColor(event.type);
          
          return (
            <View
              key={event.id}
              style={styles.eventCard}
            >
              <View style={styles.eventHeader}>
                {event.title === 'Vendor Showcase Opening' ? (
                  <View style={styles.logoContainer}>
                    <Image
                      source={require('@/assets/images/Fingerboard_Con_Transparent.png')}
                      style={styles.eventLogo}
                      resizeMode="contain"
                    />
                  </View>
                ) : event.title === 'Blackriver Ramps Sponsored Event' ? (
                  <View style={styles.logoContainer}>
                    <Image
                      source={require('@/assets/images/Blackriver Skull Logo.png')}
                      style={styles.eventLogo}
                      resizeMode="contain"
                    />
                  </View>
                ) : event.title === 'FlatFace Rendezvous' ? (
                  <View style={styles.logoContainer}>
                    <Image
                      source={require('@/assets/images/02-FlatfaceFingerboards-300x300.png')}
                      style={styles.eventLogo}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={[styles.eventIcon, { backgroundColor: eventColor }]}>
                    <IconComponent size={20} color="#000000" />
                  </View>
                )}
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <Clock size={14} color="#888888" />
                    <Text style={styles.eventTime}>{event.time}</Text>
                  </View>
                  <View style={styles.eventMeta}>
                    <MapPin size={14} color="#888888" />
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  </View>
                  {event.participants && (
                    <View style={styles.eventMeta}>
                      <Users size={14} color="#888888" />
                      <Text style={styles.eventParticipants}>
                        {event.participants} participants
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.eventDescription}>{event.description}</Text>
            </View>
          );
        })}
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
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-around',
  },
  dayButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#66BB6A',
    backgroundColor: '#4CAF50',
  },
  dayButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  dayDate: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dayDateActive: {
    color: '#2E7D32',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E8F5E8',
    marginTop: 2,
  },
  dayLabelActive: {
    color: '#2E7D32',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 4,
  },
  eventLogo: {
    width: 32,
    height: 32,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#E8F5E8',
    marginLeft: 6,
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: 14,
    color: '#E8F5E8',
    marginLeft: 6,
    fontWeight: '600',
  },
  eventParticipants: {
    fontSize: 14,
    color: '#E8F5E8',
    marginLeft: 6,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#E8F5E8',
    lineHeight: 20,
  },
});