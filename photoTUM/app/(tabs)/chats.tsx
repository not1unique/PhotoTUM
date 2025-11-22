import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { commonStyles } from '@/styles/common';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const chats = [
    { id: 1, name: 'Team Alpha', lastMessage: 'Great progress on the backend!', time: '2m ago', unread: 3, type: 'team' },
    { id: 2, name: 'HackaTUM Organizers', lastMessage: 'Dinner is ready at the cafeteria', time: '15m ago', unread: 0, type: 'org' },
    { id: 3, name: 'Meme Masters 🎭', lastMessage: 'Check out this one 😂', time: '1h ago', unread: 12, type: 'meme' },
    { id: 4, name: 'Team Beta', lastMessage: 'Anyone free for a quick sync?', time: '2h ago', unread: 1, type: 'team' },
    { id: 5, name: 'Mentors Channel', lastMessage: 'AWS credits are now available', time: '3h ago', unread: 0, type: 'org' },
  ];

  const filteredChats = selectedFilter === 'all' 
    ? chats 
    : chats.filter(chat => chat.type === selectedFilter);

  return (
    <ThemedView style={commonStyles.container}>
      <SafeAreaView edges={['top']} style={commonStyles.safeArea}>
        {/* Header */}
        <View style={commonStyles.header}>
          <ThemedText style={commonStyles.headerTitle}>Chats</ThemedText>
          <TouchableOpacity style={commonStyles.headerButton}>
            <IconSymbol size={24} name="plus.message" color={BrandColors.blueAccent} />
          </TouchableOpacity>
        </View>

      {/* Search Bar */}
      <BlurView intensity={80} tint="dark" style={styles.searchContainer}>
        <IconSymbol size={20} name="magnifyingglass" color={Colors.dark.icon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor={Colors.dark.icon}
        />
      </BlurView>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <ThemedText style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'team' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('team')}
          >
            <ThemedText style={[styles.filterText, selectedFilter === 'team' && styles.filterTextActive]}>Teams</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'org' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('org')}
          >
            <ThemedText style={[styles.filterText, selectedFilter === 'org' && styles.filterTextActive]}>Organizers</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'meme' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('meme')}
          >
            <ThemedText style={[styles.filterText, selectedFilter === 'meme' && styles.filterTextActive]}>Memes</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Chat List */}
        <ScrollView 
          style={styles.chatList} 
          contentContainerStyle={styles.chatListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredChats.map((chat) => (
            <TouchableOpacity 
              key={chat.id} 
              style={styles.chatItem}
              onPress={() => router.push(`/chat/${chat.id}`)}
            >
            <View style={styles.chatAvatarContainer}>
              {/* Base color layer */}
              <View 
                style={[
                  styles.chatAvatarBase,
                  { backgroundColor: chat.type === 'org' ? 'rgba(77, 111, 173, 0.4)' : 'rgba(255, 255, 255, 0.1)' }
                ]}
              />
              {/* BlurView on top */}
              <BlurView 
                intensity={60} 
                tint="dark" 
                style={styles.chatAvatarBlur}
              >
                <IconSymbol 
                  size={28} 
                  name={chat.type === 'org' ? 'megaphone.fill' : chat.type === 'meme' ? 'face.smiling.fill' : 'person.2.fill'} 
                  color={chat.type === 'org' ? BrandColors.blueAccent : Colors.dark.icon} 
                />
              </BlurView>
              {/* Border on top */}
              <View style={styles.chatAvatarBorder} />
            </View>
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <ThemedText style={styles.chatName}>{chat.name}</ThemedText>
                <ThemedText style={styles.chatTime}>{chat.time}</ThemedText>
              </View>
              <View style={styles.chatFooter}>
                <ThemedText style={styles.chatMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </ThemedText>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <ThemedText style={styles.unreadText}>{chat.unread}</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: BrandColors.white,
    fontFamily: 'Orbitron',
  },
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
    maxHeight: 30,
  },
  filterContent: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    minHeight: 28,
    maxHeight: 30,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(77, 111, 173, 0.6)',
    borderColor: BrandColors.blueAccent,
  },
  filterText: {
    fontFamily: 'Orbitron',
    fontSize: 11,
    color: Colors.dark.icon,
  },
  filterTextActive: {
    fontFamily: 'Orbitron',
    fontSize: 11,
    color: BrandColors.white,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  chatAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  chatAvatarBase: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  chatAvatarBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  chatAvatarBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    pointerEvents: 'none',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontFamily: 'Orbitron',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.icon,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: BrandColors.blueAccent,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(77, 111, 173, 0.5)',
    shadowColor: BrandColors.blueAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
});

