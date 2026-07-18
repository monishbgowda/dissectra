import RNFS from 'react-native-fs';

export function normalizeFileSystemPath(imagePath) {
  if (!imagePath) {
    throw new Error('Image path is undefined or null');
  }

  return imagePath.replace(/^file:\/\//, '');
}

export async function convertToBase64(imagePath) {
  try {
    const path = normalizeFileSystemPath(imagePath);
    console.log('Converting to base64:', path);

    // Check if file exists
    const exists = await RNFS.exists(path);
    console.log('File exists:', exists);

    if (!exists) {
      throw new Error(`File not found: ${path}`);
    }

    // Read file and convert to base64
    const base64 = await RNFS.readFile(path, 'base64');
    console.log('Base64 conversion success, length:', base64.length);
    return base64;
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw error;
  }
}
