import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { commonStyles } from '@/styles/common';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, Platform, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { addMeme, getMemeChatId, getMemesAsync, type Meme } from '@/utils/memeStorage';

export default function MemeScreen() {
  const router = useRouter();
  
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
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [previewLayout, setPreviewLayout] = useState({ width: 300, height: 300 });
  const previewRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const previewContainerRef = useRef<View>(null);
  const initialDragPosition = useRef<{ x: number; y: number; textX: number; textY: number } | null>(null);
  const textsRef = useRef(texts);
  
  // Keep textsRef in sync with texts state
  useEffect(() => {
    textsRef.current = texts;
  }, [texts]);

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

  // Helper to create PanResponder for a text item - use useCallback to stabilize
  const createTextPanResponder = useCallback((textId: string) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture if movement is significant (prevents accidental drags)
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: (evt) => {
        const { width, height } = previewLayout;
        if (width === 0 || height === 0) return;
        
        // Use ref to get current texts value
        const textItem = textsRef.current.find(t => t.id === textId);
        if (!textItem) return;
        
        // Store initial text position when drag starts
        initialDragPosition.current = {
          x: 0,
          y: 0,
          textX: textItem.position.x,
          textY: textItem.position.y,
        };
        
        setDraggingTextId(textId);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!initialDragPosition.current) return;
        
        const { width, height } = previewLayout;
        if (width === 0 || height === 0) return;
        
        // gestureState.dx and dy are cumulative from the initial touch
        // Convert pixel movement to percentage
        const deltaXPercent = (gestureState.dx / width) * 100;
        const deltaYPercent = (gestureState.dy / height) * 100;
        
        // Calculate new position from initial text position + delta
        const newX = Math.max(5, Math.min(95, initialDragPosition.current.textX + deltaXPercent));
        const newY = Math.max(5, Math.min(95, initialDragPosition.current.textY + deltaYPercent));
        
        setTexts(prev => prev.map(t => 
          t.id === textId ? { ...t, position: { x: newX, y: newY } } : t
        ));
      },
      onPanResponderRelease: () => {
        setDraggingTextId(null);
        initialDragPosition.current = null;
      },
      onPanResponderTerminate: () => {
        setDraggingTextId(null);
        initialDragPosition.current = null;
      },
      onPanResponderTerminationRequest: () => false, // Prevent termination
    });
  }, [previewLayout]);

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
      
      await addMeme(newMeme);
      const savedMemes = await getMemesAsync();
      console.log('Meme saved successfully! ID:', newMeme.id, 'Total memes:', savedMemes.length);
      
      // Reset form
      setTexts([{ id: '1', text: '', position: { x: 50, y: 50 }, color: '#FFFFFF', backgroundColor: '#000000', hasBackground: true }]);
      setSelectedTemplate(0);
      setTextColor('#FFFFFF');
      setBackgroundColor('#000000');
      setHasTextBackground(true);
      
      // Small delay before navigation to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Navigate to meme chat
      router.push(`/chat/${getMemeChatId()}`);
    } catch (error) {
      console.error('Error saving meme:', error);
      alert('Failed to save meme. Please try again.');
    }
  };
  
  // Store PanResponders for each text - recreate when texts change
  const textPanResponders = useRef<Map<string, ReturnType<typeof PanResponder.create>>>(new Map());

  // Update PanResponders when texts change - only recreate when needed
  useEffect(() => {
    const currentIds = new Set(texts.map(t => t.id));
    
    // Remove PanResponders for deleted texts
    Array.from(textPanResponders.current.keys()).forEach(id => {
      if (!currentIds.has(id)) {
        textPanResponders.current.delete(id);
      }
    });
    
    // Only create PanResponders for new texts, don't recreate existing ones
    texts.forEach(textItem => {
      if (!textPanResponders.current.has(textItem.id)) {
        textPanResponders.current.set(textItem.id, createTextPanResponder(textItem.id));
      }
    });
  }, [texts.length, createTextPanResponder]); // Only depend on length, not full texts array

  // Reset texts when template changes
  useEffect(() => {
    setTexts([{ id: '1', text: '', position: { x: 50, y: 50 }, color: textColor, backgroundColor: backgroundColor, hasBackground: hasTextBackground }]);
  }, [selectedTemplate]);
  
  // Update text colors when global colors change
  useEffect(() => {
    setTexts(prev => prev.map(t => ({ ...t, color: textColor, backgroundColor: backgroundColor, hasBackground: hasTextBackground })));
  }, [textColor, backgroundColor, hasTextBackground]);

  return (
    <ThemedView style={commonStyles.container}>
      <SafeAreaView edges={['top']} style={commonStyles.safeArea}>
        {/* Header */}
        <View style={commonStyles.header}>
          <ThemedText style={commonStyles.headerTitle}>Create Meme</ThemedText>
          <TouchableOpacity 
            style={commonStyles.headerButton}
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

        {/* Content */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!draggingTextId} // Disable scrolling when dragging text
          nestedScrollEnabled={true}
        >
          {/* Preview with draggable text */}
          <View 
            ref={previewRef}
            collapsable={false}
            style={styles.previewContainer}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setPreviewLayout({ width, height });
            }}
            pointerEvents="box-none"
          >
            <View 
              ref={previewContainerRef}
              style={styles.previewWrapper} 
              pointerEvents="box-none"
            >
              {/* Template image - always visible */}
              <ExpoImage
                source={{ uri: memeTemplates[selectedTemplate].imageUrl }}
                style={styles.previewImage}
                contentFit="contain"
              />
              {/* Draggable text overlays for all texts */}
              {texts.filter(t => t.text.trim()).map((textItem) => {
                const panResponder = textPanResponders.current.get(textItem.id);
                const isDragging = draggingTextId === textItem.id;
                return (
                  <View
                    key={textItem.id}
                    style={[
                      styles.draggableText,
                      {
                        left: `${textItem.position.x}%`,
                        top: `${textItem.position.y}%`,
                      },
                      isDragging && styles.draggableTextDragging,
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

          {/* Template Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Template</ThemedText>
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
                  maxLength={400}
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

          {/* Text Color */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Text Color</ThemedText>
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

          {/* Text Background Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <ThemedText style={styles.sectionTitle}>Text Background</ThemedText>
              <Switch
                value={hasTextBackground}
                onValueChange={setHasTextBackground}
                trackColor={{ false: Colors.dark.border, true: BrandColors.blueAccent }}
                thumbColor={BrandColors.white}
              />
            </View>
          </View>

          {/* Background Color (only if enabled) */}
          {hasTextBackground && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Background Color</ThemedText>
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
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
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
  previewContainer: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    marginBottom: 24,
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
  draggableText: {
    position: 'absolute',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 10,
  },
  draggableTextDragging: {
    zIndex: 100,
    opacity: 0.9,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginBottom: 12,
  },
  templateScroll: {
    flexDirection: 'row',
  },
  templateOption: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
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

