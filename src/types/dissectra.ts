export interface AnatomyAnalysis { object: string; description: string; labels: string[]; confidence?: number; raw?: unknown; }
export interface StoredScan { id: string; imageUri: string; localImagePath?: string; modelUri?: string; localModelPath?: string; analysis: AnatomyAnalysis; createdAt: string; status: 'complete' | 'failed' | 'processing' | 'offline'; }
export interface UploadResponse { uploadId: string; imageUrl: string; filename: string; }
export interface ModelGenerationResponse { jobId: string; modelUrl?: string; status: 'queued' | 'processing' | 'complete' | 'failed'; }
