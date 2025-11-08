import api from './axios';

export interface LoginReq {
  userId: string;
  password: string;
}

export interface LoginRes {
  userId: string;
  accessToken: string;
}

interface BaseResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const login = async (data: LoginReq): Promise<LoginRes> => {
  const res = await api.post<BaseResponse<LoginRes>>('/auth/login', data);
  return res.data.data;
};
