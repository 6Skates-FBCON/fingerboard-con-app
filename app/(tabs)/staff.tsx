import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanLine, Shield, BarChart3, Users, Ticket } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function StaffScreen() {
  const [stats, setStats] = useState({
    totalTickets: 0,
    validatedTickets: 0,
    activeTickets: 0,
    transferredTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: allTickets } = await supabase
        .from('tickets')
        .select('status');

      if (allTickets) {
        const total = allTickets.length;
        const validated = allTickets.filter(t => t.status === 'validated').length;
        const active = allTickets.filter(t => t.status === 'active').length;
        const transferred = allTickets.filter(t => t.status === 'transferred').length;

        setStats({
          totalTickets: total,
          validatedTickets: validated,
          activeTickets: active,
          transferredTickets: transferred,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const staffTools = [
    {
      icon: ScanLine,
      title: 'Validate Tickets',
      description: 'Scan QR codes at entrance',
      route: '/validate-ticket',
      color: '#2E7D32',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.adminBadge}>
              <Shield size={24} color="#FFD700" />
            </View>
            <Text style={styles.headerTitle}>Staff Dashboard</Text>
            <Text style={styles.headerSubtitle}>Admin Access</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#4CAF50' }]}>
                  <Ticket size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{loading ? '...' : stats.totalTickets}</Text>
                <Text style={styles.statLabel}>Total Tickets</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#2E7D32' }]}>
                  <ScanLine size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{loading ? '...' : stats.validatedTickets}</Text>
                <Text style={styles.statLabel}>Validated</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#66BB6A' }]}>
                  <BarChart3 size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{loading ? '...' : stats.activeTickets}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#81C784' }]}>
                  <Users size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{loading ? '...' : stats.transferredTickets}</Text>
                <Text style={styles.statLabel}>Transferred</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Staff Tools</Text>
            {staffTools.map((tool, index) => (
              <TouchableOpacity
                key={index}
                style={styles.toolCard}
                onPress={() => router.push(tool.route as any)}
              >
                <View style={[styles.toolIcon, { backgroundColor: '#FFFFFF' }]}>
                  <tool.icon size={28} color={tool.color} />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                You have administrative access to all staff features. Use the tools above to manage event operations.
              </Text>
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
  adminBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#FFD700',
    textAlign: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    flexBasis: '48%',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E8F5E8',
    textAlign: 'center',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    fontSize: 15,
    color: '#E8F5E8',
    lineHeight: 22,
  },
});
