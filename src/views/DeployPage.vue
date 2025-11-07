<script lang="ts">
import { defineComponent, ref } from 'vue';

interface Project {
  id: string;
  name: string;
  description: string;
}

export default defineComponent({
  name: 'DeployPage',
  setup() {
    const projects = ref<Project[]>([
      {
        id: 'grapevine-backend',
        name: 'Grapevine Backend',
        description: 'Monolithic Spring Boot + ECS',
      },
      {
        id: 'grapevine-frontend',
        name: 'Grapevine Frontend',
        description: 'Vue3 Static Hosting',
      },
    ]);

    const selectedProject = ref('');
    const branch = ref('main');
    const environment = ref('dev');

    const isDeploying = ref(false);
    const currentStepIndex = ref(0);
    const lastResult = ref<'idle' | 'success' | 'failed'>('idle');

    const steps = [
      { key: 'infra', label: '인프라 구성', desc: 'Terraform / Cloud 리소스 확인' },
      { key: 'build', label: '이미지 빌드', desc: 'Docker 이미지 빌드' },
      { key: 'push', label: 'ECR 푸시', desc: '컨테이너 레지스트리에 푸시' },
      { key: 'ecs', label: 'ECS 업데이트', desc: '서비스 태스크 정의 업데이트' },
    ];

    const canDeploy = ref(true);

    const sampleGrafana = 'https://example-grafana.com/dashboard';
    const sampleCloudWatch = 'https://console.aws.amazon.com/cloudwatch';
    const sampleCustom = 'https://example-monitoring.com';

    const simulateDeployment = () =>
      new Promise<'success' | 'failed'>((resolve) => {
        let idx = 0;
        currentStepIndex.value = 0;

        const timer = window.setInterval(() => {
          if (idx < steps.length - 1) {
            idx += 1;
            currentStepIndex.value = idx;
          } else {
            window.clearInterval(timer);
            // TODO: 여기서 실제 API 결과에 따라 resolve 값 바꾸면 됨
            resolve('success');
          }
        }, 800);
      });

    const startDeployment = async () => {
      if (!selectedProject.value) return;

      isDeploying.value = true;
      lastResult.value = 'idle';
      currentStepIndex.value = 0;

      try {
        // TODO: 실제 GitHub Actions dispatch / 백엔드 API 호출
        const result = await simulateDeployment();
        lastResult.value = result;
      } catch (e) {
        lastResult.value = 'failed';
      } finally {
        isDeploying.value = false;
      }
    };

    const openLink = (url: string) => {
      window.open(url, '_blank');
    };

    return {
      projects,
      selectedProject,
      branch,
      environment,
      steps,
      isDeploying,
      currentStepIndex,
      lastResult,
      canDeploy,
      sampleGrafana,
      sampleCloudWatch,
      sampleCustom,
      startDeployment,
      openLink,
    };
  },
});
</script>
<template>
  <div class="deploy-page">
    <div class="deploy-card">
      <header class="deploy-header">
        <div class="title">
          <h1>배포 시작하기</h1>
          <p>프로젝트와 브랜치를 선택하고, Grapevine으로 배포를 트리거하세요.</p>
        </div>
        <div class="chip" :class="{ running: isDeploying }">
          <span class="dot"></span>
          <span>{{ isDeploying ? '배포 진행 중' : '대기 중' }}</span>
        </div>
      </header>

      <section class="deploy-form">
        <div class="field">
          <label>프로젝트</label>
          <select v-model="selectedProject">
            <option disabled value="">프로젝트 선택</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>브랜치</label>
          <select v-model="branch">
            <option value="main">main</option>
            <option value="dev">dev</option>
          </select>
        </div>

        <div class="field">
          <label>환경</label>
          <select v-model="environment">
            <option value="dev">dev</option>
            <option value="stage">stage</option>
            <option value="prod">prod</option>
          </select>
        </div>
      </section>

      <section class="deploy-action">
        <button class="deploy-btn" :disabled="!canDeploy || isDeploying" @click="startDeployment">
          <span v-if="!isDeploying">🚀 이 설정으로 배포하기</span>
          <span v-else>배포 중… 잠시만요</span>
        </button>
        <p class="hint">
          * 실제 환경에서는 GitHub Actions dispatch API와 ECS 서비스 업데이트를 호출하게 됩니다.
        </p>
      </section>

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
            }"
          >
            <div class="circle">
              <span v-if="idx < currentStepIndex || (!isDeploying && lastResult === 'success')">
                ✅
              </span>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="info">
              <p class="label">{{ step.label }}</p>
              <p class="desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

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
</template>
<style lang="scss" scoped src="@/assets/deploy.scss"></style>
