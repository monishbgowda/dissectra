import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 120000 });

api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount < 2 && (!error.response || error.response.status >= 500)) {
      config.__retryCount += 1;
      await new Promise<void>(resolve => setTimeout(resolve, 800 * config.__retryCount));
      return api(config);
    }
    return Promise.reject(error);
  },
);
