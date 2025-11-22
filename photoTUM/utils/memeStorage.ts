// Meme storage utility with AsyncStorage persistence

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Meme {
  id: number;
  imageUri: string;
  topText: string;
  bottomText: string;
  timestamp: number;
}

const MEMES_STORAGE_KEY = '@phototum_memes';

let memesCache: Meme[] | null = null;

// Load memes from AsyncStorage
export const loadMemes = async (): Promise<Meme[]> => {
  try {
    const stored = await AsyncStorage.getItem(MEMES_STORAGE_KEY);
    if (stored) {
      memesCache = JSON.parse(stored);
      return memesCache || [];
    }
  } catch (error) {
    console.error('Error loading memes from storage:', error);
  }
  memesCache = [];
  return [];
};

// Save memes to AsyncStorage
const saveMemes = async (memes: Meme[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MEMES_STORAGE_KEY, JSON.stringify(memes));
    memesCache = memes;
  } catch (error) {
    console.error('Error saving memes to storage:', error);
  }
};

export const getMemes = (): Meme[] => {
  // Return cached memes if available, otherwise return empty array
  // Note: For async loading, use loadMemes() instead
  return memesCache || [];
};

export const getMemesAsync = async (): Promise<Meme[]> => {
  if (memesCache === null) {
    return await loadMemes();
  }
  return memesCache;
};

export const addMeme = async (meme: Meme): Promise<void> => {
  const currentMemes = memesCache || await loadMemes();
  const updatedMemes = [...currentMemes, meme];
  await saveMemes(updatedMemes);
  console.log('Meme saved to storage. Total memes:', updatedMemes.length);
};

export const deleteMeme = async (memeId: number): Promise<void> => {
  const currentMemes = memesCache || await loadMemes();
  const updatedMemes = currentMemes.filter(m => m.id !== memeId);
  await saveMemes(updatedMemes);
  console.log('Meme deleted from storage. Remaining memes:', updatedMemes.length);
};

export const getMemeChatId = (): number => {
  return 3; // Meme Masters chat ID
};

