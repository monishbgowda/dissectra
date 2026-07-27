export type InspectionStatus =
  | 'CAPTURING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface InspectionImage {
  id: string;
  fileName: string;
  filePath: string;
  angle?: string;
  capturedAt: string;
}

export interface Inspection {
  id: string;
  objectName: string;
  createdAt: string;
  updatedAt: string;
  status: InspectionStatus;

  thumbnail: string;

  imageCount: number;

  images: InspectionImage[];

  analysisFile?: string;

  modelFile?: string;

  confidence?: number;
}