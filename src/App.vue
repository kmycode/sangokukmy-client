<template>
  <div id="app">
    <transition name="component-fade" mode="out-in">
      <component :is="currentPage"
        @login-start="startLogin"
        @login-abort="abortLogin"
        @login-succeed="enterStatusPage"
        @entry-start="startEntry"
        @entry-abort="abortEntry"
        @entry-succeed="enterStatusPage"
        @show-all-characters="showAllCharacters"/>
    </transition>
    <Notification/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TopPage from './components/pages/TopPage.vue';
import LoginPage from './components/pages/LoginPage.vue';
import StatusPage from './components/pages/StatusPage.vue';
import EntryPage from './components/pages/EntryPage.vue';
import AllCharactersPage from './components/pages/AllCharactersPage.vue';
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
    EntryPage,
    AllCharactersPage,
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

  public startEntry() {
    this.currentPage = 'EntryPage';
  }

  public abortEntry() {
    this.currentPage = 'TopPage';
  }

  public showAllCharacters() {
    this.currentPage = 'AllCharactersPage';
  }
}
</script>

<style lang="scss">
body {
  font-family: Arial, "游ゴシック体", "Yu Gothic", YuGothic, "Meiryo";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #ca8 url('./assets/images/sangoku-originals/o.gif');
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

.btn-toggle {
  background: none;
  border: 1px solid #444;
  font-size: 1rem;
  &.selected {
    background: #444;
    color: white;
  }
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
    z-index: 100;
    position: absolute;
    overflow: hidden;
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

input[type=text], input[type=number], input[type=password], textarea {
  border-width: 0 0 2px 0;
  border-color: #bbb;
  background-color: rgba(255, 255, 255, 0.4);

  &:focus {
    outline: none;
    background-color: rgba(210, 230, 255, 0.8);
  }
}
</style>
