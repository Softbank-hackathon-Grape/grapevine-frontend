<script lang="ts">
import { defineComponent, ref } from 'vue';
import "@/assets/deploy.scss";

export default defineComponent({
  name: 'DeployPage',
  setup() {
    const deployer = ref('');
    const changes = ref('');
    const loading = ref(false);
    const message = ref('');
    const isSuccess = ref(false);

    const handleSubmit = async () => {
      if (!deployer.value || !changes.value) {
        isSuccess.value = false;
        message.value = '❌ 배포자명과 변경 사항을 모두 입력해주세요.';
        return;
      }

      loading.value = true;
      message.value = '';

      try {
        const response = await fetch('/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deployer: deployer.value,
            changes: changes.value,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          isSuccess.value = true;
          message.value = '✅ 배포가 성공적으로 시작되었습니다!';
          deployer.value = '';
          changes.value = '';
        } else {
          isSuccess.value = false;
          message.value = `❌ 배포 실패: ${data.message || '알 수 없는 오류'}`;
        }
      } catch (error: any) {
        isSuccess.value = false;
        message.value = `❌ 오류가 발생했습니다: ${error.message}`;
      } finally {
        loading.value = false;
      }
    };

    return {
      deployer,
      changes,
      loading,
      message,
      isSuccess,
      handleSubmit,
    };
  },
});
</script>

<template>
  <div id="deploy-page">
  <div class="container">
    <h1 class="team-name">🍇 Grapevine</h1>
    <p class="subtitle">버튼 하나로 페이지에 쉽게 배포해보세요!</p>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="deployer">배포자명 *</label>
        <input type="text" id="deployer" v-model="deployer" placeholder="이름을 입력하세요" required :disabled="loading">
      </div>

      <div class="form-group">
        <label for="changes">변경 사항 *</label>
        <textarea id="changes" v-model="changes" placeholder="배포할 변경 사항을 입력하세요" required :disabled="loading"></textarea>
      </div>

      <button type="submit" class="deploy-button" :disabled="loading">
        <span v-if="!loading">🚀 Deploy</span>
        <span v-else>⏳ Deploying...</span>
      </button>
    </form>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p style="margin-top: 10px; color: #666;">배포 중...</p>
    </div>

    <div v-if="message" class="message" :class="{ success: isSuccess, error: !isSuccess }">
      {{ message }}
    </div>
  </div>
  </div>
</template>

<style lang="scss"></style>
