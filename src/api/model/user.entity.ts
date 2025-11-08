import { BaseEntity } from '@/api/model/base.entity';

export class UserEntity extends BaseEntity {
  userIdx: number = 0;
  userId: string = '';
  pwd: string = '';
}
