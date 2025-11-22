import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { commonStyles } from '@/styles/common';
import { addTodo, deleteTodo, getTodosAsync, TODO_COLORS, toggleTodo, type Todo } from '@/utils/todoStorage';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  
  // Countdown timer to November 23rd, 10 AM
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Todo list state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedColor, setSelectedColor] = useState(TODO_COLORS[0]);
  const [pendingRemovalIds, setPendingRemovalIds] = useState<Set<number>>(new Set());

  // Overlay states
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);
  const [showProjectOverlay, setShowProjectOverlay] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Project submission form state
  const [projectName, setProjectName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>(['']);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [aboutProject, setAboutProject] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [gitlabRepo, setGitlabRepo] = useState('');
  
  // Swipe down gesture for project overlay
  const panY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5 && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(panY, {
            toValue: Dimensions.get('window').height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setShowProjectOverlay(false);
            panY.setValue(0);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDate = new Date(now.getFullYear(), 10, 23, 10, 0, 0); // November 23rd, 10 AM (month is 0-indexed, so 10 = November)
      
      // If the date has passed this year, set it for next year
      if (targetDate < now) {
        targetDate.setFullYear(now.getFullYear() + 1);
      }
      
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load todos when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadTodosData = async () => {
        const loadedTodos = await getTodosAsync();
        setTodos(loadedTodos);
      };
      loadTodosData();
    }, [])
  );

  const handleAddTodo = async () => {
    if (newTodoText.trim()) {
      await addTodo(newTodoText, selectedColor);
      const updatedTodos = await getTodosAsync();
      setTodos(updatedTodos);
      setNewTodoText('');
      setSelectedColor(TODO_COLORS[0]);
      setShowAddTodoModal(false);
    }
  };

  const handleToggleTodo = async (todoId: number) => {
    await toggleTodo(todoId);
    const updatedTodos = await getTodosAsync();
    setTodos(updatedTodos);
    
    // Check if the todo was just completed
    const todo = updatedTodos.find(t => t.id === todoId);
    if (todo?.completed) {
      // Add to pending removal and set timeout to remove after 5 seconds
      setPendingRemovalIds(prev => new Set(prev).add(todoId));
      setTimeout(() => {
        setPendingRemovalIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(todoId);
          return newSet;
        });
      }, 5000);
    } else {
      // If uncompleted, remove from pending removal
      setPendingRemovalIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(todoId);
        return newSet;
      });
    }
  };

  const handleDeleteTodo = (todoId: number) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTodo(todoId);
            const updatedTodos = await getTodosAsync();
            setTodos(updatedTodos);
          },
        },
      ]
    );
  };

  const upcomingEvents = [
    { id: 1, title: 'Opening Ceremony', time: 'Today, 10:00 AM', location: 'Main Hall' },
    { id: 2, title: 'Workshop: AI & ML', time: 'Today, 2:00 PM', location: 'Room A3' },
    { id: 3, title: 'Team Building', time: 'Today, 6:00 PM', location: 'Cafeteria' },
  ];

  return (
    <ThemedView style={commonStyles.container}>
      <SafeAreaView edges={['top']} style={commonStyles.safeArea}>
        {/* Header with Profile Button */}
        <View style={commonStyles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={commonStyles.headerTitle}>HackaTUM 2025</ThemedText>
          </View>
          <TouchableOpacity style={commonStyles.headerButton}>
            <IconSymbol size={28} name="person.circle.fill" color={BrandColors.blueAccent} />
          </TouchableOpacity>
        </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Countdown Section */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setShowWelcomeOverlay(true)}
        >
        <BlurView intensity={80} tint="dark" style={[styles.card, styles.countdownCard]}>
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
        </BlurView>
        </TouchableOpacity>

        {/* Upcoming Events Section */}
        <BlurView intensity={80} tint="dark" style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Upcoming Events</ThemedText>
          {upcomingEvents.map((event, index) => (
            <TouchableOpacity key={event.id} style={[styles.eventItem, index < upcomingEvents.length - 1 && styles.eventItemBorder]}>
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
        </BlurView>

        {/* Todo List Section */}
        <BlurView intensity={80} tint="dark" style={styles.card}>
          <View style={styles.todoHeader}>
            <ThemedText style={styles.sectionTitle}>Team Todo List</ThemedText>
            <TouchableOpacity
              style={styles.addTodoButton}
              onPress={() => setShowAddTodoModal(true)}
            >
              <IconSymbol size={24} name="plus.circle.fill" color={BrandColors.blueAccent} />
            </TouchableOpacity>
          </View>
          {(() => {
            // Show todos that are either incomplete OR completed but pending removal (within 5 seconds)
            const visibleTodos = todos.filter(todo => !todo.completed || pendingRemovalIds.has(todo.id));
            return visibleTodos.length === 0 ? (
              <View style={styles.emptyTodoState}>
                <ThemedText style={styles.emptyTodoText}>No tasks yet. Add one to get started!</ThemedText>
              </View>
            ) : (
              visibleTodos.map((todo, index) => (
                <TouchableOpacity
                  key={todo.id}
                  style={[styles.todoItem, index < visibleTodos.length - 1 && styles.todoItemBorder]}
                  onPress={() => handleToggleTodo(todo.id)}
                  onLongPress={() => handleDeleteTodo(todo.id)}
                >
                  <View style={[styles.todoIndicator, { backgroundColor: todo.color }]} />
                  <ThemedText 
                    style={[
                      styles.todoText,
                      todo.completed && styles.todoTextCompleted
                    ]}
                  >
                    {todo.text}
                  </ThemedText>
                  {todo.completed && (
                    <IconSymbol size={20} name="checkmark.circle.fill" color={BrandColors.blueAccent} />
                  )}
                </TouchableOpacity>
              ))
            );
          })()}
          </BlurView>
      </ScrollView>

      {/* Add Todo Modal */}
      <Modal
        visible={showAddTodoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddTodoModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.modalScrollView}
          >
            <BlurView intensity={100} tint="dark" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Add New Task</ThemedText>
                <TouchableOpacity onPress={() => setShowAddTodoModal(false)}>
                  <IconSymbol size={24} name="xmark.circle.fill" color={Colors.dark.icon} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Enter task description..."
                placeholderTextColor={Colors.dark.icon}
                value={newTodoText}
                onChangeText={setNewTodoText}
                autoFocus
                multiline
              />

              <View style={styles.colorPicker}>
                <ThemedText style={styles.colorPickerLabel}>Choose Color:</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.colorOptions}
                >
                  {TODO_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorOptionSelected
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <IconSymbol size={16} name="checkmark" color={color === '#FFFF44' ? '#000' : '#FFF'} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={[styles.modalButton, !newTodoText.trim() && styles.modalButtonDisabled]}
                onPress={handleAddTodo}
                disabled={!newTodoText.trim()}
              >
                <ThemedText style={styles.modalButtonText}>Add Task</ThemedText>
              </TouchableOpacity>
          </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Welcome Overlay with Map and QR Code */}
      <Modal
        visible={showWelcomeOverlay}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowWelcomeOverlay(false);
          setMapLoaded(false);
        }}
      >
        <View style={styles.overlayContainer}>
          <BlurView intensity={100} tint="dark" style={styles.overlayContent}>
            {/* Welcome Header */}
            <View style={styles.welcomeHeader}>
              <ThemedText style={styles.welcomeTitle}>
                Welcome Jonathan to <ThemedText style={styles.welcomeTitleHighlight}>HackaTUM X</ThemedText>
              </ThemedText>
            </View>

            {/* Map Section */}
            <View style={styles.mapSection}>
              {!mapLoaded && (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator size="large" color={BrandColors.blueAccent} />
                  <ThemedText style={styles.mapLoadingText}>Loading map...</ThemedText>
                </View>
              )}
              <WebView
                source={{ html: getMapHTML() }}
                style={styles.mapWebView}
                onMessage={(event) => {
                  if (event.nativeEvent.data === 'mapLoaded') {
                    setMapLoaded(true);
                  }
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
              />
            </View>

            {/* QR Code Section */}
            <TouchableOpacity
              style={styles.qrCodeSection}
              onPress={() => {
                setShowWelcomeOverlay(false);
                setMapLoaded(false);
                setShowProjectOverlay(true);
              }}
              activeOpacity={0.9}
            >
              <QRCode
                value="https://hackatum2025.phototum.app"
                size={Dimensions.get('window').width * 0.6}
                color={BrandColors.white}
                backgroundColor="transparent"
              />
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* Project Submission Overlay */}
      <Modal
        visible={showProjectOverlay}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowProjectOverlay(false);
          panY.setValue(0);
        }}
      >
        <Animated.View
          style={[
            styles.projectOverlayContainer,
            {
              transform: [{ translateY: panY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.projectOverlayKeyboardView}
          >
            <View style={styles.projectOverlayWrapper}>
              <BlurView intensity={100} tint="dark" style={styles.projectOverlayContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowProjectOverlay(false);
                panY.setValue(0);
              }}
            >
              <IconSymbol size={28} name="xmark.circle.fill" color={BrandColors.white} />
            </TouchableOpacity>

            {/* Swipe Indicator */}
            <View style={styles.swipeIndicator} />

            <ScrollView
              style={styles.projectScrollView}
              contentContainerStyle={styles.projectScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <ThemedText style={styles.projectTitle}>Project Submission</ThemedText>

              {/* Project Name */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Project Name</ThemedText>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter project name..."
                  placeholderTextColor={Colors.dark.icon}
                  value={projectName}
                  onChangeText={setProjectName}
                />
              </View>

              {/* Team Name */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Team Name</ThemedText>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter team name..."
                  placeholderTextColor={Colors.dark.icon}
                  value={teamName}
                  onChangeText={setTeamName}
                />
              </View>

              {/* Team Members */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Team Members</ThemedText>
                {teamMembers.map((member, index) => (
                  <View key={index} style={styles.memberRow}>
                    <TextInput
                      style={[styles.formInput, styles.memberInput]}
                      placeholder={`Member ${index + 1}...`}
                      placeholderTextColor={Colors.dark.icon}
                      value={member}
                      onChangeText={(text) => {
                        const newMembers = [...teamMembers];
                        newMembers[index] = text;
                        setTeamMembers(newMembers);
                      }}
                    />
                    {teamMembers.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeMemberButton}
                        onPress={() => {
                          const newMembers = teamMembers.filter((_, i) => i !== index);
                          setTeamMembers(newMembers);
                        }}
                      >
                        <IconSymbol size={20} name="minus.circle.fill" color={BrandColors.blueAccent} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addMemberButton}
                  onPress={() => setTeamMembers([...teamMembers, ''])}
                >
                  <IconSymbol size={20} name="plus.circle" color={BrandColors.blueAccent} />
                  <ThemedText style={styles.addMemberText}>Add Team Member</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Challenge Selection */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Select Challenge</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengeScroll}>
                  {['AI & ML', 'Web3', 'Sustainability', 'Healthcare', 'Education', 'FinTech'].map((challenge) => (
                    <TouchableOpacity
                      key={challenge}
                      style={[
                        styles.challengeOption,
                        selectedChallenge === challenge && styles.challengeOptionSelected,
                      ]}
                      onPress={() => setSelectedChallenge(challenge)}
                    >
                      <ThemedText
                        style={[
                          styles.challengeText,
                          selectedChallenge === challenge && styles.challengeTextSelected,
                        ]}
                      >
                        {challenge}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* About the Project */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>About the Project</ThemedText>
                <TextInput
                  style={[styles.formInput, styles.textAreaInput]}
                  placeholder="Describe your project..."
                  placeholderTextColor={Colors.dark.icon}
                  value={aboutProject}
                  onChangeText={setAboutProject}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Technologies Used */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Technologies Used</ThemedText>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., React Native, Python, TensorFlow..."
                  placeholderTextColor={Colors.dark.icon}
                  value={technologies}
                  onChangeText={setTechnologies}
                />
              </View>

              {/* GitLab Repo Link */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>GitLab Repo Link</ThemedText>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://gitlab.com/..."
                  placeholderTextColor={Colors.dark.icon}
                  value={gitlabRepo}
                  onChangeText={setGitlabRepo}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!projectName.trim() || !teamName.trim()) && styles.submitButtonDisabled,
                ]}
                onPress={() => {
                  Alert.alert('Success', 'Project submitted successfully!');
                  setShowProjectOverlay(false);
                  // Reset form
                  setProjectName('');
                  setTeamName('');
                  setTeamMembers(['']);
                  setSelectedChallenge('');
                  setAboutProject('');
                  setTechnologies('');
                  setGitlabRepo('');
                }}
                disabled={!projectName.trim() || !teamName.trim()}
              >
                <ThemedText style={styles.submitButtonText}>Submit Project</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </BlurView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

// Map HTML generator (same as navigation tab)
const MI_BUILDING_LAT = 48.2625;
const MI_BUILDING_LON = 11.6708;
const MI_BUILDING_NAME = 'Mathematics/Informatics Building';
const MI_BUILDING_ADDRESS = 'Boltzmannstraße 3, 85748 Garching';

const getMapHTML = () => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map').setView([${MI_BUILDING_LAT}, ${MI_BUILDING_LON}], 17);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        var marker = L.marker([${MI_BUILDING_LAT}, ${MI_BUILDING_LON}]).addTo(map);
        marker.bindPopup('<b>${MI_BUILDING_NAME}</b><br>${MI_BUILDING_ADDRESS}').openPopup();
        
        // Notify React Native that map is loaded
        window.ReactNativeWebView.postMessage('mapLoaded');
    </script>
</body>
</html>
  `;
};

const styles = StyleSheet.create({
  headerLeft: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  countdownCard: {
    backgroundColor: 'rgba(77, 111, 173, 0.15)',
    borderColor: 'rgba(77, 111, 173, 0.4)',
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
    lineHeight: 50,
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
  },
  eventItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(77, 111, 173, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(77, 111, 173, 0.3)',
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
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addTodoButton: {
    padding: 4,
  },
  emptyTodoState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyTodoText: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontFamily: 'Orbitron',
    textAlign: 'center',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  todoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  todoIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  todoText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
    color: Colors.dark.icon,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalScrollView: {
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    marginHorizontal: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  modalInput: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    color: BrandColors.white,
    fontFamily: 'Orbitron',
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 20,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  colorPicker: {
    marginBottom: 20,
  },
  colorPickerLabel: {
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderColor: BrandColors.white,
    borderWidth: 3,
  },
  modalButton: {
    backgroundColor: BrandColors.blueAccent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  // Welcome Overlay Styles
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  overlayContent: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  welcomeHeader: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    textAlign: 'center',
    lineHeight: 86,
  },
  welcomeTitleHighlight: {
    fontSize: 64,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.blueAccent,
    lineHeight: 56,
  },
  mapSection: {
    height: Dimensions.get('window').height * 0.3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    position: 'relative',
  },
  mapWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: Colors.dark.icon,
  },
  qrCodeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  // Project Overlay Styles
  projectOverlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
  },
  projectOverlayKeyboardView: {
    flex: 1,
  },
  projectOverlayWrapper: {
    flex: 1,
    borderTopLeftRadius: Platform.OS === 'ios' ? 44 : 34,
    borderTopRightRadius: Platform.OS === 'ios' ? 44 : 34,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 30, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderBottomWidth: 0,
  },
  projectOverlayContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 32 : 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 32 : 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  projectScrollView: {
    flex: 1,
  },
  projectScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
    marginBottom: 12,
  },
  formInput: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    color: BrandColors.white,
    fontFamily: 'Orbitron',
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  textAreaInput: {
    minHeight: 100,
    maxHeight: 150,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInput: {
    flex: 1,
    marginRight: 12,
  },
  removeMemberButton: {
    padding: 8,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginTop: 8,
  },
  addMemberText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: BrandColors.blueAccent,
  },
  challengeScroll: {
    flexDirection: 'row',
  },
  challengeOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardBackground,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    marginRight: 12,
  },
  challengeOptionSelected: {
    borderColor: BrandColors.blueAccent,
    backgroundColor: 'rgba(77, 111, 173, 0.2)',
  },
  challengeText: {
    fontSize: 14,
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
  challengeTextSelected: {
    color: BrandColors.blueAccent,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: BrandColors.blueAccent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Orbitron',
    color: BrandColors.white,
  },
});
