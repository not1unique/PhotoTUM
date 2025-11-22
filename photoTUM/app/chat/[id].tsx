import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { commonStyles } from '@/styles/common';
import { deleteMeme, getMemeChatId, getMemesAsync } from '@/utils/memeStorage';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper function to get chat name
const getChatName = (chatId: number): string => {
  const chatNames: Record<number, string> = {
    1: 'Team Alpha',
    2: 'HackaTUM Organizers',
    3: 'Meme Masters 🎭',
    4: 'Team Beta',
    5: 'Mentors Channel',
  };
  return chatNames[chatId] || 'Chat';
};

// Helper function to get chat subtitle
const getChatSubtitle = (chatId: number): string => {
  const subtitles: Record<number, string> = {
    1: '5 members',
    2: 'Organizers only',
    3: 'Meme chat',
    4: '4 members',
    5: 'Mentors',
  };
  return subtitles[chatId] || 'Chat';
};

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: number; text?: string; imageUri?: string; imageSource?: number | { uri: string }; sender: string; time: string; isMe: boolean; timestamp?: number }>>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Calculate isMemeChat based on current id
  const chatId = parseInt(id || '0', 10);
  const isMemeChat = chatId === getMemeChatId();
  
  const loadMessages = useCallback(async () => {
    const chatId = parseInt(id || '0', 10);
    const isMemeChatCheck = chatId === getMemeChatId();
    
    if (isMemeChatCheck) {
      // Load memes and convert to messages
      const memes = await getMemesAsync();
      console.log('Loading memes, count:', memes.length, 'Chat ID:', chatId);
      
      // Sort memes by timestamp (oldest first, so newest appear at bottom)
      const sortedMemes = [...memes].sort((a, b) => a.timestamp - b.timestamp);
      
      const memeMessages = sortedMemes.map((meme) => {
        console.log('Meme:', meme.id, 'URI:', meme.imageUri?.substring(0, 50) + '...', 'Timestamp:', new Date(meme.timestamp).toISOString());
        return {
          id: meme.id,
          imageUri: meme.imageUri,
          imageSource: { uri: meme.imageUri }, // Convert URI to source format
          sender: 'You',
          time: new Date(meme.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          timestamp: meme.timestamp,
        };
      });
      
      // Use user-created memes, sort by timestamp (oldest first)
      const allImageMessages = [...memeMessages].sort((a, b) => a.timestamp - b.timestamp);
      
      // Add default messages if no images yet
      const defaultMessages = allImageMessages.length === 0 ? [
        { id: 1, text: 'Welcome to the Meme Masters chat! 🎭', sender: 'System', time: '10:00', isMe: false },
        { id: 2, text: 'Create your first meme using the "Make a Meme" button!', sender: 'System', time: '10:01', isMe: false },
      ] : [];
      
      const allMessages = [...defaultMessages, ...allImageMessages];
      console.log('Setting messages, total:', allMessages.length, 'User memes:', memeMessages.length);
      setMessages(allMessages);
      
      // Scroll to bottom after a short delay to show newest memes
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      // Different messages for each chat based on ID
      let chatMessages: Array<{ id: number; text: string; sender: string; time: string; isMe: boolean }> = [];
      
      switch (chatId) {
        case 1: // Team Alpha
          chatMessages = [
            { id: 1, text: 'Hey team! How is everyone doing?', sender: 'Alice', time: '10:30', isMe: false },
            { id: 2, text: 'Great! Just finished the backend API', sender: 'You', time: '10:32', isMe: true },
            { id: 3, text: 'Awesome! I\'m working on the frontend now', sender: 'Bob', time: '10:35', isMe: false },
            { id: 4, text: 'Let\'s sync up in 30 minutes?', sender: 'You', time: '10:36', isMe: true },
            { id: 5, text: 'Sounds good!', sender: 'Alice', time: '10:37', isMe: false },
          ];
          break;
        case 2: // HackaTUM Organizers
          chatMessages = [
            { id: 1, text: 'Welcome to the HackaTUM Organizers channel!', sender: 'Organizer', time: '09:00', isMe: false },
            { id: 2, text: 'Dinner is ready at the cafeteria', sender: 'Organizer', time: '12:30', isMe: false },
            { id: 3, text: 'Thanks for the update!', sender: 'You', time: '12:32', isMe: true },
            { id: 4, text: 'Workshop on AI/ML starts at 2 PM in Room A3', sender: 'Organizer', time: '13:00', isMe: false },
            { id: 5, text: 'See you there!', sender: 'You', time: '13:05', isMe: true },
          ];
          break;
        case 4: // Team Beta
          chatMessages = [
            { id: 1, text: 'Anyone free for a quick sync?', sender: 'Charlie', time: '11:00', isMe: false },
            { id: 2, text: 'I can join in 10 minutes', sender: 'You', time: '11:02', isMe: true },
            { id: 3, text: 'Perfect! Let\'s meet at the coffee corner', sender: 'Charlie', time: '11:03', isMe: false },
            { id: 4, text: 'On my way!', sender: 'You', time: '11:10', isMe: true },
          ];
          break;
        case 5: // Mentors Channel
          chatMessages = [
            { id: 1, text: 'AWS credits are now available', sender: 'Mentor', time: '09:00', isMe: false },
            { id: 2, text: 'How do we request them?', sender: 'You', time: '09:15', isMe: true },
            { id: 3, text: 'Check the HackaTUM portal under Resources', sender: 'Mentor', time: '09:16', isMe: false },
            { id: 4, text: 'Got it, thanks!', sender: 'You', time: '09:17', isMe: true },
            { id: 5, text: 'Happy to help! Good luck with your project', sender: 'Mentor', time: '09:18', isMe: false },
          ];
          break;
        default:
          // Default messages for unknown chats
          chatMessages = [
            { id: 1, text: 'Welcome to the chat!', sender: 'System', time: '10:00', isMe: false },
            { id: 2, text: 'Start a conversation', sender: 'System', time: '10:01', isMe: false },
          ];
      }
      
      setMessages(chatMessages);
    }
  }, [id]);

  // Load messages when component mounts or id changes
  useEffect(() => {
    loadMessages().catch(err => console.error('Error loading messages:', err));
  }, [loadMessages]);

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Refresh messages when screen comes into focus (for meme chat)
  useFocusEffect(
    useCallback(() => {
      const chatId = parseInt(id || '0', 10);
      const isMemeChatCheck = chatId === getMemeChatId();
      
      if (isMemeChatCheck) {
        // Small delay to ensure memes are saved before loading
        const timeoutId = setTimeout(() => {
          console.log('Focus effect: Reloading memes for chat', chatId);
          loadMessages().catch(err => console.error('Error loading messages:', err));
        }, 200);
        return () => clearTimeout(timeoutId);
      }
    }, [id, loadMessages])
  );

  const handleSend = () => {
    const messageText = message.trim();
    if (messageText) {
      // Create new message
      const newMessage = {
        id: Date.now(), // Use timestamp as unique ID
        text: messageText,
        sender: 'You',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        timestamp: Date.now(),
      };
      
      // Add message to the messages array
      setMessages(prev => [...prev, newMessage]);
      
      // Clear input
      setMessage('');
      
      // Scroll to bottom after a short delay to show the new message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleDeleteMeme = async (memeId: number) => {
    Alert.alert(
      'Delete Meme',
      'Are you sure you want to delete this meme?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMeme(memeId);
            // Reload messages to reflect the deletion
            await loadMessages();
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={commonStyles.container}>
      <SafeAreaView edges={['top']} style={commonStyles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={commonStyles.backButton}>
            <IconSymbol size={24} name="chevron.left" color={BrandColors.white} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerTitle}>
              {isMemeChat ? 'Meme Masters 🎭' : getChatName(parseInt(id || '0', 10))}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {isMemeChat ? 'Meme chat' : getChatSubtitle(parseInt(id || '0', 10))}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <IconSymbol size={24} name="ellipsis" color={BrandColors.blueAccent} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              // Auto-scroll to bottom when content changes
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          >
            {messages.map((msg) => {
              // Check if this is a meme (has imageUri and is from user)
              const isMeme = msg.isMe && msg.imageUri && isMemeChat;
              
              // Determine if message has an image
              const hasImage = !!(msg.imageUri || msg.imageSource);
              
              // Get image source - prioritize imageSource, fallback to imageUri
              let imageSource: any = null;
              if (msg.imageSource) {
                imageSource = msg.imageSource;
              } else if (msg.imageUri) {
                imageSource = { uri: msg.imageUri };
              }
              
              return (
                <View 
                  key={msg.id} 
                  style={[
                    hasImage ? styles.messageBubbleImage : styles.messageBubble, 
                    msg.isMe ? styles.messageBubbleMe : styles.messageBubbleOther
                  ]}
                >
                  {!msg.isMe && (
                    <ThemedText style={styles.messageSender}>{msg.sender}</ThemedText>
                  )}
                  {hasImage && imageSource ? (
                    <View style={styles.memeImageContainer}>
                      <ExpoImage
                        source={imageSource}
                        style={styles.memeImage}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                        transition={200}
                        onError={(error) => {
                          console.error('Error loading image:', error, 'Source:', imageSource, 'Type:', typeof imageSource);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', imageSource, 'Type:', typeof imageSource);
                        }}
                      />
                      {isMeme && (
                        <TouchableOpacity
                          style={styles.deleteMemeButton}
                          onPress={() => handleDeleteMeme(msg.id)}
                        >
                          <IconSymbol size={20} name="trash" color={BrandColors.white} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <ThemedText style={[styles.messageText, msg.isMe && styles.messageTextMe]}>
                      {msg.text}
                    </ThemedText>
                  )}
                  <ThemedText style={[styles.messageTime, msg.isMe && styles.messageTimeMe]}>
                    {msg.time}
                  </ThemedText>
                </View>
              );
            })}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputContainer, !isKeyboardVisible && styles.inputContainerNoKeyboard]}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.dark.icon}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <IconSymbol size={20} name="arrow.up.circle.fill" color={message.trim() ? BrandColors.blueAccent : Colors.dark.icon} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.dark.icon,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  messageBubbleImage: {
    maxWidth: '85%',
    padding: 4,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  messageBubbleMe: {
    backgroundColor: BrandColors.blueAccent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: Colors.dark.cardBackground,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.blueAccent,
    marginBottom: 4,
    fontFamily: 'Orbitron',
  },
  messageText: {
    fontSize: 15,
    color: BrandColors.white,
    fontFamily: 'Orbitron',
  },
  messageTextMe: {
    color: BrandColors.white,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.dark.icon,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: BrandColors.white + 'CC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: BrandColors.darkBackground,
  },
  inputContainerNoKeyboard: {
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: BrandColors.white,
    fontFamily: 'Orbitron',
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  memeImageContainer: {
    width: 280,
    maxWidth: 280,
    minWidth: 200,
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  memeImage: {
    width: '100%',
    height: 280,
    minHeight: 200,
    borderRadius: 12,
  },
  deleteMemeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: BrandColors.darkBackground + 'CC',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
});

