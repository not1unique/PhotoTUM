import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Modal, Image, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandColors } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 images per row with padding
const largeImageSize = imageSize * 2 + 4; // 2x2 = 4 photos size

interface Photo {
  id: string;
  uri: string;
  source: 'gallery' | 'public' | 'camera';
  isFavorite: boolean;
  timestamp: number;
}

export default function PhotosScreen() {
  const [selectedTab, setSelectedTab] = useState<'gallery' | 'public' | 'favorites'>('gallery');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Load photos from folders
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      // For React Native, we'll use a combination of approaches
      // In production, you'd use a backend API or asset bundling
      const galleryPhotos: Photo[] = [];
      const publicPhotos: Photo[] = [];

      // Create photo entries - in production, these would come from a backend or asset list
      // For now, using placeholder images that demonstrate the functionality
      // The actual implementation would scan the directories server-side or use asset lists
      
      // Gallery photos (2024) - sample set
      for (let i = 0; i < 25; i++) {
        galleryPhotos.push({
          id: `gallery-${i}`,
          uri: `https://picsum.photos/400/400?random=${i + 100}`, // Placeholder - replace with actual paths
          source: 'gallery',
          isFavorite: Math.random() > 0.85,
          timestamp: Date.now() - i * 60000,
        });
      }

      // Public photos (2023) - sample set
      for (let i = 0; i < 25; i++) {
        publicPhotos.push({
          id: `public-${i}`,
          uri: `https://picsum.photos/400/400?random=${i + 200}`, // Placeholder - replace with actual paths
          source: 'public',
          isFavorite: Math.random() > 0.85,
          timestamp: Date.now() - i * 60000,
        });
      }

      setPhotos([...galleryPhotos, ...publicPhotos]);
    } catch (error) {
      console.error('Error loading photos:', error);
      // Fallback: create some demo photos
      const demoPhotos: Photo[] = Array.from({ length: 20 }, (_, i) => ({
        id: `demo-${i}`,
        uri: `https://picsum.photos/400/400?random=${i}`,
        source: i % 2 === 0 ? 'gallery' : 'public',
        isFavorite: false,
        timestamp: Date.now() - i * 1000,
      }));
      setPhotos(demoPhotos);
    }
  };

  const getFilteredPhotos = () => {
    if (selectedTab === 'gallery') {
      return photos.filter(p => p.source === 'gallery' || p.source === 'camera');
    } else if (selectedTab === 'public') {
      return photos.filter(p => p.source === 'public');
    } else {
      return photos.filter(p => p.isFavorite);
    }
  };

  const takePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }
    }
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          // Add watermark
          const watermarkedPhoto = await addWatermark(photo.uri);
          
          // Save to photos
          const newPhoto: Photo = {
            id: `camera-${Date.now()}`,
            uri: watermarkedPhoto,
            source: 'camera',
            isFavorite: false,
            timestamp: Date.now(),
          };
          
          setPhotos(prev => [newPhoto, ...prev]);
          setShowCamera(false);
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const addWatermark = async (imageUri: string): Promise<string> => {
    try {
      // For watermark, we'll use image manipulation
      // In a real app, you'd use a library like react-native-view-shot or expo-image-manipulator
      // For now, we'll return the original URI and add a visual watermark in the UI
      return imageUri;
    } catch (error) {
      console.error('Error adding watermark:', error);
      return imageUri;
    }
  };

  const toggleFavorite = (photoId: string) => {
    setPhotos(prev =>
      prev.map(p => (p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const deletePhoto = (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            if (selectedPhoto?.id === photoId) {
              setSelectedPhoto(null);
            }
          },
        },
      ]
    );
  };

  const filteredPhotos = getFilteredPhotos();

  // Calculate grid positions - large photos every 7th, alternating sides
  const getPhotoStyle = (index: number) => {
    const isLarge = index % 7 === 0;
    const shouldAlignLeft = Math.floor(index / 7) % 2 === 0;

    if (isLarge) {
      return {
        width: largeImageSize,
        height: largeImageSize,
        ...(shouldAlignLeft ? { marginRight: 2 } : { marginLeft: 2 }),
      };
    }
    return {
      width: imageSize,
      height: imageSize,
    };
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Photos</ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <IconSymbol size={24} name="magnifyingglass" color={BrandColors.blueAccent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <IconSymbol size={24} name="ellipsis.circle" color={BrandColors.blueAccent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <IconSymbol size={28} name="camera.fill" color={BrandColors.white} />
            <ThemedText style={styles.actionButtonText}>Take Photo</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol size={28} name="person.crop.circle.badge.checkmark" color={BrandColors.white} />
            <ThemedText style={styles.actionButtonText}>Find Me</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'gallery' && styles.tabActive]}
            onPress={() => setSelectedTab('gallery')}
          >
            <ThemedText style={[styles.tabText, selectedTab === 'gallery' && styles.tabTextActive]}>
              Gallery
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'public' && styles.tabActive]}
            onPress={() => setSelectedTab('public')}
          >
            <ThemedText style={[styles.tabText, selectedTab === 'public' && styles.tabTextActive]}>
              Public
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'favorites' && styles.tabActive]}
            onPress={() => setSelectedTab('favorites')}
          >
            <ThemedText style={[styles.tabText, selectedTab === 'favorites' && styles.tabTextActive]}>
              Favorites
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Photo Grid */}
        <ScrollView style={styles.photoGrid} showsVerticalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {filteredPhotos.map((photo, index) => {
              const photoStyle = getPhotoStyle(index);
              const isLarge = index % 7 === 0;

              return (
                <TouchableOpacity
                  key={photo.id}
                  style={[styles.photo, photoStyle]}
                  onPress={() => setSelectedPhoto(photo)}
                >
                  <ExpoImage
                    source={{ uri: photo.uri }}
                    style={styles.photoImage}
                    contentFit="cover"
                  />
                  {photo.isFavorite && (
                    <View style={styles.favoriteBadge}>
                      <IconSymbol size={16} name="heart.fill" color={BrandColors.blueAccent} />
                    </View>
                  )}
                  {photo.source === 'camera' && (
                    <View style={styles.watermark}>
                      <ThemedText style={styles.watermarkText}>HackaTUM</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Photo Viewer Modal */}
        <Modal
          visible={selectedPhoto !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          {selectedPhoto && (
            <View style={styles.modalContainer}>
              <SafeAreaView style={styles.modalSafeArea}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                    <IconSymbol size={24} name="xmark" color={BrandColors.white} />
                  </TouchableOpacity>
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(selectedPhoto.id)}
                      style={styles.modalActionButton}
                    >
                      <IconSymbol
                        size={24}
                        name={selectedPhoto.isFavorite ? 'heart.fill' : 'heart'}
                        color={selectedPhoto.isFavorite ? BrandColors.blueAccent : BrandColors.white}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deletePhoto(selectedPhoto.id)}
                      style={styles.modalActionButton}
                    >
                      <IconSymbol size={24} name="trash" color={BrandColors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.modalImageContainer}>
                  <ExpoImage
                    source={{ uri: selectedPhoto.uri }}
                    style={styles.modalImage}
                    contentFit="contain"
                  />
                  {selectedPhoto.source === 'camera' && (
                    <View style={styles.modalWatermark}>
                      <ThemedText style={styles.modalWatermarkText}>HackaTUM</ThemedText>
                    </View>
                  )}
                </View>
              </SafeAreaView>
            </View>
          )}
        </Modal>

        {/* Camera Modal */}
        <Modal
          visible={showCamera}
          animationType="slide"
          onRequestClose={() => setShowCamera(false)}
        >
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={CameraType.back}
            >
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setShowCamera(false)}
                >
                  <IconSymbol size={32} name="xmark.circle.fill" color={BrandColors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={capturePhoto}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                <View style={styles.cameraButton} />
              </View>
              <View style={styles.cameraWatermarkPreview}>
                <ThemedText style={styles.cameraWatermarkText}>HackaTUM</ThemedText>
              </View>
            </CameraView>
          </View>
        </Modal>
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.blueAccent,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.dark.cardBackground,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabActive: {
    backgroundColor: BrandColors.blueAccent + '30',
    borderColor: BrandColors.blueAccent,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Orbitron',
    color: Colors.dark.icon,
  },
  tabTextActive: {
    color: BrandColors.blueAccent,
    fontWeight: '600',
  },
  photoGrid: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  photo: {
    margin: 2,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: BrandColors.darkBackground + 'CC',
    borderRadius: 12,
    padding: 4,
  },
  watermark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: BrandColors.blueAccent + 'CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BrandColors.darkBackground + 'F0',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  modalActionButton: {
    padding: 8,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalWatermark: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: BrandColors.blueAccent + 'CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modalWatermarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: BrandColors.darkBackground,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: BrandColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BrandColors.white,
  },
  cameraWatermarkPreview: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: BrandColors.blueAccent + 'CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cameraWatermarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
});
