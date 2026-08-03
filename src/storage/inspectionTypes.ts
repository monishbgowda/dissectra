  export type InspectionStatus =
    | 'CAPTURING'
    | 'PENDING'
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
    analysis?: any;
    
    thumbnail: string;

    imageCount: number;

    images: InspectionImage[];

    analysisFile?: string;

    modelFile?: string;

    confidence?: number;
  }