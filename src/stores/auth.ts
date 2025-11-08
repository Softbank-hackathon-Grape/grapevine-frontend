import { defineStore } from 'pinia';
import { login, type LoginReq, type LoginRes } from '@/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userId: '' as string,
    accessToken: '' as string,
    isAuthenticated: false,
  }),
  actions: {
    async loginAction(payload: LoginReq) {
      try {
        const res: LoginRes = await login(payload);
        this.userId = res.userId;
        this.accessToken = res.accessToken;
        this.isAuthenticated = true;

        localStorage.setItem('accessToken', res.accessToken);
      } catch (err: any) {
        console.error('로그인 실패:', err);
        throw err;
      }
    },
    logoutAction() {
      this.userId = '';
      this.accessToken = '';
      this.isAuthenticated = false;
      localStorage.removeItem('accessToken');
    },
  },
});
