import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandColors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function NavigationScreen() {
  const [selectedFloor, setSelectedFloor] = useState<'ground' | 'first' | 'second'>('ground');
  
  const locations = [
    { id: 1, name: 'Main Hall', floor: 'Ground Floor', icon: 'building.2', lat: 48.1500, lng: 11.5700 },
    { id: 2, name: 'Workshop Room A', floor: '1st Floor', icon: 'book', lat: 48.1501, lng: 11.5701 },
    { id: 3, name: 'Workshop Room B', floor: '1st Floor', icon: 'book', lat: 48.1502, lng: 11.5702 },
    { id: 4, name: 'Cafeteria', floor: 'Ground Floor', icon: 'cup.and.saucer', lat: 48.1499, lng: 11.5699 },
    { id: 5, name: 'Restrooms', floor: 'All Floors', icon: 'figure.walk', lat: 48.1503, lng: 11.5703 },
    { id: 6, name: 'Networking Area', floor: '2nd Floor', icon: 'person.2', lat: 48.1504, lng: 11.5704 },
  ];

  const filteredLocations = locations.filter(loc => {
    if (selectedFloor === 'ground') return loc.floor === 'Ground Floor' || loc.floor === 'All Floors';
    if (selectedFloor === 'first') return loc.floor === '1st Floor' || loc.floor === 'All Floors';
    return loc.floor === '2nd Floor' || loc.floor === 'All Floors';
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Navigation</ThemedText>
          <TouchableOpacity style={styles.headerButton}>
            <IconSymbol size={24} name="location.fill" color={BrandColors.blueAccent} />
          </TouchableOpacity>
        </View>

        {/* Interactive Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 48.1500,
              longitude: 11.5700,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            mapType="standard"
            customMapStyle={[
              {
                elementType: 'geometry',
                stylers: [{ color: BrandColors.darkBackground }],
              },
              {
                elementType: 'labels.text.stroke',
                stylers: [{ color: BrandColors.darkBackground }],
              },
              {
                elementType: 'labels.text.fill',
                stylers: [{ color: BrandColors.white }],
              },
            ]}
          >
            {filteredLocations.map((location) => (
              <Marker
                key={location.id}
                coordinate={{ latitude: location.lat, longitude: location.lng }}
                title={location.name}
                description={location.floor}
              >
                <View style={styles.markerContainer}>
                  <IconSymbol size={24} name={location.icon as any} color={BrandColors.blueAccent} />
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* Floor Selector */}
        <View style={styles.floorSelector}>
          <TouchableOpacity 
            style={[styles.floorButton, selectedFloor === 'ground' && styles.floorButtonActive]}
            onPress={() => setSelectedFloor('ground')}
          >
            <ThemedText style={[styles.floorButtonText, selectedFloor === 'ground' && styles.floorButtonTextActive]}>
              Ground
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floorButton, selectedFloor === 'first' && styles.floorButtonActive]}
            onPress={() => setSelectedFloor('first')}
          >
            <ThemedText style={[styles.floorButtonText, selectedFloor === 'first' && styles.floorButtonTextActive]}>
              1st Floor
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floorButton, selectedFloor === 'second' && styles.floorButtonActive]}
            onPress={() => setSelectedFloor('second')}
          >
            <ThemedText style={[styles.floorButtonText, selectedFloor === 'second' && styles.floorButtonTextActive]}>
              2nd Floor
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* Locations List */}
          <View style={styles.locationsContainer}>
            <ThemedText style={styles.sectionTitle}>Key Locations</ThemedText>
            {filteredLocations.map((location) => (
              <TouchableOpacity key={location.id} style={styles.locationItem}>
                <View style={styles.locationIcon}>
                  <IconSymbol size={24} name={location.icon as any} color={BrandColors.blueAccent} />
                </View>
                <View style={styles.locationDetails}>
                  <ThemedText style={styles.locationName}>{location.name}</ThemedText>
                  <ThemedText style={styles.locationFloor}>{location.floor}</ThemedText>
                </View>
                <IconSymbol size={20} name="arrow.right" color={Colors.dark.icon} />
              </TouchableOpacity>
            ))}
          </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard}>
            <IconSymbol size={32} name="wifi" color={BrandColors.blueAccent} />
            <ThemedText style={styles.quickActionTitle}>WiFi Info</ThemedText>
            <ThemedText style={styles.quickActionSubtitle}>Network & Password</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <IconSymbol size={32} name="mappin.and.ellipse" color={BrandColors.blueAccent} />
            <ThemedText style={styles.quickActionTitle}>Emergency</ThemedText>
            <ThemedText style={styles.quickActionSubtitle}>Exit Routes</ThemedText>
          </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.darkBackground,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: BrandColors.darkBackground,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: BrandColors.blueAccent,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  floorPlanContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  floorPlanPlaceholder: {
    height: 250,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 16,
  },
  floorPlanText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  floorPlanSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.dark.icon,
  },
  floorSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  floorButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.dark.cardBackground,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  floorButtonActive: {
    backgroundColor: BrandColors.blueAccent,
    borderColor: BrandColors.blueAccent,
  },
  floorButtonText: {
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: Colors.dark.icon,
  },
  floorButtonTextActive: {
    fontSize: 14,
    fontFamily: 'Orbitron',
    fontWeight: '600',
    color: BrandColors.white,
  },
  locationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    marginBottom: 16,
    color: BrandColors.white,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.blueAccent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginBottom: 4,
  },
  locationFloor: {
    fontSize: 13,
    color: Colors.dark.icon,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.dark.cardBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginTop: 12,
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: Colors.dark.icon,
    marginTop: 4,
  },
});

