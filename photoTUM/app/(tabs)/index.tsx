import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  
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
          onPress={() => {
            // Navigate to meme creation
            console.log('Make a Meme pressed');
          }}
        >
          <IconSymbol size={24} name="face.smiling" color={BrandColors.white} />
          <ThemedText style={styles.memeButtonText}>Make a Meme</ThemedText>
        </TouchableOpacity>
      </View>
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
    bottom: 80, // Above the tab bar
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
});
