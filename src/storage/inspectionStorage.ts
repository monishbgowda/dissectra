import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Inspection} from './inspectionTypes';

const ROOT = `${RNFS.DocumentDirectoryPath}/inspections`;

const KEY = 'dissectra:inspections';

async function ensureRoot() {
  if (!(await RNFS.exists(ROOT))) {
    await RNFS.mkdir(ROOT);
  }
}

export async function createInspection(id: string) {
  await ensureRoot();

  const folder = `${ROOT}/${id}`;

  await RNFS.mkdir(folder);

  await RNFS.mkdir(`${folder}/images`);

  await RNFS.mkdir(`${folder}/analysis`);

  await RNFS.mkdir(`${folder}/models`);

  return folder;
}
console.log(
    "Saving inspection..."
);
export async function saveInspection(inspection: Inspection) {
  await ensureRoot();

  const folder = `${ROOT}/${inspection.id}`;

  await RNFS.writeFile(
    `${folder}/metadata.json`,
    JSON.stringify(inspection, null, 2),
    'utf8',
  );

  const inspections = await listInspections();

  const filtered = inspections.filter(i => i.id !== inspection.id);

  filtered.unshift(inspection);

  await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
}

export async function listInspections(): Promise<Inspection[]> {
  const raw = await AsyncStorage.getItem(KEY);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw);
}

export async function deleteInspection(id: string) {
  const folder = `${ROOT}/${id}`;

  if (await RNFS.exists(folder)) {
    await RNFS.unlink(folder);
  }

  const all = await listInspections();

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(all.filter(i => i.id !== id)),
  );
}

export async function copyImageToInspection(
  inspectionId: string,
  imageUri: string,
  fileName: string,
) {
  const destination =
    `${ROOT}/${inspectionId}/images/${fileName}`;

  await RNFS.copyFile(
    imageUri.replace('file://', ''),
    destination,
  );

  return `file://${destination}`;
}
export const getInspection = async (
    inspectionId: string,
): Promise<Inspection | null> => {

    const inspections =
        await listInspections();

    return (
        inspections.find(
            inspection => inspection.id === inspectionId,
        ) ?? null
    );
};