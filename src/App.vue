<template>
  <div id="app">
    <transition name="component-fade" mode="out-in">
      <component :is="currentPage"
        @login-start="startLogin"
        @login-abort="abortLogin"
        @login-succeed="enterStatusPage"/>
    </transition>
    <Notification/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TopPage from './components/pages/TopPage.vue';
import LoginPage from './components/pages/LoginPage.vue';
import StatusPage from './components/pages/StatusPage.vue';
import Notification from './components/services/Notification.vue';
import * as api from '@/api/api';

// フィルタ
Vue.filter('zeroformat', (value: number, length: number): string | null => {
  return ('0000000000' + value).slice(-length);
});
Vue.filter('gamedate', (value: api.GameDateTime): string => {
  return api.GameDateTime.toFormatedString(value);
});
Vue.filter('realdate', (value: api.DateTime): string => {
  return api.DateTime.toFormatedString(value);
});
Vue.filter('shortrealdate', (value: api.DateTime): string => {
  return api.DateTime.toShortFormatedString(value);
});
Vue.filter('torealdate', (value: api.GameDateTime): api.DateTime => {
  return api.GameDateTime.toRealDate(value);
});

@Component({
  components: {
    TopPage,
    LoginPage,
    StatusPage,
    Notification,
  },
})
export default class App extends Vue {
  private currentPage = 'TopPage';

  public startLogin() {
    this.currentPage = 'LoginPage';
  }

  public abortLogin() {
    this.currentPage = 'TopPage';
  }

  public enterStatusPage() {
    this.currentPage = 'StatusPage';
  }
}
</script>

<style lang="scss">
body {
  font-family: Arial, "游ゴシック体", "Yu Gothic", YuGothic, "Meiryo";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #ca8 url('./assets/images/sangoku-originals/o.gif');
  font-size: 14pt;
}

* {
  box-sizing: border-box;
}

.component-fade-enter-active, .component-fade-leave-active {
  transition: opacity .1s ease, transform .1s ease;
}
.component-fade-enter {
  opacity: 0;
  transform: translateX(20vw);
}
.component-fade-leave-to {
  opacity: 0;
  transform: translateX(-20vw);
}

@keyframes loading-animation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading-container {
  position: relative;
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(220, 230, 240, 0.8);
    .loading-icon {
      width: 30px;
      height: 30px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      border: 4px solid #55bbff;
      border-top-color: transparent;
      border-radius: 50%;
      transform: rotate(0deg);
      animation: loading-animation .8s linear infinite;
    }
  }
}
</style>
