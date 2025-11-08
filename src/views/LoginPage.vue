<script lang="ts">
import { defineComponent, ref } from 'vue';
import router from '@/router';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const email = ref('');
    const password = ref('');
    const isLoading = ref(false);
    const hasError = ref(false);

    const fakeLogin = (emailValue: string, passwordValue: string) =>
      new Promise<void>((resolve, reject) => {
        window.setTimeout(() => {
          if (emailValue && passwordValue) resolve();
          else reject();
        }, 1200);
      });

    const onSubmit = async () => {
      hasError.value = false;
      isLoading.value = true;

      try {
        // TODO: 실제 로그인 API 연동
        await fakeLogin(email.value, password.value);
        router.push({ name: 'Deploy' });
      } catch {
        hasError.value = true;
      } finally {
        isLoading.value = false;
      }
    };

    return { email, password, isLoading, hasError, onSubmit };
  },
});
</script>

<template>
  <div class="login-page">
    <div class="logo-area" :class="{ bouncing: isLoading }">
      <div class="grape-icon">🍇</div>
      <h1>Grapevine</h1>
      <p>내 배포를 한곳에서, 포도송이처럼 모아보기</p>
    </div>

    <div class="login-card" :class="{ shaking: hasError }">
      <form @submit.prevent="onSubmit">
        <label>
          이메일
          <input
            type="email"
            v-model="email"
            placeholder="you@example.com"
            :disabled="isLoading"
            required
          />
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

        <p v-if="hasError" class="error-text">로그인에 실패했어요. 다시 시도해 주세요.</p>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped src="@/assets/login.scss"></style>
