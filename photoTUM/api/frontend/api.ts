import { Platform } from 'react-native';

// --- CONFIGURATION ---
// IMPORTANT: Update this IP address to the IP of the computer running server.py
// You can find it by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux).
const LAPTOP_IP = '10.28.9.213'; // <--- CHANGE THIS

const SERVER_PORT = '5000';
const SERVER_HOST = Platform.select({
  android: LAPTOP_IP,
  ios: LAPTOP_IP,
  default: 'localhost',
});

const BASE_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

export interface ApiPhoto {
  id: string;
  uri: string;
  filename: string;
}

export interface MatchResult {
  message: string;
  matches: string[]; // list of filenames (ids)
}

export const api = {
  getPhotos: async (): Promise<ApiPhoto[]> => {
    try {
      console.log(`Fetching photos from ${BASE_URL}/photos...`);
      const response = await fetch(`${BASE_URL}/photos`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      console.log(`Received ${data.length} photos from server.`);
      
      // Map relative URIs to absolute
      return data.map((p: any) => {
        const fullUri = `${BASE_URL}${p.uri}`;
        return {
          id: p.id,
          filename: p.filename,
          uri: fullUri
        };
      });
    } catch (error) {
      console.error('API Error (getPhotos):', error);
      throw error;
    }
  },

  findMe: async (photoUri: string): Promise<MatchResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      console.log(`Sending selfie to ${BASE_URL}/find_me...`);
      console.log('Photo URI:', photoUri);
      
      const formData = new FormData();
      
      // React Native FormData - ensure file:// prefix is present
      const uri = photoUri.startsWith('file://') ? photoUri : `file://${photoUri}`;
      
      // React Native specific FormData structure
      // @ts-ignore - React Native FormData format
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as any);

      const response = await fetch(`${BASE_URL}/find_me`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // DO NOT set Content-Type header - let React Native set it automatically with boundary
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Server error response:', errText);
        throw new Error(`Server error: ${errText}`);
      }
      
      const result = await response.json();
      console.log('Face recognition result:', result);
      return result;
    } catch (error: any) {
      console.error('API Error (findMe):', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
};

