import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandColors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';

const { width, height } = Dimensions.get('window');

export default function NavigationScreen() {
  const [selectedFloor, setSelectedFloor] = useState<'ground' | 'first' | 'second'>('ground');
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  const locations = [
    { id: 1, name: 'Main Hall', floor: 'Ground Floor', icon: 'building.2', x: 50, y: 30 },
    { id: 2, name: 'Workshop Room A', floor: '1st Floor', icon: 'book', x: 30, y: 50 },
    { id: 3, name: 'Workshop Room B', floor: '1st Floor', icon: 'book', x: 70, y: 50 },
    { id: 4, name: 'Cafeteria', floor: 'Ground Floor', icon: 'cup.and.saucer', x: 50, y: 70 },
    { id: 5, name: 'Restrooms', floor: 'All Floors', icon: 'figure.walk', x: 20, y: 40 },
    { id: 6, name: 'Networking Area', floor: '2nd Floor', icon: 'person.2', x: 80, y: 60 },
  ];

  const filteredLocations = locations.filter(loc => {
    if (selectedFloor === 'ground') return loc.floor === 'Ground Floor' || loc.floor === 'All Floors';
    if (selectedFloor === 'first') return loc.floor === '1st Floor' || loc.floor === 'All Floors';
    return loc.floor === '2nd Floor' || loc.floor === 'All Floors';
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: translateX, dy: translateY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        translateX.flattenOffset();
        translateY.flattenOffset();
      },
    })
  ).current;

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

        {/* Interactive Floor Plan */}
        <View style={styles.mapContainer}>
          <Animated.View
            style={[
              styles.floorPlan,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Floor plan background grid */}
            <View style={styles.floorPlanGrid}>
              {Array.from({ length: 10 }).map((_, i) => (
                <View key={`h-${i}`} style={[styles.gridLine, styles.gridLineHorizontal, { top: `${i * 10}%` }]} />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <View key={`v-${i}`} style={[styles.gridLine, styles.gridLineVertical, { left: `${i * 10}%` }]} />
              ))}
            </View>
            
            {/* Location markers */}
            {filteredLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.mapMarker,
                  {
                    left: `${location.x}%`,
                    top: `${location.y}%`,
                  },
                  selectedLocation === location.id && styles.mapMarkerSelected,
                ]}
                onPress={() => setSelectedLocation(selectedLocation === location.id ? null : location.id)}
              >
                <View style={styles.markerContainer}>
                  <IconSymbol size={20} name={location.icon as any} color={BrandColors.blueAccent} />
                </View>
                {selectedLocation === location.id && (
                  <View style={styles.markerLabel}>
                    <ThemedText style={styles.markerLabelText}>{location.name}</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
          
          {/* Zoom controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => {
                Animated.spring(scale, {
                  toValue: scale._value * 1.2,
                  useNativeDriver: false,
                }).start();
              }}
            >
              <IconSymbol size={20} name="plus" color={BrandColors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => {
                Animated.spring(scale, {
                  toValue: scale._value * 0.8,
                  useNativeDriver: false,
                }).start();
              }}
            >
              <IconSymbol size={20} name="minus" color={BrandColors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => {
                Animated.parallel([
                  Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
                  Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
                  Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
                ]).start();
              }}
            >
              <IconSymbol size={20} name="arrow.counterclockwise" color={BrandColors.white} />
            </TouchableOpacity>
          </View>
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
    backgroundColor: Colors.dark.cardBackground,
    position: 'relative',
  },
  floorPlan: {
    width: '200%',
    height: '200%',
    position: 'relative',
  },
  floorPlanGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: Colors.dark.border + '40',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 1,
  },
  gridLineVertical: {
    height: '100%',
    width: 1,
  },
  mapMarker: {
    position: 'absolute',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  mapMarkerSelected: {
    zIndex: 10,
  },
  markerContainer: {
    backgroundColor: BrandColors.darkBackground,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: BrandColors.blueAccent,
    shadowColor: BrandColors.blueAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  markerLabel: {
    position: 'absolute',
    top: -30,
    left: -40,
    backgroundColor: BrandColors.blueAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  markerLabelText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.blueAccent + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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

