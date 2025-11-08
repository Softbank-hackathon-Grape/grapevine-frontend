import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../views/MainPage.vue';
import DeployPage from '../views/DeployPage.vue';
import LoginPage from '@/views/LoginPage.vue';

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainPage,
  },
  {
    path: '/deploy',
    name: 'Deploy',
    component: DeployPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
