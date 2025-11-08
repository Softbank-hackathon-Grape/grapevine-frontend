import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URLS = import.meta.env.VITE_API_BASE_URL;

const createApiClient = (baseURL: string, contentType: string): AxiosInstance => {
  return axios.create({
    baseURL,
    headers: { 'Content-Type': contentType },
    withCredentials: true,
  });
};

export const apiClient = createApiClient(API_BASE_URLS, 'application/json');
