const path = require('path');
const { randomUUID } = require('crypto');
const { createJob, updateJob, getJob } = require('./jobStore');
const { saveHistoryItem } = require('./historyStore');

const DEMO_MODEL_URL = process.env.DEMO_MODEL_URL || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
const MODEL_PROVIDER = (process.env.MODEL_PROVIDER || 'mock').toLowerCase();

async function generateModel(uploadId, imagePath, modelDir) {
  const jobId = `${MODEL_PROVIDER}-${Date.now()}-${randomUUID()}`;
  const basePayload = {
    uploadId,
    jobId,
    provider: MODEL_PROVIDER,
    status: 'queued',
    modelUrl: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const job = await createJob(basePayload);
  scheduleModelGeneration(job, imagePath, modelDir).catch(err => {
    updateJob(jobId, { status: 'failed', error: err.message });
  });

  return job;
}

async function getModelJob(jobId) {
  return getJob(jobId);
}

async function scheduleModelGeneration(job, imagePath, modelDir) {
  if (MODEL_PROVIDER === 'mock') {
    const completeUrl = DEMO_MODEL_URL;
    return updateJob(job.jobId, { status: 'complete', modelUrl: completeUrl });
  }

  updateJob(job.jobId, { status: 'processing' });

  let result;
  if (MODEL_PROVIDER === 'tripo') {
    result = await generateWithTripo(imagePath, modelDir);
  } else if (MODEL_PROVIDER === 'meshy') {
    result = await generateWithMeshy(imagePath, modelDir);
  } else {
    result = { modelUrl: DEMO_MODEL_URL, status: 'complete' };
  }

  await updateJob(job.jobId, { status: result.status || 'complete', modelUrl: result.modelUrl, error: result.error });
  if (result.status === 'complete' && result.modelUrl) {
    await saveHistoryItem({ id: randomUUID(), uploadId: job.uploadId, imageUrl: `/files/uploads/${path.basename(imagePath)}`, modelUrl: result.modelUrl, status: 'complete', createdAt: new Date().toISOString() });
  }
  return result;
}

async function generateWithTripo(imagePath, modelDir) {
  if (!process.env.TRIPO_API_KEY) throw new Error('TRIPO_API_KEY missing for provider tripo');
  // Placeholder integration point for Tripo AI model creation.
  // Keep the interface stable for later provider-specific API calls.
  return { modelUrl: DEMO_MODEL_URL, status: 'complete' };
}

async function generateWithMeshy(imagePath, modelDir) {
  if (!process.env.MESHY_API_KEY) throw new Error('MESHY_API_KEY missing for provider meshy');
  // Placeholder integration point for Meshy AI model creation.
  return { modelUrl: DEMO_MODEL_URL, status: 'complete' };
}

module.exports = { generateModel, getModelJob };
