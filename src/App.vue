<template>
  <div id="app">
    <transition name="component-fade">
      <router-view></router-view>
    </transition>
    <Notification/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Notification from './components/services/Notification.vue';
import * as api from '@/api/api';

// フィルタ
Vue.filter('zeroformat', (value: number, length: number): string | null => {
  return ('0000000000' + value).slice(-length);
});
Vue.filter('commaformat', (value: number): string | null => {
  return Number(value).toLocaleString();
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
Vue.filter('charafromname', (chara: api.Character): string => {
  return chara.from === 1 ? '武家' :
    chara.from === 2 ? '官吏' :
    chara.from === 3 ? '商人' :
    chara.from === 4 ? '技師' :
    chara.from === 5 ? 'AI' : 'なし';
});

@Component({
  components: {
    Notification,
  },
})
export default class App extends Vue {
}
</script>

<style lang="scss">
body {
  font-family: Arial, "游ゴシック体", "Yu Gothic", YuGothic, "Meiryo";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #ca8 url('./assets/images/sangoku-originals/o.gif');
}

#app {
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

.component-fade-enter-active, .component-fade-leave-active {
  transition: opacity .1s ease, transform .1s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
