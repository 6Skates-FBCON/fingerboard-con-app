import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Store, MapPin, Globe, Star } from 'lucide-react-native';

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
  const vendors: Vendor[] = [
    {
      id: '1',
      name: '6Skates',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'decks',
      booth: 'TBD',
      featured: true,
      website: 'https://6skates.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '2',
      name: 'Slushcult',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'decks',
      booth: 'TBD',
      featured: true,
      website: 'https://slushcult.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '3',
      name: 'Blackriver Ramps',
      description: 'Hand-crafted wooden fingerboards and obstacles',
      category: 'decks',
      booth: 'TBD',
      featured: true,
      website: 'https://www.blackriver-shop.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '4',
      name: 'FlatFace Fingerboards',
      description: 'The home of Premium Fingerboard Brands',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.flatfacefingerboards.com/',
      specialOffer: 'FlatFace, Blistered & Duck Decks',
    },
    {
      id: '5',
      name: 'Refind Supply Co.',
      description: 'Handcrafted Refind Decks, Custom Apparel and Accessories',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.refindsupplyco.com',
      specialOffer: 'Fingerboard Con Exclusive Drops',
    },
    {
      id: '6',
      name: 'Zeg Heads',
      description: 'DIY fingerboard print shop selling select premium brands, mini skate rip sticker sheets, and original art',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.zegheads.com',
      specialOffer: 'Stickers, Exclusives & Collab Drops',
    },
    {
      id: '7',
      name: 'Doom Lagoon',
      description: 'Progressive fingerboards handmade in Texas',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://doomlagoon.com/',
      specialOffer: 'Exclusive Fingerboard Con exo ply decks',
    },
    {
      id: '8',
      name: 'DeliDecks',
      description: 'Crafting premium fingerboards since 2015. Offering decks, trux, wheels & more!',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://delidecksusa.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '9',
      name: 'Skatestation',
      description: 'Physical & online fingerboard shop carrying brands from all over the world',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://skatestation.shop/',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '10',
      name: 'Teak Tuning & Session Fingerboards',
      description: 'Fingerboard brand based in Rochester, NY offering high-quality decks, wheels, components, and obstacles.',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.teaktuning.com',
      specialOffer: 'Fingerboard Con Exclusive Drops',
    },
    {
      id: '11',
      name: 'Silent Obstacles',
      description: 'The world’s first silent fingerboard obstacles',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://silentobstacles.com/',
      specialOffer: 'Fingerboard Stuff',
    },
    {
      id: '12',
      name: 'Ritual Concrete',
      description: 'Handcrafted concrete obstacles made to perform The Ritual',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://ritualism.bigcartel.com',
      specialOffer: 'Concrete Obstacles, Accessories & More',
    },
    {
      id: '13',
      name: 'Future Bound Prints',
      description: 'Realistic 3D-printed fingerboard obstacles and props inspired by real street spots to level up parks and setups.',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.futureboundprints.com/',
      specialOffer: 'Props, Obstacles and FBcon Exclusives',
    },
    {
      id: '14',
      name: 'Fattys World',
      description: 'Fingerboarding may not be the first thing that comes to mind when you think of Fatty’s, but they’re deeply rooted in the FB community',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://fattys.world/',
      specialOffer: 'Decks, Wheels, Merch, & Other Oddities.',
    },
    {
      id: '15',
      name: 'Maple Leaf Decks',
      description: 'Vendor details coming soon',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.mapleleafdecks.com',
      specialOffer: 'Vendor details coming soon',
    },
    {
      id: '16',
      name: 'ABC Parks',
      description: 'Handcrafted fingerboard obstacles built for performance and creativity',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://abcparks.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '17',
      name: 'Bonk Benches',
      description: 'Miniature skateboard products handmade in Upstate New York',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://bonkbencheshq.bigcartel.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '18',
      name: 'Cryptic Collective',
      description: 'Vendor details coming soon',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.crypticcollective.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '19',
      name: 'FlockDecks',
      description: 'Vendor details coming soon',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.flockdecks.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '20',
      name: 'Loft Fingerboarding',
      description: 'Vendor details coming soon',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.loftfingerboarding.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '21',
      name: 'Maple Wheels',
      description: 'Vendor details coming soon',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://maplewheelsfb.com/',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '22',
      name: 'Sweets Kendamas',
      description: 'Vendor details coming soon',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://sweetskendamas.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '23',
      name: '3face',
      description: 'Vendor details coming soon',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.3face.us/',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '24',
      name: 'BoardCorks',
      description: 'Fingerboard display solutions made with cork',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.boardcorks.com',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '25',
      name: 'Kickflick Fingerboards',
      description: 'Mini skateboards for your fingers',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://www.kickflickfingerboards.com/',
      specialOffer: 'FBCon Exclusive drops',
    },
    {
      id: '26',
      name: 'Run it Back',
      description: 'Used Fingerboard Gear Shop',
      category: 'decks',
      booth: 'TBD',
      featured: false,
      website: 'https://clued.shop/runitbackfb',
      specialOffer: 'FBCon Exclusive drops',
    },
  ];

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <Text style={styles.title}>Vendor Directory</Text>
        <Text style={styles.subtitle}>{vendors.length} vendors • Main Ballroom</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Vendors</Text>

          {vendors.map((vendor) => (
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
                <TouchableOpacity
                  style={styles.websiteButton}
                  onPress={() => openWebsite(vendor.website)}
                  disabled={!vendor.website}
                >
                  <Globe size={18} color="#FFD700" />
                  <Text style={styles.websiteButtonText}>Visit Website</Text>
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
              Check back for detailed booth locations and venue layout.
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
    paddingTop: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(102, 187, 106, 0.3)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#66BB6A',
    gap: 8,
  },
  websiteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFD700',
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