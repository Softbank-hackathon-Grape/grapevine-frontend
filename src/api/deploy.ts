import { apiClient } from '@/utils/api-client';
import { DispatchReq } from '@/api/dto/deploy.dto';

export function deploy(request: DispatchReq) {
  return apiClient
    .post(`/deploy/dispatch`, request)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('굿즈 상품를 등록하는 중 오류가 발생했습니다:', error);
      throw error;
    });
}

export function getDeploy(id: number) {
  return apiClient
    .get('/deploy', {
      params: {
        id: id
      },
    })
    .then(response => {
      return response.data; // 필요한 데이터를 반환
    })
    .catch(error => {
      console.error('배포 상세를 불러오는 중 오류가 발생했습니다:', error);
      throw error;
    });
}

export function getDeployStatus(id: number) {
  return apiClient
    .get('/deploy/status', {
      params: {
        id: id
      },
    })
    .then(response => {
      return response.data; // 필요한 데이터를 반환
    })
    .catch(error => {
      console.error('배포 상태를 불러오는 중 오류가 발생했습니다:', error);
      throw error;
    });
}