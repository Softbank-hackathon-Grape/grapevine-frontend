<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const userId = ref('');
    const password = ref('');
    const router = useRouter();
    const authStore = useAuthStore();
    const isLoading = ref(false);
    const hasError = ref(false);

    const onSubmit = async () => {
      hasError.value = false;
      isLoading.value = true;
      try {
        await authStore.loginAction({ userId: userId.value, password: password.value });
        router.push('/deploy'); // 로그인 후 이동할 페이지
      } catch {
        hasError.value = true;
      } finally {
        isLoading.value = false;
      }
    };

    return {
      userId,
      password,
      isLoading,
      hasError,
      onSubmit,
    };
  },
});
</script>
<template>
  <div class="login-page">
    <div class="logo-area">
      <div class="grape-icon">🍇</div>
      <h1>Grapevine 로그인</h1>
      <p>내 배포를 한곳에서, 포도송이처럼 모아보기</p>
    </div>

    <div class="login-card" :class="{ shaking: hasError }">
      <form @submit.prevent="onSubmit" class="login-form">
        <label>
          아이디
          <input v-model="userId" placeholder="User ID" :disabled="isLoading" required />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            v-model="password"
            placeholder="••••••••"
            :disabled="isLoading"
            required
          />
        </label>
        <button type="submit" :disabled="isLoading">
          <span v-if="!isLoading">로그인</span>
          <span v-else class="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </button>
        <p v-if="hasError" class="error-text">로그인 실패. 아이디/비밀번호를 확인하세요.</p>
      </form>
    </div>
  </div>
</template>
<style lang="scss" scoped src="@/assets/login.scss"></style>
