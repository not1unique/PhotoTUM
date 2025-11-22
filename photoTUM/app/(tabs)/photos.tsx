import { api } from '@/api/frontend/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { commonStyles } from '@/styles/common';
import { galleryImages, publicImages } from '@/utils/imageLoader';
import { deleteMeme, getMemesAsync } from '@/utils/memeStorage';
import { Asset } from 'expo-asset';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Modal, PanResponder, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 images per row with padding
const largeImageSize = imageSize * 2 + 4; // 2x2 = 4 photos size

interface Photo {
  id: string;
  source: number | { uri: string }; // require() module or { uri: string }
  sourceType: 'gallery' | 'public' | 'camera' | 'meme';
  isFavorite: boolean;
  timestamp: number;
}

export default function PhotosScreen() {
  const [selectedTab, setSelectedTab] = useState<'gallery' | 'public' | 'favorites'>('gallery');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [cameraMode, setCameraMode] = useState<'default' | 'find-me'>('default');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  // Face Recognition State
  const [isSearching, setIsSearching] = useState(false);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  
  // Gesture handling for photo viewer
  const pan = useRef(new Animated.ValueXY()).current;
  const lastTap = useRef(0);
  const panResponderRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  
  // Heart animation state
  const [heartAnimation, setHeartAnimation] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const imageContainerLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Load photos from assets folders
  useEffect(() => {
    loadPhotos();
  }, []);

  // Reload photos when screen comes into focus (to show new memes)
  useFocusEffect(
    useCallback(() => {
      // Reload only memes part - more efficient
      const reloadMemes = async () => {
        try {
          const memes = await getMemesAsync();
          const memePhotos: Photo[] = memes.map((meme) => ({
            id: `meme-${meme.id}`,
            source: { uri: meme.imageUri },
            sourceType: 'meme' as const,
            isFavorite: false,
            timestamp: meme.timestamp,
          }));
          
          // Update photos: remove old memes and add new ones
          setPhotos(prev => {
            const withoutMemes = prev.filter(p => p.sourceType !== 'meme');
            return [...withoutMemes, ...memePhotos];
          });
        } catch (error) {
          console.error('Error reloading memes:', error);
        }
      };
      reloadMemes();
    }, [])
  );

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

      // Load memes and add them to public photos
      try {
        const memes = await getMemesAsync();
        const memePhotos: Photo[] = memes.map((meme) => ({
          id: `meme-${meme.id}`,
          source: { uri: meme.imageUri },
          sourceType: 'meme' as const,
          isFavorite: false,
          timestamp: meme.timestamp,
        }));
        publicPhotos.push(...memePhotos);
        console.log(`Loaded ${memes.length} memes`);
      } catch (error) {
        console.error('Error loading memes:', error);
      }

      console.log(`Loaded ${galleryPhotos.length} gallery photos and ${publicPhotos.length} public photos (including memes)`);
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
      return photos.filter(p => p.sourceType === 'public' || p.sourceType === 'meme');
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
    setCameraMode('default');
    setCameraFacing('back'); // Default to back camera for regular photos
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo) return;

      if (cameraMode === 'find-me') {
        // Handle Face Search
        handleFindMe(photo.uri);
      } else {
        // Handle Normal Photo logic
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
  };

  const startFindMe = async () => {
    if (!permission) {
      await requestPermission();
    }
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission needed', 'Camera permission is required');
        return;
      }
    }
    setCameraMode('find-me');
    setCameraFacing('front'); // Use front camera for selfies
    setShowCamera(true);
  };

  const handleFindMe = async (uri: string) => {
    setIsSearching(true);
    try {
      const result = await api.findMe(uri);
      
      if (result.matches.length > 0) {
        setMatchedIds(result.matches);
        setShowCamera(false);
        Alert.alert('Found You!', `We found ${result.matches.length} photos matching your face.`);
        // Filter photos to show only matches - you can implement this filtering logic
        // For now, we'll just show the alert
      } else {
        Alert.alert('No Matches', 'Could not find any photos matching your face.');
        setShowCamera(false); 
      }
    } catch (error) {
      console.error('Face recognition error:', error);
      Alert.alert('Error', 'Face recognition server is offline or unreachable.');
      setShowCamera(false);
    } finally {
      setIsSearching(false);
      setCameraMode('default');
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

  const deletePhoto = async (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const photoToDelete = photos.find(p => p.id === photoId);
            
            // If it's a meme, delete it from storage
            if (photoToDelete?.sourceType === 'meme') {
              // Extract meme ID from photo ID (format: "meme-{id}")
              const memeId = parseInt(photoId.replace('meme-', ''), 10);
              if (!isNaN(memeId)) {
                await deleteMeme(memeId);
              }
            }
            
            // Remove from photos state
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            if (selectedPhoto?.id === photoId) {
              setSelectedPhoto(null);
            }
          },
        },
      ]
    );
  };

  // Navigate to next/previous photo
  const navigateToPhoto = useCallback((direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;
    
    const filtered = getFilteredPhotos();
    if (filtered.length === 0) return;
    
    const currentIndex = filtered.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'next') {
      newIndex = currentIndex < filtered.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filtered.length - 1;
    }
    
    setSelectedPhoto(filtered[newIndex]);
    // Reset pan position
    pan.setValue({ x: 0, y: 0 });
  }, [selectedPhoto, photos, selectedTab]);

  // Handle double tap to toggle favorite with animation
  const handleDoubleTap = useCallback((event: any) => {
    if (!selectedPhoto) return;
    
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      // Get tap location relative to the TouchableOpacity
      const { locationX, locationY } = event.nativeEvent;
      
      // Set heart position (relative to the TouchableOpacity container)
      setHeartAnimation({
        visible: true,
        x: locationX,
        y: locationY,
      });
      
      // Reset animation values
      heartScale.setValue(0);
      heartOpacity.setValue(1);
      
      // Animate heart: scale up then fade out (Instagram-like)
      Animated.parallel([
        Animated.sequence([
          Animated.spring(heartScale, {
            toValue: 1.3,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(heartScale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(150),
          Animated.timing(heartOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setHeartAnimation({ visible: false, x: 0, y: 0 });
        heartScale.setValue(0);
        heartOpacity.setValue(0);
      });
      
      toggleFavorite(selectedPhoto.id);
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [selectedPhoto]);

  // Create PanResponder for swipe gestures
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to significant movements
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value || 0,
          y: (pan.y as any)._value || 0,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        const { dx, dy, vx, vy } = gestureState;
        const SWIPE_THRESHOLD = 50;
        const VELOCITY_THRESHOLD = 0.5;
        const screenHeight = Dimensions.get('window').height;
        
        // Swipe down to close (prioritize vertical swipe)
        if (Math.abs(dy) > Math.abs(dx) && (dy > SWIPE_THRESHOLD || (dy > 30 && vy > VELOCITY_THRESHOLD))) {
          Animated.timing(pan, {
            toValue: { x: 0, y: screenHeight },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setSelectedPhoto(null);
            pan.setValue({ x: 0, y: 0 });
          });
          return;
        }
        
        // Swipe left (next photo)
        if (dx < -SWIPE_THRESHOLD || (dx < -30 && vx < -VELOCITY_THRESHOLD)) {
          navigateToPhoto('next');
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
          return;
        }
        
        // Swipe right (prev photo)
        if (dx > SWIPE_THRESHOLD || (dx > 30 && vx > VELOCITY_THRESHOLD)) {
          navigateToPhoto('prev');
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
          return;
        }
        
        // Reset position if no significant swipe
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }).start();
      },
    });
  }, [navigateToPhoto]);

  // Reset pan when photo changes
  useEffect(() => {
    if (selectedPhoto) {
      pan.setValue({ x: 0, y: 0 });
    }
  }, [selectedPhoto]);

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
    <ThemedView style={commonStyles.container}>
      <SafeAreaView edges={['top']} style={commonStyles.safeArea}>
        {/* Header */}
        <View style={commonStyles.header}>
          <ThemedText style={commonStyles.headerTitle}>Photos</ThemedText>
          <View style={commonStyles.headerActions}>
            <TouchableOpacity style={commonStyles.headerButton}>
              <IconSymbol size={24} name="magnifyingglass" color={BrandColors.blueAccent} />
            </TouchableOpacity>
            <TouchableOpacity style={commonStyles.headerButton}>
              <IconSymbol size={24} name="ellipsis.circle" color={BrandColors.blueAccent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={commonStyles.actionButton} onPress={takePhoto}>
            <IconSymbol size={28} name="camera.fill" color={BrandColors.white} />
            <ThemedText style={commonStyles.actionButtonText}>Take Photo</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.actionButton} onPress={startFindMe}>
            <IconSymbol size={28} name="person.crop.circle.badge.checkmark" color={BrandColors.white} />
            <ThemedText style={commonStyles.actionButtonText}>Find Me</ThemedText>
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
              <SafeAreaView edges={['top']} style={styles.modalSafeArea}>
                <View style={commonStyles.modalHeader}>
                  <TouchableOpacity 
                    onPress={() => setSelectedPhoto(null)} 
                    style={commonStyles.modalCloseButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconSymbol size={24} name="xmark" color={BrandColors.white} />
                  </TouchableOpacity>
                  <View style={commonStyles.modalActions}>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(selectedPhoto.id)}
                      style={commonStyles.modalActionButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <IconSymbol
                        size={24}
                        name={selectedPhoto.isFavorite ? 'heart.fill' : 'heart'}
                        color={selectedPhoto.isFavorite ? BrandColors.blueAccent : BrandColors.white}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deletePhoto(selectedPhoto.id)}
                      style={commonStyles.modalActionButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <IconSymbol size={24} name="trash" color={BrandColors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Animated.View 
                  style={[
                    styles.modalImageContainer,
                    {
                      transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                      ],
                      opacity: pan.y.interpolate({
                        inputRange: [0, Dimensions.get('window').height / 2],
                        outputRange: [1, 0.3],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                  {...(panResponderRef.current?.panHandlers || {})}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleDoubleTap}
                    style={styles.modalImageTouchable}
                    onLayout={(event) => {
                      const { x, y, width, height } = event.nativeEvent.layout;
                      imageContainerLayout.current = { x, y, width, height };
                    }}
                  >
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
                    
                    {/* Instagram-like heart animation */}
                    {heartAnimation.visible && (
                      <Animated.View
                        style={[
                          styles.heartAnimation,
                          {
                            left: heartAnimation.x,
                            top: heartAnimation.y,
                            transform: [
                              { scale: heartScale },
                              { translateX: -30 }, // Center the heart (60px width / 2)
                              { translateY: -30 }, // Center the heart (60px height / 2)
                            ],
                            opacity: heartOpacity,
                          },
                        ]}
                        pointerEvents="none"
                      >
                        <IconSymbol 
                          size={60} 
                          name="heart.fill" 
                          color={BrandColors.blueAccent} 
                        />
                      </Animated.View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </SafeAreaView>
            </View>
          )}
        </Modal>

        {/* Camera Modal */}
        <Modal
          visible={showCamera}
          animationType="slide"
          onRequestClose={() => {
            setShowCamera(false);
            setCameraMode('default');
            setIsSearching(false);
          }}
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
                  onPress={() => {
                    setShowCamera(false);
                    setCameraMode('default');
                    setIsSearching(false);
                  }}
                >
                  <IconSymbol size={32} name="xmark.circle.fill" color={BrandColors.white} />
                </TouchableOpacity>
                {isSearching ? (
                  <View style={styles.captureButton}>
                    <ActivityIndicator size="large" color={BrandColors.white} />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={capturePhoto}
                  >
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                )}
                {cameraMode === 'default' && (
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => setCameraFacing(cameraFacing === 'back' ? 'front' : 'back')}
                  >
                    <IconSymbol size={32} name="arrow.triangle.2.circlepath.camera.fill" color={BrandColors.white} />
                  </TouchableOpacity>
                )}
                {cameraMode === 'find-me' && (
                  <View style={styles.cameraButton} />
                )}
              </View>
              <View style={styles.cameraWatermarkPreview}>
                <ThemedText style={styles.cameraWatermarkText}>
                  {cameraMode === 'find-me' ? 'Take a selfie to find your photos' : 'HackaTUM'}
                </ThemedText>
              </View>
            </CameraView>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
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
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
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
  modalImageTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heartAnimation: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
