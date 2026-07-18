import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredScan } from '../types/dissectra';

const KEY = 'dissectra:scans';
const ROOT = `${RNFS.DocumentDirectoryPath}/storage`;

export async function ensureStorage() {
  await Promise.all(['images', 'models', 'results'].map(dir => RNFS.mkdir(`${ROOT}/${dir}`)));
}

export async function copyToStorage(uri: string, folder: 'images' | 'models' | 'results', name: string) {
  await ensureStorage();
  const from = uri.replace('file://', '');
  const to = `${ROOT}/${folder}/${name}`;
  await RNFS.copyFile(from, to);
  return `file://${to}`;
}

export async function downloadModelToStorage(modelUrl: string, name: string) {
  await ensureStorage();
  const destination = `${ROOT}/models/${name}`;
  if (modelUrl.startsWith('http')) {
    const result = await RNFS.downloadFile({ fromUrl: modelUrl, toFile: destination }).promise;
    if (result.statusCode && result.statusCode >= 200 && result.statusCode < 300) {
      return `file://${destination}`;
    }
    throw new Error(`Failed to download model (${result.statusCode})`);
  }

  const sourcePath = modelUrl.replace('file://', '');
  await RNFS.copyFile(sourcePath, destination);
  return `file://${destination}`;
}

export async function listScans(): Promise<StoredScan[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveScan(scan: StoredScan) {
  const scans = await listScans();
  const next = [scan, ...scans.filter(item => item.id !== scan.id)].slice(0, 100);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  await ensureStorage();
  await RNFS.writeFile(`${ROOT}/results/${scan.id}.json`, JSON.stringify(scan, null, 2), 'utf8').catch(() => undefined);
}

export async function updateScan(scan: StoredScan) {
  await saveScan(scan);
}

export async function deleteScans(ids: string[]) {
  const scans = await listScans();
  const keep = scans.filter(s => !ids.includes(s.id));
  await AsyncStorage.setItem(KEY, JSON.stringify(keep));
  // remove files
  await Promise.all(ids.map(async (id) => {
    await RNFS.unlink(`${ROOT}/results/${id}.json`).catch(() => undefined);
    // try to delete image and model files with id base name
    const imagePath = `${ROOT}/images/${id}`;
    await RNFS.unlink(imagePath).catch(() => undefined);
    await RNFS.unlink(`${imagePath}.jpg`).catch(() => undefined);
    await RNFS.unlink(`${ROOT}/models/${id}`).catch(() => undefined);
  }));
}

export async function clearAllScans() {
  await AsyncStorage.removeItem(KEY);
  // remove storage folders
  await RNFS.unlink(ROOT).catch(() => undefined);
}
