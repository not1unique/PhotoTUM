import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Custom TabBarBackground component
function TabBarBackground() {
  const borderRadius = Platform.OS === 'ios' ? 44 : 34;
  
  return (
    <View style={{ flex: 1, overflow: 'hidden', borderRadius }}>
      {/* Base blur layer - iOS style strong blur */}
      <BlurView 
        intensity={50} 
        tint="dark" 
        style={{
          flex: 1,
          borderRadius,
        }}
      />
      {/* Subtle background tint for depth */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          borderRadius,
        }}
      />
      {/* Top border - very subtle */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 0.5,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        }}
      />
      {/* Light reflection gradient at top - iOS style */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30%',
          borderRadius,
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'dark'].tabIconDefault,
        tabBarStyle: {
          borderWidth: 1,
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 75 : 55,
          paddingBottom: Platform.OS === 'ios' ? 32 : 12,
          paddingTop: 10,
          paddingRight: 10,
          paddingLeft: 10,
          marginHorizontal: 16,
          marginBottom: Platform.OS === 'ios' ? 20 : 12,
          borderRadius: Platform.OS === 'ios' ? 44 : 34, // Half of height for pill shape
          overflow: 'visible',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarBackground: () => <TabBarBackground />,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontFamily: 'Orbitron',
          fontSize: 11,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="meme"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.memeTabIconWrapper, focused && styles.memeTabIconWrapperFocused]}>
              {/* Container with overflow hidden for proper clipping */}
              <View style={[styles.memeTabIconContainer, focused && styles.memeTabIconContainerFocused]}>
                {/* Base color layer - bright blue when focused */}
                <View 
                  style={[
                    styles.memeTabIconBase,
                    focused && styles.memeTabIconBaseFocused
                  ]}
                />
                {/* iOS blue gradient when focused */}
                {focused && (
                  <LinearGradient
                    colors={[
                      '#0099FF', // Lighter iOS blue at top
                      '#007AFF', // iOS blue
                      '#0066FF', // Darker iOS blue
                      '#007AFF', // iOS blue
                      '#0099FF'  // Lighter iOS blue at bottom
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.memeTabIconGradient}
                  />
                )}
                {/* Subtle light reflection gradient when focused */}
                {focused && (
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0.4 }}
                    style={styles.memeTabIconShine}
                  />
                )}
                {/* BlurView on top - reduced intensity to show color better */}
                <BlurView 
                  intensity={focused ? 40 : 60} 
                  tint="dark" 
                  style={styles.memeTabIconBlur}
                >
                  <IconSymbol 
                    size={focused ? 34 : 32} 
                    name="face.smiling.fill" 
                    color={focused ? BrandColors.white : color} 
                  />
                </BlurView>
                {/* Border on top */}
                <View 
                  style={[
                    styles.memeTabIconBorder,
                    focused && styles.memeTabIconBorderFocused
                  ]}
                />
              </View>
            </View>
          ),
          tabBarButton: (props) => (
            <View style={styles.memeTabButtonContainer}>
              <HapticTab {...props} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: 'Photos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="photo.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="navigation"
        options={{
          title: 'Navigation',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  memeTabButtonContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
    zIndex: 1000,
  },
  memeTabIconWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  memeTabIconWrapperFocused: {
    width: 68,
    height: 68,
  },
  memeTabIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  memeTabIconContainerFocused: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  memeTabIconBase: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(77, 111, 173, 0.4)',
    borderRadius: 32,
  },
  memeTabIconBaseFocused: {
    backgroundColor: '#007AFF', // iOS blue
    borderRadius: 34,
  },
  memeTabIconGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 34,
    pointerEvents: 'none',
  },
  memeTabIconShine: {
    position: 'absolute',
    width: '100%',
    height: '40%', // Reduced from 60% for less light effect
    borderRadius: 34,
    pointerEvents: 'none',
  },
  memeTabIconBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
  memeTabIconBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    pointerEvents: 'none',
  },
  memeTabIconBorderFocused: {
    borderRadius: 34,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});
