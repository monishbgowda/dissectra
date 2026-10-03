export interface DeviceClassificationResult {
  predictedClass?: 'mouse' | 'pendrive' | 'other' | string | null;
  predictedToken?: 'A' | 'B' | 'C' | string | null;
  classLogScores?: Record<string, number>;
  rawProbabilities?: Record<string, number>;
  rawClassProbability?: number;
  probabilities?: Record<string, number>;
  calibratedConfidence?: number;
  normalizedEntropy?: number;
  uncertaintyLabel?: 'Low' | 'Medium' | 'High' | string;
  confidenceAvailable?: boolean;
  calibrated?: boolean;
  temperature?: number | null;
  classifierModel?: string;
  modelStableForCalibration?: boolean;
  method?: string;
  classes?: Record<string, string>;
  calibrationReason?: string;
  reason?: string;
}

export interface AnatomyAnalysis {
  object?: string;
  description?: string;
  labels?: string[];
  confidence?: number;
  raw?: unknown;
  product?: {
    name?: string;
    brand?: string;
    model?: string;
    category?: string;
    confidence?: number;
  };
  components?: any[];
  deviceClassification?: DeviceClassificationResult;
}

export interface StoredScan {
  id: string;
  imageUri: string;
  localImagePath?: string;
  modelUri?: string;
  localModelPath?: string;
  analysis: AnatomyAnalysis;
  createdAt: string;
  status: 'complete' | 'failed' | 'processing' | 'offline';
}

export interface UploadResponse {
  uploadId: string;
  imageUrl: string;
  filename: string;
}

export interface ModelGenerationResponse {
  jobId: string;
  modelUrl?: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
}
