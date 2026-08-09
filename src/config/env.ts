declare const process: { env: Record<string, string | undefined> };
const fallbackBaseUrl = 'http://10.199.171.59:4000/api';
const resolvedBaseUrl = process.env.API_BASE_URL || fallbackBaseUrl;
export const API_BASE_URL = resolvedBaseUrl.replace(/\/$/, '');
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
