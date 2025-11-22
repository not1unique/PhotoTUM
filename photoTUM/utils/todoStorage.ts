// Todo storage utility with AsyncStorage persistence

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  color: string; // Color for the indicator
  timestamp: number;
}

const TODOS_STORAGE_KEY = '@phototum_todos';

let todosCache: Todo[] | null = null;

// Available colors for todo indicators
export const TODO_COLORS = [
  '#4D6FAD', // Brand blue
  '#FF4444', // Red
  '#44FF44', // Green
  '#FFFF44', // Yellow
  '#FF44FF', // Magenta
  '#44FFFF', // Cyan
];

// Load todos from AsyncStorage
export const loadTodos = async (): Promise<Todo[]> => {
  try {
    const stored = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
    if (stored) {
      todosCache = JSON.parse(stored);
      return todosCache || [];
    }
  } catch (error) {
    console.error('Error loading todos from storage:', error);
  }
  todosCache = [];
  return [];
};

// Save todos to AsyncStorage
const saveTodos = async (todos: Todo[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    todosCache = todos;
  } catch (error) {
    console.error('Error saving todos to storage:', error);
  }
};

export const getTodos = (): Todo[] => {
  return todosCache || [];
};

export const getTodosAsync = async (): Promise<Todo[]> => {
  if (todosCache === null) {
    return await loadTodos();
  }
  return todosCache;
};

export const addTodo = async (text: string, color: string): Promise<void> => {
  const currentTodos = todosCache || await loadTodos();
  const newTodo: Todo = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    color: color,
    timestamp: Date.now(),
  };
  const updatedTodos = [...currentTodos, newTodo];
  await saveTodos(updatedTodos);
  console.log('Todo saved to storage. Total todos:', updatedTodos.length);
};

export const toggleTodo = async (todoId: number): Promise<void> => {
  const currentTodos = todosCache || await loadTodos();
  const updatedTodos = currentTodos.map(todo =>
    todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
  );
  await saveTodos(updatedTodos);
  console.log('Todo toggled. ID:', todoId);
};

export const deleteTodo = async (todoId: number): Promise<void> => {
  const currentTodos = todosCache || await loadTodos();
  const updatedTodos = currentTodos.filter(t => t.id !== todoId);
  await saveTodos(updatedTodos);
  console.log('Todo deleted from storage. Remaining todos:', updatedTodos.length);
};

