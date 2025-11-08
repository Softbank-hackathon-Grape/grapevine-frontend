import { DeployStatus } from '@/types';

export class DeployEntity {
  id: number = 0;
  userIdx: number = 0;
  deployStatus: DeployStatus = DeployStatus.PROCESSING;
  deployDesc: string | undefined = undefined;
  deploySetting: string = '';
  deployInfo: string = '';
  monitorUrl: string | undefined = undefined;
  projectUrl: string = '';
}