import { StyleSheet, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandColors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState('');
  
  // Mock messages - in real app, fetch based on chat id
  const messages = [
    { id: 1, text: 'Hey team! How is everyone doing?', sender: 'Alice', time: '10:30', isMe: false },
    { id: 2, text: 'Great! Just finished the backend API', sender: 'You', time: '10:32', isMe: true },
    { id: 3, text: 'Awesome! I\'m working on the frontend now', sender: 'Bob', time: '10:35', isMe: false },
    { id: 4, text: 'Let\'s sync up in 30 minutes?', sender: 'You', time: '10:36', isMe: true },
    { id: 5, text: 'Sounds good!', sender: 'Alice', time: '10:37', isMe: false },
  ];

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
            <ThemedText style={styles.headerTitle}>Team Alpha</ThemedText>
            <ThemedText style={styles.headerSubtitle}>5 members</ThemedText>
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
                <ThemedText style={[styles.messageText, msg.isMe && styles.messageTextMe]}>
                  {msg.text}
                </ThemedText>
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
});

