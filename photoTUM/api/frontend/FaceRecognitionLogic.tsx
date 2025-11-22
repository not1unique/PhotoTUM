import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, Text } from 'react-native';
// Make sure expo-camera is installed: npx expo install expo-camera
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { api } from './api'; // Import the api service we created

// --- Copy these State Variables into your Component ---
/*
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'default' | 'find-me'>('default');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  // Face Recognition State
  const [isSearching, setIsSearching] = useState(false);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
*/

// --- Copy these Functions into your Component ---

/*
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
        // Handle Normal Photo logic here if needed
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleFindMe = async (uri: string) => {
    setIsSearching(true);
    try {
      const result = await api.findMe(uri);
      
      if (result.matches.length > 0) {
        setMatchedIds(result.matches);
        setShowCamera(false);
        Alert.alert('Found You!', `We found ${result.matches.length} photos matching your face.`);
        // Now filter your main photos list using `matchedIds`
      } else {
        Alert.alert('No Matches', 'Could not find any photos matching your face.');
        setShowCamera(false); 
      }
    } catch (error) {
      Alert.alert('Error', 'Face recognition server is offline or unreachable.');
    } finally {
      setIsSearching(false);
    }
  };
*/

// --- Copy this UI Block (Modal) into your JSX ---
/*
        <Modal
          visible={showCamera}
          animationType="slide"
          onRequestClose={() => setShowCamera(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing={cameraMode === 'find-me' ? 'front' : 'back'}
            >
              <View style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}>
                <TouchableOpacity
                  style={{ alignSelf: 'center', marginBottom: 20 }}
                  onPress={() => setShowCamera(false)}
                >
                  <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
                </TouchableOpacity>
                
                {isSearching ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <TouchableOpacity
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      backgroundColor: 'white',
                      alignSelf: 'center',
                      marginBottom: 40
                    }}
                    onPress={capturePhoto}
                  />
                )}
              </View>
            </CameraView>
          </View>
        </Modal>
*/

