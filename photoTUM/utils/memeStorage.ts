// Simple meme storage utility
// In a real app, this would use AsyncStorage or a database

export interface Meme {
  id: number;
  imageUri: string;
  topText: string;
  bottomText: string;
  timestamp: number;
}

let memes: Meme[] = [];

export const getMemes = (): Meme[] => {
  return memes;
};

export const addMeme = (meme: Meme): void => {
  memes.push(meme);
};

export const getMemeChatId = (): number => {
  return 3; // Meme Masters chat ID
};

