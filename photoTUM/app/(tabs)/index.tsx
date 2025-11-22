import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { commonStyles } from '@/styles/common';
import { addTodo, deleteTodo, getTodosAsync, TODO_COLORS, toggleTodo, type Todo } from '@/utils/todoStorage';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      </SafeAreaView>
    </ThemedView>
  );
}

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
});
