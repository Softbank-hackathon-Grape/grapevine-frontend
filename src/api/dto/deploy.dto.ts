import { DeployEntity } from '@/api/model/deploy.entity';

type EnvOption = 'dev' | 'prod' | 'stage';

export class DispatchReq {
  deploy: {
    name: string; // select
    common_tags: {
      Project: string;        // input
      Environment: EnvOption; // select
      Owner: string;          // input
      CreatedBy: string;      // input
    };
  };
  bootstrapIfNeeded: {
    network: {
      vpc_cidr: string;
      private_subnets_cidr: string[];
      public_subnets_cidr: string[];
    };
    ecs: {
      instance_type: string;
      environment: string[]; // ["KEY=VALUE"]
      service_definitions: {
        api: {
          port: number | string;
          ingress_from: string;
          egress: { to: string; port: number | string }[];
          cpu: string;
          memory: string;
        };
      };
    };
    db: {
      db_username: string;
      db_password: string;
    };
  };
}

export class DispatchRes {}
