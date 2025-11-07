<script lang="ts">
import { defineComponent, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainPage',
  setup() {
    const router = useRouter();

    const steps = [
      { key: 'code', label: '코드', icon: '💻' },
      { key: 'test', label: '테스트', icon: '✅' },
      { key: 'build', label: '빌드', icon: '🏗️' },
      { key: 'deploy', label: '배포', icon: '🚀' },
    ];

    const currentStep = ref(0);
    const isPlaying = ref(false);
    let timer: number | null = null;

    const startAnimation = () => {
      isPlaying.value = true;
      currentStep.value = 0;
      timer && window.clearInterval(timer);
      timer = window.setInterval(() => {
        if (currentStep.value < steps.length - 1) {
          currentStep.value += 1;
        } else {
          currentStep.value = 0;
        }
      }, 700);
    };

    const stopAnimation = () => {
      isPlaying.value = false;
      timer && window.clearInterval(timer);
      timer = null;
    };

    const togglePlay = () => {
      if (isPlaying.value) stopAnimation();
      else startAnimation();
    };

    const goLogin = () => router.push({ name: 'Login' });
    const goDeploy = () => router.push({ name: 'Deploy' });

    onBeforeUnmount(() => {
      timer && window.clearInterval(timer);
    });

    return {
      steps,
      currentStep,
      isPlaying,
      togglePlay,
      goLogin,
      goDeploy,
    };
  },
});
</script>

<template>
  <div class="main-page">
    <div class="grape-bg"></div>

    <section class="hero">
      <div class="hero-text">
        <h1 class="logo">Grapevine</h1>
        <p class="subtitle">
          포도알 터뜨리듯 가볍게,
          <br />
          원클릭 ECS 배포를 즐겨보세요 🍇
        </p>

        <div class="hero-buttons">
          <button class="primary" @click="goDeploy">지금 배포 맛보기</button>
          <button class="ghost" @click="goLogin">로그인하고 시작하기</button>
        </div>
      </div>

      <div class="hero-visual">
        <div class="pipeline-card">
          <div class="card-header">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
            <span class="card-title">Deploy Demo</span>
          </div>
          <div class="pipeline">
            <div
              v-for="(step, idx) in steps"
              :key="step.key"
              class="pipeline-step"
              :class="{
                active: idx === currentStep,
                done: idx < currentStep && isPlaying,
              }"
            >
              <div class="bubble">{{ step.icon }}</div>
              <p>{{ step.label }}</p>
            </div>
          </div>
          <button class="play-btn" @click="togglePlay">
            {{ isPlaying ? '애니메이션 멈추기' : '배포 애니메이션 보기' }}
          </button>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>왜 Grapevine인가요?</h2>
      <div class="feature-list">
        <div class="feature-card">
          <h3>🍇 원클릭 배포</h3>
          <p>
            GitHub Actions + ECS 배포를 버튼 한 번으로 실행하고, 화면에서 바로 확인할 수 있어요.
          </p>
        </div>
        <div class="feature-card">
          <h3>📖 배포 히스토리</h3>
          <p>프로젝트별 배포 이력과 성공/실패 내역을 한눈에 확인할 수 있어요.</p>
        </div>
        <div class="feature-card">
          <h3>📈 모니터링 연동</h3>
          <p>Grafana · CloudWatch 등 모니터링 대시보드 링크를 바로 열 수 있어요.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped src="@/assets/mainpage.scss"></style>
