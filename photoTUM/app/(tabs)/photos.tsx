import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandColors } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image as ExpoImage } from 'expo-image';
import { Asset } from 'expo-asset';
import { galleryImages, publicImages } from '@/utils/imageLoader';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 images per row with padding
const largeImageSize = imageSize * 2 + 4; // 2x2 = 4 photos size

interface Photo {
  id: string;
  source: number | { uri: string }; // require() module or { uri: string }
  sourceType: 'gallery' | 'public' | 'camera';
  isFavorite: boolean;
  timestamp: number;
}

export default function PhotosScreen() {
  const [selectedTab, setSelectedTab] = useState<'gallery' | 'public' | 'favorites'>('gallery');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Load photos from assets folders
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const galleryPhotos: Photo[] = [];
      const publicPhotos: Photo[] = [];

      // Load gallery photos (2024) using Asset API
      for (let i = 0; i < galleryImages.length; i++) {
        try {
          const imageModule = galleryImages[i];
          if (imageModule) {
            const asset = Asset.fromModule(imageModule);
            await asset.downloadAsync(); // Ensure asset is loaded
            galleryPhotos.push({
              id: `gallery-${i}`,
              source: { uri: asset.localUri || asset.uri },
              sourceType: 'gallery',
              isFavorite: false,
              timestamp: Date.now() - i * 60000,
            });
          }
        } catch (e) {
          console.error(`Error loading gallery image ${i}:`, e);
        }
      }

      // Load public photos (2023) using Asset API
      for (let i = 0; i < publicImages.length; i++) {
        try {
          const imageModule = publicImages[i];
          if (imageModule) {
            const asset = Asset.fromModule(imageModule);
            await asset.downloadAsync(); // Ensure asset is loaded
            publicPhotos.push({
              id: `public-${i}`,
              source: { uri: asset.localUri || asset.uri },
              sourceType: 'public',
              isFavorite: false,
              timestamp: Date.now() - i * 60000,
            });
          }
        } catch (e) {
          console.error(`Error loading public image ${i}:`, e);
        }
      }

      console.log(`Loaded ${galleryPhotos.length} gallery photos and ${publicPhotos.length} public photos`);
      if (galleryPhotos.length > 0) {
        console.log('Sample gallery photo URI:', galleryPhotos[0].source);
      }
      setPhotos([...galleryPhotos, ...publicPhotos]);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const getFilteredPhotos = () => {
    if (selectedTab === 'gallery') {
      return photos.filter(p => p.sourceType === 'gallery' || p.sourceType === 'camera');
    } else if (selectedTab === 'public') {
      return photos.filter(p => p.sourceType === 'public');
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
          // Save to photos
          const newPhoto: Photo = {
            id: `camera-${Date.now()}`,
            source: { uri: photo.uri },
            sourceType: 'camera',
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

  const toggleFavorite = (photoId: string) => {
    setPhotos(prev =>
      prev.map(p => {
        if (p.id === photoId) {
          const updated = { ...p, isFavorite: !p.isFavorite };
          // Update selected photo if it's the same one
          if (selectedPhoto?.id === photoId) {
            setSelectedPhoto(updated);
          }
          return updated;
        }
        return p;
      })
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

  // Group photos into rows based on the pattern:
  // Row 1: huge (left) + 2 small (right)
  // Row 2: 3 small
  // Row 3: 2 small (left) + huge (right)
  // Row 4: 3 small
  // Repeat...
  const getPhotoRows = () => {
    const rows: Array<{ photos: Photo[]; type: 'huge-left' | 'three-small' | 'huge-right' }> = [];
    let index = 0;

    while (index < filteredPhotos.length) {
      const rowIndex = rows.length % 4;

      if (rowIndex === 0) {
        // Huge left + 2 small right
        const rowPhotos = filteredPhotos.slice(index, index + 3);
        if (rowPhotos.length === 3) {
          rows.push({ photos: rowPhotos, type: 'huge-left' });
          index += 3;
        } else {
          // Handle remaining photos
          rows.push({ photos: rowPhotos, type: 'three-small' });
          break;
        }
      } else if (rowIndex === 1) {
        // 3 small
        const rowPhotos = filteredPhotos.slice(index, index + 3);
        rows.push({ photos: rowPhotos, type: 'three-small' });
        index += rowPhotos.length;
      } else if (rowIndex === 2) {
        // 2 small left + huge right
        const rowPhotos = filteredPhotos.slice(index, index + 3);
        if (rowPhotos.length === 3) {
          rows.push({ photos: rowPhotos, type: 'huge-right' });
          index += 3;
        } else {
          rows.push({ photos: rowPhotos, type: 'three-small' });
          break;
        }
      } else {
        // 3 small
        const rowPhotos = filteredPhotos.slice(index, index + 3);
        rows.push({ photos: rowPhotos, type: 'three-small' });
        index += rowPhotos.length;
      }
    }

    return rows;
  };

  const photoRows = getPhotoRows();

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
            {photoRows.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol size={64} name="photo" color={Colors.dark.icon} />
                <ThemedText style={styles.emptyStateText}>No photos found</ThemedText>
                <ThemedText style={styles.emptyStateSubtext}>
                  {photos.length === 0 ? 'Loading images...' : `No photos in ${selectedTab} tab`}
                </ThemedText>
              </View>
            ) : (
              photoRows.map((row, rowIndex) => {
              return (
                <View key={`row-${rowIndex}`} style={styles.photoRow}>
                  {row.type === 'huge-left' ? (
                    // Large on left, 2 small stacked vertically on right
                    <>
                      <TouchableOpacity
                        key={row.photos[0].id}
                        style={[styles.photo, { width: largeImageSize, height: largeImageSize }]}
                        onPress={() => setSelectedPhoto(row.photos[0])}
                      >
                        <ExpoImage
                          source={row.photos[0].source}
                          style={styles.photoImage}
                          contentFit="cover"
                        />
                        {row.photos[0].isFavorite && (
                          <View style={styles.favoriteBadge}>
                            <IconSymbol size={16} name="heart.fill" color={BrandColors.blueAccent} />
                          </View>
                        )}
                        {row.photos[0].sourceType === 'camera' && (
                          <View style={styles.watermark}>
                            <ThemedText style={styles.watermarkText}>HackaTUM</ThemedText>
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={styles.smallPhotosColumn}>
                        {row.photos.slice(1, 3).map((photo) => (
                          <TouchableOpacity
                            key={photo.id}
                            style={[styles.photo, { width: imageSize, height: imageSize }]}
                            onPress={() => setSelectedPhoto(photo)}
                          >
                            <ExpoImage
                              source={photo.source}
                              style={styles.photoImage}
                              contentFit="cover"
                            />
                            {photo.isFavorite && (
                              <View style={styles.favoriteBadge}>
                                <IconSymbol size={16} name="heart.fill" color={BrandColors.blueAccent} />
                              </View>
                            )}
                            {photo.sourceType === 'camera' && (
                              <View style={styles.watermark}>
                                <ThemedText style={styles.watermarkText}>HackaTUM</ThemedText>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  ) : row.type === 'huge-right' ? (
                    // 2 small stacked vertically on left, large on right
                    <>
                      <View style={styles.smallPhotosColumn}>
                        {row.photos.slice(0, 2).map((photo) => (
                          <TouchableOpacity
                            key={photo.id}
                            style={[styles.photo, { width: imageSize, height: imageSize }]}
                            onPress={() => setSelectedPhoto(photo)}
                          >
                            <ExpoImage
                              source={photo.source}
                              style={styles.photoImage}
                              contentFit="cover"
                            />
                            {photo.isFavorite && (
                              <View style={styles.favoriteBadge}>
                                <IconSymbol size={16} name="heart.fill" color={BrandColors.blueAccent} />
                              </View>
                            )}
                            {photo.sourceType === 'camera' && (
                              <View style={styles.watermark}>
                                <ThemedText style={styles.watermarkText}>HackaTUM</ThemedText>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        key={row.photos[2].id}
                        style={[styles.photo, { width: largeImageSize, height: largeImageSize }]}
                        onPress={() => setSelectedPhoto(row.photos[2])}
                      >
                        <ExpoImage
                          source={row.photos[2].source}
                          style={styles.photoImage}
                          contentFit="cover"
                        />
                        {row.photos[2].isFavorite && (
                          <View style={styles.favoriteBadge}>
                            <IconSymbol size={16} name="heart.fill" color={BrandColors.blueAccent} />
                          </View>
                        )}
                        {row.photos[2].sourceType === 'camera' && (
                          <View style={styles.watermark}>
                            <ThemedText style={styles.watermarkText}>HackaTUM</ThemedText>
                          </View>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    // 3 small photos in a row
                    row.photos.map((photo) => (
                      <TouchableOpacity
                        key={photo.id}
                        style={[styles.photo, { width: imageSize, height: imageSize }]}
                        onPress={() => setSelectedPhoto(photo)}
                      >
                        <ExpoImage
                          source={photo.source}
                          style={styles.photoImage}
                          contentFit="cover"
                        />
                        {photo.isFavorite && (
                          <View style={styles.favoriteBadge}>
                            <IconSymbol size={16} name="heart.fill" color={BrandColors.blueAccent} />
                          </View>
                        )}
                        {photo.sourceType === 'camera' && (
                          <View style={styles.watermark}>
                            <ThemedText style={styles.watermarkText}>HackaTUM</ThemedText>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              );
            }))}
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
                    {selectedPhoto.sourceType === 'camera' && (
                      <TouchableOpacity
                        onPress={() => deletePhoto(selectedPhoto.id)}
                        style={styles.modalActionButton}
                      >
                        <IconSymbol size={24} name="trash" color={BrandColors.white} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={styles.modalImageContainer}>
                  <ExpoImage
                    source={selectedPhoto.source}
                    style={styles.modalImage}
                    contentFit="contain"
                  />
                  {selectedPhoto.sourceType === 'camera' && (
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
              facing={cameraFacing}
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
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setCameraFacing(cameraFacing === 'back' ? 'front' : 'back')}
                >
                  <IconSymbol size={32} name="arrow.triangle.2.circlepath.camera.fill" color={BrandColors.white} />
                </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  photoRow: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 2,
    alignItems: 'flex-start',
  },
  smallPhotosColumn: {
    flexDirection: 'column',
    gap: 2,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginTop: 8,
    textAlign: 'center',
  },
});
