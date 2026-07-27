import {Inspection} from './inspectionTypes';
import {
  createInspection,
  saveInspection,
} from './inspectionStorage';

export async function startInspection(): Promise<Inspection> {
  const id = `INS_${Date.now()}`;

  await createInspection(id);

  const inspection: Inspection = {
    id,

    objectName: 'Unknown Object',

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),

    status: 'CAPTURING',

    thumbnail: '',

    imageCount: 0,

    images: [],
  };

  await saveInspection(inspection);

  return inspection;
}