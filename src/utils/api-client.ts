import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 필요 없으면 false로! (JWT를 헤더로 쓸 거면 보통 credentials 불필요)
const USE_CREDENTIALS = false;

const createApiClient = (baseURL: string, contentType: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': contentType },
    withCredentials: USE_CREDENTIALS,
  });

  client.interceptors.request.use((config) => {
    // 로그인 엔드포인트는 토큰 불필요하면 생략 가능
    const isAuthEndpoint =
      config.url?.includes('/api/auth/login') || config.url?.includes('/auth/login');

    if (!isAuthEndpoint) {
      const token = localStorage.getItem('accessToken'); // 혹은 Pinia에서 가져와도 OK
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return client;
};

export const apiClient = createApiClient(API_BASE_URL, 'application/json');
