import { DeployStatus } from '@/types';
import { BaseEntity } from '@/api/model/base.entity';

export class DeployEntity extends BaseEntity {
  id: number = 0;
  userId: number = 0;
  deployStatus: DeployStatus = DeployStatus.PROCESSING;
  deployDesc: string | undefined = undefined;
  deploySetting: string = '';
  deployInfo: string = '';
  monitorUrl: string | undefined = undefined;
  projectUrl: string = '';
}