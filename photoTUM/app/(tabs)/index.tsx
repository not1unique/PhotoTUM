import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, PanResponder, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { addMeme, getMemeChatId, getMemes, type Meme } from '@/utils/memeStorage';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showMemeMaker, setShowMemeMaker] = useState(false);
  
  // Meme maker state - refactored to support multiple texts
  interface TextItem {
    id: string;
    text: string;
    position: { x: number; y: number }; // percentages
    color: string;
    backgroundColor: string;
    hasBackground: boolean;
  }
  
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [texts, setTexts] = useState<TextItem[]>([
    { id: '1', text: '', position: { x: 50, y: 50 }, color: '#FFFFFF', backgroundColor: '#000000', hasBackground: true }
  ]);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [hasTextBackground, setHasTextBackground] = useState(true);
  const [memePreview, setMemePreview] = useState<string | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [previewLayout, setPreviewLayout] = useState({ width: 300, height: 300 });
  const previewRef = useRef<View>(null);
  
  // Countdown timer (example: set to 48 hours from now)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 48,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const upcomingEvents = [
    { id: 1, title: 'Opening Ceremony', time: 'Today, 10:00 AM', location: 'Main Hall' },
    { id: 2, title: 'Workshop: AI & ML', time: 'Today, 2:00 PM', location: 'Room A3' },
    { id: 3, title: 'Team Building', time: 'Today, 6:00 PM', location: 'Cafeteria' },
  ];

  // Popular meme templates (using publicly available meme template images)
  const memeTemplates = [
    { 
      id: 0, 
      name: 'Drake Pointing', 
      imageUrl: 'https://i.imgflip.com/30b1gx.jpg' // Drake disapproving/approving template
    },
    { 
      id: 1, 
      name: 'Distracted Boyfriend', 
      imageUrl: 'https://i.imgflip.com/1ur9b0.jpg' // Distracted boyfriend template
    },
    { 
      id: 2, 
      name: 'Change My Mind', 
      imageUrl: 'https://i.imgflip.com/24y43o.jpg' // Change my mind template
    },
    { 
      id: 3, 
      name: 'This Is Fine', 
      imageUrl: 'https://i.imgflip.com/26am.jpg' // This is fine dog template
    },
    { 
      id: 4, 
      name: 'Expanding Brain', 
      imageUrl: 'https://i.imgflip.com/1jhlct.jpg' // Expanding brain template
    },
    { 
      id: 5, 
      name: 'Woman Yelling', 
      imageUrl: 'https://i.imgflip.com/345v97.jpg' // Woman yelling at cat template
    },
    { 
      id: 6, 
      name: 'Drake Yes No', 
      imageUrl: 'https://i.imgflip.com/1g8my4.jpg' // Drake yes/no template
    },
    { 
      id: 7, 
      name: 'Two Buttons', 
      imageUrl: 'https://i.imgflip.com/1bgw.jpg' // Two buttons meme template
    },
    { 
      id: 8, 
      name: 'Batman Slapping', 
      imageUrl: 'https://i.imgflip.com/1bh5a7.jpg' // Batman slapping Robin template
    },
    { 
      id: 9, 
      name: 'Left Exit 12', 
      imageUrl: 'https://i.imgflip.com/22bdq6.jpg' // Left exit 12 template
    },
    { 
      id: 10, 
      name: 'Running Away', 
      imageUrl: 'https://i.imgflip.com/261o3j.jpg' // Running away balloon template
    },
    { 
      id: 11, 
      name: 'Surprised Pikachu', 
      imageUrl: 'https://i.imgflip.com/2kbn1e.jpg' // Surprised Pikachu template
    },
    { 
      id: 12, 
      name: 'Disaster Girl', 
      imageUrl: 'https://i.imgflip.com/23ls.jpg' // Disaster girl template
    },
    { 
      id: 13, 
      name: 'Hide the Pain Harold', 
      imageUrl: 'https://i.imgflip.com/gk5el.jpg' // Hide the pain Harold template
    },
    { 
      id: 14, 
      name: 'Is This a Pigeon', 
      imageUrl: 'https://i.imgflip.com/1o00in.jpg' // Is this a pigeon template
    },
    { 
      id: 15, 
      name: 'Mocking Spongebob', 
      imageUrl: 'https://i.imgflip.com/1otk96.jpg' // Mocking Spongebob template
    },
    { 
      id: 16, 
      name: 'Roll Safe', 
      imageUrl: 'https://i.imgflip.com/22bdq6.jpg' // Roll safe template
    },
    { 
      id: 17, 
      name: 'Ancient Aliens', 
      imageUrl: 'https://i.imgflip.com/26am.jpg' // Ancient aliens template
    },
    { 
      id: 18, 
      name: 'One Does Not Simply', 
      imageUrl: 'https://i.imgflip.com/1bhk.jpg' // One does not simply template
    },
    { 
      id: 19, 
      name: 'Success Kid', 
      imageUrl: 'https://i.imgflip.com/1bhk.jpg' // Success kid template
    },
    { 
      id: 20, 
      name: 'Bad Luck Brian', 
      imageUrl: 'https://i.imgflip.com/1bhk.jpg' // Bad luck Brian template
    },
    { 
      id: 21, 
      name: 'First World Problems', 
      imageUrl: 'https://i.imgflip.com/1bhk.jpg' // First world problems template
    },
    { 
      id: 22, 
      name: 'Drakeposting', 
      imageUrl: 'https://i.imgflip.com/30b1gx.jpg' // Drake pointing template
    },
    { 
      id: 23, 
      name: 'Drake Hotline Bling', 
      imageUrl: 'https://i.imgflip.com/30b1gx.jpg' // Drake hotline bling template
    },
  ];

  // Color options for text
  const colorOptions = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#4D6FAD' },
    { name: 'Red', value: '#FF4444' },
    { name: 'Green', value: '#44FF44' },
    { name: 'Yellow', value: '#FFFF44' },
  ];

  // Helper to create PanResponder for a text item
  const createTextPanResponder = (textId: string) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggingTextId(textId);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { width, height } = previewLayout;
        if (width === 0 || height === 0) return;
        
        const textItem = texts.find(t => t.id === textId);
        if (!textItem) return;
        
        const currentX = (textItem.position.x / 100) * width;
        const currentY = (textItem.position.y / 100) * height;
        const newX = Math.max(5, Math.min(95, ((currentX + gestureState.dx) / width) * 100));
        const newY = Math.max(5, Math.min(95, ((currentY + gestureState.dy) / height) * 100));
        
        setTexts(prev => prev.map(t => 
          t.id === textId ? { ...t, position: { x: newX, y: newY } } : t
        ));
      },
      onPanResponderRelease: () => {
        setDraggingTextId(null);
      },
      onPanResponderTerminate: () => {
        setDraggingTextId(null);
      },
    });
  };

  // No longer generating preview - we show template + overlays directly

  // Add new text field
  const addText = () => {
    if (texts.length >= 4) return; // Max 4 texts
    const newId = String(Date.now());
    setTexts(prev => [...prev, {
      id: newId,
      text: '',
      position: { x: 50, y: 50 },
      color: textColor,
      backgroundColor: backgroundColor,
      hasBackground: hasTextBackground,
    }]);
  };

  // Remove text field
  const removeText = (id: string) => {
    if (texts.length <= 1) return; // Keep at least one
    setTexts(prev => prev.filter(t => t.id !== id));
  };

  // Update text value
  const updateText = (id: string, text: string) => {
    setTexts(prev => prev.map(t => t.id === id ? { ...t, text } : t));
  };

  // Save meme and add to meme chat
  const saveMeme = async () => {
    const textsWithContent = texts.filter(t => t.text.trim());
    if (textsWithContent.length === 0) {
      return; // Need at least some text
    }

    try {
      if (!previewRef.current) {
        console.error('Preview ref not available');
        return;
      }

      // Small delay to ensure view is fully rendered
      await new Promise(resolve => setTimeout(resolve, 200));

      // Try to capture the preview view as an image
      let imageUri: string | null = null;
      
      try {
        imageUri = await captureRef(previewRef.current, {
          format: 'png',
          quality: 1.0,
          result: 'data-uri',
        });
        
        if (!imageUri || !imageUri.startsWith('data:')) {
          console.warn('View-shot capture failed or invalid, trying fallback');
          throw new Error('Invalid capture result');
        }
        
        console.log('Meme captured successfully via view-shot, URI length:', imageUri.length);
      } catch (captureError) {
        console.warn('View-shot failed, using SVG fallback:', captureError);
        // Will use SVG fallback below
      }
      
      // If view-shot failed, use SVG approach
      if (!imageUri) {
        const template = memeTemplates[selectedTemplate];
        const width = 500;
        const height = 500;
        const estimateTextWidth = (text: string) => text.length * 20;
        
        const textElements = textsWithContent.map(textItem => {
          const x = (textItem.position.x / 100) * width;
          const y = (textItem.position.y / 100) * height;
          const textWidth = estimateTextWidth(textItem.text);
          
          return `
            ${textItem.hasBackground ? `
              <rect x="${x - textWidth / 2 - 10}" y="${y - 20}" width="${textWidth + 20}" height="40" fill="${textItem.backgroundColor}" opacity="1"/>
            ` : ''}
            <text x="${x}" y="${y}" font-family="Impact, Arial Black" font-size="36" font-weight="bold" fill="${textItem.color}" text-anchor="middle" dominant-baseline="middle" stroke="${textItem.hasBackground ? 'none' : '#000000'}" stroke-width="2">${textItem.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</text>
          `;
        }).join('');
        
        const svg = `
          <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <image href="${template.imageUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
            ${textElements}
          </svg>
        `;
        
        // Properly encode SVG - use URI encoding (works better in React Native)
        const encodedSvg = encodeURIComponent(svg);
        imageUri = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
        console.log('Meme created via SVG fallback, URI length:', imageUri.length);
      }

      // Get first and second text for compatibility with Meme interface
      const firstText = textsWithContent[0]?.text || '';
      const secondText = textsWithContent[1]?.text || '';
      
      // Save to storage
      const newMeme: Meme = {
        id: Date.now(),
        imageUri: imageUri,
        topText: firstText,
        bottomText: secondText,
        timestamp: Date.now(),
      };
      
      addMeme(newMeme);
      console.log('Meme saved successfully! ID:', newMeme.id, 'Total memes:', getMemes().length);
      
      // Reset form
      setTexts([{ id: '1', text: '', position: { x: 50, y: 50 }, color: '#FFFFFF', backgroundColor: '#000000', hasBackground: true }]);
      setSelectedTemplate(0);
      setTextColor('#FFFFFF');
      setBackgroundColor('#000000');
      setHasTextBackground(true);
      setShowMemeMaker(false);
      
      // Small delay before navigation to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Navigate to meme chat
      router.push(`/chat/${getMemeChatId()}`);
    } catch (error) {
      console.error('Error saving meme:', error);
      alert('Failed to save meme. Please try again.');
    }
  };
  
  // Store PanResponders for each text
  const textPanResponders = useRef<Map<string, ReturnType<typeof PanResponder.create>>>(new Map());

  // Update PanResponders when texts change
  useEffect(() => {
    texts.forEach(textItem => {
      if (!textPanResponders.current.has(textItem.id)) {
        textPanResponders.current.set(textItem.id, createTextPanResponder(textItem.id));
      }
    });
    // Remove PanResponders for deleted texts
    const currentIds = new Set(texts.map(t => t.id));
    Array.from(textPanResponders.current.keys()).forEach(id => {
      if (!currentIds.has(id)) {
        textPanResponders.current.delete(id);
      }
    });
  }, [texts.length]);

  // Reset texts when template changes
  useEffect(() => {
    setTexts([{ id: '1', text: '', position: { x: 50, y: 50 }, color: textColor, backgroundColor: backgroundColor, hasBackground: hasTextBackground }]);
  }, [selectedTemplate]);
  
  // Update text colors when global colors change
  useEffect(() => {
    setTexts(prev => prev.map(t => ({ ...t, color: textColor, backgroundColor: backgroundColor, hasBackground: hasTextBackground })));
  }, [textColor, backgroundColor, hasTextBackground]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header with Profile Button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>HackaTUM 2025</ThemedText>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <IconSymbol size={28} name="person.circle.fill" color={BrandColors.blueAccent} />
          </TouchableOpacity>
        </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Countdown Section */}
        <View style={[styles.card, styles.countdownCard]}>
          <ThemedText style={styles.sectionTitle}>Project Submission</ThemedText>
          <View style={styles.countdown}>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeNumber}>{String(timeLeft.days).padStart(2, '0')}</ThemedText>
              <ThemedText style={styles.timeLabel}>Days</ThemedText>
            </View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeNumber}>{String(timeLeft.hours).padStart(2, '0')}</ThemedText>
              <ThemedText style={styles.timeLabel}>Hours</ThemedText>
            </View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeNumber}>{String(timeLeft.minutes).padStart(2, '0')}</ThemedText>
              <ThemedText style={styles.timeLabel}>Mins</ThemedText>
            </View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeNumber}>{String(timeLeft.seconds).padStart(2, '0')}</ThemedText>
              <ThemedText style={styles.timeLabel}>Secs</ThemedText>
            </View>
          </View>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Upcoming Events</ThemedText>
          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventItem}>
              <View style={styles.eventIconContainer}>
                <IconSymbol size={24} name="calendar" color={BrandColors.blueAccent} />
              </View>
              <View style={styles.eventDetails}>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                <ThemedText style={styles.eventTime}>{event.time}</ThemedText>
                <ThemedText style={styles.eventLocation}>📍 {event.location}</ThemedText>
              </View>
              <IconSymbol size={20} name="chevron.right" color={Colors.dark.icon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <IconSymbol size={32} name="photo.on.rectangle" color={BrandColors.blueAccent} />
            <ThemedText style={styles.quickActionText}>Gallery</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <IconSymbol size={32} name="map" color={BrandColors.blueAccent} />
            <ThemedText style={styles.quickActionText}>Floor Plan</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <IconSymbol size={32} name="person.2" color={BrandColors.blueAccent} />
            <ThemedText style={styles.quickActionText}>Team</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Make a Meme Button (floating above tab bar) */}
      <View style={styles.memeButtonContainer}>
        <TouchableOpacity 
          style={styles.memeButton}
          onPress={() => setShowMemeMaker(true)}
        >
          <IconSymbol size={24} name="face.smiling" color={BrandColors.white} />
          <ThemedText style={styles.memeButtonText}>Make a Meme</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Meme Maker Modal */}
      <Modal
        visible={showMemeMaker}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMemeMaker(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <SafeAreaView edges={['top']} style={styles.modalSafeArea}>
            {/* Header - Fixed padding */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalHeaderButton}
                onPress={() => setShowMemeMaker(false)}
              >
                <IconSymbol size={24} name="xmark" color={BrandColors.white} />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>Create Meme</ThemedText>
              <TouchableOpacity 
                style={styles.modalHeaderButton}
                onPress={saveMeme}
                disabled={texts.every(t => !t.text.trim())}
              >
                <ThemedText style={[
                  styles.saveButton,
                  texts.every(t => !t.text.trim()) && styles.saveButtonDisabled
                ]}>
                  Save
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Content - No ScrollView, compact layout */}
            <View style={styles.modalContent}>
              {/* Preview with draggable text - Always show template + overlays */}
              <View 
                ref={previewRef}
                collapsable={false}
                style={styles.previewContainer}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setPreviewLayout({ width, height });
                }}
              >
                <View style={styles.previewWrapper} pointerEvents="box-none">
                  {/* Template image - always visible */}
                  <ExpoImage
                    source={{ uri: memeTemplates[selectedTemplate].imageUrl }}
                    style={styles.previewImage}
                    contentFit="contain"
                  />
                  {/* Draggable text overlays for all texts */}
                  {texts.filter(t => t.text.trim()).map((textItem) => {
                    const panResponder = textPanResponders.current.get(textItem.id);
                    return (
                      <View
                        key={textItem.id}
                        style={[
                          styles.draggableText,
                          {
                            left: `${textItem.position.x}%`,
                            top: `${textItem.position.y}%`,
                          },
                        ]}
                        {...(panResponder?.panHandlers || {})}
                        pointerEvents="box-only"
                      >
                        <View style={[
                          styles.draggableTextContainer,
                          textItem.hasBackground && { backgroundColor: textItem.backgroundColor }
                        ]}>
                          <ThemedText style={[styles.draggableTextLabel, { color: textItem.color }]}>
                            {textItem.text}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Template Selection - Compact */}
              <View style={styles.sectionCompact}>
                <ThemedText style={styles.modalSectionTitle}>Template</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
                  {memeTemplates.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      style={[
                        styles.templateOption,
                        selectedTemplate === template.id && styles.templateOptionSelected,
                      ]}
                      onPress={() => setSelectedTemplate(template.id)}
                    >
                      <ExpoImage
                        source={{ uri: template.imageUrl }}
                        style={styles.templateImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                      />
                      {selectedTemplate === template.id && (
                        <View style={styles.templateCheckmark}>
                          <IconSymbol size={16} name="checkmark.circle.fill" color={BrandColors.blueAccent} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Dynamic Text Inputs */}
              {texts.map((textItem, index) => (
                <View key={textItem.id} style={styles.textInputRow}>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={`Text ${index + 1}...`}
                      placeholderTextColor={Colors.dark.icon}
                      value={textItem.text}
                      onChangeText={(text) => updateText(textItem.id, text)}
                      maxLength={50}
                    />
                  </View>
                  {texts.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTextButton}
                      onPress={() => removeText(textItem.id)}
                    >
                      <IconSymbol size={20} name="minus.circle.fill" color={BrandColors.blueAccent} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {/* Add Text Button */}
              {texts.length < 4 && (
                <TouchableOpacity
                  style={styles.addTextButton}
                  onPress={addText}
                >
                  <IconSymbol size={20} name="plus.circle" color={BrandColors.blueAccent} />
                  <ThemedText style={styles.addTextButtonText}>Add Text</ThemedText>
                </TouchableOpacity>
              )}

              {/* Text Color - Compact */}
              <View style={styles.sectionCompact}>
                <ThemedText style={styles.modalSectionTitle}>Text Color</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                  {colorOptions.map((color) => (
                    <TouchableOpacity
                      key={color.value}
                      style={[
                        styles.colorOption,
                        textColor === color.value && styles.colorOptionSelected,
                        { backgroundColor: color.value }
                      ]}
                      onPress={() => setTextColor(color.value)}
                    >
                      {textColor === color.value && (
                        <IconSymbol size={16} name="checkmark" color={color.value === '#FFFFFF' ? BrandColors.blueAccent : BrandColors.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Text Background Toggle - Compact */}
              <View style={styles.sectionCompact}>
                <View style={styles.toggleRow}>
                  <ThemedText style={styles.modalSectionTitle}>Text Background</ThemedText>
                  <Switch
                    value={hasTextBackground}
                    onValueChange={setHasTextBackground}
                    trackColor={{ false: Colors.dark.border, true: BrandColors.blueAccent }}
                    thumbColor={BrandColors.white}
                  />
                </View>
              </View>

              {/* Background Color (only if enabled) - Compact */}
              {hasTextBackground && (
                <View style={styles.sectionCompact}>
                  <ThemedText style={styles.modalSectionTitle}>Background Color</ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                    {colorOptions.map((color) => (
                      <TouchableOpacity
                        key={color.value}
                        style={[
                          styles.colorOption,
                          backgroundColor === color.value && styles.colorOptionSelected,
                          { backgroundColor: color.value }
                        ]}
                        onPress={() => setBackgroundColor(color.value)}
                      >
                        {backgroundColor === color.value && (
                          <IconSymbol size={16} name="checkmark" color={color.value === '#FFFFFF' ? BrandColors.blueAccent : BrandColors.white} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </SafeAreaView>
      </ThemedView>
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
    paddingBottom: 20,
    backgroundColor: BrandColors.darkBackground,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  profileButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for meme button
  },
  card: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  countdownCard: {
    backgroundColor: BrandColors.blueAccent + '15',
    borderColor: BrandColors.blueAccent + '40',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    marginBottom: 16,
    color: BrandColors.white,
  },
  countdown: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 50,
    marginHorizontal: 2,
  },
  timeNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.blueAccent,
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 4,
    color: Colors.dark.icon,
    fontFamily: 'Orbitron',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BrandColors.blueAccent,
    marginHorizontal: 4,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.blueAccent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: Colors.dark.icon,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: Colors.dark.icon,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minWidth: 100,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  memeButtonContainer: {
    position: 'absolute',
    bottom: 100, // Moved down a bit more
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  memeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blueAccent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: BrandColors.blueAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  memeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BrandColors.darkBackground,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: BrandColors.darkBackground,
    zIndex: 10,
  },
  modalHeaderButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.blueAccent,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    color: Colors.dark.icon,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  previewContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholderText: {
    fontSize: 18,
    fontFamily: 'Orbitron',
    color: Colors.dark.icon,
  },
  draggableText: {
    position: 'absolute',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 10,
  },
  draggableTextContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggableTextLabel: {
    fontSize: 20,
    fontFamily: 'Impact',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionCompact: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginBottom: 8,
  },
  templateScroll: {
    flexDirection: 'row',
  },
  templateOption: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  templateOptionSelected: {
    borderColor: BrandColors.blueAccent,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: BrandColors.white,
    borderRadius: 12,
  },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  textInput: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 12,
    color: BrandColors.white,
    fontFamily: 'Orbitron',
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  removeTextButton: {
    padding: 8,
  },
  addTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 12,
  },
  addTextButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: BrandColors.blueAccent,
  },
  colorScroll: {
    flexDirection: 'row',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderColor: BrandColors.blueAccent,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
