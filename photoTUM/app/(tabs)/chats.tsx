import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandColors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Chats</ThemedText>
          <TouchableOpacity style={styles.newChatButton}>
            <IconSymbol size={24} name="plus.message" color={BrandColors.blueAccent} />
          </TouchableOpacity>
        </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol size={20} name="magnifyingglass" color={Colors.dark.icon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor={Colors.dark.icon}
        />
      </View>

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
        <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
          {filteredChats.map((chat) => (
            <TouchableOpacity 
              key={chat.id} 
              style={styles.chatItem}
              onPress={() => router.push(`/chat/${chat.id}`)}
            >
            <View style={[
              styles.chatAvatar,
              { backgroundColor: chat.type === 'org' ? BrandColors.blueAccent + '40' : Colors.dark.cardBackground }
            ]}>
              <IconSymbol 
                size={28} 
                name={chat.type === 'org' ? 'megaphone.fill' : chat.type === 'meme' ? 'face.smiling.fill' : 'person.2.fill'} 
                color={chat.type === 'org' ? BrandColors.blueAccent : Colors.dark.icon} 
              />
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
  newChatButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
  },
  filterContent: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.dark.cardBackground,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 32,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: BrandColors.blueAccent,
    borderColor: BrandColors.blueAccent,
  },
  filterText: {
    fontFamily: 'Orbitron',
    fontSize: 12,
    color: Colors.dark.icon,
  },
  filterTextActive: {
    fontFamily: 'Orbitron',
    fontSize: 12,
    color: BrandColors.white,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
});

