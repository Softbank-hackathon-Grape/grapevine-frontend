2차


<script lang="ts">
import { defineComponent, ref, reactive, computed, onUnmounted } from 'vue';

type EnvOption = 'dev' | 'prod' | 'stage';

interface DeployForm {
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

interface Repository {
  id: string;
  name: string;
  description: string;
}

export default defineComponent({
  name: 'DeployPage',
  setup() {
    // 기존: 레포/브랜치/환경
    const repositories = ref<Repository[]>([
      { id: 'grapevine-backend',  name: 'Grapevine Backend',  description: 'Monolithic Spring Boot + ECS' },
      { id: 'grapevine-frontend', name: 'Grapevine Frontend', description: 'Vue3 Static Hosting' },
      { id: 'deploy-project',     name: 'deploy-project',     description: 'calculating execution time' },
    ]);
    const selectedRepository = ref('');
    const branch = ref<'main' | 'dev'>('main');

    // NEW: 배포 폼 (기본값은 사용자 제공 스펙)
    const form = reactive<DeployForm>({
      deploy: {
        name: 'grapevine-dev',
        common_tags: {
          Project: 'grapevine',
          Environment: 'dev',
          Owner: 'team-infra',
          CreatedBy: 'terraform',
        },
      },
      bootstrapIfNeeded: {
        network: {
          vpc_cidr: '10.0.0.0/16',
          private_subnets_cidr: ['10.0.11.0/24', '10.0.12.0/24'],
          public_subnets_cidr: ['10.0.1.0/24', '10.0.2.0/24'],
        },
        ecs: {
          instance_type: 't3.micro',
          environment: ['SPRING_PROFILES_ACTIVE=dev', 'LOG_LEVEL=INFO'],
          service_definitions: {
            api: {
              port: 8080,
              ingress_from: '0.0.0.0/0',
              egress: [{ to: '0.0.0.0/0', port: 443 }],
              cpu: '256',
              memory: '512',
            },
          },
        },
        db: {
          db_username: 'appuser',
          db_password: '********',
        },
      },
    });

    // 부트스트랩 설정 변경 체크박스
    const editBootstrap = ref(false);

    // 진행/스텝
    const isDeploying = ref(false);
    const currentStepIndex = ref(0);
    const lastResult = ref<'idle' | 'success' | 'failed'>('idle');
    const steps = [
      { key: 'infra',  label: '인프라 구성',  desc: 'Terraform / Cloud 리소스 확인' },
      { key: 'build',  label: '이미지 빌드',  desc: 'Docker 이미지 빌드' },
      { key: 'push',   label: 'ECR 푸시',     desc: '컨테이너 레지스트리에 푸시' },
      { key: 'ecs',    label: 'ECS 업데이트', desc: '서비스 태스크 정의 업데이트' },
    ];

    // 버튼 활성화: 레포/배포 name/Environment 필수
    const canDeploy = computed(() =>
      !!selectedRepository.value &&
      !!form.deploy.name &&
      !!form.deploy.common_tags.Environment &&
      !isDeploying.value
    );

    // 모니터링 링크(예시 그대로)
    const sampleGrafana = 'https://example-grafana.com/dashboard';
    const sampleCloudWatch = 'https://console.aws.amazon.com/cloudwatch';
    const sampleCustom = 'https://example-monitoring.com';

    // 배열 조작 유틸
    const addString = (arr: string[], v = '') => arr.push(v);
    const removeString = (arr: string[], idx: number) => arr.splice(idx, 1);
    const addEgress = () => form.bootstrapIfNeeded.ecs.service_definitions.api.egress.push({ to: '0.0.0.0/0', port: 443 });
    const removeEgress = (idx: number) => form.bootstrapIfNeeded.ecs.service_definitions.api.egress.splice(idx, 1);

    // 시뮬 배포
    let timer: number | null = null;
    const simulateDeployment = () =>
      new Promise<'success' | 'failed'>((resolve) => {
        let idx = 0;
        currentStepIndex.value = 0;
        timer = window.setInterval(() => {
          if (idx < steps.length - 1) {
            idx += 1;
            currentStepIndex.value = idx;
          } else {
            if (timer) window.clearInterval(timer);
            resolve('success');
          }
        }, 800);
      });
    onUnmounted(() => { if (timer) window.clearInterval(timer!); });

    // 페이로드 빌드(요청 스펙 그대로)
    const buildPayload = () => {
      // bootstrapIfNeeded는 “체크 안했어도” 백엔드에서 무시 가능하지만,
      // 명확히 의도를 표시하고 싶다면 체크 안한 경우 기존 값 그대로 전달해도 됨.
      return {
        deploy: {
          name: form.deploy.name,
          common_tags: {
            Project: form.deploy.common_tags.Project,
            Environment: form.deploy.common_tags.Environment,
            Owner: form.deploy.common_tags.Owner,
            CreatedBy: form.deploy.common_tags.CreatedBy,
          },
        },
        bootstrapIfNeeded: {
          network: {
            vpc_cidr: form.bootstrapIfNeeded.network.vpc_cidr,
            private_subnets_cidr: [...form.bootstrapIfNeeded.network.private_subnets_cidr],
            public_subnets_cidr:  [...form.bootstrapIfNeeded.network.public_subnets_cidr],
          },
          ecs: {
            instance_type: form.bootstrapIfNeeded.ecs.instance_type,
            environment: [...form.bootstrapIfNeeded.ecs.environment],
            service_definitions: {
              api: {
                port: Number(form.bootstrapIfNeeded.ecs.service_definitions.api.port),
                ingress_from: form.bootstrapIfNeeded.ecs.service_definitions.api.ingress_from,
                egress: form.bootstrapIfNeeded.ecs.service_definitions.api.egress.map(e => ({ to: e.to, port: Number(e.port) })),
                cpu: form.bootstrapIfNeeded.ecs.service_definitions.api.cpu,
                memory: form.bootstrapIfNeeded.ecs.service_definitions.api.memory,
              },
            },
          },
          db: {
            db_username: form.bootstrapIfNeeded.db.db_username,
            db_password: form.bootstrapIfNeeded.db.db_password,
          },
        },
        // 추가 메타(선택): 레포/브랜치
        repo: selectedRepository.value,
        branch: branch.value,
        // editBootstrap 플래그를 전달해 백엔드가 무시/적용 결정할 수 있게 할 수도 있음
        applyBootstrap: editBootstrap.value,
      };
    };

    const startDeployment = async () => {
      if (!canDeploy.value) return;
      isDeploying.value = true;
      lastResult.value = 'idle';
      currentStepIndex.value = 0;
      try {
        const payload = buildPayload();
        // 실제 호출 예시:
        // await apiClient.post('/deploy/dispatch', payload)

        const result = await simulateDeployment();
        lastResult.value = result;
      } catch (e) {
        lastResult.value = 'failed';
      } finally {
        isDeploying.value = false;
      }
    };

    const openLink = (url: string) => window.open(url, '_blank');

    return {
      repositories, selectedRepository, branch,
      form, editBootstrap,
      isDeploying, currentStepIndex, lastResult, steps, canDeploy,
      sampleGrafana, sampleCloudWatch, sampleCustom,
      addString, removeString, addEgress, removeEgress,
      startDeployment, openLink,
    };
  },
});
</script>

<template>
  <div class="deploy-page">
    <div class="deploy-card">

      <!-- 헤더 -->
      <header class="deploy-header">
        <div class="title">
          <h1>배포 시작하기</h1>
          <p>프로젝트/브랜치 선택 후, 배포 파라미터를 입력하세요.</p>
        </div>
        <div class="chip" :class="{ running: isDeploying }" aria-live="polite">
          <span class="dot"></span>
          <span>{{ isDeploying ? '배포 진행 중' : '대기 중' }}</span>
        </div>
      </header>

      <!-- 2분할 레이아웃 -->
      <div class="deploy-layout">
        <!-- LEFT: 입력 폼 -->
        <div class="left-pane">
          <!-- 기존 메타 -->
          <section class="deploy-form block">
            <h2 class="block-title">메타</h2>
            <div class="grid-2">
              <div class="field">
                <label for="repo">Repository</label>
                <select id="repo" v-model="selectedRepository">
                  <option disabled value="">select repository</option>
                  <option v-for="repository in repositories" :key="repository.id" :value="repository.id">
                    {{ repository.name }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label for="branch">브랜치</label>
                <select id="branch" v-model="branch">
                  <option value="main">main</option>
                  <option value="dev">dev</option>
                </select>
              </div>
            </div>
          </section>

          <!-- deploy -->
          <section class="block">
            <h2 class="block-title">deploy</h2>
            <div class="grid-2">
              <div class="field">
                <label for="deploy-name">name <small>(select)</small></label>
                <select id="deploy-name" v-model="form.deploy.name">
                  <option value="grapevine-dev">grapevine-dev</option>
                  <option value="grapevine-stage">grapevine-stage</option>
                  <option value="grapevine-prod">grapevine-prod</option>
                </select>
              </div>
              <div class="field">
                <label for="tag-project">common_tags.Project</label>
                <input id="tag-project" v-model="form.deploy.common_tags.Project" placeholder="grapevine" />
              </div>
              <div class="field">
                <label for="tag-env">common_tags.Environment <small>(select)</small></label>
                <select id="tag-env" v-model="form.deploy.common_tags.Environment">
                  <option value="dev">dev</option>
                  <option value="stage">stage</option>
                  <option value="prod">prod</option>
                </select>
              </div>
              <div class="field">
                <label for="tag-owner">common_tags.Owner</label>
                <input id="tag-owner" v-model="form.deploy.common_tags.Owner" placeholder="team-infra" />
              </div>
              <div class="field">
                <label for="tag-created">common_tags.CreatedBy</label>
                <input id="tag-created" v-model="form.deploy.common_tags.CreatedBy" placeholder="terraform" />
              </div>
            </div>
          </section>

          <!-- bootstrapIfNeeded -->
          <section class="block">
            <div class="block-head">
              <h2 class="block-title">bootstrapIfNeeded</h2>
              <label class="toggle">
                <input type="checkbox" v-model="editBootstrap" />
                <span>설정 변경</span>
              </label>
            </div>

            <!-- network -->
            <div class="sub-block">
              <h3>network</h3>
              <div class="grid-2">
                <div class="field">
                  <label for="vpc">vpc_cidr</label>
                  <input id="vpc" v-model="form.bootstrapIfNeeded.network.vpc_cidr" :disabled="!editBootstrap" />
                </div>

                <div class="field">
                  <label>private_subnets_cidr</label>
                  <div class="array">
                    <div v-for="(cidr, i) in form.bootstrapIfNeeded.network.private_subnets_cidr" :key="'pri-'+i" class="array-row">
                      <input v-model="form.bootstrapIfNeeded.network.private_subnets_cidr[i]" :disabled="!editBootstrap" />
                      <button type="button" @click="removeString(form.bootstrapIfNeeded.network.private_subnets_cidr, i)" :disabled="!editBootstrap">삭제</button>
                    </div>
                    <button type="button" class="ghost" @click="addString(form.bootstrapIfNeeded.network.private_subnets_cidr, '')" :disabled="!editBootstrap">+ 추가</button>
                  </div>
                </div>

                <div class="field">
                  <label>public_subnets_cidr</label>
                  <div class="array">
                    <div v-for="(cidr, i) in form.bootstrapIfNeeded.network.public_subnets_cidr" :key="'pub-'+i" class="array-row">
                      <input v-model="form.bootstrapIfNeeded.network.public_subnets_cidr[i]" :disabled="!editBootstrap" />
                      <button type="button" @click="removeString(form.bootstrapIfNeeded.network.public_subnets_cidr, i)" :disabled="!editBootstrap">삭제</button>
                    </div>
                    <button type="button" class="ghost" @click="addString(form.bootstrapIfNeeded.network.public_subnets_cidr, '')" :disabled="!editBootstrap">+ 추가</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ecs -->
            <div class="sub-block">
              <h3>ecs</h3>
              <div class="grid-2">
                <div class="field">
                  <label for="instance">instance_type</label>
                  <input id="instance" v-model="form.bootstrapIfNeeded.ecs.instance_type" :disabled="!editBootstrap" />
                </div>

                <div class="field">
                  <label>environment (KEY=VALUE)</label>
                  <div class="array">
                    <div v-for="(env, i) in form.bootstrapIfNeeded.ecs.environment" :key="'env-'+i" class="array-row">
                      <input v-model="form.bootstrapIfNeeded.ecs.environment[i]" :disabled="!editBootstrap" />
                      <button type="button" @click="removeString(form.bootstrapIfNeeded.ecs.environment, i)" :disabled="!editBootstrap">삭제</button>
                    </div>
                    <button type="button" class="ghost" @click="addString(form.bootstrapIfNeeded.ecs.environment, '')" :disabled="!editBootstrap">+ 추가</button>
                  </div>
                </div>

                <div class="field">
                  <label for="port">service_definitions.api.port</label>
                  <input id="port" v-model="form.bootstrapIfNeeded.ecs.service_definitions.api.port" :disabled="!editBootstrap" inputmode="numeric" />
                </div>

                <div class="field">
                  <label for="ingress">service_definitions.api.ingress_from</label>
                  <input id="ingress" v-model="form.bootstrapIfNeeded.ecs.service_definitions.api.ingress_from" :disabled="!editBootstrap" />
                </div>

                <div class="field full">
                  <label>service_definitions.api.egress [{to, port}]</label>
                  <div class="array">
                    <div v-for="(rule, i) in form.bootstrapIfNeeded.ecs.service_definitions.api.egress" :key="'egress-'+i" class="array-row two">
                      <input v-model="form.bootstrapIfNeeded.ecs.service_definitions.api.egress[i].to" :disabled="!editBootstrap" placeholder="to (CIDR)" />
                      <input v-model="form.bootstrapIfNeeded.ecs.service_definitions.api.egress[i].port" :disabled="!editBootstrap" inputmode="numeric" placeholder="port" />
                      <button type="button" @click="removeEgress(i)" :disabled="!editBootstrap">삭제</button>
                    </div>
                    <button type="button" class="ghost" @click="addEgress" :disabled="!editBootstrap">+ 추가</button>
                  </div>
                </div>

                <div class="field">
                  <label for="cpu">service_definitions.api.cpu</label>
                  <input id="cpu" v-model="form.bootstrapIfNeeded.ecs.service_definitions.api.cpu" :disabled="!editBootstrap" />
                </div>
                <div class="field">
                  <label for="mem">service_definitions.api.memory</label>
                  <input id="mem" v-model="form.bootstrapIfNeeded.ecs.service_definitions.api.memory" :disabled="!editBootstrap" />
                </div>
              </div>
            </div>

            <!-- db -->
            <div class="sub-block">
              <h3>db</h3>
              <div class="grid-2">
                <div class="field">
                  <label for="dbuser">db_username</label>
                  <input id="dbuser" v-model="form.bootstrapIfNeeded.db.db_username" :disabled="!editBootstrap" />
                </div>
                <div class="field">
                  <label for="dbpass">db_password</label>
                  <input id="dbpass" type="password" v-model="form.bootstrapIfNeeded.db.db_password" :disabled="!editBootstrap" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- RIGHT: 실행 패널 -->
        <div class="right-pane">
          <!-- 상단 고정 바: 버튼 + 상태칩 -->
          <div class="right-pane__bar">
            <button class="deploy-btn" :disabled="!canDeploy" @click="startDeployment" :aria-busy="isDeploying">
              <span v-if="!isDeploying">🚀 이 설정으로 배포하기</span>
              <span v-else>배포 중… 잠시만요</span>
            </button>
            <div class="chip mini" :class="{ running: isDeploying }" aria-live="polite">
              <span class="dot"></span>
              <span>{{ isDeploying ? '진행 중' : '대기' }}</span>
            </div>
          </div>

          <!-- 배포 단계 -->
          <section class="deploy-steps">
            <h2>배포 단계</h2>
            <div class="steps">
              <div
                v-for="(step, idx) in steps"
                :key="step.key"
                class="step"
                :class="{
                  active: idx === currentStepIndex && isDeploying,
                  done: idx < currentStepIndex || (!isDeploying && lastResult === 'success'),
                  failed: !isDeploying && lastResult === 'failed' && idx === currentStepIndex
                }"
              >
                <div class="circle">
                  <span v-if="idx < currentStepIndex || (!isDeploying && lastResult === 'success')">✅</span>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div class="info">
                  <p class="label">{{ step.label }}</p>
                  <p class="desc">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 모니터링 -->
          <section class="monitoring">
            <h2>모니터링 보드</h2>
            <div class="monitoring-links">
              <button @click="openLink(sampleGrafana)">Grafana 대시보드</button>
              <button @click="openLink(sampleCloudWatch)">CloudWatch 로그</button>
              <button @click="openLink(sampleCustom)">커스텀 모니터링</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped src="@/assets/deploy.scss"></style>

