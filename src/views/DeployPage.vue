<template>
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
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

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

<style scoped>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 50px;
    max-width: 600px;
    width: 100%;
    margin: 20px;
  }
  .team-name { text-align: center; font-size: 48px; font-weight: bold; color: #667eea; margin-bottom: 10px; letter-spacing: 2px; }
  .subtitle { text-align: center; color: #666; font-size: 18px; margin-bottom: 40px; }
  .form-group { margin-bottom: 25px; }
  label { display: block; font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px; }
  input[type="text"], textarea {
    width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 10px;
    font-size: 14px; transition: all 0.3s ease; font-family: inherit;
  }
  input[type="text"]:focus, textarea:focus {
    outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  textarea { resize: vertical; min-height: 100px; }
  .deploy-button {
    width: 100%; padding: 18px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; border: none; border-radius: 10px; font-size: 18px; font-weight: bold;
    cursor: pointer; transition: all 0.3s ease; margin-top: 30px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  .deploy-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); }
  .deploy-button:active { transform: translateY(0); }
  .deploy-button:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .message {
    text-align: center; margin-top: 20px; padding: 15px; border-radius: 10px;
  }
  .message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
  .message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
  .loading { text-align: center; margin-top: 20px; }
  .spinner {
    border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%;
    width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;
  }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
