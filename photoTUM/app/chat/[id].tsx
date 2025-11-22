import { StyleSheet, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandColors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { getMemes, getMemeChatId } from '@/utils/memeStorage';

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: number; text?: string; imageUri?: string; sender: string; time: string; isMe: boolean }>>([]);
  const isMemeChat = id === String(getMemeChatId());
  
  const loadMessages = useCallback(() => {
    if (isMemeChat) {
      // Load memes and convert to messages
      const memes = getMemes();
      console.log('Loading memes, count:', memes.length);
      
      const memeMessages = memes.map((meme) => {
        console.log('Meme:', meme.id, 'URI:', meme.imageUri?.substring(0, 50) + '...');
        return {
          id: meme.id,
          imageUri: meme.imageUri,
          sender: 'You',
          time: new Date(meme.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
        };
      });
      
      // Add default messages if no memes yet
      const defaultMessages = memes.length === 0 ? [
        { id: 1, text: 'Welcome to the Meme Masters chat! 🎭', sender: 'System', time: '10:00', isMe: false },
        { id: 2, text: 'Create your first meme using the "Make a Meme" button!', sender: 'System', time: '10:01', isMe: false },
      ] : [];
      
      const allMessages = [...defaultMessages, ...memeMessages];
      console.log('Setting messages, total:', allMessages.length);
      setMessages(allMessages);
    } else {
      // Regular chat messages
      setMessages([
        { id: 1, text: 'Hey team! How is everyone doing?', sender: 'Alice', time: '10:30', isMe: false },
        { id: 2, text: 'Great! Just finished the backend API', sender: 'You', time: '10:32', isMe: true },
        { id: 3, text: 'Awesome! I\'m working on the frontend now', sender: 'Bob', time: '10:35', isMe: false },
        { id: 4, text: 'Let\'s sync up in 30 minutes?', sender: 'You', time: '10:36', isMe: true },
        { id: 5, text: 'Sounds good!', sender: 'Alice', time: '10:37', isMe: false },
      ]);
    }
  }, [isMemeChat]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Refresh messages when screen comes into focus (for meme chat)
  useFocusEffect(
    useCallback(() => {
      if (isMemeChat) {
        // Small delay to ensure memes are saved before loading
        const timeoutId = setTimeout(() => {
          loadMessages();
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }, [isMemeChat, loadMessages])
  );
  
  // Also refresh when component mounts (in case we navigate directly)
  useEffect(() => {
    if (isMemeChat) {
      const timeoutId = setTimeout(() => {
        loadMessages();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isMemeChat]);

  const handleSend = () => {
    if (message.trim()) {
      // In real app, send message to backend
      console.log('Sending:', message);
      setMessage('');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol size={24} name="chevron.left" color={BrandColors.white} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerTitle}>
              {isMemeChat ? 'Meme Masters 🎭' : 'Team Alpha'}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {isMemeChat ? 'Meme chat' : '5 members'}
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView 
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View 
                key={msg.id} 
                style={[styles.messageBubble, msg.isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}
              >
                {!msg.isMe && (
                  <ThemedText style={styles.messageSender}>{msg.sender}</ThemedText>
                )}
                {msg.imageUri ? (
                  <View style={styles.memeImageContainer}>
                    <ExpoImage
                      source={{ uri: msg.imageUri }}
                      style={styles.memeImage}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                      onError={(error) => {
                        console.error('Error loading meme image:', error, 'URI:', msg.imageUri);
                      }}
                      onLoad={() => {
                        console.log('Meme image loaded successfully:', msg.imageUri);
                      }}
                    />
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
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
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
  container: {
    flex: 1,
    backgroundColor: BrandColors.darkBackground,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
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
    width: '100%',
    maxWidth: 300,
    marginBottom: 8,
  },
  memeImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
});

