import { Platform } from 'react-native';
import { api } from './apiClient';
import type { AnatomyAnalysis, ModelGenerationResponse, UploadResponse } from '../types/dissectra';

export async function uploadImage(uri: string, fileName = 'scan.jpg'): Promise<UploadResponse> {
  const form = new FormData();
  form.append('image', { uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri, name: fileName, type: 'image/jpeg' } as any);
  const { data } = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}

export async function analyzeImage(uploadId: string): Promise<AnatomyAnalysis> {
  const { data } = await api.post('/analyze', { uploadId });
  return data.analysis;
}

export async function generateModel(uploadId: string): Promise<ModelGenerationResponse> {
  const { data } = await api.post('/generate-model', { uploadId });
  return data;
}

export async function getModelStatus(jobId: string): Promise<ModelGenerationResponse> {
  const { data } = await api.get(`/model-status/${jobId}`);
  return data;
}

export async function getBackendHistory() {
  const { data } = await api.get('/history');
  return data.items || [];
}
