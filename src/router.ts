import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./components/pages/TopPage.vue'),
    },
    {
      path: '/home',
      name: 'home-redirect',
      redirect: '/',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('./components/pages/LoginPage.vue'),
    },
    {
      path: '/status',
      name: 'status',
      component: () => import('./components/pages/StatusPage.vue'),
    },
    {
      path: '/characters',
      name: 'characters',
      component: () => import('./components/pages/AllCharactersPage.vue'),
    },
  ],
});
