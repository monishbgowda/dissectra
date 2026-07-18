// API Configuration
// Load secure keys from .env via react-native-dotenv, with fallback values for development.
import {
  GEMINI_API_KEY as ENV_GEMINI_API_KEY,
  NEURAL4D_API_KEY as ENV_NEURAL4D_API_KEY,
  NEURAL4D_API_URL as ENV_NEURAL4D_API_URL
} from '@env';

export const GEMINI_API_KEY = ENV_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
export const NEURAL4D_API_KEY = ENV_NEURAL4D_API_KEY || 'YOUR_NEURAL4D_API_KEY_HERE';
export const NEURAL4D_API_URL = ENV_NEURAL4D_API_URL || 'https://api.neural4d.com/v1/generate';
export const SKETCHFAB_API_URL = 'https://api.sketchfab.com/v3/search';

// Re-export for compatibility
export const GEMINI_API_KEY_FALLBACK = GEMINI_API_KEY;
export const NEURAL4D_API_KEY_FALLBACK = NEURAL4D_API_KEY;
export const NEURAL4D_API_URL_FALLBACK = NEURAL4D_API_URL;
