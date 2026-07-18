import { analyzeImage, generateModel, getModelStatus, uploadImage } from './dissectraApi';
import { copyToStorage, downloadModelToStorage, saveScan } from '../storage/localStorage';
import type { AnatomyAnalysis, ModelGenerationResponse, StoredScan } from '../types/dissectra';

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}

async function pollModelStatus(jobId: string) {
  const maxAttempts = 12;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const status = await getModelStatus(jobId);
    if (status.status === 'complete' || status.status === 'failed') {
      return status;
    }
    await wait(2000 + attempt * 500);
  }
  throw new Error('Model generation timed out.');
}

const OFFLINE_ANALYSIS: AnatomyAnalysis = {
  object: 'Offline anatomy scan',
  description: 'Saved locally. Connect to the network to analyze and generate the 3D model.',
  labels: ['offline', 'cached'],
  confidence: 0,
};

async function saveOfflineScan(id: string, imageUri: string, localImagePath?: string, analysis: AnatomyAnalysis = OFFLINE_ANALYSIS): Promise<StoredScan> {
  const scan: StoredScan = {
    id,
    imageUri,
    localImagePath,
    analysis,
    createdAt: new Date().toISOString(),
    status: 'offline',
  };
  await saveScan(scan);
  return scan;
}

export async function runScanPipeline(imageUri: string): Promise<StoredScan> {
  const id = String(Date.now());
  const localImagePath = await copyToStorage(imageUri, 'images', `${id}.jpg`).catch(() => undefined);

  let upload;
  try {
    upload = await uploadImage(imageUri, `${id}.jpg`);
  } catch (_error) {
    void _error;
    return saveOfflineScan(id, imageUri, localImagePath);
  }

  let analysis: AnatomyAnalysis;
  try {
    analysis = await analyzeImage(upload.uploadId);
  } catch (_error) {
    void _error;
    analysis = {
      ...OFFLINE_ANALYSIS,
      description: 'Analysis failed, but this scan was saved locally. Retry when online.',
    };
  }

  let model: ModelGenerationResponse;
  try {
    const initialModel = await generateModel(upload.uploadId);
    model = initialModel.status === 'queued' || initialModel.status === 'processing'
      ? await pollModelStatus(initialModel.jobId)
      : initialModel;
  } catch (_error) {
    void _error;
    model = { jobId: '', status: 'failed' };
  }

  const localModelPath = model.modelUrl ? await downloadModelToStorage(model.modelUrl, `${id}.glb`).catch(() => undefined) : undefined;
  const scan: StoredScan = {
    id,
    imageUri,
    localImagePath,
    modelUri: localModelPath || model.modelUrl,
    localModelPath,
    analysis,
    createdAt: new Date().toISOString(),
    status: model.status === 'failed' ? 'failed' : 'complete',
  };

  await saveScan(scan);
  return scan;
}
