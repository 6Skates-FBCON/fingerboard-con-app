import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Store, MapPin, Globe, Star, Filter } from 'lucide-react-native';

interface Vendor {
  id: string;
  name: string;
  description: string;
  category: string;
  booth: string;
  featured: boolean;
  website?: string;
  specialOffer?: string;
}

export default function VendorsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const vendors: Vendor[] = [
    {
      id: '1',
      name: '6Skates',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'decks',
      booth: '1',
      featured: true,
      website: 'https://6skates.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '1-accessories',
      name: '6Skates',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'accessories',
      booth: '1',
      featured: true,
      website: 'https://6skates.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '1-ramps',
      name: '6Skates',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'ramps',
      booth: '1',
      featured: true,
      website: 'https://6skates.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '2',
      name: 'Slushcult',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'decks',
      booth: '2',
      featured: true,
      website: 'https://slushcult.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '2-accessories',
      name: 'Slushcult',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'accessories',
      booth: '2',
      featured: true,
      website: 'https://slushcult.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '2-ramps',
      name: 'Slushcult',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'ramps',
      booth: '2',
      featured: true,
      website: 'https://slushcult.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '3',
      name: 'Blackriver Ramps',
      description: 'Hand-crafted wooden fingerboards and obstacles',
      category: 'decks',
      booth: '3',
      featured: true,
      website: 'https://www.blackriver-shop.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '3-accessories',
      name: 'Blackriver Ramps',
      description: 'Hand-crafted wooden fingerboards and obstacles',
      category: 'accessories',
      booth: '3',
      featured: true,
      website: 'https://www.blackriver-shop.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '3-ramps',
      name: 'Blackriver Ramps',
      description: 'Hand-crafted wooden fingerboards and obstacles',
      category: 'ramps',
      booth: '3',
      featured: true,
      website: 'https://www.blackriver-shop.com',
      specialOffer: 'FBCon Exclusive drops',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Vendors' },
    { id: 'decks', label: 'Decks' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'ramps', label: 'Ramps & Obstacles' },
  ];

  const filteredVendors = selectedCategory === 'all' 
    ? vendors 
    : vendors.filter(vendor => vendor.category === selectedCategory);

  const featuredVendors = vendors.filter(vendor => vendor.featured);

  const openWebsite = async (url?: string) => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    }
  };

  const findBooth = (boothNumber: string) => {
    // TODO: Implement booth finding functionality
    // This could navigate to a map view or show directions
    console.log(`Finding booth ${boothNumber}`);
    // For now, we'll show a simple alert-like behavior
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <Text style={styles.title}>Vendor Directory</Text>
        <Text style={styles.subtitle}>{vendors.length} vendors • Hall A & B</Text>
      </LinearGradient>

      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedCategory === 'all' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Featured Vendors</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredVendors.map((vendor) => (
                <View key={vendor.id} style={styles.featuredCard}>
                  <View style={styles.featuredHeader}>
                    <Text style={styles.featuredName}>{vendor.name}</Text>
                    <Text style={styles.featuredBooth}>Booth {vendor.booth}</Text>
                  </View>
                  <Text style={styles.featuredDescription}>{vendor.description}</Text>
                  {vendor.specialOffer && (
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerText}>{vendor.specialOffer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Vendors' : categories.find(c => c.id === selectedCategory)?.label}
          </Text>
          
          {filteredVendors.map((vendor) => (
            <View key={vendor.id} style={styles.vendorCard}>
              <View style={styles.vendorHeader}>
                <View style={styles.vendorIconContainer}>
                  <Store size={24} color="#FF6B35" />
                </View>
                <View style={styles.vendorInfo}>
                  <View style={styles.vendorTitleRow}>
                    <Text style={styles.vendorName}>{vendor.name}</Text>
                    {vendor.featured && (
                      <View style={styles.featuredBadge}>
                        <Star size={12} color="#000000" fill="#FFD700" />
                      </View>
                    )}
                  </View>
                  <View style={styles.vendorMeta}>
                    <MapPin size={14} color="#888888" />
                    <Text style={styles.vendorBooth}>Booth {vendor.booth}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.vendorDescription}>{vendor.description}</Text>

              {vendor.specialOffer && (
                <View style={styles.specialOfferContainer}>
                  <Text style={styles.specialOfferText}>🎉 {vendor.specialOffer}</Text>
                </View>
              )}

              <View style={styles.vendorActions}>
                {vendor.website && (
                  <TouchableOpacity
                    style={styles.websiteButton}
                    onPress={() => openWebsite(vendor.website)}
                  >
                    <Globe size={16} color="#00D4FF" />
                    <Text style={styles.websiteButtonText}>Visit Website</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.findButton}
                  onPress={() => findBooth(vendor.booth)}
                >
                  <MapPin size={16} color="#FFFFFF" />
                  <Text style={styles.findButtonText}>Find Booth</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>🗺️ Vendor Map</Text>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>Interactive venue map coming soon!</Text>
            <Text style={styles.mapSubtext}>
              Use the "Find Booth" buttons to get directions to specific vendors.
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
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#66BB6A',
    borderWidth: 1,
    borderColor: '#81C784',
  },
  categoryButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryTextActive: {
    color: '#2E7D32',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  featuredCard: {
    width: 280,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  featuredBooth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#E8F5E8',
    marginBottom: 12,
    lineHeight: 18,
  },
  offerBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  offerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
  },
  vendorCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  vendorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  vendorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#66BB6A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vendorBooth: {
    fontSize: 14,
    color: '#E8F5E8',
    fontWeight: '600',
  },
  vendorDescription: {
    fontSize: 14,
    color: '#E8F5E8',
    marginBottom: 12,
    lineHeight: 20,
  },
  specialOfferContainer: {
    backgroundColor: '#66BB6A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  specialOfferText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  vendorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  websiteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#66BB6A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    gap: 6,
  },
  websiteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  findButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    gap: 6,
  },
  findButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  mapSection: {
    marginBottom: 40,
  },
  mapPlaceholder: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#66BB6A',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 20,
  },
});