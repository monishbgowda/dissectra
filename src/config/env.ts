declare const process: { env: Record<string, string | undefined> };
export const API_BASE_URL = process.env.API_BASE_URL || 'http://10.0.2.2:4000';
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
