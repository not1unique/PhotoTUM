import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

// Mathematics/Informatics Building coordinates (TUM Garching)
const MI_BUILDING_LAT = 48.2625;
const MI_BUILDING_LON = 11.6708;
const MI_BUILDING_NAME = 'Mathematics/Informatics Building';
const MI_BUILDING_ADDRESS = 'Boltzmannstraße 3, 85748 Garching';

interface BuildingRoom {
  id: string;
  name: string;
  floor: string;
  type: string;
  coordinates?: { x: number; y: number };
}

interface BuildingInfo {
  id: string;
  name: string;
  address: string;
  description?: string;
  coordinates?: { latitude: number; longitude: number };
  rooms: BuildingRoom[];
}

// Default rooms for Mathematics/Informatics building
const getDefaultRooms = (): BuildingRoom[] => [
  { id: 'MI-00.01', name: 'Main Entrance', floor: 'Ground Floor', type: 'entrance', coordinates: { x: 50, y: 80 } },
  { id: 'MI-00.02', name: 'Lecture Hall 1', floor: 'Ground Floor', type: 'lecture', coordinates: { x: 30, y: 40 } },
  { id: 'MI-00.03', name: 'Lecture Hall 2', floor: 'Ground Floor', type: 'lecture', coordinates: { x: 70, y: 40 } },
  { id: 'MI-00.04', name: 'Cafeteria', floor: 'Ground Floor', type: 'cafeteria', coordinates: { x: 50, y: 20 } },
  { id: 'MI-01.01', name: 'Computer Lab 1', floor: '1st Floor', type: 'lab', coordinates: { x: 25, y: 50 } },
  { id: 'MI-01.02', name: 'Computer Lab 2', floor: '1st Floor', type: 'lab', coordinates: { x: 75, y: 50 } },
  { id: 'MI-01.03', name: 'Study Room', floor: '1st Floor', type: 'study', coordinates: { x: 50, y: 30 } },
  { id: 'MI-02.01', name: 'Research Lab', floor: '2nd Floor', type: 'lab', coordinates: { x: 40, y: 40 } },
  { id: 'MI-02.02', name: 'Office Area', floor: '2nd Floor', type: 'office', coordinates: { x: 60, y: 60 } },
  { id: 'MI-02.03', name: 'Meeting Room', floor: '2nd Floor', type: 'meeting', coordinates: { x: 80, y: 30 } },
];

export default function NavigationScreen() {
  const [selectedFloor, setSelectedFloor] = useState<'ground' | 'first' | 'second'>('ground');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize building info with default data
  const buildingInfo: BuildingInfo = {
    id: 'MI',
    name: MI_BUILDING_NAME,
    address: MI_BUILDING_ADDRESS,
    description: 'Building for Mathematics and Informatics departments at TUM',
    coordinates: { latitude: MI_BUILDING_LAT, longitude: MI_BUILDING_LON },
    rooms: getDefaultRooms(),
  };

  // Generate OpenStreetMap HTML with Leaflet
  const getMapHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map').setView([${MI_BUILDING_LAT}, ${MI_BUILDING_LON}], 17);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        var marker = L.marker([${MI_BUILDING_LAT}, ${MI_BUILDING_LON}]).addTo(map);
        marker.bindPopup('<b>${MI_BUILDING_NAME}</b><br>${MI_BUILDING_ADDRESS}').openPopup();
        
        // Notify React Native that map is loaded
        window.ReactNativeWebView.postMessage('mapLoaded');
    </script>
</body>
</html>
    `;
  };


  const getRoomIcon = (type: string): string => {
    switch (type) {
      case 'lecture': return 'person.3.fill';
      case 'lab': return 'desktopcomputer';
      case 'study': return 'book.fill';
      case 'cafeteria': return 'cup.and.saucer.fill';
      case 'office': return 'building.2.fill';
      case 'meeting': return 'person.2.fill';
      case 'entrance': return 'door.left.hand.open';
      default: return 'mappin.circle.fill';
    }
  };

  const filteredRooms = buildingInfo?.rooms.filter(room => {
    if (selectedFloor === 'ground') return room.floor === 'Ground Floor';
    if (selectedFloor === 'first') return room.floor === '1st Floor';
    return room.floor === '2nd Floor';
  }) || [];


  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Navigation</ThemedText>
            {buildingInfo && (
              <ThemedText style={styles.headerSubtitle}>{buildingInfo.name}</ThemedText>
            )}
          </View>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              // Refresh map by reloading
              setMapLoaded(false);
            }}
          >
            <IconSymbol size={24} name="arrow.clockwise" color={BrandColors.blueAccent} />
          </TouchableOpacity>
        </View>

        {/* OpenStreetMap */}
        <View style={styles.mapContainer}>
          {!mapLoaded && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color={BrandColors.blueAccent} />
              <ThemedText style={styles.mapLoadingText}>Loading map...</ThemedText>
            </View>
          )}
          <WebView
            source={{ html: getMapHTML() }}
            style={styles.webview}
            onMessage={(event) => {
              if (event.nativeEvent.data === 'mapLoaded') {
                setMapLoaded(true);
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
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
          {/* Building Information */}
          <View style={styles.buildingInfoContainer}>
            <ThemedText style={styles.sectionTitle}>Building Information</ThemedText>
            <View style={styles.buildingInfoCard}>
              <View style={styles.buildingInfoRow}>
                <IconSymbol size={20} name="building.2.fill" color={BrandColors.blueAccent} />
                <ThemedText style={styles.buildingInfoLabel}>Name:</ThemedText>
                <ThemedText style={styles.buildingInfoValue}>{buildingInfo.name}</ThemedText>
              </View>
              <View style={styles.buildingInfoRow}>
                <IconSymbol size={20} name="mappin.circle.fill" color={BrandColors.blueAccent} />
                <ThemedText style={styles.buildingInfoLabel}>Address:</ThemedText>
                <ThemedText style={styles.buildingInfoValue}>{buildingInfo.address}</ThemedText>
              </View>
              {buildingInfo.description && (
                <View style={styles.buildingInfoRow}>
                  <IconSymbol size={20} name="info.circle.fill" color={BrandColors.blueAccent} />
                  <ThemedText style={styles.buildingInfoLabel}>Description:</ThemedText>
                  <ThemedText style={styles.buildingInfoValue}>{buildingInfo.description}</ThemedText>
                </View>
              )}
              {buildingInfo.coordinates && (
                <View style={styles.buildingInfoRow}>
                  <IconSymbol size={20} name="location.fill" color={BrandColors.blueAccent} />
                  <ThemedText style={styles.buildingInfoLabel}>Coordinates:</ThemedText>
                  <ThemedText style={styles.buildingInfoValue}>
                    {buildingInfo.coordinates.latitude.toFixed(4)}, {buildingInfo.coordinates.longitude.toFixed(4)}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Rooms List */}
          <View style={styles.locationsContainer}>
            <ThemedText style={styles.sectionTitle}>Rooms ({filteredRooms.length})</ThemedText>
            {filteredRooms.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>No rooms found on this floor</ThemedText>
              </View>
            ) : (
              filteredRooms.map((room) => (
                <TouchableOpacity 
                  key={room.id} 
                  style={[
                    styles.locationItem,
                    selectedLocation === room.id && styles.locationItemSelected
                  ]}
                  onPress={() => setSelectedLocation(selectedLocation === room.id ? null : room.id)}
                >
                  <View style={styles.locationIcon}>
                    <IconSymbol size={24} name={getRoomIcon(room.type) as any} color={BrandColors.blueAccent} />
                  </View>
                  <View style={styles.locationDetails}>
                    <ThemedText style={styles.locationName}>{room.name}</ThemedText>
                    <ThemedText style={styles.locationFloor}>{room.id} • {room.floor}</ThemedText>
                  </View>
                  <IconSymbol size={20} name="arrow.right" color={Colors.dark.icon} />
                </TouchableOpacity>
              ))
            )}
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
    backgroundColor: Colors.dark.cardBackground,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: Colors.dark.icon,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: Colors.dark.icon,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  buildingInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buildingInfoCard: {
    backgroundColor: Colors.dark.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  buildingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  buildingInfoLabel: {
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: Colors.dark.icon,
    minWidth: 90,
  },
  buildingInfoValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: BrandColors.white,
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
  locationItemSelected: {
    borderColor: BrandColors.blueAccent,
    backgroundColor: BrandColors.blueAccent + '10',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontFamily: 'Orbitron',
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

