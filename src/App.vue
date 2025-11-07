<template>
  <DeployPage />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DeployPage from './views/DeployPage.vue';

export default defineComponent({
  name: 'App',
  components: {
    DeployPage,
  },
});
</script>

<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    margin: 0;
  }
</style>
